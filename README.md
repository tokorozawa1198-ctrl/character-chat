# Refactored Geuntteokjon Chat

이 폴더를 Next.js 프로젝트 기준으로 복사해서 쓰면 됩니다.

## 구조
- `app/page.tsx`: 화면/UI와 React 상태만 담당
- `app/_game/types.ts`: 공통 타입
- `app/_game/data/character.ts`: 프로필, 이미지, 액션 데이터
- `app/_game/data/datingEvents.ts`: 미연시 이벤트 데이터
- `app/_game/engine/gameEngine.ts`: 친밀도 계산, 이벤트 트리거, 이미지 판단 로직

## 주의
- 기존 `/api/chat`, `/api/image`, `/api/tts`는 그대로 있어야 합니다.
- `/public/oppa*.png` 이미지들도 기존처럼 있어야 합니다.
