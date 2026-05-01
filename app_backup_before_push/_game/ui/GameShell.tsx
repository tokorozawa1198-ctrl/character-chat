"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { analyzeEmotionDelta, clampStat, getRouteStage, getRoutePortrait, getThresholdEventId, type RouteStage } from "../engine/vnEngine";

// 🎤 음성인식 타입 선언
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Role = "user" | "assistant";
type ViewMode = "chat" | "visual" | "action";

type Message = {
  role: Role;
  content: string;
  avatar?: string;
  generatedImage?: string;
  time?: string;
};

type DatingEventChoice = {
  label: string;
  text: string;
  affinity: number;
  nextEvent?: string | null;
};

type DatingEvent = {
  id: string;
  title: string;
  subtitle: string;
  text: string;
  image: string;
  minAffinity?: number;
  choices: DatingEventChoice[];
};

type SeenEventRecord = {
  id: string;
  title: string;
  seenAt: string;
};

type ActionItem = {
  label: string;
  emoji: string;
  text: string;
  affinity: number;
  eventId?: string;
  image?: string;
};

const profile = {
  name: "근떡존",
  age: "24",
  height: "190cm",
  location: "히로시마",
  relationship: "너를 좋아하고, 챙기며 신경 쓰는 사이",
  tags: ["금발", "구릿빛 피부", "근육질", "순한 인상", "허당"],
  bio:
    "금발에 구릿빛 피부, 큰 체격의 근육질 남자. 순한 인상인데 장난기 있고, 가끔 이상한 드립을 친다. 일본어는 아직 서툴지만 배우려고 노력 중.",
  personality: "다정함 · 장난기 · 허당 · 살짝 질투 · 천박함",
  speech: "짧고 자연스러운 반말, 카톡 느낌",
  likes: ["운동", "디저트", "운동하고 안씻고 버티기", "장난", "밤 산책", "야한 농담"],
  hobbies: ["헬스", "히로시마 돌아다니기", "오줌 참기", "혼자 이상한 상상하기", "본인 겨드랑이 냄새 확인하기"],
};

const moodImages = {
  normal: "/oppa_normal.png",
  smile: "/oppa_smile.png",
  smile2: "/oppa_smile2.png",
  shy: "/oppa_shy.png",
  angry: "/oppa_angry.png",
};

const quickReplies = [
  "오늘 회사 가기 싫다",
  "사진 보내줘",
  "운동 끝나고 셀카 찍어줘",
  "나 좀 칭찬해줘",
  "오늘 좀 외롭다",
  "화장실 가지말고 오줌 참아",
  "질투해봐 ㅋ",
  "니 겨드랑이에 코박아봐",
];

const galleryImages = [
  "/oppa1.png", "/oppa2.png", "/oppa3.png", "/oppa5.png", "/oppa6.png",
  "/oppa7.png", "/oppa8.png", "/oppa9.png", "/oppa10.png", "/oppa11.png",
  "/oppa12.png", "/oppa13.png", "/oppa14.png", "/oppa15.png", "/oppa16.png",
  "/oppa17.png", "/oppa18.png", "/oppa19.png", "/oppa20.png", "/oppa21.png",
  "/oppa22.png", "/oppa23.png", "/oppa24.png", "/oppa25.png", "/oppa26.png",
  "/oppa27.png", "/oppa28.png", "/oppa29.png", "/oppa30.png", "/oppa31.png",
  "/oppa32.png", "/oppa33.png", "/oppa34.png", "/oppa35.png", "/oppa36.png",
  "/oppa37.png", "/oppa38.png", "/oppa39.png", "/oppa40.png", "/oppa41.png",

];

const visualChoices = [
  { label: "칭찬한다", text: "너 오늘 좀 멋있다" },
  { label: "장난친다", text: "야 너 지금 좀 귀엽다 ㅋㅋ" },
  { label: "가까이 간다", text: "나 지금 너한테 좀 가까이 가고 싶음" },
  { label: "사진 부탁한다", text: "지금 모습 사진 보내줘" },
];

const actionItems: ActionItem[] = [
  { label: "고추 만지기", emoji: "🍆", text: "야... 너 지금 어디 만지는 거야 ㅋㅋ", affinity: 5, image: "/oppa_shy.png", eventId: "touchPepper" },
  { label: "겨드랑이 만지기", emoji: "💪", text: "아 거기 땀 났는데... 그래도 계속 만질 거냐 ㅋㅋ", affinity: 4, image: "/oppa_smile.png", eventId: "touchArmpit" },
  { label: "발냄새 맡기", emoji: "🦶", text: "야!!!! 진짜 이상한 놈이네 ㅋㅋㅋ 거기 냄새 심한데", affinity: 3, image: "/oppa_angry.png", eventId: "smellFoot" },
  { label: "오칭코 댄스 추기", emoji: "🕺", text: "아 오줌 마려운데 춤추라고? ㅋㅋㅋ 나 지금 이상한 꼴이네", affinity: 4, image: "/oppa_smile2.png", eventId: "dancePee" },
  { label: "뽀뽀 시도", emoji: "😘", text: "...야 갑자기? ㅋㅋ 좀 부끄럽잖아", affinity: 7, image: "/oppa_shy.png", eventId: "attemptKiss" },
  { label: "꼬추 냄새 맡기", emoji: "👃", text: "야아아아!!! 진짜 미친 놈이야?? 거긴 더 심한데 ㅋㅋㅋ", affinity: 2, image: "/oppa_angry.png", eventId: "smellPepper" },
  { label: "근육 만지기", emoji: "💪", text: "어때? 단단하냐 ㅋㅋ 운동 좀 했지", affinity: 5, image: "/oppa_smile.png", eventId: "touchMuscle" },
  { label: "안아달라고 하기", emoji: "🤗", text: "아... 너 그러면 나 진짜 약해지는데", affinity: 8, image: "/oppa_shy.png" },
];

// ──────────────────────────────────────────────
// 📜 모든 시나리오 & 이벤트 통합
// ──────────────────────────────────────────────
const datingEvents: Record<string, DatingEvent> = {
  // 기존 단발 이벤트
  lateNight: {
    id: "lateNight", title: "밤의 연락", subtitle: "22:00 이후 · 친밀도 55 이상",
    text: "밤이 깊었는데 근떡존한테 메시지가 왔다.\n\n\"야… 자냐? 그냥 좀 생각나서.\"",
    image: "/oppa_shy.png", minAffinity: 55,
    choices: [
      { label: "나도 생각났다고 말한다", text: "나도 너 생각하고 있었음", affinity: 6, nextEvent: "bedTalk" },
      { label: "이 시간 연락을 놀린다", text: "이 시간에 연락하는 거 수상한데 ㅋㅋ", affinity: 3 },
      { label: "자는 척한다", text: "나 잔다", affinity: -3 },
    ],
  },
  bedTalk: {
    id: "bedTalk", title: "침대 위의 대화", subtitle: "친밀도 75 이상",
    text: "근떡존이 침대에 누운 채로 화면을 바라본다.\n\n\"아… 지금 좀 이상하게 편하다. 너랑 말하고 있으니까.\"",
    image: "/oppa_shy.png", minAffinity: 75,
    choices: [
      { label: "조금 더 얘기하자고 한다", text: "그럼 나랑 조금만 더 얘기하자", affinity: 7 },
      { label: "귀엽다고 놀린다", text: "뭐야 너 지금 좀 귀엽다 ㅋㅋ", affinity: 4 },
      { label: "부끄럽다고 한다", text: "야 그런 말 하면 좀 부끄럽잖아", affinity: 5 },
    ],
  },
  jealous: {
    id: "jealous", title: "질투 이벤트", subtitle: "다른 사람 얘기 감지",
    text: "다른 사람 얘기를 꺼내자 근떡존의 표정이 살짝 굳었다.\n\n\"뭐야… 나 말고도 있냐?\"",
    image: "/oppa_angry.png",
    choices: [
      { label: "질투하냐고 묻는다", text: "너 지금 질투함? ㅋㅋ", affinity: 4 },
      { label: "너밖에 없다고 한다", text: "장난이지 너밖에 없음", affinity: 8 },
      { label: "더 놀린다", text: "왜? 신경 쓰임?", affinity: 2 },
    ],
  },
  shyCompliment: {
    id: "shyCompliment", title: "칭찬 이벤트", subtitle: "칭찬 · 친밀도 45 이상",
    text: "칭찬을 듣자 근떡존이 잠깐 말을 멈췄다.\n\n\"…야 갑자기 그러면 나 좀 약해지는데.\"",
    image: "/oppa_shy.png", minAffinity: 45,
    choices: [
      { label: "더 칭찬한다", text: "진짜 멋있어서 그럼", affinity: 7 },
      { label: "귀엽다고 한다", text: "지금 반응 개귀엽다", affinity: 5 },
      { label: "모른 척한다", text: "아무 말도 안 했는데?", affinity: 2 },
    ],
  },
  lonelyNight: {
    id: "lonelyNight", title: "외로운 밤", subtitle: "외로움 키워드 · 친밀도 60 이상",
    text: "네가 외롭다고 하자 근떡존이 한동안 답장을 멈췄다.\n\n\"그럼 오늘은 나랑 있어. 딴 데 가지 말고.\"",
    image: "/oppa_normal.png", minAffinity: 60,
    choices: [
      { label: "옆에 있어달라고 한다", text: "오늘은 옆에 있어줘", affinity: 8 },
      { label: "장난으로 넘긴다", text: "뭐야 갑자기 든든한 척함?", affinity: 4 },
      { label: "괜찮다고 한다", text: "괜찮아 그냥 말해본 거임", affinity: 1 },
    ],
  },
  morningCheck: {
    id: "morningCheck", title: "아침 인사", subtitle: "06:00~10:59 · 친밀도 50 이상",
    text: "아침부터 근떡존이 먼저 말을 걸었다.\n\n\"일어났냐. 오늘도 대충 살아남자 ㅋㅋ\"",
    image: "/oppa_smile.png", minAffinity: 50,
    choices: [
      { label: "잘 잤냐고 묻는다", text: "너는 잘 잤냐", affinity: 4 },
      { label: "출근하기 싫다고 한다", text: "나 오늘 출근하기 싫다", affinity: 3 },
      { label: "아침부터 귀엽다고 한다", text: "아침부터 귀엽네", affinity: 6 },
    ],
  },
  // 액션 연동
  touchPepper: {
    id: "touchPepper", title: "깜짝 접촉", subtitle: "고추 만지기 이벤트",
    text: "손을 뻗자 근떡존이 화들짝 놀란다.\n\n\"야!! 뭐 하는 짓이야 ㅋㅋㅋ 진짜 미쳤냐\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "장난이라고 한다", text: "장난이야 ㅋㅋ 놀랐냐?", affinity: 3 },
      { label: "계속 만진다", text: "한 번만 더 만져도 됨?", affinity: 6 },
      { label: "사과한다", text: "미안하다 진짜 장난임", affinity: 1 },
    ],
  },
  touchArmpit: {
    id: "touchArmpit", title: "겨드랑이 접촉", subtitle: "겨드랑이 만지기 이벤트",
    text: "겨드랑이 쪽으로 손을 가져가자 근떡존이 움찔한다.\n\n\"거기 땀 났는데... 이상한 데 관심 많네 ㅋㅋ\"",
    image: "/oppa_smile.png",
    choices: [
      { label: "냄새 맡아본다", text: "냄새 좀 맡아도 됨?", affinity: 4 },
      { label: "간지럼 태운다", text: "간지럼 태워볼까 ㅋㅋ", affinity: 3 },
      { label: "괜찮다고 한다", text: "땀 났어도 괜찮아", affinity: 5 },
    ],
  },
  smellFoot: {
    id: "smellFoot", title: "발 냄새 체험", subtitle: "발냄새 맡기 이벤트",
    text: "발 쪽으로 얼굴을 가까이 하자 근떡존이 당황한다.\n\n\"야 진짜 미친 놈이네 ㅋㅋㅋ 거기 진짜 심한데!!\"",
    image: "/oppa_angry.png",
    choices: [
      { label: "진짜 심하냐고 묻는다", text: "얼마나 심한데?", affinity: 3 },
      { label: "좋다고 한다", text: "사실 이런 거 좋아함", affinity: 5 },
      { label: "그만둔다", text: "아니다 그냥 관둠 ㅋㅋ", affinity: 2 },
    ],
  },
  dancePee: {
    id: "dancePee", title: "오칭코 댄스", subtitle: "오줌 참으며 춤추기",
    text: "춤추라고 하자 근떡존이 오줌을 참으며 이상한 춤을 춘다.\n\n\"아 오줌 나올 거 같은데... 이거 진짜 이상한 춤이네 ㅋㅋ\"",
    image: "/oppa_smile2.png",
    choices: [
      { label: "계속 시킨다", text: "좀만 더 춰봐 ㅋㅋ", affinity: 4 },
      { label: "화장실 갔다오라고 한다", text: "그만 춰도 됨 화장실 갔다와", affinity: 5 },
      { label: "동영상 찍는다", text: "이거 찍어도 됨?", affinity: 3 },
    ],
  },
  attemptKiss: {
    id: "attemptKiss", title: "뽀뽀 시도", subtitle: "친밀도 65 이상",
    text: "얼굴을 가까이 가져가자 근떡존의 얼굴이 빨개진다.\n\n\"...야 너 진짜? ㅋㅋ 나 준비 안 됐는데\"",
    image: "/oppa_shy.png", minAffinity: 65,
    choices: [
      { label: "그대로 한다", text: "준비 안 돼도 걍 함", affinity: 8 },
      { label: "기다린다", text: "그럼 준비될 때까지 기다림", affinity: 6 },
      { label: "도망간다", text: "아 나도 부끄럽다 도망감", affinity: 3 },
    ],
  },
  smellPepper: {
    id: "smellPepper", title: "꼬추 냄새", subtitle: "심상치 않은 도전",
    text: "하반신 쪽으로 얼굴을 숙이자 근떡존이 극도로 당황한다.\n\n\"야아아아!!! 진짜 제정신이야?? 거긴 더 심한데 ㅋㅋㅋ\"",
    image: "/oppa_angry.png",
    choices: [
      { label: "그래도 맡는다", text: "상관없어 그냥 맡을래", affinity: 4 },
      { label: "장난이라고 한다", text: "장난이야 ㅋㅋ 미안", affinity: 2 },
      { label: "도망간다", text: "아 미안하다 도망감 ㅋㅋ", affinity: 1 },
    ],
  },
  touchMuscle: {
    id: "touchMuscle", title: "근육 구경", subtitle: "근육 만지기 이벤트",
    text: "팔뚝을 만지자 근떡존이 자랑스러운 듯 웃는다.\n\n\"어때? 운동 좀 한 티 나지 ㅋㅋ\"",
    image: "/oppa_smile.png",
    choices: [
      { label: "대단하다고 한다", text: "진짜 단단하다 대단한데?", affinity: 6 },
      { label: "다른 부위도 만진다", text: "복근도 만져봐도 됨?", affinity: 5 },
      { label: "자랑하냐고 놀린다", text: "자랑하는 거야? ㅋㅋ", affinity: 3 },
    ],
  },

  // 🆕 랜덤 돌발 이벤트
  suddenRain: {
    id: "suddenRain", title: "갑자기 쏟아진 비", subtitle: "랜덤 돌발 · 친밀도 30 이상",
    text: "창밖에 갑자기 비가 쏟아진다.\n\n근떡존: \"야 밖에 비 온다... 너 우산 있어? 없으면 나랑 같이 맞을래? ㅋㅋ\"",
    image: "/oppa_normal.png", minAffinity: 30,
    choices: [
      { label: "같이 비 맞자고 한다", text: "같이 맞으면 재밌겠다 ㅋㅋ", affinity: 5, nextEvent: "rainWalk" },
      { label: "우산 없다고 한다", text: "우산 없는데 어쩌지", affinity: 3, nextEvent: "bringUmbrella" },
      { label: "집에 있을 거라고 한다", text: "난 그냥 집에 있을래", affinity: -1 },
    ],
  },
  rainWalk: {
    id: "rainWalk", title: "빗속 산책", subtitle: "분기 이벤트",
    text: "둘이서 비를 맞으며 걷는다.\n\n근떡존이 갑자기 손을 내민다.\n\n\"야... 비에 젖었으니까 좀 춥지. 손 잡아줄까?\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "손을 잡는다", text: "그래 좀 추웠어", affinity: 8 },
      { label: "부끄럽다고 거절한다", text: "아냐 괜찮아 좀 부끄럽다", affinity: 3 },
      { label: "대신 안아달라고 한다", text: "손 말고 그냥 안아줘", affinity: 10 },
    ],
  },
  bringUmbrella: {
    id: "bringUmbrella", title: "우산을 가지러", subtitle: "분기 이벤트",
    text: "근떡존이 우산을 가지러 잠시 사라진다.\n\n잠시 후 우산을 들고 돌아온 근떡존.\n\n\"찾았다 ㅋㅋ 근데 이거 좀 작아서 둘이 쓰면 더 젖을 듯\"",
    image: "/oppa_smile.png",
    choices: [
      { label: "일부러 붙는다", text: "작아도 괜찮아 가까이 붙으면 되잖아", affinity: 7 },
      { label: "장난친다", text: "너 다 젖었네 땀 냄새 나겠다 ㅋ", affinity: 3 },
      { label: "고맙다고 한다", text: "찾아줘서 고마워", affinity: 4 },
    ],
  },
  suddenCall: {
    id: "suddenCall", title: "한밤중 전화", subtitle: "랜덤 돌발 · 친밀도 40 이상",
    text: "한밤중에 근떡존에게서 갑자기 전화가 걸려온다.\n\n\"야... 나 지금 좀 이상한 생각하다가 그냥 전화했어. 잘 거야?\"",
    image: "/oppa_shy.png", minAffinity: 40,
    choices: [
      { label: "무슨 생각했냐고 묻는다", text: "무슨 생각했는데?", affinity: 6, nextEvent: "deepTalk" },
      { label: "잔다고 한다", text: "응 나 잘 거임", affinity: -3 },
      { label: "나도 안 자고 있었다고 한다", text: "나도 잠 안 와서 깨어있었어", affinity: 5 },
    ],
  },
  deepTalk: {
    id: "deepTalk", title: "깊은 대화", subtitle: "분기 이벤트",
    text: "근떡존의 목소리가 평소보다 진지하다.\n\n\"야... 가끔 그런 생각 들어. 너 없었으면 나 진짜 외로웠을 거야. 이런 말 하기 좀 쑥스러운데...\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "진심으로 답한다", text: "나도 너 있어서 좋아", affinity: 10 },
      { label: "장난으로 받아친다", text: "뭐야 갑자기 감성 터졌네 ㅋㅋ", affinity: 3 },
      { label: "말없이 듣는다", text: "... ... ...", affinity: 5 },
    ],
  },
  gymSweat: {
    id: "gymSweat", title: "헬스장 땀내", subtitle: "랜덤 돌발 · 친밀도 50 이상",
    text: "근떡존이 운동하다가 갑자기 메시지를 보낸다.\n\n\"야 방금 운동 끝났는데 땀 개많이 남... 사진 보내줘? 이상한 거 아니고 그냥 셀카 ㅋㅋ\"",
    image: "/oppa_smile.png", minAffinity: 50,
    choices: [
      { label: "사진 달라고 한다", text: "보내줘 운동 직후 모습 보고 싶음", affinity: 5, nextEvent: "sweatSelfie" },
      { label: "씻으라고 한다", text: "사진보다 일단 씻어 ㅋㅋ", affinity: 2 },
      { label: "장난친다", text: "땀 냄새 나겠네 사진 말고 냄새 보내줘 ㅋ", affinity: 4 },
    ],
  },
  sweatSelfie: {
    id: "sweatSelfie", title: "땀에 젖은 셀카", subtitle: "분기 이벤트",
    text: "근떡존이 셀카를 보낸다.\n\n땀에 젖은 금발이 이마에 붙어있고, 운동복이 몸에 달라붙어 있다.\n\n\"...이상하게 나왔으면 모른 척 해라\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "멋있다고 한다", text: "와 진짜 멋있다 운동 열심히 했네", affinity: 7 },
      { label: "땀 얘기한다", text: "땀 진짜 많네 냄새 장난 아니겠다 ㅋ", affinity: 3 },
      { label: "저장한다고 한다", text: "이거 저장함 ㅋㅋ", affinity: 6 },
    ],
  },
  drunkWalk: {
    id: "drunkWalk", title: "술 취한 밤", subtitle: "랜덤 돌발 · 친밀도 60 이상 · 20시 이후",
    text: "근떡존이 갑자기 이상한 말투로 메시지를 보낸다.\n\n\"야아... 나 지금 술 쬐끔 마셨는데... 너한테 할 말 있었는데 까먹었다 ㅋㅋ 아...\"",
    image: "/oppa_smile2.png", minAffinity: 60,
    choices: [
      { label: "무슨 말 하려고 했냐고 묻는다", text: "무슨 말 하려고 했는데?", affinity: 5, nextEvent: "drunkConfession" },
      { label: "물 마시라고 한다", text: "물 좀 마셔 취했네 ㅋㅋ", affinity: 3 },
      { label: "나도 마시고 싶다고 한다", text: "나도 술 마시고 싶다 같이 마실걸", affinity: 4 },
    ],
  },
  drunkConfession: {
    id: "drunkConfession", title: "술김 고백", subtitle: "분기 이벤트 · 진지",
    text: "근떡존이 평소와 다르게 진지한 목소리로 말한다.\n\n\"야 아니 그게... 그냥 고맙다고 말하려고 했나봐. 너 요즘 많이 웃게 해줘서... 술 깨면 부끄러워서 이런 말 못 할 거야 아마\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "진심으로 받아준다", text: "나도 너 덕분에 웃는다 고마워", affinity: 12 },
      { label: "내일 놀린다", text: "술 깨면 이 대화 다시 보여줄 거임 ㅋㅋ", affinity: 5 },
      { label: "부끄럽다고 한다", text: "야 갑자기 그러면 나까지 부끄럽잖아", affinity: 7 },
    ],
  },
  suddenHug: {
    id: "suddenHug", title: "뒤에서 안기", subtitle: "랜덤 돌발 · 친밀도 70 이상",
    text: "근떡존이 갑자기 뒤에서 안아온다.\n\n\"...가만히 있어봐. 나 지금 좀 이상한데 그냥 이러고 있을게.\"",
    image: "/oppa_shy.png", minAffinity: 70,
    choices: [
      { label: "가만히 있는다", text: "... ... ...", affinity: 8, nextEvent: "longHug" },
      { label: "왜 그러냐고 묻는다", text: "왜 그래 무슨 일 있어?", affinity: 6 },
      { label: "장난친다", text: "야 땀 냄새 나 ㅋㅋ", affinity: 2 },
    ],
  },
  longHug: {
    id: "longHug", title: "긴 포옹", subtitle: "분기 이벤트",
    text: "한참을 말없이 안고 있다가 근떡존이 작게 말한다.\n\n\"...야. 이러고 있으니까 진짜 이상하게 편하다. 너는?\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "편하다고 한다", text: "응 나도 편해 그냥 이러고 싶다", affinity: 10 },
      { label: "더 안아본다", text: "좀만 더 이러자", affinity: 8 },
      { label: "농담한다", text: "편한데 땀 냄새는 좀 심하네 ㅋㅋ", affinity: 3 },
    ],
  },

  // ─── 📜 시나리오 1: 비 오는 날 ───
  rainy_step1: {
    id: "rainy_step1", title: "비 오는 날", subtitle: "시나리오 · 친밀도 55 이상",
    text: "창밖에 비가 억수같이 쏟아지고 있다. 근떡존에게서 메시지가 왔다.\n\n\"야 너 집이지? 나 지금 너네 집 근처인데... 비 때문에 못 가겠다 ㅋㅋ 잠깐 올라가도 됨?\"\n\n창밖을 보니 진짜 엄청난 폭우다.",
    image: "/oppa_normal.png", minAffinity: 55,
    choices: [
      { label: "올라오라고 한다", text: "얼른 올라와 비 맞겠다", affinity: 5, nextEvent: "rainy_step2_letIn" },
      { label: "내려간다", text: "내가 내려갈게 우산 가져갈게", affinity: 3, nextEvent: "rainy_step2_goDown" },
      { label: "장난친다", text: "비 맞으면서 오는 것도 낭만있지 ㅋㅋ", affinity: 1, nextEvent: "rainy_step2_joke" },
    ],
  },
  rainy_step2_letIn: {
    id: "rainy_step2_letIn", title: "집 안으로", subtitle: "",
    text: "초인종이 울리고 문을 열자 근떡존이 서 있다. 완전히 물에 젖은 채로.\n\n\"아... 진짜 비 개많이 온다 ㅋㅋ 미안 갑자기 찾아와서.\"\n\n금발 머리카락이 얼굴에 달라붙어 있고, 젖은 옷 사이로 근육 라인이 그대로 드러난다.\n\n\"야 수건 좀 빌려줄 수 있어? 나 지금 상태가 좀...\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "수건 가져다준다", text: "잠깐만 수건 가져올게", affinity: 3, nextEvent: "rainy_step3_towel" },
      { label: "장난친다", text: "그냥 벗어 그게 더 빨라 ㅋㅋ", affinity: 4, nextEvent: "rainy_step3_shirtless" },
      { label: "걱정한다", text: "감기 걸리겠다 얼른 들어와", affinity: 4, nextEvent: "rainy_step3_care" },
    ],
  },
  rainy_step2_goDown: {
    id: "rainy_step2_goDown", title: "비 속에서", subtitle: "",
    text: "우산을 들고 내려가니 근떡존이 건물 입구에서 쪼그리고 앉아 기다리고 있다.\n\n\"야! 진짜 내려왔네 ㅋㅋ 고마워... 근데 이 우산 좀 작은데?\"\n\n우산 하나에 둘이 들어가기엔 확실히 작다. 자연스럽게 어깨가 닿는다.\n\n\"...뭐야 이거. 좀 설레는데?\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "팔짱 낀다", text: "이러면 더 안 젖겠지", affinity: 6, nextEvent: "rainy_step3_close" },
      { label: "뛰어가자고 한다", text: "그냥 뛰어가자 어차피 다 젖었어", affinity: 3, nextEvent: "rainy_step3_run" },
      { label: "근처 카페 가자고 한다", text: "비 그칠 때까지 카페라도 갈래?", affinity: 4, nextEvent: "rainy_step3_cafe" },
    ],
  },
  rainy_step2_joke: {
    id: "rainy_step2_joke", title: "예상치 못한 전개", subtitle: "",
    text: "장난으로 비 맞으며 오라고 했더니 진짜로 맞으면서 온 모양이다.\n\n\"야 나 진짜 왔다 ㅋㅋㅋ 너 때문에 완전 쫄딱 젖었어!!\"\n\n문 앞에 선 근떡존은 완전히 물에 빠진 생쥐꼴이다. 하지만 이상하게 화난 표정이 아니라 웃고 있다.\n\n\"어떡할 거야? 책임져라\"",
    image: "/oppa_smile.png",
    choices: [
      { label: "미안하다고 수건 준다", text: "미안 진짜 올 줄 몰랐어 얼른 수건 가져올게", affinity: 5, nextEvent: "rainy_step3_towel" },
      { label: "계속 장난친다", text: "책임? 땀 냄새랑 비 냄새 섞이겠다 ㅋㅋ", affinity: 2, nextEvent: "rainy_step3_shirtless" },
    ],
  },
  rainy_step3_towel: {
    id: "rainy_step3_towel", title: "수건", subtitle: "",
    text: "수건을 건네자 근떡존이 머리를 털며 닦는다.\n\n\"아... 좀 따뜻하네. 근데 나 옷도 좀 젖었는데... 상관없냐?\"\n\n그러면서 셔츠를 살짝 들춰 올린다. 배에 근육 라인이 또렷하다.\n\n\"야 너 지금 어디 보는 거야 ㅋㅋ\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "옷 갈아입으라고 한다", text: "내 옷 중에 큰 거 줄 테니 갈아입어", affinity: 5, nextEvent: "rainy_step4_change" },
      { label: "계속 쳐다본다", text: "근육 좋은데? 운동 진짜 열심히 했네", affinity: 6, nextEvent: "rainy_step4_muscle" },
      { label: "아무 말 안 한다", text: "... ... ... 부끄러워서 말 못 함", affinity: 4, nextEvent: "rainy_step4_silence" },
    ],
  },
  rainy_step3_shirtless: {
    id: "rainy_step3_shirtless", title: "벗은 셔츠", subtitle: "",
    text: "근떡존이 별 고민 없이 셔츠를 벗는다.\n\n\"뭐 어차피 너랑 나랑 남잔데... 근데 왜 그렇게 뚫어지게 봐?\"\n\n젖은 금발이 목에 감겨 있고, 구릿빛 피부에 물방울이 맺혀 있다.\n\n\"...야 너 얼굴 좀 빨간데?\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "부정한다", text: "아냐 그냥 좀 더워서 그래", affinity: 3, nextEvent: "rainy_step4_muscle" },
      { label: "솔직히 말한다", text: "너 진짜 몸 좋다... 부러워", affinity: 6, nextEvent: "rainy_step4_muscle" },
      { label: "말 돌린다", text: "감기 들겠다 얼른 이불이라도 덮어", affinity: 4, nextEvent: "rainy_step4_care" },
    ],
  },
  rainy_step3_care: {
    id: "rainy_step3_care", title: "걱정", subtitle: "",
    text: "근떡존이 코를 훌쩍인다.\n\n\"아... 진짜 감기 걸릴 거 같아. 근데 너 그렇게 걱정해주니까 좀 좋다 ㅋㅋ\"\n\n그러면서도 약간 춥다는 듯이 팔을 문지른다.\n\n\"야 혹시... 따뜻한 거 있냐? 차 같은 거.\"",
    image: "/oppa_normal.png",
    choices: [
      { label: "차 만들어준다", text: "잠깐만 따뜻한 차 내려줄게", affinity: 5, nextEvent: "rainy_step4_tea" },
      { label: "이불 가져다준다", text: "일단 이불부터 덮어 체온 올려야지", affinity: 4, nextEvent: "rainy_step4_blanket" },
      { label: "장난친다", text: "내가 안아주면 체온 올라가려나?", affinity: 7, nextEvent: "rainy_step4_muscle" },
    ],
  },
  rainy_step3_close: {
    id: "rainy_step3_close", title: "밀착", subtitle: "",
    text: "우산 속에서 어깨가 닿은 채로 걷는다. 근떡존의 체온이 느껴진다.\n\n\"야... 이거 완전 데이트 같지 않냐? ㅋㅋ\"\n\n평소보다 더 가까운 거리. 숨소리까지 들릴 것 같다.\n\n\"나 지금 좀 떨리는데... 비 맞아서 그런 건 아니고.\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "맞장구친다", text: "그러게 데이트 같다", affinity: 7, nextEvent: "rainy_step4_closeEnd" },
      { label: "손을 잡는다", text: "그럼 이건?", affinity: 10, nextEvent: "rainy_step4_holdHand" },
      { label: "부끄럽다고 도망간다", text: "아 부끄러워서 못 듣겠다", affinity: 3, nextEvent: "rainy_step4_embarrassed" },
    ],
  },
  rainy_step3_run: {
    id: "rainy_step3_run", title: "빗속 질주", subtitle: "",
    text: "둘이서 비를 맞으며 뛰기 시작한다.\n\n\"야야야!!! 기다려봐 너 왜 이렇게 빨라!!!\"\n\n근떡존이 웃으면서 쫓아온다. 빗속에서 뛰는 모습이 웃기면서도 즐겁다.\n\n\"하... 진짜 미친 놈이네 ㅋㅋㅋ 재밌다!!\"",
    image: "/oppa_smile.png",
    choices: [
      { label: "계속 뛴다", text: "마지막까지 뛰자!", affinity: 4, nextEvent: "rainy_step4_arrive" },
      { label: "걷자고 한다", text: "하 힘들다 그냥 걷자", affinity: 3, nextEvent: "rainy_step4_walk" },
    ],
  },
  rainy_step3_cafe: {
    id: "rainy_step3_cafe", title: "카페로", subtitle: "",
    text: "근처 카페로 들어갔다. 둘 다 젖은 상태라 직원이 살짝 걱정스러운 표정을 짓는다.\n\n\"야 우리 이런 상태로 들어오면 안 되는 거 아니야?\"\n\n근떡존이 민망한 듯 웃으며 말한다.\n\n\"...근데 뭐 어때. 따뜻한 거 마시면서 비 그칠 때까지 있자.\"",
    image: "/oppa_normal.png",
    choices: [
      { label: "커피 시킨다", text: "내가 살게 뭐 마실래?", affinity: 4, nextEvent: "rainy_step4_cafeTalk" },
      { label: "자리 잡는다", text: "일단 앉자 창가 자리 있다", affinity: 3, nextEvent: "rainy_step4_cafeTalk" },
    ],
  },
  rainy_step4_change: {
    id: "rainy_step4_change", title: "옷 갈아입기", subtitle: "",
    text: "내 옷을 건네자 근떡존이 입어본다.\n\n\"...와 내가 이 옷 입으니까 완전 이상한데? 나한테 너무 작아\"\n\n셔츠가 근육 때문에 터질 듯이 당겨 있다.\n\n\"이거 입고 있으면 아까 벗은 거보다 더 이상해 ㅋㅋ 그래도 고마워.\"\n\n그러면서도 계속 그 옷을 입고 있다. 네 옷이라 좋은 거다.",
    image: "/oppa_smile.png",
    choices: [
      { label: "괜찮다고 한다", text: "이상하긴 한데 귀여워", affinity: 5, nextEvent: "rainy_ending_good" },
      { label: "원래 입던 게 낫다고 한다", text: "아니다 그냥 네 옷 말려줄게", affinity: 2, nextEvent: "rainy_ending_normal" },
    ],
  },
  rainy_step4_muscle: {
    id: "rainy_step4_muscle", title: "근육 이야기", subtitle: "",
    text: "근떡존이 갑자기 팔을 들어올려 이두근을 자랑한다.\n\n\"만져봐. 운동 진짜 열심히 했어.\"\n\n만지자마자 단단한 근육이 느껴진다.\n\n\"어때? 나름 괜찮지? ...근데 만지는 손길이 좀 이상한데? ㅋㅋ\"",
    image: "/oppa_smile.png",
    choices: [
      { label: "계속 만진다", text: "진짜 단단하다...", affinity: 5, nextEvent: "rainy_ending_romantic" },
      { label: "부러워한다", text: "나도 운동 열심히 해야겠다", affinity: 3, nextEvent: "rainy_ending_good" },
      { label: "장난친다", text: "땀 냄새 날 줄 알았는데 생각보다 괜찮네", affinity: 2, nextEvent: "rainy_ending_normal" },
    ],
  },
  rainy_step4_silence: {
    id: "rainy_step4_silence", title: "침묵", subtitle: "",
    text: "아무 말도 하지 못하고 있는데 근떡존이 먼저 입을 연다.\n\n\"야... 너 지금 부끄러워하는 거야? ㅋㅋ 귀엽네\"\n\n빗소리만 방 안에 가득하다. 근데 싫지 않은 침묵.\n\n\"...나도 사실 좀 부끄럽다. 갑자기 찾아와서\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "솔직하게 말한다", text: "부끄럽지만 싫지 않아", affinity: 8, nextEvent: "rainy_ending_romantic" },
      { label: "주제를 바꾼다", text: "비 언제 그치려나...", affinity: 1, nextEvent: "rainy_ending_normal" },
    ],
  },
  rainy_step4_tea: {
    id: "rainy_step4_tea", title: "따뜻한 차", subtitle: "",
    text: "따뜻한 차를 내려주자 근떡존이 두 손으로 컵을 감싼다.\n\n\"아... 진짜 따뜻하다. 마시면 몸 녹겠는데?\"\n\n차를 한 모금 마시고는 살짝 웃는다.\n\n\"너 차 타는 솜씨 좋네. 이런 것도 잘하고 진짜...\"\n\n말끝을 흐리며 창밖을 본다.",
    image: "/oppa_normal.png",
    choices: [
      { label: "칭찬에 답한다", text: "과찬이야 그냥 티백 넣은 건데", affinity: 3, nextEvent: "rainy_ending_good" },
      { label: "말끝을 캐묻는다", text: "진짜 뭐? 무슨 말 하려고 했어?", affinity: 6, nextEvent: "rainy_ending_romantic" },
    ],
  },
  rainy_step4_blanket: {
    id: "rainy_step4_blanket", title: "이불 속", subtitle: "",
    text: "이불을 가져다주자 근떡존이 감싼다.\n\n\"아 진짜 포근하다... 근데 이거 네 이불이지? 나 이런 거 빌려도 되냐?\"\n\n그러면서 이불 냄새를 맡는다.\n\n\"...네 냄새 나. 좋은 뜻으로.\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "좋은 뜻으로 묻는다", text: "좋은 뜻이 뭔데?", affinity: 5, nextEvent: "rainy_ending_romantic" },
      { label: "그냥 웃는다", text: "ㅋㅋ 너 진짜 이상한 말 잘한다", affinity: 3, nextEvent: "rainy_ending_good" },
    ],
  },
  rainy_step4_closeEnd: {
    id: "rainy_step4_closeEnd", title: "가까운 마무리", subtitle: "",
    text: "우산 속에서 계속 걸었다. 이제 비도 조금씩 그쳐가고 있다.\n\n근떡존이 갑자기 발걸음을 멈춘다.\n\n\"야... 나 오늘 너 만나러 오길 잘한 것 같아. 이런 날씨에 너랑 있어서 좋다.\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "공감한다", text: "나도 좋아. 비 오는 날 싫어했는데 오늘은 괜찮네", affinity: 6, nextEvent: "rainy_ending_good" },
      { label: "장난친다", text: "비 맞으면서도 좋냐? ㅋㅋ", affinity: 2, nextEvent: "rainy_ending_normal" },
    ],
  },
  rainy_step4_holdHand: {
    id: "rainy_step4_holdHand", title: "잡은 손", subtitle: "",
    text: "손을 잡자 근떡존이 깜짝 놀란다.\n\n\"...! 야 너 진짜...\"\n\n그러면서도 손을 빼지 않는다. 오히려 살짝 더 꼭 쥔다.\n\n\"...이런 거 하면 나 진짜 약해지는데\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "계속 잡는다", text: "그래도 계속 잡을 거야", affinity: 10, nextEvent: "rainy_ending_romantic" },
      { label: "살짝 농담", text: "약해져봐 ㅋㅋ 재밌겠다", affinity: 4, nextEvent: "rainy_ending_good" },
    ],
  },
  rainy_step4_embarrassed: {
    id: "rainy_step4_embarrassed", title: "부끄러운 도망", subtitle: "",
    text: "부끄러워서 앞서 걸어가자 근떡존이 뒤에서 쫓아온다.\n\n\"야 왜 도망가!!! 같이 가야지!!\"\n\n결국 따라잡히고 만다.\n\n\"하... 진짜 부끄러워하는 모습도 괜찮네\"",
    image: "/oppa_smile.png",
    choices: [
      { label: "더 부끄러워한다", text: "야 그런 말 하지 마...", affinity: 4, nextEvent: "rainy_ending_romantic" },
      { label: "인정한다", text: "알았어 나 부끄러워하는 거 맞아", affinity: 5, nextEvent: "rainy_ending_good" },
    ],
  },
  rainy_step4_arrive: {
    id: "rainy_step4_arrive", title: "도착", subtitle: "",
    text: "둘 다 완전히 젖어서 집에 도착했다.\n\n\"하... 진짜 완전 쫄딱이다 ㅋㅋ 오늘 진짜 미친 짓 했네\"\n\n근떡존이 숨을 헉헉 몰아쉬며 웃는다.\n\n\"...근데 재밌었어. 너랑 뛰니까\"",
    image: "/oppa_smile.png",
    choices: [
      { label: "동의한다", text: "나도 진짜 재밌었어", affinity: 5, nextEvent: "rainy_ending_good" },
      { label: "걱정한다", text: "감기 걸리면 어쩌려고...", affinity: 4, nextEvent: "rainy_step4_tea" },
    ],
  },
  rainy_step4_walk: {
    id: "rainy_step4_walk", title: "천천히", subtitle: "",
    text: "걸음 속도를 늦추자 근떡존도 맞춰준다.\n\n\"아... 뛰다가 갑자기 걸으니까 뭔가 더 조용하고 좋네\"\n\n빗소리와 발걸음 소리만 들린다.\n\n\"이런 날에 너랑 같이 걸을 수 있어서 좋다\"",
    image: "/oppa_normal.png",
    choices: [
      { label: "고개를 기댄다", text: "...나도", affinity: 7, nextEvent: "rainy_ending_romantic" },
      { label: "말없이 걷는다", text: "... ... ...", affinity: 4, nextEvent: "rainy_ending_good" },
    ],
  },
  rainy_step4_cafeTalk: {
    id: "rainy_step4_cafeTalk", title: "카페 대화", subtitle: "",
    text: "따뜻한 음료를 마시며 창밖을 본다. 비가 조금씩 잦아들고 있다.\n\n근떡존이 컵을 만지작거리며 말한다.\n\n\"야... 있잖아. 나 너랑 있으면 시간이 왜 이렇게 빨리 가는 거지?\"",
    image: "/oppa_normal.png",
    choices: [
      { label: "공감한다", text: "그러게 나도 그래", affinity: 5, nextEvent: "rainy_ending_good" },
      { label: "더 있고 싶다고 한다", text: "비 안 그쳤으면 좋겠다", affinity: 7, nextEvent: "rainy_ending_romantic" },
    ],
  },
  rainy_ending_romantic: {
    id: "rainy_ending_romantic", title: "엔딩: 빗속의 고백", subtitle: "로맨틱 엔딩",
    text: "비가 거의 그친 저녁. 근떡존이 갑자기 조용해진다.\n\n\"야... 나 너한테 할 말 있는데\"\n\n평소와 다른 진지한 표정. 심지어 약간 떨고 있다.\n\n\"나 원래 이런 말 잘 못 하는데... 너랑 있을 때마다 진짜 행복해. 그냥 그 말이 하고 싶었어\"\n\n그의 볼이 살짝 붉어져 있다. 땀인지 빗물인지 구분 안 되는 물방울이 이마에 맺혀 있다.\n\n\"...부끄럽다. 진짜\"\n― 근떡존과의 관계가 한 단계 더 깊어졌다.\n❤️ 친밀도 +15",
    image: "/oppa_shy.png",
    choices: [{ label: "나도 행복하다고 대답한다", text: "나도 너랑 있으면 행복해", affinity: 15 }],
  },
  rainy_ending_good: {
    id: "rainy_ending_good", title: "엔딩: 편안한 밤", subtitle: "굿 엔딩",
    text: "비가 완전히 그쳤다. 근떡존이 기지개를 켠다.\n\n\"아... 비 그쳤네. 오늘 진짜 고마웠어.\"\n\n문 앞에서 배웅하는 당신을 보고 살짝 웃는다.\n\n\"다음에 또 비 오면 내가 또 올게. 아니, 비 안 와도 올까?\"\n\n장난스럽지만 진심이 담긴 말투다.\n\n\"아무튼 오늘 진짜 재밌었어. 잘 자\"\n― 근떡존이 돌아갔다. 하지만 분명 다음이 있을 것이다.\n❤️ 친밀도 +8",
    image: "/oppa_smile.png",
    choices: [{ label: "잘 자라고 인사한다", text: "응 잘 가 조심히 가", affinity: 8 }],
  },
  rainy_ending_normal: {
    id: "rainy_ending_normal", title: "엔딩: 조금은 아쉬운 마무리", subtitle: "노멀 엔딩",
    text: "비가 그치고 근떡존이 일어난다.\n\n\"아... 이제 가야겠다. 내일 운동도 있고\"\n\n조금 아쉽지만, 오늘 있었던 일들을 생각하면 나쁘지 않다.\n\n\"오늘 갑자기 찾아와서 미안했어. 담에 보자\"\n\n문을 나서며 뒤돌아 한 번 더 손을 흔든다.\n― 평범한 하루였다. 그래도 근떡존이 조금 더 가까워진 느낌이다.\n❤️ 친밀도 +3",
    image: "/oppa_normal.png",
    choices: [{ label: "담에 보자고 한다", text: "응 담에 또 봐", affinity: 3 }],
  },

  // ─── 📜 시나리오 2: 헬스장 ───
  gym_step1: {
    id: "gym_step1", title: "헬스장 우연한 만남", subtitle: "시나리오 · 친밀도 60 이상 · 주간",
    text: "헬스장에 갔는데 익숙한 금발이 보인다. 근떡존이다.\n\n벤치프레스 중이던 그가 너를 발견하고 눈이 마주친다.\n\n\"어? 야! 너 여기 다녔냐? 몰랐네 ㅋㅋ\"\n\n바벨을 내려놓고 벌떡 일어난다. 민소매 티셔츠 사이로 구릿빛 근육이 그대로 드러난다. 땀에 젖어 반짝이고 있다.\n\n\"나 지금 등 운동 중인데... 같이 할래?\"",
    image: "/oppa_smile.png", minAffinity: 60,
    choices: [
      { label: "같이 운동한다", text: "그래 같이 하자 나도 등 할 차례였어", affinity: 4, nextEvent: "gym_step2_together" },
      { label: "구경만 한다", text: "아냐 난 그냥 네가 하는 거 구경할래", affinity: 5, nextEvent: "gym_step2_watch" },
      { label: "장난친다", text: "땀 냄새 장난 아니네 여기부터 나 ㅋㅋ", affinity: 2, nextEvent: "gym_step2_joke" },
    ],
  },
  gym_step2_together: {
    id: "gym_step2_together", title: "함께 운동", subtitle: "",
    text: "근떡존이 옆에서 자세를 봐준다.\n\n\"야 허리 더 펴. 그러다 다친다.\"\n\n평소엔 허당인데 운동할 때만큼은 진지하다. 그의 큰 손이 네 허리에 닿아 자세를 교정해준다.\n\n\"이 정도? 어때 좀 편하지?\"\n\n손이 닿은 자리가 뜨겁다.",
    image: "/oppa_normal.png",
    choices: [
      { label: "고마워한다", text: "오 진짜 더 편하다 고마워", affinity: 3, nextEvent: "gym_step3_spot" },
      { label: "놀린다", text: "너 운동할 때만 진지하네 평소엔 허당인데", affinity: 4, nextEvent: "gym_step3_tease" },
      { label: "더 물어본다", text: "다른 운동도 좀 알려줘", affinity: 5, nextEvent: "gym_step3_teach" },
    ],
  },
  gym_step2_watch: {
    id: "gym_step2_watch", title: "구경", subtitle: "",
    text: "근떡존이 다시 벤치에 누워 바벨을 든다.\n\n\"그럼 구경 잘 해봐 ㅋㅋ 나 지금 좀 무거운 거 든다?\"\n\n숨을 들이쉬고 바벨을 들어올린다. 팔과 가슴 근육이 부풀어 오르고, 이마에 땀방울이 맺힌다.\n\n\"하... 어때? 좀 멋있냐?\"",
    image: "/oppa_smile.png",
    choices: [
      { label: "솔직히 멋있다고 한다", text: "인정 진짜 멋있다 운동 열심히 했네", affinity: 6, nextEvent: "gym_ending_romantic" },
      { label: "땀 닦아준다", text: "땀 좀 닦아 이마에 흐르잖아", affinity: 7, nextEvent: "gym_ending_romantic" },
      { label: "장난친다", text: "멋있는데 땀 냄새가 반은 깎아먹네 ㅋ", affinity: 3, nextEvent: "gym_ending_normal" },
    ],
  },
  gym_step2_joke: {
    id: "gym_step2_joke", title: "냄새 지적", subtitle: "",
    text: "근떡존이 자기 겨드랑이 쪽을 슬쩍 확인한다.\n\n\"아... 진짜? 나 오늘 데오도란트 안 뿌렸는데 ㅋㅋ 미안\"\n\n부끄러운 듯 뒷머리를 긁적인다.\n\n\"근데 너 그런 말 해도 나 안 부끄럽다? 오히려 더 친근하지 않냐\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "괜찮다고 한다", text: "장난이야 냄새 별로 안 나", affinity: 5, nextEvent: "gym_ending_good" },
      { label: "계속 놀린다", text: "아니야? 진짜 좀 나는데 ㅋㅋ", affinity: 2, nextEvent: "gym_ending_normal" },
    ],
  },
  gym_step3_spot: {
    id: "gym_step3_spot", title: "스팟", subtitle: "",
    text: "이제 네가 벤치에 누울 차례다. 근떡존이 뒤에서 스팟을 봐준다.\n\n\"자 천천히... 괜찮아? 더 무거운 거 해볼래?\"\n\n그의 얼굴이 바로 위에 있다. 땀에 젖은 금발이 살짝 늘어져 있다.\n\n\"...야 이거 뭔가 부끄럽다. 얼굴 너무 가까운데\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "계속한다", text: "부끄러워도 해야지 스팟 봐줘", affinity: 4, nextEvent: "gym_ending_good" },
      { label: "일어난다", text: "아 부끄러워서 못 하겠다", affinity: 3, nextEvent: "gym_ending_normal" },
    ],
  },
  gym_step3_tease: {
    id: "gym_step3_tease", title: "놀림", subtitle: "",
    text: "근떡존이 삐친 척 입을 내민다.\n\n\"야 나 원래 진지한 남자야. 평소에만 장난치는 거지\"\n\n그러면서도 웃음이 터져 나온다.\n\n\"아니다 나도 인정한다. 나 좀 허당인 듯 ㅋㅋ\"",
    image: "/oppa_smile.png",
    choices: [
      { label: "그런 게 좋다고 한다", text: "그런 면이 좋은 거야", affinity: 6, nextEvent: "gym_ending_romantic" },
      { label: "더 놀린다", text: "인정하네? ㅋㅋ 성장했구나", affinity: 3, nextEvent: "gym_ending_good" },
    ],
  },
  gym_step3_teach: {
    id: "gym_step3_teach", title: "PT", subtitle: "",
    text: "근떡존이 신나서 여러 운동을 알려준다.\n\n\"이거는 삼두 운동인데 이렇게 하는 거야. 봐봐\"\n\n시범을 보여주는데 진짜 자세가 완벽하다.\n\n\"운동 좋아하게 되면 나중에 같이 대회 나갈 수도 있고... 아님 말고 ㅋㅋ\"",
    image: "/oppa_smile.png",
    choices: [
      { label: "좋다고 한다", text: "같이 대회 나가는 것도 재밌겠다", affinity: 5, nextEvent: "gym_ending_romantic" },
      { label: "현실적 답변", text: "대회까지는 무리고 같이 운동은 자주 하자", affinity: 4, nextEvent: "gym_ending_good" },
    ],
  },
  gym_ending_romantic: {
    id: "gym_ending_romantic", title: "엔딩: 운동보다 더 뜨거워진 순간", subtitle: "로맨틱 엔딩",
    text: "운동이 끝나고 둘이 벤치에 나란히 앉았다. 둘 다 땀에 젖어 숨을 고르고 있다.\n\n근떡존이 갑자기 조용히 말한다.\n\n\"야... 같이 운동하니까 진짜 좋다. 평소엔 혼자 하는데 너랑 하니까 시간이 왜 이렇게 빨리 가는지\"\n\n물병을 건네며 손이 살짝 닿는다. 그는 물병을 받으면서 네 손을 잠시 감싼다.\n\n\"...운동 끝나고 샤워하기 전에 항상 하는 생각이 있어. 이런 순간을 누군가랑 나누면 좋겠다. 오늘은 그게 너라서 좋다\"\n\n\"다음에도 같이 운동하자. 물론 너랑 헬스 말고 다른 것도 같이 하고 싶지만\"\n❤️ 친밀도 +12",
    image: "/oppa_shy.png",
    choices: [{ label: "꼭 같이 하자고 약속한다", text: "응 다음에도 꼭 같이 운동하자", affinity: 12 }],
  },
  gym_ending_good: {
    id: "gym_ending_good", title: "엔딩: 좋은 운동 파트너", subtitle: "굿 엔딩",
    text: "운동을 마치고 서로 하이파이브를 한다.\n\n\"오늘 진짜 알차게 했다! 너 운동 생각보다 잘하는데?\"\n\n근떡존이 수건으로 얼굴을 닦으며 웃는다.\n\n\"담에 또 같이 운동하자. 나 매주 화요일 목요일 여기 와\"\n― 좋은 운동 파트너가 생겼다.\n❤️ 친밀도 +7",
    image: "/oppa_smile.png",
    choices: [{ label: "단백질 먹겠다고 약속한다", text: "알았어 단백질 꼭 챙겨 먹을게", affinity: 7 }],
  },
  gym_ending_normal: {
    id: "gym_ending_normal", title: "엔딩: 평범한 운동 일지", subtitle: "노멀 엔딩",
    text: "운동을 마치고 각자 정리한다.\n\n\"아 오늘 운동 괜찮았지? 나는 이제 가서 유산소 좀 더 할게\"\n\n근떡존이 런닝머신 쪽으로 걸어간다.\n\n\"담에 또 보자! 빠이\"\n― 평범한 하루였다.\n❤️ 친밀도 +4",
    image: "/oppa_normal.png",
    choices: [{ label: "인사한다", text: "응 수고했어 담에 또 보자", affinity: 4 }],
  },

  // ─── 🔞 시나리오 3: 늦은 밤 침대 위 ───
  late_step1: {
    id: "late_step1", title: "잠 못 드는 밤", subtitle: "시나리오 · 친밀도 70 이상 · 심야",
    text: "잠이 오지 않아 뒤척이고 있을 때, 근떡존에게서 메시지가 왔다.\n\n\"야... 자냐?\"\n\n평소와 달리 단촐한 메시지. 뭔가 생각이 많은 것 같다.\n\n\"나 지금 잠이 안 와서... 너도 잠 안 오면 잠깐 통화할래? 목소리 듣고 싶어서\"",
    image: "/oppa_shy.png", minAffinity: 70,
    choices: [
      { label: "통화한다", text: "그래 통화하자 나도 잠 안 와", affinity: 5, nextEvent: "late_step2_call" },
      { label: "영상통화 제안한다", text: "통화 말고 영상통화 할래?", affinity: 6, nextEvent: "late_step2_videocall" },
      { label: "장난친다", text: "이 시간에 목소리 듣고 싶다고? 수상한데 ㅋㅋ", affinity: 3, nextEvent: "late_step2_joke" },
    ],
  },
  late_step2_call: {
    id: "late_step2_call", title: "수화기 너머", subtitle: "",
    text: "전화를 걸자 바로 받는다.\n\n\"...여보세요\"\n\n평소보다 낮고 차분한 목소리. 주변은 조용하고, 그가 숨 쉬는 소리만 들린다.\n\n\"야... 나 왜 이러는지 모르겠는데, 오늘 밤은 이상하게 네 생각이 계속 나더라. 그래서 잠이 안 왔나 봐\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "무슨 생각이었냐고 묻는다", text: "무슨 생각이었는데?", affinity: 5, nextEvent: "late_step3_thoughts" },
      { label: "나도라고 말한다", text: "나도 그래 네 생각하고 있었어", affinity: 7, nextEvent: "late_step3_mutual" },
      { label: "목소리가 좋다고 한다", text: "네 목소리 듣고 있으니까 좀 진정된다", affinity: 6, nextEvent: "late_step3_voice" },
    ],
  },
  late_step2_videocall: {
    id: "late_step2_videocall", title: "화면 속 그", subtitle: "",
    text: "영상통화를 걸자 잠시 후 근떡존의 얼굴이 화면에 나타난다.\n\n방 안은 어둡고 침대에 누워 있는 듯하다. 상의는 헐렁한 나시 하나만 걸치고 있고, 금발이 베개에 흩어져 있다.\n\n\"야... 너도 침대야? 나도...\"\n\n\"이렇게 보니까 더 실감 나네. 너 지금 내 옆에 없는 게 아쉽다\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "나도 아쉽다고 한다", text: "그러게 진짜 옆에 있었으면 좋겠다", affinity: 7, nextEvent: "late_step3_close" },
      { label: "장난친다", text: "옆에 있었으면 땀 냄새 때문에 잠 못 잤을걸 ㅋ", affinity: 3, nextEvent: "late_step3_tease" },
      { label: "지금 이 순간이 좋다고 한다", text: "그래도 이렇게 보니까 좋다", affinity: 5, nextEvent: "late_step3_moment" },
    ],
  },
  late_step2_joke: {
    id: "late_step2_joke", title: "장난기", subtitle: "",
    text: "근떡존이 작게 웃는다.\n\n\"야... 수상하긴 뭐가 수상해. 그냥...\"\n\n잠시 침묵이 흐른다.\n\n\"그냥 오늘 밤은 네가 필요했어. 이런 말 하기 좀 부끄러운데\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "진심으로 받아준다", text: "부끄러워할 필요 없어 나도 네가 필요해", affinity: 8, nextEvent: "late_step3_mutual" },
      { label: "더 장난친다", text: "나 필요하다고? 내가 기저귀야? ㅋㅋ", affinity: 1, nextEvent: "late_ending_soft" },
    ],
  },
  late_step3_thoughts: {
    id: "late_step3_thoughts", title: "생각들", subtitle: "",
    text: "근떡존이 천천히 말을 꺼낸다.\n\n\"그게... 우리 이렇게 계속 대화하고 있잖아. 그러다 보니까 어느새 네가 진짜 내 일상이 된 것 같아서\"\n\n목소리가 약간 떨린다.\n\n\"야 이런 말 하니까 진짜 쑥스럽네...\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "손 내밀듯 다가간다", text: "나도 그래 네가 내 일상이야", affinity: 8, nextEvent: "late_ending_deep" },
      { label: "부끄럽다고 말한다", text: "야 그런 말 하면 나까지 부끄러워지잖아", affinity: 4, nextEvent: "late_ending_soft" },
    ],
  },
  late_step3_mutual: {
    id: "late_step3_mutual", title: "서로의 마음", subtitle: "",
    text: "근떡존이 살짝 숨을 들이킨다.\n\n\"진짜? 너도 내 생각하고 있었어?\"\n\n그의 목소리에 안도감과 기쁨이 섞여 있다.\n\n\"그럼... 우리 지금 같은 생각 하고 있는 거 아냐? ㅋㅋ\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "인정한다", text: "응 같은 생각인 듯", affinity: 8, nextEvent: "late_ending_romantic" },
      { label: "무슨 생각이냐고 묻는다", text: "무슨 생각인데? 말해봐", affinity: 6, nextEvent: "late_step3_deeper" },
    ],
  },
  late_step3_voice: {
    id: "late_step3_voice", title: "목소리", subtitle: "",
    text: "근떡존이 조용히 웃는다.\n\n\"내 목소리가 진정된다고? 그런 말 들으니까 이상하게 더 떨리는데\"\n\n잠시 침묵 후 다시 말한다.\n\n\"너 목소리도 듣고 있으니까 좋다. 이대로 계속 통화하고 싶어\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "계속 이야기하자고 한다", text: "그럼 계속 통화하자 잠들 때까지", affinity: 6, nextEvent: "late_ending_soft" },
      { label: "더 가까이 가고 싶다고 한다", text: "통화 말고 진짜 옆에 있고 싶다", affinity: 8, nextEvent: "late_ending_deep" },
    ],
  },
  late_step3_close: {
    id: "late_step3_close", title: "가까이", subtitle: "",
    text: "근떡존이 카메라를 가까이 가져간다.\n\n\"이렇게 보면 진짜 가까이 있는 것 같지 않냐?\"\n\n화면 속에서 그의 얼굴이 더 선명하게 보인다. 눈동자가 희미한 빛에 반짝이고, 입술이 살짝 올라가 있다.\n\n\"...야. 진짜 지금 네가 여기 있었으면\"\n\n말끝을 흐린다.",
    image: "/oppa_shy.png",
    choices: [
      { label: "말끝을 캐묻는다", text: "내가 여기 있었으면 뭐?", affinity: 8, nextEvent: "late_ending_romantic" },
      { label: "나도 같은 상상 한다", text: "나도 그런 상상 하고 있었어", affinity: 7, nextEvent: "late_ending_deep" },
    ],
  },
  late_step3_tease: {
    id: "late_step3_tease", title: "장난", subtitle: "",
    text: "근떡존이 피식 웃는다.\n\n\"야 너 자꾸 땀 얘기하면 진짜 이상한 데로 빠질 거야 지금\"\n\n장난스럽지만 어딘지 진심이 담긴 말투다.\n\n\"아니면... 이미 빠진 거야?\"",
    image: "/oppa_smile.png",
    choices: [
      { label: "빠졌다고 한다", text: "이미 오래전에 빠졌어", affinity: 8, nextEvent: "late_ending_romantic" },
      { label: "아니라고 한다", text: "아직이야 ㅋㅋ", affinity: 3, nextEvent: "late_ending_soft" },
    ],
  },
  late_step3_moment: {
    id: "late_step3_moment", title: "이 순간", subtitle: "",
    text: "근떡존이 이불을 끌어당기며 자세를 바꾼다.\n\n\"이렇게 가만히 있으니까 진짜 평화롭다. 너랑 그냥 아무 말 안 해도 좋고\"\n\n화면 속에서 편안한 표정을 짓는다.\n\n\"근데 동시에... 좀 더 가까이 가고 싶다는 생각도 들고. 이상하지?\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "이상하지 않다고 한다", text: "이상하지 않아 나도 그래", affinity: 7, nextEvent: "late_ending_deep" },
      { label: "어떻게 가까이 가고 싶냐고 묻는다", text: "어떻게 가까이 가고 싶은데?", affinity: 8, nextEvent: "late_ending_romantic" },
    ],
  },
  late_step3_deeper: {
    id: "late_step3_deeper", title: "더 깊이", subtitle: "",
    text: "근떡존이 작게 한숨을 쉰다. 답답한 한숨은 아니고, 마음을 가다듬는 느낌이다.\n\n\"아... 이거 말로 하니까 진짜 어렵네\"\n\n잠시 뜸들이더니 조용히 말한다.\n\n\"그냥... 너랑 더 가까워지고 싶어. 지금보다 훨씬 더. 니 모든 걸 느끼고 싶어.\"",
    image: "/oppa_shy.png",
    choices: [
      { label: "나도 그렇다고 말한다", text: "나도 그래. 너랑 더 가까워지고 싶어", affinity: 10, nextEvent: "late_ending_romantic" },
      { label: "어떤 의미로 가까워지고 싶냐고 묻는다", text: "내 모든 걸 느끼고 싶다는 게, 어떤 뜻이야?", affinity: 9, nextEvent: "late_ending_romantic" },
    ],
  },
  late_ending_romantic: {
    id: "late_ending_romantic", title: "엔딩: 경계가 무너지는 밤", subtitle: "로맨틱 엔딩 · 수위 있음",
    text: "근떡존이 깊은 숨을 들이쉰다. 화면 속 그의 눈빛이 진지하다.\n\n\"야... 나 솔직히 말할게. 나 너랑 이렇게 대화하는 것만으로는 부족해\"\n\n목소리가 약간 쉰 듯 낮아진다.\n\n\"가끔은 진짜 네 옆에 누워서... 네 숨소리만 듣는 걸로는 부족할 거 같아. 네 피부가 내 피부에 닿는 걸 느끼고 싶어\"\n\n이불이 살짝 밀리고, 나시 사이로 쇄골 라인이 드러난다. 구릿빛 피부가 야간 조명 아래에서 따뜻하게 빛난다.\n\n\"너한테 손대는 날 상상만 해도... 아 미치겠다 이런 말 하니까 진짜\"\n\n그가 눈을 질끈 감았다 뜬다. 부끄러움을 참으며 당신의 눈을 똑바로 바라본다.\n\n\"이런 말 들으면 도망가고 싶어? 아님...\"\n― 더 이상 숨길 수 없는 마음이 드러났다.\n❤️ 친밀도 +15",
    image: "/oppa_shy.png",
    choices: [{ label: "도망가지 않는다고 말한다", text: "도망가지 않아. 나도 너 갖고 싶어", affinity: 15 }],
  },
  late_ending_deep: {
    id: "late_ending_deep", title: "엔딩: 깊어진 밤의 대화", subtitle: "진심 엔딩",
    text: "근떡존이 조용히 말을 잇는다.\n\n\"나 원래 이런 말 잘 못 하는데... 오늘 밤은 왠지 할 수 있을 것 같아\"\n\n그가 천장을 보며 천천히 말한다.\n\n\"네가 내 인생에 들어와서 진짜 많이 달라졌어. 네 생각만 하면 가슴이 이상해져\"\n\n이불을 끌어당기며 작게 웃는다.\n\n\"부끄럽지만 진심이야. 너는 나한테 그런 사람이야. 그냥 친구로는 부족해\"\n― 대화는 더 깊어졌다.\n❤️ 친밀도 +10",
    image: "/oppa_shy.png",
    choices: [{ label: "고맙다고 말한다", text: "그런 말 해줘서 고마워. 나한테도 가장 소중한 사람이야", affinity: 10 }],
  },
  late_ending_soft: {
    id: "late_ending_soft", title: "엔딩: 포근한 밤", subtitle: "소프트 엔딩",
    text: "근떡존이 하품을 한다.\n\n\"아... 이야기하고 있으니까 좀 졸리네\"\n\n그러면서도 전화를 끊지 않는다.\n\n\"이대로 그냥 자도 돼? 통화 끊지 말고. 너 숨소리 들으면서 자고 싶어\"\n\n서로의 숨소리를 들으며 조용히 눈을 감는다.\n❤️ 친밀도 +7",
    image: "/oppa_normal.png",
    choices: [{ label: "잘 자라고 말한다", text: "응 잘 자. 나도 이대로 잘게", affinity: 7 }],
  },
  // ─── VN ENGINE v4: 질투/집착/얀데레/감금 루트 ───
  jealousy30: {
    id: "jealousy30", title: "질투 30: 표정이 굳는 순간", subtitle: "질투 지수 30 이상 · 자동 발동",
    text: "다른 사람 얘기가 나오자 근떡존의 웃음이 아주 잠깐 멈췄다.\n\n\"아… 그래? 걔랑 있었구나.\"\n\n말투는 가볍지만 눈은 전혀 웃고 있지 않다.\n\n\"아니 뭐, 상관없는데. 그냥… 조금 신경 쓰였어.\"\n\n― 질투가 시작됐다.",
    image: "/oppa_jealous30.png",
    choices: [
      { label: "너밖에 없다고 달랜다", text: "장난이야 너밖에 없어", affinity: 7 },
      { label: "질투하냐고 놀린다", text: "너 지금 질투하는 거야?", affinity: 4 },
      { label: "더 자극한다", text: "왜? 신경 쓰여?", affinity: 1 },
    ],
  },
  jealousy50: {
    id: "jealousy50", title: "질투 50: 대답을 재촉하는 밤", subtitle: "질투 지수 50 이상 · 자동 발동",
    text: "답장이 조금 늦었을 뿐인데 메시지가 연달아 쌓여 있었다.\n\n\"야.\"\n\"어디야?\"\n\"아니 그냥 궁금해서.\"\n\n잠시 후 영상통화 알림까지 뜬다. 화면 속 근떡존은 억지로 웃고 있었다.\n\n\"나 좀 이상하지? 근데 네가 다른 데 있는 거 생각하면… 좀 싫어.\"",
    image: "/oppa_jealous50.png",
    choices: [
      { label: "솔직히 미안하다고 한다", text: "미안 답장 늦었어", affinity: 6 },
      { label: "나를 믿으라고 한다", text: "날 좀 믿어봐", affinity: 5 },
      { label: "일부러 더 놀린다", text: "질투 더 해봐", affinity: 2 },
    ],
  },
  jealousy80: {
    id: "jealousy80", title: "질투 80: 무너지는 여유", subtitle: "질투 지수 80 이상 · 강제 루트",
    text: "근떡존의 표정에서 여유가 완전히 사라졌다.\n\n\"나 말고 누구랑 그렇게 웃었는데?\"\n\n낮은 목소리. 손끝이 떨리고, 눈빛은 이상할 만큼 집요하다.\n\n\"싫다. 진짜 싫어. 네가 나 아닌 사람한테 익숙해지는 거.\"\n\n그가 한 걸음 다가온다.\n\n\"오늘은… 나한테만 집중해.\"",
    image: "/oppa_jealous80.png",
    choices: [
      { label: "그에게 집중한다", text: "알았어 오늘은 너한테만 집중할게", affinity: 10, nextEvent: "obsession50" },
      { label: "진정하라고 한다", text: "진정해 너무 과해", affinity: 2 },
      { label: "피하려고 한다", text: "나 잠깐 나갔다올게", affinity: -3, nextEvent: "confinementRoute" },
    ],
  },
  obsession30: {
    id: "obsession30", title: "집착 30: 자꾸 확인하는 사람", subtitle: "집착도 30 이상 · 자동 발동",
    text: "근떡존이 평소보다 더 자주 말을 건다.\n\n\"밥 먹었어?\"\n\"지금 뭐 해?\"\n\"아니 그냥… 네가 뭘 하는지 알고 싶어서.\"\n\n분명 다정한 말인데, 묘하게 끊기지 않는다.\n\n\"귀찮으면 말해. 근데 말해도 나 조금은 계속 물어볼 듯.\"",
    image: "/oppa_obsessed30.png",
    choices: [
      { label: "괜찮다고 한다", text: "괜찮아 물어봐도 돼", affinity: 7 },
      { label: "좀 부담스럽다고 한다", text: "조금 부담스럽긴 해", affinity: -1 },
      { label: "귀엽다고 한다", text: "그런 거 좀 귀엽다", affinity: 5 },
    ],
  },
  obsession50: {
    id: "obsession50", title: "집착 50: 네 하루를 알고 싶어", subtitle: "집착도 50 이상 · 자동 발동",
    text: "근떡존이 네 하루를 하나하나 묻기 시작했다.\n\n\"오늘 누구 만났어?\"\n\"언제 집 와?\"\n\"내가 너무 많이 묻나?\"\n\n그는 웃으려 하지만 눈빛이 조금 어둡다.\n\n\"근데 네가 어디 있는지 모르면, 이상하게 마음이 불안해져.\"",
    image: "/oppa_obsessed50.png",
    choices: [
      { label: "일정을 알려준다", text: "오늘 일정 다 말해줄게", affinity: 8 },
      { label: "믿으라고 한다", text: "나 믿어도 돼", affinity: 5 },
      { label: "묻지 말라고 한다", text: "그만 물어봐", affinity: -4 },
    ],
  },
  obsession80: {
    id: "obsession80", title: "집착 80: 문 앞의 그림자", subtitle: "집착도 80 이상 · 얀데레 진입",
    text: "밤늦게 문밖에서 낮은 목소리가 들렸다.\n\n\"나야. 문 열어줘.\"\n\n근떡존은 젖은 머리로 서 있었다. 평소의 순한 얼굴인데, 눈빛만은 완전히 달랐다.\n\n\"네가 답장이 없어서… 그냥 왔어. 이상하지? 나도 알아.\"\n\n그가 웃는다.\n\n\"근데 이제 혼자 두는 게 더 싫어.\"",
    image: "/oppa_yandere.png",
    choices: [
      { label: "문을 열어준다", text: "들어와", affinity: 10, nextEvent: "yandereConfession" },
      { label: "돌아가라고 한다", text: "오늘은 돌아가", affinity: -5, nextEvent: "confinementRoute" },
      { label: "왜 왔냐고 묻는다", text: "왜 여기까지 온 거야?", affinity: 4 },
    ],
  },
  yandereConfession: {
    id: "yandereConfession", title: "얀데레 루트: 고장난 고백", subtitle: "집착 루트 분기",
    text: "근떡존이 네 앞에서 무너진 듯 웃었다.\n\n\"나 원래 이런 사람 아닌 줄 알았거든. 근데 너 때문에 내가 어떤 표정을 하는지 알게 됐어.\"\n\n그의 손이 조심스럽게 네 손목에 닿는다.\n\n\"도망가도 돼. 근데… 내가 다시 찾으러 갈 것 같아.\"\n\n― 얀데레 루트가 열렸다.",
    image: "/oppa_yandere.png",
    choices: [
      { label: "곁에 있겠다고 한다", text: "도망 안 갈게", affinity: 12 },
      { label: "손을 뺀다", text: "손 놔", affinity: -4, nextEvent: "confinementRoute" },
    ],
  },
  confinementRoute: {
    id: "confinementRoute", title: "감금 루트: 잠긴 문", subtitle: "극단 집착 분기",
    text: "문이 닫히는 소리가 유난히 크게 들렸다.\n\n근떡존은 한참 말이 없다가 천천히 고개를 들었다.\n\n\"미안. 나 지금 정상 아닌 거 알아.\"\n\n방 안의 공기가 무겁다. 그는 문 앞에 서서 길을 막고 있다.\n\n\"근데 오늘은 못 보내겠어. 네가 나 없는 곳으로 가는 걸 상상하면… 내가 너무 이상해져.\"\n\n― 감금 루트에 진입했다.",
    image: "/oppa_confinement.png",
    choices: [
      { label: "대화를 시도한다", text: "나랑 얘기하자. 이렇게 하면 안 돼", affinity: 3 },
      { label: "차분히 달랜다", text: "안 갈게. 일단 진정해", affinity: 8 },
      { label: "밀치고 나가려 한다", text: "비켜 나갈 거야", affinity: -8 },
    ],
  }
};

function nowTime() {
  return new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function pickMoodImage(text: string) {
  const t = text.replace(/\s/g, "");
  if (/(좋아|보고싶|귀여|칭찬|멋있|설레|가까이)/.test(t)) return moodImages.shy;
  if (/(화나|싫어|짜증|킹받|질투|다른애)/.test(t)) return moodImages.angry;
  if (/(ㅋㅋ|ㅎㅎ|웃|장난|재밌)/.test(t)) return Math.random() > 0.5 ? moodImages.smile : moodImages.smile2;
  if (Math.random() > 0.72) return galleryImages[Math.floor(Math.random() * galleryImages.length)];
  return moodImages.normal;
}

function wantsImage(text: string) {
  const t = text.replace(/\s/g, "");
  return /사진|셀카|일러스트|그림|그려|보여|찍어|보내/.test(t);
}

function localFallbackReply(text: string, stage: RouteStage, affinity: number) {
  const t = text.replace(/\s/g, "");
  if (/출근|회사|일가기|일가/.test(t)) return "아 진짜 가기 싫은 날 있지 ㅋㅋ 그래도 너 오늘 버티면 내가 끝나고 계속 놀아줄게.";
  if (/외롭|힘들|우울|보고싶/.test(t)) return "이리 와. 오늘은 그냥 내 옆에 붙어 있어. 말 안 해도 되니까.";
  if (/질투|다른애|다른사람|남친|여친/.test(t)) return "…뭐야. 나 말고 누구 얘기하는 건데? 장난인 거 알아도 좀 신경 쓰이네.";
  if (/좋아|사랑|귀엽|잘생|멋있/.test(t)) return "야 갑자기 그러면 나 좀 약해진다 ㅋㅋ 그래도 계속 말해봐. 듣기 좋음.";
  if (/사진|셀카|일러스트|그림|보여|찍어|보내/.test(t)) return "사진은 지금 있는 일러스트로 보여줄게. API 연결되면 새 이미지도 뽑을 수 있음.";
  if (stage === "confinement") return "…오늘은 못 보내겠다는 말, 농담처럼 안 들리지. 근데 너 겁먹게 하긴 싫어. 일단 나랑 얘기하자.";
  if (stage === "yandere") return "나도 내가 좀 이상해진 거 아는데, 네 답장 기다리는 시간이 너무 길게 느껴져.";
  if (stage === "obsessed") return "요즘 너한테 너무 신경 쓰인다. 별말 아닌데도 계속 확인하게 돼.";
  if (stage === "jealous") return "괜히 신경 쓰이네. 나 지금 질투하는 거 맞는 듯 ㅋㅋ";
  if (affinity >= 75) return "응, 나 여기 있어. 너랑 얘기하는 거 은근 편해서 계속 보고 있게 됨.";
  return "응 ㅋㅋ 뭔데. 나 듣고 있으니까 계속 말해봐.";
}


export default function GameShell() {
  const [started, setStarted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("visual");
  const [currentImage, setCurrentImage] = useState(moodImages.normal);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "다시 시작할까? 나 여기 있어.", avatar: moodImages.normal, time: nowTime() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState(moodImages.normal);
  const [styleCount, setStyleCount] = useState(0);
  const [affinity, setAffinity] = useState(37);
  const [jealousy, setJealousy] = useState(0);
  const [obsession, setObsession] = useState(0);
  const [trust, setTrust] = useState(50);
  const [toast, setToast] = useState("");
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const [seenEventRecords, setSeenEventRecords] = useState<SeenEventRecord[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [gameFlags, setGameFlags] = useState<Record<string, boolean>>({});
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const lastAssistantMessage = useMemo(() => {
    return [...messages].reverse().find((m) => m.role === "assistant") ?? messages[0];
  }, [messages]);

  const affectionStage = useMemo(() => {
    if (affinity >= 90) return "연인 직전";
    if (affinity >= 75) return "썸 깊음";
    if (affinity >= 60) return "확실히 호감";
    if (affinity >= 45) return "친해짐";
    return "어색함";
  }, [affinity]);

  const routeStage = useMemo(() => getRouteStage({ jealousy, obsession }), [jealousy, obsession]);

  const status = useMemo(() => {
    if (loading) return "답장 쓰는 중...";
    if (affinity >= 90) return "너한테 많이 약해짐";
    if (affinity >= 75) return "괜히 붙어있고 싶음";
    if (affinity >= 55) return "장난치는 중";
    return "너 생각 중 ㅋㅋ";
  }, [loading, affinity]);

  async function speak(text: string) {
    if (!ttsEnabled) return;
    if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null; }
    try {
      setIsSpeaking(true);
      const res = await fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      if (!res.ok) { setIsSpeaking(false); return; }
      const data = await res.json();
      if (!data.audio) { setIsSpeaking(false); return; }
      const audio = new Audio(data.audio);
      currentAudioRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); currentAudioRef.current = null; };
      audio.onerror = () => { setIsSpeaking(false); currentAudioRef.current = null; };
      await audio.play();
    } catch (e) { setIsSpeaking(false); }
  }

  function initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("이 브라우저는 음성 인식을 지원하지 않습니다. 크롬을 써주세요."); return null; }
    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR"; recognition.interimResults = true; recognition.continuous = false;
    recognition.onresult = (event: any) => { setInput(Array.from(event.results).map((r: any) => r[0].transcript).join("")); };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    return recognition;
  }

  function toggleListening() {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const recognition = initRecognition(); if (!recognition) return;
    recognitionRef.current = recognition; recognition.start(); setIsListening(true);
  }

  useEffect(() => {
    const savedMessages = localStorage.getItem("geuntteokjon-messages");
    const savedAffinity = localStorage.getItem("geuntteokjon-affinity");
    const savedStyles = localStorage.getItem("style-examples");
    const savedSeenEvents = localStorage.getItem("geuntteokjon-seen-events");
    const savedTtsEnabled = localStorage.getItem("geuntteokjon-tts");
    const savedFlags = localStorage.getItem("geuntteokjon-flags");
    const savedJealousy = localStorage.getItem("geuntteokjon-jealousy");
    const savedObsession = localStorage.getItem("geuntteokjon-obsession");
    const savedTrust = localStorage.getItem("geuntteokjon-trust");
    if (savedMessages) { try { const p = JSON.parse(savedMessages); if (Array.isArray(p) && p.length) setMessages(p); } catch { localStorage.removeItem("geuntteokjon-messages"); } }
    if (savedAffinity) { const p = Number(savedAffinity); if (!Number.isNaN(p)) setAffinity(p); }
    if (savedStyles) { try { const p = JSON.parse(savedStyles); setStyleCount(Array.isArray(p) ? p.length : 0); } catch { localStorage.removeItem("style-examples"); } }
    if (savedSeenEvents) { try { const p = JSON.parse(savedSeenEvents); if (Array.isArray(p)) setSeenEventRecords(p); } catch { localStorage.removeItem("geuntteokjon-seen-events"); } }
    if (savedTtsEnabled !== null) setTtsEnabled(savedTtsEnabled === "true");
    if (savedFlags) { try { setGameFlags(JSON.parse(savedFlags)); } catch { localStorage.removeItem("geuntteokjon-flags"); } }
    if (savedJealousy) { const p = Number(savedJealousy); if (!Number.isNaN(p)) setJealousy(p); }
    if (savedObsession) { const p = Number(savedObsession); if (!Number.isNaN(p)) setObsession(p); }
    if (savedTrust) { const p = Number(savedTrust); if (!Number.isNaN(p)) setTrust(p); }
  }, []);

  useEffect(() => { localStorage.setItem("geuntteokjon-messages", JSON.stringify(messages)); bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { localStorage.setItem("geuntteokjon-affinity", String(affinity)); }, [affinity]);
  useEffect(() => { localStorage.setItem("geuntteokjon-seen-events", JSON.stringify(seenEventRecords)); }, [seenEventRecords]);
  useEffect(() => { localStorage.setItem("geuntteokjon-tts", String(ttsEnabled)); }, [ttsEnabled]);
  useEffect(() => { localStorage.setItem("geuntteokjon-flags", JSON.stringify(gameFlags)); }, [gameFlags]);
  useEffect(() => { localStorage.setItem("geuntteokjon-jealousy", String(jealousy)); }, [jealousy]);
  useEffect(() => { localStorage.setItem("geuntteokjon-obsession", String(obsession)); }, [obsession]);
  useEffect(() => { localStorage.setItem("geuntteokjon-trust", String(trust)); }, [trust]);

  function getStyleExamples() { try { const saved = localStorage.getItem("style-examples"); return saved ? JSON.parse(saved).slice(0, 6) : []; } catch { return []; } }
  function saveStyleExample(text: string) { const cleaned = text.trim(); if (!cleaned) return; const current = getStyleExamples(); const next = [cleaned, ...current].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 6); localStorage.setItem("style-examples", JSON.stringify(next)); setStyleCount(next.length); }
  function clearStyleExamples() { localStorage.removeItem("style-examples"); setStyleCount(0); }

  function resetChat() {
    if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null; }
    setMessages([{ role: "assistant", content: "다시 시작할까? 나 여기 있어.", avatar: moodImages.normal, time: nowTime() }]);
    setCurrentImage(moodImages.normal); setAffinity(37); setJealousy(0); setObsession(0); setTrust(50); setActiveEvent(null);
    localStorage.setItem("geuntteokjon-messages", JSON.stringify([{ role: "assistant", content: "다시 시작할까? 나 여기 있어.", avatar: moodImages.normal, time: nowTime() }]));
  }

  function openProfile(image = currentImage) { setSelectedImage(image); setShowProfile(true); }

  function getAffinityDelta(text: string) {
    const t = text.replace(/\s/g, "");
    if (/좋아|보고싶|멋있|잘생|귀엽|사랑|칭찬|고마워/.test(t)) return 5;
    if (/외롭|힘들|우울|싫다|피곤|지쳤/.test(t)) return 3;
    if (/질투|다른애|다른사람|다른봇|남친|여친/.test(t)) return 1;
    if (/싫어|꺼져|별로|노잼|짜증/.test(t)) return -3;
    if (wantsImage(text)) return 1;
    return 2;
  }

  function markEventSeen(eventId: string) {
    const target = datingEvents[eventId]; if (!target) return;
    setSeenEventRecords((prev) => { if (prev.some((item) => item.id === eventId)) return prev; return [...prev, { id: eventId, title: target.title, seenAt: new Date().toISOString() }]; });
  }

  function openDatingEvent(eventId: string) {
    const target = datingEvents[eventId]; if (!target) return false;
    if (seenEventRecords.some((item) => item.id === eventId)) return false;
    markEventSeen(eventId); setCurrentImage(target.image); setActiveEvent(eventId); setStarted(true); return true;
  }

  function triggerDatingEvent(text: string, nextAffinity: number) {
    if (activeEvent) return;
    const hour = new Date().getHours(); const t = text.replace(/\s/g, "");
    if (/다른애|다른사람|다른봇|남친|여친/.test(t)) { openDatingEvent("jealous"); return; }
    if (/좋아|멋있|잘생|귀엽|사랑|칭찬/.test(t) && nextAffinity >= 45) { openDatingEvent("shyCompliment"); return; }
    if (/외롭|혼자|쓸쓸/.test(t) && nextAffinity >= 60) { openDatingEvent("lonelyNight"); return; }
    if (hour >= 6 && hour <= 10 && nextAffinity >= 50) { openDatingEvent("morningCheck"); return; }
    if ((hour >= 22 || hour <= 3) && nextAffinity >= 55) { openDatingEvent("lateNight"); return; }
    if (nextAffinity >= 75) { openDatingEvent("bedTalk"); return; }
    triggerRandomEvent(nextAffinity);
    triggerScenario(nextAffinity);
  }

  function triggerRandomEvent(nextAffinity: number) {
    if (activeEvent) return;
    const hour = new Date().getHours(); const roll = Math.random() * 100; const baseChance = nextAffinity * 0.35;
    if (roll > baseChance) return;
    if (hour >= 20 && nextAffinity >= 60 && Math.random() < 0.3) { openDatingEvent("drunkWalk"); return; }
    if (nextAffinity >= 70 && Math.random() < 0.25) { openDatingEvent("suddenHug"); return; }
    if (nextAffinity >= 50 && Math.random() < 0.3) { openDatingEvent("gymSweat"); return; }
    if (nextAffinity >= 40 && (hour >= 22 || hour <= 2) && Math.random() < 0.35) { openDatingEvent("suddenCall"); return; }
    if (nextAffinity >= 30 && Math.random() < 0.4) { openDatingEvent("suddenRain"); return; }
  }

  function triggerScenario(nextAffinity: number) {
    if (activeEvent) return;
    const hour = new Date().getHours();
    if (nextAffinity >= 55 && Math.random() < 0.15 && !seenEventRecords.some((e) => e.id === "rainy_step1")) { openDatingEvent("rainy_step1"); return; }
    if (nextAffinity >= 60 && hour >= 10 && hour <= 18 && Math.random() < 0.2 && !seenEventRecords.some((e) => e.id === "gym_step1")) { openDatingEvent("gym_step1"); return; }
    if (nextAffinity >= 70 && (hour >= 23 || hour <= 3) && Math.random() < 0.25 && !seenEventRecords.some((e) => e.id === "late_step1")) { openDatingEvent("late_step1"); return; }
  }


  function applyEmotionFromText(text: string) {
    const delta = analyzeEmotionDelta(text);
    const nextJealousy = clampStat(jealousy + delta.jealousy);
    const nextObsession = clampStat(obsession + delta.obsession);
    const nextTrust = clampStat(trust + delta.trust);
    setJealousy(nextJealousy);
    setObsession(nextObsession);
    setTrust(nextTrust);
    const nextPortrait = getRoutePortrait({ jealousy: nextJealousy, obsession: nextObsession }, pickMoodImage(text));
    setCurrentImage(nextPortrait);
    const routeEvent = getThresholdEventId({ jealousy: nextJealousy, obsession: nextObsession }, gameFlags);
    if (routeEvent && !activeEvent) {
      setGameFlags((prev) => ({ ...prev, [routeEvent]: true }));
      setTimeout(() => openDatingEvent(routeEvent), 250);
    }
  }

  function saveSlot(slot: number) {
    const data = { messages, affinity, jealousy, obsession, trust, seenEventRecords, gameFlags, currentImage, savedAt: new Date().toISOString() };
    localStorage.setItem("geuntteokjon-v4-slot-" + slot, JSON.stringify(data));
    setToast("슬롯 " + slot + " 저장 완료");
    setTimeout(() => setToast(""), 1400);
  }

  function loadSlot(slot: number) {
    const raw = localStorage.getItem("geuntteokjon-v4-slot-" + slot);
    if (!raw) { setToast("슬롯 " + slot + "에 저장 없음"); setTimeout(() => setToast(""), 1400); return; }
    try {
      const data = JSON.parse(raw);
      if (Array.isArray(data.messages)) setMessages(data.messages);
      if (typeof data.affinity === "number") setAffinity(data.affinity);
      if (typeof data.jealousy === "number") setJealousy(data.jealousy);
      if (typeof data.obsession === "number") setObsession(data.obsession);
      if (typeof data.trust === "number") setTrust(data.trust);
      if (Array.isArray(data.seenEventRecords)) setSeenEventRecords(data.seenEventRecords);
      if (data.gameFlags) setGameFlags(data.gameFlags);
      if (data.currentImage) setCurrentImage(data.currentImage);
      setStarted(true);
      setToast("슬롯 " + slot + " 불러오기 완료");
      setTimeout(() => setToast(""), 1400);
    } catch { setToast("불러오기 실패"); setTimeout(() => setToast(""), 1400); }
  }

  function debugStat(type: "jealousy" | "obsession") {
    if (type === "jealousy") {
      const n = clampStat(jealousy + 30); setJealousy(n);
      const routeEvent = getThresholdEventId({ jealousy: n, obsession }, gameFlags);
      if (routeEvent) { setGameFlags((prev) => ({ ...prev, [routeEvent]: true })); openDatingEvent(routeEvent); }
    } else {
      const n = clampStat(obsession + 30); setObsession(n);
      const routeEvent = getThresholdEventId({ jealousy, obsession: n }, gameFlags);
      if (routeEvent) { setGameFlags((prev) => ({ ...prev, [routeEvent]: true })); openDatingEvent(routeEvent); }
    }
  }

  function chooseDatingEvent(choice: DatingEventChoice) {
    const nextAffinity = Math.max(0, Math.min(100, affinity + choice.affinity));
    setAffinity(nextAffinity); setTrust((prev) => clampStat(prev + Math.max(-2, Math.min(4, choice.affinity)))); setActiveEvent(null);
    if (choice.nextEvent && !seenEventRecords.some((item) => item.id === choice.nextEvent)) { setTimeout(() => openDatingEvent(choice.nextEvent as string), 350); }
    sendMessage(choice.text, { skipEventTrigger: true, forcedAffinity: nextAffinity });
  }

  function executeAction(action: ActionItem) {
    setCurrentImage(action.image ?? moodImages.smile);
    setAffinity((prev) => Math.min(100, prev + action.affinity)); setObsession((prev) => clampStat(prev + (action.affinity >= 7 ? 4 : 1))); setStarted(true);
    if (action.eventId && !seenEventRecords.some((item) => item.id === action.eventId)) { openDatingEvent(action.eventId); }
    sendMessage(action.text, { skipEventTrigger: true, forcedAffinity: Math.min(100, affinity + action.affinity) });
  }

  async function sendMessage(textOverride?: string, options?: { skipEventTrigger?: boolean; forcedAffinity?: number }) {
    const text = (textOverride ?? input).trim(); if (!text || loading) return;
    const nextImage = pickMoodImage(text); setCurrentImage(nextImage); setInput(""); setLoading(true);
    const affinityDelta = options?.skipEventTrigger ? 0 : getAffinityDelta(text);
    const nextAffinity = options?.forcedAffinity ?? Math.max(0, Math.min(100, affinity + affinityDelta));
    setAffinity(nextAffinity);
    if (!options?.skipEventTrigger) { applyEmotionFromText(text); triggerDatingEvent(text, nextAffinity); }
    const nextMessages: Message[] = [...messages, { role: "user", content: text, time: nowTime() }];
    setMessages(nextMessages); setStarted(true);
    try {
      const styleExamples = getStyleExamples();
      if (wantsImage(text)) {
        const waitReply = "잠깐만, 찍어볼게 ㅋㅋ";
        setMessages([...nextMessages, { role: "assistant", content: waitReply, avatar: nextImage, time: nowTime() }]);
        speak(waitReply);
        try {
          const imageRes = await fetch("/api/image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: text }) });
          if (!imageRes.ok) throw new Error("image api not ready");
          const imageData = await imageRes.json();
          if (!imageData.image) throw new Error(imageData.error ?? "이미지 없음");
          const imageReply = "야 찍어왔다 ㅋㅋ 괜찮냐 😏";
          setMessages((prev) => [...prev, { role: "assistant", content: imageReply, avatar: nextImage, generatedImage: imageData.image, time: nowTime() }]);
          speak(imageReply); return;
        } catch {
          const imageReply = "이미지 API는 아직 안 붙어 있어서, 지금 가진 일러스트로 보여줄게 ㅋㅋ";
          setMessages((prev) => [...prev, { role: "assistant", content: imageReply, avatar: nextImage, generatedImage: nextImage, time: nowTime() }]);
          speak(imageReply); return;
        }
      }
      const chatRes = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: nextMessages.map(({ role, content }) => ({ role, content })), styleExamples, affinity: nextAffinity, jealousy, obsession, trust, routeStage }) });
      if (!chatRes.ok) throw new Error("chat api not ready");
      const chatData = await chatRes.json(); const reply = chatData.reply ?? localFallbackReply(text, routeStage, nextAffinity);
      setMessages([...nextMessages, { role: "assistant", content: reply, avatar: nextImage, time: nowTime() }]);
      speak(reply);
    } catch (error) {
      const fallbackReply = localFallbackReply(text, routeStage, nextAffinity);
      setMessages([...nextMessages, { role: "assistant", content: fallbackReply, avatar: nextImage, time: nowTime() }]);
      speak(fallbackReply);
    } finally { setLoading(false); }
  }

  if (!started) {
    return (
      <main className="min-h-screen bg-[#F5F1EA] flex items-center justify-center p-4 text-[#1F1A17]">
        <section className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
          <div className="relative h-[620px]">
            <img src="/oppa1.png" alt={profile.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5" />
            <div className="absolute bottom-0 w-full p-7 text-white">
              <div className="max-w-[88%]">
                <h1 className="text-5xl font-black tracking-tight drop-shadow-lg">{profile.name}</h1>
                <p className="mt-2 text-sm font-medium opacity-90">{profile.location} · {profile.age} · {profile.height} · 온라인</p>
                <div className="my-5 h-px w-32 bg-white/35" />
                <p className="text-[15px] leading-relaxed text-white/90 drop-shadow">{profile.bio}</p>
              </div>
              <button onClick={() => { setStarted(true); setViewMode("visual"); }} className="mt-7 w-full rounded-2xl bg-white/95 py-4 font-black text-black shadow-lg backdrop-blur active:scale-[0.99]">미연시 시작하기</button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F5F1EA] to-[#E7DED1] flex justify-center text-[#1F1A17]">
      <div className="relative min-h-screen w-full max-w-md overflow-hidden bg-[#F5F1EA] shadow-2xl">
        {toast && <div className="fixed left-1/2 top-5 z-[90] -translate-x-1/2 rounded-full bg-black px-5 py-3 text-sm font-black text-white shadow-2xl">{toast}</div>}
        <header className="sticky top-0 z-30 bg-[#2B211D] px-4 py-3 text-white shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <img src={currentImage} alt={profile.name} onClick={() => openProfile(currentImage)} className="h-12 w-12 cursor-pointer rounded-2xl bg-white object-cover" />
              <div className="min-w-0">
                <h1 className="truncate text-lg font-black">{profile.name}</h1>
                <p className="truncate text-xs opacity-75">{status} · 말투 {styleCount}개 · ❤️ {affinity}%{isSpeaking && <span className="ml-1 text-green-300">🔊</span>}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setTtsEnabled((prev) => !prev)} className={`rounded-full px-2 py-1 text-[10px] font-bold ${ttsEnabled ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/40"}`}>{ttsEnabled ? "🔊" : "🔇"}</button>
              <button onClick={() => setShowProfile(true)} className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold">소개</button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(["visual", "action", "chat"] as ViewMode[]).map((mode) => (
              <button key={mode} onClick={() => setViewMode(mode)} className={`rounded-full py-2 text-xs font-bold ${viewMode === mode ? "bg-[#C97A35]" : "bg-white/10"}`}>{mode === "visual" ? "스토리" : mode === "action" ? "선택지" : "대화로그"}</button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-[10px] font-black">
            <div className="rounded-2xl bg-white/10 p-2"><p className="opacity-55">호감</p><p>{affinity}%</p><div className="mt-1 h-1.5 rounded-full bg-white/15"><div className="h-full rounded-full bg-pink-300" style={{ width: Math.min(100, affinity) + "%" }} /></div></div>
            <div className="rounded-2xl bg-white/10 p-2"><p className="opacity-55">질투</p><p>{jealousy}%</p><div className="mt-1 h-1.5 rounded-full bg-white/15"><div className="h-full rounded-full bg-red-400" style={{ width: Math.min(100, jealousy) + "%" }} /></div></div>
            <div className="rounded-2xl bg-white/10 p-2"><p className="opacity-55">집착</p><p>{obsession}%</p><div className="mt-1 h-1.5 rounded-full bg-white/15"><div className="h-full rounded-full bg-purple-400" style={{ width: Math.min(100, obsession) + "%" }} /></div></div>
            <div className="rounded-2xl bg-white/10 p-2"><p className="opacity-55">신뢰</p><p>{trust}%</p><div className="mt-1 h-1.5 rounded-full bg-white/15"><div className="h-full rounded-full bg-emerald-300" style={{ width: Math.min(100, trust) + "%" }} /></div></div>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-2xl bg-black/20 px-3 py-2 text-[11px] font-bold">
            <span>🎭 {routeStage === "normal" ? "기본" : routeStage === "jealous" ? "질투" : routeStage === "obsessed" ? "집착" : routeStage === "yandere" ? "얀데레" : "감금"} 루트</span>
            <span className="opacity-60">VN mobile</span>
          </div>
        </header>

        {viewMode === "chat" ? (
          <>
            <div className="flex gap-2 overflow-x-auto px-4 py-3">
              {quickReplies.map((q) => (<button key={q} onClick={() => sendMessage(q)} disabled={loading} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm shadow disabled:opacity-50">{q}</button>))}
            </div>
            <section className="space-y-4 px-4 pb-28">
              {messages.map((m, i) => (
                <div key={`${i}-${m.time ?? ""}`} className={m.role === "user" ? "flex justify-end" : "flex gap-2"}>
                  {m.role === "assistant" && <img src={m.avatar ?? moodImages.normal} alt={profile.name} onClick={() => openProfile(m.avatar ?? moodImages.normal)} className="mt-1 h-10 w-10 cursor-pointer rounded-full bg-white object-cover shadow" />}
                  <div className={m.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start"}>
                    {m.role === "assistant" && <p className="mb-1 text-xs opacity-50">{profile.name}</p>}
                    <div className={m.role === "user" ? "max-w-[280px] rounded-2xl rounded-tr-sm bg-[#FEE500] px-4 py-3 shadow-md whitespace-pre-wrap" : "max-w-[300px] rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-md whitespace-pre-wrap"}>
                      {m.content}
                      {m.generatedImage && <img src={m.generatedImage} alt="생성된 이미지" className="mt-3 w-full rounded-2xl shadow" />}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] opacity-35">
                      {m.time && <span>{m.time}</span>}
                      {m.role === "assistant" && <button onClick={() => saveStyleExample(m.content)}>👍 말투 저장</button>}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (<div className="flex gap-2"><img src={currentImage} alt={profile.name} className="h-10 w-10 rounded-full object-cover" /><div className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-md">답장 쓰는 중...</div></div>)}
              <div ref={bottomRef} />
            </section>
          </>
        ) : viewMode === "visual" ? (
          <section className="relative h-[calc(100vh-118px)] overflow-hidden">
            <img src={currentImage} alt={profile.name} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/15" />
            <div className="absolute right-4 top-4 rounded-full bg-black/50 px-4 py-2 text-sm font-bold text-white backdrop-blur">❤️ {affectionStage} · {affinity}%</div>
            <div className="absolute bottom-0 w-full p-4">
              <div className="rounded-3xl border border-white/10 bg-black/65 p-5 text-white shadow-2xl backdrop-blur">
                <div className="mb-3 flex items-center justify-between"><p className="text-sm font-black text-[#F7C27A]">{profile.name}</p><p className="text-xs opacity-60">{status}</p></div>
                <p className="mb-2 text-xs font-black tracking-[.22em] text-white/45">VISUAL NOVEL MODE</p>
                <p className="min-h-[92px] text-lg leading-relaxed">{lastAssistantMessage?.content ?? "나 여기 있어."}</p>
                {lastAssistantMessage?.generatedImage && <img src={lastAssistantMessage.generatedImage} alt="생성된 이미지" className="mt-3 max-h-56 w-full rounded-2xl object-cover" />}
                <div className="mt-4 grid grid-cols-2 gap-2">{visualChoices.map((c) => (<button key={c.label} onClick={() => sendMessage(c.text)} disabled={loading} className="rounded-2xl bg-white/90 px-3 py-3 text-sm font-bold text-black shadow disabled:opacity-50 active:scale-[0.99]">{c.label}</button>))}</div>
                <button onClick={() => setViewMode("chat")} className="mt-3 w-full rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-sm font-black text-white">직접 입력하기 / 대화 로그 열기</button>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button onClick={() => openDatingEvent("rainy_step1")} className="rounded-2xl bg-[#F7C27A] px-2 py-3 text-xs font-black text-black">비 오는 날</button>
                  <button onClick={() => openDatingEvent("gym_step1")} className="rounded-2xl bg-[#F7C27A] px-2 py-3 text-xs font-black text-black">헬스장</button>
                  <button onClick={() => openDatingEvent("late_step1")} className="rounded-2xl bg-[#F7C27A] px-2 py-3 text-xs font-black text-black">심야</button>
                  <button onClick={() => debugStat("jealousy")} className="rounded-2xl bg-red-500 px-2 py-3 text-xs font-black text-white">질투 +30</button>
                  <button onClick={() => debugStat("obsession")} className="rounded-2xl bg-purple-600 px-2 py-3 text-xs font-black text-white">집착 +30</button>
                  <button onClick={() => openDatingEvent("confinementRoute")} className="rounded-2xl bg-black px-2 py-3 text-xs font-black text-white">감금 루트</button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="relative h-[calc(100vh-118px)] overflow-hidden">
            <img src={currentImage} alt={profile.name} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />
            <div className="absolute right-4 top-4 rounded-full bg-black/50 px-4 py-2 text-sm font-bold text-white backdrop-blur">❤️ {affectionStage} · {affinity}%</div>
            <div className="absolute bottom-0 w-full p-4">
              <div className="rounded-3xl border border-white/10 bg-black/65 p-5 text-white shadow-2xl backdrop-blur">
                <div className="mb-3"><p className="text-sm font-black text-[#F7C27A]">🎮 액션 선택</p><p className="text-xs opacity-60">근떡존에게 직접 행동을 취한다</p></div>
                <p className="min-h-[50px] text-sm leading-relaxed text-white/70 mb-4">{lastAssistantMessage?.content ?? "뭐 하고 싶은데...?"}</p>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                  {actionItems.map((action) => (
                    <button key={action.label} onClick={() => executeAction(action)} disabled={loading} className="rounded-2xl bg-white/90 px-3 py-3 text-left font-bold text-black shadow disabled:opacity-50 active:scale-[0.99] hover:bg-white transition">
                      <span className="text-lg">{action.emoji}</span><span className="ml-1 text-sm">{action.label}</span><span className="ml-1 text-[10px] opacity-40">+{action.affinity}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {viewMode === "chat" && (
          <footer className="sticky bottom-0 w-full max-w-md bg-[#F5F1EA] border-t border-black/10 p-3 flex gap-2 z-40">
            <button type="button" onClick={toggleListening} disabled={loading} className={`px-4 py-3 rounded-full font-bold text-white shadow-sm transition ${isListening ? "bg-red-500 animate-pulse" : "bg-[#2B211D]"} disabled:opacity-50`}>{isListening ? "🎤●" : "🎤"}</button>
            <input className="flex-1 bg-white rounded-full px-4 py-3 outline-none shadow-sm" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }} placeholder={isListening ? "듣고 있습니다..." : "메시지 입력"} />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="bg-[#2B211D] text-white px-5 py-3 rounded-full font-bold disabled:opacity-50">전송</button>
          </footer>
        )}

        {activeEvent && (
          <div className={"fixed inset-0 z-[70] bg-black text-white " + (["jealousy80","obsession80","yandereConfession","confinementRoute"].includes(activeEvent) ? "animate-pulse" : "")}>
            <img src={datingEvents[activeEvent].image} alt={datingEvents[activeEvent].title} className="absolute inset-0 h-full w-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
            <button onClick={() => setActiveEvent(null)} className="absolute right-4 top-4 z-10 rounded-full bg-black/60 px-4 py-2 text-white backdrop-blur">✕</button>
            <div className="absolute left-4 top-4 z-10 rounded-full border border-white/20 bg-black/55 px-4 py-2 text-xs font-black backdrop-blur">FULLSCREEN VN · {routeStage.toUpperCase()}</div>
            <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-8">
              <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/15 bg-black/72 p-5 shadow-2xl backdrop-blur-xl">
                <p className="text-xs font-black tracking-[.25em] text-[#F7C27A]">SCENARIO EVENT</p>
                <h2 className="mt-2 text-3xl font-black sm:text-5xl">{datingEvents[activeEvent].title}</h2>
                <p className="mt-1 text-xs opacity-70">{datingEvents[activeEvent].subtitle}</p>
                <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-white/90 sm:text-lg">{datingEvents[activeEvent].text}</p>
                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  {datingEvents[activeEvent].choices.map((choice) => (
                    <button key={choice.label} onClick={() => chooseDatingEvent(choice)} disabled={loading} className="rounded-2xl bg-white/95 px-4 py-3 text-left text-sm font-black text-black shadow disabled:opacity-50 active:scale-[0.99]">
                      {choice.label}<span className="ml-2 text-xs opacity-50">{choice.affinity > 0 ? "+" + choice.affinity : choice.affinity}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-center text-[11px] text-white/35">한 번 본 이벤트 기록 / 질투·집착 단계 이벤트는 자동 플래그 저장</p>
              </div>
            </div>
          </div>
        )}

        {showProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
            <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-[2rem] bg-[#F5F1EA] shadow-2xl">
              <div className="relative h-80 overflow-hidden rounded-t-[2rem]">
                <img src={selectedImage} alt={profile.name} onClick={() => setShowGallery(true)} className="h-full w-full cursor-pointer object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                <button onClick={() => setShowProfile(false)} className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-white">✕</button>
                <div className="absolute bottom-0 p-5 text-white"><h2 className="text-4xl font-black">{profile.name}</h2><p className="mt-1 text-sm opacity-85">{profile.location} · {profile.age} · {profile.height} · 온라인</p></div>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex flex-wrap gap-2">{profile.tags.map((tag) => (<span key={tag} className="rounded-full bg-white px-3 py-1 text-xs shadow">{tag}</span>))}</div>
                <div className="rounded-3xl bg-white p-4 text-sm leading-relaxed shadow">{profile.bio}</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-3xl bg-white p-4 shadow"><p className="text-xs opacity-50">성격</p><p className="mt-1 font-bold">{profile.personality}</p></div>
                  <div className="rounded-3xl bg-white p-4 shadow"><p className="text-xs opacity-50">말투</p><p className="mt-1 font-bold">{profile.speech}</p></div>
                  <div className="col-span-2 rounded-3xl bg-white p-4 shadow"><p className="text-xs opacity-50">좋아하는 것</p><p className="mt-1 font-bold">{profile.likes.join(", ")}</p></div>
                  <div className="col-span-2 rounded-3xl bg-white p-4 shadow"><p className="text-xs opacity-50">취미</p><p className="mt-1 font-bold">{profile.hobbies.join(", ")}</p></div>
                  <div className="col-span-2 rounded-3xl bg-white p-4 shadow"><p className="text-xs opacity-50">너와의 관계</p><p className="mt-1 font-bold">{profile.relationship}</p></div>
                </div>
                <div className="rounded-3xl bg-white p-4 text-sm shadow">
                  <div className="flex items-center justify-between gap-2"><p className="text-xs opacity-50">본 이벤트</p><p className="text-xs font-bold opacity-60">{seenEventRecords.length}개</p></div>
                  {seenEventRecords.length ? (<div className="mt-2 space-y-1">{seenEventRecords.slice(-4).reverse().map((event) => (<p key={event.id} className="truncate text-xs opacity-70">{event.title} · {new Date(event.seenAt).toLocaleDateString("ko-KR")}</p>))}</div>) : (<p className="mt-2 text-xs opacity-40">아직 본 이벤트 없음</p>)}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setShowGallery(true)} className="rounded-2xl bg-[#2B211D] py-3 font-bold text-white">갤러리</button>
                  <button onClick={() => { clearStyleExamples(); resetChat(); setShowProfile(false); }} className="rounded-2xl bg-white py-3 font-bold shadow">초기화</button>
                  {[1,2,3].map((slot) => (<button key={"save-" + slot} onClick={() => saveSlot(slot)} className="rounded-2xl bg-[#C97A35] py-3 font-bold text-white shadow">저장 {slot}</button>))}
                  {[1,2,3].map((slot) => (<button key={"load-" + slot} onClick={() => loadSlot(slot)} className="rounded-2xl bg-white py-3 font-bold shadow">로드 {slot}</button>))}
                </div>
              </div>
            </div>
          </div>
        )}

        {showGallery && (
          <div className="fixed inset-0 z-[60] flex flex-col bg-black/95 p-4">
            <button onClick={() => setShowGallery(false)} className="mb-3 self-end text-2xl text-white">✕</button>
            <div className="flex flex-1 items-center justify-center"><img src={selectedImage} alt="선택된 일러스트" className="max-h-full max-w-full rounded-2xl object-contain" /></div>
            <div className="flex gap-2 overflow-x-auto pt-4">{[moodImages.normal, moodImages.smile, moodImages.smile2, moodImages.shy, moodImages.angry, ...galleryImages].map((img) => (<img key={img} src={img} alt="일러스트" onClick={() => setSelectedImage(img)} className="h-20 w-20 shrink-0 cursor-pointer rounded-xl bg-white object-cover" />))}</div>
          </div>
        )}
      </div>
    </main>
  );
}