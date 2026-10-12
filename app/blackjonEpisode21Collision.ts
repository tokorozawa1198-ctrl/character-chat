import type { Scenario } from "./gameTypes";

// 시즌 2 첫 화. 금요일 밤의 결말 이후 토요일 준비, 일요일 기록회와 밤.
export const blackjonEpisode21Collision: Record<string, Scenario> = {
  blackjon_ep21_collision_01: {
    id: "blackjon_ep21_collision_01", title: "흑존 21화: 충돌 · 형이 모르는 얼굴",
    subtitle: "시즌 2 시작 · 토요일의 체육관", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_warmup.png"], background: "/blackjon_ep21_collision_warmup.png",
    text: `체육관 문이 열리자 관장이 벽의 시계를 봤다.

관장: 오늘은 늦었네.
흑존: 칠 분인데요.
관장: 그러니까. 너한테는 늦은 거지.

흑존은 신발을 갈아 신었다. 휴대폰을 가방에 넣었다가 다시 꺼내 화면을 봤다. 새로 온 연락은 없었다.

금요일 밤, 형은 친구와 택시를 타고 떠났다. 흑존은 그 차에 타지 못했다. 창문 너머로 마지막까지 보던 형의 얼굴은, 차가 움직인 뒤에도 한참 같은 자리에 있는 것 같았다.

그가 혼자 돌아왔을 때 식탁에는 두 사람 몫의 저녁이 그대로 있었다.

관장: 내일 명단 확인했어?

출입문 옆에 종이가 붙어 있었다. 동네 체육관 세 곳이 함께 여는 일요일 데드리프트 기록회. 흑존의 이름 옆에는 세 달 전에 적어 낸 목표가 있었다.

흑존: 네. 제 거 맞아요.

관장이 펜을 건넸다. 흑존은 자기 이름 옆에 확인 표시를 했다.`,
    choices: [{ label: "체육관 안으로 들어간다", stat: { affinity: 1 }, next: "blackjon_ep21_collision_02" }],
  },
  blackjon_ep21_collision_02: {
    id: "blackjon_ep21_collision_02", title: "흑존 21화: 충돌 · 선배님 좀 봐주세요",
    subtitle: "준비실 · 익숙한 자리", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_warmup.png"], background: "/blackjon_ep21_collision_warmup.png",
    text: `벤치에 앉기도 전에 파란 운동복이 앞을 가로막았다. 작년부터 같은 시간에 운동하던 스물세 살 후배였다.

후배: 형. 저 내일 망하면 어떡해요?
흑존: 아직 안 했는데 벌써 망했어?
후배: 잠을 못 잤어요.
흑존: 여기 와서 나한테 말하면 잠이 돌아오냐.

후배가 입을 삐죽 내밀었다. 흑존은 자기 가방 지퍼를 열어 여분의 손목 보호대를 꺼냈다.

흑존: 네 거 어제 여기 두고 갔어. 관장님이 찾으시더라.
후배: 아, 그거였구나. 집에서 한 시간 찾았는데.
흑존: 물건 좀 챙겨.

잔소리를 하면서도 말아둔 보호대를 풀어 건넸다. 후배는 익숙하게 받아들고 그 앞에 주저앉았다.

후배: 형은 안 떨려요?
흑존: 떨려.
후배: 거짓말.
흑존: 떨린다니까. 그러니까 말 걸지 마.

후배가 웃었다. 흑존도 입꼬리를 잠깐 올렸다. 그 뒤에서 누군가 자기 것도 찾아달라고 하자 이번에는 진짜로 눈을 흘겼다.

흑존: 분실물 센터 아닙니다.`,
    choices: [{ label: "후배의 준비를 지켜본다", stat: { affinity: 1 }, next: "blackjon_ep21_collision_03" }],
  },
  blackjon_ep21_collision_03: {
    id: "blackjon_ep21_collision_03", title: "흑존 21화: 충돌 · 그 형 말은 듣네",
    subtitle: "사소한 자존심", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_warmup.png"], background: "/blackjon_ep21_collision_warmup.png",
    text: `후배는 조금 전까지 내일의 첫 시도부터 기록을 올리겠다고 우겼다. 흑존이 말려도 인터넷에서 본 이야기를 들이댔다.

그런데 옆 체육관에서 온 선수가 똑같은 말을 하자 금방 고개를 끄덕였다.

후배: 아. 역시 그렇죠?

흑존이 수건으로 목을 닦다가 멈췄다.

흑존: 내가 아까부터 그 말 했잖아.
후배: 형 말도 듣고 있었죠.
흑존: 듣기만 했구나.

옆 선수가 웃음을 터뜨렸다. 후배는 뒤늦게 눈치를 보고 흑존 옆으로 바짝 붙었다.

후배: 선배님 말씀이 제일 맞습니다.
흑존: 늦었어.
후배: 삐쳤어요?
흑존: 네 경기 내가 왜 삐쳐.

그러면서 후배의 신청서를 자기 쪽으로 당겼다. 첫 시도 무게를 확인하고는 다시 돌려줬다. 손가락 끝으로 종이 모서리를 한 번 두드렸다.

흑존: 오늘 갑자기 멋있는 거 하지 마. 하던 거 해.

후배가 이번에는 장난 없이 알겠다고 했다. 흑존은 그제야 다른 쪽을 봤다.`,
    choices: [{ label: "그가 준비해 온 기록을 본다", stat: { affinity: 1 }, next: "blackjon_ep21_collision_04" }],
  },
  blackjon_ep21_collision_04: {
    id: "blackjon_ep21_collision_04", title: "흑존 21화: 충돌 · 지우지 않은 숫자",
    subtitle: "세 달짜리 목표", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_warmup.png"], background: "/blackjon_ep21_collision_warmup.png",
    text: `흑존의 운동 수첩은 모서리가 닳아 있었다. 형의 이름도, 형과 만날 약속도 적혀 있지 않은 작은 수첩이었다.

성공한 날짜 옆에는 짧은 표시가 있었다. 실패한 날에는 같은 숫자를 여러 번 고쳐 썼다. 한 페이지에는 혼자 욕을 적었다가 까맣게 지운 흔적도 있었다.

관장: 내일 저거 한다고 오늘 무리하지 마. 상태 보고 정하는 거야.
흑존: 알아요.
관장: 눈 보면 모를 얼굴인데.

관장이 수첩을 덮으려 하자 흑존이 손바닥으로 눌렀다.

흑존: 저 이거 하고 싶어요.

목소리가 달라졌다. 누구한테 보여주겠다는 말은 하지 않았다. 관장은 그가 손을 뗄 때까지 기다렸다가 오늘 할 준비만 짚어줬다.

후배가 뒤에서 저녁 메뉴를 물었다. 흑존은 대충 대답하다가, 너무 대충 대답했다고 타박을 들었다.

흑존: 그럼 네가 정해. 나한테 물어보고 싫다고 하지 말고.

그는 휴대폰을 벤치 아래 가방에 넣었다. 이번에는 준비가 끝날 때까지 꺼내지 않았다.`,
    choices: [{ label: "같은 날, 형의 집으로", stat: { affinity: 1 }, next: "blackjon_ep21_collision_05" }],
  },
  blackjon_ep21_collision_05: {
    id: "blackjon_ep21_collision_05", title: "흑존 21화: 충돌 · 지우지 않은 일정",
    subtitle: "토요일 오후 · 형의 선택", kind: "obsession", category: "main",
    imagePool: ["/bg_room_day.png"], background: "/bg_room_day.png",
    text: `형은 늦게 일어나 냉장고 앞에서 식빵을 먹었다. 접시를 꺼내기 싫어서 봉지를 받쳤다가 바닥에 부스러기를 쏟았다.

히든: 아. 존나 효율적이네.

청소기를 가지러 가려는데 휴대폰에 일정 알림이 떴다. 내일 오후, 흑존 기록회.

한 달도 더 전에 입력한 것이었다. 그때 흑존은 별거 아니라면서 초대장을 세 번이나 보여줬다. 형은 알겠다고, 네가 바닥 뜯어내는 거 구경 가겠다고 했다.

형은 일정의 삭제 버튼을 눌렀다. 확인 창을 띄워놓고 한동안 보고 있었다.

어젯밤 문 앞에서 느낀 공포는 그대로였다. 오늘 새벽에도 복도 소리에 한 번 깼다. 그런데 그 숫자 하나를 성공시키려고 얼마나 오래 투덜거렸는지도 기억났다.

형은 취소를 눌렀다. 일정은 남았다.

그래놓고 왜 남겼는지 설명할 사람을 찾듯 휴대폰을 뒤집어놓았다. 바닥의 부스러기는 여전히 발에 밟혔다.`,
    choices: [
      { label: "친구에게 솔직하게 말한다", stat: { affinity: 1 }, next: "blackjon_ep21_collision_06", result: "히든: 나 내일 걔 대회 좀 보고 싶어.\n문자를 보내고 형은 괜히 식빵 봉지를 접었다. 걔가 불쌍해서라는 말은 쓰지 않았다." },
      { label: "왜 가고 싶은지 잠깐 생각한다", stat: { trust: 1 }, next: "blackjon_ep21_collision_06", result: "다시 만나고 싶은 건 아니었다. 그렇다고 아무 마음도 없는 건 아니었다. 형은 그 두 가지가 한꺼번에 있는 자기 마음이 귀찮아서, 결국 친구에게 전화를 걸었다." },
    ],
  },
  blackjon_ep21_collision_06: {
    id: "blackjon_ep21_collision_06", title: "흑존 21화: 충돌 · 보러 가는 것만",
    subtitle: "설명되지 않는 마음", kind: "obsession", category: "main",
    imagePool: ["/bg_room_day.png"], background: "/bg_room_day.png",
    text: `친구는 잠깐 말이 없었다. 형이 먼저 말했다.

히든: 어제 네가 와준 거 까먹어서 이러는 거 아니야.

친구는 그걸 묻는 게 아니라고 했다. 약속했으니까 가야 한다고 생각하는 거냐고 물었다.

히든: 아니. 보고 싶어서.

말하고 나니 생각보다 단순했다. 그래서 좀 민망했다.

히든: 운동하는 거. 저거 잘하는 건 보고 싶어.

친구는 가지 말라는 말도, 잘 생각했다는 말도 하지 않았다. 대신 끝나고 자기와 저녁을 먹자고 했다. 근처에 있을 테니 나오면 연락하라고.

히든: 네가 또 수고하네.

친구가 밥은 형이 사라고 했다.

히든: 아. 역시 우정에는 가격표가 있구나.

웃고 나서 형은 대회 안내를 다시 열었다. 관람은 자유였고, 출입구 옆에 관중석이 있었다. 흑존에게 간다는 연락은 보내지 않았다. 갔다가 보기 싫어지면 그냥 나오기로 했다.

저녁 약속은 달력에 새로 적었다.`,
    choices: [{ label: "일요일, 관중석으로 간다", stat: { trust: 1 }, next: "blackjon_ep21_collision_07" }],
  },
  blackjon_ep21_collision_07: {
    id: "blackjon_ep21_collision_07", title: "흑존 21화: 충돌 · 맨 끝자리",
    subtitle: "일요일 오후 · 작은 기록회", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_audience.png"], background: "/blackjon_ep21_collision_audience.png",
    text: `체육관 안은 형이 생각한 것보다 소란스러웠다. 접이식 의자가 덜컥거렸고, 누군가는 기록표보다 점심 도시락을 먼저 찾았다.

형은 코트를 벗지 않은 채 통로 옆 맨 끝자리에 앉았다. 가까운 테이블에서 받은 순서표를 폈다.

히든: 이거 뭘 봐야 아는 건데.

옆자리의 중년 관람객이 자기 아들도 처음 나온다며 설명해 줬다. 형은 알아들은 척 고개를 끄덕였다가, 조금 뒤 같은 걸 다시 물었다.

히든: 아까 제가 이해한 표정이었죠. 잘못 보신 겁니다.

상대가 웃었다. 형도 웃으며 종이에 표시를 했다. 흑존 차례에는 아는 척이라도 하고 싶었다.

준비 구역에 검은 민소매가 보였다. 흑존은 형 쪽을 보고 있지 않았다. 파란 티셔츠를 입은 후배가 뭔가 말하자 짧게 대꾸하고, 바닥에 굴러온 물병을 발끝으로 멈춰 세웠다.

형은 펜을 내려놓고 그쪽을 봤다.`,
    choices: [{ label: "형을 보지 않는 흑존을 지켜본다", stat: { affinity: 1 }, next: "blackjon_ep21_collision_08" }],
  },
  blackjon_ep21_collision_08: {
    id: "blackjon_ep21_collision_08", title: "흑존 21화: 충돌 · 제법 선배 같네",
    subtitle: "준비 구역의 대화", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_warmup.png"], background: "/blackjon_ep21_collision_warmup.png",
    text: `후배가 준비한 동작을 마치고 돌아왔다. 흑존은 손에 들었던 수건을 옆으로 치워 자리를 내줬다.

후배: 방금 괜찮았죠?
흑존: 어.
후배: 어, 가 끝이에요?
흑존: 잘했어. 됐냐?

후배가 과장되게 감격하는 시늉을 했다. 흑존은 보기 싫다는 얼굴로 밀어내는 척하다가 웃었다.

관중석까지 대화가 전부 들리지는 않았다. 그래도 형은 저 입 모양을 알았다. 귀찮다는 척하면서 결국 한 번 더 봐주는 얼굴도.

옆의 참가자가 끼어들어 조언하자 흑존은 잠깐 듣더니 자기 생각과 다른 부분을 짚었다. 상대가 설명을 보태자 다시 듣고, 그건 맞는 말이라고 고개를 끄덕였다.

형의 손에서 순서표 모서리가 접혔다.

저렇게 남의 말 끝까지 듣는 얼굴도 있었다. 형이 못 본 사이에 새로 생긴 얼굴은 아닐 것이다.

후배가 무언가를 또 물었다. 흑존은 제발 물부터 마시라는 듯 물병을 가리켰다. 형이 작게 코웃음을 쳤다.`,
    choices: [{ label: "시선이 마주칠 때까지", stat: { affinity: 1 }, next: "blackjon_ep21_collision_09" }],
  },
  blackjon_ep21_collision_09: {
    id: "blackjon_ep21_collision_09", title: "흑존 21화: 충돌 · 아무도",
    subtitle: "물병 뚜껑 하나", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_audience.png"], background: "/blackjon_ep21_collision_audience.png",
    text: `흑존이 고개를 들었다.

처음에는 형을 지나쳐 봤다. 조금 늦게 시선이 돌아왔다. 물병을 들고 있던 손이 가슴 앞에서 멈췄다.

형은 손을 흔들지 않았다. 눈이 마주치자 턱만 조금 움직였다. 왔다는 표시였다.

흑존이 일어나려 했다. 옆에서 자기 이름을 부르는 소리에 다시 앉았다. 곧 준비해야 할 차례였다.

그는 물병 뚜껑을 닫았다. 비뚤어졌다. 다시 풀어서 닫았다. 이번에도 손끝이 미끄러졌다.

후배: 누구 왔어요?
흑존: 아무도.
후배: 아무도 안 왔는데 왜 웃어요?

흑존이 후배를 봤다. 그제야 자기 입가를 손등으로 문질렀다.

흑존: 앞이나 봐.

형은 관중석에서 그 광경을 다 봤다. 큰 덩치가 작은 플라스틱 뚜껑과 싸우는 모습에 결국 웃음이 났다.

흑존의 시선이 그 웃음에 붙었다. 이번에는 관장이 두 번 불러야 돌아봤다.`,
    choices: [{ label: "괜히 순서표를 내려다본다", stat: { affinity: 2 }, next: "blackjon_ep21_collision_10" }],
  },
  blackjon_ep21_collision_10: {
    id: "blackjon_ep21_collision_10", title: "흑존 21화: 충돌 · 별로 안 친한데요",
    subtitle: "금방 들키는 거짓말", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_warmup.png"], background: "/blackjon_ep21_collision_warmup.png",
    text: `후배가 형 쪽을 슬쩍 보더니 알겠다는 얼굴을 했다.

후배: 아는 형?
흑존: 어.
후배: 많이 아는 형?
흑존: 너 오늘 말 되게 많다.

후배는 자기 휴대폰을 들어 촬영 각도를 확인했다. 관장은 따로 세운 카메라로 행사 전체를 찍고 있었다. 화면 가장자리에 관중석과 출입 통로가 함께 들어왔다.

후배: 끝나면 영상 보내드릴게요. 저 형 기록 깨면 이것도 증거로 쓰고.
흑존: 언제.
후배: 언젠가요.
흑존: 오래 살긴 해야겠다.

후배가 억울한 소리를 냈다. 흑존은 웃다가 다시 관중석을 봤다. 형이 옆자리 사람에게 뭔가 묻고 있었다. 그 사람이 순서표를 가리켰다.

그 잠깐 사이 웃음이 작아졌다.

관장: 네 차례 준비.

흑존은 물병을 내려놓았다. 형이 누구와 무슨 말을 하는지 확인하려던 몸을, 발판 쪽으로 돌렸다.`,
    choices: [{ label: "첫 시도를 지켜본다", stat: { obsession: 1 }, next: "blackjon_ep21_collision_11" }],
  },
  blackjon_ep21_collision_11: {
    id: "blackjon_ep21_collision_11", title: "흑존 21화: 충돌 · 성급한 손",
    subtitle: "생각처럼 되지 않는 첫 시도", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_warmup.png"], background: "/blackjon_ep21_collision_warmup.png",
    text: `첫 시도는 무게 때문이 아니었다. 들기는 들었다. 끝나기도 전에 형 쪽을 확인했고, 심판의 신호보다 먼저 내려놓았다.

무효라는 말을 듣자 흑존의 턱이 굳었다.

형은 옆자리 사람을 봤다. 설명을 듣고 나서야 왜 박수가 끊겼는지 알았다. 준비 구역으로 돌아가는 흑존의 뒤통수에 괜히 자기가 민망해졌다.

흑존은 수건을 집어 들었다. 얼굴을 닦는 시간이 길었다.

후배: 형도 하던 거 하라면서요.

수건 아래에서 흑존의 눈이 올라왔다. 후배가 바로 입을 다물었다.

잠깐 뒤 흑존이 먼저 말했다.

흑존: 맞는 말인데 재수 없네.

후배가 안심하고 웃었다. 흑존은 웃지 않은 채 물을 마셨다. 그러다가 빈 뚜껑을 들고 있던 후배 손을 보고 작게 웃었다.

흑존: 뺏어 먹은 거 아니야. 내 거야.

물병에는 자기 이름이 적혀 있었다. 후배가 자기 것을 찾으러 돌아섰다. 흑존은 그제야 길게 숨을 내쉬었다.`,
    choices: [{ label: "그가 다시 준비하는 시간을 본다", stat: { affinity: 1 }, next: "blackjon_ep21_collision_12" }],
  },
  blackjon_ep21_collision_12: {
    id: "blackjon_ep21_collision_12", title: "흑존 21화: 충돌 · 네가 적은 거",
    subtitle: "기록 앞에 혼자 서기", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_warmup.png"], background: "/blackjon_ep21_collision_warmup.png",
    text: `관장이 수첩을 펼쳐 흑존 앞에 놓았다.

관장: 누가 저거 시켰냐.
흑존: 아무도요.
관장: 그럼 네 것부터 해.

흑존은 대답하지 않고 수첩을 봤다. 세 달 전의 글씨는 지금보다 조금 컸다. 처음 목표를 말했을 때 후배가 놀랐던 것도 기억났다. 그날은 집에 가는 길에 혼자 웃었다.

두 번째 시도는 성공했다. 관장은 더 욕심낼 상태인지 확인했고, 흑존도 이번에는 급하게 답하지 않았다. 몸을 움직여 보고, 숨을 고르고, 마지막 신청을 했다.

후배: 할 수 있겠어요?
흑존: 해봐야 알지.

아까처럼 괜히 큰소리치지 않았다. 그렇다고 포기한 얼굴도 아니었다.

형은 순서표를 무릎 위에 펴놓았다. 흑존이 자기 쪽을 볼 줄 알았는데, 이번에는 발판만 봤다.

손바닥을 비비는 모습이 보였다. 입술이 잠깐 움직였다. 무슨 말인지는 들리지 않았다.

이름이 다시 불렸다. 흑존이 앞으로 걸어 나갔다.`,
    choices: [{ label: "마지막 시도를 본다", stat: { affinity: 1 }, next: "blackjon_ep21_collision_13" }],
  },
  blackjon_ep21_collision_13: {
    id: "blackjon_ep21_collision_13", title: "흑존 21화: 충돌 · 들었다",
    subtitle: "마지막 시도 · 자기 기록", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_lift.png"], background: "/blackjon_ep21_collision_lift.png",
    text: `소리가 잠깐 작아졌다.

형은 흑존의 얼굴을 봤다. 자기 기분을 살피느라 웃고, 눈치를 보고, 대답을 기다리던 얼굴이 아니었다. 이를 악물고 앞을 보고 있었다.

바벨이 올라왔다. 중간에서 느려졌다. 형의 발끝에 힘이 들어갔다. 자기가 대신 들어줄 것도 아니면서, 의자에서 엉덩이가 조금 떴다.

히든: 야, 야. 조금만.

누가 들으라고 한 말은 아니었다.

흑존이 끝까지 몸을 세웠다. 이번에는 기다렸다. 심판의 신호를 듣고 내려놓았다.

성공.

형은 순서표를 무릎에서 떨어뜨리면서 박수를 쳤다. 옆자리 사람도 벌떡 일어났다. 흑존은 결과를 한 번 더 확인하고 나서야 입을 벌려 웃었다.

그 웃음이 어찌나 대놓고 좋아하는 얼굴인지, 형도 같이 웃었다.

흑존은 관장을 봤다. 후배가 제자리에서 뛰었다. 그는 후배 쪽으로 손을 들고, 기록표에 적히는 숫자를 다시 봤다.

형은 그 모습을 끝까지 봤다. 자기 쪽을 보지 않은 몇 초 동안, 흑존이 정말로 행복해 보였다.`,
    choices: [
      { label: "아낌없이 박수를 친다", stat: { affinity: 2 }, next: "blackjon_ep21_collision_14", result: "손바닥이 조금 아팠다. 형은 개의치 않았다. 저건 잘한 일이었다. 지금 웃는 자기 마음까지 억지로 부정하고 싶지는 않았다." },
      { label: "떨어진 순서표를 줍고 다시 본다", stat: { affinity: 1, trust: 1 }, next: "blackjon_ep21_collision_14", result: "형은 순서표에 적힌 숫자를 찾아 동그라미를 쳤다. 비뚤어져서 한 번 더 그었다. 나중에 모르는 척 놀리더라도, 이건 정확히 기억하고 싶었다." },
    ],
  },
  blackjon_ep21_collision_14: {
    id: "blackjon_ep21_collision_14", title: "흑존 21화: 충돌 · 잠깐 밖으로",
    subtitle: "성공을 본 다음", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_audience.png"], background: "/blackjon_ep21_collision_audience.png",
    text: `후배가 흑존의 등을 두드릴 때 휴대폰이 진동했다. 월요일 시험 준비를 같이 하던 학교 동료였다.

형은 메시지를 먼저 봤다. 공유한 자료에 이전 판본이 섞여 있어 확인이 필요하다는 내용이었다. 짧게 답을 쓰다가 지웠다. 말로 하는 편이 빨랐다.

옆자리 사람에게 잠깐 나갔다 오겠다고 하고 일어났다. 흑존은 관장과 이야기하고 있었다. 형은 굳이 무대 쪽으로 손짓하지 않았다.

통로를 걸어 나와 문밖에서 전화를 받았다.

히든: 오른쪽 파일 말고. 아니, 이름 말고 날짜를 봐요.

설명이 길어졌다. 형은 로비 벽에 기대어 직접 파일을 열었다. 자기가 이름을 헷갈리게 붙인 탓도 있었다.

히든: 아. 이건 제가 아주 창의적으로 저장했네요. 잠깐만요.

안쪽에서 박수 소리가 났다. 형은 확인한 파일을 다시 보내고, 동료가 제대로 열었는지 기다렸다. 들어가서 잘했다고 말할 생각을 하면서.`,
    choices: [{ label: "안쪽에 남은 흑존을 본다", stat: { obsession: 1 }, next: "blackjon_ep21_collision_15" }],
  },
  blackjon_ep21_collision_15: {
    id: "blackjon_ep21_collision_15", title: "흑존 21화: 충돌 · 빈 의자",
    subtitle: "목에 걸린 메달", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_award.png"], background: "/blackjon_ep21_collision_award.png",
    text: `완주한 참가자들에게 같은 기념 메달이 돌아갔다. 순위보다 각자 세운 기록을 함께 축하하는 작은 행사였다.

후배가 먼저 받아 와 자랑했다. 흑존은 자기 것과 똑같다고 했고, 후배는 그래서 더 좋다고 했다.

흑존: 뭐가.
후배: 형이랑 똑같은 거 받았잖아요.

흑존이 웃으며 목에 걸린 끈을 폈다. 그리고 관중석을 봤다.

형의 자리가 비어 있었다.

처음에는 몸을 숙여 뭔가 줍는 줄 알았다. 옆자리 사람 뒤도 보고, 통로도 봤다. 코트나 가방도 남아 있지 않았다.

후배: 사진 찍어요. 이쪽.

흑존은 후배가 가리킨 방향으로 얼굴을 돌렸다. 입꼬리를 올렸다. 사진을 찍는 동안에도 시야 한쪽에 출입문이 걸려 있었다.

후배: 형, 저도 기록 올렸어요.
흑존: 어. 잘했어.
후배: 안 봤죠.

흑존이 후배를 봤다. 조금 전 자기가 무슨 말을 들었는지 다시 생각하는 표정이었다.`,
    choices: [{ label: "뒤늦게 후배의 얼굴을 본다", stat: { obsession: 1 }, next: "blackjon_ep21_collision_16" }],
  },
  blackjon_ep21_collision_16: {
    id: "blackjon_ep21_collision_16", title: "흑존 21화: 충돌 · 찍어주기로 했잖아요",
    subtitle: "남아 있는 사람에게 놓친 것", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_award.png"], background: "/blackjon_ep21_collision_award.png",
    text: `후배는 웃고 있었지만 입가가 조금 굳어 있었다.

후배: 마지막 거 찍어주기로 했잖아요.

흑존이 자기 휴대폰을 봤다. 영상은 없었다. 후배 차례에 화면을 켜놓고도 관중석을 보고 있었다.

흑존: 미안. 못 찍었어.
후배: 괜찮아요. 관장님 것도 있으니까.

그 말이 나왔는데도 후배는 바로 다른 이야기를 하지 않았다. 흑존이 먼저 물었다.

흑존: 마지막 거 얼마 했어?

후배가 숫자를 말했다. 흑존의 눈썹이 올라갔다. 아침에 신청하겠다고 했던 것보다 조금 높았다.

흑존: 그거 했어?
후배: 네.
흑존: 진짜 잘했네.

이번에는 숫자를 듣고 한 말이었다. 후배가 그제야 제대로 웃었다. 흑존은 그 애가 내민 주먹에 자기 주먹을 가볍게 부딪쳤다.

그러고는 또 문을 봤다.

후배는 무슨 말을 더 하려다가 물을 마셨다. 흑존은 그걸 보지 못했다.`,
    choices: [{ label: "행사가 끝날 때까지", stat: { trust: -1, obsession: 1 }, next: "blackjon_ep21_collision_17" }],
  },
  blackjon_ep21_collision_17: {
    id: "blackjon_ep21_collision_17", title: "흑존 21화: 충돌 · 웃고 있어요",
    subtitle: "사진 속에서는", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_award.png"], background: "/blackjon_ep21_collision_award.png",
    text: `단체 사진을 찍으려고 사람들이 모였다. 흑존은 맨 뒤로 갔다. 키 큰 사람은 뒤라는 말에 괜한 농담도 했다.

흑존: 얼굴 작게 나와서 손해인데요.
관장: 앞에 서면 남의 얼굴이 안 나와.

누군가 웃었다. 흑존도 웃었다. 카메라가 내려가자 바로 웃음을 거뒀다.

의자를 접는 사람에게서 하나를 받아 들고 나르다가, 열린 문틈으로 바깥을 봤다. 형은 보이지 않았다.

주머니에서 휴대폰을 꺼냈다. 어디 갔어요. 글자를 썼다. 보내기 직전에 손가락이 멈췄다.

관장: 로비에 누가 너 기다린다.

흑존이 고개를 들었다. 들고 있던 의자를 내려놓는 소리가 크게 났다.

후배: 아는 형?

대답하지 않았다. 쓰던 문자를 지우고 화면을 껐다.

급하게 걷다가 로비 문 앞에서 속도를 늦췄다. 목에 걸린 메달을 한 번 내려다봤다. 그대로 둔 채 문을 밀었다.`,
    choices: [{ label: "로비에서 다시 만난다", stat: { affinity: 1 }, next: "blackjon_ep21_collision_18" }],
  },
  blackjon_ep21_collision_18: {
    id: "blackjon_ep21_collision_18", title: "흑존 21화: 충돌 · 봤어",
    subtitle: "늦게 도착한 칭찬", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_reunion.png"], background: "/blackjon_ep21_collision_reunion.png",
    text: `형은 자판기 앞 벤치에 앉아 있었다. 손에는 캔커피가 있었다. 흑존이 다가오자 목의 메달부터 봤다.

히든: 그거 주는구나.
흑존: 다 줘요.
히든: 누가 금메달이라고 했냐. 왜 김부터 빼.

흑존이 옆에 앉았다. 형은 가방을 자기 무릎에 올렸지만 자리를 붙이지는 않았다.

흑존: 가신 줄 알았어요.
히든: 전화 받으러 나왔어. 학교에서.

누가 전화했는지 묻는 말이 목까지 올라왔다. 흑존은 캔을 만지는 형의 손을 봤다.

히든: 봤어. 마지막에 잘하더라.

그가 얼굴을 들었다.

흑존: 보셨어요?
히든: 응. 너 그거 성공하면 저 표정 짓는구나.

흑존은 잠깐 말을 잊었다. 형이 기록을 정확히 말해주자 더 그랬다. 바닥에 떨어졌던 순서표가 형의 코트 주머니에서 조금 나와 있었다.

흑존: 저 오늘 그거 처음 했어요.
히든: 알아. 자랑을 몇 번을 했는데.

그제야 흑존이 웃었다. 눈가까지 같이 접히는 웃음이었다.`,
    choices: [{ label: "그 웃음을 조금 더 본다", stat: { affinity: 2 }, next: "blackjon_ep21_collision_19" }],
  },
  blackjon_ep21_collision_19: {
    id: "blackjon_ep21_collision_19", title: "흑존 21화: 충돌 · 아는 사람 없다며",
    subtitle: "잠깐 돌아온 말투", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_reunion.png"], background: "/blackjon_ep21_collision_reunion.png",
    text: `히든: 근데 물병은 왜 못 닫아? 아까 그 큰 거는 들면서.
흑존: 그것도 보셨어요?
히든: 내 시력이 생각보다 좋아.
흑존: 좋은 것만 좀 보시지.

형이 웃었다. 캔커피를 열려다가 손톱이 미끄러지자 흑존이 손을 내밀었다.

형은 캔을 건넸다. 흑존은 따서 돌려줬다. 이 작은 동작은 이상할 정도로 예전과 똑같았다.

흑존: 형도 이거 못 여시면서.
히든: 저는 힘 쓸 일을 외주 주는 지능이 있어요.
흑존: 아. 저 아까부터 지능 부족하다는 얘기였어요?

후배가 로비를 지나가다 흑존을 불렀다. 아는 사람 없다더니 여기 있었냐고 했다.

히든: 내가 모르는 사람이야?
흑존: 그게 아니라.
히든: 처음 뵙겠습니다. 물병 뚜껑한테 지셨다면서요.

후배가 웃음을 참지 못했다. 흑존은 귀가 조금 빨개진 채 수건을 접었다.

흑존: 두 분 처음 봤는데 되게 잘 맞으시네요. 기분 나쁘게.

형이 다시 웃었다. 흑존은 투덜거리는 얼굴로 그 웃음을 오래 봤다.`,
    choices: [
      { label: "축하를 제대로 전한다", stat: { affinity: 2 }, next: "blackjon_ep21_collision_20", result: "히든: 농담이고. 오늘 진짜 잘했어.\n흑존은 고개를 숙여 메달을 만졌다. 다 받는 거라는 말은 이번에는 하지 않았다." },
      { label: "어려웠던 마지막 시도를 묻는다", stat: { affinity: 1, trust: 1 }, next: "blackjon_ep21_collision_20", result: "히든: 마지막에 느려졌을 때. 그때 될 줄 알았어?\n흑존: 아뇨. 저도 몰랐어요.\n그는 처음으로 그 몇 초가 자기한테 어땠는지 설명했다. 형은 끼어들지 않고 끝까지 들었다." },
    ],
  },
  blackjon_ep21_collision_20: {
    id: "blackjon_ep21_collision_20", title: "흑존 21화: 충돌 · 둘 다 사실이라서",
    subtitle: "웃은 다음에도 남는 것", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_reunion.png"], background: "/blackjon_ep21_collision_reunion.png",
    text: `후배가 안으로 돌아가자 흑존은 조금 더 편히 앉았다. 형도 캔을 양손으로 감쌌다.

잠깐 말이 없어도 어색하지 않았다. 형은 그게 싫기도, 좋기도 했다.

흑존: 끝나고 뭐 드실래요? 여기 근처에—
히든: 나 저녁 약속 있어.

흑존의 입이 멈췄다. 형은 캔을 내려다보다가 그를 봤다.

히든: 오늘 잘한 건 잘한 거야.

흑존의 손가락이 수건 끝을 눌렀다.

히든: 금요일 밤 일까지 괜찮아졌다는 뜻은 아니고.

체육관 안에서 접이식 의자를 쌓는 소리가 났다. 흑존은 한동안 그쪽을 봤다. 형이 말을 잘못했나 생각할 만큼 길지는 않았지만, 캔의 온기가 식는 걸 느낄 만큼은 길었다.

흑존: 아까 웃으셨잖아요.
히든: 웃겼으니까.
흑존: 저랑요.
히든: 응. 너랑.

형은 웃은 적 없다고 하지 않았다. 그렇다고 저녁 약속을 지우지도 않았다. 흑존은 무릎 위에 놓인 형의 가방을 봤다.`,
    choices: [{ label: "바로 대답하지 못하는 흑존을 본다", stat: { trust: -1, obsession: 1 }, next: "blackjon_ep21_collision_21" }],
  },
  blackjon_ep21_collision_21: {
    id: "blackjon_ep21_collision_21", title: "흑존 21화: 충돌 · 다 하기 싫어졌지",
    subtitle: "자기에게도 낯선 질문", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_reunion.png"], background: "/blackjon_ep21_collision_reunion.png",
    text: `흑존이 메달 가장자리를 엄지로 문질렀다.

흑존: 형 없을 때도 저 잘하던데.

형은 조금 의외라는 얼굴로 그를 봤다.

히든: 그럼. 원래 네가 하던 거잖아.
흑존: 그때 진짜 좋았거든요. 마지막에.
히든: 그래 보였어.

흑존은 설명을 더 하려다가 입을 다물었다. 무게가 올라간 순간이 아직 손에 남아 있었다. 그때는 정말 좋았다. 형에게 잘 보였을까 생각하기 전부터.

흑존: 근데 왜 형 안 보이니까 다 하기 싫어졌지.

말끝이 작아졌다. 형에게 따지는 말투가 아니었다. 질문을 해놓고도 어디를 봐야 할지 모르는 얼굴이었다.

형은 쉽게 답하지 못했다. 기분이 좀 나아지라고 건넬 말은 몇 개 떠올랐다. 네 옆에 있겠다고 하면 가장 빨리 나아질 것도 알았다.

히든: 그건 나도 모르겠어.

흑존이 고개를 들었다.

히든: 근데 오늘 네가 잘한 게 없어지는 건 아니잖아.

흑존은 메달을 내려놓았다. 그 말을 이해 못 한 얼굴은 아니었다. 납득할 생각이 없는 얼굴과도 조금 달랐다. 그는 다시 형의 가방을 봤다.`,
    choices: [{ label: "각자의 저녁으로 돌아간다", stat: { affinity: 1, obsession: 1 }, next: "blackjon_ep21_collision_22" }],
  },
  blackjon_ep21_collision_22: {
    id: "blackjon_ep21_collision_22", title: "흑존 21화: 충돌 · 여기까지",
    subtitle: "남겨진 일정", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_reunion.png"], background: "/blackjon_ep21_collision_reunion.png",
    text: `형의 휴대폰에 친구가 도착했다는 연락이 왔다. 형은 다 마신 캔을 들고 일어났다.

흑존도 바로 몸을 일으키려 했다. 형이 봤다.

히든: 오늘은 여기까지야. 따라오지 마.

이번에는 큰 소리가 아니었다. 흑존은 벤치 끝을 짚은 채 멈췄다. 안쪽에서 후배가 뒷정리를 도와달라고 불렀다.

형이 출입문으로 걸어갔다. 흑존은 그 뒷모습을 봤다. 형은 돌아보지 않았다.

관장이 로비에 나와 바닥의 가방을 치웠다. 후배는 의자를 한꺼번에 너무 많이 들었다가 낑낑댔다.

흑존이 일어나 의자 두 개를 받아 들었다.

후배: 저녁 같이 먹을 거죠?

흑존은 문을 한 번 더 봤다. 밖에는 이미 다른 사람이 지나가고 있었다.

흑존: 정리부터 해.

그날 형은 친구와 저녁을 먹고 따로 귀가했다. 흑존은 체육관에 남아 정리를 마쳤다. 뒤풀이 식당에서는 자기 앞에 놓인 고기를 두 번이나 태웠다.`,
    choices: [{ label: "그날 밤, 흑존의 집으로", stat: { obsession: 1 }, next: "blackjon_ep21_collision_23" }],
  },
  blackjon_ep21_collision_23: {
    id: "blackjon_ep21_collision_23", title: "흑존 21화: 충돌 · 재생",
    subtitle: "일요일 밤 · 도착한 영상", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_replay.png"], background: "/blackjon_ep21_collision_replay.png",
    text: `샤워를 마치고 나오니 체육관 단체 대화방에 영상이 올라와 있었다. 관장이 찍은 전체 영상과 후배가 찍은 짧은 영상들. 축하한다는 말 뒤에 다음 주 운동 약속이 이어졌다.

흑존은 후배의 마지막 시도를 먼저 찾아봤다. 성공하는 순간 소리를 내 웃는 얼굴이 나왔다.

흑존: 잘했네.

그 말은 이번에는 들을 사람이 없었다. 그는 후배에게 짧게 축하를 보냈다. 곧 다음에는 꼭 찍어달라는 답장이 왔다.

흑존은 알겠다고 썼다.

자기 마지막 시도를 재생했다. 처음에는 정말 기록을 보려고 했다. 발판 위의 자기 모습이 나왔다. 관장의 목소리와 박수 소리가 들렸다.

메달은 테이블 위 투명한 봉투 안에 있었다. 목에서 빼 가방에 넣을 때 그대로였다.

화면 구석에서 형이 보였다. 통로 옆 끝자리. 앞으로 몸을 기울였다가 박수를 치는 모습.

흑존의 엄지가 화면에서 멈췄다. 조금 뒤, 형의 손이 코트 주머니로 갔다.`,
    choices: [{ label: "화면 구석의 움직임을 따라간다", stat: { obsession: 2 }, next: "blackjon_ep21_collision_end" }],
  },
  blackjon_ep21_collision_end: {
    id: "blackjon_ep21_collision_end", title: "흑존 21화: 충돌 · 형이 모르는 얼굴",
    subtitle: "시즌 2 · 멈춘 장면", kind: "obsession", category: "main",
    imagePool: ["/blackjon_ep21_collision_replay.png"], background: "/blackjon_ep21_collision_replay.png",
    text: `영상 속 형은 휴대폰을 보고 일어났다. 옆자리 사람에게 짧게 말하고, 코트 자락을 정리하고, 통로를 따라 걸어 나갔다.

흑존은 그 뒤를 보지 않았다. 손가락으로 재생 막대를 뒤로 밀었다.

형이 다시 앉아 있었다.

재생했다. 형이 일어났다.

학교에서 전화가 왔다고 했다. 도망간 게 아니었다. 조금 뒤 로비에서 자기를 기다렸다. 잘했다고 말했고, 물병 뚜껑 이야기를 하면서 웃었다.

그걸 다 아는데도 엄지는 같은 곳으로 돌아갔다.

형이 앉았다. 일어났다. 화면 밖으로 나갔다.

흑존은 소리를 줄였다. 자기 기록에 쏟아지던 박수가 사라졌다. 테이블의 메달에 화면빛이 한 번 스치고 지나갔다.

형이 박수 치는 장면으로 돌릴 수도 있었다. 분명히 찍혀 있었다. 조금만 앞이었다.

그는 또 그보다 뒤를 눌렀다.

화면 안의 형이 휴대폰을 확인했다. 흑존의 손가락이 움직였다.

이번에는 일어나기 전에 멈췄다.`,
    choices: [{ label: "21화 완독 · 형이 모르는 얼굴", stat: { obsession: 2, trust: -1 }, end: true }],
  },
};
