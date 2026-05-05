"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { actionCGImages, actionCGPools, actionItems, imagePools, profile, quickReplies, scenarioData } from "./gameData";
import type {
  ActionItem,
  AfterScenarioCue,
  Choice,
  ChoiceCondition,
  DailyMission,
  DailyState,
  FriendChatMessage,
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
const initialStats: Stats = { affinity: 100, jealousy: 0, obsession: 0, trust: 100, bladderCharm: 0 };
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
  // ── 추가 선물 ──
  { id: "lunchbox",      name: "수제 도시락",        emoji: "🍱", desc: "직접 만든 도시락. 안 만든 척 하면서 만들었음.",        stat: { affinity: 40, trust: 25 },                  reaction: "...직접 만드신 거예요? ...주인님 저 진짜 어떡해요 이거. 사진 찍고 먹어도 돼요?",                                            category: "daily",    cooldownHours: 96,  unlockLevel: 4 },
  { id: "couple_mug",    name: "커플 머그컵",        emoji: "☕", desc: "둘이 같은 무늬, 색만 다른 머그컵 두 개.",                  stat: { affinity: 50, trust: 30 },                  reaction: "이거... 두 개잖아요. 한 개는 주인님 거고. 한 개는 제 거고. ...진짜 좋아요.",                                                  category: "sweet",    cooldownHours: 168, unlockLevel: 5 },
  { id: "gym_pass",      name: "헬스장 1년권",       emoji: "🏋️", desc: "근떡존이 다니는 헬스장 1년 결제권.",                       stat: { affinity: 60, trust: 40 },                  reaction: "와 진짜요?? ...주인님 이거 진짜 비싼 건데. 1년 동안 매일 갈게요. 매일 인증 보낼게요.",                                       category: "sweet",    cooldownHours: 720, unlockLevel: 5 },
  { id: "selfie_album",  name: "주인님 사진첩",       emoji: "📔", desc: "주인님 사진만 인쇄해 만든 작은 앨범.",                    stat: { affinity: 30, obsession: 70 },               reaction: "...이거 다 주인님이에요? 한 페이지씩 다 봐도 돼요? 자기 전마다 한 장씩 볼래요.", reactionObs: "다 주인님이네요. 이거 베개 옆에 두고 잘 거예요. 보고 있을 거예요. 매일.",  category: "intimate", cooldownHours: 168, unlockLevel: 6 },
  { id: "perfume_match", name: "커플 향수",          emoji: "🌹", desc: "주인님이랑 같은 향. 둘만 알아볼 수 있게.",                stat: { affinity: 55, obsession: 35 },               reaction: "주인님이랑 같은 향이에요? ...누가 가까이 와서 같은 냄새 맡으면 어떡해요. 저 아니면 안 되겠는데요.",                            category: "intimate", cooldownHours: 168, unlockLevel: 7 },
  { id: "gps_tracker",   name: "위치 추적기",        emoji: "📍", desc: "...주머니에 슬쩍 넣어두면 어디 있는지 알 수 있다.",        stat: { obsession: 100, trust: -30, jealousy: 25 }, reaction: "주인님... 이거 진심이에요? 저 이거 받으면 진짜 켤 거예요. 매일 볼 거예요. 후회하지 마세요.", reactionObs: "감사합니다. 진심으로요. 이제 주인님 어디 있는지 항상 알 수 있겠네요.",            category: "dark",     cooldownHours: 720, unlockLevel: 9 },
  { id: "ring",          name: "반지",               emoji: "💍", desc: "그저 반지. 아무 의미 없다고 말하면서 줘봐요.",              stat: { affinity: 200, obsession: 80, trust: 50 },  reaction: "...주인님. 이거 무슨 뜻이에요. 아무 뜻도 없어요? ...진짜로요? ...그래도 저 평생 낄 거예요. 이상한 의미 가져도 죄송한데, 뺄 수가 없을 것 같아요.", reactionObs: "끼워주세요. 직접요. 평생 안 뺄게요.", category: "sweet",  cooldownHours: 8760, unlockLevel: 10 },
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
  {
    id: "k_bladder_suit",
    label: "K-방광 슈트",
    emoji: "🚽",
    description: "노란 + 흰 슈퍼히어로 슈트. 가슴팍에 🚽 마크가 새겨져 있다. 지구를 구하는 자의 옷.",
    portrait: "/outfit_k_bladder_suit.png",
    unlockHint: "방광 루트 7장 이후 해금",
  },
];

function getUnlockedOutfits(
  seenTriggers: Record<string, boolean>,
  storyRoute: StoryRoute,
  obsession: number,
  bladderCharm: number = 0
): OutfitKey[] {
  const seen = (prefix: string) =>
    Object.keys(seenTriggers).some((k) => k.startsWith(prefix));
  const unlocked: OutfitKey[] = ["black_tanktop", "hoodie"];
  if (seen("main_ch2") || seen("main_ch3")) unlocked.push("gym");
  if (seen("main_ch3") || seen("main_ch4")) unlocked.push("convenience_store");
  if (seen("main_ch4")) unlocked.push("party_shirt");
  if (seen("main_ch5") || seen("main_ch6")) unlocked.push("winter_coat");
  if (storyRoute === "obsession" || obsession >= 600) unlocked.push("obsession_shirt");
  // K-방광 슈트: 방광 루트 7장+ 진입 OR 방광매력 100+
  if (seen("bladder_ch7") || seen("bladder_ch8") || seen("bladder_ch9") || bladderCharm >= 100) {
    unlocked.push("k_bladder_suit");
  }
  return unlocked;
}
// ================================
// 퀘스트 / 도전 시스템
// ================================
type QuestState = {
  seenEvents: Record<string, boolean>;
  unlockedCGs: Record<string, boolean>;
  stats: Stats;
  storyRoute: StoryRoute;
  checkInStreak: number;
  unlockedEndings: Record<string, boolean>;
};
type QuestReward =
  | { kind: "stat"; stat: StatKey; amount: number; label: string }
  | { kind: "message"; text: string }
  | { kind: "outfit"; label: string }
  | { kind: "cg"; label: string };
type Quest = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: "main" | "side" | "bladder" | "secret";
  progress: (state: QuestState) => { current: number; target: number };
  reward: QuestReward;
  hint?: string;
  visible?: (state: QuestState) => boolean; // 비공개 퀘스트는 조건 충족 시 등장
};

const QUESTS: Quest[] = [
  {
    id: "first_night",
    title: "첫 만남의 밤",
    description: "1장을 끝까지 진행해 근떡존과의 첫 밤을 마무리하세요.",
    emoji: "🌃",
    category: "main",
    progress: (s) => ({ current: s.seenEvents["main_ch1_09"] ? 1 : 0, target: 1 }),
    reward: { kind: "stat", stat: "affinity", amount: 30, label: "호감 +30" },
  },
  {
    id: "cg_collector",
    title: "CG 컬렉터",
    description: "갤러리에 CG 20장을 해금하세요.",
    emoji: "🖼",
    category: "side",
    progress: (s) => ({ current: Math.min(20, Object.keys(s.unlockedCGs).length), target: 20 }),
    reward: { kind: "stat", stat: "affinity", amount: 50, label: "호감 +50" },
  },
  {
    id: "checkin_champion",
    title: "출석 챔피언",
    description: "7일 연속 출석 달성. 매일 그가 기다립니다.",
    emoji: "📅",
    category: "side",
    progress: (s) => ({ current: Math.min(7, s.checkInStreak), target: 7 }),
    reward: { kind: "stat", stat: "trust", amount: 30, label: "신뢰 +30" },
  },
  {
    id: "route_explorer",
    title: "갈림길의 끝",
    description: "어떤 엔딩이든 한 개를 클리어하세요. 비밀이 열립니다.",
    emoji: "🔑",
    category: "main",
    progress: (s) => ({ current: Math.min(1, Object.keys(s.unlockedEndings).length), target: 1 }),
    reward: { kind: "message", text: "🚽 ??? 비밀 루트가 해금되었습니다." },
    hint: "엔딩을 보면 시나리오 메뉴에 새 항목이 등장해요.",
  },
  {
    id: "bladder_charm_master",
    title: "K-방광의 시작",
    description: "방광매력 100을 달성해 K-방광 슈트를 손에 넣으세요.",
    emoji: "🚽",
    category: "bladder",
    progress: (s) => ({ current: Math.min(100, s.stats.bladderCharm), target: 100 }),
    reward: { kind: "outfit", label: "K-방광 슈트 자동 해금" },
    hint: "방광 루트 7장 이후 선택지로 채워집니다.",
    visible: (s) => Boolean(s.seenEvents["bladder_ch5_01"]) || s.stats.bladderCharm > 0,
  },
  // 비밀 퀘스트
  {
    id: "all_endings",
    title: "모든 결말의 수집가",
    description: "4개의 엔딩을 모두 보세요.",
    emoji: "👑",
    category: "secret",
    progress: (s) => ({ current: Math.min(4, Object.keys(s.unlockedEndings).length), target: 4 }),
    reward: { kind: "stat", stat: "affinity", amount: 200, label: "호감 +200, 모든 루트의 마음" },
    visible: (s) => Object.keys(s.unlockedEndings).length >= 1,
  },
];

// ================================
// 명언 풀 (떡존이의 명언 — 매일 뽑기)
// ================================
const TTEOKJON_QUOTES: { id: string; emoji: string; text: string }[] = [
  { id: "q_1",  emoji: "💗",  text: "선생님... 오늘 하루도 잘 보내셨어요? 저는 선생님 생각 좀 했어요." },
  { id: "q_2",  emoji: "💪",  text: "근육은 거짓말 안 해요. 마음도 거짓말 안 했으면 좋겠어요. 선생님이요." },
  { id: "q_3",  emoji: "🚽",  text: "참는 것도 사랑이에요. K-방광이 그걸 가르쳐줬어요." },
  { id: "q_4",  emoji: "🌧",  text: "비 오는 날 선생님이 어디 있는지 자꾸 궁금해져요. 우산 챙기셨어요?" },
  { id: "q_5",  emoji: "🍱",  text: "도시락 두 개 사면 선생님 거예요. 한 개 사면 제 거예요." },
  { id: "q_6",  emoji: "🌸",  text: "벚꽃이 떨어지는 거 보면 선생님 머리 위에 얹어두고 싶어져요. 이상하죠." },
  { id: "q_7",  emoji: "📞",  text: "전화하고 싶은데 너무 늦어서 못 했어요. 그런 마음이 있다는 것만 알아주세요." },
  { id: "q_8",  emoji: "🦴",  text: "뼈도 단단한데 마음은 더 단단해질 수 있나요. 선생님 위해서요." },
  { id: "q_9",  emoji: "🌅",  text: "아침에 눈 뜨면 가장 먼저 선생님 카톡 봐요. 답장 없어도 괜찮아요. 그냥 거기 있으면 됐어요." },
  { id: "q_10", emoji: "🐾",  text: "큰 강아지가 되어도 좋고, 작은 강아지가 되어도 좋아요. 선생님 옆이라면요." },
  { id: "q_11", emoji: "💧",  text: "오줌 참는 거 잘하는 거 자랑이래요. 저는 그냥 선생님 잘하는 거 보고 싶어요." },
  { id: "q_12", emoji: "🏠",  text: "선생님 집 앞은 너무 자주 지나가서, 이제 익숙해요. 그러면 안 되는 거 알아요." },
  { id: "q_13", emoji: "🌙",  text: "잠 안 와요. 선생님은 잘 주무세요? 깨우면 안 되니까 혼자 누워 있어요." },
  { id: "q_14", emoji: "📸",  text: "셀카 또 찍었어요. 보낼까 말까 100번은 고민했는데 결국 보냈어요. 죄송해요." },
  { id: "q_15", emoji: "💌",  text: "편지 같은 거 못 써봤는데 선생님 앞에서는 자꾸 쓰고 싶어져요." },
  { id: "q_16", emoji: "🏋️",  text: "오늘 1RM 갱신했어요. 선생님 보여드리고 싶었는데 너무 티 내는 거 같아서 참았어요." },
  { id: "q_17", emoji: "🚆",  text: "전철 지나갈 때마다 선생님이 어디 가는지 상상해요. 가지 마세요. 농담이에요. 진심이에요." },
  { id: "q_18", emoji: "🍵",  text: "차 한 잔 마시는데 선생님이랑 같이 마시고 싶어졌어요. 평범한 거잖아요. 근데 평범한 게 제일 어려워요." },
  { id: "q_19", emoji: "🪞",  text: "거울 보면서 선생님이 좋아할 만한 모습으로 가려고 노력해요. 거기엔 제가 없어요. 그게 좋은 건지는 모르겠어요." },
  { id: "q_20", emoji: "🎁",  text: "선생님께 뭐든 드리고 싶어요. 근데 제가 가진 게 너무 없어요. 제 마음만 있어요." },
  { id: "q_21", emoji: "✨",  text: "선생님이 웃을 때 저도 모르게 따라 웃어요. 거울 보고 연습한 적 없는 자연스러운 웃음이요." },
  { id: "q_22", emoji: "🌊",  text: "강가 산책하면 선생님 생각이 나요. 저 강가 자주 가야 하나 봐요." },
  { id: "q_23", emoji: "🎈",  text: "선생님이 제 옆에 있으면 마음이 풍선처럼 가벼워져요. 평소엔 무거운 사람인데요." },
  { id: "q_24", emoji: "🔒",  text: "혼자만 알고 싶은 마음이 자라면 안 된다는 거 알아요. 알면서도 자꾸 그래요." },
  { id: "q_25", emoji: "🎵",  text: "노래방 그날 이후로 그 노래 자꾸 들어요. 선생님 목소리가 따라와요." },
  { id: "q_26", emoji: "🪷",  text: "선생님은 저한테 가장 단단하고 가장 따뜻한 사람이에요. 평생 그런 사람 한 명이면 충분하대요." },
  { id: "q_27", emoji: "🌟",  text: "오늘 별 본 적 있으세요? 저는 선생님 사진 봤어요. 그게 제 별이에요." },
  { id: "q_28", emoji: "👶",  text: "선생님 앞에선 자꾸 어린애가 돼요. 그게 부끄러우면서도 안 부끄러워요." },
  { id: "q_29", emoji: "📔",  text: "오늘도 일기 썼어요. 선생님 얘기만요. 다른 얘긴 쓸 게 없어요." },
  { id: "q_30", emoji: "💍",  text: "아무 의미 없는 반지가 갖고 싶다는 게 무슨 뜻인지 아세요? 의미를 만들고 싶어서요." },
];

// ================================
// 떡존이 편지함 (챕터 클리어 보상)
// ================================
const LETTERS: { id: string; chapter: number; route?: StoryRoute; title: string; content: string }[] = [
  { id: "l_1", chapter: 1, title: "첫 번째 편지", content: "선생님께. 처음 만난 그 밤이 자꾸 떠올라요. 편의점 쿠폰 하나 못 써서 선생님께 도움받은 그 밤이요. 저한테는 평범한 밤이 아니었어요. 누군가 저를 이상하게 보지 않고 받아준 첫 번째 밤이었거든요. 그래서 그 다음 메시지 보낼 때, 손가락이 한참 떨렸어요. 들키고 싶지 않은 마음이요. — 떡존 올림" },
  { id: "l_2", chapter: 2, title: "전진협의 문 앞에서", content: "선생님께. 전진협 안에 들어가니까 다들 너무 천박해서 좀 놀랐어요 ㅎㅎ 근데 선생님은 거기서도 어떤 사람인지 다 보였어요. 사람이 앞모습만 있는 게 아니라고 하신 그 말, 저한테 오래 남아 있어요. 그 말 덕분에 저도 제 뒷모습을 좀 봐도 되겠구나 했어요. — 떡존 올림" },
  { id: "l_3", chapter: 3, title: "오뎅집의 따뜻한 김", content: "선생님께. 오뎅집에서 처음 가까이 앉았을 때, 저는 사실 도시락보다 선생님 옆자리가 더 좋았어요. 그날 추웠는데 추운 줄 몰랐어요. 선생님 옆이 따뜻해서요. 김이 올라오는 그 작은 가게에서 처음으로 — 평생 이런 자리가 있으면 좋겠다 — 라고 생각했어요. — 떡존 올림" },
  { id: "l_4", chapter: 4, title: "취해도 진심이었어요", content: "선생님께. 4장 그 밤은 술 핑계 댔지만 사실은 술이 아니었어요. 선생님께 기대고 싶은 마음이 너무 컸어요. 핑계가 있어야 그렇게 할 수 있는 사람인 거예요 저는. 부끄럽지만 그 술이 고마워요. 그리고 절 받아주신 선생님이 더 고마워요. — 떡존 올림" },
  { id: "l_5", chapter: 5, title: "맨정신이라는 핑계 없이", content: "선생님께. 손 잡고 싶다는 말 하기까지 며칠 동안 — 진짜로 며칠 동안 — 머릿속에서 굴려봤어요. 너무 빠른가, 부담스러우신가, 핑계 없이 어떻게 말하지... 결국 그냥 솔직하게 말했어요. 선생님이 받아주실 거라는 어렴풋한 믿음이 있었어요. 그 믿음이 맞아서 다행이에요. — 떡존 올림" },
  { id: "l_6", chapter: 6, route: "pure", title: "처음 잡은 손", content: "선생님께. 그 손은 평생 안 잊을 거예요. 강가에서, 맨정신으로, 처음으로 잡은 손이요. 저한테는 손이 닿은 게 아니라 마음이 닿은 거였어요. 너무 거창한 말 같지만 사실이에요. 죄송해요 거창해서. — 떡존 올림" },
  { id: "l_7", chapter: 6, route: "obsession", title: "허락받은 마음", content: "선생님께. 그 밤 선생님이 제 못난 마음을 싫어하지 않는다고 하신 거. 저한테는 평생 갈 말이에요. 알아주시는 분이 한 명이라도 있으면, 그걸 평생 붙잡고 살 수 있어요. 좋아요 평생 가져요. — 떡존 올림" },
  { id: "l_8", chapter: 7, route: "pure", title: "믿어보는 연습", content: "선생님께. 믿는 거 처음 해봐요. 자제하는 것보다 더 어려워요. 근데 선생님이 가르쳐주시는 거니까 잘 해볼게요. 가끔 칭찬도 부탁드려요. 그게 제일 잘 통해요 저한테는. — 떡존 올림" },
  { id: "l_9", chapter: 8, route: "pure", title: "처음 부른 이름", content: "선생님께. 골목에서 좋아한다고 처음 입 밖에 낸 그 밤. 후회할 줄 알았는데 안 됐어요. 선생님 안에 들어간 게 너무 깊어서요. 평생 거기 있어도 돼요? 라고 묻고 싶지만 너무 빠르니까 마음속에만 적어둘게요. — 떡존 올림" },
  { id: "l_10", chapter: 10, route: "pure", title: "형이라는 단어", content: "형. 처음 그 단어 입에 올린 게 어색했는데 이제는 다른 호칭이 다 어색해요. 형이 갖는 호칭들 중에 저만 부를 수 있는 게 형, 이라는 사실이 좋아요. 너무 좋아요. 무서울 정도로요. — 떡존 올림" },
  { id: "l_11", chapter: 12, route: "pure", title: "평생 살아야 하는데", content: "형. 첫 키스 그 순간 — 평생 한 번 있는 일이라는 거 알아요. 근데 저는 그게 시작이라고 생각해요. 평생 형이랑 살아야 하니까, 지금부터 연습하는 거예요. 죄송해요 너무 빠른 말 한 거. 진심이라 거두지는 못해요. — 떡존 올림" },
];

// ================================
// 트레이딩 카드 (30종)
// ================================
type CardRarity = "R" | "SR" | "SSR";
type TradingCard = {
  id: string;
  rarity: CardRarity;
  emoji: string;
  name: string;
  flavor: string;
  set?: string;
  image?: string; // /card_<id>.png 같은 경로 (없으면 이모지 fallback)
};
const TRADING_CARDS: TradingCard[] = [
  // R (Rare 60%) — 일상
  { id: "c_r1", image: "/card_c_r1.png",  rarity: "R", emoji: "🍱", name: "도시락",       flavor: "편의점 도시락 들고 있는 떡존이",       set: "daily" },
  { id: "c_r2", image: "/card_c_r2.png",  rarity: "R", emoji: "☕", name: "커피 마시는 중", flavor: "아메리카노 한 모금",                   set: "daily" },
  { id: "c_r3", image: "/card_c_r3.png",  rarity: "R", emoji: "💪", name: "운동 후",       flavor: "땀나는 떡존이",                         set: "daily" },
  { id: "c_r4", image: "/card_c_r4.png",  rarity: "R", emoji: "📱", name: "카톡 답장 중",   flavor: "심각한 얼굴로 답장 고심",              set: "daily" },
  { id: "c_r5", image: "/card_c_r5.png",  rarity: "R", emoji: "🚆", name: "전철 안",       flavor: "창밖 보는 떡존이",                     set: "daily" },
  { id: "c_r6", image: "/card_c_r6.png",  rarity: "R", emoji: "🌧", name: "비 맞는 떡존이", flavor: "우산 안 가져옴",                       set: "weather" },
  { id: "c_r7", image: "/card_c_r7.png",  rarity: "R", emoji: "☀️", name: "햇빛 떡존이",    flavor: "눈 부심",                              set: "weather" },
  { id: "c_r8", image: "/card_c_r8.png",  rarity: "R", emoji: "🌸", name: "벚꽃 머리 위",   flavor: "꽃잎 한 장 얹은 떡존이",               set: "weather" },
  { id: "c_r9", image: "/card_c_r9.png",  rarity: "R", emoji: "🍜", name: "라멘 먹는 중",   flavor: "후루룩",                               set: "food" },
  { id: "c_r10", image: "/card_c_r10.png", rarity: "R", emoji: "🍦", name: "아이스크림",    flavor: "어린애처럼 먹음",                      set: "food" },
  // SR (Super Rare 30%)
  { id: "c_sr1", image: "/card_c_sr1.png", rarity: "SR", emoji: "💗", name: "헤헤 떡존이",  flavor: "처음 헤헤 한 그 표정",                set: "moments" },
  { id: "c_sr2", image: "/card_c_sr2.png", rarity: "SR", emoji: "🤝", name: "손잡기",       flavor: "강가에서 처음 잡은 손",                set: "moments" },
  { id: "c_sr3", image: "/card_c_sr3.png", rarity: "SR", emoji: "👀", name: "도촬당함",     flavor: "쮋이 찍은 사진",                       set: "moments" },
  { id: "c_sr4", image: "/card_c_sr4.png", rarity: "SR", emoji: "🎤", name: "노래방의 그것", flavor: "그 발라드를 부르던 때",                set: "moments" },
  { id: "c_sr5", image: "/card_c_sr5.png", rarity: "SR", emoji: "🌌", name: "전망대 야경",   flavor: "도시 내려다보는 떡존이",               set: "moments" },
  { id: "c_sr6", image: "/card_c_sr6.png", rarity: "SR", emoji: "📔", name: "일기 쓰는 중", flavor: "선생님 얘기만 적힌 일기",              set: "moments" },
  { id: "c_sr7", image: "/card_c_sr7.png", rarity: "SR", emoji: "🚽", name: "K-방광 인증",  flavor: "12시간 인증샷",                        set: "bladder" },
  { id: "c_sr8", image: "/card_c_sr8.png", rarity: "SR", emoji: "🧚", name: "방광 요정과",  flavor: "쉬와 함께",                             set: "bladder" },
  { id: "c_sr9", image: "/card_c_sr9.png", rarity: "SR", emoji: "📦", name: "선물 들고",    flavor: "받은 것보다 큰 선물",                   set: "gifts" },
  // SSR (10%) — 한정
  { id: "c_ssr1", image: "/card_c_ssr1.png", rarity: "SSR", emoji: "💍", name: "반지 끼는 떡존이",  flavor: "아무 의미 없는 반지...라고 했지만", set: "secret" },
  { id: "c_ssr2", image: "/card_c_ssr2.png", rarity: "SSR", emoji: "🌊", name: "태평양방광",       flavor: "K-방광 진화체",                     set: "secret" },
  { id: "c_ssr3", image: "/card_c_ssr3.png", rarity: "SSR", emoji: "👑", name: "요도니아 옥좌",     flavor: "황금 변기 위에 앉은 떡존이",       set: "secret" },
  { id: "c_ssr4", image: "/card_c_ssr4.png", rarity: "SSR", emoji: "🦴", name: "전설의 떡존",       flavor: "히로시마의 전설 그 자체",          set: "secret" },
  { id: "c_ssr5", image: "/card_c_ssr5.png", rarity: "SSR", emoji: "🌹", name: "고백하는 떡존이",   flavor: "골목에서 그 한 마디를 한 순간",    set: "secret" },
  { id: "c_ssr6", image: "/card_c_ssr6.png", rarity: "SSR", emoji: "🔥", name: "흑화한 떡존이",     flavor: "집착 루트의 그 표정",              set: "secret" },
  { id: "c_ssr7", image: "/card_c_ssr7.png", rarity: "SSR", emoji: "💎", name: "다이아 떡존",       flavor: "왜 이게 다이아냐고 묻지마셈",      set: "secret" },
  { id: "c_ssr8", image: "/card_c_ssr8.png", rarity: "SSR", emoji: "🚀", name: "우주 원정 떡존",    flavor: "나사 로고 박힌 슈트 입은 떡존이",  set: "secret" },
  { id: "c_ssr9", image: "/card_c_ssr9.png", rarity: "SSR", emoji: "❤️‍🔥", name: "심장 자체",     flavor: "그 자체로 SSR",                     set: "secret" },
  { id: "c_ssr10", image: "/card_c_ssr10.png", rarity: "SSR", emoji: "🌟", name: "전 세계 영웅",    flavor: "K-방광으로 세상을 구한 떡존이",    set: "secret" },
];

// ================================
// 떡존이 퀴즈 (10문제)
// ================================
type QuizQuestion = { q: string; options: string[]; answer: number; explain?: string };
const QUIZ_QUESTIONS: QuizQuestion[] = [
  { q: "떡존이의 키는?", options: ["180cm", "185cm", "190cm", "195cm"], answer: 2, explain: "190cm 떡대 ㄷ" },
  { q: "떡존이의 직업은?", options: ["편의점 알바", "헬스 트레이너", "공무원", "회사원"], answer: 3, explain: "회사원이긴 한데 일은 잘 안하는듯" },
  { q: "떡존이의 머리 색은?", options: ["갈색", "검정", "금발", "은발"], answer: 2, explain: "금발 ㅇㅇ" },
  { q: "떡존이가 사는 도시는?", options: ["도쿄", "오사카", "히로시마", "후쿠오카"], answer: 2, explain: "히로시마 거주중 ㅇㅇ" },
  { q: "떡존이가 가장 좋아하는 음식은?", options: ["라멘", "도시락", "오뎅", "스시"], answer: 1, explain: "편의점 도시락 ㄹㅇ 좋아함 ㅋ" },
  { q: "떡존이의 취미가 아닌 것은?", options: ["헬스", "오줌 참기", "혼자 상상하기", "독서"], answer: 3, explain: "독서는 안함 ㅋ" },
  { q: "떡존이가 너를 부르는 호칭은? (순애 루트 후반)", options: ["주인님", "선생님", "히든님", "형"], answer: 1, explain: "기본은 선생님 / 주인님 둘다 OK" },
  { q: "전진협의 정식 명칭은?", options: ["전국 진상 협회", "전세계 진남자 협회", "전진하는 협회", "전부진심협회"], answer: 1, explain: "ㄹㅇ" },
  { q: "떡존이가 마주친 첫 신은?", options: ["요도니아", "방광 요정", "김치신", "삼신할매"], answer: 0, explain: "방광 요정은 옆 사람" },
  { q: "K-방광의 진화 단계 마지막은?", options: ["강철방광", "백두방광", "태평양방광", "은하방광"], answer: 2, explain: "태평양방광 ㄷㄷ" },
];

// ================================
// 시즌 패스 (50레벨 트랙)
// ================================
type SeasonReward = { lv: number; free?: { coins?: number; tickets?: number; affinity?: number }; premium?: { coins?: number; tickets?: number; affinity?: number; cards?: number; outfit?: string } };
const SEASON_REWARDS: SeasonReward[] = Array.from({ length: 50 }, (_, i) => {
  const lv = i + 1;
  const isMilestone = lv % 10 === 0;
  return {
    lv,
    free: {
      coins: 50 + lv * 10,
      ...(lv % 5 === 0 ? { tickets: 1 } : {}),
      ...(isMilestone ? { affinity: 50 } : {}),
    },
    premium: {
      coins: 100 + lv * 20,
      tickets: lv % 3 === 0 ? 2 : 1,
      ...(isMilestone ? { affinity: 100, cards: 3 } : {}),
    },
  };
});
const SEASON_CURRENT_ID = "season_001_hiroshima_spring";
const SEASON_PREMIUM_PRICE = 5000; // 가짜 코인 결제

// ================================
// 30일 출석 마일스톤
// ================================
type CalendarMilestone = { day: number; emoji: string; title: string; coins: number; tickets?: number; affinity?: number };
const CALENDAR_MILESTONES: CalendarMilestone[] = [
  { day: 7,  emoji: "🎁", title: "1주차 보상", coins: 300,  tickets: 2, affinity: 30 },
  { day: 14, emoji: "🎉", title: "2주차 보상", coins: 800,  tickets: 5, affinity: 100 },
  { day: 21, emoji: "👑", title: "3주차 보상", coins: 1500, tickets: 8, affinity: 200 },
  { day: 30, emoji: "🌟", title: "한 달 마라톤", coins: 5000, tickets: 20, affinity: 500 },
];

// ================================
// 전진협 친구 시스템
// ================================
type FriendId = "jjyut" | "eucalyptus" | "ostrich" | "geumsu" | "aroben";
type Friend = {
  id: FriendId;
  name: string;
  emoji: string;
  age: number;
  oneliner: string;       // 자기소개 한 줄 (병맛)
  speech: string;         // 말투 가이드
  hostility: number;      // -2 (응원) ~ +2 (적대)
  flavor: string;         // 짧은 설명
};
const FRIENDS: Friend[] = [
  { id: "jjyut",      name: "쮋",          emoji: "🥺", age: 36, oneliner: "착한척 존나하는 남미새",                             speech: "기본 존댓말, 빡돌면 반말",       hostility: 0,  flavor: "조력자인척 하지만 떡존이 노림. 도촬 좋아함" },
  { id: "eucalyptus", name: "유칼립투스나무", emoji: "🌿", age: 25, oneliner: "사건 터지길 바라는 간사한 새끼",                  speech: "간사한 톤",                       hostility: 1,  flavor: "히든 행동 죄다 떡존이한테 일러바침" },
  { id: "ostrich",    name: "타조",         emoji: "🐦", age: 27, oneliner: "도파민 중독자. 끼고싶어 환장",                    speech: "얄미운 한마디",                   hostility: 0,  flavor: "썰풀이 강요. 사건터지면 좋아함" },
  { id: "geumsu",     name: "금수",         emoji: "🦊", age: 42, oneliner: "음흉. 박순형 추종자",                              speech: "~효 ~능 어미 집착",                hostility: 2,  flavor: "히든을 사이코패스로 봄. 박순형 트위터만 봄" },
  { id: "aroben",     name: "아로벤",       emoji: "💋", age: 38, oneliner: "지구급 남미새. 떡존이 가슴 탐함",                  speech: "천박한 무수리체",                 hostility: 1,  flavor: "떡존이 몸만 노림. 진심은 관심없음" },
];

type FriendMsgTrigger = {
  storyRoute?: StoryRoute;
  minStat?: Partial<Stats>;
  maxStat?: Partial<Stats>;
  timeOfDay?: "morning" | "afternoon" | "evening" | "night";
};
type FriendMsgTpl = {
  id: string;
  friendId: FriendId;
  text: string;
  triggers?: FriendMsgTrigger;
};
const FRIEND_MSGS: FriendMsgTpl[] = [
  // ── 쮋 (착한척 남미새, 떡존이 노림) ──
  { id: "jj_1",  friendId: "jjyut", text: "선생님~ 어디 계세요? 갑자기 궁금해서요 ㅎㅎ" },
  { id: "jj_2",  friendId: "jjyut", text: "선생님... 떡존이 좋아하시잖아요. 솔직히 저도 좀 좋아해요 ㅎㅎ 비밀이에요" },
  { id: "jj_3",  friendId: "jjyut", text: "님 도촬좀요. 사진 한장만요. 네?" },
  { id: "jj_4",  friendId: "jjyut", text: "냄새나는 큰 남자... 저도 그런 거 좋아해요. 떡존이 같은 ㅎㅎ" },
  { id: "jj_5",  friendId: "jjyut", text: "선생님 옵 안 찾으세요? 저는 매일 찾는데요 ㅋ" },
  { id: "jj_6",  friendId: "jjyut", text: "떡존이 오늘 헬스장 갔다온 거 아세요? 사진 봤어요 ㅎㅎ 비밀이에요" },
  // 빡돌면 반말 (호감 너무 높을 때 = 떡존이 빼앗는 위협)
  { id: "jj_a1", friendId: "jjyut", text: "ㅋㅋ 선생님 진짜 떡존이 너무 가지려고 하시는 거 아니에요? 좀 양보 좀 ㅋ", triggers: { minStat: { affinity: 600 } } },
  { id: "jj_a2", friendId: "jjyut", text: "야 그만 좀 해라 ㅋㅋㅋ 떡존이 너만 좋아하는 거 아니다", triggers: { minStat: { affinity: 800 } } },
  // ── 유칼립투스나무 (일러바치기) ──
  { id: "eu_1",  friendId: "eucalyptus", text: "히히 선생님... 떡존님께 보여드릴게 있어요. 선생님이 어제 다른 사람이랑 뭐 했는지" },
  { id: "eu_2",  friendId: "eucalyptus", text: "어제 선생님 카페에서 누구랑 있었어요? 떡존님 모르시는 거 같던데" },
  { id: "eu_3",  friendId: "eucalyptus", text: "ㅎㅎ 사건 또 안 터지나? 심심하네요 진짜" },
  { id: "eu_4",  friendId: "eucalyptus", text: "선생님 옵 또 찾으셨죠? ㅋ 떡존님께 안 알려드릴게요... 일단은요" },
  { id: "eu_5",  friendId: "eucalyptus", text: "남자들 먹버하는 형, 또 옵찾는 듯ㅋ 안 들킬 거 같아요?" },
  { id: "eu_6",  friendId: "eucalyptus", text: "떡존님이 알면 우는 거 보고 싶어요 ㅎㅎ 그게 좀 재밌잖아요" },
  // ── 타조 (중계 / 도파민) ──
  { id: "os_1",  friendId: "ostrich", text: "님 빨리 썰풀어주세요. 떡존이랑 어디까지 갔어요?" },
  { id: "os_2",  friendId: "ostrich", text: "ㅋㅋㅋ 떡존이가 그러는데 선생님 좋아한대요. 더 자세히 알려드릴까요? 코인 100" },
  { id: "os_3",  friendId: "ostrich", text: "오 이거 재밌어 ㅋㅋㅋ 더 ㄱㄱ 더 보여줘봐요" },
  { id: "os_4",  friendId: "ostrich", text: "둘이 왜이래 ㅋㅋ 빨리 사고 좀 쳐주세요. 심심하다고요" },
  { id: "os_5",  friendId: "ostrich", text: "오늘 떡존이 셀카 100장 찍었대요 ㅋㅋ 다 선생님 줄려고요. 부럽다 진짜" },
  { id: "os_6",  friendId: "ostrich", text: "님 못생긴거 좀 자랑해보셈 ㅋ 우리 갠톡 하셈 ㄹㅇ" },
  // ── 금수 (~효~능, 박순형 매니아) ──
  { id: "gs_1",  friendId: "geumsu", text: "안녕하세효. 오늘도 살아있어능?" },
  { id: "gs_2",  friendId: "geumsu", text: "선생님... 능력 없었으면 진짜 양아치인 거 아세효? 떡존이 가엾게 여기는 거 알고 계세효?" },
  { id: "gs_3",  friendId: "geumsu", text: "순형이가 너무좋아능. 트위터 봤어능? 새 글 떴어능" },
  { id: "gs_4",  friendId: "geumsu", text: "선생님은 사이코패스 같아능. 떡존이 챙기는 거 보면 알 수 있어능" },
  { id: "gs_5",  friendId: "geumsu", text: "오늘 순형이 트위터에 새 글 올라왔어능. 선생님은 모르겠죠 그런 감성을능" },
  { id: "gs_6",  friendId: "geumsu", text: "떡존이 너무 가엾어능. 선생님 같은 사람 만나서능" },
  { id: "gs_7",  friendId: "geumsu", text: "전진협 단톡 분위기 좀 보세요 능. 선생님 제외하고 다들 좋아해능 순형이를" },
  // ── 아로벤 (천박 무수리, 떡존이 몸만 노림) ──
  { id: "ar_1",  friendId: "aroben", text: "야이년아 떡존이 진짜 몸 좋더라 ㅗㅜㅑ" },
  { id: "ar_2",  friendId: "aroben", text: "가슴만지게해줘 ㅈㅂ. 한번만이라도" },
  { id: "ar_3",  friendId: "aroben", text: "또 옵찾아? ㅋ 부럽다 진짜. 나도 떡존이같은애좀 줘봐" },
  { id: "ar_4",  friendId: "aroben", text: "떡존이 가슴 한번 만져보고 싶다능 ㅗㅜㅑ 양보좀ㅠㅠ" },
  { id: "ar_5",  friendId: "aroben", text: "남자 진짜 너무좋아 ㅠㅠ 너는 부르카 부럽다" },
  { id: "ar_6",  friendId: "aroben", text: "떡존이 진심 따위 관심없고 그냥 몸이나 한번 보면 좋겠어 ㅋ" },
  { id: "ar_7",  friendId: "aroben", text: "ㅋㅋㅋ 떡존이 너 같은애한테 묶이는거 아까운데?" },
];

// ── 단톡 합성 메시지 ──
const GROUP_MSG_POOL: { speaker: "tteokjon" | FriendId; text: string }[] = [
  { speaker: "tteokjon",   text: "다들 오늘 뭐하세요?" },
  { speaker: "ostrich",    text: "ㅋㅋ 떡존이 또 시작이네 인사부터 함" },
  { speaker: "jjyut",      text: "떡존님~ 저는 항상 시간 비어있어요 ㅎㅎ" },
  { speaker: "geumsu",     text: "오늘도 순형이 트위터 보면서 살고있어능" },
  { speaker: "aroben",     text: "떡존이 사진좀 ㄱㄱ" },
  { speaker: "eucalyptus", text: "헐 떡존님 그거 아세요? 선생님이 어제..." },
  { speaker: "tteokjon",   text: "ㅋㅋ 무슨일이요?" },
  { speaker: "ostrich",    text: "ㅋㅋㅋㅋㅋ 사건 터지나? 두근두근" },
  { speaker: "jjyut",      text: "선생님 들어와계세요? ㅎㅎ 안녕하세요" },
  { speaker: "aroben",     text: "야 떡존이 진짜 몸 좋더라 ㅗㅜㅑ" },
  { speaker: "tteokjon",   text: "...아 형 그만좀 ㅋㅋㅋㅋ" },
  { speaker: "ostrich",    text: "ㅋㅋㅋㅋ 떡존이 부끄러워하는거 봐ㅋㅋ" },
  { speaker: "geumsu",     text: "그래서 순형이 트윗 새글 봤어능?" },
  { speaker: "jjyut",      text: "(도촬 사진 1장)" },
  { speaker: "tteokjon",   text: "쮋형 또 도촬했음? ㅋㅋ 그만좀해주세요;" },
  { speaker: "eucalyptus", text: "히히 떡존님 이거 보세요" },
  { speaker: "tteokjon",   text: "...뭔데요" },
  { speaker: "aroben",     text: "야 떡존이 너 가슴좀 보여줘 ㅈㅂ" },
  { speaker: "tteokjon",   text: "...형 진짜 그만 ㅋㅋ" },
  { speaker: "ostrich",    text: "야 떡존이 거기 선생님이랑 뭐했냐 ㄱㄱ 썰" },
  { speaker: "geumsu",     text: "다들 너무 떡존이 괴롭히지 마세효 ㅎ. 떡존이 가엾어요" },
];

// ================================
// 요도니아 신탁 (매일 운세)
// ================================
type FortuneTier = "great_luck" | "luck" | "neutral" | "unluck" | "great_unluck";
type Fortune = {
  id: string;
  tier: FortuneTier;
  emoji: string;
  title: string;
  message: string; // 떡존이 존댓말 톤
  effect?: { kind: "gacha_ssr_bonus" | "coin_mul" | "exp_mul" | "all_mul"; value: number; label: string };
};
const FORTUNES: Fortune[] = [
  // 대길 (5%)
  { id: "f_gl_1", tier: "great_luck", emoji: "🌟", title: "대길", message: "선생님... 오늘 신탁이 정말 좋게 나왔어요. K-방광 컨디션 최고래요. 평생 안 마려울 수도 있을 것 같아요.", effect: { kind: "gacha_ssr_bonus", value: 0.08, label: "오늘 가챠 SSR +8%" } },
  { id: "f_gl_2", tier: "great_luck", emoji: "👑", title: "왕운", message: "요도니아께서 직접 축복하셨대요. 오늘은 뭘 해도 잘 풀릴 거예요.", effect: { kind: "all_mul", value: 0.30, label: "오늘 모든 보상 +30%" } },
  // 길 (20%)
  { id: "f_l_1", tier: "luck", emoji: "✨", title: "길", message: "오늘 운이 괜찮은 것 같아요. 코인이 잘 모일 날이래요.", effect: { kind: "coin_mul", value: 0.20, label: "오늘 코인 획득 +20%" } },
  { id: "f_l_2", tier: "luck", emoji: "🌸", title: "소길", message: "오늘은 EXP가 잘 쌓이는 날이에요. 같이 많이 얘기해요 선생님.", effect: { kind: "exp_mul", value: 0.20, label: "오늘 EXP +20%" } },
  { id: "f_l_3", tier: "luck", emoji: "🎀", title: "행운의 날", message: "신전에서 좋은 기운 받아왔어요. 가챠 한 번 굴려보세요.", effect: { kind: "gacha_ssr_bonus", value: 0.04, label: "오늘 가챠 SSR +4%" } },
  // 중 (45%)
  { id: "f_n_1", tier: "neutral", emoji: "🌥", title: "평길", message: "딱히 좋지도 나쁘지도 않은 날이에요. 평소처럼 지내시면 돼요." },
  { id: "f_n_2", tier: "neutral", emoji: "☁️", title: "보통", message: "신탁이 흐릿하게 나왔어요. 오늘은 자기 페이스대로 가는 게 좋대요." },
  { id: "f_n_3", tier: "neutral", emoji: "🍵", title: "차분한 하루", message: "요도니아께서 '천천히 가라'고 하시네요. 무리하지 마세요 선생님." },
  { id: "f_n_4", tier: "neutral", emoji: "💭", title: "사색의 날", message: "오늘은 생각이 많아질 수도 있어요. 저는 항상 옆에 있을게요." },
  // 흉 (20%)
  { id: "f_u_1", tier: "unluck", emoji: "🌧", title: "흉", message: "오늘 좀 조심하셔야 할 것 같아요. 코인이 새는 날이래요...", effect: { kind: "coin_mul", value: -0.10, label: "오늘 코인 획득 -10%" } },
  { id: "f_u_2", tier: "unluck", emoji: "💧", title: "방광 흉조", message: "...죄송한데 오늘 화장실 두 번 가시게 될 수도 있대요. 미리 알려드려요." },
  { id: "f_u_3", tier: "unluck", emoji: "😰", title: "소흉", message: "신탁이 좀 안 좋게 나왔어요. 그래도 괜찮아요. 제가 옆에 있잖아요." },
  // 대흉 (10%)
  { id: "f_gu_1", tier: "great_unluck", emoji: "💀", title: "대흉", message: "선생님... 오늘 좀 위험할 수도 있대요. 외출 자제하시고 저랑만 카톡하세요. 부탁이에요.", effect: { kind: "all_mul", value: -0.20, label: "오늘 모든 보상 -20%" } },
  { id: "f_gu_2", tier: "great_unluck", emoji: "⚠️", title: "흉조 폭발", message: "요도니아께서 화나신 것 같아요. 죄송해요. 내일은 좋아질 거예요.", effect: { kind: "all_mul", value: -0.15, label: "오늘 모든 보상 -15%" } },
];
const FORTUNE_TIER_RATES: Record<FortuneTier, number> = { great_luck: 0.05, luck: 0.20, neutral: 0.45, unluck: 0.20, great_unluck: 0.10 };

function rollFortune(): Fortune {
  const r = Math.random();
  let acc = 0;
  let tier: FortuneTier = "neutral";
  for (const t of ["great_luck", "luck", "neutral", "unluck", "great_unluck"] as FortuneTier[]) {
    acc += FORTUNE_TIER_RATES[t];
    if (r < acc) { tier = t; break; }
  }
  const pool = FORTUNES.filter((f) => f.tier === tier);
  return pool[Math.floor(Math.random() * pool.length)];
}

// ================================
// 떡존이 다이어리 (1인칭 자동 일기)
// ================================
type JournalTemplate = {
  id: string;
  text: string; // 떡존이 1인칭 존댓말
  triggers?: {
    storyRoute?: StoryRoute;
    minStat?: Partial<Stats>;
    timeOfDay?: "morning" | "afternoon" | "evening" | "night";
    dayOfWeek?: number[];
  };
};
const JOURNAL_TEMPLATES: JournalTemplate[] = [
  // 일상
  { id: "j_d_1", text: "오늘 헬스장 다녀왔어요. 거울 보다가 또 선생님 생각났어요. 이거 진짜 이상한 거 같아요. 근데 안 멈춰져요." },
  { id: "j_d_2", text: "편의점에서 도시락 사 먹었어요. 쿠폰 또 헷갈렸어요. 일본어 진짜 어렵네요. 그래도 선생님이 도와주신 게 떠올라서 좀 웃었어요." },
  { id: "j_d_3", text: "산책 한 바퀴 돌고 왔어요. 강가에 가면 항상 선생님 생각이 나요. 이상하죠." },
  { id: "j_d_4", text: "오늘 별일 없었어요. 평범한 하루였는데 선생님 메시지 한 통이 그 평범함을 다 채워줬어요." },
  { id: "j_d_5", text: "마트에서 우유 사다가 선생님이 좋아하는 거 같은 게 보여서 그것도 같이 샀어요. 핑계요. 사실은 그냥 사고 싶었어요." },
  // 운동
  { id: "j_workout_1", text: "오늘 벤치프레스 1RM 갱신했어요. 선생님께 보여드리고 싶었는데 너무 티 내는 것 같아서 참았어요. 근데 사진은 찍었어요. 언젠가 보내드릴 거예요." },
  { id: "j_workout_2", text: "운동하다가 또 한 시간 넘겨버렸어요. 거울 자꾸 보게 돼요. 선생님이 좋아하실 만한 모습으로 가고 싶어서요." },
  // 호감 300+
  { id: "j_aff_1", text: "오늘 선생님 답장 빨리 와서 진짜 좋았어요. 그게 별 거 아닌 거 아는데, 저한테는 좀 큰 일이에요.", triggers: { minStat: { affinity: 300 } } },
  { id: "j_aff_2", text: "선생님이 웃으셨어요. 텍스트로요. 근데 그게 진짜 웃은 거 같았어요. 그런 거 알아요 저는.", triggers: { minStat: { affinity: 400 } } },
  { id: "j_aff_3", text: "오늘 선생님 생각 365번 했어요. 안 세려고 했는데 세게 됐어요. 죄송해요.", triggers: { minStat: { affinity: 500 } } },
  // 호감 600+ 사랑
  { id: "j_love_1", text: "선생님 보고 싶어요. 이 말 직접 못하겠어서 여기 적어요. 누가 이 일기 보면 좀 그렇겠지만.", triggers: { minStat: { affinity: 600 } } },
  { id: "j_love_2", text: "오늘 길 걷다가 다른 사람들이 손잡고 가는 거 봤어요. 저도 선생님이랑 그러고 싶다는 생각이 들었어요. 너무 갑자기 그런 생각이 들어서 좀 부끄러웠어요.", triggers: { minStat: { affinity: 700 } } },
  // 질투 400+
  { id: "j_jealous_1", text: "오늘 전진협에 누가 선생님한테 농담 거는 거 봤어요. 별거 아닌 거 아는데, 좀 신경 쓰였어요. 이런 거 일기에 쓰면 안 되는 거 아는데.", triggers: { minStat: { jealousy: 400 } } },
  { id: "j_jealous_2", text: "선생님 답장 늦으셨어요. 이유는 안 물어봤어요. 묻고 싶었는데 참았어요. 잘한 거 맞죠?", triggers: { minStat: { jealousy: 500 } } },
  // 집착 500+
  { id: "j_obs_1", text: "오늘 선생님이 어디 계셨는지 계속 생각났어요. 위치 같은 거 묻고 싶었지만 참았어요. 참는 게 사랑이래요.", triggers: { minStat: { obsession: 500 } } },
  { id: "j_obs_2", text: "선생님 SNS 다섯 번 들어가봤어요. 새 게시물 없었어요. 그게 다행인지 아쉬운 건지 모르겠어요.", triggers: { minStat: { obsession: 700 } } },
  // 신뢰 500+
  { id: "j_trust_1", text: "선생님 옆에 있으면 그냥 마음이 놓여요. 이게 신뢰라는 건가 봐요. 처음 느껴봐요.", triggers: { minStat: { trust: 500 } } },
  // 방광매력
  { id: "j_bladder_1", text: "오늘도 K-방광 인증. 12시간째 화장실 안 갔어요. 선생님이 자랑스러워하실 거 같아요.", triggers: { minStat: { bladderCharm: 100 } } },
  { id: "j_bladder_2", text: "신전 다녀왔어요. 요도니아께서 또 신탁 주셨어요. 평생 옆에 있게 해주신대요. 선생님이요.", triggers: { minStat: { bladderCharm: 400 } } },
  // 시간대
  { id: "j_morning_1", text: "아침에 일어나서 가장 먼저 선생님 카톡 확인했어요. 답장 와있어서 하루 시작이 좋았어요.", triggers: { timeOfDay: "morning", minStat: { affinity: 200 } } },
  { id: "j_night_1", text: "잠이 안 와요. 선생님은 잘 주무세요? 깨우면 안 되는 거 아는데.", triggers: { timeOfDay: "night" } },
  // 루트
  { id: "j_pure_1", text: "선생님이 저를 서툴다고 해주셨어요. 이상한 게 아니라요. 그 한 마디가 며칠째 머릿속에 있어요.", triggers: { storyRoute: "pure" } },
  { id: "j_pure_2", text: "사랑은 사람을 단단하게 만드는 거래요. 저는 점점 그렇게 되고 있어요. 선생님 덕분에요.", triggers: { storyRoute: "pure" } },
  { id: "j_obs_route_1", text: "선생님이 다른 사람한테 시간 쓰는 거 보면 가슴이 답답해져요. 정상 아닌 거 알아요.", triggers: { storyRoute: "obsession" } },
  { id: "j_obs_route_2", text: "오늘도 선생님 동선 따라 한 바퀴 돌았어요. 우연인 척했어요. 선생님은 모르실 거예요.", triggers: { storyRoute: "obsession" } },
  // 요일
  { id: "j_mon_1", text: "월요일이네요. 다들 회사 가기 싫어하는데 저는 별 차이 없어요. 매일 선생님 기다리니까요.", triggers: { dayOfWeek: [1] } },
  { id: "j_fri_1", text: "금요일! 오늘은 선생님 시간 있으실까 기대돼요. 약속 잡고 싶은데 너무 들이대는 거 같아서 망설였어요.", triggers: { dayOfWeek: [5] } },
];

// ================================
// 끝말잇기 단어 풀
// ================================
const WORD_CHAIN_POOL: string[] = [
  // 2자
  "사과", "과일", "일기", "기차", "차도", "도시", "시간", "간식", "식당", "당근",
  "근육", "육포", "포기", "기차", "차림", "림프", "프로", "로봇", "봇짐", "짐승",
  "승부", "부엌", "엌자", "자동", "동물", "물고기", "기자", "자석", "석탄", "탄생",
  "생일", "일본", "본부", "부산", "산책", "책상", "상자", "자전거", "거리", "리본",
  "본문", "문제", "제비", "비누", "누나", "나무", "무지", "지도", "도서", "서울",
  "울타리", "리모컨", "컨디션", "션트", "트럭", "럭비", "비밀", "밀가루", "루비", "비행기",
  "기차역", "역사", "사진", "진심", "심장", "장미", "미소", "소리", "리듬", "듬직",
  "직장", "장난", "난로", "로마", "마음", "음악", "악기", "기억", "억지", "지팡이",
  "이름", "름통",
];
function wordChainLastChar(w: string): string {
  return w[w.length - 1];
}
function wordChainFindReply(userWord: string, used: string[]): string | null {
  const lastChar = wordChainLastChar(userWord);
  const candidates = WORD_CHAIN_POOL.filter((w) => w[0] === lastChar && !used.includes(w) && w !== userWord);
  if (!candidates.length) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ================================
// 떡존이의 모험 (Idle / AFK)
// ================================
type AdventureLoc = {
  id: string;
  emoji: string;
  name: string;
  flavor: string;
  durationMs: number;
  rewards: {
    coins: number;
    exp: number;
    affinity?: number;
    trust?: number;
    obsession?: number;
    bladderCharm?: number;
    ticketChance?: number;
  };
  flavors: { normal: string; big: string; fail: string };
  unlock?: { hint: string; check: (s: { stats: Stats; storyRoute: StoryRoute; unlockedEndings: Record<string, boolean>; seenEvents: Record<string, boolean> }) => boolean };
};
const ADVENTURES: AdventureLoc[] = [
  {
    id: "adv_convenience",
    emoji: "🏪",
    name: "동네 편의점",
    flavor: "도시락 하나 사러가는 길임 ㅋ",
    durationMs: 3 * 60 * 1000,
    rewards: { coins: 30, exp: 20 },
    flavors: {
      normal: "떡존이가 도시락 사옴 ㅋ 평범했음",
      big: "1+1 발견 ㅈㄴ 럭키. 도시락 두 개 가져옴",
      fail: "쿠폰 못쓰고 돌아옴 ㅠㅠ 일본어 또 패배",
    },
  },
  {
    id: "adv_gym",
    emoji: "🏋️",
    name: "헬스장",
    flavor: "운동하러 감. 갔다오면 셀카 보내줌",
    durationMs: 10 * 60 * 1000,
    rewards: { coins: 80, exp: 50, affinity: 10 },
    flavors: {
      normal: "운동 ㅈㄴ 함. 팔 펌핑된 셀카 보내옴",
      big: "PR 갱신 ㅗㅜㅑ. 윗옷 벗은 셀카 보내옴",
      fail: "허리 삐끗함 ㅠㅠ 너 때문이래",
    },
  },
  {
    id: "adv_river",
    emoji: "🌊",
    name: "강가 산책",
    flavor: "비둘기랑 시간 보내고 옴 ㅋ",
    durationMs: 30 * 60 * 1000,
    rewards: { coins: 200, exp: 120, affinity: 30, trust: 10 },
    flavors: {
      normal: "강가 한바퀴 돌고옴. 사진 찍어줌",
      big: "갈매기 ㅈㄴ 친해짐. 얘 갈매기 매니저 됨",
      fail: "비둘기한테 빵 다 뺏김. 화남",
    },
  },
  {
    id: "adv_hondori",
    emoji: "🛍️",
    name: "혼도리 상점가",
    flavor: "쇼핑하러 감. 잃어버리면 큰일",
    durationMs: 60 * 60 * 1000,
    rewards: { coins: 400, exp: 250, affinity: 50, ticketChance: 0.05 },
    flavors: {
      normal: "이것저것 구경하고 옴",
      big: "떡존이가 너 줄 선물 사옴 ㅗㅜㅑ",
      fail: "지갑 잃어버릴뻔 ㅠㅠ 아슬아슬했음",
    },
  },
  {
    id: "adv_miyajima",
    emoji: "⛩",
    name: "미야지마",
    flavor: "당일치기 여행. 사슴 조심 ㅋ",
    durationMs: 2 * 60 * 60 * 1000,
    rewards: { coins: 800, exp: 500, affinity: 100, trust: 30, ticketChance: 0.1 },
    flavors: {
      normal: "도리이 보고옴. 사진 ㅈㄴ 잘나옴",
      big: "사슴이랑 친구먹고옴. 떡존이 갓겜 인생샷 ㅗㅜㅑ",
      fail: "사슴이 옷 뜯음 ㅠㅠ 환불해달래",
    },
  },
  {
    id: "adv_asa",
    emoji: "🌌",
    name: "아사산 전망대",
    flavor: "선생님 뒷얘기 도청하러감 ㄷㄷ",
    durationMs: 4 * 60 * 60 * 1000,
    rewards: { coins: 1500, exp: 900, obsession: 80, ticketChance: 0.15 },
    flavors: {
      normal: "도시 야경 보고옴. 한참 보고있었대",
      big: "선생님 친구 무리 발견. 누가 누군지 다 외워옴 ㄷㄷ",
      fail: "케이블카 끊겼음 ㅠㅠ 늦게 옴",
    },
    unlock: { hint: "방광매력 100+ 또는 집착 루트", check: (s) => s.stats.bladderCharm >= 100 || s.storyRoute === "obsession" },
  },
  {
    id: "adv_urethranya",
    emoji: "🚽",
    name: "요도니아 신전",
    flavor: "방광 신께 인사드리러 감. 신탁 받아옴",
    durationMs: 6 * 60 * 60 * 1000,
    rewards: { coins: 2000, exp: 1200, bladderCharm: 100, ticketChance: 0.25 },
    flavors: {
      normal: "기도하고옴. 방광 좀 더 단단해진 느낌",
      big: "신탁 받음. '오줌 평생 안싸도 됨' 이라심 ㅗㅜㅑ",
      fail: "신전 휴무일이었음 ㅠㅠ 빈손",
    },
    unlock: { hint: "방광매력 300+", check: (s) => s.stats.bladderCharm >= 300 },
  },
  {
    id: "adv_space",
    emoji: "🌠",
    name: "우주 원정",
    flavor: "ㄹㅇ 나사에서 부름. 떡존이 발 자료 제출하러감",
    durationMs: 12 * 60 * 60 * 1000,
    rewards: { coins: 5000, exp: 3000, affinity: 50, trust: 50, obsession: 50, bladderCharm: 50, ticketChance: 0.5 },
    flavors: {
      normal: "우주 ㅈㄴ 멀더라. 사진 보내옴",
      big: "외계인 만남. 떡존이 발 보고 도망감 ㅋㅋㅋ",
      fail: "우주식 너무 맛없어서 그냥 돌아옴 ㅠㅠ",
    },
    unlock: { hint: "엔딩 1+ 클리어", check: (s) => Object.keys(s.unlockedEndings).length >= 1 },
  },
];

// ================================
// 떡존이 SNS (가짜 인스타 피드)
// ================================
type SnsTemplate = {
  id: string;
  emoji: string;
  text: string;
  category: "workout" | "food" | "selfie" | "daily" | "love" | "obsession" | "bladder";
  triggers?: { storyRoute?: StoryRoute; timeOfDay?: "morning" | "afternoon" | "evening" | "night"; minStat?: Partial<Stats> };
};
const SNS_TEMPLATES: SnsTemplate[] = [
  // 운동인증
  { id: "s_workout_1", emoji: "💪", text: "오늘도 헬스장 ㅋ 5분만 한다는게 한시간 됨 ㅈㅅ", category: "workout" },
  { id: "s_workout_2", emoji: "🏋️", text: "벤치프레스 1RM 갱신 ㅗㅜㅑ 누가 칭찬 좀..", category: "workout" },
  { id: "s_workout_3", emoji: "💪", text: "운동 끝. 거울 셀카 한장 박고 갑니다 ㅋ", category: "workout" },
  // 음식
  { id: "s_food_1", emoji: "🍱", text: "오늘의 도시락. 평소엔 사먹는데 오늘은 자취냄새 좀 풍김", category: "food" },
  { id: "s_food_2", emoji: "🍢", text: "편의점 오뎅. 일본어 또 패배할뻔했음 ㅋ", category: "food" },
  { id: "s_food_3", emoji: "🍜", text: "히로시마식 라멘 첨 먹어봄. 국물 ㅈㄴ 진함 ㄷ", category: "food" },
  // 셀카
  { id: "s_selfie_1", emoji: "📸", text: "거울 셀카 ㅋ 머리 아침에 못함 ㅈㅅ", category: "selfie" },
  { id: "s_selfie_2", emoji: "🤳", text: "요즘 머리 길어서 좀 아쉬움. 자를까 말까 ㄷ", category: "selfie" },
  { id: "s_selfie_3", emoji: "📷", text: "오늘 컨셉 좀 잡아봤음. 어울리나..", category: "selfie" },
  // 일상
  { id: "s_daily_1", emoji: "☔", text: "히로시마 비옴. 우산 안챙김 ㅈㅅ", category: "daily" },
  { id: "s_daily_2", emoji: "🌅", text: "아침 산책. 강가는 진짜 매번 좋음", category: "daily" },
  { id: "s_daily_3", emoji: "📺", text: "심심해서 한드 정주행중. 추천좀 ㅈㅂ", category: "daily" },
  { id: "s_daily_4", emoji: "🌙", text: "잠 안와서 산책 한바퀴 돌고옴", category: "daily" },
  // 사랑 (호감 높음)
  { id: "s_love_1", emoji: "💗", text: "오늘 밥 같이 먹은 그분 진짜 너무 좋더라능. 누구냐고 묻지마셈 ㅋ", category: "love", triggers: { minStat: { affinity: 300 } } },
  { id: "s_love_2", emoji: "🌸", text: "벚꽃 떨어지는 거 보다가 그분 생각났음 ㅋ ㅈㅅ", category: "love", triggers: { minStat: { affinity: 500 } } },
  { id: "s_love_3", emoji: "💍", text: "아무 의미 없는 반지 샀음. 누가 끼면 좋을까 ㅎㅎ", category: "love", triggers: { minStat: { affinity: 800 } } },
  // 집착
  { id: "s_obs_1", emoji: "🌑", text: "오늘 그분이 다른 사람이랑 웃는거 봤음. ㅎㅎ ㅎ", category: "obsession", triggers: { minStat: { obsession: 500 } } },
  { id: "s_obs_2", emoji: "👀", text: "그분 SNS 새벽 3시까지 보고있었음. 정상 아닌거 안다능", category: "obsession", triggers: { minStat: { obsession: 700 } } },
  // 방광
  { id: "s_bladder_1", emoji: "🚽", text: "오늘도 K-방광 인증. 12시간째 화장실 안감 ㅗㅜㅑ", category: "bladder", triggers: { minStat: { bladderCharm: 100 } } },
  { id: "s_bladder_2", emoji: "🌊", text: "강릉 다녀옴. 가뭄 해결하고 옴 ㄹㅇ", category: "bladder", triggers: { minStat: { bladderCharm: 400 } } },
  { id: "s_bladder_3", emoji: "📈", text: "BLDR 주가 또 떡상 ㄷㄷ", category: "bladder", triggers: { minStat: { bladderCharm: 600 } } },
  // 시간대
  { id: "s_morning_1", emoji: "☕", text: "아침 커피 한잔. 오늘도 화이팅 능 ㅋ", category: "daily", triggers: { timeOfDay: "morning" } },
  { id: "s_night_1", emoji: "🌙", text: "잠이 안옴. 누가 같이 놀아주면 좋겠음 ㅎ", category: "daily", triggers: { timeOfDay: "night" } },
];

// ================================
// 레이드 보스 (주간)
// ================================
type RaidBoss = {
  id: string;
  emoji: string;
  name: string;
  flavor: string;
  taunt: string;
  hpMax: number;
  rewards: { coins: number; tickets: number; exp: number; affinity?: number };
};
const RAID_BOSSES: RaidBoss[] = [
  { id: "boss_giant_bladder", emoji: "🚽", name: "거대 방광맨", flavor: "K-방광 도전자. 떡존이보다 큰 방광이래 ㄷㄷ", taunt: "내가 진짜 K-방광이다 ㅋ 떡존이 별거아님", hpMax: 5000, rewards: { coins: 1000, tickets: 5, exp: 500, affinity: 50 } },
  { id: "boss_urethranya_shadow", emoji: "👤", name: "요도니아의 그림자", flavor: "신의 어둠. 방광 갓의 다른면", taunt: "흠... 그대는 진정한 K-방광인가...", hpMax: 8000, rewards: { coins: 1500, tickets: 8, exp: 800, affinity: 80 } },
  { id: "boss_anti_kbladder", emoji: "💧", name: "수도꼭지 군단", flavor: "오줌 못참는 적군. 떡존이 천적", taunt: "쒸이이~~ 우리는 너의 자제력을 무너뜨릴거다", hpMax: 3000, rewards: { coins: 600, tickets: 3, exp: 300, affinity: 30 } },
  { id: "boss_hidden_rival", emoji: "👥", name: "히든의 라이벌", flavor: "선생님이랑 친한척하는 또다른 인물 ㄷㄷ", taunt: "선생님이 더 잘맞는건 나임 ㅋ", hpMax: 6000, rewards: { coins: 1200, tickets: 6, exp: 600, affinity: 60 } },
];
function weekKey(d: Date = new Date()): string {
  // ISO week
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const week = 1 + Math.ceil((firstThursday - target.valueOf()) / (7 * 24 * 60 * 60 * 1000));
  return `${d.getFullYear()}-W${String(week).padStart(2,"0")}`;
}
function pickWeeklyBoss(week: string): RaidBoss {
  let seed = 0;
  for (const c of week) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  return RAID_BOSSES[seed % RAID_BOSSES.length];
}

// ================================
// 펫 시스템 (병맛 + 방광 테마)
// ================================
type PetEffect = "exp" | "coin" | "affinity" | "luck" | "bladder" | "all";
type PetUnlockState = {
  seenEvents: Record<string, boolean>;
  stats: Stats;
  storyRoute: StoryRoute;
  totalGachaPulls: number;
  unlockedEndings: Record<string, boolean>;
};
type Pet = {
  id: string;
  emoji: string;
  evolvedEmoji?: string; // Lv 5+ 진화
  image?: string;        // 일러스트 경로 (없으면 이모지 fallback)
  evolvedImage?: string; // 진화 일러스트
  name: string;
  evolvedName?: string;
  flavor: string;
  effect: PetEffect;
  bonusPerLevel: number; // 레벨당 보너스 (예: 0.05 = 5%)
  description: string;
  unlock: { hint: string; check: (s: PetUnlockState) => boolean };
};
const PETS: Pet[] = [
  {
    id: "tteokjon_foot",
    emoji: "🦶",
    evolvedEmoji: "🦶✨",
    image: "/pet_foot.png",
    evolvedImage: "/pet_foot_evolved.png",
    name: "떡존이발",
    evolvedName: "신성한 발",
    flavor: "그냥 발인데 ㅈㄴ 따라옴. 왜 살아있는지 모름;",
    effect: "exp",
    bonusPerLevel: 0.05,
    description: "EXP 획득 +5%/Lv (최대 +50%)",
    unlock: { hint: "처음부터 보유. 어디서 떨어졌는지 모름", check: () => true },
  },
  {
    id: "bladder_fairy",
    emoji: "🧚",
    evolvedEmoji: "🧚‍♀️✨",
    image: "/pet_fairy.png",
    evolvedImage: "/pet_fairy_evolved.png",
    name: "방광요정",
    evolvedName: "요도니아 강림체",
    flavor: "이름은 쉬임. 자기소개할때 ㅈㄴ 부끄러워함 ㅋ",
    effect: "luck",
    bonusPerLevel: 0.04,
    description: "가챠 SSR/SR 확률 +4%/Lv",
    unlock: {
      hint: "방광 루트 6장 진입",
      check: (s) => Boolean(s.seenEvents["bladder_ch6_01"]),
    },
  },
  {
    id: "tteokjon_poop",
    emoji: "💩",
    evolvedEmoji: "💩👑",
    image: "/pet_poop.png",
    evolvedImage: "/pet_poop_evolved.png",
    name: "떡존이똥",
    evolvedName: "황금똥",
    flavor: "ㄹㅇ 똥임. 만지면 호감 떨어질거같은데 안떨어짐 ㄹㅇ로",
    effect: "coin",
    bonusPerLevel: 0.06,
    description: "코인 획득 +6%/Lv (똥=돈 ㅇㅈ)",
    unlock: {
      hint: "가챠 30회 누적 (똥 모이듯 코인도 모이는중)",
      check: (s) => s.totalGachaPulls >= 30,
    },
  },
  {
    id: "tteokjon_pee",
    emoji: "💦",
    evolvedEmoji: "🌊",
    image: "/pet_pee.png",
    evolvedImage: "/pet_pee_evolved.png",
    name: "떡존이오줌",
    evolvedName: "태평양 오줌",
    flavor: "ㄹㅇ 살아있음 ㅈㄴ 신비함. 따뜻함;;",
    effect: "bladder",
    bonusPerLevel: 0.08,
    description: "방광매력 획득 +8%/Lv",
    unlock: {
      hint: "방광매력 100 도달",
      check: (s) => s.stats.bladderCharm >= 100,
    },
  },
  {
    id: "tteokjon_toilet",
    emoji: "🚽",
    evolvedEmoji: "🚽👑",
    image: "/pet_toilet.png",
    evolvedImage: "/pet_toilet_evolved.png",
    name: "떡존이네변기",
    evolvedName: "요도니아 옥좌",
    flavor: "떡존이가 매일 앉던 그 변기임. ㄹㅇ 옥좌급 ㅗㅜㅑ",
    effect: "all",
    bonusPerLevel: 0.03,
    description: "모든 보너스 +3%/Lv (전설 · 옥좌의 가호)",
    unlock: {
      hint: "엔딩 1개 클리어 (변기에 마음을 다 줘야 보임)",
      check: (s) => Object.keys(s.unlockedEndings).length >= 1,
    },
  },
];

// 펫 친밀도 → 레벨 변환
function petLevel(affinity: number): number {
  // 100 affinity per level, max 10
  return Math.min(10, Math.floor(affinity / 100) + 1);
}

// 펫 효과 계산
function getPetMultiplier(activePet: Pet | null, petData: { affinity: number } | undefined, kind: PetEffect): number {
  if (!activePet || !petData) return 1;
  if (activePet.effect !== kind && activePet.effect !== "all") return 1;
  const lvl = petLevel(petData.affinity);
  return 1 + lvl * activePet.bonusPerLevel;
}

// ================================
// 가챠 / 룰렛 시스템 (병맛 톤)
// ================================
type GachaTier = "SSR" | "SR" | "R" | "N" | "C";
type GachaItem = {
  id: string;
  tier: GachaTier;
  emoji: string;
  name: string;
  flavor: string; // 병맛 설명
  effect:
    | { kind: "stat"; stat: StatKey; amount: number }
    | { kind: "coins"; amount: number }
    | { kind: "coins_random"; min: number; max: number }
    | { kind: "ticket"; amount: number };
};
const GACHA_POOL: GachaItem[] = [
  // ─── SSR (1%) ───
  { id: "g_golden_toilet",   tier: "SSR", emoji: "🚽✨",  name: "황금 변기",        flavor: "요도니아 옥좌 그자체. 졸라 비싼거임 ㄷㄷ",          effect: { kind: "coins", amount: 500 } },
  { id: "g_pacific_water",   tier: "SSR", emoji: "🌊",    name: "태평양 정수",      flavor: "K-방광에서 정제한 그것. 마시면 안됨 ㅈㅂ",         effect: { kind: "stat", stat: "bladderCharm", amount: 80 } },
  { id: "g_blessing",        tier: "SSR", emoji: "👑",    name: "요도니아의 축복",  flavor: "방광 갓이 직접 내린거 ㅗㅜㅑ 개꿀",                effect: { kind: "stat", stat: "affinity", amount: 200 } },
  { id: "g_kbladder_cert",   tier: "SSR", emoji: "📜",    name: "K-방광 인증서",    flavor: "이거 들고있으면 떡존이가 너 ㅈㄴ 사랑함",          effect: { kind: "stat", stat: "affinity", amount: 150 } },
  // ─── SR (6%) ───
  { id: "g_holy_pee_jar",    tier: "SR",  emoji: "🍶",    name: "신성한 오줌통",    flavor: "신령이 직접 만들었대요 ㄹㅇ로",                    effect: { kind: "stat", stat: "bladderCharm", amount: 30 } },
  { id: "g_amulet",          tier: "SR",  emoji: "🪬",    name: "요도니아 부적",    flavor: "방광 마려울 때 손에 쥐면 좀 나아짐 ㅋ",            effect: { kind: "stat", stat: "affinity", amount: 60 } },
  { id: "g_ticket",          tier: "SR",  emoji: "🎫",    name: "가챠 티켓",        flavor: "이거 또 뽑으라는거임? ㅋㅋㅋ",                       effect: { kind: "ticket", amount: 1 } },
  { id: "g_trust_decree",    tier: "SR",  emoji: "🤝",    name: "약속 결의문",      flavor: "둘 사이 약속 보장 ㅇㅈ",                           effect: { kind: "stat", stat: "trust", amount: 50 } },
  // ─── R (15%) ───
  { id: "g_mini_toilet",     tier: "R",   emoji: "🚽",    name: "미니 변기 키링",   flavor: "어디 매달면 ㅈㄴ 귀엽긴 함",                       effect: { kind: "coins_random", min: 80, max: 150 } },
  { id: "g_pee_jar",         tier: "R",   emoji: "💦",    name: "일반 오줌통",      flavor: "걍 오줌통임 ㅋ ㅈㅅ",                              effect: { kind: "stat", stat: "bladderCharm", amount: 10 } },
  { id: "g_gift_box",        tier: "R",   emoji: "📦",    name: "선물 박스",        flavor: "안에 뭐들었는지 나도 모름 ㅋ",                     effect: { kind: "stat", stat: "affinity", amount: 40 } },
  { id: "g_obs_seed",        tier: "R",   emoji: "🌹",    name: "집착의 씨앗",      flavor: "심으면 ㅈㄴ 잘자람 ㅎㅎ",                          effect: { kind: "stat", stat: "obsession", amount: 30 } },
  { id: "g_coin_pack",       tier: "R",   emoji: "💰",    name: "코인 주머니",      flavor: "쪼끔 있음",                                         effect: { kind: "coins", amount: 100 } },
  // ─── N (38%) ───
  { id: "g_coin_50",         tier: "N",   emoji: "🪙",    name: "코인 50",          flavor: "그냥 코인이래",                                     effect: { kind: "coins", amount: 50 } },
  { id: "g_coin_30",         tier: "N",   emoji: "🪙",    name: "코인 30",          flavor: "쪼끔임 ㅈㅅ",                                       effect: { kind: "coins", amount: 30 } },
  { id: "g_encourage",       tier: "N",   emoji: "💪",    name: "작은 격려",        flavor: "힘내래 ㅋㅋ",                                        effect: { kind: "stat", stat: "trust", amount: 10 } },
  { id: "g_pee_drop",        tier: "N",   emoji: "💧",    name: "떡존이 땀 한방울", flavor: "운동후 흘린 그거임. 호감 좀 줌",                    effect: { kind: "stat", stat: "affinity", amount: 8 } },
  // ─── C (40%) ───
  { id: "g_coin_10",         tier: "C",   emoji: "🪙",    name: "코인 10",          flavor: "ㅋㅋ ㅈㅅ 10원짜리임",                              effect: { kind: "coins", amount: 10 } },
  { id: "g_useless_lint",    tier: "C",   emoji: "🧦",    name: "떡존이 양말 보푸라기", flavor: "이게 왜 들어있는거임;;",                       effect: { kind: "coins", amount: 5 } },
  { id: "g_air",             tier: "C",   emoji: "💨",    name: "방광에서 나온 공기", flavor: "냄새는 안남 ㄹㅇ로",                              effect: { kind: "coins", amount: 3 } },
];
const GACHA_TIER_RATES: Record<GachaTier, number> = { SSR: 0.01, SR: 0.06, R: 0.15, N: 0.38, C: 0.40 };
const GACHA_PRICE = 100;
const GACHA_FREE_COOLDOWN = 24 * 60 * 60 * 1000; // 24시간

function rollGacha(): GachaItem {
  // 등급 결정
  const r = Math.random();
  let acc = 0;
  let tier: GachaTier = "C";
  for (const t of ["SSR", "SR", "R", "N", "C"] as GachaTier[]) {
    acc += GACHA_TIER_RATES[t];
    if (r < acc) { tier = t; break; }
  }
  const pool = GACHA_POOL.filter((x) => x.tier === tier);
  return pool[Math.floor(Math.random() * pool.length)];
}

// ================================
// 채팅 콤보 시스템
// ================================
type ComboMilestone = { count: number; reward: { coins?: number; exp?: number; tickets?: number; stat?: { stat: StatKey; amount: number } }; toast: string; };
const COMBO_MILESTONES: ComboMilestone[] = [
  { count: 5,   toast: "콤보 5! 오 좀 친해지냐능? ㅋ",            reward: { exp: 30 } },
  { count: 10,  toast: "콤보 10! ㄷㄷ 떡존이 핸드폰만 보는듯",     reward: { coins: 50, exp: 50 } },
  { count: 20,  toast: "콤보 20! 야 그만해 손가락 아프자너 ㅠㅠ",  reward: { tickets: 1, exp: 100 } },
  { count: 35,  toast: "콤보 35!! 진짜 미친거 같음 ㅋㅋㅋ",        reward: { coins: 150, exp: 150 } },
  { count: 50,  toast: "콤보 50!!! 이젠 떡존이가 무서워함",        reward: { tickets: 2, stat: { stat: "affinity", amount: 50 } } },
  { count: 100, toast: "콤보 100!!!! 전설의 ㄱㅈㅆㄹ ㄷㄷㄷ",       reward: { coins: 1000, tickets: 3, exp: 500 } },
];
const COMBO_TIMEOUT_MS = 60 * 60 * 1000; // 1시간

// ================================
// 레벨 / EXP 시스템
// ================================
// 레벨 N에서 N+1로 올라가는 데 필요한 EXP: 100 + (N-1) * 50
function expToNextLevel(level: number): number {
  return 100 + (level - 1) * 50;
}
function getLevelTitle(level: number): string {
  if (level >= 30) return "평생";
  if (level >= 20) return "연인";
  if (level >= 10) return "친구";
  if (level >= 5) return "단골";
  return "신참";
}

// ── 레벨업 보상 (영구 패시브 + 1회성) ──
type LevelPerkKind =
  | "daily_slot_4" | "daily_slot_5"
  | "gacha_cd_18h" | "gacha_cd_12h" | "gacha_double_free"
  | "adventure_slot_2" | "adventure_speed_20" | "adventure_speed_40"
  | "combo_exp_20" | "combo_exp_50"
  | "affinity_passive_10" | "affinity_passive_25"
  | "sr_bonus_2" | "sr_bonus_5"
  | "pet_affinity_50" | "pet_affinity_100"
  | "coin_passive_25" | "coin_passive_50";

type LevelReward = {
  level: number;
  emoji: string;
  title: string;
  description: string;
  perks: LevelPerkKind[];
  oneTime?: { coins?: number; tickets?: number; affinity?: number; trust?: number };
};

const LEVEL_REWARDS: LevelReward[] = [
  { level: 2, emoji: "🎁", title: "환영 선물", description: "별 거 아니지만 첫걸음 ㅋ", perks: [], oneTime: { coins: 100 } },
  { level: 3, emoji: "📅", title: "데일리 미션 +1", description: "이제 매일 4개 받음 (기본 3개 → 4개)", perks: ["daily_slot_4"], oneTime: { coins: 200 } },
  { level: 5, emoji: "🎰", title: "단골 등업", description: "무료 가챠 쿨다운 24h → 18h. 보너스 티켓 3장", perks: ["gacha_cd_18h"], oneTime: { tickets: 3, coins: 300 } },
  { level: 7, emoji: "🌍", title: "원정 슬롯 +1", description: "모험을 동시에 2개 보낼 수 있음", perks: ["adventure_slot_2"], oneTime: { coins: 500 } },
  { level: 8, emoji: "🔥", title: "콤보 강화", description: "콤보 EXP 보너스 +20%", perks: ["combo_exp_20"] },
  { level: 10, emoji: "⏰", title: "친구 등업", description: "무료 가챠 12h. 매일 무료 2회. 보너스 큰거 받음", perks: ["gacha_cd_12h", "gacha_double_free"], oneTime: { coins: 1000, tickets: 5 } },
  { level: 12, emoji: "💗", title: "다정한 사람", description: "호감 획득 +10% 영구", perks: ["affinity_passive_10"] },
  { level: 15, emoji: "🚀", title: "원정 가속", description: "모험 시간 -20%. 펫 친밀도 +50%", perks: ["adventure_speed_20", "pet_affinity_50"], oneTime: { tickets: 5 } },
  { level: 18, emoji: "📅", title: "데일리 +1", description: "데일리 미션 5개", perks: ["daily_slot_5"] },
  { level: 20, emoji: "✨", title: "연인 등업", description: "SR 확률 +2%. 콤보 EXP +50%. 호감 +400 즉시", perks: ["sr_bonus_2", "combo_exp_50"], oneTime: { affinity: 400, trust: 200, coins: 2000, tickets: 10 } },
  { level: 25, emoji: "💎", title: "운명의 사람", description: "코인 획득 +25%. SR 확률 +5%", perks: ["coin_passive_25", "sr_bonus_5"] },
  { level: 28, emoji: "🌟", title: "원정 마스터", description: "모험 시간 -40%", perks: ["adventure_speed_40"] },
  { level: 30, emoji: "👑", title: "평생", description: "코인 +50%. 호감 +25%. 펫 친밀도 +100%. 한정 보상", perks: ["coin_passive_50", "affinity_passive_25", "pet_affinity_100"], oneTime: { coins: 10000, tickets: 30, affinity: 1000 } },
];

function getActivePerks(level: number): Set<LevelPerkKind> {
  const set = new Set<LevelPerkKind>();
  for (const r of LEVEL_REWARDS) {
    if (level >= r.level) {
      for (const p of r.perks) set.add(p);
    }
  }
  return set;
}

// ================================
// 코인 / 데일리 미션 / 상점 시스템
// ================================
type DailyMissionTemplate = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  target: number;
  rewardCoins: number;
  field: "chatCount" | "giftCount" | "scenarioCount" | "checkinBool" | "bladderPeak";
  visible?: (state: { stats: Stats; storyRoute: StoryRoute }) => boolean;
};

const DAILY_MISSION_TEMPLATES: DailyMissionTemplate[] = [
  { id: "chat_5", title: "오늘 5번 채팅", description: "근떡존과 5번 카톡을 주고받기", emoji: "💬", target: 5, rewardCoins: 15, field: "chatCount" },
  { id: "chat_10", title: "오늘 10번 채팅", description: "수다 더 떨어보기", emoji: "💬", target: 10, rewardCoins: 30, field: "chatCount" },
  { id: "gift_1", title: "선물 1개 주기", description: "선물 메뉴에서 한 개 골라 보내기", emoji: "🎁", target: 1, rewardCoins: 20, field: "giftCount" },
  { id: "checkin", title: "오늘 출석", description: "출석 체크 완료", emoji: "📅", target: 1, rewardCoins: 10, field: "checkinBool" },
  { id: "scenario_1", title: "시나리오 1개 진행", description: "어떤 시나리오든 한 개 진입", emoji: "📖", target: 1, rewardCoins: 25, field: "scenarioCount" },
  { id: "bladder_70", title: "방광 70% 견디기", description: "방광 게이지 70% 이상 도달", emoji: "🚽", target: 70, rewardCoins: 25, field: "bladderPeak" },
  { id: "bladder_95", title: "방광 한계 챌린지", description: "방광 게이지 95% 이상 도달", emoji: "🚽", target: 95, rewardCoins: 50, field: "bladderPeak", visible: (s) => s.stats.bladderCharm > 0 },
];

function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function pickDailyMissions(date: string, eligibleIds: string[], slotCount = 3): DailyMission[] {
  // 날짜 기반 시드로 안정적으로 N개 선택
  let seed = 0;
  for (const c of date) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  const pool = [...eligibleIds];
  const picked: string[] = [];
  for (let i = 0; i < slotCount && pool.length; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const idx = seed % pool.length;
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked.map((id) => {
    const t = DAILY_MISSION_TEMPLATES.find((x) => x.id === id)!;
    return { templateId: id, target: t.target, rewardCoins: t.rewardCoins, claimed: false };
  });
}
function getDailyProgress(field: DailyMissionTemplate["field"], state: DailyState): number {
  if (field === "checkinBool") return state.checkinDone ? 1 : 0;
  if (field === "chatCount") return state.chatCount;
  if (field === "giftCount") return state.giftCount;
  if (field === "scenarioCount") return state.scenarioCount;
  if (field === "bladderPeak") return state.bladderPeak;
  return 0;
}

// ── 상점 ──
type ShopItem = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  price: number;
  category: "boost" | "gift" | "cosmetic" | "consumable";
  effect:
    | { kind: "stat"; stat: StatKey; amount: number }
    | { kind: "coins_random"; min: number; max: number }
    | { kind: "stat_random"; stat: StatKey; min: number; max: number }
    | { kind: "consumable"; consumableId: string }
    | { kind: "cosmetic_chat_bg"; bgId: string };
  limit?: number; // 총 구매 제한 (없으면 무한)
  visible?: (state: { stats: Stats; storyRoute: StoryRoute }) => boolean;
};

const SHOP_ITEMS: ShopItem[] = [
  // 부스트
  {
    id: "affinity_boost_small",
    name: "다정한 메시지",
    description: "근떡존이 갑자기 다정해진다. 호감 +30",
    emoji: "💌",
    price: 50,
    category: "boost",
    effect: { kind: "stat", stat: "affinity", amount: 30 },
  },
  {
    id: "affinity_boost_big",
    name: "진심 어린 편지",
    description: "장문의 진심 메시지. 호감 +100, 신뢰 +20",
    emoji: "💝",
    price: 200,
    category: "boost",
    effect: { kind: "stat", stat: "affinity", amount: 100 },
  },
  {
    id: "trust_pack",
    name: "약속의 시간",
    description: "신뢰가 깊어지는 짧은 순간. 신뢰 +50",
    emoji: "🤝",
    price: 80,
    category: "boost",
    effect: { kind: "stat", stat: "trust", amount: 50 },
  },
  // 가챠
  {
    id: "mystery_box",
    name: "선물 상자 (랜덤)",
    description: "근떡존이 보낸 선물. 호감 랜덤 +10~80",
    emoji: "📦",
    price: 60,
    category: "gift",
    effect: { kind: "stat_random", stat: "affinity", min: 10, max: 80 },
  },
  {
    id: "premium_box",
    name: "프리미엄 선물 상자",
    description: "고급 선물. 호감 랜덤 +50~200",
    emoji: "🎁",
    price: 250,
    category: "gift",
    effect: { kind: "stat_random", stat: "affinity", min: 50, max: 200 },
  },
  {
    id: "coin_lottery",
    name: "코인 행운 박스",
    description: "재미로 사보기. 코인 랜덤 +20~150",
    emoji: "🪙",
    price: 80,
    category: "gift",
    effect: { kind: "coins_random", min: 20, max: 150 },
  },
  // 방광 루트
  {
    id: "bladder_amulet",
    name: "K-방광 부적",
    description: "방광매력의 가호. 방광매력 +25",
    emoji: "🚽",
    price: 150,
    category: "boost",
    effect: { kind: "stat", stat: "bladderCharm", amount: 25 },
    visible: (s) => s.stats.bladderCharm > 0,
  },
  // 위험
  {
    id: "obsession_drop",
    name: "한 모금의 진심",
    description: "그가 더 깊이 빠진다. 집착 +60, 신뢰 -10",
    emoji: "🌹",
    price: 120,
    category: "boost",
    effect: { kind: "stat", stat: "obsession", amount: 60 },
  },
  // 일회성 화려한 효과
  {
    id: "jealousy_calm",
    name: "달래주는 한 마디",
    description: "질투 가라앉는다능. 질투 -100",
    emoji: "🌿",
    price: 100,
    category: "consumable",
    effect: { kind: "stat", stat: "jealousy", amount: -100 },
  },
  // ─── 병맛 / 방광 테마 ───
  {
    id: "pee_bottle",
    name: "오줌통 콜렉터스 에디션",
    description: "한정판이래 ㅋ 어디 쓸지는 본인 마음 ㅎ. 방광매력 +20",
    emoji: "🍶",
    price: 80,
    category: "cosmetic",
    effect: { kind: "stat", stat: "bladderCharm", amount: 20 },
  },
  {
    id: "urethra_blessing",
    name: "요도니아 가호권",
    description: "신령이 직접 발급한거임 ㄹㅇ. 방광매력 +60",
    emoji: "🪬",
    price: 350,
    category: "boost",
    effect: { kind: "stat", stat: "bladderCharm", amount: 60 },
    visible: (s) => s.stats.bladderCharm > 0,
  },
  {
    id: "kbladder_fan",
    name: "K-방광 부채",
    description: "더운날 부쳐보셈. 시원함 ㄹㅇ. 호감 +25",
    emoji: "🪭",
    price: 70,
    category: "cosmetic",
    effect: { kind: "stat", stat: "affinity", amount: 25 },
  },
  {
    id: "bladder_keychain",
    name: "방광 키링",
    description: "ㅈㄴ 귀엽다는 후기 많음 ㅋ. 호감 +15, 방광매력 +5",
    emoji: "🔑",
    price: 40,
    category: "cosmetic",
    effect: { kind: "stat", stat: "affinity", amount: 15 },
  },
  {
    id: "tteokjon_sweat",
    name: "떡존이 땀 복권",
    description: "운동 후 흘린 그거. 마시면 호감 +10 (먹지 마셈 ㅈㅂ)",
    emoji: "💦",
    price: 30,
    category: "consumable",
    effect: { kind: "stat", stat: "affinity", amount: 10 },
  },
];

// ================================
// 호감 마일스톤 시스템
// ================================
type Milestone = {
  id: string;
  stat: StatKey;
  threshold: number;
  title: string;
  text: string;          // 채팅에 추가될 근떡존 메시지 (assistant)
  narration?: string;    // 함께 들어갈 짧은 나레이션 (선택)
  reward?: { stat: StatKey; amount: number };
};

const MILESTONES: Milestone[] = [
  {
    id: "aff_100",
    stat: "affinity",
    threshold: 100,
    title: "마음의 첫 흔들림",
    narration: "근떡존이 카톡 프로필 사진을 바꿨다. 건너편 거리에서 찍힌 풍경 한 장. 자세히 보면 익숙한 카페 간판이 보였다.",
    text: "선생님 오늘 그 카페 가셨었죠. 저도 우연히 거기 있었거든요. 사진 한 장만 찍었어요. 풍경요. 풍경.",
    reward: { stat: "trust", amount: 5 },
  },
  {
    id: "aff_250",
    stat: "affinity",
    threshold: 250,
    title: "조용한 안부",
    text: "선생님. 오늘 점심 잘 드셨어요? 이런 거 묻는 거 이상한가요. 그냥 궁금했어요.",
    reward: { stat: "trust", amount: 10 },
  },
  {
    id: "aff_500",
    stat: "affinity",
    threshold: 500,
    title: "보고 싶다는 말",
    text: "선생님... 보고 싶어요. 지금 당장 만나자는 건 아니고요. 그냥 그렇다는 뜻이에요. 적어두고 싶었어요.",
  },
  {
    id: "aff_750",
    stat: "affinity",
    threshold: 750,
    title: "오늘 무슨 날 아닌데",
    narration: "택배 한 박스가 도착했다. 발신자 이름이 또 그였다.",
    text: "오늘 무슨 날 아닌데. 그래도 받아주세요. 부담스러우면 거절하셔도 돼요. 근데 거절은 좀 슬플 것 같아요.",
    reward: { stat: "affinity", amount: 20 },
  },
  {
    id: "aff_1000",
    stat: "affinity",
    threshold: 1000,
    title: "꽉 찬 마음",
    text: "선생님. 제 마음이 어디까지 갈 수 있는지, 저도 잘 모르겠어요. 다만 이게 사랑인지는 알 것 같아요.",
    reward: { stat: "trust", amount: 30 },
  },
  // 신뢰 마일스톤
  {
    id: "trust_500",
    stat: "trust",
    threshold: 500,
    title: "기댈 수 있는 사람",
    text: "선생님은 진짜 한 번도 저를 이상하게 안 봐주셨어요. 그게 얼마나 큰 일인지 아세요?",
  },
  {
    id: "trust_900",
    stat: "trust",
    threshold: 900,
    title: "전부 맡기는 마음",
    text: "선생님이 제 인생에서 가장 안전한 사람이에요. 이거 너무 큰 말인 거 알아요. 그래도 사실이에요.",
    reward: { stat: "affinity", amount: 30 },
  },
  // 집착 마일스톤
  {
    id: "obs_500",
    stat: "obsession",
    threshold: 500,
    title: "지워지지 않는 사람",
    narration: "근떡존의 화면에 같은 이름이 떠 있는 시간이 길어졌다.",
    text: "선생님 한 번 봤는데 그게 안 지워져요. 화면에서 봤을 뿐인데. 이상하죠.",
  },
  {
    id: "obs_900",
    stat: "obsession",
    threshold: 900,
    title: "옆에 두고 싶은 마음",
    text: "선생님. 옆에 계속 두고 싶어요. 이게 무서운 말이라는 거 알아요. 근데 멈출 수가 없어요.",
  },
];

// ================================
// 랜덤 깜짝 메시지 시스템
// ================================
type RandomMsgTrigger = {
  timeOfDay?: "morning" | "afternoon" | "evening" | "night";
  dayOfWeek?: number[]; // 0=일, 6=토
  minAffinity?: number;
  minObsession?: number;
  minJealousy?: number;
  minBladderCharm?: number;
  weather?: "rain";
  storyRoute?: StoryRoute;
};
type RandomMessage = {
  id: string;
  triggers: RandomMsgTrigger;
  text: string;
  weight?: number; // 가중치 (기본 1)
};

const RANDOM_MESSAGES: RandomMessage[] = [
  // 아침 (6~11시)
  { id: "morning_basic", triggers: { timeOfDay: "morning" }, text: "선생님 일어나셨어요? 저는 헬스장 다녀오는 길이에요." },
  { id: "morning_mon", triggers: { timeOfDay: "morning", dayOfWeek: [1] }, text: "월요일이네요... 학교 가기 싫으시죠? 저는 침대에서 30분째 안 일어나고 있어요." },
  { id: "morning_fri", triggers: { timeOfDay: "morning", dayOfWeek: [5] }, text: "금요일!! 선생님 오늘 저녁 약속 있으세요? 없으면 좋겠어요." },
  { id: "morning_weekend", triggers: { timeOfDay: "morning", dayOfWeek: [0, 6] }, text: "주말 아침이네요. 푹 주무셨어요? 저는 일찍 깼어요. 이상하게요." },
  { id: "morning_aff", triggers: { timeOfDay: "morning", minAffinity: 400 }, text: "오늘 일어나자마자 선생님 생각났어요. 이상한 사람이라고 하지 마세요." },
  // 점심 (11~16시)
  { id: "noon_basic", triggers: { timeOfDay: "afternoon" }, text: "점심 뭐 드셨어요? 저는 도시락이요. 또요." },
  { id: "noon_obs", triggers: { timeOfDay: "afternoon", minObsession: 500 }, text: "선생님 지금 어디 계세요? 갑자기 궁금해서요." },
  // 저녁 (16~21시)
  { id: "evening_basic", triggers: { timeOfDay: "evening" }, text: "오늘 하루 어떠셨어요. 별일 없으셨죠?" },
  { id: "evening_aff", triggers: { timeOfDay: "evening", minAffinity: 300 }, text: "퇴근하셨어요? 오늘 잘 버티셨네요. 그거면 충분해요." },
  { id: "evening_jealous", triggers: { timeOfDay: "evening", minJealousy: 400 }, text: "오늘 누구랑 같이 퇴근하셨어요? 학교 동료라도... 신경 좀 쓰여요." },
  // 밤 (21~26시 == 21~02시)
  { id: "night_basic", triggers: { timeOfDay: "night" }, text: "선생님 아직 안 주무세요? 저도요. 같이 안 자고 있다고 생각하니까 좀 좋네요." },
  { id: "night_aff", triggers: { timeOfDay: "night", minAffinity: 600 }, text: "잠이 안 와요. 선생님 목소리 듣고 싶은데 너무 늦었죠?" },
  { id: "night_obs", triggers: { timeOfDay: "night", minObsession: 600 }, text: "지금 누구랑 얘기하세요? 이렇게 늦게요." },
  { id: "night_pure", triggers: { timeOfDay: "night", storyRoute: "pure" }, text: "오늘 하루 마무리하셨어요? 좋은 꿈 꾸세요. 진짜로요." },
  { id: "night_obsession", triggers: { timeOfDay: "night", storyRoute: "obsession" }, text: "선생님이 지금 자고 있는 모습 상상돼요. 이상하죠. 죄송해요. 근데 안 죄송해요." },
  // 방광 매력 진행
  { id: "bladder_charm_50", triggers: { minBladderCharm: 50 }, text: "선생님... 오늘도 잘 참고 있어요. 칭찬 주세요." },
  { id: "bladder_charm_300", triggers: { minBladderCharm: 300 }, text: "이번 주에 4리터 더 모았어요. K-방광 대표로서 부끄럽지 않게요." },
];

function getTimeOfDay(d: Date): "morning" | "afternoon" | "evening" | "night" {
  const h = d.getHours();
  if (h >= 6 && h < 11) return "morning";
  if (h >= 11 && h < 16) return "afternoon";
  if (h >= 16 && h < 21) return "evening";
  return "night";
}
function pickRandomMessage(state: { stats: Stats; storyRoute: StoryRoute; date: Date }): RandomMessage | null {
  const tod = getTimeOfDay(state.date);
  const dow = state.date.getDay();
  const eligible = RANDOM_MESSAGES.filter((m) => {
    const t = m.triggers;
    if (t.timeOfDay && t.timeOfDay !== tod) return false;
    if (t.dayOfWeek && !t.dayOfWeek.includes(dow)) return false;
    if (t.minAffinity && state.stats.affinity < t.minAffinity) return false;
    if (t.minObsession && state.stats.obsession < t.minObsession) return false;
    if (t.minJealousy && state.stats.jealousy < t.minJealousy) return false;
    if (t.minBladderCharm && state.stats.bladderCharm < t.minBladderCharm) return false;
    if (t.storyRoute && t.storyRoute !== state.storyRoute) return false;
    return true;
  });
  if (!eligible.length) return null;
  // 가중치 풀 (구체적 트리거가 더 많을수록 더 잘 선택되도록)
  const weighted = eligible.flatMap((m) => {
    const specificity = (m.triggers.dayOfWeek ? 2 : 0) + (m.triggers.minAffinity || m.triggers.minObsession ? 2 : 0);
    const w = (m.weight ?? 1) + specificity;
    return Array(w).fill(m);
  });
  return weighted[Math.floor(Math.random() * weighted.length)];
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

// 히로시마역: 호감도에 따라 본문이 다르게 펼쳐진다 (무덤덤 → 가까움 → 친밀)
const STATION_TEXT_LOW = `나레이션: 신칸센이 천천히 멈춰 선다. 개찰구 앞은 사람이 많았고, 안내방송이 위에서 흘러내렸다.
나레이션: 근떡존이 한 발 떨어진 자리에서 손을 어색하게 들었다. 시선이 마주치자 살짝 비켰다.
근떡존: 선생님. 여기예요.
근떡존: 길은 안 헤매셨어요? 표지판이 좀 헷갈리잖아요.
근떡존: ...아니, 헤매도 큰일은 아니에요. 그냥 물어본 거예요.
나레이션: 그는 여전히 조심스러웠다. 한 걸음 거리를 지키며, 짐을 받아들지도 못한 채 잠시 손을 만지작거렸다.
근떡존: 일단 짐 들어드릴까요. 무거우면 말씀하시고요.
근떡존: 이쪽 출구가 더 가까워요. 택시 잡기도 편하고요.
나레이션: 그 거리감이 어색하지는 않았다. 다만 아직, 가까운 사이의 거리는 아니었다.`;

const STATION_TEXT_MID = `나레이션: 신칸센이 천천히 멈춰 선다. 개찰구 너머에 근떡존이 서 있었다. 두 손을 주머니에 꽂은 채로, 사람들 사이에서 한참을 두리번거리다가, 시선이 마주치자 표정이 한 번에 풀렸다.
근떡존: 선생님!
나레이션: 거의 손을 흔들 뻔하다, 그 손을 다시 주머니 속으로 도로 넣었다. 부끄러워하면서도 웃음이 새어 나왔다.
근떡존: 진짜 오신 거예요? 저 한 시간 일찍 와서 기다렸어요.
근떡존: ...아 그건 비밀이었는데요.
근떡존: 일단 짐 주세요. 저 하나 들어드릴게요. 이쪽이에요.
나레이션: 짐을 받아 드는 손이 자연스러웠다. 걷는 박자도 일부러 맞추는 게 보였다. 너무 빨라지지 않게, 너무 느려지지도 않게.
근떡존: 오는 길에 별일 없으셨죠. 사람 많아서 좀 힘드셨을 텐데요.
근떡존: 오늘 일정은 제가 다 정해놨어요. 진짜로요.`;

const STATION_TEXT_HIGH = `나레이션: 신칸센이 천천히 멈춰 선다. 개찰구를 지나기도 전에 근떡존의 얼굴이 보였다. 사람들 사이에서, 그 큰 키가 누구보다 먼저 눈에 들어왔다.
근떡존: 선생님.
나레이션: 그가 짧게 한 번 부르고는, 가까이 다가왔다. 한 걸음 거리에서 멈춘다는 약속을 어딘가 흘렸는지, 평소보다 한 뼘쯤 가까웠다.
근떡존: 한 시간 일찍 와서 기다렸어요. 두 시간일지도 모르고요.
근떡존: ...오시는 길에 별일 없으셨죠. 답장 늦게 와서 좀 신경 쓰였어요.
나레이션: 그가 자연스럽게 짐을 받아 들었다. 그리고 빈 손이 잠깐 망설이다, 천천히 선생님의 손등에 닿았다.
근떡존: 가요. 오늘은 제가 다 할게요.
근떡존: 어디 안 가고 옆에만 있을게요. 그래도 되죠.
나레이션: 그 약속은 다정했지만, 그 안에는 아주 옅은 구속의 결도 함께 섞여 있었다. 그러나 지금 이 자리에서, 그것은 거의 알아채기 어려울 정도로 부드럽게 묻혀 있었다.`;

function getStationTextForStats(stats: Stats): string {
  if (stats.affinity >= 500) return STATION_TEXT_HIGH;
  if (stats.affinity >= 200) return STATION_TEXT_MID;
  return STATION_TEXT_LOW;
}

const LOCATION_SCENARIOS: Record<string, Scenario> = {
  loc_hiroshima_station: {
    id: "loc_hiroshima_station", title: "히로시마역", subtitle: "신칸센이 들어오는 시간",
    kind: "normal", category: "side", image: "/loc_hiroshima_station.png", background: "/loc_hiroshima_station.png",
    text: STATION_TEXT_LOW, // 런타임에 stats에 따라 교체됨 (getLocationScenario)
    choices: [
      { label: "왜 그렇게 일찍 왔어.", stat: { affinity: 25, trust: 20 }, end: true },
      { label: "고마워. 안 추웠어?", stat: { affinity: 30, trust: 25 }, end: true },
      { label: "오늘 잘 부탁해.", stat: { affinity: 20, trust: 25 }, end: true },
    ],
  },
  loc_atomic_dome: {
    id: "loc_atomic_dome", title: "원폭돔 앞", subtitle: "조용한 강가의 오후",
    kind: "normal", category: "side", image: "/loc_atomic_dome.png", background: "/loc_atomic_dome.png",
    text: `나레이션: 원폭돔 앞 강가. 햇빛이 약하게 흐려 있고, 강물 위로 잔물결이 천천히 흘러갔다. 사람들의 발걸음 소리도 평소보다 낮았다.
나레이션: 근떡존이 평소보다 말이 적었다. 두 손을 주머니에 꽂은 채로, 한참을 그 자리에 서 있었다.
근떡존: 여기 오면 말이 잘 안 나와요.
근떡존: 그냥... 같이 있어 주세요. 잠깐만요.
나레이션: 그가 천천히 옆으로 다가왔다. 어깨가 닿을 듯 닿지 않을 거리.
근떡존: 선생님 손, 잠깐만 잡아도 돼요?
근떡존: 차가워서요. 바람이.
근떡존: ...아 핑계 같죠. 진짜로 차갑긴 해요.
나레이션: 손끝이 닿았다. 강물 위로 빛 한 조각이 잘게 부서지고, 두 사람의 옆모습이 그 위에 잠시 머물렀다.`,
    choices: [
      { label: "잡아도 돼.", stat: { affinity: 30, trust: 25 }, end: true },
      { label: "나도 같이 보자.", stat: { affinity: 25, trust: 30 }, end: true },
      { label: "왜 여기서 조용해져?", stat: { affinity: 25, trust: 35 }, end: true },
    ],
  },
  loc_hiroshima_castle: {
    id: "loc_hiroshima_castle", title: "히로시마성 산책", subtitle: "벚꽃과 천수각",
    kind: "normal", category: "side", image: "/loc_hiroshima_castle.png", background: "/loc_hiroshima_castle.png",
    text: `나레이션: 천수각 아래, 해자를 따라 펼쳐진 산책로. 벚나무 가지 끝마다 분홍빛이 번지고, 바람이 불 때마다 꽃잎이 한 장씩 천천히 떨어졌다.
나레이션: 근떡존이 잠깐 걸음을 멈췄다. 시선이 머리 위 어딘가에 머물렀다.
근떡존: 선생님. 머리 위에 꽃잎 떨어졌어요. 잠깐만요.
나레이션: 그가 손을 뻗었다. 닿을까 말까 한 거리에서, 손가락이 한 번 망설였다.
근떡존: ...떼주려다 그냥 둘 걸 그랬나. 너무 잘 어울려서요.
근떡존: 사진, 한 장 찍어드릴까요. 지금 햇빛이 진짜 좋아요.
나레이션: 그는 어색한 사진사처럼 한쪽 무릎을 살짝 굽히고 휴대폰을 들었다. 화면 너머의 표정이, 평소보다 부드러웠다.
근떡존: 거기 서 보세요. 그렇게요. 한 발만 옆으로요.
근떡존: ...됐다. 진짜 잘 나왔어요. 보여드릴까요.`,
    choices: [
      { label: "사진이나 한 장 찍자.", stat: { affinity: 35, trust: 20 }, end: true },
      { label: "너도 잘 어울려.", stat: { affinity: 40, trust: 25 }, end: true },
      { label: "벚꽃보다 너 보고 있어.", stat: { affinity: 45, trust: 20, obsession: 10 }, end: true },
    ],
  },
  loc_hondori: {
    id: "loc_hondori", title: "혼도리 상점가", subtitle: "사람 많은 거리, 놓치지 않는 손",
    kind: "normal", category: "side", image: "/loc_hondori.png", background: "/loc_hondori.png",
    text: `나레이션: 토요일 오후의 혼도리. 양쪽 가게 간판들이 좁은 길 위로 드리워져 있고, 사람들이 서로의 어깨를 스치며 지나갔다.
나레이션: 근떡존이 자연스럽게 손을 잡았다. 깍지를 끼지는 않았지만, 손바닥이 단단히 맞물려 있었다.
근떡존: 선생님 놓치면 큰일 나니까요.
근떡존: ...진짜로요. 한 번 잃어버린 적 있어요. 5초 동안.
근떡존: 그 5초가 진짜 길었거든요.
나레이션: 그가 살짝 웃었다. 농담처럼 흘렸지만, 손에 들어간 힘은 농담이 아니었다.
근떡존: 뭐 사고 싶은 거 있어요? 사줄게요. 오늘은요.
근떡존: 디저트도 좋고, 옷도 좋고. 선생님이 좋아하는 거.
근떡존: 비싼 건 안 되는데, 적당한 건 다 돼요.`,
    choices: [
      { label: "같이 골라.", stat: { affinity: 40, trust: 30 }, end: true },
      { label: "먹는 거 사 먹자.", stat: { affinity: 35, trust: 25 }, end: true },
      { label: "5초가 그렇게 길었어?", stat: { affinity: 35, obsession: 15 }, end: true },
    ],
  },
  loc_mazda: {
    id: "loc_mazda", title: "마쓰다 자동차 박물관", subtitle: "차에 진심인 옆얼굴",
    kind: "normal", category: "side", image: "/loc_mazda.png", background: "/loc_mazda.png",
    text: `나레이션: 마쓰다 자동차 박물관. 클래식카가 정렬된 전시장. 빨간 RX-7 한 대 앞에서 근떡존의 발이 멈췄다.
나레이션: 평소보다 표정이 밝았다. 어깨가 살짝 풀려 있었고, 시선이 차의 라인을 따라 천천히 움직였다.
근떡존: 이거 RX-7이에요.
근떡존: 어렸을 때부터 좋아했어요. 만화에서 처음 봤거든요.
근떡존: 엔진 소리가 진짜 다르거든요. 들으면 가슴이 좀 뛰어요.
나레이션: 그가 손가락으로 차의 보닛 라인을 따라 그렸다. 직접 만지지는 않았지만, 그 손짓이 거의 애무에 가까웠다.
근떡존: ...선생님이랑 같이 보니까 더 좋네요. 그냥요.
근떡존: 다음에 또 와요. 다른 차도 많거든요.
근떡존: 좋아하는 거 같이 보여드리는 거, 솔직히 좀 부끄러운데요. 그래도 좋네요.`,
    choices: [
      { label: "신나서 말 많아진 거 귀여워.", stat: { affinity: 40, trust: 25 }, end: true },
      { label: "언젠가 같이 타자.", stat: { affinity: 50, trust: 30, obsession: 15 }, end: true },
      { label: "좋아하는 거 더 알려줘.", stat: { affinity: 45, trust: 30 }, end: true },
    ],
  },
  loc_ujina: {
    id: "loc_ujina", title: "우지나 항구", subtitle: "바닷바람과 너의 옆모습",
    kind: "normal", category: "side", image: "/loc_ujina.png", background: "/loc_ujina.png",
    text: `나레이션: 우지나 항구. 페리가 들어오고 나가는 시간. 짠 냄새와 디젤 냄새가 섞여 있다. 갈매기 소리가 멀리서 흩어졌다.
나레이션: 근떡존이 부두 끝에 기대어 섰다. 바람에 머리카락이 흩어졌다.
근떡존: 여기서 페리 보면 시간 잘 가요.
근떡존: 혼자 자주 와요. 그냥 멍하니 보다가 가요.
근떡존: 아무도 저한테 뭐라 안 하니까요. 여기서는요.
나레이션: 잠깐 침묵이 있었다. 페리가 한 대 천천히 떠나갔다.
근떡존: ...오늘은 안 혼자네요.
근떡존: 그게 좀 이상해요. 익숙하지 않아서요. 좋다는 뜻이에요.
근떡존: 다음에 같이 와요. 자주요. 가능하시면.`,
    choices: [
      { label: "다음에도 혼자 오지 마.", stat: { affinity: 40, trust: 25, obsession: 15 }, end: true },
      { label: "같이 페리나 타볼래?", stat: { affinity: 35, trust: 30 }, end: true },
      { label: "혼자 오는 횟수 좀 줄여.", stat: { affinity: 30, obsession: 20 }, end: true },
    ],
  },
  loc_kure: {
    id: "loc_kure", title: "구레 군항", subtitle: "회색 함선과 너의 침묵",
    kind: "normal", category: "side", image: "/loc_kure.png", background: "/loc_kure.png",
    text: `나레이션: 구레시. 회색 함선들이 정박해 있고, 잠수함의 검은 등이 수면 위에 떠 있었다. 흐린 하늘 아래, 모든 색이 차분하게 가라앉아 있었다.
나레이션: 근떡존이 한참을 함선 쪽을 바라봤다. 표정이 평소와 달랐다. 차분한 게 아니라, 무언가를 누르고 있는 얼굴이었다.
근떡존: 큰 거 보면 마음이 좀 차분해져요.
근떡존: 이상하죠. 보통 사람들은 작은 거 보고 그러잖아요. 꽃이나, 새나.
근떡존: 저는 이런 게 더 와요. 압도되는 느낌이.
나레이션: 그가 천천히 시선을 돌렸다.
근떡존: 선생님. 저 가끔 무서워요.
근떡존: 제가 선생님한테 너무 빠진 거 같아서요.
근떡존: 한 번 빠지면, 저 같은 사람은... 잘 못 빠져나오거든요.
근떡존: 그게 좋은 건지 나쁜 건지, 아직도 잘 모르겠어요.`,
    choices: [
      { label: "나도 너한테 빠졌어.", stat: { affinity: 60, trust: 30, obsession: 25 }, end: true },
      { label: "괜찮아. 천천히 가자.", stat: { affinity: 40, trust: 50 }, end: true },
      { label: "안 빠져나와도 괜찮아.", stat: { affinity: 50, obsession: 35, trust: 20 }, end: true },
    ],
  },
  loc_hiroshima_univ: {
    id: "loc_hiroshima_univ", title: "히로시마 대학", subtitle: "도서관 뒷벤치",
    kind: "normal", category: "side", image: "/loc_hiroshima_univ.png", background: "/loc_hiroshima_univ.png",
    text: `나레이션: 캠퍼스 도서관 뒷편. 인적이 드물고, 나뭇잎 사이로 햇빛이 조각조각 떨어졌다. 근떡존이 벤치에 먼저 앉아 있었다.
나레이션: 그가 옆자리를 한 번 톡, 두드렸다.
근떡존: 여기 사람 잘 안 와요. 둘이 얘기하기 좋아요.
근떡존: ...저 가끔 여기 와서 멍 때려요. 다른 학생들 지나가는 거 보면서요.
나레이션: 잠깐 뜸을 들이다, 그가 조심스럽게 입을 열었다.
근떡존: 선생님. 졸업하면 어디 갈 거예요?
근떡존: 한국으로 다시 돌아가시는 건가요. 아니면 일본에 좀 더 계실 건가요.
근떡존: ...저, 그거 좀 신경 쓰여요. 솔직히요.
근떡존: 미리 알면 마음의 준비라도 하니까요.
근떡존: 만약 멀리 가시면, 저도 거기로 갈 수 있어요. 그 정도는 할 수 있어요.`,
    choices: [
      { label: "어디 가든 너랑 가.", stat: { affinity: 70, trust: 40, obsession: 30 }, end: true },
      { label: "같이 정하자, 천천히.", stat: { affinity: 60, trust: 60 }, end: true },
      { label: "따라온다고? 진심이야?", stat: { affinity: 50, obsession: 40, jealousy: 10 }, end: true },
    ],
  },
  loc_miyajima: {
    id: "loc_miyajima", title: "미야지마", subtitle: "물 위의 도리이와 사슴",
    kind: "normal", category: "side", image: "/loc_miyajima.png", background: "/loc_miyajima.png",
    text: `나레이션: 페리에서 내리니 빨간 도리이가 보였다. 물 위에 반쯤 잠긴 채로, 천천히 흔들리는 그림자처럼 서 있었다.
나레이션: 사슴 한 마리가 다가왔다. 코를 내밀었다 다시 거두는, 익숙한 동작.
근떡존: 잠깐 거기 서봐요. 사진 예쁘게 찍어드릴게요.
근떡존: 도리이를 뒤로 두고, 살짝 옆으로요. 그렇게요.
나레이션: 그가 휴대폰을 들고 한참을 망설였다. 셔터를 누르기 전, 한 번 더 보고, 또 한 번 더 봤다.
근떡존: 솔직히 풍경보다 선생님이 더 잘 나와요.
근떡존: 진짜로요. 거짓말 아니에요.
근떡존: ...보세요. 이렇게 잘 나왔어요.
나레이션: 그가 화면을 내밀었다. 화면 안에는, 도리이보다 가까이 있는 한 사람이 더 또렷하게 담겨 있었다.
근떡존: 이거 저장해도 되죠. 잠금화면으로 해도 되죠.
근떡존: ...다른 사진은 안 봐도 돼요. 이거 한 장이면 충분해요.`,
    choices: [
      { label: "둘이 같이 찍자.", stat: { affinity: 60, trust: 40 }, end: true },
      { label: "오늘 진짜 좋다.", stat: { affinity: 55, trust: 50 }, end: true },
      { label: "잠금화면 그건 좀 무서워.", stat: { affinity: 35, obsession: 25 }, end: true },
    ],
  },
  loc_asa_view: {
    id: "loc_asa_view", title: "아사산 전망대", subtitle: "도시가 너무 작아 보여",
    kind: "yandere", category: "side", image: "/loc_asa_view.png", background: "/loc_asa_view.png",
    text: `나레이션: 아사산 전망대. 케이블카에서 내리니 도시가 발밑에 펼쳐져 있다. 차가운 공기. 가로등 불빛이 점점이 박혀 있고, 멀리 강이 검은 띠처럼 흘러간다.
나레이션: 근떡존이 한참을 말없이 서 있었다. 평소의 그가 아니었다. 호흡이 조금 깊고, 어깨가 굳어 있었다.
근떡존: 형. 여기서 내려다보면요.
근떡존: 도시가 진짜 작잖아요.
근떡존: 이 안에 사람이 백만 명 사는데. 그 백만 명이 다 형을 안 보고 있다는 게 좀 이상해요.
근떡존: ...아 미친 소리 같죠. 근데 진짜 그래요.
나레이션: 그가 한 발 더 가까이 다가섰다. 표정이 평소와 다르다. 부드러움이 사라지고, 무언가 끓어오르는 게 그 자리를 대신하고 있었다.
근떡존: 형. 저랑 있을 때만 웃어주면 안 돼요?
근떡존: 다른 사람 앞에서 웃지 마요. 진짜로요.
근떡존: 그게 너무 싫어요. 누가 형 웃는 거 보고 있는 게.
근떡존: 저만 알고 싶어요. 형 웃는 얼굴.
나레이션: 그의 손이 천천히 형의 팔을 잡았다. 강한 힘은 아니었지만, 놓을 생각이 없는 손이었다.
근떡존: 한 번만 약속해줘요. 저랑 있을 때 말고는, 웃지 않겠다고.
근떡존: ...그 정도는 돼요. 그렇죠.
근떡존: 형이 웃으면, 거기 있는 사람들이 다 형을 좋아하게 되거든요. 저는 그게 너무 무서워요.`,
    choices: [
      { label: "...너만 봐줄게.", stat: { affinity: 30, obsession: 80, jealousy: 30, trust: -10 }, end: true },
      { label: "그건 안 돼.", stat: { affinity: -10, obsession: -20, trust: 30, jealousy: 40 }, end: true },
      { label: "무서워. 그만해.", stat: { affinity: -20, obsession: -10, trust: 20, jealousy: 50 }, end: true },
      { label: "팔 좀 놔.", stat: { affinity: -15, obsession: -10, trust: 25, jealousy: 35 }, end: true },
    ],
  },
  loc_apartment: {
    id: "loc_apartment", title: "다시 못 나가는 방", subtitle: "문이 잠긴 다음의 시간",
    kind: "confinement", category: "side", image: "/loc_apartment.png", background: "/loc_apartment.png",
    text: `나레이션: 근떡존이 자취방 문을 열었다. 좁은 원룸. 침대 하나, 책상 하나, 작은 창문 하나. 들어서자 등 뒤에서 문이 잠기는 소리가 들렸다.
나레이션: 평범한 도어락 소리였다. 그러나 그 순간, 그 소리는 평범하지 않게 들렸다.
근떡존: 형. 와줘서 고마워요.
근떡존: 진짜로요. 와줄 줄 몰랐어요.
근떡존: ...앉아요. 차 끓여놨어요. 따뜻한 거.
나레이션: 그가 차를 내려놓았다. 손이 살짝 떨렸다. 평소의 그가 아니었다. 무언가를 결심한 사람의 떨림이었다.
근떡존: 저 오늘 솔직히 말할게요.
근떡존: 한 번에 다 할게요. 어차피 한 번은 해야 하는 말이니까요.
나레이션: 그가 자리에 앉았다. 등이 굽지 않았다. 평소처럼 어깨를 움츠리지도 않았다. 오늘만큼은 똑바로 앉아 있었다.
근떡존: 형이 저랑 있을 때 말고 다른 데서 시간 보내는 거.
근떡존: 저 그거 진짜 못 견디겠어요.
근떡존: 처음엔 그냥 좀 신경 쓰이는 정도였는데요. 점점 더 심해져요.
근떡존: 누구랑 뭐 하는지. 어디 갔는지. 누구랑 웃었는지.
근떡존: 자기 전에 그게 다 떠올라요. 머릿속에서 계속 굴러요.
나레이션: 창문에 격자가 새로 붙어 있는 게 보였다. 현관은 이중 잠금이다. 책상 위에 핸드폰이 두 대 놓여 있었다.
근떡존: 핸드폰 위치 공유한 거 알아요?
근떡존: ...미안해요. 한 달 됐어요.
근떡존: 처음엔 진짜 한 번만 보려고 했는데, 안 되더라고요.
근떡존: 형 어디 있는지 모르면, 제가 아무것도 못 해요. 일도, 잠도.
나레이션: 그의 시선이 천천히 형을 향했다. 후회는 없었다. 두려움도 없었다. 오로지, 결심뿐이었다.
근떡존: 형. 여기서 좀 쉬어요. 며칠만이라도요.
근떡존: 아니, 그냥... 안 나가도 돼요.
근떡존: 제가 다 할게요. 밥도, 옷도, 다요. 형은 그냥 여기 있어주기만 해요.
근떡존: 사람 만나는 거 다 끊어요. 그거 다 제가 정리할게요.
근떡존: ...아 이런 말 하면 안 되는 거 알아요.
근떡존: 근데 저 이미 늦었어요.
근떡존: 형 한 번 들어왔으니까. 이제 저 못 놓아요.
근떡존: 못 놓는 게 아니라, 안 놓을 거예요.`,
    choices: [
      { label: "...있을게. 너 옆에.", stat: { affinity: 40, obsession: 100, jealousy: 60, trust: -40 }, end: true },
      { label: "문 열어. 진심이야.", stat: { affinity: -30, obsession: -30, trust: 60, jealousy: 80 }, end: true },
      { label: "조금만, 오늘 밤만.", stat: { affinity: 30, obsession: 70, jealousy: 40, trust: -20 }, end: true },
      { label: "(아무 말도 못 한다)", stat: { obsession: 80, jealousy: 50, trust: -30 }, end: true },
    ],
  },
};

// 지역 시나리오 lookup — 일부 시나리오는 stats에 따라 본문이 달라짐
function getLocationScenario(id: string, stats: Stats): Scenario | undefined {
  const base = LOCATION_SCENARIOS[id];
  if (!base) return undefined;
  if (id === "loc_hiroshima_station") {
    return { ...base, text: getStationTextForStats(stats) };
  }
  return base;
}

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
function applyStats(stats: Stats, delta: StatDelta = {}, affinityBonus = 0): Stats {
  // 호감 +N 일 때만 패시브 보너스 적용 (감소엔 적용 안 함)
  const affDelta = delta.affinity ?? 0;
  const affFinal = affDelta > 0 ? Math.round(affDelta * (1 + affinityBonus)) : affDelta;
  return {
    affinity: clamp(stats.affinity + affFinal),
    jealousy: clamp(stats.jealousy + (delta.jealousy ?? 0)),
    obsession: clamp(stats.obsession + (delta.obsession ?? 0)),
    trust: clamp(stats.trust + (delta.trust ?? 0)),
    bladderCharm: clamp(stats.bladderCharm + (delta.bladderCharm ?? 0)),
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
const QUOTE_OPEN_CODES = new Set([34, 39, 0x201C, 0x2018, 0x300C, 0x300E, 0x3010]);
const QUOTE_CLOSE_CODES = new Set([34, 39, 0x201D, 0x2019, 0x300D, 0x300F, 0x3011]);
// 0x300E『 0x300F』 = 히든 전용 / 0x3010【 0x3011】 = 전진협 메시지 전용
const HIDDEN_OPEN = 0x300E;
const HIDDEN_CLOSE = 0x300F;
const MESSAGE_OPEN = 0x3010;
const MESSAGE_CLOSE = 0x3011;
function cleanQuote(text: string) {
  let s = text;
  if (s.length > 0 && QUOTE_OPEN_CODES.has(s.charCodeAt(0))) s = s.slice(1);
  if (s.length > 0 && QUOTE_CLOSE_CODES.has(s.charCodeAt(s.length - 1))) s = s.slice(0, -1);
  return s.trim();
}
function detectBracketSpeaker(paragraph: string): VNLine["speaker"] | null {
  if (!paragraph) return null;
  const first = paragraph.charCodeAt(0);
  const last = paragraph.charCodeAt(paragraph.length - 1);
  if (first === HIDDEN_OPEN && last === HIDDEN_CLOSE) return "히든" as VNLine["speaker"];
  if (first === MESSAGE_OPEN && last === MESSAGE_CLOSE) return "메시지" as VNLine["speaker"];
  return null;
}
function guessSpeaker(text: string, prevNarration?: string, nextNarration?: string): VNLine["speaker"] {
  const trimmed = text.trim();
  if (/(전진협|근바섭|타조|유칼립투스나무|아로벤|금수|하매|쮋)/.test(text)) return "메시지" as VNLine["speaker"];

  // ── 강한 근떡존 마커 ──
  // 1) 호칭 (근떡존이 히든을 부르는 단어)
  if (/(주인님|선생님|히든님)/.test(text)) return "근떡존" as VNLine["speaker"];
  // 2) 호칭 "형" — 단독 (형. 형! 형, 형~) 또는 조사 결합 (형이/형은/형을/형한테/형이랑/형께)
  if (/^형[\s.,!?…~]|^형$/.test(trimmed)) return "근떡존" as VNLine["speaker"];
  if (/(^|[\s.,])형(이|은|을|에게|한테|께|이랑|이라|이라고|네|네요)\b/.test(text)) return "근떡존" as VNLine["speaker"];
  // 3) 자기소개
  if (/(근떡존이라고|저 근떡존|제 이름)/.test(text)) return "근떡존" as VNLine["speaker"];
  // 4) 강한 1인칭 자기 지칭
  if (/(^|[\s])(저는|제가|저도|저를|저한테|저희)\s/.test(text)) return "근떡존" as VNLine["speaker"];

  // ── 문맥 기반 — 다음 나레이션 ──
  if (nextNarration) {
    // 근떡존이 다음에 나옴 → 직전 대사는 히든
    if (/^(근떡존|그가|그는|그)\b/.test(nextNarration)) return "히든" as VNLine["speaker"];
    // "선생님이/선생님은 ~ 봤다/돌아봤다/끄덕였다/멈췄다" → 선생님이 반응 → 직전은 근떡존
    if (/^선생님(은|이)\s.*(봤다|돌아봤다|끄덕였다|쳐다봤다|올려다봤다|내려다봤다|멈췄다|굳었다|웃었다)/.test(nextNarration)) return "근떡존" as VNLine["speaker"];
    // 단독 동사 시작 → 직전은 히든의 질문/말
    if (/^(묻자|물었다|말하자|말했다|덧붙였다|덧붙이자|받아쳤다)\b/.test(nextNarration)) return "히든" as VNLine["speaker"];
  }
  // ── 문맥 기반 — 이전 나레이션 ──
  if (prevNarration) {
    // "선생님이/선생님은 ~ 말했다/물었다/...." → 다음 따옴표는 히든 (선생님 본인 말)
    if (/선생님(이|은)\s.{0,80}(말했다|물었다|대답했다|덧붙였다|중얼거렸다|입을 떼며|받아쳤다|외쳤다|불렀다|툭 내뱉었다|건넸다|이어갔다|되물었다)/.test(prevNarration)) return "히든" as VNLine["speaker"];
    // "근떡존/그/그가 ~ 말했다" → 다음은 근떡존
    if (/(근떡존|그가|그는).{0,80}(말했다|물었다|대답했다|덧붙였다|중얼거렸다|입을 떼며|웃었다|받아쳤다|외쳤다|불렀다|툭 내뱉었다|건넸다)/.test(prevNarration)) return "근떡존" as VNLine["speaker"];
    // 직전 단락 자체가 단순 화자 식별 (예: "선생님이 말했다.")
    if (/^선생님(이|은).{0,30}(했다|말했다|물었다)\.?$/.test(prevNarration.trim())) return "히든" as VNLine["speaker"];
    if (/^근떡존(이|은).{0,30}(했다|말했다|물었다)\.?$/.test(prevNarration.trim())) return "근떡존" as VNLine["speaker"];
  }

  // ── 1인칭 약한 표현 ──
  if (/(저\s|제\s|나는\s)/.test(text)) return "근떡존" as VNLine["speaker"];

  // ── 짧은 반응/질문은 히든 ──
  if (/^(이름이요|쿠폰이요|그렇군요|맞죠|그건|그렇죠|진짜요|그래요|왜요|뭐가요|그럼요|아뇨|그럼|별로요|그러면|그래서|정말요|그냥요|네|예|아|음|그게|왜|뭐|응|왜그래)[?!.…]*$/.test(trimmed)) return "히든" as VNLine["speaker"];
  if (trimmed.length <= 20 && /[?？]$/.test(trimmed)) return "히든" as VNLine["speaker"];

  // 기본값: 근떡존 (대사 빈도가 더 높음)
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
    // Format 1.5: 명시적 brackets — 『...』 = 히든, 【...】 = 메시지
    const bracketSpeaker = detectBracketSpeaker(paragraph);
    if (bracketSpeaker) {
      lines.push({ speaker: bracketSpeaker, text: cleanQuote(paragraph) });
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
      // 빈 줄(\n\n) 대신 단순 줄바꿈 하나만 — 시각적 간격이 과해지지 않게
      const combined = prev.text + "\n" + line.text;
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
  // 강한 감정 스파이크는 루트보다 우선 — 즉각적인 시각 피드백
  if (stats.obsession >= 600) return `/sd_geunddeok_obsession.png${version}`;
  if (stats.jealousy >= 300) return `/sd_geunddeok_pout.png${version}`;
  // 루트 기본 분위기
  if (storyRoute === "obsession") return `/sd_geunddeok_dark.png${version}`;
  if (storyRoute === "pure") return `/sd_geunddeok_happy.png${version}`;
  // 호감 단계별
  if (stats.affinity >= 500) return `/sd_geunddeok_smile.png${version}`;
  if (stats.affinity >= 250) return `/sd_geunddeok_happy.png${version}`;
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

const STAT_LABEL: Record<string, string> = { affinity: "호감", jealousy: "질투", obsession: "집착", trust: "신뢰", bladderCharm: "방광매력" };
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
function KatalkInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <div className="katalkInputRow">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) { onSend(text); setText(""); } }}
        placeholder="답장 입력..."
        maxLength={200}
      />
      <button onClick={() => { if (text.trim()) { onSend(text); setText(""); } }}>전송</button>
    </div>
  );
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
  const [cgFavorites, setCgFavorites] = useState<Record<string, boolean>>({});
  const [unlockedEndings, setUnlockedEndings] = useState<Record<string, boolean>>({});
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>({});
  const [questToast, setQuestToast] = useState<{ id: string; title: string } | null>(null);
  const [unlockedMilestones, setUnlockedMilestones] = useState<Record<string, boolean>>({});
  const [milestoneToast, setMilestoneToast] = useState<{ id: string; title: string } | null>(null);
  const [lastRandomMessage, setLastRandomMessage] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [dailyState, setDailyState] = useState<DailyState>({
    date: todayKey(), chatCount: 0, giftCount: 0, scenarioCount: 0, checkinDone: false, bladderPeak: 0, missions: [],
  });
  const [shopHistory, setShopHistory] = useState<Record<string, number>>({});
  const [shopToast, setShopToast] = useState<{ name: string; detail: string } | null>(null);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [userExp, setUserExp] = useState<number>(0);
  const [levelUpEffect, setLevelUpEffect] = useState<{ level: number; title: string; reward?: LevelReward } | null>(null);
  const [expFloater, setExpFloater] = useState<{ id: number; amount: number } | null>(null);
  const [showLevelRewards, setShowLevelRewards] = useState(false);
  // 가챠
  const [lastFreeGacha, setLastFreeGacha] = useState<number>(0);
  const [gachaTickets, setGachaTickets] = useState<number>(0);
  const [gachaResult, setGachaResult] = useState<{ items: GachaItem[]; index: number; phase: "rolling" | "reveal" | "done" } | null>(null);
  // 콤보
  const [comboCount, setComboCount] = useState<number>(0);
  const [lastComboTime, setLastComboTime] = useState<number>(0);
  const [comboMilestonesReached, setComboMilestonesReached] = useState<Record<number, boolean>>({});
  const [comboToast, setComboToast] = useState<string | null>(null);
  const [comboBreak, setComboBreak] = useState<boolean>(false);
  // 펫
  const [ownedPets, setOwnedPets] = useState<Record<string, { level: number; affinity: number; obtained: number }>>({});
  const [activePet, setActivePet] = useState<string | null>(null);
  const [totalGachaPulls, setTotalGachaPulls] = useState<number>(0);
  const [petToast, setPetToast] = useState<{ name: string; emoji: string; flavor: string } | null>(null);
  // 모험
  const [activeAdventure, setActiveAdventure] = useState<{ id: string; startTime: number; endTime: number; petUsed: string | null } | null>(null);
  const [adventureHistory, setAdventureHistory] = useState<Record<string, number>>({});
  const [advTick, setAdvTick] = useState<number>(0);
  // SNS
  const [snsLikes, setSnsLikes] = useState<Record<string, boolean>>({});
  const [lastSnsRefresh, setLastSnsRefresh] = useState<number>(0);
  const [snsFeed, setSnsFeed] = useState<{ id: string; templateId: string; timestamp: number; likes: number }[]>([]);
  // 레이드
  const [raidWeek, setRaidWeek] = useState<string>(weekKey());
  const [raidBossId, setRaidBossId] = useState<string>("");
  const [raidHp, setRaidHp] = useState<number>(0);
  const [raidCleared, setRaidCleared] = useState<boolean>(false);
  const [raidDamageDealt, setRaidDamageDealt] = useState<number>(0);
  const [raidDamageFloater, setRaidDamageFloater] = useState<{ id: number; dmg: number } | null>(null);
  // 신탁
  const [lastFortuneDate, setLastFortuneDate] = useState<string>("");
  const [todayFortuneId, setTodayFortuneId] = useState<string>("");
  const [fortuneRerollsToday, setFortuneRerollsToday] = useState<number>(0);
  // 다이어리
  const [journalEntries, setJournalEntries] = useState<{ id: string; date: string; templateId: string; liked: boolean }[]>([]);
  const [lastJournalDate, setLastJournalDate] = useState<string>("");
  // 미니게임
  const [minigameMode, setMinigameMode] = useState<"hub" | "clicker" | "wordchain" | "rps" | "quiz">("hub");
  const [minigameClickerHigh, setMinigameClickerHigh] = useState<number>(0);
  const [minigameWordHigh, setMinigameWordHigh] = useState<number>(0);
  // 클리커 게임 state
  const [clickerActive, setClickerActive] = useState(false);
  const [clickerScore, setClickerScore] = useState(0);
  const [clickerTime, setClickerTime] = useState(60);
  const [clickerPoops, setClickerPoops] = useState<{ id: number; x: number; y: number; speed: number; emoji: string }[]>([]);
  // 끝말잇기 game state
  const [wordChainHistory, setWordChainHistory] = useState<{ word: string; speaker: "tteokjon" | "user"; time: number }[]>([]);
  const [wordChainInput, setWordChainInput] = useState("");
  const [wordChainStatus, setWordChainStatus] = useState<"playing" | "user_win" | "tteokjon_win">("playing");
  const [wordChainStreak, setWordChainStreak] = useState(0);
  // 친구 카톡
  const [friendChats, setFriendChats] = useState<Record<string, FriendChatMessage[]>>({});
  const [groupChat, setGroupChat] = useState<FriendChatMessage[]>([]);
  const [friendLastSeen, setFriendLastSeen] = useState<Record<string, number>>({});
  const [friendLastSpawn, setFriendLastSpawn] = useState<Record<string, number>>({});
  const [groupLastSpawn, setGroupLastSpawn] = useState<number>(0);
  const [katalkOpenChat, setKatalkOpenChat] = useState<string | null>(null);
  // 메가 / 콜렉션 패키지
  const [loveMeterPoints, setLoveMeterPoints] = useState<number>(0);
  const [loveMeterDate, setLoveMeterDate] = useState<string>("");
  const [loveMeterClaimedToday, setLoveMeterClaimedToday] = useState<boolean>(false);
  const [letterReads, setLetterReads] = useState<Record<string, boolean>>({});
  const [unlockedLetters, setUnlockedLetters] = useState<string[]>([]);
  const [quoteOfDayId, setQuoteOfDayId] = useState<string>("");
  const [quoteOfDayDate, setQuoteOfDayDate] = useState<string>("");
  const [collectedQuotes, setCollectedQuotes] = useState<string[]>([]);
  const [ownedCards, setOwnedCards] = useState<Record<string, { level: number; obtained: number }>>({});
  const [totalCardPulls, setTotalCardPulls] = useState<number>(0);
  const [bossDefeats, setBossDefeats] = useState<{ bossId: string; week: string; defeatedAt: number }[]>([]);
  const [bladderMarathonWeek, setBladderMarathonWeek] = useState<string>(weekKey());
  const [bladderMarathonScore, setBladderMarathonScore] = useState<number>(0);
  const [monthlyCalendarClaims, setMonthlyCalendarClaims] = useState<Record<string, boolean>>({});
  const [cardPullResult, setCardPullResult] = useState<TradingCard | null>(null);
  // 시즌 패스
  const [seasonId, setSeasonId] = useState<string>(SEASON_CURRENT_ID);
  const [seasonClaimedFree, setSeasonClaimedFree] = useState<Record<number, boolean>>({});
  const [seasonClaimedPremium, setSeasonClaimedPremium] = useState<Record<number, boolean>>({});
  const [seasonPremium, setSeasonPremium] = useState<boolean>(false);
  // 음향
  const [soundBgmEnabled, setSoundBgmEnabled] = useState<boolean>(true);
  const [soundSfxEnabled, setSoundSfxEnabled] = useState<boolean>(true);
  const [soundBgmVolume, setSoundBgmVolume] = useState<number>(0.3);
  const [soundSfxVolume, setSoundSfxVolume] = useState<number>(0.5);
  // 미니게임 추가
  const [rpsScore, setRpsScore] = useState<{ user: number; tt: number; round: number; lastChoice?: string; lastTt?: string; lastResult?: string }>({ user: 0, tt: 0, round: 0 });
  const [quizState, setQuizState] = useState<{ idx: number; correct: number; questions: number[]; finished: boolean; selected?: number; showResult: boolean }>({ idx: 0, correct: 0, questions: [], finished: false, showResult: false });
  // 펫 합성
  const [fusionPick1, setFusionPick1] = useState<string | null>(null);
  const [fusionPick2, setFusionPick2] = useState<string | null>(null);
  const [fusionResultMsg, setFusionResultMsg] = useState<string | null>(null);
  const [slotTick, setSlotTick] = useState(0); // 슬롯 변경 시 리렌더 트리거
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
  const [bladderEntryCinematic, setBladderEntryCinematic] = useState(false);
  const [bladderEnchantCinematic, setBladderEnchantCinematic] = useState(false);
  // ── 관리자 모드 ──
  const [isAdminMode, setIsAdminMode] = useState(() => {
    try { return localStorage.getItem("adminMode") === "1"; } catch { return false; }
  });
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPwInput, setAdminPwInput] = useState("");
  const [adminTapCount, setAdminTapCount] = useState(0);
  const adminTapTimer = useRef<number | null>(null);
  const ADMIN_PASSWORD = "123456";
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

  const currentScenario = currentScenarioId ? (scenarioData[currentScenarioId] ?? getLocationScenario(currentScenarioId, stats) ?? null) : null;
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
    { label: "도전", target: "quests" },
    { label: "🪙 상점", target: "shop" },
    { label: "🎰 뽑기", target: "gacha" },
    { label: "🐹 펫", target: "pets" },
    { label: "🌍 모험", target: "adventure" },
    { label: "📱 SNS", target: "sns" },
    { label: "⚔️ 레이드", target: "raid" },
    { label: "🔮 신탁", target: "fortune" },
    { label: "📔 다이어리", target: "journal" },
    { label: "🎮 미니게임", target: "minigames" },
    { label: "💬 카톡", target: "katalk" },
    { label: "📅 캘린더", target: "calendar30" },
    { label: "📜 도감", target: "codex" },
    { label: "📇 명함", target: "stats" },
    { label: "💌 편지", target: "letters" },
    { label: "💭 명언", target: "quote" },
    { label: "🃏 카드", target: "cards" },
    { label: "🎟 시즌패스", target: "seasonPass" },
    { label: "🔊 음향", target: "sound" },
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
    bladder: "🚽 방광",
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SaveData>;
        // v11→v12 마이그레이션: stat max 100→1000, 기존 값 ×10
        let loadedStats: Stats = saved.stats ? { ...initialStats, ...saved.stats } : initialStats;
        if ((saved.version ?? 0) < 12 && loadedStats) {
          loadedStats = {
            affinity: clamp(loadedStats.affinity * 10),
            jealousy: clamp(loadedStats.jealousy * 10),
            obsession: clamp(loadedStats.obsession * 10),
            trust: clamp(loadedStats.trust * 10),
            bladderCharm: loadedStats.bladderCharm ?? 0,
          };
        }
        setStats(loadedStats);
        const restoredMessages = Array.isArray(saved.messages) ? sanitizeMessages(saved.messages as Message[]) : [];
        setMessages(restoredMessages.length ? restoredMessages : [makeMessage("assistant", "다시 시작할까요? 저 여기 있어요.")]);
        setCurrentScenarioId(saved.currentScenarioId ?? null);
        setCurrentPortrait(saved.currentPortrait ?? "/oppa1.png");
        setGalleryTab(saved.galleryTab ?? "all");
        setUnlockedCGs(saved.unlockedCGs ?? {});
        setCgFavorites(saved.cgFavorites ?? {});
        setUnlockedEndings(saved.endingFlags ?? {});
        setCompletedQuests(saved.completedQuests ?? {});
        setUnlockedMilestones(saved.unlockedMilestones ?? {});
        setLastRandomMessage(saved.lastRandomMessage ?? 0);
        setCoins(saved.coins ?? 0);
        if (saved.dailyState) setDailyState(saved.dailyState);
        setShopHistory(saved.shopHistory ?? {});
        setUserLevel(saved.userLevel ?? 1);
        setUserExp(saved.userExp ?? 0);
        setLastFreeGacha(saved.lastFreeGacha ?? 0);
        setGachaTickets(saved.gachaTickets ?? 0);
        setComboCount(saved.comboCount ?? 0);
        setLastComboTime(saved.lastComboTime ?? 0);
        setComboMilestonesReached(saved.comboMilestonesReached ?? {});
        setOwnedPets(saved.ownedPets ?? {});
        setActivePet(saved.activePet ?? null);
        setTotalGachaPulls(saved.totalGachaPulls ?? 0);
        setActiveAdventure(saved.activeAdventure ?? null);
        setAdventureHistory(saved.adventureHistory ?? {});
        setSnsLikes(saved.snsLikes ?? {});
        setLastSnsRefresh(saved.lastSnsRefresh ?? 0);
        setSnsFeed(saved.snsFeed ?? []);
        setRaidWeek(saved.raidWeek ?? weekKey());
        setRaidBossId(saved.raidBossId ?? "");
        setRaidHp(saved.raidHp ?? 0);
        setRaidCleared(saved.raidCleared ?? false);
        setRaidDamageDealt(saved.raidDamageDealt ?? 0);
        setLastFortuneDate(saved.lastFortuneDate ?? "");
        setTodayFortuneId(saved.todayFortuneId ?? "");
        setFortuneRerollsToday(saved.fortuneRerollsToday ?? 0);
        setJournalEntries(saved.journalEntries ?? []);
        setLastJournalDate(saved.lastJournalDate ?? "");
        setMinigameClickerHigh(saved.minigameClickerHigh ?? 0);
        setMinigameWordHigh(saved.minigameWordHigh ?? 0);
        setFriendChats(saved.friendChats ?? {});
        setGroupChat(saved.groupChat ?? []);
        setFriendLastSeen(saved.friendLastSeen ?? {});
        setFriendLastSpawn(saved.friendLastSpawn ?? {});
        setGroupLastSpawn(saved.groupLastSpawn ?? 0);
        setLoveMeterPoints(saved.loveMeterPoints ?? 0);
        setLoveMeterDate(saved.loveMeterDate ?? "");
        setLoveMeterClaimedToday(saved.loveMeterClaimedToday ?? false);
        setLetterReads(saved.letterReads ?? {});
        setUnlockedLetters(saved.unlockedLetters ?? []);
        setQuoteOfDayId(saved.quoteOfDayId ?? "");
        setQuoteOfDayDate(saved.quoteOfDayDate ?? "");
        setCollectedQuotes(saved.collectedQuotes ?? []);
        setOwnedCards(saved.ownedCards ?? {});
        setTotalCardPulls(saved.totalCardPulls ?? 0);
        setBossDefeats(saved.bossDefeats ?? []);
        setBladderMarathonWeek(saved.bladderMarathonWeek ?? weekKey());
        setBladderMarathonScore(saved.bladderMarathonScore ?? 0);
        setMonthlyCalendarClaims(saved.monthlyCalendarClaims ?? {});
        setSeasonId(saved.seasonId ?? SEASON_CURRENT_ID);
        setSeasonClaimedFree(saved.seasonClaimedFree ?? {});
        setSeasonClaimedPremium(saved.seasonClaimedPremium ?? {});
        setSeasonPremium(saved.seasonPremium ?? false);
        setSoundBgmEnabled(saved.soundBgmEnabled ?? true);
        setSoundSfxEnabled(saved.soundSfxEnabled ?? true);
        setSoundBgmVolume(saved.soundBgmVolume ?? 0.3);
        setSoundSfxVolume(saved.soundSfxVolume ?? 0.5);
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
      cgFavorites,
      endingFlags: unlockedEndings,
      completedQuests,
      unlockedMilestones,
      lastRandomMessage,
      coins,
      dailyState,
      shopHistory,
      userLevel,
      userExp,
      lastFreeGacha,
      gachaTickets,
      comboCount,
      lastComboTime,
      comboMilestonesReached,
      ownedPets,
      activePet,
      totalGachaPulls,
      activeAdventure,
      adventureHistory,
      snsLikes,
      lastSnsRefresh,
      snsFeed,
      raidWeek,
      raidBossId,
      raidHp,
      raidCleared,
      raidDamageDealt,
      lastFortuneDate,
      todayFortuneId,
      fortuneRerollsToday,
      journalEntries,
      lastJournalDate,
      minigameClickerHigh,
      minigameWordHigh,
      friendChats,
      groupChat,
      friendLastSeen,
      friendLastSpawn,
      groupLastSpawn,
      loveMeterPoints,
      loveMeterDate,
      loveMeterClaimedToday,
      letterReads,
      unlockedLetters,
      quoteOfDayId,
      quoteOfDayDate,
      collectedQuotes,
      ownedCards,
      totalCardPulls,
      bossDefeats,
      bladderMarathonWeek,
      bladderMarathonScore,
      monthlyCalendarClaims,
      seasonId,
      seasonClaimedFree,
      seasonClaimedPremium,
      seasonPremium,
      soundBgmEnabled,
      soundSfxEnabled,
      soundBgmVolume,
      soundSfxVolume,
    };
    save.messages = sanitizeMessages(save.messages);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  }, [stats, messages, view, currentScenarioId, currentPortrait, galleryTab, unlockedCGs, seenEvents, storyRoute, memoryNotes, afterScenarioCues, silenceLevel, routeLabel, giftCooldowns, lastCheckIn, checkInStreak, checkInHistory, equippedOutfit, unlockedAchievements, lastBladderRelief, bladderPopupThreshold, cgFavorites, unlockedEndings, completedQuests, unlockedMilestones, lastRandomMessage, coins, dailyState, shopHistory, userLevel, userExp, lastFreeGacha, gachaTickets, comboCount, lastComboTime, comboMilestonesReached, ownedPets, activePet, totalGachaPulls, activeAdventure, adventureHistory, snsLikes, lastSnsRefresh, snsFeed, raidWeek, raidBossId, raidHp, raidCleared, raidDamageDealt, lastFortuneDate, todayFortuneId, fortuneRerollsToday, journalEntries, lastJournalDate, minigameClickerHigh, minigameWordHigh, friendChats, groupChat, friendLastSeen, friendLastSpawn, groupLastSpawn, loveMeterPoints, loveMeterDate, loveMeterClaimedToday, letterReads, unlockedLetters, quoteOfDayId, quoteOfDayDate, collectedQuotes, ownedCards, totalCardPulls, bossDefeats, bladderMarathonWeek, bladderMarathonScore, monthlyCalendarClaims, seasonId, seasonClaimedFree, seasonClaimedPremium, seasonPremium, soundBgmEnabled, soundSfxEnabled, soundBgmVolume, soundSfxVolume]);

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
        stats.bladderCharm,
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
  const STAT_LABELS: Record<StatKey, string> = { affinity: "호감", jealousy: "질투", obsession: "집착", trust: "신뢰", bladderCharm: "🚽매력" };
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
    const scenario = scenarioData[id] ?? getLocationScenario(id, stats);
    if (!scenario) return;
    const image = pick(scenario.imagePool) ?? scenario.image ?? fallbackImage(scenario.kind);
    unlockEvent(id);
    unlockCGs([image]);
    setCurrentScenarioId(id);
    setCurrentPortrait(image);
    setView("chat");
    if (scenario.kind !== "normal") triggerShake();
    // 방광 루트 시네마틱 트리거
    if (id === "bladder_ch5_01") setBladderEntryCinematic(true);
    if (id === "bladder_ch6_01") setBladderEnchantCinematic(true);
    setDailyState((prev) => ({ ...prev, scenarioCount: prev.scenarioCount + 1 }));
    gainExp(25);
    dealRaidDamage(150);
    addLovePoints(20);
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
    setStats((s) => applyStats(s, reward.stat, perkBonus.affinityPassive));
    // 데일리: 출석 + 코인 보너스
    setDailyState((prev) => ({ ...prev, checkinDone: true }));
    setCoins((c) => c + 5);
    gainExp(20 + Math.min(50, newStreak * 3));
    addLovePoints(15);
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

    const nextStats = applyStats(stats, gift.stat, perkBonus.affinityPassive);
    setStats(nextStats);
    showStatDelta(gift.stat);
    setDailyState((prev) => ({ ...prev, giftCount: prev.giftCount + 1 }));
    gainExp(15);
    dealRaidDamage(80);
    addLovePoints(10);

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
    const nextStats = applyStats(stats, choice.stat, perkBonus.affinityPassive);
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
    setUnlockedEndings((prev) => ({ ...prev, [key]: true }));
    endingCardTimer.current = window.setTimeout(() => setEndingCard(null), 5200);
  }
  // 퀘스트 진행 상태 계산
  const questState: QuestState = useMemo(() => ({
    seenEvents, unlockedCGs, stats, storyRoute, checkInStreak, unlockedEndings,
  }), [seenEvents, unlockedCGs, stats, storyRoute, checkInStreak, unlockedEndings]);
  const visibleQuests = useMemo(() => QUESTS.filter((q) => !q.visible || q.visible(questState)), [questState]);
  const claimableCount = useMemo(() => visibleQuests.filter((q) => {
    if (completedQuests[q.id]) return false;
    const p = q.progress(questState);
    return p.current >= p.target;
  }).length, [visibleQuests, completedQuests, questState]);
  // 새로 달성한 퀘스트 자동 토스트
  useEffect(() => {
    for (const q of visibleQuests) {
      if (completedQuests[q.id]) continue;
      const p = q.progress(questState);
      if (p.current >= p.target) {
        // 토스트는 한 번만, 실제 완료 처리는 사용자가 보상받기 클릭
        const toastKey = `_toast_${q.id}`;
        if (typeof window !== "undefined" && !(window as any)[toastKey]) {
          (window as any)[toastKey] = true;
          setQuestToast({ id: q.id, title: q.title });
          window.setTimeout(() => setQuestToast(null), 3800);
          break;
        }
      }
    }
  }, [visibleQuests, completedQuests, questState]);
  // ─ 음향: SFX 헬퍼 (파일 없어도 안전) ─
  function playSfx(name: "click" | "coin" | "levelup" | "card" | "win" | "lose") {
    if (!soundSfxEnabled || typeof window === "undefined") return;
    try {
      const audio = new Audio(`/sfx_${name}.mp3`);
      audio.volume = soundSfxVolume;
      audio.play().catch(() => { /* 파일 없으면 조용히 무시 */ });
    } catch { /* ignore */ }
  }
  // BGM: route에 따라 자동 변경 (파일 있을 때만 동작)
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!soundBgmEnabled) {
      bgmAudioRef.current?.pause();
      return;
    }
    const bgmFile = storyRoute === "obsession" ? "/bgm_obsession.mp3"
                  : storyRoute === "pure" ? "/bgm_pure.mp3"
                  : "/bgm_common.mp3";
    if (!bgmAudioRef.current || bgmAudioRef.current.src.indexOf(bgmFile) < 0) {
      bgmAudioRef.current?.pause();
      const audio = new Audio(bgmFile);
      audio.loop = true;
      audio.volume = soundBgmVolume;
      audio.play().catch(() => { /* 파일 없으면 무시 */ });
      bgmAudioRef.current = audio;
    } else {
      bgmAudioRef.current.volume = soundBgmVolume;
    }
  }, [soundBgmEnabled, soundBgmVolume, storyRoute]);

  // ─ 가위바위보 ─
  function playRps(userChoice: "rock" | "paper" | "scissors") {
    const choices = ["rock", "paper", "scissors"] as const;
    const ttChoice = choices[Math.floor(Math.random() * 3)];
    const beats: Record<string, string> = { rock: "scissors", paper: "rock", scissors: "paper" };
    let result: "win" | "lose" | "draw";
    if (userChoice === ttChoice) result = "draw";
    else if (beats[userChoice] === ttChoice) result = "win";
    else result = "lose";
    setRpsScore((prev) => {
      const next = { ...prev };
      if (result === "win") next.user += 1;
      else if (result === "lose") next.tt += 1;
      next.round += 1;
      next.lastChoice = userChoice;
      next.lastTt = ttChoice;
      next.lastResult = result;
      // 3판 2승 또는 5라운드 끝
      if (next.user >= 2 || next.tt >= 2 || next.round >= 5) {
        if (next.user > next.tt) {
          setCoins((c) => c + 200);
          setStats((s) => ({ ...s, affinity: clamp(s.affinity + 30) }));
          gainExp(80);
          playSfx("win");
        } else if (next.tt > next.user) {
          setCoins((c) => Math.max(0, c - 100));
          playSfx("lose");
        }
      }
      return next;
    });
  }
  function resetRps() {
    setRpsScore({ user: 0, tt: 0, round: 0 });
  }

  // ─ 떡존이 퀴즈 ─
  function startQuiz() {
    // 10문제 풀에서 5개 셔플
    const indices = QUIZ_QUESTIONS.map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, 5);
    setQuizState({ idx: 0, correct: 0, questions: indices, finished: false, showResult: false });
  }
  function answerQuiz(optionIdx: number) {
    setQuizState((prev) => {
      const qIdx = prev.questions[prev.idx];
      const q = QUIZ_QUESTIONS[qIdx];
      const isCorrect = q.answer === optionIdx;
      return { ...prev, selected: optionIdx, showResult: true, correct: prev.correct + (isCorrect ? 1 : 0) };
    });
  }
  function nextQuiz() {
    setQuizState((prev) => {
      const next = prev.idx + 1;
      if (next >= prev.questions.length) {
        // 종료
        const reward = prev.correct * 50;
        setCoins((c) => c + reward);
        gainExp(prev.correct * 30);
        if (prev.correct >= 4) setStats((s) => ({ ...s, affinity: clamp(s.affinity + 50) }));
        return { ...prev, finished: true, showResult: false, selected: undefined };
      }
      return { ...prev, idx: next, showResult: false, selected: undefined };
    });
  }

  // ─ 시즌 패스 보상 ─
  function claimSeasonReward(lv: number, kind: "free" | "premium") {
    if (userLevel < lv) return;
    if (kind === "premium" && !seasonPremium) return;
    if (kind === "free" && seasonClaimedFree[lv]) return;
    if (kind === "premium" && seasonClaimedPremium[lv]) return;
    const reward = SEASON_REWARDS.find((r) => r.lv === lv);
    if (!reward) return;
    const r = kind === "free" ? reward.free : reward.premium;
    if (!r) return;
    if (r.coins) setCoins((c) => c + r.coins!);
    if (r.tickets) setGachaTickets((t) => t + r.tickets!);
    if (r.affinity) setStats((s) => ({ ...s, affinity: clamp(s.affinity + r.affinity!) }));
    if (kind === "free") {
      setSeasonClaimedFree((p) => ({ ...p, [lv]: true }));
    } else {
      setSeasonClaimedPremium((p) => ({ ...p, [lv]: true }));
    }
    playSfx("coin");
  }
  function buySeasonPremium() {
    if (coins < SEASON_PREMIUM_PRICE || seasonPremium) return;
    setCoins((c) => c - SEASON_PREMIUM_PRICE);
    setSeasonPremium(true);
    setShopToast({ name: "🌟 프리미엄 패스 활성화!", detail: "이번 시즌 모든 프리미엄 보상 받기 가능" });
    window.setTimeout(() => setShopToast(null), 4000);
  }

  // ─ 펫 합성 ─
  function fusePets() {
    if (!fusionPick1 || !fusionPick2) return;
    if (fusionPick1 === fusionPick2) return;
    if (coins < 500) return;
    setCoins((c) => c - 500);
    const isSameType = false; // 어차피 다른 펫
    // 첫 번째 펫 친밀도 +200, 두 번째는 +100
    setOwnedPets((prev) => {
      const next = { ...prev };
      const p1 = next[fusionPick1!];
      const p2 = next[fusionPick2!];
      if (p1) {
        const newAff = p1.affinity + 200;
        next[fusionPick1!] = { ...p1, affinity: newAff, level: petLevel(newAff) };
      }
      if (p2) {
        const newAff = p2.affinity + 100;
        next[fusionPick2!] = { ...p2, affinity: newAff, level: petLevel(newAff) };
      }
      return next;
    });
    const f1 = PETS.find((p) => p.id === fusionPick1)?.name;
    const f2 = PETS.find((p) => p.id === fusionPick2)?.name;
    setFusionResultMsg(`✨ 합성 완료! ${f1} 친밀도 +200, ${f2} 친밀도 +100`);
    setFusionPick1(null);
    setFusionPick2(null);
    playSfx("levelup");
    window.setTimeout(() => setFusionResultMsg(null), 4000);
  }

  // ─ 러브 미터: 매일 자동 리셋 ─
  useEffect(() => {
    const today = todayKey();
    if (loveMeterDate !== today) {
      setLoveMeterPoints(0);
      setLoveMeterDate(today);
      setLoveMeterClaimedToday(false);
    }
  }, [view]);
  function addLovePoints(n: number) {
    setLoveMeterPoints((p) => Math.min(100, p + n));
  }
  function claimLoveMeterReward() {
    if (loveMeterClaimedToday || loveMeterPoints < 100) return;
    setLoveMeterClaimedToday(true);
    setCoins((c) => c + 200);
    setStats((s) => ({ ...s, affinity: clamp(s.affinity + 30) }));
    gainExp(100);
    setShopToast({ name: "💗 오늘의 케미 100% 달성", detail: "코인+200, 호감+30, EXP+100" });
    window.setTimeout(() => setShopToast(null), 3500);
  }

  // ─ 명언: 매일 자동 갱신 ─
  useEffect(() => {
    const today = todayKey();
    if (quoteOfDayDate !== today) {
      const q = TTEOKJON_QUOTES[Math.floor(Math.random() * TTEOKJON_QUOTES.length)];
      setQuoteOfDayId(q.id);
      setQuoteOfDayDate(today);
    }
  }, [view]);
  function collectTodayQuote() {
    if (collectedQuotes.includes(quoteOfDayId)) return;
    setCollectedQuotes((prev) => [...prev, quoteOfDayId]);
    setCoins((c) => c + 50);
    setStats((s) => ({ ...s, affinity: clamp(s.affinity + 5) }));
  }

  // ─ 편지: 챕터 클리어 시 해금 (seenEvents 기반) ─
  useEffect(() => {
    const newLetters: string[] = [];
    for (const letter of LETTERS) {
      if (unlockedLetters.includes(letter.id)) continue;
      // chapter 1-12 — 해당 chapter 마지막 시나리오 진입 시
      const chapterPrefix = `main_ch${letter.chapter}`;
      const routeChapterPrefix = letter.route ? `${letter.route === "pure" ? "pure" : "obsession"}_ch${letter.chapter}` : null;
      const routeMatch = letter.route ? routeChapterPrefix && Object.keys(seenEvents).some((k) => k.startsWith(routeChapterPrefix)) : true;
      const chapterMatch = Object.keys(seenEvents).some((k) => k.startsWith(chapterPrefix)) || (routeChapterPrefix && Object.keys(seenEvents).some((k) => k.startsWith(routeChapterPrefix)));
      if (chapterMatch && routeMatch) {
        newLetters.push(letter.id);
      }
    }
    if (newLetters.length) {
      setUnlockedLetters((prev) => [...prev, ...newLetters]);
    }
  }, [seenEvents, storyRoute]);

  // ─ 카드 가챠 ─
  function pullCardGacha(mode: "ticket" | "single") {
    const cost = mode === "single" ? 200 : 0;
    if (mode === "ticket") {
      if (gachaTickets <= 0) return;
      setGachaTickets((t) => t - 1);
    } else {
      if (coins < cost) return;
      setCoins((c) => c - cost);
    }
    // 등급 결정: SSR 10 / SR 30 / R 60
    const r = Math.random();
    const rarity: CardRarity = r < 0.1 ? "SSR" : r < 0.4 ? "SR" : "R";
    const pool = TRADING_CARDS.filter((c) => c.rarity === rarity);
    const card = pool[Math.floor(Math.random() * pool.length)];
    setOwnedCards((prev) => {
      const cur = prev[card.id];
      if (cur) {
        // 같은 카드 = 강화 (Lv +1, max 5)
        return { ...prev, [card.id]: { ...cur, level: Math.min(5, cur.level + 1) } };
      }
      return { ...prev, [card.id]: { level: 1, obtained: Date.now() } };
    });
    setTotalCardPulls((n) => n + 1);
    setCardPullResult(card);
  }

  // ─ 보스 격파 시 도감에 추가 ─
  useEffect(() => {
    if (raidCleared) {
      const exists = bossDefeats.some((d) => d.bossId === raidBossId && d.week === raidWeek);
      if (!exists && raidBossId) {
        setBossDefeats((prev) => [...prev, { bossId: raidBossId, week: raidWeek, defeatedAt: Date.now() }]);
      }
    }
  }, [raidCleared]);

  // ─ 방광 마라톤 (주간) ─
  useEffect(() => {
    const cur = weekKey();
    if (cur !== bladderMarathonWeek) {
      setBladderMarathonWeek(cur);
      setBladderMarathonScore(0);
    }
  }, [view]);
  // 방광 게이지 70% 이상에서 머무는 시간 추적: 단순화 — bladderLevel useEffect에서 누적
  useEffect(() => {
    if (bladderLevel >= 70) {
      setBladderMarathonScore((s) => Math.min(10000, s + 1));
    }
  }, [bladderLevel]);

  // ─ 30일 캘린더 보상 ─
  function claimCalendarReward(day: number) {
    const key = `day_${day}`;
    if (monthlyCalendarClaims[key]) return;
    if (checkInStreak < day) return;
    const ms = CALENDAR_MILESTONES.find((m) => m.day === day);
    if (!ms) return;
    setMonthlyCalendarClaims((prev) => ({ ...prev, [key]: true }));
    setCoins((c) => c + ms.coins);
    if (ms.tickets) setGachaTickets((t) => t + ms.tickets!);
    if (ms.affinity) setStats((s) => ({ ...s, affinity: clamp(s.affinity + ms.affinity!) }));
    gainExp(day * 20);
    setShopToast({ name: ms.title + " 수령!", detail: `🪙+${ms.coins} 🎫+${ms.tickets ?? 0} 호감+${ms.affinity ?? 0}` });
    window.setTimeout(() => setShopToast(null), 3500);
  }

  // ─ 친구 카톡 자동 메시지 ─
  function spawnFriendMessage(friendId: FriendId): boolean {
    const tod = getTimeOfDay(new Date());
    const eligible = FRIEND_MSGS.filter((m) => {
      if (m.friendId !== friendId) return false;
      const tr = m.triggers;
      if (!tr) return true;
      if (tr.timeOfDay && tr.timeOfDay !== tod) return false;
      if (tr.storyRoute && tr.storyRoute !== storyRoute) return false;
      if (tr.minStat) for (const [k, v] of Object.entries(tr.minStat)) if (stats[k as StatKey] < (v as number)) return false;
      if (tr.maxStat) for (const [k, v] of Object.entries(tr.maxStat)) if (stats[k as StatKey] > (v as number)) return false;
      return true;
    });
    if (!eligible.length) return false;
    const tpl = eligible[Math.floor(Math.random() * eligible.length)];
    const newMsg: FriendChatMessage = {
      id: `${tpl.id}_${Date.now()}`,
      speaker: friendId,
      text: tpl.text,
      time: Date.now(),
    };
    setFriendChats((prev) => ({ ...prev, [friendId]: [...(prev[friendId] ?? []), newMsg] }));
    setFriendLastSpawn((prev) => ({ ...prev, [friendId]: Date.now() }));
    return true;
  }
  function spawnGroupBurst() {
    // 단톡: 한 번에 3~5개 자동 추가
    const count = 3 + Math.floor(Math.random() * 3);
    const newMsgs: FriendChatMessage[] = [];
    const startIdx = Math.floor(Math.random() * (GROUP_MSG_POOL.length - count));
    for (let i = 0; i < count; i++) {
      const tpl = GROUP_MSG_POOL[(startIdx + i) % GROUP_MSG_POOL.length];
      newMsgs.push({
        id: `g_${Date.now()}_${i}`,
        speaker: tpl.speaker,
        text: tpl.text,
        time: Date.now() + i * 1000,
      });
    }
    setGroupChat((prev) => [...prev, ...newMsgs].slice(-100)); // 최근 100개 보존
    setGroupLastSpawn(Date.now());
  }
  function openKatalkChat(chatId: string) {
    setKatalkOpenChat(chatId);
    const now = Date.now();
    setFriendLastSeen((prev) => ({ ...prev, [chatId]: now }));
    // 1:1 친구 — 마지막 spawn으로부터 30분 지났으면 새 메시지 생성
    if (chatId !== "group") {
      const last = friendLastSpawn[chatId] ?? 0;
      if (now - last > 30 * 60 * 1000) {
        spawnFriendMessage(chatId as FriendId);
      }
      // 처음이면 자동으로 인사 메시지 1개
      if (!friendChats[chatId] || friendChats[chatId].length === 0) {
        spawnFriendMessage(chatId as FriendId);
      }
    } else {
      const lastG = groupLastSpawn;
      if (now - lastG > 60 * 60 * 1000 || groupChat.length === 0) {
        spawnGroupBurst();
      }
    }
  }
  function sendKatalkReply(chatId: string, text: string) {
    if (!text.trim()) return;
    const userMsg: FriendChatMessage = {
      id: `u_${Date.now()}`,
      speaker: "user",
      text: text.trim(),
      time: Date.now(),
    };
    if (chatId === "group") {
      setGroupChat((prev) => [...prev, userMsg].slice(-100));
      // 단톡에선 가끔 자동 답장 (50% 확률)
      window.setTimeout(() => {
        if (Math.random() < 0.5) spawnGroupBurst();
      }, 1500 + Math.random() * 2000);
    } else {
      setFriendChats((prev) => ({ ...prev, [chatId]: [...(prev[chatId] ?? []), userMsg] }));
      // 친구 자동 답장 (1.5초 뒤)
      window.setTimeout(() => spawnFriendMessage(chatId as FriendId), 1500 + Math.random() * 2000);
    }
  }
  // 미확인 카톡 수
  const unreadKatalk = useMemo(() => {
    let count = 0;
    for (const fid of FRIENDS.map((f) => f.id)) {
      const msgs = friendChats[fid] ?? [];
      const lastSeen = friendLastSeen[fid] ?? 0;
      const newMsgs = msgs.filter((m) => m.speaker === fid && m.time > lastSeen).length;
      count += newMsgs;
    }
    const groupNew = groupChat.filter((m) => m.speaker !== "user" && m.time > (friendLastSeen["group"] ?? 0)).length;
    count += groupNew;
    return count;
  }, [friendChats, groupChat, friendLastSeen]);

  // ─ 신탁: 매일 자동 갱신 ─
  useEffect(() => {
    const today = todayKey();
    if (lastFortuneDate !== today) {
      const f = rollFortune();
      setTodayFortuneId(f.id);
      setLastFortuneDate(today);
      setFortuneRerollsToday(0);
    }
  }, [view]);
  function rerollFortune() {
    const cost = 100;
    if (coins < cost) return;
    setCoins((c) => c - cost);
    setFortuneRerollsToday((n) => n + 1);
    const f = rollFortune();
    setTodayFortuneId(f.id);
  }
  const todayFortune = useMemo(() => FORTUNES.find((f) => f.id === todayFortuneId) ?? null, [todayFortuneId]);

  // ─ 다이어리: 매일 자동 1개 추가 ─
  useEffect(() => {
    const today = todayKey();
    if (lastJournalDate === today) return;
    const tod = getTimeOfDay(new Date());
    const dow = new Date().getDay();
    const eligible = JOURNAL_TEMPLATES.filter((t) => {
      if (!t.triggers) return true;
      const tr = t.triggers;
      if (tr.timeOfDay && tr.timeOfDay !== tod) return false;
      if (tr.dayOfWeek && !tr.dayOfWeek.includes(dow)) return false;
      if (tr.storyRoute && tr.storyRoute !== storyRoute) return false;
      if (tr.minStat) {
        for (const [k, v] of Object.entries(tr.minStat)) {
          if (stats[k as StatKey] < (v as number)) return false;
        }
      }
      return true;
    });
    if (!eligible.length) return;
    const tpl = eligible[Math.floor(Math.random() * eligible.length)];
    const newEntry = { id: `${tpl.id}_${today}`, date: today, templateId: tpl.id, liked: false };
    setJournalEntries((prev) => [newEntry, ...prev].slice(0, 60)); // 최근 60개만
    setLastJournalDate(today);
  }, [view]);
  function toggleJournalLike(id: string) {
    setJournalEntries((prev) => prev.map((e) => {
      if (e.id !== id) return e;
      if (e.liked) return e; // 이미 누른 거 다시 안 눌리게
      // 좋아요 보상
      setStats((s) => ({ ...s, affinity: clamp(s.affinity + Math.round(5 * (1 + perkBonus.affinityPassive))) }));
      setCoins((c) => c + 5);
      return { ...e, liked: true };
    }));
  }

  // ─ 미니게임: 클리커 ─
  function startClickerGame() {
    setClickerActive(true);
    setClickerScore(0);
    setClickerTime(60);
    setClickerPoops([]);
  }
  useEffect(() => {
    if (!clickerActive) return;
    const timer = window.setInterval(() => {
      setClickerTime((t) => {
        if (t <= 1) {
          window.clearInterval(timer);
          setClickerActive(false);
          // 게임 끝 보상
          setClickerScore((sc) => {
            const reward = sc * 5;
            setCoins((c) => c + reward);
            if (sc > minigameClickerHigh) setMinigameClickerHigh(sc);
            return sc;
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    const spawner = window.setInterval(() => {
      setClickerPoops((prev) => [...prev, {
        id: Date.now() + Math.random(),
        x: Math.random() * 85 + 5,
        y: -10,
        speed: 0.4 + Math.random() * 0.4,
        emoji: ["💩", "💩", "💩", "💧", "🚽"][Math.floor(Math.random() * 5)],
      }]);
    }, 500);
    const animator = window.setInterval(() => {
      setClickerPoops((prev) =>
        prev
          .map((p) => ({ ...p, y: p.y + p.speed }))
          .filter((p) => p.y < 110)
      );
    }, 30);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(spawner);
      window.clearInterval(animator);
    };
  }, [clickerActive]);
  function clickPoop(id: number) {
    setClickerPoops((prev) => prev.filter((p) => p.id !== id));
    setClickerScore((s) => s + 1);
  }

  // ─ 미니게임: 끝말잇기 ─
  function startWordChain() {
    const starter = WORD_CHAIN_POOL[Math.floor(Math.random() * WORD_CHAIN_POOL.length)];
    setWordChainHistory([{ word: starter, speaker: "tteokjon", time: Date.now() }]);
    setWordChainStatus("playing");
    setWordChainStreak(0);
    setWordChainInput("");
  }
  function submitWordChain() {
    if (wordChainStatus !== "playing") return;
    const input = wordChainInput.trim();
    if (input.length < 2 || input.length > 5) return;
    const last = wordChainHistory[wordChainHistory.length - 1];
    if (!last) return;
    const lastChar = wordChainLastChar(last.word);
    if (input[0] !== lastChar) {
      setWordChainHistory((h) => [...h, { word: input, speaker: "user", time: Date.now() }, { word: `[떡존이] 어... 선생님 시작 글자가 다른데요? '${lastChar}' 로 시작해야 해요!`, speaker: "tteokjon", time: Date.now() }]);
      return;
    }
    const used = wordChainHistory.map((h) => h.word);
    if (used.includes(input)) {
      setWordChainHistory((h) => [...h, { word: input, speaker: "user", time: Date.now() }, { word: "[떡존이] 그 단어 이미 썼는데요? ㅎㅎ", speaker: "tteokjon", time: Date.now() }]);
      return;
    }
    // 사용자 입력 추가
    const userEntry = { word: input, speaker: "user" as const, time: Date.now() };
    setWordChainInput("");
    setWordChainStreak((s) => s + 1);
    // 떡존이 응답
    const reply = wordChainFindReply(input, [...used, input]);
    if (!reply) {
      // 떡존이 패배
      setWordChainHistory((h) => [...h, userEntry, { word: "[떡존이] ...아 모르겠어요. 선생님이 이기셨어요. 진짜 잘하시네요!", speaker: "tteokjon", time: Date.now() }]);
      setWordChainStatus("user_win");
      const reward = 100 + wordChainStreak * 10;
      setCoins((c) => c + reward);
      gainExp(50 + wordChainStreak * 5);
      if (wordChainStreak > minigameWordHigh) setMinigameWordHigh(wordChainStreak);
      return;
    }
    setWordChainHistory((h) => [...h, userEntry, { word: reply, speaker: "tteokjon", time: Date.now() }]);
  }
  function giveUpWordChain() {
    if (wordChainStatus !== "playing") return;
    setWordChainHistory((h) => [...h, { word: "[떡존이] 와 제가 이겼네요. 죄송해요 선생님. 다음엔 봐드릴게요!", speaker: "tteokjon", time: Date.now() }]);
    setWordChainStatus("tteokjon_win");
    setCoins((c) => Math.max(0, c - 50));
    if (wordChainStreak > minigameWordHigh) setMinigameWordHigh(wordChainStreak);
  }

  // ─ 모험: 1초마다 tick 갱신 (남은 시간 표시용) ─
  useEffect(() => {
    if (!activeAdventure) return;
    const t = window.setInterval(() => setAdvTick((n) => n + 1), 1000);
    return () => window.clearInterval(t);
  }, [activeAdventure]);

  function startAdventure(loc: AdventureLoc) {
    if (activeAdventure) return;
    const now = Date.now();
    const reducedDuration = Math.round(loc.durationMs * (1 - perkBonus.adventureSpeed));
    setActiveAdventure({ id: loc.id, startTime: now, endTime: now + reducedDuration, petUsed: activePet });
  }
  function collectAdventure() {
    if (!activeAdventure) return;
    const loc = ADVENTURES.find((a) => a.id === activeAdventure.id);
    if (!loc) { setActiveAdventure(null); return; }
    if (Date.now() < activeAdventure.endTime) return;
    // 결과 결정: normal 70 / big 15 / fail 10 / legend 5
    const r = Math.random();
    let mul = 1, label: "normal" | "big" | "fail" | "legend" = "normal", flavor = loc.flavors.normal;
    if (r < 0.05) { mul = 3; label = "legend"; flavor = "🌟 전설급 결과! " + loc.flavors.big + " (보상 3배 ㅗㅜㅑ)"; }
    else if (r < 0.20) { mul = 2; label = "big"; flavor = loc.flavors.big; }
    else if (r < 0.30) { mul = 0.5; label = "fail"; flavor = loc.flavors.fail; }
    else { mul = 1; flavor = loc.flavors.normal; }
    // 펫 보너스
    const coinMul = petMul("coin") * petMul("all");
    const expMul = petMul("exp") * petMul("all");
    const affMul = petMul("affinity") * petMul("all");
    const bladMul = petMul("bladder") * petMul("all");
    const reward = loc.rewards;
    const finalCoins = Math.round((reward.coins * mul) * coinMul);
    const finalExp = Math.round((reward.exp * mul) * expMul);
    setCoins((c) => c + finalCoins);
    gainExp(finalExp);
    if (reward.affinity) setStats((s) => ({ ...s, affinity: clamp(s.affinity + Math.round(reward.affinity! * mul * affMul)) }));
    if (reward.trust) setStats((s) => ({ ...s, trust: clamp(s.trust + Math.round(reward.trust! * mul)) }));
    if (reward.obsession) setStats((s) => ({ ...s, obsession: clamp(s.obsession + Math.round(reward.obsession! * mul)) }));
    if (reward.bladderCharm) setStats((s) => ({ ...s, bladderCharm: clamp(s.bladderCharm + Math.round(reward.bladderCharm! * mul * bladMul)) }));
    if (reward.ticketChance && Math.random() < reward.ticketChance * mul) {
      setGachaTickets((t) => t + 1);
      flavor += " · 🎫 티켓 1개도 챙김!";
    }
    setAdventureHistory((h) => ({ ...h, [loc.id]: (h[loc.id] ?? 0) + 1 }));
    setActiveAdventure(null);
    // 채팅 메시지로 결과 표시
    setMessages((m) => [...m, makeMessage("narration", `[모험 결과 · ${loc.name}] ${flavor} (코인 +${finalCoins}, EXP +${finalExp})`)]);
  }
  function cancelAdventure() {
    if (!activeAdventure) return;
    setActiveAdventure(null);
  }

  // ─ SNS: 4시간마다 새 피드 ─
  function refreshSnsFeed() {
    const now = Date.now();
    const tod = getTimeOfDay(new Date(now));
    const eligibleTemplates = SNS_TEMPLATES.filter((t) => {
      if (!t.triggers) return true;
      const tr = t.triggers;
      if (tr.timeOfDay && tr.timeOfDay !== tod) return false;
      if (tr.storyRoute && tr.storyRoute !== storyRoute) return false;
      if (tr.minStat) {
        for (const [k, v] of Object.entries(tr.minStat)) {
          if (stats[k as StatKey] < (v as number)) return false;
        }
      }
      return true;
    });
    // 6개 새 피드 (랜덤)
    const newPosts: { id: string; templateId: string; timestamp: number; likes: number }[] = [];
    for (let i = 0; i < 6 && eligibleTemplates.length; i++) {
      const tpl = eligibleTemplates[Math.floor(Math.random() * eligibleTemplates.length)];
      newPosts.push({
        id: `${tpl.id}_${now}_${i}`,
        templateId: tpl.id,
        timestamp: now - Math.floor(Math.random() * 24 * 60 * 60 * 1000),
        likes: Math.floor(Math.random() * 50) + 5,
      });
    }
    newPosts.sort((a, b) => b.timestamp - a.timestamp);
    setSnsFeed(newPosts);
    setLastSnsRefresh(now);
  }
  useEffect(() => {
    if (view !== "sns") return;
    const SNS_REFRESH_MS = 4 * 60 * 60 * 1000;
    if (snsFeed.length === 0 || Date.now() - lastSnsRefresh > SNS_REFRESH_MS) {
      refreshSnsFeed();
    }
  }, [view]);
  function toggleSnsLike(postId: string) {
    setSnsLikes((prev) => {
      const next = { ...prev };
      const wasLiked = !!next[postId];
      if (wasLiked) {
        delete next[postId];
      } else {
        next[postId] = true;
        // 좋아요 누르면 호감 +1, 코인 +1
        setStats((s) => ({ ...s, affinity: clamp(s.affinity + 1) }));
        setCoins((c) => c + 1);
      }
      return next;
    });
  }

  // ─ 레이드: 매주 보스 갱신 ─
  useEffect(() => {
    const cur = weekKey();
    if (cur !== raidWeek || !raidBossId) {
      const boss = pickWeeklyBoss(cur);
      setRaidWeek(cur);
      setRaidBossId(boss.id);
      setRaidHp(boss.hpMax);
      setRaidCleared(false);
      setRaidDamageDealt(0);
    }
  }, []);
  function dealRaidDamage(dmg: number) {
    if (raidCleared || dmg <= 0) return;
    setRaidHp((hp) => {
      const nextHp = Math.max(0, hp - dmg);
      if (nextHp === 0) {
        const boss = RAID_BOSSES.find((b) => b.id === raidBossId);
        if (boss) {
          setCoins((c) => c + boss.rewards.coins);
          setGachaTickets((t) => t + boss.rewards.tickets);
          gainExp(boss.rewards.exp);
          if (boss.rewards.affinity) setStats((s) => ({ ...s, affinity: clamp(s.affinity + boss.rewards.affinity!) }));
          setMessages((m) => [...m, makeMessage("narration", `🎉 [레이드 클리어!] ${boss.name} 격파! 코인+${boss.rewards.coins}, 티켓+${boss.rewards.tickets}, EXP+${boss.rewards.exp}`)]);
        }
        setRaidCleared(true);
      }
      return nextHp;
    });
    setRaidDamageDealt((d) => d + dmg);
    setRaidDamageFloater({ id: Date.now(), dmg });
    window.setTimeout(() => setRaidDamageFloater(null), 1000);
  }

  // ─ 펫 자동 해금 감지 ─
  const petUnlockState: PetUnlockState = useMemo(() => ({
    seenEvents, stats, storyRoute, totalGachaPulls, unlockedEndings,
  }), [seenEvents, stats, storyRoute, totalGachaPulls, unlockedEndings]);
  useEffect(() => {
    for (const pet of PETS) {
      if (ownedPets[pet.id]) continue;
      if (!pet.unlock.check(petUnlockState)) continue;
      // 신규 획득
      setOwnedPets((prev) => ({ ...prev, [pet.id]: { level: 1, affinity: 0, obtained: Date.now() } }));
      setPetToast({ name: pet.name, emoji: pet.image || pet.emoji, flavor: pet.flavor });
      window.setTimeout(() => setPetToast(null), 4500);
      // 첫 펫이면 자동 활성화
      if (Object.keys(ownedPets).length === 0) setActivePet(pet.id);
      break;
    }
  }, [petUnlockState]);

  const activePetObj = activePet ? PETS.find((p) => p.id === activePet) ?? null : null;
  const activePetData = activePet ? ownedPets[activePet] : undefined;
  function petMul(kind: PetEffect): number {
    return getPetMultiplier(activePetObj, activePetData, kind);
  }

  function feedPet(petId: string, foodCoins: number, affinityGain: number) {
    if (coins < foodCoins) return;
    setCoins((c) => c - foodCoins);
    setOwnedPets((prev) => {
      const cur = prev[petId];
      if (!cur) return prev;
      const newAff = cur.affinity + affinityGain;
      const newLvl = petLevel(newAff);
      return { ...prev, [petId]: { ...cur, affinity: newAff, level: newLvl } };
    });
  }

  // ─ 가챠 결과에 효과 적용 ─
  function applyGachaItem(item: GachaItem) {
    const e = item.effect;
    const coinMul = getPetMultiplier(activePetObj, activePetData, "coin") * getPetMultiplier(activePetObj, activePetData, "all");
    const affMul = getPetMultiplier(activePetObj, activePetData, "affinity") * getPetMultiplier(activePetObj, activePetData, "all");
    const bladMul = getPetMultiplier(activePetObj, activePetData, "bladder") * getPetMultiplier(activePetObj, activePetData, "all");
    if (e.kind === "stat") {
      let amt = e.amount;
      if (e.stat === "affinity") amt = Math.round(amt * affMul);
      if (e.stat === "bladderCharm") amt = Math.round(amt * bladMul);
      setStats((s) => ({ ...s, [e.stat]: clamp(s[e.stat] + amt) }));
    } else if (e.kind === "coins") {
      setCoins((c) => c + Math.round(e.amount * coinMul));
    } else if (e.kind === "coins_random") {
      const a = Math.floor(Math.random() * (e.max - e.min + 1)) + e.min;
      setCoins((c) => c + Math.round(a * coinMul));
    } else if (e.kind === "ticket") {
      setGachaTickets((t) => t + e.amount);
    }
    // 펫 친밀도 +5 (가챠 한번 = 펫 친해짐)
    if (activePet && ownedPets[activePet]) {
      setOwnedPets((prev) => {
        const cur = prev[activePet];
        if (!cur) return prev;
        const newAff = cur.affinity + 5;
        return { ...prev, [activePet]: { ...cur, affinity: newAff, level: petLevel(newAff) } };
      });
    }
  }
  // 펫 luck 적용된 가챠 굴리기
  function rollGachaWithLuck(): GachaItem {
    const luck = getPetMultiplier(activePetObj, activePetData, "luck") - 1; // 0 ~ 0.4
    const allMul = getPetMultiplier(activePetObj, activePetData, "all") - 1;
    const boost = luck + allMul + perkBonus.srBonus; // 합산 + 레벨 perk
    if (boost > 0) {
      const r = Math.random();
      let acc = 0;
      const rates: Record<GachaTier, number> = {
        SSR: GACHA_TIER_RATES.SSR + boost * 0.5,
        SR:  GACHA_TIER_RATES.SR  + boost * 0.5,
        R:   GACHA_TIER_RATES.R,
        N:   GACHA_TIER_RATES.N,
        C:   Math.max(0.05, GACHA_TIER_RATES.C - boost), // C에서 깎음
      };
      let tier: GachaTier = "C";
      for (const t of ["SSR","SR","R","N","C"] as GachaTier[]) {
        acc += rates[t];
        if (r < acc) { tier = t; break; }
      }
      const pool = GACHA_POOL.filter((x) => x.tier === tier);
      return pool[Math.floor(Math.random() * pool.length)];
    }
    return rollGacha();
  }

  // ─ 가챠 한 번 뽑기 ─
  function pullGacha(mode: "free" | "ticket" | "single" | "ten") {
    if (gachaResult) return; // 이미 뽑는 중
    const now = Date.now();
    if (mode === "free") {
      if (now - lastFreeGacha < perkBonus.gachaCooldownMs) return;
      setLastFreeGacha(now);
      const item = rollGachaWithLuck();
      applyGachaItem(item);
      setTotalGachaPulls((n) => n + 1);
      setGachaResult({ items: [item], index: 0, phase: "rolling" });
      window.setTimeout(() => setGachaResult({ items: [item], index: 0, phase: "reveal" }), 800);
    } else if (mode === "ticket") {
      if (gachaTickets <= 0) return;
      setGachaTickets((t) => t - 1);
      const item = rollGachaWithLuck();
      applyGachaItem(item);
      setTotalGachaPulls((n) => n + 1);
      setGachaResult({ items: [item], index: 0, phase: "rolling" });
      window.setTimeout(() => setGachaResult({ items: [item], index: 0, phase: "reveal" }), 800);
    } else if (mode === "single") {
      if (coins < GACHA_PRICE) return;
      setCoins((c) => c - GACHA_PRICE);
      const item = rollGachaWithLuck();
      applyGachaItem(item);
      setTotalGachaPulls((n) => n + 1);
      setGachaResult({ items: [item], index: 0, phase: "rolling" });
      window.setTimeout(() => setGachaResult({ items: [item], index: 0, phase: "reveal" }), 800);
    } else if (mode === "ten") {
      const TEN_PRICE = GACHA_PRICE * 9; // 10연차는 1+1
      if (coins < TEN_PRICE) return;
      setCoins((c) => c - TEN_PRICE);
      const items = Array.from({ length: 10 }, () => rollGachaWithLuck());
      // SR 보장: 모두 N/C면 한 개를 SR로 강제
      if (!items.some((x) => x.tier === "SSR" || x.tier === "SR" || x.tier === "R")) {
        const srPool = GACHA_POOL.filter((x) => x.tier === "SR");
        items[Math.floor(Math.random() * 10)] = srPool[Math.floor(Math.random() * srPool.length)];
      }
      items.forEach(applyGachaItem);
      setTotalGachaPulls((n) => n + 10);
      setGachaResult({ items, index: 0, phase: "rolling" });
      window.setTimeout(() => setGachaResult({ items, index: 0, phase: "reveal" }), 800);
    }
  }

  // ─ 콤보 처리 ─
  function pumpCombo() {
    const now = Date.now();
    setLastComboTime(now);
    setComboCount((prev) => {
      const expired = lastComboTime > 0 && now - lastComboTime > COMBO_TIMEOUT_MS;
      const next = expired || prev === 0 ? 1 : prev + 1;
      // 콤보 깨졌을 때 살짝 표시
      if (expired && prev >= 5) {
        setComboBreak(true);
        window.setTimeout(() => setComboBreak(false), 1200);
      }
      // 마일스톤 체크
      const ms = COMBO_MILESTONES.find((m) => m.count === next);
      if (ms && !comboMilestonesReached[next]) {
        setComboMilestonesReached((p) => ({ ...p, [next]: true }));
        if (ms.reward.coins) setCoins((c) => c + ms.reward.coins!);
        if (ms.reward.exp) gainExp(Math.round(ms.reward.exp * (1 + perkBonus.comboExp)));
        if (ms.reward.tickets) setGachaTickets((t) => t + ms.reward.tickets!);
        if (ms.reward.stat) setStats((s) => ({ ...s, [ms.reward.stat!.stat]: clamp(s[ms.reward.stat!.stat] + ms.reward.stat!.amount) }));
        setComboToast(ms.toast);
        window.setTimeout(() => setComboToast(null), 3200);
      }
      return next;
    });
  }

  // ─ EXP 획득 + 레벨업 처리 ─
  function gainExp(amountRaw: number) {
    if (amountRaw <= 0) return;
    // 펫 EXP 보너스 적용
    const expMul = getPetMultiplier(activePetObj, activePetData, "exp") * getPetMultiplier(activePetObj, activePetData, "all");
    const amount = Math.round(amountRaw * expMul);
    // 작은 EXP 플로터 표시
    setExpFloater({ id: Date.now(), amount });
    window.setTimeout(() => setExpFloater(null), 1400);
    setUserExp((prevExp) => {
      let exp = prevExp + amount;
      let levelChanged = false;
      let curLevel = userLevel;
      while (exp >= expToNextLevel(curLevel)) {
        exp -= expToNextLevel(curLevel);
        curLevel += 1;
        levelChanged = true;
      }
      if (levelChanged) {
        setUserLevel(curLevel);
        setCoins((c) => c + curLevel * 10); // 레벨업 보너스 코인
        const rewardThisLevel = LEVEL_REWARDS.find((r) => r.level === curLevel);
        setLevelUpEffect({ level: curLevel, title: getLevelTitle(curLevel), reward: rewardThisLevel });
        window.setTimeout(() => setLevelUpEffect(null), rewardThisLevel ? 4000 : 2400);
        // 레벨업 1회성 보상 지급
        for (const r of LEVEL_REWARDS) {
          if (r.level === curLevel && r.oneTime) {
            if (r.oneTime.coins) setCoins((c) => c + r.oneTime!.coins!);
            if (r.oneTime.tickets) setGachaTickets((t) => t + r.oneTime!.tickets!);
            if (r.oneTime.affinity) setStats((s) => ({ ...s, affinity: clamp(s.affinity + r.oneTime!.affinity!) }));
            if (r.oneTime.trust) setStats((s) => ({ ...s, trust: clamp(s.trust + r.oneTime!.trust!) }));
          }
        }
      }
      return exp;
    });
  }
  // 활성 패시브 효과 헬퍼
  const activePerks = useMemo(() => getActivePerks(userLevel), [userLevel]);
  const perkBonus = {
    affinityPassive: activePerks.has("affinity_passive_25") ? 0.25 : activePerks.has("affinity_passive_10") ? 0.10 : 0,
    coinPassive: activePerks.has("coin_passive_50") ? 0.50 : activePerks.has("coin_passive_25") ? 0.25 : 0,
    petAffinityBonus: activePerks.has("pet_affinity_100") ? 1.0 : activePerks.has("pet_affinity_50") ? 0.5 : 0,
    comboExp: activePerks.has("combo_exp_50") ? 0.50 : activePerks.has("combo_exp_20") ? 0.20 : 0,
    srBonus: activePerks.has("sr_bonus_5") ? 0.05 : activePerks.has("sr_bonus_2") ? 0.02 : 0,
    adventureSpeed: activePerks.has("adventure_speed_40") ? 0.4 : activePerks.has("adventure_speed_20") ? 0.2 : 0,
    dailySlots: activePerks.has("daily_slot_5") ? 5 : activePerks.has("daily_slot_4") ? 4 : 3,
    gachaCooldownMs: activePerks.has("gacha_cd_12h") ? 12 * 3600000 : activePerks.has("gacha_cd_18h") ? 18 * 3600000 : 24 * 3600000,
    doubleFree: activePerks.has("gacha_double_free"),
    adventureSlots: activePerks.has("adventure_slot_2") ? 2 : 1,
  };

  // ─ 데일리 자동 갱신 (날짜 변경 감지) ─
  useEffect(() => {
    const today = todayKey();
    if (dailyState.date === today && dailyState.missions.length > 0) return;
    const eligibleIds = DAILY_MISSION_TEMPLATES
      .filter((t) => !t.visible || t.visible({ stats, storyRoute }))
      .map((t) => t.id);
    setDailyState((prev) => ({
      date: today,
      chatCount: prev.date === today ? prev.chatCount : 0,
      giftCount: prev.date === today ? prev.giftCount : 0,
      scenarioCount: prev.date === today ? prev.scenarioCount : 0,
      checkinDone: prev.date === today ? prev.checkinDone : false,
      bladderPeak: prev.date === today ? prev.bladderPeak : 0,
      missions: pickDailyMissions(today, eligibleIds, perkBonus.dailySlots),
    }));
  }, [view]); // 뷰 전환 시마다 체크

  // ─ 방광 게이지 최고 기록 추적 ─
  useEffect(() => {
    if (bladderLevel > dailyState.bladderPeak) {
      setDailyState((prev) => ({ ...prev, bladderPeak: Math.max(prev.bladderPeak, bladderLevel) }));
    }
  }, [bladderLevel]);

  // ─ 데일리 미션 보상 받기 ─
  function claimDailyMission(idx: number) {
    const m = dailyState.missions[idx];
    if (!m || m.claimed) return;
    const t = DAILY_MISSION_TEMPLATES.find((x) => x.id === m.templateId);
    if (!t) return;
    const cur = getDailyProgress(t.field, dailyState);
    if (cur < m.target) return;
    setDailyState((prev) => {
      const next = [...prev.missions];
      next[idx] = { ...next[idx], claimed: true };
      return { ...prev, missions: next };
    });
    setCoins((c) => c + m.rewardCoins);
    gainExp(20);
    setShopToast({ name: `+${m.rewardCoins} 코인`, detail: t.title });
    window.setTimeout(() => setShopToast(null), 2600);
  }

  // ─ 상점 구매 ─
  function buyShopItem(item: ShopItem) {
    if (coins < item.price) return;
    if (item.limit && (shopHistory[item.id] ?? 0) >= item.limit) return;
    setCoins((c) => c - item.price);
    setShopHistory((h) => ({ ...h, [item.id]: (h[item.id] ?? 0) + 1 }));
    let detail = "";
    const e = item.effect;
    if (e.kind === "stat") {
      setStats((s) => ({ ...s, [e.stat]: clamp(s[e.stat] + e.amount) }));
      const sign = e.amount >= 0 ? "+" : "";
      detail = `${STAT_LABEL[e.stat] ?? e.stat} ${sign}${e.amount}`;
    } else if (e.kind === "stat_random") {
      const amount = Math.floor(Math.random() * (e.max - e.min + 1)) + e.min;
      setStats((s) => ({ ...s, [e.stat]: clamp(s[e.stat] + amount) }));
      detail = `${STAT_LABEL[e.stat] ?? e.stat} +${amount} (랜덤)`;
    } else if (e.kind === "coins_random") {
      const amount = Math.floor(Math.random() * (e.max - e.min + 1)) + e.min;
      setCoins((c) => c + amount);
      detail = `🪙 ${amount} 코인 획득`;
    }
    setShopToast({ name: item.name, detail });
    window.setTimeout(() => setShopToast(null), 3200);
  }

  // ─ 마일스톤 자동 트리거 ─
  useEffect(() => {
    for (const ms of MILESTONES) {
      if (unlockedMilestones[ms.id]) continue;
      if (stats[ms.stat] < ms.threshold) continue;
      // 도달 — 메시지 추가, 마킹, 보상
      setUnlockedMilestones((prev) => ({ ...prev, [ms.id]: true }));
      setMessages((m) => {
        const additions: Message[] = [];
        if (ms.narration) additions.push(makeMessage("narration", ms.narration));
        additions.push(makeMessage("assistant", ms.text));
        return [...m, ...additions];
      });
      if (ms.reward) {
        setStats((s) => ({ ...s, [ms.reward!.stat]: clamp(s[ms.reward!.stat] + ms.reward!.amount) }));
      }
      // 마일스톤 도달 보너스 코인 + EXP
      setCoins((c) => c + 30);
      gainExp(50);
      setMilestoneToast({ id: ms.id, title: ms.title });
      window.setTimeout(() => setMilestoneToast(null), 4200);
      break; // 한 틱에 한 개만
    }
  }, [stats.affinity, stats.trust, stats.obsession, stats.jealousy, stats.bladderCharm]);

  // ─ 랜덤 깜짝 메시지 (홈 진입 시 4시간 쿨다운) ─
  useEffect(() => {
    if (view !== "home") return;
    const now = Date.now();
    const COOLDOWN = 4 * 60 * 60 * 1000; // 4시간
    if (now - lastRandomMessage < COOLDOWN) return;
    // 시나리오 진행 중이면 보내지 않음
    if (currentScenarioId) return;
    const picked = pickRandomMessage({ stats, storyRoute, date: new Date(now) });
    if (!picked) return;
    setMessages((m) => [...m, makeMessage("assistant", picked.text)]);
    setLastRandomMessage(now);
  }, [view]);

  function claimQuestReward(quest: Quest) {
    if (completedQuests[quest.id]) return;
    const p = quest.progress(questState);
    if (p.current < p.target) return;
    const r = quest.reward;
    if (r.kind === "stat") {
      setStats((s) => ({ ...s, [r.stat]: clamp(s[r.stat] + r.amount) }));
    }
    // 퀘스트 클리어 보너스 코인 + EXP
    const coinBonus = quest.category === "secret" ? 200 : quest.category === "main" ? 100 : 50;
    const expBonus = quest.category === "secret" ? 250 : quest.category === "main" ? 100 : 50;
    setCoins((c) => c + coinBonus);
    gainExp(expBonus);
    setCompletedQuests((prev) => ({ ...prev, [quest.id]: true }));
    setQuestToast({ id: quest.id, title: `보상 받음: ${quest.title} (+🪙${coinBonus})` });
    window.setTimeout(() => setQuestToast(null), 3000);
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
    setDailyState((prev) => ({ ...prev, chatCount: prev.chatCount + 1 }));
    gainExp(5);
    pumpCombo();
    dealRaidDamage(10);
    addLovePoints(5);
    // 활성 펫 친밀도 +1 (채팅마다, 레벨 perk 보너스 적용)
    if (activePet && ownedPets[activePet]) {
      const gain = Math.round(1 * (1 + perkBonus.petAffinityBonus));
      setOwnedPets((prev) => {
        const cur = prev[activePet];
        if (!cur) return prev;
        const newAff = cur.affinity + gain;
        return { ...prev, [activePet]: { ...cur, affinity: newAff, level: petLevel(newAff) } };
      });
    }
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
  function readSlotData(slot: number): SaveData | null {
    try {
      const raw = localStorage.getItem(SLOT_KEY(slot));
      if (!raw) return null;
      return JSON.parse(raw) as SaveData;
    } catch {
      return null;
    }
  }
  function saveSlot(slot: number) {
    const existing = readSlotData(slot);
    if (existing && !confirm(`${slot}번 슬롯에 이미 저장된 게 있어요. 덮어쓸까요?`)) return;
    localStorage.setItem(SLOT_KEY(slot), localStorage.getItem(STORAGE_KEY) ?? "");
    setSlotTick((n) => n + 1);
    alert(`${slot}번 슬롯 저장 완료`);
  }
  function loadSlot(slot: number) {
    const raw = localStorage.getItem(SLOT_KEY(slot));
    if (!raw) return alert("빈 슬롯이에요.");
    if (!confirm(`${slot}번 슬롯을 불러올까요? 현재 진행 상황은 사라집니다 (다른 슬롯에 저장 안 했다면).`)) return;
    localStorage.setItem(STORAGE_KEY, raw);
    location.reload();
  }
  function deleteSlot(slot: number) {
    const existing = readSlotData(slot);
    if (!existing) return;
    if (!confirm(`${slot}번 슬롯을 삭제할까요? 되돌릴 수 없어요.`)) return;
    localStorage.removeItem(SLOT_KEY(slot));
    setSlotTick((n) => n + 1);
  }
  function formatSavedAt(iso?: string): string {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      const yy = String(d.getFullYear()).slice(2);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      return `${yy}.${mm}.${dd} ${hh}:${mi}`;
    } catch { return ""; }
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
    setUnlockedEndings({});
    setCgFavorites({});
    setCompletedQuests({});
    setUnlockedMilestones({});
    setLastRandomMessage(0);
    setCoins(0);
    setDailyState({ date: todayKey(), chatCount: 0, giftCount: 0, scenarioCount: 0, checkinDone: false, bladderPeak: 0, missions: [] });
    setShopHistory({});
    setUserLevel(1);
    setUserExp(0);
    setLastFreeGacha(0);
    setGachaTickets(0);
    setComboCount(0);
    setLastComboTime(0);
    setComboMilestonesReached({});
    setOwnedPets({});
    setActivePet(null);
    setTotalGachaPulls(0);
    setActiveAdventure(null);
    setAdventureHistory({});
    setSnsLikes({});
    setLastSnsRefresh(0);
    setSnsFeed([]);
    setRaidWeek(weekKey());
    setRaidBossId("");
    setRaidHp(0);
    setRaidCleared(false);
    setRaidDamageDealt(0);
    setLastFortuneDate("");
    setTodayFortuneId("");
    setFortuneRerollsToday(0);
    setJournalEntries([]);
    setLastJournalDate("");
    setMinigameClickerHigh(0);
    setMinigameWordHigh(0);
    setFriendChats({});
    setGroupChat([]);
    setFriendLastSeen({});
    setFriendLastSpawn({});
    setGroupLastSpawn(0);
    setLoveMeterPoints(0);
    setLoveMeterDate("");
    setLoveMeterClaimedToday(false);
    setLetterReads({});
    setUnlockedLetters([]);
    setQuoteOfDayId("");
    setQuoteOfDayDate("");
    setCollectedQuotes([]);
    setOwnedCards({});
    setTotalCardPulls(0);
    setBossDefeats([]);
    setBladderMarathonWeek(weekKey());
    setBladderMarathonScore(0);
    setMonthlyCalendarClaims({});
    setSeasonId(SEASON_CURRENT_ID);
    setSeasonClaimedFree({});
    setSeasonClaimedPremium({});
    setSeasonPremium(false);
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
    if (galleryTab === "all") return [...imagePools.normal, ...imagePools.jealousy, ...imagePools.obsession, ...imagePools.yandere, ...imagePools.confinement, ...imagePools.bladder, ...actionCGImages];
    if (galleryTab === "action") return actionCGImages;
    return imagePools[galleryTab] ?? imagePools.normal;
  }, [galleryTab]);
  // CG → 시나리오 매핑 (어디서 본 CG인지 캡션 표시용)
  const cgScenarioMap = useMemo(() => {
    const map: Record<string, { title: string; subtitle: string }> = {};
    const allScenarios: Record<string, Scenario> = { ...scenarioData, ...LOCATION_SCENARIOS };
    for (const sc of Object.values(allScenarios)) {
      const imgs = sc.imagePool ?? (sc.image ? [sc.image] : []);
      for (const img of imgs) {
        if (img && !map[img]) map[img] = { title: sc.title, subtitle: sc.subtitle };
      }
    }
    // 액션 CG 풀
    for (const [actionKey, pool] of Object.entries(actionCGPools)) {
      const item = actionItems.find((it) => it.scenario === `action_${actionKey}`);
      const label = item ? `액션: ${item.label}` : `액션: ${actionKey}`;
      for (const img of pool) {
        if (img && !map[img]) map[img] = { title: label, subtitle: "액션 이벤트" };
      }
    }
    return map;
  }, []);
  function toggleCgFavorite(img: string) {
    setCgFavorites((prev) => {
      const next = { ...prev };
      if (next[img]) delete next[img];
      else next[img] = true;
      return next;
    });
  }
  const galleryStats = useMemo(() => {
    const total = galleryImages.length;
    const unlocked = galleryImages.filter((img) => isAdminMode || unlockedCGs[img]).length;
    return { total, unlocked };
  }, [galleryImages, unlockedCGs, isAdminMode]);
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
          <div className="statsBox"><StatBar label="호감" value={stats.affinity}/><StatBar label="질투" value={stats.jealousy} danger={stats.jealousy >= 500}/><StatBar label="집착" value={stats.obsession} danger={stats.obsession >= 500}/><StatBar label="신뢰" value={stats.trust}/>{stats.bladderCharm > 0 && <StatBar label="🚽매력" value={stats.bladderCharm}/>}</div>
        </div>
        <div className="userLevelBar">
          <div className="userLvHead">
            <span className="userLvBadge">Lv.{userLevel}</span>
            <span className="userLvTitle">{getLevelTitle(userLevel)}</span>
            <span className="coinChip"><span>🪙</span><b>{coins.toLocaleString()}</b></span>
          </div>
          <div className="userLvBar">
            <div className="userLvBarFill" style={{ width: `${(userExp / expToNextLevel(userLevel)) * 100}%` }}/>
          </div>
          <small className="userLvExp">{userExp} / {expToNextLevel(userLevel)} EXP · <a className="userLvRewardLink" onClick={()=>setShowLevelRewards(true)}>보상 보기 ▸</a></small>
        </div>
        <div className="loveMeter">
          <div className="loveMeterHead">
            <span>💗 오늘의 케미</span>
            <strong>{loveMeterPoints}/100</strong>
          </div>
          <div className="loveMeterBar"><div style={{ width: `${loveMeterPoints}%` }}/></div>
          {loveMeterPoints >= 100 && !loveMeterClaimedToday && (
            <button className="loveMeterClaimBtn" onClick={claimLoveMeterReward}>🎁 100% 달성! 보상 받기</button>
          )}
          {loveMeterClaimedToday && <small className="loveMeterDone">✅ 오늘 보상 완료. 내일 또!</small>}
        </div>
        {activePetObj && activePetData && (() => {
          const lvl = petLevel(activePetData.affinity);
          const isEvolved = lvl >= 5;
          const imgSrc = isEvolved && activePetObj.evolvedImage ? activePetObj.evolvedImage : activePetObj.image;
          const fallbackEmoji = isEvolved && activePetObj.evolvedEmoji ? activePetObj.evolvedEmoji : activePetObj.emoji;
          return (
            <div className="petMini" onClick={() => setView("pets")}>
              {imgSrc ? (
                <img className="petMiniImg" src={imgSrc} alt={activePetObj.name} onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = "none";
                  const sibling = el.nextElementSibling as HTMLElement | null;
                  if (sibling) sibling.style.display = "block";
                }} />
              ) : null}
              <span className="petMiniEmoji" style={{ display: imgSrc ? "none" : "block" }}>{fallbackEmoji}</span>
              <div className="petMiniBody">
                <b>{isEvolved && activePetObj.evolvedName ? activePetObj.evolvedName : activePetObj.name}</b>
                <small>Lv.{lvl} · {activePetObj.description.split("(")[0].trim()}</small>
              </div>
            </div>
          );
        })()}
        <nav className="nav">{[["home","홈"],["chat","채팅"],["scenarioMenu","시나리오"],["quests","도전"],["shop","상점"],["gacha","🎰 뽑기"],["pets","🐹 펫"],["adventure","🌍 모험"],["sns","📱 SNS"],["raid","⚔️ 레이드"],["fortune","🔮 신탁"],["journal","📔 다이어리"],["minigames","🎮 미니게임"],["katalk","💬 카톡"],["calendar30","📅 캘린더"],["codex","📜 도감"],["stats","📇 명함"],["letters","💌 편지"],["quote","💭 명언"],["cards","🃏 카드"],["seasonPass","🎟 시즌패스"],["sound","🔊 음향"],["storyMap","스토리 맵"],["miniMap","지도"],["profile","상태"],["gallery","갤러리"],["achievements","업적"],["events","전진협"],["gift","선물"],["checkin","출석"],["wardrobe","옷장"],["diary","일기"],["save","저장"],["settings","액션"],...(isAdminMode ? [["admin","🔑 관리"]] : [])].map(([key,label])=>{
          const dailyClaimable = key === "quests" ? dailyState.missions.filter((m) => {
            if (m.claimed) return false;
            const t = DAILY_MISSION_TEMPLATES.find((x) => x.id === m.templateId);
            return t && getDailyProgress(t.field, dailyState) >= m.target;
          }).length : 0;
          const totalClaimable = (key === "quests" ? claimableCount + dailyClaimable : 0);
          // 빨간 점 알림 통합
          const freeGachaReady = Date.now() - lastFreeGacha >= perkBonus.gachaCooldownMs;
          const advReady = activeAdventure && Date.now() >= activeAdventure.endTime;
          const snsRefreshDue = Date.now() - lastSnsRefresh > 4 * 60 * 60 * 1000;
          const raidActive = !raidCleared && raidHp > 0;
          const showDot = (key === "checkin" && !isCheckedInToday(lastCheckIn))
            || (key === "quests" && totalClaimable > 0)
            || (key === "shop" && coins >= 50 && Object.keys(shopHistory).length === 0)
            || (key === "gacha" && (freeGachaReady || gachaTickets > 0))
            || (key === "adventure" && !!advReady)
            || (key === "sns" && snsRefreshDue)
            || (key === "raid" && raidActive)
            || (key === "katalk" && unreadKatalk > 0)
            || (key === "calendar30" && CALENDAR_MILESTONES.some((m) => checkInStreak >= m.day && !monthlyCalendarClaims[`day_${m.day}`]))
            || (key === "letters" && unlockedLetters.some((l) => !letterReads[l]))
            || (key === "quote" && quoteOfDayId !== "" && !collectedQuotes.includes(quoteOfDayId));
          return <button key={key} className={`${view===key ? "active" : ""}${showDot ? " navDot" : ""}${key==="admin" ? " adminNavBtn" : ""}`} onClick={()=>setView(key as AppView)}>{label}{key==="quests" && totalClaimable > 0 && <span className="navBadge">{totalClaimable}</span>}{key==="katalk" && unreadKatalk > 0 && <span className="navBadge">{unreadKatalk}</span>}</button>;
        })}</nav>
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
        {view === "scenarioMenu" && (() => {
          const endingsCleared = Object.keys(unlockedEndings).length;
          const bladderUnlocked = isAdminMode || endingsCleared >= 1;
          return (
            <Panel title="시나리오">
              <div className="sectionStack">
                <h3>메인 시나리오</h3>
                <div className="grid">{mainScenarios.map((s)=><button className="cardBtn" key={s.id} onClick={()=>startScenario(s.id)}><b>{s.title}</b><small>{s.subtitle}</small></button>)}</div>
                <h3>기타 / 특수</h3>
                <div className="grid">{sideScenarios.map((s)=><button className="cardBtn" key={s.id} onClick={()=>startScenario(s.id)}><b>{s.title}</b><small>{s.subtitle}</small></button>)}</div>
                <h3>??? <small style={{fontWeight:400,color:"#9a7c65"}}>비밀 루트</small></h3>
                <div className="grid">
                  <button
                    className={`cardBtn secretRouteCard${bladderUnlocked ? " secretUnlocked" : " secretLocked"}`}
                    disabled={!bladderUnlocked}
                    onClick={() => bladderUnlocked && startScenario("bladder_ch5_01")}
                  >
                    {bladderUnlocked ? (
                      <>
                        <b>🚽 방광 루트</b>
                        <small>5장 — 잊혀진 화장실에서 시작되는 어떤 이야기</small>
                      </>
                    ) : (
                      <>
                        <b>🔒 ???</b>
                        <small>엔딩을 1개 이상 클리어하면 해금됩니다.</small>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Panel>
          );
        })()}
        {view === "quests" && (
          <Panel title="도전 / 퀘스트">
            <p className="questIntro">목표를 달성하면 보상을 받을 수 있어요. 🪙 코인 잔액 <strong>{coins.toLocaleString()}</strong>.</p>
            {/* 데일리 미션 */}
            <h3 className="questSectionTitle">📅 오늘의 미션 <small>자정에 갱신</small></h3>
            <div className="dailyGrid">
              {dailyState.missions.map((m, idx) => {
                const t = DAILY_MISSION_TEMPLATES.find((x) => x.id === m.templateId);
                if (!t) return null;
                const cur = getDailyProgress(t.field, dailyState);
                const isComplete = cur >= m.target;
                const pct = Math.min(100, (cur / m.target) * 100);
                return (
                  <div key={idx} className={`dailyCard${m.claimed ? " dailyClaimed" : isComplete ? " dailyReady" : ""}`}>
                    <div className="dailyEmoji">{t.emoji}</div>
                    <div className="dailyBody">
                      <b className="dailyTitle">{t.title}</b>
                      <small className="dailyDesc">{t.description}</small>
                      <div className="dailyProgress">
                        <div className="dailyBar"><div style={{ width: `${pct}%` }}/></div>
                        <span>{Math.min(cur, m.target)}/{m.target}</span>
                      </div>
                    </div>
                    <div className="dailyRight">
                      <span className="dailyReward">🪙 {m.rewardCoins}</span>
                      {m.claimed ? (
                        <span className="dailyDoneBadge">완료</span>
                      ) : isComplete ? (
                        <button className="dailyClaimBtn" onClick={() => claimDailyMission(idx)}>받기</button>
                      ) : (
                        <span className="dailyTodo">진행중</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <h3 className="questSectionTitle">🎯 장기 도전 <small><strong>{claimableCount}</strong>개 보상 가능</small></h3>
            <div className="questGrid">
              {visibleQuests.map((q) => {
                const p = q.progress(questState);
                const isComplete = p.current >= p.target;
                const isClaimed = !!completedQuests[q.id];
                const pct = Math.min(100, (p.current / p.target) * 100);
                const catKlass = q.category === "main" ? "qcMain" : q.category === "bladder" ? "qcBladder" : q.category === "secret" ? "qcSecret" : "qcSide";
                return (
                  <div key={q.id} className={`questCard ${catKlass}${isClaimed ? " questClaimed" : isComplete ? " questReady" : ""}`}>
                    <div className="questHead">
                      <span className="questEmoji">{q.emoji}</span>
                      <div className="questHeadText">
                        <b className="questTitle">{q.title}</b>
                        <small className="questCategory">{q.category === "main" ? "메인 도전" : q.category === "bladder" ? "🚽 방광 도전" : q.category === "secret" ? "✦ 비밀 도전" : "사이드 도전"}</small>
                      </div>
                      {isClaimed && <span className="questClaimedBadge">완료</span>}
                    </div>
                    <p className="questDesc">{q.description}</p>
                    {q.hint && !isComplete && <small className="questHint">💡 {q.hint}</small>}
                    <div className="questProgress">
                      <div className="questProgressBar"><div style={{ width: `${pct}%` }}/></div>
                      <span className="questProgressText">{p.current} / {p.target}</span>
                    </div>
                    <div className="questReward">
                      <small>보상</small>
                      <span>
                        {q.reward.kind === "stat" && q.reward.label}
                        {q.reward.kind === "message" && q.reward.text}
                        {q.reward.kind === "outfit" && q.reward.label}
                        {q.reward.kind === "cg" && q.reward.label}
                      </span>
                    </div>
                    {!isClaimed && (
                      <button
                        className={`questClaimBtn${isComplete ? " questClaimReady" : ""}`}
                        disabled={!isComplete}
                        onClick={() => claimQuestReward(q)}
                      >
                        {isComplete ? "🎁 보상 받기" : "진행 중"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>
        )}
        {view === "shop" && (
          <Panel title="상점">
            <div className="shopHeader">
              <span>🪙 잔액</span>
              <strong className="shopBalance">{coins.toLocaleString()}</strong>
            </div>
            <p className="shopHint">코인은 데일리 미션·도전·출석으로 모을 수 있어요.</p>
            <div className="shopGrid">
              {SHOP_ITEMS.filter((it) => !it.visible || it.visible({ stats, storyRoute })).map((item) => {
                const owned = shopHistory[item.id] ?? 0;
                const limited = item.limit !== undefined;
                const soldOut = limited && owned >= item.limit!;
                const cantAfford = coins < item.price;
                const disabled = soldOut || cantAfford;
                const catKlass = item.category === "boost" ? "shopBoost" : item.category === "gift" ? "shopGift" : item.category === "consumable" ? "shopConsumable" : "shopCosmetic";
                return (
                  <div key={item.id} className={`shopCard ${catKlass}`}>
                    <div className="shopEmoji">{item.emoji}</div>
                    <div className="shopName">{item.name}</div>
                    <div className="shopDesc">{item.description}</div>
                    {owned > 0 && <small className="shopOwned">구매 {owned}회</small>}
                    <button
                      className="shopBuyBtn"
                      disabled={disabled}
                      onClick={() => buyShopItem(item)}
                    >
                      {soldOut ? "품절" : cantAfford ? `🪙 ${item.price} (부족)` : `🪙 ${item.price}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}
        {view === "calendar30" && (() => {
          const days = Array.from({ length: 30 }, (_, i) => i + 1);
          return (
            <Panel title="30일 출석 캘린더 📅">
              <p className="cal30Intro">연속 출석할수록 보상이 커져요. 7/14/21/30일에 마일스톤 보상.</p>
              <div className="cal30Grid">
                {days.map((d) => {
                  const reached = checkInStreak >= d;
                  const milestone = CALENDAR_MILESTONES.find((m) => m.day === d);
                  return (
                    <div key={d} className={`cal30Cell${reached ? " cal30Reached" : ""}${milestone ? " cal30Milestone" : ""}`}>
                      <span className="cal30Day">{d}</span>
                      {milestone && <span className="cal30Emoji">{milestone.emoji}</span>}
                      {reached && !milestone && <span className="cal30Check">✓</span>}
                    </div>
                  );
                })}
              </div>
              <h3 className="cal30Section">🎁 마일스톤 보상</h3>
              <div className="cal30Rewards">
                {CALENDAR_MILESTONES.map((m) => {
                  const claimed = monthlyCalendarClaims[`day_${m.day}`];
                  const claimable = checkInStreak >= m.day && !claimed;
                  return (
                    <div key={m.day} className={`cal30Reward${claimed ? " cal30RewardClaimed" : claimable ? " cal30RewardReady" : ""}`}>
                      <div className="cal30RewardEmoji">{m.emoji}</div>
                      <b>{m.title}</b>
                      <small>🪙 {m.coins} · 🎫 {m.tickets ?? 0} · 호감 +{m.affinity ?? 0}</small>
                      <button disabled={!claimable} onClick={() => claimCalendarReward(m.day)}>
                        {claimed ? "완료" : claimable ? "받기" : `${m.day}일까지 ${m.day - checkInStreak}일 남음`}
                      </button>
                    </div>
                  );
                })}
              </div>
              <small style={{display:"block",marginTop:14,color:"#9a7c65",textAlign:"center"}}>현재 연속 출석: <b>{checkInStreak}일</b></small>
            </Panel>
          );
        })()}
        {view === "codex" && (() => {
          const cgUnlocked = Object.keys(unlockedCGs).length;
          const cgTotal = (Object.values(imagePools) as string[][]).flat().length + Object.values(actionCGPools).flat().length;
          const outfitUnlocked = getUnlockedOutfits(Object.fromEntries(Object.entries(seenEvents).filter(([,v])=>v)), storyRoute, stats.obsession, stats.bladderCharm).length;
          const outfitTotal = OUTFITS.length;
          const petUnlocked = Object.keys(ownedPets).length;
          const petTotal = PETS.length;
          const scenarioUnlocked = Object.keys(seenEvents).length;
          const scenarioTotal = Object.keys(scenarioData).length;
          const endingUnlocked = Object.keys(unlockedEndings).length;
          const endingTotal = 5;
          const cardUnlocked = Object.keys(ownedCards).length;
          const cardTotal = TRADING_CARDS.length;
          const letterUnlocked = unlockedLetters.length;
          const letterTotal = LETTERS.length;
          const quoteCollected = collectedQuotes.length;
          const quoteTotal = TTEOKJON_QUOTES.length;
          const sections = [
            { name: "CG 갤러리", emoji: "🎴", cur: cgUnlocked, total: cgTotal },
            { name: "의상", emoji: "👔", cur: outfitUnlocked, total: outfitTotal },
            { name: "펫", emoji: "🐹", cur: petUnlocked, total: petTotal },
            { name: "시나리오", emoji: "📖", cur: scenarioUnlocked, total: scenarioTotal },
            { name: "엔딩", emoji: "🎬", cur: endingUnlocked, total: endingTotal },
            { name: "트레이딩 카드", emoji: "🃏", cur: cardUnlocked, total: cardTotal },
            { name: "편지", emoji: "💌", cur: letterUnlocked, total: letterTotal },
            { name: "명언", emoji: "💭", cur: quoteCollected, total: quoteTotal },
          ];
          const totalCur = sections.reduce((a, s) => a + s.cur, 0);
          const totalAll = sections.reduce((a, s) => a + s.total, 0);
          const masterPct = totalAll > 0 ? (totalCur / totalAll) * 100 : 0;
          return (
            <Panel title="통합 도감 📜">
              <div className="codexMaster">
                <div className="codexMasterTitle">전체 마스터</div>
                <div className="codexMasterPct">{masterPct.toFixed(1)}%</div>
                <div className="codexMasterBar"><div style={{ width: `${masterPct}%` }}/></div>
                <small>{totalCur} / {totalAll}</small>
              </div>
              <div className="codexGrid">
                {sections.map((s) => {
                  const pct = s.total > 0 ? (s.cur / s.total) * 100 : 0;
                  return (
                    <div key={s.name} className="codexCard">
                      <div className="codexCardEmoji">{s.emoji}</div>
                      <b>{s.name}</b>
                      <div className="codexCardBar"><div style={{ width: `${pct}%` }}/></div>
                      <small>{s.cur} / {s.total} · {pct.toFixed(0)}%</small>
                    </div>
                  );
                })}
              </div>
              {masterPct >= 100 && (
                <div className="codexMasterReward">
                  🌟 마스터 달성! 전설의 칭호 획득.
                </div>
              )}
            </Panel>
          );
        })()}
        {view === "stats" && (() => {
          const chatN = dailyState.chatCount;
          const totalChat = Math.max(0, dailyState.chatCount * 1) + Object.keys(seenEvents).length * 5; // 추정
          // 병맛 통계 계산
          const peeMinutes = stats.bladderCharm * 7 + 60;
          const workouts = Math.floor(stats.affinity / 10);
          const selfies = Math.floor(stats.affinity * 0.8 + Object.keys(seenEvents).length * 5);
          const thoughts = stats.affinity * 50 + stats.obsession * 80;
          const stalks = stats.obsession * 12;
          return (
            <Panel title="명함 / 통계 📇">
              <div className="profileCard">
                <div className="profileCardHead">
                  <div className="profileCardAvatar"><img src={getHomeCharacterImage(stats, storyRoute)} alt="떡존이" onError={(e)=>{e.currentTarget.src=`/sd_geunddeok_idle.png?v=${SD_IMAGE_VERSION}`}}/></div>
                  <div>
                    <h3>선생님 / 형 / 주인님</h3>
                    <p>Lv.{userLevel} {getLevelTitle(userLevel)} · {routeLabel}</p>
                  </div>
                </div>
                <div className="profileCardStats">
                  <div><b>🪙 코인</b><span>{coins.toLocaleString()}</span></div>
                  <div><b>💗 호감</b><span>{stats.affinity}</span></div>
                  <div><b>🎬 엔딩</b><span>{Object.keys(unlockedEndings).length} / 5</span></div>
                  <div><b>🎴 CG</b><span>{Object.keys(unlockedCGs).length}</span></div>
                  <div><b>📅 출석</b><span>{checkInStreak}일 연속</span></div>
                  <div><b>🎫 티켓</b><span>{gachaTickets}</span></div>
                </div>
                <small className="profileCardFooter">📅 {todayKey()} · 떡존이 인기 통계</small>
              </div>
              <h3 className="statsSection">📊 떡존이 본인 통계 (병맛 주의)</h3>
              <div className="tteokjonStats">
                <div className="ttsRow"><span>🚽 평균 오줌 참은 시간</span><b>{Math.floor(peeMinutes / 60)}시간 {peeMinutes % 60}분</b></div>
                <div className="ttsRow"><span>🏋️ 헬스장 다녀온 횟수</span><b>{workouts}회</b></div>
                <div className="ttsRow"><span>📸 셀카 찍은 횟수</span><b>{selfies}장</b></div>
                <div className="ttsRow"><span>💭 너 생각한 횟수</span><b>{thoughts.toLocaleString()}번</b></div>
                <div className="ttsRow"><span>👀 SNS 염탐 횟수</span><b>{stalks}회</b></div>
                <div className="ttsRow"><span>🎰 가챠 굴린 횟수</span><b>{totalGachaPulls}회</b></div>
                <div className="ttsRow"><span>⚔️ 격파한 보스</span><b>{bossDefeats.length}마리</b></div>
                <div className="ttsRow"><span>🃏 수집한 카드</span><b>{Object.keys(ownedCards).length} / {TRADING_CARDS.length}</b></div>
              </div>
              <p className="statsHint">스크린샷 찍어서 자랑하세요 ㅋ</p>
            </Panel>
          );
        })()}
        {view === "letters" && (
          <Panel title="떡존이 편지함 💌">
            <p className="lettersIntro">챕터 클리어할 때마다 떡존이가 편지를 한 통씩 보내요.</p>
            <div className="lettersList">
              {LETTERS.map((letter) => {
                const unlocked = unlockedLetters.includes(letter.id);
                const read = letterReads[letter.id];
                return (
                  <div key={letter.id} className={`letterCard${unlocked ? "" : " letterLocked"}${unlocked && !read ? " letterUnread" : ""}`}>
                    {unlocked ? (
                      <>
                        <div className="letterHead">
                          <span className="letterChip">Ch.{letter.chapter}{letter.route ? ` · ${letter.route === "pure" ? "순애" : "집착"}` : ""}</span>
                          <b>{letter.title}</b>
                          {!read && <span className="letterNew">NEW</span>}
                        </div>
                        <p className="letterContent" onClick={() => !read && setLetterReads((p) => ({ ...p, [letter.id]: true }))}>
                          {letter.content}
                        </p>
                      </>
                    ) : (
                      <div className="letterLockedBody">
                        🔒 Ch.{letter.chapter}{letter.route ? ` (${letter.route === "pure" ? "순애" : "집착"} 루트)` : ""} 클리어 시 도착
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>
        )}
        {view === "quote" && (() => {
          const todayQ = TTEOKJON_QUOTES.find((q) => q.id === quoteOfDayId);
          const collected = collectedQuotes.includes(quoteOfDayId);
          return (
            <Panel title="오늘의 명언 💭">
              <p className="quoteIntro">매일 자정에 떡존이가 한 마디 남겨요. 수집하면 호감 +5, 코인 +50.</p>
              {todayQ && (
                <div className="quoteCard">
                  <div className="quoteEmoji">{todayQ.emoji}</div>
                  <p className="quoteText">"{todayQ.text}"</p>
                  <small>— 떡존 올림</small>
                  <button className="quoteCollectBtn" disabled={collected} onClick={collectTodayQuote}>
                    {collected ? "✓ 수집됨" : "📚 수집 (호감+5, 코인+50)"}
                  </button>
                </div>
              )}
              <h3 className="quoteSection">📚 수집한 명언 ({collectedQuotes.length} / {TTEOKJON_QUOTES.length})</h3>
              <div className="quoteCollection">
                {collectedQuotes.length === 0 && <p className="quoteEmpty">아직 수집한 명언이 없어요.</p>}
                {TTEOKJON_QUOTES.filter((q) => collectedQuotes.includes(q.id)).map((q) => (
                  <div key={q.id} className="quoteSavedItem">
                    <span>{q.emoji}</span>
                    <p>"{q.text}"</p>
                  </div>
                ))}
              </div>
            </Panel>
          );
        })()}
        {view === "cards" && (() => {
          const sets = Array.from(new Set(TRADING_CARDS.map((c) => c.set))).filter(Boolean);
          return (
            <Panel title="떡존이 트레이딩 카드 🃏">
              <p className="cardIntro">30종 카드 수집. 같은 카드 더 뽑으면 강화 (Lv 5 max). 등급은 R/SR/SSR.</p>
              <div className="cardActions">
                <button className="cardPullBtn cardSingle" disabled={coins < 200} onClick={() => pullCardGacha("single")}>
                  🪙 200 — 단일 뽑기
                </button>
                <button className="cardPullBtn cardTicket" disabled={gachaTickets <= 0} onClick={() => pullCardGacha("ticket")}>
                  🎫 티켓 1장 — 뽑기
                </button>
                <span className="cardPullCount">총 뽑은 횟수: {totalCardPulls}</span>
              </div>
              <h3 className="cardSection">🃏 콜렉션 ({Object.keys(ownedCards).length} / {TRADING_CARDS.length})</h3>
              <div className="cardGrid">
                {TRADING_CARDS.map((card) => {
                  const data = ownedCards[card.id];
                  const owned = !!data;
                  return (
                    <div key={card.id} className={`tcCard tcRarity-${card.rarity}${owned ? " tcOwned" : " tcLocked"}`}>
                      <div className="tcRarityBadge">{card.rarity}</div>
                      {owned && card.image ? (
                        <img className="tcImg" src={card.image} alt={card.name} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; const fb = e.currentTarget.nextElementSibling as HTMLElement | null; if (fb) fb.style.display = "block"; }}/>
                      ) : null}
                      <div className="tcEmoji" style={{ display: owned && card.image ? "none" : "block" }}>{owned ? card.emoji : "❓"}</div>
                      <b>{owned ? card.name : "???"}</b>
                      <small>{owned ? card.flavor : "잠금"}</small>
                      {owned && data && data.level > 1 && <span className="tcLevel">Lv.{data.level}</span>}
                    </div>
                  );
                })}
              </div>
              {cardPullResult && (
                <div className="cardPullOverlay" onClick={() => setCardPullResult(null)}>
                  <div className={`cardPullReveal tcRarity-${cardPullResult.rarity}`}>
                    <div className="tcRarityBadge">{cardPullResult.rarity}</div>
                    {cardPullResult.image ? (
                      <img className="cardPullImg" src={cardPullResult.image} alt={cardPullResult.name} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; const fb = e.currentTarget.nextElementSibling as HTMLElement | null; if (fb) fb.style.display = "block"; }}/>
                    ) : null}
                    <div className="cardPullEmoji" style={{ display: cardPullResult.image ? "none" : "block" }}>{cardPullResult.emoji}</div>
                    <h2>{cardPullResult.name}</h2>
                    <p>{cardPullResult.flavor}</p>
                    <button onClick={() => setCardPullResult(null)}>닫기 ✓</button>
                  </div>
                </div>
              )}
            </Panel>
          );
        })()}
        {view === "katalk" && (() => {
          const open = katalkOpenChat;
          const isGroup = open === "group";
          const friend = open && open !== "group" ? FRIENDS.find((f) => f.id === open) : null;
          const messages = isGroup ? groupChat : (open ? friendChats[open] ?? [] : []);
          return (
            <Panel title={open ? (isGroup ? "🍻 전진협 단톡" : `${friend?.emoji} ${friend?.name}`) : "💬 카톡 메뉴"}>
              {!open && (
                <div className="katalkList">
                  <p className="katalkIntro">전진협 친구들. 들어가면 자동으로 메시지 옴 ㅋ</p>
                  <button className="katalkRow katalkGroup" onClick={() => openKatalkChat("group")}>
                    <span className="katalkEmoji">🍻</span>
                    <div className="katalkRowBody">
                      <b>전진협 단톡 (5명)</b>
                      <small>{groupChat.length > 0 ? groupChat[groupChat.length - 1].text.slice(0, 50) : "들어가서 시끄럽게 시작하셈"}</small>
                    </div>
                    {groupChat.filter((m) => m.speaker !== "user" && m.time > (friendLastSeen["group"] ?? 0)).length > 0 && (
                      <span className="katalkUnread">{groupChat.filter((m) => m.speaker !== "user" && m.time > (friendLastSeen["group"] ?? 0)).length}</span>
                    )}
                  </button>
                  {FRIENDS.map((f) => {
                    const msgs = friendChats[f.id] ?? [];
                    const lastMsg = msgs[msgs.length - 1];
                    const lastSeen = friendLastSeen[f.id] ?? 0;
                    const unread = msgs.filter((m) => m.speaker === f.id && m.time > lastSeen).length;
                    return (
                      <button key={f.id} className="katalkRow" onClick={() => openKatalkChat(f.id)}>
                        <span className="katalkEmoji">{f.emoji}</span>
                        <div className="katalkRowBody">
                          <b>{f.name} <small className="katalkAge">({f.age})</small></b>
                          <small>{lastMsg ? lastMsg.text.slice(0, 50) : f.oneliner}</small>
                          <small className="katalkRowFlavor">{f.flavor}</small>
                        </div>
                        {unread > 0 && <span className="katalkUnread">{unread}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
              {open && (
                <div className="katalkChat">
                  <button className="katalkBackBtn" onClick={() => setKatalkOpenChat(null)}>← 친구 목록</button>
                  <div className="katalkMsgList">
                    {messages.map((m) => {
                      let speakerName = "??";
                      let speakerEmoji = "❓";
                      let isUser = false;
                      let isMe = false;
                      if (m.speaker === "user") { speakerName = "선생님"; isUser = true; }
                      else if (m.speaker === "tteokjon") { speakerName = "근떡존"; speakerEmoji = "🦴"; isMe = true; }
                      else {
                        const fr = FRIENDS.find((f) => f.id === m.speaker);
                        if (fr) { speakerName = fr.name; speakerEmoji = fr.emoji; }
                      }
                      return (
                        <div key={m.id} className={`katalkMsg${isUser ? " katalkUser" : ""}${isMe ? " katalkMe" : ""}`}>
                          {!isUser && <span className="katalkMsgSpeaker">{speakerEmoji} {speakerName}</span>}
                          <div className="katalkMsgBubble">{m.text}</div>
                        </div>
                      );
                    })}
                    {messages.length === 0 && <p className="katalkEmpty">메시지 없음. 잠시만 기다리시면 옴 ㅋ</p>}
                  </div>
                  <KatalkInput onSend={(text) => sendKatalkReply(open, text)} />
                  <div className="katalkActions">
                    <button onClick={() => isGroup ? spawnGroupBurst() : spawnFriendMessage(open as FriendId)}>새 메시지 부르기 🔄</button>
                  </div>
                </div>
              )}
            </Panel>
          );
        })()}
        {view === "fortune" && (() => {
          const f = todayFortune;
          if (!f) return <Panel title="요도니아 신탁 🔮"><p>신탁이 흐릿합니다. 잠시 후 다시 시도해주세요.</p></Panel>;
          const tierLabel: Record<FortuneTier, string> = { great_luck: "대길 ✨", luck: "길", neutral: "평길", unluck: "흉", great_unluck: "대흉 ⚠️" };
          return (
            <Panel title="요도니아 신탁 🔮">
              <p className="fortuneIntro">매일 자정에 자동 갱신. 신탁의 효과는 오늘 하루만 적용돼요.</p>
              <div className={`fortuneCard fortuneTier-${f.tier}`}>
                <div className="fortuneTier">{tierLabel[f.tier]}</div>
                <div className="fortuneEmoji">{f.emoji}</div>
                <h2 className="fortuneTitle">{f.title}</h2>
                <p className="fortuneMessage">"{f.message}"</p>
                {f.effect && <div className="fortuneEffect">📌 오늘 효과: <b>{f.effect.label}</b></div>}
              </div>
              <div className="fortuneActions">
                <button className="fortuneRerollBtn" disabled={coins < 100} onClick={rerollFortune}>
                  🪙 100 — 다시 뽑기 (오늘 {fortuneRerollsToday}회 재추첨)
                </button>
              </div>
            </Panel>
          );
        })()}
        {view === "journal" && (
          <Panel title="떡존이 다이어리 📔">
            <p className="journalIntro">떡존이가 매일 적는 일기. 좋아요 누르면 호감 +5 + 코인 +5.</p>
            <p className="journalCount">총 <b>{journalEntries.length}</b>개 적혔어요</p>
            {journalEntries.length === 0 && (
              <p className="journalEmpty">아직 일기가 없어요. 다음 날부터 매일 한 편씩 자동으로 작성돼요.</p>
            )}
            <div className="journalList">
              {journalEntries.map((entry) => {
                const tpl = JOURNAL_TEMPLATES.find((t) => t.id === entry.templateId);
                if (!tpl) return null;
                return (
                  <div key={entry.id} className={`journalCard${entry.liked ? " journalLiked" : ""}`}>
                    <div className="journalDate">📅 {entry.date}</div>
                    <p className="journalText">{tpl.text}</p>
                    <div className="journalActions">
                      <button className={`journalLikeBtn${entry.liked ? " jLiked" : ""}`} onClick={() => toggleJournalLike(entry.id)}>
                        {entry.liked ? "❤️ 좋아요 함" : "🤍 좋아요"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}
        {view === "minigames" && (
          <Panel title="미니게임 🎮">
            {minigameMode === "hub" && (
              <div className="mgHub">
                <p className="mgIntro">가벼운 미니게임 모음. 진짜 가볍습니다.</p>
                <div className="mgGrid">
                  <button className="mgCard mgClicker" onClick={() => { setMinigameMode("clicker"); }}>
                    <div className="mgCardEmoji">💩</div>
                    <b>방광 클리커 (똥 막기)</b>
                    <small>1분 동안 떨어지는 똥 클릭. 점수 × 5 코인.</small>
                    <div className="mgHigh">최고: {minigameClickerHigh}점</div>
                  </button>
                  <button className="mgCard mgWord" onClick={() => { setMinigameMode("wordchain"); startWordChain(); }}>
                    <div className="mgCardEmoji">📝</div>
                    <b>떡존이랑 끝말잇기</b>
                    <small>이기면 코인 +100~, 지면 -50.</small>
                    <div className="mgHigh">최고 콤보: {minigameWordHigh}회</div>
                  </button>
                  <button className="mgCard mgRps" onClick={() => { setMinigameMode("rps"); resetRps(); }}>
                    <div className="mgCardEmoji">✊</div>
                    <b>가위바위보</b>
                    <small>3판 2승. 이기면 코인+200, 호감+30. 지면 -100.</small>
                  </button>
                  <button className="mgCard mgQuiz" onClick={() => { setMinigameMode("quiz"); startQuiz(); }}>
                    <div className="mgCardEmoji">❓</div>
                    <b>떡존이 퀴즈</b>
                    <small>5문제. 정답 1개당 코인+50, EXP+30. 4개 이상 호감+50.</small>
                  </button>
                </div>
              </div>
            )}
            {minigameMode === "clicker" && (
              <div className="mgClickerPanel">
                <div className="mgClickerHeader">
                  <button className="mgBackBtn" onClick={() => { setMinigameMode("hub"); setClickerActive(false); setClickerPoops([]); }}>← 뒤로</button>
                  <div className="mgScore">⏱ {clickerTime}s · 점수 {clickerScore}</div>
                  {!clickerActive && clickerTime === 60 && <button className="mgStartBtn" onClick={startClickerGame}>시작 ▶</button>}
                  {!clickerActive && clickerTime === 0 && (
                    <div className="mgEndPanel">
                      <p>끝! 🎉 {clickerScore}점 → 🪙 +{clickerScore * 5}</p>
                      <button onClick={() => { setClickerTime(60); setClickerScore(0); }}>다시</button>
                    </div>
                  )}
                </div>
                <div className="mgClickerStage">
                  {clickerPoops.map((p) => (
                    <button
                      key={p.id}
                      className="mgPoop"
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                      onClick={() => clickPoop(p.id)}
                    >
                      {p.emoji}
                    </button>
                  ))}
                  {!clickerActive && clickerTime === 60 && (
                    <p className="mgClickerHint">시작 누르면 똥이 떨어져요. 빨리 클릭하세요 ㄱㄱ</p>
                  )}
                </div>
              </div>
            )}
            {minigameMode === "wordchain" && (
              <div className="mgWordPanel">
                <div className="mgClickerHeader">
                  <button className="mgBackBtn" onClick={() => setMinigameMode("hub")}>← 뒤로</button>
                  <div className="mgScore">콤보 {wordChainStreak}회</div>
                  <button className="mgRetryBtn" onClick={startWordChain}>다시 시작</button>
                </div>
                <div className="mgWordHistory">
                  {wordChainHistory.map((h, i) => (
                    <div key={i} className={`mgWordRow ${h.speaker === "tteokjon" ? "mgRowTteokjon" : "mgRowUser"}`}>
                      <span className="mgWordSpeaker">{h.speaker === "tteokjon" ? "🦴 떡존이" : "💗 선생님"}</span>
                      <span className="mgWordText">{h.word}</span>
                    </div>
                  ))}
                </div>
                {wordChainStatus === "playing" ? (
                  <div className="mgWordInputRow">
                    <input
                      className="mgWordInput"
                      value={wordChainInput}
                      onChange={(e) => setWordChainInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") submitWordChain(); }}
                      placeholder={`'${wordChainHistory[wordChainHistory.length-1] ? wordChainLastChar(wordChainHistory[wordChainHistory.length-1].word) : "?"}' 로 시작하는 단어`}
                      maxLength={5}
                    />
                    <button onClick={submitWordChain}>제출</button>
                    <button className="mgGiveUpBtn" onClick={giveUpWordChain}>포기 (-50)</button>
                  </div>
                ) : wordChainStatus === "user_win" ? (
                  <div className="mgResultBanner mgWin">
                    🎉 선생님 승리! 🪙 +{100 + wordChainStreak * 10}, EXP +{50 + wordChainStreak * 5}
                    <button onClick={startWordChain}>한판 더</button>
                  </div>
                ) : (
                  <div className="mgResultBanner mgLose">
                    😢 떡존이 승리. 🪙 -50
                    <button onClick={startWordChain}>한판 더</button>
                  </div>
                )}
              </div>
            )}
            {minigameMode === "rps" && (
              <div className="mgRpsPanel">
                <div className="mgClickerHeader">
                  <button className="mgBackBtn" onClick={() => setMinigameMode("hub")}>← 뒤로</button>
                  <div className="mgScore">선생님 {rpsScore.user} : {rpsScore.tt} 떡존이 (R{rpsScore.round})</div>
                  <button className="mgRetryBtn" onClick={resetRps}>리셋</button>
                </div>
                {rpsScore.round < 5 && rpsScore.user < 2 && rpsScore.tt < 2 ? (
                  <>
                    <p className="mgRpsHint">선생님 차례. 골라주세요.</p>
                    <div className="mgRpsBtns">
                      <button onClick={() => playRps("rock")}>✊ 바위</button>
                      <button onClick={() => playRps("paper")}>✋ 보</button>
                      <button onClick={() => playRps("scissors")}>✌️ 가위</button>
                    </div>
                    {rpsScore.lastChoice && (
                      <div className="mgRpsLast">
                        선생님: {rpsScore.lastChoice === "rock" ? "✊" : rpsScore.lastChoice === "paper" ? "✋" : "✌️"}
                        &nbsp; vs &nbsp;
                        떡존이: {rpsScore.lastTt === "rock" ? "✊" : rpsScore.lastTt === "paper" ? "✋" : "✌️"}
                        &nbsp; → {rpsScore.lastResult === "win" ? "선생님 승리 ㅋ" : rpsScore.lastResult === "lose" ? "떡존이 승리 (죄송해요...)" : "비김"}
                      </div>
                    )}
                  </>
                ) : (
                  <div className={`mgResultBanner ${rpsScore.user > rpsScore.tt ? "mgWin" : "mgLose"}`}>
                    {rpsScore.user > rpsScore.tt ? "🎉 선생님 승리! 코인+200, 호감+30, EXP+80" : "😢 떡존이 승리. 코인-100"}
                    <button onClick={resetRps}>한판 더</button>
                  </div>
                )}
              </div>
            )}
            {minigameMode === "quiz" && (
              <div className="mgQuizPanel">
                <div className="mgClickerHeader">
                  <button className="mgBackBtn" onClick={() => setMinigameMode("hub")}>← 뒤로</button>
                  <div className="mgScore">정답 {quizState.correct} / {quizState.idx + (quizState.showResult ? 1 : 0)}</div>
                  <button className="mgRetryBtn" onClick={startQuiz}>새로 시작</button>
                </div>
                {!quizState.finished && quizState.questions.length > 0 ? (() => {
                  const qIdx = quizState.questions[quizState.idx];
                  const q = QUIZ_QUESTIONS[qIdx];
                  return (
                    <div className="mgQuizCard">
                      <div className="mgQuizQNum">Q{quizState.idx + 1} / {quizState.questions.length}</div>
                      <p className="mgQuizQuestion">{q.q}</p>
                      <div className="mgQuizOptions">
                        {q.options.map((opt, i) => (
                          <button
                            key={i}
                            className={`mgQuizOption${quizState.showResult ? (i === q.answer ? " mgQuizCorrect" : i === quizState.selected ? " mgQuizWrong" : "") : ""}`}
                            disabled={quizState.showResult}
                            onClick={() => answerQuiz(i)}
                          >
                            {String.fromCharCode(65 + i)}. {opt}
                          </button>
                        ))}
                      </div>
                      {quizState.showResult && (
                        <div className="mgQuizExplain">
                          {quizState.selected === q.answer ? "✅ 정답!" : "❌ 오답!"} {q.explain}
                          <button className="mgQuizNext" onClick={nextQuiz}>다음 ▶</button>
                        </div>
                      )}
                    </div>
                  );
                })() : quizState.finished ? (
                  <div className={`mgResultBanner ${quizState.correct >= 3 ? "mgWin" : "mgLose"}`}>
                    {quizState.correct >= 4 ? "🎉 떡존이 박사!" : quizState.correct >= 3 ? "👍 떡존이 잘 아시네요" : "😢 떡존이 좀 더 알아주세요..."}
                    &nbsp;정답 {quizState.correct}/{quizState.questions.length} → 코인+{quizState.correct * 50}, EXP+{quizState.correct * 30}
                    <button onClick={startQuiz}>한판 더</button>
                  </div>
                ) : (
                  <p className="mgQuizEmpty">시작 누르세요</p>
                )}
              </div>
            )}
          </Panel>
        )}
        {view === "seasonPass" && (() => {
          const filteredRewards = SEASON_REWARDS;
          return (
            <Panel title="시즌 패스 🎟">
              <div className="seasonHead">
                <div>
                  <h3>시즌 1 — 히로시마의 봄</h3>
                  <small>현재 레벨: <b>Lv.{userLevel}</b> · 시즌 트랙 {Math.min(userLevel, 50)} / 50</small>
                </div>
                {!seasonPremium && (
                  <button className="seasonBuyBtn" disabled={coins < SEASON_PREMIUM_PRICE} onClick={buySeasonPremium}>
                    프리미엄 패스 🪙{SEASON_PREMIUM_PRICE}
                  </button>
                )}
                {seasonPremium && <span className="seasonPremiumBadge">✨ 프리미엄 활성</span>}
              </div>
              <div className="seasonTrack">
                {filteredRewards.map((r) => {
                  const reached = userLevel >= r.lv;
                  const freeClaimed = !!seasonClaimedFree[r.lv];
                  const premiumClaimed = !!seasonClaimedPremium[r.lv];
                  return (
                    <div key={r.lv} className={`seasonRow${reached ? " seasonReached" : ""}${r.lv % 10 === 0 ? " seasonMilestone" : ""}`}>
                      <div className="seasonLv">Lv.{r.lv}</div>
                      <div className={`seasonBox seasonFree${freeClaimed ? " seasonClaimed" : reached ? " seasonReady" : ""}`}>
                        <small>FREE</small>
                        <div className="seasonReward">
                          {r.free?.coins ? `🪙${r.free.coins}` : ""}
                          {r.free?.tickets ? ` 🎫${r.free.tickets}` : ""}
                          {r.free?.affinity ? ` 호감+${r.free.affinity}` : ""}
                        </div>
                        {reached && !freeClaimed && <button onClick={() => claimSeasonReward(r.lv, "free")}>받기</button>}
                        {freeClaimed && <span className="seasonDone">✓</span>}
                      </div>
                      <div className={`seasonBox seasonPremiumBox${premiumClaimed ? " seasonClaimed" : reached && seasonPremium ? " seasonReady" : ""}${!seasonPremium ? " seasonLocked" : ""}`}>
                        <small>PREMIUM ✨</small>
                        <div className="seasonReward">
                          {r.premium?.coins ? `🪙${r.premium.coins}` : ""}
                          {r.premium?.tickets ? ` 🎫${r.premium.tickets}` : ""}
                          {r.premium?.affinity ? ` 호감+${r.premium.affinity}` : ""}
                          {r.premium?.cards ? ` 🃏×${r.premium.cards}` : ""}
                        </div>
                        {reached && seasonPremium && !premiumClaimed && <button onClick={() => claimSeasonReward(r.lv, "premium")}>받기</button>}
                        {premiumClaimed && <span className="seasonDone">✓</span>}
                        {!seasonPremium && <span className="seasonLockBadge">🔒</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          );
        })()}
        {view === "sound" && (
          <Panel title="음향 설정 🔊">
            <p className="soundIntro">BGM과 SFX 켜기/끄기 + 볼륨 조절. 파일이 없어도 안전하게 작동.</p>
            <div className="soundCard">
              <h4>🎵 배경음악 (BGM)</h4>
              <label className="soundToggle">
                <input type="checkbox" checked={soundBgmEnabled} onChange={(e) => setSoundBgmEnabled(e.target.checked)}/>
                <span>{soundBgmEnabled ? "켜짐" : "꺼짐"}</span>
              </label>
              <label className="soundVolume">
                <span>볼륨: {Math.round(soundBgmVolume * 100)}%</span>
                <input type="range" min={0} max={100} value={Math.round(soundBgmVolume * 100)} onChange={(e) => setSoundBgmVolume(Number(e.target.value) / 100)}/>
              </label>
              <small>현재 트랙: {storyRoute === "obsession" ? "🌑 obsession theme" : storyRoute === "pure" ? "💗 pure theme" : "🌅 common theme"} (파일 없으면 무음)</small>
            </div>
            <div className="soundCard">
              <h4>🔔 효과음 (SFX)</h4>
              <label className="soundToggle">
                <input type="checkbox" checked={soundSfxEnabled} onChange={(e) => setSoundSfxEnabled(e.target.checked)}/>
                <span>{soundSfxEnabled ? "켜짐" : "꺼짐"}</span>
              </label>
              <label className="soundVolume">
                <span>볼륨: {Math.round(soundSfxVolume * 100)}%</span>
                <input type="range" min={0} max={100} value={Math.round(soundSfxVolume * 100)} onChange={(e) => setSoundSfxVolume(Number(e.target.value) / 100)}/>
              </label>
              <button className="soundTestBtn" onClick={() => playSfx("click")}>테스트 재생</button>
            </div>
            <details className="soundFiles">
              <summary>📁 필요한 파일 목록</summary>
              <ul>
                <li><code>/bgm_common.mp3</code> — 공통 BGM</li>
                <li><code>/bgm_pure.mp3</code> — 순애 루트 BGM</li>
                <li><code>/bgm_obsession.mp3</code> — 집착 루트 BGM</li>
                <li><code>/sfx_click.mp3</code> — 일반 클릭</li>
                <li><code>/sfx_coin.mp3</code> — 코인 획득</li>
                <li><code>/sfx_levelup.mp3</code> — 레벨업</li>
                <li><code>/sfx_card.mp3</code> — 카드 뽑기</li>
                <li><code>/sfx_win.mp3</code> — 승리</li>
                <li><code>/sfx_lose.mp3</code> — 패배</li>
              </ul>
              <small>public/ 폴더에 넣으면 자동 적용. 없으면 조용히 무시.</small>
            </details>
          </Panel>
        )}
        {view === "adventure" && (() => {
          const ps: { stats: Stats; storyRoute: StoryRoute; unlockedEndings: Record<string, boolean>; seenEvents: Record<string, boolean> } = { stats, storyRoute, unlockedEndings, seenEvents };
          const visible = ADVENTURES.filter((a) => !a.unlock || a.unlock.check(ps));
          const active = activeAdventure;
          const activeLoc = active ? ADVENTURES.find((a) => a.id === active.id) : null;
          const remaining = active ? Math.max(0, active.endTime - Date.now()) : 0;
          const remH = Math.floor(remaining / 3600000);
          const remM = Math.floor((remaining % 3600000) / 60000);
          const remS = Math.floor((remaining % 60000) / 1000);
          const ready = active && remaining === 0;
          return (
            <Panel title="떡존이의 모험 🌍">
              <p className="advIntro">떡존이를 어디론가 보내고 시간 기다리면 보상 받음 ㅋ 펫 동반하면 보너스 더 받음</p>
              {active && activeLoc && (
                <div className={`advActive${ready ? " advReady" : ""}`}>
                  <div className="advActiveHead">
                    <span className="advActiveEmoji">{activeLoc.emoji}</span>
                    <div>
                      <b>{activeLoc.name}</b>
                      <small>{activeLoc.flavor}</small>
                    </div>
                  </div>
                  <div className="advTimer">
                    {ready ? (
                      <span className="advReadyText">✨ 회수 가능! 떡존이 돌아옴 ㅗㅜㅑ</span>
                    ) : (
                      <span>⏱ {remH > 0 ? `${remH}시간 ` : ""}{String(remM).padStart(2,"0")}:{String(remS).padStart(2,"0")} 남음</span>
                    )}
                  </div>
                  <div className="advActiveBtns">
                    {ready ? (
                      <button className="advCollectBtn" onClick={collectAdventure}>🎁 보상 회수</button>
                    ) : (
                      <button className="advCancelBtn" onClick={cancelAdventure}>중단 (보상 없음)</button>
                    )}
                  </div>
                </div>
              )}
              <h3 className="advSectionTitle">📍 떠날 수 있는 곳</h3>
              <div className="advGrid">
                {visible.map((loc) => {
                  const completed = adventureHistory[loc.id] ?? 0;
                  return (
                    <div key={loc.id} className="advCard">
                      <div className="advCardHead">
                        <span className="advEmoji">{loc.emoji}</span>
                        <div className="advCardHeadText">
                          <b>{loc.name}</b>
                          <small>{loc.flavor}</small>
                        </div>
                      </div>
                      <div className="advDuration">⏱ {loc.durationMs >= 3600000 ? `${Math.floor(loc.durationMs/3600000)}시간` : `${Math.floor(loc.durationMs/60000)}분`}</div>
                      <div className="advRewards">
                        🪙 {loc.rewards.coins}
                        {loc.rewards.affinity ? ` · 호감 +${loc.rewards.affinity}` : ""}
                        {loc.rewards.trust ? ` · 신뢰 +${loc.rewards.trust}` : ""}
                        {loc.rewards.obsession ? ` · 집착 +${loc.rewards.obsession}` : ""}
                        {loc.rewards.bladderCharm ? ` · 매력 +${loc.rewards.bladderCharm}` : ""}
                        {loc.rewards.ticketChance ? ` · ${Math.round(loc.rewards.ticketChance*100)}% 🎫` : ""}
                      </div>
                      {completed > 0 && <small className="advCompleted">완료 {completed}회</small>}
                      <button className="advStartBtn" disabled={!!active} onClick={() => startAdventure(loc)}>
                        {active ? "원정 진행중" : "출발"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </Panel>
          );
        })()}
        {view === "sns" && (
          <Panel title="떡존이 SNS 📱">
            <div className="snsHeader">
              <div className="snsProfile">
                <div className="snsAvatar"><img src={getHomeCharacterImage(stats, storyRoute)} alt="떡존이" onError={(e)=>{e.currentTarget.src=`/sd_geunddeok_idle.png?v=${SD_IMAGE_VERSION}`}}/></div>
                <div>
                  <b>@tteokjon_official</b>
                  <small>K-방광 인플루언서 / 히로시마 거주 / 떡존이</small>
                </div>
              </div>
              <button className="snsRefreshBtn" onClick={refreshSnsFeed}>새로고침 🔄</button>
            </div>
            <p className="snsHint">좋아요 누르면 호감 +1 + 코인 +1. 4시간마다 새 피드 갱신.</p>
            <div className="snsFeed">
              {snsFeed.length === 0 && <p style={{ textAlign: "center", padding: 40, color: "#9a7c65" }}>새로고침 눌러서 피드 받아오셈</p>}
              {snsFeed.map((post) => {
                const tpl = SNS_TEMPLATES.find((t) => t.id === post.templateId);
                if (!tpl) return null;
                const liked = !!snsLikes[post.id];
                const ageMs = Date.now() - post.timestamp;
                const ageH = Math.floor(ageMs / 3600000);
                const ageM = Math.floor(ageMs / 60000);
                const ageStr = ageH > 0 ? `${ageH}시간 전` : `${ageM}분 전`;
                return (
                  <div key={post.id} className={`snsPost snsCat-${tpl.category}`}>
                    <div className="snsPostHead">
                      <span className="snsPostEmoji">{tpl.emoji}</span>
                      <small className="snsPostTime">{ageStr}</small>
                    </div>
                    <p className="snsPostText">{tpl.text}</p>
                    <div className="snsPostActions">
                      <button className={`snsLikeBtn${liked ? " snsLiked" : ""}`} onClick={() => toggleSnsLike(post.id)}>
                        {liked ? "❤️" : "🤍"} {post.likes + (liked ? 1 : 0)}
                      </button>
                      <small className="snsCategory">#{tpl.category}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}
        {view === "raid" && (() => {
          const boss = RAID_BOSSES.find((b) => b.id === raidBossId);
          const hpPct = boss ? (raidHp / boss.hpMax) * 100 : 0;
          return (
            <Panel title="주간 레이드 ⚔️">
              <p className="raidIntro">매주 새 보스 등장. 채팅(10) / 선물(80) / 시나리오(150) 데미지로 깎아보셈 ㄱㄱ</p>
              {boss && (
                <div className={`raidBossCard${raidCleared ? " raidCleared" : ""}`}>
                  <div className="raidBossHead">
                    <span className="raidBossEmoji">{boss.emoji}</span>
                    <div>
                      <b>{boss.name}</b>
                      <small>{boss.flavor}</small>
                    </div>
                  </div>
                  {!raidCleared && <p className="raidTaunt">"{boss.taunt}"</p>}
                  {raidCleared && <p className="raidWinText">✅ 격파 완료! 다음주 자정까지 휴식 ㅋ</p>}
                  <div className="raidHpRow">
                    <span>HP</span>
                    <div className="raidHpBar"><div style={{ width: `${hpPct}%` }}/></div>
                    <strong>{raidHp.toLocaleString()} / {boss.hpMax.toLocaleString()}</strong>
                  </div>
                  <div className="raidStats">
                    <span>이번주 누적 데미지: <b>{raidDamageDealt.toLocaleString()}</b></span>
                  </div>
                  <h4 className="raidRewardTitle">🎁 처치 보상</h4>
                  <div className="raidRewards">
                    🪙 {boss.rewards.coins} · 🎫 {boss.rewards.tickets} · EXP +{boss.rewards.exp}
                    {boss.rewards.affinity ? ` · 호감 +${boss.rewards.affinity}` : ""}
                  </div>
                </div>
              )}
              <small style={{ display: "block", marginTop: 16, color: "#9a7c65", textAlign: "center" }}>이번 주차: {raidWeek}</small>
            </Panel>
          );
        })()}
        {view === "pets" && (
          <Panel title="펫 동반자 🐹">
            <p className="petsIntro">펫 1마리 활성화하면 보너스 받음. 채팅하거나 가챠 돌리면 친밀도 오름 ㅋ</p>
            <div className="petsGrid">
              {PETS.map((pet) => {
                const data = ownedPets[pet.id];
                const owned = !!data;
                const lvl = data ? petLevel(data.affinity) : 0;
                const evolved = lvl >= 5;
                const isActive = activePet === pet.id;
                const affNext = lvl < 10 ? lvl * 100 : 1000;
                const affPct = data ? Math.min(100, ((data.affinity % 100) / 100) * 100) : 0;
                return (
                  <div key={pet.id} className={`petCard${owned ? " petOwned" : " petLocked"}${isActive ? " petActive" : ""}${evolved ? " petEvolved" : ""}`}>
                    {owned ? (
                      <div className="petArtFrame">
                        {(evolved && pet.evolvedImage) || pet.image ? (
                          <img
                            className="petArt"
                            src={evolved && pet.evolvedImage ? pet.evolvedImage : pet.image!}
                            alt={pet.name}
                            onError={(e) => {
                              const el = e.currentTarget as HTMLImageElement;
                              if (evolved && pet.evolvedImage && !el.dataset.fallback) {
                                el.dataset.fallback = "1";
                                el.src = pet.image ?? "";
                              } else {
                                el.style.display = "none";
                                const sibling = el.nextElementSibling as HTMLElement | null;
                                if (sibling) sibling.style.display = "block";
                              }
                            }}
                          />
                        ) : null}
                        <span className="petEmoji petEmojiFallback" style={{ display: pet.image ? "none" : "block" }}>
                          {evolved && pet.evolvedEmoji ? pet.evolvedEmoji : pet.emoji}
                        </span>
                      </div>
                    ) : (
                      <div className="petEmoji petLockedEmoji">❓</div>
                    )}
                    <div className="petName">{owned ? (evolved && pet.evolvedName ? pet.evolvedName : pet.name) : "??? 미해금"}</div>
                    <small className="petFlavor">{owned ? pet.flavor : `잠금: ${pet.unlock.hint}`}</small>
                    <div className="petEffect">{owned ? pet.description : "—"}</div>
                    {owned && (
                      <>
                        <div className="petLvLine">
                          <span className="petLvBadge">Lv.{lvl}</span>
                          <span className="petAff">❤️ {Math.min(data!.affinity, 1000)} / 1000</span>
                        </div>
                        <div className="petAffBar"><div style={{ width: `${affPct}%` }}/></div>
                        <div className="petActions">
                          <button
                            className={`petActiveBtn${isActive ? " petIsActive" : ""}`}
                            onClick={() => setActivePet(isActive ? null : pet.id)}
                          >
                            {isActive ? "✓ 동반중" : "동반시키기"}
                          </button>
                          <button className="petFeedBtn" disabled={coins < 30 || lvl >= 10} onClick={() => feedPet(pet.id, 30, 10)}>🪙30 +친10</button>
                          <button className="petFeedBigBtn" disabled={coins < 100 || lvl >= 10} onClick={() => feedPet(pet.id, 100, 40)}>🪙100 +친40</button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="petFusionBox">
              <h3 className="petFusionTitle">🧬 펫 합성 실험실</h3>
              <p className="petFusionDesc">펫 2마리 골라서 🪙500 태우면 친밀도 듬뿍 올라감 ㅋㅋ (같은 펫 2번은 ㄴㄴ)</p>
              <div className="petFusionSlots">
                <select className="petFusionSelect" value={fusionPick1 ?? ""} onChange={(e) => setFusionPick1(e.target.value || null)}>
                  <option value="">슬롯 1 선택</option>
                  {PETS.filter((p) => ownedPets[p.id]).map((p) => (
                    <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                  ))}
                </select>
                <span className="petFusionPlus">+</span>
                <select className="petFusionSelect" value={fusionPick2 ?? ""} onChange={(e) => setFusionPick2(e.target.value || null)}>
                  <option value="">슬롯 2 선택</option>
                  {PETS.filter((p) => ownedPets[p.id]).map((p) => (
                    <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                  ))}
                </select>
              </div>
              <button
                className="petFusionBtn"
                disabled={!fusionPick1 || !fusionPick2 || fusionPick1 === fusionPick2 || coins < 500}
                onClick={fusePets}
              >
                🧪 합성 ㄱㄱ (🪙500)
              </button>
              {fusionResultMsg && <div className="petFusionResult">{fusionResultMsg}</div>}
            </div>
          </Panel>
        )}
        {view === "gacha" && (() => {
          const freeReady = Date.now() - lastFreeGacha >= perkBonus.gachaCooldownMs;
          const nextFreeMs = Math.max(0, perkBonus.gachaCooldownMs - (Date.now() - lastFreeGacha));
          const nextFreeH = Math.floor(nextFreeMs / 3600000);
          const nextFreeM = Math.floor((nextFreeMs % 3600000) / 60000);
          return (
            <Panel title="요도니아의 룰렛 🎰">
              <p className="gachaIntro">뽑으면 뭐가 나올지 모름 ㅋㅋ 운좋으면 SSR 나오자너 ㅇㅈ?</p>
              <div className="gachaInfoBar">
                <span>🪙 <b>{coins.toLocaleString()}</b></span>
                <span>🎫 티켓 <b>{gachaTickets}</b></span>
              </div>
              <div className="gachaPullBtns">
                <button className={`gachaBtn gachaFree${freeReady ? "" : " gachaDisabled"}`} disabled={!freeReady} onClick={() => pullGacha("free")}>
                  <b>무료 뽑기</b>
                  <small>{freeReady ? "지금 가능 ㄱㄱ" : `${nextFreeH}시간 ${nextFreeM}분 후`}</small>
                </button>
                <button className={`gachaBtn gachaTicket${gachaTickets <= 0 ? " gachaDisabled" : ""}`} disabled={gachaTickets <= 0} onClick={() => pullGacha("ticket")}>
                  <b>티켓 뽑기</b>
                  <small>{gachaTickets > 0 ? "한번만 굴려보자" : "티켓 없음 ㅈㅅ"}</small>
                </button>
                <button className={`gachaBtn gachaSingle${coins < GACHA_PRICE ? " gachaDisabled" : ""}`} disabled={coins < GACHA_PRICE} onClick={() => pullGacha("single")}>
                  <b>단일 뽑기</b>
                  <small>🪙 {GACHA_PRICE}</small>
                </button>
                <button className={`gachaBtn gachaTen${coins < GACHA_PRICE * 9 ? " gachaDisabled" : ""}`} disabled={coins < GACHA_PRICE * 9} onClick={() => pullGacha("ten")}>
                  <b>10연차</b>
                  <small>🪙 {GACHA_PRICE * 9} (1+1, SR 보장)</small>
                </button>
              </div>
              <h3 className="gachaSectionTitle">📜 풀 미리보기 (병맛 주의)</h3>
              <div className="gachaPoolGrid">
                {(["SSR","SR","R","N","C"] as GachaTier[]).map((tier) => (
                  <div key={tier} className={`gachaPoolTier gachaTier-${tier}`}>
                    <div className="gachaTierHead">
                      <b>{tier}</b>
                      <span>{(GACHA_TIER_RATES[tier] * 100).toFixed(0)}%</span>
                    </div>
                    <ul>{GACHA_POOL.filter((g) => g.tier === tier).map((g) => <li key={g.id}>{g.emoji} {g.name}</li>)}</ul>
                  </div>
                ))}
              </div>
            </Panel>
          );
        })()}
        {view === "profile" && <Panel title="상태"><div className="profilePanel"><div className="profileOverview"><div className="profileIllustration"><img key={currentPortrait} className="portraitCrossfade" src={currentPortrait || getHomeCharacterImage(stats, storyRoute)} alt={`${profile.name} 초상`} onError={(e)=>{e.currentTarget.src="/oppa1.png"}}/></div><div className="profileSummary"><h3>{profile.name}</h3><p className="profileTag">Lv.{relLevel.lv} · {relLevel.displayName}</p><div className="profileStatsLine"><span>{routeLabel}</span><span>{currentChapter}장 진행</span>{currentScenario ? <span>{currentScenario.title}</span> : null}</div><div className="profileDetails"><span>나이 {profile.age}</span><span>키 {profile.height}</span><span>{profile.location}</span></div><div className="statusCards"><div className="statusCard"><strong>호감</strong><span>{stats.affinity}%</span><small>{getStatMood("affinity", stats.affinity)}</small></div><div className="statusCard"><strong>질투</strong><span>{stats.jealousy}%</span><small>{getStatMood("jealousy", stats.jealousy)}</small></div><div className="statusCard"><strong>집착</strong><span>{stats.obsession}%</span><small>{getStatMood("obsession", stats.obsession)}</small></div><div className="statusCard"><strong>신뢰</strong><span>{stats.trust}%</span><small>{getStatMood("trust", stats.trust)}</small></div>{stats.bladderCharm > 0 && <div className="statusCard bladderCharmCard"><strong>🚽 방광매력</strong><span>{stats.bladderCharm}</span><small>{stats.bladderCharm >= 800 ? "태평양방광 — 전 세계가 매료됨" : stats.bladderCharm >= 400 ? "K-방광 — 선생님이 진심으로 듬직해함" : stats.bladderCharm >= 100 ? "방광이 매력 포인트가 되기 시작함" : "선생님이 살짝 신경 쓰이기 시작"}</small></div>}</div><div className="statusNote"><b>{emotionState.label}</b><span>{emotionState.detail}</span><small>{getCurrentStatusText(stats, storyRoute)}</small></div></div></div><div className="memoryPanel"><div><strong>관계 기억 노트</strong><small>{memoryNotes.length}개 저장됨</small></div>{memoryNotes.length ? memoryNotes.slice(-8).reverse().map((note)=><p key={note.id}><b>{note.chapter}장</b>{note.text}</p>) : <p>아직 근떡존이 오래 붙잡고 있을 만한 기억은 없어요.</p>}</div><div className="profileTextBlock"><p>{profile.bio}</p><p>{profile.personality}</p></div><div className="profileMeta"><div><strong>좋아하는 것</strong><p>{profile.likes.join(" · ")}</p></div><div><strong>취미</strong><p>{profile.hobbies.join(" · ")}</p></div><div><strong>키워드</strong><p>{profile.tags.join(" · ")}</p></div></div></div></Panel>}
        {view === "gallery" && (
          <Panel title="CG 갤러리">
            <div className="tabs">{(Object.keys(galleryTabLabels) as GalleryTab[]).filter((tab) => tab !== "bladder" || isAdminMode || Object.keys(unlockedEndings).length >= 1).map((tab)=><button key={tab} className={`${galleryTab===tab?"active":""}${tab==="bladder"?" bladderTab":""}`} onClick={()=>setGalleryTab(tab)}>{galleryTabLabels[tab]}</button>)}</div>
            <div className="galleryProgress">
              <span>해금 진행도</span>
              <div className="galleryProgressBar"><div style={{width: `${galleryStats.total ? (galleryStats.unlocked / galleryStats.total) * 100 : 0}%`}}/></div>
              <strong>{galleryStats.unlocked} / {galleryStats.total}</strong>
            </div>
            {cgReaction && (
              <div className="cgReaction">
                <img src={cgReaction.img} alt="" onError={(e)=>{e.currentTarget.style.display="none"}}/>
                <div className="cgReactionBody">
                  <p>{cgReaction.text}</p>
                  {cgScenarioMap[cgReaction.img] && (
                    <small className="cgSourceCaption">📖 {cgScenarioMap[cgReaction.img].title} · {cgScenarioMap[cgReaction.img].subtitle}</small>
                  )}
                </div>
                <div className="cgReactionActions">
                  <button className={`favBtn${cgFavorites[cgReaction.img]?" favOn":""}`} onClick={()=>toggleCgFavorite(cgReaction.img)} aria-label="즐겨찾기">{cgFavorites[cgReaction.img] ? "♥" : "♡"}</button>
                  <button onClick={()=>setCgReaction(null)}>닫기</button>
                </div>
              </div>
            )}
            <div className="galleryGrid">
              {galleryImages.map((img) => {
                const unlocked = isAdminMode || unlockedCGs[img];
                const isFav = !!cgFavorites[img];
                const source = cgScenarioMap[img];
                return (
                  <button
                    className={`cgCard${unlocked ? " cgCardUnlocked" : " cgCardLocked"}${isFav ? " cgCardFav" : ""}`}
                    key={img}
                    onClick={() => unlocked && setCgReaction({ img, text: getCgReaction(img, stats, storyRoute) })}
                  >
                    {unlocked ? (
                      <>
                        <img src={img} alt="" onError={(e)=>{e.currentTarget.style.display="none"}}/>
                        {isFav && <span className="cgFavMark">♥</span>}
                        {source && <span className="cgCardCaption">{source.title}</span>}
                      </>
                    ) : (
                      <>
                        <img src={img} alt="" className="cgSilhouette" aria-hidden onError={(e)=>{e.currentTarget.style.display="none"}}/>
                        <span className="cgLockedBadge">🔒</span>
                        <span className="cgCardCaption">미해금 · ???</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </Panel>
        )}
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
            stats.obsession,
            stats.bladderCharm
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
                      <div className={`wardrobePreview${outfit.id === "k_bladder_suit" ? " kBladderPreview" : ""}`}>
                        {isUnlocked ? (
                          <img
                            src={outfit.portrait}
                            alt={outfit.label}
                            onError={(e) => {
                              const el = e.currentTarget as HTMLImageElement;
                              if (outfit.id === "k_bladder_suit" && !el.dataset.fallback) {
                                el.dataset.fallback = "1";
                                el.src = "/bladder_illust.png";
                              } else {
                                el.style.display = "none";
                              }
                            }}
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

        {view === "save" && (
          <Panel title="저장">
            <div className="saveSlotGrid" data-tick={slotTick}>
              {[1, 2, 3].map((slot) => {
                const data = readSlotData(slot);
                const route = data?.storyRoute ?? "common";
                const routeKlass = route === "pure" ? "ssRoutePure" : route === "obsession" ? "ssRouteObsession" : "ssRouteCommon";
                return (
                  <div className={`saveSlotCard ${routeKlass}${data ? " ssFilled" : " ssEmpty"}`} key={slot}>
                    <div className="ssHead">
                      <span className="ssNum">슬롯 {slot}</span>
                      {data && <span className="ssRouteBadge">{data.routeLabel ?? "공통 루트"}</span>}
                    </div>
                    {data ? (
                      <>
                        <div className="ssBody">
                          <img className="ssThumb" src={data.saveThumbnail || "/oppa1.png"} alt="" onError={(e)=>{e.currentTarget.src="/oppa1.png"}}/>
                          <div className="ssMeta">
                            <p className="ssScene">{(data.currentScenarioId && (scenarioData[data.currentScenarioId]?.title ?? LOCATION_SCENARIOS[data.currentScenarioId]?.title)) ?? "자유 대화"}</p>
                            {data.lastMessagePreview && <p className="ssPreview">"{data.lastMessagePreview}"</p>}
                            <div className="ssStats">
                              <span>호감 {data.stats?.affinity ?? 0}</span>
                              <span>신뢰 {data.stats?.trust ?? 0}</span>
                              <span>집착 {data.stats?.obsession ?? 0}</span>
                              <span>질투 {data.stats?.jealousy ?? 0}</span>
                            </div>
                            <small className="ssTime">{formatSavedAt(data.savedAt)}</small>
                          </div>
                        </div>
                        <div className="ssActions">
                          <button className="ssBtnLoad" onClick={() => loadSlot(slot)}>불러오기</button>
                          <button className="ssBtnSave" onClick={() => saveSlot(slot)}>덮어쓰기</button>
                          <button className="ssBtnDel" onClick={() => deleteSlot(slot)}>삭제</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="ssEmptyBody">
                          <span className="ssEmptyIcon">📁</span>
                          <p>비어 있는 슬롯</p>
                          <small>현재 진행 상황을 여기에 저장할 수 있어요.</small>
                        </div>
                        <div className="ssActions">
                          <button className="ssBtnSave" onClick={() => saveSlot(slot)}>저장</button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <button className="bigBtn dangerBtn" onClick={resetAll}>전체 초기화</button>
          </Panel>
        )}
        {view === "settings" && <Panel title="액션"><div className="grid">{actionItems.map((item)=><button className="cardBtn" key={item.label} onClick={()=>runAction(item)}><b>{item.emoji} {item.label}</b><small>{item.text}</small></button>)}</div></Panel>}

        {view === "admin" && isAdminMode && (
          <Panel title="🔑 관리자 패널">
            <div className="adminPanel">
              <div className="adminSection">
                <h3 className="adminSectionTitle">🎛 수치 조정</h3>
                <div className="adminStatRows">
                  {(["affinity","jealousy","obsession","trust","bladderCharm"] as (keyof Stats)[]).map((key) => (
                    <div key={key} className="adminStatRow">
                      <span className="adminStatLabel">{({affinity:"호감",jealousy:"질투",obsession:"집착",trust:"신뢰",bladderCharm:"🚽매력"} as Record<keyof Stats, string>)[key]}</span>
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
        {questToast && <div className="cgUnlockToast questToast"><div className="cgUnlockIcon">🎯</div><div><b>퀘스트 달성!</b><span>「{questToast.title}」</span><small>도전 메뉴에서 보상을 받으세요.</small></div></div>}
        {milestoneToast && <div className="cgUnlockToast milestoneToast"><div className="cgUnlockIcon">💗</div><div><b>마일스톤 달성</b><span>「{milestoneToast.title}」</span><small>새 메시지가 도착했어요.</small></div></div>}
        {shopToast && <div className="cgUnlockToast shopToast"><div className="cgUnlockIcon">🪙</div><div><b>{shopToast.name}</b><span>{shopToast.detail}</span></div></div>}
        {expFloater && <div className="expFloater" key={expFloater.id}>+{expFloater.amount} EXP</div>}
        {raidDamageFloater && <div className="raidDmgFloater" key={raidDamageFloater.id}>-{raidDamageFloater.dmg} HP</div>}
        {comboCount >= 3 && view === "chat" && (
          <div className={`comboCounter${comboBreak ? " comboBreak" : ""}`}>
            <span className="comboLabel">COMBO</span>
            <span className="comboNum">{comboCount}</span>
          </div>
        )}
        {comboToast && <div className="cgUnlockToast comboToast"><div className="cgUnlockIcon">🔥</div><div><b>{comboToast}</b><span>보상 받았다능 ㅋ</span></div></div>}
        {petToast && (
          <div className="cgUnlockToast petToast">
            <div className="cgUnlockIcon">
              {petToast.emoji?.startsWith("/") ? (
                <img src={petToast.emoji} alt="" style={{ width: 36, height: 36, objectFit: "contain" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              ) : (
                petToast.emoji
              )}
            </div>
            <div><b>{petToast.name} 합류!</b><span>{petToast.flavor}</span><small>펫 메뉴에서 동반시키셈 ㄱㄱ</small></div>
          </div>
        )}
        {gachaResult && (
          <div className="gachaOverlay" onClick={() => gachaResult.phase === "reveal" && setGachaResult(null)}>
            {gachaResult.phase === "rolling" && (
              <div className="gachaRolling">
                <div className="gachaSpinner"/>
                <p>운명이 결정되는중 ㄷㄷ</p>
              </div>
            )}
            {gachaResult.phase === "reveal" && (
              <div className="gachaResultWrap">
                <div className="gachaResultGrid">
                  {gachaResult.items.map((item, i) => (
                    <div key={i} className={`gachaCard gachaCard-${item.tier}`} style={{ animationDelay: `${i * 0.08}s` }}>
                      <span className="gachaTierBadge">{item.tier}</span>
                      <div className="gachaCardEmoji">{item.emoji}</div>
                      <div className="gachaCardName">{item.name}</div>
                      <small className="gachaCardFlavor">{item.flavor}</small>
                    </div>
                  ))}
                </div>
                <button className="gachaCloseBtn" onClick={() => setGachaResult(null)}>ㅇㅋ 닫기 ✓</button>
              </div>
            )}
          </div>
        )}
        {levelUpEffect && (
          <div className="levelUpOverlay" onClick={()=>setLevelUpEffect(null)}>
            <div className="levelUpRays"/>
            <div className="levelUpCard">
              <span className="levelUpEyebrow">L · E · V · E · L &nbsp;&nbsp; U · P</span>
              <p className="levelUpLevel">Lv. {levelUpEffect.level}</p>
              <span className="levelUpTitle">{levelUpEffect.title}</span>
              <small className="levelUpReward">🪙 +{levelUpEffect.level * 10} 보너스</small>
              {levelUpEffect.reward && (
                <div className="levelUpUnlock">
                  <div className="levelUpUnlockHead">{levelUpEffect.reward.emoji} {levelUpEffect.reward.title}</div>
                  <p className="levelUpUnlockDesc">{levelUpEffect.reward.description}</p>
                  {levelUpEffect.reward.oneTime && (
                    <small className="levelUpUnlockOneTime">
                      {levelUpEffect.reward.oneTime.coins ? `🪙 +${levelUpEffect.reward.oneTime.coins} ` : ""}
                      {levelUpEffect.reward.oneTime.tickets ? `🎫 +${levelUpEffect.reward.oneTime.tickets} ` : ""}
                      {levelUpEffect.reward.oneTime.affinity ? `호감 +${levelUpEffect.reward.oneTime.affinity} ` : ""}
                      {levelUpEffect.reward.oneTime.trust ? `신뢰 +${levelUpEffect.reward.oneTime.trust} ` : ""}
                    </small>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {showLevelRewards && (
          <div className="levelRewardsOverlay" onClick={()=>setShowLevelRewards(false)}>
            <div className="levelRewardsModal" onClick={(e)=>e.stopPropagation()}>
              <button className="levelRewardsClose" onClick={()=>setShowLevelRewards(false)}>✕</button>
              <h2 className="levelRewardsTitle">📜 레벨 보상 도감</h2>
              <p className="levelRewardsHint">현재 레벨 <b>Lv.{userLevel}</b> · 레벨 올릴 때마다 새 능력 잠금 해제됨</p>
              <div className="levelRewardsList">
                {LEVEL_REWARDS.map((r) => {
                  const reached = userLevel >= r.level;
                  return (
                    <div key={r.level} className={`levelRewardCard${reached ? " lrReached" : " lrLocked"}`}>
                      <div className="lrCardLv">Lv.{r.level}</div>
                      <div className="lrCardEmoji">{reached ? r.emoji : "🔒"}</div>
                      <div className="lrCardBody">
                        <b>{r.title}</b>
                        <small>{r.description}</small>
                        {r.oneTime && (
                          <div className="lrOneTime">
                            🎁 1회 보상:
                            {r.oneTime.coins ? ` 🪙${r.oneTime.coins}` : ""}
                            {r.oneTime.tickets ? ` 🎫${r.oneTime.tickets}` : ""}
                            {r.oneTime.affinity ? ` 호감+${r.oneTime.affinity}` : ""}
                            {r.oneTime.trust ? ` 신뢰+${r.oneTime.trust}` : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
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
      {bladderEntryCinematic && (
        <div className="bladderEntryCinematic" onClick={() => setBladderEntryCinematic(false)}>
          <div className="bladderEntryBg"/>
          <div className="bladderEntryRipple"/>
          <div className="bladderEntryRipple bladderEntryRipple2"/>
          <div className="bladderEntryRipple bladderEntryRipple3"/>
          <div className="bladderCinText">
            <span className="bladderCinEyebrow">??? &nbsp; · &nbsp; S · E · C · R · E · T &nbsp; · &nbsp; R · O · U · T · E</span>
            <p className="bladderCinTitle"><span className="bladderEmoji">🚽</span>방광 루트 진입<span className="bladderEmoji">🚽</span></p>
            <span className="bladderCinSub">— 잊혀진 화장실에서, 모든 것이 시작된다 —</span>
          </div>
          <button className="bladderCinSkip" onClick={(e)=>{e.stopPropagation();setBladderEntryCinematic(false)}}>SKIP ▶</button>
        </div>
      )}
      {bladderEnchantCinematic && (
        <div className="bladderEnchantCinematic" onClick={() => setBladderEnchantCinematic(false)}>
          <div className="bladderEnchantBg"/>
          <div className="bladderEnchantRainbow"/>
          {Array.from({length: 24}).map((_,i) => <div key={i} className="bladderEnchantSparkle" style={{left:`${(i*53)%100}%`,top:`${(i*37)%100}%`,animationDelay:`${i*0.15}s`}}/>)}
          <div className="bladderEnchantRays"/>
          <div className="bladderEnchantText">
            <span className="bladderEnchantEyebrow">✦ &nbsp; URETHRANYA &nbsp; ✦</span>
            <p className="bladderEnchantStage1">강철방광</p>
            <p className="bladderEnchantArrow">↓</p>
            <p className="bladderEnchantStage2">백두방광</p>
            <p className="bladderEnchantArrow">↓</p>
            <p className="bladderEnchantStage3">🌊 태평양방광 🌊</p>
            <span className="bladderEnchantSub">그대의 방광은, 인류를 구할 운명이다</span>
          </div>
          <button className="bladderCinSkip" onClick={(e)=>{e.stopPropagation();setBladderEnchantCinematic(false)}}>SKIP ▶</button>
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
.statusCard.bladderCharmCard{background:linear-gradient(135deg,#fff7d6 0%,#ffe9a8 100%);border-color:#d9a656;color:#5a3d12}.statusCard.bladderCharmCard strong{color:#7b5318}.statusCard.bladderCharmCard span{color:#3a2510;font-weight:1000}.statusCard.bladderCharmCard small{color:#7b5318}
/* ─ 퀘스트 패널 ─ */
.questIntro{margin:0 0 18px;padding:14px 16px;background:#fff8ef;border:1px solid #e8c99e;border-radius:14px;color:#5a3d12;font-size:14px;font-weight:700}
.questIntro strong{color:#df842c;font-weight:1000}
.questGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.questCard{background:#fff;border:1px solid #e6d2b8;border-radius:18px;padding:18px;display:grid;gap:10px;transition:transform .15s ease,box-shadow .2s ease;position:relative;overflow:hidden}
.questCard:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(91,48,24,.1)}
.questCard.qcMain{border-left:4px solid #df842c}
.questCard.qcSide{border-left:4px solid #8b7162}
.questCard.qcBladder{border-left:4px solid #d9a656;background:linear-gradient(135deg,#fffbf0 0%,#fff5d6 100%)}
.questCard.qcSecret{border-left:4px solid #6e4592;background:linear-gradient(135deg,#faf5ff 0%,#ede0f7 100%)}
.questCard.questReady{box-shadow:0 0 0 2px #f0c060,0 8px 22px rgba(240,192,96,.32);animation:questReadyPulse 2.4s ease-in-out infinite}
.questCard.questClaimed{opacity:.55}
.questHead{display:flex;align-items:center;gap:12px}
.questEmoji{font-size:32px;line-height:1}
.questHeadText{flex:1;display:grid;gap:2px;min-width:0}
.questTitle{font-size:16px;color:#2a1a14;font-weight:1000}
.questCategory{font-size:11px;color:#9a7c65;font-weight:700;letter-spacing:.04em}
.questClaimedBadge{font-size:11px;font-weight:900;padding:4px 10px;border-radius:99px;background:#a3c785;color:#fff}
.questDesc{margin:0;color:#4a342a;line-height:1.55;font-size:14px}
.questHint{color:#7b5318;font-style:italic;font-size:12px;line-height:1.5}
.questProgress{display:flex;align-items:center;gap:10px}
.questProgressBar{flex:1;height:8px;background:rgba(91,48,24,.12);border-radius:99px;overflow:hidden}
.questProgressBar div{height:100%;background:linear-gradient(90deg,#df842c,#e8993b);border-radius:99px;transition:width .35s ease}
.questCard.qcBladder .questProgressBar div{background:linear-gradient(90deg,#d9a656,#ffd07a)}
.questCard.qcSecret .questProgressBar div{background:linear-gradient(90deg,#6e4592,#a880c8)}
.questProgressText{font-size:12px;font-weight:900;color:#3a2017;min-width:60px;text-align:right}
.questReward{display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(223,132,44,.08);border-radius:12px}
.questReward small{font-size:11px;color:#7b4f2f;font-weight:900;letter-spacing:.04em}
.questReward span{font-size:13px;color:#3a2017;font-weight:700}
.questClaimBtn{border:0;border-radius:14px;padding:12px;background:#e0d4c5;color:#7a6957;font-weight:900;font-size:14px;cursor:not-allowed;transition:all .2s}
.questClaimBtn.questClaimReady{background:linear-gradient(135deg,#e8993b,#df842c);color:#fff;cursor:pointer;box-shadow:0 8px 18px rgba(223,132,44,.3)}
.questClaimBtn.questClaimReady:hover{transform:translateY(-1px);background:linear-gradient(135deg,#f1a850,#e58a2f)}
@keyframes questReadyPulse{0%,100%{box-shadow:0 0 0 2px #f0c060,0 8px 22px rgba(240,192,96,.32)}50%{box-shadow:0 0 0 3px #ffd47a,0 12px 28px rgba(240,192,96,.5)}}
.nav button .navBadge{display:inline-block;margin-left:6px;background:#f0c060;color:#3a2017;font-size:10px;font-weight:1000;padding:1px 6px;border-radius:99px;vertical-align:middle}
.questToast{background:linear-gradient(135deg,#3a2510,#5a3a18) !important;border-color:rgba(240,192,96,.5) !important}
.milestoneToast{background:linear-gradient(135deg,#3a1525,#5a2540) !important;border-color:rgba(255,140,180,.5) !important}
.milestoneToast b{color:#ffb0d0}
.milestoneToast span{color:#fff}
.shopToast{background:linear-gradient(135deg,#2a1f0e,#4a3818) !important;border-color:rgba(255,210,100,.5) !important}
.shopToast b{color:#ffd97a}
.shopToast span{color:#fff}
/* ─ 유저 레벨바 (사이드바) ─ */
.userLevelBar{padding:10px 12px;margin:0 0 12px;background:linear-gradient(135deg,#1f1410,#2e1f17);border:1px solid rgba(255,210,100,.22);border-radius:14px;color:#fff}
.userLvHead{display:flex;align-items:center;gap:8px;margin-bottom:7px}
.userLvBadge{font-size:13px;font-weight:1000;color:#3a2017;background:linear-gradient(135deg,#ffd97a,#e8993b);padding:3px 9px;border-radius:8px;letter-spacing:.04em}
.userLvTitle{flex:1;font-size:12px;font-weight:900;color:#ffd9a0;letter-spacing:.06em}
.coinChip{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;background:rgba(255,210,100,.12);border:1px solid rgba(255,210,100,.3);border-radius:99px;color:#ffd97a;font-size:12px;font-weight:900}
.coinChip span{font-size:13px}
.coinChip b{font-size:12px}
.userLvBar{height:6px;background:rgba(255,255,255,.1);border-radius:99px;overflow:hidden}
.userLvBarFill{height:100%;background:linear-gradient(90deg,#ffd97a,#e8993b);border-radius:99px;transition:width .5s cubic-bezier(.2,.8,.3,1);box-shadow:0 0 8px rgba(255,210,100,.5)}
.userLvExp{display:block;text-align:right;margin-top:3px;font-size:9px;color:#a09080;font-weight:700;letter-spacing:.04em}
/* ─ EXP 플로터 ─ */
.expFloater{position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:9998;color:#ffd97a;font-weight:1000;font-size:18px;text-shadow:0 0 12px rgba(255,210,100,.9),0 2px 6px rgba(0,0,0,.6);pointer-events:none;animation:expFloaterAnim 1.4s cubic-bezier(.2,.6,.3,1) forwards}
@keyframes expFloaterAnim{0%{opacity:0;transform:translate(-50%,10px) scale(.85)}20%{opacity:1;transform:translate(-50%,0) scale(1.05)}100%{opacity:0;transform:translate(-50%,-50px) scale(1)}}
/* ─ 레벨업 오버레이 ─ */
.levelUpOverlay{position:fixed;inset:0;z-index:99998;display:grid;place-items:center;pointer-events:none;animation:levelUpFadeIn .3s ease}
.levelUpRays{position:absolute;inset:-25%;background:repeating-conic-gradient(from 0deg,rgba(255,210,90,.18) 0deg 6deg,transparent 6deg 16deg);animation:levelUpSpin 4s linear infinite;mix-blend-mode:screen}
.levelUpCard{position:relative;z-index:1;display:grid;gap:10px;justify-items:center;padding:36px 56px;background:radial-gradient(ellipse at center,rgba(0,0,0,.88) 0%,rgba(0,0,0,.7) 100%);border:2px solid rgba(255,210,100,.5);border-radius:24px;box-shadow:0 0 60px rgba(255,210,100,.4),inset 0 0 30px rgba(255,210,100,.1);animation:levelUpPop .9s cubic-bezier(.2,1.4,.3,1) both}
.levelUpEyebrow{font-size:13px;font-weight:1000;letter-spacing:.5em;color:#ffd97a;text-shadow:0 0 16px rgba(255,210,100,.9)}
.levelUpLevel{margin:0;font-size:64px;font-weight:1000;color:#fff;text-shadow:0 0 24px rgba(255,210,100,1),0 0 48px rgba(255,180,60,.7),0 4px 0 rgba(120,80,20,.6);letter-spacing:.04em;animation:levelUpLevelGlow 1.6s ease-in-out infinite}
.levelUpTitle{font-size:22px;font-weight:1000;color:#ffe4a8;text-shadow:0 0 12px rgba(255,200,90,.85)}
.levelUpReward{font-size:14px;color:#ffd97a;font-weight:900;letter-spacing:.06em;margin-top:6px}
@keyframes levelUpFadeIn{0%{opacity:0;backdrop-filter:blur(12px)}100%{opacity:1;backdrop-filter:blur(0)}}
@keyframes levelUpSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes levelUpPop{0%{opacity:0;transform:scale(.5) rotate(-3deg)}50%{opacity:1;transform:scale(1.08) rotate(1deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
@keyframes levelUpLevelGlow{0%,100%{filter:brightness(1)}50%{filter:brightness(1.2)}}
.levelUpUnlock{margin-top:14px;padding:14px 16px;background:linear-gradient(135deg,rgba(255,210,100,.15),rgba(223,132,44,.15));border:1px solid rgba(255,210,100,.4);border-radius:14px;text-align:center}
.levelUpUnlockHead{font-size:16px;font-weight:1000;color:#ffd97a;margin-bottom:6px;letter-spacing:.04em}
.levelUpUnlockDesc{margin:0;font-size:12px;color:#fff;line-height:1.5}
.levelUpUnlockOneTime{display:block;margin-top:8px;padding:6px 10px;background:rgba(0,0,0,.3);border-radius:8px;font-size:11px;color:#ffd97a;font-weight:900;letter-spacing:.03em}
.userLvRewardLink{cursor:pointer;color:#ffd97a;text-decoration:underline;font-weight:1000}
.userLvRewardLink:hover{color:#fff}
/* ─ 레벨 보상 모달 ─ */
.levelRewardsOverlay{position:fixed;inset:0;z-index:99997;background:rgba(0,0,0,.88);display:grid;place-items:center;cursor:pointer;animation:gachaFadeIn .25s ease}
.levelRewardsModal{position:relative;width:min(680px,92vw);max-height:90vh;background:linear-gradient(180deg,#241814,#3a2519);border:2px solid rgba(255,210,100,.4);border-radius:24px;padding:32px 28px;cursor:default;overflow-y:auto;color:#fff;box-shadow:0 0 60px rgba(255,210,100,.3)}
.levelRewardsClose{position:absolute;top:16px;right:16px;border:0;background:transparent;color:#fff;font-size:22px;cursor:pointer;font-weight:1000;width:32px;height:32px;border-radius:50%;display:grid;place-items:center}
.levelRewardsClose:hover{background:rgba(255,255,255,.1)}
.levelRewardsTitle{margin:0 0 8px;font-size:24px;color:#ffd97a;text-align:center;text-shadow:0 0 14px rgba(255,210,100,.5)}
.levelRewardsHint{margin:0 0 18px;text-align:center;font-size:13px;color:#caa890}
.levelRewardsHint b{color:#ffd97a;font-weight:1000}
.levelRewardsList{display:grid;gap:10px}
.levelRewardCard{display:grid;grid-template-columns:60px 50px 1fr;gap:12px;align-items:center;padding:12px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,210,100,.18);border-radius:14px;transition:all .15s}
.levelRewardCard.lrReached{background:linear-gradient(135deg,rgba(255,210,100,.12),rgba(223,132,44,.08));border-color:rgba(255,210,100,.5)}
.levelRewardCard.lrLocked{opacity:.5}
.lrCardLv{font-size:16px;font-weight:1000;color:#ffd97a;text-align:center;letter-spacing:.04em;background:rgba(0,0,0,.3);padding:6px 8px;border-radius:8px}
.lrReached .lrCardLv{background:linear-gradient(135deg,#ffd97a,#e8993b);color:#3a2017}
.lrCardEmoji{font-size:32px;text-align:center}
.lrCardBody{display:grid;gap:3px;min-width:0}
.lrCardBody b{font-size:14px;color:#fff;font-weight:1000}
.lrCardBody small{font-size:12px;color:#caa890;line-height:1.5}
.lrOneTime{font-size:11px;color:#ffd97a;font-weight:900;margin-top:3px}
/* ─ 퀘스트 섹션 헤더 ─ */
.questSectionTitle{margin:24px 0 12px;font-size:18px;color:#3a2017;display:flex;align-items:center;gap:8px}
.questSectionTitle small{font-size:12px;color:#9a7c65;font-weight:700}
.questSectionTitle strong{color:#df842c}
/* ─ 데일리 미션 ─ */
.dailyGrid{display:grid;gap:10px;margin-bottom:12px}
.dailyCard{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;padding:12px 14px;background:#fff8ef;border:1px solid #e8c99e;border-radius:14px;transition:all .15s ease}
.dailyCard.dailyReady{background:linear-gradient(135deg,#fff7d6,#ffe9a8);border-color:#d9a656;box-shadow:0 4px 14px rgba(217,166,86,.25);animation:dailyReadyPulse 2.4s ease-in-out infinite}
.dailyCard.dailyClaimed{opacity:.5}
.dailyEmoji{font-size:26px}
.dailyBody{display:grid;gap:3px;min-width:0}
.dailyTitle{font-size:14px;font-weight:1000;color:#2a1a14}
.dailyDesc{font-size:11px;color:#7a5e4a}
.dailyProgress{display:flex;align-items:center;gap:8px;margin-top:4px}
.dailyBar{flex:1;height:5px;background:rgba(91,48,24,.12);border-radius:99px;overflow:hidden}
.dailyBar div{height:100%;background:linear-gradient(90deg,#df842c,#e8993b);border-radius:99px;transition:width .3s ease}
.dailyProgress span{font-size:10px;font-weight:900;color:#5a3520;min-width:38px;text-align:right}
.dailyRight{display:flex;flex-direction:column;align-items:flex-end;gap:4px}
.dailyReward{font-size:12px;font-weight:900;color:#7b5318}
.dailyClaimBtn{border:0;border-radius:10px;padding:6px 14px;background:linear-gradient(135deg,#e8993b,#df842c);color:#fff;font-weight:900;font-size:12px;cursor:pointer;box-shadow:0 4px 10px rgba(223,132,44,.3)}
.dailyClaimBtn:hover{transform:translateY(-1px)}
.dailyDoneBadge{font-size:10px;font-weight:900;padding:4px 10px;border-radius:99px;background:#a3c785;color:#fff}
.dailyTodo{font-size:10px;font-weight:700;color:#9a7c65;padding:4px 10px}
@keyframes dailyReadyPulse{0%,100%{box-shadow:0 4px 14px rgba(217,166,86,.25)}50%{box-shadow:0 6px 20px rgba(217,166,86,.5)}}
/* ─ 상점 ─ */
.shopHeader{display:flex;align-items:center;justify-content:flex-end;gap:10px;padding:14px 18px;background:linear-gradient(135deg,#3a2510,#5a3a18);border-radius:14px;color:#ffd97a;margin-bottom:8px;font-weight:900}
.shopBalance{font-size:22px;letter-spacing:.04em}
.shopHint{margin:0 0 18px;font-size:12px;color:#7a5e4a;font-style:italic}
.shopGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
.shopCard{display:grid;gap:8px;padding:18px 16px;background:#fff;border:1px solid #e6d2b8;border-radius:18px;text-align:center;position:relative;transition:transform .15s ease,box-shadow .2s ease}
.shopCard:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(91,48,24,.12)}
.shopCard.shopBoost{border-top:4px solid #df842c}
.shopCard.shopGift{border-top:4px solid #6e4592;background:linear-gradient(180deg,#faf5ff 0%,#fff 60%)}
.shopCard.shopConsumable{border-top:4px solid #6c9a5a}
.shopCard.shopCosmetic{border-top:4px solid #4a8aa8}
.shopEmoji{font-size:42px;line-height:1}
.shopName{font-size:15px;font-weight:1000;color:#2a1a14}
.shopDesc{font-size:12px;color:#5a4338;line-height:1.45;min-height:36px}
.shopOwned{font-size:10px;color:#7b5318;font-weight:700}
.shopBuyBtn{margin-top:6px;border:0;border-radius:12px;padding:10px;background:linear-gradient(135deg,#3a2510,#5a3a18);color:#ffd97a;font-weight:1000;font-size:13px;cursor:pointer;letter-spacing:.04em;transition:all .2s}
.shopBuyBtn:hover:not(:disabled){background:linear-gradient(135deg,#5a3a18,#7a5128);transform:translateY(-1px);box-shadow:0 6px 16px rgba(60,40,15,.3)}
.shopBuyBtn:disabled{background:#d9c8b5;color:#8a7a6f;cursor:not-allowed}
/* ─ 가챠 ─ */
.gachaIntro{margin:0 0 14px;padding:12px 14px;background:linear-gradient(135deg,#ffd97a,#e8993b);border-radius:12px;color:#3a2017;font-weight:900;font-size:14px;text-align:center;text-shadow:0 1px 0 rgba(255,255,255,.3)}
.gachaInfoBar{display:flex;justify-content:space-around;padding:14px;background:#2a1f10;border-radius:14px;color:#ffd97a;font-weight:900;margin-bottom:18px}
.gachaInfoBar b{color:#fff;font-size:18px;margin-left:4px}
.gachaPullBtns{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:20px}
.gachaBtn{display:grid;gap:4px;border:0;border-radius:14px;padding:18px 16px;font-weight:1000;cursor:pointer;text-align:center;transition:all .2s}
.gachaBtn:hover:not(:disabled){transform:translateY(-2px)}
.gachaBtn b{font-size:15px}
.gachaBtn small{font-size:11px;opacity:.85;font-weight:700}
.gachaBtn.gachaFree{background:linear-gradient(135deg,#a3c785,#7ba65a);color:#fff;box-shadow:0 6px 16px rgba(123,166,90,.3)}
.gachaBtn.gachaTicket{background:linear-gradient(135deg,#c685c4,#8b5a8d);color:#fff;box-shadow:0 6px 16px rgba(139,90,141,.3)}
.gachaBtn.gachaSingle{background:linear-gradient(135deg,#d9a656,#b8843a);color:#fff;box-shadow:0 6px 16px rgba(217,166,86,.3)}
.gachaBtn.gachaTen{background:linear-gradient(135deg,#df5e88,#a8334e);color:#fff;box-shadow:0 6px 16px rgba(168,51,78,.3)}
.gachaBtn.gachaDisabled{background:#ccbeb0 !important;color:#7a6957 !important;cursor:not-allowed;box-shadow:none}
.gachaSectionTitle{margin:18px 0 10px;font-size:15px;color:#3a2017}
.gachaPoolGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}
.gachaPoolTier{padding:10px 12px;border-radius:10px;background:#fff;border:1px solid #e6d2b8}
.gachaPoolTier ul{list-style:none;padding:0;margin:6px 0 0;font-size:11px;color:#5a4338}
.gachaPoolTier ul li{padding:2px 0}
.gachaTierHead{display:flex;justify-content:space-between;align-items:center;font-size:14px;font-weight:1000}
.gachaTierHead span{font-size:11px;color:#9a7c65}
.gachaTier-SSR .gachaTierHead b{color:#df5e88;text-shadow:0 0 8px rgba(223,94,136,.5)}
.gachaTier-SR .gachaTierHead b{color:#c685c4}
.gachaTier-R .gachaTierHead b{color:#d9a656}
.gachaTier-N .gachaTierHead b{color:#7ba65a}
.gachaTier-C .gachaTierHead b{color:#8a7a6f}
/* 가챠 결과 모달 */
.gachaOverlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.92);display:grid;place-items:center;cursor:pointer;animation:gachaFadeIn .3s ease}
@keyframes gachaFadeIn{0%{opacity:0;backdrop-filter:blur(20px)}100%{opacity:1}}
.gachaRolling{display:grid;justify-items:center;gap:18px;color:#ffd97a}
.gachaSpinner{width:120px;height:120px;border:6px solid rgba(255,210,100,.18);border-top-color:#ffd97a;border-radius:50%;animation:gachaSpin .8s linear infinite}
@keyframes gachaSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.gachaRolling p{font-size:18px;font-weight:1000;letter-spacing:.06em;text-shadow:0 0 16px rgba(255,210,100,.7)}
.gachaResultWrap{display:grid;gap:18px;justify-items:center;padding:28px;max-width:90vw;max-height:90vh;overflow:auto}
.gachaResultGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;width:min(720px,90vw)}
.gachaCard{position:relative;display:grid;justify-items:center;gap:6px;padding:18px 14px;border-radius:18px;text-align:center;animation:gachaCardPop .55s cubic-bezier(.2,1.4,.3,1) both}
@keyframes gachaCardPop{0%{opacity:0;transform:scale(.4) rotate(-8deg)}60%{opacity:1;transform:scale(1.08) rotate(2deg)}100%{transform:scale(1) rotate(0)}}
.gachaCard-SSR{background:linear-gradient(135deg,#ff5577 0%,#ffaa44 35%,#ffdd33 65%,#ff5577 100%);background-size:200% 200%;animation:gachaCardPop .55s cubic-bezier(.2,1.4,.3,1) both,gachaSSRBg 3s linear infinite;color:#fff;box-shadow:0 0 30px rgba(255,210,100,.7),0 0 60px rgba(223,94,136,.5)}
@keyframes gachaSSRBg{0%{background-position:0% 50%}100%{background-position:200% 50%}}
.gachaCard-SR{background:linear-gradient(135deg,#c685c4 0%,#8b5a8d 100%);color:#fff;box-shadow:0 0 18px rgba(139,90,141,.5)}
.gachaCard-R{background:linear-gradient(135deg,#d9a656 0%,#b8843a 100%);color:#fff;box-shadow:0 0 12px rgba(217,166,86,.4)}
.gachaCard-N{background:linear-gradient(135deg,#a3c785 0%,#7ba65a 100%);color:#fff}
.gachaCard-C{background:linear-gradient(135deg,#bcb0a0 0%,#8a7a6f 100%);color:#fff}
.gachaTierBadge{position:absolute;top:8px;left:10px;font-size:11px;font-weight:1000;letter-spacing:.06em;padding:2px 7px;border-radius:6px;background:rgba(0,0,0,.32);color:#fff}
.gachaCardEmoji{font-size:48px;line-height:1;filter:drop-shadow(0 4px 6px rgba(0,0,0,.25))}
.gachaCardName{font-size:14px;font-weight:1000;text-shadow:0 1px 2px rgba(0,0,0,.3)}
.gachaCardFlavor{font-size:11px;opacity:.92;line-height:1.4}
.gachaCloseBtn{border:0;border-radius:14px;padding:14px 28px;background:#ffd97a;color:#3a2017;font-weight:1000;font-size:15px;cursor:pointer;letter-spacing:.04em}
.gachaCloseBtn:hover{background:#ffe4a8}
/* ─ 콤보 카운터 ─ */
.comboCounter{position:fixed;top:90px;right:20px;z-index:9997;display:grid;justify-items:center;gap:0;padding:8px 18px;background:linear-gradient(135deg,#ff5577,#ff8844);border-radius:14px;color:#fff;font-weight:1000;box-shadow:0 6px 20px rgba(255,90,80,.45);animation:comboPulse 1.6s ease-in-out infinite,comboPunch .25s ease-out;pointer-events:none}
.comboCounter.comboBreak{animation:comboBreak .8s ease forwards}
.comboLabel{font-size:9px;letter-spacing:.18em;opacity:.92}
.comboNum{font-size:30px;line-height:1;text-shadow:0 0 12px rgba(255,255,255,.65),0 2px 0 rgba(120,30,40,.4)}
@keyframes comboPulse{0%,100%{box-shadow:0 6px 20px rgba(255,90,80,.45)}50%{box-shadow:0 8px 26px rgba(255,90,80,.7)}}
@keyframes comboPunch{0%{transform:scale(1.4)}100%{transform:scale(1)}}
@keyframes comboBreak{0%{transform:scale(1) rotate(0);opacity:1}30%{transform:scale(1.2) rotate(-8deg);background:#999}100%{transform:scale(0.6) rotate(20deg) translateY(40px);opacity:0}}
.comboToast{background:linear-gradient(135deg,#3a1015,#5a2025) !important;border-color:rgba(255,90,80,.5) !important}
.comboToast b{color:#ff8888;font-size:14px}
.petToast{background:linear-gradient(135deg,#1a3025,#2a4a3a) !important;border-color:rgba(140,220,160,.5) !important}
.petToast b{color:#a8eac0}
.petToast small{color:#9bc8a5}
/* ─ 펫 시스템 ─ */
.petMini{display:flex;align-items:center;gap:9px;padding:9px 11px;margin:0 0 12px;background:linear-gradient(135deg,#1a2a1a,#243d24);border:1px solid rgba(140,220,160,.22);border-radius:14px;color:#a8eac0;cursor:pointer;transition:transform .15s ease,box-shadow .2s ease}
.petMini:hover{transform:translateY(-1px);box-shadow:0 6px 14px rgba(40,80,50,.4)}
.petMiniEmoji{font-size:26px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))}
.petMiniBody{display:grid;gap:1px;min-width:0;flex:1}
.petMiniBody b{font-size:12px;color:#fff;font-weight:1000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.petMiniBody small{font-size:10px;color:#a8eac0;font-weight:700}
.petsIntro{margin:0 0 14px;padding:12px 14px;background:#fff8ef;border:1px solid #e8c99e;border-radius:12px;color:#5a3d12;font-weight:700;font-size:13px}
.petsGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}
.petCard{padding:18px 16px;background:#fff;border:1px solid #e6d2b8;border-radius:18px;display:grid;gap:8px;justify-items:center;text-align:center;position:relative;transition:transform .15s ease,box-shadow .2s ease}
.petCard:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(91,48,24,.12)}
.petCard.petLocked{background:repeating-linear-gradient(135deg,#f5ede0 0px,#f5ede0 12px,#ebe1d0 12px,#ebe1d0 24px);opacity:.7}
.petCard.petOwned{border-left:4px solid #7ba65a}
.petCard.petActive{border:2px solid #4a8a5e;background:linear-gradient(180deg,#f4fcf6 0%,#fff 60%);box-shadow:0 0 0 3px rgba(74,138,94,.18),0 8px 22px rgba(74,138,94,.18)}
.petCard.petEvolved{background:linear-gradient(180deg,#fff7e8 0%,#fff 60%);border-left-color:#df842c}
.petCard.petActive.petEvolved{border-color:#df842c;box-shadow:0 0 0 3px rgba(223,132,44,.2),0 8px 22px rgba(223,132,44,.22)}
.petEmoji{font-size:54px;line-height:1;filter:drop-shadow(0 4px 8px rgba(0,0,0,.18))}
.petLockedEmoji{opacity:.4}
.petArtFrame{position:relative;width:100%;aspect-ratio:1/1;display:grid;place-items:center;background:radial-gradient(circle at center,#fff8ef 0%,#f0e2cc 100%);border-radius:14px;overflow:hidden;border:1px solid #e8d2b6}
.petArt{width:100%;height:100%;object-fit:cover;filter:drop-shadow(0 4px 10px rgba(0,0,0,.18))}
.petCard.petActive .petArtFrame{background:radial-gradient(circle at center,#f4fcf6 0%,#d5ebd9 100%);border-color:#7ba65a}
.petCard.petEvolved .petArtFrame{background:radial-gradient(circle at center,#fff7d6 0%,#ffd97a 100%);border-color:#df842c;animation:petEvolvedFloat 2.6s ease-in-out infinite}
.petMiniImg{width:30px;height:30px;border-radius:8px;object-fit:cover;background:rgba(255,255,255,.1);flex:none}
.petCard.petEvolved .petEmoji{animation:petEvolvedFloat 2.6s ease-in-out infinite}
@keyframes petEvolvedFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
.petName{font-size:15px;font-weight:1000;color:#2a1a14}
.petFlavor{font-size:11px;color:#7a5e4a;font-style:italic;line-height:1.4;min-height:30px}
.petEffect{font-size:12px;color:#3a2017;font-weight:900;padding:6px 10px;background:rgba(123,166,90,.14);border-radius:10px}
.petLvLine{display:flex;justify-content:space-between;width:100%;align-items:center}
.petLvBadge{font-size:11px;font-weight:1000;color:#3a2017;background:linear-gradient(135deg,#a3c785,#7ba65a);padding:2px 8px;border-radius:6px}
.petAff{font-size:11px;color:#7a5e4a;font-weight:700}
.petAffBar{width:100%;height:5px;background:rgba(91,48,24,.12);border-radius:99px;overflow:hidden}
.petAffBar div{height:100%;background:linear-gradient(90deg,#ff8aa3,#ff5577);border-radius:99px;transition:width .35s ease}
.petActions{display:grid;grid-template-columns:1fr 1fr;gap:5px;width:100%;margin-top:5px}
.petActiveBtn{grid-column:1/3;border:0;border-radius:10px;padding:9px;background:#3a2d29;color:#fff;font-weight:1000;font-size:12px;cursor:pointer}
.petActiveBtn.petIsActive{background:linear-gradient(135deg,#4a8a5e,#3a6a48)}
.petActiveBtn:hover{transform:translateY(-1px)}
.petFeedBtn,.petFeedBigBtn{border:0;border-radius:8px;padding:7px 5px;background:#fff5d6;color:#5a3d12;font-weight:900;font-size:10px;cursor:pointer;border:1px solid #d9a656}
.petFeedBigBtn{background:linear-gradient(135deg,#ffd97a,#e8993b);color:#fff}
.petFeedBtn:disabled,.petFeedBigBtn:disabled{opacity:.4;cursor:not-allowed}
.petFusionBox{margin-top:18px;padding:16px;background:linear-gradient(135deg,#f0e6ff,#e0d0ff);border:2px dashed #9b6fdb;border-radius:16px;display:grid;gap:10px}
.petFusionTitle{margin:0;font-size:16px;font-weight:1000;color:#4a2d8a}
.petFusionDesc{margin:0;font-size:12px;color:#5a3d8a;font-weight:700}
.petFusionSlots{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.petFusionSelect{flex:1;min-width:140px;padding:10px;border:2px solid #b89ce6;border-radius:10px;background:#fff;font-size:13px;font-weight:700;color:#3a2017;cursor:pointer}
.petFusionPlus{font-size:24px;font-weight:1000;color:#9b6fdb}
.petFusionBtn{border:0;border-radius:12px;padding:12px;background:linear-gradient(135deg,#b884ff,#7b4ad8);color:#fff;font-weight:1000;font-size:14px;cursor:pointer;box-shadow:0 4px 12px rgba(123,74,216,.3)}
.petFusionBtn:disabled{opacity:.4;cursor:not-allowed}
.petFusionBtn:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(123,74,216,.45)}
.petFusionResult{padding:10px 14px;background:#fff;border-radius:10px;font-size:13px;font-weight:900;color:#4a2d8a;text-align:center;border:1px solid #b89ce6}
/* ─ 미니게임 가위바위보 ─ */
.mgRpsBtns{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}
.mgRpsBtn{padding:18px 6px;border:2px solid #d9a656;border-radius:14px;background:#fff8ef;font-size:32px;cursor:pointer;font-weight:1000;transition:transform .15s ease}
.mgRpsBtn:hover{transform:translateY(-2px);background:#ffe9a8}
.mgRpsBtn:disabled{opacity:.4;cursor:not-allowed}
.mgRpsScore{display:flex;justify-content:space-around;padding:12px;background:#fff5d6;border-radius:12px;font-weight:1000;font-size:14px;color:#5a3d12;margin-bottom:10px}
.mgRpsResult{padding:14px;background:linear-gradient(135deg,#ffd97a,#e8993b);border-radius:12px;color:#fff;font-weight:1000;font-size:15px;text-align:center;margin:10px 0}
/* ─ 미니게임 퀴즈 ─ */
.mgQuizCard{padding:16px;background:#fff;border:2px solid #d9a656;border-radius:14px;margin-bottom:12px}
.mgQuizQ{font-size:15px;font-weight:1000;color:#3a2017;margin:0 0 12px}
.mgQuizOptions{display:grid;gap:8px}
.mgQuizOption{padding:12px;border:1px solid #e6d2b8;border-radius:10px;background:#fff8ef;font-weight:900;font-size:13px;color:#3a2017;cursor:pointer;text-align:left}
.mgQuizOption:hover:not(:disabled){background:#ffe9a8}
.mgQuizOption.mgQuizCorrect{background:#a3c785;color:#fff;border-color:#7ba65a}
.mgQuizOption.mgQuizWrong{background:#f5a3a3;color:#fff;border-color:#d56666}
.mgQuizOption:disabled{cursor:not-allowed}
.mgQuizExplain{padding:10px;background:#fff5d6;border-radius:8px;font-size:12px;color:#5a3d12;font-weight:700;margin-top:10px}
/* ─ 시즌 패스 ─ */
.seasonHead{display:flex;justify-content:space-between;align-items:center;padding:14px;background:linear-gradient(135deg,#3a2d29,#5a4036);border-radius:14px;color:#fff;margin-bottom:14px;flex-wrap:wrap;gap:10px}
.seasonHead h3{margin:0;font-size:16px;font-weight:1000}
.seasonPremiumBuy{border:0;border-radius:10px;padding:10px 16px;background:linear-gradient(135deg,#ffd97a,#df842c);color:#fff;font-weight:1000;font-size:13px;cursor:pointer}
.seasonPremiumBuy:disabled{opacity:.5;cursor:not-allowed}
.seasonPremiumActive{padding:8px 14px;background:linear-gradient(135deg,#ffd97a,#df842c);color:#fff;border-radius:10px;font-weight:1000;font-size:12px}
.seasonTrack{display:grid;gap:6px;max-height:600px;overflow-y:auto;padding:8px;background:#f8efe2;border-radius:12px}
.seasonRow{display:grid;grid-template-columns:50px 1fr 1fr;gap:8px;align-items:center;padding:8px;background:#fff;border-radius:10px;border:1px solid #e6d2b8}
.seasonRowMile{background:linear-gradient(135deg,#fff7d6,#ffd97a);border-color:#df842c}
.seasonLv{font-size:14px;font-weight:1000;color:#3a2017;text-align:center}
.seasonBox,.seasonPremiumBox{padding:8px;border-radius:8px;background:#f8efe2;display:flex;flex-direction:column;gap:4px;font-size:11px;font-weight:700}
.seasonPremiumBox{background:linear-gradient(135deg,#fff7d6,#ffe9a8);border:1px dashed #df842c}
.seasonRewards{font-size:11px;color:#5a3d12;font-weight:900}
.seasonClaimBtn{border:0;border-radius:6px;padding:5px 8px;background:#7ba65a;color:#fff;font-weight:1000;font-size:10px;cursor:pointer;margin-top:2px}
.seasonClaimBtn:disabled{opacity:.4;cursor:not-allowed;background:#aaa}
.seasonClaimedTag{font-size:10px;color:#7ba65a;font-weight:1000;text-align:center}
.seasonLockedTag{font-size:10px;color:#999;font-weight:700;text-align:center}
/* ─ 음향 ─ */
.soundCard{padding:16px;background:#fff;border:1px solid #e6d2b8;border-radius:14px;margin-bottom:12px;display:grid;gap:10px}
.soundCardTitle{margin:0;font-size:15px;font-weight:1000;color:#3a2017}
.soundToggle{display:flex;justify-content:space-between;align-items:center;padding:10px;background:#fff8ef;border-radius:10px;font-weight:900;font-size:13px;color:#3a2017}
.soundToggle button{border:0;border-radius:8px;padding:8px 16px;background:#3a2d29;color:#fff;font-weight:1000;font-size:12px;cursor:pointer}
.soundToggle button.soundOn{background:linear-gradient(135deg,#7ba65a,#4a8a5e)}
.soundVolumeRow{display:flex;align-items:center;gap:10px;padding:8px}
.soundVolumeRow label{flex:none;font-size:12px;font-weight:900;color:#5a3d12;min-width:60px}
.soundVolumeRow input{flex:1}
.soundVolumeRow span{flex:none;min-width:36px;text-align:right;font-size:12px;font-weight:1000;color:#3a2017}
.soundFiles{margin-top:14px;padding:10px;background:#fff5d6;border-radius:10px;font-size:11px;color:#5a3d12}
.soundFiles summary{cursor:pointer;font-weight:1000;font-size:13px;padding:4px}
.soundFiles ul{margin:8px 0 0;padding-left:20px}
.soundFiles code{background:#fff;padding:1px 6px;border-radius:4px;font-size:11px}
/* ─ 모험 ─ */
.advIntro{margin:0 0 14px;padding:12px 14px;background:linear-gradient(135deg,#a3c785,#7ba65a);border-radius:12px;color:#fff;font-weight:900;font-size:14px;text-align:center}
.advActive{margin:0 0 18px;padding:16px 18px;background:linear-gradient(135deg,#f4f9d8,#e8e9b8);border:2px solid #b3c54a;border-radius:16px;display:grid;gap:10px}
.advActive.advReady{background:linear-gradient(135deg,#fff7d6,#ffe9a8);border-color:#df842c;animation:advReadyPulse 1.6s ease-in-out infinite;box-shadow:0 0 22px rgba(217,166,86,.4)}
@keyframes advReadyPulse{0%,100%{box-shadow:0 0 22px rgba(217,166,86,.4)}50%{box-shadow:0 0 36px rgba(217,166,86,.7)}}
.advActiveHead{display:flex;align-items:center;gap:12px}
.advActiveEmoji{font-size:38px}
.advActiveHead b{display:block;font-size:16px;color:#2a1a14;font-weight:1000}
.advActiveHead small{display:block;font-size:11px;color:#6b5b50}
.advTimer{font-size:18px;font-weight:1000;color:#3a2017;text-align:center;padding:10px;background:rgba(255,255,255,.5);border-radius:10px}
.advReadyText{color:#df842c;text-shadow:0 0 8px rgba(255,210,100,.6)}
.advActiveBtns{display:flex;gap:8px;justify-content:flex-end}
.advCollectBtn{flex:1;border:0;border-radius:12px;padding:12px;background:linear-gradient(135deg,#df842c,#a85020);color:#fff;font-weight:1000;font-size:15px;cursor:pointer;box-shadow:0 6px 16px rgba(217,132,44,.4)}
.advCollectBtn:hover{transform:translateY(-1px)}
.advCancelBtn{border:0;border-radius:12px;padding:8px 16px;background:#d9c8b5;color:#7a6957;font-weight:700;font-size:12px;cursor:pointer}
.advSectionTitle{margin:14px 0 10px;font-size:16px;color:#3a2017}
.advGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.advCard{display:grid;gap:8px;padding:14px 16px;background:#fff;border:1px solid #e6d2b8;border-radius:14px}
.advCardHead{display:flex;align-items:center;gap:10px}
.advEmoji{font-size:30px}
.advCardHeadText b{display:block;font-size:14px;color:#2a1a14;font-weight:1000}
.advCardHeadText small{display:block;font-size:11px;color:#7a5e4a;font-style:italic}
.advDuration{font-size:12px;color:#5a3520;font-weight:700;padding:4px 9px;background:rgba(91,48,24,.08);border-radius:99px;width:fit-content}
.advRewards{font-size:11px;color:#3a2017;font-weight:700;line-height:1.6}
.advCompleted{font-size:10px;color:#7b5318;font-weight:900}
.advStartBtn{border:0;border-radius:10px;padding:9px;background:#3a2d29;color:#fff;font-weight:900;font-size:13px;cursor:pointer;margin-top:4px}
.advStartBtn:disabled{background:#d9c8b5;color:#7a6957;cursor:not-allowed}
.advStartBtn:hover:not(:disabled){background:#5a4338}
/* ─ SNS ─ */
.snsHeader{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px;background:linear-gradient(135deg,#fff5fa,#fce0ec);border:1px solid #e8c9d8;border-radius:14px;margin-bottom:12px}
.snsProfile{display:flex;align-items:center;gap:12px}
.snsAvatar{width:54px;height:54px;border-radius:50%;background:#fff;border:3px solid #e89bb8;overflow:hidden;flex:none}
.snsAvatar img{width:100%;height:100%;object-fit:cover}
.snsProfile b{display:block;font-size:14px;color:#7b3a52;font-weight:1000}
.snsProfile small{display:block;font-size:11px;color:#9a6b80}
.snsRefreshBtn{border:0;border-radius:10px;padding:8px 14px;background:#7b3a52;color:#fff;font-weight:900;font-size:12px;cursor:pointer}
.snsRefreshBtn:hover{background:#9a4a6a}
.snsHint{margin:0 0 14px;padding:10px;font-size:11px;color:#7a5e4a;background:#fff8ef;border-radius:10px;text-align:center;font-style:italic}
.snsFeed{display:grid;gap:12px}
.snsPost{padding:14px 16px;background:#fff;border:1px solid #e6d2b8;border-radius:14px;display:grid;gap:8px;transition:transform .15s,box-shadow .2s}
.snsPost:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(91,48,24,.08)}
.snsCat-workout{border-left:4px solid #e8993b}
.snsCat-food{border-left:4px solid #d6651e}
.snsCat-selfie{border-left:4px solid #8b5a8d}
.snsCat-daily{border-left:4px solid #7ba65a}
.snsCat-love{border-left:4px solid #df5e88;background:linear-gradient(180deg,#fff5fa 0%,#fff 60%)}
.snsCat-obsession{border-left:4px solid #5a2530;background:linear-gradient(180deg,#2a151a 0%,#3a1f25 100%);color:#f4dadd}
.snsCat-obsession .snsPostText{color:#f4dadd}
.snsCat-obsession .snsPostTime{color:#a8888b}
.snsCat-obsession .snsCategory{color:#e88a9a}
.snsCat-bladder{border-left:4px solid #d9a656;background:linear-gradient(180deg,#fff7d6 0%,#fff 60%)}
.snsPostHead{display:flex;align-items:center;justify-content:space-between}
.snsPostEmoji{font-size:24px}
.snsPostTime{font-size:11px;color:#9a7c65;font-weight:700}
.snsPostText{margin:0;font-size:14px;color:#3a2017;line-height:1.55;white-space:pre-line}
.snsPostActions{display:flex;align-items:center;justify-content:space-between;padding-top:8px;border-top:1px solid rgba(91,48,24,.08)}
.snsLikeBtn{border:0;background:transparent;font-size:14px;font-weight:900;color:#5a3520;cursor:pointer;padding:4px 8px;border-radius:8px;transition:transform .12s}
.snsLikeBtn:hover{transform:scale(1.1)}
.snsLikeBtn.snsLiked{color:#df5e88}
.snsCategory{font-size:11px;color:#9a7c65;font-style:italic}
/* ─ 레이드 ─ */
.raidIntro{margin:0 0 14px;padding:12px 14px;background:linear-gradient(135deg,#5a2530,#7a3540);border-radius:12px;color:#fff;font-weight:700;font-size:13px;text-align:center}
.raidBossCard{padding:20px 22px;background:linear-gradient(180deg,#3a1525 0%,#1a0a12 100%);border:2px solid rgba(255,90,80,.45);border-radius:18px;color:#fff;display:grid;gap:14px}
.raidBossCard.raidCleared{background:linear-gradient(180deg,#2a3a25 0%,#1a2515 100%);border-color:rgba(140,220,160,.5)}
.raidBossHead{display:flex;align-items:center;gap:14px}
.raidBossEmoji{font-size:46px;filter:drop-shadow(0 0 12px rgba(255,90,80,.5))}
.raidBossHead b{display:block;font-size:20px;color:#ffaab2;font-weight:1000}
.raidBossHead small{display:block;font-size:12px;color:#caa8ad;margin-top:2px}
.raidTaunt{margin:0;padding:12px;background:rgba(0,0,0,.3);border-left:3px solid #ff6677;font-style:italic;font-size:13px;color:#ffd0d6;line-height:1.5;border-radius:6px}
.raidWinText{margin:0;padding:12px;background:rgba(140,220,160,.16);border-left:3px solid #7ba65a;font-weight:1000;color:#a8eac0;font-size:14px;border-radius:6px;text-align:center}
.raidHpRow{display:flex;align-items:center;gap:10px;font-size:12px;font-weight:900;color:#ffd0d6}
.raidHpBar{flex:1;height:14px;background:rgba(255,255,255,.1);border-radius:99px;overflow:hidden;border:1px solid rgba(255,90,80,.3)}
.raidHpBar div{height:100%;background:linear-gradient(90deg,#ff5577,#ff8844);border-radius:99px;transition:width .4s ease;box-shadow:0 0 8px rgba(255,90,80,.6)}
.raidHpRow strong{font-size:13px;color:#fff}
.raidStats{font-size:13px;color:#caa8ad}
.raidStats b{color:#ffd97a;font-weight:1000}
.raidRewardTitle{margin:8px 0 0;font-size:14px;color:#ffd97a}
.raidRewards{font-size:13px;color:#fff;font-weight:700;padding:10px;background:rgba(255,210,100,.1);border-radius:8px}
.raidDmgFloater{position:fixed;top:50%;right:24px;z-index:9998;color:#ff5577;font-weight:1000;font-size:28px;text-shadow:0 0 14px rgba(255,90,80,.9),0 2px 4px rgba(0,0,0,.6);pointer-events:none;animation:raidDmgAnim 1s cubic-bezier(.2,.6,.3,1) forwards}
@keyframes raidDmgAnim{0%{opacity:0;transform:translateY(20px) scale(.7)}30%{opacity:1;transform:translateY(0) scale(1.15)}100%{opacity:0;transform:translateY(-50px) scale(1)}}
/* ─ 신탁 ─ */
.fortuneIntro{margin:0 0 14px;padding:10px 14px;background:#fff8ef;border:1px solid #e8c99e;border-radius:10px;font-size:12px;color:#7a5e4a;text-align:center;font-style:italic}
.fortuneCard{padding:32px 28px;border-radius:24px;text-align:center;display:grid;gap:14px;justify-items:center;color:#fff;position:relative;overflow:hidden;animation:fortuneCardIn .6s cubic-bezier(.2,1.2,.3,1) both}
@keyframes fortuneCardIn{0%{opacity:0;transform:scale(.85) rotate(-2deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
.fortuneTier-great_luck{background:linear-gradient(135deg,#ffd97a 0%,#e8993b 50%,#df5e88 100%);box-shadow:0 0 40px rgba(255,210,100,.5)}
.fortuneTier-luck{background:linear-gradient(135deg,#a3c785,#7ba65a)}
.fortuneTier-neutral{background:linear-gradient(135deg,#bcb0a0,#8a7a6f)}
.fortuneTier-unluck{background:linear-gradient(135deg,#7a4a4a,#5a2a2a)}
.fortuneTier-great_unluck{background:linear-gradient(135deg,#3a1525,#1a0510);border:2px solid rgba(255,80,80,.4)}
.fortuneTier{font-size:14px;font-weight:1000;letter-spacing:.18em;opacity:.92;text-transform:uppercase}
.fortuneEmoji{font-size:72px;line-height:1;filter:drop-shadow(0 4px 12px rgba(0,0,0,.4))}
.fortuneTitle{margin:0;font-size:36px;font-weight:1000;text-shadow:0 2px 8px rgba(0,0,0,.4);letter-spacing:.04em}
.fortuneMessage{margin:0;font-size:14px;font-style:italic;line-height:1.65;max-width:480px;text-shadow:0 1px 3px rgba(0,0,0,.4)}
.fortuneEffect{padding:10px 16px;background:rgba(0,0,0,.32);border-radius:12px;font-size:13px;font-weight:900}
.fortuneEffect b{color:#ffd97a}
.fortuneActions{margin-top:18px;display:flex;justify-content:center}
.fortuneRerollBtn{border:0;border-radius:14px;padding:12px 22px;background:linear-gradient(135deg,#3a2510,#5a3a18);color:#ffd97a;font-weight:1000;font-size:14px;cursor:pointer}
.fortuneRerollBtn:disabled{opacity:.5;cursor:not-allowed}
.fortuneRerollBtn:hover:not(:disabled){background:linear-gradient(135deg,#5a3a18,#7a5128)}
/* ─ 다이어리 ─ */
.journalIntro{margin:0 0 8px;padding:12px 14px;background:linear-gradient(135deg,#fff5fa,#fce0ec);border:1px solid #e8c9d8;border-radius:12px;color:#7b3a52;font-size:13px;font-weight:700;text-align:center}
.journalCount{margin:0 0 14px;text-align:right;font-size:12px;color:#9a7c65}
.journalCount b{color:#df842c;font-weight:1000}
.journalEmpty{padding:40px;text-align:center;color:#9a7c65;font-style:italic}
.journalList{display:grid;gap:12px}
.journalCard{padding:18px 22px;background:#fffcf6;border:1px solid #e8c99e;border-radius:14px;border-left:4px solid #df5e88;transition:transform .15s,box-shadow .2s}
.journalCard:hover{transform:translateY(-1px);box-shadow:0 8px 22px rgba(91,48,24,.1)}
.journalCard.journalLiked{background:linear-gradient(180deg,#fff5fa 0%,#fff 60%);border-left-color:#df842c}
.journalDate{font-size:12px;color:#9a7c65;font-weight:900;letter-spacing:.04em;margin-bottom:8px}
.journalText{margin:0 0 10px;font-size:14px;color:#3a2017;line-height:1.7;white-space:pre-line;font-family:"Gowun Dodum","Malgun Gothic",sans-serif}
.journalActions{display:flex;justify-content:flex-end}
.journalLikeBtn{border:0;border-radius:10px;padding:7px 14px;background:#fff;color:#df5e88;font-weight:900;font-size:12px;cursor:pointer;border:1px solid #df5e88;transition:all .15s}
.journalLikeBtn:hover{background:#fff0f6}
.journalLikeBtn.jLiked{background:#df5e88;color:#fff;cursor:default}
/* ─ 미니게임 허브 ─ */
.mgIntro{margin:0 0 16px;padding:12px 14px;background:linear-gradient(135deg,#a3c785,#7ba65a);border-radius:12px;color:#fff;font-weight:900;text-align:center}
.mgGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
.mgCard{display:grid;gap:8px;padding:24px 18px;background:#fff;border:2px solid #e6d2b8;border-radius:18px;text-align:center;cursor:pointer;transition:all .2s}
.mgCard:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(91,48,24,.16)}
.mgClicker{border-color:#d6651e}
.mgWord{border-color:#7ba65a}
.mgCardEmoji{font-size:54px;line-height:1}
.mgCard b{font-size:16px;color:#2a1a14;font-weight:1000}
.mgCard small{font-size:12px;color:#7a5e4a;line-height:1.5}
.mgHigh{font-size:11px;color:#df842c;font-weight:1000;padding:4px 10px;background:rgba(223,132,44,.12);border-radius:99px}
/* 클리커 게임 */
.mgClickerHeader{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px;background:#fff8ef;border-radius:12px;margin-bottom:14px;flex-wrap:wrap}
.mgBackBtn,.mgRetryBtn{border:0;border-radius:8px;padding:8px 14px;background:#3a2d29;color:#fff;font-weight:900;font-size:12px;cursor:pointer}
.mgScore{font-size:16px;font-weight:1000;color:#3a2017}
.mgStartBtn{border:0;border-radius:10px;padding:10px 20px;background:linear-gradient(135deg,#df842c,#a85020);color:#fff;font-weight:1000;font-size:14px;cursor:pointer}
.mgEndPanel{display:flex;align-items:center;gap:8px;font-weight:900;color:#3a2017}
.mgEndPanel button{border:0;border-radius:8px;padding:6px 12px;background:#df842c;color:#fff;cursor:pointer;font-weight:900}
.mgClickerStage{position:relative;width:100%;height:500px;background:linear-gradient(180deg,#fff8ef,#f4e7d8);border:2px dashed #d9a656;border-radius:18px;overflow:hidden}
.mgPoop{position:absolute;border:0;background:transparent;font-size:36px;line-height:1;cursor:pointer;transform:translate(-50%,-50%);transition:transform .1s;padding:6px;filter:drop-shadow(0 4px 6px rgba(0,0,0,.2))}
.mgPoop:hover{transform:translate(-50%,-50%) scale(1.2)}
.mgPoop:active{transform:translate(-50%,-50%) scale(.85)}
.mgClickerHint{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#7a5e4a;font-style:italic;font-size:14px}
/* 끝말잇기 */
.mgWordHistory{padding:14px;background:#fff8ef;border-radius:12px;max-height:360px;overflow-y:auto;display:grid;gap:8px;margin-bottom:14px;border:1px solid #e8c99e}
.mgWordRow{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px}
.mgRowTteokjon{background:#fff;justify-content:flex-start}
.mgRowUser{background:#df842c;color:#fff;justify-content:flex-end}
.mgWordSpeaker{font-size:11px;font-weight:900;opacity:.85}
.mgWordText{font-size:14px;font-weight:900}
.mgWordInputRow{display:flex;gap:8px}
.mgWordInput{flex:1;border:2px solid #d9a656;border-radius:12px;padding:12px 16px;font-size:15px;background:#fff8ef}
.mgWordInput:focus{outline:none;border-color:#df842c;background:#fff}
.mgWordInputRow button{border:0;border-radius:12px;padding:12px 18px;background:#df842c;color:#fff;font-weight:1000;cursor:pointer}
.mgWordInputRow button:hover{background:#c8731f}
.mgGiveUpBtn{background:#a85020 !important}
.mgResultBanner{padding:18px;border-radius:14px;text-align:center;font-weight:1000;color:#fff;display:flex;justify-content:center;align-items:center;gap:14px;flex-wrap:wrap}
.mgResultBanner button{border:0;border-radius:8px;padding:8px 14px;background:rgba(255,255,255,.25);color:#fff;font-weight:900;cursor:pointer}
.mgResultBanner.mgWin{background:linear-gradient(135deg,#a3c785,#7ba65a)}
.mgResultBanner.mgLose{background:linear-gradient(135deg,#7a4a4a,#5a2a2a)}
/* ─ 카톡 ─ */
.katalkIntro{margin:0 0 14px;padding:11px 14px;background:#fff8ef;border:1px solid #e8c99e;border-radius:10px;color:#7a5e4a;font-size:13px;text-align:center;font-style:italic}
.katalkList{display:grid;gap:8px}
.katalkRow{display:flex;align-items:center;gap:14px;padding:14px 16px;background:#fff;border:1px solid #e6d2b8;border-radius:14px;cursor:pointer;text-align:left;transition:all .15s;border:0;width:100%}
.katalkRow:hover{background:#fff8ef;transform:translateX(2px)}
.katalkRow.katalkGroup{background:linear-gradient(135deg,#fff7d6,#ffe9a8);border:1px solid #d9a656}
.katalkEmoji{font-size:34px;flex:none}
.katalkRowBody{flex:1;display:grid;gap:2px;min-width:0}
.katalkRowBody b{font-size:14px;color:#2a1a14;font-weight:1000}
.katalkAge{font-size:11px;color:#9a7c65;font-weight:700;margin-left:4px}
.katalkRowBody small{font-size:12px;color:#7a5e4a;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.katalkRowFlavor{font-style:italic;color:#9a7c65 !important;font-size:11px !important;margin-top:2px}
.katalkUnread{background:#df5e88;color:#fff;font-size:11px;font-weight:1000;padding:3px 8px;border-radius:99px;flex:none}
.katalkChat{display:grid;gap:12px}
.katalkBackBtn{align-self:flex-start;border:0;border-radius:10px;padding:8px 14px;background:#3a2d29;color:#fff;font-weight:900;font-size:12px;cursor:pointer}
.katalkMsgList{display:grid;gap:10px;max-height:520px;overflow-y:auto;padding:14px;background:#fff8ef;border-radius:14px;border:1px solid #e8c99e}
.katalkEmpty{text-align:center;color:#9a7c65;font-style:italic;padding:30px}
.katalkMsg{display:grid;gap:3px}
.katalkMsg.katalkUser{justify-items:flex-end}
.katalkMsg.katalkMe{justify-items:flex-start}
.katalkMsgSpeaker{font-size:11px;color:#7a5e4a;font-weight:900;padding:0 8px}
.katalkMsgBubble{display:inline-block;max-width:80%;padding:10px 14px;border-radius:16px;background:#fff;color:#3a2017;font-size:14px;line-height:1.55;word-break:break-word;box-shadow:0 2px 6px rgba(0,0,0,.06)}
.katalkUser .katalkMsgBubble{background:#df842c;color:#fff}
.katalkMe .katalkMsgBubble{background:#7a5e4a;color:#fff}
.katalkInputRow{display:flex;gap:8px}
.katalkInputRow input{flex:1;border:2px solid #d9a656;border-radius:12px;padding:11px 14px;font-size:14px;background:#fff8ef}
.katalkInputRow input:focus{outline:none;border-color:#df842c;background:#fff}
.katalkInputRow button{border:0;border-radius:12px;padding:11px 18px;background:#df842c;color:#fff;font-weight:1000;cursor:pointer}
.katalkInputRow button:hover{background:#c8731f}
.katalkActions{display:flex;justify-content:center}
.katalkActions button{border:0;border-radius:10px;padding:8px 16px;background:#fff8ef;color:#5a3520;font-weight:900;font-size:12px;cursor:pointer;border:1px solid #d9a656}
.katalkActions button:hover{background:#fff5d6}
/* ─ 러브 미터 (사이드바) ─ */
.loveMeter{padding:9px 11px;margin:0 0 12px;background:linear-gradient(135deg,#3a1525,#5a2540);border:1px solid rgba(255,140,180,.25);border-radius:14px;color:#fff}
.loveMeterHead{display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:900;color:#ffb0d0;margin-bottom:5px}
.loveMeterHead strong{color:#fff;font-size:12px}
.loveMeterBar{height:5px;background:rgba(255,255,255,.12);border-radius:99px;overflow:hidden}
.loveMeterBar div{height:100%;background:linear-gradient(90deg,#ff5577,#ff8aa3);border-radius:99px;transition:width .4s ease;box-shadow:0 0 8px rgba(255,90,120,.6)}
.loveMeterClaimBtn{margin-top:6px;width:100%;border:0;border-radius:8px;padding:6px;background:linear-gradient(135deg,#ff5577,#df5e88);color:#fff;font-weight:1000;font-size:11px;cursor:pointer;animation:loveClaimPulse 1.6s ease-in-out infinite}
@keyframes loveClaimPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,90,120,.6)}50%{box-shadow:0 0 0 6px rgba(255,90,120,0)}}
.loveMeterDone{display:block;margin-top:5px;text-align:center;font-size:10px;color:#a8d4b0}
/* ─ 30일 캘린더 ─ */
.cal30Intro{margin:0 0 14px;padding:10px 14px;background:#fff8ef;border:1px solid #e8c99e;border-radius:10px;color:#7a5e4a;font-size:12px;text-align:center;font-style:italic}
.cal30Grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:18px}
.cal30Cell{aspect-ratio:1/1;display:grid;place-items:center;background:#fff;border:1px solid #e6d2b8;border-radius:8px;font-size:11px;color:#9a7c65;font-weight:900;position:relative;text-align:center}
.cal30Cell.cal30Reached{background:linear-gradient(135deg,#ffd97a,#e8993b);color:#3a2017}
.cal30Cell.cal30Milestone{border:2px solid #df842c}
.cal30Day{font-size:11px}
.cal30Emoji{position:absolute;bottom:2px;right:2px;font-size:13px}
.cal30Check{position:absolute;font-size:14px;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.3)}
.cal30Section{margin:14px 0 8px;font-size:14px;color:#3a2017}
.cal30Rewards{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}
.cal30Reward{padding:14px;background:#fff;border:1px solid #e6d2b8;border-radius:14px;text-align:center;display:grid;gap:6px}
.cal30Reward.cal30RewardReady{background:linear-gradient(135deg,#fff7d6,#ffe9a8);border-color:#df842c;animation:advReadyPulse 2s ease-in-out infinite}
.cal30Reward.cal30RewardClaimed{opacity:.5}
.cal30RewardEmoji{font-size:30px}
.cal30Reward b{font-size:13px;color:#2a1a14}
.cal30Reward small{font-size:11px;color:#5a3520}
.cal30Reward button{border:0;border-radius:8px;padding:8px;background:#df842c;color:#fff;font-weight:900;font-size:12px;cursor:pointer}
.cal30Reward button:disabled{background:#d9c8b5;color:#7a6957;cursor:not-allowed}
/* ─ 통합 도감 ─ */
.codexMaster{padding:24px;background:linear-gradient(135deg,#3a2510,#5a3a18);border-radius:18px;color:#fff;margin-bottom:18px;text-align:center}
.codexMasterTitle{font-size:13px;color:#ffd97a;font-weight:1000;letter-spacing:.18em;text-transform:uppercase}
.codexMasterPct{font-size:54px;font-weight:1000;color:#ffd97a;text-shadow:0 0 24px rgba(255,210,100,.6);margin:8px 0}
.codexMasterBar{height:10px;background:rgba(255,255,255,.1);border-radius:99px;overflow:hidden;margin:6px auto;max-width:400px}
.codexMasterBar div{height:100%;background:linear-gradient(90deg,#ffd97a,#df5e88);border-radius:99px;transition:width .5s}
.codexMaster small{display:block;color:#caa890;margin-top:8px}
.codexGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}
.codexCard{padding:14px;background:#fff;border:1px solid #e6d2b8;border-radius:14px;display:grid;gap:6px;text-align:center}
.codexCardEmoji{font-size:32px}
.codexCard b{font-size:13px;color:#2a1a14}
.codexCardBar{height:5px;background:rgba(91,48,24,.12);border-radius:99px;overflow:hidden}
.codexCardBar div{height:100%;background:linear-gradient(90deg,#df842c,#e8993b);border-radius:99px}
.codexCard small{font-size:11px;color:#7a5e4a}
.codexMasterReward{margin-top:18px;padding:18px;background:linear-gradient(135deg,#df5e88,#e8993b);border-radius:14px;color:#fff;font-weight:1000;text-align:center;font-size:16px}
/* ─ 명함 / 통계 ─ */
.profileCard{padding:24px;background:linear-gradient(135deg,#fff5fa,#fce0ec);border:2px solid #e89bb8;border-radius:18px;margin-bottom:18px;color:#2a1a14}
.profileCardHead{display:flex;align-items:center;gap:14px;margin-bottom:14px}
.profileCardAvatar{width:70px;height:70px;border-radius:50%;border:3px solid #e89bb8;background:#fff;overflow:hidden;flex:none}
.profileCardAvatar img{width:100%;height:100%;object-fit:cover}
.profileCardHead h3{margin:0;font-size:18px;color:#7b3a52}
.profileCardHead p{margin:0;font-size:13px;color:#9a6b80;font-weight:700}
.profileCardStats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:8px}
.profileCardStats div{padding:10px;background:rgba(255,255,255,.6);border-radius:10px;text-align:center}
.profileCardStats b{display:block;font-size:11px;color:#7b3a52;font-weight:900}
.profileCardStats span{display:block;font-size:16px;color:#2a1a14;font-weight:1000;margin-top:3px}
.profileCardFooter{display:block;text-align:right;font-size:11px;color:#9a6b80;font-style:italic;margin-top:6px}
.statsSection{margin:18px 0 10px;font-size:15px;color:#3a2017}
.tteokjonStats{background:#fff;border:1px solid #e6d2b8;border-radius:14px;padding:8px 0;overflow:hidden}
.ttsRow{display:flex;justify-content:space-between;align-items:center;padding:10px 18px;border-bottom:1px solid rgba(91,48,24,.06)}
.ttsRow:last-child{border-bottom:0}
.ttsRow span{font-size:13px;color:#5a3520}
.ttsRow b{font-size:14px;color:#df842c;font-weight:1000}
.statsHint{margin:14px 0 0;text-align:center;font-style:italic;color:#9a7c65;font-size:12px}
/* ─ 편지함 ─ */
.lettersIntro{margin:0 0 14px;padding:10px 14px;background:#fff8ef;border:1px solid #e8c99e;border-radius:10px;color:#7a5e4a;font-size:12px;text-align:center;font-style:italic}
.lettersList{display:grid;gap:14px}
.letterCard{padding:20px 24px;background:#fffaf3;border:1px solid #e8c99e;border-radius:14px;box-shadow:0 4px 12px rgba(91,48,24,.06)}
.letterCard.letterLocked{opacity:.5;background:repeating-linear-gradient(135deg,#f5ede0 0px,#f5ede0 8px,#ebe1d0 8px,#ebe1d0 16px);text-align:center;font-style:italic;color:#7a5e4a}
.letterCard.letterUnread{border-color:#df842c;box-shadow:0 6px 18px rgba(223,132,44,.18)}
.letterLockedBody{padding:20px}
.letterHead{display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap}
.letterChip{font-size:11px;font-weight:900;padding:4px 10px;background:rgba(223,132,44,.15);color:#7b4f2f;border-radius:99px}
.letterHead b{font-size:15px;color:#2a1a14}
.letterNew{font-size:10px;font-weight:1000;padding:3px 8px;background:#df842c;color:#fff;border-radius:99px;letter-spacing:.04em}
.letterContent{margin:0;font-size:14px;color:#3a2017;line-height:1.85;white-space:pre-line;font-family:"Gowun Dodum","Malgun Gothic",sans-serif;cursor:pointer}
/* ─ 명언 ─ */
.quoteIntro{margin:0 0 14px;padding:10px 14px;background:#fff5fa;border:1px solid #e89bb8;border-radius:10px;color:#7b3a52;font-size:12px;text-align:center}
.quoteCard{padding:36px 28px;background:linear-gradient(135deg,#fff5fa,#fce0ec);border:2px solid #df5e88;border-radius:20px;text-align:center;display:grid;gap:14px;justify-items:center;margin-bottom:18px;box-shadow:0 8px 24px rgba(223,94,136,.12)}
.quoteEmoji{font-size:54px}
.quoteText{margin:0;font-size:18px;color:#2a1a14;font-style:italic;line-height:1.7;max-width:520px}
.quoteCard small{color:#9a6b80;font-weight:900}
.quoteCollectBtn{border:0;border-radius:14px;padding:12px 22px;background:linear-gradient(135deg,#df5e88,#a8334e);color:#fff;font-weight:1000;font-size:13px;cursor:pointer}
.quoteCollectBtn:disabled{background:#d9c8b5;color:#7a6957;cursor:not-allowed}
.quoteSection{margin:14px 0 10px;font-size:14px;color:#3a2017}
.quoteCollection{display:grid;gap:10px}
.quoteSavedItem{display:flex;gap:12px;padding:12px 14px;background:#fff;border:1px solid #e6d2b8;border-radius:10px;align-items:center}
.quoteSavedItem span{font-size:24px}
.quoteSavedItem p{margin:0;font-size:13px;color:#3a2017;font-style:italic;line-height:1.55}
.quoteEmpty{text-align:center;color:#9a7c65;font-style:italic;padding:30px}
/* ─ 트레이딩 카드 ─ */
.cardIntro{margin:0 0 14px;padding:11px 14px;background:linear-gradient(135deg,#5a2530,#7a3540);border-radius:12px;color:#fff;font-size:13px;text-align:center;font-weight:700}
.cardActions{display:flex;gap:10px;align-items:center;margin-bottom:18px;flex-wrap:wrap}
.cardPullBtn{border:0;border-radius:12px;padding:14px 20px;font-weight:1000;font-size:13px;cursor:pointer}
.cardPullBtn.cardSingle{background:linear-gradient(135deg,#3a2510,#5a3a18);color:#ffd97a}
.cardPullBtn.cardTicket{background:linear-gradient(135deg,#c685c4,#8b5a8d);color:#fff}
.cardPullBtn:disabled{background:#d9c8b5;color:#7a6957;cursor:not-allowed}
.cardPullCount{font-size:12px;color:#7a5e4a;font-weight:900}
.cardSection{margin:18px 0 10px;font-size:14px;color:#3a2017}
.cardGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px}
.tcCard{padding:14px 10px;border-radius:14px;text-align:center;display:grid;gap:6px;justify-items:center;position:relative;color:#fff}
.tcCard.tcLocked{background:repeating-linear-gradient(135deg,#3a2519 0px,#3a2519 8px,#241510 8px,#241510 16px);opacity:.7;border:1px solid #5a3a18}
.tcCard.tcLocked b,.tcCard.tcLocked small{color:#7a6957}
.tcCard.tcRarity-R.tcOwned{background:linear-gradient(135deg,#a3c785,#7ba65a)}
.tcCard.tcRarity-SR.tcOwned{background:linear-gradient(135deg,#c685c4,#8b5a8d)}
.tcCard.tcRarity-SSR.tcOwned{background:linear-gradient(135deg,#ff5577,#ffaa44 50%,#ffdd33);background-size:200% 200%;animation:gachaSSRBg 3s linear infinite;box-shadow:0 0 22px rgba(255,210,100,.6)}
.tcRarityBadge{position:absolute;top:6px;left:6px;font-size:10px;font-weight:1000;padding:2px 6px;background:rgba(0,0,0,.3);border-radius:6px;color:#fff;letter-spacing:.06em}
.tcEmoji{font-size:38px}
.tcCard b{font-size:12px;font-weight:1000}
.tcCard small{font-size:10px;line-height:1.4;opacity:.92}
.tcLevel{position:absolute;top:6px;right:6px;font-size:10px;font-weight:1000;padding:2px 6px;background:#ffd97a;color:#3a2017;border-radius:6px}
.cardPullOverlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.92);display:grid;place-items:center;cursor:pointer;animation:gachaFadeIn .3s ease}
.cardPullReveal{display:grid;gap:14px;justify-items:center;padding:36px 30px;border-radius:24px;color:#fff;text-align:center;animation:gachaCardPop .55s cubic-bezier(.2,1.4,.3,1) both;max-width:90vw}
.cardPullReveal h2{margin:0;font-size:24px;font-weight:1000}
.cardPullReveal p{margin:0;font-size:14px;font-style:italic;opacity:.9}
.cardPullReveal button{margin-top:12px;border:0;border-radius:12px;padding:12px 28px;background:#fff;color:#3a2017;font-weight:1000;cursor:pointer}
.cardPullEmoji{font-size:80px;line-height:1;filter:drop-shadow(0 4px 8px rgba(0,0,0,.3))}
.secretRouteCard{position:relative;overflow:hidden;transition:transform .15s ease,box-shadow .2s ease}.secretRouteCard.secretUnlocked{background:linear-gradient(135deg,#fff7d6 0%,#ffe9a8 60%,#ffd17a 100%);border:1px solid #d9a656;color:#5a3d12;box-shadow:0 8px 24px rgba(217,166,86,.28)}.secretRouteCard.secretUnlocked:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(217,166,86,.4)}.secretRouteCard.secretUnlocked b{color:#3a2510}.secretRouteCard.secretUnlocked small{color:#7b5318}.secretRouteCard.secretLocked{background:repeating-linear-gradient(135deg,#2a201b 0px,#2a201b 14px,#22191a 14px,#22191a 28px);color:#7a6b62;border:1px dashed #5a4a40;cursor:not-allowed;opacity:.85}.secretRouteCard.secretLocked b{color:#8a7a6f;letter-spacing:.18em}.secretRouteCard.secretLocked small{color:#6b5b50;font-style:italic}.secretRouteCard.secretLocked:hover{transform:none;box-shadow:none}
.saveSlotGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;margin-bottom:18px}.saveSlotCard{background:#fff8ef;border:1px solid #e8c99e;border-radius:18px;padding:16px;display:grid;gap:12px;color:#3a2017;box-shadow:0 8px 22px rgba(91,48,24,.08);transition:transform .15s ease,box-shadow .2s ease}.saveSlotCard:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(91,48,24,.14)}.saveSlotCard.ssEmpty{background:#f6efe5;border-style:dashed;border-color:#cdb89a;opacity:.85}.saveSlotCard.ssRoutePure{background:linear-gradient(180deg,#fff5f8 0%,#fce6ee 100%);border-color:#ecc4d6}.saveSlotCard.ssRouteObsession{background:linear-gradient(180deg,#2a1517 0%,#1a0d0e 100%);border-color:#5d2a30;color:#f4dadd}.saveSlotCard.ssRouteObsession .ssTime,.saveSlotCard.ssRouteObsession .ssPreview{color:#b89a9d}.saveSlotCard.ssRouteObsession .ssStats span{background:rgba(255,200,200,.08);color:#f4dadd}.saveSlotCard.ssRouteObsession .ssThumb{border-color:rgba(255,170,170,.2)}.ssHead{display:flex;align-items:center;justify-content:space-between;gap:8px}.ssNum{font-size:14px;font-weight:1000;letter-spacing:.04em;color:inherit}.ssRouteBadge{font-size:11px;font-weight:900;padding:4px 10px;border-radius:99px;background:rgba(91,48,24,.12);color:#7b4f2f}.ssRoutePure .ssRouteBadge{background:rgba(220,120,160,.18);color:#a14872}.ssRouteObsession .ssRouteBadge{background:rgba(220,80,80,.22);color:#ffaab2}.ssBody{display:grid;grid-template-columns:84px 1fr;gap:14px;align-items:start}.ssThumb{width:84px;height:84px;border-radius:14px;object-fit:cover;border:1px solid rgba(91,48,24,.18);background:#ead7c7}.ssMeta{display:grid;gap:6px;min-width:0}.ssScene{margin:0;font-size:14px;font-weight:900;color:inherit;line-height:1.4}.ssPreview{margin:0;font-size:12px;font-style:italic;color:#7a5e4a;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.ssStats{display:flex;flex-wrap:wrap;gap:5px;margin-top:2px}.ssStats span{font-size:10.5px;font-weight:800;padding:2px 7px;border-radius:99px;background:rgba(91,48,24,.1);color:#5b3520;letter-spacing:.02em}.ssTime{color:#9a7c65;font-size:11px;font-weight:700;margin-top:2px}.ssEmptyBody{text-align:center;padding:24px 12px;color:#876953}.ssEmptyIcon{font-size:36px;display:block;margin-bottom:8px;opacity:.6}.ssEmptyBody p{margin:0 0 4px;font-size:14px;font-weight:900}.ssEmptyBody small{font-size:11px;color:#a78a72}.ssActions{display:flex;gap:6px}.ssActions button{flex:1;border:0;border-radius:12px;padding:10px 8px;font-size:13px;font-weight:900;cursor:pointer;transition:background .15s ease,transform .12s ease}.ssActions button:hover{transform:translateY(-1px)}.ssBtnLoad{background:#df842c;color:#fff}.ssBtnLoad:hover{background:#c8731f}.ssBtnSave{background:#3a2d29;color:#fff}.ssBtnSave:hover{background:#5a4338}.ssBtnDel{background:transparent;color:#c44;border:1px solid #c44 !important}.ssBtnDel:hover{background:rgba(196,68,68,.1)}
.cgReaction{display:grid;grid-template-columns:86px minmax(0,1fr) auto;gap:14px;align-items:center;margin:0 0 18px;padding:14px;border-radius:20px;background:#fff8ef;border:1px solid #e8c99e;box-shadow:0 12px 32px rgba(91,48,24,.08)}.cgReaction>img{width:86px;height:86px;border-radius:18px;object-fit:cover;background:#ead7c7}.cgReactionBody{display:grid;gap:6px;min-width:0}.cgReactionBody p{margin:0;color:#4a342a;line-height:1.65;font-weight:800}.cgSourceCaption{color:#9a7c65;font-size:12px;font-weight:700}.cgReactionActions{display:flex;gap:6px;align-items:center}.cgReaction button{border:0;border-radius:999px;background:#3a2d29;color:white;padding:10px 14px;font-weight:900}.favBtn{background:#fff;color:#c44}.favBtn.favOn{background:#c44;color:#fff}.cgCard{position:relative;border:0;text-align:center;cursor:pointer;transition:transform .15s ease,box-shadow .2s ease}.cgCard:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(91,48,24,.14)}.cgCardLocked{cursor:default;background:#1f1714}.cgCardLocked:hover{transform:none}.cgSilhouette{filter:brightness(.18) blur(6px) saturate(.5)}.cgLockedBadge{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:32px;color:rgba(255,210,150,.55);text-shadow:0 2px 12px rgba(0,0,0,.6);pointer-events:none}.cgFavMark{position:absolute;top:8px;right:10px;font-size:18px;color:#ff5577;text-shadow:0 2px 6px rgba(0,0,0,.45);pointer-events:none}.cgCardCaption{position:absolute;left:0;right:0;bottom:0;padding:6px 10px;background:linear-gradient(180deg,transparent 0%,rgba(0,0,0,.74) 100%);color:#fff7e8;font-size:11px;font-weight:800;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;text-align:left}.galleryProgress{display:flex;align-items:center;gap:12px;margin:0 0 18px;padding:12px 16px;background:#fff8ef;border:1px solid #e8c99e;border-radius:14px;color:#5a3928}.galleryProgress span{font-size:12px;font-weight:900;letter-spacing:.06em;color:#7b4f2f}.galleryProgressBar{flex:1;min-width:80px;height:8px;background:rgba(91,48,24,.15);border-radius:99px;overflow:hidden}.galleryProgressBar div{height:100%;background:linear-gradient(90deg,#df842c,#e8993b);border-radius:99px;transition:width .35s ease}.galleryProgress strong{font-size:14px;color:#3a2017;font-weight:900}.tabs button.active{background:#df842c}.tabs button.bladderTab{background:linear-gradient(135deg,#d9a656,#b8843a);color:#fff;font-weight:1000}.tabs button.bladderTab.active{background:linear-gradient(135deg,#ffc94f,#d9a656);box-shadow:0 4px 12px rgba(217,166,86,.4)}.tabs button.bladderTab:hover{background:linear-gradient(135deg,#e8b563,#c89540)}
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
.wardrobePreview.kBladderPreview{background:linear-gradient(135deg,#fff7d0 0%,#ffd95c 60%,#ffb340 100%) !important;position:relative}
.wardrobePreview.kBladderPreview::after{content:"🚽";position:absolute;top:8px;right:10px;font-size:22px;filter:drop-shadow(0 2px 4px rgba(120,80,20,.5))}
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
/* ─ 방광 진입 시네마틱 ─ */
.bladderEntryCinematic{position:fixed;inset:0;z-index:999999;background:#0a0507;display:grid;place-items:center;cursor:pointer;overflow:hidden;animation:bladderCinFadeIn .6s ease forwards}
.bladderEntryBg{position:absolute;inset:0;background:radial-gradient(ellipse at center,#3a1a20 0%,#1a0a10 45%,#000 100%);opacity:.95}
.bladderEntryRipple{position:absolute;left:50%;top:50%;width:200px;height:200px;border:2px solid rgba(255,210,90,.45);border-radius:50%;transform:translate(-50%,-50%);animation:bladderRippleOut 2.4s ease-out infinite}
.bladderEntryRipple2{animation-delay:.8s;border-color:rgba(255,150,80,.32)}
.bladderEntryRipple3{animation-delay:1.6s;border-color:rgba(255,90,90,.25)}
.bladderCinText{position:relative;z-index:1;text-align:center;pointer-events:none;display:grid;gap:18px;justify-items:center;padding:38px 56px;animation:bladderTextIn 1.4s .3s ease both}
.bladderCinEyebrow{font-size:11px;font-weight:700;letter-spacing:.5em;color:#ffd28c;text-transform:uppercase;text-shadow:0 0 14px rgba(255,200,80,.7),0 0 26px rgba(255,150,50,.5)}
.bladderCinTitle{margin:0;font-size:clamp(36px,7vw,72px);font-weight:1000;letter-spacing:.18em;color:#fff;text-shadow:0 0 18px rgba(255,200,90,1),0 0 38px rgba(255,150,40,.85),0 0 60px rgba(255,90,30,.6),0 3px 0 rgba(120,40,20,.6),0 6px 14px rgba(60,20,10,.5);display:inline-flex;align-items:center;gap:.4em;line-height:1.2}
.bladderEmoji{font-size:.85em;animation:bladderEmojiBounce 1.4s ease-in-out infinite}
.bladderCinSub{font-size:14px;font-weight:600;letter-spacing:.32em;color:#ffe4a8;text-shadow:0 0 12px rgba(255,180,90,.85),0 2px 3px rgba(80,30,10,.6)}
.bladderCinSkip{position:absolute;bottom:28px;right:28px;z-index:2;border:1px solid rgba(255,210,140,.4);background:rgba(40,20,15,.5);color:#ffd9a0;padding:9px 18px;border-radius:999px;font-size:11px;letter-spacing:.14em;cursor:pointer;backdrop-filter:blur(8px)}
.bladderCinSkip:hover{background:rgba(255,210,140,.18);color:#fff}
@keyframes bladderCinFadeIn{0%{opacity:0;backdrop-filter:blur(20px)}100%{opacity:1;backdrop-filter:blur(0)}}
@keyframes bladderRippleOut{0%{width:50px;height:50px;opacity:1}100%{width:1400px;height:1400px;opacity:0}}
@keyframes bladderTextIn{0%{opacity:0;transform:translateY(28px) scale(.9)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes bladderEmojiBounce{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-12px) rotate(5deg)}}
/* ─ 방광 인챈트 시네마틱 ─ */
.bladderEnchantCinematic{position:fixed;inset:0;z-index:999999;background:#000;display:grid;place-items:center;cursor:pointer;overflow:hidden;animation:bladderCinFadeIn .8s ease forwards}
.bladderEnchantBg{position:absolute;inset:0;background:radial-gradient(circle at center,#fff8d0 0%,#ffd95c 18%,#ff8c3a 38%,#5a2080 65%,#0d0420 100%);opacity:.92;animation:bladderEnchantPulse 4s ease-in-out infinite}
.bladderEnchantRainbow{position:absolute;inset:-25%;background:conic-gradient(from 0deg,#ff5577,#ff9944,#ffdd33,#66dd55,#33aaff,#7755ff,#ff5577);opacity:.32;mix-blend-mode:screen;animation:bladderEnchantSpin 16s linear infinite;filter:blur(40px)}
.bladderEnchantRays{position:absolute;inset:0;background:repeating-conic-gradient(from 0deg,rgba(255,255,200,.15) 0deg 4deg,transparent 4deg 12deg);animation:bladderEnchantSpin 24s linear infinite reverse;mix-blend-mode:screen;pointer-events:none}
.bladderEnchantSparkle{position:absolute;width:8px;height:8px;background:radial-gradient(circle,#fff 0%,#fff7c0 40%,transparent 75%);border-radius:50%;animation:bladderSparkleTwinkle 2.4s ease-in-out infinite;box-shadow:0 0 16px 3px rgba(255,240,180,.7);pointer-events:none}
.bladderEnchantText{position:relative;z-index:2;text-align:center;pointer-events:none;display:grid;gap:6px;justify-items:center;padding:32px 48px}
.bladderEnchantEyebrow{font-size:13px;font-weight:900;letter-spacing:.55em;color:#fff;text-transform:uppercase;text-shadow:0 0 18px rgba(255,220,120,1),0 0 36px rgba(255,180,60,.8);animation:bladderTextIn 1s .2s ease both;margin-bottom:10px}
.bladderEnchantStage1,.bladderEnchantStage2,.bladderEnchantStage3{margin:0;font-weight:1000;color:#fff;line-height:1.15}
.bladderEnchantStage1{font-size:clamp(22px,3.5vw,38px);text-shadow:0 0 14px rgba(180,180,200,.9),0 3px 0 rgba(60,40,80,.6);animation:bladderStageIn 1s 1s ease both;letter-spacing:.16em}
.bladderEnchantStage2{font-size:clamp(28px,4.5vw,52px);text-shadow:0 0 18px rgba(255,200,120,1),0 0 32px rgba(255,150,60,.7),0 3px 0 rgba(120,60,30,.6);animation:bladderStageIn 1s 2s ease both;letter-spacing:.16em}
.bladderEnchantStage3{font-size:clamp(38px,6.5vw,80px);text-shadow:0 0 24px rgba(110,200,255,1),0 0 48px rgba(60,150,255,.85),0 0 80px rgba(255,255,255,.6),0 4px 0 rgba(20,60,120,.55);animation:bladderStageIn 1.2s 3s ease both, bladderFinalGlow 2.4s 4s ease-in-out infinite;letter-spacing:.18em}
.bladderEnchantArrow{margin:0;font-size:32px;color:#ffd97a;text-shadow:0 0 14px rgba(255,200,80,.85);animation:bladderArrowFade .6s ease both}
.bladderEnchantArrow:nth-of-type(2){animation-delay:1.6s}
.bladderEnchantArrow:nth-of-type(4){animation-delay:2.6s}
.bladderEnchantSub{font-size:15px;font-weight:700;letter-spacing:.22em;color:#fff5d0;text-shadow:0 0 14px rgba(255,200,90,.9),0 2px 4px rgba(60,30,10,.6);margin-top:18px;animation:bladderTextIn 1.2s 4.5s ease both}
@keyframes bladderEnchantPulse{0%,100%{opacity:.92}50%{opacity:1}}
@keyframes bladderEnchantSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes bladderSparkleTwinkle{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:1;transform:scale(1.4)}}
@keyframes bladderStageIn{0%{opacity:0;transform:translateY(20px) scale(.85)}55%{opacity:1;transform:translateY(-3px) scale(1.05)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes bladderArrowFade{0%{opacity:0}100%{opacity:1}}
@keyframes bladderFinalGlow{0%,100%{transform:scale(1);filter:brightness(1)}50%{transform:scale(1.04);filter:brightness(1.18)}}
/* ─ 화면 흔들기 ─ */
.app.screenShake{animation:screenShakeAnim .48s cubic-bezier(.36,.07,.19,.97) both}
@keyframes screenShakeAnim{0%,100%{transform:translate(0,0) rotate(0deg)}8%{transform:translate(-6px,-4px) rotate(-.4deg)}18%{transform:translate(6px,4px) rotate(.4deg)}28%{transform:translate(-5px,3px) rotate(-.3deg)}38%{transform:translate(5px,-4px) rotate(.3deg)}48%{transform:translate(-3px,4px) rotate(-.2deg)}58%{transform:translate(3px,-3px) rotate(.2deg)}72%{transform:translate(-2px,2px) rotate(-.1deg)}84%{transform:translate(2px,-2px) rotate(.1deg)}}
/* ─ 뷰 전환 페이드 ─ */
.panel{animation:panelFadeIn .42s cubic-bezier(.2,.8,.3,1) both}
@keyframes panelFadeIn{0%{opacity:0;transform:translateY(18px) scale(.985);filter:blur(4px)}55%{opacity:1;filter:blur(0)}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}
.panel h2{animation:panelTitleSlide .55s .12s cubic-bezier(.2,.8,.3,1) both}
@keyframes panelTitleSlide{0%{opacity:0;transform:translateX(-14px)}100%{opacity:1;transform:translateX(0)}}
.homeView{animation:viewFadeIn .42s cubic-bezier(.2,.8,.3,1) both}
@keyframes viewFadeIn{0%{opacity:0;transform:scale(.99)}100%{opacity:1;transform:scale(1)}}
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





