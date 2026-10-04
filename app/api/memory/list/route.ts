// GET  /api/memory/list           → 최근 30개 (관리 UI용)
// POST /api/memory/list           → 수동 메모리 추가 (관리 UI에서 직접 적는 케이스)

import { NextRequest, NextResponse } from "next/server";
import { checkMemoryToken } from "../auth";
import { insertMemory, listMemories, type MemoryKind } from "../store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const denied = checkMemoryToken(req);
  if (denied) return denied;

  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") ?? "30");
  const memories = await listMemories(Number.isFinite(limit) ? limit : 30);
  return NextResponse.json({ memories });
}

export async function POST(req: NextRequest) {
  const denied = checkMemoryToken(req);
  if (denied) return denied;

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }

  const text = String(body?.text ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }
  const kind = (body?.kind ?? null) as MemoryKind | null;
  const chapter =
    typeof body?.chapter === "number" && Number.isFinite(body.chapter)
      ? body.chapter
      : null;

  const inserted = await insertMemory({
    text,
    kind,
    chapter,
    source: "manual",
  });
  if (!inserted) {
    return NextResponse.json({ error: "insert failed" }, { status: 500 });
  }
  return NextResponse.json({ memory: inserted });
}
