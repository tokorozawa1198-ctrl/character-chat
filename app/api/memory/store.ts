// 떡존이 영구 메모리 스토어 (Supabase oppa_memories 테이블)
// 서버 전용. 클라이언트에서 직접 import 금지.

import { supabaseAdmin } from "../push/supabase";

export type MemoryKind =
  | "promise"
  | "affection"
  | "boundary"
  | "jealousy"
  | "story"
  | "emotion";

export type MemorySource = "auto" | "manual";

export type MemoryRow = {
  id: string;
  text: string;
  kind: MemoryKind | null;
  chapter: number | null;
  source: MemorySource;
  created_at: string;
};

export type MemoryInsert = {
  text: string;
  kind?: MemoryKind | null;
  chapter?: number | null;
  source?: MemorySource;
};

const TABLE = "oppa_memories";

function ensureClient() {
  if (!supabaseAdmin) {
    throw new Error("Supabase 클라이언트가 초기화되지 않았습니다 (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 확인).");
  }
  return supabaseAdmin;
}

/** 시간순(최신→과거) 메모리 N개 반환 */
export async function listMemories(limit = 30): Promise<MemoryRow[]> {
  try {
    const client = ensureClient();
    const { data, error } = await client
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(Math.max(1, Math.min(200, limit)));
    if (error) {
      console.warn("[memory] list error:", error.message);
      return [];
    }
    return (data ?? []) as MemoryRow[];
  } catch (e) {
    console.warn("[memory] list exception:", e);
    return [];
  }
}

/** 새 메모리 삽입. text가 빈 문자열이면 skip하고 null 반환 */
export async function insertMemory(input: MemoryInsert): Promise<MemoryRow | null> {
  const text = (input.text || "").trim().slice(0, 500);
  if (!text) return null;
  try {
    const client = ensureClient();
    const { data, error } = await client
      .from(TABLE)
      .insert({
        text,
        kind: input.kind ?? null,
        chapter: input.chapter ?? null,
        source: input.source ?? "auto",
      })
      .select()
      .single();
    if (error) {
      console.warn("[memory] insert error:", error.message);
      return null;
    }
    return data as MemoryRow;
  } catch (e) {
    console.warn("[memory] insert exception:", e);
    return null;
  }
}

/** 메모리 텍스트 수정 */
export async function updateMemory(id: string, text: string): Promise<MemoryRow | null> {
  const cleaned = (text || "").trim().slice(0, 500);
  if (!cleaned) return null;
  try {
    const client = ensureClient();
    const { data, error } = await client
      .from(TABLE)
      .update({ text: cleaned })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.warn("[memory] update error:", error.message);
      return null;
    }
    return data as MemoryRow;
  } catch (e) {
    console.warn("[memory] update exception:", e);
    return null;
  }
}

/** 메모리 삭제 */
export async function deleteMemory(id: string): Promise<boolean> {
  try {
    const client = ensureClient();
    const { error } = await client.from(TABLE).delete().eq("id", id);
    if (error) {
      console.warn("[memory] delete error:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("[memory] delete exception:", e);
    return false;
  }
}

/** 시스템 프롬프트에 끼워넣을 형식으로 변환. 시간순(과거→최신)으로 뒤집어서 출력 */
export function formatMemoriesForPrompt(memories: MemoryRow[]): string {
  if (!memories.length) return "";
  const reversed = [...memories].reverse(); // 과거 → 최신
  const lines = reversed.map((m) => {
    const date = m.created_at ? new Date(m.created_at).toISOString().slice(0, 10) : "";
    const tag = m.kind ? `[${m.kind}]` : "";
    return `- ${date} ${tag} ${m.text}`.replace(/\s+/g, " ").trim();
  });
  return [
    "[떡존이의 누적 기억]",
    "아래는 떡존이가 주인님과 지내며 마음에 새겨둔 사건/감정들이다.",
    "대화 흐름에서 자연스럽게 떠올라야 한다. 회상이 어울리는 맥락에서만 한 번씩 꺼내라. 매번 언급하지 말 것.",
    ...lines,
  ].join("\n");
}
