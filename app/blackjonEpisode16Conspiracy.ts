import type { Scenario } from "./gameTypes";

// 공모 15화 뒤 금요일 저녁부터 다음 날 오전. 농장 게임은 이야기 속 소품이다.
export const blackjonEpisode16Conspiracy: Record<string, Scenario> = {
  blackjon_ep16_conspiracy_01: {
    id: "blackjon_ep16_conspiracy_01", title: "흑존 16화: 공모 · 형이 더 심한데요?",
    subtitle: "장보기 데이트 다음 주 · 금요일 저녁", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep16_conspiracy_discovery.png"], background: "/blackjon_ep16_conspiracy_discovery.png",
    text: `형이 저녁 먹으러 오라고 한 금요일이었다. 흑존은 도착했다는 연락을 하고 벨을 눌렀다. 형은 문을 열어준 뒤 옷부터 갈아입겠다며 방으로 들어갔다.

십 분쯤 지나 거실로 돌아왔을 때, 흑존은 소파에 앉아 휴대폰을 두 손으로 들고 있었다.

히든: 뭐 해?
흑존: 아, 다 하셨어요?

화면에서 작고 경쾌한 소리가 났다. 형이 소파 등받이 너머로 몸을 숙였다. 분홍 돼지 한 마리가 울타리 안에서 빙글 돌고 있었다.

히든: …너 이런 것도 하냐?
흑존: 왜요. 저랑 잘 어울리는데.

흑존의 엄지가 화면을 쓸었다. 빨간 딸기들이 줄줄이 바구니로 들어갔다.

형은 화면과 그의 어깨를 번갈아 봤다. 웃음을 참다가 실패했다.

히든: 덩치는 이래놓고 딸기 심고 있네ㅋㅋ
흑존: 큰 사람이 심으면 안 돼요?
히든: 아니. 너무 정성스럽게 심어서.
흑존: 대충 하면 안 자라잖아요.

흑존이 마지막 칸까지 씨앗을 심었다. 형은 그 손가락 끝을 따라 고개를 옮겼다.

히든: 한 번 줘봐.

흑존은 별 의심 없이 휴대폰을 건넸다.`,
    choices: [{ label: "흑존 옆에 앉아 농장을 구경한다", stat: { affinity: 1 }, next: "blackjon_ep16_conspiracy_02" }],
  },
  blackjon_ep16_conspiracy_02: {
    id: "blackjon_ep16_conspiracy_02", title: "흑존 16화: 공모 · 잠깐만 한다며",
    subtitle: "설명해준 사람의 실수", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep16_conspiracy_discovery.png"], background: "/blackjon_ep16_conspiracy_discovery.png",
    text: `형은 흑존 옆에 털썩 앉았다. 맨 처음 누른 건 밭이 아니라 돼지였다.

히든: 얘 이름 뭐야.
흑존: 그냥 돼지요.
히든: 정 없네.
흑존: 이름 지어주세요, 그럼.
히든: 흑존.
흑존: 안 됩니다.

형이 웃으면서 돼지를 한 번 더 눌렀다. 흑존은 직접 손대지 않고 옆에서 기능을 알려줬다. 밭을 쓸면 수확하고, 바구니를 누르면 주문을 보내는 단순한 게임이었다.

형은 첫 주문을 보내자마자 허리를 폈다.

히든: 오.
흑존: 돈 들어왔죠?
히든: 하나 더 해도 됨?
흑존: 네. 지금 있는 거 보내시면 돼요.

형이 두 번째 주문을 눌렀다. 이번에는 재료 하나가 모자랐다.

히든: 당근 없는데.
흑존: 심으면 삼 분이요.
히든: 삼 분? 금방이네.

그는 빈 밭에 당근을 심었다. 흑존은 가까워진 형의 어깨를 보고 소파에 편히 기대앉았다.

삼 분쯤 같이 기다리는 건 좋았다.

그 삼 분이 끝나기 전에 형이 다른 밭에도 씨앗을 심는 것까지는 대수롭지 않게 봤다.`,
    choices: [{ label: "다음 주문까지 확인한다", stat: { affinity: 1 }, next: "blackjon_ep16_conspiracy_03" }],
  },
  blackjon_ep16_conspiracy_03: {
    id: "blackjon_ep16_conspiracy_03", title: "흑존 16화: 공모 · 갑자기 전문가",
    subtitle: "형의 운영 방침", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep16_conspiracy_discovery.png"], background: "/blackjon_ep16_conspiracy_discovery.png",
    text: `형은 어느새 장식 가게와 창고를 다 열어보고 있었다.

히든: 창고가 너무 작다.
흑존: 그래서 늘리려고 모으고 있어요.
히든: 얼마 있는데.
흑존: 위에 보석이요. 몇 달 모았어요. 결제한 건 아니고.

형이 보석 숫자를 확인하더니 진지하게 끄덕였다.

히든: 이런 건 계획적으로 써야 됨.
흑존: 맞아요.
히든: 장식 같은 데 쓰면 망하는 거야. 창고부터 늘려.
흑존: 저도 그러려고요.

형은 자기가 가르쳐줬다는 얼굴로 화면을 옮겼다. 흑존은 웃음을 참았다.

흑존: 형 저녁 뭐 드실래요?
히든: 아무거나.
흑존: 오므라이스 해드릴까요?
히든: 응. 좋네.

대답은 빠른데 눈은 한 번도 올라오지 않았다. 흑존은 주방으로 가다가 멈췄다.

흑존: 저 지금 어디 가는지 아세요?
히든: 부엌.
흑존: 왜요?
히든: 밥 하러. 알아. 나 다 듣고 있어.

형이 고개를 들었다.

히든: 케첩 많이.

흑존은 할 말을 잃고 주방으로 갔다. 뒤에서 다시 수확하는 소리가 났다.`,
    choices: [{ label: "저녁이 준비될 때까지 한 판만 더", stat: { affinity: 1 }, next: "blackjon_ep16_conspiracy_04" }],
  },
  blackjon_ep16_conspiracy_04: {
    id: "blackjon_ep16_conspiracy_04", title: "흑존 16화: 공모 · 다른 게 익었잖아",
    subtitle: "식탁까지 따라온 농장", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep16_conspiracy_dinner.png"], background: "/blackjon_ep16_conspiracy_dinner.png",
    text: `오므라이스 두 접시가 식탁에 놓였다. 형은 흑존의 휴대폰을 든 채 자리를 옮겼다.

흑존: 형. 이제 밥 먹어요.
히든: 잠깐. 수확만.
흑존: 아까도 수확하셨잖아요.
히든: 다른 게 익었잖아. 넌 농사를 그렇게 대충 지음?

흑존이 자기 의자를 당기다 말았다.

흑존: 이거 제 농장인데요.
히든: 그래서 내가 도와주잖아.
흑존: 되게 고맙네요.

형이 웃으면서 손가락을 움직였다. 흑존은 물컵을 형 손에 닿지 않는 쪽으로 옮겼다. 샐러드도 놓았다. 그래도 형의 손은 비지 않았다.

히든: 한입만.

형이 입을 벌렸다. 흑존은 자연스럽게 숟가락으로 밥을 떠서 건넸다. 형은 받아먹고 고개를 끄덕였다.

히든: 오. 맛있다.

흑존은 다시 숟가락을 들었다가 멈췄다.

자기 휴대폰을 빌려줬다. 저녁도 했다. 지금은 밥을 먹여주고 있었다.

형은 그 사이 두 번째 주문을 보냈다.

흑존: 잠깐만요.

그제야 형의 눈이 올라왔다.`,
    choices: [{ label: "왜 그렇게 보냐고 묻는다", stat: { affinity: 1 }, next: "blackjon_ep16_conspiracy_05" }],
  },
  blackjon_ep16_conspiracy_05: {
    id: "blackjon_ep16_conspiracy_05", title: "흑존 16화: 공모 · 저 지금 뭐 하는 거죠",
    subtitle: "한입의 대가", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep16_conspiracy_dinner.png"], background: "/blackjon_ep16_conspiracy_dinner.png",
    text: `흑존: 저 지금 뭐 하는 거죠?
히든: 밥 먹는 중.
흑존: 저는 아직 한입도 못 먹었는데.
히든: 그럼 먹어. 내가 허락해줄게.

흑존이 숟가락을 내려놓았다. 형이 결국 웃었다.

히든: 아ㅋㅋ 왜. 너도 한입 줄까?
흑존: 형 손이 없잖아요.
히든: 네가 폰 잡아주면 되지.

흑존은 형을 가만히 봤다.

히든: …아. 그건 좀 그렇다.
흑존: 이제 아셨어요?

형은 주문이 완료됐다는 표시를 확인하고 휴대폰을 식탁에 엎어놓았다. 자기 숟가락을 들고 밥을 크게 한입 먹었다.

흑존이 그제야 자기 접시로 숟가락을 가져갔다.

히든: 맛있다고 했잖아.
흑존: 저 안 보고 말씀하셨잖아요.

형이 고개를 돌렸다. 일부러 눈을 크게 뜨고 그를 봤다.

히든: 맛. 있. 다.
흑존: 싸우자는 건가요?

둘 다 웃었다. 형은 웃다가 자기 접시의 계란 한 조각을 흑존 접시 위에 올렸다.

히든: 먹어. 안 식었을 때.

흑존은 계란을 먹었다. 휴대폰이 또 울렸지만 이번에는 형도 손을 뻗지 않았다.`,
    choices: [
      { label: "이번엔 내가 한입 건넨다", stat: { affinity: 2 }, result: "형이 숟가락에 밥을 조금 떠서 내밀었다.\n흑존: 저 폰 안 보고 있는데요.\n히든: 그럼 더 잘 먹겠네. 아 해.\n흑존은 웃다가 받아먹었다. 이번에는 형도 그 얼굴을 봤다.", next: "blackjon_ep16_conspiracy_06" },
      { label: "흑존 접시에 케첩을 그려준다", stat: { affinity: 1 }, result: "형이 흑존 접시 가장자리에 작게 웃는 얼굴을 그렸다. 한쪽 눈이 너무 길어졌다.\n흑존: 얘 왜 화났어요?\n히든: 너 닮게 그림.\n흑존: 저 그렇게 안 생겼는데요ㅋㅋ", next: "blackjon_ep16_conspiracy_06" },
    ],
  },
  blackjon_ep16_conspiracy_06: {
    id: "blackjon_ep16_conspiracy_06", title: "흑존 16화: 공모 · 설거지는 제가요?",
    subtitle: "밥은 다 먹었지만", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep16_conspiracy_dinner.png"], background: "/blackjon_ep16_conspiracy_dinner.png",
    text: `식사가 끝나자 형은 접시 두 개를 포개 들었다. 흑존이 일어나려 하자 먼저 고개를 저었다.

히든: 내가 할게. 너 밥 했잖아.
흑존: 웬일이에요?
히든: 웬일은. 나 원래 잘하거든.

형은 접시를 싱크대에 넣고 물을 틀었다. 흑존은 휴대폰을 받아 농장을 확인했다. 창고에는 형이 수확한 채소가 가득했다.

흑존: 형. 당근을 왜 이렇게 많이 심으셨어요?
히든: 금방 자라길래.
흑존: 다음 주문은 옥수수인데.

물소리가 멈췄다.

히든: 씨발. 아까 말해주지.
흑존: 저 다 듣고 있다고 하셨잖아요.

형이 돌아봤다. 흑존은 휴대폰을 들어 보이며 웃었다.

히든: 지금 나 놀리려고 일부러 확인한 거지.
흑존: 아뇨. 제 농장 상태가 걱정돼서요.

형은 다시 수도를 틀었다. 생각보다 세게 틀어서 자기 셔츠 소매에 물이 튀었다. 흑존이 웃음을 삼키다 실패했다.

히든: 웃지 마. 물 닦을 거 줘.

흑존은 휴대폰을 내려놓고 행주를 건넸다. 형은 소매를 털며 중얼거렸다.

히든: 옥수수였구나.
흑존: 아직도 그 생각 하세요?

형은 대답하지 않았다.`,
    choices: [{ label: "설거지를 마치고 농장으로 돌아간다", stat: { affinity: 1 }, next: "blackjon_ep16_conspiracy_07" }],
  },
  blackjon_ep16_conspiracy_07: {
    id: "blackjon_ep16_conspiracy_07", title: "흑존 16화: 공모 · 계획적인 소비",
    subtitle: "가게를 열면 안 됐는데", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep16_conspiracy_windmill.png"], background: "/blackjon_ep16_conspiracy_windmill.png",
    text: `소파로 돌아온 형은 옥수수를 심겠다며 다시 휴대폰을 빌렸다. 흑존이 허락한 건 분명히 옥수수였다.

형은 두 줄을 심은 뒤 장식 가게를 열었다.

흑존: 옥수수 보러 가신 거 아니었어요?
히든: 심었어. 기다리는 동안 구경만.

목록 끝에 작은 풍차가 있었다. 노란 지붕 아래 파란 날개가 천천히 돌았다. 형의 손가락이 멎었다.

히든: 이거 귀엽다.

흑존이 화면을 봤다. 이어서 형을 봤다.

흑존: 그건 안 돼요.
히든: 왜.
흑존: 비싸요.
히든: 나 좋아한다며.
흑존: 좋아하는 거랑 풍차 사는 건 다르죠.

형이 입을 벌렸다. 흑존은 웃지 않았다.

히든: 와. 풍차 앞에서 변하네.
흑존: 창고 늘리려고 모은 거예요.
히든: 알아. 그냥 구경이라니까.

형이 미리보기를 눌렀다. 풍차가 화면 가운데 크게 떴다. 작은 창문에 불도 들어왔다.

형이 조용해졌다.

흑존은 그 조용함이 영 마음에 들지 않았다.`,
    choices: [{ label: "풍차를 조금만 더 구경한다", stat: { affinity: 1 }, next: "blackjon_ep16_conspiracy_08" }],
  },
  blackjon_ep16_conspiracy_08: {
    id: "blackjon_ep16_conspiracy_08", title: "흑존 16화: 공모 · 이미 구입했습니다",
    subtitle: "두 사람의 침묵", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep16_conspiracy_windmill.png"], background: "/blackjon_ep16_conspiracy_windmill.png",
    text: `히든: 어디 놓는지 미리 볼 수 있나?
흑존: 그 화면에서는 안 돼요. 뒤로—

형이 휴대폰을 고쳐 쥐는 순간 엄지가 아래 버튼에 닿았다.

경쾌한 소리가 났다. 보석 숫자가 줄었다. 풍차 아래에 배치 버튼이 생겼다.

두 사람 다 말이 없어졌다.

형은 화면 구석을 눌러봤다. 풍차는 사라지지 않았다.

흑존: 형.
히든: 잠깐.
흑존: 사셨어요?
히든: 내가 산 건 아니고.
흑존: 그럼 누가 샀어요.

형이 자기 엄지를 봤다. 흑존도 그 엄지를 봤다.

히든: 얘가.

흑존이 눈을 감았다. 형은 웃으면 안 될 것 같아서 입술을 물었다.

히든: 취소 없어?
흑존: 보관은 되는데 보석은 안 돌아와요.

형이 다시 풍차를 봤다. 노란 지붕이 반짝였다. 자꾸 보고 있으니 더 예뻤다.

히든: …예쁘다.
흑존: 형.
히든: 우리 이왕 산 거 기뻐하자.

흑존은 눈을 뜨고 형을 봤다. 형은 그제야 작게 웃음이 새었다.

히든: 아 미안ㅋㅋ 미안. 진짜 잘못 눌렀어.`,
    choices: [{ label: "풍차를 놓을 자리를 찾아본다", stat: { affinity: 1 }, next: "blackjon_ep16_conspiracy_09" }],
  },
  blackjon_ep16_conspiracy_09: {
    id: "blackjon_ep16_conspiracy_09", title: "흑존 16화: 공모 · 파산시키는 사람",
    subtitle: "장식은 안 산다더니", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep16_conspiracy_windmill.png"], background: "/blackjon_ep16_conspiracy_windmill.png",
    text: `흑존: 형 지금 저희 농장 파산시키고 계세요.
히든: 당근 많잖아. 팔자.
흑존: 당근 팔면 동전이고, 이건 보석이라니까요.
히든: 재화가 왜 이렇게 복잡해.
흑존: 아까는 계획적으로 써야 한다고 하셨잖아요.

형이 풍차를 들고 밭 위를 맴돌았다. 놓을 수 없는 자리마다 바닥이 빨갛게 변했다.

히든: 창고 늘리면 뭐가 좋은데.
흑존: 더 넣을 수 있죠.
히든: 풍차는 볼 때마다 기분 좋잖아.
흑존: 저는 지금 안 좋은데요.

형이 고개를 들었다가 웃음을 터뜨렸다. 흑존도 따라 웃을 뻔했지만 버텼다.

히든: 그럼 내가 벌어줄게.
흑존: 어떻게요?
히든: 저기 과제 하면 준다며. 해줄게.

형은 결제창 대신 과제 목록을 열었다. 주문을 조금 더 보내면 오늘 받을 보석이 있었다. 풍차 값을 다 채울 양은 아니었다.

히든: 일단 여기부터.
흑존: 다 하실 수 있겠어요?
히든: 해보지도 않고 왜 그래. 제가 또 책임감이 굉장하거든요.

흑존은 못 믿겠다는 얼굴로 형 옆에 붙었다.

흑존: 그럼 저도 볼게요. 형이 또 뭘 사실지 몰라서.
히든: 사는 거 아니라니까ㅋㅋ`,
    choices: [
      { label: "주문 재료를 흑존에게 물어본다", stat: { trust: 1, affinity: 1 }, result: "히든: 이번엔 뭐 심어.\n흑존: 옥수수요. 아까 심은 거 아직 남았어요.\n히든: 오. 나 선견지명.\n흑존: 제가 말씀드렸잖아요.\n형은 못 들은 척 수확 버튼을 눌렀다.", next: "blackjon_ep16_conspiracy_10" },
      { label: "작은 과제부터 끝내겠다고 우긴다", stat: { affinity: 1 }, result: "히든: 쉬운 거 먼저 해서 기세를 올려야 돼.\n흑존: 기세 말고 보석을 올려주세요.\n히든: 아ㅋㅋ 알았어. 왜 이렇게 정확해.\n흑존: 제 보석이니까요.", next: "blackjon_ep16_conspiracy_10" },
    ],
  },
  blackjon_ep16_conspiracy_10: {
    id: "blackjon_ep16_conspiracy_10", title: "흑존 16화: 공모 · 거기 말고 옆",
    subtitle: "싫다던 사람의 의견", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep16_conspiracy_windmill.png"], background: "/blackjon_ep16_conspiracy_windmill.png",
    text: `주문을 몇 개 보내고 나니 다음 작물이 자랄 때까지 기다려야 했다. 형은 그 틈에 다시 풍차를 꺼냈다.

히든: 여기 놓을까.
흑존: 길 막잖아요.
히든: 그럼 여기.
흑존: 거기는 과수원 늘릴 자리예요.

형이 고개를 돌렸다.

히든: 네가 놔, 그럼.

흑존은 휴대폰을 받지 않고 손가락으로 빈 공간을 가리켰다.

흑존: 여기서 한 칸 오른쪽이요.
히든: 여기?
흑존: 아뇨. 한 칸만. 너무 많이 갔어요.

형은 풍차를 옮겼다. 흑존이 다시 손가락을 뻗었다.

흑존: 방향 돌려보세요. 창문 보이게.

형은 시키는 대로 했다. 풍차 앞에 작은 길이 생겼고 노란 지붕 뒤로 나무가 걸렸다.

흑존이 잠깐 말을 잃었다.

형이 그 얼굴을 봤다.

히든: 너 지금 마음에 들었지.
흑존: 배치는 괜찮네요.
히든: 풍차는?
흑존: 비싸요.
히든: 예쁘긴 하지?

흑존이 입술을 누르자 형은 바로 웃었다.

히든: ㅇㅋ. 확인.
흑존: 아직 대답 안 했는데요ㅋㅋ`,
    choices: [{ label: "풍차의 방향을 한 번 더 돌려본다", stat: { affinity: 1 }, next: "blackjon_ep16_conspiracy_11" }],
  },
  blackjon_ep16_conspiracy_11: {
    id: "blackjon_ep16_conspiracy_11", title: "흑존 16화: 공모 · 이제 네 차례",
    subtitle: "둘 다 취향이 있었다", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep16_conspiracy_windmill.png"], background: "/blackjon_ep16_conspiracy_windmill.png",
    text: `흑존은 결국 휴대폰을 받아 들었다. 형이 놓은 풍차를 조금 움직이고 나무 두 그루의 위치를 바꿨다.

형은 팔짱을 끼고 지켜봤다.

히든: 왜 이렇게 열심히 함.
흑존: 산 거니까 제대로 놔야죠.
히든: 내 덕분에 농장 예뻐졌네.
흑존: 형. 창고 못 늘린 건 그대로예요.

형이 혀를 찼다. 흑존은 화면을 돌려 풍차를 다른 각도로 봤다.

히든: 나랑 있는데 뭐 그렇게 열심히 봐.

흑존이 멈췄다.

히든: 나 좀 봐.

지난 주말의 말투였다. 흑존은 바로 형을 봤다. 형이 손을 내밀었다.

히든: 폰 내놔. 옥수수 다 됐어.

흑존이 웃으며 휴대폰을 자기 쪽으로 조금 당겼다.

흑존: 그 말 그렇게 쓰지 마세요.
히든: 왜. 잘 먹히네.
흑존: 저 볼 줄 알았잖아요.

형은 웃음을 못 멈추면서도 그의 볼을 손끝으로 한 번 눌렀다.

히든: 봤어. 예쁘네. 이제 옥수수.

흑존은 한숨을 쉬었지만 휴대폰을 건넸다. 형은 수확을 끝낸 뒤 농장 구석으로 화면을 밀었다.`,
    choices: [{ label: "아직 안 본 구석을 구경한다", stat: { affinity: 1, obsession: 1 }, next: "blackjon_ep16_conspiracy_12" }],
  },
  blackjon_ep16_conspiracy_12: {
    id: "blackjon_ep16_conspiracy_12", title: "흑존 16화: 공모 · 농장 구석",
    subtitle: "수확할 수 없는 자리", kind: "normal", category: "main",
    imagePool: ["/blackjon_ep16_conspiracy_garden.png"], background: "/blackjon_ep16_conspiracy_garden.png",
    text: `농장 구석에는 밭이 아닌 공간이 있었다.

작은 딸기 화단과 고양이 장식. 두 사람이 앉을 만한 벤치. 조금 떨어진 곳에 지붕 색이 다른 집 두 채가 있었다.

히든: 여기는 뭐야?
흑존: 그냥 꾸민 데요.
히든: 이 딸기는 왜 안 따져.
흑존: 장식이라서요.
히든: 너도 장식 샀네.
흑존: 그거는 동전으로 산 거예요.

흑존의 대답이 빨랐다. 형은 웃으며 벤치를 확대했다. 옆에 놓인 고양이 장식이 낯익었다. 얼마 전 둘이 지나가던 가게 앞에서 형이 사진을 찍었던 것과 닮았다.

히든: 이거 그 고양이 닮았는데.
흑존: 네.
히든: 내가 보여준 거?
흑존: 비슷해서 놨어요.

형은 딸기 화단도 다시 봤다. 그 옆에는 자신이 좋아한다고 했던 작은 분수까지 있었다.

히든: 여기 다 내가 좋아하는 거네.

흑존이 화면 반대편을 가리켰다.

흑존: 저기 닭도 있어요. 이름 지어주실래요?
히든: 말 돌리지 말고ㅋㅋ

형은 화면을 옮기지 않았다.`,
    choices: [{ label: "집 두 채를 눌러본다", stat: { affinity: 1 }, next: "blackjon_ep16_conspiracy_13" }],
  },
  blackjon_ep16_conspiracy_13: {
    id: "blackjon_ep16_conspiracy_13", title: "흑존 16화: 공모 · 하나는 형 집",
    subtitle: "주인이 정해진 장식", kind: "normal", category: "main",
    imagePool: ["/blackjon_ep16_conspiracy_garden.png"], background: "/blackjon_ep16_conspiracy_garden.png",
    text: `히든: 여기 왜 집이 두 개야?
흑존: 하나는 형 집.

형의 손이 멎었다. 흑존은 말해놓고 화면을 봤다.

히든: 어느 거.
흑존: 파란 지붕이요.
히든: 빨간 건 네 거고?
흑존: 네.

집에는 실제로 들어갈 수 없었다. 작은 창문에 불이 켜지는 장식일 뿐이었다. 그런데 흑존은 어느 쪽이 누구의 집인지 한 번도 헷갈리지 않은 것처럼 대답했다.

히든: 게임에서도 옆집 사냐?
흑존: 여기는 형이 이사 못 가시니까요ㅎㅎ
히든: 아ㅋㅋ 집주인 잘못 만났네.

흑존이 웃었다. 형은 파란 집을 눌러 이동 표시를 띄웠다.

히든: 움직이는데?
흑존: 아. 그렇게 멀리는 보내지 마세요.

장난하던 목소리가 조금 빨라졌다. 형은 그걸 듣고 손가락을 멈췄다.

히든: 내가 어디로 옮길 줄 알고.

흑존은 답하지 않고 보고 있었다. 형은 집을 없애거나 다른 구석으로 보내지 않았다. 빨간 지붕 쪽으로 끌어와, 두 집 사이에 있던 빈 땅 위에 놓았다.

두 집이 나란해졌다.

흑존이 형의 얼굴을 봤다.`,
    choices: [{ label: "붙여놓은 이유를 설명한다", stat: { affinity: 2, obsession: 1 }, next: "blackjon_ep16_conspiracy_14" }],
  },
  blackjon_ep16_conspiracy_14: {
    id: "blackjon_ep16_conspiracy_14", title: "흑존 16화: 공모 · 동선 줄였어",
    subtitle: "옆집의 장점", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep16_conspiracy_garden.png"], background: "/blackjon_ep16_conspiracy_garden.png",
    text: `히든: 동선 줄여야지. 네 집에서 밥 먹게.
흑존: 현실이랑 똑같네요.
히든: 그래도 오늘 설거지는 내가 했잖아.
흑존: 네. 보석도 형이 쓰셨고요.

형이 웃음을 터뜨렸다.

히든: 아 진짜 오래 가네ㅋㅋ
흑존: 오래 모았으니까요.

그러면서도 흑존은 가까워진 두 집에서 눈을 떼지 않았다. 형은 그걸 보고 벤치도 집 앞쪽으로 옮겼다.

히든: 여기 앉아서 쉬면 되겠다.
흑존: 같이요?
히든: 아니. 돼지랑.

흑존이 형을 봤다. 형은 바로 웃었다.

히든: 너랑. 알면서 왜 자꾸 물어봐.
흑존: 들으려고요.

형은 이번에는 대꾸하지 않고 배치를 확정했다. 흑존은 조용히 형의 어깨에 자기 어깨를 붙였다.

휴대폰 화면 안에 바뀐 건 작은 집 하나의 자리뿐이었다. 형이 직접 옮겼다는 것 때문에 흑존은 자꾸 그 집을 봤다.

히든: 길도 이어줄까?
흑존: 네.

이번 대답은 장난 없이 나왔다.`,
    choices: [
      { label: "집 사이에 짧은 길을 놓는다", stat: { affinity: 2, obsession: 1 }, result: "형이 길 두 칸을 놓았다.\n히든: 두 걸음이면 됨.\n흑존: 한 걸음으로도 갈 수 있는데.\n히든: 문 열고 나오다가 우리 집 벽에 박지 마세요.\n흑존이 웃으며 길을 확인했다.", next: "blackjon_ep16_conspiracy_15" },
      { label: "벤치 옆에 고양이도 데려온다", stat: { affinity: 2 }, result: "형은 고양이 장식을 벤치 옆으로 옮겼다.\n히든: 얘도 같이 쉬어야지.\n흑존: 그럼 형은 가운데 앉아요?\n히든: 고양이가 가운데.\n흑존: 여기서도 밀리네요.", next: "blackjon_ep16_conspiracy_15" },
    ],
  },
  blackjon_ep16_conspiracy_15: {
    id: "blackjon_ep16_conspiracy_15", title: "흑존 16화: 공모 · 내 폰에도 깔까",
    subtitle: "뜻밖의 망설임", kind: "normal", category: "main",
    imagePool: ["/blackjon_ep16_conspiracy_together.png"], background: "/blackjon_ep16_conspiracy_together.png",
    text: `형은 휴대폰을 흑존에게 돌려줬다. 흑존이 배치를 저장하고 남은 주문을 확인했다.

히든: 나도 깔까. 같이 하게.

흑존의 손이 멈췄다.

히든: 왜. 같이 하면 좋잖아.
흑존: 좋죠.
히든: 표정은 별론데.

흑존은 화면을 끄지 않은 채 형을 봤다.

흑존: 형 폰으로 하시면 저 안 보실 거잖아요.
히든: 지금도 폰 보고 있었는데?
흑존: 그래도 제 옆에는 계셨죠.

형은 웃으려다가 흑존의 얼굴을 조금 더 봤다. 흑존은 장난스럽게 입꼬리를 올렸지만 말을 거두지는 않았다.

흑존: 모르시는 거 저한테 물어보시고. 풍차 놓는 것도 같이 하고.
히든: 그건 싫다며.
흑존: 사는 게 싫었던 거죠.

형은 휴대폰을 꺼내려던 손을 무릎 위에 놓았다.

히든: 게임 하나 갖고 되게 복잡하다, 너.
흑존: 저도 그럴 줄 몰랐어요.

흑존이 자기 휴대폰을 내려다봤다. 형의 시선을 빼앗아서 미웠다가, 형이 자기 옆에서 계속 놀 수 있어서 좋았다.

형은 소파 반대쪽으로 가지 않고 흑존 옆에 다시 붙어 앉았다.`,
    choices: [{ label: "그럼 같이 보자고 한다", stat: { affinity: 2 }, next: "blackjon_ep16_conspiracy_16" }],
  },
  blackjon_ep16_conspiracy_16: {
    id: "blackjon_ep16_conspiracy_16", title: "흑존 16화: 공모 · 풍차보다 네가 예뻐",
    subtitle: "봐주는 순서", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep16_conspiracy_together.png"], background: "/blackjon_ep16_conspiracy_together.png",
    text: `히든: 이리 와. 같이 봐.
흑존: 게임 말고 저도 좀 봐주세요.

형이 고개를 돌렸다. 아주 가까이서 얼굴을 확인하듯 봤다. 흑존은 말을 멈췄다.

히든: 풍차보다 네가 예뻐. 됐냐?

흑존의 입꼬리가 올라갔다가, 참으려는 것처럼 잠깐 멈췄다.

흑존: …좀 됐어요.
히든: 비교 대상이 풍차인데 그게 좋아?
흑존: 형 아까 풍차 엄청 좋아하셨잖아요.

형은 결국 웃으며 그의 어깨에 머리를 잠깐 기댔다. 흑존은 휴대폰을 둘 다 보기 편한 높이로 내렸다.

히든: 근데 나 혼자 하고 싶을 때는 내 폰에 깔 거야.
흑존: 네. 그러면 제 농장에도 놀러 오세요.
히든: 거기도 붙잡고 안 보내려고?
흑존: 오래 구경하시게 예쁘게 해놓을게요.

그 말에 형이 눈을 가늘게 떴다.

히든: 그러면 풍차 잘 산 거네.

흑존이 입을 열었다가 다물었다. 형은 그 얼굴을 가까이에서 보고 웃었다.

흑존: 형 진짜 끝까지 인정받으려고 하시네요.
히든: 예쁘잖아. 너도 풍차도.

흑존은 더 따지지 못했다.`,
    choices: [{ label: "남은 과제를 함께 끝낸다", stat: { affinity: 2 }, next: "blackjon_ep16_conspiracy_17" }],
  },
  blackjon_ep16_conspiracy_17: {
    id: "blackjon_ep16_conspiracy_17", title: "흑존 16화: 공모 · 형이 더 심한데요?",
    subtitle: "잠깐만 한다던 두 사람", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep16_conspiracy_together.png"], background: "/blackjon_ep16_conspiracy_together.png",
    text: `형이 말한 과제는 결국 하나 끝났다. 보석이 조금 늘었다.

히든: 봐. 내가 책임진다고 했잖아.
흑존: 풍차 값의 십 분의 일도 안 되는데요.
히든: 시작이 중요하지. 벌써 재촉하면 의욕이 없어져.

흑존이 웃었다. 형은 그 웃음을 무시하고 다음 과제를 열었다. 이번에는 한참 기다려야 했다.

흑존: 그건 내일 해요.
히든: 잠깐만. 다른 걸로 바꾸면 금방 될 수도 있어.
흑존: 형. 아까도 잠깐만이라고 하셨는데.
히든: 게임은 하던 거 마무리를 해야지.

흑존은 형이 소파에서 몸을 앞으로 기울이는 걸 봤다. 자기 휴대폰을 넘겨받으려는 손까지 나왔다.

흑존: 형이 더 심한데요?
히든: 뭐가.
흑존: 저더러 잠깐만 같이 있자는 말을 몇 번 하냐고 하셨잖아요.

형이 입을 다물었다.

흑존: 형은 지금 딸기랑 몇 번 더 계시는 거예요?

형이 흑존의 팔을 툭 쳤다.

히든: 아ㅋㅋ 딸기 질투하지 마. 없어 보여.
흑존: 그럼 저 좀 챙겨주세요. 없어 보이기 전에.

형은 손을 거두고 소파에 다시 기댔다. 흑존은 게임을 저장하고 화면을 껐다. 둘 다 시계를 보고 잠깐 놀랐다.`,
    choices: [{ label: "오늘 농사는 여기까지", stat: { affinity: 1 }, next: "blackjon_ep16_conspiracy_18" }],
  },
  blackjon_ep16_conspiracy_18: {
    id: "blackjon_ep16_conspiracy_18", title: "흑존 16화: 공모 · 두고 갈 수 없는 것",
    subtitle: "각자 집으로", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep16_conspiracy_together.png"], background: "/blackjon_ep16_conspiracy_together.png",
    text: `조금 더 쉬다가 흑존이 먼저 일어났다. 내일 오전에는 자기 집에서 빨래를 돌릴 생각이라고 했다.

히든: 그래. 가서 쉬어.

흑존이 휴대폰을 주머니에 넣자 형의 눈이 그쪽으로 갔다.

흑존: 제 폰은 가져갈게요.
히든: 내가 뭐랬냐?
흑존: 눈으로 말씀하셔서.

형이 웃으며 따라 일어났다. 현관까지 배웅하러 가는 길에 냉장고에서 작은 음료 두 개를 꺼내 하나를 건넸다.

히든: 이거 가져가. 밥 잘 먹었어.
흑존: 다음에도 해드릴게요.
히든: 응. 다음에는 나도 잘 먹을게.
흑존: 오늘도 다 드셨는데.
히든: 너 보면서 먹는다고.

흑존이 신발을 신다가 고개를 들었다. 형은 웃지 않고 음료를 그의 손에 쥐여줬다.

히든: 아 좀 받아. 팔 아파.

흑존이 음료를 받아 들었다. 좋다는 말을 하려는 순간 형이 덧붙였다.

히든: 내일 아침에 딸기 되는 건 기억하고.

흑존은 한숨을 쉬며 웃었다.

흑존: 네. 저랑 딸기 같이 연락드릴게요.

형이 웃으며 문을 닫았다. 흑존은 자기 집으로 돌아갔다.`,
    choices: [{ label: "다음 날 아침", stat: { affinity: 1 }, next: "blackjon_ep16_conspiracy_19" }],
  },
  blackjon_ep16_conspiracy_19: {
    id: "blackjon_ep16_conspiracy_19", title: "흑존 16화: 공모 · 넌 안 썩잖아",
    subtitle: "토요일 오전 · 각자의 집", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep16_conspiracy_call.png"], background: "/blackjon_ep16_conspiracy_call.png",
    text: `다음 날 아침, 흑존은 빨래를 돌려놓고 휴대폰을 집었다. 농장에 들어가기 전에 형에게 먼저 메시지를 보냈다.

메시지: 【흑존】 형 보고 싶어요.
메시지: 【히든】 ㅇㅇ 나도.

흑존이 웃었다. 답장을 쓰기도 전에 메시지가 하나 더 왔다.

메시지: 【히든】 근데 딸기 수확함?
메시지: 【흑존】 아직이요.
메시지: 【히든】 빨리 해. 썩는다.
메시지: 【흑존】 저는요?
메시지: 【히든】 넌 안 썩잖아.

흑존은 화면을 잠깐 봤다. 답장을 쓰려다 지웠다.

농장 알림이 위에서 내려왔다. 딸기를 수확할 수 있다는 알림이었다. 흑존은 그걸 밀어 올리고 영상통화 버튼을 눌렀다.

몇 번 울린 뒤 형이 받았다. 자기 집 소파에 비스듬히 누워 있었다. 머리는 평소보다 조금 헝클어져 있었다.

히든: 왜 영상으로 걸어ㅋㅋ
흑존: 안 썩는지 직접 확인하시라고요.

형이 얼굴을 가리며 웃었다. 흑존은 화면을 더 가까이 가져왔다.

흑존: 형. 저부터 봐요.
히든: 보고 있잖아. 화면 꽉 차네.

흑존은 그 말에야 조금 떨어뜨렸다. 그래도 카메라 밖으로 비키지는 않았다.`,
    choices: [{ label: "딸기 말고 흑존을 본다", stat: { affinity: 2, obsession: 1 }, next: "blackjon_ep16_conspiracy_end" }],
  },
  blackjon_ep16_conspiracy_end: {
    id: "blackjon_ep16_conspiracy_end", title: "흑존 16화: 공모 · 형이 더 심한데요?",
    subtitle: "수확보다 먼저", kind: "comedy", category: "main",
    imagePool: ["/blackjon_ep16_conspiracy_call.png"], background: "/blackjon_ep16_conspiracy_call.png",
    text: `형은 누웠던 몸을 일으켜 소파에 앉았다. 화면 너머로 흑존을 봤다.

히든: 잘 잤냐.
흑존: 네. 형은요?
히든: 잘 잤지. 아침 먹었어?

흑존의 얼굴이 풀렸다.

흑존: 이제 먹으려고요.
히든: 뭐 먹는데.
흑존: 빵이요. 형도요?
히든: 난 아직. 좀 있다 먹으려고.

흑존은 휴대폰을 들고 주방으로 갔다. 빵 봉지를 보여주다가 형이 웃자 다시 자기 얼굴을 비췄다.

히든: 왜 자꾸 얼굴로 돌아와.
흑존: 빵한테도 밀릴까 봐요.

형이 소리 내서 웃었다. 흑존도 따라 웃었다.

히든: 야. 어제 풍차.
흑존: 또 게임 얘기예요?
히든: 네가 놓은 자리 예쁘더라.

흑존이 잠깐 조용해졌다.

히든: 나중에 내 농장도 만들어주든가.
흑존: 옆에 앉아서요?
히든: 응. 모르는 거 물어보게.

흑존이 고개를 끄덕였다. 형은 그 표정을 보다가 웃으며 덧붙였다.

히든: 대신 내 보석은 쓰지 마.
흑존: …형.

이번에는 형이 먼저 웃었다.

딸기는 아직 수확하지 않았다. 흑존은 통화를 끊지 않았다.`,
    choices: [{ label: "공모 16화 완독 · 형이 더 심한데요?", stat: { affinity: 2, obsession: 1 }, end: true }],
  },
};
