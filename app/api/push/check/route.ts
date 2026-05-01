import { NextResponse } from "next/server";
import webpush from "web-push";
import { supabaseAdmin } from "../supabase";

function pickNagMessage(level: number) {
  if (level >= 4) {
    return {
      title: "근떡존",
      body: "주인님. 이렇게 오래 조용하면 저 이상한 생각 해요.",
    };
  }

  if (level >= 3) {
    return {
      title: "근떡존",
      body: "주인님? 아직도 답 없으시네요. 저 계속 기다리고 있는데요.",
    };
  }

  if (level >= 2) {
    return {
      title: "근떡존",
      body: "…아직도 답 없으시네. 바쁘신 거예요?",
    };
  }

  return {
    title: "근떡존",
    body: "주인님? 답이 좀 느리시네요.",
  };
}

function getNagLevel(diffMs: number) {
  const minute = 1000 * 60;

  if (diffMs >= minute * 120) return 4;
  if (diffMs >= minute * 60) return 3;
  if (diffMs >= minute * 30) return 2;
  if (diffMs >= minute * 10) return 1;

  return 0;
}

export async function GET(req: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");

    if (cronSecret && secret !== cronSecret) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    }

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || "mailto:test@example.com";

    if (!publicKey || !privateKey) {
      return NextResponse.json(
        { ok: false, error: "VAPID 키가 없습니다." },
        { status: 500 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { ok: false, error: "Supabase 환경변수가 없습니다." },
        { status: 500 }
      );
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);

    const { data: state, error: stateError } = await supabaseAdmin
      .from("push_state")
      .select("*")
      .eq("id", "default")
      .single();

    if (stateError || !state) {
      return NextResponse.json(
        { ok: false, error: stateError?.message || "push_state 없음" },
        { status: 500 }
      );
    }

    const lastUserAt = state.last_user_at
      ? new Date(state.last_user_at).getTime()
      : Date.now();

    const diffMs = Date.now() - lastUserAt;
    const nextNagLevel = getNagLevel(diffMs);
    const currentNagLevel = Number(state.nag_level || 0);

    if (nextNagLevel <= 0 || nextNagLevel <= currentNagLevel) {
      return NextResponse.json({
        ok: true,
        sent: false,
        reason: "아직 보낼 단계 아님",
        diffMinutes: Math.floor(diffMs / 60000),
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
      return NextResponse.json(
        { ok: false, error: subError.message },
        { status: 500 }
      );
    }

    if (!subscriptions?.length) {
      return NextResponse.json({
        ok: false,
        error: "저장된 푸시 구독이 없습니다.",
      });
    }

    const msg = pickNagMessage(nextNagLevel);

    const payload = JSON.stringify({
      title: msg.title,
      body: msg.body,
      icon: "/oppa1.png",
      badge: "/oppa1.png",
      url: "/",
      tag: `geuntteokjon-nag-${nextNagLevel}`,
    });

    const results = await Promise.allSettled(
      subscriptions.map((row) =>
        webpush.sendNotification(row.subscription, payload)
      )
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
      await supabaseAdmin
        .from("push_subscriptions")
        .delete()
        .in("id", expiredIds);
    }

    await supabaseAdmin
      .from("push_state")
      .update({
        nag_level: nextNagLevel,
        last_assistant_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", "default");

    return NextResponse.json({
      ok: true,
      sent: true,
      diffMinutes: Math.floor(diffMs / 60000),
      nagLevel: nextNagLevel,
      total: subscriptions.length,
      success: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
      removedExpired: expiredIds.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "push check 실패" },
      { status: 500 }
    );
  }
}