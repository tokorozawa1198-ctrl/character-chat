import { galleryImages, moodImages } from "../data/character";

export function nowTime() {
  return new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export function clampAffinity(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function normalizeText(text: string) {
  return text.replace(/\s/g, "");
}

export function pickMoodImage(text: string) {
  const t = normalizeText(text);
  if (/(좋아|보고싶|귀여|칭찬|멋있|설레|가까이)/.test(t)) return moodImages.shy;
  if (/(화나|싫어|짜증|킹받|질투|다른애)/.test(t)) return moodImages.angry;
  if (/(ㅋㅋ|ㅎㅎ|웃|장난|재밌)/.test(t)) return Math.random() > 0.5 ? moodImages.smile : moodImages.smile2;
  if (Math.random() > 0.72) return galleryImages[Math.floor(Math.random() * galleryImages.length)];
  return moodImages.normal;
}

export function wantsImage(text: string) {
  const t = normalizeText(text);
  return /사진|셀카|일러스트|그림|그려|보여|찍어|보내/.test(t);
}

export function getAffinityDelta(text: string) {
  const t = normalizeText(text);
  if (/좋아|보고싶|멋있|잘생|귀엽|사랑|칭찬|고마워/.test(t)) return 5;
  if (/외롭|힘들|우울|싫다|피곤|지쳤/.test(t)) return 3;
  if (/질투|다른애|다른사람|다른봇|남친|여친/.test(t)) return 1;
  if (/싫어|꺼져|별로|노잼|짜증/.test(t)) return -3;
  if (wantsImage(text)) return 1;
  return 2;
}

export function getDirectEventId(text: string, nextAffinity: number, hour = new Date().getHours()) {
  const t = normalizeText(text);
  if (/다른애|다른사람|다른봇|남친|여친/.test(t)) return "jealous";
  if (/좋아|멋있|잘생|귀엽|사랑|칭찬/.test(t) && nextAffinity >= 45) return "shyCompliment";
  if (/외롭|혼자|쓸쓸/.test(t) && nextAffinity >= 60) return "lonelyNight";
  if (hour >= 6 && hour <= 10 && nextAffinity >= 50) return "morningCheck";
  if ((hour >= 22 || hour <= 3) && nextAffinity >= 55) return "lateNight";
  if (nextAffinity >= 75) return "bedTalk";
  return null;
}

export function getRandomEventId(nextAffinity: number, hour = new Date().getHours()) {
  const roll = Math.random() * 100;
  const baseChance = nextAffinity * 0.35;
  if (roll > baseChance) return null;
  if (hour >= 20 && nextAffinity >= 60 && Math.random() < 0.3) return "drunkWalk";
  if (nextAffinity >= 70 && Math.random() < 0.25) return "suddenHug";
  if (nextAffinity >= 50 && Math.random() < 0.3) return "gymSweat";
  if (nextAffinity >= 40 && (hour >= 22 || hour <= 2) && Math.random() < 0.35) return "suddenCall";
  if (nextAffinity >= 30 && Math.random() < 0.4) return "suddenRain";
  return null;
}

export function getScenarioEventId(nextAffinity: number, seenIds: string[], hour = new Date().getHours()) {
  if (nextAffinity >= 55 && Math.random() < 0.15 && !seenIds.includes("rainy_step1")) return "rainy_step1";
  if (nextAffinity >= 60 && hour >= 10 && hour <= 18 && Math.random() < 0.2 && !seenIds.includes("gym_step1")) return "gym_step1";
  if (nextAffinity >= 70 && (hour >= 23 || hour <= 3) && Math.random() < 0.25 && !seenIds.includes("late_step1")) return "late_step1";
  return null;
}
