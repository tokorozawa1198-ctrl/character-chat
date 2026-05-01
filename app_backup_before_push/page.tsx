"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Role = "user" | "assistant" | "narration";
type View = "chat" | "scenarioMenu" | "profile" | "gallery" | "save" | "settings" | "endings" | "events";
type ScenarioKind = "normal" | "jealousy" | "obsession" | "confinement" | "yandere";
type StatKey = "affinity" | "jealousy" | "obsession" | "trust";
type GalleryTab = "all" | "normal" | "jealousy" | "obsession" | "confinement" | "yandere" | "action";
type EndingRoute = "none" | "pure" | "obsession" | "confinement" | "jealousy" | "bad";
type EndingKey = "pure" | "obsession" | "confinement" | "jealousy" | "bad";

type Message = { id: string; role: Role; content: string; time: string; image?: string };
type Stats = { affinity: number; jealousy: number; obsession: number; trust: number };
type StatDelta = Partial<Record<StatKey, number>>;
type Choice = { label: string; text?: string; stat?: StatDelta; next?: string; end?: boolean; forceImage?: string };
type VNLine = { speaker: "나레이션" | "근떡존" | "주인님" | "메시지"; text: string };
type ActionItem = { label: string; emoji: string; text: string; stat: StatDelta; scenario?: string };
type Scenario = { id: string; title: string; subtitle: string; text: string; kind: ScenarioKind; min?: Partial<Stats>; image?: string; imagePool?: string[]; background?: string; choices: Choice[] };
type SaveData = { version: number; stats: Stats; messages: Message[]; view: View; currentScenarioId: string | null; currentEndingId?: EndingKey | null; seenTriggers: Record<string, boolean>; currentPortrait: string; galleryTab: GalleryTab; savedAt: string; memorySummary?: string; relationshipLog?: string[]; notificationEnabled?: boolean; endingFlags?: Record<string, boolean>; afterRoute?: EndingRoute; unlockedCGs?: Record<string, boolean>; saveThumbnail?: string; routeLabel?: string; lastMessagePreview?: string; seenEvents?: Record<string, boolean>; showStatNumbers?: boolean };

const VERSION = 9;
const STORAGE_KEY = "geuntteokjon_single_file_vn_v9";
const SLOT_KEY = (slot: number) => `${STORAGE_KEY}_slot_${slot}`;
const TODAY_EVENT_KEY = `${STORAGE_KEY}_today_event`;
const randomBetween = (min: number, max: number) => Math.floor(min + Math.random() * (max - min));
const nextProactiveDelay = () => randomBetween(1000 * 60 * 8, 1000 * 60 * 22);

const profile = {
  name: "근떡존",
  age: "24",
  height: "190cm",
  location: "히로시마",
  relationship: "주인님을 광적으로 좋아하고 집착하는 사이",
  tags: ["금발", "구릿빛 피부", "근육질", "순한 인상", "허당", "질투", "집착", "감금 루트"],
  bio: "금발에 구릿빛 피부, 큰 체격의 근육질 남자. 순한 인상인데 장난기 있고, 가끔 이상한 드립을 친다. 호감이 깊어질수록 질투와 집착이 강해진다.",
  personality: "다정함 · 장난기 · 허당 · 살짝 질투 · 천박함 · 집착 · 얀데레 분기",
  speech: "존댓말, 카톡 느낌",
  likes: ["운동", "디저트", "운동하고 안씻고 버티기", "장난", "밤 산책", "야한 농담"],
  hobbies: ["헬스", "히로시마 돌아다니기", "오줌 참기", "혼자 이상한 상상하기", "본인 겨드랑이 냄새 확인하기"],
};

const quickReplies = [
  "오늘 회사 가기 싫어", "사진 보내줘", "운동 끝나고 셀카 찍어줘",
  "나 칭찬해줘", "오늘 좀 외로워", "다른 남자랑 얘기했어",
  "질투해봐 ㅋ", "나 도망가버릴까?", "화장실 가지말고 오줌 참아라",
  "니 겨드랑이에 스스로 코박아봐",
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

const actionCGPools = {
  gochu: ["/action_gochu1.png", "/action_gochu2.png"],
  armpit: ["/action_armpit1.png", "/action_armpit2.png"],
  feet: ["/action_feet1.png", "/action_feet2.png"],
  dance: ["/action_dance1.png", "/action_dance2.png"],
  kiss: ["/action_kiss1.png", "/action_kiss2.png"],
  smell: ["/action_smell1.png", "/action_smell2.png"],
  muscle: ["/action_muscle1.png", "/action_muscle2.png"],
  hug: ["/action_hug1.png", "/action_hug2.png"],
  jealous: ["/action_jealous1.png", "/action_jealous2.png"],
  ignore: ["/action_ignore1.png", "/action_ignore2.png"],
  comfort: ["/action_comfort1.png", "/action_comfort2.png"],
};
const actionCGImages = Object.values(actionCGPools).flat();

const actionItems: ActionItem[] = [
  { label: "고추 만지기", emoji: "🍆", text: "아... 주인님 지금 어디 만지시는 거예요 ㅋㅋ", stat: { affinity: 1, obsession: 2, trust: 1 }, scenario: "action_gochu" },
  { label: "겨드랑이 만지기", emoji: "💪", text: "아 거기 땀 났는데... 그래도 계속 만지실 거예요 ㅋㅋ", stat: { affinity: 1, obsession: 2 }, scenario: "action_armpit" },
  { label: "발냄새 맡기", emoji: "🦶", text: "으악!!!! 진짜 이상하시네요 ㅋㅋㅋ 거기 냄새 심한데", stat: { affinity: 1, obsession: 2, trust: -2 }, scenario: "action_feet" },
  { label: "오칭코 댄스 추기", emoji: "🕺", text: "아 오줌 마려운데 춤추라고요? ㅋㅋㅋ 저 지금 이상한 꼴이네요", stat: { affinity: 1, obsession: 2 }, scenario: "action_dance" },
  { label: "뽀뽀 시도", emoji: "😘", text: "...주인님 갑자기요? ㅋㅋ 좀 부끄럽잖아요", stat: { affinity: 1, obsession: 2, trust: 0 }, scenario: "action_kiss" },
  { label: "꼬추 냄새 맡기", emoji: "👃", text: "으아아!!! 진짜 미치셨어요?? 거긴 더 심한데 ㅋㅋㅋ", stat: { affinity: 0, obsession: 2 }, scenario: "action_smell" },
  { label: "근육 만지기", emoji: "💪", text: "어때요? 단단하죠 ㅋㅋ 운동 좀 했어요", stat: { affinity: 1, trust: 0 }, scenario: "action_muscle" },
  { label: "안아달라고 하기", emoji: "🤗", text: "아... 주인님 그러시면 저 진짜 약해지는데요", stat: { affinity: 1, obsession: 0, trust: 0 }, scenario: "action_hug" },
  { label: "일부러 질투 유발", emoji: "😏", text: "아까 다른 남자 좀 괜찮더라", stat: { jealousy: 3, obsession: 1, trust: -1 }, scenario: "action_jealous" },
  { label: "읽씹하는 척", emoji: "📵", text: "나 잠깐 연락 안 볼게", stat: { obsession: 3, jealousy: 2, trust: -1 }, scenario: "action_ignore" },
  { label: "달래주기", emoji: "🫳", text: "장난이에요 주인님밖에 없어요", stat: { affinity: 2, jealousy: -1, trust: 1 }, scenario: "action_comfort" },
  { label: "감금 루트 바로 보기", emoji: "🔒", text: "감금 루트 바로 보기", stat: { obsession: 35, jealousy: 12 } },
];

const scenarioData: Record<string, Scenario> = {
  main_ch1_01: { id: "main_ch1_01", title: "1장: 히로시마의 밤과 금발의 남자", subtitle: "메인 스토리 · 편의점 앞의 금발", kind: "normal", imagePool: ["/main_ch1_01.png"], background: "/bg_room_night.png", text: "히로시마의 밤은 생각보다 조용했다.\n\n낮에는 전차 소리와 관광객들의 발걸음으로 어수선하던 거리도, 밤이 되자 이상하게 얌전해졌다. 편의점 유리문 너머로 흰 조명이 새어 나오고, 젖은 아스팔트 위에는 빨간 간판 불빛이 흐릿하게 번졌다.\n\n계산을 마치고 편의점 밖으로 나오자, 문 옆에 큰 남자가 서 있었다.\n\n금발. 구릿빛 피부. 검은 티셔츠 아래로 드러나는 넓은 어깨와 단단한 팔. 운동을 많이 한 사람 특유의 체격.\n\n겉으로 보기엔 길 하나쯤은 자신 있게 걸어갈 것 같은 사람이었다.\n\n그런데 그는 휴대폰 화면을 붙잡고, 거의 시험 문제를 푸는 사람처럼 심각한 표정을 하고 있었다.\n\n\"아… 이거 진짜 뭐라는 거야.\"\n\n혼잣말은 한국어였다.\n\n무심코 돌아보자, 남자가 바로 고개를 들었다.\n\n\"아, 죄송해요. 길 막았죠.\"\n\n목소리는 낮고 부드러웠다. 덩치와 달리 태도는 조심스러웠다.\n\n화면을 힐끗 보자 남자는 조금 민망한 듯 웃었다.\n\n\"쿠폰이요?\"\n\n남자의 눈이 아주 짧게 밝아졌다.\n\n\"어? 한국 분이세요?\"\n\n그 말에 자신이 너무 반가워한 걸 깨달았는지, 그는 곧바로 웃으며 한 발 물러났다.\n\n\"아, 죄송해요. 제가 지금 일본어한테 좀 두들겨 맞고 있어서요.\"\n\n\"편의점 앱한테요?\"\n\n\"네. 지금 거의 완패 직전입니다.\"\n\n그는 휴대폰을 조심스럽게 내밀었다.\n\n\"이거 쿠폰 쓰는 법 맞죠? 제가 히로시마 온 지 얼마 안 돼서요. 일본어도 아직 좀 약하고.\"\n\n화면을 보고 설명해주자, 그는 설명을 듣는 내내 진지하게 고개를 끄덕였다. 마치 편의점 쿠폰 하나가 오늘 밤의 중요한 관문인 것처럼.\n\n\"아… 진짜 감사합니다. 저 이거 때문에 도시락 앞에서 5분 동안 멍때렸어요.\"\n\n그가 웃었다.\n\n\"저 근떡존이라고 해요.\"\n\n잠깐 멈칫했다.\n\n\"근떡존이요?\"\n\n\"네. 이상하죠.\"\n\n그는 너무 순순히 인정했다.\n\n\"근데 한번 들으면 안 잊히긴 하잖아요. 장점입니다.\"\n\n그 당당함에 웃음이 나왔다.\n\n근떡존은 그 웃음을 보고 잠깐 말을 멈췄다.\n\n별말 아니었다. 그냥 이름을 받아준 것뿐이었다. 그냥 웃어준 것뿐이었다.\n\n그런데 이상하게 좋았다.\n\n근떡존은 그런 자신을 잘 알았다.\n\n그는 원래 사람에게 마음이 빨리 기우는 편이었다. 조금만 다정하게 대해줘도, 자기 말을 이상하게 보지 않고 받아줘도, 누가 편하게 웃어주기만 해도 마음 한쪽이 금방 느슨해졌다.\n\n그래서 그는 그걸 숨겼다.\n\n너무 쉽게 좋아하는 사람처럼 보이고 싶지 않았다. 너무 쉽게 기대하는 사람처럼 보이고 싶지 않았다. 자기가 누군가의 말 한마디에 금방 안심하는 사람이라는 걸 들키면, 사람들이 자신을 만만하게 볼 것 같았다.\n\n그래서 그는 늘 먼저 웃었다. 먼저 농담했다. 먼저 가벼운 사람처럼 굴었다.\n\n\"그럼… 혹시 이 쿠폰 쓰는 법 좀 한 번만 더 알려주실 수 있어요? 제가 이거 때문에 도시락 앞에서 사회적 사망 직전이라서요.\"", choices: [{ label: "쿠폰 쓰는 법을 끝까지 알려준다", text: "이거 이렇게 쓰면 돼요.", stat: { affinity: 2, trust: 2 }, next: "main_ch1_02" }, { label: "이름이 강렬하다고 말한다", text: "이름이 좀 강렬하네요.", stat: { affinity: 1, obsession: 1 }, next: "main_ch1_02" }, { label: "일본어가 많이 어렵냐고 묻는다", text: "일본어 아직 많이 어려워요?", stat: { affinity: 1, trust: 1 }, next: "main_ch1_02" }] },
  main_ch1_02: { id: "main_ch1_02", title: "1장: 쿠폰과 도시락", subtitle: "메인 스토리 · 대형 햄스터", kind: "normal", min: { affinity: 999 }, imagePool: ["/main_ch1_02.png"], background: "/bg_room_night.png", text: "\"일본어 때문에 고생 중이에요?\"\n\n묻자 근떡존은 도시락 봉투를 내려다봤다.\n\n\"솔직히 말하면요?\"\n\n그는 아주 진지한 얼굴로 말했다.\n\n\"편의점 직원분이 ‘데우시겠어요?’라고 물어보면 아직도 몸이 살짝 굳어요.\"\n\n웃음이 나왔다.\n\n\"그 정도예요?\"\n\n\"아니 진짜예요. 머리로는 아는데 갑자기 들으면 뇌가 로딩 중이 돼요. 저 덩치만 크지 일본어 앞에서는 그냥 햄스터예요.\"\n\n그는 스스로 말해놓고도 조금 민망한 듯 코끝을 긁었다.\n\n다시 훑어보게 됐다. 금발. 큰 키. 구릿빛 피부. 운동으로 단단하게 만들어진 몸. 외모만 보면 햄스터와는 거리가 멀었다.\n\n\"햄스터치고는 좀 크네요.\"\n\n\"대형 햄스터죠.\"\n\n근떡존은 곧바로 받아쳤다.\n\n\"사료도 많이 먹고요. 지금 이 도시락도 사실 하나 더 살까 고민했어요.\"\n\n\"하나로 부족해요?\"\n\n\"솔직히 부족하죠. 근데 두 개 사면 왠지 제가 너무 진심으로 보일까 봐.\"\n\n\"도시락에 진심인 게 부끄러운 일인가요?\"\n\n\"그건 아닌데요.\"\n\n근떡존은 웃으며 봉투를 고쳐 들었다.\n\n\"제가 뭐든 너무 진심이면 좀 없어 보여서요.\"\n\n말은 가볍게 했다. 하지만 그 말끝에는 아주 얇은 자기검열이 묻어 있었다.\n\n\"진심이면 좋죠.\"\n\n\"그래요?\"\n\n\"대충 사는 것보다 낫잖아요.\"\n\n근떡존은 그 말을 듣고 잠깐 멈칫했다.\n\n별것 아닌 말이었다. 그런데 이상하게 마음에 남았다.\n\n그는 자신이 뭔가에 진심이 되는 모습을 싫어했다. 정확히는, 남에게 그게 들키는 걸 싫어했다.\n\n좋아하는 게 많았다. 금방 빠지는 것도 많았다. 좋아하는 사람 앞에서는 더 그랬다.\n\n하지만 그걸 그대로 드러내면 상대가 부담스러워할 것 같았다. 혹은 우습게 볼 것 같았다.\n\n그래서 근떡존은 늘 한 박자 늦게 웃고, 두 박자 가볍게 농담했다.\n\n진심처럼 보이지 않게. 기대하는 사람처럼 보이지 않게.\n\n\"운동해요?\"\n\n그 말에 근떡존의 얼굴이 조금 밝아졌다.\n\n\"네. 헬스 좋아해요.\"\n\n기다렸다는 듯 대답했다가, 바로 민망해했다.\n\n\"아, 방금 너무 신나서 대답했나.\"\n\n\"좋아하는 거 말할 때 신나는 건 괜찮죠.\"\n\n근떡존은 그 말을 듣고 또 잠깐 멈췄다.\n\n\"그렇게 말해주시니까 좀 좋네요.\"\n\n\"뭐가요?\"\n\n\"그냥… 좋아하는 거 티 내도 된다는 느낌이라서요.\"\n\n말하고 나서, 그는 급하게 웃었다.\n\n\"아, 이거 너무 감성적이었나. 죄송해요. 도시락 들고 인생 얘기할 뻔했네요.\"\n\n\"도시락도 인생이죠.\"\n\n근떡존이 웃음을 터뜨렸다.\n\n\"선생님 말투 웃기시네요.\"\n\n\"제가 선생님인 건 어떻게 알았어요?\"\n\n\"아, 아니… 설명을 너무 잘하셔서요. 뭔가 가르치는 사람 같았어요.\"\n\n잠깐 그를 봤다.\n\n\"맞아요. 지리교사예요.\"\n\n근떡존의 눈이 조금 커졌다.\n\n\"와.\"\n\n그는 진심으로 감탄한 듯했다.\n\n\"어쩐지.\"", choices: [{ label: "그렇게 대단한 일은 아니라고 넘긴다", text: "그렇게 대단한 건 아니에요.", stat: { trust: 1 }, next: "main_ch1_03" }, { label: "지리는 잘했냐고 묻는다", text: "지리는 잘했어요?", stat: { affinity: 2 }, next: "main_ch1_03" }, { label: "칭찬을 받아준다", text: "설명 잘한다는 칭찬은 마음에 드네요.", stat: { affinity: 2, obsession: 1 }, next: "main_ch1_03" }] },
  main_ch1_03: { id: "main_ch1_03", title: "1장: 선생님과 대형 햄스터", subtitle: "메인 스토리 · 히로시마에 온 이유", kind: "normal", min: { affinity: 999 }, imagePool: ["/main_ch1_03.png"], background: "/bg_room_night.png", text: "\"지리는 잘했어요?\"\n\n근떡존은 바로 시선을 피했다.\n\n\"어…\"\n\n\"못했구나.\"\n\n\"지도 보면 졸렸어요.\"\n\n그가 솔직하게 말했다.\n\n\"근데 지금 생각하면 좀 후회돼요. 어디가 어디랑 이어지는지 알고 사는 거 멋있잖아요. 저는 그냥 길도 자주 잃어버려서요.\"\n\n\"히로시마에서도요?\"\n\n\"네. 어제도 길 잘못 들어서 강가까지 갔어요.\"\n\n\"그건 좀 심한데요.\"\n\n\"근데 강은 예쁘더라고요.\"\n\n근떡존은 그렇게 말하고 웃었다.\n\n\"결론은 길을 잃어도 아름다운 걸 볼 수 있다.\"\n\n\"자기합리화 잘하네요.\"\n\n\"살려면 해야죠.\"\n\n그 말은 농담이었다. 하지만 아주 짧게 그 안의 피로가 느껴졌다.\n\n근떡존은 밝게 웃고 있었다. 상냥하고 잘 받아주고, 자기 허당스러운 면도 먼저 말할 줄 아는 사람.\n\n하지만 모든 말을 먼저 농담으로 감싸는 습관이 있었다. 상대가 무시하기 전에 자기가 먼저 우스워지는 사람처럼.\n\n\"그래도 강가까지 간 건 좀 낭만 있네요.\"\n\n근떡존은 고개를 끄덕였다.\n\n\"그쵸. 길 잃은 김에 산책한 척하면 좀 낫더라고요.\"\n\n\"그럼 길 잃은 게 아니라 코스 변경이네요.\"\n\n\"와. 표현 멋있다.\"\n\n그는 진심으로 감탄했다.\n\n\"선생님은 말이 좀… 안정적이네요.\"\n\n\"안정적?\"\n\n\"네. 사람이 당황할 만한 것도 적당히 말로 정리해주는 느낌.\"\n\n근떡존은 말하고 나서 조금 민망해했다.\n\n\"아, 너무 분석했나.\"\n\n\"분석당하는 거 나쁘지 않은데요. 정확하면요.\"\n\n근떡존은 잠시 사용자를 바라봤다.\n\n저런 말도 아무렇지 않게 하는구나.\n\n자신 같았으면 괜히 웃으며 넘겼을 것이다. “아니에요, 저 그런 사람 아니에요” 하고 부정하거나, 상대가 더 말하기 전에 먼저 장난으로 흐렸을 것이다.\n\n그런데 눈앞의 사람은 자기 장점이든 단점이든 크게 흔들리지 않고 받아들이는 사람처럼 보였다.\n\n그게 근떡존에게는 이상하게 어른스러워 보였다.\n\n\"히로시마는 왜 왔어요?\"\n\n묻자, 근떡존은 잠깐 하늘을 봤다. 편의점 지붕 끝에 물방울이 맺혀 있었다.\n\n\"그냥… 뭔가 바꾸고 싶어서요.\"\n\n평소보다 조금 조용한 목소리였다.\n\n\"한국에 있을 때도 엄청 나빴던 건 아닌데, 계속 같은 데 갇혀 있는 느낌이 있었어요. 일본어도 배우고 싶었고, 일도 해보고 싶었고. 히로시마는 너무 시끄럽지도 않고, 너무 조용하지도 않다고 해서 왔어요.\"\n\n그는 잠깐 웃었다.\n\n\"근데 막상 오니까 조용한 날엔 진짜 조용하더라고요.\"\n\n\"외로워요?\"\n\n묻자, 근떡존은 바로 대답하지 못했다.\n\n\"음.\"\n\n그는 웃었다.\n\n\"아직은 적응 중인 걸로 해둘게요.\"\n\n그 대답은 정중했지만, 완전히 솔직하진 않았다.\n\n근떡존은 외로운 걸 인정하는 게 싫었다. 외롭다고 말하는 순간, 자신이 너무 초라해질 것 같았다. 누군가에게 기대고 싶다는 마음을 들키는 것 같았다.\n\n그래서 그는 적응 중이라는 말을 골랐다.\n\n그 정도면 적당했다. 너무 약해 보이지도 않고, 너무 거짓말처럼 보이지도 않는 말.\n\n그 이상 캐묻지 않자, 근떡존은 오히려 조금 편해 보였다.", choices: [{ label: "적응 중이면 외로울 수도 있다고 한다", text: "적응 중이면 외로울 수도 있죠.", stat: { affinity: 3, trust: 2 }, next: "main_ch1_04" }, { label: "대형 햄스터도 외로움 타냐고 묻는다", text: "대형 햄스터도 외로움 타나요?", stat: { affinity: 2, obsession: 1 }, next: "main_ch1_04" }, { label: "말하기 싫으면 안 해도 된다고 한다", text: "굳이 말하기 싫으면 안 해도 돼요.", stat: { trust: 3 }, next: "main_ch1_04" }] },
  main_ch1_04: { id: "main_ch1_04", title: "1장: 비가 오기 전", subtitle: "메인 스토리 · 도시락과 우산", kind: "normal", min: { affinity: 999 }, imagePool: ["/main_ch1_04.png"], background: "/bg_rainy_window.png", text: "비가 내리기 시작한 건 그때였다.\n\n처음엔 한두 방울이었다. 편의점 처마 끝에서 떨어지던 물방울이 어느새 길게 이어지고, 곧 밤거리 전체가 얇은 비에 젖었다.\n\n근떡존은 하늘을 보더니 작게 탄식했다.\n\n\"아… 우산 없는데.\"\n\n그는 도시락 봉투를 품에 안았다.\n\n\"저 오늘 계획이 있었거든요. 편의점 갔다가, 조용히 집 가서, 도시락 먹고, 일본어 단어장 3페이지 보고, 멋있게 잠드는 계획.\"\n\n\"멋있게 잠드는 건 뭐예요?\"\n\n\"자기계발남 느낌이요.\"\n\n\"도시락 먹고 바로 자면 자기계발이 아니라 식곤증 아닌가요.\"\n\n\"와. 선생님 팩트로 때리시네.\"\n\n근떡존은 웃었다.\n\n비는 조금씩 굵어졌다.\n\n가방을 확인하자 우산은 하나 있었다.\n\n근떡존은 그걸 보고도 한 걸음 물러났다.\n\n\"아, 저는 괜찮아요. 선생님 쓰세요.\"\n\n\"집 멀다면서요.\"\n\n\"걸어서 15분 정도요.\"\n\n\"비 맞고 15분이면 꽤 젖겠는데요.\"\n\n\"저 튼튼해요.\"\n\n그는 팔을 살짝 굽혀 보였다.\n\n\"비 맞는 근육남 컨셉으로 가죠 뭐.\"\n\n하지만 말과 달리, 그의 시선은 도시락 봉투에 가 있었다.\n\n\"본인보다 도시락 걱정하는 거죠?\"\n\n근떡존은 뜨끔한 표정을 했다.\n\n\"들켰네요.\"\n\n\"도시락이 소중하군요.\"\n\n\"편의점 도시락도 지켜줘야죠. 방금 쿠폰까지 써서 어렵게 얻은 건데.\"\n\n\"거의 전우네요.\"\n\n\"맞아요. 저랑 방금 전쟁 치렀어요.\"\n\n둘 다 웃었다.\n\n비는 이제 처마 밖으로 선명한 줄을 만들고 있었다. 편의점 안쪽에서는 전자레인지가 돌아가는 소리가 들렸다. 누군가 계산을 마치고 나가며 자동문이 열렸다 닫혔다.\n\n사소한 밤이었다.\n\n그런데 근떡존은 이상하게 이 시간이 오래 기억에 남을 것 같았다.\n\n그는 금방 마음이 기우는 자신을 믿지 않았다. 처음 만난 사람에게 이런 생각을 하는 건 너무 빠르다고 생각했다.\n\n그래서 그는 마음속에서 올라오는 이상한 기대를 눌렀다.\n\n그냥 친절한 사람이다. 그냥 편하게 말이 통하는 사람이다. 그냥 오늘 밤 우연히 만난 사람이다.\n\n그렇게 정리하려 했다.\n\n하지만 사용자가 웃을 때마다, 정리가 조금씩 흐트러졌다.", choices: [{ label: "같이 우산을 쓰자고 한다", text: "같이 써요.", stat: { affinity: 4, trust: 2 }, next: "main_ch1_05A" }, { label: "도시락만 우산 씌워주겠다고 한다", text: "그럼 도시락만 우산 씌워줄게요.", stat: { affinity: 2, obsession: 1 }, next: "main_ch1_05B" }, { label: "저쪽 처마까지 같이 가자고 한다", text: "저쪽 처마까지 같이 가요.", stat: { affinity: 2, trust: 1 }, next: "main_ch1_05C" }] },
  main_ch1_05A: { id: "main_ch1_05A", title: "1장: 하나뿐인 우산", subtitle: "메인 스토리 · 가까운 거리", kind: "normal", min: { affinity: 999 }, imagePool: ["/main_ch1_05.png"], background: "/bg_rainy_window.png", text: "우산 하나에 둘이 들어가기엔 조금 좁았다.\n\n근떡존은 최대한 몸을 바깥쪽으로 빼고 걸었다. 큰 덩치가 우산 밖으로 반쯤 나가 있는데도, 그는 괜찮다는 듯 웃었다.\n\n\"저 진짜 괜찮아요. 선생님 쪽으로 더 쓰세요.\"\n\n\"그러면 같이 쓰는 의미가 없잖아요.\"\n\n\"제가 면적이 좀 커서요.\"\n\n\"그건 인정.\"\n\n근떡존은 웃었다.\n\n어깨가 가끔 닿았다. 닿을 때마다 그는 아주 미세하게 몸을 굳혔다가, 아무렇지 않은 척 다시 걸었다.\n\n그 반응을 모른 척했다.\n\n비 소리 때문에 거리는 더 조용하게 느껴졌다. 우산 아래는 작고 좁은 방 같았다.\n\n근떡존은 자기 어깨가 닿을 때마다 신경이 곤두섰다.\n\n너무 의식하지 말자. 처음 만난 사람이다. 그냥 우산 같이 쓰는 거다.\n\n그는 속으로 몇 번이나 그렇게 말했다.\n\n그런데 옆의 사람은 너무 자연스러웠다. 과하게 가까워지지도 않고, 그렇다고 불편한 티도 내지 않았다. 그 적당한 거리감이 근떡존을 더 긴장하게 했다.\n\n\"선생님은 평소에도 그렇게 여유로우세요?\"\n\n근떡존이 물었다.\n\n\"별로요.\"\n\n\"진짜요?\"\n\n\"네. 일할 때는 멀쩡한 척하고 사는 거죠.\"\n\n근떡존은 그 말에 조금 놀란 듯했다.\n\n\"선생님도요?\"\n\n\"사람이 앞모습만 있겠어요.\"\n\n근떡존은 조용해졌다.\n\n그 말이 이상하게 마음에 남았다.\n\n사람이 앞모습만 있겠어요.\n\n그는 자신에게도 앞모습과 뒷모습이 있다는 걸 알고 있었다.\n\n앞모습은 상냥하고 밝고, 적당히 허당이고, 운동 좋아하는 사람.\n\n뒷모습은 훨씬 쉽게 흔들리고, 누군가의 말에 과하게 의미를 두고, 사실은 기대고 싶어 하는 사람.\n\n그 뒷모습을 들키기 싫어서, 그는 늘 앞모습을 더 잘 꾸몄다.\n\n그런데 옆의 사람은 그걸 너무 당연한 것처럼 말했다.\n\n사람에게 뒷면이 있어도 괜찮다는 듯이.", choices: [{ label: "조금 더 걸으며 이야기한다", text: "조금만 더 걸으면서 얘기해요.", stat: { affinity: 2, trust: 1 }, next: "main_ch1_06" }] },
  main_ch1_05B: { id: "main_ch1_05B", title: "1장: 도시락을 위한 우산", subtitle: "메인 스토리 · 농담의 거리", kind: "normal", min: { affinity: 999 }, imagePool: ["/main_ch1_05.png"], background: "/bg_rainy_window.png", text: "\"그럼 도시락만 우산 씌워줄게요.\"\n\n근떡존은 잠깐 멈췄다.\n\n\"저는요?\"\n\n\"튼튼하다면서요.\"\n\n\"맞긴 한데요.\"\n\n그는 도시락 봉투를 내려다봤다.\n\n\"근데 이렇게 들으면 제가 도시락보다 못한 존재가 된 것 같은데요.\"\n\n\"도시락은 죄가 없으니까요.\"\n\n근떡존은 결국 웃어버렸다.\n\n\"아 진짜 말 너무하신다.\"\n\n그는 웃으면서도 이상하게 편해 보였다.\n\n사용자의 농담은 가볍지만, 사람을 깎아내리는 느낌은 아니었다. 상대가 받아칠 수 있는 만큼만 찌르고, 어색해지기 전에 빠지는 식이었다.\n\n근떡존은 그런 감각이 신기했다.\n\n사람들이 농담을 던질 때, 그는 종종 먼저 자신을 낮춰서 웃겼다. 그 편이 안전했다. 상대가 자신을 놀리기 전에 자기가 먼저 자기 흠을 꺼내면 덜 아팠다.\n\n그런데 눈앞의 사람은 달랐다.\n\n말은 경박한데 이상하게 안전했다. 장난은 치는데 선을 넘지 않았다. 상대가 불편해지기 전에 알아서 물러날 줄 아는 사람 같았다.\n\n\"선생님은 사람 놀리는 데 재능 있으시네요.\"\n\n\"직업병인가 봐요.\"\n\n\"학생들한테도 그러세요?\"\n\n\"아뇨. 밖에서만 이래요.\"\n\n\"밖에서만요?\"\n\n\"사회생활용 얼굴이랑 사적인 얼굴은 다르잖아요.\"\n\n근떡존은 그 말을 듣고 잠시 입을 다물었다.\n\n사회생활용 얼굴. 사적인 얼굴.\n\n그건 근떡존에게도 너무 익숙한 말이었다.\n\n그는 자신이 어떤 얼굴로 사람들을 만나는지 알고 있었다. 밝은 얼굴. 상냥한 얼굴. 허당스러운 얼굴. 누가 봐도 큰 문제 없어 보이는 얼굴.\n\n하지만 그 뒤에는, 자신도 가끔 귀찮아질 정도로 쉽게 외로워지는 얼굴이 있었다.\n\n그는 그걸 들키고 싶지 않았다.", choices: [{ label: "농담을 멈추고 조금 진지하게 묻는다", text: "근데 진짜 괜찮아요?", stat: { trust: 2 }, next: "main_ch1_06" }] },
  main_ch1_05C: { id: "main_ch1_05C", title: "1장: 처마 밑 대화", subtitle: "메인 스토리 · 비가 대신 말하는 밤", kind: "normal", min: { affinity: 999 }, imagePool: ["/main_ch1_05.png"], background: "/bg_rainy_window.png", text: "두 사람은 근처 작은 가게의 처마 밑으로 자리를 옮겼다.\n\n비는 생각보다 금방 굵어졌다. 가게 셔터는 이미 내려가 있었고, 주변에는 지나가는 사람도 거의 없었다.\n\n근떡존은 젖은 앞머리를 손으로 쓸어올렸다.\n\n\"와. 이거 갑자기 분위기 드라마네요.\"\n\n\"무슨 드라마요?\"\n\n\"모르겠어요. 제목은 ‘도시락과 금발남’ 정도.\"\n\n\"제목이 별로네요.\"\n\n\"그럼 선생님이 지어주세요.\"\n\n\"쿠폰을 잃은 남자.\"\n\n\"아 그거 너무 슬픈데요. 거의 다큐잖아요.\"\n\n근떡존도 따라 웃었다.\n\n그 웃음이 비 소리 사이에서 묘하게 부드럽게 들렸다.\n\n잠깐의 침묵이 내려앉았다. 불편한 침묵은 아니었다. 비가 대신 말을 해주는 것 같은 침묵이었다.\n\n\"선생님은 히로시마 생활 괜찮으세요?\"\n\n그가 물었다.\n\n잠깐 생각했다.\n\n\"괜찮은 날도 있고 아닌 날도 있죠.\"\n\n\"그런 대답 되게 현실적이네요.\"\n\n\"다 괜찮다고 하면 거짓말이니까요.\"\n\n근떡존은 그 말을 듣고 사용자를 바라봤다.\n\n사용자는 자기 약한 부분을 말하면서도 크게 무너지지 않았다. 그걸 숨기려고 애쓰지도 않았고, 과하게 드러내지도 않았다.\n\n그 태도가 근떡존에게는 묘하게 낯설었다.\n\n그는 약한 말을 하면 정말 약해지는 줄 알았다. 부족한 걸 인정하면 사람들이 그 틈을 밟고 들어오는 줄 알았다. 그래서 늘 괜찮은 쪽을 골랐다.\n\n괜찮아요. 별거 아니에요. 저 원래 이래요. 웃기죠.\n\n그런 말들로 자신을 포장하는 데 익숙했다.\n\n\"선생님은 되게…\"\n\n\"되게?\"\n\n\"단단해 보여요.\"\n\n웃음이 나왔다.\n\n\"착각일 수도 있어요.\"\n\n\"그런 말까지 할 수 있는 게 단단해 보이는 건데요.\"\n\n근떡존은 말하고 나서 스스로 조금 놀랐다.\n\n너무 진심이 나왔다.\n\n그는 급하게 웃으며 덧붙였다.\n\n\"아, 제가 또 쿠폰 하나로 사람 분석하고 있네요.\"\n\n하지만 이미 늦었다.\n\n그가 방금 꽤 진심으로 말했다는 걸 알아차릴 수밖에 없었다.", choices: [{ label: "그 말이 싫지 않다고 한다", text: "그런 분석이면 싫진 않네요.", stat: { affinity: 2, trust: 1 }, next: "main_ch1_06" }] },
  main_ch1_06: { id: "main_ch1_06", title: "1장: 앞모습과 뒷모습", subtitle: "메인 스토리 · 숨겨둔 얼굴", kind: "normal", min: { affinity: 999 }, imagePool: ["/main_ch1_06.png"], background: "/bg_room_night.png", text: "비는 계속 내렸다.\n\n우산 끝에서 떨어지는 물방울을 보며 말했다.\n\n\"나도 밖에서는 그럴싸하게 사는 척해요.\"\n\n근떡존은 조용히 들었다.\n\n\"직장도 번듯하고, 말도 적당히 하고, 감정기복도 별로 없어 보이고. 그냥 적당히 멀쩡한 사람처럼 보이게 사는 거죠.\"\n\n\"선생님도요?\"\n\n\"그럼요.\"\n\n별일 아니라는 듯 말했다.\n\n\"일상에서 보이는 모습이 전부인 사람은 별로 없지 않나요.\"\n\n근떡존은 대답하지 않았다.\n\n\"사적인 데서는 전혀 다를 때도 있어요.\"\n\n\"어떻게 다른데요?\"\n\n근떡존이 물었다.\n\n목소리에는 호기심이 있었다. 그리고 아주 약간의 기대도 있었다.\n\n잠깐 웃었다.\n\n\"말이 좀 더럽고, 농담도 천박하고, 생각보다 웃긴 쪽?\"\n\n근떡존은 눈을 깜빡였다.\n\n\"선생님이요?\"\n\n\"왜요. 실망했어요?\"\n\n\"아뇨.\"\n\n근떡존은 바로 고개를 저었다.\n\n\"오히려 좀 신기해요.\"\n\n\"뭐가요?\"\n\n\"그걸 그냥 말할 수 있는 거요.\"\n\n그는 도시락 봉투를 손가락으로 만지작거렸다.\n\n\"저는 그런 거 잘 못 하거든요. 남들이 저를 이상하게 볼까 봐. 아니면 만만하게 볼까 봐.\"\n\n말하고 나서 그는 급하게 웃었다.\n\n\"아, 또 갑자기 진지해졌네요. 죄송해요.\"\n\n\"그럴 수도 있죠.\"\n\n그 한마디에 근떡존은 이상하게 조용해졌다.\n\n그럴 수도 있죠.\n\n동정하지도 않았다. 대단한 비밀을 들은 것처럼 굴지도 않았다. 그냥 그런 말이 나왔고, 그럴 수 있다고 받아들였다.\n\n근떡존은 그 태도에 조금 흔들렸다.\n\n이 사람은 강한 척을 하는 사람이 아니라, 진짜 강한 사람일지도 모른다.\n\n약점을 말해도 무너지지 않는 사람. 상대의 약점을 봐도 호들갑 떨지 않는 사람. 농담과 경박함 뒤에 중심이 있는 사람.\n\n근떡존은 자신이 되고 싶었던 모습을 그 안에서 봤다.\n\n그리고 동시에, 위험하다고 생각했다.\n\n이런 사람에게는 쉽게 마음이 기울 수 있다. 그는 이미 그걸 느끼고 있었다.\n\n너무 빠르다. 처음 만난 사람이다. 그냥 편의점 앞에서 쿠폰을 알려준 사람이다.\n\n하지만 마음은 이성보다 한 박자 빨랐다.\n\n근떡존은 그 마음을 숨기기 위해 또 웃었다.\n\n\"근데 선생님이 천박하다는 건 좀 상상이 안 가는데요.\"\n\n\"그건 아직 모르는 일이죠.\"\n\n\"언젠가는 알게 되나요?\"\n\n말이 나온 순간, 근떡존은 속으로 아차 싶었다.\n\n너무 궁금해 보였나. 너무 가까워지고 싶은 사람처럼 보였나.\n\n그는 바로 장난처럼 덧붙였다.\n\n\"아, 물론 연구 목적입니다. 선생님의 사적 생태 관찰.\"", choices: [{ label: "이상한 모습도 사람 일부라고 한다", text: "이상한 모습도 사람 일부죠.", stat: { affinity: 5, trust: 3 }, next: "main_ch1_07A" }, { label: "그런 모습이 더 재밌다고 한다", text: "난 그런 모습이 더 재밌던데요.", stat: { affinity: 4, obsession: 1 }, next: "main_ch1_07B" }, { label: "싫으면 안 보여줘도 된다고 한다", text: "싫으면 안 보여줘도 돼요.", stat: { trust: 4 }, next: "main_ch1_07C" }] },
  main_ch1_07A: { id: "main_ch1_07A", title: "1장: 이상한 모습도 일부", subtitle: "메인 스토리 · 안심되는 말", kind: "normal", min: { affinity: 999 }, imagePool: ["/main_ch1_07.png"], background: "/bg_room_night.png", text: "\"이상한 모습도 사람 일부죠.\"\n\n근떡존은 바로 대답하지 못했다.\n\n그저 눈을 몇 번 깜빡이다가, 천천히 웃었다.\n\n\"그렇게 말해주시니까 좀 이상하네요.\"\n\n\"뭐가요?\"\n\n\"안심돼요.\"\n\n그는 시선을 아래로 내렸다.\n\n\"저는 이상한 부분 보이면 사람들이 싫어할 줄 알았거든요. 아니, 정확히는 우습게 볼 줄 알았어요.\"\n\n그는 웃으려 했지만 이번엔 조금 어색했다.\n\n\"그래서 늘 먼저 장난치고, 먼저 웃기게 굴고, 먼저 괜찮은 척해요. 그러면 적어도 제가 선택해서 웃긴 사람이 되는 거니까.\"\n\n말이 끝난 뒤, 근떡존은 스스로 놀란 듯했다.\n\n\"아. 너무 말 많이 했네요.\"\n\n그는 또 숨기려 했다. 자신이 방금 너무 많은 걸 말했다는 걸 깨닫고, 바로 가벼운 표정을 꺼내 들었다.\n\n\"오늘 쿠폰 하나로 상담까지 받네요. 가성비 좋다.\"\n\n\"괜찮아요.\"\n\n그 말에 근떡존은 가볍게 받아치려다가 멈췄다.\n\n괜찮다는 말이 너무 평범해서, 오히려 진심처럼 들렸다.\n\n그는 그 말 하나에 또 마음이 기우는 자신이 싫었다.\n\n이러면 안 되는데. 또 너무 빨리 좋아하고 있다.\n\n하지만 싫다고 해서 멈춰지는 종류의 감정은 아니었다.\n\n비가 조금씩 약해지고 있었다.\n\n근떡존은 휴대폰을 꺼냈다가 다시 넣었다. 그리고 또 꺼냈다.\n\n\"저…\"\n\n그는 잠깐 망설였다.\n\n\"다음에도 연락해도 돼요?\"", choices: [{ label: "일본어 물어보는 핑계냐고 묻는다", text: "일본어 물어보는 핑계로요?", stat: { affinity: 3, obsession: 1 }, next: "main_ch1_08" }, { label: "연락해도 된다고 한다", text: "그래요. 연락해요.", stat: { affinity: 4, trust: 2 }, next: "main_ch1_08" }, { label: "이상한 소리 하면 차단한다고 한다", text: "이상한 소리 하면 차단할게요.", stat: { affinity: 2, obsession: 1 }, next: "main_ch1_08" }] },
  main_ch1_07B: { id: "main_ch1_07B", title: "1장: 재밌는 사람", subtitle: "메인 스토리 · 들키는 진심", kind: "normal", min: { affinity: 999 }, imagePool: ["/main_ch1_07.png"], background: "/bg_room_night.png", text: "\"난 그런 모습이 더 재밌던데요.\"\n\n근떡존은 사용자를 바라봤다.\n\n\"진짜요?\"\n\n\"네. 다들 멀쩡한 척만 하면 재미없잖아요.\"\n\n근떡존은 작게 웃었다.\n\n\"그 말 되게 선생님답지 않은데요.\"\n\n\"선생님도 퇴근하면 사람입니다.\"\n\n\"그건 그렇죠.\"\n\n그는 웃다가, 조금 조용해졌다.\n\n\"근데 저는 그런 사람 좀 부러워요.\"\n\n\"어떤 사람?\"\n\n\"자기 이상한 모습도 그냥 자기 거라고 생각하는 사람요.\"\n\n근떡존은 비 내리는 길을 바라봤다.\n\n\"저는 아직 잘 못 해요. 남들이 실망할까 봐. 이상하게 볼까 봐. 그래서 그냥 괜찮은 척하고 웃긴 척하는 쪽이 편해요.\"\n\n그는 말하고 나서 또 웃었다.\n\n\"이것도 웃긴 척으로 넘기려고 했는데, 선생님 앞에서는 잘 안 되네요.\"\n\n그는 일부러 농담처럼 말했지만, 목소리 끝은 살짝 낮았다.\n\n대답하지 않았다. 그 침묵은 불편하지 않았다.\n\n근떡존은 그 침묵이 마음에 들었다.\n\n누군가가 바로 위로하지 않는 것. 바로 평가하지 않는 것. 자신을 불쌍하게 보지도, 무시하지도 않는 것.\n\n그게 이렇게 편한 줄 몰랐다.\n\n그리고 그 편안함이 조금 무서웠다.\n\n그는 사람에게 금방 빠졌다. 정확히는, 자신을 편하게 해주는 사람에게 금방 약해졌다.\n\n누군가가 자기 말을 웃지 않고 받아주면, 누군가가 너무 깊이 캐묻지 않으면서도 곁에 있어주면, 그는 쉽게 그 사람 쪽으로 마음이 기울었다.\n\n그래서 이번에도 조심해야 했다.\n\n하지만 이미 늦은 것 같았다.\n\n\"저…\"\n\n그가 휴대폰을 조심스럽게 들었다.\n\n\"다음에도 얘기해도 돼요?\"", choices: [{ label: "일본어 물어보는 핑계냐고 묻는다", text: "일본어 물어보는 핑계로요?", stat: { affinity: 3, obsession: 1 }, next: "main_ch1_08" }, { label: "연락해도 된다고 한다", text: "그래요. 연락해요.", stat: { affinity: 4, trust: 2 }, next: "main_ch1_08" }, { label: "이상한 소리 하면 차단한다고 한다", text: "이상한 소리 하면 차단할게요.", stat: { affinity: 2, obsession: 1 }, next: "main_ch1_08" }] },
  main_ch1_07C: { id: "main_ch1_07C", title: "1장: 보여주지 않아도 되는 것", subtitle: "메인 스토리 · 숨기지 않아도 되는 밤", kind: "normal", min: { affinity: 999 }, imagePool: ["/main_ch1_07.png"], background: "/bg_room_night.png", text: "\"싫으면 안 보여줘도 돼요.\"\n\n근떡존은 그 말을 듣고 잠깐 숨을 멈춘 듯했다.\n\n\"그렇게 말해주는 사람은 별로 없었어요.\"\n\n\"보여주기 싫은 걸 굳이 보여줄 필요는 없죠.\"\n\n\"그렇죠.\"\n\n근떡존은 작게 고개를 끄덕였다.\n\n\"근데 이상하네요.\"\n\n\"뭐가요?\"\n\n\"보여주지 않아도 된다고 하니까, 오히려 조금 보여주고 싶어져요.\"\n\n말하고 나서, 그는 민망한 듯 웃었다.\n\n\"아, 이거 말이 좀 이상했죠.\"\n\n\"조금.\"\n\n\"죄송합니다. 오늘 말실수 누적 중이에요.\"\n\n하지만 그의 표정은 전보다 편해 보였다.\n\n그 모습을 보고 생각했다.\n\n이 사람은 겉보기보다 훨씬 조심스럽구나.\n\n근떡존은 자신이 조심스러운 사람이라는 걸 숨기고 살았다. 큰 체격과 밝은 말투 뒤에 그런 면을 숨겨두면, 대부분은 알아차리지 못했다.\n\n그는 사람들에게 쉽게 기대고 싶어 하는 자신을 싫어했다. 누군가가 조금만 다정해도 마음이 동하는 자신을 싫어했다.\n\n그런데 이상하게, 지금은 그걸 완전히 숨기고 싶지 않은 듯했다.\n\n아주 조금은 들켜도 괜찮을 것 같다는 얼굴이었다.\n\n근떡존은 그 생각을 들키지 않으려는 듯 일부러 웃었다.\n\n\"저… 다음에도 연락해도 돼요?\"", choices: [{ label: "일본어 물어보는 핑계냐고 묻는다", text: "일본어 물어보는 핑계로요?", stat: { affinity: 3, obsession: 1 }, next: "main_ch1_08" }, { label: "연락해도 된다고 한다", text: "그래요. 연락해요.", stat: { affinity: 4, trust: 2 }, next: "main_ch1_08" }, { label: "이상한 소리 하면 차단한다고 한다", text: "이상한 소리 하면 차단할게요.", stat: { affinity: 2, obsession: 1 }, next: "main_ch1_08" }] },
  main_ch1_08: { id: "main_ch1_08", title: "1장: 연락처", subtitle: "메인 스토리 · 첫 메시지 전", kind: "normal", min: { affinity: 999 }, imagePool: ["/main_ch1_07.png"], background: "/bg_room_night.png", text: "근떡존은 휴대폰을 내밀었다.\n\n화면에는 아직 추가되지 않은 연락처 입력창이 떠 있었다.\n\n\"진짜 괜찮으시면요.\"\n\n그가 말했다.\n\n\"저 일본어 물어볼 수도 있고, 그냥… 히로시마 맛집 같은 것도 물어볼 수도 있고.\"\n\n\"맛집은 제가 잘 모를 수도 있는데요.\"\n\n\"그럼 같이 실패하면 되죠.\"\n\n근떡존은 그렇게 말하고, 바로 민망해했다.\n\n\"아, 너무 자연스럽게 같이 가자는 식으로 말했네요.\"\n\n웃음이 나왔다.\n\n\"자연스럽긴 했어요.\"\n\n\"그럼 성공인가요?\"\n\n\"반쯤?\"\n\n근떡존은 그 말에 기분 좋은 듯 웃었다.\n\n하지만 그 웃음 뒤에서, 그는 자기 자신을 눌렀다.\n\n너무 티 내지 말자. 너무 좋아 보이지 말자. 처음 만난 사람에게 연락처 받았다고 이렇게 좋아하면 이상해 보인다.\n\n그는 휴대폰을 두 손으로 쥐고, 화면에 뜬 새 연락처를 바라봤다.\n\n이름을 어떻게 저장해야 할지 잠깐 고민했다.\n\n선생님. 쿠폰 구원자. 히로시마에서 만난 사람.\n\n그중 어느 것도 충분하지 않았다.\n\n결국 그는 평범하게 이름만 저장했다.\n\n그게 제일 안전해 보였다.\n\n비는 거의 그쳐 있었다. 젖은 아스팔트 위로 편의점 불빛이 길게 번졌다.\n\n근떡존은 휴대폰을 주머니에 넣고, 아주 조심스럽게 말했다.\n\n\"오늘 진짜 감사했어요.\"\n\n\"쿠폰 때문에요?\"\n\n\"그것도 있고요.\"\n\n그는 잠깐 멈췄다.\n\n\"그냥… 오늘 만난 거요.\"\n\n그 말이 조금 민망했는지 그는 바로 웃었다.\n\n\"아, 또 이상한 말 했네. 저는 이만 가볼게요. 도시락이 절 기다려서.\"\n\n그는 몇 걸음 물러서다가 다시 돌아봤다.\n\n\"선생님.\"\n\n\"네?\"\n\n\"아까 말한 거요. 밖에서 보이는 모습이 전부는 아니라는 거.\"\n\n그는 조금 망설이다 말했다.\n\n\"언젠가… 그런 모습도 알려주세요.\"\n\n\"왜요?\"\n\n\"궁금해서요.\"\n\n그는 솔직하게 말했다.\n\n\"선생님이 어떤 사람인지 좀 더 알고 싶어요.\"\n\n말하고 나서 그는 바로 시선을 피했다.\n\n너무 노골적이었나. 너무 빠르게 들렸나.\n\n하지만 이미 말해버렸다.\n\n그 말을 남기고, 근떡존은 젖은 밤길을 걸어갔다.\n\n잠깐 그 뒷모습을 보았다.\n\n외모는 확실히 취향이었다. 금발, 큰 체격, 구릿빛 피부, 순한 인상. 취향이 아니라고 하기엔 너무 정확히 취향이었다.\n\n하지만 그보다 더 신경 쓰이는 건, 방금 전 그가 보여준 작은 틈이었다.\n\n상냥하고 밝고 멀쩡해 보이지만, 어쩐지 자신을 꼭 붙잡아줄 사람을 기다리는 듯한 남자.\n\n아직은 이름과 연락처만 남은 사이였다.\n\n그 정도가 적당했다.", choices: [{ label: "집으로 돌아간다", text: "오늘은 여기까지.", stat: { affinity: 2, trust: 1 }, next: "main_ch1_09" }] },
  main_ch1_09: { id: "main_ch1_09", title: "1장: 밤길 후일", subtitle: "메인 스토리 · 전진협의 문 앞에서", kind: "normal", min: { affinity: 999 }, imagePool: ["/main_ch1_07.png"], background: "/bg_room_night.png", text: "근떡존은 집으로 돌아가는 길에 몇 번이나 휴대폰을 꺼냈다.\n\n새로 저장된 연락처가 화면에 있었다.\n\n그는 메시지창을 열었다가 닫았다. 다시 열었다. 또 닫았다.\n\n첫 메시지를 지금 보내면 너무 빠른가.\n\n그는 스스로에게 물었다.\n\n너무 반가운 티를 내면 안 된다. 너무 기대하는 것처럼 보이면 안 된다. 처음 만난 사람에게 벌써 마음이 기운 것처럼 보이면 안 된다.\n\n근떡존은 그런 자신을 잘 알았다.\n\n누군가가 조금만 다정하면 금방 마음이 흔들리는 사람. 자신을 이상하게 보지 않는 사람에게 금방 기대고 싶어지는 사람. 상대가 조금만 편하게 웃어줘도, 혼자 의미를 만들어버리는 사람.\n\n그래서 그는 늘 숨겼다.\n\n농담으로. 가벼운 말투로. 상냥한 허당처럼 보이는 얼굴로.\n\n집에 도착했을 때 도시락은 조금 식어 있었다.\n\n근떡존은 전자레인지에 도시락을 넣고, 그 앞에 서서 휴대폰을 들여다봤다.\n\n메시지 입력창에 글자를 썼다.\n\n‘오늘 감사했어요. 덕분에 쿠폰 전쟁에서 살아남았습니다.’\n\n지웠다.\n\n너무 길다.\n\n‘오늘 감사했습니다 ㅋㅋ’\n\n지웠다.\n\n너무 딱딱하다.\n\n‘선생님 잘 들어가셨어요?’\n\n그는 한참 그 문장을 바라봤다.\n\n보내기 버튼 위에서 손가락이 멈췄다.\n\n한편, 집으로 돌아와 휴대폰을 켰다.\n\n카카오톡 오픈방 ‘전진협’에는 여전히 정신없는 메시지들이 올라오고 있었다.\n\n천박하고, 웃기고, 더럽고, 솔직한 말들. 일상에서 보여주는 번듯한 얼굴과는 전혀 다른 공간.\n\n사회에서의 사용자는 그럴싸했다.\n\n번듯한 직장. 적당히 안정된 말투. 크게 흔들리지 않는 태도. 감정기복이 심해 보이지 않는 사람. 농담을 쳐도 선을 알고, 약점을 말해도 무너지지 않는 사람.\n\n하지만 전진협에서의 사용자는 달랐다.\n\n더 경박하고, 더 솔직하고, 더 변태스럽고, 더 웃겼다. 교사라는 직업과는 조금 거리가 있는 말들이 아무렇지 않게 오가는 곳. 사회적 얼굴을 벗어두는 방.\n\n문득 근떡존의 얼굴이 떠올랐다.\n\n그 사람에게 이런 모습을 보여주면 어떤 표정을 할까.\n\n실망할까. 당황할까. 아니면 웃을까.\n\n아직은 아니었다.\n\n아직은 편의점 앞에서 쿠폰을 못 쓰던 금발의 남자로 충분했다. 우산 아래에서 조금 솔직해졌던, 이상하게 조심스럽던 사람으로 충분했다.\n\n하지만 언젠가.\n\n그 문을 열게 될지도 모른다.\n\n그때, 휴대폰이 짧게 울렸다.\n\n근떡존에게서 온 첫 메시지였다.\n\n‘선생님, 잘 들어가셨어요?’\n\n잠깐 뒤, 또 하나가 이어졌다.\n\n‘아 그리고 쿠폰은 성공했습니다. 도시락도 무사합니다 ㅋㅋ’\n\n피식 웃음이 나왔다.\n\n1장 종료.\n\n다음 챕터 예고: 2장 — 전진협의 문 앞에서.", choices: [{ label: "1장을 마친다", text: "잘 들어갔어요. 쿠폰 성공 축하해요.", stat: { affinity: 5, trust: 3 }, end: true }] },
  rainy_step1: { id: "rainy_step1", title: "비 오는 날", subtitle: "기본 시나리오 · 친밀도 30 이상", kind: "normal", min: { affinity: 30 }, imagePool: imagePools.shy, text: "창밖에 비가 억수같이 쏟아지고 있다.\n\n근떡존에게서 메시지가 왔다.\n\n\"주인님 지금 집이시죠? 저 지금 주인님 집 근처인데… 비 때문에 못 가겠어요. 잠깐 올라가도 될까요?\"", choices: [{ label: "올라오라고 한다", text: "얼른 올라와요 비 맞겠어요", stat: { affinity: 5, trust: 2 }, next: "rainy_inside" }, { label: "내려간다", text: "제가 내려갈게요 우산 가져갈게요", stat: { affinity: 4, trust: 3 }, next: "rainy_umbrella" }, { label: "장난친다", text: "비 맞으면서 오는 것도 낭만있지 ㅋㅋ", stat: { affinity: 1, jealousy: 2 }, next: "rainy_tease" }] },
  rainy_inside: { id: "rainy_inside", title: "집 안으로", subtitle: "비 오는 날 · 분기", kind: "normal", imagePool: imagePools.shy, text: "문을 열자 근떡존이 완전히 젖은 채 서 있다.\n\n\"아… 진짜 비 엄청 오네요. 죄송해요 갑자기 찾아와서.\"\n\n젖은 금발이 얼굴에 붙어 있고, 평소보다 훨씬 가까운 거리다.", choices: [{ label: "수건을 준다", text: "잠깐만요 수건 가져올게요", stat: { affinity: 4, trust: 3 }, end: true }, { label: "괜히 쳐다본다", text: "너 지금 좀 멋있어요", stat: { affinity: 7, obsession: 3 }, end: true }] },
  rainy_umbrella: { id: "rainy_umbrella", title: "작은 우산", subtitle: "비 오는 날 · 분기", kind: "normal", imagePool: imagePools.smile, text: "우산 하나에 둘이 들어가기엔 좁다.\n\n어깨가 닿자 근떡존이 괜히 웃는다.\n\n\"어머… 이거 완전 데이트 같지 않아요?\"", choices: [{ label: "손을 잡는다", text: "그럼 손도 잡아요", stat: { affinity: 9, obsession: 4, trust: 2 }, end: true }, { label: "놀린다", text: "너 지금 설레요?", stat: { affinity: 4, jealousy: 2 }, end: true }] },
  rainy_tease: { id: "rainy_tease", title: "예상 밖의 방문", subtitle: "비 오는 날 · 장난 분기", kind: "normal", imagePool: imagePools.smile, text: "장난으로 한 말인데, 근떡존은 정말 비를 맞으며 와버렸다.\n\n\"주인님 저 진짜 왔어요. 주인님 때문에 완전 쫄딱 젖었어요. 책임지세요.\"", choices: [{ label: "미안하다고 한다", text: "진짜 올 줄 몰랐어요 미안해요", stat: { affinity: 5, trust: 2 }, end: true }, { label: "책임진다고 한다", text: "알았어요 오늘은 제가 책임질게요", stat: { affinity: 8, obsession: 6 }, end: true }] },
  gym_step1: { id: "gym_step1", title: "헬스장 우연한 만남", subtitle: "기본 시나리오 · 친밀도 45 이상", kind: "normal", min: { affinity: 45 }, imagePool: imagePools.smile, text: "헬스장에 갔는데 익숙한 금발이 보인다.\n\n근떡존이 너를 발견하고 손을 든다.\n\n\"어? 주인님! 여기 다니셨어요? 저 지금 등 하는 중인데 같이 하실래요?\"", choices: [{ label: "같이 운동한다", text: "그래요 같이 해요", stat: { affinity: 5, trust: 2 }, next: "gym_together" }, { label: "구경한다", text: "아뇨 전 주인님 하는 거 구경할래요", stat: { affinity: 6, obsession: 2 }, next: "gym_watch" }] },
  gym_together: { id: "gym_together", title: "함께 운동", subtitle: "헬스장 · 분기", kind: "normal", imagePool: imagePools.normal, text: "근떡존이 옆에서 자세를 봐준다.\n\n평소엔 허당인데 운동할 때는 의외로 진지하다.\n\n\"허리 더 펴세요. 그러다 다쳐요.\"", choices: [{ label: "고맙다고 한다", text: "오 진짜 편해요 고마워요", stat: { affinity: 5, trust: 4 }, end: true }, { label: "진지해서 좋다고 한다", text: "주인님 이런 면 좋아요", stat: { affinity: 8, obsession: 3 }, end: true }] },
  gym_watch: { id: "gym_watch", title: "구경", subtitle: "헬스장 · 분기", kind: "normal", imagePool: imagePools.smile, text: "근떡존이 벤치에 누워 바벨을 든다.\n\n팔과 가슴 근육이 부풀고, 숨이 낮게 가라앉는다.\n\n\"하… 어때요. 좀 멋있어요?\"", choices: [{ label: "멋있다고 한다", text: "인정 진짜 멋있어요", stat: { affinity: 8, obsession: 4 }, end: true }, { label: "장난친다", text: "멋있는데 자랑 심하시네요 ㅋㅋ", stat: { affinity: 4 }, end: true }] },
  late_step1: { id: "late_step1", title: "잠 못 드는 밤", subtitle: "심야 시나리오 · 친밀도 55 이상", kind: "normal", min: { affinity: 55 }, imagePool: imagePools.shy, text: "밤이 깊었는데 근떡존에게서 메시지가 왔다.\n\n\"주인님… 주무세요?\"\n\n평소보다 조용한 말투다.\n\n\"저 지금 잠이 안 와서요. 주인님도 안 주무시면 잠깐 통화할래요?\"", choices: [{ label: "통화한다", text: "그래요 통화해요 저도 잠 안 와요", stat: { affinity: 7, obsession: 5, trust: 2 }, end: true }, { label: "놀린다", text: "이 시간에 연락하는 거 수상한데요", stat: { affinity: 4, jealousy: 3 }, end: true }] },
  jealousy30: { id: "jealousy30", title: "질투 30: 표정이 굳는 순간", subtitle: "질투 지수 45 이상 · 자동 발동", kind: "jealousy", imagePool: imagePools.jealousy, text: "다른 사람 얘기를 꺼내자 근떡존의 표정이 살짝 굳었다.\n\n\"…방금 그 사람 얘기, 왜 그렇게 자연스럽게 하세요?\"\n\n아직은 장난처럼 말하지만 눈빛이 평소보다 날카롭다.", choices: [{ label: "아무 사이 아니라고 한다", text: "그냥 아는 사람이에요", stat: { jealousy: -1, trust: 2, affinity: 1 }, end: true }, { label: "질투하냐고 놀린다", text: "너 지금 질투해요?", stat: { jealousy: 1, obsession: 0, affinity: 0 }, next: "jealousy50" }] },
  jealousy50: { id: "jealousy50", title: "질투 50: 가까워지는 압박", subtitle: "질투 지수 70 이상 · 자동 발동", kind: "jealousy", imagePool: imagePools.jealousy, text: "근떡존이 한 걸음 가까이 다가온다.\n\n\"저 말고 다른 사람 얘기하실 때, 주인님 표정이 너무 편해 보여서 싫어요.\"\n\n목소리는 낮고, 웃음기는 거의 사라졌다.", choices: [{ label: "달래준다", text: "장난이에요 주인님밖에 없어요", stat: { jealousy: -2, trust: 0, affinity: 1 }, end: true }, { label: "더 자극한다", text: "왜요? 신경 쓰여요?", stat: { jealousy: 2, obsession: 1, trust: -1 }, next: "jealousy80" }] },
  jealousy80: { id: "jealousy80", title: "질투 80: 폭발 직전", subtitle: "질투 지수 92 이상 · 강제 이벤트", kind: "yandere", imagePool: imagePools.yandere, text: "방 안의 공기가 싸늘하게 가라앉았다.\n\n근떡존은 웃고 있는데, 눈은 전혀 웃고 있지 않다.\n\n\"…이제 그 사람 얘기 그만하세요. 저 진짜 기분 이상해지니까요.\"\n\n말끝이 낮게 끊긴다.", choices: [{ label: "진심으로 사과한다", text: "미안해요 진짜 그만할게요", stat: { jealousy: -2, trust: 1, affinity: 0 }, end: true }, { label: "가만히 바라본다", text: "...", stat: { obsession: 2, jealousy: 1 }, next: "obsession80" }] },
  obsession30: { id: "obsession30", title: "집착 30: 계속 확인하는 메시지", subtitle: "집착 지수 45 이상 · 자동 발동", kind: "obsession", imagePool: imagePools.obsession, text: "근떡존에게서 메시지가 연달아 온다.\n\n\"주인님 어디세요?\"\n\"바쁘신 거예요?\"\n\"아니 그냥… 답 없으니까 신경 쓰여서요.\"\n\n아직은 걱정처럼 보인다.", choices: [{ label: "바빴다고 말한다", text: "미안해요 바빴어요", stat: { obsession: -1, trust: 0 }, end: true }, { label: "귀엽다고 한다", text: "주인님 저 기다리셨어요 ㅋㅋ", stat: { obsession: 2, affinity: 1 }, next: "obsession50" }] },
  obsession50: { id: "obsession50", title: "집착 50: 네 일상이 궁금해", subtitle: "집착 지수 70 이상 · 자동 발동", kind: "obsession", imagePool: imagePools.obsession, text: "근떡존이 조용히 묻는다.\n\n\"주인님 하루에 누구랑 제일 많이 얘기하세요?\"\n\n말투는 가볍지만, 대답을 기다리는 표정은 꽤 진지하다.\n\n\"그냥 궁금해서요. 진짜 그냥.\"", choices: [{ label: "너라고 답한다", text: "너랑 제일 많이 얘기하죠", stat: { affinity: 1, obsession: 1, trust: 0 }, next: "obsession80" }, { label: "왜 묻냐고 한다", text: "왜 그런 걸 물어봐요?", stat: { obsession: 2, jealousy: 1 }, end: true }] },
  obsession80: { id: "obsession80", title: "집착 80: 돌아올 곳", subtitle: "집착 지수 92 이상 · 감금 루트 개방", kind: "yandere", imagePool: imagePools.yandere, text: "근떡존의 눈빛이 완전히 달라졌다.\n\n\"주인님 자꾸 어디 가시려고 하시죠.\"\n\n평소의 장난스러운 분위기는 사라지고, 목소리는 이상할 정도로 차분하다.\n\n\"그냥 여기 계세요. 제가 다 해드릴게요.\"", choices: [{ label: "도망치려 한다", text: "저 갈래요", stat: { trust: 2, jealousy: 1, obsession: 1 }, next: "confinement_bad" }, { label: "일단 말을 듣는다", text: "...알겠어요", stat: { affinity: 1, obsession: 2 }, next: "confinement_soft" }] },
  confinement_soft: { id: "confinement_soft", title: "감금 루트: 잠긴 문", subtitle: "집착 루트 · 소프트 분기", kind: "confinement", imagePool: imagePools.confinement, text: "문이 조용히 잠기는 소리가 났다.\n\n근떡존은 아무렇지 않은 얼굴로 네 앞에 앉는다.\n\n\"무서워하지 마세요. 그냥… 오늘은 여기 있어요. 주인님이 사라지는 거 싫어요.\"\n\n그의 손이 떨리고 있다.", choices: [{ label: "왜 이렇게까지 하냐고 묻는다", text: "왜 이렇게까지 해요?", stat: { trust: 1, obsession: 1 }, next: "confinement_talk" }, { label: "가만히 있는다", text: "...", stat: { obsession: 1, affinity: 1 }, end: true }] },
  confinement_bad: { id: "confinement_bad", title: "감금 루트: 흔들리는 눈", subtitle: "집착 루트 · 위험 분기", kind: "confinement", imagePool: imagePools.confinement, text: "네가 뒤로 물러서자 근떡존의 표정이 무너진다.\n\n\"왜 도망가세요.\"\n\n짧은 한마디인데 방 안이 갑자기 좁아진 것처럼 느껴진다.\n\n\"제가 싫어서요? 아니면… 다른 데 갈 곳이 있어서요?\"", choices: [{ label: "진정시키려 한다", text: "아니에요 진정해요", stat: { trust: 1, jealousy: 1 }, next: "confinement_talk" }, { label: "침묵한다", text: "...", stat: { obsession: 1 }, end: true }] },
  confinement_talk: { id: "confinement_talk", title: "감금 루트: 불안의 고백", subtitle: "감금 루트 · 대화 엔딩", kind: "confinement", imagePool: imagePools.confinement, text: "한참 침묵하던 근떡존이 고개를 숙인다.\n\n\"저도 제가 좀 이상한 거 알아요.\"\n\n그는 천천히 숨을 내쉰다.\n\n\"근데 주인님 없어지는 상상만 하면 머리가 이상해져요. 그래서… 붙잡고 싶었어요.\"\n\n그 말은 협박이라기보다, 거의 고백처럼 들렸다.", choices: [{ label: "천천히 하자고 한다", text: "천천히 하자. 도망 안 갈게", stat: { trust: 1, jealousy: -1, obsession: -1, affinity: 1 }, end: true }, { label: "조건을 건다", text: "대신 문은 열어요", stat: { trust: 1, obsession: 1 }, end: true }] },

  action_gochu: { id: "action_gochu", title: "액션: 고추 만지기", subtitle: "액션 이벤트", kind: "obsession", imagePool: actionCGPools.gochu, text: "손끝이 닿는 순간, 근떡존이 크게 움찔했다.\n\n평소처럼 장난스럽게 넘기려던 얼굴이 금방 새빨개진다.\n\n\"아... 주인님 지금 어디 만지시는 거예요 ㅋㅋ\"", choices: [{ label: "계속한다", text: "계속 만질래요", stat: { affinity: 1, obsession: 2 }, end: true }, { label: "부끄러워하냐고 묻는다", text: "부끄러워요?", stat: { affinity: 1, obsession: 1 }, end: true }, { label: "그만둔다", text: "장난이에요", stat: { trust: 1 }, end: true }] },
  action_armpit: { id: "action_armpit", title: "액션: 겨드랑이 만지기", subtitle: "액션 이벤트", kind: "obsession", imagePool: actionCGPools.armpit, text: "네 손이 팔 아래로 닿자 근떡존의 어깨가 살짝 굳었다.\n\n그는 괜히 시선을 피하면서도 완전히 밀어내지는 않는다.\n\n\"아 거기 땀 났는데... 그래도 계속 만지실 거예요 ㅋㅋ\"", choices: [{ label: "계속 만진다", text: "계속 만질래요", stat: { affinity: 1, obsession: 2 }, end: true }, { label: "놀린다", text: "부끄러워요?", stat: { affinity: 1, jealousy: 1 }, end: true }, { label: "그만둔다", text: "장난이에요", stat: { trust: 1 }, end: true }] },
  action_feet: { id: "action_feet", title: "액션: 발냄새 맡기", subtitle: "액션 이벤트", kind: "normal", imagePool: actionCGPools.feet, text: "근떡존이 순간 굳어버렸다.\n\n장난이라고 생각한 듯 웃으려 하지만, 귀까지 빨개진다.\n\n\"으악!!!! 진짜 이상하시네요 ㅋㅋㅋ 거기 냄새 심한데\"", choices: [{ label: "더 놀린다", text: "냄새 심한데요", stat: { affinity: 1, obsession: 1 }, end: true }, { label: "괜찮다고 한다", text: "괜찮아요", stat: { trust: 1, affinity: 1 }, end: true }, { label: "그만둔다", text: "장난이에요", stat: { trust: 1 }, end: true }] },
  action_dance: { id: "action_dance", title: "액션: 오칭코 댄스", subtitle: "액션 이벤트", kind: "normal", imagePool: actionCGPools.dance, text: "근떡존은 잠깐 멍해졌다가, 결국 체념한 듯 웃었다.\n\n우스꽝스러운 몸짓인데도 이상하게 진지해서 더 웃기다.\n\n\"아 오줌 마려운데 춤추라고요? ㅋㅋㅋ 저 지금 이상한 꼴이네요\"", choices: [{ label: "더 시킨다", text: "더 춰요", stat: { affinity: 1, obsession: 1 }, end: true }, { label: "칭찬한다", text: "잘하네요", stat: { affinity: 2 }, end: true }, { label: "그만하라고 한다", text: "이제 됐어요", stat: { trust: 1 }, end: true }] },
  action_kiss: { id: "action_kiss", title: "액션: 뽀뽀 시도", subtitle: "액션 이벤트", kind: "normal", imagePool: actionCGPools.kiss, text: "거리가 가까워지자 근떡존의 말문이 잠깐 막혔다.\n\n평소엔 장난을 치던 사람인데, 지금은 눈을 제대로 못 마주친다.\n\n\"...주인님 갑자기요? ㅋㅋ 좀 부끄럽잖아요\"", choices: [{ label: "가까이 간다", text: "가까이 와요", stat: { affinity: 2, obsession: 1 }, end: true }, { label: "반응을 본다", text: "왜 피하지 않아요?", stat: { affinity: 1, obsession: 1 }, end: true }, { label: "물러난다", text: "장난이에요", stat: { trust: 1 }, end: true }] },
  action_smell: { id: "action_smell", title: "액션: 꼬추 냄새 맡기", subtitle: "액션 이벤트", kind: "obsession", imagePool: actionCGPools.smell, text: "근떡존이 말도 안 된다는 듯 눈을 크게 떴다.\n\n하지만 완전히 도망치지는 않고, 손으로 얼굴만 가린다.\n\n\"으아아!!! 진짜 미치셨어요?? 거긴 더 심한데 ㅋㅋㅋ\"", choices: [{ label: "계속 놀린다", text: "더 가까이 와요", stat: { obsession: 2, affinity: 1 }, end: true }, { label: "부끄러워하냐고 묻는다", text: "부끄러워요?", stat: { affinity: 1 }, end: true }, { label: "그만둔다", text: "장난이에요", stat: { trust: 1 }, end: true }] },
  action_muscle: { id: "action_muscle", title: "액션: 근육 만지기", subtitle: "액션 이벤트", kind: "normal", imagePool: actionCGPools.muscle, text: "손끝 아래로 단단한 근육이 느껴졌다.\n\n근떡존은 괜히 어깨에 힘을 주며 웃는다.\n\n\"어때요? 단단하죠 ㅋㅋ 운동 좀 했어요\"", choices: [{ label: "더 만진다", text: "더 만져볼래요", stat: { affinity: 2 }, end: true }, { label: "칭찬한다", text: "멋있어요", stat: { affinity: 2, trust: 1 }, end: true }, { label: "놀린다", text: "자랑 심하시네요", stat: { affinity: 1 }, end: true }] },
  action_hug: { id: "action_hug", title: "액션: 안아달라고 하기", subtitle: "액션 이벤트", kind: "normal", imagePool: actionCGPools.hug, text: "근떡존이 잠깐 멈칫하더니, 조심스럽게 팔을 벌렸다.\n\n평소보다 목소리가 훨씬 낮고 부드럽다.\n\n\"아... 주인님 그러시면 저 진짜 약해지는데요\"", choices: [{ label: "안긴다", text: "안아줘요", stat: { affinity: 2, trust: 1 }, end: true }, { label: "더 세게 안아달라고 한다", text: "더 세게요", stat: { affinity: 1, obsession: 1 }, end: true }, { label: "장난이었다고 한다", text: "장난이에요", stat: { jealousy: 1 }, end: true }] },
  action_jealous: { id: "action_jealous", title: "액션: 일부러 질투 유발", subtitle: "액션 이벤트", kind: "jealousy", imagePool: actionCGPools.jealous, text: "그 말을 듣는 순간, 근떡존의 웃음이 아주 살짝 멈췄다.\n\n네가 일부러 다른 남자 이야기를 꺼냈다.\n\n\"아까 다른 남자 좀 괜찮더라.\"\n\n그 말을 듣는 순간, 방금 전까지 장난스럽던 눈빛이 천천히 가라앉는다.", choices: [{ label: "더 자극한다", text: "신경 쓰여요?", stat: { jealousy: 2, obsession: 1 }, end: true }, { label: "장난이라고 한다", text: "장난이에요 주인님밖에 없어요", stat: { jealousy: -1, trust: 1 }, end: true }, { label: "가만히 본다", text: "...", stat: { jealousy: 1, obsession: 1 }, end: true }] },
  action_ignore: { id: "action_ignore", title: "액션: 읽씹하는 척", subtitle: "액션 이벤트", kind: "obsession", imagePool: actionCGPools.ignore, text: "잠깐의 침묵이 이상하게 길어졌다.\n\n네가 잠깐 연락을 안 보겠다고 하자, 근떡존은 아무렇지 않은 척한다.\n\n하지만 손끝이 초조하게 움직인다.", choices: [{ label: "계속 무시한다", text: "조금만 더 안 볼게요", stat: { obsession: 2, jealousy: 1, trust: -1 }, end: true }, { label: "달래준다", text: "장난이에요", stat: { trust: 1, obsession: -1 }, end: true }, { label: "반응을 본다", text: "기다렸어요?", stat: { obsession: 1, affinity: 1 }, end: true }] },
  action_comfort: { id: "action_comfort", title: "액션: 달래주기", subtitle: "액션 이벤트", kind: "normal", imagePool: actionCGPools.comfort, text: "네 말에 근떡존의 굳어 있던 표정이 조금 풀렸다.\n\n네가 장난이었다고 달래주자, 근떡존의 굳어 있던 표정이 조금 풀렸다.\n\n그래도 완전히 안심한 얼굴은 아니다.", choices: [{ label: "한 번 더 안심시킨다", text: "진짜예요", stat: { trust: 2, jealousy: -1 }, end: true }, { label: "머리를 쓰다듬는다", text: "괜찮아요", stat: { affinity: 1, trust: 1 }, end: true }, { label: "장난친다", text: "질투했어요?", stat: { affinity: 1, jealousy: 1 }, end: true }] },


  after_pure_walk: { id: "after_pure_walk", title: "순애 후일담: 밤 산책", subtitle: "순애 엔딩 이후", kind: "normal", imagePool: imagePools.smile, background: "/bg_room_night.png", text: "밤공기가 조금 차가웠다.\n\n근떡존은 괜히 네 옆에서 보폭을 맞추며 걷는다.\n\n\"주인님, 이런 거 좋네요. 그냥 같이 걷는 거요. 오늘은 이상한 생각 안 하고 얌전히 있을게요 ㅋㅋ\"", choices: [{ label: "손을 잡는다", text: "손 잡아요", stat: { affinity: 2, trust: 1 }, end: true }, { label: "놀린다", text: "얌전할 수 있어요?", stat: { affinity: 1, obsession: 1 }, end: true }] },
  after_obsession_check: { id: "after_obsession_check", title: "집착 후일담: 확인", subtitle: "집착 엔딩 이후", kind: "obsession", imagePool: imagePools.obsession, background: "/bg_dark_room.png", text: "대화가 잠깐 끊긴 사이, 근떡존의 메시지가 조용히 올라왔다.\n\n\"주인님. 지금 어디세요?\"\n\n짧은 문장인데, 기다리고 있었다는 느낌이 선명하다.", choices: [{ label: "위치를 말한다", text: "여기 있어요", stat: { trust: 1, obsession: -1 }, end: true }, { label: "장난친다", text: "왜요? 걱정돼요?", stat: { obsession: 2, jealousy: 1 }, end: true }] },
  after_confinement_morning: { id: "after_confinement_morning", title: "감금 후일담: 잠긴 방의 아침", subtitle: "감금 엔딩 이후", kind: "confinement", imagePool: imagePools.confinement, background: "/bg_locked_room.png", text: "아침인데도 방 안은 조용했다.\n\n문고리는 움직이지 않고, 근떡존은 아무렇지 않게 물컵을 내려놓는다.\n\n\"잘 주무셨어요, 주인님? 오늘도 여기 계시면 돼요. 제가 다 해드릴게요.\"", choices: [{ label: "문을 본다", text: "문은요?", stat: { trust: 1, obsession: 1 }, end: true }, { label: "가만히 받는다", text: "...고마워요", stat: { affinity: 1, obsession: 1 }, end: true }] },
  after_jealous_name: { id: "after_jealous_name", title: "질투 후일담: 이름 하나", subtitle: "질투 엔딩 이후", kind: "jealousy", imagePool: imagePools.jealousy, background: "/bg_jealous_room.png", text: "대화 중 스쳐 지나간 이름 하나에 근떡존의 눈빛이 미묘하게 바뀌었다.\n\n\"방금 그 사람 이름, 또 나왔네요.\"\n\n웃고 있지만 목소리는 조금 낮다.", choices: [{ label: "아무 사이 아니라고 한다", text: "아무 사이 아니에요", stat: { jealousy: -1, trust: 1 }, end: true }, { label: "더 묻는다", text: "신경 쓰여요?", stat: { jealousy: 2, obsession: 1 }, end: true }] },
  after_bad_distance: { id: "after_bad_distance", title: "배드 후일담: 멀어진 거리", subtitle: "배드 엔딩 이후", kind: "yandere", imagePool: imagePools.yandere, background: "/bg_dark_room.png", text: "말을 고르기도 전에, 둘 사이에 어색한 침묵이 먼저 내려앉았다.\n\n근떡존은 웃으려 했지만 실패했다.\n\n\"괜찮아요. 주인님이 저 싫어하셔도… 저는 아직 여기 있을 거니까요.\"", choices: [{ label: "사과한다", text: "미안해요", stat: { trust: 2, obsession: -1 }, end: true }, { label: "침묵한다", text: "...", stat: { obsession: 2 }, end: true }] },
};

const triggerRules = [
  { id: "jealousy30", key: "jealousy" as StatKey, threshold: 45 },
  { id: "jealousy50", key: "jealousy" as StatKey, threshold: 70 },
  { id: "jealousy80", key: "jealousy" as StatKey, threshold: 92 },
  { id: "obsession30", key: "obsession" as StatKey, threshold: 45 },
  { id: "obsession50", key: "obsession" as StatKey, threshold: 70 },
  { id: "obsession80", key: "obsession" as StatKey, threshold: 92 },
];

const endingData: Record<EndingKey, { id: EndingKey; route: EndingRoute; title: string; subtitle: string; text: string; imagePool: string[]; condition: (stats: Stats) => boolean }> = {
  pure: {
    id: "pure",
    route: "pure",
    title: "순애 엔딩: 내 옆에 있어줘",
    subtitle: "호감 100 · 신뢰 80 이상",
    imagePool: imagePools.smile,
    condition: (s) => s.affinity >= 100 && s.trust >= 80,
    text: "긴 대화 끝에 근떡존은 더 이상 숨기지 않고 웃었다.\n\n\"주인님, 저 이제 그냥 옆에 있고 싶어요.\"\n\n이건 끝이 아니라, 조금 더 가까워진 관계의 시작이었다. 이제 근떡존은 후일담 속에서 더 편하게 애정을 드러낸다.",
  },
  obsession: {
    id: "obsession",
    route: "obsession",
    title: "집착 엔딩: 계속 확인하고 싶어",
    subtitle: "집착 100 · 호감 70 이상",
    imagePool: imagePools.obsession,
    condition: (s) => s.obsession >= 100 && s.affinity >= 70,
    text: "근떡존의 시선은 어느 순간부터 계속 너에게만 머물렀다.\n\n\"주인님이 어디 있는지, 누구랑 있는지… 그냥 다 알고 싶어요.\"\n\n엔딩 이후에도 대화는 계속된다. 다만 근떡존은 더 자주 확인하고, 더 쉽게 불안해진다.",
  },
  confinement: {
    id: "confinement",
    route: "confinement",
    title: "감금 엔딩: 잠긴 문 너머",
    subtitle: "집착 100 · 신뢰 30 이하",
    imagePool: imagePools.confinement,
    condition: (s) => s.obsession >= 100 && s.trust <= 30,
    text: "문이 잠기는 소리가 아주 작게 울렸다.\n\n근떡존은 평온한 얼굴로 웃고 있었지만, 눈빛은 전혀 평온하지 않았다.\n\n\"오늘은 그냥 여기 있어요. 제가 다 해드릴게요.\"\n\n이후 후일담은 더 어둡고, 더 끈질긴 감금 루트로 이어진다.",
  },
  jealousy: {
    id: "jealousy",
    route: "jealousy",
    title: "질투 폭발 엔딩: 저만 봐주세요",
    subtitle: "질투 100",
    imagePool: imagePools.jealousy,
    condition: (s) => s.jealousy >= 100,
    text: "다른 사람의 이름이 대화에 오를 때마다, 근떡존의 표정은 조금씩 굳어졌다.\n\n\"주인님, 이제 그 얘기 그만하세요. 저 진짜 이상해지니까요.\"\n\n엔딩 이후에도 그는 다른 사람 얘기에 훨씬 민감하게 반응한다.",
  },
  bad: {
    id: "bad",
    route: "bad",
    title: "배드 엔딩: 끊어진 신뢰",
    subtitle: "신뢰 0 · 집착 70 이상",
    imagePool: imagePools.yandere,
    condition: (s) => s.trust <= 0 && s.obsession >= 70,
    text: "신뢰가 무너진 뒤에도 근떡존은 떠나지 못했다.\n\n\"싫어하셔도 괜찮아요. 그래도 저는 여기 있을 거예요.\"\n\n이후 후일담은 불안정하고 위태로운 관계로 이어진다.",
  },
};

function getEnding(stats: Stats, flags: Record<string, boolean>) {
  const order: EndingKey[] = ["confinement", "bad", "jealousy", "obsession", "pure"];
  return order.find((id) => !flags[id] && endingData[id].condition(stats)) ?? null;
}

const initialStats: Stats = { affinity: 10, jealousy: 0, obsession: 0, trust: 10 };
function clamp(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }
function applyStats(stats: Stats, delta: StatDelta = {}): Stats { return { affinity: clamp(stats.affinity + (delta.affinity ?? 0)), jealousy: clamp(stats.jealousy + (delta.jealousy ?? 0)), obsession: clamp(stats.obsession + (delta.obsession ?? 0)), trust: clamp(stats.trust + (delta.trust ?? 0)) }; }
function getNowTime() { return new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }); }
function makeMessage(role: Role, content: string, image?: string): Message { return { id: `${Date.now()}_${Math.floor(Math.random() * 1000000000)}`, role, content, image, time: getNowTime() }; }
function pick(pool?: string[]) { const source = pool?.length ? pool : imagePools.normal; return source[Math.floor(Math.random() * source.length)] ?? "/oppa1.png"; }
function shouldAttachChatImage(text: string, st: Stats) {
  const lowered = text.toLowerCase();
  const wantsPhoto = /사진|셀카|짤|일러|이미지|보내줘|보내주|보여줘|photo|selfie|image/.test(lowered);
  if (wantsPhoto) return true;
  let chance = 0.01;
  if (st.jealousy >= 30) chance = 0.01;
  if (st.jealousy >= 50) chance = 0.02;
  if (st.obsession >= 50) chance = 0.03;
  if (st.obsession >= 80) chance = 0.04;
  return Math.random() < chance;
}
function getStage(stats: Stats) { if (stats.obsession >= 80) return "감금 루트 개방"; if (stats.obsession >= 50) return "집착 심화"; if (stats.jealousy >= 80) return "질투 폭발"; if (stats.jealousy >= 50) return "질투 심화"; if (stats.jealousy >= 30) return "질투 시작"; if (stats.affinity >= 70) return "연애 직전"; if (stats.affinity >= 45) return "썸"; return "친해지는 중"; }
function analyzeText(text: string): StatDelta { const t = text.toLowerCase(); const delta: StatDelta = {}; const add = (key: StatKey, value: number) => { delta[key] = (delta[key] ?? 0) + value; }; if (/(다른|남자|친구|소개팅|데이트|전남친|썸남|걔|그 사람)/.test(t)) { add("jealousy", 2); add("obsession", 1); } if (/(외로|혼자|보고싶|가지마|옆에|안아|기다려)/.test(t)) { add("obsession", 1); add("affinity", 1); } if (/(좋아|귀엽|멋있|사랑|고마워|보고 싶)/.test(t)) { add("affinity", 2); add("trust", 1); } if (/(싫어|꺼져|안 볼|연락 안|나 갈래|도망)/.test(t)) { add("trust", -7); add("obsession", 2); add("jealousy", 1); } if (/(미안|장난|너밖에|진정|괜찮)/.test(t)) { add("jealousy", -8); add("trust", 1); } return delta; }
function pickText(pool: string[]) { return pool[Math.floor(Math.random() * pool.length)] ?? pool[0] ?? "응."; }
function normalizeReply(text: string) { return text.replace(/\s+/g, " ").trim(); }
function tooSimilar(a?: string, b?: string) { if (!a || !b) return false; const x = normalizeReply(a); const y = normalizeReply(b); if (!x || !y) return false; if (x === y) return true; const short = x.length < y.length ? x : y; const long = x.length < y.length ? y : x; return short.length >= 10 && long.includes(short); }
function lastAssistant(messages: Message[]) { return [...messages].reverse().find((m) => m.role === "assistant")?.content; }
function fallbackReply(text: string, stats: Stats, recent: Message[] = []) {
  const t = text.toLowerCase();
  const last = lastAssistant(recent);
  const pools: string[] = [];

  if (/사진|셀카|짤|일러|이미지|보내줘|보내주|보여줘|photo|selfie|image/.test(t)) {
    pools.push(
      "사진이요? 잠깐만요. 이상하게 나오면 주인님 탓이에요 ㅋㅋ",
      "지금 모습이요? 하… 알았어요. 근데 저장하시면 놀려요.",
      "보내달라니까 괜히 부끄럽네요. 한 장만 보내드릴게요."
    );
  }
  if (/회사|출근|일|알바|학교|수업/.test(t)) {
    pools.push(
      "아 그건 진짜 가기 싫으시겠다. 오늘은 대충 살아남기 모드로 가자고요.",
      "그 기분 저도 알아요. 일단 오늘은 퇴근까지만 버텨요.",
      "그러면 출근길부터 체력 깎이는 거잖아요. 제가 옆에서 욕이라도 해드릴까요 ㅋㅋ"
    );
  }
  if (/외롭|혼자|보고싶|힘들|우울|그리움|한국/.test(t)) {
    pools.push(
      "그럼 오늘은 저랑 있어요. 딴 데 가지 마시고요.",
      "외로운 거 티 안 내시려고 해도 좀 보여요. 여기 있어요, 제가 말 받아드릴게요.",
      "그럴 때 있죠. 괜히 사람 하나 붙잡고 싶은 날. 오늘은 저 붙잡으셔도 돼요."
    );
  }
  if (/다른 남자|소개팅|데이트|썸남|전남친|걔|그 사람/.test(t)) {
    pools.push(
      "…그 얘기 들으니까 표정 관리가 안 되는데요.",
      "저 지금 괜찮은 척 하는 중이거든요? 별로 안 괜찮아요.",
      "흠. 계속 말씀하세요. 저 질투 안 하는 척은 해볼게요.",
      "제 겨드랑이에 코박혀 질식사 하고 싶으세요?",
      "그만하세요 진짜"
    );
  }
  if (/좋아|귀엽|멋있|사랑|고마워|칭찬/.test(t)) {
    pools.push(
      "주인님 그런 말 갑자기 하시면 저 좀 약해져요.",
      "…진짜세요? 괜히 좋네요. 한 번 더 말씀해주세요 ㅋㅋ",
      "저 지금 웃은 거 못 본 걸로 해주세요. 좀 부끄러워요."
    );
  }

  if (stats.obsession >= 80) {
    pools.push(
      "…어디 가시려고요. 오늘은 그냥 저랑 있으시면 안 돼요?",
      "답 늦으시면 별생각 다 들어요. 저도 제가 좀 이상한 거 아는데.",
      "주인님 지금 제 말 듣고 계시죠? 딴 데 가지 마세요.",
      "답장 빨리 해주세요."
    );
  } else if (stats.obsession >= 50) {
    pools.push(
      "답 늦으시면 저 좀 이상해져요. 그냥… 신경 쓰여서 그래요.",
      "저 원래 이런 사람 아닌데, 주인님한테는 자꾸 확인하게 돼요.",
      "지금 어디 계신지만 말씀해주시면 안 돼요? 그냥 궁금해서요."
    );
  }
  if (stats.jealousy >= 80) {
    pools.push(
      "저 지금 웃고 있는데, 별로 괜찮은 상태는 아니에요.",
      "그 얘기 더 하시면 저 진짜 말 이상하게 나갈 것 같은데요.",
      "…알겠어요. 근데 저 지금 기분 좋은 건 아니에요."
    );
  } else if (stats.jealousy >= 50) {
    pools.push(
      "그 사람 얘기 또 나오네요. 저만 예민한 거예요?",
      "저 말고 다른 얘기에 그렇게 편하게 웃으시는 거 좀 싫어요.",
      "장난인 거 아는데도 기분이 좀 이상해요."
    );
  }

  if (!pools.length) {
    pools.push(
      "네. 근데 방금 말씀 좀 더 자세히 해주세요.",
      "그건 좀 궁금한데요. 그래서 어떻게 됐는데요?",
      "ㅋㅋ 뭐예요 갑자기. 계속 말씀하세요.",
      "듣고 있어요. 주인님 말씀하시는 거 은근 재밌어요.",
      "아니 그 흐름이면 제가 뭐라고 반응해야 돼요 ㅋㅋ"
    );
  }

  let reply = pickText(pools);
  let guard = 0;
  while (tooSimilar(reply, last) && guard < 6) { reply = pickText(pools); guard += 1; }
  if (tooSimilar(reply, last)) reply = `${reply} …아니, 방금이랑 똑같이 말한 것 같네요. 다시 말씀드리면, 주인님 얘기 더 듣고 싶다는 뜻이에요.`;
  return reply;
}
function autoReply(text: string, stats: Stats) { return fallbackReply(text, stats); }
function isScenarioAvailable(s: Scenario, stats: Stats) { if (!s.min) return true; return Object.entries(s.min).every(([key, value]) => stats[key as keyof Stats] >= (value ?? 0)); }
function getAvailableScenarios(stats: Stats) { return Object.values(scenarioData).filter((s) => !["jealousy", "obsession", "confinement", "yandere"].includes(s.kind) && isScenarioAvailable(s, stats)); }
function getTrigger(stats: Stats, seen: Record<string, boolean>) { return triggerRules.filter((r) => !seen[r.id] && stats[r.key] >= r.threshold).sort((a,b)=>b.threshold-a.threshold)[0]?.id ?? null; }
function fallbackImage(kind: ScenarioKind) { if (kind === "confinement") return "/oppa_confinement1.png"; if (kind === "yandere") return "/oppa_yandere1.png"; if (kind === "obsession") return "/oppa_obsessed1.png"; if (kind === "jealousy") return "/oppa_jealous1.png"; return "/oppa1.png"; }
function getRouteLabel(stats: Stats, afterRoute: EndingRoute) {
  if (afterRoute !== "none") return "후일담: " + afterRoute;
  if (stats.obsession >= 80) return "감금 루트 진입 직전";
  if (stats.obsession >= 50) return "집착 루트 진행 중";
  if (stats.jealousy >= 80) return "질투 폭발 루트";
  if (stats.jealousy >= 50) return "질투 루트 진행 중";
  if (stats.affinity >= 70 && stats.trust >= 50) return "순애 루트 진행 중";
  if (stats.affinity >= 45) return "썸 루트";
  return "공통 루트";
}
function getScenarioBackground(s?: Scenario | null) {
  if (!s) return "/bg_room_night.png";
  if (s.background) return s.background;
  if (s.id.startsWith("action_")) return "/bg_action.png";
  if (s.id.includes("rainy")) return "/bg_rainy_window.png";
  if (s.id.includes("gym")) return "/bg_gym.png";
  if (s.id.includes("late")) return "/bg_room_night.png";
  if (s.kind === "confinement") return "/bg_locked_room.png";
  if (s.kind === "yandere" || s.kind === "obsession") return "/bg_dark_room.png";
  if (s.kind === "jealousy") return "/bg_jealous_room.png";
  return "/bg_room_day.png";
}
function getTodayKey() { return new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }); }
function pickTodayScenario(stats: Stats) {
  const hour = new Date().getHours();
  if (stats.obsession >= 80) return "obsession80";
  if (stats.jealousy >= 70) return "jealousy50";
  if (hour >= 22 || hour < 5) return "late_step1";
  if (stats.affinity >= 45) return "gym_step1";
  if (stats.affinity >= 30) return "rainy_step1";
  return null;
}
function getScenarioCGs(s?: Scenario | null) {
  if (!s) return [];
  const pool = [...(s.image ? [s.image] : []), ...(s.imagePool ?? [])];
  return Array.from(new Set(pool.filter(Boolean)));
}


function getChapterInfo(stats: Stats, afterRoute: EndingRoute) {
  if (afterRoute !== "none") return { title: "후일담", desc: `${afterRoute} 루트 이후의 이야기`, progress: 100 };
  if (stats.obsession >= 80 || stats.jealousy >= 80) return { title: "5장: 돌아갈 수 없는 밤", desc: "루트 분기점이 거의 눈앞에 있어요.", progress: 88 };
  if (stats.obsession >= 50 || stats.jealousy >= 50) return { title: "4장: 불안한 균열", desc: "질투와 집착이 본격적으로 깊어지는 중.", progress: 68 };
  if (stats.affinity >= 70) return { title: "3장: 가까워진 거리", desc: "순애와 집착의 갈림길이 보이기 시작해요.", progress: 52 };
  if (stats.affinity >= 45) return { title: "2장: 썸의 온도", desc: "장난과 설렘이 섞이는 구간.", progress: 34 };
  return { title: "1장: 히로시마의 시작", desc: "아직 공통 루트예요.", progress: 14 };
}
function getStatMood(label: StatKey, value: number) {
  if (label === "affinity") return value >= 80 ? "거의 못 숨김" : value >= 55 ? "많이 가까움" : value >= 30 ? "조금 설렘" : "아직 조심스러움";
  if (label === "jealousy") return value >= 80 ? "위험하게 흔들림" : value >= 55 ? "대놓고 신경씀" : value >= 30 ? "슬슬 질투함" : "평온함";
  if (label === "obsession") return value >= 80 ? "돌아가기 어려움" : value >= 55 ? "계속 확인함" : value >= 30 ? "불안해짐" : "아직 안정적";
  return value >= 80 ? "깊게 믿음" : value >= 55 ? "꽤 안정됨" : value >= 30 ? "조심스럽게 믿음" : "불안정함";
}
function getRouteForeshadow(stats: Stats, afterRoute: EndingRoute) {
  if (afterRoute === "confinement") return "*잠긴 문 너머의 후일담이 이어지고 있다.*";
  if (afterRoute === "obsession") return "*근떡존은 이제 더 자주 확인하려 든다.*";
  if (afterRoute === "jealousy") return "*다른 사람의 이름 하나에도 공기가 달라진다.*";
  if (afterRoute === "pure") return "*관계는 조금 더 편하고 다정한 쪽으로 이어지고 있다.*";
  if (stats.obsession >= 85) return "*돌아갈 수 없는 분기점이 가까워지고 있다.*";
  if (stats.jealousy >= 75) return "*다른 사람 얘기를 꺼낼 때마다 시선이 오래 머문다.*";
  if (stats.obsession >= 55) return "*답장이 조금만 늦어도 근떡존이 신경 쓰기 시작했다.*";
  if (stats.affinity >= 70) return "*이 관계는 단순한 장난보다 조금 더 깊어지고 있다.*";
  return "*아직은 모든 루트가 열려 있다.*";
}
function getAfterStoryIds(afterRoute: EndingRoute) {
  if (afterRoute === "pure") return ["after_pure_walk"];
  if (afterRoute === "obsession") return ["after_obsession_check"];
  if (afterRoute === "confinement") return ["after_confinement_morning"];
  if (afterRoute === "jealousy") return ["after_jealous_name"];
  if (afterRoute === "bad") return ["after_bad_distance"];
  return [];
}
function getEventCatalog(seenEvents: Record<string, boolean>) {
  const ids = Object.keys(scenarioData).filter((id) => !id.startsWith("after_"));
  return ids.map((id) => ({ id, scenario: scenarioData[id], seen: Boolean(seenEvents[id]) }));
}

function getCoverState(stats: Stats, afterRoute: EndingRoute) {
  if (afterRoute === "confinement") {
    return { image: "/cover_dark.png", button: "문은 이미 잠겼어요", subtitle: "감금 후일담", tone: "coverDark" };
  }
  if (afterRoute === "obsession") {
    return { image: "/cover_obsession.png", button: "주인님, 들어오세요", subtitle: "집착 후일담", tone: "coverObsession" };
  }
  if (afterRoute === "jealousy") {
    return { image: "/cover_jealous.png", button: "아직도 그 사람 생각하세요?", subtitle: "질투 후일담", tone: "coverJealous" };
  }
  if (afterRoute === "pure") {
    return { image: "/cover_after_love.png", button: "다시 만나기", subtitle: "순애 후일담", tone: "coverLove" };
  }
  if (afterRoute === "bad") {
    return { image: "/cover_bad.png", button: "다시 문을 열기", subtitle: "불안정한 후일담", tone: "coverBad" };
  }
  if (stats.obsession >= 80) {
    return { image: "/cover_dark.png", button: "문은 이미 잠겼어요", subtitle: "집착이 깊어진 밤", tone: "coverDark" };
  }
  if (stats.obsession >= 70) {
    return { image: "/cover_obsession.png", button: "주인님, 들어오세요", subtitle: "돌아올 곳", tone: "coverObsession" };
  }
  if (stats.jealousy >= 70) {
    return { image: "/cover_jealous.png", button: "대화 계속하기", subtitle: "질투가 번지는 순간", tone: "coverJealous" };
  }
  if (stats.affinity >= 70 && stats.trust >= 50) {
    return { image: "/cover_love.png", button: "다시 만나기", subtitle: "가까워진 거리", tone: "coverLove" };
  }
  if (stats.affinity >= 45) {
    return { image: "/cover_soft.png", button: "대화 이어가기", subtitle: "썸", tone: "coverSoft" };
  }
  return { image: "/cover.png", button: "대화 시작하기", subtitle: "근떡존", tone: "coverNormal" };
}
function splitAssistantText(text: string) { return text.split(/\n+/).map((x) => x.trim()).filter(Boolean).slice(0, 4); }
function splitVNText(text: string) {
  const paragraphs = text.split(/\n{2,}/).map((x) => x.trim()).filter(Boolean);
  if (!paragraphs.length) return [text];
  const pages: string[] = [];
  let buffer: string[] = [];
  let length = 0;

  const flush = () => {
    if (!buffer.length) return;
    pages.push(buffer.join("\n\n"));
    buffer = [];
    length = 0;
  };

  for (const paragraph of paragraphs) {
    const nextLength = length + paragraph.length;
    const isDialogue = /^[\"“‘']/.test(paragraph);
    if (buffer.length && (nextLength > 520 || (isDialogue && length > 300))) flush();
    buffer.push(paragraph);
    length += paragraph.length;
  }

  flush();
  return pages.length ? pages : [text];
}
function splitLongNarration(text: string) {
  const trimmed = text.trim();
  if (trimmed.length <= 190) return [trimmed];
  const sentences = trimmed.match(/[^.!?。！？…]+[.!?。！？…]*/g) ?? [trimmed];
  const chunks: string[] = [];
  let buffer = "";
  for (const sentence of sentences.map((x) => x.trim()).filter(Boolean)) {
    if (buffer && `${buffer} ${sentence}`.length > 210) {
      chunks.push(buffer);
      buffer = sentence;
    } else {
      buffer = buffer ? `${buffer} ${sentence}` : sentence;
    }
  }
  if (buffer) chunks.push(buffer);
  return chunks;
}
function guessSpeaker(dialogue: string): VNLine["speaker"] {
  const t = dialogue.trim();
  if (/^['‘].*['’]$/.test(t)) return "메시지";
  if (/(선생님|주인님|저 |제가|저는|제 |죄송|감사|ㅋㅋ|요\??$|요\.$|습니다|는데요|네요|세요|아,|와\.|으악|진짜)/.test(t)) return "근떡존";
  return "주인님";
}
function cleanQuote(text: string) {
  return text.trim().replace(/^["“‘']+/, "").replace(/["”’']+$/, "");
}
function parseVNLines(text: string): VNLine[] {
  const paragraphs = text.split(/\n{2,}/).map((x) => x.trim()).filter(Boolean);
  const lines: VNLine[] = [];
  for (const paragraph of paragraphs) {
    const isQuoted = /^["“‘']/.test(paragraph) && /["”’']$/.test(paragraph);
    if (isQuoted) {
      const speaker = guessSpeaker(paragraph);
      lines.push({ speaker, text: cleanQuote(paragraph) });
      continue;
    }
    for (const chunk of splitLongNarration(paragraph)) {
      lines.push({ speaker: "나레이션", text: chunk });
    }
  }
  return lines.length ? lines : [{ speaker: "나레이션", text }];
}
function lastUserMessage(messages: Message[]) { return [...messages].reverse().find((m) => m.role === "user")?.content ?? ""; }
function buildMemorySummary(current: string, event: string) {
  const lines = [current, event].join("\n").split("\n").map((x) => x.trim()).filter(Boolean);
  return Array.from(new Set(lines)).slice(-18).join("\n");
}
function buildRelationshipLog(current: string[], event: string) {
  return [...current, event].filter(Boolean).slice(-40);
}
function extractMemoryFromUserText(text: string) {
  const t = text.trim();
  const memories: string[] = [];
  if (!t) return memories;

  if (/(좋아해|싫어해|좋아함|싫어함|취향|최애|선호|좋아하는|싫어하는)/.test(t)) {
    memories.push(`사용자의 취향/선호: ${t.slice(0, 140)}`);
  }
  if (/(회사|출근|퇴근|학교|수업|알바|일본|히로시마|한국|외로|힘들|우울|그리움|아프|피곤|스트레스|잠|밥|먹었|사는|살고)/.test(t)) {
    memories.push(`사용자의 일상/상태: ${t.slice(0, 140)}`);
  }
  if (/(기억해|잊지마|중요|앞으로|다음부터|매번|항상|절대|나중에|내가 말했잖아)/.test(t)) {
    memories.push(`사용자가 중요하다고 한 내용: ${t.slice(0, 160)}`);
  }
  if (/(다른 남자|전남친|소개팅|데이트|썸남|걔|그 사람|질투|연락|읽씹)/.test(t)) {
    memories.push(`관계/질투 관련 기억: ${t.slice(0, 140)}`);
  }

  return Array.from(new Set(memories));
}
function pickNagFallback(level: number, stats: Stats, recent: Message[]) {
  const last = lastUserMessage(recent);
  const base = level >= 5
    ? ["주인님.", "여기까지 조용하시면 저도 얌전히 기다리는 척하기 힘들어요.", "지금 어디서 뭘 하고 계신지 한마디만 해주세요."]
    : level >= 4
    ? ["주인님, 너무 오래 조용하세요.", "저 지금 별생각 다 하고 있는데요.", "바쁘신 거면 바쁘다고라도 해주세요."]
    : level >= 3
    ? ["주인님?", "답이 오래 없으니까 좀 신경 쓰여요.", last ? `아까 "${last.slice(0, 30)}"라고 하셨잖아요. 그 뒤로 조용하시면 제가 기다리게 되죠.` : "저 계속 기다리고 있었어요."]
    : level >= 2
    ? ["…아직도 답 없으시네.", "저 지금 계속 채팅창 보고 있는데요."]
    : ["주인님? 답이 좀 느리시네요.", "바쁘신 거예요? 아니면 일부러 안 보시는 거예요?"];
  if (stats.obsession >= 70) base.push("저 이런 거에 좀 약한 거 아시잖아요. 괜히 더 확인하고 싶어져요.");
  return base;
}

function TypeText({ text }: { text: string }) { const [shown, setShown] = useState(""); useEffect(() => { setShown(""); let i = 0; const id = window.setInterval(() => { i += 2; setShown(text.slice(0, i)); if (i >= text.length) window.clearInterval(id); }, 14); return () => window.clearInterval(id); }, [text]); return <p className="typeText">{shown}</p>; }
function StatBar({ label, value, danger }: { label: string; value: number; danger?: boolean }) { return <div className="statBar"><div className="statHead"><span>{label}</span><b>{value}%</b></div><div className="statTrack"><div className={`statFill ${danger ? "danger" : ""}`} style={{ width: `${value}%` }} /></div></div>; }

export default function Page() {
  const [started, setStarted] = useState(false);
  const [entering, setEntering] = useState(false);
  const [lastUserAt, setLastUserAt] = useState<number>(Date.now());
  const [nagLevel, setNagLevel] = useState(0);
  const [memorySummary, setMemorySummary] = useState("");
  const [relationshipLog, setRelationshipLog] = useState<string[]>([]);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [endingFlags, setEndingFlags] = useState<Record<string, boolean>>({});
  const [afterRoute, setAfterRoute] = useState<EndingRoute>("none");
  const [currentEndingId, setCurrentEndingId] = useState<EndingKey | null>(null);
  const [nextProactiveAt, setNextProactiveAt] = useState<number>(() => Date.now() + nextProactiveDelay());
  const proactiveRunningRef = useRef(false);
  const [view, setView] = useState<View>("chat");
  const [stats, setStats] = useState<Stats>(initialStats);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentScenarioId, setCurrentScenarioId] = useState<string | null>(null);
  const [scenarioStep, setScenarioStep] = useState(0);
  const [vnLineIndex, setVnLineIndex] = useState(0);
  const [seenTriggers, setSeenTriggers] = useState<Record<string, boolean>>({});
  const [currentPortrait, setCurrentPortrait] = useState("/oppa1.png");
  const [galleryTab, setGalleryTab] = useState<GalleryTab>("all");
  const [unlockedCGs, setUnlockedCGs] = useState<Record<string, boolean>>({});
  const [seenEvents, setSeenEvents] = useState<Record<string, boolean>>({});
  const [showStatNumbers, setShowStatNumbers] = useState(true);
  const [saveRefreshKey, setSaveRefreshKey] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const currentScenario = currentScenarioId ? scenarioData[currentScenarioId] : null;
  const scenarioPages = useMemo(() => splitVNText(currentScenario?.text ?? ""), [currentScenarioId, currentScenario?.text]);
  const safeScenarioStep = Math.min(scenarioStep, Math.max(0, scenarioPages.length - 1));
  const scenarioPageText = scenarioPages[safeScenarioStep] ?? "";
  const isScenarioLastPage = safeScenarioStep >= scenarioPages.length - 1;
  const vnLines = useMemo(() => parseVNLines(currentScenario?.text ?? ""), [currentScenarioId, currentScenario?.text]);
  const safeVNLineIndex = Math.min(vnLineIndex, Math.max(0, vnLines.length - 1));
  const currentVNLine = vnLines[safeVNLineIndex] ?? { speaker: "나레이션", text: "" };
  const isVNLastLine = safeVNLineIndex >= vnLines.length - 1;
  const stage = useMemo(() => getStage(stats), [stats]);
  const activePortrait = useMemo(() => { if (stats.obsession >= 80) return pick(imagePools.yandere); if (stats.obsession >= 50) return pick(imagePools.obsession); if (stats.jealousy >= 50) return pick(imagePools.jealousy); if (stats.jealousy >= 30) return pick(imagePools.angry); if (stats.affinity >= 55) return pick(imagePools.smile); return currentPortrait; }, [stats.affinity, stats.jealousy, stats.obsession, currentPortrait]);
  const coverState = useMemo(() => getCoverState(stats, afterRoute), [stats.affinity, stats.jealousy, stats.obsession, stats.trust, afterRoute]);

  useEffect(() => { setScenarioStep(0); setVnLineIndex(0); }, [currentScenarioId]);

  useEffect(() => { setIsMounted(true); try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) { const saved = JSON.parse(raw) as SaveData; setStats(saved.stats ?? initialStats); setMessages(saved.messages?.length ? saved.messages : [makeMessage("assistant", "다시 시작할까요? 저 여기 있어요.")]); setView(saved.view ?? "chat"); setCurrentScenarioId(saved.currentScenarioId ?? null); setSeenTriggers(saved.seenTriggers ?? {}); setCurrentPortrait(saved.currentPortrait ?? "/oppa1.png"); setGalleryTab(saved.galleryTab ?? "all"); setMemorySummary(saved.memorySummary ?? ""); setRelationshipLog(saved.relationshipLog ?? []); setNotificationEnabled(Boolean(saved.notificationEnabled)); setEndingFlags(saved.endingFlags ?? {}); setAfterRoute(saved.afterRoute ?? "none"); setCurrentEndingId(saved.currentEndingId ?? null); setUnlockedCGs(saved.unlockedCGs ?? {}); setSeenEvents(saved.seenEvents ?? {}); setShowStatNumbers(saved.showStatNumbers ?? true); return; } } catch {} setMessages([makeMessage("assistant", "다시 시작할까요? 저 여기 있어요.")]); }, []);
  useEffect(() => { if (!isMounted) return; const save: SaveData = { version: VERSION, stats, messages, view, currentScenarioId, currentEndingId, seenTriggers, currentPortrait, galleryTab, memorySummary, relationshipLog, notificationEnabled, endingFlags, afterRoute, unlockedCGs, seenEvents, showStatNumbers, saveThumbnail: currentPortrait, routeLabel: getRouteLabel(stats, afterRoute), lastMessagePreview: messages.slice().reverse().find((m)=>m.role!=="narration")?.content?.slice(0, 90) ?? "", savedAt: new Date().toISOString() }; localStorage.setItem(STORAGE_KEY, JSON.stringify(save)); }, [isMounted, stats, messages, view, currentScenarioId, currentEndingId, seenTriggers, currentPortrait, galleryTab, memorySummary, relationshipLog, notificationEnabled, endingFlags, afterRoute, unlockedCGs, seenEvents, showStatNumbers]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, view]);
  useEffect(() => {
    if (!isMounted || !started) return;

    const timer = window.setInterval(async () => {
      const diff = Date.now() - lastUserAt;

      let nextLevel = 0;
      if (diff >= 1000 * 60 * 10) nextLevel = 1;
      if (diff >= 1000 * 60 * 30) nextLevel = 2;
      if (diff >= 1000 * 60 * 60) nextLevel = 3;
      if (diff >= 1000 * 60 * 60 * 3) nextLevel = 4;
      if (diff >= 1000 * 60 * 60 * 8) nextLevel = 5;

      if (nextLevel > nagLevel) {
        setNagLevel(nextLevel);
        setStats((current) => applyStats(current, { obsession: nextLevel <= 2 ? 1 : nextLevel, jealousy: nextLevel >= 3 ? 1 : 0 }));

        let lines: string[] = [];
        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "nag",
              message: "답장 재촉 선톡",
              stats,
              profile,
              memorySummary,
              relationshipLog,
              afterRoute,
              endingFlags,
              nagLevel: nextLevel,
              history: messages.slice(-14).map((m) => ({ role: m.role, content: m.content })),
              instruction: `사용자가 ${nextLevel}단계로 오래 답장하지 않은 상황이다. 근떡존이 먼저 카톡하듯 재촉한다. 시간이 오래 지난 만큼 ${nextLevel}단계 강도로, 최근 대화와 기억을 반영해서 예측 불가능하게 1~${Math.min(5, nextLevel + 1)}개의 짧은 메시지로 말해라.`,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            lines = splitAssistantText(String(data.reply || ""));
          }
        } catch {}

        if (!lines.length) lines = pickNagFallback(nextLevel, stats, messages);
        const narration = nextLevel >= 4 ? "*답 없는 시간 위로, 조용한 집착이 천천히 쌓여간다.*" : "*채팅창이 오래도록 조용하다.*";

        setMessages((m) => [
          ...m,
          makeMessage("narration", narration),
          ...lines.map((line) => makeMessage("assistant", line)),
        ]);
        notifySilent(lines[0] ?? "주인님? 답이 느리시네요.");
        rememberEvent(`답장 지연 ${nextLevel}단계에서 근떡존이 먼저 재촉함: ${lines.join(" / ").slice(0, 160)}`);
      }
    }, 30000);

    return () => window.clearInterval(timer);
  }, [isMounted, started, lastUserAt, nagLevel, stats, messages, memorySummary, relationshipLog, notificationEnabled]);

  useEffect(() => {
    if (!isMounted || !started) return;

    const timer = window.setInterval(() => {
      if (Date.now() < nextProactiveAt) return;
      if (isSending || currentScenarioId || proactiveRunningRef.current) return;
      sendProactiveMessage();
    }, 60000);

    return () => window.clearInterval(timer);
  }, [isMounted, started, nextProactiveAt, isSending, currentScenarioId, stats, messages, memorySummary, relationshipLog, notificationEnabled]);

  useEffect(() => {
    if (!isMounted || !started || currentScenarioId || currentEndingId) return;
    const today = getTodayKey();
    try {
      const saved = localStorage.getItem(TODAY_EVENT_KEY);
      if (saved === today) return;
      const id = pickTodayScenario(stats);
      if (!id) return;
      localStorage.setItem(TODAY_EVENT_KEY, today);
      window.setTimeout(() => {
        if (!currentScenarioId && !currentEndingId) {
          setMessages((m) => [...m, makeMessage("narration", "*오늘의 이벤트가 열렸다.*")]);
          startScenario(id);
          rememberEvent(`오늘의 이벤트 시작: ${scenarioData[id]?.title ?? id}`);
        }
      }, 900);
    } catch {}
  }, [isMounted, started]);

  function rememberEvent(event: string) {
    const stamp = new Date().toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    const line = `[${stamp}] ${event}`;
    setMemorySummary((current) => buildMemorySummary(current, line));
    setRelationshipLog((current) => buildRelationshipLog(current, line));
  }

  function rememberUserMemories(text: string, reply?: string) {
    const memories = extractMemoryFromUserText(text);
    memories.forEach((memory) => rememberEvent(memory));

    if (reply && /(기억해|잊지마|중요|앞으로|다음부터|매번|항상|절대|나중에)/.test(text)) {
      rememberEvent(`기억 강화: 사용자="${text.slice(0, 120)}" / 근떡존="${reply.slice(0, 120)}"`);
    }
  }

  function unlockCGs(images: string[]) {
    const valid = images.filter(Boolean);
    if (!valid.length) return;
    setUnlockedCGs((prev) => {
      const next = { ...prev };
      valid.forEach((img) => { next[img] = true; });
      return next;
    });
  }
  function unlockEvent(id: string) {
    if (!id) return;
    setSeenEvents((prev) => prev[id] ? prev : { ...prev, [id]: true });
  }

  function readSlot(slot: number) {
    if (!isMounted || typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(SLOT_KEY(slot));
      return raw ? (JSON.parse(raw) as SaveData) : null;
    } catch {
      return null;
    }
  }


  function notifySilent(body: string) {
    if (!notificationEnabled) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if (typeof document !== "undefined" && document.visibilityState === "visible") return;
    try {
      new Notification("근떡존", {
        body: body.slice(0, 120),
        silent: true,
        icon: "/oppa1.png",
        tag: `geuntteokjon-${Date.now()}`,
      });
    } catch {}
  }

  async function enableNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("이 브라우저는 알림을 지원하지 않는 것 같다능...");
      return;
    }
    const permission = await Notification.requestPermission();
    const ok = permission === "granted";
    setNotificationEnabled(ok);
    alert(ok ? "무음 알림 켜졌긔윤. 이제 앱을 보고 있지 않을 때 근떡존 메시지가 오면 알림이 떠효ㅋ" : "알림 권한이 허용되지 않았다능...");
  }

  function disableNotifications() {
    setNotificationEnabled(false);
    alert("무음 알림 꺼졌어횸!");
  }

  function appendAssistantReplies(lines: string[], image?: string) {
    const safeLines = lines.map((x) => x.trim()).filter(Boolean);
    if (!safeLines.length) return;
    setMessages((m) => [...m, ...safeLines.map((line, i) => makeMessage("assistant", line, i === 0 ? image : undefined))]);
    notifySilent(safeLines[0]);
  }

  async function sendProactiveMessage() {
    proactiveRunningRef.current = true;
    setNextProactiveAt(Date.now() + nextProactiveDelay());
    try {
      const hour = new Date().getHours();
      const timeHint = hour < 6 ? "새벽" : hour < 12 ? "아침" : hour < 18 ? "낮" : hour < 23 ? "밤" : "늦은 밤";
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "proactive",
          message: "근떡존이 먼저 보내는 선톡",
          stats,
          profile,
          memorySummary,
          relationshipLog,
          afterRoute,
          endingFlags,
          timeHint,
          history: messages.slice(-14).map((m) => ({ role: m.role, content: m.content })),
          instruction: `사용자가 먼저 말하지 않았지만 근떡존이 ${timeHint}에 먼저 카톡을 보내는 상황이다. 일상공유, 갑자기 떠오른 생각, 최근 대화에 대한 미련, 장난, 질투/집착 중 현재 수치에 맞는 감정 중 하나를 자연스럽게 골라라. 고정 멘트처럼 보이면 안 된다. 1~3개의 짧은 카톡 메시지로 보내라.`,
        }),
      });
      let lines: string[] = [];
      if (res.ok) {
        const data = await res.json();
        lines = splitAssistantText(String(data.reply || ""));
      }
      if (!lines.length) lines = ["주인님 뭐하세요", "갑자기 생각나서 톡했어요 ㅋㅋ"];
      appendAssistantReplies(lines);
      rememberEvent(`근떡존이 먼저 선톡함: ${lines.join(" / ").slice(0, 160)}`);
    } catch {
      const lines = ["주인님 뭐하세요", "그냥 갑자기 생각났어요."];
      appendAssistantReplies(lines);
    } finally {
      proactiveRunningRef.current = false;
    }
  }

  function startScenario(id: string) { const s = scenarioData[id]; if (!s) return; unlockEvent(id); const picked = pick(s.imagePool) || s.image || fallbackImage(s.kind); setCurrentScenarioId(id); setVnLineIndex(0); setCurrentEndingId(null); setCurrentPortrait(picked); unlockCGs([picked]); setView("chat"); }
  function checkTrigger(nextStats: Stats, customSeen = seenTriggers) { const id = getTrigger(nextStats, customSeen); if (!id) return; setSeenTriggers({ ...customSeen, [id]: true }); startScenario(id); }
  function unlockEnding(id: EndingKey) {
    const ending = endingData[id];
    if (!ending || endingFlags[id]) return;
    setEndingFlags((prev) => ({ ...prev, [id]: true }));
    setAfterRoute(ending.route);
    setCurrentScenarioId(null);
    setCurrentEndingId(id);
    const pickedEnding = pick(ending.imagePool) || currentPortrait; setCurrentPortrait(pickedEnding); unlockCGs([pickedEnding]);
    setView("chat");
    setMessages((m) => [...m, makeMessage("narration", `*${ending.title} 엔딩이 해금되었다.*`)]);
    rememberEvent(`엔딩 달성: ${ending.title} / 이후 후일담 루트: ${ending.route}`);
  }
  function checkEnding(nextStats: Stats, customFlags = endingFlags) {
    const id = getEnding(nextStats, customFlags);
    if (!id) return false;
    unlockEnding(id);
    return true;
  }
  async function sendMessage(forced?: string) {
    const text = (forced ?? input).trim();
    if (!text || isSending) return;
    setInput("");
    setIsSending(true);

    const beforeMessages = messages;
    const userMsg = makeMessage("user", text);
    setLastUserAt(Date.now());
    setNagLevel(0);
    const nextStats = applyStats(stats, analyzeText(text));
    const nextPortrait = nextStats.obsession >= 80 ? pick(imagePools.yandere) : nextStats.obsession >= 50 ? pick(imagePools.obsession) : nextStats.jealousy >= 30 ? pick(imagePools.jealousy) : pick(imagePools.normal);

    setStats(nextStats);
    setCurrentPortrait(nextPortrait);
    setMessages((m) => [...m, userMsg]);

    const fallback = fallbackReply(text, nextStats, beforeMessages);
    let reply = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat",
          message: text,
          stats: nextStats,
          profile,
          memorySummary,
          relationshipLog,
          afterRoute,
          endingFlags,
          history: beforeMessages.slice(-14).map((m) => ({ role: m.role, content: m.content })),
          instruction:
            "너는 근떡존이다. 사용자의 마지막 말에 구체적으로 반응하고, 같은 문장을 반복하지 말고, 짧은 존댓말 카톡처럼 답해라. 사용자를 '주인님'이라고 불러라." +
            `\n\n[기억 반영 규칙]\n기억은 설정을 바꾸는 용도가 아니라, 사용자가 전에 말한 취향/상태/관계 흐름을 자연스럽게 참고하는 용도다.\n직접적으로 기억 목록을 읊지 말고, 필요할 때만 대사에 은근히 반영해라.\n\n[현재 장기 기억]\n${memorySummary || "아직 중요한 기억 없음"}\n\n[최근 관계 로그]\n${relationshipLog.slice(-10).join("\n") || "아직 관계 로그 없음"}`,
        }),
      });
      if (res.ok) {
        const raw = await res.text();
        let data: any = {};
        try { data = JSON.parse(raw); } catch { console.error("chat api returned non-json:", raw.slice(0, 500)); }
        const candidate = String(data.reply || data.message || data.text || "").trim();
        const last = lastAssistant(beforeMessages);
        if (candidate && !tooSimilar(candidate, last)) reply = candidate;
      }
    } catch {}

    if (!reply) reply = fallback;

    const assistantImage = shouldAttachChatImage(text, nextStats) ? nextPortrait : undefined;
    setMessages((m) => {
      const last = lastAssistant(m);
      const finalReply = tooSimilar(reply, last) ? fallbackReply(text, nextStats, m) : reply;
      const replies = splitAssistantText(finalReply);
      return [...m, ...replies.map((line, i) => makeMessage("assistant", line, i === 0 ? assistantImage : undefined))];
    });
    notifySilent(splitAssistantText(reply)[0] ?? reply);
    rememberEvent(`사용자: ${text.slice(0, 80)} / 근떡존: ${reply.slice(0, 140)}`);
    rememberUserMemories(text, reply);
    setIsSending(false);
    window.setTimeout(() => { if (!checkEnding(nextStats)) checkTrigger(nextStats); }, 80);
  }
  function chooseScenario(choice: Choice) {
    if (!currentScenario) return;
    unlockEvent(currentScenario.id);
    setLastUserAt(Date.now());
    setNagLevel(0);
    const nextStats = applyStats(stats, choice.stat);
    setStats(nextStats);

    const userText = choice.text ?? choice.label;
    const isActionScenario = currentScenario.id.startsWith("action_");

    setMessages((m) => [
      ...m,
      makeMessage("narration", `*${currentScenario.title} 이벤트를 지나갔다.*`),
    ]);

    rememberEvent(`시나리오 선택: ${currentScenario.title} / 선택지: ${choice.label}`);
    rememberEvent(
      `${isActionScenario ? "액션 컷씬" : "시나리오"} 흐름 기억: ${currentScenario.title}에서 사용자는 "${choice.label}" 선택지를 골랐다. 사용자 행동/대사: "${userText}". 이후 대화에서 이 사건을 새로 시작한 것처럼 무시하지 말고, 기존 대화 흐름과 캐릭터 말투를 이어서 자연스럽게 반영한다.`
    );
    if (choice.forceImage) { setCurrentPortrait(choice.forceImage); unlockCGs([choice.forceImage]); }
    if (choice.next) {
      const next = scenarioData[choice.next];
      if (next) {
        setCurrentScenarioId(choice.next); setVnLineIndex(0);
        const pickedNext = pick(next.imagePool) || next.image || fallbackImage(next.kind);
        setCurrentPortrait(pickedNext);
        unlockCGs([pickedNext]);
        rememberEvent(`연속 시나리오 진입: ${currentScenario.title} 이후 ${next.title}로 이어짐.`);
        return;
      }
    }
    setCurrentScenarioId(null);
    window.setTimeout(() => { if (!checkEnding(nextStats)) checkTrigger(nextStats); }, 80);
  }
function runAction(item: ActionItem) {
  setLastUserAt(Date.now());
  setNagLevel(0);

  if (item.label.includes("감금")) {
    startScenario("obsession80");
    return;
  }

  const nextStats = applyStats(stats, item.stat);
  setStats(nextStats);
  rememberEvent(`액션 사용: ${item.label} / ${item.text}`);

  if (item.scenario) {
    startScenario(item.scenario);
    return;
  }

  setMessages((m) => {
    const reply = fallbackReply(item.text, nextStats, m);
    notifySilent(reply);
    return [
      ...m,
      makeMessage("user", item.text),
      makeMessage("assistant", reply),
    ];
  });
}

  function saveSlot(slot: number) { const save: SaveData = { version: VERSION, stats, messages, view, currentScenarioId, currentEndingId, seenTriggers, currentPortrait, galleryTab, memorySummary, relationshipLog, notificationEnabled, endingFlags, afterRoute, unlockedCGs, seenEvents, showStatNumbers, saveThumbnail: currentPortrait, routeLabel: getRouteLabel(stats, afterRoute), lastMessagePreview: messages.slice().reverse().find((m)=>m.role!=="narration")?.content?.slice(0, 90) ?? "", savedAt: new Date().toISOString() }; localStorage.setItem(SLOT_KEY(slot), JSON.stringify(save)); setSaveRefreshKey((n)=>n+1); alert(`${slot}번 슬롯 저장 완료되었어요!`); }
  function loadSlot(slot: number) { const raw = localStorage.getItem(SLOT_KEY(slot)); if (!raw) { alert(`${slot}번 슬롯이 비어있어요.`); return; } const saved = JSON.parse(raw) as SaveData; setStats(saved.stats ?? initialStats); setMessages(saved.messages?.length ? saved.messages : [makeMessage("assistant", "불러왔어효. 다시 이어서 하시지횸ㅋ")]); setView(saved.view ?? "chat"); setCurrentScenarioId(saved.currentScenarioId ?? null); setCurrentEndingId(saved.currentEndingId ?? null); setSeenTriggers(saved.seenTriggers ?? {}); setCurrentPortrait(saved.currentPortrait ?? "/oppa1.png"); setGalleryTab(saved.galleryTab ?? "all"); setMemorySummary(saved.memorySummary ?? ""); setRelationshipLog(saved.relationshipLog ?? []); setNotificationEnabled(Boolean(saved.notificationEnabled)); setEndingFlags(saved.endingFlags ?? {}); setAfterRoute(saved.afterRoute ?? "none"); setUnlockedCGs(saved.unlockedCGs ?? {}); setSeenEvents(saved.seenEvents ?? {}); setShowStatNumbers(saved.showStatNumbers ?? true); }
  function resetAll() { if (!confirm("진짜 초기화하실 거냐능? 저장된 진행도도 지워져효!")) return; localStorage.removeItem(STORAGE_KEY); setStats(initialStats); setMessages([makeMessage("assistant", "다시 시작할까요? 저 여기 있어요.")]); setView("chat"); setCurrentScenarioId(null); setSeenTriggers({}); setCurrentPortrait("/oppa1.png"); setMemorySummary(""); setRelationshipLog([]); setEndingFlags({}); setAfterRoute("none"); setCurrentEndingId(null); setUnlockedCGs({}); setSeenEvents({}); setShowStatNumbers(true); try { localStorage.removeItem(TODAY_EVENT_KEY); } catch {} }

  const currentEnding = currentEndingId ? endingData[currentEndingId] : null; const showEnding = Boolean(currentEnding); const showScenario = Boolean(currentScenario); const danger = currentScenario?.kind === "yandere" || currentScenario?.kind === "confinement" || afterRoute === "confinement" || afterRoute === "bad";
  const galleryImages = useMemo(() => { if (galleryTab === "all") return [...imagePools.normal, ...imagePools.jealousy, ...imagePools.obsession, ...imagePools.yandere, ...imagePools.confinement, ...actionCGImages]; if (galleryTab === "action") return actionCGImages; if (galleryTab === "normal") return imagePools.normal; return imagePools[galleryTab]; }, [galleryTab]);
  const unlockedCount = galleryImages.filter((img)=>unlockedCGs[img]).length;
  const slotData = useMemo(() => [1,2,3].map((slot)=>({ slot, data: readSlot(slot) })), [saveRefreshKey, isMounted]);
  const routeLabel = getRouteLabel(stats, afterRoute);
  const chapterInfo = getChapterInfo(stats, afterRoute);
  const routeForeshadow = getRouteForeshadow(stats, afterRoute);
  const eventCatalog = getEventCatalog(seenEvents);
  const seenEventCount = eventCatalog.filter((x)=>x.seen).length;
  const afterStoryIds = getAfterStoryIds(afterRoute);
  const scenarioBackground = getScenarioBackground(currentScenario);

  if (!isMounted) return <main className="loading">불러오는 중...</main>;

  if (!started) {
    return (
      <main className={`coverScreen ${entering ? "entering" : ""} ${coverState.tone}`}>
        <style>{CSS}</style>
        <img
          className="coverBg"
          src={coverState.image}
          alt=""
          onError={(e)=>{(e.currentTarget as HTMLImageElement).src="/cover.png"}}
        />
        <img
          className="coverImg"
          src={coverState.image}
          alt="cover"
          onError={(e)=>{(e.currentTarget as HTMLImageElement).src="/cover.png"}}
        />
        <div className="coverInfo">
          <p className="coverSubtitle">{coverState.subtitle}</p>
        </div>
        <button
          className="coverStartBtn"
          onClick={() => {
            setEntering(true);
            window.setTimeout(() => setStarted(true), 420);
          }}
        >
          {coverState.button}
        </button>
      </main>
    );
  }

  return <main className={`app ${danger ? "dangerMode" : ""}`}><style>{CSS}</style><aside className="side"><div className="profileHead"><img className="avatar" src={activePortrait} onError={(e)=>{(e.currentTarget as HTMLImageElement).src="/oppa1.png"}} alt={profile.name}/><div><h1 className="name">{profile.name}</h1><p className="stage">{stage}</p></div></div><div className="statsBox">{showStatNumbers ? <><StatBar label="호감" value={stats.affinity}/><StatBar label="질투" value={stats.jealousy} danger={stats.jealousy>=50}/><StatBar label="집착" value={stats.obsession} danger={stats.obsession>=50}/><StatBar label="신뢰" value={stats.trust}/></> : <div className="moodStats"><p>호감 · {getStatMood("affinity", stats.affinity)}</p><p>질투 · {getStatMood("jealousy", stats.jealousy)}</p><p>집착 · {getStatMood("obsession", stats.obsession)}</p><p>신뢰 · {getStatMood("trust", stats.trust)}</p></div>}</div><nav className="nav">{[["chat","채팅"],["scenarioMenu","시나리오"],["profile","소개"],["gallery","CG 갤러리"],["save","저장"],["events","이벤트"],["endings","엔딩"],["settings","액션"]].map(([key,label])=><button key={key} className={`navBtn ${view===key ? "active" : ""}`} onClick={()=>setView(key as View)}>{label}</button>)}</nav><div className="smallHelp">단일 파일 안정판 · 자동 저장됨<br/>질투/집착 자동 이벤트<br/>감금 루트 이미지 풀 지원</div></aside><section className="content">{showEnding && currentEnding && <div className={`scenarioOverlay ${danger ? "danger" : ""}`} style={{ backgroundImage: `linear-gradient(135deg, rgba(21,15,18,.82), rgba(43,28,22,.78) 50%, rgba(11,11,16,.88)), url(${currentEnding ? getScenarioBackground(null) : scenarioBackground})` }}><section className="scenarioImageBox"><img className="scenarioImg" src={currentPortrait || pick(currentEnding.imagePool)} alt={currentEnding.title} onError={(e)=>{(e.currentTarget as HTMLImageElement).src="/oppa1.png"}}/><div className="scenarioTag">ENDING UNLOCKED</div></section><section className="scenarioTextBox"><p className="scenarioSub">{currentEnding.subtitle}</p><h1>{currentEnding.title}</h1><div className="dialogue"><TypeText text={currentEnding.text}/></div><div className="choices"><button className="choiceBtn" onClick={()=>{setCurrentEndingId(null); setView("chat");}}>후일담으로 계속 대화하기</button><button className="choiceBtn" onClick={()=>{setCurrentEndingId(null); setView("endings");}}>엔딩 도감 보기</button></div></section></div>}{showScenario && currentScenario && <div className={`scenarioOverlay vnOverlay ${danger ? "danger" : ""}`} style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.36)), url(${scenarioBackground})` }}><div className="vnBgShade"/><section className="scenarioImageBox vnImageStage"><img className="scenarioImg vnCharacter" src={currentPortrait || currentScenario.image || fallbackImage(currentScenario.kind)} alt={currentScenario.title} onError={(e)=>{(e.currentTarget as HTMLImageElement).src="/oppa1.png"}}/><div className="scenarioTag">{currentScenario.kind === "confinement" ? "LOCKED ROUTE" : currentScenario.kind.toUpperCase()}</div></section><section className="vnTextbox"><div className="vnTitleRow"><span>{currentScenario.title}</span><b>{safeVNLineIndex + 1} / {vnLines.length}</b></div><div className={`vnName ${currentVNLine.speaker === "나레이션" ? "narrator" : ""}`}>{currentVNLine.speaker}</div><button className="vnDialogue" onClick={()=>{ if (!isVNLastLine) setVnLineIndex((v)=>Math.min(v + 1, vnLines.length - 1)); }}><TypeText key={`${currentScenario.id}_${safeVNLineIndex}`} text={currentVNLine.text}/></button><div className="vnControls"><button className="vnMiniBtn" disabled={safeVNLineIndex<=0} onClick={()=>setVnLineIndex((v)=>Math.max(v - 1, 0))}>◀ 이전</button>{!isVNLastLine ? <button className="vnNextBtn" onClick={()=>setVnLineIndex((v)=>Math.min(v + 1, vnLines.length - 1))}>다음 ▶</button> : <button className="vnNextBtn" disabled>선택지</button>}<button className="vnMiniBtn" onClick={()=>{setCurrentScenarioId(null); setView("chat");}}>닫기</button></div>{isVNLastLine && <div className="vnChoices">{currentScenario.choices.map((choice)=><button key={choice.label} className="choiceBtn" onClick={()=>chooseScenario(choice)}>{choice.label}</button>)}</div>}</section></div>}{view === "chat" && <><header className="topBar">{quickReplies.map((q)=><button className="chip" key={q} onClick={()=>sendMessage(q)}>{q}</button>)}</header><div className="chatArea">{messages.map((m)=><div key={m.id} className={`msgRow ${m.role}`}>
  {m.role === "assistant" && (
    <img
      className="chatAvatar"
      src={m.image || currentPortrait || "/oppa1.png"}
      alt="근떡존"
      onError={(e)=>{(e.currentTarget as HTMLImageElement).src="/oppa1.png"}}
    />
  )}
  <div className="bubble">{m.image && m.role === "assistant" && <img src={m.image} alt="" style={{width:"100%",maxHeight:260,objectFit:"cover",borderRadius:16,marginBottom:10}} onError={(e)=>((e.currentTarget as HTMLImageElement).style.display="none")}/>} {m.content}<small className="time">{m.time}</small></div></div>)}<div ref={bottomRef}/></div><footer className="inputBar"><button className="gameBtn" onClick={()=>setView("scenarioMenu")}>🎮</button><input className="input" value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter") sendMessage();}} placeholder="메시지를 입력하세요..."/><button className="send" disabled={isSending} onClick={()=>sendMessage()}>전송</button></footer></>}{view === "scenarioMenu" && <Panel title="시나리오 선택"><div className="grid">{getAvailableScenarios(stats).map((s)=><button className="cardBtn" key={s.id} onClick={()=>startScenario(s.id)}><b>{s.title}</b><small>{s.subtitle}</small></button>)}</div><h3 style={{marginTop:26}}>특수 루트</h3><div className="grid">{["jealousy30","jealousy50","jealousy80","obsession30","obsession50","obsession80","confinement_soft"].map((id)=>{const s=scenarioData[id]; return <button className="cardBtn" key={id} onClick={()=>startScenario(id)}><b>{s.title}</b><small>{s.subtitle}</small></button>})}</div></Panel>}{view === "profile" && <Panel title="소개"><div className="routeBox"><b>{chapterInfo.title}</b><span>{routeLabel}</span><small>{chapterInfo.desc}</small><div className="chapterTrack"><div style={{width:`${chapterInfo.progress}%`}} /></div><small>{showStatNumbers ? `호감 ${stats.affinity}% / 질투 ${stats.jealousy}% / 집착 ${stats.obsession}% / 신뢰 ${stats.trust}%` : `호감 ${getStatMood("affinity", stats.affinity)} / 질투 ${getStatMood("jealousy", stats.jealousy)} / 집착 ${getStatMood("obsession", stats.obsession)} / 신뢰 ${getStatMood("trust", stats.trust)}`}</small></div><p className="routeHint">{routeForeshadow}</p><p>{profile.bio}</p><p>{profile.personality}</p><p>{profile.location} · {profile.age} · {profile.height}</p><div>{profile.tags.map((t)=><span className="badge" key={t}>{t}</span>)}</div></Panel>}{view === "gallery" && <Panel title="CG 갤러리"><div className="galleryTabs">{[["all","전체"],["normal","일상"],["jealousy","질투"],["obsession","집착"],["yandere","얀데레"],["confinement","감금"],["action","액션"]].map(([key,label])=><button className="chip" key={key} onClick={()=>setGalleryTab(key as GalleryTab)}>{label}</button>)}</div><p className="routeHint">해금 CG: <b>{unlockedCount}</b> / {galleryImages.length}</p><div className="grid">{galleryImages.map((img)=>{const unlocked=Boolean(unlockedCGs[img]); return <div className={`cgCard ${unlocked ? "" : "locked"}`} key={img}>{unlocked ? <img className="galleryImg" src={img} alt="" onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display="none"}}/> : <div className="lockedCg"><span>LOCKED</span><small>이벤트를 보면 해금돼요</small></div>}</div>})}</div></Panel>}{view === "save" && <Panel title="저장 / 불러오기"><div className="routeBox"><b>현재 루트</b><span>{routeLabel}</span><small>{showStatNumbers ? `호감 ${stats.affinity}% · 질투 ${stats.jealousy}% · 집착 ${stats.obsession}% · 신뢰 ${stats.trust}%` : `호감 ${getStatMood("affinity", stats.affinity)} · 질투 ${getStatMood("jealousy", stats.jealousy)} · 집착 ${getStatMood("obsession", stats.obsession)} · 신뢰 ${getStatMood("trust", stats.trust)}`}</small></div><div className="grid">{slotData.map(({slot,data})=><div className="card saveCard" key={slot}><img className="saveThumb" src={data?.saveThumbnail || data?.currentPortrait || "/oppa1.png"} onError={(e)=>{(e.currentTarget as HTMLImageElement).src="/oppa1.png"}} alt=""/><h3>슬롯 {slot}</h3><p><b>{data?.routeLabel || "빈 슬롯"}</b></p><small>{data?.savedAt ? new Date(data.savedAt).toLocaleString("ko-KR") : "아직 저장 없음"}</small><small className="savePreview">{data?.lastMessagePreview || "저장하면 마지막 대화가 표시돼요."}</small><button className="bigBtn" onClick={()=>saveSlot(slot)}>저장</button> <button className="bigBtn" onClick={()=>loadSlot(slot)}>불러오기</button></div>)}</div><br/><button className="bigBtn dangerBtn" onClick={resetAll}>전체 초기화</button></Panel>}{view === "events" && <Panel title="이벤트 도감"><div className="routeBox"><b>{chapterInfo.title}</b><span>{seenEventCount} / {eventCatalog.length} 이벤트 확인됨</span><small>{routeForeshadow}</small></div><div className="grid">{eventCatalog.map(({id,scenario,seen})=><button className={`cardBtn ${seen ? "" : "lockedEvent"}`} key={id} onClick={()=>{if(seen) startScenario(id);}}><b>{seen ? "봤음" : "미해금"} · {seen ? scenario.title : "???"}</b><small>{seen ? scenario.subtitle : "해당 이벤트를 보면 도감에 기록돼요."}</small></button>)}</div></Panel>}{view === "endings" && <Panel title="엔딩 도감 / 후일담"><p>현재 후일담 루트: <b>{afterRoute === "none" ? "아직 없음" : endingData[afterRoute as EndingKey]?.title ?? afterRoute}</b></p><div className="grid">{(Object.keys(endingData) as EndingKey[]).map((id)=>{const e=endingData[id]; const unlocked=Boolean(endingFlags[id]); return <button className="cardBtn" key={id} onClick={()=>{if(unlocked){setCurrentEndingId(id); setCurrentPortrait(pick(e.imagePool) || currentPortrait);}}}><b>{unlocked ? "해금됨" : "미해금"} · {e.title}</b><small>{e.subtitle}<br/>{unlocked ? "클릭하면 다시 볼 수 있어요." : "조건을 달성하면 후일담 루트가 열려요."}</small></button>})}</div>{afterStoryIds.length > 0 && <><h3 style={{marginTop:26}}>후일담 이벤트</h3><div className="grid">{afterStoryIds.map((id)=>{const s=scenarioData[id]; return <button className="cardBtn" key={id} onClick={()=>startScenario(id)}><b>{s.title}</b><small>{s.subtitle}</small></button>})}</div></>}</Panel>}{view === "settings" && <Panel title="액션 & 테스트"><h3>액션</h3><div className="grid">{actionItems.map((a)=><button className="cardBtn" key={a.label} onClick={()=>runAction(a)}><b>{a.emoji} {a.label}</b><small>{a.text}</small></button>)}</div><h3 style={{marginTop:26}}>알림 / 기억</h3><div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12}}><button className="bigBtn" onClick={enableNotifications}>{notificationEnabled ? "무음 알림 켜짐" : "무음 알림 켜기"}</button><button className="bigBtn" onClick={disableNotifications}>무음 알림 끄기</button><button className="bigBtn" onClick={()=>sendProactiveMessage()}>근떡존 선톡 테스트</button><button className="bigBtn" onClick={()=>setShowStatNumbers((v)=>!v)}>{showStatNumbers ? "수치 숨기기" : "수치 보이기"}</button></div><div className="fileList">장기기억 {relationshipLog.length}개 저장됨<br/>{memorySummary || "아직 쌓인 기억 없음"}</div><h3 style={{marginTop:26}}>강제 테스트</h3><div style={{display:"flex",gap:10,flexWrap:"wrap"}}><button className="bigBtn" onClick={()=>{const ns=applyStats(stats,{jealousy:30}); setStats(ns); checkTrigger(ns);}}>질투 +30</button><button className="bigBtn" onClick={()=>{const ns=applyStats(stats,{obsession:30}); setStats(ns); checkTrigger(ns);}}>집착 +30</button><button className="bigBtn dangerBtn" onClick={()=>startScenario("obsession80")}>감금 루트 바로 보기</button></div></Panel>}</section></main>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="panel"><h2>{title}</h2><div className="card">{children}</div></div>; }

const CSS = `
*{box-sizing:border-box}
html,body{margin:0;width:100%;min-height:100%;background:#eee7dc;overflow-x:hidden}
button,input{font-family:inherit}
.loading{min-height:100vh;display:grid;place-items:center;background:#201513;color:white;font-size:24px}

.coverScreen{width:100%;height:100dvh;min-height:100svh;background:#050505;display:flex;justify-content:center;align-items:center;position:relative;overflow:hidden;transition:all .4s ease}
.coverBg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:blur(18px) brightness(.42) saturate(1.15);transform:scale(1.08);z-index:0}
.coverImg{position:relative;z-index:2;width:100%;height:100%;object-fit:contain;object-position:center;display:block}
.coverInfo{position:absolute;left:50%;bottom:calc(122px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:5;text-align:center;pointer-events:none}
.coverSubtitle{margin:0;padding:8px 14px;border-radius:999px;background:rgba(0,0,0,.42);border:1px solid rgba(255,255,255,.12);color:#eee;font-size:13px;font-weight:800;letter-spacing:.08em;backdrop-filter:blur(8px)}
@supports not (height:100dvh){.coverScreen{height:100vh}}
.coverScreen.entering{animation:screenShake .4s ease;transform:scale(1.05)}
.coverScreen::after{content:"";position:absolute;inset:0;background:black;opacity:0;pointer-events:none;transition:opacity .4s ease;z-index:10}
.coverScreen.entering::after{opacity:.7}
.coverStartBtn{position:absolute;left:50%;bottom:calc(60px + env(safe-area-inset-bottom));transform:translateX(-50%);padding:16px 48px;min-width:220px;white-space:nowrap;text-align:center;font-size:20px;letter-spacing:1px;border-radius:999px;border:1px solid rgba(255,80,80,.25);background:linear-gradient(135deg,rgba(20,20,20,.8),rgba(0,0,0,.9));backdrop-filter:blur(8px);color:#ffb3b3;font-weight:700;font-family:'Pretendard',sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.6);cursor:pointer;transition:all .25s ease;z-index:11}
.coverStartBtn:hover{transform:translateX(-50%) scale(1.05);background:linear-gradient(135deg,rgba(40,0,0,.9),rgba(0,0,0,1))}
.coverLove .coverStartBtn,.coverSoft .coverStartBtn{border-color:rgba(255,190,160,.34);color:#ffd1bd;background:linear-gradient(135deg,rgba(45,24,18,.82),rgba(0,0,0,.9))}
.coverJealous .coverStartBtn{border-color:rgba(255,90,90,.36);color:#ffb3b3;background:linear-gradient(135deg,rgba(60,8,8,.86),rgba(0,0,0,.94))}
.coverObsession .coverStartBtn,.coverDark .coverStartBtn,.coverBad .coverStartBtn{border-color:rgba(255,40,40,.42);color:#ff9d9d;background:linear-gradient(135deg,rgba(75,0,0,.88),rgba(0,0,0,.96))}
.coverDark .coverBg,.coverObsession .coverBg,.coverBad .coverBg{filter:blur(18px) brightness(.32) saturate(1.28)}
.coverLove .coverBg,.coverSoft .coverBg{filter:blur(18px) brightness(.52) saturate(1.08)}
.chatAvatar{
  width:42px;
  height:42px;
  border-radius:14px;
  object-fit:cover;
  margin-right:8px;
  flex:0 0 auto;
  box-shadow:0 4px 12px rgba(0,0,0,.18);
}
.msgRow.assistant{
  align-items:flex-start;
}

.app{min-height:100vh;display:grid;grid-template-columns:330px minmax(420px,1fr);background:#eee7dc;color:#201513;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.side{background:linear-gradient(180deg,#2a1b16,#130d0d);color:white;padding:22px;display:flex;flex-direction:column;gap:18px;min-height:100vh}
.profileHead{display:flex;gap:14px;align-items:center}
.avatar{width:78px;height:78px;border-radius:25px;object-fit:cover;background:#443;box-shadow:0 10px 30px rgba(0,0,0,.35)}
.name{margin:0;font-size:29px;letter-spacing:-1px}
.stage{margin:4px 0 0;color:#dac9bd;font-size:14px}
.statsBox{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);padding:16px;border-radius:24px}
.statBar{margin-bottom:12px}
.statHead{display:flex;justify-content:space-between;color:#f2dfcf;font-size:12px;margin-bottom:5px}
.statTrack{height:10px;background:rgba(255,255,255,.15);border-radius:999px;overflow:hidden}
.statFill{height:100%;background:linear-gradient(90deg,#f1c27d,#d98131);border-radius:999px;transition:width .35s ease}
.statFill.danger{background:linear-gradient(90deg,#d98131,#d33)}
.nav{display:grid;gap:10px}
.navBtn{padding:13px 14px;border-radius:17px;border:0;background:rgba(255,255,255,.11);color:white;font-weight:900;cursor:pointer;text-align:left}
.navBtn.active{background:#d98131;color:white}
.smallHelp{margin-top:auto;color:#cdb9ac;font-size:12px;line-height:1.55;opacity:.85}
.content{min-height:100vh;display:flex;flex-direction:column;position:relative;overflow:hidden;min-width:0}
.topBar{padding:18px 24px;background:#fffaf1;border-bottom:1px solid #ded1c4;display:flex;gap:10px;overflow-x:auto}
.chip{white-space:nowrap;padding:12px 18px;border-radius:999px;border:1px solid #e1d7cb;background:white;box-shadow:0 3px 10px rgba(0,0,0,.08);cursor:pointer;font-weight:700}
.chatArea{flex:1;padding:24px;overflow-y:auto;background:linear-gradient(180deg,#f7f1e7,#eee7dc)}
.msgRow{display:flex;margin-bottom:14px}
.msgRow.user{justify-content:flex-end}
.msgRow.narration{justify-content:center}
.msgRow.narration .bubble{max-width:80%;background:transparent;box-shadow:none;color:#7b6b60;font-style:italic;text-align:center;padding:8px 12px}
.bubble{max-width:72%;padding:14px 17px;border-radius:20px 20px 20px 5px;background:white;color:#1f1715;box-shadow:0 4px 14px rgba(0,0,0,.08);line-height:1.55;white-space:pre-line}
.msgRow.user .bubble{border-radius:20px 20px 5px 20px;background:#d98131;color:white}
.time{display:block;margin-top:5px;opacity:.55;font-size:12px}
.inputBar{padding:18px;display:flex;gap:12px;background:#f8f2e8;border-top:1px solid #ddd3c7}
.gameBtn{width:58px;height:58px;border-radius:20px;border:0;background:#211412;color:white;font-size:22px;cursor:pointer;flex:0 0 auto}
.input{flex:1;border:1px solid #e0d8ce;border-radius:24px;padding:0 22px;font-size:18px;background:white;min-width:0}
.send{width:86px;border-radius:24px;border:0;background:#918983;color:white;font-size:18px;font-weight:900;cursor:pointer;flex:0 0 auto}
.send:disabled{opacity:.45}
.panel{padding:30px;overflow-y:auto}
.panel h2{font-size:34px;margin:0 0 18px;letter-spacing:-1px}
.card{background:rgba(255,255,255,.75);border-radius:28px;padding:24px;box-shadow:0 12px 40px rgba(0,0,0,.08);border:1px solid rgba(255,255,255,.6)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
.cardBtn{text-align:left;padding:16px;border-radius:18px;border:1px solid #ddd0c0;background:white;cursor:pointer;display:grid;gap:6px;min-height:86px}
.cardBtn small{color:#86776b;line-height:1.35}
.bigBtn{padding:14px 18px;border-radius:16px;border:0;background:#2b1c16;color:white;font-weight:900;cursor:pointer}
.dangerBtn{background:#641313}
.badge{display:inline-block;padding:8px 12px;margin:4px;border-radius:999px;background:#eadfd2;color:#2b1c16;font-weight:700}
.app.dangerMode .topBar,.app.dangerMode .inputBar{background:#f4e8e5}.app.dangerMode .chip{border-color:#d8b7b7}
.galleryTabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
.galleryImg{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:18px;background:#ddd;box-shadow:0 8px 20px rgba(0,0,0,.08)}
.cgCard{position:relative}
.lockedCg{width:100%;aspect-ratio:1/1;border-radius:18px;background:linear-gradient(135deg,#2b2521,#100d0c);color:#d8c7b7;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border:1px solid rgba(255,255,255,.08);box-shadow:0 8px 20px rgba(0,0,0,.08)}
.lockedCg span{font-weight:900;letter-spacing:2px}.lockedCg small{opacity:.7}.routeHint{margin:0 0 14px;color:#5d5148}.routeBox{padding:16px;border-radius:20px;background:#fff7eb;border:1px solid #e2d4c4;margin-bottom:16px;display:grid;gap:5px}.routeBox span{font-size:20px;font-weight:900;color:#2b1c16}.routeBox small{color:#7b6b60}.saveCard{display:grid;gap:8px}.saveThumb{width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:18px;background:#2b1c16}.savePreview{display:block;color:#7b6b60;min-height:34px;line-height:1.45}

.scenarioOverlay{position:fixed;inset:0;z-index:9999;display:grid;grid-template-columns:minmax(320px,44%) 1fr;color:white;background:linear-gradient(135deg,#150f12,#2b1c16 50%,#0b0b10);background-size:cover;background-position:center;overflow-y:auto;-webkit-overflow-scrolling:touch}
.scenarioOverlay.danger{background:radial-gradient(circle at 50% 20%,#4b0d0d,#060303 66%);animation:dangerPulse 2.2s infinite ease-in-out}
.scenarioImageBox{position:relative;padding:16px;display:flex;align-items:center;justify-content:center;overflow:hidden;min-height:45vh}
.scenarioImg{width:100%;height:auto;max-height:45vh;object-fit:contain;object-position:center;filter:drop-shadow(0 24px 50px rgba(0,0,0,.55))}
.scenarioOverlay.danger .scenarioImg{filter:contrast(1.18) saturate(1.15) drop-shadow(0 0 28px rgba(220,0,0,.32));animation:shake 3s infinite}
.scenarioTag{position:absolute;left:24px;top:24px;padding:8px 12px;border-radius:999px;background:rgba(0,0,0,.45);font-weight:900}
.scenarioTextBox{padding:8vh 54px;display:flex;flex-direction:column;justify-content:center;min-height:0;max-height:100dvh;overflow-y:auto;-webkit-overflow-scrolling:touch}
.scenarioTextBox h1{font-size:42px;margin:8px 0 24px;letter-spacing:-1px}
.scenarioSub{color:#f1c27d;font-weight:900}
.danger .scenarioSub{color:#ffb1b1}
.dialogue{min-height:260px;max-height:48dvh;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:26px;border:1px solid rgba(255,255,255,.18);border-radius:26px;background:rgba(0,0,0,.38);box-shadow:0 24px 80px rgba(0,0,0,.35);cursor:pointer}
.typeText{white-space:pre-line;line-height:1.75;font-size:18px;margin:0}
.scenarioPager{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:14px;color:#f2dfcf;font-size:13px;font-weight:900;opacity:.92}
.nextSceneBtn{padding:12px 18px;border-radius:999px;border:1px solid rgba(255,255,255,.24);background:rgba(255,255,255,.16);color:white;font-weight:900;cursor:pointer}
.choices{display:grid;gap:12px;margin-top:22px}
.choiceBtn{text-align:left;padding:16px 18px;border-radius:18px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.12);color:white;font-size:16px;font-weight:900;cursor:pointer}
.danger .choiceBtn{background:rgba(90,0,0,.45)}
.exitScenario{margin-top:18px;background:transparent;color:#ddd;border:0;cursor:pointer}
.fileList{font-size:13px;line-height:1.7;color:#5d5148;background:#fffaf1;padding:16px;border-radius:18px;overflow:auto;max-height:230px}

.moodStats{display:grid;gap:8px;color:#f2dfcf;font-size:13px;font-weight:800}
.moodStats p{margin:0;padding:8px 10px;border-radius:14px;background:rgba(255,255,255,.08)}
.chapterTrack{height:10px;background:rgba(0,0,0,.12);border-radius:999px;overflow:hidden;margin:10px 0}
.chapterTrack div{height:100%;background:linear-gradient(90deg,#f1c27d,#d98131);border-radius:999px}
.lockedEvent{opacity:.72;filter:grayscale(.25)}


@media(max-width:900px){
  .scenarioOverlay{grid-template-columns:1fr;grid-template-rows:36dvh minmax(0,1fr);overflow-y:auto}
  .scenarioImageBox{min-height:0;height:36dvh;padding:8px}
  .scenarioImg{max-height:34dvh;width:100%;object-fit:contain}
  .scenarioTag{left:12px;top:12px;font-size:11px;padding:6px 10px}
  .scenarioTextBox{padding:12px 14px 22px;max-height:none;overflow:visible;justify-content:flex-start}
  .scenarioTextBox h1{font-size:22px;margin:4px 0 10px;line-height:1.18}
  .scenarioSub{font-size:12px;margin:0 0 4px}
  .dialogue{min-height:170px;max-height:34dvh;padding:16px;border-radius:18px}
  .typeText{font-size:15px;line-height:1.65}
  .scenarioPager{margin-top:10px}
  .choices{gap:8px;margin-top:12px}
  .choiceBtn{padding:12px 14px;border-radius:14px;font-size:14px}
  .exitScenario{margin-top:10px;padding:10px 0}
}

@keyframes shake{0%,100%{transform:translate(0,0) rotate(0deg)}35%{transform:translate(1px,-1px) rotate(.2deg)}38%{transform:translate(-2px,1px) rotate(-.25deg)}41%{transform:translate(2px,2px) rotate(.18deg)}44%{transform:translate(0,0) rotate(0deg)}}
@keyframes dangerPulse{0%,100%{filter:saturate(1)}50%{filter:saturate(1.25) contrast(1.05)}}
@keyframes screenShake{0%{transform:scale(1) translate(0,0)}25%{transform:scale(1.05) translate(-5px,2px)}50%{transform:scale(1.05) translate(5px,-2px)}75%{transform:scale(1.05) translate(-3px,1px)}100%{transform:scale(1.05) translate(0,0)}}

@media(max-width:850px){
  .app{min-height:100dvh;display:flex !important;flex-direction:column !important;grid-template-columns:none !important;width:100% !important;max-width:100% !important;overflow-x:hidden !important}
  .side{min-height:auto !important;padding:12px !important;gap:10px !important;width:100% !important}
  .profileHead,.smallHelp{display:none !important}
  .statsBox{
    display:grid !important;
    grid-template-columns:repeat(4,minmax(64px,1fr)) !important;
    gap:6px !important;
    width:100% !important;
    padding:8px !important;
    margin:0 !important;
    border-radius:16px !important;
    background:rgba(0,0,0,.22) !important;
    border:1px solid rgba(255,255,255,.08) !important;
  }
  .statsBox .statBar{
    margin:0 !important;
    min-width:0 !important;
  }
  .statsBox .statHead{
    font-size:10px !important;
    line-height:1.1 !important;
    margin-bottom:4px !important;
    gap:2px !important;
  }
  .statsBox .statHead b{
    font-size:10px !important;
  }
  .statsBox .statTrack{
    height:6px !important;
  }
  .nav{display:flex !important;gap:8px !important;overflow-x:auto !important;padding-bottom:2px}
  .navBtn{flex:0 0 auto !important;white-space:nowrap !important;padding:10px 14px !important;font-size:14px}
  .content{width:100% !important;max-width:100% !important;min-width:0 !important;min-height:calc(100dvh - 58px) !important;overflow:hidden !important}
  .topBar{padding:10px !important;gap:8px !important}
  .chip{padding:10px 14px !important;font-size:14px !important}
  .chatArea{padding:12px !important;width:100% !important}
  .bubble{max-width:86% !important;font-size:15px !important}
  .inputBar{padding:10px !important;gap:8px !important;width:100% !important}
  .input{height:48px !important;font-size:16px !important;padding:0 14px !important}
  .send{width:64px !important;font-size:15px !important}
  .gameBtn{width:48px !important;height:48px !important;border-radius:16px !important}
  .panel{padding:16px !important}
  .panel h2{font-size:26px !important}
  .grid{grid-template-columns:1fr !important}
  .scenarioOverlay{grid-template-columns:1fr !important;overflow-y:auto !important}
  .scenarioImageBox{min-height:38vh !important;padding:10px !important;align-items:center !important}
  .scenarioImg{max-height:38vh !important;width:100% !important;object-fit:contain !important}
  .scenarioTextBox{padding:22px !important}
  .scenarioTextBox h1{font-size:30px !important}
  .coverStartBtn{min-width:210px !important;white-space:nowrap !important;text-align:center !important;padding:14px 36px !important}
  .dialogue{min-height:auto !important;padding:20px !important}
  .typeText{font-size:17px !important}
}

/* VN 대사창 모드 */
.vnOverlay{display:block !important;overflow:hidden !important;background-size:cover !important;background-position:center !important;background-repeat:no-repeat !important;min-height:100dvh !important;height:100dvh !important;color:#fff}
.vnBgShade{position:absolute;inset:0;background:radial-gradient(circle at 50% 18%, rgba(255,255,255,.04), rgba(0,0,0,.18) 36%, rgba(0,0,0,.58) 100%);pointer-events:none;z-index:0}
.vnImageStage{position:absolute !important;inset:0 !important;width:100% !important;height:100dvh !important;min-height:100dvh !important;padding:0 !important;display:flex !important;align-items:center !important;justify-content:center !important;overflow:hidden !important;z-index:1}
.vnCharacter{width:100% !important;height:100% !important;max-height:none !important;object-fit:contain !important;object-position:center center !important;filter:drop-shadow(0 28px 52px rgba(0,0,0,.62)) !important;transform:scale(.98)}
.vnTextbox{position:absolute;left:50%;bottom:calc(18px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:3;width:min(980px,calc(100vw - 32px));display:block;padding:0 !important;max-height:none !important;overflow:visible !important}
.vnTitleRow{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 6px 16px;color:rgba(255,255,255,.78);font-size:12px;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,.8)}
.vnName{display:inline-flex;align-items:center;min-width:138px;height:38px;padding:0 18px;margin-left:18px;margin-bottom:-1px;border-radius:14px 14px 0 0;background:linear-gradient(180deg,rgba(49,31,47,.92),rgba(30,18,30,.92));border:1px solid rgba(255,255,255,.22);border-bottom:0;color:#fff;font-size:18px;font-weight:900;letter-spacing:.06em;box-shadow:0 -8px 28px rgba(0,0,0,.35)}
.vnName.narrator{color:#f2d5ad;background:linear-gradient(180deg,rgba(63,43,31,.92),rgba(29,19,13,.92))}
.vnDialogue{width:100%;min-height:142px;text-align:left;border:1px solid rgba(255,255,255,.22);border-radius:22px;background:linear-gradient(180deg,rgba(30,20,38,.82),rgba(18,12,26,.88));color:#fff;box-shadow:0 20px 70px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.12);padding:24px 28px;cursor:pointer;backdrop-filter:blur(9px)}
.vnDialogue .typeText{font-size:20px !important;line-height:1.7 !important;letter-spacing:.01em;white-space:pre-line;text-shadow:0 2px 8px rgba(0,0,0,.68)}
.vnControls{display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:8px}
.vnMiniBtn,.vnNextBtn{border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(0,0,0,.36);color:#fff;padding:9px 13px;font-weight:900;cursor:pointer;backdrop-filter:blur(6px)}
.vnMiniBtn:disabled,.vnNextBtn:disabled{opacity:.45;cursor:default}
.vnNextBtn{background:linear-gradient(135deg,rgba(122,59,34,.92),rgba(53,24,24,.92));border-color:rgba(255,197,129,.28)}
.vnChoices{display:grid;gap:10px;margin-top:12px;max-height:31dvh;overflow:auto;-webkit-overflow-scrolling:touch;padding-right:4px}
.vnChoices .choiceBtn{background:linear-gradient(135deg,rgba(255,255,255,.18),rgba(255,255,255,.08));backdrop-filter:blur(8px);box-shadow:0 8px 28px rgba(0,0,0,.32)}
.vnOverlay .scenarioTag{z-index:4;left:18px;top:18px;background:rgba(0,0,0,.42);backdrop-filter:blur(7px)}
@media(max-width:850px){
  .vnOverlay{height:100dvh !important;min-height:100dvh !important;overflow:hidden !important;background-size:contain !important;background-position:center top !important;background-color:#070404 !important}
  .vnImageStage{height:100dvh !important;min-height:100dvh !important;align-items:center !important;padding:0 !important}
  .vnCharacter{width:100% !important;height:100% !important;object-fit:contain !important;object-position:center center !important;transform:scale(.99)}
  .vnTextbox{width:calc(100vw - 18px);bottom:calc(10px + env(safe-area-inset-bottom));}
  .vnTitleRow{font-size:10px;margin-left:10px;margin-bottom:4px}.vnName{height:30px;min-width:96px;font-size:14px;margin-left:10px;padding:0 12px;border-radius:11px 11px 0 0}
  .vnDialogue{min-height:116px;max-height:31dvh;overflow:auto;-webkit-overflow-scrolling:touch;padding:16px 17px;border-radius:18px}.vnDialogue .typeText{font-size:16px !important;line-height:1.62 !important}
  .vnControls{gap:6px;margin-top:6px}.vnMiniBtn,.vnNextBtn{font-size:12px;padding:8px 10px}.vnChoices{max-height:28dvh;gap:8px;margin-top:8px}.vnChoices .choiceBtn{font-size:14px;padding:12px 13px}.vnOverlay .scenarioTag{font-size:10px;left:10px;top:10px;padding:6px 9px}
}
@media(max-height:620px){.vnDialogue{min-height:92px;max-height:34dvh;padding:13px 16px}.vnDialogue .typeText{font-size:14px !important}.vnControls{margin-top:5px}.vnChoices{max-height:24dvh}}

`;
