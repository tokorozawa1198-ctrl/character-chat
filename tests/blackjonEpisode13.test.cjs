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

const chapters = [
  ...BLACKJON_ROUTE_IDS.map(route => ({ episode: 13, route, sceneCount: 8 })),
  { episode: 14, route: 'collision', sceneCount: 12 },
  { episode: 15, route: 'collision', sceneCount: 20 },
  { episode: 16, route: 'collision', sceneCount: 24 },
  { episode: 17, route: 'collision', sceneCount: 22 },
  { episode: 18, route: 'collision', sceneCount: 20 },
  { episode: 19, route: 'collision', sceneCount: 14 },
  { episode: 20, route: 'collision', sceneCount: 20 },
  { episode: 21, route: 'collision', sceneCount: 24 },
];

test('episode 21: layered season-two opening preserves independent achievement and unresolved separation', () => {
  const scene = suffix => blackjonEpisodes[`blackjon_ep21_collision_${suffix}`];
  const scenes = Object.values(blackjonEpisodes).filter(s => s.id.startsWith('blackjon_ep21_collision_'));
  assert.equal(scenes.reduce((count, s) => count + s.choices.length, 0), 27);
  assert.ok(scenes.reduce((count, s) => count + s.text.length, 0) > 10000);
  assert.match(scene('01').subtitle, /시즌 2 시작/);
  assert.match(scene('01').text, /형은 친구와 택시를 타고 떠났다/);
  assert.match(scene('03').text, /내가 아까부터 그 말 했잖아/);
  assert.match(scene('06').text, /아니\. 보고 싶어서/);
  assert.match(scene('11').text, /심판의 신호보다 먼저 내려놓았다/);
  assert.match(scene('13').text, /형은 그 모습을 끝까지 봤다/);
  assert.match(scene('14').text, /학교 동료/);
  assert.match(scene('15').text, /같은 기념 메달/);
  assert.match(scene('16').text, /마지막 거 찍어주기로 했잖아요/);
  assert.match(scene('19').text, /힘 쓸 일을 외주 주는 지능/);
  assert.match(scene('20').text, /금요일 밤 일까지 괜찮아졌다는 뜻은 아니고/);
  assert.match(scene('21').text, /근데 왜 형 안 보이니까 다 하기 싫어졌지/);
  assert.match(scene('22').text, /친구와 저녁을 먹고 따로 귀가했다/);
  assert.match(scene('23').text, /체육관 단체 대화방에 영상/);
  assert.ok(scene('end').text.endsWith('이번에는 일어나기 전에 멈췄다.'));
  assert.ok(pageSource.includes('id: "blackjon_ep21_collision_01", prefix: "blackjon_ep21_collision_", number: 21, prerequisite: "blackjon_ep20_collision_complete"'));
  assert.ok(pageSource.includes('onStartNext={() => startScenario("blackjon_ep21_collision_01")}'));
  const notice = fs.readFileSync('app/_game/ui/BlackjonSeasonFinale.tsx', 'utf8');
  assert.ok(notice.includes('시즌 2 시작 · 21화 읽기'));
  assert.ok(!notice.includes('21화는 아직 공개되지 않았습니다'));
});

test('episode 21: six reference-based CGs follow the meet, reunion, and private replay', () => {
  const sequence = ['warmup','warmup','warmup','warmup',null,null,'audience','warmup','audience','warmup','warmup','warmup','lift','audience','award','award','award','reunion','reunion','reunion','reunion','reunion','replay','replay'];
  const scenes = Object.values(blackjonEpisodes).filter(s => s.id.startsWith('blackjon_ep21_collision_'));
  assert.equal(scenes.length, sequence.length);
  scenes.forEach((scene, index) => {
    const part = sequence[index];
    const asset = part ? `/blackjon_ep21_collision_${part}.png` : '/bg_room_day.png';
    assert.deepEqual(Array.from(scene.imagePool), [asset]);
    assert.equal(scene.background, asset);
    assert.equal(scene.kind, 'obsession');
    if (!part) return;
    assert.ok(pageSource.includes(`blackjon_ep21_collision_${part}:`));
    const bytes = fs.readFileSync(path.join('public', asset));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), 1024);
    assert.equal(bytes.readUInt32BE(20), 1536);
  });
});

test('episode 20: season finale preserves refusal and follows the live call into unwanted company', () => {
  const scene = suffix => blackjonEpisodes[`blackjon_ep20_collision_${suffix}`];
  const scenes = Object.values(blackjonEpisodes).filter(s => s.id.startsWith('blackjon_ep20_collision_'));
  assert.equal(scenes.reduce((count, s) => count + s.choices.length, 0), 23);
  assert.ok(scenes.reduce((count, s) => count + s.text.length, 0) > 8000);
  assert.match(scene('01').text, /통화를 끊지 말/);
  assert.match(scene('18').text, /그럼 헤어진 채로 같이 있으면 되겠네요/);
  assert.match(scene('19').text, /울면 형 마음 아프다면서요/);
  assert.ok(scene('end').text.endsWith('흑존: 저 이제 기다리는 거 안 할래요.'));
  assert.equal(scene('end').choices[0].label, '20화 완독 · 시즌 1부 종료');
  assert.ok(pageSource.includes('id: "blackjon_ep20_collision_01", prefix: "blackjon_ep20_collision_", number: 20, prerequisite: "blackjon_ep19_collision_complete"'));
  assert.ok(pageSource.includes('setBlackjonSeasonFinale(false); setView("scenarioMenu");'));
});

test('episode 20: six new CGs track call, plea, exit, following, street, and final portrait', () => {
  const sequence = ['call', 'call', 'call', ...Array(7).fill('plea'), ...Array(3).fill('door'), ...Array(3).fill('following'), ...Array(3).fill('street'), 'finale'];
  const scenes = Object.values(blackjonEpisodes).filter(s => s.id.startsWith('blackjon_ep20_collision_'));
  scenes.forEach((scene, index) => {
    const part = sequence[index];
    const asset = `/blackjon_ep20_collision_${part}.png`;
    assert.deepEqual(Array.from(scene.imagePool), [asset]);
    assert.equal(scene.background, asset);
    assert.equal(scene.kind, 'obsession');
    assert.ok(pageSource.includes(`blackjon_ep20_collision_${part}:`));
    const bytes = fs.readFileSync(path.join('public', asset));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), 1024);
    assert.equal(bytes.readUInt32BE(20), 1536);
  });
});

test('episode 19: agreed story preserves the refusal, outside contact, and unresolved ending', () => {
  const scene = suffix => blackjonEpisodes[`blackjon_ep19_collision_${suffix}`];
  const scenes = Object.values(blackjonEpisodes).filter(s => s.id.startsWith('blackjon_ep19_collision_'));
  assert.equal(scenes.reduce((count, s) => count + s.choices.length, 0), 17);
  assert.ok(scene('01').text.includes('화요일에는 연락이 없었다. 수요일에도 없었다.'));
  assert.ok(scene('03').text.includes('히든: 십 분.'));
  assert.ok(scene('08').text.includes('내가 여기서 나가겠다는데 네 허락이 왜 필요해?'));
  assert.ok(scene('09').text.includes('메시지를 보냈다.'));
  assert.ok(scene('10').text.includes('그럼 오늘 보내면 안 되겠네요.'));
  assert.ok(scene('12').text.includes('자기가 여기 오기 전부터, 흑존은 저녁을 준비하고 있었다.'));
  assert.ok(scene('13').text.includes('나가려고 했는데 못 나가게 해.'));
  assert.ok(scene('13').text.includes('형은 통화를 끊지 않았다.'));
  assert.ok(scene('end').text.includes('그럼 저 미워하면서 있어요.'));
  assert.ok(scene('end').text.endsWith('흑존: 오늘은.'));
  assert.ok(pageSource.includes('id: "blackjon_ep19_collision_01", prefix: "blackjon_ep19_collision_", number: 19, prerequisite: "blackjon_ep18_collision_complete"'));
});

test('episode 19: four new CGs follow sorting, blocked exit, dinner reveal, and final call', () => {
  const illustrated = {
    '05': 'sorting', '06': 'sorting', '07': 'door', '08': 'door', '09': 'door',
    '10': 'door', '11': 'door', '12': 'dinner', '13': 'today', end: 'today',
  };
  for (const scene of Object.values(blackjonEpisodes).filter(s => s.id.startsWith('blackjon_ep19_collision_'))) {
    const suffix = scene.id.slice('blackjon_ep19_collision_'.length);
    const part = illustrated[suffix];
    const asset = part ? `/blackjon_ep19_collision_${part}.png`
      : ['02', '03'].includes(suffix) ? '/bg_room_day.png' : '/bg_room_night.png';
    assert.deepEqual(Array.from(scene.imagePool), [asset]);
    assert.equal(scene.background, asset);
    assert.equal(scene.kind, 'obsession');
    if (part) {
      assert.ok(pageSource.includes(`blackjon_ep19_collision_${part}:`));
      const bytes = fs.readFileSync(path.join('public', asset));
      assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
      assert.equal(bytes.readUInt32BE(16), 1024);
      assert.equal(bytes.readUInt32BE(20), 1536);
    }
  }
});

for (const { episode, route, sceneCount } of chapters) {
  const prefix = `blackjon_ep${episode}_${route}_`;
  const entry = `${prefix}01`;
  const ending = `${prefix}end`;
  const completion = `blackjon_ep${episode}_${route}_complete`;
  const previous = `blackjon_ep${episode - 1}_${route}`;

  test(`episode ${episode} ${route}: ${sceneCount} registered scenes, all choices reach only this route's ending`, () => {
    const scenes = Object.values(blackjonEpisodes).filter(scene => scene.id.startsWith(prefix));
    assert.equal(scenes.length, sceneCount);
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

  test(`episode ${episode} ${route}: entry, middle, and ending require current route plus previous completion`, () => {
    const selected = selectBlackjonRoute({}, route);
    const completed = { ...selected, [`${previous}_complete`]: true };
    for (const id of [entry, `${prefix}04`, ending]) {
      assert.ok(getBlackjonBranchLockReason(id, {}).includes(`${episode - 1}화`));
      assert.match(getBlackjonBranchLockReason(id, { ...selected, [`${previous}_end`]: true }), /완독/);
      assert.equal(getBlackjonBranchLockReason(id, completed), null);
      const other = BLACKJON_ROUTE_IDS.find(value => value !== route);
      const switched = selectBlackjonRoute(completed, other);
      assert.match(getBlackjonBranchLockReason(id, switched), /10화에서/);
      assert.equal(switched[`${previous}_complete`], true);
      assert.equal(getBlackjonBranchLockReason(id, selectBlackjonRoute(switched, route)), null);
    }
  });

  if (episode === 13) test(`${route}: dedicated CGs follow night, morning, and first-day scene timing`, () => {
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

  test(`episode ${episode} ${route}: final choice records completion, clears resume, skips main-character endings`, () => {
    for (const replay of [false, true]) {
      const unlocked = [];
      let progress = { id: ending, lineIndex: 3 };
      let currentId = ending;
      let finale = false;
      let transitionCount = 0;
      const noop = () => {};
      const context = {
        currentScenario: blackjonEpisodes[ending], scenarioReplayRef: { current: replay },
        stats: {}, perkBonus: { affinityPassive: 0 }, applyStats: () => ({}),
        setStats: noop, showStatDelta: noop, setMemoryNotes: noop, setMessages: noop,
        setAfterScenarioCues: noop, chapterEndTransition: () => null,
        setScenarioProgress: fn => { progress = fn(progress); },
        setCurrentScenarioId: id => { currentId = id; }, showChapterTransition: () => transitionCount++,
        setBlackjonSeasonFinale: value => { finale = value; },
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
      assert.equal(finale, episode === 20);
      assert.equal(transitionCount, episode === 20 ? 0 : 1);
      const started = [];
      context.currentScenario = blackjonEpisodes[entry];
      context.startScenario = id => started.push(id);
      unlocked.length = 0;
      context.chooseScenario(blackjonEpisodes[entry].choices[0]);
      assert.deepEqual(unlocked, [], 'entering a scene must not complete the episode');
      const firstChoice = blackjonEpisodes[entry].choices[0];
      if (firstChoice.result) {
        const resultId = `${entry}__r__${firstChoice.label.replace(/\s+/g, '_').slice(0, 24)}`;
        assert.deepEqual(started, [resultId]);
        assert.equal(blackjonEpisodes[resultId].text, firstChoice.result);
        assert.equal(getBlackjonBranchLockReason(resultId, selectBlackjonRoute({
          [`${previous}_complete`]: true,
        }, route)), null);
        context.currentScenario = blackjonEpisodes[resultId];
        context.chooseScenario(blackjonEpisodes[resultId].choices[0]);
        assert.deepEqual(started, [resultId, `${prefix}02`]);
        assert.deepEqual(unlocked, [], 'choice-result scenes must not complete the episode');
      } else {
        assert.deepEqual(started, [`${prefix}02`]);
      }
    }
  });
}

test('episode 17: seven reference-based CGs reveal the prepared room only after the overnight stay', () => {
  const expected = {
    '02': 'door', '03': 'door',
    '05': 'lunch', '06': 'lunch', '07': 'lunch', '08': 'lunch', '09': 'lunch',
    '10': 'evening', '12': 'evening', '14': 'evening', '15': 'evening',
    '16': 'preparing', '18': 'preparing', '17': 'rest', '19': 'rest',
    '20': 'room', '21': 'call', end: 'call',
  };
  for (const [suffix, part] of Object.entries(expected)) {
    const scene = blackjonEpisodes[`blackjon_ep17_collision_${suffix}`];
    const asset = `/blackjon_ep17_collision_${part}.png`;
    assert.deepEqual(Array.from(scene.imagePool), [asset]);
    assert.equal(scene.background, asset);
    const bytes = fs.readFileSync(path.join('public', asset));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    assert.equal(bytes.readUInt32BE(16), 1024);
    assert.equal(bytes.readUInt32BE(20), 1536);
    assert.ok(pageSource.includes(`blackjon_ep17_collision_${part}:`));
  }
  assert.equal(blackjonEpisodes.blackjon_ep17_collision_13.background, '/bg_room_night.png');
});

test('episode 17: long-form overnight stay leads to an unsolicited room, not agreed cohabitation', () => {
  const scenes = Object.values(blackjonEpisodes).filter(scene =>
    scene.id.startsWith('blackjon_ep17_collision_') && !scene.id.includes('__r__'));
  const text = scenes.map(scene => scene.text).join('\n');
  assert.ok(text.length > 19000, 'retain the long-form parallel story');
  assert.ok(scenes[0].text.includes('내일 오지 마. 문 안 열어줄 거야.'));
  assert.ok(blackjonEpisodes.blackjon_ep17_collision_02.text.includes('그럼 두 번 먹어.'));
  assert.ok(blackjonEpisodes.blackjon_ep17_collision_20.text.includes('형 방이에요.'));
  const call = blackjonEpisodes.blackjon_ep17_collision_21.text;
  assert.ok(call.includes('내가 언제 너랑 산다고 했어?'));
  assert.ok(call.includes('아직 안 하셨죠.'));
  assert.ok(call.includes('나 어제 잘 잤어. 네가 없어도.'));
  assert.ok(blackjonEpisodes.blackjon_ep17_collision_end.text.endsWith('흑존: 침대 위치는 마음에 들어요?'));
  assert.ok(pageSource.includes('id: "blackjon_ep17_collision_01", prefix: "blackjon_ep17_collision_", number: 17, prerequisite: "blackjon_ep16_collision_complete"'));
  assert.equal(Object.keys(blackjonEpisodes).some(id => /^blackjon_ep17_(conspiracy|erosion)_/.test(id)), false);
  for (const scene of scenes) {
    for (const line of scene.text.split('\n').filter(line => /^(흑존|히든):/.test(line))) {
      assert.ok(line.length <= 100, `${scene.id}: dialogue too long: ${line}`);
    }
  }
});

test('episode 18: seven new CGs follow the return, cafe breakup, and separate wardrobes', () => {
  const expected = {
    '01': 'packing', '02': 'packing', '03': 'packing',
    '05': 'door', '06': 'door', '07': 'door',
    '08': 'cafe', '09': 'cafe', '10': 'cafe', '11': 'cafe', '15': 'cafe',
    '12': 'tears', '13': 'tears', '14': 'tears',
    '16': 'empty', '17': 'return', '19': 'wardrobe', end: 'wardrobe',
  };
  for (const [suffix, part] of Object.entries(expected)) {
    const scene = blackjonEpisodes[`blackjon_ep18_collision_${suffix}`];
    const asset = `/blackjon_ep18_collision_${part}.png`;
    assert.deepEqual(Array.from(scene.imagePool), [asset]);
    assert.equal(scene.background, asset);
    const bytes = fs.readFileSync(path.join('public', asset));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    assert.equal(bytes.readUInt32BE(16), 1024);
    assert.equal(bytes.readUInt32BE(20), 1536);
    assert.ok(pageSource.includes(`blackjon_ep18_collision_${part}:`));
  }
  assert.equal(blackjonEpisodes.blackjon_ep18_collision_04.background, '/bg_room_night.png');
  assert.equal(blackjonEpisodes.blackjon_ep18_collision_18.background, '/blackjon_ep17_collision_room.png');
});

test('episode 18: long-form breakup preserves affection without reconciliation or cohabitation', () => {
  const scenes = Object.values(blackjonEpisodes).filter(scene =>
    scene.id.startsWith('blackjon_ep18_collision_') && !scene.id.includes('__r__'));
  const text = scenes.map(scene => scene.text).join('\n');
  assert.ok(text.length > 16000, 'retain the long-form emotional pacing');
  assert.ok(blackjonEpisodes.blackjon_ep18_collision_05.text.includes('이것도요?'));
  const breakup = blackjonEpisodes.blackjon_ep18_collision_11.text;
  assert.ok(breakup.includes('히든: 좋아해.'));
  assert.ok(breakup.includes('히든: 그런데 헤어질 거야.'));
  assert.ok(breakup.includes('고치는 동안에도 내가 계속 네 옆에 있어야 해?'));
  const tissue = blackjonEpisodes.blackjon_ep18_collision_13.text;
  assert.ok(tissue.includes('다정한 척.'));
  assert.ok(tissue.includes('척하는 거 아니야.'));
  assert.ok(tissue.includes('그럼 가지 마세요.'));
  assert.ok(blackjonEpisodes.blackjon_ep18_collision_17.text.includes('그래도 다시 만나기는 싫어.'));
  assert.ok(blackjonEpisodes.blackjon_ep18_collision_end.text.endsWith('흑존: 형 것만 오면 되겠다.'));
  assert.ok(pageSource.includes('id: "blackjon_ep18_collision_01", prefix: "blackjon_ep18_collision_", number: 18, prerequisite: "blackjon_ep17_collision_complete"'));
  assert.equal(Object.keys(blackjonEpisodes).some(id => /^blackjon_ep18_(conspiracy|erosion)_/.test(id)), false);
  for (const scene of scenes) {
    for (const line of scene.text.split('\n').filter(line => /^(흑존|히든):/.test(line))) {
      assert.ok(line.length <= 100, `${scene.id}: dialogue too long: ${line}`);
    }
  }
});

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

test('episode 15: all six dedicated CGs appear at their story beats and have gallery names', () => {
  const expected = {
    '02': 'phone', '03': 'phone', '04': 'gate', '05': 'walk', '06': 'walk',
    '10': 'plea', '11': 'plea', '12': 'plea', '14': 'bus', '15': 'bus', '16': 'bus',
    '19': 'sofa', end: 'sofa',
  };
  for (const [suffix, part] of Object.entries(expected)) {
    const scene = blackjonEpisodes[`blackjon_ep15_collision_${suffix}`];
    const asset = `/blackjon_ep15_collision_${part}.png`;
    assert.deepEqual(Array.from(scene.imagePool), [asset]);
    assert.equal(scene.background, asset);
    const bytes = fs.readFileSync(path.join('public', asset));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    assert.ok(pageSource.includes(`blackjon_ep15_collision_${part}:`));
  }
});

test('episode 15: long-form story stops at the sofa, with no episode 16 kitchen continuation', () => {
  const scenes = Object.values(blackjonEpisodes).filter(scene =>
    scene.id.startsWith('blackjon_ep15_collision_') && !scene.id.includes('__r__'));
  const text = scenes.map(scene => scene.text).join('\n');
  assert.ok(text.length > 15000, 'retain the requested long-form episode');
  const messages = blackjonEpisodes.blackjon_ep15_collision_02.text.match(/^메시지: 【흑존(?: · [^】]+)?】/gm);
  assert.equal(messages.length, 32, 'thirty queued messages plus two new replies');
  assert.ok(text.includes('형 말 들어야 하나?'));
  assert.ok(text.includes('제가 불쾌합니다.'));
  assert.ok(text.includes('헤어지자.'));
  assert.ok(!text.includes('아사이볼'));
  assert.ok(blackjonEpisodes.blackjon_ep15_collision_end.text.endsWith('흑존은 앉아 있었다.'));
  assert.ok(pageSource.includes('id: "blackjon_ep15_collision_01", prefix: "blackjon_ep15_collision_", number: 15, prerequisite: "blackjon_ep14_collision_complete"'));
  assert.equal(Object.keys(blackjonEpisodes).some(id => /^blackjon_ep15_(conspiracy|erosion)_/.test(id)), false);
});

test('episode 16: seven reference-based CGs follow the story and have gallery names', () => {
  const expected = {
    '01': 'kitchen', '02': 'kitchen', '03': 'kitchen',
    '04': 'table', '05': 'table', '06': 'table',
    '08': 'night', '09': 'night', '10': 'night', '11': 'night',
    '14': 'wardrobe', '15': 'wardrobe',
    '18': 'date', '19': 'date', '20': 'date',
    '21': 'bench',
    '22': 'photo', '23': 'photo', end: 'photo',
  };
  for (const [suffix, part] of Object.entries(expected)) {
    const scene = blackjonEpisodes[`blackjon_ep16_collision_${suffix}`];
    const asset = `/blackjon_ep16_collision_${part}.png`;
    assert.deepEqual(Array.from(scene.imagePool), [asset]);
    assert.equal(scene.background, asset);
    const bytes = fs.readFileSync(path.join('public', asset));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    assert.equal(bytes.readUInt32BE(16), 1024);
    assert.equal(bytes.readUInt32BE(20), 1536);
    assert.ok(pageSource.includes(`blackjon_ep16_collision_${part}:`));
  }
});

test('episode 16: long-form continuation preserves the opening, isolated night, and photo ending', () => {
  const scenes = Object.values(blackjonEpisodes).filter(scene =>
    scene.id.startsWith('blackjon_ep16_collision_') && !scene.id.includes('__r__'));
  const text = scenes.map(scene => scene.text).join('\n');
  assert.ok(text.length > 20000, 'retain the requested long-form pacing');
  assert.ok(scenes[0].text.includes('형 과일 드실 시간. 드셔야죠.'));
  assert.ok(scenes[0].text.includes('아사이볼 해드릴까요?'));
  assert.ok(blackjonEpisodes.blackjon_ep16_collision_11.text.includes('세 시 십이 분'));
  assert.ok(blackjonEpisodes.blackjon_ep16_collision_14.text.includes('이거 치우면 알죠?'));
  assert.ok(blackjonEpisodes.blackjon_ep16_collision_22.text.includes('다른 생각 안 하게'));
  assert.ok(blackjonEpisodes.blackjon_ep16_collision_end.text.endsWith('저때도 집에 가고 싶었다.'));
  assert.ok(pageSource.includes('id: "blackjon_ep16_collision_01", prefix: "blackjon_ep16_collision_", number: 16, prerequisite: "blackjon_ep15_collision_complete"'));
  assert.equal(Object.keys(blackjonEpisodes).some(id => /^blackjon_ep16_(conspiracy|erosion)_/.test(id)), false);
  for (const scene of scenes) {
    for (const line of scene.text.split('\n').filter(line => /^(흑존|히든):/.test(line))) {
      assert.ok(line.length <= 100, `${scene.id}: dialogue too long: ${line}`);
    }
  }
});
