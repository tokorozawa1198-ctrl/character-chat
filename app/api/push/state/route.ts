import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../supabase";

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { ok: false, error: "Supabase 환경변수가 없습니다." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const type = body?.type || "user_message";

    const updateData =
      type === "user_message"
        ? {
            id: "default",
            last_user_at: new Date().toISOString(),
            nag_level: 0,
            updated_at: new Date().toISOString(),
          }
        : {
            id: "default",
            last_assistant_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

    const { error } = await supabaseAdmin
      .from("push_state")
      .upsert(updateData, { onConflict: "id" });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "push state 저장 실패" },
      { status: 500 }
    );
  }
}