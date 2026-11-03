const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
function load(file) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInNewContext(code,{exports}, {filename:file});
  return exports;
}
const {blackjonPureEpisode2: scenes, blackjonPureEpisode2Results: results, BLACKJON_PURE_EP2_ENTRY: entry, BLACKJON_PURE_EP2_END: end, BLACKJON_PURE_EP2_COMPLETE: completion} = load('app/blackjonPureEpisode2.ts');
const {getBlackjonBranchLockReason: lock} = load('app/blackjonRoute.ts');
const pageSource = fs.readFileSync('app/page.tsx','utf8');

test('pure episode 2: all paths progress through 15 scenes to its own ending without main-route effects',()=>{
  const visited=new Set();
  function walk(id,trail=new Set()) {
    assert(!trail.has(id));const s=scenes[id];assert(s,`missing ${id}`);visited.add(id);
    assert.equal(s.category,'side');assert.equal(s.kind,'normal');assert.equal(s.storyRoute,undefined);
    for(const c of s.choices){
      for(const field of ['route','blackjonRoute','stat'])assert.equal(c[field],undefined);
      if(c.end)assert.equal(id,end);
      else {assert(c.next.startsWith('blackjon_pure_ep2_'));walk(c.next,new Set([...trail,id]));}
    }
  }
  walk(entry);assert.equal(visited.size,15);assert.equal(Object.keys(scenes).length,15);
  assert(Object.values(scenes).reduce((n,s)=>n+s.text.length,0)>9000);
});

test('pure episode 2: both choices at five points persist as resumable result pages',()=>{
  assert.equal(Object.keys(results).length,10);
  for(const s of Object.values(scenes))for(const c of s.choices.filter(c=>c.result)){
    const id=`${s.id}__r__${c.label.replace(/\s+/g,'_').slice(0,24)}`;
    assert.equal(results[id].text,c.result);assert.equal(results[id].choices[0].next,c.next);
    assert.deepEqual(Array.from(results[id].imagePool),Array.from(s.imagePool));
  }
});

test('pure episode 2: all scene and result deep links require actual episode 1 completion, independent of main route',()=>{
  for(const id of [...Object.keys(scenes),...Object.keys(results)]){
    assert.equal(lock(id,{}),'순애 외전 1화 완독 필요');
    assert.equal(lock(id,{blackjon_pure_ep1_end:true,blackjon_ep24_collision_complete:true}),'순애 외전 1화 완독 필요');
    for(const route of ['conspiracy','collision','erosion'])assert.equal(lock(id,{blackjon_pure_ep1_complete:true,[`blackjon_route_${route}`]:true}),null);
    assert.equal(lock(id,{blackjon_pure_ep1_complete:true}),null);
  }
  assert.equal(lock('blackjon_pure_ep1_01',{}),null);
});

test('pure episode 2: concrete mutual progress, clear romantic initiative, separate homes',()=>{
  assert.match(scenes[entry].text,/운동은 세 시/);
  assert.match(scenes.blackjon_pure_ep2_04.text,/저는요/);
  assert.match(scenes.blackjon_pure_ep2_06.text,/오늘도 못 했어요/);
  assert.match(scenes.blackjon_pure_ep2_08.text,/좀 더 같이 있고 싶어서요/);
  assert.match(scenes.blackjon_pure_ep2_13.text,/히든:.*같이 갈래/);
  assert.match(scenes.blackjon_pure_ep2_14.text,/저는 형이랑 데이트하고 싶어요/);
  assert(scenes.blackjon_pure_ep2_14.choices.every(c=>/데이트|일요일엔 그렇게/.test(c.result)));
  assert.match(scenes[end].text,/자기 집 쪽으로 걸었다/);
  assert.match(scenes[end].text,/네가 좋아하는 걸로/);
});

test('pure episode 2: CGs are real PNGs and registered for gallery',()=>{
  const assets=new Set(Object.values(scenes).flatMap(s=>Array.from(s.imagePool)));
  assert.equal(assets.size,3);
  for(const asset of assets){
    const bytes=fs.readFileSync(`public${asset}`);assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert(bytes.length>100000);
    assert(pageSource.includes(asset.slice(1,-4)+':'));
  }
  assert.equal(scenes[entry].background,'/blackjon_pure_ep2_wait.png');
  assert.equal(scenes.blackjon_pure_ep2_05.background,'/blackjon_pure_ep2_dinner.png');
  assert.equal(scenes.blackjon_pure_ep2_11.background,'/blackjon_pure_ep2_river.png');
});

test('pure episode 2: actual handler completes only final choice, preserves main state also on replay',()=>{
  const ast=ts.createSourceFile('page.tsx',pageSource,99,true,ts.ScriptKind.TSX);let handler;
  function visit(n){if(ts.isFunctionDeclaration(n)&&n.name?.text==='chooseScenario')handler=n.getText(ast);ts.forEachChild(n,visit);}visit(ast);
  const js=ts.transpileModule(handler,{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
  for(const replay of [false,true]){
    const unlocked=[],started=[];let progress={id:end,lineIndex:3},currentId=end,view='chat';
    const forbidden=()=>assert.fail('main-state side effect');
    const c={currentScenario:scenes[entry],scenarioReplayRef:{current:replay},stats:{affinity:900},perkBonus:{affinityPassive:1},
      applyStats:forbidden,setStats:forbidden,showStatDelta:forbidden,enterRoute:forbidden,setSeenEvents:forbidden,
      setMemoryNotes:forbidden,setMessages:forbidden,setAfterScenarioCues:forbidden,chapterEndTransition:()=>null,
      setScenarioProgress:fn=>{progress=fn(progress)},setCurrentScenarioId:id=>{currentId=id},setView:v=>{view=v},
      unlockEvent:id=>unlocked.push(id),scenarioData:{...scenes,...results},startScenario:id=>started.push(id),
      endingData:{forbidden:{condition:forbidden}},setBlackjonSeasonFinale:forbidden,showChapterTransition:forbidden};
    vm.createContext(c);vm.runInContext(js,c);c.chooseScenario(scenes[entry].choices[0]);assert.deepEqual(unlocked,[]);
    c.currentScenario=scenes.blackjon_pure_ep2_14;c.chooseScenario(c.currentScenario.choices[0]);
    assert.match(started.at(-1),/^blackjon_pure_ep2_14__r__/);assert.deepEqual(unlocked,[]);
    c.currentScenario=c.scenarioData[started.at(-1)];c.chooseScenario(c.currentScenario.choices[0]);
    assert.equal(started.at(-1),end);assert.deepEqual(unlocked,[]);
    c.currentScenario=scenes[end];c.chooseScenario(c.currentScenario.choices[0]);
    assert.deepEqual(unlocked,[completion]);assert.equal(progress,null);assert.equal(currentId,null);assert.equal(view,'scenarioMenu');
  }
});
