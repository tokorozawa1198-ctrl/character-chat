import { NextResponse } from "next/server";
import webpush from "web-push";
import OpenAI from "openai";
import { supabaseAdmin } from "../supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type PushQueueItem = {
  id: string;
  body: string;
  createdAt: string;
  source?: string;
};

type PushStateLike = {
  memory_summary?: string;
  relationship_log?: string;
  last_user_message?: string;
  route_label?: string;
  stats_summary?: string;
  last_scene?: string;
  last_push_body?: string;
};

function normalizeHonorific(text: string) {
  return text.replace(/(주인님|히든님|선생님)/g, "선생님");
}

function makePushId() {
  return `${Date.now()}_${Math.floor(Math.random() * 1000000000)}`;
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
  if (text.includes("�")) return false;

  const hasHangul = /[가-힣]/.test(text);
  const weirdQuestions = (text.match(/\?/g) || []).length;
  const looksMostlyBroken = weirdQuestions >= 3 && weirdQuestions / Math.max(text.length, 1) > 0.18;

  return hasHangul || !looksMostlyBroken;
}

function parsePushQueue(raw: unknown): PushQueueItem[] {
  if (!raw || typeof raw !== "string") return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        id: String(item?.id || item?.createdAt || item?.body || makePushId()),
        body: repairMojibake(String(item?.body || "").trim()),
        createdAt: String(item?.createdAt || new Date().toISOString()),
        source: item?.source ? String(item.source) : undefined,
      }))
      .filter((item) => item.source !== "legacy" && isReadablePushBody(item.body))
      .slice(-30);
  } catch {
    return [];
  }
}

function normalizePushBody(value: string, max = 170) {
  return value
    .replace(/^```(?:text|json)?/i, "")
    .replace(/```$/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function normalizeForSimilarity(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,!?~"'`()[\]{}<>:;*]/g, "")
    .trim();
}

function getWordOverlapScore(a: string, b: string) {
  const aWords = new Set(normalizeForSimilarity(a).split(" ").filter(Boolean));
  const bWords = new Set(normalizeForSimilarity(b).split(" ").filter(Boolean));
  if (!aWords.size || !bWords.size) return 0;

  let overlap = 0;
  for (const word of aWords) {
    if (bWords.has(word)) overlap += 1;
  }

  return overlap / Math.max(aWords.size, bWords.size);
}

function isTooSimilarToRecentPush(body: string, recentBodies: string[]) {
  const normalized = normalizeForSimilarity(body);
  if (!normalized) return false;

  return recentBodies.slice(-3).some((previous) => {
    const prev = normalizeForSimilarity(previous);
    if (!prev) return false;
    if (prev === normalized) return true;
    return getWordOverlapScore(prev, normalized) >= 0.72;
  });
}

function needsSceneCarry(text: string) {
  const normalized = text.trim();
  if (!normalized) return false;

  return /(다음날|다음 날|아침이 되|저녁이 되|밤이 되|점심이 되|오후가 되|오전이 되|마트로|편의점으로|강가로|집 앞|둘은|향했다|도착했다|만나자|만나요|보자|보죠|가자|가요|이동하자|같이 가자)/.test(
    normalized
  );
}

function buildSceneCarryCue(lastUserMessage: string, lastScene: string) {
  const text = `${lastUserMessage}\n${lastScene}`.trim();
  if (!needsSceneCarry(text)) return "";

  if (/다음날|다음 날|아침이 되|오전이 되/.test(text)) {
    return "아까 다음날 아침 얘기하던 흐름이 계속 남아 있어요.";
  }
  if (/저녁이 되|밤이 되|오후가 되|점심이 되/.test(text)) {
    return "시간이 바뀌는 얘기까지 했던 게 괜히 계속 생각나요.";
  }
  if (/마트로/.test(text)) {
    return "아까 마트 얘기하던 게 머릿속에 자꾸 남아서요.";
  }
  if (/편의점으로/.test(text)) {
    return "편의점 얘기하고 나니까 괜히 같이 걷는 상상하고 있었어요.";
  }
  if (/강가로/.test(text)) {
    return "강가 쪽으로 걷는 장면을 저 혼자 계속 떠올리고 있었어요.";
  }
  if (/집 앞/.test(text)) {
    return "집 앞까지 같이 가던 분위기가 괜히 계속 남아 있어요.";
  }
  if (/만나자|만나요|보자|보죠|가자|가요|이동하자|같이 가자/.test(text)) {
    return "아까 같이 가자던 말이 남아서 또 톡하고 싶어졌어요.";
  }

  return "";
}

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function getTimeHint() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) return "아침 시간대";
  if (hour >= 11 && hour < 17) return "낮 시간대";
  if (hour >= 17 && hour < 23) return "저녁 시간대";
  return "밤 시간대";
}

function buildFallbackProactive({
  state,
  recentBodies,
}: {
  state: PushStateLike;
  recentBodies: string[];
}) {
  const statsSummary = safeString(state.stats_summary, "");
  const obsession = Number((statsSummary.match(/집착\s+(\d+)/)?.[1] || 0));
  const jealousy = Number((statsSummary.match(/질투\s+(\d+)/)?.[1] || 0));
  const affinity = Number((statsSummary.match(/호감\s+(\d+)/)?.[1] || 0));
  const lastUserMessage = safeString(state.last_user_message, "");
  const lastScene = safeString(state.last_scene, "");
  const carryCue = buildSceneCarryCue(lastUserMessage, lastScene);

  const candidates: string[] = [];

  if (carryCue) candidates.push(carryCue);
  if (obsession >= 75) candidates.push("히든님, 그냥 별일 없는 척하고 있었는데 또 톡하고 싶어졌어요. 방금까지 하던 얘기가 계속 남아 있어서요.");
  if (jealousy >= 60) candidates.push("히든님, 아까 그 얘기 그냥 넘기려고 했는데 이상하게 계속 마음에 남아서요. 그래서 먼저 톡했어요.");
  if (affinity >= 55) candidates.push("히든님, 방금까지 나눈 얘기 괜히 계속 생각나서요. 그냥 한마디 더 하고 싶었어요.");

  const timePool =
    getTimeHint() === "아침 시간대"
      ? ["히든님, 아침 되니까 어제 하던 얘기부터 생각났어요. 잘 주무셨어요?", "히든님, 아침인데 그냥 톡하고 싶어졌어요. 어제 말해준 거 아직도 기억나요."]
      : getTimeHint() === "낮 시간대"
      ? ["히든님, 낮인데도 아까 얘기한 분위기가 안 가시네요. 뭐 하고 계세요?", "히든님, 그냥 지나가듯 톡하려던 건데 또 방금 하던 얘기부터 떠올랐어요."]
      : getTimeHint() === "저녁 시간대"
      ? ["히든님, 저녁 되니까 괜히 조용해져서요. 아까 하던 얘기 조금 더 하고 싶었어요.", "히든님, 오늘 하루 끝나가는데도 방금 얘기한 게 계속 남아 있네요."]
      : ["히든님, 밤 되니까 더 조용해서 그런가요. 오늘 나눈 얘기들이 자꾸 떠올라요.", "히든님, 이 시간에 톡하면 좀 티 나죠. 근데 그냥 생각나서요."];

  candidates.push(...timePool);

  const chosen =
    candidates.find((candidate) => !isTooSimilarToRecentPush(candidate, recentBodies)) ||
    candidates[0] ||
    "히든님, 그냥 생각나서 먼저 톡했어요.";

  return normalizeHonorific(normalizePushBody(chosen));
}

async function appendPushQueue(body: string) {
  const now = new Date().toISOString();

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
      createdAt: now,
      source: "test_push",
    },
  ].slice(-30);

  await supabaseAdmin!
    .from("push_state")
    .upsert(
      {
        id: "default",
        last_push_body: JSON.stringify(nextQueue),
        last_assistant_at: now,
        updated_at: now,
      },
      { onConflict: "id" }
    );
}

async function generateAIProactiveMessage(state: PushStateLike) {
  const recentBodies = parsePushQueue(state?.last_push_body || "").map((item) => item.body);
  const fallback = buildFallbackProactive({ state, recentBodies });
  if (!process.env.OPENAI_API_KEY) return fallback;

  try {
    const memorySummary = safeString(state?.memory_summary, "");
    const relationshipLog = safeString(state?.relationship_log, "");
    const lastUserMessage = safeString(state?.last_user_message, "");
    const routeLabel = safeString(state?.route_label, "");
    const statsSummary = safeString(state?.stats_summary, "");
    const lastScene = safeString(state?.last_scene, "");
    const sceneCarryCue = buildSceneCarryCue(lastUserMessage, lastScene);
    const recentPushBodies = recentBodies.length
      ? `최근 근떡존 알림:\n${recentBodies.slice(-4).map((item) => `- ${item}`).join("\n")}\n`
      : "";

    const response = await openai.chat.completions.create({
      model: process.env.PUSH_NAG_MODEL || "gpt-4o-mini",
      temperature: 0.9,
      max_tokens: 140,
      messages: [
        {
          role: "system",
          content:
            "너는 근떡존이 히든에게 먼저 보내는 선톡 한두 문장을 쓰는 역할이다.\n" +
            "가장 중요: 최근 대화의 주제와 감정선을 그대로 이어야 한다. 방금 질투, 손잡기, 약속, 장난, 후일담 얘기를 하다가 갑자기 랜덤 일상으로 튀면 안 된다.\n" +
            "며칠 전 이야기, 방금 전 이야기, 아까 남은 장면의 여운을 자연스럽게 다시 꺼내라.\n" +
            "최근에 보낸 알림과 너무 비슷한 문장을 반복하면 안 된다. 같은 감정이라도 표현, 이유, 문장 구조를 조금씩 바꿔라.\n" +
            "대화에 시간 전환이나 장소 이동(다음날 아침, 마트, 강가, 집 앞 같은 흐름)이 있었다면 그 분위기를 본문 안에서 이어받아라.\n" +
            "말투는 근떡존답게 한국어 존댓말, 카톡처럼 자연스럽게. 제목이나 설명 없이 알림 본문만 출력한다.",
        },
        {
          role: "user",
          content:
            `시간대: ${getTimeHint()}\n` +
            `루트/진행: ${routeLabel || "공통 루트"}\n` +
            `현재 장면: ${lastScene || "없음"}\n` +
            `수치: ${statsSummary || "없음"}\n` +
            `히든의 마지막 말: ${lastUserMessage || "없음"}\n` +
            (sceneCarryCue ? `장면 전환 여운: ${sceneCarryCue}\n` : "") +
            recentPushBodies +
            `기억 요약:\n${memorySummary || "없음"}\n` +
            `관계 로그:\n${relationshipLog || "없음"}\n\n` +
            "최근 흐름을 이어서 근떡존이 먼저 보낼 선톡 본문만 1~2문장으로 써라.",
        },
      ],
    });

    let body = normalizeHonorific(normalizePushBody(response.choices[0]?.message?.content || ""));
    if (body && isTooSimilarToRecentPush(body, recentBodies)) {
      body = buildFallbackProactive({ state, recentBodies });
    }

    return body || fallback;
  } catch (error) {
    console.error("AI proactive generation failed:", error);
    return fallback;
  }
}

export async function POST() {
  try {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || "mailto:test@example.com";

    if (!publicKey || !privateKey) {
      return NextResponse.json({ ok: false, error: "VAPID 키가 없습니다." }, { status: 500 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: "Supabase 환경변수가 없습니다." }, { status: 500 });
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);

    const { data, error } = await supabaseAdmin
      .from("push_subscriptions")
      .select("id, endpoint, subscription")
      .order("updated_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    if (!data?.length) {
      return NextResponse.json(
        { ok: false, error: "Supabase에 저장된 구독이 없습니다. 먼저 폰에서 푸시 구독을 눌러주세요." },
        { status: 400 }
      );
    }

    const { data: state } = await supabaseAdmin
      .from("push_state")
      .select("memory_summary, relationship_log, last_user_message, route_label, stats_summary, last_scene, last_push_body")
      .eq("id", "default")
      .maybeSingle();

    const body = await generateAIProactiveMessage((state || {}) as PushStateLike);

    const payload = JSON.stringify({
      title: "근떡존",
      body,
      icon: "/oppa1.png",
      badge: "/oppa1.png",
      url: "/",
      tag: `geuntteokjon-test-${Date.now()}`,
    });

    const results = await Promise.allSettled(
      data.map((row) => webpush.sendNotification(row.subscription, payload))
    );

    const expiredIds: number[] = [];

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        const reason: any = result.reason;

        if (reason?.statusCode === 404 || reason?.statusCode === 410) {
          const id = data[index]?.id;
          if (id) expiredIds.push(id);
        }
      }
    });

    if (expiredIds.length) {
      await supabaseAdmin.from("push_subscriptions").delete().in("id", expiredIds);
    }

    await appendPushQueue(body);

    return NextResponse.json({
      ok: true,
      body,
      total: data.length,
      sent: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
      removedExpired: expiredIds.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "test push 실패" },
      { status: 500 }
    );
  }
}
