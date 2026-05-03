# PROJECT_SETUP.md - 떡존이 프로젝트 세팅

## 프로젝트 개요
- 프로젝트 이름: 떡존이
- 제품 형태: AI 채팅 + 미연시형 인터렉티브 대화 서비스
- 운영 대상: Vercel
- 개발 원칙:
  - 스파게티 코드 금지
  - 한 번에 많은 범위의 코딩 금지
  - 작은 범위씩 읽고, 고치고, 검증하기

## 먼저 보완할 점
1. API route별 입력 검증 공통화
2. 채팅/푸시 rate limit 추가
3. 백업 폴더와 운영 에셋 분리
4. 긴 프롬프트를 별도 모듈로 분리
5. 저장 데이터(localStorage / push_state) 깨짐 방지용 sanitization 일관화

## 로컬 실행
```bash
npm install
copy .env.example .env.local
npm run dev
```

브라우저에서 `http://localhost:3000` 확인

## 필수 환경변수
- `DEEPSEEK_API_KEY`: AI 채팅
- `OPENAI_API_KEY`: TTS / 푸시 재촉 생성
- `OPENAI_TTS_MODEL`
- `OPENAI_TTS_VOICE`
- `PUSH_NAG_MODEL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `CRON_SECRET`

## Vercel 세팅
1. Vercel 프로젝트를 생성하거나 link한다.
2. 위 환경변수를 Vercel Project Settings > Environment Variables에 모두 설정한다.
3. 서버 전용 값이 `NEXT_PUBLIC_*`로 들어가지 않았는지 확인한다.
4. cron route는 `CRON_SECRET` 검증이 준비된 뒤에만 연다.
5. 가능하면 배포 전 `npm run build`를 통과시킨다.

## 추천 코드 경계
- `app/page.tsx`: 페이지 조합 / 클라이언트 상태 / 뷰 전환
- `app/api/chat/route.ts`: 채팅 provider 호출
- `app/api/tts/route.ts`: TTS
- `app/api/push/*`: 푸시 관련
- `app/gameData.ts`: 시나리오 / 액션 / 프로필 / 대사용 데이터
- `app/gameTypes.ts`: 공통 타입
- `public/*`: 실제 배포용 정적 파일

## 바이브 코딩 하네스
- 작업 전: “이번엔 어디만 손볼지” 정한다.
- 작업 중: 필요한 파일만 최소 수정한다.
- 작업 후: 가장 좁은 검증부터 돌린다.
- 작업이 여러 영역으로 번지기 시작하면 한 번 멈추고 다시 나눈다.

## 첫 기술 백로그
- 채팅 기억/추억 시스템을 별도 메모리 모듈로 정리
- route.ts 내 긴 프롬프트를 분리 가능한 형태로 정리
- push_state / localStorage 저장 포맷 버전 관리 강화
- 모바일 UI 상단 정보량 재조정
- 백업 폴더를 배포 경로에서 완전히 분리
