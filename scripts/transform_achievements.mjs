// 업적 description + 마일스톤 title을 천박체로 일괄 변환
import fs from "fs";

const TARGET = "C:/Users/ximen/character-chat/app/page.tsx";
let s = fs.readFileSync(TARGET, "utf8");

// ACHIEVEMENTS 블록만 추출 (라인 마커)
const startMark = "const ACHIEVEMENTS: Achievement[] = [";
const endMark = "// 스토리 맵 시스템";
const startIdx = s.indexOf(startMark);
const endIdx = s.indexOf(endMark, startIdx);
if (startIdx === -1 || endIdx === -1) throw new Error("ACHIEVEMENTS block not found");

const before = s.slice(0, startIdx);
const block = s.slice(startIdx, endIdx);
const after = s.slice(endIdx);

// description 필드의 ~했어요. / ~했어요 → 천박체
// 예시: "호감도가 300을 넘었어요." → "호감도 300 찍었다능ㅋ"
// 일일이 매핑하기보다 어미 변환 + 적절한 추임새 추가
let trans = block.replace(/description:\s*"([^"]+)"/g, (m, desc) => {
  let d = desc;
  // 어미 변환
  d = d.replace(/했어요\./g, "했다능ㅋ");
  d = d.replace(/넘었어요\./g, "찍었다능ㅋ");
  d = d.replace(/모았어요\./g, "모았어효ㅋ");
  d = d.replace(/해금했어요\./g, "해금했다능ㅎ");
  d = d.replace(/시작했어요\./g, "시작했어효!");
  d = d.replace(/들어섰어요\./g, "진입이라능ㄷㄷ");
  d = d.replace(/쌓였어요\./g, "쌓였다능ㅎ");
  d = d.replace(/보냈어요\./g, "보냈다능ㅋ");
  d = d.replace(/주고받았어요\./g, "주고받았다능ㅋㅋ");
  d = d.replace(/했어요/g, "했다능");
  d = d.replace(/넘었어요/g, "찍었다능");
  d = d.replace(/같아요\./g, "같다능ㄷ");
  d = d.replace(/지점\./g, "지점이라능ㄷㄷ");
  d = d.replace(/함께 했어요\./g, "버텼다능ㅗㅜㅑ");
  return `description: "${d}"`;
});

s = before + trans + after;
fs.writeFileSync(TARGET, s, "utf8");
console.log("✓ achievements transformed");
