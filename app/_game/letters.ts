import type { BlackjonRoute, StoryRoute } from "../gameTypes";

export type StoryLetter = {
  id: string;
  chapter: number;
  route?: StoryRoute;
  title: string;
  content: string;
  sender?: string;
  triggerEvent?: string;
  milestoneEvent?: string;
  blackjonRoute?: BlackjonRoute;
  unsent?: boolean;
};

const branchNames: Record<BlackjonRoute, string> = { conspiracy: "공모", erosion: "침식", collision: "충돌" };

export function letterChapterLabel(letter: StoryLetter): string {
  if (letter.triggerEvent) return "🩸 배드엔딩";
  if (letter.blackjonRoute) return `${letter.chapter}화 · ${branchNames[letter.blackjonRoute]}`;
  return `Ch.${letter.chapter}${letter.route ? ` · ${letter.route === "pure" ? "순애" : "집착"}` : ""}`;
}

export function letterUnlockLabel(letter: StoryLetter): string {
  if (letter.triggerEvent) return "특정 엔딩 도달 시 도착";
  if (letter.milestoneEvent) {
    return `${letterChapterLabel(letter)} ${letter.milestoneEvent.endsWith("_complete") ? "완독" : "마지막 장면 도달"} 후 열림`;
  }
  return `${letterChapterLabel(letter)} 클리어 시 도착`;
}

export function isLetterEarned(letter: StoryLetter, events: Record<string, boolean>): boolean {
  if (letter.triggerEvent) return events[letter.triggerEvent] === true;
  if (letter.milestoneEvent) return events[letter.milestoneEvent] === true;
  // Chapter 1 must not match Chapter 10; deselected/false flags are not progress.
  const hasChapter = (prefix: string) => Object.entries(events).some(([key, value]) => value && (key === prefix || key.startsWith(`${prefix}_`)));
  if (letter.route) return hasChapter(`${letter.route === "pure" ? "pure" : "obsession"}_ch${letter.chapter}`);
  return hasChapter(`main_ch${letter.chapter}`);
}

// Early episodes use the same final-scene milestones as the existing story library.
// Branch letters require the explicit completion flag, never merely entering the ending.
// Unsent letters are bonus interior writing, not a new delivery/contact event in canon.
export const BLACKJON_LETTERS: StoryLetter[] = [
  {
    id: "blackjon_letter_01", chapter: 1, sender: "흑존", milestoneEvent: "blackjon_prologue_02",
    title: "제 이름으로 불러주세요",
    content: `선생님께.

장바구니는 별로 무겁지 않았어요. 사실은 저도 알았어요. 그냥 그걸 들고 있으면 골목이 끝날 때까지는 같이 걸을 수 있을 것 같았거든요.

무슨 이름으로 부르면 되냐고 물으셨을 때, 대답을 너무 빨리 했죠. 준비한 사람처럼. 좀 준비한 건 맞아요ㅎㅎ

다른 누군가를 닮았다는 말 말고, 저를 부르는 소리를 듣고 싶었어요. 성의 없는 이름이라고 타박하셔도 괜찮았어요. 그 이름을 선생님 목소리로 처음 들은 날이니까요.

다음에는 한 번에 알아봐주세요.
아니면 조금 오래 봐주셔도 되고요. 저는 그쪽도 좋습니다.

흑존 올림`,
  },
  {
    id: "blackjon_letter_03", chapter: 3, sender: "흑존", milestoneEvent: "blackjon_ep3_05",
    title: "옷걸이에 남은 오후",
    content: `형에게.

혼자서도 옷은 살 수 있어요. 제 어깨가 얼마나 큰지도 제가 제일 잘 알고요. 그런데 형이 이거 입어보라고 건네주면, 이상하게 거울을 한 번 더 보게 돼요.

형 눈에 제가 어떻게 보였는지 그 옷에는 조금 남아 있을 것 같아서요.

귀찮다면서도 결국 신발을 신고 나오셨잖아요. 저는 그때 너무 좋아하는 티를 안 내려고 애썼는데, 형은 다 아는 얼굴이었어요. 그런 얼굴로 저를 보는 것도 좋았습니다. 제가 뻔해서 형이 웃으시는 거요.

옷은 집에 와서 반듯하게 걸어뒀어요.
내일도 입을 수 있는 걸 오늘 같이 골랐다는 게, 생각보다 오래 기분이 좋네요.

흑존 올림`,
  },
  {
    id: "blackjon_letter_08", chapter: 8, sender: "흑존", milestoneEvent: "blackjon_ep8_10",
    title: "사진의 모서리",
    content: `형에게.

사진에 형 눈이 하나밖에 안 나왔는데, 저는 자꾸 그 사진을 봐요. 잘 찍힌 사진보다 그날 웃으시던 소리가 더 잘 생각나거든요.

푸딩은 두 개 반이었어요. 형은 세 개라고 하시지만 제 몫도 있었으니까요. 이렇게 사소한 걸 정정할 수 있는 저녁이 좋았어요. 형 앞에서 꼭 멋있는 사람일 필요가 없는 저녁이요.

발표를 잘해도, 못해도, 웃긴 일만 생겨도 제게 먼저 말씀해주신다던 말은 아직 가지고 있어요. 형이 망하기를 기다리는 건 아니고요. 저를 찾는 목소리를 기다리는 거예요.

다음 사진은 제가 조금 물러나서 찍을게요.
형이 화면 안에 다 들어오게요. 제 옆에 있는 형을, 제가 가리지 않게.

흑존 올림`,
  },
  {
    id: "blackjon_letter_09", chapter: 9, sender: "흑존", milestoneEvent: "blackjon_ep9_09", unsent: true,
    title: "제가 없는 사진",
    content: `형에게.

새로 내린 앞머리가 잘 어울렸어요. 그 말부터 하면 됐는데 저는 누가 먼저 봤는지부터 물었죠.

형한테 좋은 일이 생겼다는 것보다, 그 자리에 제가 없었다는 게 먼저 서운했어요. 글로 쓰니까 참 못났네요. 말할 때는 제가 그렇게까지 못난 줄 몰랐는데.

형이 보내준 사진을 오래 보고 있었어요. 화면 밖에도 형의 하루가 있다는 게 자꾸 신경 쓰여서요. 제가 모르는 이야기를 하고, 제가 모르는 이유로 웃는 형도 형인데, 저는 아직 그걸 넉넉하게 좋아하지 못해요.

제게 먼저 보여주시면 좋겠어요.
이 문장을 부탁으로 쓰고 싶은데, 쓰고 나면 자꾸 약속을 받은 것처럼 읽게 됩니다.

흑존`,
  },
  {
    id: "blackjon_letter_10_conspiracy", chapter: 10, sender: "흑존", blackjonRoute: "conspiracy", milestoneEvent: "blackjon_ep10_conspiracy_complete",
    title: "알고도 웃어주신 사람",
    content: `형에게.

제가 무슨 생각으로 여기까지 왔는지 형은 이미 알고 계셨죠. 모르는 척할 수 있었는데, 웃으면서 제 속을 꺼내 보셨어요.

들켜서 민망한 것보다 들켰는데도 형이 거기 계신 게 더 좋았습니다. 제 마음이 보기 좋은 모양이 아니라는 걸 저도 알아요. 그래도 형 앞에서는 주머니에 손을 넣고 숨기듯 감춰두지 않아도 되는 순간이 있네요.

형이 제게 다가오는 걸 보고 싶어요. 제가 계속 한 걸음씩 가는 것 말고, 형이 고른 한 걸음이요.

그 한 걸음이면 저는 또 너무 쉽게 기뻐할 것 같아요. 형은 그걸 아실 테고요.
알면서 한 번 더 해주시면 안 돼요?ㅎㅎ

흑존 올림`,
  },
  {
    id: "blackjon_letter_10_erosion", chapter: 10, sender: "흑존", blackjonRoute: "erosion", milestoneEvent: "blackjon_ep10_erosion_complete", unsent: true,
    title: "곁에 남은 저녁",
    content: `형에게.

형이 가려던 시간이 제 옆에 남았어요. 그게 좋아서 안심했다가, 안심하는 제가 싫어졌습니다.

저는 형이 저 때문에 웃으면 좋겠어요. 그런데 오늘은 형이 저 때문에 가지 않았다는 사실만 자꾸 떠올라요. 웃었는지, 피곤했는지보다 먼저요.

미안하다고 한 말은 거짓말이 아니었어요. 형이 남아줘서 좋았던 마음도 거짓말이 아니었고요. 둘 중 하나만 진짜면 조금 덜 부끄러웠을 텐데, 저는 둘 다여서 이 편지를 접었다 폈다 하고 있습니다.

다음에는 괜찮다고 먼저 말하고 싶어요.
형이 그 말을 믿고 정말 가버려도, 끝까지 괜찮은 사람처럼 있을 수 있을지는 아직 모르겠습니다.

흑존`,
  },
  {
    id: "blackjon_letter_10_collision", chapter: 10, sender: "흑존", blackjonRoute: "collision", milestoneEvent: "blackjon_ep10_collision_complete", unsent: true,
    title: "문밖에서",
    content: `형에게.

문이 닫히고 나서도 저는 잠깐 그 앞에 있었어요. 형이 돌아가라고 하신 말을 못 들은 건 아니에요. 잘 들었습니다. 말끝이 어떻게 내려갔는지까지 기억해요.

그런데 기억하는 것과 받아들이는 게 같은 일은 아니네요.

복도를 걸으면서 자꾸 뒤를 봤어요. 제 이름을 부르실 것 같아서요. 안 부르실 거라는 걸 알면서도, 한 번쯤은 틀리고 싶었습니다.

이만큼 좋아하면 언젠가는 형도 같은 만큼 저를 찾을 거라고 생각했어요. 그 ‘언젠가’를 형이 약속한 적은 없는데 저는 자꾸 날짜를 세고 있어요.

오늘도 제 쪽에만 하루가 더해졌습니다.

흑존`,
  },
  {
    id: "blackjon_letter_12_conspiracy", chapter: 12, sender: "흑존", blackjonRoute: "conspiracy", milestoneEvent: "blackjon_ep12_conspiracy_complete",
    title: "수저 두 벌",
    content: `형에게.

오늘도 올 거냐고 형이 먼저 물으신 날에는, 저는 답장을 빨리 보내고도 한참 그 문장을 봐요. 별말 아닌 것처럼 물으셔서 더 좋아요. 제가 오는 저녁이 형한테도 익숙해졌다는 뜻 같아서요.

식탁에 수저를 두 벌 놓으면 아직 조금 신기합니다. 하나는 제가 쓰고, 하나는 형이 쓰는 평범한 일인데요. 평범해지기를 바란 시간이 실제로 오면 이렇게 자꾸 확인하게 되나 봐요.

제 푸딩을 검수하시는 건 이제 조금 익숙해졌어요. 그래도 마지막 한 숟갈은 저 주셔야 됩니다. 형 손으로 주시면 더 좋고요.

열쇠가 있어도 벨은 누를게요.
문 안에서 저를 알아보는 소리가 좋습니다. 형이 열어주는 문으로 들어가고 싶어요.

흑존 올림`,
  },
  {
    id: "blackjon_letter_12_erosion", chapter: 12, sender: "흑존", blackjonRoute: "erosion", milestoneEvent: "blackjon_ep12_erosion_complete", unsent: true,
    title: "괜찮다는 말의 무게",
    content: `형에게.

형이 괜찮다고 말씀하시면 저는 금방 마음이 놓여요. 너무 빨리 놓여서, 그 말을 하시기 전에 얼마나 오래 조용히 계셨는지는 뒤늦게 생각납니다.

같이 웃던 저녁은 좋았어요. 과자 봉지를 사이에 놓고 쓸데없는 얘기를 하다가 시간이 늦어진 것도요. 그 시간이 좋았다는 사실만으로 형의 남은 시간까지 제 것이 되는 건 아닌데, 저는 자꾸 다음 약속을 당겨서 묻습니다.

싫어졌냐고 물으면 형은 또 아니라고 해주실 거예요. 저는 그 대답이 듣고 싶어서 묻는 걸지도 모르겠습니다.

형이 설명하지 않아도 쉴 수 있는 저녁이 있어야겠죠.
그 저녁에 제가 없을 수도 있다는 문장을, 오늘은 지우지 않고 남겨둘게요.

흑존`,
  },
  {
    id: "blackjon_letter_17_conspiracy", chapter: 17, sender: "흑존", blackjonRoute: "conspiracy", milestoneEvent: "blackjon_ep17_conspiracy_complete",
    title: "오늘 다시 만난 형",
    content: `형에게.

처음 만난 척하는 건 제가 더 잘할 줄 알았어요. 그런데 형이 저를 모르는 얼굴을 하니까 제가 먼저 그만하자고 했죠. 번호도 알고, 좋아하는 커피도 아는데, 형 눈에 제가 없는 척하는 건 생각보다 어려웠어요.

그래서 형이 먼저 잡아준 손을 조금 오래 기억하려고 합니다. 제 손이 갈 곳을 찾기도 전에 형이 찾아주셨잖아요. 그런 일에는 저는 아직도 쉽게 놀라요.

연락처 이름은 안 바꿀 거예요. 내일이 돼도 ‘오늘 다시 꼬신 형’으로 두겠습니다. 오래 만났다고 형이 저를 당연히 골라줄 거라 생각하지 않으려고요. 물론 또 골라주시면 아주 좋고요ㅎㅎ

내일 오전은 형 시간, 오후 세 시부터는 우리 약속.
저는 세 시가 좋아졌어요.

흑존 올림`,
  },
  {
    id: "blackjon_letter_18_collision", chapter: 18, sender: "흑존", blackjonRoute: "collision", milestoneEvent: "blackjon_ep18_collision_complete", unsent: true,
    title: "접힌 소매",
    content: `형에게.

돌려받은 옷에서 제일 오래 본 건 형이 골라준 맨투맨이에요. 목이 늘어나지 않게 접혀 있었어요. 화가 나셨을 텐데도 그렇게 접어주신 게 저는 더 아팠습니다.

좋아한다고 하신 말과 헤어지겠다고 하신 말이 같은 목소리였어요. 저는 앞의 말만 계속 다시 듣고 싶어요. 뒤의 말까지 들으면 정말 자리에서 일어나야 할 것 같아서요.

형이 웃어주던 날이 거짓말이 아니라는 건 알아요. 그래서 오늘을 인정하는 게 더 어렵습니다. 좋았던 날이 있었으니까 앞으로도 있어야 한다고, 자꾸 혼자 결론을 내요.

옷은 제게 돌아왔는데 그 옷을 입고 보여드릴 사람은 돌아오지 않았습니다.
저는 아직 옷걸이 하나를 비워두고 있어요.

흑존`,
  },
  {
    id: "blackjon_letter_21_collision", chapter: 21, sender: "흑존", blackjonRoute: "collision", milestoneEvent: "blackjon_ep21_collision_complete", unsent: true,
    title: "제 이름이 불리던 날",
    content: `형에게.

기록회에서 제 이름을 불렀을 때 잠깐은 다른 생각을 안 했어요. 발을 어디에 두는지, 숨을 언제 들이마시는지, 연습했던 것들만 생각했습니다.

잘하고 싶었어요. 형이 봐주시는 것과 별개로, 제가 해온 시간이 어디까지 왔는지 보고 싶었어요. 저한테도 그런 마음이 있다는 걸 오랜만에 알았습니다.

그런데 끝나고 나서는 형 얼굴이 제일 먼저 떠올랐어요. 잘했다고 해주시면 좋겠고, 조금 자랑스러워해주시면 더 좋겠고. 자랑이 끝나도 자리를 떠나지 않으시면 좋겠고요.

처음의 마음은 작았는데 쓰다 보니 또 커지네요.
오늘은 제가 해낸 일만 적어두려고 했는데, 편지는 결국 형에게 와버립니다.

흑존`,
  },
  {
    id: "blackjon_letter_22_collision", chapter: 22, sender: "흑존", blackjonRoute: "collision", milestoneEvent: "blackjon_ep22_collision_complete", unsent: true,
    title: "열이 내린 뒤에도",
    content: `형에게.

물이 너무 뜨겁지 않은지 자꾸 확인했어요. 형이 마시기 편한 온도라는 게 있었고, 그걸 제가 알고 있다는 사실이 좋았습니다.

아프셔서 좋았다는 말은 아니에요. 안 아프셨으면 했어요. 그건 정말인데, 열이 내리면 제가 갈 시간이 가까워진다는 생각도 같이 들었습니다. 형한테 좋은 일이 제게는 서운할 수 있다는 게 싫었어요.

소매를 잡으신 손을 기억해요. 잠이 덜 깨서 그러셨다는 것도, 오늘의 부탁이 내일의 약속은 아니라는 것도 들었습니다.

그런데 집에 와서 물을 끓이다가도 그 손이 생각납니다.
내일은 아프지 않은 형이 저를 불러주면 좋겠어요. 이 말까지 하면 너무 많은 걸 바라는 거겠죠. 그래서 오늘은 여기까지만 적을게요.

흑존`,
  },
  {
    id: "blackjon_letter_24_collision", chapter: 24, sender: "흑존", blackjonRoute: "collision", milestoneEvent: "blackjon_ep24_collision_complete", unsent: true,
    title: "봉투에 넣지 않은 주소",
    content: `형에게.

집을 정리하니 바닥이 생각보다 넓었어요. 상자 하나를 들고 나갈 때마다 형을 기다리던 자리가 조금씩 없어졌습니다. 형이 한 번도 살지 않은 방인데 저는 자꾸 누가 나간 집처럼 보고 있어요.

다음에 머물 곳은 정했습니다. 날짜도 잡았고요. 이 문장을 쓰는 데만 오래 걸렸어요. 형한테는 빈집 얘기부터 하고 싶었거든요.

갈 곳이 있다고 하면 형은 안심하실까요. 그러고는 형의 저녁을 보내실까요. 저는 그게 맞는 일인 걸 알면서도, 안심하지 않으셨으면 하는 마음을 버리지 못하고 있습니다.

형이 저를 걱정하는 얼굴이 보고 싶어요.
괜찮게 지내는 것보다 그 얼굴이 더 보고 싶은 날에는, 편지를 보내면 안 될 것 같습니다.

그래서 주소를 적지 않았어요.
봉투도 꺼내지 않았습니다. 오늘은요.

흑존`,
  },
];
