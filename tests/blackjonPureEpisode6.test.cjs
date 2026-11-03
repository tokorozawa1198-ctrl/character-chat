const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');

function load(file) {
  const exports = {};
  const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  vm.runInNewContext(outputText, { exports }, { filename: file });
  return exports;
}

const {
  blackjonPureEpisode6: scenes, blackjonPureEpisode6Results: results,
  BLACKJON_PURE_EP6_ENTRY: entry, BLACKJON_PURE_EP6_END: end,
} = load('app/blackjonPureEpisode6.ts');
const { getBlackjonBranchLockReason: lock } = load('app/blackjonRoute.ts');

test('pure episode 6: all choices and saved responses lead to its own ending without main-route effects', () => {
  const visited = new Set(), responseIds = new Set();
  function walk(id, path = new Set()) {
    assert(!path.has(id), `cycle at ${id}`);
    const scene = scenes[id];
    assert(scene, `missing scene ${id}`);
    visited.add(id);
    assert.equal(scene.category, 'side');
    assert.equal(scene.kind, 'normal');
    assert.equal(scene.storyRoute, undefined);
    assert(scene.choices.length > 0);
    for (const choice of scene.choices) {
      for (const field of ['route', 'blackjonRoute', 'stat', 'forceImage']) assert.equal(choice[field], undefined);
      if (choice.result) {
        const resultId = `${id}__r__${choice.label.replace(/\s+/g, '_').slice(0, 24)}`;
        responseIds.add(resultId);
        const response = results[resultId];
        assert(response, 'chosen response must survive a reload');
        assert.equal(response.category, 'side');
        assert.equal(response.text, choice.result);
        assert.equal(response.choices[0].next, choice.next);
        assert.equal(response.background, scene.background);
      }
      if (choice.end) assert.equal(id, end);
      else walk(choice.next, new Set([...path, id]));
    }
  }
  walk(entry);
  assert.equal(visited.size, 17);
  assert.equal(visited.size, Object.keys(scenes).length);
  assert.equal(responseIds.size, 10);
  assert.equal(responseIds.size, Object.keys(results).length);
});

test('pure episode 6: only episode 5 completion unlocks entry, middle, results and end', () => {
  for (const id of [...Object.keys(scenes), ...Object.keys(results)]) {
    for (const events of [{}, { blackjon_pure_ep5_end: true }, { blackjon_pure_ep4_complete: true },
      { blackjon_pure_ep6_complete: true }, { blackjon_ep24_collision_complete: true }]) {
      assert.equal(lock(id, events), '순애 외전 5화 완독 필요');
    }
    for (const route of ['conspiracy', 'erosion', 'collision']) {
      assert.equal(lock(id, { blackjon_pure_ep5_complete: true, [`blackjon_route_${route}`]: true }), null);
    }
  }
});

test('pure episode 6: six real CGs; touch CGs appear only after the reciprocal choice scenes', () => {
  const page = fs.readFileSync('app/page.tsx', 'utf8');
  const assets = new Set(Object.values(scenes).flatMap(s => Array.from(s.imagePool)));
  assert.equal(assets.size, 6);
  for (const asset of assets) {
    const bytes = fs.readFileSync(`public${asset}`);
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert(bytes.length > 100000);
    assert(page.includes(asset.slice(1, -4) + ':'));
  }
  assert(!scenes.blackjon_pure_ep6_10.background.endsWith('_lean.png'));
  assert(scenes.blackjon_pure_ep6_11.background.endsWith('_lean.png'));
  assert(!scenes.blackjon_pure_ep6_13.background.endsWith('_kiss.png'));
  assert(scenes.blackjon_pure_ep6_14.background.endsWith('_kiss.png'));
});
