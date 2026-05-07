// 결 과용 정리 v2 - 더 공격적
import fs from "fs";

const FILES = [
  "C:/Users/ximen/character-chat/app/gameData.ts",
  "C:/Users/ximen/character-chat/app/page.tsx",
];

function transform(src) {
  let s = src;
  const stats = {};
  const bump = (key) => stats[key] = (stats[key] || 0) + 1;

  // === v2 추가 패턴 ===

  // 1. "한 결을" → "한 마디를" (대사/말 맥락) 또는 "한 가지를"
  s = s.replace(/한 결을/g, () => { bump("한_결을"); return "한 마디를"; });

  // 2. "한 결로" → "한 톤" 또는 그냥 제거
  s = s.replace(/한 결로/g, () => { bump("한_결로"); return "한 톤으로"; });

  // 3. "작은 결의" → "작은" (여기서 결의 제거)
  s = s.replace(/작은 결의 /g, () => { bump("작은_결의"); return "작은 "; });

  // 4. "작은 결이" → "작은 게"
  s = s.replace(/작은 결이/g, () => { bump("작은_결이"); return "작은 게"; });

  // 5. "작은 결" 단독 → "작은 부분"
  s = s.replace(/작은 결(?![가-힣의로이])/g, () => { bump("작은_결"); return "작은 부분"; });

  // 6. "[adj] 결로" → "[adj] 톤으로" 혹은 그냥 [adj]게
  //    예: "단정한 결로" → "단정하게"
  s = s.replace(/(\S+)한 결로/g, (m, p1) => { bump("X한_결로"); return `${p1}하게`; });

  // 7. "결로" 단독 (앞에 한 X) — "차분한 결로" → "차분하게" 같은 케이스 한번 더
  //    이미 위에서 처리했지만 혹시 모를 패턴 보강
  s = s.replace(/(\S{2,})의 결로/g, (m, p1) => { bump("X의_결로"); return `${p1} 톤으로`; });

  // 8. "결이 자리잡았다" → "자리잡았다"
  s = s.replace(/결이 자리잡/g, () => { bump("결이_자리잡"); return "자리잡"; });

  // 9. "결로 자리잡" → "로 자리잡"
  s = s.replace(/결로 자리잡/g, () => { bump("결로_자리잡"); return "로 자리잡"; });

  // 10. " 결의 " (앞에 단어 + 공백) — 광범위 처리
  //     "다른 결의" "또 한 결의" 등
  s = s.replace(/(다른|또 한|그 한|어떤|또|그) 결의 /g, (m, p1) => { bump("앞_결의"); return `${p1} `; });

  // 11. "결의 모양" / "결의 자리" 같은 추상 표현 → 그냥 단어
  s = s.replace(/결의 (모양|자리|결|결심|마디|풍경|순간)/g, (m, p1) => { bump("결의_명사"); return p1; });

  // 12. " 결이 " (앞에 단어) — 차오른 결이 등
  //     "한 결의 만족이" 같은 건 이미 v1에서 잡혔지만 "차가운 결이" 등 잔여
  s = s.replace(/(차가운|뜨거운|부드러운|단단한|작은|큰|새로운) 결이/g, (m, p1) => { bump("X_결이"); return `${p1} 게`; });

  // 13. "[adj] 결이" → "[adj] 게" (광범위)
  s = s.replace(/(\S+)한 결이 /g, (m, p1) => { bump("X한_결이"); return `${p1}한 게 `; });

  // 14. "[adj] 결이었다" / "한 결이었다" 잔여
  s = s.replace(/(\S+) 결이었다/g, (m, p1) => { bump("X_결이었다"); return `${p1}였다`; });

  // 15. "[adj] 결로" 잔여 (한이 안 붙은 것)
  s = s.replace(/(\S+한) 결로/g, (m, p1) => { bump("X한_결로_2"); return `${p1}게`; });

  // 16. " 결을 풀어놓" 여러 변형 — "한 결을 풀어놓"은 이미 처리. 잔여는 그대로 둬
  //     ("결을 풀어놓다"는 자연스러운 한국어로 살아있게 유지)
  //     보존: 결심을 풀어놓다, 마음을 풀어놓다 등

  // 17. " 결이 " (단순) — 마지막 안전망
  //     "차오른 결이 자리잡았다" 같은 잔여
  //     단, "마음의 결이" "같은 결이" 같은 자연 표현은 보호하고 싶음
  //     따라서 이건 안 건드림

  // 18. 이중 공백 정리
  s = s.split("\n").map(line => {
    const leading = line.match(/^\s*/)[0];
    const rest = line.slice(leading.length).replace(/  +/g, " ").replace(/\s+$/, "");
    return leading + rest;
  }).join("\n");

  return { result: s, stats };
}

const totalStats = {};
for (const f of FILES) {
  const before = fs.readFileSync(f, "utf8");
  const { result, stats } = transform(before);
  fs.writeFileSync(f, result, "utf8");
  console.log(`\n=== ${f} ===`);
  console.log(`크기: ${before.length} → ${result.length} (${result.length - before.length})`);
  for (const [k, v] of Object.entries(stats)) {
    console.log(`  ${k}: ${v}`);
    totalStats[k] = (totalStats[k] || 0) + v;
  }
}

console.log(`\n=== 총합 ===`);
let total = 0;
for (const [k, v] of Object.entries(totalStats)) {
  console.log(`  ${k}: ${v}`);
  total += v;
}
console.log(`  TOTAL: ${total} 변환`);
