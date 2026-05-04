"use client";

export type Role = "user" | "assistant" | "narration";
export type View = "chat" | "scenarioMenu" | "profile" | "gallery" | "save" | "settings" | "endings" | "events" | "gift" | "checkin" | "wardrobe" | "diary" | "achievements" | "storyMap" | "miniMap";
export type ScenarioKind = "normal" | "jealousy" | "obsession" | "confinement" | "yandere";
export type ScenarioCategory = "main" | "action" | "special" | "after" | "side";
export type StatKey = "affinity" | "jealousy" | "obsession" | "trust";
export type GalleryTab = "all" | "normal" | "jealousy" | "obsession" | "confinement" | "yandere" | "action";
export type EndingRoute = "none" | "pure" | "obsession" | "confinement" | "jealousy" | "bad";
export type EndingKey = "pure" | "obsession" | "confinement" | "jealousy" | "bad";
export type OutfitKey = "black_tanktop" | "hoodie" | "gym" | "convenience_store" | "winter_coat" | "party_shirt" | "obsession_shirt";

export type Message = { id: string; role: Role; content: string; time: string; image?: string };
export type Stats = { affinity: number; jealousy: number; obsession: number; trust: number };
export type StatDelta = Partial<Record<StatKey, number>>;
export type StoryRoute = "common" | "pure" | "obsession";
export type MemoryNote = {
  id: string;
  text: string;
  createdAt: string;
  chapter: number;
  kind: "promise" | "affection" | "boundary" | "jealousy" | "story" | "emotion";
};
export type AfterScenarioCue = { id: string; text: string; chapter: number; sourceId: string; used?: boolean };
export type ChoiceCondition = {
  stat?: Partial<Record<StatKey, number>>;  // 예: { trust: 70 } → 신뢰 70 이상
  route?: StoryRoute;                        // 예: "pure" → 순애 루트일 때만
};
export type Choice = {
  label: string;
  text?: string;
  stat?: StatDelta;
  next?: string;
  end?: boolean;
  forceImage?: string;
  route?: StoryRoute;
  condition?: ChoiceCondition;  // 잠금 조건: 미충족 시 회색 잠금
};
export type VNLine = { speaker: "나레이션" | "근떡존" | "히든" | "메시지"; text: string };
export type TouchTarget = {
  label: string;          // "손을 잡는다"
  hint?: string;          // 이미지 위에 표시할 이모지: "✋"
  x: number;              // vnImageStage 기준 좌측 % (0~100)
  y: number;              // vnImageStage 기준 상단 % (0~100)
  radius?: number;        // 탭 인식 반경 % (기본 12)
  stat?: StatDelta;
  next?: string;
  route?: StoryRoute;
};
export type TouchMission = {
  prompt: string;         // "근떡존의 손을 잡아주세요."
  targets: TouchTarget[];
};
export type ActionItem = { label: string; emoji: string; text: string; stat: StatDelta; scenario?: string };
export type Scenario = {
  id: string;
  title: string;
  subtitle: string;
  text: string;
  kind: ScenarioKind;
  min?: Partial<Stats>;
  image?: string;
  imagePool?: string[];
  background?: string;
  choices: Choice[];
  storyRoute?: StoryRoute;
  category?: ScenarioCategory;
  mission?: TouchMission;
};
export type SaveData = {
  version: number;
  stats: Stats;
  messages: Message[];
  view: View;
  currentScenarioId: string | null;
  currentEndingId?: EndingKey | null;
  seenTriggers: Record<string, boolean>;
  currentPortrait: string;
  galleryTab: GalleryTab;
  savedAt: string;
  memorySummary?: string;
  relationshipLog?: string[];
  memoryNotes?: MemoryNote[];
  afterScenarioCues?: AfterScenarioCue[];
  silenceLevel?: number;
  notificationEnabled?: boolean;
  endingFlags?: Record<string, boolean>;
  afterRoute?: EndingRoute;
  unlockedCGs?: Record<string, boolean>;
  saveThumbnail?: string;
  routeLabel?: string;
  lastMessagePreview?: string;
  seenEvents?: Record<string, boolean>;
  showStatNumbers?: boolean;
  storyRoute?: StoryRoute;
  giftCooldowns?: Record<string, number>;
  lastCheckIn?: number;
  checkInStreak?: number;
  checkInHistory?: number[];
  equippedOutfit?: OutfitKey;
  unlockedAchievements?: Record<string, number>; // id -> 해금 timestamp
  lastBladderRelief?: number;    // 마지막 화장실 허락 timestamp
  bladderPopupThreshold?: number; // 마지막 팝업을 띄운 % 임계값
};
