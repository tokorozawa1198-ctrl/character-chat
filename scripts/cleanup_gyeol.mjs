// "결" 과용 정리 + em dash 정리
// gameData.ts와 page.tsx에 적용
import fs from "fs";

const FILES = [
  "C:/Users/ximen/character-chat/app/gameData.ts",
  "C:/Users/ximen/character-chat/app/page.tsx",
];

function transform(src) {
  let s = src;
  let stats = { emDash: 0, gyeolEui: 0, gyeolSsik: 0, gyeolDo: 0, gyeolIradeo: 0, gyeolMan: 0, gyeolI: 0, gyeolIeotda: 0 };

  // 1. em dash " — " → " " (single space)
  s = s.replace(/ — /g, (m) => { stats.emDash++; return " "; });
  // em dash 단독 (앞뒤 공백 없거나 한쪽만) → 공백
  s = s.replace(/—/g, " ");

  // 2. "[X]한 결의 [Y]" → "[X]한 [Y]" (X는 1+ chars, 한 앞에)
  //    예: "단정한 결의 시선" → "단정한 시선"
  s = s.replace(/(\S+)한 결의 /g, (m, p1) => { stats.gyeolEui++; return `${p1}한 `; });

  // 3. 단독 "한 결의 X" → "X" (위에서 안 잡힌 케이스)
  s = s.replace(/한 결의 /g, () => { stats.gyeolEui++; return ""; });

  // 4. "한 결씩" → "천천히"
  s = s.replace(/한 결씩/g, () => { stats.gyeolSsik++; return "천천히"; });

  // 5. "한 결도" → "조금도"
  s = s.replace(/한 결도/g, () => { stats.gyeolDo++; return "조금도"; });

  // 6. "한 결이라도" → "조금이라도"
  s = s.replace(/한 결이라도/g, () => { stats.gyeolIradeo++; return "조금이라도"; });

  // 7. "한 결만" → "한 번만"
  s = s.replace(/한 결만/g, () => { stats.gyeolMan++; return "한 번만"; });

  // 8. "한 결이 " → "한 가지가 "
  s = s.replace(/한 결이 /g, () => { stats.gyeolI++; return "한 가지가 "; });

  // 9. "[adj]한 결이었다" → "[adj]했다"
  //    예: "단정한 결이었다" → "단정했다", "환한 결이었다" → "환했다"
  s = s.replace(/(\S+)한 결이었다/g, (m, p1) => { stats.gyeolIeotda++; return `${p1}했다`; });
  s = s.replace(/한 결이었다/g, () => { stats.gyeolIeotda++; return "것이었다"; });

  // 10. 이중 공백 정리 (위 변환 결과 공백 중첩됐을 수 있음)
  // 단, template literal 안의 들여쓰기는 보존하기 위해 행 중간만
  s = s.split("\n").map((line) => {
    // 줄 앞 공백 보존 + 줄 끝 공백 제거 + 줄 중간 다중 공백 → 1개
    const leading = line.match(/^\s*/)[0];
    const rest = line.slice(leading.length).replace(/  +/g, " ").replace(/\s+$/, "");
    return leading + rest;
  }).join("\n");

  return { result: s, stats };
}

let totalStats = { emDash: 0, gyeolEui: 0, gyeolSsik: 0, gyeolDo: 0, gyeolIradeo: 0, gyeolMan: 0, gyeolI: 0, gyeolIeotda: 0 };

for (const f of FILES) {
  const before = fs.readFileSync(f, "utf8");
  const { result, stats } = transform(before);
  fs.writeFileSync(f, result, "utf8");
  console.log(`\n=== ${f} ===`);
  console.log(`크기: ${before.length} → ${result.length} (${result.length - before.length})`);
  console.log(`em dash 정리: ${stats.emDash}`);
  console.log(`결의 정리: ${stats.gyeolEui}`);
  console.log(`한 결씩 → 천천히: ${stats.gyeolSsik}`);
  console.log(`한 결도 → 조금도: ${stats.gyeolDo}`);
  console.log(`한 결이라도 → 조금이라도: ${stats.gyeolIradeo}`);
  console.log(`한 결만 → 한 번만: ${stats.gyeolMan}`);
  console.log(`한 결이 → 한 가지가: ${stats.gyeolI}`);
  console.log(`결이었다 정리: ${stats.gyeolIeotda}`);
  for (const k of Object.keys(stats)) totalStats[k] += stats[k];
}

console.log(`\n=== 총합 ===`);
for (const [k, v] of Object.entries(totalStats)) console.log(`  ${k}: ${v}`);
const grand = Object.values(totalStats).reduce((a, b) => a + b, 0);
console.log(`  TOTAL: ${grand} 변환`);
