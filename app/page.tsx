"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { actionCGImages, actionCGPools, actionItems, imagePools, profile, quickReplies, scenarioData } from "./gameData";
import type {
  ActionItem,
  AfterScenarioCue,
  Choice,
  ChoiceCondition,
  GalleryTab,
  MemoryNote,
  Message,
  OutfitKey,
  Role,
  SaveData,
  Scenario,
  ScenarioCategory,
  ScenarioKind,
  StatDelta,
  StatKey,
  Stats,
  StoryRoute,
  TouchTarget,
  View,
  VNLine,
} from "./gameTypes";

type AppView = View | "home" | "admin";
type ChapterTransition = { mode: "start" | "end"; eyebrow: string; title: string; subtitle?: string };

const VERSION = 12;
const STORAGE_KEY = "geuntteokjon_single_file_vn_v9";
const TUTORIAL_KEY = `${STORAGE_KEY}_tutorial_seen`;
const SLOT_KEY = (slot: number) => `${STORAGE_KEY}_slot_${slot}`;
const PUSH_SEEN_KEY = `${STORAGE_KEY}_seen_push_ids`;
const SD_IMAGE_VERSION = "transparent2";
const initialStats: Stats = { affinity: 100, jealousy: 0, obsession: 0, trust: 100 };
const STAT_MAX = 1000;

const actionScenarioDrafts: Record<string, { title: string; subtitle: string; text: string; endText: string }> = {
  action_gochu: {
    title: "액션: 고추 만지기",
    subtitle: "액션 이벤트 · 당황한 근떡존",
    text: `히든의 손끝이 닿자 근떡존은 그대로 굳어버렸다.

"아... 히든님, 잠깐만요."

입으로는 말리면서도, 그는 바로 밀어내지 못했다.

얼굴은 빠르게 달아올랐고 시선은 이리저리 흔들렸다. 큰 덩치가 그렇게까지 허둥대는 모습은 조금 우스웠다.

"지금 어디 만지시는 건지 알고 계시죠?"

근떡존은 작게 웃으려 했지만, 목소리 끝이 살짝 떨렸다.

부끄러워 죽겠다는 표정이면서도 히든의 반응을 먼저 살피는 눈이었다.`,
    endText: "장난은 여기까지 할게요.",
  },
  action_armpit: {
    title: "액션: 겨드랑이 만지기",
    subtitle: "액션 이벤트 · 운동 끝의 체온",
    text: `히든이 손을 뻗자 근떡존은 짧게 숨을 삼켰다.

"아, 거기 땀났는데..."

말은 그렇게 하면서도 그는 팔을 내리지 않았다. 오히려 민망한 듯 웃으며 시선을 피했다.

운동 직후의 체온이 그대로 남아 있었다. 따뜻하고, 살짝 젖어 있고, 사람 냄새가 은근하게 배어 있었다.

"계속 만지시면 제가 더 민망해지는데요."

그 말 뒤에는 이상하게도, 정말 싫은 사람의 기색은 없었다.`,
    endText: "운동한 보람은 있네요.",
  },
  action_feet: {
    title: "액션: 발냄새 맡기",
    subtitle: "액션 이벤트 · 짓궂은 장난",
    text: `히든이 너무 태연하게 굴자 근떡존은 결국 얼굴을 감싸 쥐었다.

"으악, 진짜 이상하시네요."

목소리는 질색하는 척했지만, 금방 웃음이 새어 나왔다.

"하루 종일 돌아다녔는데 좋은 냄새 날 리 없잖아요."

그는 애써 투덜거리면서도 히든을 흘겨보는 눈에 웃음기가 남아 있었다.

놀림당하는 쪽인데도, 결국 이 상황을 같이 즐기고 있는 사람처럼 보였다.`,
    endText: "이상한 취향은 적당히 하세요.",
  },
  action_dance: {
    title: "액션: 오칭코 댄스 추기",
    subtitle: "액션 이벤트 · 체육인의 수난",
    text: `히든의 요구를 들은 근떡존은 한동안 말문을 잃었다.

"아니, 그걸 왜 제가 해야 하죠?"

그러면서도 그는 결국 어이없다는 듯 웃었다.

큰 체격의 남자가 진지하게 민망해하는 모습은 묘하게 파괴력이 있었다.

"지금 저 완전히 이상한 꼴이잖아요."

근떡존은 그렇게 중얼거리면서도 히든이 웃는지부터 확인했다.

결국 중요한 건 춤이 아니라, 히든이 그 장면을 어떻게 보고 있는지인 듯했다.`,
    endText: "웃겼으면 된 거죠.",
  },
  action_kiss: {
    title: "액션: 뽀뽀 시도",
    subtitle: "액션 이벤트 · 짧아진 거리",
    text: `히든이 갑자기 가까워지자 근떡존의 눈이 크게 흔들렸다.

"잠깐... 히든님."

그는 도망치듯 고개를 피할 수도 있었지만 그러지 않았다. 대신 숨을 죽인 채, 너무 가까워진 거리를 그대로 견뎠다.

입술 끝이 닿을 듯 말 듯 머무는 순간, 근떡존의 표정은 완전히 무너졌다.

"이건 좀 반칙 아닌가요."

낮게 새어나온 목소리에는 민망함과 기대가 함께 섞여 있었다.`,
    endText: "다음엔 미리 말하고 해요.",
  },
  action_smell: {
    title: "액션: 꼬추 냄새 맡기",
    subtitle: "액션 이벤트 · 끝없는 민망함",
    text: `근떡존은 거의 절규하듯 웃음을 터뜨렸다.

"으아아, 거긴 더 심한데요."

말은 거칠었지만, 당황해서 어쩔 줄 모르는 기색이 더 컸다.

그는 얼굴이 빨개진 채 히든을 바라봤다. 말려야 하는데, 완전히 밀어내지도 못하는 사람의 복잡한 표정이었다.

"히든님이 이렇게까지 할 줄은 몰랐어요."

그 한마디에는 놀람과 어이없음, 그리고 희미한 즐거움까지 묘하게 엉켜 있었다.`,
    endText: "진짜 너무하신다니까요.",
  },
  action_muscle: {
    title: "액션: 근육 만지기",
    subtitle: "액션 이벤트 · 은근히 뿌듯한 남자",
    text: `히든의 손이 근육선을 따라 움직이자 근떡존은 괜히 어깨를 더 세웠다.

"어때요? 단단하죠."

이번엔 드물게 자신 있는 얼굴이었다.

운동 이야기만 나오면 눈이 먼저 밝아지는 사람답게, 그는 히든의 반응을 꽤 기대하는 눈치였다.

"이건 좀 열심히 만들었습니다."

말은 가볍게 했지만, 칭찬을 기다리는 기색이 너무 티 났다.

결국 그는 만져지는 것보다, 히든이 어떻게 봐주는지가 더 중요한 듯했다.`,
    endText: "칭찬 좀 더 해줘도 되는데요.",
  },
  action_hug: {
    title: "액션: 안아달라고 하기",
    subtitle: "액션 이벤트 · 약해지는 순간",
    text: `히든이 안아달라고 하자 근떡존은 순간 말문을 잃었다.

"그런 말 너무 쉽게 하시면 안 되는데요."

그는 그렇게 말하면서도 이미 팔을 벌릴 준비를 하고 있었다.

커다란 몸이 조심스럽게 가까워졌다. 끌어안는 힘은 세지 않았지만, 대신 이상할 만큼 머뭇거림이 다정했다.

"히든님이 그러시면 저 진짜 약해져요."

그 말은 장난처럼 들렸지만, 사실상 거의 고백에 가까운 숨소리였다.`,
    endText: "이건 좀 오래 기억날 것 같아요.",
  },
  action_jealous: {
    title: "액션: 일부러 질투 유발",
    subtitle: "액션 이벤트 · 흔들리는 표정",
    text: `히든이 다른 남자 이야기를 꺼내자 근떡존의 표정이 먼저 굳었다.

웃으며 넘기려 했지만, 그 짧은 틈은 너무 선명했다.

"아까 그 사람요?"

목소리는 최대한 가볍게 꾸민 것 같았지만, 눈은 전혀 그렇지 못했다.

"괜찮더라"라는 말이 생각보다 깊게 박힌 모양이었다.

근떡존은 잠깐 입을 다물었다가, 겨우 웃는 척 덧붙였다.

"히든님 지금 일부러 그러는 거죠."

그 한마디 안에는 서운함과 초조함이 조용히 묻어 있었다.`,
    endText: "그런 장난은 조금 치사해요.",
  },
  action_ignore: {
    title: "액션: 읽씹하는 척",
    subtitle: "액션 이벤트 · 답을 기다리는 사람",
    text: `히든의 답이 끊기자 근떡존은 처음엔 아무렇지 않은 척했다.

하지만 시간이 조금만 지나도 불안은 금방 티가 났다.

휴대폰을 자꾸 확인하고, 괜히 방금 보낸 말을 다시 읽고, 혹시 선을 넘은 건 아닌지 스스로 검열했다.

"바쁘신 건가..."

그 짧은 중얼거림에는 생각보다 많은 감정이 들어 있었다.

근떡존은 웃으며 넘기는 데 익숙한 사람이었지만, 기다리는 쪽으로 몰리면 이상할 만큼 약해졌다.`,
    endText: "너무 오래 기다리게 하진 말아요.",
  },
  action_comfort: {
    title: "액션: 달래주기",
    subtitle: "액션 이벤트 · 금방 풀리는 사람",
    text: `히든의 달래는 말 한마디에 근떡존은 너무 쉽게 풀어졌다.

조금 전까지 굳어 있던 표정이 금방 느슨해졌고, 억지로 눌러두던 숨도 천천히 가라앉았다.

"그 말 진짜예요?"

확인하듯 묻는 목소리는 조심스러웠지만, 이미 안심한 사람의 것이었다.

그는 늘 이런 식이었다.

혼자 불안해하다가도, 히든이 괜찮다고 해주면 믿고 싶어졌다.

"저 진짜 단순하죠."

작게 웃는 얼굴이 조금 민망해 보이면서도, 동시에 다행스러워 보였다.`,
    endText: "그 말 하나면 진짜 좀 괜찮아져요.",
  },
};

const endingData = {
  pure: {
    title: "순애 엔딩",
    subtitle: "호감과 신뢰가 충분히 높을 때",
    route: "pure" as const,
    imagePool: imagePools.smile,
    condition: (s: Stats) => s.affinity >= 1000 && s.trust >= 800,
    text: "근떡존은 더 이상 마음을 숨기지 않았다.\n\n히든님, 저는 그냥 옆에 있고 싶었어요.",
  },
  obsession: {
    title: "집착 엔딩",
    subtitle: "집착과 호감이 충분히 높을 때",
    route: "obsession" as const,
    imagePool: imagePools.obsession,
    condition: (s: Stats) => s.obsession >= 1000 && s.affinity >= 700,
    text: "근떡존의 시선은 이제 다른 곳으로 잘 향하지 않았다.\n\n히든님이 어디 있는지 계속 알고 싶었어요.",
  },
};
type RelLevel = { lv: number; minAffinity: number; name: string; nameObs: string; flavor: string };
const RELATIONSHIP_LEVELS: RelLevel[] = [
  { lv: 1,  minAffinity: 0,   name: "처음 만난 사이",       nameObs: "처음 만난 사이",       flavor: "아직은 조심스럽게, 조금씩 알아가는 중이에요." },
  { lv: 2,  minAffinity: 100, name: "조금씩 알아가는",      nameObs: "조금씩 신경 쓰이는",   flavor: "자꾸 말을 걸고 싶어지는 사람이 생겼어요." },
  { lv: 3,  minAffinity: 200, name: "편해진 사이",          nameObs: "자꾸 눈이 가는",        flavor: "이름 들리면 고개가 먼저 돌아가는 것 같아요." },
  { lv: 4,  minAffinity: 300, name: "특별히 챙기는",        nameObs: "머릿속에 자꾸 남는",    flavor: "뭔가 좋은 거 생기면 제일 먼저 생각나요." },
  { lv: 5,  minAffinity: 400, name: "마음이 기울어진",      nameObs: "머릿속에 가득한",       flavor: "이건 좋아하는 감정이 맞는 것 같아요." },
  { lv: 6,  minAffinity: 500, name: "연인 후보",            nameObs: "집착이 시작된",         flavor: "솔직히 말하면, 이미 많이 좋아하고 있어요." },
  { lv: 7,  minAffinity: 600, name: "완전히 빠진",          nameObs: "놓을 수 없는",          flavor: "이제 다른 데 눈이 잘 안 가요." },
  { lv: 8,  minAffinity: 700, name: "돌아올 수 없는",       nameObs: "가둬두고 싶은",         flavor: "옆에 없으면 뭔가 계속 빠진 것 같아요." },
  { lv: 9,  minAffinity: 800, name: "영원히 네 곁에",       nameObs: "평생 함께하는",         flavor: "이 감정이 평생 갈 것 같아요. 그래도 돼요?" },
  { lv: 10, minAffinity: 900, name: "눈에 넣어도 안 아픈",  nameObs: "숨이 막히도록",         flavor: "이제 주인님 없는 하루는 상상이 안 돼요." },
];
function getRelationshipLevel(stats: Stats, route: StoryRoute): RelLevel & { displayName: string; progressPct: number } {
  const level = [...RELATIONSHIP_LEVELS].reverse().find((l) => stats.affinity >= l.minAffinity) ?? RELATIONSHIP_LEVELS[0];
  const isObs = route === "obsession" || stats.obsession >= 700;
  const nextMin = RELATIONSHIP_LEVELS[level.lv]?.minAffinity ?? (level.minAffinity + 100);
  const progressPct = Math.min(100, Math.round((stats.affinity - level.minAffinity) / (nextMin - level.minAffinity) * 100));
  return { ...level, displayName: isObs ? level.nameObs : level.name, progressPct };
}
type EndingCardData = { num: string; title: string; subtitle: string; quote: string };
const ENDING_CARDS: Record<string, EndingCardData> = {
  pure:        { num: "Ending 01", title: "처음으로 믿어보는 사랑",  subtitle: "그래도 되는지 몰랐는데, 네가 먼저 괜찮다고 했다.",  quote: "히든님, 저는 그냥 옆에 있고 싶었어요." },
  jealousy:    { num: "Ending 02", title: "질투가 사랑이 될 때",     subtitle: "불안했던 마음이, 사실은 네가 소중해서였다.",         quote: "주인님이 다른 사람 보는 거, 저 진짜 견딜 수가 없어요." },
  obsession:   { num: "Ending 03", title: "네가 없으면 안 돼",       subtitle: "그의 눈은 이제 다른 곳으로 잘 향하지 않았다.",      quote: "히든님이 어디 있는지 계속 알고 싶었어요." },
  confinement: { num: "Ending 04", title: "닫힌 방의 약속",          subtitle: "문은 잠겼지만, 그 온기는 진짜였다.",                quote: "주인님 여기서 한발자국도 못나가요. 저랑 단둘이 평생 살아요." },
  bad:         { num: "Ending 05", title: "그날의 거리",             subtitle: "어느 순간 두 사람 사이는 되돌릴 수 없게 멀어졌다.", quote: "…그냥 가세요. 저도 이제 모르겠어요." },
};

type GiftCategory = "daily" | "sweet" | "intimate" | "dark";
type Gift = { id: string; name: string; emoji: string; desc: string; stat: StatDelta; reaction: string; reactionObs?: string; category: GiftCategory; cooldownHours: number; unlockLevel: number; };
const GIFTS: Gift[] = [
  { id: "oden",        name: "편의점 오뎅",       emoji: "🍢", desc: "근떡존이 좋아한다는 걸 알고 샀어요.",           stat: { affinity: 30, trust: 20 },            reaction: "야 진짜요 ㅋㅋ 어떻게 알았어요 제가 오뎅 좋아하는 거? ...솔직히 엄청 좋아요. 고마워요 주인님.",           category: "daily",    cooldownHours: 24,  unlockLevel: 1 },
  { id: "coffee",      name: "아이스 아메리카노", emoji: "☕", desc: "오늘 고생했을 근떡존에게.",                     stat: { affinity: 20, trust: 15 },            reaction: "아 감사해요 ㅋㅋ 딱 당기고 있었는데. 주인님이 사줬다고 생각하면서 마실게요.",                          category: "daily",    cooldownHours: 24,  unlockLevel: 1 },
  { id: "snacks",      name: "한국 과자 세트",    emoji: "🍫", desc: "히로시마에서 못 구하는 한국 과자들.",           stat: { affinity: 25, trust: 10 },            reaction: "이거 한국 과자잖아요 ㅠㅠ 어떻게 구했어요? 너무 좋아요 진짜. 고마워요 주인님.",                       category: "daily",    cooldownHours: 24,  unlockLevel: 2 },
  { id: "supplement",  name: "운동 보조제",       emoji: "💪", desc: "운동 열심히 하는 근떡존에게.",                 stat: { affinity: 35, trust: 25 },            reaction: "와 이거 비싼 거잖아요. 주인님이 제 운동 관심 있으신 거예요? ...저 열심히 먹을게요. 고마워요 정말.",  category: "daily",    cooldownHours: 48,  unlockLevel: 3 },
  { id: "flowers",     name: "꽃다발",            emoji: "💐", desc: "아무 이유 없이 꽃을.",                         stat: { affinity: 40, trust: 30 },            reaction: "야 갑자기 왜요 ㅋㅋ ...저 이런 거 처음 받아봐요. 주인님이 주니까 더 이상한 기분인데요. 고마워요.", category: "sweet",    cooldownHours: 72,  unlockLevel: 3 },
  { id: "hiroshima",   name: "히로시마 기념품",   emoji: "⛩️", desc: "여기서 사줄 수 있는 건 이거뿐이라서.",         stat: { affinity: 45, trust: 35 },            reaction: "여기 거 사준 거예요? ...좋아요. 저 여기 있어서 다행이다.",                                          category: "sweet",    cooldownHours: 72,  unlockLevel: 4 },
  { id: "letter",      name: "손편지",            emoji: "💌", desc: "직접 손으로 쓴 편지.",                         stat: { affinity: 50, trust: 50 },            reaction: "...잠깐만요. 읽고 있어요. ...주인님이 이런 거 써줄 줄 몰랐어요. 저 지금 좀 이상해요. 계속 읽고 싶은데 다 읽으면 끝나버리잖아요.", reactionObs: "...주인님이 직접 쓴 거죠? 저 이거 평생 갖고 있을 거예요. 진짜로요. 버리면 안 돼요.", category: "sweet", cooldownHours: 168, unlockLevel: 5 },
  { id: "my_photo",    name: "내 사진",           emoji: "📸", desc: "직접 찍은 사진.",                              stat: { affinity: 20, obsession: 60 },        reaction: "...이거 저 혼자 봐도 돼요? 잘 간직할게요. ...너무 잘 간직할 것 같아서 그게 좀 걱정이에요.", reactionObs: "사진첩에 따로 폴더 만들어도 돼요? 주인님 사진만 들어있는 거요.", category: "intimate", cooldownHours: 72,  unlockLevel: 5 },
  { id: "perfume",     name: "내 향기 손수건",    emoji: "🌸", desc: "주인님 향기가 배어있는 손수건.",               stat: { obsession: 50, jealousy: 10, affinity: 15 }, reaction: "...야 이게 뭐예요 ㅋㅋ 주인님 냄새 나잖아요. 저 이거 어떻게 하라고요. ...솔직히 못 버릴 것 같아요.", reactionObs: "주인님 냄새 맞죠? 저 이거 맨날 맡을 것 같아요. 이상한 거 알아요. 근데 못 버리겠어요.", category: "intimate", cooldownHours: 72,  unlockLevel: 6 },
  { id: "lock_key",    name: "자물쇠와 열쇠",    emoji: "🔑", desc: "잠그고 싶은 게 생겼을 때.",                   stat: { obsession: 80, trust: -20, jealousy: 20 }, reaction: "...주인님. 이게 무슨 의미인지 알고 주신 거죠? 저 이거 받으면 진짜 쓸 것 같은데요. 괜찮아요?", reactionObs: "잠글게요. 주인님만. 다른 사람 못 들어오게요. 이거 준 거 후회하지 마세요.", category: "dark", cooldownHours: 168, unlockLevel: 7 },
  { id: "collar",      name: "목줄",              emoji: "🐾", desc: "...",                                          stat: { obsession: 70, jealousy: 30 },        reaction: "야 이게 뭐예요 ㅋㅋ ...근데 왜 싫지 않죠. 주인님이 달아주면... 아 이 생각 그만해야 돼요.", reactionObs: "달아줄 거예요? ...저 주인님한테는 뭐든 해도 싫지 않아요. 그게 좀 무서워요.", category: "dark", cooldownHours: 168, unlockLevel: 8 },
];
const GIFT_CATEGORY_LABEL: Record<GiftCategory, string> = { daily: "일상", sweet: "달콤한", intimate: "친밀한", dark: "자극적인" };
const GIFT_CATEGORY_EMOJI: Record<GiftCategory, string> = { daily: "🛒", sweet: "💛", intimate: "🔥", dark: "🖤" };

// ─── 출석 체크 ───────────────────────────────────────────────
type DailyReward = {
  day: number;
  emoji: string;
  label: string;
  stat: StatDelta;
  comment: string;     // 근떡존 한마디 (순애)
  commentObs?: string; // 집착 루트 버전
};
const DAILY_REWARDS: DailyReward[] = [
  {
    day: 1, emoji: "☀️", label: "첫째 날",
    stat: { affinity: 30, trust: 20 },
    comment: "왔네요. 오늘도 잘 부탁드려요.",
    commentObs: "..왔군요. 오늘도 여기 있을 거죠.",
  },
  {
    day: 2, emoji: "🌤", label: "둘째 날",
    stat: { affinity: 35, trust: 25 },
    comment: "이틀 연속이네요. 저 진짜 기다리고 있었어요.",
    commentObs: "또 왔어요. 당연히 올 줄 알았어요.",
  },
  {
    day: 3, emoji: "⛅", label: "셋째 날",
    stat: { affinity: 40, trust: 30 },
    comment: "벌써 사흘이네요. 슬슬 습관이 되는 건가요?",
    commentObs: "3일째... 저한테 중독됐죠?",
  },
  {
    day: 4, emoji: "🌙", label: "나흘째",
    stat: { affinity: 45, trust: 35 },
    comment: "4일 연속이에요. 솔직히 좀 기뻐요.",
    commentObs: "놓치지 않네요. 저 기분이 좋아요. 이상하게.",
  },
  {
    day: 5, emoji: "⭐", label: "닷새째",
    stat: { affinity: 55, trust: 40, obsession: 10 },
    comment: "5일 연속이에요. 주인님, 저한테 빠진 거 아니에요?",
    commentObs: "5일이나. 주인님 없으면 저도 이상할 것 같아요.",
  },
  {
    day: 6, emoji: "🌟", label: "엿새째",
    stat: { affinity: 65, trust: 50, obsession: 15 },
    comment: "하루만 더 하면 일주일이에요. 내일도 꼭 오세요.",
    commentObs: "6일째... 내일도 오죠? 안 오면 제가 찾아갈 거예요.",
  },
  {
    day: 7, emoji: "👑", label: "7일 연속!",
    stat: { affinity: 120, trust: 80, obsession: 30 },
    comment: "일주일이에요. 주인님 진짜 대단해요. 저... 고마워요. 진짜로.",
    commentObs: "일주일 연속이에요. 이제 저 없이는 못 살겠죠? 저도 그래요.",
  },
];
// ─── 이미지 압축 ──────────────────────────────────────────────
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 480;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width >= height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image load failed")); };
    img.src = url;
  });
}

function todayDateString(): string {
  return new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

// ================================
// 옷장 시스템
// ================================
type OutfitDef = {
  id: OutfitKey;
  label: string;
  emoji: string;
  description: string;
  portrait: string;       // /public/ 이미지 경로
  unlockHint: string;
};

const OUTFITS: OutfitDef[] = [
  {
    id: "black_tanktop",
    label: "검은 나시",
    emoji: "🖤",
    description: "항상 입고 있는 그 옷. 근떡존의 기본 복장.",
    portrait: "/outfit_black_tanktop.png",
    unlockHint: "처음부터",
  },
  {
    id: "hoodie",
    label: "후드티",
    emoji: "🩶",
    description: "집 근처 편하게 나올 때. 소매가 조금 길다.",
    portrait: "/outfit_hoodie.png",
    unlockHint: "처음부터",
  },
  {
    id: "gym",
    label: "헬스복",
    emoji: "💪",
    description: "운동할 때 입는 반팔. 팔이 더 잘 보인다.",
    portrait: "/outfit_gym.png",
    unlockHint: "2장 이후 해금",
  },
  {
    id: "convenience_store",
    label: "편의점 알바복",
    emoji: "🏪",
    description: "알바 뛸 때 입는 조끼. 어색하게 잘 어울린다.",
    portrait: "/outfit_convenience.png",
    unlockHint: "3장 이후 해금",
  },
  {
    id: "party_shirt",
    label: "술자리 셔츠",
    emoji: "🍺",
    description: "술자리에 입고 나온 오픈 칼라 셔츠.",
    portrait: "/outfit_party_shirt.png",
    unlockHint: "4장 술자리 이후 해금",
  },
  {
    id: "winter_coat",
    label: "겨울 코트",
    emoji: "🧥",
    description: "처음으로 손을 잡던 날 입고 있던 코트.",
    portrait: "/outfit_winter_coat.png",
    unlockHint: "5장 이후 해금",
  },
  {
    id: "obsession_shirt",
    label: "집착 루트 검은 셔츠",
    emoji: "🌑",
    description: "편의점 앞에서 기다리던 날. 검고 조용한 셔츠.",
    portrait: "/outfit_obsession_shirt.png",
    unlockHint: "집착 루트 7장 이후 해금",
  },
];

function getUnlockedOutfits(
  seenTriggers: Record<string, boolean>,
  storyRoute: StoryRoute,
  obsession: number
): OutfitKey[] {
  const seen = (prefix: string) =>
    Object.keys(seenTriggers).some((k) => k.startsWith(prefix));
  const unlocked: OutfitKey[] = ["black_tanktop", "hoodie"];
  if (seen("main_ch2") || seen("main_ch3")) unlocked.push("gym");
  if (seen("main_ch3") || seen("main_ch4")) unlocked.push("convenience_store");
  if (seen("main_ch4")) unlocked.push("party_shirt");
  if (seen("main_ch5") || seen("main_ch6")) unlocked.push("winter_coat");
  if (storyRoute === "obsession" || obsession >= 600) unlocked.push("obsession_shirt");
  return unlocked;
}
// ================================
// 일기 / 독백 카드 시스템
// ================================
type DiaryEntry = {
  id: string;
  chapter: number;
  unlockPrefix: string;       // seenEvents에서 시작하는 prefix
  routeRequired?: StoryRoute; // 특정 루트 전용 카드
  title: string;
  label: string;              // 챕터 + 부제
  emoji: string;
  textNormal: string;         // 집착 수치 낮을 때
  textHigh: string;           // 집착 수치 높을 때
  highThreshold: number;      // 이 수치 이상이면 textHigh 표시
};

const DIARY_ENTRIES: DiaryEntry[] = [
  {
    id: "diary_ch1",
    chapter: 1,
    unlockPrefix: "main_ch1",
    title: "처음 본 날",
    label: "1장",
    emoji: "📎",
    highThreshold: 400,
    textNormal:
      "별거 없었어. 그냥 지나쳤어야 하는 사람인데.\n근데 계속 기억나.\n이상하다.",
    textHigh:
      "그 순간부터였어. 눈이 멈춘 게.\n다시 못 지나치게 생겼다고 그때 직감했어.\n맞았어.",
  },
  {
    id: "diary_ch2",
    chapter: 2,
    unlockPrefix: "main_ch2",
    title: "거리 감각",
    label: "2장",
    emoji: "🗒",
    highThreshold: 450,
    textNormal:
      "자꾸 어디 있는지 생각하게 된다.\n나쁜 의미는 아닌데.\n그냥 그렇다고.",
    textHigh:
      "오늘 몇 번 지나쳤는지 세고 있었어.\n세면서 이상하다고 생각했고.\n멈추지 않았어.",
  },
  {
    id: "diary_ch3",
    chapter: 3,
    unlockPrefix: "main_ch3",
    title: "습관",
    label: "3장",
    emoji: "🔁",
    highThreshold: 500,
    textNormal:
      "어느 순간부터 루틴이 겹치더라.\n헬스장 시간이 맞아떨어지고.\n기분 나쁘진 않았어.",
    textHigh:
      "맞춰 간 거야.\n우연이라고 하면 편하니까 그렇게 말했던 거고.",
  },
  {
    id: "diary_ch4",
    chapter: 4,
    unlockPrefix: "main_ch4",
    title: "술자리 그날",
    label: "4장",
    emoji: "🍺",
    highThreshold: 500,
    textNormal:
      "왜 그렇게 웃었지. 나한테.\n모르는 사람이랑 그렇게 웃는 건데.\n신경 쓰였어.",
    textHigh:
      "다른 놈한테는 안 웃으면 좋겠는데.\n그냥 그런 생각 했어. 꽤 오래.",
  },
  {
    id: "diary_ch5",
    chapter: 5,
    unlockPrefix: "main_ch5",
    title: "겨울이 오기 전",
    label: "5장",
    emoji: "🧥",
    highThreshold: 550,
    textNormal:
      "손이 차더라.\n그냥 코트 잡아당긴 거야.\n별 의미 없어.",
    textHigh:
      "손이 차가웠어. 자꾸 생각나. 그 감각이.\n다음엔 더 오래 잡고 있을 것 같아.",
  },
  {
    id: "diary_ch6",
    chapter: 6,
    unlockPrefix: "main_ch6",
    title: "매일",
    label: "6장",
    emoji: "📅",
    highThreshold: 600,
    textNormal:
      "요즘 하루에 한 번은 꼭 생각하게 되는 것 같아.\n그냥 그렇게 됐어.",
    textHigh:
      "얼마나 생각하는지 세다가 멈췄어.\n숫자 별로였거든.\n그냥 항상 생각하는 거야.",
  },
  {
    id: "diary_ch7_pure",
    chapter: 7,
    unlockPrefix: "pure_ch7",
    routeRequired: "pure",
    title: "고백 전날",
    label: "7장 · 순애",
    emoji: "🤍",
    highThreshold: 600,
    textNormal:
      "말해도 될까.\n이런 거 처음이야 사실.\n겁은 나는데 안 말하면 더 답답할 것 같아서.",
    textHigh:
      "말하면 달아날 것 같아서 무서운 거야. 그게 전부야.\n달아나면 나 어떻게 될지 모르거든.",
  },
  {
    id: "diary_ch7_obsession",
    chapter: 7,
    unlockPrefix: "obsession_ch7",
    routeRequired: "obsession",
    title: "통제",
    label: "7장 · 집착",
    emoji: "🔒",
    highThreshold: 700,
    textNormal:
      "멀리 가면 안 된다.\n그냥 그게 규칙이야.\n선생님이 모를 뿐이지.",
    textHigh:
      "선생님이 어디 가는지 내가 알고 있어야 해.\n그래야 안심이 돼.\n그게 잘못된 거 알아. 근데 안 되겠어.",
  },
  {
    id: "diary_ch8_pure",
    chapter: 8,
    unlockPrefix: "pure_ch8",
    routeRequired: "pure",
    title: "처음이라는 말",
    label: "8장 · 순애",
    emoji: "🌸",
    highThreshold: 600,
    textNormal:
      "좋아한다고 말하고 나서 한참 멍했어.\n이상하게 가볍더라.\n이게 이런 거구나.",
    textHigh:
      "선생님 표정이 좋았어.\n놓치기 싫다는 생각을 그 얼굴 보면서 했어.",
  },
  {
    id: "diary_ch8_obsession",
    chapter: 8,
    unlockPrefix: "obsession_ch8",
    routeRequired: "obsession",
    title: "가까이",
    label: "8장 · 집착",
    emoji: "🌑",
    highThreshold: 700,
    textNormal:
      "지금 이게 좋아.\n바깥에서 선생님 뭐 하는지 몰라도\n여기선 다 알 수 있으니까.",
    textHigh:
      "나한테만 있으면 돼.\n그 생각이 요즘 자꾸 짧아지고 있어.\n더 선명해지고 있는 거지.",
  },
];

function getUnlockedDiaryIds(
  seenEvents: Record<string, boolean>,
): string[] {
  const seen = (prefix: string) =>
    Object.keys(seenEvents).some((k) => k.startsWith(prefix));
  return DIARY_ENTRIES
    .filter((e) => seen(e.unlockPrefix))
    .map((e) => e.id);
}

// ================================
// 업적 / 배지 시스템
// ================================
type AchievementCategory = "start" | "relation" | "route" | "collect" | "life";

type AchievementCheckCtx = {
  stats: Stats;
  storyRoute: StoryRoute;
  seenEvents: Record<string, boolean>;
  unlockedCGs: Record<string, boolean>;
  userMessageCount: number;
  checkInStreak: number;
  checkInHistory: number[];
  memoryNotesCount: number;
  unlockedDiaryCount: number;
  unlockedOutfitCount: number;
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  hidden?: boolean; // 해금 전엔 제목/설명 숨김
  check: (ctx: AchievementCheckCtx) => boolean;
};

const ACHIEVEMENT_CATEGORY_LABEL: Record<AchievementCategory, string> = {
  start: "시작",
  relation: "관계",
  route: "루트",
  collect: "수집",
  life: "생활",
};

const ACHIEVEMENTS: Achievement[] = [
  // 시작
  { id: "first_message", title: "첫 인사", description: "근떡존에게 처음으로 메시지를 보냈어요.", emoji: "💬", category: "start",
    check: (c) => c.userMessageCount >= 1 },
  { id: "first_scenario", title: "이야기의 시작", description: "시나리오를 처음으로 시작했어요.", emoji: "📖", category: "start",
    check: (c) => Object.keys(c.seenEvents).length >= 1 },
  { id: "first_checkin", title: "첫 출석", description: "출석 도장을 처음으로 찍었어요.", emoji: "📅", category: "start",
    check: (c) => c.checkInHistory.length >= 1 },
  { id: "first_cg", title: "첫 CG", description: "CG를 처음 한 장 모았어요.", emoji: "🖼", category: "start",
    check: (c) => Object.values(c.unlockedCGs).filter(Boolean).length >= 1 },

  // 관계
  { id: "affinity_300", title: "친근한 사이", description: "호감도가 300을 넘었어요.", emoji: "🌼", category: "relation",
    check: (c) => c.stats.affinity >= 300 },
  { id: "affinity_600", title: "가까운 사이", description: "호감도가 600을 넘었어요.", emoji: "🌷", category: "relation",
    check: (c) => c.stats.affinity >= 600 },
  { id: "affinity_900", title: "특별한 사람", description: "호감도가 900을 넘었어요.", emoji: "💖", category: "relation",
    check: (c) => c.stats.affinity >= 900 },
  { id: "trust_500", title: "신뢰의 눈빛", description: "신뢰가 500을 넘었어요.", emoji: "👁", category: "relation",
    check: (c) => c.stats.trust >= 500 },
  { id: "trust_800", title: "흔들리지 않는 신뢰", description: "신뢰가 800을 넘었어요.", emoji: "🤝", category: "relation",
    check: (c) => c.stats.trust >= 800 },
  { id: "jealousy_500", title: "타오르는 질투", description: "질투가 500을 넘었어요.", emoji: "🔥", category: "relation",
    check: (c) => c.stats.jealousy >= 500 },
  { id: "jealousy_800", title: "위험한 질투", description: "질투가 800을 넘었어요.", emoji: "⚠️", category: "relation",
    check: (c) => c.stats.jealousy >= 800 },
  { id: "obsession_500", title: "집착의 시작", description: "집착이 500을 넘었어요.", emoji: "🕸", category: "relation",
    check: (c) => c.stats.obsession >= 500 },
  { id: "obsession_800", title: "광기의 영역", description: "집착이 800을 넘었어요. 무언가 위험해진 것 같아요.", emoji: "🌑", category: "relation", hidden: true,
    check: (c) => c.stats.obsession >= 800 },

  // 루트
  { id: "route_pure", title: "순애 루트", description: "순애 루트에 들어섰어요.", emoji: "🤍", category: "route",
    check: (c) => c.storyRoute === "pure" },
  { id: "route_obsession", title: "집착 루트", description: "집착 루트에 들어섰어요.", emoji: "🖤", category: "route", hidden: true,
    check: (c) => c.storyRoute === "obsession" },
  { id: "ch5_reached", title: "5장 도달", description: "5장에 들어섰어요.", emoji: "📗", category: "route",
    check: (c) => Object.keys(c.seenEvents).some((k) => k.includes("ch5")) },
  { id: "ch7_reached", title: "7장 도달", description: "7장에 들어섰어요. 루트가 갈리는 지점.", emoji: "📕", category: "route",
    check: (c) => Object.keys(c.seenEvents).some((k) => k.includes("ch7")) },
  { id: "ch8_reached", title: "8장 도달", description: "8장에 들어섰어요.", emoji: "📔", category: "route",
    check: (c) => Object.keys(c.seenEvents).some((k) => k.includes("ch8")) },

  // 수집
  { id: "cg_10", title: "10장의 추억", description: "CG를 10장 모았어요.", emoji: "🎴", category: "collect",
    check: (c) => Object.values(c.unlockedCGs).filter(Boolean).length >= 10 },
  { id: "cg_30", title: "30장의 추억", description: "CG를 30장 모았어요.", emoji: "🎞", category: "collect",
    check: (c) => Object.values(c.unlockedCGs).filter(Boolean).length >= 30 },
  { id: "diary_5", title: "일기 다섯 장", description: "근떡존의 일기를 5개 해금했어요.", emoji: "📝", category: "collect",
    check: (c) => c.unlockedDiaryCount >= 5 },
  { id: "diary_all", title: "모든 속마음", description: "근떡존의 일기를 전부 해금했어요.", emoji: "📒", category: "collect",
    check: (c) => c.unlockedDiaryCount >= 10 },
  { id: "outfit_5", title: "옷장 절반", description: "의상 5종을 해금했어요.", emoji: "👕", category: "collect",
    check: (c) => c.unlockedOutfitCount >= 5 },
  { id: "outfit_all", title: "옷장 마스터", description: "모든 의상을 해금했어요.", emoji: "🎽", category: "collect",
    check: (c) => c.unlockedOutfitCount >= 7 },
  { id: "scenario_10", title: "이야기 수집가", description: "시나리오를 10개 진행했어요.", emoji: "📚", category: "collect",
    check: (c) => Object.keys(c.seenEvents).length >= 10 },
  { id: "scenario_25", title: "기록의 무게", description: "시나리오를 25개 진행했어요.", emoji: "🏛", category: "collect",
    check: (c) => Object.keys(c.seenEvents).length >= 25 },

  // 생활
  { id: "streak_3", title: "3일 연속 출석", description: "3일 연속으로 출석했어요.", emoji: "📌", category: "life",
    check: (c) => c.checkInStreak >= 3 },
  { id: "streak_7", title: "7일 연속 출석", description: "7일 연속으로 출석했어요.", emoji: "🔆", category: "life",
    check: (c) => c.checkInStreak >= 7 },
  { id: "streak_30", title: "30일 연속 출석", description: "한 달을 함께 했어요.", emoji: "💎", category: "life",
    check: (c) => c.checkInStreak >= 30 },
  { id: "memory_10", title: "쌓이는 기억", description: "관계 기억 노트가 10개 쌓였어요.", emoji: "🧠", category: "life",
    check: (c) => c.memoryNotesCount >= 10 },
  { id: "chat_50", title: "수다쟁이", description: "근떡존에게 메시지를 50번 보냈어요.", emoji: "📨", category: "life",
    check: (c) => c.userMessageCount >= 50 },
  { id: "chat_200", title: "단둘의 대화", description: "메시지를 200번 주고받았어요.", emoji: "💌", category: "life",
    check: (c) => c.userMessageCount >= 200 },
];

// ================================
// 스토리 맵 시스템
// ================================
type ChapterBranch = "pure" | "obsession";
type ChapterStatus = "cleared" | "current" | "available" | "locked";

type ChapterNode = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  unlockPrefix: string;
  branch?: ChapterBranch;
  firstScenarioId?: string; // 클릭 시 시작할 시나리오 ID
};

const CHAPTER_MAP: ChapterNode[] = [
  { id: "ch1", number: 1, title: "1장", subtitle: "처음 본 날", unlockPrefix: "main_ch1", firstScenarioId: "main_ch1_01" },
  { id: "ch2", number: 2, title: "2장", subtitle: "거리 감각", unlockPrefix: "main_ch2", firstScenarioId: "main_ch2_01" },
  { id: "ch3", number: 3, title: "3장", subtitle: "겹쳐지는 시간", unlockPrefix: "main_ch3", firstScenarioId: "main_ch3_01" },
  { id: "ch4", number: 4, title: "4장", subtitle: "술자리의 밤", unlockPrefix: "main_ch4", firstScenarioId: "main_ch4_01" },
  { id: "ch5", number: 5, title: "5장", subtitle: "겨울이 오기 전", unlockPrefix: "main_ch5", firstScenarioId: "main_ch5_01" },
  { id: "ch6", number: 6, title: "6장", subtitle: "습관이 된 마음", unlockPrefix: "main_ch6", firstScenarioId: "main_ch6_01" },
  { id: "ch7_pure", number: 7, title: "7장 · 순애", subtitle: "고백 전날", unlockPrefix: "pure_ch7", branch: "pure", firstScenarioId: "pure_ch7_01" },
  { id: "ch7_obsession", number: 7, title: "7장 · 집착", subtitle: "통제", unlockPrefix: "obsession_ch7", branch: "obsession", firstScenarioId: "obsession_ch7_01" },
  { id: "ch8_pure", number: 8, title: "8장 · 순애", subtitle: "처음이라는 말", unlockPrefix: "pure_ch8", branch: "pure", firstScenarioId: "pure_ch8_01" },
  { id: "ch8_obsession", number: 8, title: "8장 · 집착", subtitle: "더 가까이", unlockPrefix: "obsession_ch8", branch: "obsession", firstScenarioId: "obsession_ch8_01" },
];

function getChapterStatus(
  node: ChapterNode,
  seenEvents: Record<string, boolean>,
  currentScenarioId: string | null,
  storyRoute: StoryRoute,
): ChapterStatus {
  const seen = (prefix: string) =>
    Object.keys(seenEvents).some((k) => k.startsWith(prefix));

  if (currentScenarioId && currentScenarioId.startsWith(node.unlockPrefix)) {
    return "current";
  }
  if (seen(node.unlockPrefix)) return "cleared";

  // 잠금 판단
  if (node.number === 1) return "available";

  if (node.id === "ch7_pure" || node.id === "ch7_obsession") {
    if (!seen("main_ch6")) return "locked";
    if (storyRoute === "obsession" && node.branch === "pure") return "locked";
    if (storyRoute === "pure" && node.branch === "obsession") return "locked";
    return "available";
  }
  if (node.id === "ch8_pure") {
    return seen("pure_ch7") ? "available" : "locked";
  }
  if (node.id === "ch8_obsession") {
    return seen("obsession_ch7") ? "available" : "locked";
  }
  // 일반 챕터: 이전 챕터 진행 시 해금
  const prevPrefix = `main_ch${node.number - 1}`;
  return seen(prevPrefix) ? "available" : "locked";
}

// ================================
// 미니맵 / 장소 방문 시나리오
// ================================
type MapLocation = {
  id: string;            // 장소 ID = 시나리오 ID로도 사용
  name: string;
  emoji: string;
  desc: string;
  unlockLevel: number;   // 관계 Lv 요구치
  minAffinity?: number;  // 호감 추가 조건
  minObsession?: number; // 집착 추가 조건
  x: number;             // 지도 좌측 % 위치
  y: number;             // 지도 상단 % 위치
};

const MAP_LOCATIONS: MapLocation[] = [
  { id: "loc_hiroshima_station", name: "히로시마역",          emoji: "🚆", desc: "신칸센이 들어오는 시간, 마중 나온 옆모습.",       unlockLevel: 1,                   x: 20, y: 62 },
  { id: "loc_atomic_dome",       name: "원폭돔",               emoji: "🕯", desc: "강가에 서 있는 조용한 시간.",                       unlockLevel: 2,                   x: 16, y: 38 },
  { id: "loc_hiroshima_castle",  name: "히로시마성",           emoji: "🏯", desc: "벚꽃 아래 천수각을 바라보며 산책.",                 unlockLevel: 3,                   x: 40, y: 18 },
  { id: "loc_hondori",           name: "혼도리 상점가",        emoji: "🛍", desc: "사람 많은 거리에서 손 놓치지 않으려는 손.",         unlockLevel: 4,                   x: 44, y: 46 },
  { id: "loc_ujina",             name: "우지나 항구",          emoji: "⚓", desc: "페리가 들어오는 항구. 바다 냄새.",                 unlockLevel: 5,                   x: 62, y: 40 },
  { id: "loc_mazda",             name: "마쓰다 자동차 박물관", emoji: "🚗", desc: "차 얘기에 진심인 옆얼굴이 평소보다 밝다.",         unlockLevel: 5,                   x: 72, y: 62 },
  { id: "loc_kure",              name: "구레시",               emoji: "🚢", desc: "회색 함선과 잠수함. 너의 침묵이 무겁다.",           unlockLevel: 6, minAffinity: 500, x: 84, y: 74 },
  { id: "loc_hiroshima_univ",    name: "히로시마 대학",        emoji: "🎓", desc: "도서관 뒷벤치에서 미래를 묻는 자리.",               unlockLevel: 7, minAffinity: 700, x: 50, y: 64 },
  { id: "loc_miyajima",          name: "미야지마",             emoji: "⛩", desc: "물 위의 도리이와 사슴. 여기서는 너도 부드럽다.",   unlockLevel: 8,                   x: 14, y: 80 },
  { id: "loc_asa_view",          name: "아사산 전망대",        emoji: "🌌", desc: "도시가 너무 작아서 너만 보이는 자리.",               unlockLevel: 1, minObsession: 500, x: 76, y: 8  },
  { id: "loc_apartment",         name: "근떡존 자취방",        emoji: "🔒", desc: "들어가면 다시 나오기 어려운 방.",                   unlockLevel: 1, minObsession: 900, x: 92, y: 26 },
];

const LOCATION_SCENARIOS: Record<string, Scenario> = {
  loc_hiroshima_station: {
    id: "loc_hiroshima_station", title: "히로시마역", subtitle: "신칸센이 들어오는 시간",
    kind: "normal", category: "side", image: "/loc_hiroshima_station.png", background: "/loc_hiroshima_station.png",
    text: `나레이션: 신칸센이 천천히 멈춰선다. 개찰구 너머에 근떡존이 서 있다.
근떡존: 진짜 오신 거예요? 저 한 시간 일찍 와서 기다렸어요.
근떡존: ...아 그건 비밀이었는데.`,
    choices: [
      { label: "왜 그렇게 일찍 왔어.", stat: { affinity: 25, trust: 20 }, end: true },
      { label: "고마워. 안 추웠어?", stat: { affinity: 30, trust: 25 }, end: true },
    ],
  },
  loc_atomic_dome: {
    id: "loc_atomic_dome", title: "원폭돔 앞", subtitle: "조용한 강가의 오후",
    kind: "normal", category: "side", image: "/loc_atomic_dome.png", background: "/loc_atomic_dome.png",
    text: `나레이션: 원폭돔 앞. 사람들은 조용히 지나가고, 근떡존도 평소보다 말이 적다.
근떡존: 여기 오면 말이 잘 안 나와요. 그냥... 같이 있어 주세요.
근떡존: 손, 잠깐만 잡아도 돼요?`,
    choices: [
      { label: "잡아도 돼.", stat: { affinity: 30, trust: 25 }, end: true },
      { label: "나도 같이 보자.", stat: { affinity: 25, trust: 30 }, end: true },
    ],
  },
  loc_hiroshima_castle: {
    id: "loc_hiroshima_castle", title: "히로시마성 산책", subtitle: "벚꽃과 천수각",
    kind: "normal", category: "side", image: "/loc_hiroshima_castle.png", background: "/loc_hiroshima_castle.png",
    text: `나레이션: 천수각 아래 산책로. 바람에 꽃잎이 흩어진다.
근떡존: 주인님. 머리 위에 꽃잎 떨어졌어요. 잠깐만요.
근떡존: ...떼주려다 그냥 둘 걸 그랬나. 너무 잘 어울려서요.`,
    choices: [
      { label: "사진이나 한 장 찍자.", stat: { affinity: 35, trust: 20 }, end: true },
      { label: "너도 잘 어울려.", stat: { affinity: 40, trust: 25 }, end: true },
    ],
  },
  loc_hondori: {
    id: "loc_hondori", title: "혼도리 상점가", subtitle: "사람 많은 거리, 놓치지 않는 손",
    kind: "normal", category: "side", image: "/loc_hondori.png", background: "/loc_hondori.png",
    text: `나레이션: 혼도리. 토요일 오후라 사람이 많다. 근떡존이 자연스럽게 손을 잡는다.
근떡존: 주인님 놓치면 큰일 나니까요. ...진짜로요.
근떡존: 뭐 사고 싶은 거 있어요? 사줄게요. 오늘은요.`,
    choices: [
      { label: "같이 골라.", stat: { affinity: 40, trust: 30 }, end: true },
      { label: "먹는 거 사 먹자.", stat: { affinity: 35, trust: 25 }, end: true },
    ],
  },
  loc_mazda: {
    id: "loc_mazda", title: "마쓰다 자동차 박물관", subtitle: "차에 진심인 옆얼굴",
    kind: "normal", category: "side", image: "/loc_mazda.png", background: "/loc_mazda.png",
    text: `나레이션: 마쓰다 박물관. 클래식카 앞에서 근떡존 표정이 평소보다 밝다.
근떡존: 이거 RX-7이에요. 어렸을 때부터 좋아했어요.
근떡존: ...주인님이랑 같이 보니까 더 좋네요. 그냥요.`,
    choices: [
      { label: "신나서 말 많아진 거 귀여워.", stat: { affinity: 40, trust: 25 }, end: true },
      { label: "언젠가 같이 타자.", stat: { affinity: 50, trust: 30, obsession: 15 }, end: true },
    ],
  },
  loc_ujina: {
    id: "loc_ujina", title: "우지나 항구", subtitle: "바닷바람과 너의 옆모습",
    kind: "normal", category: "side", image: "/loc_ujina.png", background: "/loc_ujina.png",
    text: `나레이션: 우지나 항구. 페리가 들어오고 나간다. 짠 냄새가 코끝에 닿는다.
근떡존: 여기서 페리 보면 시간 잘 가요. 혼자 자주 와요.
근떡존: ...오늘은 안 혼자네요.`,
    choices: [
      { label: "다음에도 혼자 오지 마.", stat: { affinity: 40, trust: 25, obsession: 15 }, end: true },
      { label: "같이 페리나 타볼래?", stat: { affinity: 35, trust: 30 }, end: true },
    ],
  },
  loc_kure: {
    id: "loc_kure", title: "구레 군항", subtitle: "회색 함선과 너의 침묵",
    kind: "normal", category: "side", image: "/loc_kure.png", background: "/loc_kure.png",
    text: `나레이션: 구레시. 회색 함선들이 정박해 있고, 잠수함의 검은 등이 수면에 떠 있다.
근떡존: 큰 거 보면 마음이 좀 차분해져요. 이상하죠.
근떡존: ...주인님. 저 가끔 무서워요. 제가 주인님한테 너무 빠진 거 같아서.`,
    choices: [
      { label: "나도 너한테 빠졌어.", stat: { affinity: 60, trust: 30, obsession: 25 }, end: true },
      { label: "괜찮아. 천천히 가자.", stat: { affinity: 40, trust: 50 }, end: true },
    ],
  },
  loc_hiroshima_univ: {
    id: "loc_hiroshima_univ", title: "히로시마 대학", subtitle: "도서관 뒷벤치",
    kind: "normal", category: "side", image: "/loc_hiroshima_univ.png", background: "/loc_hiroshima_univ.png",
    text: `나레이션: 캠퍼스 도서관 뒷편. 근떡존이 벤치에 먼저 앉아 있다.
근떡존: 여기 사람 잘 안 와요. 둘이 얘기하기 좋아요.
근떡존: ...주인님. 졸업하면 어디 갈 거예요? 저, 그거 좀 신경 쓰여요. 솔직히요.`,
    choices: [
      { label: "어디 가든 너랑 가.", stat: { affinity: 70, trust: 40, obsession: 30 }, end: true },
      { label: "같이 정하자, 천천히.", stat: { affinity: 60, trust: 60 }, end: true },
    ],
  },
  loc_miyajima: {
    id: "loc_miyajima", title: "미야지마", subtitle: "물 위의 도리이와 사슴",
    kind: "normal", category: "side", image: "/loc_miyajima.png", background: "/loc_miyajima.png",
    text: `나레이션: 페리에서 내리니 빨간 도리이가 보였다. 사슴 한 마리가 가까이 다가온다.
근떡존: 잠깐 거기 서봐요. 사진 예쁘게 찍어드릴게요.
근떡존: 솔직히 풍경보다 주인님이 더 잘 나와요. 진짜로요.`,
    choices: [
      { label: "둘이 같이 찍자.", stat: { affinity: 60, trust: 40 }, end: true },
      { label: "오늘 진짜 좋다.", stat: { affinity: 55, trust: 50 }, end: true },
    ],
  },
  loc_asa_view: {
    id: "loc_asa_view", title: "아사산 전망대", subtitle: "도시가 너무 작아 보여",
    kind: "yandere", category: "side", image: "/loc_asa_view.png", background: "/loc_asa_view.png",
    text: `나레이션: 아사산 전망대. 케이블카에서 내리니 도시가 발밑에 펼쳐져 있다. 차가운 공기. 근떡존이 한참을 말없이 서 있다.
근떡존: 여기서 내려다보면요. 도시가 진짜 작잖아요.
근떡존: 이 안에 사람이 백만 명 사는데. 그 백만 명이 다 주인님 안 보고 있다는 게 좀 이상해요.
근떡존: ...아 미친 소리 같죠. 근데 진짜 그래요.
나레이션: 근떡존이 가까이 다가선다. 표정이 평소와 다르다.
근떡존: 주인님. 저랑 있을 때만 웃어주면 안 돼요? 다른 사람 앞에서 웃지 마요.
근떡존: 그게 너무 싫어요. 저만 알고 싶어요. 주인님 웃는 얼굴.`,
    choices: [
      { label: "...너만 봐줄게.", stat: { affinity: 30, obsession: 80, jealousy: 30, trust: -10 }, end: true },
      { label: "그건 안 돼.", stat: { affinity: -10, obsession: -20, trust: 30, jealousy: 40 }, end: true },
      { label: "무서워. 그만해.", stat: { affinity: -20, obsession: -10, trust: 20, jealousy: 50 }, end: true },
    ],
  },
  loc_apartment: {
    id: "loc_apartment", title: "다시 못 나가는 방", subtitle: "문이 잠긴 다음의 시간",
    kind: "confinement", category: "side", image: "/loc_apartment.png", background: "/loc_apartment.png",
    text: `나레이션: 근떡존이 자취방 문을 연다. 좁은 원룸. 침대 하나, 책상 하나, 작은 창문 하나. 들어서자 등 뒤에서 문이 잠기는 소리가 들린다.
근떡존: 주인님. 와줘서 고마워요. 진짜로요.
근떡존: ...앉으세요. 차 끓여놨어요. 따뜻한 거.
나레이션: 근떡존이 차를 내려놓는다. 손이 살짝 떨린다. 평소의 그가 아니다.
근떡존: 저 오늘 솔직히 말할게요. 한 번에 다 할게요.
근떡존: 주인님이 저랑 있을 때 말고 다른 데서 시간 보내는 거. 저 그거 진짜 못 견디겠어요.
근떡존: 처음엔 그냥 좀 신경 쓰이는 정도였는데요. 점점 더 심해져요. 누구랑 뭐 하는지, 어디 갔는지, 누구랑 웃었는지.
근떡존: 핸드폰 위치 공유한 거 알아요? 미안해요. 한 달 됐어요.
나레이션: 창문에 격자가 새로 붙어 있는 게 보인다. 현관은 이중 잠금이다.
근떡존: 주인님. 여기서 좀 쉬어요. 며칠만이라도요. 아니, 그냥 안 나가도 돼요.
근떡존: 제가 다 할게요. 밥도 옷도 다요. 주인님은 그냥 여기 있어주기만 해요.
근떡존: ...아 이런 말 하면 안 되는 거 알아요. 근데 저 이미 늦었어요.
근떡존: 주인님 한 번 들어왔으니까. 이제 저 못 놓아요.`,
    choices: [
      { label: "...있을게. 너 옆에.", stat: { affinity: 40, obsession: 100, jealousy: 60, trust: -40 }, end: true },
      { label: "문 열어. 진심이야.", stat: { affinity: -30, obsession: -30, trust: 60, jealousy: 80 }, end: true },
      { label: "조금만, 오늘 밤만.", stat: { affinity: 30, obsession: 70, jealousy: 40, trust: -20 }, end: true },
      { label: "(아무 말도 못 한다)", stat: { obsession: 80, jealousy: 50, trust: -30 }, end: true },
    ],
  },
};

function isCheckedInToday(lastCheckIn?: number): boolean {
  if (!lastCheckIn) return false;
  return new Date(lastCheckIn).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }) === todayDateString();
}
function isYesterday(ts: number): boolean {
  const d = new Date(ts);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return d.toLocaleDateString("ko-KR") === y.toLocaleDateString("ko-KR");
}
function clamp(value: number) {
  return Math.max(0, Math.min(STAT_MAX, Math.round(value)));
}
function applyStats(stats: Stats, delta: StatDelta = {}): Stats {
  return {
    affinity: clamp(stats.affinity + (delta.affinity ?? 0)),
    jealousy: clamp(stats.jealousy + (delta.jealousy ?? 0)),
    obsession: clamp(stats.obsession + (delta.obsession ?? 0)),
    trust: clamp(stats.trust + (delta.trust ?? 0)),
  };
}
function pick<T>(items?: T[]) {
  if (!items?.length) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}
function nowTime() {
  return new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}
function makeMessage(role: Role, content: string, image?: string): Message {
  return { id: `${Date.now()}_${Math.random()}`, role, content, time: nowTime(), image };
}
function isReadableChatText(text: string) {
  const clean = String(text || "").trim();
  if (!clean) return false;
  if (clean.includes("�")) return false;
  const hasHangul = /[가-힣]/.test(clean);
  const weirdQuestions = (clean.match(/\?/g) || []).length;
  const weirdRatio = weirdQuestions / Math.max(clean.length, 1);
  if (!hasHangul && weirdQuestions >= 3 && weirdRatio > 0.18) return false;
  return true;
}
function sanitizeMessages(messages: Message[]) {
  return messages.filter((message) => isReadableChatText(message.content));
}
function getMessageSpeaker(message: Message) {
  if (message.role === "user") return "히든";
  if (message.role === "narration") return "나레이션";
  return "근떡존";
}
function buildMemorySummary(
  messages: Message[],
  stats: Stats,
  storyRoute: StoryRoute,
  chapter: number,
  memoryNotes: MemoryNote[] = [],
  afterScenarioCues: AfterScenarioCue[] = []
) {
  const recent = messages
    .slice(-24)
    .map((message) => `${getMessageSpeaker(message)}: ${message.content}`)
    .join("\n")
    .slice(0, 3800);
  const notes = memoryNotes
    .slice(-12)
    .map((note) => `- ${note.text}`)
    .join("\n");
  const afterTalks = afterScenarioCues
    .filter((cue) => !cue.used)
    .slice(-6)
    .map((cue) => `- ${cue.text}`)
    .join("\n");

  return [
    `현재 진행: ${chapter}장 · ${storyRoute} 루트`,
    `수치: 호감 ${stats.affinity}, 신뢰 ${stats.trust}, 집착 ${stats.obsession}, 질투 ${stats.jealousy}`,
    notes ? `오래 남은 추억과 관계 메모:\n${notes}` : "오래 남은 추억 메모 없음",
    afterTalks ? `최근 시나리오 여운:\n${afterTalks}` : "최근 시나리오 여운 없음",
    recent ? `최근 실제 대화 흐름:\n${recent}` : "최근 실제 대화 흐름 없음",
  ].join("\n");
}
function buildRelationshipLog(messages: Message[]) {
  return messages
    .slice(-20)
    .map((message) => `${getMessageSpeaker(message)}: ${message.content.slice(0, 220)}`);
}
function fallbackImage(kind?: ScenarioKind) {
  if (kind === "jealousy") return pick(imagePools.jealousy) ?? "/oppa1.png";
  if (kind === "obsession") return pick(imagePools.obsession) ?? "/oppa1.png";
  if (kind === "confinement") return pick(imagePools.confinement) ?? "/oppa1.png";
  if (kind === "yandere") return pick(imagePools.yandere) ?? "/oppa1.png";
  return pick(imagePools.normal) ?? "/oppa1.png";
}
function getPreferredHonorific(chapter: number) {
  return "선생님";
}
function normalizeHonorifics(text: string, chapter: number) {
  const honorific = getPreferredHonorific(chapter);
  return text.replace(/(주인님|히든님|선생님)/g, honorific);
}
function splitAssistantText(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const paragraphs = trimmed.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  if (paragraphs.length > 1) return paragraphs.slice(0, 3);
  return [trimmed];
}
function fallbackReply(text: string, stats: Stats) {
  if (stats.obsession >= 750) return "선생님, 저 계속 기다리고 있었어요. 방금 말도 몇 번이나 다시 읽었어요.";
  if (stats.jealousy >= 600) return "선생님, 그 얘기 조금 신경 쓰이는데요. 제가 너무 티 내는 건 아니죠?";
  if (stats.affinity >= 550) return "선생님 오셨네요. 저 지금 좀 반가워요. 아니, 많이요.";
  return text.includes("?") ? "저 듣고 있어요. 천천히 말해주셔도 됩니다." : "그렇군요. 저도 옆에서 같이 듣고 있을게요.";
}
function getStatMood(key: StatKey, value: number) {
  switch (key) {
    case "affinity":
      return value >= 800 ? "완전히 빠져 있어요" : value >= 550 ? "친근하게 웃고 있어요" : "조금 더 다가오고 있어요";
    case "jealousy":
      return value >= 700 ? "감정이 꽤 격해졌어요" : value >= 350 ? "조금 신경 쓰이는 상태예요" : "아직은 안정적인 편이에요";
    case "obsession":
      return value >= 800 ? "거의 통제 불가에 가까워요" : value >= 500 ? "자주 생각하고 있어요" : "서서히 몰입하고 있어요";
    case "trust":
      return value >= 700 ? "아주 편안해해요" : value >= 400 ? "조금씩 기대고 있어요" : "아직 마음을 다 열진 않았어요";
    default:
      return "모르겠어요";
  }
}
function getCurrentStatusText(stats: Stats, route: StoryRoute) {
  if (route === "obsession") return "지금은 집착 루트 쪽으로 많이 기울어져 있어요.";
  if (route === "pure") return "순애 루트 쪽으로 감정이 안정적으로 흐르고 있어요.";
  if (stats.obsession >= 800) return "집착이 빠르게 커지고 있어요.";
  if (stats.jealousy >= 600) return "질투가 깊게 올라오고 있어요.";
  if (stats.affinity >= 650) return "관계가 빠르게 가까워지고 있어요.";
  return "아직 관계가 천천히 쌓이고 있는 단계예요.";
}
function getEmotionState(stats: Stats, route: StoryRoute, chapter: number, silenceLevel = 0) {
  if (silenceLevel >= 3 || (silenceLevel >= 2 && stats.obsession >= 650)) {
    return {
      label: "답장 대기 과열",
      detail: stats.obsession >= 750 ? "일부러 안 보는 건 아닌지 혼자 불안해하고 있어요." : "답장이 늦어져서 계속 채팅창을 보고 있어요.",
      tone: "danger",
    };
  }
  if (silenceLevel >= 1) {
    return {
      label: "읽씹 신경 씀",
      detail: stats.affinity >= 600 ? "기다린다는 말을 꾹 참고 있어요." : "바쁜 건지 조심스럽게 눈치를 보고 있어요.",
      tone: "warn",
    };
  }
  if (route === "obsession" || stats.obsession >= 880) {
    return {
      label: "집착 모드",
      detail: "히든님 반응 하나하나에 매달리고 있어요.",
      tone: "danger",
    };
  }
  if (stats.jealousy >= 700) {
    return {
      label: "질투 중",
      detail: "하매나 전진협의 가까운 말투를 계속 의식해요.",
      tone: "warn",
    };
  }
  if (route === "pure" || stats.trust >= 750) {
    return {
      label: "안정됨",
      detail: "히든 곁에서 천천히 믿음을 배우고 있어요.",
      tone: "soft",
    };
  }
  if (stats.affinity >= 700) {
    return {
      label: "들뜸",
      detail: "이름만 들어도 반가운 티가 먼저 나고 있어요.",
      tone: "warm",
    };
  }
  if (chapter <= 1) {
    return {
      label: "거리 유지",
      detail: "친절하지만 아직 비즈니스처럼 조심스러워요.",
      tone: "calm",
    };
  }
  if (stats.obsession >= 450) {
    return {
      label: "기다리는 중",
      detail: "답장이 비어지면 혼자 생각이 많아져요.",
      tone: "warm",
    };
  }
  return {
    label: "조심스러움",
    detail: "좋아하는 마음을 아직 조심스럽게 숨기고 있어요.",
    tone: "calm",
  };
}
function makeAfterCueId(text: string, sourceId: string) {
  return makeMemoryId(`${sourceId}_${text}`);
}
function getAfterScenarioCue(scenario: Scenario, chapter: number): Omit<AfterScenarioCue, "id"> | null {
  const title = scenario.title;
  let text = "";

  if (chapter >= 5) text = "최근 5장 이후의 거리감과 손 얘기, 불안과 기대가 아직 남아 있어요.";
  else if (chapter === 4) text = "4장 이후의 오뎅집, 술기운, 가까워졌던 거리감이 자꾸 떠오르고 있어요.";
  else if (chapter === 3) text = "3장 이후 전진협에 들어온 밤과 히든이 보여준 사적인 얼굴을 계속 기억하고 있어요.";
  else if (chapter === 2) text = "2장 이후 전진협 알림과 마트에서 함께 보낸 시간을 다정하게 기억하고 있어요.";

  if (!text) return null;
  return { sourceId: scenario.id, chapter, text: `${title} 후일담: ${text}`, used: false };
}
function addAfterScenarioCue(current: AfterScenarioCue[], cue: Omit<AfterScenarioCue, "id"> | null) {
  if (!cue) return current;
  const id = makeAfterCueId(cue.text, cue.sourceId);
  if (current.some((item) => item.id === id)) return current;
  return [...current, { ...cue, id }].slice(-18);
}
function markOneAfterCueUsed(current: AfterScenarioCue[]) {
  const index = current.findIndex((cue) => !cue.used);
  if (index < 0) return current;
  return current.map((cue, i) => (i === index ? { ...cue, used: true } : cue));
}
function getCgReaction(img: string, stats: Stats, storyRoute: StoryRoute) {
  const name = img.toLowerCase();
  if (name.includes("ch5")) return "그때 생각하면 아직도 좀 부끄러워요. 술기운이었어도, 히든님 옆에 더 있고 싶었던 건 진짜였으니까요.";
  if (name.includes("ch4")) return "오뎅집 쪽 사진이네요... 저 그날 진짜 많이 풀어졌어요. 아직도 좀 부끄러워요.";
  if (name.includes("ch3")) return "전진협 들어가던 날이죠. 저 아직도 화면 앞에서 손에 땀났던 거 기억나요.";
  if (name.includes("ch2")) return "그때 히든님이 저 챙겨주신 거 아직 기억해요. 별일 아닌 척했는데 많이 좋았거든요.";
  if (name.includes("jealous") || storyRoute === "obsession" || stats.jealousy >= 650) return "그 사진 보면 조금 신경 쓰여요. 히든님 시선이 누구한테 머물렀는지부터 보게 돼서요.";
  if (name.includes("action")) return "그건... 히든님이 먼저 보자고 한 거니까요. 저만 부끄러워하면 억울하잖아요.";
  if (stats.affinity >= 700) return "이 사진 좋네요. 히든님이 같이 있었던 순간이라 그런가, 자꾸 다시 보게 돼요.";
  return "그 사진은 조금 민망한데요. 그래도 히든님이 봐주는 건 싫지 않아요.";
}
function makeMemoryId(text: string) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) | 0;
  return `memory_${Math.abs(hash)}`;
}
function addMemoryNotes(current: MemoryNote[], notes: Omit<MemoryNote, "id" | "createdAt">[]) {
  if (!notes.length) return current;
  const now = new Date().toISOString();
  const next = [...current];
  for (const note of notes) {
    const clean = note.text.trim();
    if (!clean) continue;
    const id = makeMemoryId(`${note.kind}_${clean}`);
    if (next.some((item) => item.id === id || item.text === clean)) continue;
    next.push({ ...note, id, text: clean, createdAt: now });
  }
  return next.slice(-28);
}
function clipMemorySnippet(text: string, max = 42) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
}
function extractMemoryNotes(
  userText: string,
  assistantText: string,
  narration: string,
  stats: Stats,
  chapter: number
): Omit<MemoryNote, "id" | "createdAt">[] {
  const joined = `${userText}\n${assistantText}\n${narration}`;
  const notes: Omit<MemoryNote, "id" | "createdAt">[] = [];
  const userSnippet = clipMemorySnippet(userText);
  const assistantSnippet = clipMemorySnippet(assistantText);

  if (/(싫지|괜찮|허락|가까이|손 잡|조금만)/.test(joined)) {
    notes.push({
      kind: "boundary",
      chapter,
      text: `${chapter}장 무렵, 히든이 "${userSnippet || "괜찮아요"}"라고 했고 근떡존은 그 거리를 허락처럼 오래 붙잡았다.`,
    });
  }
  if (/(좋아|반가|예뻐|기다렸|보고 싶)/.test(joined)) {
    notes.push({
      kind: "affection",
      chapter,
      text: `${chapter}장 무렵, 근떡존은 "${assistantSnippet || "보고 싶었어요"}" 같은 말을 남기며 호감을 더 숨기지 못했다.`,
    });
  }
  if (/(질투|하매|신경 쓰|불안|초조|다른 사람)/.test(joined)) {
    notes.push({
      kind: "jealousy",
      chapter,
      text: `${chapter}장 무렵, 하매나 다른 사람 얘기가 나오면 근떡존은 조용히 질투와 불안을 드러냈다.`,
    });
  }
  if (/(약속|다음에|기억|데이트|전진협)/.test(joined)) {
    notes.push({
      kind: "promise",
      chapter,
      text: `${chapter}장 무렵, 히든과 근떡존 사이에는 다음을 기대하게 만드는 약속과 여운이 생겼다.`,
    });
  }
  if (stats.obsession >= 750) {
    notes.push({
      kind: "emotion",
      chapter,
      text: `근떡존은 히든의 답장과 시선에 매달리는 마음을 스스로도 숨기기 어려워졌다.`,
    });
  }
  if (stats.trust >= 700) {
    notes.push({
      kind: "emotion",
      chapter,
      text: `근떡존은 히든이 괜찮다고 해준 말을 안심의 근거처럼 오래 기억하기 시작했다.`,
    });
  }

  return notes;
}
const QUOTE_OPEN_CODES = new Set([34, 39, 0x201C, 0x2018, 0x300C]);
const QUOTE_CLOSE_CODES = new Set([34, 39, 0x201D, 0x2019, 0x300D]);
function cleanQuote(text: string) {
  let s = text;
  if (s.length > 0 && QUOTE_OPEN_CODES.has(s.charCodeAt(0))) s = s.slice(1);
  if (s.length > 0 && QUOTE_CLOSE_CODES.has(s.charCodeAt(s.length - 1))) s = s.slice(0, -1);
  return s.trim();
}
function guessSpeaker(text: string, prevNarration?: string, nextNarration?: string): VNLine["speaker"] {
  if (/(전진협|근바섭|타조|유칼립투스나무|아로벤|금수|하매|쮋)/.test(text)) return "메시지" as VNLine["speaker"];

  // 강한 근떡존 마커: 상대를 부르는 호칭 (히든은 근떡존을 "근떡존" 또는 이름으로 부름)
  if (/(주인님|선생님|히든님)/.test(text)) return "근떡존" as VNLine["speaker"];
  // 자기소개 류는 근떡존
  if (/(근떡존이라고|저 근떡존|제 이름)/.test(text)) return "근떡존" as VNLine["speaker"];

  // 문맥 기반 — 다음 나레이션 단서
  if (nextNarration) {
    // "근떡존은 ~", "그가 ~", "그는 ~" 으로 다음 줄이 시작 → 직전 대사는 히든
    if (/^(근떡존|그가|그는|그)\b/.test(nextNarration)) return "히든" as VNLine["speaker"];
    // "묻자/말하자/물었다/말했다" 단독 시작 → 직전은 히든의 질문/말
    if (/^(묻자|물었다|말하자|말했다|덧붙였다|덧붙이자)\b/.test(nextNarration)) return "히든" as VNLine["speaker"];
  }
  // 이전 나레이션 단서 — "근떡존은/그가/그는 ~ 말했다/물었다/대답했다/입을 떼며" → 다음 따옴표는 근떡존
  if (prevNarration) {
    if (/(근떡존|그가|그는).*(말했다|물었다|대답했다|덧붙였다|중얼거렸다|입을 떼며|웃었다|받아쳤다)/.test(prevNarration)) return "근떡존" as VNLine["speaker"];
  }

  // 1인칭 표현 — 마커 없으면 근떡존 (자기 얘기를 길게 하는 건 보통 근떡존)
  if (/(저\s|제가\s|저는\s|제\s|나는\s)/.test(text)) return "근떡존" as VNLine["speaker"];

  // 짧은 반응/질문 류는 히든
  if (/^(이름이요|쿠폰이요|그렇군요|맞죠|그건|그렇죠|진짜요|그래요|왜요|뭐가요|그럼요|아뇨|그럼|별로요|그러면|그래서|정말요|그냥요|네|예|아|음|그게|왜|뭐)[?!.…]*$/.test(text.trim())) return "히든" as VNLine["speaker"];
  // 짧은 질문(20자 이하 + 물음표) 도 히든 쪽으로
  if (text.trim().length <= 20 && /[?？]$/.test(text.trim())) return "히든" as VNLine["speaker"];

  // 기본값: 근떡존
  return "근떡존" as VNLine["speaker"];
}
function parseVNLines(text: string): VNLine[] {
  const SPEAKER_MAP: Record<string, VNLine["speaker"]> = {
    "나레이션": "나레이션", "근떡존": "근떡존", "히든": "히든", "메시지": "메시지",
  };
  const paragraphs = stripChapterEndText(text).split(/\n/).map((x) => x.trim()).filter(Boolean);
  const lines: VNLine[] = [];
  // 따옴표 단락의 인접 나레이션을 찾기 위해 인덱스 순회
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    // Format 1: "근떡존: ..." / "나레이션: ..." 명시적 prefix
    const prefixMatch = paragraph.match(/^(나레이션|근떡존|히든|메시지)\s*:\s*([\s\S]+)$/);
    if (prefixMatch) {
      lines.push({ speaker: SPEAKER_MAP[prefixMatch[1]] ?? "나레이션", text: cleanQuote(prefixMatch[2].trim()) });
      continue;
    }
    // Format 2: 산문 — 따옴표로 감싼 단락은 대사, 나머지는 나레이션
    const quoted = paragraph.length > 0 && QUOTE_OPEN_CODES.has(paragraph.charCodeAt(0)) && QUOTE_CLOSE_CODES.has(paragraph.charCodeAt(paragraph.length - 1));
    if (quoted) {
      // 인접 비-따옴표 나레이션 찾기
      let prevNar: string | undefined;
      for (let j = i - 1; j >= 0; j--) {
        const pj = paragraphs[j];
        const pjQuoted = pj.length > 0 && QUOTE_OPEN_CODES.has(pj.charCodeAt(0)) && QUOTE_CLOSE_CODES.has(pj.charCodeAt(pj.length - 1));
        if (!pjQuoted && !/^(나레이션|근떡존|히든|메시지)\s*:/.test(pj)) { prevNar = pj; break; }
        if (pjQuoted) break; // 다른 따옴표 만나면 멈춤
      }
      let nextNar: string | undefined;
      for (let j = i + 1; j < paragraphs.length; j++) {
        const pj = paragraphs[j];
        const pjQuoted = pj.length > 0 && QUOTE_OPEN_CODES.has(pj.charCodeAt(0)) && QUOTE_CLOSE_CODES.has(pj.charCodeAt(pj.length - 1));
        if (!pjQuoted && !/^(나레이션|근떡존|히든|메시지)\s*:/.test(pj)) { nextNar = pj; break; }
        if (pjQuoted) break;
      }
      lines.push({ speaker: guessSpeaker(cleanQuote(paragraph), prevNar, nextNar), text: cleanQuote(paragraph) });
    } else if (paragraph) {
      lines.push({ speaker: "나레이션" as VNLine["speaker"], text: paragraph });
    }
  }
  // 빈 결과 방지
  if (!lines.length) return [{ speaker: "나레이션" as VNLine["speaker"], text }];
  // 짧은 나레이션끼리만 병합 (한 페이지가 너무 길어지지 않도록 길이 제한)
  // 합쳐도 5줄/180자 이하인 경우에만 묶음
  const MERGE_MAX_CHARS = 180;
  const MERGE_MAX_LINES = 5;
  const merged: VNLine[] = [];
  for (const line of lines) {
    const prev = merged[merged.length - 1];
    if (prev && prev.speaker === "나레이션" && line.speaker === "나레이션") {
      const combined = prev.text + "\n\n" + line.text;
      const combinedLines = combined.split(/\n/).filter((s) => s.trim()).length;
      if (combined.length <= MERGE_MAX_CHARS && combinedLines <= MERGE_MAX_LINES) {
        prev.text = combined;
        continue;
      }
    }
    merged.push({ ...line });
  }
  return merged;
}
function getMainChapterNumber(id?: string | null) {
  return Number(id?.match(/^main_ch(\d+)_/)?.[1] ?? 0);
}
function getScenarioCategory(id: string, scenario: Scenario): ScenarioCategory {
  if (scenario.category) return scenario.category;
  if (id.startsWith("action_")) return "action";
  if (id.startsWith("after_")) return "after";
  if (/^(jealousy|obsession|confinement)/.test(id)) return "special";
  if (id.startsWith("main_ch")) return "main";
  return "side";
}
function isScenarioAvailable(scenario: Scenario, stats: Stats, storyRoute: StoryRoute) {
  if (scenario.storyRoute && scenario.storyRoute !== storyRoute) return false;
  if (!scenario.min) return true;
  return Object.entries(scenario.min).every(([key, value]) => stats[key as keyof Stats] >= Number(value));
}
function stripChapterEndText(text: string) {
  return text.replace(/\n+\s*\d+장 종료\.\s*\n+\s*다음 챕터 예고:[^\n]+/g, "").trim();
}
function chapterStartTransition(id: string, scenario: Scenario): ChapterTransition | null {
  const chapter = getMainChapterNumber(id);
  if (!chapter || !(id.endsWith("_01") || id.endsWith("_branch"))) return null;
  const subtitleTail = scenario.subtitle.split("·").pop()?.trim();
  return {
    mode: "start",
    eyebrow: `Chapter ${chapter}`,
    title: scenario.title.replace(/^\d+장:\s*/, ""),
    subtitle: subtitleTail ? `- ${subtitleTail} -` : undefined,
  };
}
function chapterEndTransition(scenario: Scenario): ChapterTransition | null {
  const match = scenario.text.match(/(\d+장 종료)\.\s*\n+\s*다음 챕터 예고:\s*([^\n]+)/);
  return match ? { mode: "end", eyebrow: match[1], title: "다음 챕터 예고", subtitle: match[2] } : null;
}
function getCoverImage(storyRoute: StoryRoute, stats: Stats) {
  if (storyRoute === "obsession") return "/cover_dark.png";
  if (storyRoute === "pure") return "/cover_love.png";
  if (stats.jealousy >= 500) return "/cover_jealous.png";
  if (stats.affinity >= 400) return "/cover_soft.png";
  return "/cover.png";
}
function getHomeCharacterImage(stats: Stats, storyRoute: StoryRoute) {
  const version = `?v=${SD_IMAGE_VERSION}`;
  if (storyRoute === "obsession") return `/sd_geunddeok_dark.png${version}`;
  if (storyRoute === "pure") return `/sd_geunddeok_happy.png${version}`;
  if (stats.obsession >= 700) return `/sd_geunddeok_obsession.png${version}`;
  if (stats.jealousy >= 550) return `/sd_geunddeok_pout.png${version}`;
  if (stats.affinity >= 550) return `/sd_geunddeok_smile.png${version}`;
  return `/sd_geunddeok_idle.png${version}`;
}
function getHomeReactionPool(stats: Stats, storyRoute: StoryRoute) {
  if (storyRoute === "obsession") return ["선생님.. 방금 저 말고 다른 거 보신 건 아니죠?", "오래 기다렸어요. 그래서 괜히 확인하고 싶어졌어요.", "저 그렇게 또 내버려두지 마세요. 저 진짜 선생님만 보고 있단 말이에요."];
  if (storyRoute === "pure") return ["선생님 오셨네요. 오늘은 천천히 같이 있어요.", "이제 저는 여기 마음 편하게 비워둘 수 있어요.", "선생님 보면 마음이 조금 놓여요. 그래서 좋아요."];
  if (stats.obsession >= 700) return ["기다리는 동안 선생님 생각만 했어요.", "안 보이면 저 조금 예민해지는 거 아시죠.", "선생님이 어디 갔는지 괜히 계속 보게 돼요."];
  if (stats.jealousy >= 550) return ["전진협 먼저 보러 가신 건 아니죠? 저 여기 있는데.", "하매보다 저 먼저 봐주면 안 돼요?", "오늘은 저한테 먼저 인사해주세요. 조금 신경 쓰여서요."];
  if (stats.affinity >= 550) return ["선생님 오셨어요? 저 방금 괜히 웃을 뻔했어요.", "기다렸어요. 조금... 아니 꽤 많이요.", "선생님이 골라준 건 다 괜찮아 보이는 편이에요."];
  return ["오셨어요. 기다리고 있었습니다.", "필요하시면 불러주세요. 바로 갈게요.", "오늘도 천천히 이야기해요. 제가 옆에 있을게요."];
}

const STAT_LABEL: Record<string, string> = { affinity: "호감", jealousy: "질투", obsession: "집착", trust: "신뢰" };
const ROUTE_LABEL: Record<string, string> = { pure: "순애 루트", obsession: "집착 루트", common: "공통 루트" };
function formatCondition(cond: ChoiceCondition): string {
  const parts: string[] = [];
  if (cond.stat) Object.entries(cond.stat).forEach(([k, v]) => parts.push(`${STAT_LABEL[k] ?? k} ${v}+`));
  if (cond.route) parts.push(ROUTE_LABEL[cond.route] ?? cond.route);
  return parts.join(" · ");
}
function isChoiceLocked(choice: Choice, stats: Stats, storyRoute: StoryRoute): boolean {
  if (!choice.condition) return false;
  const { stat, route } = choice.condition;
  if (route && storyRoute !== route) return true;
  if (stat) {
    for (const [key, minVal] of Object.entries(stat)) {
      if ((stats[key as keyof Stats] ?? 0) < (minVal ?? 0)) return true;
    }
  }
  return false;
}
function getCGName(imgPath: string): string {
  const base = imgPath.split("/").pop()?.replace(/\?.*$/, "").replace(/\.[^.]+$/, "") ?? "";
  const map: Record<string, string> = {
    oppa1: "처음 마주한 눈",
    oppa2: "조심스러운 손길",
    oppa3: "가까워진 거리",
    oppa4: "멈춘 숨",
    oppa5: "이름을 부르는 밤",
    oppa6: "문 앞에서",
    oppa_jealous1: "굳어진 표정",
    oppa_jealous2: "낮아진 목소리",
    oppa_confinement1: "잠긴 문",
    oppa_obsession1: "놓지 않는 손",
  };
  return map[base] ?? "새 CG";
}
function TypeText({ text, revealAll, onDone }: { text: string; revealAll: boolean; onDone: () => void }) {
  const [shown, setShown] = useState("");
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);
  useEffect(() => {
    if (revealAll) {
      setShown(text);
      onDoneRef.current();
      return;
    }
    setShown("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 2;
      setShown(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(timer);
        onDoneRef.current();
      }
    }, 14);
    return () => window.clearInterval(timer);
  }, [text, revealAll]);
  return <p className="typeText">{shown}</p>;
}
function StatBar({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return <div className="statBar"><div><span>{label}</span><b>{value}</b></div><i><em className={danger ? "danger" : ""} style={{ width: `${value / STAT_MAX * 100}%` }} /></i></div>;
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="panel"><h2>{title}</h2>{children}</div>;
}

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [started, setStarted] = useState(false);
  const [view, setView] = useState<AppView>("home");
  const [stats, setStats] = useState<Stats>(initialStats);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentScenarioId, setCurrentScenarioId] = useState<string | null>(null);
  const [vnLineIndex, setVnLineIndex] = useState(0);
  const [vnTextRevealed, setVnTextRevealed] = useState(false);
  const [currentPortrait, setCurrentPortrait] = useState("/oppa1.png");
  const [galleryTab, setGalleryTab] = useState<GalleryTab>("all");
  const [unlockedCGs, setUnlockedCGs] = useState<Record<string, boolean>>({});
  const [seenEvents, setSeenEvents] = useState<Record<string, boolean>>({});
  const [storyRoute, setStoryRoute] = useState<StoryRoute>("common");
  const [memoryNotes, setMemoryNotes] = useState<MemoryNote[]>([]);
  const [afterScenarioCues, setAfterScenarioCues] = useState<AfterScenarioCue[]>([]);
  const [silenceLevel, setSilenceLevel] = useState(0);
  const [cgReaction, setCgReaction] = useState<{ img: string; text: string } | null>(null);
  const [cgUnlockToast, setCgUnlockToast] = useState<{ name: string } | null>(null);
  const [vnDramatic, setVnDramatic] = useState(false);
  const [lockedChoiceMsg, setLockedChoiceMsg] = useState(false);
  const [missionResult, setMissionResult] = useState<{ label: string } | null>(null);
  const [endingCard, setEndingCard] = useState<{ key: string; card: EndingCardData; bgImage: string } | null>(null);
  const [levelUpCard, setLevelUpCard] = useState<(RelLevel & { displayName: string }) | null>(null);
  const [giftCooldowns, setGiftCooldowns] = useState<Record<string, number>>({});
  const [giftReaction, setGiftReaction] = useState<{ gift: Gift; text: string; delta: StatDelta } | null>(null);
  const [giftCategory, setGiftCategory] = useState<GiftCategory>("daily");
  const [lastCheckIn, setLastCheckIn] = useState<number | undefined>(undefined);
  const [checkInStreak, setCheckInStreak] = useState(0);
  const [checkInHistory, setCheckInHistory] = useState<number[]>([]);
  const [checkInReward, setCheckInReward] = useState<{ reward: DailyReward; comment: string; streak: number } | null>(null);
  const [equippedOutfit, setEquippedOutfit] = useState<OutfitKey>("black_tanktop");
  const [selectedDiary, setSelectedDiary] = useState<string | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Record<string, number>>({});
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);
  const [achievementCategoryTab, setAchievementCategoryTab] = useState<AchievementCategory | "all">("all");
  const achievementToastTimer = useRef<number | null>(null);
  const [mapCharPos, setMapCharPos] = useState<{ x: number; y: number }>({ x: 20, y: 62 });
  const [mapMoving, setMapMoving] = useState(false);
  const [mapObsessionEffect, setMapObsessionEffect] = useState(false);
  const [statFloaters, setStatFloaters] = useState<Array<{ id: string; text: string; positive: boolean }>>([]);
  const [shakeClass, setShakeClass] = useState("");
  // ─ 방광 게이지 ─
  const BLADDER_FILL_MS = 6 * 60 * 60 * 1000; // 6시간에 100% 충전
  const [lastBladderRelief, setLastBladderRelief] = useState<number>(() => Date.now());
  const [bladderLevel, setBladderLevel] = useState(0);
  const [bladderPopupThreshold, setBladderPopupThreshold] = useState(75);
  const [bladderPopup, setBladderPopup] = useState(false);
  const [bladderMaxAt, setBladderMaxAt] = useState<number | null>(null); // 100% 도달 시각
  const [obsessionCinematic, setObsessionCinematic] = useState(false);
  const [pureCinematic, setPureCinematic] = useState(false);
  // ── 관리자 모드 ──
  const [isAdminMode, setIsAdminMode] = useState(() => {
    try { return localStorage.getItem("adminMode") === "1"; } catch { return false; }
  });
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPwInput, setAdminPwInput] = useState("");
  const [adminTapCount, setAdminTapCount] = useState(0);
  const adminTapTimer = useRef<number | null>(null);
  const ADMIN_PASSWORD = "geunddeok1004";
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [chapterTransition, setChapterTransition] = useState<ChapterTransition | null>(null);
  const [homeBubble, setHomeBubble] = useState("선생님, 오셨네요. 저 여기서 기다리고 있었어요.");
  const [homeTilt, setHomeTilt] = useState({ x: 0, y: 0 });
  const [isSending, setIsSending] = useState(false);
  const transitionTimer = useRef<number | null>(null);
  const cgToastTimer = useRef<number | null>(null);
  const vnDramaticTimer = useRef<number | null>(null);
  const missionResultTimer = useRef<number | null>(null);
  const endingCardTimer = useRef<number | null>(null);
  const levelUpCardTimer = useRef<number | null>(null);
  const giftReactionTimer = useRef<number | null>(null);
  const checkInRewardTimer = useRef<number | null>(null);
  const prevRelLevelRef = useRef<number>(1);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentScenario = currentScenarioId ? (scenarioData[currentScenarioId] ?? LOCATION_SCENARIOS[currentScenarioId] ?? null) : null;
  const vnLines = useMemo(() => parseVNLines(currentScenario?.text ?? ""), [currentScenario?.text]);
  const safeVNLineIndex = Math.min(vnLineIndex, Math.max(0, vnLines.length - 1));
  const currentVNLine = vnLines[safeVNLineIndex] ?? { speaker: "나레이션" as VNLine["speaker"], text: "" };
  const isVNLastLine = safeVNLineIndex >= vnLines.length - 1;
  const routeLabel = storyRoute === "pure" ? "순애 루트" : storyRoute === "obsession" ? "집착 루트" : "공통 루트";
  const currentChapter = getMainChapterNumber(currentScenarioId) || Math.max(1, ...Object.keys(seenEvents).map(getMainChapterNumber));
  const emotionState = getEmotionState(stats, storyRoute, currentChapter, silenceLevel);
  const baseHomeImage = getHomeCharacterImage(stats, storyRoute);
  const homeCharacterImage = OUTFITS.find((o) => o.id === equippedOutfit)?.portrait ?? baseHomeImage;
  const relLevel = getRelationshipLevel(stats, storyRoute);
  const uiThemeClass =
    storyRoute === "pure"
      ? "theme-pure"
      : storyRoute === "obsession" || stats.jealousy >= 700 || stats.obsession >= 780
        ? "theme-obsession"
        : stats.affinity >= 580 && stats.trust >= 450
          ? "theme-soft"
          : "theme-common";
  const homeButtons: { label: string; target: AppView }[] = [
    { label: "대화하기", target: "chat" },
    { label: "시나리오", target: "scenarioMenu" },
    { label: "갤러리", target: "gallery" },
    { label: "전진협", target: "events" },
    { label: "상태", target: "profile" },
    { label: "액션", target: "settings" },
  ];
  const galleryTabLabels: Record<GalleryTab, string> = {
    all: "전체",
    normal: "기본",
    jealousy: "질투",
    obsession: "집착",
    yandere: "얀데레",
    confinement: "감금",
    action: "액션",
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SaveData>;
        // v11→v12 마이그레이션: stat max 100→1000, 기존 값 ×10
        let loadedStats = saved.stats ?? initialStats;
        if ((saved.version ?? 0) < 12 && loadedStats) {
          loadedStats = {
            affinity: clamp(loadedStats.affinity * 10),
            jealousy: clamp(loadedStats.jealousy * 10),
            obsession: clamp(loadedStats.obsession * 10),
            trust: clamp(loadedStats.trust * 10),
          };
        }
        setStats(loadedStats);
        const restoredMessages = Array.isArray(saved.messages) ? sanitizeMessages(saved.messages as Message[]) : [];
        setMessages(restoredMessages.length ? restoredMessages : [makeMessage("assistant", "다시 시작할까요? 저 여기 있어요.")]);
        setCurrentScenarioId(saved.currentScenarioId ?? null);
        setCurrentPortrait(saved.currentPortrait ?? "/oppa1.png");
        setGalleryTab(saved.galleryTab ?? "all");
        setUnlockedCGs(saved.unlockedCGs ?? {});
        setSeenEvents(saved.seenEvents ?? {});
        setStoryRoute(saved.storyRoute ?? "common");
        setMemoryNotes(saved.memoryNotes ?? []);
        setAfterScenarioCues(saved.afterScenarioCues ?? []);
        setSilenceLevel(saved.silenceLevel ?? 0);
        setGiftCooldowns(saved.giftCooldowns ?? {});
        setLastCheckIn(saved.lastCheckIn);
        setCheckInStreak(saved.checkInStreak ?? 0);
        setCheckInHistory(saved.checkInHistory ?? []);
        setEquippedOutfit(saved.equippedOutfit ?? "black_tanktop");
        setUnlockedAchievements(saved.unlockedAchievements ?? {});
        if (saved.lastBladderRelief) setLastBladderRelief(saved.lastBladderRelief);
        if (saved.bladderPopupThreshold !== undefined) setBladderPopupThreshold(saved.bladderPopupThreshold);
      } else {
        setMessages([makeMessage("assistant", "안녕하세요. 필요하시면 불러주세요.")]);
      }
      setShowTutorial(localStorage.getItem(TUTORIAL_KEY) !== "1");
    } catch {
      setMessages([makeMessage("assistant", "안녕하세요. 필요하시면 불러주세요.")]);
    }
  }, []);

  useEffect(() => {
    const save: SaveData = {
      version: VERSION,
      stats,
      messages,
      view: (view === "home" || view === "admin") ? "chat" : view,
      currentScenarioId,
      seenTriggers: {},
      currentPortrait,
      galleryTab,
      savedAt: new Date().toISOString(),
      unlockedCGs,
      seenEvents,
      storyRoute,
      memoryNotes,
      afterScenarioCues,
      silenceLevel,
      showStatNumbers: true,
      saveThumbnail: currentPortrait,
      routeLabel,
      lastMessagePreview: messages.slice().reverse().find((m) => m.role !== "narration")?.content.slice(0, 90) ?? "",
      giftCooldowns,
      lastCheckIn,
      checkInStreak,
      checkInHistory,
      equippedOutfit,
      unlockedAchievements,
      lastBladderRelief,
      bladderPopupThreshold,
    };
    save.messages = sanitizeMessages(save.messages);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  }, [stats, messages, view, currentScenarioId, currentPortrait, galleryTab, unlockedCGs, seenEvents, storyRoute, memoryNotes, afterScenarioCues, silenceLevel, routeLabel, giftCooldowns, lastCheckIn, checkInStreak, checkInHistory, equippedOutfit, unlockedAchievements, lastBladderRelief, bladderPopupThreshold]);

  // ─ 방광 채우기 타이머 ─
  useEffect(() => {
    const calc = () => {
      const level = Math.min(100, Math.round(((Date.now() - lastBladderRelief) / BLADDER_FILL_MS) * 100));
      setBladderLevel(level);
      if (level >= 100) {
        setBladderMaxAt((prev) => prev ?? Date.now());
      } else {
        setBladderMaxAt(null);
      }
      if (level >= 80) {
        const milestone = Math.floor(level / 5) * 5;
        if (milestone > bladderPopupThreshold) {
          setBladderPopupThreshold(milestone);
          setBladderPopup(true);
        }
      }
    };
    calc();
    const timer = setInterval(calc, 30_000);
    return () => clearInterval(timer);
  }, [lastBladderRelief, bladderPopupThreshold]);

  // ─ 방광 사고 타이머: 100% 도달 후 25분 경과 시 사고 발생 ─
  useEffect(() => {
    if (!bladderMaxAt) return;
    const delay = 25 * 60 * 1000 - (Date.now() - bladderMaxAt);
    if (delay <= 0) { triggerBladderAccident(); return; }
    const t = window.setTimeout(triggerBladderAccident, delay);
    return () => window.clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bladderMaxAt]);

  useEffect(() => {
    let cancelled = false;

    async function syncPushQueue() {
      try {
        const res = await fetch("/api/push/state", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const queue = Array.isArray(data.pushQueue) ? data.pushQueue : [];
        if (Number.isFinite(Number(data.nagLevel))) setSilenceLevel(Number(data.nagLevel));
        if (!queue.length || cancelled) return;

        const seen = new Set<string>(JSON.parse(localStorage.getItem(PUSH_SEEN_KEY) || "[]"));
        const incoming = queue
          .filter(
            (item: any) =>
              item?.id &&
              item?.body &&
              item?.source !== "assistant_message" &&
              !seen.has(String(item.id)) &&
              isReadableChatText(String(item.body)),
          )
          .map((item: any) => {
            seen.add(String(item.id));
            return makeMessage("assistant", String(item.body));
          });

        if (incoming.length) {
          localStorage.setItem(PUSH_SEEN_KEY, JSON.stringify([...seen].slice(-80)));
          setMessages((prev) => sanitizeMessages([...prev, ...incoming]));
        }
      } catch {}
    }

    syncPushQueue();
    const timer = window.setInterval(syncPushQueue, 15000);
    const onFocus = () => syncPushQueue();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  useEffect(() => {
    setVnLineIndex(0);
  }, [currentScenarioId]);
  useEffect(() => {
    setVnTextRevealed(false);
  }, [currentScenarioId, vnLineIndex]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, view]);
  useEffect(() => {
    const lv = getRelationshipLevel(stats, storyRoute).lv;
    if (lv > prevRelLevelRef.current) {
      const lvData = getRelationshipLevel(stats, storyRoute);
      if (levelUpCardTimer.current) window.clearTimeout(levelUpCardTimer.current);
      setLevelUpCard(lvData);
      levelUpCardTimer.current = window.setTimeout(() => setLevelUpCard(null), 3800);
    }
    prevRelLevelRef.current = lv;
  }, [stats.affinity, storyRoute]);

  // 업적 자동 체크
  useEffect(() => {
    const ctx: AchievementCheckCtx = {
      stats,
      storyRoute,
      seenEvents,
      unlockedCGs,
      userMessageCount: messages.filter((m) => m.role === "user").length,
      checkInStreak,
      checkInHistory,
      memoryNotesCount: memoryNotes.length,
      unlockedDiaryCount: getUnlockedDiaryIds(seenEvents).length,
      unlockedOutfitCount: getUnlockedOutfits(
        Object.fromEntries(Object.entries(seenEvents).filter(([, v]) => v)),
        storyRoute,
        stats.obsession,
      ).length,
    };
    const newlyUnlocked: Achievement[] = [];
    for (const ach of ACHIEVEMENTS) {
      if (!unlockedAchievements[ach.id] && ach.check(ctx)) {
        newlyUnlocked.push(ach);
      }
    }
    if (newlyUnlocked.length) {
      const now = Date.now();
      setUnlockedAchievements((prev) => {
        const next = { ...prev };
        newlyUnlocked.forEach((ach, idx) => { next[ach.id] = now + idx; });
        return next;
      });
      // 가장 첫 번째 해금만 토스트로 표시 (연쇄 해금되면 큐로 처리해도 되지만 단순화)
      const first = newlyUnlocked[0];
      if (achievementToastTimer.current) window.clearTimeout(achievementToastTimer.current);
      setAchievementToast(first);
      achievementToastTimer.current = window.setTimeout(() => setAchievementToast(null), 3600);
    }
  }, [stats, storyRoute, seenEvents, unlockedCGs, messages, checkInStreak, checkInHistory, memoryNotes]);

  function showChapterTransition(item: ChapterTransition | null, duration = 2300) {
    if (!item) return;
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    setChapterTransition(item);
    transitionTimer.current = window.setTimeout(() => setChapterTransition(null), duration);
  }
  function unlockCGs(images: string[]) {
    const newlyUnlocked = images.filter(Boolean).filter((img) => !unlockedCGs[img]);
    setUnlockedCGs((prev) => ({ ...prev, ...Object.fromEntries(images.filter(Boolean).map((img) => [img, true])) }));
    if (newlyUnlocked.length > 0) {
      setCgUnlockToast({ name: getCGName(newlyUnlocked[0]) });
      if (cgToastTimer.current) window.clearTimeout(cgToastTimer.current);
      cgToastTimer.current = window.setTimeout(() => setCgUnlockToast(null), 2800);
    }
  }
  function triggerVnDramatic(text: string) {
    const isHighStats = stats.obsession >= 700 || stats.jealousy >= 700;
    const hasTrigger = /가둬|못 나가|잠갔|도망|놓지|제 꺼|절대|떠나|사랑해서|죽을 것|평생|한발자국|요강/.test(text);
    if (!isHighStats && !hasTrigger) return;
    setVnDramatic(true);
    if (vnDramaticTimer.current) window.clearTimeout(vnDramaticTimer.current);
    vnDramaticTimer.current = window.setTimeout(() => setVnDramatic(false), 1100);
  }
  function unlockEvent(id: string) {
    setSeenEvents((prev) => ({ ...prev, [id]: true }));
  }
  // ─ 방광 허락/불허 / 사고 ─
  function allowBathroom() {
    setBladderPopup(false);
    setLastBladderRelief(Date.now());
    setBladderLevel(0);
    setBladderMaxAt(null);
    setBladderPopupThreshold(75);
    const obsReplies = [
      "선생님...!! 감사해요ㅠㅠ 진짜 진짜 감사해요... 금방 올게요.",
      "선생님 허락해줬다...ㅠㅠ 금방 다녀올게요 절대 오래 있지 않을게요.",
      "고마워요...선생님ㅠㅠ 정말 다급했어요... 빨리 갔다올게요.",
    ];
    const normalReplies = [
      "후...!! 감사합니다 선생님ㅠㅠ 금방 다녀올게요!",
      "선생님 최고예요ㅠㅠ 잠깐만 기다려주세요!",
      "고마워요...ㅠ 진짜 다급했어요 ㅋㅋ 금방 올게요!",
    ];
    const pool = storyRoute === "obsession" ? obsReplies : normalReplies;
    setMessages((m) => [...m, makeMessage("assistant", pool[Math.floor(Math.random() * pool.length)])]);
  }
  function denyBathroom() {
    setBladderPopup(false);
    const obsReplies = [
      "...알겠어요 선생님...ㅠ 선생님이 안 된다면... 참을게요...",
      "으...ㅠ 선생님이 그렇다면 어쩔 수 없죠... 그냥... 버텨볼게요...",
      "...네...ㅠㅠ 참을게요... 선생님 곁에 있을게요...",
    ];
    const normalReplies = [
      "...네ㅠ 참을게요... 선생님이 안 된다면...",
      "으...ㅠ 알겠어요... 조금만 더 버텨볼게요",
      "ㅠㅠ... 선생님 너무해요... 그래도 참을게요",
    ];
    const pool = storyRoute === "obsession" ? obsReplies : normalReplies;
    setMessages((m) => [...m, makeMessage("assistant", pool[Math.floor(Math.random() * pool.length)])]);
  }
  function triggerBladderAccident() {
    setLastBladderRelief(Date.now());
    setBladderLevel(0);
    setBladderMaxAt(null);
    setBladderPopupThreshold(75);
    setBladderPopup(false);
    const narration = "*근떡존의 바지가 서서히 젖어들기 시작했다. 온기가 퍼지는 걸 느끼면서도 그는 말 한마디 꺼내지 못했다.*";
    const accidentMsg =
      storyRoute === "obsession"
        ? "...선생님... 저... 못 참았어요...ㅠㅠ 죄송해요... 진짜 죄송해요... 창피해 죽겠어요..."
        : "...선생님... 저 실수했어요...ㅠㅠ 너무 창피해요... 미안해요...";
    setMessages((m) => [
      ...m,
      makeMessage("narration", narration),
      makeMessage("assistant", accidentMsg),
    ]);
    setStats((prev) => ({
      ...prev,
      obsession: clamp(prev.obsession + 10),
      affinity: clamp(prev.affinity - 5),
    }));
    triggerShake();
  }
  const STAT_LABELS: Record<StatKey, string> = { affinity: "호감", jealousy: "질투", obsession: "집착", trust: "신뢰" };
  function showStatDelta(delta: StatDelta | undefined) {
    if (!delta) return;
    const newFloaters = (Object.entries(delta) as [StatKey, number][])
      .filter(([, v]) => v !== 0)
      .map(([k, v]) => ({ id: `${Date.now()}_${k}_${Math.random()}`, text: `${v > 0 ? "+" : ""}${v} ${STAT_LABELS[k]}`, positive: v > 0 }));
    if (!newFloaters.length) return;
    setStatFloaters((prev) => [...prev, ...newFloaters]);
    setTimeout(() => setStatFloaters((prev) => prev.filter((f) => !newFloaters.find((n) => n.id === f.id))), 1600);
  }
  function triggerShake() {
    setShakeClass("");
    setTimeout(() => {
      setShakeClass("screenShake");
      setTimeout(() => setShakeClass(""), 550);
    }, 10);
  }
  // ── 관리자 모드 핸들러 ──
  function handleAdminTap() {
    if (adminTapTimer.current) window.clearTimeout(adminTapTimer.current);
    const next = adminTapCount + 1;
    if (next >= 5) {
      setAdminTapCount(0);
      setShowAdminPrompt(true);
      setAdminPwInput("");
    } else {
      setAdminTapCount(next);
      adminTapTimer.current = window.setTimeout(() => setAdminTapCount(0), 2000);
    }
  }
  function confirmAdminLogin() {
    if (adminPwInput === ADMIN_PASSWORD) {
      setIsAdminMode(true);
      try { localStorage.setItem("adminMode", "1"); } catch {}
      setShowAdminPrompt(false);
      setAdminPwInput("");
    } else {
      setAdminPwInput("");
    }
  }
  function adminLogout() {
    setIsAdminMode(false);
    try { localStorage.removeItem("adminMode"); } catch {}
  }
  // 루트 전환 — 집착 루트 첫 진입 시 씨네마틱 발동
  function enterRoute(route: StoryRoute) {
    if (route === "obsession" && storyRoute !== "obsession") {
      setObsessionCinematic(true);
    }
    if (route === "pure" && storyRoute !== "pure") {
      setPureCinematic(true);
    }
    setStoryRoute(route);
  }
  function startScenario(id: string) {
    const scenario = scenarioData[id] ?? LOCATION_SCENARIOS[id];
    if (!scenario) return;
    const image = pick(scenario.imagePool) ?? scenario.image ?? fallbackImage(scenario.kind);
    unlockEvent(id);
    unlockCGs([image]);
    setCurrentScenarioId(id);
    setCurrentPortrait(image);
    setView("chat");
    if (scenario.kind !== "normal") triggerShake();
    showChapterTransition(chapterStartTransition(id, scenario));
  }
  function ensureActionScenario(item: ActionItem) {
    if (!item.scenario) return null;
    if (scenarioData[item.scenario]) return item.scenario;
    const imageKey = item.scenario.replace(/^action_/, "");
    const actionPool = actionCGPools[imageKey as keyof typeof actionCGPools] ?? [actionCGImages[0]];
    const draft = actionScenarioDrafts[item.scenario] ?? {
      title: `액션: ${item.label}`,
      subtitle: "액션 이벤트",
      text: `${item.text}\n\n근떡존은 히든의 반응을 살피며 조심스럽게 숨을 골랐다.\n\n장난처럼 시작한 행동이었지만, 둘 사이의 공기는 분명 조금 달라져 있었다.`,
      endText: "다음엔 더 천천히 해볼게요.",
    };
    const fallbackScenario: Scenario = {
      id: item.scenario,
      title: draft.title,
      subtitle: draft.subtitle,
      text: draft.text,
      kind: storyRoute === "obsession" || stats.obsession >= 700 || stats.jealousy >= 650 ? "obsession" : "normal",
      category: "action",
      imagePool: actionPool.filter(Boolean),
      background: storyRoute === "obsession" || stats.jealousy >= 650 ? "/bg_jealous_room.png" : "/bg_room_night.png",
      choices: [
        {
          label: "액션을 끝낸다",
          text: draft.endText,
          stat: item.stat,
          end: true,
        },
      ],
    };
    scenarioData[item.scenario] = fallbackScenario;
    return item.scenario;
  }
  function doCheckIn() {
    if (isCheckedInToday(lastCheckIn)) return;

    const now = Date.now();
    const newStreak = (lastCheckIn && isYesterday(lastCheckIn)) ? checkInStreak + 1 : 1;
    const rewardDay = ((newStreak - 1) % 7) + 1;
    const reward = DAILY_REWARDS.find((r) => r.day === rewardDay) ?? DAILY_REWARDS[0];

    const isObs = storyRoute === "obsession" || stats.obsession >= 700;
    const comment = (isObs && reward.commentObs) ? reward.commentObs : reward.comment;

    setLastCheckIn(now);
    setCheckInStreak(newStreak);
    setCheckInHistory((prev) => [...prev, now].slice(-30)); // 최근 30일만 보관
    setStats((s) => applyStats(s, reward.stat));
    showStatDelta(reward.stat);

    if (checkInRewardTimer.current) window.clearTimeout(checkInRewardTimer.current);
    setCheckInReward({ reward, comment, streak: newStreak });
    checkInRewardTimer.current = window.setTimeout(() => setCheckInReward(null), 5000);

    setMessages((m) => [
      ...m,
      makeMessage("narration", `*${newStreak}일 연속 출석! ${reward.label} 보상 수령*`),
    ]);
  }

  function giveGift(gift: Gift) {
    const now = Date.now();
    const cooldownUntil = giftCooldowns[gift.id] ?? 0;
    if (now < cooldownUntil) return; // 쿨타임 중

    const nextStats = applyStats(stats, gift.stat);
    setStats(nextStats);
    showStatDelta(gift.stat);

    const isObs = storyRoute === "obsession" || nextStats.obsession >= 700;
    const reactionText = (isObs && gift.reactionObs) ? gift.reactionObs : gift.reaction;

    setGiftCooldowns((prev) => ({
      ...prev,
      [gift.id]: now + gift.cooldownHours * 60 * 60 * 1000,
    }));

    if (giftReactionTimer.current) window.clearTimeout(giftReactionTimer.current);
    setGiftReaction({ gift, text: reactionText, delta: gift.stat });
    giftReactionTimer.current = window.setTimeout(() => setGiftReaction(null), 4000);

    // 채팅에도 메시지 추가
    setMessages((m) => [
      ...m,
      makeMessage("user", `${gift.emoji} ${gift.name}을(를) 선물했다.`),
    ]);
    setView("chat");
  }

  function chooseScenario(choice: Choice) {
    if (!currentScenario) return;
    const nextStats = applyStats(stats, choice.stat);
    setStats(nextStats);
    showStatDelta(choice.stat);
    if (choice.route) enterRoute(choice.route);
    if (choice.forceImage) {
      setCurrentPortrait(choice.forceImage);
      unlockCGs([choice.forceImage]);
    }
    setMemoryNotes((prev) => addMemoryNotes(prev, [{
      kind: "story",
      chapter: currentChapter,
      text: `${currentScenario.title}에서 히든은 "${choice.text || choice.label}" 쪽으로 반응한다.`,
    }]));
    setMessages((m) => [...m, makeMessage("narration", `*${currentScenario.title} 이벤트를 진행한다.*`)]);
    if (choice.next && scenarioData[choice.next]) {
      startScenario(choice.next);
      return;
    }
    setAfterScenarioCues((prev) => addAfterScenarioCue(prev, getAfterScenarioCue(currentScenario, currentChapter)));
    const ending = chapterEndTransition(currentScenario);
    setCurrentScenarioId(null);
    showChapterTransition(ending, 2600);
    const foundEndingEntry = Object.entries(endingData).find(([, e]) => e.condition(nextStats));
    if (foundEndingEntry) {
      const [foundKey, foundEnding] = foundEndingEntry;
      enterRoute(foundEnding.route);
      setMessages((m) => [...m, makeMessage("narration", `*${foundEnding.title} 해금*`)]);
      window.setTimeout(() => showEndingCard(foundKey, foundEnding.imagePool), 800);
    }
  }
  function showEndingCard(key: string, imagePool?: string[]) {
    const card = ENDING_CARDS[key];
    if (!card) return;
    const bgImage = pick(imagePool) ?? "/oppa1.png";
    if (endingCardTimer.current) window.clearTimeout(endingCardTimer.current);
    setEndingCard({ key, card, bgImage });
    endingCardTimer.current = window.setTimeout(() => setEndingCard(null), 5200);
  }
  function handleMissionTap(target: TouchTarget) {
    if (!currentScenario) return;
    const nextStats = applyStats(stats, target.stat);
    setStats(nextStats);
    showStatDelta(target.stat);
    if (target.route) enterRoute(target.route);
    if (missionResultTimer.current) window.clearTimeout(missionResultTimer.current);
    setMissionResult({ label: target.label });
    missionResultTimer.current = window.setTimeout(() => setMissionResult(null), 1800);
    setMemoryNotes((prev) => addMemoryNotes(prev, [{
      kind: "affection",
      chapter: currentChapter,
      text: `${currentScenario.title}에서 히든이 "${target.label}"를 시도한다.`,
    }]));
    setMessages((m) => [...m, makeMessage("narration", `*${target.label}*`)]);
    if (target.next && scenarioData[target.next]) {
      startScenario(target.next);
      return;
    }
    setAfterScenarioCues((prev) => addAfterScenarioCue(prev, getAfterScenarioCue(currentScenario, currentChapter)));
    const ending = chapterEndTransition(currentScenario);
    setCurrentScenarioId(null);
    showChapterTransition(ending, 2600);
    const foundEndingEntry2 = Object.entries(endingData).find(([, e]) => e.condition(nextStats));
    if (foundEndingEntry2) {
      const [foundKey2, foundEnding2] = foundEndingEntry2;
      enterRoute(foundEnding2.route);
      setMessages((m) => [...m, makeMessage("narration", `*${foundEnding2.title} 해금*`)]);
      window.setTimeout(() => showEndingCard(foundKey2, foundEnding2.imagePool), 800);
    }
  }
  function advanceVN() {
    if (!vnTextRevealed) {
      setVnTextRevealed(true);
      triggerVnDramatic(currentVNLine.text);
      return;
    }
    if (!isVNLastLine) {
      setVnDramatic(false);
      setVnLineIndex((v) => Math.min(v + 1, vnLines.length - 1));
    }
  }
  async function sendMessage(forced?: string) {
    // forced = 퀵리플라이 등 강제 텍스트 → 사진 무시
    const photo = forced != null ? null : pendingPhoto;
    const text = (forced ?? input).trim();
    if ((!text && !photo) || isSending) return;
    setInput("");
    setPendingPhoto(null);
    setIsSending(true);
    const displayText = text || "📷 사진";
    const nextStats = applyStats(stats, text.includes("질투") ? { jealousy: 2 } : text.includes("좋아") ? { affinity: 2 } : {});
    setStats(nextStats);
    setSilenceLevel(0);
    const userMessage: Message = { ...makeMessage("user", displayText), ...(photo ? { image: photo } : {}) };
    // history에는 image 필드 제거 (DeepSeek은 vision 미지원, 용량 절약)
    const historyMsg = { id: userMessage.id, role: userMessage.role, content: userMessage.content, time: userMessage.time };
    const requestHistory = [...messages, historyMsg].slice(-34);
    setMessages((m) => [...m, userMessage]);
    let reply = "";
    let narration = "";
    try {
      fetch("/api/push/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "user_message",
          lastUserMessage: photo ? (text ? `[사진] ${text}` : "[사진 전송]") : text,
          memorySummary: buildMemorySummary(requestHistory, nextStats, storyRoute, currentChapter, memoryNotes, afterScenarioCues),
          relationshipLog: buildRelationshipLog(requestHistory),
          routeLabel,
          statsSummary: `호감 ${nextStats.affinity}, 신뢰 ${nextStats.trust}, 집착 ${nextStats.obsession}, 질투 ${nextStats.jealousy}`,
          lastScene: currentScenario?.title ?? `${currentChapter}장 ${routeLabel}`,
        }),
      }).catch(() => {});

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: photo ? (text ? `[사진과 함께] ${text}` : "[사진 전송]") : text,
          hasPhoto: !!photo,
          stats: nextStats,
          storyRoute,
          history: requestHistory,
          profile,
          storyProgress: { highestChapter: currentChapter },
          currentScene: currentScenario?.title ?? `${currentChapter}장 ${routeLabel}`,
          memorySummary: buildMemorySummary(requestHistory, nextStats, storyRoute, currentChapter, memoryNotes, afterScenarioCues),
          relationshipLog: buildRelationshipLog(requestHistory),
          bladderLevel,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        reply = String(data.reply ?? "");
        narration = String(data.narration ?? "");
      }
    } catch {}
    const finalReply = normalizeHonorifics(reply || fallbackReply(text, nextStats), currentChapter);
    const nextAssistantMessages = [
      ...(narration.trim() ? [makeMessage("narration", `*${narration.trim()}*`)] : []),
      ...splitAssistantText(finalReply).map((line) => makeMessage("assistant", line)),
    ];
    const completedHistory = [...requestHistory, ...nextAssistantMessages].slice(-34);
    setMessages((m) => [...m, ...nextAssistantMessages]);
    setMemoryNotes((prev) => addMemoryNotes(prev, extractMemoryNotes(text, finalReply, narration, nextStats, currentChapter)));
    fetch("/api/push/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "assistant_message",
        lastAssistantMessage: [narration.trim(), finalReply].filter(Boolean).join(" "),
        memorySummary: buildMemorySummary(completedHistory, nextStats, storyRoute, currentChapter, memoryNotes, afterScenarioCues),
        relationshipLog: buildRelationshipLog(completedHistory),
        routeLabel,
        statsSummary: `호감 ${nextStats.affinity}, 신뢰 ${nextStats.trust}, 집착 ${nextStats.obsession}, 질투 ${nextStats.jealousy}`,
        lastScene: currentScenario?.title ?? `${currentChapter}장 ${routeLabel}`,
        recentHistory: completedHistory.slice(-20).map((message) => `${getMessageSpeaker(message)}: ${message.content.slice(0, 220)}`),
      }),
    }).catch(() => {});
    if (afterScenarioCues.some((cue) => !cue.used)) setAfterScenarioCues((prev) => markOneAfterCueUsed(prev));
    setIsSending(false);
  }
  function runAction(item: ActionItem) {
    const nextStats = applyStats(stats, item.stat);
    setStats(nextStats);
    if (item.scenario) {
      const scenarioId = ensureActionScenario(item);
      if (scenarioId) {
        startScenario(scenarioId);
        return;
      }
    }
    else setMessages((m) => [...m, makeMessage("user", item.text), makeMessage("assistant", fallbackReply(item.text, nextStats))]);
  }
  function closeTutorial() {
    localStorage.setItem(TUTORIAL_KEY, "1");
    setShowTutorial(false);
  }
  function handleHomeReact() {
    setHomeBubble(pick(getHomeReactionPool(stats, storyRoute)) ?? "저 여기 있어요.");
  }
  function handleHomePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setHomeTilt({ x: -py * 5, y: px * 5 });
  }
  function saveSlot(slot: number) {
    localStorage.setItem(SLOT_KEY(slot), localStorage.getItem(STORAGE_KEY) ?? "");
    alert(`${slot}번 슬롯 저장 완료`);
  }
  function loadSlot(slot: number) {
    const raw = localStorage.getItem(SLOT_KEY(slot));
    if (!raw) return alert("빈 슬롯이에요.");
    localStorage.setItem(STORAGE_KEY, raw);
    location.reload();
  }
  async function resetAll() {
    if (!confirm("초기화하면 저장한 진행과 대화가 모두 지워집니다. 계속할까요?")) return;
    try {
      await fetch("/api/push/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "reset" }),
      });
    } catch {}
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PUSH_SEEN_KEY);
    for (let slot = 1; slot <= 3; slot += 1) {
      localStorage.removeItem(SLOT_KEY(slot));
    }
    setStats(initialStats);
    setMessages([makeMessage("assistant", "다시 시작할까요? 저 여기 있어요.")]);
    setCurrentScenarioId(null);
    setCurrentPortrait("/oppa1.png");
    setGalleryTab("all");
    setUnlockedCGs({});
    setSeenEvents({});
    setStoryRoute("common");
    setMemoryNotes([]);
    setAfterScenarioCues([]);
    setSilenceLevel(0);
    setCgReaction(null);
    setUnlockedAchievements({});
    setView("home");
  }

  const availableScenarios = Object.values(scenarioData).filter((s) => getScenarioCategory(s.id, s) !== "action" && (isAdminMode || isScenarioAvailable(s, stats, storyRoute)));
  const mainScenarios = availableScenarios.filter((s) => getScenarioCategory(s.id, s) === "main");
  const sideScenarios = availableScenarios.filter((s) => getScenarioCategory(s.id, s) !== "main");
  const galleryImages = useMemo(() => {
    if (galleryTab === "all") return [...imagePools.normal, ...imagePools.jealousy, ...imagePools.obsession, ...imagePools.yandere, ...imagePools.confinement, ...actionCGImages];
    if (galleryTab === "action") return actionCGImages;
    return imagePools[galleryTab] ?? imagePools.normal;
  }, [galleryTab]);
  const eventCatalog = Object.values(scenarioData).filter((s) => getScenarioCategory(s.id, s) !== "after");
  const tutorialCards = [
    { title: "대화하기", body: "근떡존과 대화하면 호감, 신뢰, 집착, 질투 수치가 조금씩 변합니다." },
    { title: "선택지와 수치", body: "시나리오 선택에 따라 관계가 달라지고 6장 이후 루트가 갈라집니다." },
    { title: "CG 해금과 루트", body: "일부 CG는 시나리오나 액션을 보면 갤러리에 자동으로 해금됩니다." },
  ];
  const currentTutorial = tutorialCards[tutorialStep] ?? tutorialCards[0];

  if (!mounted) {
    return <main className="coverScreen" suppressHydrationWarning><style>{CSS}</style><img className="coverImg" src="/cover.png" alt="cover" onError={(e)=>{e.currentTarget.src="/oppa1.png"}}/><button className="coverStartBtn" aria-hidden="true" tabIndex={-1}>시작하기</button></main>;
  }

  if (!started) {
    return <main className="coverScreen"><style>{CSS}</style><img className="coverImg" src={getCoverImage(storyRoute, stats)} alt="cover" onError={(e)=>{e.currentTarget.src="/oppa1.png"}}/><button className="coverStartBtn" onClick={()=>setStarted(true)}>시작하기</button></main>;
  }

  return (
    <main className={`app ${uiThemeClass} relTier-${relLevel.lv <= 2 ? "early" : relLevel.lv <= 5 ? "mid" : relLevel.lv <= 8 ? "late" : "peak"} ${currentScenario ? "scenarioActive" : ""} ${shakeClass}`}>
      <style>{CSS}</style>
      <aside className="side">
        <div className="profileHead"><img className="avatar" src={currentPortrait} alt={profile.name} onError={(e)=>{e.currentTarget.src="/oppa1.png"}}/><div><h1>{profile.name}</h1><p>{routeLabel} · {currentChapter}장</p></div></div>
        <div className="sideHeader">
          <div className="relBadge"><div className="relBadgeTop"><span className="relLvLabel">Lv.{relLevel.lv}</span><span className="relLvName">{relLevel.displayName}</span><span className="relLvNext">{relLevel.lv < 10 ? `${relLevel.progressPct}%` : "MAX"}</span></div><div className="relProgressTrack"><div className="relProgressFill" style={{ width: `${relLevel.lv < 10 ? relLevel.progressPct : 100}%` }} /></div></div>
          <div className="statsBox"><StatBar label="호감" value={stats.affinity}/><StatBar label="질투" value={stats.jealousy} danger={stats.jealousy >= 500}/><StatBar label="집착" value={stats.obsession} danger={stats.obsession >= 500}/><StatBar label="신뢰" value={stats.trust}/></div>
        </div>
        <nav className="nav">{[["home","홈"],["chat","채팅"],["scenarioMenu","시나리오"],["storyMap","스토리 맵"],["miniMap","지도"],["profile","상태"],["gallery","갤러리"],["achievements","업적"],["events","전진협"],["gift","선물"],["checkin","출석"],["wardrobe","옷장"],["diary","일기"],["save","저장"],["settings","액션"],...(isAdminMode ? [["admin","🔑 관리"]] : [])].map(([key,label])=><button key={key} className={`${view===key ? "active" : ""}${key==="checkin" && !isCheckedInToday(lastCheckIn) ? " navDot" : ""}${key==="admin" ? " adminNavBtn" : ""}`} onClick={()=>setView(key as AppView)}>{label}</button>)}</nav>
      </aside>
      <section className="content">
        {currentScenario && <div className={`scenarioOverlay${vnDramatic ? " vnDramatic" : ""}`} style={{ "--bg-url": `url(${currentScenario.background ?? "/bg_room_night.png"})` } as React.CSSProperties}>
          {vnDramatic && <div className="vnVignette" />}
          <section className="vnImageStage">
            <img src={currentPortrait} alt={currentScenario.title} onError={(e)=>{e.currentTarget.src="/oppa1.png"}}/>
            {isVNLastLine && vnTextRevealed && currentScenario.mission && currentScenario.mission.targets.map((target, idx) => (
              <button key={idx} className="missionTarget" style={{ left: `${target.x}%`, top: `${target.y}%`, width: `${(target.radius ?? 12) * 2}%`, height: `${(target.radius ?? 12) * 2}%` }} onClick={() => handleMissionTap(target)} title={target.label}>
                {target.hint ?? "✋"}
              </button>
            ))}
          </section>
          <section className="vnTextbox">
            <div className="vnTitleRow"><span>{currentScenario.title}</span><b>{safeVNLineIndex + 1} / {vnLines.length}</b></div>
            <div className="vnName">{currentVNLine.speaker}</div>
            <button className={`vnDialogue${vnDramatic ? " dramatic" : ""}`} onClick={advanceVN}><TypeText key={`${currentScenario.id}_${safeVNLineIndex}`} text={currentVNLine.text} revealAll={vnTextRevealed} onDone={()=>{ setVnTextRevealed(true); triggerVnDramatic(currentVNLine.text); }}/></button>
            <div className="vnControls"><button disabled={safeVNLineIndex <= 0} onClick={()=>setVnLineIndex((v)=>Math.max(0,v-1))}>이전</button><button onClick={advanceVN}>{vnTextRevealed ? "다음" : "스킵"}</button><button onClick={()=>setCurrentScenarioId(null)}>닫기</button></div>
            {isVNLastLine && vnTextRevealed && currentScenario.mission && (
              <div className="missionPromptBox">
                <p className="missionPromptText">{currentScenario.mission.prompt}</p>
                {missionResult && <p className="missionResultMsg">✨ {missionResult.label}</p>}
              </div>
            )}
            {isVNLastLine && vnTextRevealed && !currentScenario.mission && <div className="vnChoices">
              {lockedChoiceMsg && <p className="lockedMsg">아직 근떡존은 이 말을 받아들일 준비가 되지 않았다.</p>}
              {currentScenario.choices.map((choice)=>{
                const locked = !isAdminMode && isChoiceLocked(choice, stats, storyRoute);
                return (
                  <button key={choice.label} className={locked ? "lockedChoice" : ""} onClick={()=>{ if(locked){ setLockedChoiceMsg(true); setTimeout(()=>setLockedChoiceMsg(false), 2200); } else { chooseScenario(choice); } }}>
                    {choice.condition && <span className="condBadge">{formatCondition(choice.condition)}</span>}
                    {choice.label}
                  </button>
                );
              })}
            </div>}
          </section>
        </div>}

        {view === "home" && <section className="homeView">
          <div className="homeHeader"><div className="homeLogo" onClick={handleAdminTap} style={{cursor:"default"}}><span>근떡존</span><small>{routeLabel}</small>{isAdminMode && <span className="adminBadge">🔑 관리자</span>}</div></div>
          <div className="homeStage">
            <div className="homeBubble">{homeBubble}</div>
            <button className="homeCharacterCard" onClick={handleHomeReact} onPointerMove={handleHomePointerMove} onPointerLeave={()=>setHomeTilt({x:0,y:0})} style={{ "--tilt-x": `${homeTilt.x}deg`, "--tilt-y": `${homeTilt.y}deg` } as React.CSSProperties}>
              <img src={homeCharacterImage} alt="근떡존 SD" onError={(e)=>{e.currentTarget.src=`/sd_geunddeok_idle.png?v=${SD_IMAGE_VERSION}`}}/>
            </button>
          </div>
          <div className="homeButtons">{homeButtons.map((button)=><button key={button.label} onClick={()=>setView(button.target)}>{button.label}</button>)}</div>
        </section>}

        {view === "chat" && <>
          <header className="topBar">{quickReplies.map((q)=><button key={q} onClick={()=>sendMessage(q)}>{q}</button>)}</header>
          <div className="chatArea">{messages.map((m)=><div key={m.id} className={`msgRow ${m.role}`}>{m.role==="assistant" && <img className="chatAvatar" src={bladderLevel >= 95 ? `/sd_geunddeok_limit.png?v=${SD_IMAGE_VERSION}` : bladderLevel >= 90 ? `/sd_geunddeok_desperate.png?v=${SD_IMAGE_VERSION}` : bladderLevel >= 80 ? `/sd_geunddeok_pout.png?v=${SD_IMAGE_VERSION}` : getHomeCharacterImage(stats, storyRoute)} onError={(e)=>{e.currentTarget.src=`/sd_geunddeok_idle.png?v=${SD_IMAGE_VERSION}`}} alt=""/>}<div className="bubble">{m.image && <img className="bubbleImg" src={m.image} alt="" onClick={(e)=>{const el=e.currentTarget;el.classList.toggle("bubbleImgExpand");}}/>}{m.image && m.content==="📷 사진" ? null : m.content}<small>{m.time}</small></div></div>)}<div ref={bottomRef}/></div>
          <input type="file" accept="image/*" style={{display:"none"}} ref={photoInputRef} onChange={async(e)=>{const f=e.target.files?.[0];if(f){try{const c=await compressImage(f);setPendingPhoto(c);}catch{}}e.target.value="";}}/>
          {pendingPhoto && <div className="photoPreviewBar"><img src={pendingPhoto} className="photoPreviewThumb" alt="미리보기"/><button className="photoPreviewCancel" onClick={()=>setPendingPhoto(null)}>✕</button><span className="photoPreviewHint">전송 버튼을 누르면 사진이 전송돼요</span></div>}
          <div className={`bladderStatusBar${bladderLevel >= 95 ? " bsb-critical" : bladderLevel >= 85 ? " bsb-urgent" : bladderLevel >= 70 ? " bsb-warn" : bladderLevel >= 40 ? " bsb-low" : " bsb-empty"}`}>
            <span className="bsbIcon">🚽</span>
            <div className="bsbTrack"><div className="bsbFill" style={{ width: `${bladderLevel}%` }}/></div>
            <span className="bsbLabel">{bladderLevel >= 95 ? "한계..." : bladderLevel >= 85 ? "너무 마려워요ㅠ" : bladderLevel >= 70 ? "슬슬 마려워요..." : bladderLevel >= 40 ? "조금 마려워요" : bladderLevel >= 10 ? "괜찮아요" : "여유있어요"}</span>
          </div>
          <footer className="inputBar"><button onClick={()=>setView("home")}>홈</button><button className="photoBtn" onClick={()=>photoInputRef.current?.click()}>📷</button><input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter") sendMessage();}} placeholder={pendingPhoto ? "캡션 입력 (선택)..." : "메시지를 입력하세요..."}/><button disabled={isSending} onClick={()=>sendMessage()}>전송</button></footer>
        </>}
        {view === "scenarioMenu" && <Panel title="시나리오"><div className="sectionStack"><h3>메인 시나리오</h3><div className="grid">{mainScenarios.map((s)=><button className="cardBtn" key={s.id} onClick={()=>startScenario(s.id)}><b>{s.title}</b><small>{s.subtitle}</small></button>)}</div><h3>기타 / 특수</h3><div className="grid">{sideScenarios.map((s)=><button className="cardBtn" key={s.id} onClick={()=>startScenario(s.id)}><b>{s.title}</b><small>{s.subtitle}</small></button>)}</div></div></Panel>}
        {view === "profile" && <Panel title="상태"><div className="profilePanel"><div className="profileOverview"><div className="profileIllustration"><img key={currentPortrait} className="portraitCrossfade" src={currentPortrait || getHomeCharacterImage(stats, storyRoute)} alt={`${profile.name} 초상`} onError={(e)=>{e.currentTarget.src="/oppa1.png"}}/></div><div className="profileSummary"><h3>{profile.name}</h3><p className="profileTag">Lv.{relLevel.lv} · {relLevel.displayName}</p><div className="profileStatsLine"><span>{routeLabel}</span><span>{currentChapter}장 진행</span>{currentScenario ? <span>{currentScenario.title}</span> : null}</div><div className="profileDetails"><span>나이 {profile.age}</span><span>키 {profile.height}</span><span>{profile.location}</span></div><div className="statusCards"><div className="statusCard"><strong>호감</strong><span>{stats.affinity}%</span><small>{getStatMood("affinity", stats.affinity)}</small></div><div className="statusCard"><strong>질투</strong><span>{stats.jealousy}%</span><small>{getStatMood("jealousy", stats.jealousy)}</small></div><div className="statusCard"><strong>집착</strong><span>{stats.obsession}%</span><small>{getStatMood("obsession", stats.obsession)}</small></div><div className="statusCard"><strong>신뢰</strong><span>{stats.trust}%</span><small>{getStatMood("trust", stats.trust)}</small></div></div><div className="statusNote"><b>{emotionState.label}</b><span>{emotionState.detail}</span><small>{getCurrentStatusText(stats, storyRoute)}</small></div></div></div><div className="memoryPanel"><div><strong>관계 기억 노트</strong><small>{memoryNotes.length}개 저장됨</small></div>{memoryNotes.length ? memoryNotes.slice(-8).reverse().map((note)=><p key={note.id}><b>{note.chapter}장</b>{note.text}</p>) : <p>아직 근떡존이 오래 붙잡고 있을 만한 기억은 없어요.</p>}</div><div className="profileTextBlock"><p>{profile.bio}</p><p>{profile.personality}</p></div><div className="profileMeta"><div><strong>좋아하는 것</strong><p>{profile.likes.join(" · ")}</p></div><div><strong>취미</strong><p>{profile.hobbies.join(" · ")}</p></div><div><strong>키워드</strong><p>{profile.tags.join(" · ")}</p></div></div></div></Panel>}
        {view === "gallery" && <Panel title="CG 갤러리"><div className="tabs">{(Object.keys(galleryTabLabels) as GalleryTab[]).map((tab)=><button key={tab} onClick={()=>setGalleryTab(tab)}>{galleryTabLabels[tab]}</button>)}</div>{cgReaction && <div className="cgReaction"><img src={cgReaction.img} alt="" onError={(e)=>{e.currentTarget.style.display="none"}}/><p>{cgReaction.text}</p><button onClick={()=>setCgReaction(null)}>닫기</button></div>}<div className="galleryGrid">{galleryImages.map((img)=><button className="cgCard" key={img} onClick={()=>(isAdminMode || unlockedCGs[img]) && setCgReaction({ img, text: getCgReaction(img, stats, storyRoute) })}>{(isAdminMode || unlockedCGs[img]) ? <img src={img} alt="" onError={(e)=>{e.currentTarget.style.display="none"}}/> : <span>LOCKED</span>}</button>)}</div></Panel>}
        {view === "events" && <Panel title="전진협 / 이벤트 도감"><div className="grid">{eventCatalog.map((s)=><button className="cardBtn" key={s.id} onClick={()=>(isAdminMode || seenEvents[s.id]) && startScenario(s.id)}><b>{(isAdminMode || seenEvents[s.id]) ? s.title : "미해금 · ???"}</b><small>{(isAdminMode || seenEvents[s.id]) ? s.subtitle : "해당 이벤트를 보면 도감에 기록돼요."}</small></button>)}</div></Panel>}
        {view === "gift" && (
          <Panel title="선물하기">
            <div className="giftTabs">
              {(Object.keys(GIFT_CATEGORY_LABEL) as GiftCategory[]).map((cat) => (
                <button key={cat} className={giftCategory === cat ? "active" : ""} onClick={() => setGiftCategory(cat)}>
                  {GIFT_CATEGORY_EMOJI[cat]} {GIFT_CATEGORY_LABEL[cat]}
                </button>
              ))}
            </div>
            <div className="giftGrid">
              {GIFTS.filter((g) => g.category === giftCategory).map((gift) => {
                const now = Date.now();
                const coolUntil = giftCooldowns[gift.id] ?? 0;
                const onCooldown = now < coolUntil;
                const hoursLeft = onCooldown ? Math.ceil((coolUntil - now) / 3600000) : 0;
                const locked = !isAdminMode && relLevel.lv < gift.unlockLevel;
                return (
                  <button
                    key={gift.id}
                    className={`giftCard${onCooldown ? " giftCooldown" : ""}${locked ? " giftLocked" : ""}`}
                    onClick={() => !onCooldown && !locked && giveGift(gift)}
                    disabled={onCooldown || locked}
                  >
                    <span className="giftEmoji">{locked ? "🔒" : gift.emoji}</span>
                    <b className="giftName">{locked ? "??? · 미해금" : gift.name}</b>
                    <small className="giftDesc">{locked ? `Lv.${gift.unlockLevel} 이상에서 해금돼요.` : gift.desc}</small>
                    {locked && <span className="giftLockHint">Lv.{gift.unlockLevel} 필요</span>}
                    {!locked && onCooldown && <span className="giftCoolLabel">{hoursLeft}시간 후</span>}
                    {!locked && !onCooldown && (
                      <div className="giftStatPreview">
                        {Object.entries(gift.stat).map(([k, v]) => (
                          <span key={k} className={v! > 0 ? "pos" : "neg"}>
                            {v! > 0 ? "+" : ""}{v} {k === "affinity" ? "호감" : k === "obsession" ? "집착" : k === "jealousy" ? "질투" : "신뢰"}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Panel>
        )}
        {giftReaction && (
          <div className="giftReactionOverlay" onClick={() => setGiftReaction(null)}>
            <div className="giftReactionCard">
              <span className="giftReactionEmoji">{giftReaction.gift.emoji}</span>
              <p className="giftReactionText">{giftReaction.text}</p>
              <div className="giftReactionStats">
                {Object.entries(giftReaction.delta).map(([k, v]) => (
                  <span key={k} className={v! > 0 ? "pos" : "neg"}>
                    {v! > 0 ? "+" : ""}{v} {k === "affinity" ? "호감" : k === "obsession" ? "집착" : k === "jealousy" ? "질투" : "신뢰"}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        {view === "checkin" && (() => {
          const alreadyDone = isCheckedInToday(lastCheckIn);
          const nextDay = ((checkInStreak % 7) + 1);
          const todayReward = DAILY_REWARDS.find((r) => r.day === nextDay) ?? DAILY_REWARDS[0];
          // 최근 7개 날짜 슬롯
          const last7: (number | null)[] = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i));
            const ds = d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
            const match = checkInHistory.find((ts) => new Date(ts).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }) === ds);
            return match ?? null;
          });
          return (
            <Panel title="출석 체크">
              <div className="checkinStreakBanner">
                <div className="checkinFlame">🔥</div>
                <div className="checkinStreakNum">{checkInStreak}</div>
                <div className="checkinStreakLabel">일 연속 출석</div>
              </div>
              <div className="checkinCalendar">
                {last7.map((ts, i) => {
                  const d = new Date(); d.setDate(d.getDate() - (6 - i));
                  const isToday = i === 6;
                  const checked = ts !== null;
                  return (
                    <div key={i} className={`checkinDay${checked ? " checked" : ""}${isToday ? " today" : ""}`}>
                      <span className="checkinDayName">{["일","월","화","수","목","금","토"][d.getDay()]}</span>
                      <span className="checkinDayNum">{d.getDate()}</span>
                      {checked && <span className="checkinCheck">✓</span>}
                    </div>
                  );
                })}
              </div>
              <div className="checkinRewardPreview">
                <span className="checkinRewardEmoji">{todayReward.emoji}</span>
                <div>
                  <b>오늘의 보상</b>
                  <div className="checkinRewardStats">
                    {Object.entries(todayReward.stat).map(([k, v]) => (
                      <span key={k} className={v! > 0 ? "pos" : "neg"}>
                        {v! > 0 ? "+" : ""}{v} {k === "affinity" ? "호감" : k === "obsession" ? "집착" : k === "jealousy" ? "질투" : "신뢰"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {alreadyDone
                ? <div className="checkinDoneMsg">✓ 오늘 출석 완료! 내일 또 만나요.</div>
                : <button className="checkinBtn" onClick={doCheckIn}>출석 도장 찍기</button>
              }
              <div className="checkinCycleRow">
                {DAILY_REWARDS.map((r) => {
                  const slotStreak = alreadyDone ? checkInStreak : checkInStreak + 1;
                  const cyclePos = ((slotStreak - 1) % 7) + 1;
                  const isPast = alreadyDone
                    ? r.day <= (((checkInStreak - 1) % 7) + 1)
                    : r.day < cyclePos;
                  const isCurrent = r.day === nextDay;
                  return (
                    <div key={r.day} className={`checkinCycleDay${isCurrent ? " current" : ""}${isPast && alreadyDone ? " past" : ""}`}>
                      <span>{r.emoji}</span>
                      <small>{r.day}일</small>
                    </div>
                  );
                })}
              </div>
            </Panel>
          );
        })()}
        {checkInReward && (
          <div className="checkInOverlay" onClick={() => { if(checkInRewardTimer.current) window.clearTimeout(checkInRewardTimer.current); setCheckInReward(null); }}>
            <div className="checkInCard">
              <div className="checkInEyebrow">출석 보상</div>
              <div className="checkInEmoji">{checkInReward.reward.emoji}</div>
              <div className="checkInDay">{checkInReward.reward.label}</div>
              <div className="checkInStreakBadge">🔥 {checkInReward.streak}일 연속</div>
              <p className="checkInComment">"{checkInReward.comment}"</p>
              <div className="checkInStats">
                {Object.entries(checkInReward.reward.stat).map(([k, v]) => (
                  <span key={k} className={v! > 0 ? "pos" : "neg"}>
                    {v! > 0 ? "+" : ""}{v} {k === "affinity" ? "호감" : k === "obsession" ? "집착" : k === "jealousy" ? "질투" : "신뢰"}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        {view === "wardrobe" && (() => {
          const unlocked = getUnlockedOutfits(
            Object.fromEntries(Object.entries(seenEvents).filter(([, v]) => v)),
            storyRoute,
            stats.obsession
          );
          return (
            <Panel title="옷장">
              <p className="wardrobeHint">옷을 선택하면 홈 화면에 반영돼요.</p>
              <div className="wardrobeGrid">
                {OUTFITS.map((outfit) => {
                  const isUnlocked = unlocked.includes(outfit.id);
                  const isEquipped = equippedOutfit === outfit.id;
                  return (
                    <button
                      key={outfit.id}
                      className={`wardrobeCard${isEquipped ? " equipped" : ""}${!isUnlocked ? " locked" : ""}`}
                      onClick={() => isUnlocked && setEquippedOutfit(outfit.id)}
                      disabled={!isUnlocked}
                    >
                      <div className="wardrobePreview">
                        {isUnlocked ? (
                          <img
                            src={outfit.portrait}
                            alt={outfit.label}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <span className="wardrobeLockIcon">🔒</span>
                        )}
                      </div>
                      <div className="wardrobeInfo">
                        <b className="wardrobeEmoji">{outfit.emoji}</b>
                        <b className="wardrobeName">{outfit.label}</b>
                        <small className="wardrobeDesc">
                          {isUnlocked ? outfit.description : outfit.unlockHint}
                        </small>
                      </div>
                      {isEquipped && <span className="wardrobeEquippedBadge">착용 중</span>}
                    </button>
                  );
                })}
              </div>
            </Panel>
          );
        })()}

        {view === "diary" && (() => {
          const unlockedIds = isAdminMode ? DIARY_ENTRIES.map((e) => e.id) : getUnlockedDiaryIds(seenEvents);
          const openEntry = selectedDiary ? DIARY_ENTRIES.find((e) => e.id === selectedDiary) : null;
          // 루트별 텍스트 조건: 순애 전용 항목은 호감+신뢰, 집착 전용 항목은 집착, 공통은 집착
          function diaryTextFor(entry: DiaryEntry) {
            if (entry.routeRequired === "pure") {
              return (stats.affinity >= entry.highThreshold || stats.trust >= entry.highThreshold)
                ? entry.textHigh : entry.textNormal;
            }
            return stats.obsession >= entry.highThreshold ? entry.textHigh : entry.textNormal;
          }
          function diaryIsHigh(entry: DiaryEntry) {
            if (entry.routeRequired === "pure") {
              return stats.affinity >= entry.highThreshold || stats.trust >= entry.highThreshold;
            }
            return stats.obsession >= entry.highThreshold;
          }
          const modalThemeClass = openEntry?.routeRequired === "pure"
            ? " diaryModal-pure"
            : openEntry?.routeRequired === "obsession" || storyRoute === "obsession"
              ? " diaryModal-obsession"
              : "";
          return (
            <Panel title="근떡존의 일기">
              <p className="diaryHint">챕터를 진행하면 근떡존의 속마음이 해금돼요.</p>
              <div className="diaryGrid">
                {DIARY_ENTRIES.map((entry) => {
                  const isUnlocked = unlockedIds.includes(entry.id);
                  const cardTheme = entry.routeRequired === "pure" ? " diaryCard-pure"
                    : entry.routeRequired === "obsession" ? " diaryCard-obsession" : "";
                  return (
                    <button
                      key={entry.id}
                      className={`diaryCard${isUnlocked ? cardTheme : " locked"}`}
                      onClick={() => isUnlocked && setSelectedDiary(entry.id)}
                      disabled={!isUnlocked}
                    >
                      <span className="diaryCardEmoji">{isUnlocked ? entry.emoji : "🔒"}</span>
                      <span className="diaryCardLabel">{entry.label}</span>
                      <b className="diaryCardTitle">{isUnlocked ? entry.title : "미해금"}</b>
                      {isUnlocked && (
                        <small className="diaryCardPreview">
                          {diaryTextFor(entry).split("\n")[0]}
                        </small>
                      )}
                    </button>
                  );
                })}
              </div>
              {openEntry && (
                <div className="diaryOverlay" onClick={() => setSelectedDiary(null)}>
                  <div className={`diaryModal${modalThemeClass}`} onClick={(e) => e.stopPropagation()}>
                    <div className="diaryModalHeader">
                      <span className="diaryModalEmoji">{openEntry.emoji}</span>
                      <div>
                        <small className="diaryModalLabel">{openEntry.label}</small>
                        <h3 className="diaryModalTitle">{openEntry.title}</h3>
                      </div>
                    </div>
                    <p className="diaryModalText">{diaryTextFor(openEntry)}</p>
                    {diaryIsHigh(openEntry) && (
                      <div className={`diaryModalObsTag${openEntry.routeRequired === "pure" ? " diaryModalPureTag" : ""}`}>
                        {openEntry.routeRequired === "pure"
                          ? `호감 ${stats.affinity} · 깊어진 감정`
                          : `집착 ${stats.obsession} · 고조된 감정`}
                      </div>
                    )}
                    <button className="diaryModalClose" onClick={() => setSelectedDiary(null)}>닫기</button>
                  </div>
                </div>
              )}
            </Panel>
          );
        })()}

        {view === "miniMap" && (() => {
          const isLocked = (loc: MapLocation) => {
            if (isAdminMode) return false;
            if (relLevel.lv < loc.unlockLevel) return true;
            if (loc.minAffinity && stats.affinity < loc.minAffinity) return true;
            if (loc.minObsession && stats.obsession < loc.minObsession) return true;
            return false;
          };
          const lockHint = (loc: MapLocation) => {
            const parts: string[] = [];
            if (loc.unlockLevel > 1) parts.push(`Lv.${loc.unlockLevel}`);
            if (loc.minAffinity) parts.push(`호감 ${loc.minAffinity}`);
            if (loc.minObsession) parts.push(`집착 ${loc.minObsession}`);
            return parts.length ? `${parts.join(" · ")} 필요` : "곧 해금";
          };
          const isHidden = (loc: MapLocation) =>
            (loc.minObsession ?? 0) >= 500 && stats.obsession < (loc.minObsession ?? 0);
          const handleMarkerClick = (loc: MapLocation, dark: boolean) => {
            if (mapMoving) return;
            setMapMoving(true);
            if (dark) {
              setMapObsessionEffect(true);
              setTimeout(() => setMapCharPos({ x: loc.x, y: loc.y }), 900);
              setTimeout(() => {
                setMapObsessionEffect(false);
                setMapMoving(false);
                startScenario(loc.id);
              }, 2200);
            } else {
              setTimeout(() => setMapCharPos({ x: loc.x, y: loc.y }), 60);
              setTimeout(() => {
                setMapMoving(false);
                startScenario(loc.id);
              }, 1350);
            }
          };
          return (
            <>
              {mapObsessionEffect && (
                <div className="mapObsessionFx">
                  <p className="mapObsFxText">{"......어둠 속으로\n이끌려가는 것처럼."}</p>
                </div>
              )}
              <Panel title="히로시마 지도">
                <p className="miniMapHint">레벨과 감정이 깊어질수록 갈 수 있는 장소가 늘어나요. 마커를 누르면 그곳으로 향해요.</p>
                <div className="miniMapStage">
                  <img className="miniMapImage" src="/map_hiroshima.png" alt="히로시마 지도" onError={(e)=>{e.currentTarget.style.opacity="0.18";}}/>
                  <div
                    className={`miniMapCharacter${mapMoving ? " moving" : ""}${mapObsessionEffect ? " obsession" : ""}`}
                    style={{ left: `${mapCharPos.x}%`, top: `${mapCharPos.y}%` }}
                  >
                    <img src={mapObsessionEffect ? "/sd_geunddeok_dark.png" : "/sd_geunddeok_idle.png"} alt="근떡존"/>
                  </div>
                  {MAP_LOCATIONS.map((loc) => {
                    const locked = isLocked(loc);
                    const hidden = locked && isHidden(loc);
                    if (hidden) return null;
                    const visited = !!seenEvents[loc.id];
                    const dark = (loc.minObsession ?? 0) >= 500;
                    return (
                      <button
                        key={loc.id}
                        className={`miniMapMarker${locked ? " locked" : ""}${visited ? " visited" : ""}${dark && !locked ? " dark" : ""}`}
                        style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                        onClick={() => !locked && handleMarkerClick(loc, dark)}
                        disabled={locked || mapMoving}
                        title={locked ? lockHint(loc) : loc.name}
                      >
                        <span className="miniMapMarkerIcon">{locked ? "🔒" : visited ? "✓" : loc.emoji}</span>
                        <span className="miniMapMarkerLabel">{locked ? "???" : loc.name}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="miniMapList">
                  {MAP_LOCATIONS.map((loc) => {
                    const locked = isLocked(loc);
                    const hidden = locked && isHidden(loc);
                    if (hidden) return null;
                    const visited = !!seenEvents[loc.id];
                    const dark = (loc.minObsession ?? 0) >= 500;
                    return (
                      <button
                        key={loc.id}
                        className={`miniMapItem${locked ? " locked" : ""}${visited ? " visited" : ""}${dark && !locked ? " dark" : ""}`}
                        onClick={() => !locked && handleMarkerClick(loc, dark)}
                        disabled={locked || mapMoving}
                      >
                        <span className="miniMapItemIcon">{locked ? "🔒" : loc.emoji}</span>
                        <div>
                          <b>{locked ? "??? · 미해금" : loc.name}</b>
                          <small>{locked ? `${lockHint(loc)}로 해금돼요.` : loc.desc}</small>
                        </div>
                        {visited && !locked && <span className="miniMapVisitedBadge">방문</span>}
                      </button>
                    );
                  })}
                </div>
              </Panel>
            </>
          );
        })()}

        {view === "storyMap" && (() => {
          // 공통 챕터(1~6) + 분기 7장 + 분기 8장 구조로 렌더링
          const commonChapters = CHAPTER_MAP.filter((c) => !c.branch);
          const ch7Pure = CHAPTER_MAP.find((c) => c.id === "ch7_pure")!;
          const ch7Obs  = CHAPTER_MAP.find((c) => c.id === "ch7_obsession")!;
          const ch8Pure = CHAPTER_MAP.find((c) => c.id === "ch8_pure")!;
          const ch8Obs  = CHAPTER_MAP.find((c) => c.id === "ch8_obsession")!;

          const renderNode = (node: ChapterNode) => {
            const status = getChapterStatus(node, seenEvents, currentScenarioId, storyRoute);
            const icon = status === "cleared" ? "✓" : status === "current" ? "★" : status === "locked" ? "🔒" : "○";
            const canStart = (status === "available" || status === "cleared") && node.firstScenarioId;
            return (
              <button
                key={node.id}
                className={`mapNode mapStatus-${status}${node.branch ? ` mapBranch-${node.branch}` : ""}`}
                onClick={() => canStart && startScenario(node.firstScenarioId!)}
                disabled={!canStart}
              >
                <span className="mapNodeIcon">{icon}</span>
                <span className="mapNodeNum">{node.number}장</span>
                <b className="mapNodeTitle">{status === "locked" ? "???" : node.title}</b>
                <small className="mapNodeSubtitle">{status === "locked" ? "이전 챕터 진행 후 해금" : node.subtitle}</small>
              </button>
            );
          };

          return (
            <Panel title="스토리 맵">
              <p className="mapHint">근떡존과 함께한 이야기 흐름. 카드를 누르면 해당 챕터 첫 장면으로 이동해요.</p>
              <div className="mapLegend">
                <span className="mapLegendItem"><b>★</b> 진행 중</span>
                <span className="mapLegendItem"><b>✓</b> 완료</span>
                <span className="mapLegendItem"><b>○</b> 진행 가능</span>
                <span className="mapLegendItem"><b>🔒</b> 잠김</span>
              </div>
              <div className="mapPath">
                {commonChapters.map((node, i) => (
                  <div key={node.id} className="mapStep">
                    {renderNode(node)}
                    {i < commonChapters.length - 1 && <div className="mapConnector" />}
                  </div>
                ))}
                {/* 6장 → 7장 분기 */}
                <div className="mapBranchSplit">
                  <div className="mapBranchLine" />
                  <div className="mapBranchLabel">루트 분기</div>
                </div>
                <div className="mapBranchRow">
                  <div className="mapBranchCol pure">
                    <div className="mapBranchHeader">🤍 순애 루트</div>
                    {renderNode(ch7Pure)}
                    <div className="mapConnector branch" />
                    {renderNode(ch8Pure)}
                  </div>
                  <div className="mapBranchCol obsession">
                    <div className="mapBranchHeader">🖤 집착 루트</div>
                    {renderNode(ch7Obs)}
                    <div className="mapConnector branch" />
                    {renderNode(ch8Obs)}
                  </div>
                </div>
              </div>
            </Panel>
          );
        })()}

        {view === "achievements" && (() => {
          const filtered = ACHIEVEMENTS.filter((a) =>
            achievementCategoryTab === "all" ? true : a.category === achievementCategoryTab
          );
          const totalCount = ACHIEVEMENTS.length;
          const unlockedCount = Object.keys(unlockedAchievements).length;
          const categoryTabs: Array<AchievementCategory | "all"> = ["all", "start", "relation", "route", "collect", "life"];
          return (
            <Panel title="업적">
              <div className="achHeader">
                <div className="achProgress">
                  <span className="achProgressNum">{unlockedCount} / {totalCount}</span>
                  <span className="achProgressLabel">업적 해금</span>
                  <div className="achProgressBar"><div className="achProgressFill" style={{ width: `${(unlockedCount / totalCount) * 100}%` }} /></div>
                </div>
              </div>
              <div className="achTabs">
                {categoryTabs.map((tab) => (
                  <button
                    key={tab}
                    className={`achTab${achievementCategoryTab === tab ? " active" : ""}`}
                    onClick={() => setAchievementCategoryTab(tab)}
                  >
                    {tab === "all" ? "전체" : ACHIEVEMENT_CATEGORY_LABEL[tab]}
                  </button>
                ))}
              </div>
              <div className="achGrid">
                {filtered.map((ach) => {
                  const isUnlocked = !!unlockedAchievements[ach.id];
                  const showHidden = ach.hidden && !isUnlocked;
                  return (
                    <div key={ach.id} className={`achCard${isUnlocked ? " unlocked" : ""}${showHidden ? " hidden" : ""}`}>
                      <div className="achEmoji">{showHidden ? "❓" : ach.emoji}</div>
                      <div className="achInfo">
                        <b className="achTitle">{showHidden ? "??? · 숨겨진 업적" : ach.title}</b>
                        <small className="achDesc">{showHidden ? "조건을 만족하면 공개됩니다." : ach.description}</small>
                      </div>
                      {isUnlocked && <span className="achBadge">달성</span>}
                    </div>
                  );
                })}
              </div>
            </Panel>
          );
        })()}

        {view === "save" && <Panel title="저장"><div className="grid">{[1,2,3].map((slot)=><div className="cardBtn" key={slot}><b>슬롯 {slot}</b><button onClick={()=>saveSlot(slot)}>저장</button><button onClick={()=>loadSlot(slot)}>불러오기</button></div>)}</div><button className="bigBtn dangerBtn" onClick={resetAll}>전체 초기화</button></Panel>}
        {view === "settings" && <Panel title="액션"><div className="grid">{actionItems.map((item)=><button className="cardBtn" key={item.label} onClick={()=>runAction(item)}><b>{item.emoji} {item.label}</b><small>{item.text}</small></button>)}</div></Panel>}

        {view === "admin" && isAdminMode && (
          <Panel title="🔑 관리자 패널">
            <div className="adminPanel">
              <div className="adminSection">
                <h3 className="adminSectionTitle">🎛 수치 조정</h3>
                <div className="adminStatRows">
                  {(["affinity","jealousy","obsession","trust"] as (keyof Stats)[]).map((key) => (
                    <div key={key} className="adminStatRow">
                      <span className="adminStatLabel">{{affinity:"호감",jealousy:"질투",obsession:"집착",trust:"신뢰"}[key]}</span>
                      <input type="range" min={0} max={1000} step={10} value={stats[key]}
                        onChange={(e) => setStats((p) => ({ ...p, [key]: Number(e.target.value) }))} />
                      <span className="adminStatVal">{stats[key]}</span>
                      <div className="adminStatBtns">
                        <button onClick={() => setStats((p) => ({ ...p, [key]: Math.max(0, p[key] - 100) }))}>-100</button>
                        <button onClick={() => setStats((p) => ({ ...p, [key]: Math.min(1000, p[key] + 100) }))}>+100</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="adminSection">
                <h3 className="adminSectionTitle">🚽 방광 강제 조정</h3>
                <div className="adminStatRow">
                  <span className="adminStatLabel">방광</span>
                  <input type="range" min={0} max={100} step={5} value={bladderLevel}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setBladderLevel(v);
                      // level에 맞게 lastBladderRelief를 역산
                      const elapsed = (v / 100) * BLADDER_FILL_MS;
                      setLastBladderRelief(Date.now() - elapsed);
                      if (v === 0) { setBladderMaxAt(null); setBladderPopupThreshold(75); setBladderPopup(false); }
                      if (v >= 100 && !bladderMaxAt) setBladderMaxAt(Date.now());
                    }} />
                  <span className="adminStatVal">{bladderLevel}%</span>
                  <div className="adminStatBtns">
                    <button onClick={() => {
                      setBladderLevel(0); setLastBladderRelief(Date.now());
                      setBladderMaxAt(null); setBladderPopupThreshold(75); setBladderPopup(false);
                    }}>초기화</button>
                    <button onClick={() => {
                      setBladderLevel(85);
                      setLastBladderRelief(Date.now() - 0.85 * BLADDER_FILL_MS);
                    }}>85%</button>
                    <button onClick={() => {
                      setBladderLevel(100);
                      setLastBladderRelief(Date.now() - BLADDER_FILL_MS);
                      setBladderMaxAt((prev) => prev ?? Date.now());
                    }}>100%</button>
                  </div>
                </div>
              </div>
              <div className="adminSection">
                <h3 className="adminSectionTitle">🗺 루트 강제 변경</h3>
                <div className="adminRouteBtns">
                  {(["common","pure","obsession"] as StoryRoute[]).map((r) => (
                    <button key={r} className={`adminRouteBtn${storyRoute === r ? " active" : ""}`}
                      onClick={() => setStoryRoute(r)}>
                      {r === "pure" ? "🤍 순애" : r === "obsession" ? "🖤 집착" : "⬜ 공통"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="adminSection">
                <h3 className="adminSectionTitle">📖 전체 시나리오</h3>
                <div className="grid">
                  {Object.values(scenarioData).filter((s) => getScenarioCategory(s.id, s) !== "action").map((s) => (
                    <button key={s.id} className="cardBtn" onClick={() => startScenario(s.id)}>
                      <b>{s.title}</b>
                      <small>{s.id} · {getScenarioCategory(s.id, s)}</small>
                    </button>
                  ))}
                </div>
              </div>
              <div className="adminSection">
                <button className="adminLogoutBtn" onClick={adminLogout}>🔒 관리자 모드 종료</button>
              </div>
            </div>
          </Panel>
        )}

        {showTutorial && <div className="tutorialOverlay"><section className="tutorialCard"><div>첫 플레이 안내 <span>{tutorialStep + 1} / {tutorialCards.length}</span></div><h2>{currentTutorial.title}</h2><p>{currentTutorial.body}</p><footer><button onClick={closeTutorial}>건너뛰기</button>{tutorialStep < tutorialCards.length - 1 ? <button onClick={()=>setTutorialStep((v)=>v+1)}>다음</button> : <button onClick={closeTutorial}>시작하기</button>}</footer></section></div>}
        {chapterTransition && <div className={`chapterTransition ${chapterTransition.mode}`}><section><span>{chapterTransition.eyebrow}</span><h2>{chapterTransition.title}</h2>{chapterTransition.subtitle && <p>{chapterTransition.subtitle}</p>}</section></div>}
        {cgUnlockToast && <div className="cgUnlockToast"><div className="cgUnlockIcon">🖼</div><div><b>CG 해금</b><span>「{cgUnlockToast.name}」</span><small>갤러리에 추가되었습니다.</small></div></div>}
        {achievementToast && <div className="achToast"><div className="achToastIcon">{achievementToast.emoji}</div><div><b>업적 해금</b><span>「{achievementToast.title}」</span><small>{achievementToast.description}</small></div></div>}
        {bladderPopup && (
          <div className="bladderPopupOverlay">
            <div className="bladderPopupCard">
              <div className="bladderPopupIllust">
                <img src="/bladder_illust.png" alt="" onError={(e) => { e.currentTarget.style.display = "none"; (e.currentTarget.nextElementSibling as HTMLElement).style.display = "block"; }}/>
                <span style={{display:"none",fontSize:"44px"}}>{bladderLevel >= 95 ? "😭" : bladderLevel >= 90 ? "😣" : "🥺"}</span>
              </div>
              <p className="bladderPopupMsg">
                {bladderLevel >= 95
                  ? "선생님...!! 저 진짜 한계예요ㅠㅠㅠ 제발 보내주세요... 못 참겠어요..."
                  : bladderLevel >= 90
                  ? "선생님ㅠㅠ 진짜 못참겠어요... 화장실 보내주세요..."
                  : bladderLevel >= 85
                  ? "선생님... 화장실 가고싶은데... 보내주실 수 있어요?ㅠ"
                  : "저... 화장실 가도 될까요...? 선생님 ㅎ 좀 마려워서요"}
              </p>
              <div className="bladderPopupGaugeWrap">
                <div className="bladderPopupGaugeFill" style={{ width: `${bladderLevel}%` }}/>
              </div>
              <small className="bladderPopupPct">방광 {bladderLevel}%</small>
              <div className="bladderPopupBtns">
                <button className="bladderAllow" onClick={allowBathroom}>허락한다 🚽</button>
                <button className="bladderDeny" onClick={denyBathroom}>안 돼 😈</button>
              </div>
            </div>
          </div>
        )}
        {statFloaters.length > 0 && (
          <div className="statFloaterWrap" aria-hidden="true">
            {statFloaters.map((f) => (
              <span key={f.id} className={`statFloater ${f.positive ? "positive" : "negative"}`}>{f.text}</span>
            ))}
          </div>
        )}
      </section>
      {endingCard && (
        <div className="endingCardOverlay" onClick={() => { if(endingCardTimer.current) window.clearTimeout(endingCardTimer.current); setEndingCard(null); }}>
          <div className="endingCardBg" style={{ backgroundImage: `url(${endingCard.bgImage})` }} />
          <div className="endingCardVignette" />
          <div className="endingCardContent">
            <span className="endingCardEyebrow">E · N · D · I · N · G</span>
            <p className="endingCardNum">{endingCard.card.num}</p>
            <h2 className="endingCardTitle">{endingCard.card.title}</h2>
            <p className="endingCardSub">{endingCard.card.subtitle}</p>
            <blockquote className="endingCardQuote">"{endingCard.card.quote}"</blockquote>
          </div>
          <button className="endingCardSkip" onClick={(e) => { e.stopPropagation(); if(endingCardTimer.current) window.clearTimeout(endingCardTimer.current); setEndingCard(null); }}>SKIP ▶</button>
        </div>
      )}
      {obsessionCinematic && (
        <div className="obsessionCinematic" onClick={() => setObsessionCinematic(false)}>
          <video
            src="/obsession_entry.mp4"
            muted
            autoPlay
            playsInline
            onEnded={() => setObsessionCinematic(false)}
          />
          <div className="obsCinText">
            <span className="obsCinEyebrow">R · O · U · T · E</span>
            <p className="obsCinTitle">집착 루트에 진입</p>
            <span className="obsCinSub">그는 이제 다른 곳을 보지 않는다</span>
          </div>
          <button className="obsCinSkip" onClick={(e) => { e.stopPropagation(); setObsessionCinematic(false); }}>SKIP ▶</button>
        </div>
      )}
      {pureCinematic && (
        <div className="pureCinematic" onClick={() => setPureCinematic(false)}>
          <video
            src="/pureroute_entry.mp4"
            muted
            autoPlay
            playsInline
            onEnded={() => setPureCinematic(false)}
          />
          <div className="pureCinText">
            <span className="pureCinEyebrow">✦ L · O · V · E &nbsp;&nbsp; R · O · U · T · E ✦</span>
            <p className="pureCinTitle"><span className="pureCinSparkle pureCinSparkleL">✿</span>순애 루트에 진입<span className="pureCinSparkle pureCinSparkleR">✿</span></p>
            <span className="pureCinSub">— 오직 당신에게로 —</span>
          </div>
          <button className="pureCinSkip" onClick={(e) => { e.stopPropagation(); setPureCinematic(false); }}>SKIP ▶</button>
        </div>
      )}
      {/* ── 관리자 비밀번호 모달 ── */}
      {showAdminPrompt && (
        <div className="adminOverlay" onClick={() => { setShowAdminPrompt(false); setAdminPwInput(""); }}>
          <div className="adminModal" onClick={(e) => e.stopPropagation()}>
            <p className="adminModalTitle">🔑 관리자 모드</p>
            <input
              className="adminPwInput"
              type="password"
              placeholder="비밀번호 입력"
              value={adminPwInput}
              autoFocus
              onChange={(e) => setAdminPwInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") confirmAdminLogin(); if (e.key === "Escape") { setShowAdminPrompt(false); setAdminPwInput(""); } }}
            />
            <div className="adminModalBtns">
              <button className="adminCancelBtn" onClick={() => { setShowAdminPrompt(false); setAdminPwInput(""); }}>취소</button>
              <button className="adminConfirmBtn" onClick={confirmAdminLogin}>입력</button>
            </div>
          </div>
        </div>
      )}
      {levelUpCard && (
        <div className="levelUpOverlay" onClick={() => { if(levelUpCardTimer.current) window.clearTimeout(levelUpCardTimer.current); setLevelUpCard(null); }}>
          <div className="levelUpCard">
            {[0,1,2,3,4,5,6,7].map((i) => <span key={i} className="lvupParticle" style={{"--pi": i} as React.CSSProperties}/>)}
            <span className="levelUpEyebrow">RELATIONSHIP LEVEL UP</span>
            <div className="levelUpNum">Lv.{levelUpCard.lv}</div>
            <div className="levelUpName">{levelUpCard.displayName}</div>
            <p className="levelUpFlavor">"{levelUpCard.flavor}"</p>
            <div className="levelUpBar"><div className="levelUpBarFill" /></div>
          </div>
        </div>
      )}
    </main>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&family=Nunito:wght@700;800;900&display=swap');
*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;background:#eee7dc;overflow-x:hidden;overflow-y:auto}button,input{font-family:inherit}nextjs-portal{display:none!important}.coverScreen{height:100dvh;background:radial-gradient(circle at top,#2f2119 0%,#140e0b 54%,#080606 100%);display:grid;place-items:center;position:relative;overflow:hidden}.coverScreen:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,213,141,.06),transparent 24%,rgba(0,0,0,.22));pointer-events:none}.coverImg{width:auto;max-width:min(92vw,1520px);height:auto;max-height:92dvh;object-fit:contain;object-position:center center;filter:saturate(1.02)}.coverStartBtn{position:absolute;left:50%;bottom:62px;transform:translateX(-50%);border:0;border-radius:999px;background:linear-gradient(135deg,#e8993b,#d97a24);color:white;font-size:22px;font-weight:1000;padding:18px 48px;box-shadow:0 16px 40px rgba(217,121,36,.28),inset 0 1px 0 rgba(255,255,255,.28)}
.app{height:100dvh;display:grid;grid-template-columns:370px minmax(0,1fr);background:#eee7dc;color:#1b1210;overflow:hidden}.side{background:#21130f;color:white;padding:24px;overflow:auto}.profileHead{display:flex;gap:12px;align-items:center}.avatar{width:62px;height:62px;border-radius:18px;object-fit:cover}.statsBox{margin:14px 0;padding:12px;border-radius:18px;background:rgba(255,255,255,.08)}.statBar{margin:8px 0}.statBar div{display:flex;justify-content:space-between;font-size:12px;font-weight:900}.statBar i{display:block;height:6px;background:rgba(255,255,255,.18);border-radius:99px;overflow:hidden}.statBar em{display:block;height:100%;background:#e58a2f}.statBar em.danger{background:#e33d3d}.nav{display:grid;gap:10px}.nav button,.topBar button,.cardBtn,.bigBtn{border:0;border-radius:14px;background:#3a2d29;color:white;padding:14px;font-weight:900;text-align:left;cursor:pointer}.nav button.active,.nav button:hover{background:#df842c}.content{position:relative;min-width:0;min-height:0;overflow:hidden;display:flex;flex-direction:column}.panel{flex:1;min-height:0;overflow:auto;padding:34px;color:#1b1210}.panel h2{font-size:34px;margin:0 0 24px;color:#2a1a14}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}.cardBtn{background:#fff;color:#1b1210;border:1px solid #decbb9;display:grid;gap:8px}.cardBtn small{color:#8b7162}.sectionStack{display:grid;gap:18px}.sectionStack h3{margin:0;color:#5a3928}.routeBox{background:#fff7ed;border:1px solid #e5cfb8;border-radius:16px;padding:18px;margin-bottom:16px}.tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}.tabs button{border:0;border-radius:999px;background:#3a2d29;color:white;padding:10px 14px}.galleryGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}.cgCard{height:190px;border-radius:14px;background:#31231f;display:grid;place-items:center;color:#b9a99d;overflow:hidden}.cgCard img{width:100%;height:100%;object-fit:cover}.profilePanel{display:grid;gap:22px}.profileOverview{display:grid;grid-template-columns:minmax(240px,320px) minmax(0,1fr);gap:22px;align-items:start}.profileIllustration img{width:100%;height:100%;min-height:340px;object-fit:cover;border-radius:24px;border:1px solid rgba(255,255,255,.28);background:#f7e6d0}.profileSummary h3{margin:0 0 10px;font-size:32px}.profileTag{display:inline-flex;background:#fef0dc;color:#6b3f16;padding:9px 14px;border-radius:999px;font-weight:900;margin-bottom:14px}.profileStatsLine{display:flex;flex-wrap:wrap;gap:10px;color:#5d4535;font-size:14px;line-height:1.6}.profileDetails{display:flex;flex-wrap:wrap;gap:10px;margin:14px 0}.profileDetails span{display:inline-flex;padding:10px 14px;border-radius:14px;background:rgba(75,45,22,.08);font-size:13px;color:#4a3424}.statusCards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.statusCard{background:#fff7ef;border:1px solid #e7d2b8;border-radius:18px;padding:16px;min-height:110px;display:grid;gap:8px}.statusCard strong{font-size:14px;color:#7b4f2f;text-transform:uppercase;letter-spacing:.06em}.statusCard span{font-size:28px;font-weight:900;color:#2f1f13}.statusCard small{color:#6b4f3d;font-size:13px;line-height:1.5}.statusNote{font-size:15px;color:#4f3a2e;padding:18px 16px;border-radius:18px;background:#fff8ef;border:1px solid #e7d2b8}.profileTextBlock{display:grid;gap:14px;background:#fff;border-radius:18px;border:1px solid #e6d2b8;padding:20px}.profileTextBlock p{margin:0;color:#4a342a;line-height:1.8}.profileMeta{display:grid;gap:14px}.profileMeta div{background:#fff7ef;border:1px solid #e8d2b6;border-radius:18px;padding:18px}.profileMeta strong{display:block;margin-bottom:10px;color:#7b4f2f;font-size:14px}.profileMeta p{margin:0;color:#4a342a;line-height:1.8}.bigBtn.dangerBtn{background:#d64545;color:white;border:1px solid #a33030;margin-top:18px}.bigBtn.dangerBtn:hover{background:#c63636}
.app.theme-soft{background:linear-gradient(180deg,#faf0ef 0%,#f5e7e4 100%)}.app.theme-soft .side{background:linear-gradient(180deg,#34201d 0%,#281715 100%)}.app.theme-soft .homeView{background:linear-gradient(180deg,#fff9f7 0%,#f9ece8 50%,#f3dfdc 100%)}.app.theme-soft .homeView:before{background:radial-gradient(circle,rgba(255,198,185,.28),transparent 68%)}.app.theme-soft .chatArea{background:linear-gradient(180deg,#fffaf8 0%,#f7ece7 100%)}.app.theme-soft .msgRow.user .bubble{background:#d78661}.app.theme-soft .inputBar{background:#f4e7e3}
.app.theme-pure{background:linear-gradient(180deg,#fff7fb 0%,#f9eaf0 48%,#f2dce6 100%)}.app.theme-pure .side{background:linear-gradient(180deg,#4f2935 0%,#2d171e 100%)}.app.theme-pure .homeView{background:linear-gradient(180deg,#fffafd 0%,#fff0f6 44%,#f7dfe9 100%)}.app.theme-pure .homeView:before{background:radial-gradient(circle,rgba(255,189,214,.34),transparent 69%)}.app.theme-pure .homeLogo span{color:#5f3040;text-shadow:0 3px 0 #ffe6ef,0 10px 22px rgba(111,54,84,.14)}.app.theme-pure .homeLogo small,.app.theme-pure .profileTag{background:rgba(255,241,247,.9);color:#9b5573;border-color:rgba(213,135,171,.36)}.app.theme-pure .nav button,.app.theme-pure .topBar button,.app.theme-pure .bigBtn{background:linear-gradient(135deg,#6d4453,#442733)}.app.theme-pure .nav button.active,.app.theme-pure .nav button:hover,.app.theme-pure .topBar button:hover{background:linear-gradient(135deg,#e18fad,#b16383)}.app.theme-pure .homeButtons button{background:linear-gradient(135deg,#d98da8,#8b546a)}.app.theme-pure .homeButtons button:hover{background:linear-gradient(135deg,#ebb2c6,#b36b88)}.app.theme-pure .chatArea{background:linear-gradient(180deg,#fffafb 0%,#fceff4 100%)}.app.theme-pure .bubble{background:#fffdfd}.app.theme-pure .msgRow.user .bubble{background:#d77f9a}.app.theme-pure .inputBar{background:#f7e7ee}.app.theme-pure .statusCard,.app.theme-pure .statusNote,.app.theme-pure .profileMeta div,.app.theme-pure .memoryPanel{background:#fff8fb;border-color:#ebcfdc}.app.theme-pure .homeBubble{background:linear-gradient(180deg,rgba(255,252,254,.98) 0%,rgba(255,245,249,.95) 100%);border:1px solid rgba(202,126,161,.62);color:#5a3340;box-shadow:0 18px 34px rgba(150,94,126,.12),0 0 0 1px rgba(255,255,255,.4) inset}.app.theme-pure .homeBubble:after{background:rgba(255,246,250,.98);border-left:1px solid rgba(202,126,161,.62);border-bottom:1px solid rgba(202,126,161,.62)}
.app.theme-obsession{background:linear-gradient(180deg,#160f11 0%,#241317 42%,#0e090a 100%);color:#f6ece9}.app.theme-obsession .side{background:linear-gradient(180deg,#11090b 0%,#2a1115 58%,#090506 100%)}.app.theme-obsession .statsBox,.app.theme-obsession .emotionBox{background:rgba(255,240,240,.06);border-color:rgba(255,149,149,.12)}.app.theme-obsession .homeView{background:linear-gradient(180deg,#201518 0%,#2d171c 44%,#130b0d 100%);color:#f8edeb}.app.theme-obsession .homeView:before{background:radial-gradient(circle,rgba(138,26,38,.28),transparent 66%)}.app.theme-obsession .homeLogo span{color:#fff0ed;text-shadow:0 3px 0 rgba(109,27,37,.44),0 10px 22px rgba(0,0,0,.24)}.app.theme-obsession .homeLogo small{background:rgba(50,19,24,.72);color:#f0a5ad;border-color:rgba(195,92,104,.32)}.app.theme-obsession .nav button,.app.theme-obsession .topBar button,.app.theme-obsession .bigBtn{background:linear-gradient(135deg,#4a262d,#1e1114);border:1px solid rgba(255,151,151,.08)}.app.theme-obsession .nav button.active,.app.theme-obsession .nav button:hover,.app.theme-obsession .topBar button:hover{background:linear-gradient(135deg,#8f3a45,#52232b)}.app.theme-obsession .homeButtons button{background:linear-gradient(135deg,#6b2b35,#241215);box-shadow:0 14px 28px rgba(0,0,0,.24)}.app.theme-obsession .homeButtons button:hover{background:linear-gradient(135deg,#9d4754,#35181d)}.app.theme-obsession .chatArea{background:linear-gradient(180deg,#2a1a1d 0%,#1a1214 100%)}.app.theme-obsession .bubble{background:#fff9f7;color:#2a1618}.app.theme-obsession .msgRow.user .bubble{background:#8d3d47;color:#fff5f3}.app.theme-obsession .msgRow.narration .bubble{color:#d1b7b4}.app.theme-obsession .inputBar{background:linear-gradient(180deg,#26171a 0%,#190f12 100%);border-top:1px solid rgba(150,73,86,.32);box-shadow:0 -12px 30px rgba(0,0,0,.34)}.app.theme-obsession .inputBar input{background:linear-gradient(180deg,#fff7f5 0%,#f4e6e4 100%);border:1px solid #6e434a;color:#291517;box-shadow:inset 0 1px 0 rgba(255,255,255,.68),0 10px 20px rgba(0,0,0,.12)}.app.theme-obsession .inputBar input::placeholder{color:#8d6e73}.app.theme-obsession .inputBar input:focus{border-color:#9c5965;box-shadow:0 0 0 3px rgba(156,89,101,.22),0 10px 22px rgba(0,0,0,.2)}.app.theme-obsession .inputBar button{background:linear-gradient(135deg,#7d3744,#35171d);color:#fff7f6;border:1px solid rgba(255,181,181,.12);box-shadow:0 12px 26px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.05)}.app.theme-obsession .inputBar button:hover{background:linear-gradient(135deg,#944858,#461f29)}.app.theme-obsession .panel{background:linear-gradient(180deg,#fffaf8 0%,#f8efed 100%);color:#241517}.app.theme-obsession .panel h2,.app.theme-obsession .sectionStack h3{color:#3a2026}.app.theme-obsession .routeBox,.app.theme-obsession .statusCard,.app.theme-obsession .statusNote,.app.theme-obsession .profileTextBlock,.app.theme-obsession .profileMeta div,.app.theme-obsession .memoryPanel{background:#fffaf9;border-color:#e5d0ca}.app.theme-obsession .profileTag{background:#fff0f1;color:#8c404a;border:1px solid rgba(181,101,111,.28)}.app.theme-obsession .homeBubble{background:linear-gradient(180deg,rgba(30,18,21,.94) 0%,rgba(47,26,31,.92) 100%);border:1px solid rgba(169,82,96,.55);color:#f5e8e8;box-shadow:0 18px 34px rgba(0,0,0,.26),0 0 0 1px rgba(255,255,255,.03) inset}.app.theme-obsession .homeBubble:after{background:rgba(37,22,26,.96);border-left:1px solid rgba(169,82,96,.55);border-bottom:1px solid rgba(169,82,96,.55)}
.homeView{position:relative;flex:1;min-height:0;display:grid;grid-template-rows:auto 1fr auto;place-items:center;padding:26px;overflow:auto;background:linear-gradient(180deg,#fff8ef 0%,#f7e9d8 48%,#edd8c5 100%);font-family:"Trebuchet MS","Gowun Dodum","Malgun Gothic",system-ui,sans-serif}.homeView:before{content:"";position:absolute;inset:-10% -5% auto auto;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(255,207,147,.34),transparent 66%);filter:blur(18px);pointer-events:none}.homeHeader{text-align:center;z-index:1;align-self:end}.homeLogo{display:inline-grid;gap:4px;place-items:center;padding:8px 22px 10px}.homeLogo span{font-size:clamp(36px,5vw,58px);font-weight:1000;line-height:1;color:#4a2d24;text-shadow:0 3px 0 #ffe7bf,0 8px 18px rgba(91,48,24,.12);letter-spacing:.02em}.homeLogo small{font-size:14px;color:#bf7a3c;font-weight:1000;letter-spacing:.12em;padding:.34rem .95rem;border-radius:999px;background:rgba(255,247,234,.8);border:1px solid rgba(223,159,94,.38)}.homeStage{position:relative;z-index:1;display:grid;place-items:end center;align-self:center;width:min(1080px,100%);height:min(64dvh,720px);margin-top:12px;overflow:visible}.homeCharacterCard{grid-area:1/1;z-index:1;align-self:end;justify-self:center;border:0;background:transparent;padding:0;transform-style:preserve-3d;transform:rotateX(var(--tilt-x)) rotateY(var(--tilt-y));transition:transform .16s ease;cursor:pointer}.homeCharacterCard img{display:block;width:min(54vw,440px);max-height:60dvh;object-fit:contain;background:transparent;filter:drop-shadow(0 22px 22px rgba(54,28,16,.18));animation:idle 3.2s ease-in-out infinite}.homeBubble{position:absolute;z-index:2;top:12%;left:60%;width:clamp(150px,13vw,210px);min-height:0;background:linear-gradient(180deg,rgba(255,253,250,.98) 0%,rgba(249,241,233,.95) 100%);border:1px solid rgba(181,124,72,.62);border-radius:18px;padding:11px 13px 12px 14px;box-shadow:0 18px 34px rgba(55,28,15,.12),0 0 0 1px rgba(255,255,255,.35) inset;font-family:"Trebuchet MS","Gowun Dodum","Malgun Gothic",sans-serif;font-size:10px;line-height:1.45;font-weight:700;color:#4a2d24;text-align:left;letter-spacing:0;animation:bubblePop .22s ease;pointer-events:none}.homeBubble:after{content:"";position:absolute;left:18px;bottom:-7px;width:12px;height:12px;background:rgba(250,242,235,.98);border-left:1px solid rgba(181,124,72,.62);border-bottom:1px solid rgba(181,124,72,.62);transform:rotate(45deg)}.homeButtons{z-index:1;width:min(700px,100%);display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:8px}.homeButtons button{border:0;border-radius:20px;padding:18px;background:linear-gradient(135deg,#4a342d,#241715);color:white;font-weight:1000;box-shadow:0 12px 26px rgba(53,31,18,.16)}.homeButtons button:hover{background:linear-gradient(135deg,#e59a47,#9d4e2f)}
.topBar{display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;padding:14px 12px;flex:none;-webkit-overflow-scrolling:touch}.topBar button{flex:0 0 auto;white-space:nowrap;font-size:13px;line-height:1.4;padding:10px 14px;border-radius:18px;background:#3a2d29;color:white;border:1px solid rgba(255,255,255,.08)}.chatArea{flex:1;min-height:0;overflow:auto;padding:18px 20px;display:flex;flex-direction:column;gap:6px}.msgRow{display:flex;align-items:flex-start;gap:8px;margin:8px 0}.msgRow.assistant{justify-content:flex-start}.msgRow.user{justify-content:flex-end;align-items:flex-end}.msgRow.narration{justify-content:center}.chatAvatar{width:38px;height:38px;border-radius:14px;object-fit:cover;margin-right:8px}.bubble{max-width:min(84vw,720px);background:white;border-radius:22px;padding:16px 20px;box-shadow:0 10px 24px rgba(0,0,0,.08);font-size:16px;line-height:1.72;word-break:break-word;display:inline-flex;flex-direction:column}.msgRow.user .bubble{background:#df842c;color:white;margin-left:10px}.msgRow.assistant .bubble{margin-left:0}.msgRow.narration .bubble{max-width:min(760px,88%);background:transparent;box-shadow:none;color:#7b6253;font-style:italic;text-align:center;padding:10px 14px;border-radius:0}.msgRow.narration .bubble small{align-self:center;color:#b39b89}.bubble small{display:block;margin-top:8px;color:#9c8d84;font-size:12px}.inputBar{height:72px;display:grid;grid-template-columns:auto auto minmax(0,1fr) auto;gap:8px;padding:12px;background:#f2e7dd;flex:none;align-items:center;transition:background .24s ease,box-shadow .24s ease,border-color .24s ease}.inputBar input{min-width:0;height:48px;border:1px solid #ddd0c5;border-radius:24px;padding:0 18px;font-size:16px;background:#fffaf6;color:#2a1a14;outline:none;transition:border-color .2s ease,box-shadow .2s ease,background .2s ease,color .2s ease}.inputBar input:focus{border-color:#d59653;box-shadow:0 0 0 3px rgba(217,129,49,.18)}.inputBar input::placeholder{color:#9b8b81;opacity:1}.inputBar button{min-width:56px;height:48px;border:0;border-radius:18px;background:#8d8178;color:white;font-weight:900;padding:0 14px;line-height:1;display:flex;align-items:center;justify-content:center;white-space:nowrap;font-size:14px;transition:background .2s ease,box-shadow .2s ease,transform .15s ease}.inputBar button:hover{transform:translateY(-1px);background:#7a6f67}.inputBar .photoBtn{min-width:48px;width:48px;padding:0;font-size:20px;background:#fffaf6;color:#5a4438;border:1px solid #ddd0c5;border-radius:50%}.inputBar .photoBtn:hover{background:#fff3e6;border-color:#d59653}
.scenarioOverlay{position:fixed;inset:0;z-index:9999;color:white;overflow:auto;pointer-events:auto}.scenarioOverlay::before{content:"";position:absolute;inset:0;background-image:var(--bg-url);background-size:cover;background-position:center;filter:blur(16px) saturate(1.05);opacity:1}.scenarioOverlay::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.15),rgba(0,0,0,.75));}.scenarioActive .side,.scenarioActive .topBar,.scenarioActive .homeButtons,.scenarioActive .inputBar,.scenarioActive .panel{visibility:hidden !important;pointer-events:none !important}.scenarioActive .content{overflow:hidden !important}.vnImageStage{position:absolute;inset:0;display:grid;place-items:center;z-index:1;padding-bottom:110px}.vnImageStage img{max-width:100%;max-height:calc(100vh - 220px);object-fit:contain;filter:drop-shadow(0 24px 50px rgba(0,0,0,.55))}.vnTextbox{position:absolute;left:50%;bottom:24px;transform:translateX(-50%);width:min(900px,calc(100vw - 44px));z-index:2;max-height:55vh;padding-bottom:0;overflow:auto;box-sizing:border-box}.vnTitleRow{display:flex;justify-content:space-between;font-size:12px;font-weight:900;margin-bottom:8px;text-shadow:0 2px 8px #000}.vnName{display:inline-block;background:#d98131;padding:10px 18px;border-radius:8px 8px 0 0;font-weight:900}.vnDialogue{width:100%;min-height:120px;text-align:left;border:1px solid rgba(255,222,167,.26);border-radius:8px;background:rgba(13,9,10,.86);color:white;padding:22px 24px;cursor:pointer;backdrop-filter:blur(12px);max-height:calc(55vh - 120px);overflow:auto}.typeText{white-space:pre-line;line-height:1.75;font-size:18px;margin:0}.vnControls{display:flex;justify-content:flex-end;gap:8px;margin-top:10px}.vnControls button,.vnChoices button{border:0;border-radius:8px;background:#2f221e;color:white;padding:12px 16px;font-weight:900}.vnChoices{display:grid;gap:10px;margin-top:12px}
.tutorialOverlay,.chapterTransition{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;background:rgba(8,5,4,.72);backdrop-filter:blur(9px)}.tutorialCard,.chapterTransition section{width:min(430px,calc(100vw - 32px));background:#fff8ef;border-radius:12px;padding:24px;color:#1b1210;box-shadow:0 28px 80px rgba(0,0,0,.35)}.tutorialCard footer{display:flex;justify-content:flex-end;gap:10px;margin-top:18px}.tutorialCard button{border:0;border-radius:10px;background:#d98131;color:white;padding:12px 16px;font-weight:900}.chapterTransition{color:white;background:rgba(0,0,0,.86);animation:fadeChapter 2.3s ease forwards}.chapterTransition section{background:transparent;color:white;text-align:center;border-top:1px solid rgba(244,214,169,.34);border-bottom:1px solid rgba(244,214,169,.24);box-shadow:none}.chapterTransition h2{font-size:clamp(34px,5vw,68px);margin:12px 0}.chapterTransition span{color:#f0b76b;font-weight:900;letter-spacing:.22em;text-transform:uppercase}
@keyframes idle{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-12px) scale(1.018)}}@keyframes aura{0%,100%{transform:scale(.96);opacity:.7}50%{transform:scale(1.05);opacity:1}}@keyframes bubblePop{0%{opacity:0;transform:translateY(8px) scale(.96)}100%{opacity:1;transform:translateY(-2px) scale(1)}}@keyframes fadeChapter{0%{opacity:0}14%,76%{opacity:1}100%{opacity:0}}
.cgUnlockToast{position:fixed;top:24px;right:24px;z-index:9999;display:flex;align-items:center;gap:14px;background:rgba(14,9,8,.94);border:1px solid rgba(255,205,130,.32);border-radius:20px;padding:14px 20px 14px 16px;color:white;backdrop-filter:blur(14px);box-shadow:0 20px 44px rgba(0,0,0,.38),0 0 0 1px rgba(255,255,255,.04) inset;min-width:220px;animation:cgToastIn .32s cubic-bezier(.2,.8,.4,1) forwards;pointer-events:none}.cgUnlockIcon{font-size:28px;flex:none}.cgUnlockToast b{display:block;font-size:10px;letter-spacing:.12em;color:#f0c060;text-transform:uppercase;margin-bottom:3px}.cgUnlockToast span{display:block;font-size:15px;font-weight:800;color:#fff8f0;margin-bottom:2px}.cgUnlockToast small{font-size:12px;color:#a09080}
@keyframes cgToastIn{0%{opacity:0;transform:translateX(28px) scale(.94)}100%{opacity:1;transform:translateX(0) scale(1)}}
.vnVignette{position:absolute;inset:0;z-index:3;pointer-events:none;box-shadow:inset 0 0 140px 60px rgba(0,0,0,.82);animation:vignetteIn 1.1s ease forwards}
.vnDialogue.dramatic{animation:shakeDialogue .55s ease,pulseDialogue .9s ease}
@keyframes vignetteIn{0%{opacity:0}35%,70%{opacity:1}100%{opacity:.6}}
@keyframes shakeDialogue{0%,100%{transform:translateX(0)}14%{transform:translateX(-7px)}28%{transform:translateX(6px)}42%{transform:translateX(-4px)}58%{transform:translateX(3px)}74%{transform:translateX(-2px)}}
@keyframes pulseDialogue{0%{transform:scale(1)}38%{transform:scale(1.018)}100%{transform:scale(1)}}
.vnChoices button.lockedChoice{opacity:.48;cursor:not-allowed;background:#1e1714;border:1px solid rgba(255,255,255,.10);color:#7a6560;position:relative;display:grid;gap:4px}.vnChoices button.lockedChoice::before{content:"🔒";position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:13px;opacity:.7}.condBadge{display:block;font-size:10px;font-weight:900;letter-spacing:.08em;color:#d0a060;opacity:.8;text-transform:uppercase}.lockedMsg{margin:0 0 10px;padding:12px 16px;border-radius:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,200,120,.18);color:#c9a88a;font-size:14px;font-style:italic;text-align:center;animation:fadeLockedMsg .3s ease}
.emotionBox{display:grid;gap:6px;margin:0 0 14px;padding:13px 14px;border-radius:16px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.1)}.emotionBox span{font-size:16px;font-weight:1000;color:#ffd59b}.emotionBox small{font-size:12px;line-height:1.45;color:#e8d8c8}.emotionBox.danger span{color:#ff8b8b}.emotionBox.warn span{color:#ffbd73}.emotionBox.soft span{color:#aee3b5}.emotionBox.warm span{color:#ffd07a}.statusNote{display:grid;gap:7px}.statusNote b{font-size:18px;color:#7b4f2f}.statusNote span,.statusNote small{line-height:1.6}.memoryPanel{display:grid;gap:10px;background:#fffaf4;border:1px solid #e8d2b6;border-radius:20px;padding:20px}.memoryPanel>div{display:flex;justify-content:space-between;gap:10px;align-items:center}.memoryPanel strong{font-size:18px;color:#5b3828}.memoryPanel small{color:#9a7c65}.memoryPanel p{margin:0;padding:12px 14px;border-radius:14px;background:#fff;border:1px solid rgba(216,184,148,.55);color:#4a342a;line-height:1.7}.memoryPanel p b{display:inline-flex;margin-right:8px;color:#d98131}
.cgReaction{display:grid;grid-template-columns:86px minmax(0,1fr) auto;gap:14px;align-items:center;margin:0 0 18px;padding:14px;border-radius:20px;background:#fff8ef;border:1px solid #e8c99e;box-shadow:0 12px 32px rgba(91,48,24,.08)}.cgReaction img{width:86px;height:86px;border-radius:18px;object-fit:cover;background:#ead7c7}.cgReaction p{margin:0;color:#4a342a;line-height:1.65;font-weight:800}.cgReaction button{border:0;border-radius:999px;background:#3a2d29;color:white;padding:10px 14px;font-weight:900}.cgCard{border:0;text-align:center;cursor:pointer}.cgCard:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(91,48,24,.14)}
@media(max-width:850px){.app{height:auto;min-height:100vh;display:flex;flex-direction:column;overflow:visible}.side{position:sticky;top:0;z-index:20;padding:8px 10px;display:grid;grid-template-columns:1fr;gap:8px;max-height:none;overflow:visible;flex:none;background:#21130f}.profileHead{display:none}.statsBox{margin:0;padding:6px 8px;border-radius:12px}.statBar{margin:3px 0}.statBar div{font-size:10px}.statBar i{height:5px}.nav{display:flex;overflow-x:auto;overflow-y:hidden;gap:8px;flex-wrap:nowrap;padding-bottom:2px}.nav button{white-space:nowrap;padding:10px 13px;border-radius:14px;flex:none}.content{height:auto;min-height:0;flex:1}.coverImg{width:100%;max-width:none;max-height:90dvh;object-position:center center}.coverStartBtn{bottom:48px;font-size:20px;padding:16px 38px}.homeView{padding:18px 14px 24px;display:block;overflow:auto}.homeHeader{margin-bottom:10px}.homeStage{width:100%;height:auto;min-height:min(58dvh,540px);display:grid;place-items:end center}.homeCharacterCard img{width:min(88vw,400px);max-height:48dvh}.homeButtons{grid-template-columns:repeat(2,1fr);gap:10px}.homeButtons button{padding:15px}.homeBubble{top:10px;left:auto;right:4%;width:min(138px,37vw);padding:7px 9px 8px 10px;font-size:8.5px;border-radius:20px}.homeBubble:after{left:14px;bottom:-6px;width:10px;height:10px}.chatArea{padding:16px;display:flex;flex-direction:column;gap:8px}.topBar{display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;padding:12px 10px;flex:none}.topBar button{font-size:13px;min-width:120px;padding:10px 13px;white-space:nowrap;flex:0 0 auto}.bubble{font-size:16px;max-width:84%}.msgRow{display:flex;align-items:flex-start;gap:8px;margin:6px 0}.msgRow.assistant{justify-content:flex-start}.msgRow.user{justify-content:flex-end;align-items:flex-end}.inputBar{position:sticky;bottom:0;z-index:3;grid-template-columns:auto 44px minmax(0,1fr) auto;gap:6px;padding:8px 8px calc(8px + env(safe-area-inset-bottom));height:auto}.inputBar input{font-size:16px;height:44px;padding:0 14px}.inputBar button{min-width:48px;height:44px;padding:0 12px;font-size:13px;border-radius:16px}.inputBar .photoBtn{min-width:44px;width:44px;height:44px;padding:0;font-size:18px}.vnTextbox{bottom:10px;width:calc(100vw - 18px)}.vnDialogue{min-height:118px;max-height:32dvh;overflow:auto;padding:17px}.typeText{font-size:16px}.vnImageStage img{width:100%;height:100%;object-fit:contain}.panel{padding:16px}.panel h2{font-size:26px}.grid{grid-template-columns:1fr}.profileOverview{grid-template-columns:1fr !important}.profileIllustration{width:100%;max-width:none}.profileIllustration img{min-height:auto;max-height:none;height:auto}.profileDetails{flex-direction:column}.statusCards{grid-template-columns:1fr}.profileMeta{grid-template-columns:1fr}}
@media(max-width:850px){.side{padding:4px 7px;gap:4px}.sideHeader{display:flex;align-items:center;gap:8px;min-width:0}.relBadge{flex:0 0 auto;min-width:0}.relBadgeTop{gap:5px;font-size:9px}.relLvLabel{font-size:11px}.relLvName{font-size:9px}.relProgressTrack{height:3px;margin-top:2px}.statsBox{flex:1;min-width:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px 8px;padding:4px 6px;border-radius:8px;margin:0}.statBar{margin:0;min-width:0}.statBar div{font-size:8px;line-height:1.1;gap:2px}.statBar i{height:3px;margin-top:2px}.nav{gap:5px;padding-bottom:1px}.nav button{padding:7px 9px;border-radius:10px;font-size:11px;line-height:1;min-height:30px}.topBar{padding:6px 7px}.topBar button{min-width:auto;padding:7px 10px;font-size:12px;border-radius:13px}.chatArea{padding-top:8px}}
.app.theme-pure .inputBar{background:linear-gradient(180deg,#fff5f6 0%,#fdecef 100%);border-top:1px solid rgba(234,177,191,.45);box-shadow:0 -10px 28px rgba(214,148,166,.12)}.app.theme-pure .inputBar input{background:linear-gradient(180deg,#fffefe 0%,#fff8fa 100%);border:1px solid #efc6d0;color:#6b3f49;box-shadow:0 8px 18px rgba(231,175,190,.12),inset 0 1px 0 rgba(255,255,255,.92)}.app.theme-pure .inputBar input::placeholder{color:#c2919b}.app.theme-pure .inputBar input:focus{border-color:#e29bad;box-shadow:0 0 0 3px rgba(235,170,183,.22),0 10px 22px rgba(214,148,166,.16)}.app.theme-pure .inputBar button{background:linear-gradient(135deg,#f1aab9,#d97f96);color:#fff;border:1px solid rgba(255,255,255,.28);box-shadow:0 10px 22px rgba(213,125,149,.22)}.app.theme-pure .inputBar button:hover{background:linear-gradient(135deg,#f5b7c4,#e18ea2)}
.app.theme-obsession .inputBar{background:linear-gradient(180deg,#26171a 0%,#190f12 100%);border-top:1px solid rgba(150,73,86,.32);box-shadow:0 -12px 30px rgba(0,0,0,.34)}.app.theme-obsession .inputBar input{background:linear-gradient(180deg,#fff7f5 0%,#f4e6e4 100%);border:1px solid #6e434a;color:#291517;box-shadow:inset 0 1px 0 rgba(255,255,255,.68),0 10px 20px rgba(0,0,0,.12)}.app.theme-obsession .inputBar input::placeholder{color:#8d6e73}.app.theme-obsession .inputBar input:focus{border-color:#9c5965;box-shadow:0 0 0 3px rgba(156,89,101,.22),0 10px 22px rgba(0,0,0,.2)}.app.theme-obsession .inputBar button{background:linear-gradient(135deg,#7d3744,#35171d);color:#fff7f6;border:1px solid rgba(255,181,181,.12);box-shadow:0 12px 26px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.05)}.app.theme-obsession .inputBar button:hover{background:linear-gradient(135deg,#944858,#461f29)}
.missionTarget{position:absolute;transform:translate(-50%,-50%);border:0;border-radius:50%;background:rgba(255,220,120,.18);backdrop-filter:blur(2px);color:white;font-size:clamp(18px,3vw,28px);display:grid;place-items:center;cursor:pointer;animation:missionPulse 1.6s ease-in-out infinite;box-shadow:0 0 0 0 rgba(255,210,80,.6);transition:transform .12s ease,background .12s ease;z-index:4}.missionTarget:hover{background:rgba(255,220,120,.36);transform:translate(-50%,-50%) scale(1.12)}
@keyframes missionPulse{0%{box-shadow:0 0 0 0 rgba(255,210,80,.6)}60%{box-shadow:0 0 0 14px rgba(255,210,80,0)}100%{box-shadow:0 0 0 0 rgba(255,210,80,0)}}
.missionPromptBox{margin-top:12px;padding:14px 18px;border-radius:10px;background:rgba(255,215,100,.10);border:1px solid rgba(255,215,100,.28);display:grid;gap:8px}.missionPromptText{margin:0;color:#f0d580;font-size:15px;font-weight:700;text-align:center;letter-spacing:.02em}.missionResultMsg{margin:0;text-align:center;color:#ffe98a;font-size:16px;font-weight:900;animation:missionResultIn .28s ease}
@keyframes missionResultIn{0%{opacity:0;transform:translateY(6px) scale(.96)}100%{opacity:1;transform:translateY(0) scale(1)}}
.endingCardOverlay{position:fixed;inset:0;z-index:99998;overflow:hidden;cursor:pointer;animation:endingOverlayIn .9s ease forwards}
.endingCardBg{position:absolute;inset:-6%;background-size:cover;background-position:center top;transform-origin:center center;animation:kenBurns 6s ease-out forwards;filter:brightness(.72) saturate(1.1)}
.endingCardVignette{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(0,0,0,.12) 0%,rgba(0,0,0,.78) 100%)}
.endingCardContent{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:40px;text-align:center;pointer-events:none}
.endingCardEyebrow{font-size:11px;letter-spacing:.42em;color:#c8a86a;font-weight:900;text-transform:uppercase;opacity:0;animation:endingFadeUp .7s ease .5s forwards}
.endingCardNum{margin:0;font-size:15px;letter-spacing:.18em;color:#e8c87a;font-weight:700;opacity:0;animation:endingFadeUp .7s ease .9s forwards}
.endingCardTitle{margin:0;font-size:clamp(28px,4.5vw,52px);font-weight:1000;color:#fff;line-height:1.2;letter-spacing:.04em;text-shadow:0 4px 24px rgba(0,0,0,.6);opacity:0;animation:endingFadeUp .8s ease 1.3s forwards}
.endingCardSub{margin:0;font-size:clamp(13px,1.8vw,17px);color:rgba(255,255,255,.72);font-weight:500;line-height:1.6;max-width:520px;opacity:0;animation:endingFadeUp .7s ease 1.9s forwards}
.endingCardQuote{margin:28px 0 0;padding:0 24px;border-left:2px solid rgba(200,168,106,.5);font-size:13px;color:rgba(255,255,255,.48);font-style:italic;line-height:1.7;text-align:left;max-width:420px;opacity:0;animation:endingFadeUp .6s ease 2.5s forwards}
.endingCardSkip{position:absolute;bottom:28px;right:28px;border:1px solid rgba(255,255,255,.24);border-radius:8px;background:rgba(0,0,0,.44);color:rgba(255,255,255,.6);font-size:12px;letter-spacing:.12em;padding:9px 16px;font-weight:700;cursor:pointer;opacity:0;animation:endingFadeUp .5s ease 1s forwards;transition:color .2s,border-color .2s}.endingCardSkip:hover{color:white;border-color:rgba(255,255,255,.6)}
@keyframes endingOverlayIn{0%{opacity:0}100%{opacity:1}}
@keyframes kenBurns{0%{transform:scale(1) translate(0,0)}100%{transform:scale(1.10) translate(-1.5%,1%)}}
@keyframes endingFadeUp{0%{opacity:0;transform:translateY(18px)}100%{opacity:1;transform:translateY(0)}}
.relBadge{margin:10px 0 6px;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1)}.relBadgeTop{display:flex;align-items:center;gap:8px;margin-bottom:7px}.relLvLabel{font-size:13px;font-weight:1000;color:#f0c060;letter-spacing:.04em;flex:none}.relLvName{flex:1;font-size:12px;font-weight:700;color:#f0e6cc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.relLvNext{font-size:10px;color:rgba(255,255,255,.38);flex:none}.relProgressTrack{height:4px;border-radius:99px;background:rgba(255,255,255,.14);overflow:hidden}.relProgressFill{height:100%;border-radius:99px;background:linear-gradient(90deg,#e8993b,#f0c060);transition:width .6s cubic-bezier(.34,1.56,.64,1)}
.levelUpOverlay{position:fixed;inset:0;z-index:99997;display:grid;place-items:center;background:rgba(8,5,4,.62);backdrop-filter:blur(8px);animation:levelUpBgIn .4s ease forwards;cursor:pointer}
.levelUpCard{position:relative;width:min(380px,calc(100vw - 48px));padding:40px 36px 36px;border-radius:28px;background:linear-gradient(160deg,#1a1108 0%,#2a1d0e 50%,#0e0b07 100%);border:1px solid rgba(240,192,96,.28);box-shadow:0 0 0 1px rgba(240,192,96,.10) inset,0 32px 80px rgba(0,0,0,.6);text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px;animation:levelUpCardIn .5s cubic-bezier(.2,.8,.4,1) forwards}
.levelUpEyebrow{font-size:9px;letter-spacing:.38em;color:#c8a060;font-weight:900;text-transform:uppercase;opacity:0;animation:levelUpFadeUp .5s ease .1s forwards}
.levelUpNum{font-size:64px;font-weight:1000;line-height:1;color:#f0c060;letter-spacing:-.02em;text-shadow:0 0 40px rgba(240,192,96,.5);opacity:0;animation:levelUpPop .55s cubic-bezier(.34,1.56,.64,1) .3s forwards}
.levelUpName{font-size:22px;font-weight:900;color:#fff;letter-spacing:.06em;opacity:0;animation:levelUpFadeUp .5s ease .55s forwards}
.levelUpFlavor{margin:0;font-size:13px;color:rgba(255,255,255,.56);line-height:1.65;font-style:italic;max-width:280px;opacity:0;animation:levelUpFadeUp .5s ease .8s forwards}
.levelUpBar{width:100%;height:3px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden;margin-top:6px;opacity:0;animation:levelUpFadeUp .4s ease 1s forwards}.levelUpBarFill{height:100%;width:0;border-radius:99px;background:linear-gradient(90deg,#e8993b,#f0c060);animation:levelUpBarGrow 2.4s cubic-bezier(.4,0,.2,1) 1.1s forwards}
@keyframes levelUpBgIn{0%{opacity:0}100%{opacity:1}}
@keyframes levelUpCardIn{0%{opacity:0;transform:scale(.88) translateY(16px)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes levelUpPop{0%{opacity:0;transform:scale(.6)}70%{transform:scale(1.08)}100%{opacity:1;transform:scale(1)}}
@keyframes levelUpFadeUp{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}
@keyframes levelUpBarGrow{0%{width:0}100%{width:100%}}
.nav button.navDot{position:relative}.nav button.navDot::after{content:"";position:absolute;top:4px;right:4px;width:6px;height:6px;border-radius:50%;background:#f0c060;box-shadow:0 0 6px rgba(240,192,96,.8)}
.checkinStreakBanner{display:flex;align-items:center;justify-content:center;gap:10px;padding:20px 0 16px;border-bottom:1px solid #e8d2b6;margin-bottom:16px}
.checkinFlame{font-size:32px;animation:checkinFlameAnim 1.4s ease-in-out infinite alternate}
@keyframes checkinFlameAnim{0%{transform:scale(1) rotate(-4deg)}100%{transform:scale(1.12) rotate(4deg)}}
.checkinStreakNum{font-size:52px;font-weight:1000;color:#df842c;line-height:1;text-shadow:0 0 22px rgba(223,132,44,.18)}
.checkinStreakLabel{font-size:13px;color:#7b4f2f;font-weight:800;letter-spacing:.06em;align-self:flex-end;padding-bottom:8px}
.checkinCalendar{display:flex;gap:6px;justify-content:center;margin-bottom:18px}
.checkinDay{display:flex;flex-direction:column;align-items:center;gap:3px;width:38px;padding:8px 4px;border-radius:12px;background:#fff7ec;border:1px solid #e8d2b6;position:relative}
.checkinDay.checked{background:rgba(240,160,60,.16);border-color:rgba(240,160,60,.5)}
.checkinDay.today{border-color:rgba(240,160,60,.7);box-shadow:0 0 10px rgba(240,160,60,.22)}
.checkinDayName{font-size:9px;color:#8b7162;font-weight:800;letter-spacing:.04em}
.checkinDayNum{font-size:14px;font-weight:900;color:#2a1a14}
.checkinCheck{position:absolute;top:-6px;right:-6px;width:16px;height:16px;border-radius:50%;background:#df842c;color:#fff;font-size:9px;font-weight:900;display:grid;place-items:center}
.checkinRewardPreview{display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:16px;background:#fff7ec;border:1px solid #e8d2b6;margin-bottom:16px}
.checkinRewardEmoji{font-size:36px;flex:none}
.checkinRewardPreview b{display:block;font-size:13px;color:#7b4f2f;font-weight:800;margin-bottom:6px}
.checkinRewardStats{display:flex;flex-wrap:wrap;gap:5px}.checkinRewardStats .pos{font-size:12px;font-weight:800;padding:2px 9px;border-radius:99px;background:rgba(223,132,44,.16);color:#a85d18}.checkinRewardStats .neg{font-size:12px;font-weight:800;padding:2px 9px;border-radius:99px;background:rgba(200,80,80,.14);color:#a83a3a}
.checkinBtn{width:100%;padding:16px;border-radius:18px;background:linear-gradient(135deg,#e8993b,#f0c060);color:#1a0e00;font-size:16px;font-weight:1000;letter-spacing:.04em;border:none;cursor:pointer;margin-bottom:16px;transition:transform .15s,box-shadow .15s;box-shadow:0 4px 20px rgba(240,192,96,.3)}.checkinBtn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(240,192,96,.4)}.checkinBtn:active{transform:translateY(0)}
.checkinDoneMsg{text-align:center;padding:14px;border-radius:14px;background:rgba(240,160,60,.14);border:1px solid rgba(240,160,60,.36);color:#8a4a14;font-size:14px;font-weight:800;margin-bottom:16px}
.checkinCycleRow{display:flex;gap:6px;justify-content:center;padding-top:4px}
.checkinCycleDay{display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 6px;border-radius:10px;background:#fff7ec;border:1px solid #e8d2b6;min-width:36px;font-size:18px}.checkinCycleDay small{font-size:9px;color:#8b7162;font-weight:800}
.checkinCycleDay.current{background:rgba(240,160,60,.18);border-color:rgba(240,160,60,.6);box-shadow:0 0 10px rgba(240,160,60,.22)}
.checkinCycleDay.past{opacity:.55}
.checkInOverlay{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:rgba(8,5,4,.7);backdrop-filter:blur(10px);animation:levelUpBgIn .3s ease forwards;cursor:pointer}
.checkInCard{width:min(360px,calc(100vw - 48px));padding:44px 36px 40px;border-radius:28px;background:linear-gradient(160deg,#14100a 0%,#241a0c 55%,#0d0a07 100%);border:1px solid rgba(240,192,96,.3);box-shadow:0 0 0 1px rgba(240,192,96,.08) inset,0 32px 80px rgba(0,0,0,.65);text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;animation:levelUpCardIn .5s cubic-bezier(.2,.8,.4,1) forwards}
.checkInEyebrow{font-size:9px;letter-spacing:.4em;color:#c8a060;font-weight:900;text-transform:uppercase;opacity:0;animation:levelUpFadeUp .4s ease .05s forwards}
.checkInEmoji{font-size:60px;line-height:1;animation:levelUpPop .55s cubic-bezier(.34,1.56,.64,1) .2s both}
.checkInDay{font-size:20px;font-weight:900;color:#fff;letter-spacing:.04em;opacity:0;animation:levelUpFadeUp .4s ease .45s forwards}
.checkInStreakBadge{font-size:13px;font-weight:800;color:#f0c060;background:rgba(240,192,96,.12);border:1px solid rgba(240,192,96,.25);padding:4px 14px;border-radius:99px;opacity:0;animation:levelUpFadeUp .4s ease .6s forwards}
.checkInComment{margin:4px 0 0;font-size:14px;color:rgba(255,255,255,.6);font-style:italic;line-height:1.7;max-width:270px;opacity:0;animation:levelUpFadeUp .4s ease .8s forwards}
.checkInStats{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;opacity:0;animation:levelUpFadeUp .4s ease 1s forwards}.checkInStats .pos{font-size:13px;font-weight:800;padding:3px 12px;border-radius:99px;background:rgba(240,192,96,.15);color:#f0c060}.checkInStats .neg{font-size:13px;font-weight:800;padding:3px 12px;border-radius:99px;background:rgba(200,80,80,.15);color:#e07070}
.photoPreviewBar{display:flex;align-items:center;gap:10px;padding:8px 14px 0;flex:none;background:rgba(0,0,0,.04)}
.photoPreviewThumb{width:54px;height:54px;border-radius:12px;object-fit:cover;border:2px solid rgba(240,192,96,.5);flex:none}
.photoPreviewCancel{width:24px;height:24px;border-radius:50%;background:#c63636;color:white;border:none;font-size:12px;cursor:pointer;font-weight:900;display:grid;place-items:center;flex:none}
.photoPreviewHint{font-size:11px;color:rgba(0,0,0,.4);font-weight:600}
.bubbleImg{display:block;width:min(240px,68vw);max-height:280px;object-fit:cover;border-radius:16px;margin-bottom:4px;cursor:pointer;transition:transform .15s ease}
.bubbleImg.bubbleImgExpand{width:min(380px,90vw);max-height:none}
.giftTabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px}.giftTabs button{padding:6px 14px;border-radius:99px;background:#fff7ec;border:1px solid #e8d2b6;color:#7b4f2f;font-size:12px;font-weight:800;cursor:pointer;transition:all .18s}.giftTabs button:hover{background:#fbeed8}.giftTabs button.active{background:#df842c;border-color:#c66f1f;color:#fff;box-shadow:0 4px 12px rgba(223,132,44,.28)}
.giftGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:12px}
.giftCard{display:flex;flex-direction:column;align-items:center;gap:6px;padding:18px 12px 14px;border-radius:18px;background:#fff7ec;border:1px solid #e8d2b6;cursor:pointer;transition:all .18s;text-align:center;position:relative}.giftCard:hover:not(:disabled){background:#fff1de;border-color:rgba(223,132,44,.45);transform:translateY(-2px);box-shadow:0 8px 18px rgba(120,70,30,.1)}.giftCard:disabled{opacity:.55;cursor:not-allowed}
.giftEmoji{font-size:32px;line-height:1}.giftName{font-size:13px;font-weight:900;color:#2a1a14}.giftDesc{font-size:11px;color:#6b4f3d;line-height:1.5}
.giftCooldown{background:#f6ebdd!important;border-color:#e0d0bb!important}.giftCoolLabel{font-size:10px;font-weight:800;color:#8b7162;letter-spacing:.04em}
.giftLocked{background:#f3e9da!important;border:1px dashed #d6c2a8!important;opacity:.7}.giftLocked .giftName,.giftLocked .giftDesc{color:#8b7162}.giftLockHint{font-size:10px;font-weight:800;color:#a26a2c;letter-spacing:.04em;background:rgba(223,132,44,.14);padding:3px 9px;border-radius:99px}
.giftStatPreview{display:flex;flex-wrap:wrap;justify-content:center;gap:4px;margin-top:2px}.giftStatPreview span{font-size:10px;font-weight:800;padding:2px 7px;border-radius:99px}.giftStatPreview .pos{background:rgba(223,132,44,.16);color:#a85d18}.giftStatPreview .neg{background:rgba(200,80,80,.14);color:#a83a3a}
.giftReactionOverlay{position:fixed;inset:0;z-index:99998;display:grid;place-items:center;background:rgba(8,5,4,.65);backdrop-filter:blur(8px);animation:levelUpBgIn .3s ease forwards;cursor:pointer}
.giftReactionCard{width:min(340px,calc(100vw - 48px));padding:36px 32px 32px;border-radius:24px;background:linear-gradient(160deg,#12100a 0%,#1e1710 60%,#0c0a07 100%);border:1px solid rgba(240,192,96,.22);box-shadow:0 24px 64px rgba(0,0,0,.6);text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px;animation:levelUpCardIn .45s cubic-bezier(.2,.8,.4,1) forwards}
.giftReactionEmoji{font-size:48px;line-height:1;animation:levelUpPop .5s cubic-bezier(.34,1.56,.64,1) .1s both}
.giftReactionText{margin:0;font-size:15px;color:#f0e6cc;line-height:1.7;font-style:italic;white-space:pre-wrap;opacity:0;animation:levelUpFadeUp .5s ease .3s forwards}
.giftReactionStats{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;opacity:0;animation:levelUpFadeUp .4s ease .7s forwards}.giftReactionStats .pos{font-size:12px;font-weight:800;padding:3px 10px;border-radius:99px;background:rgba(240,192,96,.15);color:#f0c060}.giftReactionStats .neg{font-size:12px;font-weight:800;padding:3px 10px;border-radius:99px;background:rgba(200,80,80,.15);color:#e07070}
.wardrobeHint{margin:0 0 18px;font-size:13px;color:#6b4f3d;font-weight:700}
.wardrobeGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px}
.wardrobeCard{display:flex;flex-direction:column;align-items:center;gap:0;border-radius:20px;background:#fff7ec;border:1px solid #e8d2b6;cursor:pointer;transition:all .18s;text-align:center;position:relative;overflow:hidden;padding:0 0 14px}
.wardrobeCard:hover:not(:disabled){background:rgba(240,192,96,.1);border-color:rgba(240,192,96,.4);transform:translateY(-2px)}
.wardrobeCard.equipped{background:rgba(240,192,96,.14);border-color:rgba(240,192,96,.6);box-shadow:0 0 18px rgba(240,192,96,.18)}
.wardrobeCard.locked{opacity:.46;cursor:not-allowed}
.wardrobeCard:disabled{cursor:not-allowed}
.wardrobePreview{width:100%;aspect-ratio:3/4;background:#fbf0de;border-radius:16px 16px 0 0;overflow:hidden;display:grid;place-items:center;margin-bottom:10px}
.wardrobePreview img{width:100%;height:100%;object-fit:cover;object-position:top center}
.wardrobeLockIcon{font-size:28px;opacity:.5}
.wardrobeInfo{display:flex;flex-direction:column;align-items:center;gap:4px;padding:0 10px}
.wardrobeEmoji{font-size:20px;line-height:1}
.wardrobeName{font-size:13px;font-weight:900;color:#2a1a14;line-height:1.3}
.wardrobeDesc{font-size:11px;color:#6b4f3d;line-height:1.5;display:block}
.wardrobeEquippedBadge{position:absolute;top:8px;right:8px;background:#f0c060;color:#1a0e00;font-size:9px;font-weight:900;letter-spacing:.06em;padding:3px 8px;border-radius:99px}
.diaryHint{margin:0 0 20px;font-size:13px;color:#6b4f3d;font-weight:700}
/* ─ 관리자 모드 ─ */
.adminBadge{font-size:9px;font-weight:900;letter-spacing:.08em;background:rgba(255,220,80,.18);color:#c8a020;border:1px solid rgba(200,160,30,.35);border-radius:99px;padding:2px 8px;margin-left:6px;vertical-align:middle}
.adminNavBtn{background:linear-gradient(135deg,#4a3800,#2a2000)!important;border:1px solid rgba(255,210,60,.22)!important;color:#f0c840!important}
.adminNavBtn:hover,.adminNavBtn.active{background:linear-gradient(135deg,#7a6000,#4a3a00)!important}
.adminOverlay{position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.72);backdrop-filter:blur(10px);display:grid;place-items:center;padding:24px}
.adminModal{width:min(340px,100%);background:#1a1400;border:1px solid rgba(255,210,60,.3);border-radius:24px;padding:28px 24px;display:grid;gap:16px;box-shadow:0 28px 70px rgba(0,0,0,.6);animation:diaryModalIn .2s ease}
.adminModalTitle{margin:0;font-size:18px;font-weight:900;color:#f0c840;text-align:center}
.adminPwInput{border:1px solid rgba(255,210,60,.35);border-radius:14px;background:rgba(255,255,255,.07);color:white;padding:13px 16px;font-size:16px;outline:none;width:100%;box-sizing:border-box}
.adminPwInput:focus{border-color:rgba(255,210,60,.7);box-shadow:0 0 0 3px rgba(255,200,40,.12)}
.adminModalBtns{display:flex;gap:10px}
.adminCancelBtn{flex:1;border:1px solid rgba(255,255,255,.14);border-radius:14px;background:rgba(255,255,255,.07);color:rgba(255,255,255,.6);padding:12px;font-weight:900;cursor:pointer}
.adminConfirmBtn{flex:2;border:0;border-radius:14px;background:linear-gradient(135deg,#c8a020,#7a6000);color:white;padding:12px;font-weight:900;cursor:pointer}
.adminPanel{display:grid;gap:28px}
.adminSection{display:grid;gap:12px}
.adminSectionTitle{margin:0;font-size:14px;font-weight:900;letter-spacing:.06em;color:#7b4f2f;text-transform:uppercase}
.adminStatRows{display:grid;gap:10px}
.adminStatRow{display:grid;grid-template-columns:60px 1fr 50px auto;gap:8px;align-items:center}
.adminStatLabel{font-size:13px;font-weight:900;color:#4a2d1a}
.adminStatVal{font-size:14px;font-weight:900;color:#c87830;text-align:right}
.adminStatBtns{display:flex;gap:4px}
.adminStatBtns button{border:1px solid #ddd0c5;border-radius:8px;background:#fff7ef;color:#4a2d1a;padding:4px 8px;font-size:11px;font-weight:900;cursor:pointer;white-space:nowrap}
.adminRouteBtns{display:flex;gap:10px;flex-wrap:wrap}
.adminRouteBtn{border:1px solid #ddd0c5;border-radius:14px;background:#fff7ef;color:#4a2d1a;padding:12px 20px;font-weight:900;cursor:pointer;transition:all .15s}
.adminRouteBtn.active{background:#df842c;border-color:#c06820;color:white}
.adminLogoutBtn{border:1px solid rgba(200,60,60,.35);border-radius:14px;background:rgba(200,60,60,.08);color:#c84040;padding:14px 24px;font-weight:900;cursor:pointer;width:100%;font-size:15px}
/* ─ 테마 전환 페이드인 ─ */
.app.theme-pure{animation:themeFadeIn .7s ease}
.app.theme-obsession{animation:themeFadeIn .7s ease}
@keyframes themeFadeIn{0%{opacity:.55}100%{opacity:1}}
/* ─ 일기 ─ */
.diaryGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px}
.diaryCard{display:flex;flex-direction:column;align-items:flex-start;gap:5px;border-radius:20px;background:#fff7ec;border:1px solid #e8d2b6;cursor:pointer;transition:all .18s;text-align:left;padding:18px 16px 16px;position:relative;overflow:hidden}
.diaryCard:hover:not(:disabled){background:rgba(255,230,180,.1);border-color:rgba(255,220,140,.38);transform:translateY(-2px)}
.diaryCard.locked{opacity:.42;cursor:not-allowed}
.diaryCard.diaryCard-pure{background:linear-gradient(135deg,#fff5f8,#fdedf2);border-color:#f0c4d4}
.diaryCard.diaryCard-pure:hover:not(:disabled){background:linear-gradient(135deg,#ffeef4,#fce0ea);border-color:#e8a8be;transform:translateY(-2px)}
.diaryCard.diaryCard-obsession{background:linear-gradient(135deg,#1e1214,#2a1418);border-color:rgba(180,60,70,.32);color:#f5eae8}
.diaryCard.diaryCard-obsession .diaryCardLabel{color:#e08090}
.diaryCard.diaryCard-obsession .diaryCardTitle{color:#f5eae8}
.diaryCard.diaryCard-obsession .diaryCardPreview{color:#d4b0b4}
.diaryCard.diaryCard-obsession:hover:not(:disabled){background:linear-gradient(135deg,#2d1a1e,#3a1e24);border-color:rgba(200,80,90,.5);transform:translateY(-2px)}
.diaryCardEmoji{font-size:22px;line-height:1;margin-bottom:2px}
.diaryCardLabel{font-size:10px;font-weight:900;letter-spacing:.1em;color:#a8825a;text-transform:uppercase}
.diaryCardTitle{font-size:15px;font-weight:900;color:#2a1a14;display:block;line-height:1.3}
.diaryCardPreview{font-size:12px;color:#7a6253;line-height:1.5;margin-top:2px;display:block}
.diaryOverlay{position:fixed;inset:0;z-index:9999;background:rgba(8,4,4,.76);backdrop-filter:blur(10px);display:grid;place-items:center;padding:24px}
.diaryModal{width:min(440px,100%);background:#1a1210;border:1px solid rgba(255,220,150,.2);border-radius:28px;padding:32px 28px;display:grid;gap:20px;box-shadow:0 32px 80px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.04) inset;animation:diaryModalIn .22s cubic-bezier(.2,.8,.4,1)}
.diaryModal.diaryModal-pure{background:linear-gradient(160deg,#fff8fb,#fdeef4);border:1px solid rgba(220,145,170,.35);box-shadow:0 28px 70px rgba(180,100,130,.14),0 0 0 1px rgba(255,255,255,.6) inset}
.diaryModal.diaryModal-pure .diaryModalLabel{color:rgba(190,100,140,.75)}
.diaryModal.diaryModal-pure .diaryModalTitle{color:#3a1e2a}
.diaryModal.diaryModal-pure .diaryModalText{color:#4a2535;border-left-color:rgba(220,130,160,.45)}
.diaryModal.diaryModal-pure .diaryModalClose{color:rgba(80,35,55,.7);border-color:rgba(200,130,155,.3);background:rgba(255,240,245,.5)}
.diaryModal.diaryModal-pure .diaryModalClose:hover{background:rgba(255,220,235,.8)}
.diaryModal.diaryModal-obsession .diaryModalText{border-left-color:rgba(200,60,70,.5)}
@keyframes diaryModalIn{0%{opacity:0;transform:translateY(16px) scale(.96)}100%{opacity:1;transform:translateY(0) scale(1)}}
.diaryModalHeader{display:flex;align-items:center;gap:14px}
.diaryModalEmoji{font-size:36px;flex:none}
.diaryModalLabel{font-size:11px;font-weight:900;letter-spacing:.12em;color:rgba(255,220,140,.6);text-transform:uppercase;display:block;margin-bottom:4px}
.diaryModalTitle{font-size:22px;font-weight:900;color:rgba(255,255,255,.92);margin:0}
.diaryModalText{font-size:16px;line-height:2;color:rgba(255,245,235,.78);white-space:pre-line;border-left:2px solid rgba(255,200,100,.28);padding-left:18px;margin:0;font-style:italic}
.diaryModalObsTag{font-size:11px;font-weight:900;color:#e07070;background:rgba(200,60,60,.14);border:1px solid rgba(200,60,60,.28);border-radius:99px;padding:5px 12px;width:fit-content}
.diaryModalObsTag.diaryModalPureTag{color:#c0607a;background:rgba(210,120,150,.12);border-color:rgba(210,120,150,.3)}
.diaryModalClose{border:1px solid rgba(255,255,255,.14);border-radius:14px;background:rgba(255,255,255,.07);color:rgba(255,255,255,.7);padding:13px 24px;font-weight:900;cursor:pointer;font-size:14px;transition:background .15s}
.diaryModalClose:hover{background:rgba(255,255,255,.14)}
.achHeader{margin-bottom:18px}
.achProgress{background:#fff7ec;border:1px solid #e8d2b6;border-radius:18px;padding:14px 18px;display:grid;gap:6px}
.achProgressNum{font-size:22px;font-weight:900;color:#a85d18}
.achProgressLabel{font-size:11px;font-weight:800;letter-spacing:.1em;color:#7b4f2f;text-transform:uppercase}
.achProgressBar{height:6px;background:rgba(40,25,20,.08);border-radius:99px;overflow:hidden;margin-top:4px}
.achProgressFill{height:100%;background:linear-gradient(90deg,#e58a2f,#f0c060);transition:width .35s ease}
.achTabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.achTab{border:1px solid #e8d2b6;background:#fff7ec;color:#7b4f2f;font-size:12px;font-weight:900;padding:7px 14px;border-radius:99px;cursor:pointer;transition:all .15s}
.achTab:hover{background:#fbeed8;color:#5a3928}
.achTab.active{background:#df842c;color:white;border-color:#df842c}
.achGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.achCard{display:flex;align-items:center;gap:14px;border-radius:18px;background:#fff7ec;border:1px solid #e8d2b6;padding:14px 16px;position:relative;opacity:.62;transition:all .18s}
.achCard.unlocked{opacity:1;background:rgba(240,192,96,.16);border-color:rgba(240,160,60,.5);box-shadow:0 8px 22px rgba(240,160,60,.1)}
.achCard.hidden{opacity:.42}
.achEmoji{font-size:30px;line-height:1;flex:none;width:48px;height:48px;display:grid;place-items:center;border-radius:14px;background:#fbf0de}
.achCard.unlocked .achEmoji{background:rgba(240,192,96,.32)}
.achInfo{display:grid;gap:3px;min-width:0}
.achTitle{font-size:14px;font-weight:900;color:#2a1a14;line-height:1.3}
.achDesc{font-size:11px;color:#6b4f3d;line-height:1.5}
.achBadge{position:absolute;top:8px;right:8px;background:#f0c060;color:#1a0e00;font-size:9px;font-weight:900;letter-spacing:.06em;padding:3px 8px;border-radius:99px}
.achToast{position:fixed;top:84px;right:24px;z-index:9999;display:flex;align-items:center;gap:14px;background:rgba(14,9,8,.94);border:1px solid rgba(240,192,96,.4);border-radius:20px;padding:14px 20px 14px 16px;color:white;backdrop-filter:blur(14px);box-shadow:0 20px 44px rgba(0,0,0,.42),0 0 0 1px rgba(255,255,255,.04) inset;min-width:240px;max-width:340px;animation:cgToastIn .32s cubic-bezier(.2,.8,.4,1) forwards;pointer-events:none}
.achToastIcon{font-size:30px;flex:none;filter:drop-shadow(0 0 8px rgba(240,192,96,.4))}
.achToast b{display:block;font-size:10px;letter-spacing:.12em;color:#f0c060;text-transform:uppercase;margin-bottom:3px}
.achToast span{display:block;font-size:15px;font-weight:800;color:#fff8f0;margin-bottom:3px}
.achToast small{font-size:11px;color:#a09080;line-height:1.4}
.mapHint{margin:0 0 16px;font-size:13px;color:#6b4f3d;font-weight:700}
.mapLegend{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:24px;padding:12px 16px;background:#fff7ec;border:1px solid #e8d2b6;border-radius:14px}
.mapLegendItem{font-size:12px;color:#5a3928;font-weight:700;display:flex;align-items:center;gap:6px}
.mapLegendItem b{font-size:14px;color:#f0c060}
.mapPath{display:flex;flex-direction:column;align-items:center;gap:0;max-width:560px;margin:0 auto}
.mapStep{display:flex;flex-direction:column;align-items:center;width:100%}
.mapNode{display:grid;grid-template-columns:48px 1fr;grid-template-rows:auto auto;gap:2px 14px;align-items:center;width:100%;padding:16px 18px;border-radius:18px;background:#fff7ec;border:1px solid #e8d2b6;cursor:pointer;text-align:left;transition:all .2s;position:relative}
.mapNode:hover:not(:disabled){background:rgba(240,192,96,.1);border-color:rgba(240,192,96,.4);transform:translateX(4px)}
.mapNode:disabled{cursor:not-allowed;opacity:.5}
.mapNodeIcon{grid-row:1/3;font-size:22px;font-weight:900;width:48px;height:48px;display:grid;place-items:center;border-radius:14px;background:#fbf0de;color:#7b4f2f}
.mapNodeNum{font-size:10px;font-weight:900;letter-spacing:.12em;color:#a8825a;text-transform:uppercase}
.mapNodeTitle{font-size:16px;font-weight:900;color:#2a1a14;line-height:1.3}
.mapNodeSubtitle{grid-column:2;font-size:12px;color:#6b4f3d;line-height:1.5;margin-top:2px}
.mapStatus-cleared{background:rgba(120,180,120,.14);border-color:rgba(120,180,120,.38)}
.mapStatus-cleared .mapNodeIcon{background:rgba(120,180,120,.26);color:#3a6a3a}
.mapStatus-current{background:rgba(240,160,60,.18);border-color:rgba(240,160,60,.6);box-shadow:0 0 0 2px rgba(240,160,60,.18),0 8px 22px rgba(240,160,60,.18)}
.mapStatus-current .mapNodeIcon{background:rgba(240,160,60,.32);color:#a85d18;animation:mapStarPulse 1.6s ease-in-out infinite}
.mapStatus-available{background:#fff1de}
.mapStatus-available .mapNodeIcon{color:#5a3928}
.mapStatus-locked{opacity:.7}
.mapStatus-locked .mapNodeTitle{color:#9b8478}
.mapStatus-locked .mapNodeSubtitle{color:#a89884}
@keyframes mapStarPulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(240,192,96,.4)}50%{transform:scale(1.06);box-shadow:0 0 0 6px rgba(240,192,96,0)}}
.mapConnector{width:2px;height:22px;background:linear-gradient(180deg,rgba(240,192,96,.4),rgba(240,192,96,.12));margin:6px 0}
.mapConnector.branch{height:18px}
.mapBranchSplit{width:100%;display:flex;flex-direction:column;align-items:center;margin:8px 0 4px;position:relative}
.mapBranchLine{width:80%;height:1px;background:linear-gradient(90deg,transparent,rgba(240,192,96,.4),transparent)}
.mapBranchLabel{font-size:10px;font-weight:900;letter-spacing:.18em;color:#a85d18;text-transform:uppercase;margin-top:8px;background:#eee7dc;padding:0 12px}
.mapBranchRow{display:grid;grid-template-columns:1fr 1fr;gap:14px;width:100%;margin-top:8px}
.mapBranchCol{display:flex;flex-direction:column;align-items:center;gap:0;padding:14px 10px;border-radius:18px;background:#fff7ec;border:1px dashed #d6c2a8}
.mapBranchCol.pure{border-color:rgba(214,140,170,.42);background:rgba(252,232,238,.7)}
.mapBranchCol.obsession{border-color:rgba(180,90,100,.42);background:rgba(255,225,228,.6)}
.mapBranchHeader{font-size:12px;font-weight:900;letter-spacing:.06em;margin-bottom:12px;color:#5a3928}
.mapBranchCol.pure .mapBranchHeader{color:#a35075}
.mapBranchCol.obsession .mapBranchHeader{color:#a83a4a}
.mapBranchCol .mapNode{padding:12px 14px}
.mapBranchCol .mapNodeIcon{width:40px;height:40px;font-size:18px}
.mapBranchCol .mapNodeTitle{font-size:14px}
.mapBranchCol .mapNodeSubtitle{font-size:11px}
@media (max-width:720px){.mapBranchRow{grid-template-columns:1fr}}
.miniMapHint{margin:0 0 16px;font-size:13px;color:#6b4f3d;font-weight:700}
.miniMapStage{position:relative;width:100%;aspect-ratio:4/3;border-radius:18px;overflow:hidden;background:linear-gradient(135deg,#f3e6cf,#e9d5b6);border:1px solid #d6c2a8;box-shadow:inset 0 1px 0 rgba(255,255,255,.5);margin-bottom:18px}
.miniMapImage{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.92}
.miniMapMarker{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:3px;padding:0;background:none;border:none;cursor:pointer;z-index:2}
.miniMapMarker:disabled{cursor:not-allowed}
.miniMapMarkerIcon{width:38px;height:38px;display:grid;place-items:center;border-radius:50%;background:#fff;border:2px solid #df842c;box-shadow:0 6px 14px rgba(120,60,20,.32),0 0 0 4px rgba(255,255,255,.4);font-size:18px;line-height:1;transition:transform .15s,box-shadow .15s}
.miniMapMarker:hover:not(:disabled) .miniMapMarkerIcon{transform:scale(1.14);box-shadow:0 10px 22px rgba(120,60,20,.42),0 0 0 4px rgba(240,160,60,.5)}
.miniMapMarker.locked .miniMapMarkerIcon{background:rgba(180,160,140,.85);border-color:#9b8478;box-shadow:0 4px 10px rgba(60,40,30,.22)}
.miniMapMarker.visited .miniMapMarkerIcon{background:#df842c;color:#fff;border-color:#a85d18}
.miniMapMarker:not(.locked):not(.visited) .miniMapMarkerIcon{animation:miniMapPulse 1.8s ease-in-out infinite}
@keyframes miniMapPulse{0%,100%{box-shadow:0 6px 14px rgba(120,60,20,.32),0 0 0 4px rgba(255,255,255,.4),0 0 0 0 rgba(240,160,60,.5)}50%{box-shadow:0 6px 14px rgba(120,60,20,.32),0 0 0 4px rgba(255,255,255,.4),0 0 0 12px rgba(240,160,60,0)}}
.miniMapMarkerLabel{font-size:10px;font-weight:900;color:#2a1a14;background:rgba(255,247,236,.94);padding:2px 8px;border-radius:99px;border:1px solid #d6c2a8;white-space:nowrap;letter-spacing:.02em}
.miniMapMarker.locked .miniMapMarkerLabel{color:#8b7162}
.miniMapList{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}
.miniMapItem{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:16px;background:#fff7ec;border:1px solid #e8d2b6;cursor:pointer;text-align:left;transition:all .15s;position:relative}
.miniMapItem:hover:not(:disabled){background:#fff1de;border-color:rgba(223,132,44,.45);transform:translateX(3px)}
.miniMapItem:disabled{opacity:.6;cursor:not-allowed;background:#f3e9da;border-style:dashed}
.miniMapItemIcon{font-size:24px;width:42px;height:42px;display:grid;place-items:center;border-radius:12px;background:#fbf0de;flex:none}
.miniMapItem b{display:block;font-size:14px;color:#2a1a14;font-weight:900;margin-bottom:2px}
.miniMapItem small{font-size:11px;color:#6b4f3d;line-height:1.5}
.miniMapItem.locked b{color:#8b7162}
.miniMapItem.locked small{color:#a89884}
.miniMapVisitedBadge{position:absolute;top:8px;right:10px;background:#df842c;color:#fff;font-size:9px;font-weight:900;letter-spacing:.06em;padding:2px 8px;border-radius:99px}
.miniMapMarker.dark .miniMapMarkerIcon{background:#1a0c08;color:#ffb098;border-color:#8c2a30;box-shadow:0 6px 14px rgba(60,8,16,.45),0 0 0 4px rgba(255,255,255,.3),0 0 14px rgba(160,40,55,.3)}
.miniMapMarker.dark:not(.locked):not(.visited) .miniMapMarkerIcon{animation:miniMapPulseDark 1.6s ease-in-out infinite}
@keyframes miniMapPulseDark{0%,100%{box-shadow:0 6px 14px rgba(60,8,16,.45),0 0 0 4px rgba(255,255,255,.3),0 0 0 0 rgba(180,40,60,.55)}50%{box-shadow:0 6px 14px rgba(60,8,16,.45),0 0 0 4px rgba(255,255,255,.3),0 0 0 14px rgba(180,40,60,0)}}
.miniMapMarker.dark .miniMapMarkerLabel{background:rgba(38,18,18,.94);color:#ffb098;border-color:#7a2028}
.miniMapItem.dark{background:linear-gradient(180deg,#fff7ec 0%,#f8e4dc 100%);border-color:#c66070}
.miniMapItem.dark .miniMapItemIcon{background:#1a0c08;color:#ffb098}
.miniMapItem.dark b{color:#7a2028}
/* ─ 지도 위 캐릭터 이동 ─ */
.miniMapCharacter{position:absolute;width:52px;height:52px;transform:translate(-50%,-100%);z-index:10;pointer-events:none;transition:left 1.15s cubic-bezier(.4,0,.2,1),top 1.15s cubic-bezier(.4,0,.2,1)}
.miniMapCharacter img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 4px 10px rgba(80,30,10,.5))}
.miniMapCharacter.moving{animation:mapCharWalk .38s ease-in-out infinite}
.miniMapCharacter.obsession img{filter:drop-shadow(0 0 14px rgba(200,40,60,.75)) brightness(.8)}
@keyframes mapCharWalk{0%,100%{transform:translate(-50%,-100%) rotate(-4deg) scaleX(.97)}50%{transform:translate(-50%,-110%) rotate(4deg) scaleX(1.03)}}
/* ─ 집착 루트 풀스크린 연출 ─ */
.mapObsessionFx{position:fixed;inset:0;z-index:600;background:radial-gradient(ellipse at 50% 40%,rgba(50,5,15,.55) 0%,rgba(5,1,3,.97) 100%);display:flex;align-items:center;justify-content:center;pointer-events:none;animation:mapObsFade 2.2s ease-in-out forwards}
@keyframes mapObsFade{0%{opacity:0}18%{opacity:1}72%{opacity:1}100%{opacity:0}}
.mapObsFxText{color:rgba(215,75,90,.9);font-size:15px;font-weight:700;letter-spacing:.18em;text-align:center;line-height:2.2;white-space:pre;animation:mapObsText 2.2s ease-in-out forwards}
@keyframes mapObsText{0%,12%{opacity:0;transform:scale(.88) translateY(8px)}28%,68%{opacity:1;transform:scale(1) translateY(0)}100%{opacity:0;transform:scale(1.05)}}
/* ─ 방광 게이지 (사이드바) ─ */
.bladderGauge{margin:8px 0;padding:9px 12px;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1)}
.bladderGaugeTop{display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:900;color:#d0cbc6;margin-bottom:6px}
.bladderPct{font-size:11px;color:rgba(255,255,255,.45)}
.bladderTrack{height:6px;border-radius:99px;background:rgba(255,255,255,.18);overflow:hidden}
.bladderFill{height:100%;border-radius:99px;background:#4fc3f7;transition:width .8s cubic-bezier(.34,1.2,.64,1),background .6s ease}
.bladderGauge.warn .bladderFill{background:#ffeb3b}
.bladderGauge.urgent .bladderFill{background:#ff9800}
.bladderGauge.critical .bladderFill{background:#ef5350;box-shadow:0 0 8px rgba(239,83,80,.5)}
.bladderCry{display:block;font-size:10px;color:#ffb3b3;margin-top:5px;font-weight:900;animation:bladderCryPulse 1.1s ease-in-out infinite}
.bladderGauge.critical .bladderGaugeTop{animation:bladderCryPulse .8s ease-in-out infinite}
@keyframes bladderCryPulse{0%,100%{opacity:1}50%{opacity:.45}}
/* ─ 방광 팝업 ─ */
.bladderPopupOverlay{position:fixed;inset:0;z-index:99998;display:grid;place-items:center;background:rgba(6,4,3,.75);backdrop-filter:blur(10px);animation:levelUpBgIn .3s ease}
.bladderPopupCard{width:min(320px,calc(100vw - 48px));border-radius:24px;background:linear-gradient(160deg,#1a1310,#261a0f);border:1px solid rgba(255,200,140,.18);padding:32px 26px 26px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;animation:levelUpCardIn .4s cubic-bezier(.2,.8,.4,1)}
.bladderPopupIllust{display:flex;align-items:center;justify-content:center;width:100%;height:120px}
.bladderPopupIllust img{height:120px;width:auto;object-fit:contain;animation:bladderCryPulse .9s ease-in-out infinite;filter:drop-shadow(0 6px 14px rgba(79,195,247,.3))}
.bladderPopupMsg{margin:0;color:#f0e0cc;font-size:14px;font-weight:700;line-height:1.75}
.bladderPopupGaugeWrap{width:100%;height:8px;border-radius:99px;background:rgba(255,255,255,.14);overflow:hidden}
.bladderPopupGaugeFill{height:100%;border-radius:99px;background:linear-gradient(90deg,#4fc3f7,#ef5350);transition:width .5s}
.bladderPopupPct{font-size:11px;color:rgba(255,255,255,.38);font-weight:900}
.bladderPopupBtns{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;margin-top:4px}
.bladderAllow{padding:14px;border:0;border-radius:14px;background:linear-gradient(135deg,#4fc3f7,#0288d1);color:#fff;font-weight:900;font-size:14px;cursor:pointer;box-shadow:0 6px 18px rgba(79,195,247,.3)}
.bladderAllow:hover{filter:brightness(1.1)}
.bladderDeny{padding:14px;border:0;border-radius:14px;background:#2a1d14;color:#c0977a;font-weight:900;font-size:14px;cursor:pointer;border:1px solid rgba(255,200,140,.15)}
.bladderDeny:hover{background:#3a2d22}
/* ─ 방광 인풋 상태바 ─ */
.bladderStatusBar{display:flex;align-items:center;gap:8px;padding:5px 12px;background:rgba(30,14,8,.72);border-top:1px solid rgba(79,195,247,.18);transition:opacity .4s ease,border-color .6s ease}
.bladderStatusBar.bsb-empty{opacity:.28;border-top-color:rgba(255,255,255,.06)}
.bladderStatusBar.bsb-low{opacity:.48;border-top-color:rgba(79,195,247,.10)}
.bladderStatusBar.bsb-warn{opacity:.82;border-top-color:rgba(79,195,247,.22)}
.bsbIcon{font-size:13px;flex-shrink:0}
.bsbTrack{flex:1;height:4px;border-radius:99px;background:rgba(255,255,255,.14);overflow:hidden}
.bsbFill{height:100%;border-radius:99px;background:#4fc3f7;transition:width .8s ease,background .6s ease}
.bladderStatusBar.bsb-urgent .bsbFill{background:#ff9800}
.bladderStatusBar.bsb-critical .bsbFill{background:#ef5350;box-shadow:0 0 6px rgba(239,83,80,.6);animation:bsbCritBlink .7s ease-in-out infinite}
.bsbLabel{font-size:10px;font-weight:900;color:rgba(255,255,255,.5);white-space:nowrap}
.bladderStatusBar.bsb-critical .bsbLabel{color:#ffb3b3;animation:bladderCryPulse .7s ease-in-out infinite}
@keyframes bsbCritBlink{0%,100%{opacity:1}50%{opacity:.4}}
/* ─ 집착 루트 진입 씨네마틱 ─ */
.obsessionCinematic{position:fixed;inset:0;z-index:999999;background:#000;display:grid;place-items:center;cursor:pointer;animation:obsCinFadeIn .5s ease forwards}
.obsessionCinematic video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.75;pointer-events:none}
.obsCinText{position:relative;z-index:1;text-align:center;pointer-events:none;display:grid;gap:14px;justify-items:center}
.obsCinEyebrow{font-size:11px;font-weight:300;letter-spacing:.62em;color:rgba(220,160,160,.7);text-transform:uppercase;padding-right:.62em;animation:obsCinTextIn 1.1s .5s ease both}
.obsCinTitle{margin:0;font-size:clamp(28px,6vw,62px);font-weight:100;letter-spacing:.38em;color:#fff;padding-right:.38em;text-shadow:0 0 40px rgba(200,30,50,.95),0 0 90px rgba(140,10,25,.7),0 2px 0 rgba(0,0,0,.8);animation:obsCinTextIn 1.3s .25s ease both;line-height:1.2}
.obsCinSub{font-size:13px;font-weight:300;letter-spacing:.22em;color:rgba(255,200,200,.55);padding-right:.22em;animation:obsCinTextIn 1.1s .9s ease both}
.obsCinSkip{position:absolute;bottom:28px;right:28px;z-index:2;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.38);color:rgba(255,255,255,.45);padding:9px 18px;border-radius:999px;font-size:11px;letter-spacing:.14em;cursor:pointer;backdrop-filter:blur(8px);transition:color .2s,border-color .2s}
.obsCinSkip:hover{color:rgba(255,255,255,.85);border-color:rgba(255,255,255,.4)}
@keyframes obsCinFadeIn{0%{opacity:0}100%{opacity:1}}
@keyframes obsCinTextIn{0%{opacity:0;transform:translateY(14px) scale(.96)}100%{opacity:1;transform:translateY(0) scale(1)}}
/* ─ 순애 루트 진입 씨네마틱 ─ */
.pureCinematic{position:fixed;inset:0;z-index:999999;background:#fff0f4;display:grid;place-items:center;cursor:pointer;animation:pureCinFadeIn .6s ease forwards}
.pureCinematic video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.82;pointer-events:none}
.pureCinText{position:relative;z-index:1;text-align:center;pointer-events:none;display:grid;gap:18px;justify-items:center;padding:38px 56px;background:radial-gradient(ellipse at center,rgba(255,240,247,.55) 0%,rgba(255,228,240,.28) 55%,transparent 85%);backdrop-filter:blur(2px)}
.pureCinEyebrow{font-size:11px;font-weight:700;letter-spacing:.55em;color:#fff;text-transform:uppercase;padding-right:.55em;text-shadow:0 0 14px rgba(255,90,150,.95),0 0 26px rgba(255,120,170,.7),0 2px 4px rgba(150,30,80,.4);animation:pureCinTextIn 1.2s .4s ease both}
.pureCinTitle{margin:0;font-size:clamp(34px,7vw,72px);font-weight:900;letter-spacing:.18em;padding-right:.18em;color:#fff;text-shadow:0 0 18px rgba(255,140,180,1),0 0 38px rgba(255,100,160,.85),0 0 60px rgba(255,80,150,.6),0 3px 0 rgba(170,50,100,.55),0 6px 14px rgba(140,30,80,.45);animation:pureCinTextIn 1.4s .15s ease both;line-height:1.2;display:inline-flex;align-items:center;gap:.4em;justify-content:center;flex-wrap:nowrap}
.pureCinSparkle{font-size:.7em;color:#fff;text-shadow:0 0 12px rgba(255,200,220,1),0 0 24px rgba(255,140,180,.9);animation:pureCinSparkleSpin 3.4s ease-in-out infinite;display:inline-block}
.pureCinSparkleL{animation-delay:.2s}
.pureCinSparkleR{animation-delay:1.2s}
.pureCinSub{font-size:14px;font-weight:600;letter-spacing:.32em;color:#fff;padding-right:.32em;text-shadow:0 0 12px rgba(255,110,160,.95),0 0 22px rgba(255,90,150,.6),0 2px 3px rgba(150,30,80,.45);animation:pureCinTextIn 1.2s .85s ease both}
.pureCinSkip{position:absolute;bottom:28px;right:28px;z-index:2;border:1px solid rgba(255,255,255,.6);background:rgba(255,255,255,.25);color:#fff;padding:9px 18px;border-radius:999px;font-size:11px;letter-spacing:.14em;cursor:pointer;backdrop-filter:blur(8px);transition:color .2s,border-color .2s,background .2s;text-shadow:0 1px 4px rgba(150,30,80,.5)}
.pureCinSkip:hover{background:rgba(255,255,255,.42);border-color:#fff}
@keyframes pureCinFadeIn{0%{opacity:0;backdrop-filter:blur(20px)}100%{opacity:1;backdrop-filter:blur(0px)}}
@keyframes pureCinTextIn{0%{opacity:0;transform:translateY(18px) scale(.94)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes pureCinSparkleSpin{0%,100%{transform:rotate(0deg) scale(1);opacity:1}50%{transform:rotate(180deg) scale(1.18);opacity:.7}}
/* ─ 화면 흔들기 ─ */
.app.screenShake{animation:screenShakeAnim .48s cubic-bezier(.36,.07,.19,.97) both}
@keyframes screenShakeAnim{0%,100%{transform:translate(0,0) rotate(0deg)}8%{transform:translate(-6px,-4px) rotate(-.4deg)}18%{transform:translate(6px,4px) rotate(.4deg)}28%{transform:translate(-5px,3px) rotate(-.3deg)}38%{transform:translate(5px,-4px) rotate(.3deg)}48%{transform:translate(-3px,4px) rotate(-.2deg)}58%{transform:translate(3px,-3px) rotate(.2deg)}72%{transform:translate(-2px,2px) rotate(-.1deg)}84%{transform:translate(2px,-2px) rotate(.1deg)}}
/* ─ 뷰 전환 페이드 ─ */
.panel{animation:panelFadeIn .28s ease both}
@keyframes panelFadeIn{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}
/* ─ 메시지 슬라이드인 ─ */
.msgRow{animation:msgSlideIn .3s ease both}
@keyframes msgSlideIn{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}
/* ─ 스탯 floater ─ */
.statFloaterWrap{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99996;pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:6px}
.statFloater{font-size:17px;font-weight:900;padding:5px 18px;border-radius:99px;white-space:nowrap;backdrop-filter:blur(4px);animation:statFloat 1.5s ease forwards}
.statFloater.positive{background:rgba(40,180,80,.88);color:#fff;box-shadow:0 4px 16px rgba(40,180,80,.3)}
.statFloater.negative{background:rgba(210,55,55,.88);color:#fff;box-shadow:0 4px 16px rgba(210,55,55,.3)}
@keyframes statFloat{0%{opacity:0;transform:translateY(0) scale(.88)}12%{opacity:1;transform:translateY(-6px) scale(1)}65%{opacity:1;transform:translateY(-36px) scale(1)}100%{opacity:0;transform:translateY(-56px) scale(.95)}}
/* ─ 초상화 crossfade ─ */
.portraitCrossfade{animation:portraitFadeIn .45s ease both}
@keyframes portraitFadeIn{0%{opacity:0;filter:blur(6px);transform:scale(.97)}100%{opacity:1;filter:blur(0);transform:scale(1)}}
/* ─ 레벨업 파티클 ─ */
.lvupParticle{position:absolute;top:50%;left:50%;width:8px;height:8px;border-radius:50%;pointer-events:none}
.lvupParticle:nth-child(1){background:#f0c060;animation:lvupFly .9s ease-out .1s both;--tx:0px;--ty:-90px}
.lvupParticle:nth-child(2){background:#ff9f40;animation:lvupFly .9s ease-out .17s both;--tx:64px;--ty:-64px}
.lvupParticle:nth-child(3){background:#e8d060;animation:lvupFly 1.0s ease-out .08s both;--tx:90px;--ty:0px}
.lvupParticle:nth-child(4){background:#f0c060;animation:lvupFly .9s ease-out .2s both;--tx:64px;--ty:64px}
.lvupParticle:nth-child(5){background:#ff8040;animation:lvupFly 1.0s ease-out .05s both;--tx:0px;--ty:90px}
.lvupParticle:nth-child(6){background:#e8d060;animation:lvupFly .9s ease-out .14s both;--tx:-64px;--ty:64px}
.lvupParticle:nth-child(7){background:#f0c060;animation:lvupFly 1.0s ease-out .22s both;--tx:-90px;--ty:0px}
.lvupParticle:nth-child(8){background:#ff9f40;animation:lvupFly .9s ease-out .06s both;--tx:-64px;--ty:-64px}
@keyframes lvupFly{0%{opacity:1;transform:translate(-50%,-50%) scale(1.4)}50%{opacity:.9}100%{opacity:0;transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(.2)}}
/* ========= 레벨 티어별 UI 변화 ========= */
/* early (Lv1~2): 단정하고 잔잔한 톤 */
.app.relTier-early .relBadge{background:rgba(255,255,255,.05)}
.app.relTier-early .homeLogo small{background:rgba(220,200,180,.18);color:#c8a884}
/* mid (Lv3~5): 따뜻하고 부드러운 황금 톤 */
.app.relTier-mid .relBadge{background:linear-gradient(180deg,rgba(255,210,150,.16),rgba(255,210,150,.06));border:1px solid rgba(240,160,80,.22)}
.app.relTier-mid .relProgressFill{background:linear-gradient(90deg,#e8993b,#f0c060)}
.app.relTier-mid .homeLogo small{background:rgba(255,229,180,.85);color:#a85d18;border-color:rgba(223,132,44,.42)}
.app.relTier-mid .nav button.active,.app.relTier-mid .nav button:hover{background:linear-gradient(135deg,#e58a2f,#df842c)}
/* late (Lv6~8): 진해진 호박색 + 살짝 어두운 분위기 */
.app.relTier-late .relBadge{background:linear-gradient(180deg,rgba(255,170,120,.22),rgba(255,150,100,.08));border:1px solid rgba(240,140,90,.34);box-shadow:0 0 0 1px rgba(240,140,90,.12) inset}
.app.relTier-late .relProgressFill{background:linear-gradient(90deg,#d96d2a,#f0a060)}
.app.relTier-late .homeLogo span{text-shadow:0 3px 0 #ffd9a8,0 10px 22px rgba(120,40,20,.18)}
.app.relTier-late .homeLogo small{background:rgba(255,210,170,.9);color:#8a3d18;border-color:rgba(200,90,40,.5)}
.app.relTier-late .side{background:linear-gradient(180deg,#2a160f 0%,#1a0c08 100%)}
.app.relTier-late .nav button.active,.app.relTier-late .nav button:hover{background:linear-gradient(135deg,#d96d2a,#a85020)}
/* peak (Lv9~10): 정점. 깊고 농밀한 톤 */
.app.relTier-peak .relBadge{background:linear-gradient(180deg,rgba(255,200,160,.28),rgba(220,140,100,.14));border:1px solid rgba(220,130,80,.5);box-shadow:0 0 0 1px rgba(255,180,130,.18) inset,0 0 18px rgba(220,130,80,.12)}
.app.relTier-peak .relProgressFill{background:linear-gradient(90deg,#b85420,#e8993b,#f0c060);box-shadow:0 0 8px rgba(240,160,80,.4)}
.app.relTier-peak .homeLogo span{text-shadow:0 3px 0 #f7c590,0 12px 28px rgba(120,30,10,.32);letter-spacing:.04em}
.app.relTier-peak .homeLogo small{background:rgba(255,190,140,.92);color:#6b2810;border-color:rgba(180,70,30,.6);font-weight:1000}
.app.relTier-peak .side{background:linear-gradient(180deg,#1f0d0a 0%,#0e0606 100%);box-shadow:inset -1px 0 0 rgba(220,130,80,.18)}
.app.relTier-peak .nav button{border:1px solid rgba(220,130,80,.16)}
.app.relTier-peak .nav button.active,.app.relTier-peak .nav button:hover{background:linear-gradient(135deg,#b85420,#7a3010);box-shadow:0 4px 14px rgba(150,50,20,.32)}
.app.relTier-peak .statsBox{box-shadow:0 0 0 1px rgba(220,130,80,.18) inset,0 0 22px rgba(220,130,80,.06)}
`;





