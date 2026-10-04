// PATCH  /api/memory/:id   { text }   → 텍스트 수정
// DELETE /api/memory/:id              → 삭제

import { NextRequest, NextResponse } from "next/server";
import { checkMemoryToken } from "../auth";
import { deleteMemory, updateMemory } from "../store";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const denied = checkMemoryToken(req);
  if (denied) return denied;

  const id = params?.id;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }
  const text = String(body?.text ?? "").trim();
  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });

  const updated = await updateMemory(id, text);
  if (!updated) return NextResponse.json({ error: "update failed" }, { status: 500 });
  return NextResponse.json({ memory: updated });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = checkMemoryToken(req);
  if (denied) return denied;

  const id = params?.id;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const ok = await deleteMemory(id);
  if (!ok) return NextResponse.json({ error: "delete failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
