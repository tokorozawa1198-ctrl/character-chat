import type { ActionItem } from "../types";

export const profile = {
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

export const moodImages = {
  normal: "/oppa_normal.png",
  smile: "/oppa_smile.png",
  smile2: "/oppa_smile2.png",
  shy: "/oppa_shy.png",
  angry: "/oppa_angry.png",
};

export const quickReplies = [
  "오늘 회사 가기 싫다",
  "사진 보내줘",
  "운동 끝나고 셀카 찍어줘",
  "나 좀 칭찬해줘",
  "오늘 좀 외롭다",
  "화장실 가지말고 오줌 참아",
  "질투해봐 ㅋ",
  "니 겨드랑이에 코박아봐",
];

export const galleryImages = [
  "/oppa1.png", "/oppa2.png", "/oppa3.png", "/oppa5.png", "/oppa6.png",
  "/oppa7.png", "/oppa8.png", "/oppa9.png", "/oppa10.png", "/oppa11.png",
  "/oppa12.png", "/oppa13.png", "/oppa14.png", "/oppa15.png", "/oppa16.png",
  "/oppa17.png", "/oppa18.png", "/oppa19.png", "/oppa20.png", "/oppa21.png",
  "/oppa22.png", "/oppa23.png", "/oppa24.png", "/oppa25.png", "/oppa26.png",
  "/oppa27.png", "/oppa28.png", "/oppa29.png", "/oppa30.png", "/oppa31.png",
  "/oppa32.png", "/oppa33.png", "/oppa34.png", "/oppa35.png", "/oppa36.png",
  "/oppa37.png", "/oppa38.png", "/oppa39.png", "/oppa40.png", "/oppa41.png",

];

export const visualChoices = [
  { label: "칭찬한다", text: "너 오늘 좀 멋있다" },
  { label: "장난친다", text: "야 너 지금 좀 귀엽다 ㅋㅋ" },
  { label: "가까이 간다", text: "나 지금 너한테 좀 가까이 가고 싶음" },
  { label: "사진 부탁한다", text: "지금 모습 사진 보내줘" },
];

export const actionItems: ActionItem[] = [
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
