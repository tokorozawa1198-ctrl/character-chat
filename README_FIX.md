# 근떡존 앱 수정본 사용법

## 1) 설치
```bash
npm install
npm run dev
```

## 2) 배포 전 확인
```bash
npm run build
```

## 3) Vercel 환경변수
Vercel > Project Settings > Environment Variables 에 아래를 추가하세요.

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
OPENAI_TTS_MODEL=tts-1
OPENAI_TTS_VOICE=onyx
```

## 4) 고친 점
- package.json의 `latest` 제거. Next 14 + React 18 + Tailwind 3 조합으로 고정.
- Tailwind 4 PostCSS 충돌 가능성 제거.
- `/api/chat`을 실제 OpenAI Responses API로 연결. 키가 없어도 로컬 답변으로 앱이 죽지 않음.
- `/api/tts`를 실제 OpenAI TTS로 연결. 키가 없거나 실패하면 조용히 음성 없이 진행.
- `/api/image`는 앱 안의 기존 일러스트를 상황별로 골라 보내게 수정.
- layout 타입 안정화.
