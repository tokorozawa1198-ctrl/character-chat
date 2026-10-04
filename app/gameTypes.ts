"use client";

export type Role = "user" | "assistant" | "narration";
export type View = "chat" | "scenarioMenu" | "profile" | "gallery" | "save" | "settings" | "endings" | "events" | "gift" | "checkin" | "wardrobe" | "diary" | "achievements" | "storyMap" | "miniMap" | "quests" | "shop" | "gacha" | "pets" | "adventure" | "sns" | "raid" | "journal" | "minigames" | "calendar30" | "codex" | "stats" | "letters" | "quote" | "cards" | "sound" | "subScenarios" | "extraScenarios";
export type ScenarioKind = "normal" | "jealousy" | "obsession" | "confinement" | "yandere" | "comedy" | "bad_ending" | "bad_ending_intro";
export type ScenarioCategory = "main" | "action" | "special" | "after" | "side";
export type StatKey = "affinity" | "jealousy" | "obsession" | "trust" | "bladderCharm";
export type GalleryTab =
  | "all" | "favorites"
  | "ch1" | "ch2" | "ch3" | "ch4" | "ch5" | "ch6"
  | "pure" | "obsession" | "confine_a" | "confine_b" | "forced"
  | "bladder" | "hidden" | "ssr" | "special_lv" | "location" | "action"
  // 레거시 호환 (저장본)
  | "normal" | "jealousy" | "yandere" | "confinement";
export type EndingRoute = "none" | "pure" | "obsession" | "confinement" | "jealousy" | "bad";
export type EndingKey = "pure" | "obsession" | "confinement" | "jealousy" | "bad";
export type OutfitKey = "black_tanktop" | "hoodie" | "gym" | "convenience_store" | "winter_coat" | "party_shirt" | "obsession_shirt" | "k_bladder_suit";

export type Message = { id: string; role: Role; content: string; time: string; image?: string };
export type Stats = { affinity: number; jealousy: number; obsession: number; trust: number; bladderCharm: number };
export type StatDelta = Partial<Record<StatKey, number>>;
export type StoryRoute = "common" | "pure" | "obsession";
export type CharacterKey = "geonddeokjon" | "hidden" | "blackjon";
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
  flag?: string;                // 분기 플래그 (예: "confine_A_seed") — 추후 라우팅/분석용
  result?: string;              // 선택 후 한 페이지 결과 텍스트 (있으면 임시 시나리오로 보여주고 next로 진행)
};
export type VNLine = { speaker: "나레이션" | "근떡존" | "흑존" | "히든" | "메시지" | "기타"; text: string };
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
  unlockedSpecials?: Record<string, boolean>;
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
  cgFavorites?: Record<string, boolean>; // CG 즐겨찾기
  completedQuests?: Record<string, boolean>; // 보상 받은 퀘스트
  unlockedMilestones?: Record<string, boolean>; // 도달한 호감 마일스톤
  unlockedSubScenarios?: Record<string, boolean>; // 코인으로 해금한 서브 시나리오 에피소드
  scenarioProgress?: { id: string; lineIndex: number } | null; // 읽다 나간 시나리오 진행 상황
  selectedCharacter?: CharacterKey; // 선택한 캐릭터
  lastRandomMessage?: number; // 마지막 깜짝 메시지 timestamp
  coins?: number; // 코인 잔액
  dailyState?: DailyState; // 데일리 미션 / 카운터
  shopHistory?: Record<string, number>; // 상점 구매 횟수 (item_id -> count)
  ownedConsumables?: Record<string, number>; // 보유 소모품 (id -> 개수)
  userLevel?: number; // 유저 레벨
  userExp?: number;   // 현재 레벨 내 누적 EXP
  lastFreeGacha?: number; // 마지막 무료 가챠 timestamp
  gachaTickets?: number; // 가챠 티켓 수 (콤보/이벤트 보상)
  gachaHistory?: Record<string, number>; // 가챠 결과 누적
  gachaPityCount?: number; // SSR 천장: 연속 비-SSR 카운트
  comboCount?: number; // 채팅 콤보
  lastComboTime?: number; // 마지막 채팅 timestamp
  comboMilestonesReached?: Record<number, boolean>; // 도달한 콤보 마일스톤
  ownedPets?: Record<string, { level: number; affinity: number; obtained: number }>;
  activePet?: string | null;
  totalGachaPulls?: number;
  // 모험
  activeAdventure?: { id: string; startTime: number; endTime: number; petUsed: string | null } | null;
  adventureHistory?: Record<string, number>;
  // SNS
  snsLikes?: Record<string, boolean>;
  lastSnsRefresh?: number;
  snsFeed?: { id: string; templateId: string; timestamp: number; likes: number }[];
  // 레이드
  raidWeek?: string;       // YYYY-Www
  raidBossId?: string;
  raidHp?: number;
  raidCleared?: boolean;
  raidDamageDealt?: number;
  // 신탁
  // 다이어리 (저널)
  journalEntries?: { id: string; date: string; templateId: string; liked: boolean }[];
  lastJournalDate?: string;
  // 미니게임
  minigameClickerHigh?: number;
  minigameWordHigh?: number;
  // 메가/콜렉션 패키지
  loveMeterPoints?: number;
  loveMeterDate?: string;
  loveMeterClaimedToday?: boolean;
  letterReads?: Record<string, boolean>;
  unlockedLetters?: string[];
  quoteOfDayId?: string;
  quoteOfDayDate?: string;
  collectedQuotes?: string[];
  ownedCards?: Record<string, { level: number; obtained: number }>;
  totalCardPulls?: number;
  bossDefeats?: { bossId: string; week: string; defeatedAt: number }[];
  bladderMarathonWeek?: string;
  bladderMarathonScore?: number;
  monthlyCalendarClaims?: Record<string, boolean>; // "day_7", "day_14" etc
  // 음향
  soundBgmEnabled?: boolean;
  soundSfxEnabled?: boolean;
  soundBgmVolume?: number;
  soundSfxVolume?: number;
};
export type DailyMission = {
  templateId: string;
  target: number;
  rewardCoins: number;
  claimed: boolean;
};
export type DailyState = {
  date: string; // YYYY-MM-DD
  chatCount: number;       // 오늘 보낸 카톡 메시지
  giftCount: number;       // 오늘 보낸 선물
  scenarioCount: number;   // 오늘 진입한 시나리오
  checkinDone: boolean;
  bladderPeak: number;     // 오늘 도달 최대 방광 게이지
  missions: DailyMission[];
};
