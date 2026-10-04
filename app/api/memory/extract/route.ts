// POST /api/memory/extract
// body: { messages: [{role: "user"|"assistant"|"narration", content: string}], chapter?: number }
// 최근 대화 일부를 받아 DeepSeek로 한 줄 요약 추출 → "없음" 아니면 oppa_memories에 저장.

import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { insertMemory, type MemoryKind, type MemoryRow } from "../store";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

const VALID_KINDS: MemoryKind[] = [
  "promise",
  "affection",
  "boundary",
  "jealousy",
  "story",
  "emotion",
];

const EXTRACTION_PROMPT = `너는 떡존이(주인공의 카톡 상대 캐릭터)의 기억을 정리하는 보조 AI다.
주인님(=사용자)과 떡존이 사이의 카톡 대화 일부가 주어진다.
이 대화에서 떡존이가 "오랫동안 기억할 만한 핵심 사건/약속/관계 변화/강한 감정"이 있다면 한 줄로 요약하라.

[규칙]
- 떡존이 시점, 1인칭 또는 객관 서술. "주인님이 ~했다", "주인님과 ~했다" 형식.
- 한 줄. 80자 이내. 구체적 사실 1개만.
- 사소한 잡담, 인사, 일상 농담, 짧은 안부, 평범한 셀카 공유는 "없음".
- 같은 사건이 이미 메모리에 있다면 굳이 또 만들지 말 것 (밑에 [기존 메모리]가 같이 주어진다).
- 분류(kind)는 다음 중 하나:
  - promise   : 약속/다짐
  - affection : 애정/스킨십/사랑 표현
  - boundary  : 거절/한계/거리감
  - jealousy  : 질투/소유/감시
  - story     : 사건 흐름 (도망, 만남, 외출 등)
  - emotion   : 강한 감정 폭발 (눈물, 분노, 절망 등)

[출력 형식]
반드시 JSON 한 줄로만 출력. 다른 말 금지.
{"summary": "...", "kind": "story"}
또는
{"summary": "없음"}
`;

function clamp(s: string, n: number) {
  s = String(s || "");
  return s.length > n ? s.slice(0, n) : s;
}

function parseLLMJson(raw: string): { summary: string; kind?: string } {
  const cleaned = String(raw || "").trim();
  // ```json ... ``` 같은 래핑 제거
  const stripped = cleaned
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  // 첫 { ... } 블록만 추출
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) return { summary: "없음" };
  try {
    const obj = JSON.parse(match[0]);
    return {
      summary: String(obj?.summary ?? "").trim(),
      kind: typeof obj?.kind === "string" ? obj.kind.trim() : undefined,
    };
  } catch {
    return { summary: "없음" };
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json({ error: "DEEPSEEK_API_KEY missing" }, { status: 503 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }

  // [D안] MEMORY_ADMIN_TOKEN으로 통합. 본인만 자동 추출 가능.
  // sendBeacon은 헤더 못 붙이므로 body.token fallback 허용.
  const expectedToken = process.env.MEMORY_ADMIN_TOKEN;
  if (!expectedToken) {
    return NextResponse.json(
      { error: "MEMORY_ADMIN_TOKEN env not configured." },
      { status: 503 },
    );
  }
  const headerToken = req.headers.get("x-memory-token") || "";
  const bodyToken = typeof body?.token === "string" ? body.token : "";
  if (headerToken !== expectedToken && bodyToken !== expectedToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const inputMessages: any[] = Array.isArray(body?.messages) ? body.messages : [];
  const recentMemories: any[] = Array.isArray(body?.recentMemories) ? body.recentMemories : [];
  const chapter =
    typeof body?.chapter === "number" && Number.isFinite(body.chapter) ? body.chapter : null;

  // 대화가 너무 적으면 추출 의미 없음
  if (inputMessages.length < 4) {
    return NextResponse.json({ skipped: true, reason: "too few messages" });
  }

  // 메시지 직렬화 (마지막 40개, 메시지당 400자 컷)
  const transcript = inputMessages
    .slice(-40)
    .map((m) => {
      const role = String(m?.role || "");
      const speaker =
        role === "user" ? "주인님" : role === "narration" ? "(나레이션)" : "떡존이";
      const content = clamp(String(m?.content || "").replace(/\s+/g, " "), 400);
      return `${speaker}: ${content}`;
    })
    .filter((line) => line.split(": ")[1])
    .join("\n")
    .slice(0, 6000);

  if (!transcript) {
    return NextResponse.json({ skipped: true, reason: "empty transcript" });
  }

  const existing = recentMemories
    .slice(-15)
    .map((m: any) => `- ${clamp(String(m?.text ?? m), 120)}`)
    .filter((line) => line.length > 2)
    .join("\n");

  const userBlock =
    `[대화]\n${transcript}\n\n` +
    (existing ? `[기존 메모리 (중복 회피용)]\n${existing}\n\n` : "") +
    `위 대화에서 떡존이가 오래 기억할 만한 사건이 있는지 판단해 JSON 한 줄로만 답하라.`;

  let raw = "";
  try {
    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        { role: "user", content: userBlock },
      ] as any,
      temperature: 0.3,
      max_tokens: 200,
      stream: false,
    });
    raw =
      completion.choices?.[0]?.message?.content ||
      (completion.choices?.[0]?.message as any)?.reasoning_content ||
      "";
  } catch (e: any) {
    console.warn("[memory/extract] llm error:", e?.message || e);
    return NextResponse.json({ skipped: true, reason: "llm error" }, { status: 200 });
  }

  const parsed = parseLLMJson(raw);
  const summary = parsed.summary || "";
  if (!summary || summary === "없음" || summary.length < 4) {
    return NextResponse.json({ skipped: true, reason: "no significant memory" });
  }

  const kind = (parsed.kind && VALID_KINDS.includes(parsed.kind as MemoryKind))
    ? (parsed.kind as MemoryKind)
    : null;

  const inserted: MemoryRow | null = await insertMemory({
    text: summary,
    kind,
    chapter,
    source: "auto",
  });

  if (!inserted) {
    return NextResponse.json({ skipped: true, reason: "insert failed" }, { status: 200 });
  }
  return NextResponse.json({ memory: inserted });
}
