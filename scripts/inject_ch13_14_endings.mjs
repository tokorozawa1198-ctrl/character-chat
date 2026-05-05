// 시나리오 ch13 + ch14 + 엔딩 5종 통합 스크립트
import fs from "fs";

const TARGET = "C:/Users/ximen/character-chat/app/gameData.ts";
const SRCS = [
  "C:/Users/ximen/Downloads/gameData_ch13_all.ts",
  "C:/Users/ximen/Downloads/gameData_ch14_all.ts",
  "C:/Users/ximen/Downloads/gameData_endings_all.ts",
];

// route → storyRoute 매핑
const routeToStory = {
  pure: "pure",
  pure_returning: "pure",
  forced: "obsession",
  confine_a: "obsession",
  confine_b: "obsession",
  obsession: "obsession",
  bladder: "obsession",
};

// 엔딩 id → kind 매핑
const endingKinds = {
  pure_ending: "normal",
  pure_returning_ending: "normal",
  forced_ending: "obsession",
  confine_a_ending: "yandere",
  confine_b_ending: "yandere",
};

function transform(src, filename) {
  let s = src;

  // 1. route: "X" → storyRoute: "<mapped>"
  s = s.replace(/route:\s*"([a-z_]+)"/g, (m, route) => {
    const story = routeToStory[route];
    if (!story) {
      console.warn(`  [warn] unknown route "${route}" in ${filename}`);
      return `storyRoute: "obsession"`;
    }
    return `storyRoute: "${story}"`;
  });

  // 2. min: { affinity: 999 } → 9999
  s = s.replace(/affinity:\s*999\b/g, "affinity: 9999");

  // 3. kind: "ending" → 엔딩 id에 따른 kind 매핑 (블록 단위 처리)
  s = s.replace(
    /(\w+_ending):\s*\{\s*\n\s*id:\s*"\w+",\s*\n([\s\S]*?)kind:\s*"ending"/g,
    (m, endingId, between) => {
      const kind = endingKinds[endingId] || "normal";
      return m.replace(/kind:\s*"ending"/, `kind: "${kind}"`);
    }
  );

  // 4. 잔여 kind: "ending" 안전망
  s = s.replace(/kind:\s*"ending"/g, 'kind: "normal"');

  // 5. 헤더 주석 (// === 같은) 제거할 필요 없음 — 그냥 두면 됨

  return s;
}

let combined = "\n// ==========================================\n";
combined += "// 13장 + 14장 + 엔딩 5종 (자동 통합)\n";
combined += "// ==========================================\n\n";

for (const src of SRCS) {
  const raw = fs.readFileSync(src, "utf8");
  const transformed = transform(raw, src);
  combined += `// === from ${src.split(/[\\/]/).pop()} ===\n`;
  combined += transformed;
  combined += "\n";
  console.log(`✓ transformed ${src} (${raw.length} → ${transformed.length} chars)`);
}

// gameData.ts 읽기 및 주입
const target = fs.readFileSync(TARGET, "utf8");
const marker = `      stat: { obsession: 15, trust: 12 }, end: true, next: "confine_b_ch13_01" },\n  },\n};\n`;
const altMarker = `      stat: { obsession: 15, trust: 12 }, end: true, next: "confine_b_ch13_01" },\n  },\n\n};`;

let injected;
if (target.includes(marker)) {
  injected = target.replace(marker, marker.replace(/};\n$/, "") + combined + "\n};\n");
} else if (target.includes(altMarker)) {
  injected = target.replace(altMarker, altMarker.replace(/\n};$/, "") + combined + "\n};");
} else {
  // 안전한 fallback: scenarioData 객체 닫기 직전 주입
  // confine_b_ch12_04 블록 종료 후 scenarioData 닫는 `};` 위치 찾기
  const endIdx = target.indexOf('\nfunction inferScenarioCategory(');
  if (endIdx === -1) throw new Error("inferScenarioCategory marker not found");
  // endIdx 직전의 `};\n\n` 위치
  const lastClose = target.lastIndexOf("};", endIdx);
  if (lastClose === -1) throw new Error("scenarioData close brace not found");
  injected =
    target.slice(0, lastClose) +
    combined +
    "\n" +
    target.slice(lastClose);
  console.log("[fallback] injected before scenarioData close at", lastClose);
}

fs.writeFileSync(TARGET, injected, "utf8");
console.log(`\n✓ wrote ${TARGET} (+${injected.length - target.length} chars)`);
