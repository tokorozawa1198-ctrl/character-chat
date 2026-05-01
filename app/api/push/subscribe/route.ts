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

    const subscription = await req.json();

    if (!subscription?.endpoint) {
      return NextResponse.json(
        { ok: false, error: "subscription endpoint 없음" },
        { status: 400 }
      );
    }

    const userAgent = req.headers.get("user-agent") || "";

    const { error } = await supabaseAdmin
      .from("push_subscriptions")
      .upsert(
        {
          endpoint: subscription.endpoint,
          subscription,
          user_agent: userAgent,
          updated_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        },
        {
          onConflict: "endpoint",
        }
      );

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "푸시 구독이 Supabase에 저장됐어요.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "subscribe 실패" },
      { status: 500 }
    );
  }
}