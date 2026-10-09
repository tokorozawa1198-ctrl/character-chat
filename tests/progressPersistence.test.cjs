const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const test = require('node:test');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync('app/_game/progressPersistence.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exportsObject = {};
vm.runInNewContext(code, { exports: exportsObject });
const { readProgress, writeProgress, advanceProgress, progressKey } = exportsObject;
const plain = (v) => JSON.parse(JSON.stringify(v));
function storage() { const data = new Map(); return { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k) }; }

test('newly earned EXP survives a legacy tab replacing the entire save with level 1', () => {
  const store = storage(); const key = 'blackjon';
  const earned = advanceProgress({ userLevel: 3, userExp: 190 }, 25);
  writeProgress(store, key, earned);
  store.setItem(key, JSON.stringify({ userLevel: 1, userExp: 0 }));
  assert.deepEqual(plain(readProgress(store, key, JSON.parse(store.getItem(key)))), { userLevel: 4, userExp: 15 });
  assert.deepEqual(plain(writeProgress(store, key, { userLevel: 3, userExp: 195 })), { userLevel: 4, userExp: 15 });
});
test('EXP within a level is preserved and character checkpoints stay separate', () => {
  const store = storage();
  writeProgress(store, 'main', { userLevel: 30, userExp: 25 });
  writeProgress(store, 'hidden', { userLevel: 2, userExp: 80 });
  assert.deepEqual(plain(readProgress(store, 'hidden', { userLevel: 2, userExp: 5 })), { userLevel: 2, userExp: 80 });
  assert.deepEqual(plain(readProgress(store, 'blackjon', null)), { userLevel: 1, userExp: 0 });
});
test('explicit reset or slot restore can replace the checkpoint', () => {
  const store = storage(); writeProgress(store, 'main', { userLevel: 30, userExp: 25 });
  store.removeItem(progressKey('main'));
  assert.deepEqual(plain(readProgress(store, 'main', { userLevel: 3, userExp: 10 })), { userLevel: 3, userExp: 10 });
});
test('malformed backup falls back to the full save; a checkpoint restores a missing full save', () => {
  const store = storage(); store.setItem(progressKey('main'), '{bad');
  assert.deepEqual(plain(readProgress(store, 'main', { userLevel: 8, userExp: 90 })), { userLevel: 8, userExp: 90 });
  writeProgress(store, 'main', { userLevel: 8, userExp: 90 });
  assert.deepEqual(plain(readProgress(store, 'main', null)), { userLevel: 8, userExp: 90 });
});
