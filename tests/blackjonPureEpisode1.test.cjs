const fs = require('node:fs');
const path = require('node:path');
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
const {blackjonPureEpisode1: scenes, blackjonPureEpisode1Results: results, BLACKJON_PURE_EP1_ENTRY: entry, BLACKJON_PURE_EP1_END: end, BLACKJON_PURE_EP1_COMPLETE: completion} = load('app/blackjonPureEpisode1.ts');
const pageSource = fs.readFileSync('app/page.tsx','utf8');
const ast = ts.createSourceFile('page.tsx',pageSource,99,true,ts.ScriptKind.TSX);
let handler;
function visit(n) {if(ts.isFunctionDeclaration(n)&&n.name?.text==='chooseScenario') handler=n.getText(ast);ts.forEachChild(n,visit)}
visit(ast);
const handlerJs=ts.transpileModule(handler,{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;

test('pure alternate episode: every choice reaches only its own ending, without main-route effects',()=>{
  const visited=new Set();
  function walk(id,trail=new Set()) {
    assert(!trail.has(id),'no cycles');
    const scene=scenes[id]; assert(scene,`missing ${id}`); visited.add(id);
    assert.equal(scene.category,'side'); assert.equal(scene.kind,'normal');
    assert.equal(scene.storyRoute,undefined);
    for(const c of scene.choices) {
      assert.equal(c.route,undefined); assert.equal(c.blackjonRoute,undefined); assert.equal(c.stat,undefined);
      if(c.end) assert.equal(id,end);
      else {assert(c.next.startsWith('blackjon_pure_ep1_'));walk(c.next,new Set([...trail,id]));}
    }
  }
  walk(entry); assert.equal(visited.size,13); assert.equal(Object.keys(scenes).length,13);
  assert(Object.values(scenes).reduce((n,s)=>n+s.text.length,0)>7000);
  assert.equal(Object.values(scenes).flatMap(s=>s.choices).filter(c=>c.result).length,8);
});

test('pure alternate episode: new meeting, cooking failure, consensual nickname and next-day invitation',()=>{
  assert.match(scenes.blackjon_pure_ep1_02.text,/한국 분이세요/);
  assert.match(scenes.blackjon_pure_ep1_03.text,/자기 또래 한국 사람/);
  assert.match(scenes.blackjon_pure_ep1_04.text,/프라이팬이 작아졌다/);
  assert.match(scenes.blackjon_pure_ep1_05.text,/스물다섯/);
  assert.match(scenes.blackjon_pure_ep1_09.text,/형이라고 불러도 돼요/);
  assert.match(scenes[end].text,/내일 여섯 시/);
  assert.match(scenes[end].text,/내일 저녁에 만날 사람이 생겼다/);
});

test('pure alternate episode: all choice responses survive module reload as stable resumable scenes',()=>{
  assert.equal(Object.keys(results).length,8);
  for(const scene of Object.values(scenes)) for(const choice of scene.choices.filter(c=>c.result)) {
    const id=`${scene.id}__r__${choice.label.replace(/\s+/g,'_').slice(0,24)}`;
    assert.equal(results[id].text,choice.result);
    assert.equal(results[id].choices[0].next,choice.next);
    assert.equal(results[id].category,'side');
  }
});

test('pure alternate episode: three real CGs with no later-scene images shown early',()=>{
  const assets=new Set();
  for(const s of Object.values(scenes)) {
    const suffix=s.id.split('_').at(-1);
    const expected=suffix==='end'||Number(suffix)>=10?'home':Number(suffix)>=5?'street':'shop';
    const asset=`/blackjon_pure_ep1_${expected}.png`;
    assert.deepEqual(Array.from(s.imagePool),[asset]);assert.equal(s.background,asset);assets.add(asset);
  }
  assert.equal(assets.size,3);
  for(const asset of assets){const bytes=fs.readFileSync(path.join('public',asset));assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert(bytes.length>100000);assert(pageSource.includes(path.basename(asset,'.png')+':'));}
});

test('actual choice handler: alternate story preserves main stats, memories and endings and only completes on final choice',()=>{
  for(const replay of [false,true]) {
    let progress={id:end,lineIndex:3},currentId=end,view='chat';const unlocked=[],started=[];
    const forbidden=()=>assert.fail('alternate story must not mutate main-story state');
    const context={currentScenario:scenes[end],scenarioReplayRef:{current:replay},stats:{affinity:900},perkBonus:{affinityPassive:1},
      applyStats:forbidden,setStats:forbidden,showStatDelta:forbidden,enterRoute:forbidden,setSeenEvents:forbidden,
      setMemoryNotes:forbidden,setMessages:forbidden,setAfterScenarioCues:forbidden,chapterEndTransition:()=>null,
      setScenarioProgress:fn=>{progress=fn(progress)},setCurrentScenarioId:id=>{currentId=id},setView:v=>{view=v},
      unlockEvent:id=>unlocked.push(id),scenarioData:{...scenes,...results},startScenario:id=>started.push(id),
      endingData:{forbidden:{condition:forbidden}},setBlackjonSeasonFinale:forbidden,showChapterTransition:forbidden};
    vm.createContext(context);vm.runInContext(handlerJs,context);
    context.currentScenario=scenes[entry];context.chooseScenario(scenes[entry].choices[0]);
    assert.deepEqual(unlocked,[]);assert.deepEqual(started,['blackjon_pure_ep1_02']);
    context.currentScenario=scenes.blackjon_pure_ep1_03;context.chooseScenario(context.currentScenario.choices[0]);
    assert.match(started.at(-1),/^blackjon_pure_ep1_03__r__/);
    context.currentScenario=context.scenarioData[started.at(-1)];context.chooseScenario(context.currentScenario.choices[0]);
    assert.equal(started.at(-1),'blackjon_pure_ep1_04');assert.deepEqual(unlocked,[]);
    context.currentScenario=scenes[end];context.chooseScenario(scenes[end].choices[0]);
    assert.deepEqual(unlocked,[completion]);assert.equal(progress,null);assert.equal(currentId,null);assert.equal(view,'scenarioMenu');
  }
});
