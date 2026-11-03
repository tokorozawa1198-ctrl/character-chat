const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
function load(file){
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports},{filename:file});
 return exports;
}
const {blackjonPureEpisode4:scenes,blackjonPureEpisode4Results:results,BLACKJON_PURE_EP4_ENTRY:entry,BLACKJON_PURE_EP4_END:end,BLACKJON_PURE_EP4_COMPLETE:completion}=load('app/blackjonPureEpisode4.ts');
const {getBlackjonBranchLockReason:lock}=load('app/blackjonRoute.ts');
const page=fs.readFileSync('app/page.tsx','utf8');

test('pure episode 4: sixteen scenes reach own ending without cycles or main-route changes',()=>{
 const visited=new Set();
 function walk(id,trail=new Set()){
  assert(!trail.has(id));const s=scenes[id];assert(s,id);visited.add(id);
  assert.equal(s.category,'side');assert.equal(s.kind,'normal');assert.equal(s.storyRoute,undefined);
  for(const c of s.choices){
   for(const field of ['route','blackjonRoute','stat'])assert.equal(c[field],undefined);
   if(c.end)assert.equal(id,end);else walk(c.next,new Set([...trail,id]));
  }
 }
 walk(entry);assert.equal(visited.size,16);assert.equal(Object.keys(scenes).length,16);
 assert(Object.values(scenes).reduce((n,s)=>n+s.text.length,0)>8000);
});

test('pure episode 4: eight stable response pages preserve chosen text and next scene',()=>{
 assert.equal(Object.keys(results).length,8);
 for(const s of Object.values(scenes))for(const c of s.choices.filter(c=>c.result)){
  const id=`${s.id}__r__${c.label.replace(/\s+/g,'_').slice(0,24)}`;
  assert.equal(results[id].text,c.result);assert.equal(results[id].choices[0].next,c.next);
  assert.deepEqual(Array.from(results[id].imagePool),Array.from(s.imagePool));
 }
});

test('pure episode 4: entry, result, middle and ending require real episode 3 completion',()=>{
 for(const id of [...Object.keys(scenes),...Object.keys(results)]){
  for(const e of [{},{blackjon_pure_ep3_end:true},{blackjon_pure_ep2_complete:true},{blackjon_ep24_collision_complete:true}])assert.equal(lock(id,e),'순애 외전 3화 완독 필요');
  for(const route of ['conspiracy','erosion','collision'])assert.equal(lock(id,{blackjon_pure_ep3_complete:true,[`blackjon_route_${route}`]:true}),null);
  assert.equal(lock(id,{blackjon_pure_ep3_complete:true}),null);
 }
});

test('pure episode 4: own goal, inner affection, mutual touch and independent lives',()=>{
 assert.match(scenes[entry].text,/목요일 저녁, 흑존/);
 assert.match(scenes.blackjon_pure_ep4_05.text,/안전하게 마무리/);
 assert.match(scenes.blackjon_pure_ep4_06.text,/원래 제가 하고 싶던 건데요/);
 assert.match(scenes.blackjon_pure_ep4_07.text,/한 번만 더 만져주시면 안 돼요/);
 assert.match(scenes.blackjon_pure_ep4_11.text,/형의 손이 먼저 닿았다/);
 assert.match(scenes.blackjon_pure_ep4_12.text,/듣고 있어/);
 assert.match(scenes.blackjon_pure_ep4_14.text,/잠깐 안아봐도 돼요/);
 assert(scenes.blackjon_pure_ep4_14.choices.every(c=>/형이 고개를 끄덕이고|형은 흑존이 가방을 내려놓는 걸 기다렸다가 한 걸음 다가갔다/.test(c.result)));
 assert.match(scenes.blackjon_pure_ep4_15.text,/먼저 팔을 조금 풀었다/);
 assert.match(scenes[end].text,/실패한 숫자는 그대로 뒀다/);
 assert.match(scenes[end].text,/형이 오늘 스스로 와준 것처럼/);
});

test('pure episode 4: five real gallery CGs; affectionate CGs follow reciprocal responses',()=>{
 const assets=new Set(Object.values(scenes).flatMap(s=>Array.from(s.imagePool)));assert.equal(assets.size,5);
 for(const asset of assets){const bytes=fs.readFileSync(`public${asset}`);assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert(bytes.length>100000);assert(page.includes(asset.slice(1,-4)+':'));}
 assert(scenes.blackjon_pure_ep4_08.background.endsWith('_bench.png'));
 assert(!scenes.blackjon_pure_ep4_07.background.endsWith('_bench.png'));
 assert(scenes.blackjon_pure_ep4_12.background.endsWith('_walk.png'));
 assert(scenes.blackjon_pure_ep4_15.background.endsWith('_hug.png'));
 assert(!scenes.blackjon_pure_ep4_14.background.endsWith('_hug.png'));
});

test('pure episode 4: actual handler marks only final completion, preserves main state on replay too',()=>{
 const ast=ts.createSourceFile('page.tsx',page,99,true,ts.ScriptKind.TSX);let handler;
 function visit(n){if(ts.isFunctionDeclaration(n)&&n.name?.text==='chooseScenario')handler=n.getText(ast);ts.forEachChild(n,visit);}visit(ast);
 const js=ts.transpileModule(handler,{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
 for(const replay of [false,true]){
  const unlocked=[],started=[];let progress={id:'blackjon_pure_ep4_07__r__saved',lineIndex:2},currentId=end,view='chat';const forbidden=()=>assert.fail('main state changed');
  const c={currentScenario:scenes[entry],scenarioReplayRef:{current:replay},stats:{affinity:900},perkBonus:{affinityPassive:1},
   applyStats:forbidden,setStats:forbidden,showStatDelta:forbidden,enterRoute:forbidden,setSeenEvents:forbidden,
   setMemoryNotes:forbidden,setMessages:forbidden,setAfterScenarioCues:forbidden,chapterEndTransition:()=>null,
   setScenarioProgress:fn=>{progress=fn(progress)},setCurrentScenarioId:id=>{currentId=id},setView:v=>{view=v},
   unlockEvent:id=>unlocked.push(id),scenarioData:{...scenes,...results},startScenario:id=>started.push(id),
   endingData:{forbidden:{condition:forbidden}},setBlackjonSeasonFinale:forbidden,showChapterTransition:forbidden};
  vm.createContext(c);vm.runInContext(js,c);c.chooseScenario(scenes[entry].choices[0]);assert.deepEqual(unlocked,[]);
  c.currentScenario=scenes.blackjon_pure_ep4_14;c.chooseScenario(c.currentScenario.choices[0]);assert.match(started.at(-1),/^blackjon_pure_ep4_14__r__/);
  c.currentScenario=c.scenarioData[started.at(-1)];c.chooseScenario(c.currentScenario.choices[0]);assert.equal(started.at(-1),'blackjon_pure_ep4_15');assert.deepEqual(unlocked,[]);
  c.currentScenario=scenes[end];c.chooseScenario(c.currentScenario.choices[0]);assert.deepEqual(unlocked,[completion]);assert.equal(progress,null);assert.equal(currentId,null);assert.equal(view,'scenarioMenu');
 }
});
