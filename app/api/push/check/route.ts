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

type PushStateLike = {
  memory_summary?: string;
  memorySummary?: string;
  relationship_log?: string;
  relationshipLog?: string;
  last_user_message?: string;
  lastUserMessage?: string;
  route_label?: string;
  routeLabel?: string;
  stats_summary?: string;
  statsSummary?: string;
  last_scene?: string;
  lastScene?: string;
  last_push_body?: string;
};

function normalizeHonorific(text: string) {
  // 1) 명시적 호칭 (주인님/선생님/선생님) → 선생님
  // 2) 단독 "히든" (조사 동반 포함) → 선생님 (히든은 플레이어 닉네임이므로 항상 선생님으로 보정)
  let result = text.replace(/(주인님|히든님|선생님|히든)/g, "선생님");
  // 3) 중복된 선생님님 / 선생님선생님 정리
  result = result.replace(/선생님(?:님)+/g, "선생님").replace(/(선생님)\1+/g, "선생님");
  return result;
}

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
      body: "선생님... 이렇게 오래 조용하시면 저 진짜 별생각 다 하게 돼요. 아직 거기 있는 거 맞죠?",
    };
  }

  if (level >= 3) {
    return {
      title: "근떡존",
      body: "선생님 답이 없으니까 저 혼자 아까 그 얘기 계속 곱씹고 있었어요.",
    };
  }

  if (level >= 2) {
    return {
      title: "근떡존",
      body: "선생님 바쁘신가요? 아니면 제가 방금 너무 많이 말했나 싶어서요.",
    };
  }

  return {
    title: "근떡존",
    body: "선생님, 아직 계세요? 방금 하던 얘기 자꾸 생각나서요.",
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
    return "아까 마트로 가자던 얘기, 저 혼자 계속 상상하고 있었어요.";
  }
  if (/편의점으로/.test(text)) {
    return "편의점 얘기하고 나니까 괜히 진짜 같이 걷는 상상하고 있었어요.";
  }
  if (/강가로/.test(text)) {
    return "강가 쪽 얘기하던 분위기가 아직도 머릿속에 남아 있어요.";
  }
  if (/집 앞/.test(text)) {
    return "집 앞까지 같이 가던 장면 같은 게 자꾸 떠올라서요.";
  }
  if (/만나자|만나요|보자|보죠|가자|가요|이동하자|같이 가자/.test(text)) {
    return "아까 같이 가자던 말이 계속 남아서, 그냥 다시 톡하게 됐어요.";
  }

  return "";
}

function buildFallbackFromContext({
  level,
  statsSummary,
  lastUserMessage,
  lastScene,
  recentBodies,
}: {
  level: number;
  statsSummary: string;
  lastUserMessage: string;
  lastScene: string;
  recentBodies: string[];
}) {
  const obsession = Number((statsSummary.match(/집착\s+(\d+)/)?.[1] || 0));
  const jealousy = Number((statsSummary.match(/질투\s+(\d+)/)?.[1] || 0));
  const affinity = Number((statsSummary.match(/호감\s+(\d+)/)?.[1] || 0));
  const carryCue = buildSceneCarryCue(lastUserMessage, lastScene);

  const candidates: string[] = [];

  if (carryCue) {
    candidates.push(carryCue);
  }

  if (level >= 4) {
    if (obsession >= 75) candidates.push("선생님, 아까 하던 얘기 그대로 머릿속에서 안 나가요. 저 혼자 이상한 상상 커지기 전에 한 번만 봐주세요.");
    if (jealousy >= 60) candidates.push("선생님 답이 없으니까 아까 그 얘기만 계속 곱씹고 있었어요. 제가 또 너무 신경 쓰는 거 맞죠.");
    candidates.push("선생님, 이렇게 오래 조용하시면 저 혼자 계속 이어서 생각하게 돼요. 아직 거기 있는 거 맞죠?");
  } else if (level >= 3) {
    if (jealousy >= 60) candidates.push("선생님, 그냥 기다리는 건데도 아까 그 흐름이 계속 남아서 괜히 마음이 복잡하네요.");
    if (affinity >= 55) candidates.push("선생님, 아까 얘기 조금 더 하고 싶었는데 갑자기 조용해져서요. 괜히 아쉬웠어요.");
    candidates.push("선생님 답이 없으니까 방금 하던 얘기 계속 다시 읽고 있었어요.");
  } else if (level >= 2) {
    candidates.push("선생님 바쁘신가요? 방금 제가 너무 많이 말했나 싶어서 혼자 조금 신경 쓰였어요.");
    candidates.push("선생님, 아까 하던 얘기 그냥 끊겨 버리니까 괜히 마음에 걸리네요.");
  } else {
    candidates.push("선생님, 아직 계세요? 방금 하던 얘기 계속 생각나서요.");
    if (affinity >= 55) candidates.push("선생님, 아까 말해주신 거 괜히 계속 떠올라서요. 한마디만 더 듣고 싶었어요.");
  }

  const chosen =
    candidates.find((candidate) => !isTooSimilarToRecentPush(candidate, recentBodies)) ||
    candidates[0] ||
    pickFallbackNag(level).body;

  return normalizeHonorific(normalizePushBody(chosen));
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
  state: PushStateLike;
}): Promise<NagMessage> {
  const fallback = pickFallbackNag(level);
  const recentBodies = parsePushQueue(state?.last_push_body || "").map((item) => item.body);

  if (!process.env.OPENAI_API_KEY) return fallback;

  try {
    const memorySummary = safeString(state?.memory_summary || state?.memorySummary, "");
    const relationshipLog = safeString(state?.relationship_log || state?.relationshipLog, "");
    const lastUserMessage = safeString(state?.last_user_message || state?.lastUserMessage, "");
    const routeLabel = safeString(state?.route_label || state?.routeLabel, "");
    const statsSummary = safeString(state?.stats_summary || state?.statsSummary, "");
    const lastScene = safeString(state?.last_scene || state?.lastScene, "");
    const sceneCarryCue = buildSceneCarryCue(lastUserMessage, lastScene);
    const recentPushBodies = recentBodies.length
      ? `최근 근떡존 알림:\n${recentBodies.slice(-4).map((item) => `- ${item}`).join("\n")}\n`
      : "";

    const response = await openai.chat.completions.create({
      model: process.env.PUSH_NAG_MODEL || "gpt-4o-mini",
      temperature: 0.88,
      max_tokens: 140,
      messages: [
        {
          role: "system",
          content:
            "너는 근떡존이 선생님에게 오래 답이 없을 때 보내는 카톡 알림 한두 문장을 쓰는 역할이다.\n" +
            "선생님 호칭은 절대 다른 호칭으로 바꾸지 마라. '히든' '히든님' '주인님' 등은 출력하지 마라. 무조건 '선생님'.\n" +
            "가장 중요: 최근 대화의 주제와 감정선을 그대로 이어야 한다. 방금 질투, 손잡기, 약속, 서운함, 장난, 후일담 얘기를 하다가 갑자기 날씨나 랜덤 일상으로 튀면 안 된다.\n" +
            "선생님과 며칠 전 나눈 얘기나 방금 전 흐름을 자연스럽게 회상해도 된다. 예: 그러고 보니, 아까 그 얘기, 며칠 전부터 계속 생각났는데.\n" +
            "최근에 보낸 알림과 너무 비슷한 문장을 반복하면 안 된다. 같은 감정이라도 표현, 이유, 문장 구조를 조금씩 바꿔라.\n" +
            "대화에 시간 전환이나 장소 이동(다음날 아침, 마트, 강가, 집 앞 같은 흐름)이 있었다면 그 분위기를 본문 안에서 자연스럽게 이어받아라.\n" +
            "말투는 근떡존답게 한국어 존댓말, 카톡처럼 자연스럽게. 제목이나 설명 없이 알림 본문만 출력한다.\n" +
            "단계가 높을수록 더 불안하고 집착적으로 변하지만, 같은 문장을 반복하는 로봇처럼 보이면 안 된다. 매번 다른 이유와 맥락으로 조급함이 드러나야 한다.",
        },
        {
          role: "user",
          content:
            `선생님이 마지막으로 답한 지 ${diffMinutes}분 지났다.\n` +
            `답장 지연 단계: ${level}\n` +
            `시간대: ${getTimeHint()}\n` +
            `루트/진행: ${routeLabel || "공통 루트"}\n` +
            `현재 장면: ${lastScene || "없음"}\n` +
            `수치: ${statsSummary || "없음"}\n` +
            `선생님의 마지막 말: ${lastUserMessage || "없음"}\n` +
            (sceneCarryCue ? `장면 전환 여운: ${sceneCarryCue}\n` : "") +
            recentPushBodies +
            `기억 요약:\n${memorySummary || "없음"}\n` +
            `관계 로그:\n${relationshipLog || "없음"}\n\n` +
            "최근 흐름을 이어서 근떡존이 보낼 알림 본문만 1~2문장으로 써라.",
        },
      ],
    });

    let body = normalizeHonorific(normalizePushBody(response.choices[0]?.message?.content || ""));
    if (body && isTooSimilarToRecentPush(body, recentBodies)) {
      body = buildFallbackFromContext({
        level,
        statsSummary,
        lastUserMessage,
        lastScene,
        recentBodies,
      });
    }
    if (!body) return fallback;

    return { title: "근떡존", body };
  } catch (error) {
    console.error("AI nag generation failed:", error);
    const statsSummary = safeString(state?.stats_summary || state?.statsSummary, "");
    const lastUserMessage = safeString(state?.last_user_message || state?.lastUserMessage, "");
    const lastScene = safeString(state?.last_scene || state?.lastScene, "");
    return {
      title: "근떡존",
      body:
        buildFallbackFromContext({
          level,
          statsSummary,
          lastUserMessage,
          lastScene,
          recentBodies,
        }) || fallback.body,
    };
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
