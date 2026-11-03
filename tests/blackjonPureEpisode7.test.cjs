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
  blackjonPureEpisode7: scenes, blackjonPureEpisode7Results: results,
  BLACKJON_PURE_EP7_ENTRY: entry, BLACKJON_PURE_EP7_END: end,
  BLACKJON_PURE_EP7_COMPLETE: complete,
} = load('app/blackjonPureEpisode7.ts');
const { getBlackjonBranchLockReason: lock } = load('app/blackjonRoute.ts');

test('pure episode 7: every branch and reloadable response converges without main-route effects', () => {
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
      for (const field of ['route', 'blackjonRoute', 'stat', 'forceImage', 'min']) assert.equal(choice[field], undefined);
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
      if (choice.end) {
        assert.equal(id, end);
        assert.equal(choice.next, undefined);
      } else walk(choice.next, new Set([...path, id]));
    }
  }
  walk(entry);
  assert.equal(visited.size, 20);
  assert.equal(visited.size, Object.keys(scenes).length);
  assert.equal(responseIds.size, 10);
  assert.equal(responseIds.size, Object.keys(results).length);
});

test('pure episode 7: only episode 6 completion unlocks every scene and saved response', () => {
  for (const id of [...Object.keys(scenes), ...Object.keys(results)]) {
    for (const events of [{}, { blackjon_pure_ep6_end: true }, { blackjon_pure_ep5_complete: true },
      { [complete]: true }, { blackjon_ep24_collision_complete: true }]) {
      assert.equal(lock(id, events), '순애 외전 6화 완독 필요');
    }
    for (const route of ['conspiracy', 'erosion', 'collision']) {
      assert.equal(lock(id, { blackjon_pure_ep6_complete: true, [`blackjon_route_${route}`]: true }), null);
    }
  }
});

test('pure episode 7: all seven real CGs have gallery labels and the confession CG is final-only', () => {
  const page = fs.readFileSync('app/page.tsx', 'utf8');
  const assets = new Set(Object.values(scenes).flatMap(s => Array.from(s.imagePool)));
  assert.equal(assets.size, 7);
  for (const asset of assets) {
    const bytes = fs.readFileSync(`public${asset}`);
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert(bytes.length > 100000);
    assert(page.includes(asset.slice(1, -4) + ':'));
  }
  for (const [id, scene] of Object.entries(scenes)) {
    assert.equal(scene.background.endsWith('_confession.png'), id === end);
  }
});

test('pure episode 7: first confession cuts on the exact reply without post-confession resolution', () => {
  const final = scenes[end];
  assert.match(final.text, /흑존: 나는 형이 이리 좋은데\./);
  assert.match(final.text, /그게… 지금 이렇게 말하려던 건 아니고\./);
  assert.equal(final.text.trim().split('\n').at(-1), '히든: 네 알고있어요');
  assert.equal(final.choices.length, 1);
  assert.equal(final.choices[0].label, '7화를 마친다');
  assert.equal(final.choices[0].result, undefined);
  const page = fs.readFileSync('app/page.tsx', 'utf8');
  assert(page.includes(`if (currentScenario.id === "${end}" && choice.end) unlockEvent("${complete}");`));
  const library = fs.readFileSync('app/_game/ui/BlackjonPureStory.tsx', 'utf8');
  assert(library.includes('disabled={!completed6} onClick={() => onStart(BLACKJON_PURE_EP7_ENTRY)}'));
});

test('pure episode 7: meetup dialogue uses supported speaker markers and keeps member names visible', () => {
  const supported = new Set(['흑존', '히든', '기타', '나레이션', '메시지']);
  const texts = [...Object.values(scenes), ...Object.values(results)].map(s => s.text);
  for (const text of texts) {
    for (const line of text.split('\n')) {
      const match = line.match(/^([^:]+): /);
      if (match) assert(supported.has(match[1]), `unsupported speaker: ${match[1]}`);
    }
  }
  for (const name of ['쮋', '근바섭', '아로벤', '타조']) {
    assert(texts.some(text => text.includes(`기타: ${name}: `)), `missing named dialogue: ${name}`);
  }
});
