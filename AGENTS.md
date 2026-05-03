# AGENTS.md - 떡존이 Vibe Coding Harness

## 먼저 보완할 보안 포인트
- 서버 전용 키 분리: `DEEPSEEK_API_KEY`, `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET`는 반드시 서버에서만 사용한다.
- 브라우저 공개값 최소화: `NEXT_PUBLIC_*`에는 정말 공개 가능한 값만 둔다.
- 대화 로그 최소 저장: 실사용자 대화 전문, provider raw response, 긴 system prompt는 운영 로그에 남기지 않는다.
- 입력 검증과 길이 제한: `/api/chat`, `/api/tts`, `/api/push/*`에 request body 길이 제한과 기본 검증을 둔다.
- 재촉/푸시 남용 방지: rate limit, nag 간격 제한, abuse 방어를 둔다.
- 크론 보호: 푸시 검사나 예약 호출 route는 `CRON_SECRET` 검증 없이 열지 않는다.
- 배포 전 점검: `.env.local`, `.vercel`, `.next`, 백업 폴더가 git이나 배포 대상에 섞이지 않게 한다.

## Project Identity
- 프로젝트 이름: 떡존이
- 프로젝트 목표: AI 채팅 및 미연시
- 프로젝트 방향성: 미연시처럼 시나리오가 존재하고, AI와 자유롭게 대화가 가능하며, Vercel로 운영하는 인터렉티브 대화 서비스
- 하네스 고정:
  - 스파게티 코드 금지
  - 한 번에 많은 범위의 코딩 금지

## Product Shape
- 시나리오 진행과 자유 대화가 함께 존재한다.
- 근떡존과의 관계 변화가 수치, 루트, 기억으로 누적된다.
- 단순 챗봇이 아니라 “추억이 쌓이는 인터렉티브 미연시”를 목표로 한다.
- 운영 대상은 Vercel 프로덕션 환경이다.

## Current Stack
- Next.js App Router
- React + TypeScript
- Tailwind CSS
- DeepSeek / OpenAI API
- Supabase
- Web Push
- Vercel

## Operating Principles
- 변경은 항상 작고 리뷰 가능한 단위로 나눈다.
- 한 번에 하나의 문제 축만 다룬다. 예: 채팅 API, 시나리오 엔진, 푸시, UI.
- 기존 패턴을 우선 사용하고, 새 추상화는 정말 필요할 때만 추가한다.
- 사용자가 이미 만든 로컬 변경은 절대 함부로 되돌리지 않는다.
- 한국어 UX를 기본값으로 유지한다.
- “돌아가게만 만드는 임시 땜빵”보다, 읽히고 유지 가능한 구조를 우선한다.

## Required Workflow
1. 수정할 구간을 먼저 읽는다.
2. 무엇을 바꿀지 짧게 말하고 들어간다.
3. 필요한 파일만 최소 범위로 수정한다.
4. 가능한 가장 좁은 검증부터 돌린다.
5. 무엇을 바꿨고, 무엇을 검증했고, 무엇이 아직 위험한지 보고한다.

## Scope Guardrails
- 한 번의 작업에서 여러 큰 영역을 동시에 뒤집지 않는다.
- 디자인 정리, API 동작 변경, 데이터 마이그레이션, 프롬프트 재작성은 가능하면 분리한다.
- 컴포넌트가 커지면 UI, 상태, 헬퍼를 분리한다.
- 시나리오 데이터와 런타임 로직은 가능하면 분리한다.
- 백업 폴더를 실제 운영 경로에 섞지 않는다.

## Architecture Expectations
- `app/page.tsx`: 페이지 조합, 뷰 전환, 클라이언트 상호작용
- `app/api/*/route.ts`: 서버 전용 API 경계, 검증, provider 호출
- `app/gameData.ts`: 시나리오 데이터, 액션 데이터, 프로필/퀵리플라이
- `app/gameTypes.ts`: 도메인 타입
- `public/*`: 실제 서비스에 쓰는 정적 에셋만 둔다

## AI Chat Rules
- 캐릭터 프롬프트는 절대 임의 축약, 순화, 자체검열, 삭제하지 않는다. 특히 근떡존의 감정선, 질투선, 집착선, 말투 결을 안전 명목으로 무디게 만들면 안 된다.
- provider key는 서버 route에서만 사용한다.
- request body는 trim, 길이 제한, 기본 검증 후 provider로 넘긴다.
- history 길이와 각 메시지 길이는 제한한다.
- system prompt는 섹션별로 읽히게 유지한다.
- 같은 표현 반복, 로봇 같은 재촉 문구, 뜬금없는 주제 전환을 피한다.
- 시나리오 상태, 루트, 기억 노트는 대화에 반영하되, critical route state를 대화만으로 암묵 변경하지 않는다.

## Scenario / VN Rules
- 장면 데이터는 가능한 데이터 중심으로 유지한다.
- 선택지 수치 변화는 명시적이어야 한다.
- 엔딩과 루트는 UI 문구가 아니라 안정적인 id로 관리한다.
- AI 자유 대화는 시나리오와 연결되되, 시나리오를 망가뜨리면 안 된다.
- 나레이션은 매 대화마다가 아니라, 장면 전환이나 시간/장소 설명이 꼭 필요할 때만 쓴다.

## Vercel Operation Notes
- 프로덕션 env는 반드시 Vercel Project Settings에 설정한다.
- `NEXT_PUBLIC_*`는 브라우저 노출값만 허용한다.
- cron route는 secret 검증 없이 열지 않는다.
- 운영 로그는 redaction 기준으로 최소화한다.

## Verification
- 배포 전 가능하면 `npm run build`를 돌린다.
- 프론트 변경은 데스크톱/모바일 둘 다 직접 본다.
- API 변경은 성공 경로, env 누락, 잘못된 body 경로를 최소한 확인한다.

## Do Not Do
- `.env.local`, `.vercel`, `.next`, `node_modules`, 백업 에셋 폴더를 커밋하지 않는다.
- 좁은 버그 수정 중 대규모 리라이트를 하지 않는다.
- 빈 `catch {}`로 오류를 숨기지 않는다.
- 사용자/세션 데이터를 전역 mutable state로 관리하지 않는다.
- provider secret을 클라이언트로 보내지 않는다.
