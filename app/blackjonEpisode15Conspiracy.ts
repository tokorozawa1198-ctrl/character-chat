import type { Scenario } from "./gameTypes";

// 공모 14화 이후의 주말. 형이 시작한 장난을 흑존이 알아보고 즐기는 하루.
export const blackjonEpisode15Conspiracy: Record<string, Scenario> = {
  blackjon_ep15_conspiracy_01: {
    id: "blackjon_ep15_conspiracy_01", title: "흑존 15화: 공모 · 너도 한번 당해봐",
    subtitle: "다음 주말 · 동네 마트", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep15_conspiracy_basket.png"], background: "/blackjon_ep15_conspiracy_basket.png",
    text: `다음 주말, 두 사람은 저녁거리를 사러 나왔다. 오늘은 형의 집에서 먹기로 했다.

형은 채소 코너에서 피망 하나를 들고 흑존을 봤다.

히든: 저번 주에는 신발 벗으면서 나를 보더니.
흑존: 오늘은 씻고 나왔어요.
히든: 안 물었는데.
흑존: 물으실 것 같아서요ㅎㅎ

형은 피망을 카트에 넣었다. 그 옆에는 이미 두부와 당근이 있었다. 흑존은 휴대폰의 장보기 목록과 형을 번갈아 확인했다.

흑존: 어제는 저 없이 뭐 하셨어요?
히든: 잤지. 만화 보고.
흑존: 몇 시까지요?
히든: 기억 안 남.
흑존: 저는 생각 안 나셨어요?

형이 카트 손잡이에 두 팔을 기댔다.

히든: 넌 어떻게 일주일 내내 질문이 안 떨어지냐.
흑존: 형 답이 짧으니까 계속 생기죠.
히든: 내가 길게 답하면?
흑존: 그럼 궁금한 게 더 생길 것 같은데요.

흑존이 웃었다. 형도 웃다가 입을 다물었다.

가만 생각하니 늘 자기가 대답하는 쪽이었다. 어디 갔는지, 뭘 먹었는지, 왜 웃었는지. 흑존은 물어놓고 답을 들을 때마다 아주 만족스러운 얼굴을 했다.

형은 카트 너머로 그 얼굴을 봤다.

히든: 그래?`,
    choices: [{ label: "오늘은 내가 물어보기로 한다", stat: { affinity: 1 }, next: "blackjon_ep15_conspiracy_02" }],
  },
  blackjon_ep15_conspiracy_02: {
    id: "blackjon_ep15_conspiracy_02", title: "흑존 15화: 공모 · 아주 좋은 생각",
    subtitle: "계획은 혼자 세운다", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep15_conspiracy_basket.png"], background: "/blackjon_ep15_conspiracy_basket.png",
    text: `형은 오늘만 흑존처럼 굴어보기로 했다.

혼자 두지 말라고 하고, 누구랑 연락하냐고 하고, 계속 자기만 보라고 하면 한 번쯤은 귀찮은 표정을 짓겠지. 그때 얼굴 앞에서 똑같다고 웃어줄 생각이었다.

흑존은 아직 아무것도 모르는 얼굴로 피망 봉지를 다시 집었다.

흑존: 이거 잘 드실 수 있어요?
히든: 나 편식 안 하거든.
흑존: 저번에 제 접시에 다 주셨잖아요.
히든: 사랑해서.
흑존: 버섯도 사랑해서 주셨고요?
히든: ㅇㅇ. 많이 사랑했네.

흑존이 피식 웃으며 봉지를 내려놓았다. 형은 그 틈에 팔짱을 끼고 턱을 조금 들었다. 평소 흑존이 자기를 기다릴 때 짓던 표정을 떠올렸다.

흑존: 형 왜요?
히든: 아무것도.
흑존: 표정이 이상한데.
히든: 원래 이 얼굴임.

형이 먼저 카트를 밀었다. 웃음이 나려 해서 채소 쪽을 보는 척했다. 오늘 저녁은 꽤 재미있을 것 같았다.

흑존은 한 박자 늦게 따라왔다. 형의 입가를 보고, 고개를 조금 기울였다.`,
    choices: [{ label: "태연하게 다음 코너로 간다", stat: { affinity: 1 }, next: "blackjon_ep15_conspiracy_03" }],
  },
  blackjon_ep15_conspiracy_03: {
    id: "blackjon_ep15_conspiracy_03", title: "흑존 15화: 공모 · 나 두고?",
    subtitle: "우유 한 통을 사는 일", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep15_conspiracy_basket.png"], background: "/blackjon_ep15_conspiracy_basket.png",
    text: `냉장 코너가 보이자 흑존이 손을 뻗어 방향을 가리켰다.

흑존: 저 우유만 가져올게요.
히든: 어디 가.
흑존: 우유요. 저기.
히든: 나 두고?

흑존의 발이 멎었다.

형은 카트 옆에 그대로 서 있었다. 장난이 들키지 않게 입술에 힘을 줬다. 흑존은 냉장고를 한 번 보고, 형을 한 번 봤다.

흑존: …같이 가실래요?

예상보다 목소리가 밝았다.

히든: 내가 먼저 말해야 같이 가는 거야?

흑존이 입을 조금 벌렸다. 형은 속으로 됐다고 생각했다. 당황했다. 확실히 당황했다.

그런데 흑존이 카트의 방향을 돌렸다.

흑존: 아. 그렇네.
히든: 응?
흑존: 같이 가요. 제가 생각이 짧았어요.

사과하는 사람치고 얼굴이 너무 좋았다. 형은 잠깐 말이 막혔다가 카트 옆으로 붙었다.

흑존: 형 오늘 왜 이렇게 귀여우세요?
히든: 귀엽다는 말 하지 마. 지금 진지함.
흑존: 네. 엄청 진지하게 귀여우신데.

형은 앞을 봤다. 시작부터 반응이 조금 이상했다.`,
    choices: [{ label: "조금 더 해보기로 한다", stat: { affinity: 1, obsession: 1 }, next: "blackjon_ep15_conspiracy_04" }],
  },
  blackjon_ep15_conspiracy_04: {
    id: "blackjon_ep15_conspiracy_04", title: "흑존 15화: 공모 · 이쪽 팔",
    subtitle: "형이 먼저", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep15_conspiracy_arm.png"], background: "/blackjon_ep15_conspiracy_arm.png",
    text: `흑존이 우유를 꺼내자 형은 그의 왼팔에 자기 오른팔을 끼웠다. 손은 두꺼운 팔 위에 얹었다.

흑존은 우유를 든 채 그대로 굳었다.

히든: 왜. 무거워?
흑존: 아뇨.
히든: 불편해?
흑존: 전혀요.

대답이 너무 빨랐다. 형은 팔을 조금 더 붙였다. 흑존은 고개를 숙여 붙어 있는 팔을 봤다. 다시 형을 봤다. 입꼬리가 올라갔다.

히든: 넌 원래 팔짱 끼면 이런 표정이냐?
흑존: 형이 먼저 끼셨잖아요.
히든: 내가 처음 끼냐.
흑존: 먼저 끼실 때마다 좋으니까요.

흑존이 카트를 한 손으로 밀었다. 형의 걸음에 맞춰 속도를 늦추는 바람에 둘은 우유 냉장고 앞에서 별로 나아가지 못했다.

형은 그의 옆얼굴을 살폈다. 불편한 기색이 없었다. 오히려 자꾸 자기 쪽을 보고 있었다.

히든: 앞 봐. 부딪힌다.
흑존: 형 보라면서요.
히든: 아직 그 말 안 했는데.

흑존이 웃었다.

흑존: 아. 아직이에요?`,
    choices: [
      { label: "왜 혼자 웃냐고 묻는다", stat: { affinity: 1 }, result: "히든: 너 지금 나 놀리냐?\n흑존: 저는 좋아서 웃는데요.\n히든: 덜 좋아해.\n흑존: 그건 잘 안 되네요ㅎㅎ", next: "blackjon_ep15_conspiracy_05" },
      { label: "팔짱을 그대로 유지한다", stat: { affinity: 2, obsession: 1 }, result: "형은 대꾸하는 대신 팔을 고쳐 끼웠다.\n흑존은 그 작은 동작을 내려다봤다.\n흑존: 네. 그렇게요.\n히든: 지도하지 마세요. 제가 알아서 합니다.", next: "blackjon_ep15_conspiracy_05" },
    ],
  },
  blackjon_ep15_conspiracy_05: {
    id: "blackjon_ep15_conspiracy_05", title: "흑존 15화: 공모 · 나 좀 봐",
    subtitle: "가격표보다 중요한 것", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep15_conspiracy_arm.png"], background: "/blackjon_ep15_conspiracy_arm.png",
    text: `흑존은 우유를 카트에 넣으려다가 진열대 가격표를 확인했다. 형이 그 순간을 놓치지 않았다.

히든: 나랑 있는데 뭐 그렇게 열심히 봐.
흑존: 가격이요.
히든: 나 좀 봐.

흑존이 바로 형을 봤다.

형은 다음 말을 준비하고 있었는데, 눈을 마주친 채 기다려주니까 갑자기 할 말이 없어졌다.

흑존: 네.
히든: …그렇게까지 보라는 게 아니라.
흑존: 얼마나 볼까요?
히든: 적당히.
흑존: 형이 알려주세요. 저 적당히 잘 못해서.

형이 헛기침했다. 흑존은 우유를 든 손을 내려놓지도 않고 기다렸다. 입가만 조금 올라가 있었다.

히든: 됐어. 우유 넣어.
흑존: 이거 두 개 사요?
히든: 하나.
흑존: 형 집에 두고 저도 마시게요.
히든: 하나 다 마시면 또 사. 사재기하지 말고.

흑존은 알겠다고 하고 한 통을 넣었다. 형은 팔짱을 낀 채 그의 팔을 손가락으로 톡 쳤다.

히든: 아까 왜 가격을 두 번이나 봤어.
흑존: 형이 계속 말 걸어서 까먹었어요.

드디어였다.

형은 웃음을 참으며 고개를 들었다.`,
    choices: [{ label: "귀찮지 않냐고 떠본다", stat: { affinity: 1 }, next: "blackjon_ep15_conspiracy_06" }],
  },
  blackjon_ep15_conspiracy_06: {
    id: "blackjon_ep15_conspiracy_06", title: "흑존 15화: 공모 · 고장 난 계획",
    subtitle: "원하는 답은 안 나오고", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep15_conspiracy_arm.png"], background: "/blackjon_ep15_conspiracy_arm.png",
    text: `히든: 귀찮지?
흑존: 뭐가요?
히든: 내가 계속 말 걸고. 옆에 붙어 있고.

흑존은 잠깐 형을 봤다. 이번에는 바로 답하지 않았다.

히든: 솔직히 말해도 됨.
흑존: 솔직히요?
히든: ㅇㅇ.
흑존: 집에 가서도 이러시면 좋겠는데요.

형의 얼굴에서 웃음이 빠졌다.

히든: 아니.
흑존: 집에서는 안 해주세요?
히든: 왜 조건을 추가함.

흑존은 웃으며 고개를 돌렸다. 형이 안 보는 쪽에서 한 번 입술을 눌렀다. 이제는 알 것 같았다. 아까부터 형의 말에 자기 말버릇이 섞여 있었다.

‘나 두고?’ 다음에 ‘나 좀 봐.’

조금만 더 기다리면 평소 자기에게 하지 않던 말을 더 해줄지도 몰랐다. 흑존은 굳이 들켰다는 걸 알려주지 않았다.

흑존: 그러면 마트에서만이라도요.
히든: 그걸 왜 그렇게 간절하게 말해ㅋㅋ
흑존: 간절하니까요.

형은 눈을 가늘게 떴다. 흑존은 아무것도 모르는 척 장보기 목록을 확인했다.

오늘은 물건을 몇 개 빼먹어도 괜찮을 것 같았다.`,
    choices: [{ label: "장난을 멈추기엔 아직 이르다", stat: { affinity: 1, obsession: 1 }, next: "blackjon_ep15_conspiracy_07" }],
  },
  blackjon_ep15_conspiracy_07: {
    id: "blackjon_ep15_conspiracy_07", title: "흑존 15화: 공모 · 같은 편",
    subtitle: "간식 코너", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep15_conspiracy_arm.png"], background: "/blackjon_ep15_conspiracy_arm.png",
    text: `형은 과자 봉지 두 개를 집었다. 흑존이 카트 안을 봤다.

흑존: 저녁 먹을 건데요.
히든: 저녁도 먹고.
흑존: 아까 빵도 골랐잖아요.
히든: 그건 걸어가면서 먹을 거고.

흑존이 형을 봤다. 형은 눈을 피하지 않았다.

히든: 내 편 안 들어줄 거야?

말하고 나서 형 스스로 조금 웃을 뻔했다. 평소 흑존이 쓸 법한 억울한 목소리까지 냈다.

흑존은 과자 하나를 더 집어 카트에 넣었다.

히든: 뭐 함?
흑존: 제 것도요.
히든: 말리려던 거 아니었냐?
흑존: 형 편 하려고요.

형이 결국 웃었다. 흑존은 그 틈에 과자 봉지를 제대로 세워 넣었다. 형이 늘 먼저 뜯는 맛이었다.

히든: 이러면 넌 나를 도와주는 척하고 과자 먹는 사람 아님?
흑존: 같이 먹으면 같은 편이죠.
히든: 말 잘하네. 나쁜 거만 배워서.
흑존: 누구한테 배웠을까요.

형은 입을 다물고 그의 팔을 한 번 툭 쳤다.

카트는 처음 생각했던 것보다 많이 찼다. 두 사람 다 과자를 빼지는 않았다.`,
    choices: [{ label: "계산대로 향한다", stat: { affinity: 1 }, next: "blackjon_ep15_conspiracy_08" }],
  },
  blackjon_ep15_conspiracy_08: {
    id: "blackjon_ep15_conspiracy_08", title: "흑존 15화: 공모 · 누구랑 연락해",
    subtitle: "계산대 앞", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep15_conspiracy_phone.png"], background: "/blackjon_ep15_conspiracy_phone.png",
    text: `계산 줄에 서면서 형은 팔을 풀었다. 흑존의 휴대폰이 짧게 울렸다.

흑존이 화면을 확인하자 형이 바로 몸을 기울였다.

히든: 누구야.
흑존: 체육관 단톡이요.
히든: 나랑 있는데 연락해야 돼?

흑존은 답장을 쓰려던 손을 멈췄다. 형은 이번에는 웃지 않고 버텼다.

흑존: 오늘 문 닫는 시간이 바뀌었대요.
히든: 그래도 나 봐야지.

흑존이 휴대폰을 조금 내리고 형을 봤다. 눈가가 접혔다.

히든: 왜 또 좋아하냐.
흑존: 질투하시는 것 같아서요.
히든: 질문인데.
흑존: 질문이 좋네요.

그는 휴대폰을 자기 쪽에 둔 채 공지를 마저 읽었다. 형은 화면을 빼앗지 않고 옆에서 기다렸다. 답장은 확인했다는 짧은 한마디였다.

흑존: 끝. 이제 형 볼게요.
히든: 원래 이렇게 순순히 넘어가는 거냐?
흑존: 원래는 저한테 잘 안 물으시잖아요.

형은 카트 바퀴 쪽으로 시선을 내렸다. 생각해보니 정말 그랬다. 흑존이 누구랑 연락하든, 끝나고 자기 얘기를 할 때까지 기다리는 편이었다.

흑존은 화면을 끄고 주머니에 넣었다.`,
    choices: [{ label: "아직 할 말이 있는 척한다", stat: { affinity: 1 }, next: "blackjon_ep15_conspiracy_09" }],
  },
  blackjon_ep15_conspiracy_09: {
    id: "blackjon_ep15_conspiracy_09", title: "흑존 15화: 공모 · 낯익은 말투",
    subtitle: "이쯤 되면", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep15_conspiracy_phone.png"], background: "/blackjon_ep15_conspiracy_phone.png",
    text: `형이 손가락으로 카트 손잡이를 두드렸다.

히든: 다음부터 연락 오면 나한테 먼저 말해.
흑존: 형도요?
히든: …난 왜.

흑존이 고개를 옆으로 기울였다. 그 얼굴 때문에 형이 먼저 웃음을 터뜨렸다.

히든: 아ㅋㅋ 뭘 그렇게 봐.
흑존: 저는 안 되고 형은 돼요?
히든: 내가 연장자니까.
흑존: 아까는 같은 편이라면서요.
히든: 같은 편에도 순서가 있지.

흑존이 입을 가리고 웃었다. 형은 그의 팔뚝을 쿡 찔렀다.

히든: 너 지금 재미있지.
흑존: 엄청요.
히든: 나는 왜 점점 힘들지.
흑존: 더 하셔도 되는데.

형이 그를 올려다봤다.

흑존: 아. 질문이요.

흑존은 눈을 한 번 느리게 깜빡였다. 모르는 척하는 얼굴이 너무 뻔했다. 형은 입을 열었다 닫았다가, 앞사람이 움직이자 카트를 밀었다.

히든: 일단 계산이나 하자.
흑존: 네ㅎㅎ

흑존은 형이 먼저 놓은 두부를 집어 계산대에 올렸다. 형의 계획을 망쳤다는 말은 아직 하지 않았다.`,
    choices: [
      { label: "아직 안 끝났다고 말한다", stat: { affinity: 1, obsession: 1 }, result: "히든: 나 아직 안 끝났어.\n흑존: 다행이다.\n히든: 진짜 짜증나ㅋㅋ\n흑존: 천천히 하세요. 저 시간 많아요.", next: "blackjon_ep15_conspiracy_10" },
      { label: "과자 봉지를 계산대에 올린다", stat: { affinity: 1 }, result: "형은 대답 대신 과자를 세 봉지 올렸다.\n흑존: 이거 하나는 저도 먹어도 되죠?\n히든: 봐서.\n흑존: 형 편 들기 어렵네요.\n히든: 이제 아셨는지.", next: "blackjon_ep15_conspiracy_10" },
    ],
  },
  blackjon_ep15_conspiracy_10: {
    id: "blackjon_ep15_conspiracy_10", title: "흑존 15화: 공모 · 두 손이면 충분해",
    subtitle: "봉투에 담는 동안", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep15_conspiracy_phone.png"], background: "/blackjon_ep15_conspiracy_phone.png",
    text: `계산을 마친 뒤 흑존은 무거운 물건부터 장바구니에 담았다. 형은 빵 봉투만 챙기려다가 시선을 느끼고 우유를 집었다.

히든: 나도 들려고 했어.
흑존: 빵 드세요. 우유는 여기 넣고.
히든: 됐어. 나도 손 있음.
흑존: 한 손은 저 잡으셔야죠.

형은 우유를 든 채 흑존을 봤다.

히든: 내가 언제.
흑존: 저 혼자 가면 싫으시다면서요.
히든: 그거 아직 기억하냐.
흑존: 방금 일이잖아요ㅋㅋ

형은 우유를 장바구니에 넣었다. 흑존이 양쪽 봉투 손잡이를 오른손으로 한꺼번에 잡았다. 왼손은 비워뒀다.

누가 봐도 기다리는 자세였다.

히든: 손 왜 그러고 있어.
흑존: 아무것도 안 하는데요.

형은 빵 봉투를 왼손으로 옮겼다. 흑존의 눈이 그걸 따라갔다.

히든: 아주 좋아 죽는다.
흑존: 네.

형은 대꾸하지 않고 먼저 자동문 쪽으로 걸었다. 흑존도 옆에 붙었다. 비워놓은 손은 둘 사이에서 천천히 흔들렸다.`,
    choices: [{ label: "밖으로 나가며 그 손을 잡는다", stat: { affinity: 2, obsession: 1 }, next: "blackjon_ep15_conspiracy_11" }],
  },
  blackjon_ep15_conspiracy_11: {
    id: "blackjon_ep15_conspiracy_11", title: "흑존 15화: 공모 · 집에 가는 길",
    subtitle: "한 손씩", kind: "normal", category: "main",
    imagePool: ["/blackjon_ep15_conspiracy_street.png"], background: "/blackjon_ep15_conspiracy_street.png",
    text: `형이 손을 잡자 흑존은 곧장 손가락을 맞물렸다. 확인하듯 형 얼굴을 한 번 보고 앞을 봤다.

그 뒤로 잠깐 조용했다.

형은 빵 봉투를 내려다봤다. 먹으려면 한 손이 더 필요했다.

히든: 손 좀.
흑존: 아, 네.

흑존이 바로 놓았다. 형은 오히려 그 손을 한 번 더 봤다. 아쉬워하면서도 대꾸 없이 놓는 건, 자기 계획에 없던 반응이었다.

형은 빵을 반으로 나눠 한쪽을 흑존에게 건넸다. 둘은 가게 차양 옆에 잠깐 서서 먹었다.

흑존: 형 오늘 무슨 좋은 일 있어요?
히든: 있었어야 되는데.
흑존: 없어요?
히든: 누가 너무 협조적이라 망한 듯.

흑존이 빵을 문 채 웃었다. 형은 그 얼굴을 보고 자기도 웃어버렸다.

히든: 볼 터진다. 천천히 먹어.

흑존은 고개를 끄덕였다. 형이 나눠준 빵은 생각보다 달았다.

다 먹고 다시 걷기 시작했을 때 형이 먼저 손을 내밀었다. 이번에는 아무 말도 덧붙이지 않았다. 흑존도 바로 잡기만 했다.

몇 걸음 뒤에야 입을 열었다.

흑존: 남은 길 좀 멀었으면 좋겠다.
히든: 우유 상한다. 빨리 가.`,
    choices: [{ label: "걸음을 맞춰 걷는다", stat: { affinity: 2 }, next: "blackjon_ep15_conspiracy_12" }],
  },
  blackjon_ep15_conspiracy_12: {
    id: "blackjon_ep15_conspiracy_12", title: "흑존 15화: 공모 · 귀찮은 쪽은",
    subtitle: "형의 집 앞", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep15_conspiracy_street.png"], background: "/blackjon_ep15_conspiracy_street.png",
    text: `집이 가까워질 무렵 형은 처음 계획을 거의 포기했다.

흑존이 한 번쯤은 귀찮아해야 놀릴 수 있는데, 오늘 제일 귀찮아진 건 계속 질문을 생각해내는 자기였다.

히든: 너 안 힘드냐.
흑존: 봉투요? 가벼워요.
히든: 그거 말고. 나한테 맨날 말 거는 거.
흑존: 하고 싶은 말 하는 건데요.
히든: 할 말이 어떻게 그렇게 많아.

흑존은 잠깐 생각했다.

흑존: 말 안 하면 형 다른 거 보시니까.

형이 고개를 돌렸다. 흑존은 웃고 있었다. 장난처럼 말했지만, 그 말까지 흉내 낸 건 아니었다.

흑존: 저 볼 때는 좋고요.
히든: 지금 보고 있잖아.
흑존: 네. 그래서 오늘 좋다고요.

형은 그 눈을 조금 더 보고 앞을 봤다. 괜히 손을 한 번 고쳐 잡았다.

히든: 오늘 충분히 봤으니까 들어가면 나 좀 쉬게 해줘.
흑존: 같이 쉬어요.
히든: 일단 장 본 거부터 넣고.

흑존이 대답 대신 웃었다. 형은 현관 비밀번호를 누르려고 손을 놓았다. 흑존은 봉투를 양손으로 나눠 들었다.

오늘은 형이 문을 열고 먼저 들어오라고 했다.`,
    choices: [{ label: "집에 들어간다", stat: { affinity: 1 }, next: "blackjon_ep15_conspiracy_13" }],
  },
  blackjon_ep15_conspiracy_13: {
    id: "blackjon_ep15_conspiracy_13", title: "흑존 15화: 공모 · 장보기는 안 끝났어요",
    subtitle: "형의 집 · 주방", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep15_conspiracy_kitchen.png"], background: "/blackjon_ep15_conspiracy_kitchen.png",
    text: `형은 신발을 벗자마자 소파로 갔다. 흑존은 봉투를 주방 조리대에 내려놓았다.

흑존: 형.
히든: 응.
흑존: 저 혼자 두세요?

형이 소파에 반쯤 앉은 자세로 멈췄다.

히든: …뭐?
흑존: 저는 아직 장 본 거 넣고 있는데.

형은 고개를 젖혔다. 흑존은 봉투에서 우유를 꺼내며 아주 얌전한 얼굴을 했다.

흑존: 같이 가자고 해주셔야 되는 거 아니에요?
히든: 야ㅋㅋㅋ
흑존: 먼저 말해야 같이 와주세요?

형은 결국 웃으며 일어났다. 주방에 와서 조리대에 기대섰다.

히든: 됐냐.
흑존: 네. 옆에 계시니까 좋네요.
히든: 너 알고 있었지.

흑존은 냉장고 문을 열었다. 우유를 넣는 동안 어깨가 조금 들썩였다.

히든: 대답해.
흑존: 뭐를요?
히든: 아주 모르는 척을 하네.

형은 봉투에서 피망을 꺼내 그의 앞에 들어 보였다. 흑존이 웃음을 터뜨렸다. 형도 따라 웃다가 피망을 조리대에 내려놓았다.`,
    choices: [{ label: "언제부터 알았는지 묻는다", stat: { affinity: 1 }, next: "blackjon_ep15_conspiracy_14" }],
  },
  blackjon_ep15_conspiracy_14: {
    id: "blackjon_ep15_conspiracy_14", title: "흑존 15화: 공모 · 좋아서요",
    subtitle: "들통난 사람은 둘", kind: "normal", category: "main",
    imagePool: ["/blackjon_ep15_conspiracy_kitchen.png"], background: "/blackjon_ep15_conspiracy_kitchen.png",
    text: `히든: 언제부터.
흑존: 우유 고를 때요.
히든: 그렇게 빨리?
흑존: 형이 나 좀 보라고 하셔서요. 어디서 많이 들었다 싶었죠.

형이 손으로 얼굴을 쓸었다.

히든: 알면서 왜 계속 받아줌?
흑존: 좋으니까요.

대답이 짧았다. 이번에는 웃음도 없었다.

흑존: 장난이어도 형이 먼저 붙으셨잖아요.

형이 조리대 모서리를 내려다봤다. 흑존은 채소 봉지를 정리하며 말을 이었다.

흑존: 저 어디 가는지 물어보고. 누구랑 연락하는지도 물어보고.
히든: 귀찮으라고 한 건데.
흑존: 저한테는 그게 안 먹히네요.

흑존이 웃었다. 형은 어이없어서 입을 벌렸다가 닫았다.

히든: 나 지금 완전 헛짓한 거네.
흑존: 저는 되게 알차게 보냈어요.
히든: 아오ㅋㅋ

형은 빈 봉투를 접어 흑존의 어깨에 가볍게 툭 댔다. 흑존은 피하는 시늉만 하고 그대로 맞았다.

흑존: 형이 계속 저만 신경 쓰시니까.

그는 그 말 끝에 형을 봤다. 형은 봉투를 접던 손을 잠깐 멈췄다.

한 번도 생각하지 않은 쪽으로, 오늘의 계획은 아주 잘 성공한 모양이었다.`,
    choices: [{ label: "남은 물건을 함께 정리한다", stat: { affinity: 1, obsession: 1 }, next: "blackjon_ep15_conspiracy_15" }],
  },
  blackjon_ep15_conspiracy_15: {
    id: "blackjon_ep15_conspiracy_15", title: "흑존 15화: 공모 · 실패 인정은 안 함",
    subtitle: "둘이 먹을 저녁", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep15_conspiracy_kitchen.png"], background: "/blackjon_ep15_conspiracy_kitchen.png",
    text: `히든: 근데 너도 하나는 느꼈을 거 아냐.
흑존: 뭘요?
히든: 계속 옆에서 말 걸면 장보기 어렵다든가.
흑존: 네. 가격 두 번 봤잖아요.
히든: 그러니까 평소에 내가—
흑존: 대신 형 팔짱 꼈잖아요.

형이 눈을 감았다.

히든: 손해라는 개념이 없음?
흑존: 그건 이득인데.

형은 더 설명하지 않았다. 냉장고에서 생수를 꺼내 마셨다. 흑존은 과자 세 봉지를 식탁에 놓았다.

흑존: 저녁 조금 있다가 할까요?
히든: 응. 빵 먹어서 지금은 배 안 고파.
흑존: 그럼 저도 쉬어도 돼요?
히든: 안 된다고 하면.
흑존: 형 옆에서 서 있을까요?

형이 물을 삼키다가 웃었다.

히든: 아 됐어ㅋㅋ 앉아. 와.

흑존은 마지막으로 두부를 냉장고에 넣고 문을 닫았다. 형은 과자 한 봉지만 챙겨 거실로 갔다. 봉지를 뜯어 탁자에 놓고, 하나를 먼저 집어 먹었다.

둘이 앉을 소파 위에는 형이 어제 보던 책과 담요가 있었다. 형은 책을 탁자로 옮기고 담요를 옆으로 밀었다.

흑존은 그 자리보다 형의 손을 먼저 봤다.`,
    choices: [{ label: "소파에 자리를 만든다", stat: { affinity: 1 }, next: "blackjon_ep15_conspiracy_16" }],
  },
  blackjon_ep15_conspiracy_16: {
    id: "blackjon_ep15_conspiracy_16", title: "흑존 15화: 공모 · 전부 장난이었어요?",
    subtitle: "소파의 빈자리", kind: "normal", category: "main",
    imagePool: ["/blackjon_ep15_conspiracy_sofa.png"], background: "/blackjon_ep15_conspiracy_sofa.png",
    text: `흑존은 소파 앞에서 잠깐 멈췄다. 형은 앉은 채 그를 올려다봤다.

히든: 왜 안 앉아.
흑존: 하나만 물어봐도 돼요?
히든: 또 질문.

흑존이 웃었지만 바로 다음 말을 하지 않았다. 형은 과자 봉지를 탁자에 놓았다.

흑존: 아까 팔짱 낀 것도 전부 장난이었어요?

형이 그의 얼굴을 봤다.

마트에서 받아치던 표정과 조금 달랐다. 답을 정해놓고 묻는 얼굴은 아니었다. 손을 잡고 집까지 온 사람이, 그걸 어느 만큼 좋아해도 되는지 확인하고 있었다.

히든: 처음에는 너 골리려고 그랬지.
흑존: 네.

형은 소파 옆자리를 손바닥으로 눌렀다.

히든: 다 장난은 아니고.

흑존이 입을 다물었다.

히든: 그걸 그렇게 서서 확인받아야 되냐. 앉아.

흑존이 앉았다. 형이 내준 자리보다 조금 가까웠다. 형은 밀어내지 않고 소파 등에 팔을 걸쳤다.

흑존: 그럼 어디부터는 아니었어요?
히든: 아 또 세부 질문 들어오네.

형이 웃었다. 흑존은 그 웃음을 보면서도 대답을 기다렸다.`,
    choices: [
      { label: "가는 길에 손 다시 잡았잖아", stat: { affinity: 2, obsession: 1 }, result: "히든: 빵 먹고 손 다시 잡았잖아. 그건 그냥 잡은 거야.\n흑존: …네.\n형은 그의 어깨를 손끝으로 툭 건드렸다.\n히든: 답했으니까 이제 그만 물어.\n흑존: 네ㅎㅎ", next: "blackjon_ep15_conspiracy_17" },
      { label: "지금 네 자리 만들어줬잖아", stat: { affinity: 2, trust: 1 }, result: "히든: 지금 자리 만들었잖아. 그것도 장난 같냐?\n흑존: 아뇨.\n히든: 그럼 됐네.\n형이 자기 쪽으로 쿠션을 당겼다. 흑존은 그 옆에 더 편히 기대앉았다.", next: "blackjon_ep15_conspiracy_17" },
    ],
  },
  blackjon_ep15_conspiracy_17: {
    id: "blackjon_ep15_conspiracy_17", title: "흑존 15화: 공모 · 오늘 것만",
    subtitle: "메모는 하지 마",
    kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep15_conspiracy_sofa.png"], background: "/blackjon_ep15_conspiracy_sofa.png",
    text: `흑존이 한동안 말이 없었다. 형은 리모컨을 집었다가 그를 봤다.

히든: 왜 조용해짐.
흑존: 기억하려고요.
히든: 뭘.
흑존: 다 장난은 아니라고 하신 거.

형이 헛웃음을 지었다.

히든: 그런 걸 왜 굳이.
흑존: 다음에 형이 그런 적 없다고 하실 수도 있으니까.
히든: 내가 언제 그랬다고ㅋㅋ

흑존이 눈썹을 조금 들었다. 형은 그 표정을 보자마자 리모컨으로 텔레비전을 켰다.

히든: 됐고. 오늘은 좋았다는 거지, 내일부터 종일 붙어 있으라는 뜻은 아님.
흑존: 다음 장보기는요?
히든: 그때 물어봐.
흑존: 그러면 오늘 거는 기억해도 돼요?

형은 리모컨을 무릎 위에 놓았다.

히든: 해. 메모만 하지 말고.
흑존: 안 해도 안 잊을 것 같은데요ㅎㅎ

흑존은 휴대폰을 꺼내지 않았다. 대신 형이 올려둔 팔 쪽으로 어깨를 조금 기울였다.

형은 채널을 바꾸면서 그의 어깨를 한 번 두드렸다. 흑존은 그 작은 동작까지 받고 얌전히 앉아 있었다.

형이 먼저 붙잡았던 손의 감각이 아직 남아 있었다. 다음에도 먼저 잡아줬으면 했다.`,
    choices: [{ label: "같이 볼 것을 고른다", stat: { affinity: 1, obsession: 1 }, next: "blackjon_ep15_conspiracy_18" }],
  },
  blackjon_ep15_conspiracy_18: {
    id: "blackjon_ep15_conspiracy_18", title: "흑존 15화: 공모 · 여기 봐야지",
    subtitle: "계속 엇갈리는 시선", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep15_conspiracy_sofa.png"], background: "/blackjon_ep15_conspiracy_sofa.png",
    text: `형이 고른 건 지난주부터 보던 예능이었다. 흑존은 출연자 이름을 몰라서 처음 몇 분은 조용히 봤다.

형이 웃을 때마다 그쪽을 봤다.

히든: 저기 봐야 내용을 알지.
흑존: 형 웃으셔서.
히든: 넌 내가 웃으면 꼭 봐야 되냐.
흑존: 네.

형은 할 말을 잃고 화면으로 돌아갔다. 조금 뒤에 또 웃었다. 흑존도 또 돌아봤다.

히든: 아 씨ㅋㅋ 알았어. 봐.

흑존이 소리 없이 웃었다. 형은 탁자에 둔 과자 봉지를 가져와 둘 사이에 놓았다.

이번에는 흑존이 과자를 집으려다가 형의 손과 부딪혔다. 둘 다 잠깐 멈췄다.

히든: 놔. 그거 내 거.
흑존: 형 지금까지 세 개 드셨는데.
히든: 세 개나 참았으면 하나 더 참아.
흑존: 말이 이상한데요.

그러면서도 흑존이 놓았다. 형은 집어 든 과자를 보다가 그에게 다시 건넸다.

히든: 됐다. 많이 먹고 커라.
흑존: 여기서 더요?

형은 옆자리를 꽉 채운 어깨를 보고 터졌다. 흑존도 따라 웃었다.

텔레비전에서 웃음소리가 나왔지만 둘은 이미 앞 장면을 놓친 뒤였다.`,
    choices: [{ label: "조금 되돌려 다시 본다", stat: { affinity: 1 }, next: "blackjon_ep15_conspiracy_19" }],
  },
  blackjon_ep15_conspiracy_19: {
    id: "blackjon_ep15_conspiracy_19", title: "흑존 15화: 공모 · 아무 생각 없이",
    subtitle: "이번에는 연습 안 한 말", kind: "normal", category: "main",
    imagePool: ["/blackjon_ep15_conspiracy_sofa.png"], background: "/blackjon_ep15_conspiracy_sofa.png",
    text: `형은 놓친 부분을 되돌렸다. 흑존은 과자 부스러기를 손바닥에 털어 휴지로 닦았다.

조금 전까지 말을 붙이던 두 사람은 화면을 보느라 조용해졌다. 형은 쿠션을 끌어안고 흑존의 어깨 쪽에 느슨하게 기대 있었다.

흑존은 탁자 위를 봤다. 컵이 없었다.

그가 몸을 앞으로 기울여 일어나려던 순간, 형이 화면에서 눈도 떼지 않고 물었다.

히든: 어디 가?

흑존이 멈췄다.

형은 뒤늦게 고개를 돌렸다. 흑존과 눈이 마주쳤다.

마트에서 했던 말과 똑같았다. 이번에는 표정을 만들지도, 목소리를 고르지도 않았다.

흑존의 입꼬리가 천천히 올라갔다.

히든: 아니. 그 뜻 말고.
흑존: 저 아직 아무 말 안 했는데요ㅎㅎ

형이 쿠션을 고쳐 안았다.

히든: 그냥 물어본 거라고.
흑존: 저도 그냥 웃었는데.

흑존은 반쯤 일어난 자세로 형을 보고 있었다. 형은 그의 팔을 밀어 다시 앉혔다. 세게 밀 것도 없었다. 흑존은 기다렸다는 듯 앉았다.

히든: 웃는 거 진짜 짜증나ㅋㅋ
흑존: 네. 안 웃을게요.

전혀 그럴 생각이 없는 얼굴이었다.`,
    choices: [{ label: "그래서 어디 가려던 건데", stat: { affinity: 2, obsession: 1 }, next: "blackjon_ep15_conspiracy_end" }],
  },
  blackjon_ep15_conspiracy_end: {
    id: "blackjon_ep15_conspiracy_end", title: "흑존 15화: 공모 · 너도 한번 당해봐",
    subtitle: "오늘 제일 좋은 질문", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep15_conspiracy_sofa.png"], background: "/blackjon_ep15_conspiracy_sofa.png",
    text: `흑존: 물 가지러요.
히든: 아. 내 것도.
흑존: 네. 다녀와도 돼요?
히든: 아 좀 가ㅋㅋㅋ

흑존이 웃으며 일어났다. 형은 이번에는 붙잡지 않았다. 화면을 보다가, 주방 쪽에서 컵 꺼내는 소리가 나자 그쪽으로 고개를 돌렸다.

흑존도 이쪽을 보고 있었다.

히든: 물이나 따라.
흑존: 네ㅎㅎ

두 컵이 탁자에 놓였다. 흑존은 아까와 같은 자리에 앉았다. 형은 리모컨으로 화면을 멈췄다.

히든: 오늘 일 내일도 얘기하면 과자 안 줌.
흑존: 모레는요?
히든: 계속 안 줌.
흑존: 그럼 과자 안 먹을게요.

형이 어이없다는 듯 웃었다. 흑존은 물을 한 모금 마시고 컵을 내려놨다.

히든: 너 진짜 안 지는구나.
흑존: 오늘은 형이 먼저 시작하셨잖아요.

그건 맞아서 할 말이 없었다.

형은 과자 봉지를 자기 쪽으로 가져왔다. 흑존이 봉지 안을 보자 잠깐 망설이더니, 다시 둘 사이에 놓았다.

히든: 먹어. 오늘은.

흑존은 과자를 하나 집었다. 형이 텔레비전을 다시 틀었다.

조금 뒤, 흑존이 혼자 또 웃었다.

형은 이번에는 왜 웃는지 묻지 않았다.`,
    choices: [{ label: "공모 15화 완독 · 너도 한번 당해봐", stat: { affinity: 2, obsession: 1 }, end: true }],
  },
};
