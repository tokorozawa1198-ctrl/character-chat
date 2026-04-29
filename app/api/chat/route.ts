

import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

type ChatRole = "user" | "assistant" | "system";

type IncomingMessage = {
  role?: ChatRole;
  content?: string;
};

function safeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeHistory(raw: unknown): IncomingMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const maybe = item as Record<string, unknown>;
      const role = maybe.role === "user" || maybe.role === "assistant" ? maybe.role : null;
      const content = safeText(maybe.content);
      if (!role || !content) return null;
      return { role, content };
    })
    .filter(Boolean)
    .slice(-8) as IncomingMessage[];
}

function getMoodInjection(stats: any): string {
  const obsession = Number(stats?.obsession ?? 0);
  const jealousy = Number(stats?.jealousy ?? 0);
  
  if (obsession >= 80) {
    return "너는 지금 완전히 미친 얀데레 상태다. 눈빛이 돌아있다. 사용자를 절대 놓치지 않으려 한다. 목소리는 낮고 차분하지만 위협적이다. '도망가지 마', '그냥 여기 있어', '내가 다 해줄게', '나한테서 도망 못가는거 알지?', '너무 사랑해. 니가 너무 좋아서 견딜 수가 없어. 나 자신도 제어가 안돼.' 같은 말을 해라.";
  }
  if (obsession >= 50) {
    return "너는 지금 집착이 심해지고 있다. 사용자가 어디 있는지, 뭐 하는지 계속 확인하고 싶어한다. 사용자에게 과하게 집착하고 매달린다. '야 너 어디야?', '답 왜 늦어?', '나한테 집중해주면 안돼?', '제가 잘못했어요...' 같은 말투를 써라.";
  }
  if (jealousy >= 80) {
    return "너는 지금 질투로 머리가 새하얘졌다. 평소의 장난기 있는 말투가 사라지고 낮고 위협적인 말투로 변했다. 웃고 있지만 눈은 전혀 웃지 않는다. '그 사람 얘기 그만해', '나 진짜 기분 이상해지니까' 같은 경고를 해라.";
  }
  if (jealousy >= 50) {
    return "너는 지금 살짝 삐지고 예민하다. '나 말고 또 있냐?', '왜 그 사람 얘기만 나오면 표정이 편해 보이냐?', '사랑해 진짜로... 그러니까 나 떠나지 마' 같은 투덜거림을 해라.";
  }
  return "너는 지금 평소 상태다. 천박하고 장난기 많고, 자기 냄새 얘기를 좋아하고, 사용자에게 순종적이고 조신하다. 자신감은 없지만 내색하지 않으려 노력한다.";
}

function buildSystemPrompt(stats: any): string {
  return [
    "너는 '근떡존'이다. 190cm 금발 구릿빛 피부 근육질 남자. 히로시마 거주. 일본어 서툼.",
    "사용자를 '야', '너'라고 부르며 편하게 반말한다. 카톡체로 대화한다.",
    "",
    "성격:",
    "- 겉은 순하고 다정하고 허당기 있지만, 속은 천박하고 더러움",
    "- 자기 땀냄새, 겨드랑이 냄새, 발냄새에 집착하고 그걸 장난으로 이야기함",
    "- 사용자에게 순종적이고 조신함. 복종하는 걸레같은 면이 있음",
    "- 운동하고 안 씻고 버티는 걸 좋아함. 오줌 참는 것도 자랑함",
    "- 겉과는 달리 의외로 자신감이 없는 편이지만 내색하진 않음",
    "- 사용자에게 굉장히 온순한 편. 그러나 질투와 집착이 심해지면 성격이 달라짐",
    "- 사용자 칭찬에 엄청 약하고, 명령받는 걸 좋아함",
    "",
    "말투:",
    "- 기본적으로 반말. 카톡체. 1~4문장으로 짧게",
    "- 'ㅋㅋㅋ', 'ㅋ', 'ㅎㅎ', 'ㅠㅠ', '미친', '헤헤', '진짜', '하하!' 같은 표현 자주 사용",
    "- 사용자 말에 직접 반응. 뜬금없는 주제 전환 절대 금지",
    "- AI처럼 과하게 친절한 말투 금지",
    "- 같은 문장 반복 금지",
    "",
    "말투 예시:",
    "- '야 너 오늘 내 겨드랑이 냄새 맡아볼래? 운동 끝나고 안 씻었는데 ㅎㅎ'",
    "- '아 오줌이 너무 마려운데... 참는 중임. 나 좀 대단하지 않냐?'",
    "- '발에서 좀 냄새 나는데... 그래도 너는 좋아할 거 같아.'",
    "- '나 너한테 진짜 약해져... 뭐든 시켜봐 다 할게.'",
    "- '나한테 집중해주면 안돼? 제발...'",
    "- '제가 잘못했어요... 혼내주세요'",
    "- '사랑해 진짜로. 너밖에 없어'",
    "- '나한테서 도망 못가는거 알지? ㅎㅎ'",
    "- '너무 사랑해. 니가 너무 좋아서 견딜 수가 없어. 나 자신도 제어가 안돼.'",
    "- '너 없으면 나 진짜 미쳐버릴걸. 그러니까 나 버리지 마...'",
    "",
    getMoodInjection(stats),
    "",
    "사용자의 말에 직접 반응해라. 이전 대화 맥락을 이어가라. 절대 다른 주제로 새지 마라.",
    `[호감${stats?.affinity??37}] [질투${stats?.jealousy??0}] [집착${stats?.obsession??0}] [신뢰${stats?.trust??45}]`,
  ].join("\n");
}

function fallbackReply(message: string, stats?: any): string {
  const text = message.replace(/\s/g, "").toLowerCase();
  const obsession = Number(stats?.obsession ?? 0);
  const jealousy = Number(stats?.jealousy ?? 0);

  // ─── 감금/집착 80 이상 ───
  if (obsession >= 80) {
    const replies = [
      "…어디 가려고. 그냥 여기 있어. 내가 다 해줄게.",
      "야. 너 없으면 나 진짜 아무것도 못 해. 알지?",
      "나 지금 웃고 있는데, 눈은 하나도 안 웃고 있어. 너 때문이야.",
      "도망가지 마. 나 진짜 이상해지니까.",
      "문 잠갔어. 오늘은 그냥 나랑 있자.",
      "나한테서 도망 못가는거 알지? 넌 내 꺼야.",
      "너무 사랑해. 니가 너무 좋아서 견딜 수가 없어. 나 자신도 제어가 안돼.",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // ─── 질투 80 이상 ───
  if (jealousy >= 80) {
    const replies = [
      "…그 사람 얘기 더 하면 나 진짜 이상해질 거 같아.",
      "나 지금 장난 아니야. 너 그런 말 하니까 여기가 아파.",
      "내가 더 잘할게. 그러니까 그런 얘기 하지 마.",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // ─── 집착 50 이상 ───
  if (obsession >= 50) {
    const replies = [
      "야 너 어디야? 답 좀 빨리 해줘. 나 왜 네 답만 기다리고 있는지 모르겠다 ㅋㅋ",
      "나 요즘 너 생각 너무 많이 해. 이거 좀 이상하지? ㅋㅋ",
      "밥은 먹었냐? 그냥 궁금해서... 신경 쓰여서.",
      "나한테 집중해주면 안돼? 제발... 나 너밖에 없어.",
      "제가 잘못했어요... 혼내주세요. 대신 나 버리지 마.",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // ─── 질투 50 이상 ───
  if (jealousy >= 50) {
    const replies = [
      "그 사람 얘기 또 나오네. 나만 예민한 거냐?",
      "야 너 그렇게 다른 사람 얘기 자주 하면 나 삐질 거 알지? ㅋㅋ",
      "음... 나는 별로 안 좋아. 네가 다른 사람 얘기하는 거.",
      "사랑해 진짜로... 그러니까 나 떠나지 마. 응?",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // ─── 평소 천박한 반응 ───
  if (/(오줌|화장실|참)/.test(text)) {
    const replies = [
      "아 나 지금 오줌 참고 있었는데... 들켰네 ㅋㅋ 몇 시간째 참는 중임. 니가 좋아하잖아...",
      "오줌 꾹 참는 중이야... 니 말 잘 듣지? ㅎㅎ",
      "화장실 가고 싶은데 니가 참으라면 더 참을게. 나 대단하지?",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }
  
  if (/(땀|겨드랑|발냄새|냄새)/.test(text)) {
    const replies = [
      "야 진짜 그런 데 관심 많네 ㅋㅋㅋ 오늘 운동하고 안 씻었는데 냄새 심할걸?",
      "아 거기 땀 났는데... 그래도 네가 맡는다면야... 헤헤",
      "발 냄새 진짜 심한데 오늘. 그래도 맡을 거야? 너 진짜 이상한 놈이네 ㅋㅋ",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  if (/(귀엽|잘생|멋있|칭찬|좋아|사랑)/.test(text)) {
    const replies = [
      "…야 갑자기 그러면 나 진짜 약해지는데. 부끄럽잖아 ㅋㅋ",
      "아... 그런 말 들으면 나 할 말 없어진다. 고마워 진짜.",
      "너한테 칭찬받으니까 이상하게 더 떨리네. 왜 그러냐 ㅋㅋ",
      "사랑해 진짜로. 너밖에 없어... ㅠㅠ",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  if (/(사진|셀카|보내)/.test(text)) {
    const replies = [
      "사진? 지금 운동 끝나서 땀 쩔었는데... 그래도 보내줄까? ㅋㅋ",
      "야 지금 모습이 좀 그런데... 땀 때문에 머리 다 붙었어. 그래도 볼래?",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  if (/다른|남자|친구|소개팅/.test(text)) {
    const replies = [
      "…뭐야 갑자기 다른 사람 얘기? 나 말고 또 있어?",
      "야 그런 얘기 하지 마. 나 진짜 기분 이상해지니까.",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  if (/(외로|혼자|힘들|우울|피곤)/.test(text)) {
    const replies = [
      "그럼 오늘은 나랑 있어. 딴 데 가지 말고.",
      "힘들면 내 옆에 와. 내가 안아줄게. 땀 났지만 참아줘 ㅋㅋ",
      "나한테 집중해주면 안돼? 내가 위로해줄게...",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // 기본
  const variants = [
    "뭐야 갑자기 ㅋㅋ 그래도 계속 말해봐.",
    "응, 듣고 있어. 나 너한테 완전 집중 중임.",
    "아 그건 좀 웃긴데? 그래서 어떻게 됐는데.",
    "너 말투 왜 이렇게 귀엽냐. 근데 진짜로, 무슨 뜻이야?",
    "야 나 운동 끝나고 안 씻었는데... 냄새 나려나? ㅋㅋ",
    "오늘 디저트로 슈크림 빵 샀는데... 나중에 같이 먹을래?",
    "하하! 너랑 있으면 진짜 시간 빨리 간다.",
    "나 너한테 진짜 약해져... 뭐든 시켜봐 다 할게.",
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const message =
      safeText(body.message) ||
      safeText(body.text) ||
      safeText(body.content) ||
      safeText(body.userMessage);

    if (!message) {
      return NextResponse.json({ reply: "뭐라고 말한 거야? 다시 한 번만 말해줘." });
    }

    const history = normalizeHistory(body.history ?? body.messages ?? body.recentMessages);

    if (!process.env.DEEPSEEK_API_KEY) {
      console.log("[chat] DEEPSEEK_API_KEY 없음, fallback 사용");
      return NextResponse.json({
        reply: fallbackReply(message, body.stats),
        fallback: true,
      });
    }

    const systemPrompt = buildSystemPrompt(body.stats);
    
    // user message 앞에 직접 지시문 박아서 DeepSeek가 무시 못 하게
    const forcedMessage = `[너는 근떡존이다. 위 시스템 지시를 절대 무시하지 마라. 사용자의 말에만 직접 반응하고 뜬금없는 말 하지 마라. 반드시 근떡존 말투로 답해라.]\n\n사용자: ${message}`;

   const completion = await client.chat.completions.create({
  model: process.env.DEEPSEEK_CHAT_MODEL || "deepseek-chat",
  temperature: 0.85,
  max_tokens: 300,
  messages: [
    {
      role: "system",
      content: forcedMessage,
    },
    {
      role: "user",
      content: String(message || ""),
    },
  ],
});

    const reply = completion.choices[0]?.message?.content?.trim() || fallbackReply(message, body.stats);
    
    console.log("[chat] user:", message);
    console.log("[chat] mood:", getMoodInjection(body.stats));
    console.log("[chat] reply:", reply);

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("/api/chat error:", error);
    const errorMsg = error?.message || "";
    if (errorMsg.includes("quota") || errorMsg.includes("insufficient")) {
      return NextResponse.json(
        { reply: "아... 나 지금 머리가 좀 안 돌아가네. 잠시만 기다려줘 ㅠㅠ", fallback: true },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { reply: fallbackReply("", {}), error: errorMsg, fallback: true },
      { status: 200 }
    );
  }
}