# SECURITY.md - 떡존이 보안 보완 사항

## 우선순위 높은 보안 보완
- 서버 전용 키 분리
  - `DEEPSEEK_API_KEY`
  - `OPENAI_API_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `VAPID_PRIVATE_KEY`
  - `CRON_SECRET`
  - 위 값은 반드시 서버에서만 사용한다.

- 브라우저 공개값 최소화
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` 정도만 공개 허용
  - 다른 민감값은 절대 `NEXT_PUBLIC_*`로 두지 않는다.

- 운영 로그 최소화
  - 채팅 전문
  - system prompt 전문
  - provider raw response
  - 사용자 민감 정보
  - 위 내용은 production 로그에 남기지 않는다.

- 입력 검증
  - `/api/chat`, `/api/tts`, `/api/push/*`는 길이 제한과 기본 검증을 둔다.
  - 깨진 문자나 비정상 payload는 저장 전에 걸러낸다.

- rate limit / abuse 방지
  - 공개 전 chat, tts, push route에 최소한의 rate limit을 붙인다.
  - 읽씹 재촉이나 푸시 생성은 간격 제한이 있어야 한다.

- 크론 보호
  - Vercel Cron이나 외부 scheduler가 호출하는 route는 `CRON_SECRET` 검증을 통과해야 한다.

- Supabase 권한 분리
  - service role key는 서버 route에서만 사용한다.
  - 클라이언트로는 anon/public 범위만 노출한다.

- push 구독 데이터 최소 저장
  - endpoint, key 같은 최소 정보만 저장한다.
  - 민감한 대화 전문과 직접 결합하지 않는다.

- 민감한 로맨스/집착 표현 안전장치
  - 서사적 표현은 허용하되, 현실 스토킹/감금/강압 가이드를 제공하지 않도록 주의한다.

## Launch Gate
- `.env.local`이 git에 포함되지 않는지 확인
- `.vercel`, `.next`, 백업 폴더가 커밋/배포 대상에 섞이지 않는지 확인
- Vercel Production / Preview / Development env 분리 확인
- `/api/chat`, `/api/tts`, `/api/push/*`의 missing-env 경로 확인
- cron secret 없이 push check route가 열리지 않는지 확인
- production에서 raw response logging이 없는지 확인

## Future Hardening
- 사용자/세션/IP 단위 rate limit
- provider 비용 상한 및 토큰 사용량 모니터링
- chat memory redaction
- moderation / policy classifier 보강
- redacted audit log 도입
