import { NextResponse } from "next/server";
import webpush from "web-push";
import { supabaseAdmin } from "../supabase";

export async function POST() {
  try {
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

    const { data, error } = await supabaseAdmin
      .from("push_subscriptions")
      .select("id, endpoint, subscription")
      .order("updated_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data?.length) {
      return NextResponse.json(
        { ok: false, error: "Supabase에 저장된 구독이 없습니다. 먼저 폰에서 푸시 구독을 눌러주세요." },
        { status: 400 }
      );
    }

    const payload = JSON.stringify({
      title: "근떡존",
      body: "주인님? Supabase 저장 푸시 테스트예요. 이제 안 날아가요 ㅋㅋ",
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
      await supabaseAdmin
        .from("push_subscriptions")
        .delete()
        .in("id", expiredIds);
    }

    return NextResponse.json({
      ok: true,
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