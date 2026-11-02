const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const test = require('node:test');
const ts = require('typescript');
const output = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/_game/letters.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: output });
const { BLACKJON_LETTERS, isLetterEarned, letterChapterLabel, letterUnlockLabel } = output;

test('Blackjon has 14 distinct letters without legacy save IDs or future-episode spoilers', () => {
  assert.equal(BLACKJON_LETTERS.length, 14);
  assert.equal(new Set(BLACKJON_LETTERS.map(l => l.id)).size, 14);
  for (const letter of BLACKJON_LETTERS) {
    assert.match(letter.id, /^blackjon_letter_/);
    assert.equal(letter.sender, '흑존');
    assert.ok(letter.chapter <= 24);
    assert.ok(letter.content.length > 200);
    assert.equal(isLetterEarned(letter, {}), false);
    assert.equal(isLetterEarned(letter, { [letter.milestoneEvent]: false }), false);
    assert.equal(isLetterEarned(letter, { [letter.milestoneEvent]: true }), true);
  }
});

test('common letters use precise existing final-scene milestones, not chapter entry', () => {
  const expected = { 1: 'blackjon_prologue_02', 3: 'blackjon_ep3_05', 8: 'blackjon_ep8_10', 9: 'blackjon_ep9_09' };
  for (const letter of BLACKJON_LETTERS.filter(l => !l.blackjonRoute)) {
    assert.equal(letter.milestoneEvent, expected[letter.chapter]);
    assert.match(letterUnlockLabel(letter), /마지막 장면 도달/);
    assert.equal(isLetterEarned(letter, { [`blackjon_ep${letter.chapter}_01`]: true }), false);
  }
});

test('branch letters require own branch completion and retain route/unsent labels', () => {
  for (const letter of BLACKJON_LETTERS.filter(l => l.blackjonRoute)) {
    assert.match(letter.milestoneEvent, new RegExp(`^blackjon_ep${letter.chapter}_${letter.blackjonRoute}_complete$`));
    assert.equal(isLetterEarned(letter, { [letter.milestoneEvent.replace('_complete', '_end')]: true }), false);
    for (const route of ['conspiracy', 'erosion', 'collision'].filter(r => r !== letter.blackjonRoute)) {
      assert.equal(isLetterEarned(letter, { [`blackjon_ep${letter.chapter}_${route}_complete`]: true }), false);
    }
    assert.match(letterChapterLabel(letter), /공모|침식|충돌/);
    assert.match(letterUnlockLabel(letter), /완독/);
    if (letter.blackjonRoute !== 'conspiracy') assert.equal(letter.unsent, true);
    assert.equal(letter.triggerEvent, undefined, 'branch letters must not be styled/labeled as bad endings');
  }
});

test('legacy chapter recognition respects number boundaries and true flags', () => {
  const letter = { id: 'l_1', chapter: 1, title: '', content: '' };
  assert.equal(isLetterEarned(letter, { main_ch10_01: true }), false);
  assert.equal(isLetterEarned(letter, { main_ch1_01: false }), false);
  assert.equal(isLetterEarned(letter, { main_ch1_01: true }), true);
  assert.equal(isLetterEarned({ ...letter, chapter: 6, route: 'pure' }, { obsession_ch6_01: true }), false);
  assert.equal(isLetterEarned({ ...letter, chapter: 6, route: 'pure' }, { pure_ch6_01: true }), true);
  assert.equal(isLetterEarned({ ...letter, chapter: 10, route: 'pure' }, { pure_ch10: true }), true);
});

test('legacy ending letters still require their exact trigger', () => {
  const letter = { id: 'l_bad_01', chapter: 99, title: '', content: '', triggerEvent: 'bad_ending_01' };
  assert.equal(isLetterEarned(letter, { bad_ending_02: true }), false);
  assert.equal(isLetterEarned(letter, { bad_ending_01: true }), true);
  assert.match(letterChapterLabel(letter), /배드엔딩/);
});
