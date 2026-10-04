// 메모리 API 보호용 토큰 검증. 서버 전용.
// D안 (단일 토큰 게이트): MEMORY_ADMIN_TOKEN 하나로 통합. 본인만 수동/자동 추출/메모리 주입 사용 가능.
// 친구 등 다른 사용자는 토큰 없으니 메모리 시스템 자체에 접근 못 함.
// sendBeacon은 헤더를 못 붙이므로 body.token fallback도 인정한다.

import { NextRequest, NextResponse } from "next/server";

export function getExpectedAdminToken(): string | null {
  return process.env.MEMORY_ADMIN_TOKEN || null;
}

export function checkMemoryToken(req: NextRequest): NextResponse | null {
  const expected = getExpectedAdminToken();
  if (!expected) {
    return NextResponse.json(
      { error: "MEMORY_ADMIN_TOKEN env not configured." },
      { status: 503 },
    );
  }
  const got = req.headers.get("x-memory-token") || "";
  if (got !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

/** body fallback까지 허용하는 버전 (sendBeacon 용) */
export function checkMemoryTokenWithBody(req: NextRequest, body: any): NextResponse | null {
  const expected = getExpectedAdminToken();
  if (!expected) {
    return NextResponse.json(
      { error: "MEMORY_ADMIN_TOKEN env not configured." },
      { status: 503 },
    );
  }
  const headerToken = req.headers.get("x-memory-token") || "";
  const bodyToken = body && typeof body.token === "string" ? body.token : "";
  const got = headerToken || bodyToken;
  if (got !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

/** 채팅 라우트 등에서 비-필수 메모리 주입 결정용. 토큰 일치하면 true. 없으면 false (오류 아님). */
export function hasValidAdminToken(req: NextRequest): boolean {
  const expected = getExpectedAdminToken();
  if (!expected) return false;
  return (req.headers.get("x-memory-token") || "") === expected;
}
