# 떡존이

AI 채팅 + 미연시형 인터렉티브 대화 서비스 프로젝트.

근떡존과 자유롭게 대화할 수 있고, 시나리오 진행과 루트 분기, CG, 상태 변화, 푸시/선톡 흐름을 함께 다루는 것을 목표로 한다. 운영 대상은 Vercel이다.

## 가장 중요한 원칙

이 프로젝트에서 가장 중요한 것은 **캐릭터 설정을 절대 훼손하지 않는 것**이다.

특히 아래는 금지 원칙으로 본다.

- 캐릭터 프롬프트를 멋대로 축약하거나 성격을 납작하게 만드는 것
- OpenAI 취향에 맞춘 순화, 자체검열, 불필요한 삭제
- 근떡존 말투/감정선/집착선/질투선/서사 결을 임의로 무디게 만드는 것
- “안전하게 보이게” 하려고 캐릭터 개성을 평범한 챗봇처럼 바꾸는 것

이 프로젝트는 OpenAI 전용 서비스가 아니며, provider가 바뀌더라도 **캐릭터 본체는 유지**되어야 한다.

즉, 모델 교체나 API 변경보다 캐릭터 보존이 우선이다.

## 프로젝트 목표

- AI 채팅 및 미연시
- 시나리오 기반 관계 진행
- 자유 대화와 축적되는 추억
- 루트 분기와 엔딩 구조
- Vercel 배포 기반 인터렉티브 서비스

## 개발 하네스

- 스파게티 코드 금지
- 한 번에 많은 범위의 코딩 금지
- 작은 범위씩 읽고, 수정하고, 검증하기
- 기존 캐릭터 설정과 서사를 먼저 확인하고 수정하기

## 현재 기술 스택

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- DeepSeek / OpenAI API
- Supabase
- Web Push
- Vercel

## 로컬 실행

```bash
npm install
copy .env.example .env.local
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 확인.

## 현재 실제 폴더 구조

- `app/page.tsx`
  - 메인 클라이언트 UI, 홈/채팅/시나리오/상태/갤러리 전환
- `app/gameData.ts`
  - 시나리오, 액션, 프로필, 퀵리플라이, 이미지 풀
- `app/gameTypes.ts`
  - 공통 타입
- `app/api/chat/route.ts`
  - AI 채팅 응답, 기억/관계 맥락 반영
- `app/api/push/*`
  - 선톡, 읽씹 재촉, push state 저장, 구독 관리
- `app/api/tts/route.ts`
  - 음성 합성
- `app/api/image/route.ts`
  - 이미지 관련 API
- `public/*`
  - 실제 서비스에 쓰는 배경, CG, SD 캐릭터, 커버 이미지
- `AGENTS.md`
  - 이 프로젝트에서 지켜야 할 작업 원칙과 하네스
- `PROJECT_SETUP.md`
  - 로컬 실행 / env / 배포 세팅 메모
- `SECURITY.md`
  - 보안 우선 체크리스트

## 정리 원칙

- `app_backup_*`, `public_backup_*`, `README_APPLY.txt`, `README_FIX.md` 같은 백업/수리용 파일은 **작업 참고용으로만 로컬에 남기고, git 추적에서는 제외**한다.
- 운영 코드와 백업 코드를 같은 배포 경로에 섞지 않는다.

## 운영 원칙

- 서버 전용 키는 반드시 서버 route에서만 사용
- 대화 로그/프롬프트/raw response는 운영 로그에 최소화
- 푸시/읽씹 로직도 최근 대화 맥락을 이어야 함
- 시나리오와 자유 대화는 연결되되, 캐릭터 붕괴 없이 유지되어야 함

## 배포

배포 대상은 Vercel.

배포 전 최소 확인:

```bash
npm run build
```

그리고 Production 환경변수가 모두 들어갔는지 확인한다.

## 관련 문서

- [AGENTS.md](C:\Users\ximen\character-chat\AGENTS.md)
- [PROJECT_SETUP.md](C:\Users\ximen\character-chat\PROJECT_SETUP.md)
- [SECURITY.md](C:\Users\ximen\character-chat\SECURITY.md)
