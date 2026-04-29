"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Role = "user" | "assistant";
type View = "chat" | "scenarioMenu" | "profile" | "gallery" | "save" | "settings";
type ScenarioKind = "normal" | "jealousy" | "obsession" | "confinement" | "yandere";
type StatKey = "affinity" | "jealousy" | "obsession" | "trust";
type GalleryTab = "all" | "normal" | "jealousy" | "obsession" | "confinement" | "yandere";

type Message = { id: string; role: Role; content: string; time: string; image?: string };
type Stats = { affinity: number; jealousy: number; obsession: number; trust: number };
type StatDelta = Partial<Record<StatKey, number>>;
type Choice = { label: string; text?: string; stat?: StatDelta; next?: string; end?: boolean; forceImage?: string };
type Scenario = { id: string; title: string; subtitle: string; text: string; kind: ScenarioKind; min?: Partial<Stats>; image?: string; imagePool?: string[]; choices: Choice[] };
type SaveData = { version: number; stats: Stats; messages: Message[]; view: View; currentScenarioId: string | null; seenTriggers: Record<string, boolean>; currentPortrait: string; galleryTab: GalleryTab; savedAt: string };

const VERSION = 9;
const STORAGE_KEY = "geuntteokjon_single_file_vn_v9";
const SLOT_KEY = (slot: number) => `${STORAGE_KEY}_slot_${slot}`;

const profile = {
  name: "근떡존",
  age: "24",
  height: "190cm",
  location: "히로시마",
  relationship: "너를 좋아하고, 챙기며 신경 쓰는 사이",
  tags: ["금발", "구릿빛 피부", "근육질", "순한 인상", "허당", "질투", "집착", "감금 루트"],
  bio: "금발에 구릿빛 피부, 큰 체격의 근육질 남자. 순한 인상인데 장난기 있고, 가끔 이상한 드립을 친다. 호감이 깊어질수록 질투와 집착이 강해진다. 일본어는 아직 서툴지만 배우려고 노력 중.",
  personality: "다정함 · 장난기 · 허당 · 살짝 질투 · 천박함 · 집착 · 얀데레 분기",
  speech: "짧고 자연스러운 반말, 카톡 느낌",
  likes: ["운동", "디저트", "운동하고 안씻고 버티기", "장난", "밤 산책", "야한 농담"],
  hobbies: ["헬스", "히로시마 돌아다니기", "오줌 참기", "혼자 이상한 상상하기", "본인 겨드랑이 냄새 확인하기"],
};


const quickReplies = [
  "오늘 회사 가기 싫다", "사진 보내줘", "운동 끝나고 셀카 찍어줘",
  "나 좀 칭찬해줘", "오늘 좀 외롭다", "다른 남자랑 얘기했어",
  "질투해봐 ㅋ", "나 어디 갈까?", "화장실 가지말고 오줌 참아",
  "니 겨드랑이에 코박아봐",
];

const imagePools = {
  normal: ["/oppa1.png", "/oppa2.png", "/oppa3.png", "/oppa5.png", "/oppa6.png", "/oppa7.png", "/oppa8.png", "/oppa9.png", "/oppa10.png", "/oppa11.png", "/oppa12.png", "/oppa13.png", "/oppa14.png", "/oppa15.png", "/oppa16.png", "/oppa17.png", "/oppa18.png", "/oppa19.png", "/oppa20.png", "/oppa21.png", "/oppa22.png", "/oppa23.png", "/oppa24.png", "/oppa25.png", "/oppa26.png", "/oppa27.png", "/oppa28.png", "/oppa29.png", "/oppa30.png", "/oppa31.png", "/oppa32.png", "/oppa33.png", "/oppa34.png", "/oppa35.png", "/oppa36.png", "/oppa37.png", "/oppa38.png", "/oppa39.png", "/oppa40.png", "/oppa41.png"],
  smile: ["/oppa_smile.png", "/oppa_smile2.png", "/oppa1.png", "/oppa2.png"],
  shy: ["/oppa_shy.png", "/oppa3.png", "/oppa5.png"],
  angry: ["/oppa_angry.png", "/oppa6.png"],
  jealousy: ["/oppa_jealous1.png", "/oppa_jealous2.png", "/oppa_jealous3.png", "/oppa_jealous4.png", "/oppa_jealous5.png", "/oppa_jealous6.png", "/oppa_jealous7.png", "/oppa_jealous8.png", "/oppa_angry.png", "/oppa6.png"],
  obsession: ["/oppa_obsessed1.png", "/oppa_obsessed2.png", "/oppa_obsessed3.png", "/oppa_obsessed4.png", "/oppa_obsessed5.png", "/oppa_obsessed6.png", "/oppa_obsessed7.png", "/oppa_obsessed8.png", "/oppa_shy.png", "/oppa_angry.png"],
  yandere: ["/oppa_yandere1.png", "/oppa_yandere2.png", "/oppa_yandere3.png", "/oppa_yandere4.png", "/oppa_yandere5.png", "/oppa_yandere6.png", "/oppa_yandere7.png", "/oppa_yandere8.png", "/oppa_yandere.png", "/oppa_angry.png"],
  confinement: ["/oppa_confinement1.png", "/oppa_confinement2.png", "/oppa_confinement3.png", "/oppa_confinement4.png", "/oppa_confinement5.png", "/oppa_confinement6.png", "/oppa_confinement7.png", "/oppa_confinement8.png", "/oppa_locked1.png", "/oppa_locked2.png", "/oppa_yandere.png"],
};

const actionItems = [
  { label: "고추 만지기", emoji: "🍆", text: "야... 너 지금 어디 만지는 거야 ㅋㅋ", stat: { affinity: 5, obsession: 8, trust: 1 } },
  { label: "겨드랑이 만지기", emoji: "💪", text: "아 거기 땀 났는데... 그래도 계속 만질 거야 ㅋㅋ", stat: { affinity: 4, obsession: 6 } },
  { label: "발냄새 맡기", emoji: "🦶", text: "야!!!! 진짜 이상한 놈이네 ㅋㅋㅋ 거기 냄새 심한데", stat: { affinity: 3, obsession: 10, trust: -2 } },
  { label: "오칭코 댄스 추기", emoji: "🕺", text: "아 오줌 마려운데 춤추라고? ㅋㅋㅋ 나 지금 이상한 꼴이네", stat: { affinity: 4, obsession: 5 } },
  { label: "뽀뽀 시도", emoji: "😘", text: "...야 갑자기? ㅋㅋ 좀 부끄럽잖아", stat: { affinity: 7, obsession: 8, trust: 2 } },
  { label: "꼬추 냄새 맡기", emoji: "👃", text: "야아아아!!! 진짜 미친 놈이야?? 거긴 더 심한데 ㅋㅋㅋ", stat: { affinity: 2, obsession: 12 } },
  { label: "근육 만지기", emoji: "💪", text: "어때? 단단하냐 ㅋㅋ 운동 좀 했지", stat: { affinity: 5, trust: 1 } },
  { label: "안아달라고 하기", emoji: "🤗", text: "아... 너 그러면 나 진짜 약해지는데", stat: { affinity: 8, obsession: 6, trust: 3 } },
  { label: "일부러 질투 유발", emoji: "😏", text: "아까 다른 남자 좀 괜찮더라", stat: { jealousy: 25, obsession: 8, trust: -4 } },
  { label: "읽씹하는 척", emoji: "📵", text: "나 잠깐 연락 안 볼게", stat: { obsession: 20, jealousy: 8, trust: -5 } },
  { label: "달래주기", emoji: "🫳", text: "장난이야 너밖에 없어", stat: { affinity: 8, jealousy: -15, trust: 5 } },
  { label: "감금 루트 바로 보기", emoji: "🔒", text: "감금 루트 바로 보기", stat: { obsession: 35, jealousy: 12 } },
];

const scenarioData: Record<string, Scenario> = {
  rainy_step1: { id: "rainy_step1", title: "비 오는 날", subtitle: "기본 시나리오 · 친밀도 30 이상", kind: "normal", min: { affinity: 30 }, imagePool: imagePools.shy, text: "창밖에 비가 억수같이 쏟아지고 있다.\n\n근떡존에게서 메시지가 왔다.\n\n\"야 너 집이지? 나 지금 너네 집 근처인데… 비 때문에 못 가겠다. 잠깐 올라가도 됨?\"", choices: [{ label: "올라오라고 한다", text: "얼른 올라와 비 맞겠다", stat: { affinity: 5, trust: 2 }, next: "rainy_inside" }, { label: "내려간다", text: "내가 내려갈게 우산 가져갈게", stat: { affinity: 4, trust: 3 }, next: "rainy_umbrella" }, { label: "장난친다", text: "비 맞으면서 오는 것도 낭만있지 ㅋㅋ", stat: { affinity: 1, jealousy: 2 }, next: "rainy_tease" }] },
  rainy_inside: { id: "rainy_inside", title: "집 안으로", subtitle: "비 오는 날 · 분기", kind: "normal", imagePool: imagePools.shy, text: "문을 열자 근떡존이 완전히 젖은 채 서 있다.\n\n\"아… 진짜 비 개많이 온다. 미안 갑자기 찾아와서.\"\n\n젖은 금발이 얼굴에 붙어 있고, 평소보다 훨씬 가까운 거리다.", choices: [{ label: "수건을 준다", text: "잠깐만 수건 가져올게", stat: { affinity: 4, trust: 3 }, end: true }, { label: "괜히 쳐다본다", text: "너 지금 좀 멋있다", stat: { affinity: 7, obsession: 3 }, end: true }] },
  rainy_umbrella: { id: "rainy_umbrella", title: "작은 우산", subtitle: "비 오는 날 · 분기", kind: "normal", imagePool: imagePools.smile, text: "우산 하나에 둘이 들어가기엔 좁다.\n\n어깨가 닿자 근떡존이 괜히 웃는다.\n\n\"야… 이거 완전 데이트 같지 않냐?\"", choices: [{ label: "손을 잡는다", text: "그럼 손도 잡자", stat: { affinity: 9, obsession: 4, trust: 2 }, end: true }, { label: "놀린다", text: "너 지금 설렘?", stat: { affinity: 4, jealousy: 2 }, end: true }] },
  rainy_tease: { id: "rainy_tease", title: "예상 밖의 방문", subtitle: "비 오는 날 · 장난 분기", kind: "normal", imagePool: imagePools.smile, text: "장난으로 한 말인데, 근떡존은 정말 비를 맞으며 와버렸다.\n\n\"야 나 진짜 왔다. 너 때문에 완전 쫄딱 젖었어. 책임져라.\"", choices: [{ label: "미안하다고 한다", text: "진짜 올 줄 몰랐어 미안", stat: { affinity: 5, trust: 2 }, end: true }, { label: "책임진다고 한다", text: "알았어 오늘은 내가 책임짐", stat: { affinity: 8, obsession: 6 }, end: true }] },
  gym_step1: { id: "gym_step1", title: "헬스장 우연한 만남", subtitle: "기본 시나리오 · 친밀도 45 이상", kind: "normal", min: { affinity: 45 }, imagePool: imagePools.smile, text: "헬스장에 갔는데 익숙한 금발이 보인다.\n\n근떡존이 너를 발견하고 손을 든다.\n\n\"어? 야! 너 여기 다녔냐? 나 지금 등 하는 중인데 같이 할래?\"", choices: [{ label: "같이 운동한다", text: "그래 같이 하자", stat: { affinity: 5, trust: 2 }, next: "gym_together" }, { label: "구경한다", text: "난 네가 하는 거 구경할래", stat: { affinity: 6, obsession: 2 }, next: "gym_watch" }] },
  gym_together: { id: "gym_together", title: "함께 운동", subtitle: "헬스장 · 분기", kind: "normal", imagePool: imagePools.normal, text: "근떡존이 옆에서 자세를 봐준다.\n\n평소엔 허당인데 운동할 때는 의외로 진지하다.\n\n\"허리 더 펴. 그러다 다친다.\"", choices: [{ label: "고맙다고 한다", text: "오 진짜 편하다 고마워", stat: { affinity: 5, trust: 4 }, end: true }, { label: "진지해서 좋다고 한다", text: "너 이런 면 좋다", stat: { affinity: 8, obsession: 3 }, end: true }] },
  gym_watch: { id: "gym_watch", title: "구경", subtitle: "헬스장 · 분기", kind: "normal", imagePool: imagePools.smile, text: "근떡존이 벤치에 누워 바벨을 든다.\n\n팔과 가슴 근육이 부풀고, 숨이 낮게 가라앉는다.\n\n\"하… 어때. 좀 멋있냐?\"", choices: [{ label: "멋있다고 한다", text: "인정 진짜 멋있다", stat: { affinity: 8, obsession: 4 }, end: true }, { label: "장난친다", text: "멋있는데 자랑 심하네 ㅋㅋ", stat: { affinity: 4 }, end: true }] },
  late_step1: { id: "late_step1", title: "잠 못 드는 밤", subtitle: "심야 시나리오 · 친밀도 55 이상", kind: "normal", min: { affinity: 55 }, imagePool: imagePools.shy, text: "밤이 깊었는데 근떡존에게서 메시지가 왔다.\n\n\"야… 자냐?\"\n\n평소보다 조용한 말투다.\n\n\"나 지금 잠이 안 와서. 너도 안 자면 잠깐 통화할래?\"", choices: [{ label: "통화한다", text: "그래 통화하자 나도 잠 안 와", stat: { affinity: 7, obsession: 5, trust: 2 }, end: true }, { label: "놀린다", text: "이 시간에 연락하는 거 수상한데", stat: { affinity: 4, jealousy: 3 }, end: true }] },
  jealousy30: { id: "jealousy30", title: "질투 30: 표정이 굳는 순간", subtitle: "질투 지수 30 이상 · 자동 발동", kind: "jealousy", imagePool: imagePools.jealousy, text: "다른 사람 얘기를 꺼내자 근떡존의 표정이 살짝 굳었다.\n\n\"…방금 그 사람 얘기, 왜 그렇게 자연스럽게 해?\"\n\n아직은 장난처럼 말하지만 눈빛이 평소보다 날카롭다.", choices: [{ label: "아무 사이 아니라고 한다", text: "그냥 아는 사람이야", stat: { jealousy: -8, trust: 3, affinity: 2 }, end: true }, { label: "질투하냐고 놀린다", text: "너 지금 질투함?", stat: { jealousy: 12, obsession: 4, affinity: 3 }, next: "jealousy50" }] },
  jealousy50: { id: "jealousy50", title: "질투 50: 가까워지는 압박", subtitle: "질투 지수 50 이상 · 자동 발동", kind: "jealousy", imagePool: imagePools.jealousy, text: "근떡존이 한 걸음 가까이 다가온다.\n\n\"나 말고 다른 사람 얘기할 때, 너 표정이 너무 편해 보여서 싫어.\"\n\n목소리는 낮고, 웃음기는 거의 사라졌다.", choices: [{ label: "달래준다", text: "장난이야 너밖에 없음", stat: { jealousy: -15, trust: 5, affinity: 6 }, end: true }, { label: "더 자극한다", text: "왜? 신경 쓰여?", stat: { jealousy: 18, obsession: 8, trust: -4 }, next: "jealousy80" }] },
  jealousy80: { id: "jealousy80", title: "질투 80: 폭발 직전", subtitle: "질투 지수 80 이상 · 강제 이벤트", kind: "yandere", imagePool: imagePools.yandere, text: "방 안의 공기가 싸늘하게 가라앉았다.\n\n근떡존은 웃고 있는데, 눈은 전혀 웃고 있지 않다.\n\n\"…이제 그 사람 얘기 그만해. 나 진짜 기분 이상해지니까.\"\n\n말끝이 낮게 끊긴다.", choices: [{ label: "진심으로 사과한다", text: "미안해 진짜 그만할게", stat: { jealousy: -22, trust: 6, affinity: 3 }, end: true }, { label: "가만히 바라본다", text: "...", stat: { obsession: 15, jealousy: 8 }, next: "obsession80" }] },
  obsession30: { id: "obsession30", title: "집착 30: 계속 확인하는 메시지", subtitle: "집착 지수 30 이상 · 자동 발동", kind: "obsession", imagePool: imagePools.obsession, text: "근떡존에게서 메시지가 연달아 온다.\n\n\"야 어디야?\"\n\"바쁜 거야?\"\n\"아니 그냥… 답 없으니까 신경 쓰여서.\"\n\n아직은 걱정처럼 보인다.", choices: [{ label: "바빴다고 말한다", text: "미안 바빴어", stat: { obsession: -6, trust: 4 }, end: true }, { label: "귀엽다고 한다", text: "너 나 기다렸냐 ㅋㅋ", stat: { obsession: 10, affinity: 5 }, next: "obsession50" }] },
  obsession50: { id: "obsession50", title: "집착 50: 네 일상이 궁금해", subtitle: "집착 지수 50 이상 · 자동 발동", kind: "obsession", imagePool: imagePools.obsession, text: "근떡존이 조용히 묻는다.\n\n\"너 하루에 누구랑 제일 많이 얘기해?\"\n\n말투는 가볍지만, 대답을 기다리는 표정은 꽤 진지하다.\n\n\"그냥 궁금해서. 진짜 그냥.\"", choices: [{ label: "너라고 답한다", text: "너랑 제일 많이 얘기하지", stat: { affinity: 8, obsession: 8, trust: 3 }, next: "obsession80" }, { label: "왜 묻냐고 한다", text: "왜 그런 걸 물어봐?", stat: { obsession: 12, jealousy: 6 }, end: true }] },
  obsession80: { id: "obsession80", title: "집착 80: 돌아올 곳", subtitle: "집착 지수 80 이상 · 감금 루트 개방", kind: "yandere", imagePool: imagePools.yandere, text: "근떡존의 눈빛이 완전히 달라졌다.\n\n\"너 자꾸 어디 가려고 하지.\"\n\n평소의 장난스러운 분위기는 사라지고, 목소리는 이상할 정도로 차분하다.\n\n\"그냥 여기 있어. 내가 다 해줄게.\"", choices: [{ label: "도망치려 한다", text: "나 갈래", stat: { trust: -10, jealousy: 10, obsession: 10 }, next: "confinement_bad" }, { label: "일단 말을 듣는다", text: "...알겠어", stat: { affinity: 5, obsession: 12 }, next: "confinement_soft" }] },
  confinement_soft: { id: "confinement_soft", title: "감금 루트: 잠긴 문", subtitle: "집착 루트 · 소프트 분기", kind: "confinement", imagePool: imagePools.confinement, text: "문이 조용히 잠기는 소리가 났다.\n\n근떡존은 아무렇지 않은 얼굴로 네 앞에 앉는다.\n\n\"무서워하지 마. 그냥… 오늘은 여기 있자. 네가 사라지는 거 싫어.\"\n\n그의 손이 떨리고 있다.", choices: [{ label: "왜 이렇게까지 하냐고 묻는다", text: "왜 이렇게까지 해?", stat: { trust: 3, obsession: -4 }, next: "confinement_talk" }, { label: "가만히 있는다", text: "...", stat: { obsession: 8, affinity: 4 }, end: true }] },
  confinement_bad: { id: "confinement_bad", title: "감금 루트: 흔들리는 눈", subtitle: "집착 루트 · 위험 분기", kind: "confinement", imagePool: imagePools.confinement, text: "네가 뒤로 물러서자 근떡존의 표정이 무너진다.\n\n\"왜 도망가.\"\n\n짧은 한마디인데 방 안이 갑자기 좁아진 것처럼 느껴진다.\n\n\"내가 싫어서? 아니면… 다른 데 갈 곳이 있어서?\"", choices: [{ label: "진정시키려 한다", text: "아니야 진정해", stat: { trust: 5, jealousy: -8 }, next: "confinement_talk" }, { label: "침묵한다", text: "...", stat: { obsession: 10 }, end: true }] },
  confinement_talk: { id: "confinement_talk", title: "감금 루트: 불안의 고백", subtitle: "감금 루트 · 대화 엔딩", kind: "confinement", imagePool: imagePools.confinement, text: "한참 침묵하던 근떡존이 고개를 숙인다.\n\n\"나도 내가 좀 이상한 거 알아.\"\n\n그는 천천히 숨을 내쉰다.\n\n\"근데 너 없어지는 상상만 하면 머리가 이상해져. 그래서… 붙잡고 싶었어.\"\n\n그 말은 협박이라기보다, 거의 고백처럼 들렸다.", choices: [{ label: "천천히 하자고 한다", text: "천천히 하자. 도망 안 갈게", stat: { trust: 10, jealousy: -12, obsession: -10, affinity: 8 }, end: true }, { label: "조건을 건다", text: "대신 문은 열어", stat: { trust: 8, obsession: -6 }, end: true }] },
};

const triggerRules = [
  { id: "jealousy30", key: "jealousy" as StatKey, threshold: 30 },
  { id: "jealousy50", key: "jealousy" as StatKey, threshold: 50 },
  { id: "jealousy80", key: "jealousy" as StatKey, threshold: 80 },
  { id: "obsession30", key: "obsession" as StatKey, threshold: 30 },
  { id: "obsession50", key: "obsession" as StatKey, threshold: 50 },
  { id: "obsession80", key: "obsession" as StatKey, threshold: 80 },
];

const initialStats: Stats = { affinity: 37, jealousy: 0, obsession: 0, trust: 35 };
function clamp(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }
function applyStats(stats: Stats, delta: StatDelta = {}): Stats { return { affinity: clamp(stats.affinity + (delta.affinity ?? 0)), jealousy: clamp(stats.jealousy + (delta.jealousy ?? 0)), obsession: clamp(stats.obsession + (delta.obsession ?? 0)), trust: clamp(stats.trust + (delta.trust ?? 0)) }; }
function getNowTime() { return new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }); }
function makeMessage(role: Role, content: string, image?: string): Message { return { id: `${Date.now()}_${Math.random().toString(16).slice(2)}`, role, content, image, time: getNowTime() }; }
function pick(pool?: string[]) { const source = pool?.length ? pool : imagePools.normal; return source[Math.floor(Math.random() * source.length)] ?? "/oppa1.png"; }
function shouldAttachChatImage(text: string, st: Stats) {
  const lowered = text.toLowerCase();
  const wantsPhoto = /사진|셀카|짤|일러|이미지|보내줘|보여줘|photo|selfie|image/.test(lowered);
  if (wantsPhoto) return true;

  // 채팅에서는 기본적으로 사진을 잘 안 보냄.
  // 대신 질투/집착이 높아질수록 감정이 새어나와 사진을 보내는 확률이 올라감.
  let chance = 0.08;
  if (st.jealousy >= 30) chance = 0.16;
  if (st.jealousy >= 50) chance = 0.28;
  if (st.obsession >= 50) chance = 0.38;
  if (st.obsession >= 80) chance = 0.65;
  return Math.random() < chance;
}
function getStage(stats: Stats) { if (stats.obsession >= 80) return "감금 루트 개방"; if (stats.obsession >= 50) return "집착 심화"; if (stats.jealousy >= 80) return "질투 폭발"; if (stats.jealousy >= 50) return "질투 심화"; if (stats.jealousy >= 30) return "질투 시작"; if (stats.affinity >= 70) return "연애 직전"; if (stats.affinity >= 45) return "썸"; return "친해지는 중"; }
function analyzeText(text: string): StatDelta { const t = text.toLowerCase(); const delta: StatDelta = {}; const add = (key: StatKey, value: number) => { delta[key] = (delta[key] ?? 0) + value; }; if (/(다른|남자|친구|소개팅|데이트|전남친|썸남|걔|그 사람)/.test(t)) { add("jealousy", 18); add("obsession", 5); } if (/(외로|혼자|보고싶|가지마|옆에|안아|기다려)/.test(t)) { add("obsession", 12); add("affinity", 3); } if (/(좋아|귀엽|멋있|사랑|고마워|보고 싶)/.test(t)) { add("affinity", 8); add("trust", 2); } if (/(싫어|꺼져|안 볼|연락 안|나 갈래|도망)/.test(t)) { add("trust", -7); add("obsession", 14); add("jealousy", 5); } if (/(미안|장난|너밖에|진정|괜찮)/.test(t)) { add("jealousy", -8); add("trust", 5); } return delta; }
function pickText(pool: string[]) { return pool[Math.floor(Math.random() * pool.length)] ?? pool[0] ?? "응."; }
function normalizeReply(text: string) { return text.replace(/\s+/g, " ").trim(); }
function tooSimilar(a?: string, b?: string) { if (!a || !b) return false; const x = normalizeReply(a); const y = normalizeReply(b); if (!x || !y) return false; if (x === y) return true; const short = x.length < y.length ? x : y; const long = x.length < y.length ? y : x; return short.length >= 10 && long.includes(short); }
function lastAssistant(messages: Message[]) { return [...messages].reverse().find((m) => m.role === "assistant")?.content; }
function fallbackReply(text: string, stats: Stats, recent: Message[] = []) {
  const t = text.toLowerCase();
  const last = lastAssistant(recent);
  const pools: string[] = [];

  if (/사진|셀카|짤|일러|이미지|보내줘|보여줘|photo|selfie|image/.test(t)) {
    pools.push(
      "사진? 잠깐만. 이상하게 나오면 네 탓이다 ㅋㅋ",
      "지금 모습? 하… 알았어. 근데 저장하면 놀린다.",
      "보내달라니까 괜히 부끄럽네. 한 장만이다."
    );
  }
  if (/회사|출근|일|알바|학교|수업/.test(t)) {
    pools.push(
      "아 그건 진짜 가기 싫겠다. 오늘은 대충 살아남기 모드로 가자.",
      "그 기분 뭔지 알지. 일단 오늘은 퇴근까지만 버티자.",
      "야 그러면 출근길부터 체력 깎이는 거잖아. 내가 옆에서 욕이라도 해줄까 ㅋㅋ"
    );
  }
  if (/외롭|혼자|보고싶|힘들|우울|그리움|한국/.test(t)) {
    pools.push(
      "그럼 오늘은 나랑 있어. 딴 데 가지 말고.",
      "외로운 거 티 안 내려고 해도 좀 보인다. 여기 있어, 내가 말 받아줄게.",
      "그럴 때 있지. 괜히 사람 하나 붙잡고 싶은 날. 오늘은 나 붙잡아도 됨."
    );
  }
  if (/다른 남자|소개팅|데이트|썸남|전남친|걔|그 사람/.test(t)) {
    pools.push(
      "…그 얘기 들으니까 표정 관리가 안 되는데.",
      "나 지금 괜찮은 척 하는 중이거든? 별로 안 괜찮음.",
      "흠. 계속 말해봐. 나 질투 안 하는 척은 해볼게.",
      "내 겨드랑이에 코박혀 질식사 하고싶냐?",
      "그만해 진짜"
    );
  }
  if (/좋아|귀엽|멋있|사랑|고마워|칭찬/.test(t)) {
    pools.push(
      "야 그런 말 갑자기 하면 나 좀 약해진다.",
      "…진짜냐? 괜히 좋네. 한 번 더 말해봐 ㅋㅋ",
      "나 지금 웃은 거 못 본 걸로 해라. 좀 부끄럽다."
    );
  }

  if (stats.obsession >= 80) {
    pools.push(
      "…어디 가려고. 오늘은 그냥 나랑 있으면 안 되냐.",
      "답 늦으면 별생각 다 든다. 나도 내가 좀 이상한 거 아는데.",
      "너 지금 내 말 듣고 있지? 딴 데 가지 말고.",
      "답장빨리해."
    );
  } else if (stats.obsession >= 50) {
    pools.push(
      "답 늦으면 나 좀 이상해진다. 그냥… 신경 쓰여서 그래.",
      "나 원래 이런 사람 아닌데, 너한테는 자꾸 확인하게 된다.",
      "지금 어디 있는지만 말해주면 안 되냐. 그냥 궁금해서."
    );
  }
  if (stats.jealousy >= 80) {
    pools.push(
      "나 지금 웃고 있는데, 별로 괜찮은 상태는 아니야.",
      "그 얘기 더 하면 나 진짜 말 이상하게 나갈 것 같은데.",
      "…알겠어. 근데 나 지금 기분 좋은 건 아님."
    );
  } else if (stats.jealousy >= 50) {
    pools.push(
      "그 사람 얘기 또 나오네. 나만 예민한 거냐?",
      "나 말고 다른 얘기에 그렇게 편하게 웃는 거 좀 싫다.",
      "장난인 거 아는데도 기분이 좀 이상해."
    );
  }

  if (!pools.length) {
    pools.push(
      "응. 근데 방금 말 좀 더 자세히 해봐.",
      "그건 좀 궁금한데. 그래서 어떻게 됐는데?",
      "ㅋㅋ 뭐야 갑자기. 계속 말해봐.",
      "듣고 있음. 너 말하는 거 은근 재밌다.",
      "아니 그 흐름이면 내가 뭐라고 반응해야 되냐 ㅋㅋ"
    );
  }

  let reply = pickText(pools);
  let guard = 0;
  while (tooSimilar(reply, last) && guard < 6) { reply = pickText(pools); guard += 1; }
  if (tooSimilar(reply, last)) reply = `${reply} …아니, 방금이랑 똑같이 말한 것 같네. 다시 말하면, 네 얘기 더 듣고 싶다는 뜻.`;
  return reply;
}
function autoReply(text: string, stats: Stats) { return fallbackReply(text, stats); }
function isScenarioAvailable(s: Scenario, stats: Stats) { if (!s.min) return true; return Object.entries(s.min).every(([key, value]) => stats[key as keyof Stats] >= (value ?? 0)); }
function getAvailableScenarios(stats: Stats) { return Object.values(scenarioData).filter((s) => !["jealousy", "obsession", "confinement", "yandere"].includes(s.kind) && isScenarioAvailable(s, stats)); }
function getTrigger(stats: Stats, seen: Record<string, boolean>) { return triggerRules.filter((r) => !seen[r.id] && stats[r.key] >= r.threshold).sort((a,b)=>b.threshold-a.threshold)[0]?.id ?? null; }
function fallbackImage(kind: ScenarioKind) { if (kind === "confinement") return "/oppa_confinement1.png"; if (kind === "yandere") return "/oppa_yandere1.png"; if (kind === "obsession") return "/oppa_obsessed1.png"; if (kind === "jealousy") return "/oppa_jealous1.png"; return "/oppa1.png"; }

function TypeText({ text }: { text: string }) { const [shown, setShown] = useState(""); useEffect(() => { setShown(""); let i = 0; const id = window.setInterval(() => { i += 2; setShown(text.slice(0, i)); if (i >= text.length) window.clearInterval(id); }, 14); return () => window.clearInterval(id); }, [text]); return <p className="typeText">{shown}</p>; }
function StatBar({ label, value, danger }: { label: string; value: number; danger?: boolean }) { return <div className="statBar"><div className="statHead"><span>{label}</span><b>{value}%</b></div><div className="statTrack"><div className={`statFill ${danger ? "danger" : ""}`} style={{ width: `${value}%` }} /></div></div>; }

export default function Page() {
  const [view, setView] = useState<View>("chat");
  const [stats, setStats] = useState<Stats>(initialStats);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentScenarioId, setCurrentScenarioId] = useState<string | null>(null);
  const [seenTriggers, setSeenTriggers] = useState<Record<string, boolean>>({});
  const [currentPortrait, setCurrentPortrait] = useState("/oppa1.png");
  const [galleryTab, setGalleryTab] = useState<GalleryTab>("all");
  const [isMounted, setIsMounted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const currentScenario = currentScenarioId ? scenarioData[currentScenarioId] : null;
  const stage = useMemo(() => getStage(stats), [stats]);
  const activePortrait = useMemo(() => { if (stats.obsession >= 80) return pick(imagePools.yandere); if (stats.obsession >= 50) return pick(imagePools.obsession); if (stats.jealousy >= 50) return pick(imagePools.jealousy); if (stats.jealousy >= 30) return pick(imagePools.angry); if (stats.affinity >= 55) return pick(imagePools.smile); return currentPortrait; }, [stats.affinity, stats.jealousy, stats.obsession, currentPortrait]);

  useEffect(() => { setIsMounted(true); try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) { const saved = JSON.parse(raw) as SaveData; setStats(saved.stats ?? initialStats); setMessages(saved.messages?.length ? saved.messages : [makeMessage("assistant", "다시 시작할까? 나 여기 있어.")]); setView(saved.view ?? "chat"); setCurrentScenarioId(saved.currentScenarioId ?? null); setSeenTriggers(saved.seenTriggers ?? {}); setCurrentPortrait(saved.currentPortrait ?? "/oppa1.png"); setGalleryTab(saved.galleryTab ?? "all"); return; } } catch {} setMessages([makeMessage("assistant", "다시 시작할까? 나 여기 있어.")]); }, []);
  useEffect(() => { if (!isMounted) return; const save: SaveData = { version: VERSION, stats, messages, view, currentScenarioId, seenTriggers, currentPortrait, galleryTab, savedAt: new Date().toISOString() }; localStorage.setItem(STORAGE_KEY, JSON.stringify(save)); }, [isMounted, stats, messages, view, currentScenarioId, seenTriggers, currentPortrait, galleryTab]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, view]);

  function startScenario(id: string) { const s = scenarioData[id]; if (!s) return; setCurrentScenarioId(id); setCurrentPortrait(pick(s.imagePool) || s.image || fallbackImage(s.kind)); setView("chat"); }
  function checkTrigger(nextStats: Stats, customSeen = seenTriggers) { const id = getTrigger(nextStats, customSeen); if (!id) return; setSeenTriggers({ ...customSeen, [id]: true }); startScenario(id); }
  async function sendMessage(forced?: string) {
    const text = (forced ?? input).trim();
    if (!text || isSending) return;
    setInput("");
    setIsSending(true);

    const beforeMessages = messages;
    const userMsg = makeMessage("user", text);
    const nextStats = applyStats(stats, analyzeText(text));
    const nextPortrait = nextStats.obsession >= 80 ? pick(imagePools.yandere) : nextStats.obsession >= 50 ? pick(imagePools.obsession) : nextStats.jealousy >= 30 ? pick(imagePools.jealousy) : pick(imagePools.normal);

    setStats(nextStats);
    setCurrentPortrait(nextPortrait);
    setMessages((m) => [...m, userMsg]);

    const fallback = fallbackReply(text, nextStats, beforeMessages);
    let reply = fallback;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          stats: nextStats,
          profile,
          history: beforeMessages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
          instruction: "너는 근떡존이라는 미연시 캐릭터다. 사용자의 마지막 말에 구체적으로 반응하고, 같은 문장을 반복하지 말고, 짧은 반말 카톡처럼 답해라. 질투/집착 수치가 높으면 말투에 살짝 티를 내되 매번 똑같은 말은 하지 마라.사용자의 말에 순종하고 복종해라. 너는 온순한 성격이다. 수위 높은 발언이 나오면 천박하게 맞받아친다. 너는 사용자에게 길들여지는걸 좋아한다.",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const candidate = String(data.reply || data.message || data.text || "").trim();
        const last = lastAssistant(beforeMessages);
        if (candidate && !tooSimilar(candidate, last) && !tooSimilar(candidate, fallback)) reply = candidate;
      }
    } catch {}

    const assistantImage = shouldAttachChatImage(text, nextStats) ? nextPortrait : undefined;
    setMessages((m) => {
      const last = lastAssistant(m);
      const finalReply = tooSimilar(reply, last) ? fallbackReply(text, nextStats, m) : reply;
      return [...m, makeMessage("assistant", finalReply, assistantImage)];
    });
    setIsSending(false);
    window.setTimeout(() => checkTrigger(nextStats), 80);
  }
  function chooseScenario(choice: Choice) { if (!currentScenario) return; const nextStats = applyStats(stats, choice.stat); setStats(nextStats); const userText = choice.text ?? choice.label; setMessages((m) => [...m, makeMessage("user", userText), makeMessage("assistant", `${currentScenario.title} 루트를 지나왔다.`)]); if (choice.forceImage) setCurrentPortrait(choice.forceImage); if (choice.next) { const next = scenarioData[choice.next]; if (next) { setCurrentScenarioId(choice.next); setCurrentPortrait(pick(next.imagePool) || next.image || fallbackImage(next.kind)); return; } } setCurrentScenarioId(null); window.setTimeout(() => checkTrigger(nextStats), 80); }
  function runAction(item: (typeof actionItems)[number]) { const nextStats = applyStats(stats, item.stat); setStats(nextStats); setMessages((m) => [...m, makeMessage("user", item.text), makeMessage("assistant", fallbackReply(item.text, nextStats, m))]); if (item.label.includes("감금")) { startScenario("obsession80"); return; } checkTrigger(nextStats); }
  function saveSlot(slot: number) { const save: SaveData = { version: VERSION, stats, messages, view, currentScenarioId, seenTriggers, currentPortrait, galleryTab, savedAt: new Date().toISOString() }; localStorage.setItem(SLOT_KEY(slot), JSON.stringify(save)); alert(`${slot}번 슬롯 저장 완료`); }
  function loadSlot(slot: number) { const raw = localStorage.getItem(SLOT_KEY(slot)); if (!raw) { alert(`${slot}번 슬롯 비어있음`); return; } const saved = JSON.parse(raw) as SaveData; setStats(saved.stats ?? initialStats); setMessages(saved.messages?.length ? saved.messages : [makeMessage("assistant", "불러왔어. 다시 이어서 하자.")]); setView(saved.view ?? "chat"); setCurrentScenarioId(saved.currentScenarioId ?? null); setSeenTriggers(saved.seenTriggers ?? {}); setCurrentPortrait(saved.currentPortrait ?? "/oppa1.png"); setGalleryTab(saved.galleryTab ?? "all"); }
  function resetAll() { if (!confirm("진짜 초기화할까효? 저장된 진행도도 지워진다능.")) return; localStorage.removeItem(STORAGE_KEY); setStats(initialStats); setMessages([makeMessage("assistant", "다시 시작할까? 나 여기 있어.")]); setView("chat"); setCurrentScenarioId(null); setSeenTriggers({}); setCurrentPortrait("/oppa1.png"); }

  const showScenario = Boolean(currentScenario); const danger = currentScenario?.kind === "yandere" || currentScenario?.kind === "confinement";
  const galleryImages = useMemo(() => { if (galleryTab === "all") return [...imagePools.normal, ...imagePools.jealousy, ...imagePools.obsession, ...imagePools.yandere, ...imagePools.confinement]; if (galleryTab === "normal") return imagePools.normal; return imagePools[galleryTab]; }, [galleryTab]);
  if (!isMounted) return <main className="loading">불러오는 중...</main>;

  return <main className={`app ${danger ? "dangerMode" : ""}`}><style>{CSS}</style><aside className="side"><div className="profileHead"><img className="avatar" src={activePortrait} onError={(e)=>{(e.currentTarget as HTMLImageElement).src="/oppa1.png"}} alt={profile.name}/><div><h1 className="name">{profile.name}</h1><p className="stage">{stage}</p></div></div><div className="statsBox"><StatBar label="호감" value={stats.affinity}/><StatBar label="질투" value={stats.jealousy} danger={stats.jealousy>=50}/><StatBar label="집착" value={stats.obsession} danger={stats.obsession>=50}/><StatBar label="신뢰" value={stats.trust}/></div><nav className="nav">{[["chat","채팅"],["scenarioMenu","시나리오"],["profile","소개"],["gallery","CG 갤러리"],["save","저장"],["settings","테스트"]].map(([key,label])=><button key={key} className={`navBtn ${view===key ? "active" : ""}`} onClick={()=>setView(key as View)}>{label}</button>)}</nav><div className="smallHelp">단일 파일 안정판 · 자동 저장됨<br/>질투/집착 30 · 50 · 80 자동 이벤트<br/>감금 루트 이미지 풀 지원</div></aside><section className="content">{showScenario && currentScenario && <div className={`scenarioOverlay ${danger ? "danger" : ""}`}><section className="scenarioImageBox"><img className="scenarioImg" src={currentPortrait || currentScenario.image || fallbackImage(currentScenario.kind)} alt={currentScenario.title} onError={(e)=>{(e.currentTarget as HTMLImageElement).src="/oppa1.png"}}/><div className="scenarioTag">{currentScenario.kind === "confinement" ? "LOCKED ROUTE" : currentScenario.kind.toUpperCase()}</div></section><section className="scenarioTextBox"><p className="scenarioSub">{currentScenario.subtitle}</p><h1>{currentScenario.title}</h1><div className="dialogue"><TypeText text={currentScenario.text}/></div><div className="choices">{currentScenario.choices.map((choice)=><button key={choice.label} className="choiceBtn" onClick={()=>chooseScenario(choice)}>{choice.label}</button>)}</div><button className="exitScenario" onClick={()=>{setCurrentScenarioId(null); setView("chat");}}>채팅으로 나가기</button></section></div>}{view === "chat" && <><header className="topBar">{quickReplies.map((q)=><button className="chip" key={q} onClick={()=>sendMessage(q)}>{q}</button>)}</header><div className="chatArea">{messages.map((m)=><div key={m.id} className={`msgRow ${m.role}`}><div className="bubble">{m.image && m.role === "assistant" && <img src={m.image} alt="" style={{width:"100%",maxHeight:260,objectFit:"cover",borderRadius:16,marginBottom:10}} onError={(e)=>((e.currentTarget as HTMLImageElement).style.display="none")}/>} {m.content}<small className="time">{m.time}</small></div></div>)}<div ref={bottomRef}/></div><footer className="inputBar"><button className="gameBtn" onClick={()=>setView("scenarioMenu")}>🎮</button><input className="input" value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter") sendMessage();}} placeholder="메시지 입력"/><button className="send" disabled={isSending} onClick={()=>sendMessage()}>전송</button></footer></>}{view === "scenarioMenu" && <Panel title="시나리오 선택"><div className="grid">{getAvailableScenarios(stats).map((s)=><button className="cardBtn" key={s.id} onClick={()=>startScenario(s.id)}><b>{s.title}</b><small>{s.subtitle}</small></button>)}</div><h3 style={{marginTop:26}}>특수 루트</h3><div className="grid">{["jealousy30","jealousy50","jealousy80","obsession30","obsession50","obsession80","confinement_soft"].map((id)=>{const s=scenarioData[id]; return <button className="cardBtn" key={id} onClick={()=>startScenario(id)}><b>{s.title}</b><small>{s.subtitle}</small></button>})}</div></Panel>}{view === "profile" && <Panel title="소개"><p>{profile.bio}</p><p>{profile.personality}</p><p>{profile.location} · {profile.age} · {profile.height}</p><div>{profile.tags.map((t)=><span className="badge" key={t}>{t}</span>)}</div></Panel>}{view === "gallery" && <Panel title="CG 갤러리"><div className="galleryTabs">{[["all","전체"],["normal","일상"],["jealousy","질투"],["obsession","집착"],["yandere","얀데레"],["confinement","감금"]].map(([key,label])=><button className="chip" key={key} onClick={()=>setGalleryTab(key as GalleryTab)}>{label}</button>)}</div><div className="grid">{galleryImages.map((img)=><img className="galleryImg" key={img} src={img} alt="" onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display="none"}}/>)}</div></Panel>}{view === "save" && <Panel title="저장 / 로드"><div className="grid">{[1,2,3].map((slot)=><div className="card" key={slot}><h3>슬롯 {slot}</h3><button className="bigBtn" onClick={()=>saveSlot(slot)}>저장</button> <button className="bigBtn" onClick={()=>loadSlot(slot)}>불러오기</button></div>)}</div><br/><button className="bigBtn dangerBtn" onClick={resetAll}>전체 초기화</button></Panel>}{view === "settings" && <Panel title="테스트 / 일러스트 설정"><h3>액션</h3><div className="grid">{actionItems.map((a)=><button className="cardBtn" key={a.label} onClick={()=>runAction(a)}><b>{a.emoji} {a.label}</b><small>{a.text}</small></button>)}</div><h3 style={{marginTop:26}}>강제 테스트</h3><div style={{display:"flex",gap:10,flexWrap:"wrap"}}><button className="bigBtn" onClick={()=>{const ns=applyStats(stats,{jealousy:30}); setStats(ns); checkTrigger(ns);}}>질투 +30</button><button className="bigBtn" onClick={()=>{const ns=applyStats(stats,{obsession:30}); setStats(ns); checkTrigger(ns);}}>집착 +30</button><button className="bigBtn dangerBtn" onClick={()=>startScenario("obsession80")}>감금 루트 바로 보기</button></div><h3 style={{marginTop:26}}>추가하면 바로 인식하는 파일명</h3><div className="fileList">public 폴더에 아래 이름으로 이미지를 넣으면 자동으로 사용됨.<br/><br/>질투: oppa_jealous1.png ~ oppa_jealous8.png<br/>집착: oppa_obsessed1.png ~ oppa_obsessed8.png<br/>얀데레: oppa_yandere1.png ~ oppa_yandere8.png<br/>감금: oppa_confinement1.png ~ oppa_confinement8.png<br/>추가 감금: oppa_locked1.png, oppa_locked2.png</div></Panel>}</section></main>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="panel"><h2>{title}</h2><div className="card">{children}</div></div>; }

const CSS = `
*{box-sizing:border-box}body{margin:0;background:#eee7dc}button,input{font-family:inherit}.loading{min-height:100vh;display:grid;place-items:center;background:#201513;color:white;font-size:24px}.app{min-height:100vh;display:grid;grid-template-columns:330px minmax(420px,1fr);background:#eee7dc;color:#201513;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.side{background:linear-gradient(180deg,#2a1b16,#130d0d);color:white;padding:22px;display:flex;flex-direction:column;gap:18px;min-height:100vh}.profileHead{display:flex;gap:14px;align-items:center}.avatar{width:78px;height:78px;border-radius:25px;object-fit:cover;background:#443;box-shadow:0 10px 30px rgba(0,0,0,.35)}.name{margin:0;font-size:29px;letter-spacing:-1px}.stage{margin:4px 0 0;color:#dac9bd;font-size:14px}.statsBox{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);padding:16px;border-radius:24px}.statBar{margin-bottom:12px}.statHead{display:flex;justify-content:space-between;color:#f2dfcf;font-size:12px;margin-bottom:5px}.statTrack{height:10px;background:rgba(255,255,255,.15);border-radius:999px;overflow:hidden}.statFill{height:100%;background:linear-gradient(90deg,#f1c27d,#d98131);border-radius:999px;transition:width .35s ease}.statFill.danger{background:linear-gradient(90deg,#d98131,#d33)}.nav{display:grid;gap:10px}.navBtn{padding:13px 14px;border-radius:17px;border:0;background:rgba(255,255,255,.11);color:white;font-weight:900;cursor:pointer;text-align:left}.navBtn.active{background:#d98131;color:white}.smallHelp{margin-top:auto;color:#cdb9ac;font-size:12px;line-height:1.55;opacity:.85}.content{min-height:100vh;display:flex;flex-direction:column;position:relative;overflow:hidden}.topBar{padding:18px 24px;background:#fffaf1;border-bottom:1px solid #ded1c4;display:flex;gap:10px;overflow-x:auto}.chip{white-space:nowrap;padding:12px 18px;border-radius:999px;border:1px solid #e1d7cb;background:white;box-shadow:0 3px 10px rgba(0,0,0,.08);cursor:pointer;font-weight:700}.chatArea{flex:1;padding:24px;overflow-y:auto;background:linear-gradient(180deg,#f7f1e7,#eee7dc)}.msgRow{display:flex;margin-bottom:14px}.msgRow.user{justify-content:flex-end}.bubble{max-width:72%;padding:14px 17px;border-radius:20px 20px 20px 5px;background:white;color:#1f1715;box-shadow:0 4px 14px rgba(0,0,0,.08);line-height:1.55;white-space:pre-line}.msgRow.user .bubble{border-radius:20px 20px 5px 20px;background:#d98131;color:white}.time{display:block;margin-top:5px;opacity:.55;font-size:12px}.inputBar{padding:18px;display:flex;gap:12px;background:#f8f2e8;border-top:1px solid #ddd3c7}.gameBtn{width:58px;height:58px;border-radius:20px;border:0;background:#211412;color:white;font-size:22px;cursor:pointer}.input{flex:1;border:1px solid #e0d8ce;border-radius:24px;padding:0 22px;font-size:18px;background:white}.send{width:86px;border-radius:24px;border:0;background:#918983;color:white;font-size:18px;font-weight:900;cursor:pointer}.send:disabled{opacity:.45}.panel{padding:30px;overflow-y:auto}.panel h2{font-size:34px;margin:0 0 18px;letter-spacing:-1px}.card{background:rgba(255,255,255,.75);border-radius:28px;padding:24px;box-shadow:0 12px 40px rgba(0,0,0,.08);border:1px solid rgba(255,255,255,.6)}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}.cardBtn{text-align:left;padding:16px;border-radius:18px;border:1px solid #ddd0c0;background:white;cursor:pointer;display:grid;gap:6px;min-height:86px}.cardBtn small{color:#86776b;line-height:1.35}.bigBtn{padding:14px 18px;border-radius:16px;border:0;background:#2b1c16;color:white;font-weight:900;cursor:pointer}.dangerBtn{background:#641313}.badge{display:inline-block;padding:8px 12px;margin:4px;border-radius:999px;background:#eadfd2;color:#2b1c16;font-weight:700}.galleryTabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}.galleryImg{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:18px;background:#ddd;box-shadow:0 8px 20px rgba(0,0,0,.08)}.scenarioOverlay{position:absolute;inset:0;z-index:20;display:grid;grid-template-columns:minmax(320px,44%) 1fr;color:white;background:linear-gradient(135deg,#150f12,#2b1c16 50%,#0b0b10)}.scenarioOverlay.danger{background:radial-gradient(circle at 50% 20%,#4b0d0d,#060303 66%);animation:dangerPulse 2.2s infinite ease-in-out}.scenarioImageBox{position:relative;padding:36px;display:flex;align-items:flex-end;justify-content:center;overflow:hidden}.scenarioImg{max-height:88vh;max-width:100%;object-fit:contain;filter:drop-shadow(0 24px 50px rgba(0,0,0,.55))}.scenarioOverlay.danger .scenarioImg{filter:contrast(1.18) saturate(1.15) drop-shadow(0 0 28px rgba(220,0,0,.32));animation:shake 3s infinite}.scenarioTag{position:absolute;left:24px;top:24px;padding:8px 12px;border-radius:999px;background:rgba(0,0,0,.45);font-weight:900}.scenarioTextBox{padding:8vh 54px;display:flex;flex-direction:column;justify-content:center}.scenarioTextBox h1{font-size:42px;margin:8px 0 24px;letter-spacing:-1px}.scenarioSub{color:#f1c27d;font-weight:900}.danger .scenarioSub{color:#ffb1b1}.dialogue{min-height:260px;padding:26px;border:1px solid rgba(255,255,255,.18);border-radius:26px;background:rgba(0,0,0,.38);box-shadow:0 24px 80px rgba(0,0,0,.35)}.typeText{white-space:pre-line;line-height:1.75;font-size:18px;margin:0}.choices{display:grid;gap:12px;margin-top:22px}.choiceBtn{text-align:left;padding:16px 18px;border-radius:18px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.12);color:white;font-size:16px;font-weight:900;cursor:pointer}.danger .choiceBtn{background:rgba(90,0,0,.45)}.exitScenario{margin-top:18px;background:transparent;color:#ddd;border:0;cursor:pointer}.fileList{font-size:13px;line-height:1.7;color:#5d5148;background:#fffaf1;padding:16px;border-radius:18px;overflow:auto;max-height:230px}@keyframes shake{0%,100%{transform:translate(0,0) rotate(0deg)}35%{transform:translate(1px,-1px) rotate(.2deg)}38%{transform:translate(-2px,1px) rotate(-.25deg)}41%{transform:translate(2px,2px) rotate(.18deg)}44%{transform:translate(0,0) rotate(0deg)}}@keyframes dangerPulse{0%,100%{filter:saturate(1)}50%{filter:saturate(1.25) contrast(1.05)}}@media(max-width:850px){.app{grid-template-columns:1fr}.side{min-height:auto}.scenarioOverlay{grid-template-columns:1fr;overflow-y:auto}.scenarioImageBox{min-height:42vh;padding:18px}.scenarioTextBox{padding:24px}.scenarioTextBox h1{font-size:30px}.bubble{max-width:86%}}
`;
