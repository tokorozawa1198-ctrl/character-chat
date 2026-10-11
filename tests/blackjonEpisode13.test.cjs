const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const test = require('node:test');
const ts = require('typescript');

const cache = new Map();
function loadTs(filename) {
  const file = path.resolve(filename);
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(code, {
    exports,
    require: relative => loadTs(path.resolve(path.dirname(file), `${relative}.ts`)),
  }, { filename: file });
  return exports;
}
const { blackjonEpisodes } = loadTs('app/blackjonEpisodes.ts');
const { BLACKJON_ROUTE_IDS, getBlackjonBranchLockReason, selectBlackjonRoute } = loadTs('app/blackjonRoute.ts');

// Exercise the actual page handler without mounting the unrelated game systems.
const pageSource = fs.readFileSync('app/page.tsx', 'utf8');
const pageAst = ts.createSourceFile('page.tsx', pageSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let chooseScenarioSource;
function visit(node) {
  if (ts.isFunctionDeclaration(node) && node.name?.text === 'chooseScenario') chooseScenarioSource = node.getText(pageAst);
  ts.forEachChild(node, visit);
}
visit(pageAst);
assert.ok(chooseScenarioSource, 'page choice handler must exist');
const chooseScenarioCode = ts.transpileModule(chooseScenarioSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2020 },
}).outputText;

for (const route of BLACKJON_ROUTE_IDS) {
  const prefix = `blackjon_ep13_${route}_`;
  const entry = `${prefix}01`;
  const ending = `${prefix}end`;
  const completion = `blackjon_ep13_${route}_complete`;

  test(`${route}: eight registered scenes, all choices reach only this route's ending`, () => {
    const scenes = Object.values(blackjonEpisodes).filter(scene => scene.id.startsWith(prefix));
    assert.equal(scenes.length, 8);
    const visited = new Set();
    function walk(id, ancestors = new Set()) {
      assert.ok(!ancestors.has(id), `cycle at ${id}`);
      const scene = blackjonEpisodes[id];
      assert.ok(scene, `missing ${id}`);
      assert.equal(scene.id, id);
      assert.ok(scene.choices.length > 0);
      visited.add(id);
      const nextAncestors = new Set([...ancestors, id]);
      for (const choice of scene.choices) {
        assert.equal(choice.blackjonRoute, undefined);
        assert.equal(choice.route, undefined);
        assert.ok(choice.stat && Object.values(choice.stat).every(Number.isFinite));
        if (choice.end) {
          assert.equal(id, ending);
          assert.equal(choice.next, undefined);
        } else {
          assert.ok(choice.next?.startsWith(prefix), `cross-route or missing next at ${id}`);
          walk(choice.next, nextAncestors);
        }
      }
      for (const asset of [...(scene.imagePool || []), scene.background].filter(Boolean)) {
        assert.ok(fs.existsSync(path.join('public', asset)), `missing ${asset}`);
      }
    }
    walk(entry);
    assert.equal(visited.size, scenes.length);
  });

  test(`${route}: entry, middle, and ending require current route plus episode 12 completion`, () => {
    const selected = selectBlackjonRoute({}, route);
    const completed = { ...selected, [`blackjon_ep12_${route}_complete`]: true };
    for (const id of [entry, `${prefix}04`, ending]) {
      assert.match(getBlackjonBranchLockReason(id, {}), /12화/);
      assert.match(getBlackjonBranchLockReason(id, { ...selected, [`blackjon_ep12_${route}_end`]: true }), /완독/);
      assert.equal(getBlackjonBranchLockReason(id, completed), null);
      const other = BLACKJON_ROUTE_IDS.find(value => value !== route);
      const switched = selectBlackjonRoute(completed, other);
      assert.match(getBlackjonBranchLockReason(id, switched), /10화에서/);
      assert.equal(switched[`blackjon_ep12_${route}_complete`], true);
      assert.equal(getBlackjonBranchLockReason(id, selectBlackjonRoute(switched, route)), null);
    }
  });

  test(`${route}: dedicated CGs follow night, morning, and first-day scene timing`, () => {
    const expected = {
      '01': 'night', '02': 'night', '03': 'night', '04': 'night', '05': 'night',
      '06': 'morning', '07': 'training', end: 'training',
    };
    for (const [suffix, part] of Object.entries(expected)) {
      const scene = blackjonEpisodes[`${prefix}${suffix}`];
      const asset = `/blackjon_ep13_${route}_${part}.png`;
      assert.deepEqual(Array.from(scene.imagePool), [asset]);
      assert.equal(scene.background, asset);
      assert.ok(fs.existsSync(path.join('public', asset)), `missing ${asset}`);
      assert.ok(pageSource.includes(`blackjon_ep13_${route}_${part}:`), `missing gallery name for ${asset}`);
    }
  });

  test(`${route}: final choice records completion, clears resume, skips main-character endings`, () => {
    for (const replay of [false, true]) {
      const unlocked = [];
      let progress = { id: ending, lineIndex: 3 };
      let currentId = ending;
      const noop = () => {};
      const context = {
        currentScenario: blackjonEpisodes[ending], scenarioReplayRef: { current: replay },
        stats: {}, perkBonus: { affinityPassive: 0 }, applyStats: () => ({}),
        setStats: noop, showStatDelta: noop, setMemoryNotes: noop, setMessages: noop,
        setAfterScenarioCues: noop, chapterEndTransition: () => null,
        setScenarioProgress: fn => { progress = fn(progress); },
        setCurrentScenarioId: id => { currentId = id; }, showChapterTransition: noop,
        BLACKJON_ROUTE_IDS, unlockEvent: id => unlocked.push(id),
        endingData: { forbidden: { condition: () => { assert.fail('must not check main-character endings'); } } },
        scenarioData: blackjonEpisodes,
      };
      vm.createContext(context);
      vm.runInContext(chooseScenarioCode, context);
      context.chooseScenario(blackjonEpisodes[ending].choices[0]);
      assert.deepEqual(unlocked, [completion]);
      assert.equal(progress, null);
      assert.equal(currentId, null);
      const started = [];
      context.currentScenario = blackjonEpisodes[entry];
      context.startScenario = id => started.push(id);
      unlocked.length = 0;
      context.chooseScenario(blackjonEpisodes[entry].choices[0]);
      assert.deepEqual(unlocked, [], 'entering a scene must not complete the episode');
      assert.deepEqual(started, [`${prefix}02`]);
    }
  });
}

test('episode 11/12 gates are preserved; common episodes remain ungated', () => {
  for (const route of BLACKJON_ROUTE_IDS) {
    for (const episode of [11, 12]) {
      const id = `blackjon_ep${episode}_${route}_01`;
      assert.ok(getBlackjonBranchLockReason(id, selectBlackjonRoute({}, route)));
      assert.equal(getBlackjonBranchLockReason(id, selectBlackjonRoute({
        [`blackjon_ep${episode - 1}_${route}_complete`]: true,
      }, route)), null);
    }
  }
  assert.equal(getBlackjonBranchLockReason('blackjon_ep10_01', {}), null);
});
