// VN ENGINE v4 FULL MERGED — keeps original chat/actions/API/gallery and adds route stats.
export type RouteStage = "normal" | "jealous" | "obsessed" | "yandere" | "confinement";

export function clampStat(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function analyzeEmotionDelta(text: string) {
  const t = text.replace(/\s/g, "");
  let jealousy = 0, obsession = 0, trust = 0;
  if (/(다른남자|다른사람|다른애|남친|여친|소개팅|데이트|걔랑|선배|후배|친구랑|다른봇)/.test(t)) { jealousy += 18; obsession += 5; trust -= 4; }
  if (/(답장늦|늦게봤|바빴|잠수|연락못)/.test(t)) { jealousy += 8; obsession += 8; trust -= 2; }
  if (/(어디가|나갈래|집에갈래|혼자있고싶|그만|싫어|꺼져|비켜)/.test(t)) { obsession += 12; trust -= 5; }
  if (/(외롭|혼자|힘들|우울|보고싶|옆에있어)/.test(t)) { obsession += 9; trust += 3; }
  if (/(너밖에|좋아|사랑|믿어|고마워|잘생|멋있|귀엽)/.test(t)) { jealousy -= 6; obsession += 3; trust += 7; }
  if (/(질투|집착|감금|얀데레|스토킹)/.test(t)) { jealousy += 12; obsession += 15; trust -= 2; }
  return { jealousy, obsession, trust };
}

export function getRouteStage(state: { jealousy: number; obsession: number }): RouteStage {
  if (state.obsession >= 90) return "confinement";
  if (state.obsession >= 80) return "yandere";
  if (state.obsession >= 50) return "obsessed";
  if (state.jealousy >= 30) return "jealous";
  return "normal";
}

export function getRoutePortrait(state: { jealousy: number; obsession: number }, fallback: string) {
  if (state.obsession >= 90) return "/oppa_confinement.png";
  if (state.obsession >= 80) return "/oppa_yandere.png";
  if (state.obsession >= 50) return "/oppa_obsessed50.png";
  if (state.obsession >= 30) return "/oppa_obsessed30.png";
  if (state.jealousy >= 80) return "/oppa_jealous80.png";
  if (state.jealousy >= 50) return "/oppa_jealous50.png";
  if (state.jealousy >= 30) return "/oppa_jealous30.png";
  return fallback;
}

export function getThresholdEventId(state: { jealousy: number; obsession: number }, flags: Record<string, boolean>) {
  const checks: Array<[string, boolean]> = [
    ["confinementRoute", state.obsession >= 90],
    ["obsession80", state.obsession >= 80],
    ["jealousy80", state.jealousy >= 80],
    ["obsession50", state.obsession >= 50],
    ["jealousy50", state.jealousy >= 50],
    ["obsession30", state.obsession >= 30],
    ["jealousy30", state.jealousy >= 30],
  ];
  const found = checks.find(([id, ok]) => ok && !flags[id]);
  return found?.[0] ?? null;
}
