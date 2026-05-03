import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../supabase";

type PushStateBody = {
  type?: "user_message" | "assistant_message";
  memorySummary?: string;
  relationshipLog?: string | string[];
  recentHistory?: string[];
  lastUserMessage?: string;
  routeLabel?: string;
  statsSummary?: string;
  lastScene?: string;
  lastAssistantMessage?: string;
};

type PushQueueItem = {
  id: string;
  body: string;
  createdAt: string;
  source?: string;
};

function cleanText(value: unknown, max = 3000) {
  if (typeof value !== "string") return undefined;
  const text = value.replace(/�+/g, "").trim();
  if (!text) return undefined;
  return text.slice(0, max);
}

function cleanRecentHistory(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const joined = value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(-20)
    .join("\n");
  return cleanText(joined, 5000);
}

function cleanRelationshipLog(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim())
      .filter(Boolean)
      .slice(-20)
      .join("\n")
      .slice(0, 5000);
  }

  return cleanText(value, 5000);
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

function stringifyPushQueue(queue: PushQueueItem[]) {
  return JSON.stringify(queue.filter((item) => isReadablePushBody(item.body)).slice(-30));
}

async function readExistingPushState() {
  const { data } = await supabaseAdmin!
    .from("push_state")
    .select("last_push_body")
    .eq("id", "default")
    .maybeSingle();

  return data?.last_push_body || "";
}

async function appendPushQueue(body: string, source: string, createdAt: string) {
  const cleanBody = cleanText(body, 500);
  if (!cleanBody || !isReadablePushBody(cleanBody)) return undefined;

  const existingRaw = await readExistingPushState();
  const queue = parsePushQueue(existingRaw);
  const nextQueue = [
    ...queue,
    {
      id: makePushId(),
      body: cleanBody,
      createdAt,
      source,
    },
  ].slice(-30);

  return stringifyPushQueue(nextQueue);
}

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: "Supabase admin이 설정되지 않았습니다." }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from("push_state")
      .select("last_push_body, last_assistant_at, updated_at, nag_level, memory_summary, relationship_log, last_user_message, route_label, stats_summary, last_scene")
      .eq("id", "default")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const pushQueue = parsePushQueue(data?.last_push_body || "");
    const lastItem = pushQueue[pushQueue.length - 1];

    return NextResponse.json({
      ok: true,
      lastPushBody: lastItem?.body || "",
      pushQueue,
      lastAssistantAt: data?.last_assistant_at || lastItem?.createdAt || "",
      updatedAt: data?.updated_at || "",
      nagLevel: data?.nag_level ?? 0,
      memorySummary: data?.memory_summary || "",
      relationshipLog: data?.relationship_log || "",
      lastUserMessage: data?.last_user_message || "",
      routeLabel: data?.route_label || "",
      statsSummary: data?.stats_summary || "",
      lastScene: data?.last_scene || "",
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "push state를 읽지 못했습니다." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false, error: "Supabase admin이 설정되지 않았습니다." }, { status: 500 });
    }

    const body = (await req.json().catch(() => ({}))) as PushStateBody;
    const type = body?.type || "user_message";
    const now = new Date().toISOString();

    const updateData: Record<string, any> = {
      id: "default",
      updated_at: now,
    };

    if (type === "user_message") {
      updateData.last_user_at = now;
      updateData.nag_level = 0;
    } else {
      updateData.last_assistant_at = now;
      const queued = await appendPushQueue(body.lastAssistantMessage || "", "assistant_message", now);
      if (queued !== undefined) updateData.last_push_body = queued;
    }

    const memorySummary = cleanText(body.memorySummary, 3500);
    const recentHistory = cleanRecentHistory(body.recentHistory);
    const relationshipLog = recentHistory || cleanRelationshipLog(body.relationshipLog);
    const lastUserMessage = cleanText(body.lastUserMessage, 500);
    const routeLabel = cleanText(body.routeLabel, 300);
    const statsSummary = cleanText(body.statsSummary, 300);
    const lastScene = cleanText(body.lastScene, 300);

    if (memorySummary !== undefined) updateData.memory_summary = memorySummary;
    if (relationshipLog !== undefined) updateData.relationship_log = relationshipLog;
    if (lastUserMessage !== undefined) updateData.last_user_message = lastUserMessage;
    if (routeLabel !== undefined) updateData.route_label = routeLabel;
    if (statsSummary !== undefined) updateData.stats_summary = statsSummary;
    if (lastScene !== undefined) updateData.last_scene = lastScene;

    const { error } = await supabaseAdmin.from("push_state").upsert(updateData, { onConflict: "id" });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "push state를 저장하지 못했습니다." }, { status: 500 });
  }
}
