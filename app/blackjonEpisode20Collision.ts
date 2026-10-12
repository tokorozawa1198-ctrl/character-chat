import type { Scenario } from "./gameTypes";

// 충돌 시즌 1 마지막 화. 19화의 통화가 연결된 금요일 밤에서 바로 이어진다.
export const blackjonEpisode20Collision: Record<string, Scenario> = {
  blackjon_ep20_collision_01: {
    id: "blackjon_ep20_collision_01", title: "흑존 20화: 충돌 · 그럼 제가 갈게요",
    subtitle: "시즌 1 최종화 · 아직 연결된 전화", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep20_collision_call.png"], background: "/blackjon_ep20_collision_call.png",
    text: `수화기 너머에서 친구가 다시 이름을 불렀다.

형은 대답하려고 입을 열었다. 침이 잘 넘어가지 않았다. 조금 전 흑존이 한 말이 아직 귀 안쪽에 붙어 있었다.

미워하면서 있으라고. 오늘은.

히든: 응. 듣고 있어.

친구는 형이 보낸 주소를 읽고 맞는지 물었다. 형은 맞다고 했다. 지금 출발했으니 통화를 끊지 말라는 말에, 휴대폰을 귀에 더 가까이 댔다.

흑존의 눈이 그 움직임을 따라갔다.

히든: 문 앞이야. 아직.

흑존이 입술을 열었다가 닫았다. 형이 자기 이야기를 하고 있었다. 다른 사람에게. 바로 눈앞에서.

그는 끼어들 자리를 찾는 얼굴로 잠깐 기다렸다.

흑존: 형.

형은 듣고도 고개를 돌리지 않았다. 친구가 하는 말을 끝까지 들었다.`,
    choices: [
      { label: "친구에게 현재 상황을 다시 말한다", stat: { trust: -1 }, next: "blackjon_ep20_collision_02", result: "히든: 나가겠다고 했는데 계속 비켜주질 않아.\n형은 목소리를 줄이지 않았다. 흑존이 듣는다고 표현을 바꾸지도 않았다." },
      { label: "통화를 끊지 않고 문을 본다", stat: { trust: -1 }, next: "blackjon_ep20_collision_02", result: "휴대폰을 쥔 손에 땀이 배었다. 형은 손잡이와 그 앞에 선 흑존을 번갈아 봤다. 혼자 해결하겠다는 말은 하지 않았다." },
    ],
  },
  blackjon_ep20_collision_02: {
    id: "blackjon_ep20_collision_02", title: "흑존 20화: 충돌 · 밥 다 됐는데",
    subtitle: "현관 · 끼어들 자리", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep20_collision_call.png"], background: "/blackjon_ep20_collision_call.png",
    text: `흑존이 주방 쪽을 흘끗 봤다.

흑존: 밥 다 됐는데.

형은 휴대폰 너머에 짧게 응, 하고 대답했다. 흑존의 입가가 움직였다가 멈췄다. 자기에게 한 대답이 아니라는 걸 알아차렸다.

흑존: 전화 끊으라는 말 아니에요. 그냥 밥 됐다고요.

식탁의 의자는 조금씩 빼놓은 상태였다. 컵 두 개. 나란히 놓인 수저. 형은 아까 그걸 봤을 때보다 더 속이 좋지 않았다.

흑존: 국 식어요.
히든: 먹으라고 안 했어.
흑존: 형이 좋아하는 거 했는데.
히든: 그럼 네가 먹어.

말이 끝나자 흑존의 얼굴이 잠깐 일그러졌다. 그는 금방 고개를 끄덕였다.

흑존: 네. 저는 먹을게요.

움직이지는 않았다.

흑존: 형은 옆에만 앉아 있어도 되는데.

형이 눈을 감았다 떴다. 수화기에서 무슨 일이냐고 물었다.

히든: 아니. 밥 얘기 해.

자기 입으로 말하고 나니 더 어이가 없었다. 지금 여기서, 밥 이야기를 하고 있었다.`,
    choices: [{ label: "비켜달라고 다시 말한다", stat: { trust: -2 }, next: "blackjon_ep20_collision_03" }],
  },
  blackjon_ep20_collision_03: {
    id: "blackjon_ep20_collision_03", title: "흑존 20화: 충돌 · 무서워서",
    subtitle: "현관 · 같은 공간의 다른 사람", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep20_collision_call.png"], background: "/blackjon_ep20_collision_call.png",
    text: `히든: 내 밥 걱정하지 말고 비켜.

흑존이 형의 얼굴을 봤다. 형은 전화기를 내려놓지 않았다.

흑존: 저 좀 보면서 말씀하시면 안 돼요?
히든: 보고 있잖아.
흑존: 계속 그쪽 말만 들으시니까.
히든: 너랑 통화하는 거 아니니까 그렇지.

예전 같으면 흑존이 웃었을 말이었다. 형도 어이가 없어 피식 웃었을 것이다. 지금은 어느 쪽도 웃지 않았다.

흑존: 저 여기 있는데.
히든: 알아.
흑존: 앞에 있는데 왜 다른 사람한테—
히든: 네가 무서워서.

흑존의 말이 끊겼다.

히든: 지금 네가 무서워서 전화하는 거야.

그가 숨을 한 번 크게 들이마셨다. 뭔가 급하게 바로잡으려는 얼굴이었다. 형이 자기 뜻을 잘못 알아들은 것처럼, 손을 조금 들었다.

흑존: 형. 저 형 사랑해요.`,
    choices: [{ label: "사랑의 문제가 아니라고 말한다", stat: { trust: -2 }, next: "blackjon_ep20_collision_04" }],
  },
  blackjon_ep20_collision_04: {
    id: "blackjon_ep20_collision_04", title: "흑존 20화: 충돌 · 아는데 왜",
    subtitle: "대답 대신 고백", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep20_collision_plea.png"], background: "/blackjon_ep20_collision_plea.png",
    text: `히든: 그 얘기 아니야.
흑존: 아니, 진짜 사랑한다고요.
히든: 알아. 그러니까 비켜.
흑존: 아는데 왜 자꾸 가요?

끝 음절이 높아졌다. 흑존 자신도 놀랐는지 입을 다물었다. 눈가에 물기가 모였다.

흑존: 죄송해요. 소리 지르려던 건 아닌데.

형은 대답하지 않았다.

흑존: 형이 자꾸, 제가 무섭다고 하니까.
히든: 무섭게 하고 있잖아.
흑존: 저는 그냥 같이 있고 싶어서.
히든: 나는 싫다고 했고.

흑존이 고개를 저었다. 형의 말을 못 들은 것처럼 다시 입을 열었다.

흑존: 저 진짜 너무 사랑해서 그래요.

눈물이 한쪽 뺨을 먼저 타고 내려왔다. 닦을 생각도 하지 않았다. 형의 눈동자가 움직일 때마다 고개를 조금씩 기울였다. 어떻게든 시선을 맞추려고 했다.`,
    choices: [{ label: "싫다는 대답을 거두지 않는다", stat: { trust: -2, obsession: 1 }, next: "blackjon_ep20_collision_05" }],
  },
  blackjon_ep20_collision_05: {
    id: "blackjon_ep20_collision_05", title: "흑존 20화: 충돌 · 끝까지 듣지 않는 말",
    subtitle: "겹치는 목소리", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep20_collision_plea.png"], background: "/blackjon_ep20_collision_plea.png",
    text: `히든: 흑존아. 내가—
흑존: 사랑해요.
히든: 일단 비키고—
흑존: 형. 사랑해요.

친구가 전화 너머에서 형을 불렀다. 형이 대답하려고 고개를 돌리자 흑존의 목소리가 더 빨라졌다.

흑존: 잠깐만. 저 말 아직 안 끝났어요.
히든: 똑같은 말 하고 있잖아.
흑존: 그거 말고는 없는데 어떡해요.

눈물이 턱 끝에 맺혔다. 그는 숨을 고르려다 실패하고 다시 말했다.

흑존: 너무 사랑해요. 형.
흑존: 진짜 너무, 너무 사랑해서.
흑존: 그러니까 한 번만요.

형이 입을 열 때마다 그 말이 먼저 나왔다. 사랑해요. 형. 사랑해요.

흑존은 더는 문장을 고르지 않았다. 말이 끊기면 형이 다시 간다고 할 것 같았다. 숨을 들이마시는 짧은 틈에도 형의 입술부터 봤다.

히든: 그만해!

형의 목소리가 겹친 말들을 끊었다. 흑존의 어깨가 크게 움직였다.`,
    choices: [{ label: "들었다고 분명히 말한다", stat: { trust: -3 }, next: "blackjon_ep20_collision_06" }],
  },
  blackjon_ep20_collision_06: {
    id: "blackjon_ep20_collision_06", title: "흑존 20화: 충돌 · 그런데도",
    subtitle: "알아듣고도 떠나는 사람", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep20_collision_plea.png"], background: "/blackjon_ep20_collision_plea.png",
    text: `히든: 들었다고. 사랑한다는 말 들었어.

형은 목이 아팠다. 한 번 침을 삼키고 다시 말했다.

히든: 그런데도 갈 거야.

흑존의 입이 조금 벌어졌다.

히든: 못 알아들어서 가는 거 아니야.

이번에는 흑존이 끼어들지 않았다. 형은 그 틈에 친구에게 말했다.

히든: 응. 괜찮아. 아니, 괜찮은 건 아니고. 나 듣고 있어.

대답을 고치는 소리가 조용한 현관에서 유난히 크게 들렸다. 흑존은 형이 다른 사람 앞에서는 사실대로 말하는 얼굴을 봤다.

자기 앞에서만 괜찮다고 해주던 때가 있었다. 피곤하면서도 웃고, 한 번 더 설명하고, 밥을 조금이라도 먹어주던 때.

흑존: 제가 뭘 하면 돼요?

형이 그를 봤다.

히든: 비키면 돼.

흑존은 젖은 눈으로 고개를 끄덕였다. 그리고 비키는 것 말고 다른 말을 찾았다.`,
    choices: [{ label: "같은 요구를 반복한다", stat: { trust: -2 }, next: "blackjon_ep20_collision_07" }],
  },
  blackjon_ep20_collision_07: {
    id: "blackjon_ep20_collision_07", title: "흑존 20화: 충돌 · 안 좋아해도",
    subtitle: "스스로 거두는 양보", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep20_collision_plea.png"], background: "/blackjon_ep20_collision_plea.png",
    text: `흑존: 저 안 좋아해도 되니까.

말하고 나서 바로 얼굴을 찌푸렸다.

흑존: ……아니. 그건 싫어요.

형은 아무 말도 하지 않았다. 흑존이 자기 말을 도로 주워 담는 모습을 봤다.

흑존: 근데 지금은. 지금은 안 좋아해도 되니까.
히든: 흑존아.
흑존: 조금만 있으면 안 돼요?

손이 올라왔다가 멈췄다. 형의 코트 소매까지는 아직 거리가 있었다. 흑존은 그 빈 거리를 보고 손가락을 접었다.

흑존: 저 보고 있으면서 싫어하면 안 돼요?

형은 그를 잠깐 못 봤다. 고개를 숙이자 현관 타일 위에 눈물 자국이 하나 보였다.

흑존: 욕해도 돼요.
흑존: 아까처럼 무섭다고 해도 되고.
흑존: 미쳤다고 해도 되는데, 여기서 해주면 안 돼요?

형은 휴대폰을 쥔 손에 다시 힘을 줬다. 놓으면 자신도 저 말 안으로 끌려 들어갈 것 같았다.`,
    choices: [
      { label: "남겠다는 말은 하지 않는다", stat: { trust: -2 }, next: "blackjon_ep20_collision_08", result: "불쌍하다는 생각이 들었다. 그 생각까지 없애려고 애쓰지는 않았다. 다만 그 때문에 코트를 벗거나 전화를 끊지는 않았다." },
      { label: "친구의 목소리를 다시 듣는다", stat: { trust: -2 }, next: "blackjon_ep20_collision_08", result: "친구가 거의 다 왔다고 말했다. 형은 응, 하고 대답했다. 흑존의 표정이 무너져도 그 말을 취소하지 않았다." },
    ],
  },
  blackjon_ep20_collision_08: {
    id: "blackjon_ep20_collision_08", title: "흑존 20화: 충돌 · 없는 데로",
    subtitle: "아무것도 안 해도 된다는 조건", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep20_collision_plea.png"], background: "/blackjon_ep20_collision_plea.png",
    text: `흑존: 말 안 걸게요.

형이 숨을 내쉬었다. 흑존은 그 숨소리를 듣고 서둘러 하나를 더 내놨다.

흑존: 밥도 안 먹어도 돼요. 먹으라고 안 할게요.
히든: 이미 안 먹는다고 했어.
흑존: 네. 그러니까 안 먹어도 된다고요.

형이 눈을 들었다. 흑존이 또 자기가 허락할 수 있는 일처럼 말하고 있었다.

히든: 네 허락 받으러 온 거 아니야.

흑존은 고개를 끄덕이면서도 말을 멈추지 못했다.

흑존: 아무것도 안 해도 되는데.
흑존: 그냥 휴대폰 보고 있어도 되는데.
흑존: 저는 형한테 아무것도 안 해달라고 할게요.

잠깐 말을 멈췄다. 젖은 숨이 몇 번이나 목에 걸렸다.

흑존: 왜 꼭 제가 없는 데로 가야 해요?

형은 대답을 알고 있었다. 흑존도 이미 들은 대답이었다. 그런데 다시 말하는 게 지독하게 힘들었다.

히든: 너랑 떨어져 있고 싶으니까.

흑존은 눈을 꽉 감았다. 닫힌 눈에서도 눈물이 나왔다.`,
    choices: [{ label: "그가 울음을 고를 때까지 거리를 둔다", stat: { trust: -2 }, next: "blackjon_ep20_collision_09" }],
  },
  blackjon_ep20_collision_09: {
    id: "blackjon_ep20_collision_09", title: "흑존 20화: 충돌 · 마음은 아파",
    subtitle: "남아 있는 사랑과 떠나겠다는 말", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep20_collision_plea.png"], background: "/blackjon_ep20_collision_plea.png",
    text: `형은 흑존의 얼굴을 봤다. 눈가가 벌겋고, 입술은 계속 무언가 말하려고 움직였다. 덩치 큰 몸이 좁은 현관에서 숨 쉬는 법을 잊은 것 같았다.

한때는 저 얼굴을 보면 먼저 손이 갔다. 앞머리를 쓸어주고, 좀 진정하라고 웃으면서, 귀찮다는 말 뒤에 결국 옆자리를 내줬다.

형의 손가락이 코트 옆선에서 움직였다. 흑존이 곧바로 그 손을 봤다.

형은 손을 내밀지 않았다.

히든: 네가 우는 건 마음 아파.

흑존이 얼굴을 들었다.

히든: 그렇다고 여기 있을 수는 없어.

올라오던 표정이 멈췄다. 흑존은 잠깐 형을 보더니 다시 고개를 숙였다.

흑존: 마음 아프시면.

말끝을 잇지 못했다. 마음이 아프면 남아달라고 하려고 했다. 형은 이미 그 말의 답을 해버렸다.

수화기 너머에서 도착했다는 목소리가 들렸다. 형이 짧게 대답했다.

히든: 응. 기다릴게.

흑존이 고개를 들었다. 자기가 수도 없이 했던 말을, 형이 다른 사람에게 하고 있었다.`,
    choices: [{ label: "문밖의 소리에 귀를 기울인다", stat: { trust: -2 }, next: "blackjon_ep20_collision_10" }],
  },
  blackjon_ep20_collision_10: {
    id: "blackjon_ep20_collision_10", title: "흑존 20화: 충돌 · 초인종",
    subtitle: "문밖에 도착한 사람", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep20_collision_plea.png"], background: "/blackjon_ep20_collision_plea.png",
    text: `복도에서 발소리가 멈췄다. 초인종이 울렸다.

문 너머와 수화기에서 같은 목소리가 조금 어긋나게 들렸다. 친구였다. 형의 이름을 불렀다.

히든: 여기 있어.

형이 문 쪽으로 몸을 돌렸다. 흑존은 친구의 목소리보다 그 움직임을 먼저 봤다.

히든: 이제 비켜.

흑존이 손등으로 뺨을 닦았다. 한 번. 눈물이 더 나와서 다시 한 번. 숨을 들이마셨다가 천천히 내쉬었다.

형은 또 사랑한다는 말이 나올 줄 알았다. 잠깐만, 한 번만, 오늘만. 그중 하나를 듣게 될 줄 알았다.

흑존: 네.

대답이 너무 작아서 형은 잘못 들은 줄 알았다.

흑존이 옆으로 움직였다. 문손잡이가 드러났다.`,
    choices: [{ label: "드러난 문손잡이를 본다", stat: { trust: -1 }, next: "blackjon_ep20_collision_11" }],
  },
  blackjon_ep20_collision_11: {
    id: "blackjon_ep20_collision_11", title: "흑존 20화: 충돌 · 열린 문",
    subtitle: "너무 늦게 비켜준 자리", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep20_collision_door.png"], background: "/blackjon_ep20_collision_door.png",
    text: `형은 바로 움직이지 못했다. 흑존이 비켜선 자리를 한동안 봤다.

히든: ……나가도 돼?

말하고 나서 자기 목소리가 싫었다. 흑존은 조용히 대답했다.

흑존: 네.
히든: 또 무슨 말 하려고.
흑존: 형 가셔야 한다면서요.

형은 더 묻지 않았다. 허락을 받아내고 안도할 일이 아니었다.

손잡이를 잡아 문을 열었다. 차가운 복도 공기가 들어왔다. 친구가 문 앞에 서 있었다. 안경이 조금 내려가 있었고, 외투 안쪽의 남색 스웨터가 비뚤어져 있었다.

친구는 먼저 형의 얼굴을 봤다. 그다음 흑존을 봤다.

히든: 나가자.

문턱을 넘었다. 흑존은 잡지 않았다. 소매도 손목도 건드리지 않았다. 형이 정말로 밖에 나와 서고 나서야, 굳어 있던 무릎이 조금 떨렸다.`,
    choices: [{ label: "친구 옆으로 간다", stat: { trust: -1 }, next: "blackjon_ep20_collision_12" }],
  },
  blackjon_ep20_collision_12: {
    id: "blackjon_ep20_collision_12", title: "흑존 20화: 충돌 · 문밖",
    subtitle: "통화를 끝내는 이유", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep20_collision_door.png"], background: "/blackjon_ep20_collision_door.png",
    text: `친구가 다친 데 없냐고 물었다. 형은 고개를 저었다.

히든: 안 다쳤어.

괜찮다는 말은 붙이지 않았다. 친구도 괜찮아 보인다고 하지 않았다.

형은 그제야 통화 종료를 눌렀다. 도움을 청하던 사람이 바로 옆에 있었다. 화면이 꺼진 휴대폰을 손에 쥔 채 복도 쪽으로 돌아섰다.

흑존: 형.

형의 발이 멈췄다. 돌아보고 싶지 않았는데 어깨부터 굳었다.

흑존: 휴대폰 떨어뜨리지 마세요.

형은 천천히 돌아봤다. 흑존은 문 안에 서 있었다. 방금 전 울던 눈으로 형의 손을 보고 있었다.

히든: 그런 거 챙기는 척하지 마.

그의 눈이 형의 얼굴로 올라왔다.

히든: 오늘 네가 뭘 했는지 생각해.

형은 돌아섰다. 뒤에서 옷걸이가 부딪치는 소리가 났다.`,
    choices: [{ label: "뒤에서 들리는 소리를 확인한다", stat: { trust: -2 }, next: "blackjon_ep20_collision_13" }],
  },
  blackjon_ep20_collision_13: {
    id: "blackjon_ep20_collision_13", title: "흑존 20화: 충돌 · 같이 가려고요",
    subtitle: "현관 앞 · 꺼낸 겉옷", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep20_collision_door.png"], background: "/blackjon_ep20_collision_door.png",
    text: `흑존이 현관 옆에 걸린 검은 재킷을 꺼냈다. 한쪽 팔을 넣고, 다른 쪽 소매를 찾았다. 젖은 얼굴은 그대로였다.

형이 문을 잡은 채 멈췄다.

히든: 뭐 해?
흑존: 같이 가려고요.

친구가 흑존을 똑바로 봤다. 형이 먼저 말했다.

히든: 너는 오지 마.
흑존: 왜요?
히든: 나 너랑 떨어져 있고 싶다고 했잖아.

흑존이 재킷 끝을 잡은 채 멈췄다. 또 울 것 같은 얼굴이 됐다. 입술이 떨려서 잠깐 다물었다.

흑존: 그건 못 하겠어요.

친구가 말했다. 오늘은 여기서 그만하고 들어가라고. 지금 따라오면 안 된다고.

흑존은 친구를 한 번 봤다. 시선이 곧 형에게 돌아왔다.

흑존: 집이 싫으시면 밖에 있으면 되잖아요.
히든: 집이 아니라 너라고!

흑존은 들었다. 턱에 힘이 들어갔다. 그런데도 두 번째 소매에 팔을 끝까지 넣었다.`,
    choices: [{ label: "친구와 함께 복도를 걷는다", stat: { trust: -3 }, next: "blackjon_ep20_collision_14" }],
  },
  blackjon_ep20_collision_14: {
    id: "blackjon_ep20_collision_14", title: "흑존 20화: 충돌 · 세 사람의 발소리",
    subtitle: "복도 · 끝나지 않는 배웅", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep20_collision_following.png"], background: "/blackjon_ep20_collision_following.png",
    text: `형은 먼저 걸었다. 친구가 옆에 맞춰 걸었다. 뒤에서 현관문이 닫혔다.

잠깐 안도했다.

그다음 발소리가 났다.

형은 멈추지 않았다. 친구가 뒤를 돌아보고 따라오지 말라고 다시 말했다. 발소리는 잠깐 느려졌다가 같은 방향으로 이어졌다.

엘리베이터 앞에서야 형이 돌아봤다. 흑존은 몇 걸음 떨어진 곳에서 재킷 지퍼를 맞추고 있었다. 손끝이 떨려 한 번 빗나갔다. 그는 다시 끼웠다.

그 평범한 동작이 형을 기막히게 했다.

히든: 너 지금 우리 같이 나가는 줄 알아?
흑존: 같이 나오고 있잖아요.
히든: 내가 오지 말랬지.
흑존: 들었어요.

형은 잠깐 말을 잃었다. 흑존이 자기 대답을 기다렸다. 눈물이 마르는 뺨으로, 조금 전보다 훨씬 얌전한 얼굴을 하고.

엘리베이터의 층수가 하나씩 바뀌었다. 형은 그 숫자를 노려봤다.`,
    choices: [{ label: "친구 곁에서 거리를 유지한다", stat: { trust: -2 }, next: "blackjon_ep20_collision_15" }],
  },
  blackjon_ep20_collision_15: {
    id: "blackjon_ep20_collision_15", title: "흑존 20화: 충돌 · 같은 방향",
    subtitle: "엘리베이터 · 허락하지 않은 동행", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep20_collision_following.png"], background: "/blackjon_ep20_collision_following.png",
    text: `문이 열렸다. 친구가 형과 함께 안으로 들어갔다. 흑존도 뒤따라 탔다.

친구가 두 사람 사이에 섰다. 흑존을 밀거나 붙잡지는 않았다. 형은 친구의 어깨 옆으로 흑존을 봤다.

히든: 여기서도 이럴 거야?

흑존은 대답하지 않았다. 문에 비친 형의 얼굴을 보고 있었다.

형이 시선을 내리자 흑존의 고개도 조금 내려갔다. 형이 옆을 보자 반사된 눈이 따라 움직였다.

히든: 좀 그만 봐.

흑존은 그제야 직접 형을 봤다.

흑존: 이것도 안 돼요?

친구가 끼어들었다. 지금 싫다고 하고 있지 않느냐고. 오늘은 그만하라고.

흑존은 고개를 끄덕였다. 형에게만 말했다.

흑존: 말 안 걸게요.

형은 웃음도 안 나왔다. 그 말을 들은 지 몇 분이나 됐을까.

1층에 도착했다. 문이 열리자 형은 곧바로 나갔다. 흑존도 나왔다.`,
    choices: [{ label: "건물 밖으로 향한다", stat: { trust: -2 }, next: "blackjon_ep20_collision_16" }],
  },
  blackjon_ep20_collision_16: {
    id: "blackjon_ep20_collision_16", title: "흑존 20화: 충돌 · 오지 말라고",
    subtitle: "건물 출입구 · 분명한 경고", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep20_collision_following.png"], background: "/blackjon_ep20_collision_following.png",
    text: `로비에서 친구가 멈췄다. 형도 함께 멈췄다.

친구는 흑존에게 가까이 오지 말라고 했다. 이대로 따라오면 도움을 더 요청하겠다고, 휴대폰을 든 채 분명하게 말했다.

흑존은 그 말에 긴장했다. 재킷 주머니에 넣으려던 손이 밖에 남았다. 두려운 표정이 지나갔다.

형은 그가 돌아가기를 기다렸다.

흑존: 형이 가면 저는요?

친구에게 답하는 대신 형을 봤다.

히든: 네 집에 가.
흑존: 혼자요?
히든: 응.

흑존의 눈이 흔들렸다. 형은 대답을 바꾸지 않았다.

히든: 혼자 있어. 내가 없는 데서.

유리문 너머로 차 한 대가 지나갔다. 빛이 흑존의 젖은 눈가를 훑고 사라졌다.

흑존: 그걸 해봤잖아요.

형은 문을 밀었다. 더 설명하지 않았다. 친구가 바로 옆에서 함께 나왔다.`,
    choices: [{ label: "차가운 바깥 공기를 마신다", stat: { trust: -2 }, next: "blackjon_ep20_collision_17" }],
  },
  blackjon_ep20_collision_17: {
    id: "blackjon_ep20_collision_17", title: "흑존 20화: 충돌 · 어디 있으면 돼요",
    subtitle: "금요일 밤 · 보도 위", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep20_collision_street.png"], background: "/blackjon_ep20_collision_street.png",
    text: `바깥은 추웠다. 형은 코트 앞섶을 여몄다. 내내 덥지 않냐고 묻던 흑존의 말이 떠올라 더 짜증이 났다.

친구가 괜찮냐고 물었다. 형은 먼저 말했다.

히든: 쟤 또 따라오지.

친구가 대답하기 전에 뒤에서 형을 불렀다.

흑존: 형 어디 가요?

형은 돌아보지 않았다. 옆에서 친구가 휴대폰을 확인했다. 둘만 있는 자리가 아니었다. 그런데도 등 뒤의 목소리가 목덜미에 붙었다.

흑존: 거기 가시면 저는 어디 있으면 돼요?

형이 돌아섰다.

히든: 왜 자꾸 네 자리까지 나한테 물어.

흑존은 조금 떨어져 멈췄다. 가로등 아래 얼굴이 환해졌다. 울었던 흔적이 다 보였다.

흑존: 형이 정해주시면 되잖아요.
히든: 정했어. 네 집에 가라고.
흑존: 형 없잖아요.

너무 당연한 결격 사유를 말하듯 대답했다. 형은 코트 안에서 손을 쥐었다.`,
    choices: [
      { label: "헤어졌다는 사실을 다시 말한다", stat: { trust: -2 }, next: "blackjon_ep20_collision_18", result: "형은 주위를 한 번 보고 다시 흑존을 봤다. 밖이라고, 누가 듣는다고 작은 목소리로 달래줄 생각은 없었다." },
      { label: "친구 옆을 떠나지 않은 채 대답한다", stat: { trust: -2 }, next: "blackjon_ep20_collision_18", result: "친구가 옆에 그대로 있었다. 형은 둘이서만 이야기하자는 자리를 만들지 않았다. 흑존이 그 거리를 봤다." },
    ],
  },
  blackjon_ep20_collision_18: {
    id: "blackjon_ep20_collision_18", title: "흑존 20화: 충돌 · 헤어진 채로",
    subtitle: "관계의 이름이 사라지는 순간", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep20_collision_street.png"], background: "/blackjon_ep20_collision_street.png",
    text: `히든: 내가 거기 없는 게 당연한 거야.

흑존이 형을 봤다.

히든: 우리 헤어졌잖아.

이번에는 아니라고 하지 않았다. 흑존은 가만히 서서 그 말을 들었다. 숨소리만 조금 거칠었다.

그러더니 고개를 끄덕였다.

형은 그 움직임을 보고 오히려 불안해졌다. 오늘 네, 하고 대답했던 순간들이 떠올랐다. 십 분. 안 먹어도 돼요. 형 가셔야 한다면서요.

흑존: 그럼 헤어진 채로 같이 있으면 되겠네요.

친구가 짧게 숨을 들이켰다. 형은 흑존의 얼굴만 봤다.

히든: 씨발, 무슨 소리를 하는 거야.

흑존이 조금 웃었다. 아직 눈물이 마르지 않은 얼굴이었다.

흑존: 안 사귄다고 해도 돼요.
히든: 말만 그렇게 하는 게 아니라고.
흑존: 네. 알아요.

그는 형을 보는 눈을 한 번도 다른 데로 돌리지 않았다.

흑존: 근데 제가 형 보는 건 그대로잖아요.`,
    choices: [{ label: "그 웃음을 마주한다", stat: { trust: -3, obsession: 2 }, next: "blackjon_ep20_collision_19" }],
  },
  blackjon_ep20_collision_19: {
    id: "blackjon_ep20_collision_19", title: "흑존 20화: 충돌 · 울음이 멎은 뒤",
    subtitle: "사라지지 않은 시선", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep20_collision_street.png"], background: "/blackjon_ep20_collision_street.png",
    text: `형은 흑존이 더는 울지 않는다는 걸 알아차렸다. 울었던 얼굴만 남아 있었다.

입꼬리가 올라가 있었다. 장난칠 때의 웃음과 비슷했는데, 눈이 전혀 따라 웃지 않았다. 형이 좋아하던 표정을 기억해서 입만 그 모양으로 놓은 것 같았다.

히든: 웃지 마.

흑존의 입가가 잠깐 멈췄다. 그러고는 더 작게 웃었다.

흑존: 울면 형 마음 아프다면서요.

형의 속이 차갑게 내려앉았다.

히든: 그 말을 그렇게 쓰라고 한 게 아니야.
흑존: 그럼 어떻게 해야 하는데요.

목소리는 정중했다. 정말 답을 기다리는 것처럼 들렸다. 하지만 형은 이미 여러 번 답했다.

돌아가. 따라오지 마. 혼자 있어.

흑존은 그중 어느 것도 하지 않은 채 다음 대답을 기다리고 있었다.

친구가 형에게 가자고 말했다. 형이 고개를 돌리자 흑존의 시선이 정확히 그만큼 움직였다.

흑존: 형.

형은 마지막으로 돌아봤다.`,
    choices: [{ label: "자기 이름을 부르는 얼굴을 본다", stat: { trust: -2, obsession: 2 }, next: "blackjon_ep20_collision_end" }],
  },
  blackjon_ep20_collision_end: {
    id: "blackjon_ep20_collision_end", title: "흑존 20화: 충돌 · 그럼 제가 갈게요",
    subtitle: "시즌 1 최종화 · 기다리지 않는 사람", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep20_collision_finale.png"], background: "/blackjon_ep20_collision_finale.png",
    text: `흑존의 고개가 조금 기울어졌다. 눈썹 아래로 드리운 그림자 속에서 눈만 형을 향해 있었다.

젖은 뺨에 웃음이 남았다. 형이 무서워하는 걸 보면서도 거두지 않는 웃음이었다.

흑존: 형이 여기 싫으면 여기 안 있어도 돼요.

형은 대답하지 않았다. 옆에 선 친구의 외투가 바람에 스쳤다.

흑존: 저도 같이 가면 되니까.

그가 한 걸음 옮겼다. 친구가 바로 형 옆에 섰다. 흑존은 거기서 멈췄지만 눈은 그대로였다.

흑존: 이번에는 어디서 기다리라고 하지 마세요.

형은 휴대폰을 놓지 않았다. 열린 현관도, 친구의 도착도, 헤어졌다는 말도 흑존에게는 끝이 되지 않았다.

그는 다시 사랑한다고 외치지 않았다. 대답을 재촉하지도 않았다.

흑존: 저 이제 기다리는 거 안 할래요.`,
    choices: [{ label: "20화 완독 · 시즌 1부 종료", stat: { trust: -3, obsession: 3 }, end: true }],
  },
};
