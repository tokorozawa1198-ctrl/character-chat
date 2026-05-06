// 코드에서 참조하는 이미지 경로 vs public/ 실제 파일 비교
import fs from "fs";
import path from "path";

const ROOT = "C:/Users/ximen/character-chat";
const PUBLIC = path.join(ROOT, "public");
const SRC_FILES = ["app/page.tsx", "app/gameData.ts", "app/gameTypes.ts"];

// 1. 코드에서 참조하는 모든 /이미지.png 추출
const referenced = new Set();
for (const f of SRC_FILES) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  const src = fs.readFileSync(p, "utf8");
  const matches = src.matchAll(/["'`](\/[a-zA-Z0-9_\-./]+\.(png|jpg|jpeg|gif|webp|mp3))["'`]/g);
  for (const m of matches) referenced.add(m[1]);
}

// 2. public/ 실제 파일 (재귀)
function walk(dir, prefix = "") {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      out.push(...walk(path.join(dir, ent.name), prefix + "/" + ent.name));
    } else if (/\.(png|jpg|jpeg|gif|webp|mp3)$/i.test(ent.name)) {
      out.push(prefix + "/" + ent.name);
    }
  }
  return out;
}
const actual = new Set(walk(PUBLIC));

// 3. 비교
const missing = [...referenced].filter((r) => !actual.has(r)).sort();
const orphan = [...actual].filter((a) => !referenced.has(a)).sort();
const matched = [...referenced].filter((r) => actual.has(r));

console.log(`\n=== 코드 참조: ${referenced.size}개 / 실제 파일: ${actual.size}개 / 매칭: ${matched.length}개 ===\n`);

console.log(`### 🔴 누락 (코드는 참조하는데 파일 없음): ${missing.length}개`);
for (const m of missing) console.log("  " + m);

console.log(`\n### 🟡 고아 (파일은 있는데 코드가 안 씀): ${orphan.length}개`);
for (const o of orphan) console.log("  " + o);

// 카테고리별 누락 요약
const categorize = (paths) => {
  const cats = {};
  for (const p of paths) {
    const name = p.split("/").pop();
    let cat = "기타";
    if (/^bg_/.test(name)) cat = "배경";
    else if (/^cover_/.test(name)) cat = "커버";
    else if (/^main_ch/.test(name)) cat = "메인 시나리오";
    else if (/^pure_ch/.test(name)) cat = "순애 루트";
    else if (/^obsession_ch/.test(name)) cat = "집착 루트";
    else if (/^confine_a/.test(name)) cat = "감금A 루트";
    else if (/^confine_b/.test(name)) cat = "감금B 루트";
    else if (/^forced_/.test(name)) cat = "강제 루트";
    else if (/_ending\.png/.test(name)) cat = "엔딩 일러";
    else if (/^bladder/.test(name)) cat = "방광 루트";
    else if (/^action_/.test(name)) cat = "액션 이벤트";
    else if (/^outfit_/.test(name)) cat = "의상";
    else if (/^loc_/.test(name)) cat = "맵 장소";
    else if (/^oppa/.test(name)) cat = "오빠 포트레이트";
    else if (/^sd_/.test(name)) cat = "SD 캐릭터";
    else if (/^pet_/.test(name)) cat = "펫";
    else if (/^card_/.test(name)) cat = "트레이딩 카드";
    else if (/^bgm_|^sfx_/.test(name)) cat = "음향";
    cats[cat] = (cats[cat] ?? 0) + 1;
  }
  return cats;
};

console.log(`\n### 🔴 누락 카테고리별 요약`);
const missingCats = categorize(missing);
for (const [k, v] of Object.entries(missingCats).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}개`);

console.log(`\n### 🟡 고아 카테고리별 요약`);
const orphanCats = categorize(orphan);
for (const [k, v] of Object.entries(orphanCats).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}개`);
