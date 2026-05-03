import { NextResponse } from "next/server";
import webpush from "web-push";
import OpenAI from "openai";
import { supabaseAdmin } from "../supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type NagMessage = {
  title: string;
  body: string;
};

type PushQueueItem = {
  id: string;
  body: string;
  createdAt: string;
  source?: string;
};

function getNagLevel(diffMs: number) {
  const minute = 1000 * 60;

  if (diffMs >= minute * 120) return 4;
  if (diffMs >= minute * 60) return 3;
  if (diffMs >= minute * 30) return 2;
  if (diffMs >= minute * 10) return 1;

  return 0;
}

function pickFallbackNag(level: number): NagMessage {
  if (level >= 4) {
    return {
      title: "근떡존",
      body: "히든님... 이렇게 오래 조용하시면 저 진짜 별생각 다 하게 돼요. 아직 거기 있는 거 맞죠?",
    };
  }

  if (level >= 3) {
    return {
      title: "근떡존",
      body: "히든님 답이 없으니까 저 혼자 아까 그 얘기 계속 곱씹고 있었어요.",
    };
  }

  if (level >= 2) {
    return {
      title: "근떡존",
      body: "히든님 바쁘신가요? 아니면 제가 방금 너무 많이 말했나 싶어서요.",
    };
  }

  return {
    title: "근떡존",
    body: "히든님, 아직 계세요? 방금 하던 얘기 자꾸 생각나서요.",
  };
}

function safeString(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (value == null) return fallback;

  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

function makePushId() {
  return `${Date.now()}_${Math.floor(Math.random() * 1000000000)}`;
}

function repairMojibake(value: string) {
  if (!/[Ã-ÿ]/.test(value)) return value;

  try {
    const repaired = Buffer.from(value, "latin1").toString("utf8");
    if (/[가-힣]/.test(repaired)) return repaired;
  } catch {}

  return value;
}

function isReadablePushBody(value: string) {
  const text = value.trim();
  if (!text) return false;

  const questionMarks = (text.match(/\?/g) || []).length;
  const hasHangul = /[가-힣]/.test(text);
  const looksMostlyBroken = questionMarks >= 3 && questionMarks / Math.max(text.length, 1) > 0.15;

  return hasHangul || !looksMostlyBroken;
}

function parsePushQueue(raw: unknown): PushQueueItem[] {
  if (!raw || typeof raw !== "string") return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => ({
          id: String(item?.id || item?.createdAt || item?.body || makePushId()),
          body: repairMojibake(String(item?.body || "").trim()),
          createdAt: String(item?.createdAt || new Date().toISOString()),
          source: item?.source ? String(item.source) : undefined,
        }))
        .filter((item) => item.source !== "legacy" && isReadablePushBody(item.body))
        .slice(-30);
    }
  } catch {}

  return [];
}

async function appendPushQueue(body: string, level: number) {
  const { data } = await supabaseAdmin!
    .from("push_state")
    .select("last_push_body")
    .eq("id", "default")
    .maybeSingle();

  const queue = parsePushQueue(data?.last_push_body || "");
  const nextQueue = [
    ...queue,
    {
      id: makePushId(),
      body,
      createdAt: new Date().toISOString(),
      source: `nag_${level}`,
    },
  ].slice(-30);

  return JSON.stringify(nextQueue.filter((item) => isReadablePushBody(item.body)));
}

function normalizePushBody(value: string, max = 160) {
  return value
    .replace(/^```(?:text|json)?/i, "")
    .replace(/```$/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function getTimeHint() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) return "아침 시간대";
  if (hour >= 11 && hour < 17) return "낮 시간대";
  if (hour >= 17 && hour < 23) return "저녁 시간대";
  return "밤 시간대";
}

async function generateAINagMessage({
  level,
  diffMinutes,
  state,
}: {
  level: number;
  diffMinutes: number;
  state: any;
}): Promise<NagMessage> {
  const fallback = pickFallbackNag(level);

  if (!process.env.OPENAI_API_KEY) return fallback;

  try {
    const memorySummary = safeString(state?.memory_summary || state?.memorySummary, "");
    const relationshipLog = safeString(state?.relationship_log || state?.relationshipLog, "");
    const lastUserMessage = safeString(state?.last_user_message || state?.lastUserMessage, "");
    const routeLabel = safeString(state?.route_label || state?.routeLabel, "");
    const statsSummary = safeString(state?.stats_summary || state?.statsSummary, "");
    const lastScene = safeString(state?.last_scene || state?.lastScene, "");

    const response = await openai.chat.completions.create({
      model: process.env.PUSH_NAG_MODEL || "gpt-4o-mini",
      temperature: 0.88,
      max_tokens: 140,
      messages: [
        {
          role: "system",
          content:
            "너는 근떡존이 히든에게 오래 답이 없을 때 보내는 카톡 알림 한두 문장을 쓰는 역할이다.\n" +
            "가장 중요: 최근 대화의 주제와 감정선을 그대로 이어야 한다. 방금 질투, 손잡기, 약속, 서운함, 장난, 후일담 얘기를 하다가 갑자기 날씨나 랜덤 일상으로 튀면 안 된다.\n" +
            "히든과 며칠 전 나눈 얘기나 방금 전 흐름을 자연스럽게 회상해도 된다. 예: 그러고 보니, 아까 그 얘기, 며칠 전부터 계속 생각났는데.\n" +
            "말투는 근떡존답게 한국어 존댓말, 카톡처럼 자연스럽게. 제목이나 설명 없이 알림 본문만 출력한다.\n" +
            "단계가 높을수록 더 불안하고 집착적으로 변하지만, 같은 문장을 반복하는 로봇처럼 보이면 안 된다. 매번 다른 이유와 맥락으로 조급함이 드러나야 한다.",
        },
        {
          role: "user",
          content:
            `히든이 마지막으로 답한 지 ${diffMinutes}분 지났다.\n` +
            `답장 지연 단계: ${level}\n` +
            `시간대: ${getTimeHint()}\n` +
            `루트/진행: ${routeLabel || "공통 루트"}\n` +
            `현재 장면: ${lastScene || "없음"}\n` +
            `수치: ${statsSummary || "없음"}\n` +
            `히든의 마지막 말: ${lastUserMessage || "없음"}\n` +
            `기억 요약:\n${memorySummary || "없음"}\n` +
            `관계 로그:\n${relationshipLog || "없음"}\n\n` +
            "최근 흐름을 이어서 근떡존이 보낼 알림 본문만 1~2문장으로 써라.",
        },
      ],
    });

    const body = normalizePushBody(response.choices[0]?.message?.content || "");
    if (!body) return fallback;

    return { title: "근떡존", body };
  } catch (error) {
    console.error("AI nag generation failed:", error);
    return fallback;
  }
}

export async function GET(req: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");

    if (cronSecret && secret !== cronSecret) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || "mailto:test@example.com";

    if (!publicKey || !privateKey) {
      return NextResponse.json({ ok: false, error: "VAPID keys are missing." }, { status: 500 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: "Supabase admin is not configured." }, { status: 500 });
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);

    const { data: state, error: stateError } = await supabaseAdmin
      .from("push_state")
      .select("*")
      .eq("id", "default")
      .single();

    if (stateError || !state) {
      return NextResponse.json(
        { ok: false, error: stateError?.message || "push_state not found" },
        { status: 500 }
      );
    }

    const lastUserAt = state.last_user_at ? new Date(state.last_user_at).getTime() : Date.now();
    const diffMs = Date.now() - lastUserAt;
    const diffMinutes = Math.floor(diffMs / 60000);
    const nextNagLevel = getNagLevel(diffMs);
    const currentNagLevel = Number(state.nag_level || 0);

    if (nextNagLevel <= 0 || nextNagLevel <= currentNagLevel) {
      return NextResponse.json({
        ok: true,
        sent: false,
        reason: "not ready",
        diffMinutes,
        currentNagLevel,
        nextNagLevel,
      });
    }

    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from("push_subscriptions")
      .select("id, endpoint, subscription")
      .order("updated_at", { ascending: false })
      .limit(20);

    if (subError) {
      return NextResponse.json({ ok: false, error: subError.message }, { status: 500 });
    }

    if (!subscriptions?.length) {
      return NextResponse.json({ ok: false, error: "No push subscriptions." }, { status: 400 });
    }

    const msg = await generateAINagMessage({ level: nextNagLevel, diffMinutes, state });
    const payload = JSON.stringify({
      title: msg.title,
      body: msg.body,
      icon: "/oppa1.png",
      badge: "/oppa1.png",
      url: "/",
      tag: `geuntteokjon-nag-${nextNagLevel}`,
    });

    const results = await Promise.allSettled(
      subscriptions.map((row) => webpush.sendNotification(row.subscription, payload))
    );

    const expiredIds: number[] = [];
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        const reason: any = result.reason;
        if (reason?.statusCode === 404 || reason?.statusCode === 410) {
          const id = subscriptions[index]?.id;
          if (id) expiredIds.push(id);
        }
      }
    });

    if (expiredIds.length) {
      await supabaseAdmin.from("push_subscriptions").delete().in("id", expiredIds);
    }

    const queuedPushBody = await appendPushQueue(msg.body, nextNagLevel);

    await supabaseAdmin
      .from("push_state")
      .update({
        nag_level: nextNagLevel,
        last_assistant_at: new Date().toISOString(),
        last_push_body: queuedPushBody,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "default");

    return NextResponse.json({
      ok: true,
      sent: true,
      aiGenerated: Boolean(process.env.OPENAI_API_KEY),
      diffMinutes,
      nagLevel: nextNagLevel,
      message: msg.body,
      total: subscriptions.length,
      success: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
      removedExpired: expiredIds.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "push check failed" },
      { status: 500 }
    );
  }
}
