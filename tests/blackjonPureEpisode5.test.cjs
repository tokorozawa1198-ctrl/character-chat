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
  blackjonPureEpisode5: scenes, blackjonPureEpisode5Results: results,
  BLACKJON_PURE_EP5_ENTRY: entry, BLACKJON_PURE_EP5_END: end,
  BLACKJON_PURE_EP5_COMPLETE: completion,
} = load('app/blackjonPureEpisode5.ts');
const { getBlackjonBranchLockReason: lock } = load('app/blackjonRoute.ts');
const page = fs.readFileSync('app/page.tsx', 'utf8');

test('pure episode 5: every choice reaches its own ending with stable resumable responses', () => {
  const visited = new Set();
  function walk(id, path = new Set()) {
    assert(!path.has(id), `cycle at ${id}`);
    const scene = scenes[id];
    assert(scene, `missing ${id}`);
    visited.add(id);
    assert.equal(scene.category, 'side');
    assert.equal(scene.kind, 'normal');
    assert.equal(scene.storyRoute, undefined);
    assert(scene.choices.length > 0);
    for (const choice of scene.choices) {
      for (const field of ['route', 'blackjonRoute', 'stat', 'forceImage']) {
        assert.equal(choice[field], undefined, `${id}: unexpected main-state effect`);
      }
      if (choice.result) {
        const resultId = `${id}__r__${choice.label.replace(/\s+/g, '_').slice(0, 24)}`;
        const response = results[resultId];
        assert(response, 'response must survive a full reload');
        assert.equal(response.text, choice.result);
        assert.equal(response.choices[0].next, choice.next);
        assert.equal(response.background, scene.background);
      }
      if (choice.end) assert.equal(id, end);
      else walk(choice.next, new Set([...path, id]));
    }
  }
  walk(entry);
  assert.equal(visited.size, Object.keys(scenes).length);
  assert.equal(visited.size, 16);
  assert.equal(Object.keys(results).length, 8);
});

test('pure episode 5: prior completion gates entry, saved responses, middle and ending', () => {
  for (const id of [...Object.keys(scenes), ...Object.keys(results)]) {
    for (const events of [
      {}, { blackjon_pure_ep4_end: true }, { blackjon_pure_ep3_complete: true },
      { blackjon_pure_ep5_complete: true }, { blackjon_ep24_collision_complete: true },
    ]) assert.equal(lock(id, events), '순애 외전 4화 완독 필요');
    for (const route of ['conspiracy', 'erosion', 'collision']) {
      assert.equal(lock(id, { blackjon_pure_ep4_complete: true, [`blackjon_route_${route}`]: true }), null);
    }
  }
});

test('pure episode 5: all referenced CGs are real images with gallery labels', () => {
  const assets = new Set(Object.values(scenes).flatMap(s => Array.from(s.imagePool)));
  assert.equal(assets.size, 6);
  for (const asset of assets) {
    const bytes = fs.readFileSync(`public${asset}`);
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert(bytes.length > 100000);
    assert(page.includes(asset.slice(1, -4) + ':'));
  }
  assert(scenes.blackjon_pure_ep5_09.background.endsWith('_sunset.png'));
  assert(scenes.blackjon_pure_ep5_10.background.endsWith('_walk.png'));
});

test('pure episode 5: runtime completion only at the end, clears saved response, preserves main state', () => {
  const ast = ts.createSourceFile('page.tsx', page, 99, true, ts.ScriptKind.TSX);
  let handler;
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'chooseScenario') handler = node.getText(ast);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  const js = ts.transpileModule(handler, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText;
  for (const replay of [false, true]) {
    const unlocked = [], started = [];
    let progress = { id: Object.keys(results)[0], lineIndex: 2 }, currentId = end, view = 'chat';
    const forbidden = () => assert.fail('main state changed');
    const context = {
      currentScenario: scenes[entry], scenarioReplayRef: { current: replay },
      stats: { affinity: 118 }, perkBonus: { affinityPassive: 1 },
      applyStats: forbidden, setStats: forbidden, showStatDelta: forbidden,
      enterRoute: forbidden, setSeenEvents: forbidden, setMemoryNotes: forbidden,
      setMessages: forbidden, setAfterScenarioCues: forbidden, chapterEndTransition: () => null,
      setScenarioProgress: fn => { progress = fn(progress); },
      setCurrentScenarioId: id => { currentId = id; }, setView: value => { view = value; },
      unlockEvent: id => unlocked.push(id), startScenario: id => started.push(id),
      scenarioData: { ...scenes, ...results }, endingData: { forbidden: { condition: forbidden } },
      setBlackjonSeasonFinale: forbidden, showChapterTransition: forbidden,
    };
    vm.createContext(context);
    vm.runInContext(js, context);
    context.chooseScenario(scenes[entry].choices[0]);
    assert.deepEqual(unlocked, []);
    context.currentScenario = scenes.blackjon_pure_ep5_02;
    context.chooseScenario(context.currentScenario.choices[0]);
    assert.match(started.at(-1), /^blackjon_pure_ep5_02__r__/);
    context.currentScenario = context.scenarioData[started.at(-1)];
    context.chooseScenario(context.currentScenario.choices[0]);
    assert.equal(started.at(-1), 'blackjon_pure_ep5_03');
    assert.deepEqual(unlocked, []);
    context.currentScenario = scenes[end];
    context.chooseScenario(context.currentScenario.choices[0]);
    assert.deepEqual(unlocked, [completion]);
    assert.equal(progress, null);
    assert.equal(currentId, null);
    assert.equal(view, 'scenarioMenu');
  }
});
