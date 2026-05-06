// public/ 자동 정리 — 이동 + 리네임만, 삭제 금지
import fs from "fs";
import path from "path";

const PUBLIC = "C:/Users/ximen/character-chat/public";

let moved = 0;
let renamed = 0;
const errors = [];

function safeRename(from, to) {
  if (!fs.existsSync(from)) {
    errors.push(`[skip] ${from} 없음`);
    return false;
  }
  if (fs.existsSync(to)) {
    errors.push(`[skip] ${to} 이미 존재 (중복 회피)`);
    return false;
  }
  fs.renameSync(from, to);
  return true;
}

// 1. "새 폴더" 안의 파일들을 root로 이동
const newFolderPath = path.join(PUBLIC, "새 폴더");
if (fs.existsSync(newFolderPath)) {
  for (const ent of fs.readdirSync(newFolderPath, { withFileTypes: true })) {
    if (ent.isFile()) {
      const from = path.join(newFolderPath, ent.name);
      const to = path.join(PUBLIC, ent.name);
      if (safeRename(from, to)) {
        console.log(`✓ 이동: 새 폴더/${ent.name} → ${ent.name}`);
        moved++;
      }
    }
  }
  // 빈 폴더면 그대로 두거나 사용자가 정리. 자동 삭제 X
  try {
    const remaining = fs.readdirSync(newFolderPath);
    if (remaining.length === 0) {
      console.log(`  (참고) "새 폴더"가 비었음. 수동 삭제 권장.`);
    }
  } catch {}
}

// 2. loc_hiroshima_univ.png.png → loc_hiroshima_univ.png (확장자 중복 제거)
const doubleExt = path.join(PUBLIC, "loc_hiroshima_univ.png.png");
const singleExt = path.join(PUBLIC, "loc_hiroshima_univ.png");
if (safeRename(doubleExt, singleExt)) {
  console.log(`✓ 리네임: loc_hiroshima_univ.png.png → loc_hiroshima_univ.png`);
  renamed++;
}

// 3. "confine_a_ch12_02 .png" (공백 있음) → "confine_a_ch12_02.png"
const withSpace = path.join(PUBLIC, "confine_a_ch12_02 .png");
const noSpace = path.join(PUBLIC, "confine_a_ch12_02.png");
if (safeRename(withSpace, noSpace)) {
  console.log(`✓ 리네임: "confine_a_ch12_02 .png" (공백 있음) → confine_a_ch12_02.png`);
  renamed++;
}

// 4. "loc_ujina..png" (점 두 개) → "loc_ujina.png"
const doubleDot = path.join(PUBLIC, "loc_ujina..png");
const singleDot = path.join(PUBLIC, "loc_ujina.png");
if (fs.existsSync(doubleDot)) {
  if (fs.existsSync(singleDot)) {
    errors.push(`[skip] loc_ujina.png 이미 존재 (둘 다 보존, 사용자 확인 필요)`);
  } else if (safeRename(doubleDot, singleDot)) {
    console.log(`✓ 리네임: loc_ujina..png (점 두 개) → loc_ujina.png`);
    renamed++;
  }
}

// 5. acrtion_dance1.png (오타) → action_dance1.png 가 이미 있으므로 리네임 X
//    (코드에서 acrtion_ 참조 안 함, 그냥 두면 됨 — 사용자가 처분 결정)

console.log(`\n=== 완료: 이동 ${moved}건 / 리네임 ${renamed}건 ===`);
if (errors.length) {
  console.log(`\n⚠️  스킵된 항목:`);
  for (const e of errors) console.log("  " + e);
}
