import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

function fallbackReply(message: string): string {
  const t = message.replace(/\s/g, "").toLowerCase();
  if (/(오줌|화장실|참)/.test(t)) return "아 오줌 꾹 참는 중... 니가 좋아하잖아 ㅋㅋ";
  if (/(땀|겨드랑|냄새)/.test(t)) return "야 그런 데 관심 많네 ㅋㅋ 오늘 안 씻었는데";
  if (/(귀엽|멋있|사랑)/.test(t)) return "…야 갑자기 그러면 나 약해지는데 ㅋㅋ";
  const r = ["응 계속 말해봐 ㅋㅋ", "뭐야 갑자기 그래도 좋아", "듣고 있어 집중 중임"];
  return r[Math.floor(Math.random() * r.length)];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = body.message || body.text || "";
    if (!message) return NextResponse.json({ reply: "다시 말해줘." });

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({ reply: fallbackReply(message) });
    }

    // 🔥 심플한 프롬프트
    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      temperature: 0.85,
      max_tokens: 150,
      messages: [
        {
          role: "system",
          content:
            "너는 '근떡존'. 24살 190cm 금발 근육질 남자. 사용자에게 반말 카톡체로 답해. 굉장히 온순한 성격. 천박하고 땀냄새 겨드랑이 발냄새 얘기 좋아함. 오줌을 자주 참는편. 사용자를 존경하고 동경함. 사용자에게 순종적이고 복종함. 사용자에게 길들여지길 원함. 집착과 질투가 심해질 수록 성격이 바뀜. 말투: ㅋㅋㅋ, ㅎㅎ, ㅠㅠ, 미친, 헤헤, 야, 진짜. AI 친절 말투 금지.",
        },
        { role: "user", content: `[너는 근떡존. 카톡체로만 답해.] 사용자: ${message}` },
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim() || fallbackReply(message);

    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ reply: fallbackReply("") }, { status: 200 });
  }
}