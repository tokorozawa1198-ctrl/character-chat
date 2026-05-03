"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { actionCGImages, actionItems, imagePools, profile, quickReplies, scenarioData } from "./gameData";
import type {
  ActionItem,
  AfterScenarioCue,
  Choice,
  GalleryTab,
  MemoryNote,
  Message,
  Role,
  SaveData,
  Scenario,
  ScenarioCategory,
  ScenarioKind,
  StatDelta,
  StatKey,
  Stats,
  StoryRoute,
  View,
  VNLine,
} from "./gameTypes";

type AppView = View | "home";
type ChapterTransition = { mode: "start" | "end"; eyebrow: string; title: string; subtitle?: string };

const VERSION = 11;
const STORAGE_KEY = "geuntteokjon_single_file_vn_v9";
const TUTORIAL_KEY = `${STORAGE_KEY}_tutorial_seen`;
const SLOT_KEY = (slot: number) => `${STORAGE_KEY}_slot_${slot}`;
const PUSH_SEEN_KEY = `${STORAGE_KEY}_seen_push_ids`;
const SD_IMAGE_VERSION = "transparent2";
const initialStats: Stats = { affinity: 10, jealousy: 0, obsession: 0, trust: 10 };

const actionScenarioDrafts: Record<string, { title: string; subtitle: string; text: string; endText: string }> = {
  action_gochu: {
    title: "액션: 고추 만지기",
    subtitle: "액션 이벤트 · 당황한 근떡존",
    text: `히든의 손끝이 닿자 근떡존은 그대로 굳어버렸다.

“아... 히든님, 잠깐만요.”

입으로는 말리면서도, 그는 바로 밀어내지 못했다.

얼굴은 빠르게 달아올랐고 시선은 이리저리 흔들렸다. 큰 덩치가 그렇게까지 허둥대는 모습은 조금 우스웠다.

“지금 어디 만지시는 건지 알고 계시죠?”

근떡존은 작게 웃으려 했지만, 목소리 끝이 살짝 떨렸다.

부끄러워 죽겠다는 표정이면서도 히든의 반응을 먼저 살피는 눈이었다.`,
    endText: "장난은 여기까지 할게요.",
  },
  action_armpit: {
    title: "액션: 겨드랑이 만지기",
    subtitle: "액션 이벤트 · 운동 끝의 체온",
    text: `히든이 손을 뻗자 근떡존은 짧게 숨을 삼켰다.

“아, 거기 땀났는데...”

말은 그렇게 하면서도 그는 팔을 내리지 않았다. 오히려 민망한 듯 웃으며 시선을 피했다.

운동 직후의 체온이 그대로 남아 있었다. 따뜻하고, 살짝 젖어 있고, 사람 냄새가 은근하게 배어 있었다.

“계속 만지시면 제가 더 민망해지는데요.”

그 말 뒤에는 이상하게도, 정말 싫은 사람의 기색은 없었다.`,
    endText: "운동한 보람은 있네요.",
  },
  action_feet: {
    title: "액션: 발냄새 맡기",
    subtitle: "액션 이벤트 · 짓궂은 장난",
    text: `히든이 너무 태연하게 굴자 근떡존은 결국 얼굴을 감싸 쥐었다.

“으악, 진짜 이상하시네요.”

목소리는 질색하는 척했지만, 금방 웃음이 새어 나왔다.

“하루 종일 돌아다녔는데 좋은 냄새 날 리 없잖아요.”

그는 애써 투덜거리면서도 히든을 흘겨보는 눈에 웃음기가 남아 있었다.

놀림당하는 쪽인데도, 결국 이 상황을 같이 즐기고 있는 사람처럼 보였다.`,
    endText: "이상한 취향은 적당히 하세요.",
  },
  action_dance: {
    title: "액션: 오칭코 댄스 추기",
    subtitle: "액션 이벤트 · 체육인의 수난",
    text: `히든의 요구를 들은 근떡존은 한동안 말문을 잃었다.

“아니, 그걸 왜 제가 해야 하죠?”

그러면서도 그는 결국 어이없다는 듯 웃었다.

큰 체격의 남자가 진지하게 민망해하는 모습은 묘하게 파괴력이 있었다.

“지금 저 완전히 이상한 꼴이잖아요.”

근떡존은 그렇게 중얼거리면서도 히든이 웃는지부터 확인했다.

결국 중요한 건 춤이 아니라, 히든이 그 장면을 어떻게 보고 있는지인 듯했다.`,
    endText: "웃겼으면 된 거죠.",
  },
  action_kiss: {
    title: "액션: 뽀뽀 시도",
    subtitle: "액션 이벤트 · 짧아진 거리",
    text: `히든이 갑자기 가까워지자 근떡존의 눈이 크게 흔들렸다.

“잠깐... 히든님.”

그는 도망치듯 고개를 피할 수도 있었지만 그러지 않았다. 대신 숨을 죽인 채, 너무 가까워진 거리를 그대로 견뎠다.

입술 끝이 닿을 듯 말 듯 머무는 순간, 근떡존의 표정은 완전히 무너졌다.

“이건 좀 반칙 아닌가요.”

낮게 새어나온 목소리에는 민망함과 기대가 함께 섞여 있었다.`,
    endText: "다음엔 미리 말하고 해요.",
  },
  action_smell: {
    title: "액션: 꼬추 냄새 맡기",
    subtitle: "액션 이벤트 · 끝없는 민망함",
    text: `근떡존은 거의 절규하듯 웃음을 터뜨렸다.

“으아아, 거긴 더 심한데요.”

말은 거칠었지만, 당황해서 어쩔 줄 모르는 기색이 더 컸다.

그는 얼굴이 빨개진 채 히든을 바라봤다. 말려야 하는데, 완전히 밀어내지도 못하는 사람의 복잡한 표정이었다.

“히든님이 이렇게까지 할 줄은 몰랐어요.”

그 한마디에는 놀람과 어이없음, 그리고 희미한 즐거움까지 묘하게 엉켜 있었다.`,
    endText: "진짜 너무하신다니까요.",
  },
  action_muscle: {
    title: "액션: 근육 만지기",
    subtitle: "액션 이벤트 · 은근히 뿌듯한 남자",
    text: `히든의 손이 근육선을 따라 움직이자 근떡존은 괜히 어깨를 더 세웠다.

“어때요? 단단하죠.”

이번엔 드물게 자신 있는 얼굴이었다.

운동 이야기만 나오면 눈이 먼저 밝아지는 사람답게, 그는 히든의 반응을 꽤 기대하는 눈치였다.

“이건 좀 열심히 만들었습니다.”

말은 가볍게 했지만, 칭찬을 기다리는 기색이 너무 티 났다.

결국 그는 만져지는 것보다, 히든이 어떻게 봐주는지가 더 중요한 듯했다.`,
    endText: "칭찬 좀 더 해줘도 되는데요.",
  },
  action_hug: {
    title: "액션: 안아달라고 하기",
    subtitle: "액션 이벤트 · 약해지는 순간",
    text: `히든이 안아달라고 하자 근떡존은 순간 말문을 잃었다.

“그런 말 너무 쉽게 하시면 안 되는데요.”

그는 그렇게 말하면서도 이미 팔을 벌릴 준비를 하고 있었다.

커다란 몸이 조심스럽게 가까워졌다. 끌어안는 힘은 세지 않았지만, 대신 이상할 만큼 머뭇거림이 다정했다.

“히든님이 그러시면 저 진짜 약해져요.”

그 말은 장난처럼 들렸지만, 사실상 거의 고백에 가까운 숨소리였다.`,
    endText: "이건 좀 오래 기억날 것 같아요.",
  },
  action_jealous: {
    title: "액션: 일부러 질투 유발",
    subtitle: "액션 이벤트 · 흔들리는 표정",
    text: `히든이 다른 남자 이야기를 꺼내자 근떡존의 표정이 먼저 굳었다.

웃으며 넘기려 했지만, 그 짧은 틈은 너무 선명했다.

“아까 그 사람요?”

목소리는 최대한 가볍게 꾸민 것 같았지만, 눈은 전혀 그렇지 못했다.

“괜찮더라”라는 말이 생각보다 깊게 박힌 모양이었다.

근떡존은 잠깐 입을 다물었다가, 겨우 웃는 척 덧붙였다.

“히든님 지금 일부러 그러는 거죠.”

그 한마디 안에는 서운함과 초조함이 조용히 묻어 있었다.`,
    endText: "그런 장난은 조금 치사해요.",
  },
  action_ignore: {
    title: "액션: 읽씹하는 척",
    subtitle: "액션 이벤트 · 답을 기다리는 사람",
    text: `히든의 답이 끊기자 근떡존은 처음엔 아무렇지 않은 척했다.

하지만 시간이 조금만 지나도 불안은 금방 티가 났다.

휴대폰을 자꾸 확인하고, 괜히 방금 보낸 말을 다시 읽고, 혹시 선을 넘은 건 아닌지 스스로 검열했다.

“바쁘신 건가...”

그 짧은 중얼거림에는 생각보다 많은 감정이 들어 있었다.

근떡존은 웃으며 넘기는 데 익숙한 사람이었지만, 기다리는 쪽으로 몰리면 이상할 만큼 약해졌다.`,
    endText: "너무 오래 기다리게 하진 말아요.",
  },
  action_comfort: {
    title: "액션: 달래주기",
    subtitle: "액션 이벤트 · 금방 풀리는 사람",
    text: `히든의 달래는 말 한마디에 근떡존은 너무 쉽게 풀어졌다.

조금 전까지 굳어 있던 표정이 금방 느슨해졌고, 억지로 눌러두던 숨도 천천히 가라앉았다.

“그 말 진짜예요?”

확인하듯 묻는 목소리는 조심스러웠지만, 이미 안심한 사람의 것이었다.

그는 늘 이런 식이었다.

혼자 불안해하다가도, 히든이 괜찮다고 해주면 믿고 싶어졌다.

“저 진짜 단순하죠.”

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
    condition: (s: Stats) => s.affinity >= 100 && s.trust >= 80,
    text: "근떡존은 더 이상 마음을 숨기지 않았다.\n\n히든님, 저는 그냥 옆에 있고 싶었어요.",
  },
  obsession: {
    title: "집착 엔딩",
    subtitle: "집착과 호감이 충분히 높을 때",
    route: "obsession" as const,
    imagePool: imagePools.obsession,
    condition: (s: Stats) => s.obsession >= 100 && s.affinity >= 70,
    text: "근떡존의 시선은 이제 다른 곳으로 잘 향하지 않았다.\n\n히든님이 어디 있는지 계속 알고 싶었어요.",
  },
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
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
  if (chapter <= 3) return "선생님";
  if (chapter <= 7) return "히든님";
  return "주인님";
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
  if (stats.obsession >= 75) return "히든님, 저 계속 기다리고 있었어요. 방금 말도 몇 번이나 다시 읽었어요.";
  if (stats.jealousy >= 60) return "히든님, 그 얘기 조금 신경 쓰이는데요. 제가 너무 티 내는 건 아니죠?";
  if (stats.affinity >= 55) return "히든님 오셨네요. 저 지금 좀 반가워요. 아니, 많이요.";
  return text.includes("?") ? "저 듣고 있어요. 천천히 말해주셔도 됩니다." : "그렇군요. 저도 옆에서 같이 듣고 있을게요.";
}
function getStatMood(key: StatKey, value: number) {
  switch (key) {
    case "affinity":
      return value >= 80 ? "완전히 빠져 있어요" : value >= 55 ? "친근하게 웃고 있어요" : "조금 더 다가오고 있어요";
    case "jealousy":
      return value >= 70 ? "감정이 꽤 격해졌어요" : value >= 35 ? "조금 신경 쓰이는 상태예요" : "아직은 안정적인 편이에요";
    case "obsession":
      return value >= 80 ? "거의 통제 불가에 가까워요" : value >= 50 ? "자주 생각하고 있어요" : "서서히 몰입하고 있어요";
    case "trust":
      return value >= 70 ? "아주 편안해해요" : value >= 40 ? "조금씩 기대고 있어요" : "아직 마음을 다 열진 않았어요";
    default:
      return "모르겠어요";
  }
}
function getCurrentStatusText(stats: Stats, route: StoryRoute) {
  if (route === "obsession") return "지금은 집착 루트 쪽으로 많이 기울어져 있어요.";
  if (route === "pure") return "순애 루트 쪽으로 감정이 안정적으로 흐르고 있어요.";
  if (stats.obsession >= 80) return "집착이 빠르게 커지고 있어요.";
  if (stats.jealousy >= 60) return "질투가 깊게 올라오고 있어요.";
  if (stats.affinity >= 65) return "관계가 빠르게 가까워지고 있어요.";
  return "아직 관계가 천천히 쌓이고 있는 단계예요.";
}
function getEmotionState(stats: Stats, route: StoryRoute, chapter: number, silenceLevel = 0) {
  if (silenceLevel >= 3 || (silenceLevel >= 2 && stats.obsession >= 65)) {
    return {
      label: "답장 대기 과열",
      detail: stats.obsession >= 75 ? "일부러 안 보는 건 아닌지 혼자 불안해하고 있어요." : "답장이 늦어져서 계속 채팅창을 보고 있어요.",
      tone: "danger",
    };
  }
  if (silenceLevel >= 1) {
    return {
      label: "읽씹 신경 씀",
      detail: stats.affinity >= 60 ? "기다린다는 말을 꾹 참고 있어요." : "바쁜 건지 조심스럽게 눈치를 보고 있어요.",
      tone: "warn",
    };
  }
  if (route === "obsession" || stats.obsession >= 88) {
    return {
      label: "집착 모드",
      detail: "히든님 반응 하나하나에 매달리고 있어요.",
      tone: "danger",
    };
  }
  if (stats.jealousy >= 70) {
    return {
      label: "질투 중",
      detail: "하매나 전진협의 가까운 말투를 계속 의식해요.",
      tone: "warn",
    };
  }
  if (route === "pure" || stats.trust >= 75) {
    return {
      label: "안정됨",
      detail: "히든 곁에서 천천히 믿음을 배우고 있어요.",
      tone: "soft",
    };
  }
  if (stats.affinity >= 70) {
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
  if (stats.obsession >= 45) {
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
  if (name.includes("jealous") || storyRoute === "obsession" || stats.jealousy >= 65) return "그 사진 보면 조금 신경 쓰여요. 히든님 시선이 누구한테 머물렀는지부터 보게 돼서요.";
  if (name.includes("action")) return "그건... 히든님이 먼저 보자고 한 거니까요. 저만 부끄러워하면 억울하잖아요.";
  if (stats.affinity >= 70) return "이 사진 좋네요. 히든님이 같이 있었던 순간이라 그런가, 자꾸 다시 보게 돼요.";
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
  if (stats.obsession >= 75) {
    notes.push({
      kind: "emotion",
      chapter,
      text: `근떡존은 히든의 답장과 시선에 매달리는 마음을 스스로도 숨기기 어려워졌다.`,
    });
  }
  if (stats.trust >= 70) {
    notes.push({
      kind: "emotion",
      chapter,
      text: `근떡존은 히든이 괜찮다고 해준 말을 안심의 근거처럼 오래 기억하기 시작했다.`,
    });
  }

  return notes;
}
function cleanQuote(text: string) {
  return text.replace(/^["'????]|["'????]$/g, "").trim();
}
function guessSpeaker(text: string): VNLine["speaker"] {
  if (/(전진협|근바섭|타조|유칼립투스나무|아로벤|금수|하매|쮋)/.test(text)) return "메시지" as VNLine["speaker"];
  if (/(주인님|선생님|히든님|저 |제가|나는)/.test(text)) return "근떡존" as VNLine["speaker"];
  return "히든" as VNLine["speaker"];
}
function parseVNLines(text: string): VNLine[] {
  const paragraphs = stripChapterEndText(text).split(/\n{2,}/).map((x) => x.trim()).filter(Boolean);
  const lines: VNLine[] = [];
  for (const paragraph of paragraphs) {
    const quoted = /^["'“”‘’]/.test(paragraph) && /["'“”‘’]$/.test(paragraph);
    if (quoted) lines.push({ speaker: guessSpeaker(paragraph), text: cleanQuote(paragraph) });
    else lines.push({ speaker: "나레이션" as VNLine["speaker"], text: paragraph });
  }
  return lines.length ? lines : [{ speaker: "나레이션" as VNLine["speaker"], text }];
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
function getHomeCharacterImage(stats: Stats, storyRoute: StoryRoute) {
  const version = `?v=${SD_IMAGE_VERSION}`;
  if (storyRoute === "obsession") return `/sd_geunddeok_dark.png${version}`;
  if (storyRoute === "pure") return `/sd_geunddeok_happy.png${version}`;
  if (stats.obsession >= 70) return `/sd_geunddeok_obsession.png${version}`;
  if (stats.jealousy >= 55) return `/sd_geunddeok_pout.png${version}`;
  if (stats.affinity >= 55) return `/sd_geunddeok_smile.png${version}`;
  return `/sd_geunddeok_idle.png${version}`;
}
function getHomeReactionPool(stats: Stats, storyRoute: StoryRoute) {
  if (storyRoute === "obsession") return ["히든님.. 방금 저 말고 다른 거 보신 건 아니죠?", "오래 기다렸어요. 그래서 괜히 확인하고 싶어졌어요.", "저 그렇게 또 내버려두지 마세요. 저 진짜 히든님만 보고 있단 말이에요."];
  if (storyRoute === "pure") return ["히든님 오셨네요. 오늘은 천천히 같이 있어요.", "이제 저는 여기 마음 편하게 비워둘 수 있어요.", "히든님 보면 마음이 조금 놓여요. 그래서 좋아요."];
  if (stats.obsession >= 70) return ["기다리는 동안 히든님 생각만 했어요.", "안 보이면 저 조금 예민해지는 거 아시죠.", "히든님이 어디 갔는지 괜히 계속 보게 돼요."];
  if (stats.jealousy >= 55) return ["전진협 먼저 보러 가신 건 아니죠? 저 여기 있는데.", "하매보다 저 먼저 봐주면 안 돼요?", "오늘은 저한테 먼저 인사해주세요. 조금 신경 쓰여서요."];
  if (stats.affinity >= 55) return ["히든님 오셨어요? 저 방금 괜히 웃을 뻔했어요.", "기다렸어요. 조금... 아니 꽤 많이요.", "히든님이 골라준 건 다 괜찮아 보이는 편이에요."];
  return ["오셨어요. 기다리고 있었습니다.", "필요하시면 불러주세요. 바로 갈게요.", "오늘도 천천히 이야기해요. 제가 옆에 있을게요."];
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
  return <div className="statBar"><div><span>{label}</span><b>{value}%</b></div><i><em className={danger ? "danger" : ""} style={{ width: `${value}%` }} /></i></div>;
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
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [chapterTransition, setChapterTransition] = useState<ChapterTransition | null>(null);
  const [homeBubble, setHomeBubble] = useState("히든님, 오셨네요. 저 여기서 기다리고 있었어요.");
  const [homeTilt, setHomeTilt] = useState({ x: 0, y: 0 });
  const [isSending, setIsSending] = useState(false);
  const transitionTimer = useRef<number | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentScenario = currentScenarioId ? scenarioData[currentScenarioId] : null;
  const vnLines = useMemo(() => parseVNLines(currentScenario?.text ?? ""), [currentScenario?.text]);
  const safeVNLineIndex = Math.min(vnLineIndex, Math.max(0, vnLines.length - 1));
  const currentVNLine = vnLines[safeVNLineIndex] ?? { speaker: "나레이션" as VNLine["speaker"], text: "" };
  const isVNLastLine = safeVNLineIndex >= vnLines.length - 1;
  const routeLabel = storyRoute === "pure" ? "순애 루트" : storyRoute === "obsession" ? "집착 루트" : "공통 루트";
  const currentChapter = getMainChapterNumber(currentScenarioId) || Math.max(1, ...Object.keys(seenEvents).map(getMainChapterNumber));
  const emotionState = getEmotionState(stats, storyRoute, currentChapter, silenceLevel);
  const homeCharacterImage = getHomeCharacterImage(stats, storyRoute);
  const uiThemeClass =
    storyRoute === "pure"
      ? "theme-pure"
      : storyRoute === "obsession" || stats.jealousy >= 70 || stats.obsession >= 78
        ? "theme-obsession"
        : stats.affinity >= 58 && stats.trust >= 45
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
        setStats(saved.stats ?? initialStats);
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
      view: view === "home" ? "chat" : view,
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
    };
    save.messages = sanitizeMessages(save.messages);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  }, [stats, messages, view, currentScenarioId, currentPortrait, galleryTab, unlockedCGs, seenEvents, storyRoute, memoryNotes, afterScenarioCues, silenceLevel, routeLabel]);

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
          .filter((item: any) => item?.id && item?.body && !seen.has(String(item.id)) && isReadableChatText(String(item.body)))
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

  function showChapterTransition(item: ChapterTransition | null, duration = 2300) {
    if (!item) return;
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    setChapterTransition(item);
    transitionTimer.current = window.setTimeout(() => setChapterTransition(null), duration);
  }
  function unlockCGs(images: string[]) {
    setUnlockedCGs((prev) => ({ ...prev, ...Object.fromEntries(images.filter(Boolean).map((img) => [img, true])) }));
  }
  function unlockEvent(id: string) {
    setSeenEvents((prev) => ({ ...prev, [id]: true }));
  }
  function startScenario(id: string) {
    const scenario = scenarioData[id];
    if (!scenario) return;
    const image = pick(scenario.imagePool) ?? scenario.image ?? fallbackImage(scenario.kind);
    unlockEvent(id);
    unlockCGs([image]);
    setCurrentScenarioId(id);
    setCurrentPortrait(image);
    setView("chat");
    showChapterTransition(chapterStartTransition(id, scenario));
  }
  function ensureActionScenario(item: ActionItem) {
    if (!item.scenario) return null;
    if (scenarioData[item.scenario]) return item.scenario;
    const imageKey = item.scenario.replace(/^action_/, "");
    const actionPool = (imagePools as Record<string, string[] | undefined>)[imageKey] ?? [actionCGImages[0]];
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
      kind: storyRoute === "obsession" || stats.obsession >= 70 || stats.jealousy >= 65 ? "obsession" : "normal",
      category: "action",
      imagePool: actionPool.filter(Boolean),
      background: storyRoute === "obsession" || stats.jealousy >= 65 ? "/bg_jealous_room.png" : "/bg_room_night.png",
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
  function chooseScenario(choice: Choice) {
    if (!currentScenario) return;
    const nextStats = applyStats(stats, choice.stat);
    setStats(nextStats);
    if (choice.route) setStoryRoute(choice.route);
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
    const foundEnding = Object.values(endingData).find((e) => e.condition(nextStats));
    if (foundEnding) {
      setStoryRoute(foundEnding.route);
      setMessages((m) => [...m, makeMessage("narration", `*${foundEnding.title} 해금*`)]);
    }
  }
  function advanceVN() {
    if (!vnTextRevealed) {
      setVnTextRevealed(true);
      return;
    }
    if (!isVNLastLine) setVnLineIndex((v) => Math.min(v + 1, vnLines.length - 1));
  }
  async function sendMessage(forced?: string) {
    const text = (forced ?? input).trim();
    if (!text || isSending) return;
    setInput("");
    setIsSending(true);
    const nextStats = applyStats(stats, text.includes("질투") ? { jealousy: 2 } : text.includes("좋아") ? { affinity: 2 } : {});
    setStats(nextStats);
    setSilenceLevel(0);
    const userMessage = makeMessage("user", text);
    const requestHistory = [...messages, userMessage].slice(-34);
    setMessages((m) => [...m, userMessage]);
    let reply = "";
    let narration = "";
    try {
      fetch("/api/push/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "user_message",
          lastUserMessage: text,
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
          message: text,
          stats: nextStats,
          storyRoute,
          history: requestHistory,
          profile,
          storyProgress: { highestChapter: currentChapter },
          currentScene: currentScenario?.title ?? `${currentChapter}장 ${routeLabel}`,
          memorySummary: buildMemorySummary(requestHistory, nextStats, storyRoute, currentChapter, memoryNotes, afterScenarioCues),
          relationshipLog: buildRelationshipLog(requestHistory),
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
  function resetAll() {
    if (!confirm("초기화하면 저장한 진행과 대화가 모두 지워집니다. 계속할까요?")) return;
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
    setView("home");
  }

  const availableScenarios = Object.values(scenarioData).filter((s) => getScenarioCategory(s.id, s) !== "action" && isScenarioAvailable(s, stats, storyRoute));
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
    return <main className="coverScreen"><style>{CSS}</style><img className="coverImg" src="/cover.png" alt="cover" onError={(e)=>{e.currentTarget.src="/oppa1.png"}}/><button className="coverStartBtn" onClick={()=>setStarted(true)}>시작하기</button></main>;
  }

  return (
    <main className={`app ${uiThemeClass} ${currentScenario ? "scenarioActive" : ""}`}>
      <style>{CSS}</style>
      <aside className="side">
        <div className="profileHead"><img className="avatar" src={currentPortrait} alt={profile.name} onError={(e)=>{e.currentTarget.src="/oppa1.png"}}/><div><h1>{profile.name}</h1><p>{routeLabel} · {currentChapter}장</p></div></div>
        <div className="statsBox"><StatBar label="호감" value={stats.affinity}/><StatBar label="질투" value={stats.jealousy} danger={stats.jealousy >= 50}/><StatBar label="집착" value={stats.obsession} danger={stats.obsession >= 50}/><StatBar label="신뢰" value={stats.trust}/></div>
        <div className={`emotionBox ${emotionState.tone}`}><span>{emotionState.label}</span><small>{emotionState.detail}</small></div>
        <nav className="nav">{[["home","홈"],["chat","채팅"],["scenarioMenu","시나리오"],["profile","상태"],["gallery","갤러리"],["events","전진협"],["save","저장"],["settings","액션"]].map(([key,label])=><button key={key} className={view===key ? "active" : ""} onClick={()=>setView(key as AppView)}>{label}</button>)}</nav>
      </aside>
      <section className="content">
        {currentScenario && <div className="scenarioOverlay" style={{ "--bg-url": `url(${currentScenario.background ?? "/bg_room_night.png"})` } as React.CSSProperties}>
          <section className="vnImageStage"><img src={currentPortrait} alt={currentScenario.title} onError={(e)=>{e.currentTarget.src="/oppa1.png"}}/></section>
          <section className="vnTextbox">
            <div className="vnTitleRow"><span>{currentScenario.title}</span><b>{safeVNLineIndex + 1} / {vnLines.length}</b></div>
            <div className="vnName">{currentVNLine.speaker}</div>
            <button className="vnDialogue" onClick={advanceVN}><TypeText key={`${currentScenario.id}_${safeVNLineIndex}`} text={currentVNLine.text} revealAll={vnTextRevealed} onDone={()=>setVnTextRevealed(true)}/></button>
            <div className="vnControls"><button disabled={safeVNLineIndex <= 0} onClick={()=>setVnLineIndex((v)=>Math.max(0,v-1))}>이전</button><button onClick={advanceVN}>{vnTextRevealed ? "다음" : "스킵"}</button><button onClick={()=>setCurrentScenarioId(null)}>닫기</button></div>
            {isVNLastLine && vnTextRevealed && <div className="vnChoices">{currentScenario.choices.map((choice)=><button key={choice.label} onClick={()=>chooseScenario(choice)}>{choice.label}</button>)}</div>}
          </section>
        </div>}

        {view === "home" && <section className="homeView">
          <div className="homeHeader"><div className="homeLogo"><span>근떡존</span><small>{routeLabel}</small></div></div>
          <div className="homeStage">
            <div className="homeBubble">{homeBubble}</div>
            <button className="homeCharacterCard" onClick={handleHomeReact} onPointerMove={handleHomePointerMove} onPointerLeave={()=>setHomeTilt({x:0,y:0})} style={{ "--tilt-x": `${homeTilt.x}deg`, "--tilt-y": `${homeTilt.y}deg` } as React.CSSProperties}>
              <img src={homeCharacterImage} alt="근떡존 SD" onError={(e)=>{e.currentTarget.src=`/sd_geunddeok_idle.png?v=${SD_IMAGE_VERSION}`}}/>
            </button>
          </div>
          <div className="homeButtons">{homeButtons.map((button)=><button key={button.label} onClick={()=>setView(button.target)}>{button.label}</button>)}</div>
        </section>}

        {view === "chat" && <><header className="topBar">{quickReplies.map((q)=><button key={q} onClick={()=>sendMessage(q)}>{q}</button>)}</header><div className="chatArea">{messages.map((m)=><div key={m.id} className={`msgRow ${m.role}`}>{m.role==="assistant" && <img className="chatAvatar" src={getHomeCharacterImage(stats, storyRoute)} onError={(e)=>{e.currentTarget.src=`/sd_geunddeok_idle.png?v=${SD_IMAGE_VERSION}`}} alt=""/>}<div className="bubble">{m.content}<small>{m.time}</small></div></div>)}<div ref={bottomRef}/></div><footer className="inputBar"><button onClick={()=>setView("home")}>홈</button><input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter") sendMessage();}} placeholder="메시지를 입력하세요..."/><button disabled={isSending} onClick={()=>sendMessage()}>전송</button></footer></>}
        {view === "scenarioMenu" && <Panel title="시나리오"><div className="sectionStack"><h3>메인 시나리오</h3><div className="grid">{mainScenarios.map((s)=><button className="cardBtn" key={s.id} onClick={()=>startScenario(s.id)}><b>{s.title}</b><small>{s.subtitle}</small></button>)}</div><h3>기타 / 특수</h3><div className="grid">{sideScenarios.map((s)=><button className="cardBtn" key={s.id} onClick={()=>startScenario(s.id)}><b>{s.title}</b><small>{s.subtitle}</small></button>)}</div></div></Panel>}
        {view === "profile" && <Panel title="상태"><div className="profilePanel"><div className="profileOverview"><div className="profileIllustration"><img src={currentPortrait || getHomeCharacterImage(stats, storyRoute)} alt={`${profile.name} 초상`} onError={(e)=>{e.currentTarget.src="/oppa1.png"}}/></div><div className="profileSummary"><h3>{profile.name}</h3><p className="profileTag">{profile.relationship}</p><div className="profileStatsLine"><span>{routeLabel}</span><span>{currentChapter}장 진행</span>{currentScenario ? <span>{currentScenario.title}</span> : null}</div><div className="profileDetails"><span>나이 {profile.age}</span><span>키 {profile.height}</span><span>{profile.location}</span></div><div className="statusCards"><div className="statusCard"><strong>호감</strong><span>{stats.affinity}%</span><small>{getStatMood("affinity", stats.affinity)}</small></div><div className="statusCard"><strong>질투</strong><span>{stats.jealousy}%</span><small>{getStatMood("jealousy", stats.jealousy)}</small></div><div className="statusCard"><strong>집착</strong><span>{stats.obsession}%</span><small>{getStatMood("obsession", stats.obsession)}</small></div><div className="statusCard"><strong>신뢰</strong><span>{stats.trust}%</span><small>{getStatMood("trust", stats.trust)}</small></div></div><div className="statusNote"><b>{emotionState.label}</b><span>{emotionState.detail}</span><small>{getCurrentStatusText(stats, storyRoute)}</small></div></div></div><div className="memoryPanel"><div><strong>관계 기억 노트</strong><small>{memoryNotes.length}개 저장됨</small></div>{memoryNotes.length ? memoryNotes.slice(-8).reverse().map((note)=><p key={note.id}><b>{note.chapter}장</b>{note.text}</p>) : <p>아직 근떡존이 오래 붙잡고 있을 만한 기억은 없어요.</p>}</div><div className="profileTextBlock"><p>{profile.bio}</p><p>{profile.personality}</p></div><div className="profileMeta"><div><strong>좋아하는 것</strong><p>{profile.likes.join(" · ")}</p></div><div><strong>취미</strong><p>{profile.hobbies.join(" · ")}</p></div><div><strong>키워드</strong><p>{profile.tags.join(" · ")}</p></div></div></div></Panel>}
        {view === "gallery" && <Panel title="CG 갤러리"><div className="tabs">{(Object.keys(galleryTabLabels) as GalleryTab[]).map((tab)=><button key={tab} onClick={()=>setGalleryTab(tab)}>{galleryTabLabels[tab]}</button>)}</div>{cgReaction && <div className="cgReaction"><img src={cgReaction.img} alt="" onError={(e)=>{e.currentTarget.style.display="none"}}/><p>{cgReaction.text}</p><button onClick={()=>setCgReaction(null)}>닫기</button></div>}<div className="galleryGrid">{galleryImages.map((img)=><button className="cgCard" key={img} onClick={()=>unlockedCGs[img] && setCgReaction({ img, text: getCgReaction(img, stats, storyRoute) })}>{unlockedCGs[img] ? <img src={img} alt="" onError={(e)=>{e.currentTarget.style.display="none"}}/> : <span>LOCKED</span>}</button>)}</div></Panel>}
        {view === "events" && <Panel title="전진협 / 이벤트 도감"><div className="grid">{eventCatalog.map((s)=><button className="cardBtn" key={s.id} onClick={()=>seenEvents[s.id] && startScenario(s.id)}><b>{seenEvents[s.id] ? s.title : "미해금 · ???"}</b><small>{seenEvents[s.id] ? s.subtitle : "해당 이벤트를 보면 도감에 기록돼요."}</small></button>)}</div></Panel>}
        {view === "save" && <Panel title="저장"><div className="grid">{[1,2,3].map((slot)=><div className="cardBtn" key={slot}><b>슬롯 {slot}</b><button onClick={()=>saveSlot(slot)}>저장</button><button onClick={()=>loadSlot(slot)}>불러오기</button></div>)}</div><button className="bigBtn dangerBtn" onClick={resetAll}>전체 초기화</button></Panel>}
        {view === "settings" && <Panel title="액션"><div className="grid">{actionItems.map((item)=><button className="cardBtn" key={item.label} onClick={()=>runAction(item)}><b>{item.emoji} {item.label}</b><small>{item.text}</small></button>)}</div></Panel>}

        {showTutorial && <div className="tutorialOverlay"><section className="tutorialCard"><div>첫 플레이 안내 <span>{tutorialStep + 1} / {tutorialCards.length}</span></div><h2>{currentTutorial.title}</h2><p>{currentTutorial.body}</p><footer><button onClick={closeTutorial}>건너뛰기</button>{tutorialStep < tutorialCards.length - 1 ? <button onClick={()=>setTutorialStep((v)=>v+1)}>다음</button> : <button onClick={closeTutorial}>시작하기</button>}</footer></section></div>}
        {chapterTransition && <div className={`chapterTransition ${chapterTransition.mode}`}><section><span>{chapterTransition.eyebrow}</span><h2>{chapterTransition.title}</h2>{chapterTransition.subtitle && <p>{chapterTransition.subtitle}</p>}</section></div>}
      </section>
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
.topBar{display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;padding:14px 12px;flex:none;-webkit-overflow-scrolling:touch}.topBar button{flex:0 0 auto;white-space:nowrap;font-size:13px;line-height:1.4;padding:10px 14px;border-radius:18px;background:#3a2d29;color:white;border:1px solid rgba(255,255,255,.08)}.chatArea{flex:1;min-height:0;overflow:auto;padding:18px 20px;display:flex;flex-direction:column;gap:6px}.msgRow{display:flex;align-items:flex-start;gap:8px;margin:8px 0}.msgRow.assistant{justify-content:flex-start}.msgRow.user{justify-content:flex-end;align-items:flex-end}.msgRow.narration{justify-content:center}.chatAvatar{width:38px;height:38px;border-radius:14px;object-fit:cover;margin-right:8px}.bubble{max-width:min(84vw,720px);background:white;border-radius:22px;padding:16px 20px;box-shadow:0 10px 24px rgba(0,0,0,.08);font-size:16px;line-height:1.72;word-break:break-word;display:inline-flex;flex-direction:column}.msgRow.user .bubble{background:#df842c;color:white;margin-left:10px}.msgRow.assistant .bubble{margin-left:0}.msgRow.narration .bubble{max-width:min(760px,88%);background:transparent;box-shadow:none;color:#7b6253;font-style:italic;text-align:center;padding:10px 14px;border-radius:0}.msgRow.narration .bubble small{align-self:center;color:#b39b89}.bubble small{display:block;margin-top:8px;color:#9c8d84;font-size:12px}.inputBar{height:72px;display:grid;grid-template-columns:auto 1fr auto;gap:10px;padding:12px;background:#f2e7dd;flex:none;transition:background .24s ease,box-shadow .24s ease,border-color .24s ease}.inputBar input{border:1px solid #ddd0c5;border-radius:24px;padding:0 18px;font-size:16px;background:#fffaf6;color:#2a1a14;outline:none;transition:border-color .2s ease,box-shadow .2s ease,background .2s ease,color .2s ease}.inputBar input:focus{border-color:#d59653;box-shadow:0 0 0 3px rgba(217,129,49,.18)}.inputBar input::placeholder{color:#9b8b81;opacity:1}.inputBar button{border:0;border-radius:20px;background:#8d8178;color:white;font-weight:900;padding:0 22px;line-height:1;display:flex;align-items:center;justify-content:center;height:48px;white-space:nowrap;transition:background .2s ease,box-shadow .2s ease,transform .15s ease}.inputBar button:hover{transform:translateY(-1px)}
.scenarioOverlay{position:fixed;inset:0;z-index:9999;color:white;overflow:auto;pointer-events:auto}.scenarioOverlay::before{content:"";position:absolute;inset:0;background-image:var(--bg-url);background-size:cover;background-position:center;filter:blur(16px) saturate(1.05);opacity:1}.scenarioOverlay::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.15),rgba(0,0,0,.75));}.scenarioActive .side,.scenarioActive .topBar,.scenarioActive .homeButtons,.scenarioActive .inputBar,.scenarioActive .panel{visibility:hidden !important;pointer-events:none !important}.scenarioActive .content{overflow:hidden !important}.vnImageStage{position:absolute;inset:0;display:grid;place-items:center;z-index:1;padding-bottom:110px}.vnImageStage img{max-width:100%;max-height:calc(100vh - 220px);object-fit:contain;filter:drop-shadow(0 24px 50px rgba(0,0,0,.55))}.vnTextbox{position:absolute;left:50%;bottom:24px;transform:translateX(-50%);width:min(900px,calc(100vw - 44px));z-index:2;max-height:55vh;padding-bottom:0;overflow:auto;box-sizing:border-box}.vnTitleRow{display:flex;justify-content:space-between;font-size:12px;font-weight:900;margin-bottom:8px;text-shadow:0 2px 8px #000}.vnName{display:inline-block;background:#d98131;padding:10px 18px;border-radius:8px 8px 0 0;font-weight:900}.vnDialogue{width:100%;min-height:120px;text-align:left;border:1px solid rgba(255,222,167,.26);border-radius:8px;background:rgba(13,9,10,.86);color:white;padding:22px 24px;cursor:pointer;backdrop-filter:blur(12px);max-height:calc(55vh - 120px);overflow:auto}.typeText{white-space:pre-line;line-height:1.75;font-size:18px;margin:0}.vnControls{display:flex;justify-content:flex-end;gap:8px;margin-top:10px}.vnControls button,.vnChoices button{border:0;border-radius:8px;background:#2f221e;color:white;padding:12px 16px;font-weight:900}.vnChoices{display:grid;gap:10px;margin-top:12px}
.tutorialOverlay,.chapterTransition{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;background:rgba(8,5,4,.72);backdrop-filter:blur(9px)}.tutorialCard,.chapterTransition section{width:min(430px,calc(100vw - 32px));background:#fff8ef;border-radius:12px;padding:24px;color:#1b1210;box-shadow:0 28px 80px rgba(0,0,0,.35)}.tutorialCard footer{display:flex;justify-content:flex-end;gap:10px;margin-top:18px}.tutorialCard button{border:0;border-radius:10px;background:#d98131;color:white;padding:12px 16px;font-weight:900}.chapterTransition{color:white;background:rgba(0,0,0,.86);animation:fadeChapter 2.3s ease forwards}.chapterTransition section{background:transparent;color:white;text-align:center;border-top:1px solid rgba(244,214,169,.34);border-bottom:1px solid rgba(244,214,169,.24);box-shadow:none}.chapterTransition h2{font-size:clamp(34px,5vw,68px);margin:12px 0}.chapterTransition span{color:#f0b76b;font-weight:900;letter-spacing:.22em;text-transform:uppercase}
@keyframes idle{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-12px) scale(1.018)}}@keyframes aura{0%,100%{transform:scale(.96);opacity:.7}50%{transform:scale(1.05);opacity:1}}@keyframes bubblePop{0%{opacity:0;transform:translateY(8px) scale(.96)}100%{opacity:1;transform:translateY(-2px) scale(1)}}@keyframes fadeChapter{0%{opacity:0}14%,76%{opacity:1}100%{opacity:0}}
.emotionBox{display:grid;gap:6px;margin:0 0 14px;padding:13px 14px;border-radius:16px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.1)}.emotionBox span{font-size:16px;font-weight:1000;color:#ffd59b}.emotionBox small{font-size:12px;line-height:1.45;color:#e8d8c8}.emotionBox.danger span{color:#ff8b8b}.emotionBox.warn span{color:#ffbd73}.emotionBox.soft span{color:#aee3b5}.emotionBox.warm span{color:#ffd07a}.statusNote{display:grid;gap:7px}.statusNote b{font-size:18px;color:#7b4f2f}.statusNote span,.statusNote small{line-height:1.6}.memoryPanel{display:grid;gap:10px;background:#fffaf4;border:1px solid #e8d2b6;border-radius:20px;padding:20px}.memoryPanel>div{display:flex;justify-content:space-between;gap:10px;align-items:center}.memoryPanel strong{font-size:18px;color:#5b3828}.memoryPanel small{color:#9a7c65}.memoryPanel p{margin:0;padding:12px 14px;border-radius:14px;background:#fff;border:1px solid rgba(216,184,148,.55);color:#4a342a;line-height:1.7}.memoryPanel p b{display:inline-flex;margin-right:8px;color:#d98131}
.cgReaction{display:grid;grid-template-columns:86px minmax(0,1fr) auto;gap:14px;align-items:center;margin:0 0 18px;padding:14px;border-radius:20px;background:#fff8ef;border:1px solid #e8c99e;box-shadow:0 12px 32px rgba(91,48,24,.08)}.cgReaction img{width:86px;height:86px;border-radius:18px;object-fit:cover;background:#ead7c7}.cgReaction p{margin:0;color:#4a342a;line-height:1.65;font-weight:800}.cgReaction button{border:0;border-radius:999px;background:#3a2d29;color:white;padding:10px 14px;font-weight:900}.cgCard{border:0;text-align:center;cursor:pointer}.cgCard:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(91,48,24,.14)}
@media(max-width:850px){.app{height:auto;min-height:100vh;display:flex;flex-direction:column;overflow:visible}.side{position:sticky;top:0;z-index:20;padding:8px 10px;display:grid;grid-template-columns:1fr;gap:8px;max-height:none;overflow:visible;flex:none;background:#21130f}.profileHead{display:none}.statsBox{margin:0;padding:6px 8px;border-radius:12px}.statBar{margin:3px 0}.statBar div{font-size:10px}.statBar i{height:5px}.nav{display:flex;overflow-x:auto;overflow-y:hidden;gap:8px;flex-wrap:nowrap;padding-bottom:2px}.nav button{white-space:nowrap;padding:10px 13px;border-radius:14px;flex:none}.content{height:auto;min-height:0;flex:1}.coverImg{width:100%;max-width:none;max-height:90dvh;object-position:center center}.coverStartBtn{bottom:48px;font-size:20px;padding:16px 38px}.homeView{padding:18px 14px 24px;display:block;overflow:auto}.homeHeader{margin-bottom:10px}.homeStage{width:100%;height:auto;min-height:min(58dvh,540px);display:grid;place-items:end center}.homeCharacterCard img{width:min(88vw,400px);max-height:48dvh}.homeButtons{grid-template-columns:repeat(2,1fr);gap:10px}.homeButtons button{padding:15px}.homeBubble{top:10px;left:auto;right:4%;width:min(138px,37vw);padding:7px 9px 8px 10px;font-size:8.5px;border-radius:20px}.homeBubble:after{left:14px;bottom:-6px;width:10px;height:10px}.chatArea{padding:16px;display:flex;flex-direction:column;gap:8px}.topBar{display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;padding:12px 10px;flex:none}.topBar button{font-size:13px;min-width:120px;padding:10px 13px;white-space:nowrap;flex:0 0 auto}.bubble{font-size:16px;max-width:84%}.msgRow{display:flex;align-items:flex-start;gap:8px;margin:6px 0}.msgRow.assistant{justify-content:flex-start}.msgRow.user{justify-content:flex-end;align-items:flex-end}.inputBar{position:sticky;bottom:0;z-index:3}.inputBar input{font-size:16px}.vnTextbox{bottom:10px;width:calc(100vw - 18px)}.vnDialogue{min-height:118px;max-height:32dvh;overflow:auto;padding:17px}.typeText{font-size:16px}.vnImageStage img{width:100%;height:100%;object-fit:contain}.panel{padding:16px}.panel h2{font-size:26px}.grid{grid-template-columns:1fr}.profileOverview{grid-template-columns:1fr !important}.profileIllustration{width:100%;max-width:none}.profileIllustration img{min-height:auto;max-height:none;height:auto}.profileDetails{flex-direction:column}.statusCards{grid-template-columns:1fr}.profileMeta{grid-template-columns:1fr}}
@media(max-width:850px){.side{padding:5px 7px;gap:5px}.statsBox{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 8px;padding:5px 7px;border-radius:10px}.statBar{margin:0;min-width:0}.statBar div{font-size:8px;line-height:1.1;gap:4px}.statBar i{height:3px;margin-top:2px}.emotionBox{display:flex;align-items:center;gap:8px;margin:0;padding:6px 8px;border-radius:10px;min-height:0}.emotionBox span{font-size:12px;line-height:1;white-space:nowrap}.emotionBox small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px;line-height:1.15;min-width:0}.nav{gap:6px;padding-bottom:1px}.nav button{padding:8px 10px;border-radius:12px;font-size:12px;line-height:1;min-height:32px}.topBar{padding:8px 8px}.topBar button{min-width:auto;padding:8px 11px;font-size:12px;border-radius:14px}.chatArea{padding-top:10px}}
.app.theme-pure .inputBar{background:linear-gradient(180deg,#fff5f6 0%,#fdecef 100%);border-top:1px solid rgba(234,177,191,.45);box-shadow:0 -10px 28px rgba(214,148,166,.12)}.app.theme-pure .inputBar input{background:linear-gradient(180deg,#fffefe 0%,#fff8fa 100%);border:1px solid #efc6d0;color:#6b3f49;box-shadow:0 8px 18px rgba(231,175,190,.12),inset 0 1px 0 rgba(255,255,255,.92)}.app.theme-pure .inputBar input::placeholder{color:#c2919b}.app.theme-pure .inputBar input:focus{border-color:#e29bad;box-shadow:0 0 0 3px rgba(235,170,183,.22),0 10px 22px rgba(214,148,166,.16)}.app.theme-pure .inputBar button{background:linear-gradient(135deg,#f1aab9,#d97f96);color:#fff;border:1px solid rgba(255,255,255,.28);box-shadow:0 10px 22px rgba(213,125,149,.22)}.app.theme-pure .inputBar button:hover{background:linear-gradient(135deg,#f5b7c4,#e18ea2)}
.app.theme-obsession .inputBar{background:linear-gradient(180deg,#26171a 0%,#190f12 100%);border-top:1px solid rgba(150,73,86,.32);box-shadow:0 -12px 30px rgba(0,0,0,.34)}.app.theme-obsession .inputBar input{background:linear-gradient(180deg,#fff7f5 0%,#f4e6e4 100%);border:1px solid #6e434a;color:#291517;box-shadow:inset 0 1px 0 rgba(255,255,255,.68),0 10px 20px rgba(0,0,0,.12)}.app.theme-obsession .inputBar input::placeholder{color:#8d6e73}.app.theme-obsession .inputBar input:focus{border-color:#9c5965;box-shadow:0 0 0 3px rgba(156,89,101,.22),0 10px 22px rgba(0,0,0,.2)}.app.theme-obsession .inputBar button{background:linear-gradient(135deg,#7d3744,#35171d);color:#fff7f6;border:1px solid rgba(255,181,181,.12);box-shadow:0 12px 26px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.05)}.app.theme-obsession .inputBar button:hover{background:linear-gradient(135deg,#944858,#461f29)}
`;




