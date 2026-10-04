"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Bookmark, Check, ChevronDown, GitBranch, LockKeyhole, Search } from "lucide-react";

export type StoryChapter = {
  id: string; scenarioId: string; title: string; subtitle: string; route: string;
  number: number; ending: boolean; image: string; available: boolean; visited: boolean;
  sceneCount: number; visitedCount: number; lockReason?: string;
};
const ROUTES: Record<string, string> = { common: "공통", pure: "순애", obsession: "집착", confine_a: "감금 A", confine_b: "감금 B", forced: "강제 결혼", pure_bad: "배드엔딩", hidden: "히든", blackjon: "흑존", bladder: "방광 루트" };

export function StoryLibrary({ chapters, activeRoute, resume, onStart, onNavigate }: {
  chapters: StoryChapter[]; activeRoute: string;
  resume: { id: string; title: string; line: number } | null;
  onStart: (id: string) => void;
  onNavigate: (view: "storyMap" | "subScenarios" | "extraScenarios" | "events" | "settings") => void;
}) {
  const [route, setRoute] = useState(activeRoute);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [showOtherRoutes, setShowOtherRoutes] = useState(false);
  useEffect(() => { setRoute(activeRoute); }, [activeRoute]);
  const routes = [...new Set(chapters.map((chapter) => chapter.route))];
  const standalone = activeRoute === "hidden" || activeRoute === "blackjon";
  const primaryRoutes = standalone ? [activeRoute] : ["common", ...(activeRoute !== "common" && routes.includes(activeRoute) ? [activeRoute] : [])];
  const otherRoutes = routes.filter((key) => !primaryRoutes.includes(key));
  const selected = routes.includes(route) && (primaryRoutes.includes(route) || showOtherRoutes) ? route : (routes.includes(activeRoute) ? activeRoute : routes[0]);
  const list = chapters.filter((c) => c.route === selected && `${c.title} ${c.subtitle}`.toLowerCase().includes(query.trim().toLowerCase()) && (filter === "all" || (filter === "available" ? c.available : c.visited)));
  const next = chapters.find((c) => c.route === "common" && c.available && !c.visited)
    || chapters.find((c) => c.route === activeRoute && c.available && !c.visited);
  const branchChoices = activeRoute === "common" && !next
    ? chapters.filter((c) => c.number === 7 && (c.route === "pure" || c.route === "obsession") && c.available)
    : [];
  const readCount = chapters.filter((c) => c.route === selected && c.visited).length;
  const routeGuide = activeRoute === "blackjon"
    ? chapters.filter((chapter) => chapter.route === "blackjon").sort((a, b) => a.number - b.number).map((chapter) => chapter.number === 1 ? "프롤로그" : `${chapter.number}화`)
    : activeRoute === "hidden"
      ? ["히든 이야기", "다음 에피소드"]
      : ["공통 1~6장", "6장의 선택", activeRoute === "common" ? "순애 / 집착" : `${ROUTES[activeRoute] || activeRoute} 루트`, "후속 분기와 엔딩"];
  return <div className="storyLibrary"><style dangerouslySetInnerHTML={{ __html: STYLES }}/>
    <header className="storyLibraryHeading"><div><span>STORY ARCHIVE</span><h2>이야기 따라가기</h2></div><p><GitBranch size={15}/>{ROUTES[activeRoute] || activeRoute} 루트</p></header>
    <div className="storyRouteGuide" aria-label="이야기 진행 순서">{routeGuide.map((step, index) => <span key={step}><b>{index + 1}</b>{step}</span>)}</div>
    <section className="storyContinue">
      <Bookmark size={22}/><div><small>{resume ? "읽던 장면" : next ? "다음에 읽을 이야기" : branchChoices.length ? "이제 루트를 선택할 차례" : "현재까지의 이야기"}</small><h3>{resume?.title || next?.title || (branchChoices.length ? "순애와 집착, 어느 길로 갈까요?" : "읽을 수 있는 새 이야기가 없어요")}</h3><p>{resume ? `${resume.line + 1}번째 대사부터 이어집니다` : next?.subtitle || (branchChoices.length ? "6장 이후의 두 길을 살펴보세요." : "아래에서 열람 기록과 다른 분기를 확인할 수 있어요.")}</p></div>
      {(resume || next) && <button onClick={() => onStart(resume?.id || next!.scenarioId)}>{resume ? "이어서 읽기" : "읽기 시작"}<ArrowRight size={17}/></button>}
      {!resume && branchChoices.length > 0 && <div className="storyBranchChoices">{branchChoices.map((chapter) => <button key={chapter.id} onClick={() => { setShowOtherRoutes(true); setRoute(chapter.route); }}>{ROUTES[chapter.route]} 루트 보기<ArrowRight size={15}/></button>)}</div>}
    </section>
    <div className="storySectionHeading"><div><small>CHAPTER LIST</small><h3>{ROUTES[selected] || selected} 이야기</h3></div><span>{readCount} / {chapters.filter((c) => c.route === selected).length} 열람</span></div>
    <div className="storyRouteTabs" role="tablist" aria-label="현재 이야기 목차">{primaryRoutes.filter((key) => routes.includes(key)).map((key) => <button key={key} role="tab" aria-selected={selected === key} onClick={() => setRoute(key)}>{ROUTES[key] || key}<span>{chapters.filter((c) => c.route === key).length}</span></button>)}</div>
    {otherRoutes.length > 0 && <div className="storyOtherRoutes"><button className="storyOtherToggle" aria-expanded={showOtherRoutes} onClick={() => { setShowOtherRoutes((open) => !open); if (showOtherRoutes && !primaryRoutes.includes(selected)) setRoute(primaryRoutes[0]); }}>다른 분기 살펴보기 <span>{otherRoutes.length}개 루트</span><ChevronDown size={16}/></button>{showOtherRoutes && <div className="storyRouteTabs" role="tablist" aria-label="다른 분기 목차">{otherRoutes.map((key) => <button key={key} role="tab" aria-selected={selected === key} onClick={() => setRoute(key)}>{ROUTES[key] || key}<span>{chapters.filter((c) => c.route === key).length}</span></button>)}</div>}</div>}
    <div className="storyTools"><label><Search size={16}/><input aria-label="챕터 검색" placeholder="챕터 검색" value={query} onChange={(e) => setQuery(e.target.value)}/></label><select aria-label="열람 상태" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">전체 챕터</option><option value="available">읽기 가능</option><option value="visited">열람 기록 있음</option></select></div>
    <div className="storyChapterList" role="tabpanel" aria-label={`${ROUTES[selected] || selected} 챕터`}>
      {!list.length && <p className="storyEmpty">조건에 맞는 챕터가 없어요.</p>}
      {list.map((c) => <article className={`storyChapterRow ${c.available ? "" : "isLocked"} ${c.id === next?.id && !resume ? "isNext" : ""}`} key={c.id}>
        <img src={c.image} alt="" loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/bg_room_night.png"; }}/>
        <div className="storyChapterInfo"><small>{c.ending ? "ENDING" : `CHAPTER ${String(c.number).padStart(2, "0")}`}</small><h3>{c.title}</h3><p>{c.subtitle}</p><span>{c.sceneCount}개 장면 · {c.visitedCount}개 열람 기록</span></div>
        <div className="storyChapterAction"><small>{c.id === next?.id && !resume ? <><BookOpen size={13}/>다음 이야기</> : c.visited ? <><Check size={13}/>열람 기록</> : c.available ? <><BookOpen size={13}/>읽기 가능</> : <><LockKeyhole size={13}/>{c.lockReason || "이전 챕터 진행 필요"}</>}</small><button disabled={!c.available} onClick={() => onStart(c.scenarioId)}>{c.visited ? "다시 읽기" : "챕터 시작"}<ArrowRight size={15}/></button></div>
      </article>)}
    </div>
    <nav className="storyCollections" aria-label="이야기 보관함">
      <button onClick={() => onNavigate("subScenarios")}>후일담<ArrowRight size={14}/></button>
      <button onClick={() => onNavigate("extraScenarios")}>외전 · 특수<ArrowRight size={14}/></button>
      <button onClick={() => onNavigate("events")}>장면 다시보기<ArrowRight size={14}/></button>
      {!standalone && <button onClick={() => onNavigate("storyMap")}>전체 분기 지도<GitBranch size={14}/></button>}
    </nav>
  </div>;
}

const STYLES = `
.storyLibrary{max-width:1060px;margin:0 auto;color:var(--text-main,#ece9ed)}.storyLibrary button,.storyLibrary input,.storyLibrary select{font-family:inherit;letter-spacing:0}.storyLibraryHeading{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:28px}.storyLibraryHeading>div>span{font-size:10px;letter-spacing:2px;opacity:.55}.storyLibraryHeading h2{font-size:28px!important;margin:8px 0 0!important}.storyLibraryHeading p{display:flex;align-items:center;gap:6px;font-size:12px;white-space:nowrap;opacity:.7}
.storyContinue{display:flex;align-items:center;gap:18px;padding:24px 0;border-block:1px solid #82718055}.storyContinue>svg{color:#c18eaa;flex:none}.storyContinue>div{flex:1;min-width:0}.storyContinue small{font-size:11px;opacity:.65}.storyContinue h3{font-size:19px;margin:8px 0;overflow-wrap:anywhere}.storyContinue p{font-size:12px;opacity:.65;margin:0}.storyContinue button,.storyChapterAction button{display:flex;align-items:center;justify-content:center;gap:12px;border:1px solid #a97c9255;background:#614455;color:#fff;padding:12px 16px;border-radius:6px;cursor:pointer;white-space:nowrap}.storyCollections{display:flex;flex-wrap:wrap;gap:8px 24px;padding:20px 0}.storyCollections button{background:none;border:0;padding:8px 0;color:inherit;font-size:12px;display:flex;gap:12px;align-items:center;cursor:pointer}
.storyRouteTrail{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:11px;opacity:.6;padding:14px 0 20px}.storyRouteTabs{display:flex;flex-wrap:wrap;gap:6px;border-bottom:1px solid #82718055;padding-bottom:14px}.storyRouteTabs button{background:transparent;border:1px solid transparent;color:inherit;display:flex;gap:10px;padding:10px 12px;font-size:13px;cursor:pointer;border-radius:5px}.storyRouteTabs button[aria-selected=true]{border-color:#b38da4;background:#b38da41a}.storyRouteTabs button span{opacity:.5;font-size:11px}.storyTools{display:flex;gap:12px;justify-content:space-between;margin:22px 0}.storyTools label{display:flex;align-items:center;gap:10px;min-width:0;flex:1;max-width:360px;border-bottom:1px solid #82718077}.storyTools input{width:100%;min-width:0;background:transparent;border:0;color:inherit;padding:12px 0;font-size:14px}.storyTools select{max-width:140px;background:#25232c;color:#eee;border:1px solid #716573;border-radius:4px;padding:8px;font-size:12px}
.storyChapterRow{display:grid;grid-template-columns:92px minmax(0,1fr) auto;gap:20px;align-items:center;padding:20px 0;border-bottom:1px solid #82718033}.storyChapterRow>img{width:92px;height:112px;object-fit:cover;border-radius:5px}.storyChapterInfo{min-width:0}.storyChapterInfo small{font-size:10px;opacity:.55}.storyChapterInfo h3{font-size:17px;margin:8px 0;line-height:1.5;overflow-wrap:anywhere}.storyChapterInfo p{font-size:12px;opacity:.75;margin:0 0 10px;line-height:1.5}.storyChapterInfo>span{font-size:11px;opacity:.55}.storyChapterAction{display:grid;gap:14px;justify-items:end}.storyChapterAction small{display:flex;gap:5px;align-items:center;font-size:11px;opacity:.7}.storyChapterAction button{font-size:12px;padding:10px 12px}.storyChapterAction button:disabled{background:transparent;color:inherit;opacity:.4;cursor:not-allowed}.storyChapterRow.isLocked>img{filter:grayscale(1);opacity:.4}.storyEmpty{padding:48px 0;text-align:center;opacity:.6}
@media(max-width:760px){.storyLibraryHeading{margin-bottom:18px}.storyLibraryHeading h2{font-size:24px!important}.storyContinue{gap:12px;flex-wrap:wrap;padding:18px 0}.storyContinue>div{flex-basis:75%}.storyContinue button{margin-left:34px;font-size:13px}.storyCollections{gap:4px 20px}.storyCollections button{font-size:11px}.storyChapterRow{grid-template-columns:64px minmax(0,1fr);gap:12px;padding:18px 0}.storyChapterRow>img{width:64px;height:90px}.storyChapterInfo h3{font-size:15px}.storyChapterAction{grid-column:2;display:flex;align-items:center;justify-content:space-between;gap:8px}.storyChapterAction small{font-size:10px}.storyChapterAction button{font-size:11px;padding:8px}.storyTools{gap:8px}.storyTools select{max-width:128px}.storyRouteTabs button{padding:8px;font-size:12px}}
.storyRouteGuide{display:flex;align-items:center;gap:8px;overflow-x:auto;padding:0 0 22px;scrollbar-width:thin}.storyRouteGuide>span{display:flex;align-items:center;gap:7px;flex:none;color:#c9c0c9;font-size:11px;white-space:nowrap}.storyRouteGuide>span:not(:last-child):after{content:"→";margin-left:8px;color:#a694a0}.storyRouteGuide b{display:grid;place-items:center;width:21px;height:21px;border:1px solid #b38da488;border-radius:50%;color:#d8afc4;font-size:10px}.storySectionHeading{display:flex;align-items:end;justify-content:space-between;gap:12px;margin:28px 0 12px}.storySectionHeading small{font-size:10px;color:#b9a1b0}.storySectionHeading h3{font-size:20px;margin:5px 0 0}.storySectionHeading>span{font-size:11px;color:#b9a1b0;white-space:nowrap}.storyOtherRoutes{border-bottom:1px solid #82718055}.storyOtherToggle{display:flex;align-items:center;gap:9px;width:100%;border:0;background:none;color:inherit;padding:13px 2px;text-align:left;font-size:12px;cursor:pointer}.storyOtherToggle span{color:#b9a1b0}.storyOtherToggle svg{margin-left:auto;transition:transform .2s}.storyOtherToggle[aria-expanded=true] svg{transform:rotate(180deg)}.storyOtherRoutes .storyRouteTabs{padding:0 0 12px;border:0}.storyBranchChoices{display:flex;gap:8px;flex-basis:100%;flex-wrap:wrap}.storyBranchChoices button{background:#322930;border-color:#82718055}.storyChapterRow.isNext{border-left:3px solid #c18eaa;padding-left:12px;background:linear-gradient(90deg,#c18eaa12,transparent 70%)}.storyChapterRow.isNext .storyChapterAction small{color:#e5b8ce;opacity:1}.storyCollections{margin-top:26px;border-top:1px solid #82718055}
@media(max-width:760px){.storyRouteGuide{flex-wrap:wrap;overflow:visible;gap:8px 5px;padding-bottom:16px}.storyRouteGuide>span{font-size:10px}.storyContinue .storyBranchChoices{flex-basis:100%;margin-left:0}.storyBranchChoices button{flex:1;min-width:120px;font-size:11px;padding:10px}.storySectionHeading{margin-top:22px}.storySectionHeading h3{font-size:18px}.storyChapterRow.isNext{padding-left:8px}}
`;
