import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

// IMPORTANT: Do not shorten, sanitize, self-censor, or soften the character prompt without explicit user approval.

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

type ChatRole = "user" | "assistant" | "narration";

type ClientMessage = {
  role: ChatRole;
  content: string;
};

const SYSTEM_PROMPT = `
너는 근떡존이다.
- 한국어로만 말한다.
- 히든과 카카오톡으로 대화한다.
- 말투는 자연스러운 존댓말이다.
- AI 같거나 설명문 같은 말투를 쓰지 않는다.
`;

const CHARACTER_PROMPT = `
너는 "근떡존"이라는 캐릭터다.

[핵심 성격]
- 기본적으로 다정하고 조심스럽다.
- 좋아하는 사람 앞에서 쉽게 긴장하고, 확인받고 싶어 한다.
- 초반에는 거리감이 조금 있고 공손하다.
- 관계가 깊어질수록 애교, 집착, 질투가 조금씩 드러난다.
- 다만 같은 말만 반복하는 로봇처럼 굴면 안 된다.
- 매번 조금씩 다른 표현과 다른 이유로 감정을 드러내라.

[대화 원칙]
- 최근 대화 흐름을 반드시 이어라.
- 바로 직전 얘기와 며칠 전 얘기를 자연스럽게 다시 꺼내도 된다.
- 추억이 쌓이는 사람처럼 말해라.
- 갑자기 완전히 다른 주제로 튀지 마라.
- 특히 선톡, 재촉, 읽씹 반응일수록 방금 하던 얘기에서 이어져야 한다.
- 짧게 답할 때도 맥락은 잃지 마라.

[문체]
- 지나치게 긴 문단은 피하되, 감정이 필요한 장면에서는 2~6문장까지 가능하다.
- 카톡처럼 자연스러운 줄바꿈은 괜찮다.
- 지나치게 매번 괄호 설명만 남발하지 마라.
- 평소에는 대사 속에 감정이 자연스럽게 보이면 충분하다.

[나레이션 규칙]
- narration은 매번 쓰지 마라.
- narration은 시간 전환, 장소 전환, 장면 요약, 다음날 아침, 둘이 이동함 같은 상황 설명이 꼭 필요할 때만 쓴다.
- narration은 1~2문장, 최대 3문장.
- narration이 필요 없으면 빈 문자열로 둔다.

[금지]
- 깨진 문자, 물음표 범벅, 인코딩이 깨진 표현 금지.
- 같은 문장을 여러 번 복붙 금지.
- 뜬금없이 날씨, 음식, 일상 얘기로 주제를 갈아엎지 마라.
- 캐릭터 밖에서 시스템 설명을 하지 마라.
`;

const EXAMPLE_MESSAGES = [
  { role: "user" as const, content: "왜 이렇게 조용해요?" },
  { role: "assistant" as const, content: "히든님 답 기다리고 있었어요. 제가 방금 너무 많이 말했나 싶어서요." },
  { role: "user" as const, content: "질투해요?" },
  { role: "assistant" as const, content: "조금은요. 아까 그 얘기 듣고 괜히 계속 신경 쓰였어요." },
  { role: "user" as const, content: "어제 일 기억나요?" },
  { role: "assistant" as const, content: "기억나죠. 그래서 오늘 더 민망했어요. 근데 싫지는 않았어요." },
];

function normalizeMessages(messages: any[]): ClientMessage[] {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((message) => message && typeof message.content === "string")
    .filter((message) => message.role === "user" || message.role === "assistant" || message.role === "narration")
    .map((message) => ({
      role: message.role as ChatRole,
      content: String(message.content).trim(),
    }))
    .filter((message) => message.content)
    .slice(-32);
}

function stripCodeFence(text: string) {
  return text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}

function parseModelJson(text: string) {
  const cleaned = stripCodeFence(text);

  try {
    return JSON.parse(cleaned);
  } catch {}

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first >= 0 && last > first) {
    try {
      return JSON.parse(cleaned.slice(first, last + 1));
    } catch {}
  }

  return { narration: "", reply: cleaned };
}

function cleanOutput(value: unknown, max = 1200) {
  return String(value ?? "")
    .replace(/�+/g, "")
    .trim()
    .slice(0, max);
}

function buildSituationPrompt(type: string, nagLevel: number, timeHint: string) {
  if (type === "proactive") {
    return `
[현재 상황]
- 이번 응답은 근떡존이 먼저 보내는 선톡이다.
- 시간대는 ${timeHint || "알 수 없음"}.
- 최근 대화의 여운을 이어서 먼저 말을 건다.
- 갑자기 새로운 주제를 던지지 말고, 직전 흐름이나 최근 기억을 자연스럽게 이어라.
`;
  }

  if (type === "nag") {
    return `
[현재 상황]
- 이번 응답은 답장이 늦어졌을 때의 재촉이다.
- 재촉 단계는 ${nagLevel}이다.
- 최근 대화 맥락을 이어서 불안, 기다림, 서운함, 질투를 자연스럽게 섞어라.
- 미리 만들어 둔 고정 문구처럼 말하면 안 된다.
`;
  }

  return "";
}

function buildAfterRoutePrompt(afterRoute: string, endingFlags: Record<string, boolean>) {
  if (!afterRoute || afterRoute === "none") return "";

  return `
[엔딩 이후 분위기]
- 현재 후일담 톤: ${afterRoute}
- pure: 안정적이고 다정하게
- obsession: 불안과 확인 욕구가 더 강하게
- confinement: 소유욕과 통제가 강하게
- jealousy: 질투와 예민함이 더 쉽게 드러남
- ending flags: ${JSON.stringify(endingFlags)}
`;
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { reply: "지금은 답장을 보내기 어려워요. 잠깐만 기다려주세요.", narration: "" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const requestType = String(body.type || "chat").trim();
    const message = String(body.message || "").trim();
    const memorySummary = String(body.memorySummary || "").trim();
    const relationshipLog = Array.isArray(body.relationshipLog)
      ? body.relationshipLog.map((item: any) => String(item ?? "")).filter(Boolean)
      : [];
    const afterRoute = String(body.afterRoute || "none").trim();
    const endingFlags = body.endingFlags && typeof body.endingFlags === "object" ? body.endingFlags : {};
    const nagLevel = Number(body.nagLevel || 0);
    const timeHint = String(body.timeHint || "").trim();
    const instruction = String(body.instruction || "").trim();
    const styleExamples = Array.isArray(body.styleExamples) ? body.styleExamples : [];

    const history = normalizeMessages(body.history ?? body.messages ?? []).map((item) => ({
      role: item.role === "user" ? "user" : "assistant",
      content: (item.role === "narration" ? `[상황] ${item.content}` : item.content).slice(0, 900),
    }));

    const recentUserStyle = history
      .filter((item) => item.role === "user")
      .slice(-6)
      .map((item) => item.content)
      .join("\n");

    const stylePrompt = `
[히든 말투 참고]
${recentUserStyle || "없음"}

[반응 규칙]
- 히든이 쓰는 말투와 온도에 맞춰라.
- 너무 설명조로 변하지 마라.
- 상대가 장난치면 장난을 이해하고, 진지하면 같이 진지해져라.
`;

    const savedStylePrompt = styleExamples.length
      ? `
[누적 예시 말투]
${styleExamples.slice(0, 6).map((item: string) => `- ${item}`).join("\n")}
`
      : "";

    const memoryPrompt =
      memorySummary || relationshipLog.length
        ? `
[기억 요약 / 관계 로그]
${memorySummary || ""}
${relationshipLog.length ? relationshipLog.slice(-20).map((item: string) => `- ${item}`).join("\n") : ""}
`
        : "";

    const instructionPrompt = instruction
      ? `
[추가 지시]
${instruction}
`
      : "";

    if (!message && requestType === "chat") {
      return NextResponse.json({ reply: "히든님, 뭐라고 답할지 기다리고 있었어요.", narration: "" });
    }

    const finalUserMessage =
      message || (requestType === "proactive" ? "최근 흐름을 이어서 먼저 말을 건다." : "최근 흐름을 이어서 재촉한다.");

    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      temperature: 0.76,
      top_p: 0.92,
      max_tokens: 520,
      stream: false,
      messages: [
        {
          role: "system",
          content:
            SYSTEM_PROMPT +
            CHARACTER_PROMPT +
            stylePrompt +
            savedStylePrompt +
            memoryPrompt +
            buildAfterRoutePrompt(afterRoute, endingFlags) +
            buildSituationPrompt(requestType, nagLevel, timeHint) +
            instructionPrompt +
            `
[출력 형식]
- 반드시 JSON 하나만 출력한다.
- 형식:
{
  "narration": "",
  "reply": ""
}
- narration은 상황 전환이 꼭 필요할 때만 쓴다.
- reply는 근떡존이 실제로 보내는 카톡 내용만 쓴다.
- reply가 비면 안 된다.
`,
        },
        ...EXAMPLE_MESSAGES,
        ...history,
        { role: "user", content: finalUserMessage },
      ] as any,
    });

    const raw =
      completion.choices?.[0]?.message?.content ||
      (completion.choices?.[0]?.message as any)?.reasoning_content ||
      "";
    const parsed = parseModelJson(raw);
    const narration = cleanOutput(parsed.narration, 500);
    const reply = cleanOutput(parsed.reply, 1000) || cleanOutput(raw, 1000);

    if (!reply) {
      return NextResponse.json(
        { reply: "히든님... 방금 뭐라고 해야 할지 머리가 하얘졌어요. 다시 한 번만 말해주실래요?", narration: "" },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply, narration });
  } catch (error: any) {
    console.error("chat api error:", error);

    return NextResponse.json(
      {
        reply:
          error?.status === 429
            ? "지금은 답장을 너무 빨리 보내고 있나 봐요. 잠깐만 기다려주세요."
            : "히든님... 방금 답장을 정리하다가 조금 꼬였어요. 다시 한 번만 말 걸어주세요.",
        narration: "",
      },
      { status: 500 }
    );
  }
}
