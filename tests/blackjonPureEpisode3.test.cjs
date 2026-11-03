const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
function load(file) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports},{filename:file});
  return exports;
}
const {blackjonPureEpisode3:scenes,blackjonPureEpisode3Results:results,BLACKJON_PURE_EP3_ENTRY:entry,BLACKJON_PURE_EP3_END:end,BLACKJON_PURE_EP3_COMPLETE:completion}=load('app/blackjonPureEpisode3.ts');
const {getBlackjonBranchLockReason:lock}=load('app/blackjonRoute.ts');
const page=fs.readFileSync('app/page.tsx','utf8');

test('pure episode 3: 15 reachable scenes, no dead ends, cycles or main-route effects',()=>{
  const visited=new Set();
  function walk(id,trail=new Set()){
    assert(!trail.has(id));const s=scenes[id];assert(s,id);visited.add(id);
    assert.equal(s.category,'side');assert.equal(s.kind,'normal');assert.equal(s.storyRoute,undefined);
    for(const c of s.choices){
      for(const k of ['stat','route','blackjonRoute'])assert.equal(c[k],undefined);
      if(c.end)assert.equal(id,end);else walk(c.next,new Set([...trail,id]));
    }
  }
  walk(entry);assert.equal(visited.size,15);assert.equal(Object.keys(scenes).length,15);
  assert(Object.values(scenes).reduce((n,s)=>n+s.text.length,0)>8000);
});

test('pure episode 3: all eight chosen responses survive reload with stable IDs',()=>{
  assert.equal(Object.keys(results).length,8);
  for(const s of Object.values(scenes))for(const c of s.choices.filter(c=>c.result)){
    const id=`${s.id}__r__${c.label.replace(/\s+/g,'_').slice(0,24)}`;
    assert.equal(results[id].text,c.result);assert.equal(results[id].choices[0].next,c.next);
    assert.deepEqual(Array.from(results[id].imagePool),Array.from(s.imagePool));
  }
});

test('pure episode 3: all deep links require episode 2 completion, not entry or another route',()=>{
  for(const id of [...Object.keys(scenes),...Object.keys(results)]){
    for(const events of [{},{blackjon_pure_ep2_end:true},{blackjon_pure_ep1_complete:true},{blackjon_ep24_collision_complete:true}])assert.equal(lock(id,events),'순애 외전 2화 완독 필요');
    for(const route of ['collision','conspiracy','erosion'])assert.equal(lock(id,{blackjon_pure_ep2_complete:true,[`blackjon_route_${route}`]:true}),null);
    assert.equal(lock(id,{blackjon_pure_ep2_complete:true}),null);
  }
});

test('pure episode 3: mutual initiative, distinct taste, first handhold and separate lives',()=>{
  assert.match(scenes[entry].text,/일주일 동안/);
  assert.match(scenes.blackjon_pure_ep3_02.text,/전화해봤어/);
  assert.match(scenes.blackjon_pure_ep3_05.text,/안 치우고 좀 앉아 있어도/);
  assert.match(scenes.blackjon_pure_ep3_09.text,/그때처럼 찍고 싶어서요/);
  assert.match(scenes.blackjon_pure_ep3_12.text,/손 잡고 걸어도 돼요/);
  assert(scenes.blackjon_pure_ep3_12.choices.every(c=>/형이 손을 내밀었다|형은 가방 끈을 놓고 흑존의 손을 잡았다/.test(c.result)));
  assert.match(scenes.blackjon_pure_ep3_13.text,/형이 잡아주셨는데 왜 숨겨요/);
  assert.match(scenes.blackjon_pure_ep3_14.text,/흑존이 손을 놓았다/);
  assert.match(scenes[end].text,/다음에 만나면, 자기가 먼저 잡아봐야겠다/);
});

test('pure episode 3: four valid CG assets; handhold illustration appears only after consent',()=>{
  const assets=new Set(Object.values(scenes).flatMap(s=>Array.from(s.imagePool)));assert.equal(assets.size,4);
  for(const asset of assets){const bytes=fs.readFileSync(`public${asset}`);assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert(bytes.length>100000);assert(page.includes(asset.slice(1,-4)+':'));}
  for(let n=1;n<=12;n++)assert(!scenes[`blackjon_pure_ep3_${String(n).padStart(2,'0')}`].background.endsWith('_hand.png'));
  assert(scenes.blackjon_pure_ep3_13.background.endsWith('_hand.png'));
});

test('pure episode 3: actual handler completes final choice only and preserves main state on fresh read/replay',()=>{
  const ast=ts.createSourceFile('page.tsx',page,99,true,ts.ScriptKind.TSX);let handler;
  function visit(n){if(ts.isFunctionDeclaration(n)&&n.name?.text==='chooseScenario')handler=n.getText(ast);ts.forEachChild(n,visit);}visit(ast);
  const js=ts.transpileModule(handler,{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
  for(const replay of [false,true]){
    const unlocked=[],started=[];let progress={id:end,lineIndex:2},currentId=end,view='chat';const forbidden=()=>assert.fail('main state changed');
    const c={currentScenario:scenes[entry],scenarioReplayRef:{current:replay},stats:{affinity:900},perkBonus:{affinityPassive:1},
      applyStats:forbidden,setStats:forbidden,showStatDelta:forbidden,enterRoute:forbidden,setSeenEvents:forbidden,
      setMemoryNotes:forbidden,setMessages:forbidden,setAfterScenarioCues:forbidden,chapterEndTransition:()=>null,
      setScenarioProgress:fn=>{progress=fn(progress)},setCurrentScenarioId:id=>{currentId=id},setView:v=>{view=v},
      unlockEvent:id=>unlocked.push(id),scenarioData:{...scenes,...results},startScenario:id=>started.push(id),
      endingData:{forbidden:{condition:forbidden}},setBlackjonSeasonFinale:forbidden,showChapterTransition:forbidden};
    vm.createContext(c);vm.runInContext(js,c);c.chooseScenario(scenes[entry].choices[0]);assert.deepEqual(unlocked,[]);
    c.currentScenario=scenes.blackjon_pure_ep3_12;c.chooseScenario(c.currentScenario.choices[0]);assert.match(started.at(-1),/^blackjon_pure_ep3_12__r__/);
    c.currentScenario=c.scenarioData[started.at(-1)];c.chooseScenario(c.currentScenario.choices[0]);assert.equal(started.at(-1),'blackjon_pure_ep3_13');assert.deepEqual(unlocked,[]);
    c.currentScenario=scenes[end];c.chooseScenario(c.currentScenario.choices[0]);assert.deepEqual(unlocked,[completion]);assert.equal(progress,null);assert.equal(currentId,null);assert.equal(view,'scenarioMenu');
  }
});
