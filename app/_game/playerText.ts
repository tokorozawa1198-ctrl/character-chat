// Presentation only: keep scenario source and speaker parsing intact.
export function playerText(text: string, nickname: string, characterIsHidden = false): string {
  if (!nickname || nickname === "히든" || characterIsHidden) return text;
  const last = nickname.codePointAt(nickname.length - 1) || 0;
  const jong = last >= 0xac00 && last <= 0xd7a3 ? (last - 0xac00) % 28 : 0;
  return text.replace(/히든(이라는|이라고|이라서|이야|이다|으로|이랑|이가|이는|이를|은|는|이|가|을|를|과|와|아|야)?/g, (_, particle: string | undefined) => {
    if (particle && ["이라는", "이라고", "이라서", "이야", "이다"].includes(particle)) return nickname + (jong ? particle : particle === "이다" ? "다" : particle.slice(1));
    const pair: Record<string, string> = { 은: jong ? "은" : "는", 는: jong ? "은" : "는", 이: jong ? "이" : "가", 가: jong ? "이" : "가", 을: jong ? "을" : "를", 를: jong ? "을" : "를", 과: jong ? "과" : "와", 와: jong ? "과" : "와", 아: jong ? "아" : "야", 야: jong ? "아" : "야", 으로: jong && jong !== 8 ? "으로" : "로", 이랑: jong ? "이랑" : "랑", 이가: jong ? "이가" : "가", 이는: jong ? "이는" : "는", 이를: jong ? "이를" : "를" };
    return nickname + (particle ? pair[particle] : "");
  });
}
