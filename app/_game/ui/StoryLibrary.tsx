"use client";

import { useState } from "react";
import { ArrowRight, BookOpen, Bookmark, Check, GitBranch, LockKeyhole, Search } from "lucide-react";

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
  const routes = [...new Set(chapters.map((chapter) => chapter.route))];
  const selected = routes.includes(route) ? route : routes[0];
  const list = chapters.filter((c) => c.route === selected && `${c.title} ${c.subtitle}`.toLowerCase().includes(query.trim().toLowerCase()) && (filter === "all" || (filter === "available" ? c.available : c.visited)));
  const next = chapters.find((c) => c.route === activeRoute && c.available && !c.visited) || chapters.find((c) => c.route === "common" && c.available && !c.visited);
  return <div className="storyLibrary"><style dangerouslySetInnerHTML={{ __html: STYLES }}/>
    <header className="storyLibraryHeading"><div><span>STORY ARCHIVE</span><h2>우리의 이야기</h2></div><p><GitBranch size={15}/>{ROUTES[activeRoute] || activeRoute} 루트</p></header>
    <section className="storyContinue">
      <Bookmark size={22}/><div><small>{resume ? "저장한 장면" : next ? "읽을 수 있는 새 챕터" : "이야기 기록"}</small><h3>{resume?.title || next?.title || "새로운 갈림길을 찾아서"}</h3><p>{resume ? `${resume.line + 1}번째 대사부터` : next?.subtitle || "루트별 챕터와 열람 기록"}</p></div>
      {(resume || next) && <button onClick={() => onStart(resume?.id || next!.scenarioId)}>{resume ? "이어서 읽기" : "읽기 시작"}<ArrowRight size={17}/></button>}
    </section>
    <nav className="storyCollections" aria-label="이야기 보관함">
      <button onClick={() => onNavigate("subScenarios")}>후일담<ArrowRight size={14}/></button>
      <button onClick={() => onNavigate("extraScenarios")}>외전 · 특수<ArrowRight size={14}/></button>
      <button onClick={() => onNavigate("events")}>장면 다시보기<ArrowRight size={14}/></button>
      <button onClick={() => onNavigate("storyMap")}>전체 분기 지도<GitBranch size={14}/></button>
    </nav>
    <div className="storyRouteTrail"><span>공통 1–6장</span><ArrowRight size={14}/><span>순애 / 집착</span><ArrowRight size={14}/><span>후속 분기 · 엔딩</span></div>
    <div className="storyRouteTabs" role="tablist" aria-label="루트별 목차">{routes.map((key) => <button key={key} role="tab" aria-selected={selected === key} onClick={() => setRoute(key)}>{ROUTES[key] || key}<span>{chapters.filter((c) => c.route === key).length}</span></button>)}</div>
    <div className="storyTools"><label><Search size={16}/><input aria-label="챕터 검색" placeholder="챕터 검색" value={query} onChange={(e) => setQuery(e.target.value)}/></label><select aria-label="열람 상태" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">전체 챕터</option><option value="available">읽기 가능</option><option value="visited">열람 기록 있음</option></select></div>
    <div className="storyChapterList" role="tabpanel" aria-label={`${ROUTES[selected] || selected} 챕터`}>
      {!list.length && <p className="storyEmpty">조건에 맞는 챕터가 없어요.</p>}
      {list.map((c) => <article className={`storyChapterRow ${c.available ? "" : "isLocked"}`} key={c.id}>
        <img src={c.image} alt="" loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/bg_room_night.png"; }}/>
        <div className="storyChapterInfo"><small>{c.ending ? "ENDING" : `CHAPTER ${String(c.number).padStart(2, "0")}`}</small><h3>{c.title}</h3><p>{c.subtitle}</p><span>{c.sceneCount}개 장면 · {c.visitedCount}개 열람 기록</span></div>
        <div className="storyChapterAction"><small>{c.visited ? <><Check size={13}/>열람 기록</> : c.available ? <><BookOpen size={13}/>읽기 가능</> : <><LockKeyhole size={13}/>{c.lockReason || "이전 챕터 진행 필요"}</>}</small><button disabled={!c.available} onClick={() => onStart(c.scenarioId)}>{c.visited ? "다시 읽기" : "챕터 시작"}<ArrowRight size={15}/></button></div>
      </article>)}
    </div>
  </div>;
}

const STYLES = `
.storyLibrary{max-width:1060px;margin:0 auto;color:var(--text-main,#ece9ed)}.storyLibrary button,.storyLibrary input,.storyLibrary select{font-family:inherit;letter-spacing:0}.storyLibraryHeading{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:28px}.storyLibraryHeading>div>span{font-size:10px;letter-spacing:2px;opacity:.55}.storyLibraryHeading h2{font-size:28px!important;margin:8px 0 0!important}.storyLibraryHeading p{display:flex;align-items:center;gap:6px;font-size:12px;white-space:nowrap;opacity:.7}
.storyContinue{display:flex;align-items:center;gap:18px;padding:24px 0;border-block:1px solid #82718055}.storyContinue>svg{color:#c18eaa;flex:none}.storyContinue>div{flex:1;min-width:0}.storyContinue small{font-size:11px;opacity:.65}.storyContinue h3{font-size:19px;margin:8px 0;overflow-wrap:anywhere}.storyContinue p{font-size:12px;opacity:.65;margin:0}.storyContinue button,.storyChapterAction button{display:flex;align-items:center;justify-content:center;gap:12px;border:1px solid #a97c9255;background:#614455;color:#fff;padding:12px 16px;border-radius:6px;cursor:pointer;white-space:nowrap}.storyCollections{display:flex;flex-wrap:wrap;gap:8px 24px;padding:20px 0}.storyCollections button{background:none;border:0;padding:8px 0;color:inherit;font-size:12px;display:flex;gap:12px;align-items:center;cursor:pointer}
.storyRouteTrail{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:11px;opacity:.6;padding:14px 0 20px}.storyRouteTabs{display:flex;flex-wrap:wrap;gap:6px;border-bottom:1px solid #82718055;padding-bottom:14px}.storyRouteTabs button{background:transparent;border:1px solid transparent;color:inherit;display:flex;gap:10px;padding:10px 12px;font-size:13px;cursor:pointer;border-radius:5px}.storyRouteTabs button[aria-selected=true]{border-color:#b38da4;background:#b38da41a}.storyRouteTabs button span{opacity:.5;font-size:11px}.storyTools{display:flex;gap:12px;justify-content:space-between;margin:22px 0}.storyTools label{display:flex;align-items:center;gap:10px;min-width:0;flex:1;max-width:360px;border-bottom:1px solid #82718077}.storyTools input{width:100%;min-width:0;background:transparent;border:0;color:inherit;padding:12px 0;font-size:14px}.storyTools select{max-width:140px;background:#25232c;color:#eee;border:1px solid #716573;border-radius:4px;padding:8px;font-size:12px}
.storyChapterRow{display:grid;grid-template-columns:92px minmax(0,1fr) auto;gap:20px;align-items:center;padding:20px 0;border-bottom:1px solid #82718033}.storyChapterRow>img{width:92px;height:112px;object-fit:cover;border-radius:5px}.storyChapterInfo{min-width:0}.storyChapterInfo small{font-size:10px;opacity:.55}.storyChapterInfo h3{font-size:17px;margin:8px 0;line-height:1.5;overflow-wrap:anywhere}.storyChapterInfo p{font-size:12px;opacity:.75;margin:0 0 10px;line-height:1.5}.storyChapterInfo>span{font-size:11px;opacity:.55}.storyChapterAction{display:grid;gap:14px;justify-items:end}.storyChapterAction small{display:flex;gap:5px;align-items:center;font-size:11px;opacity:.7}.storyChapterAction button{font-size:12px;padding:10px 12px}.storyChapterAction button:disabled{background:transparent;color:inherit;opacity:.4;cursor:not-allowed}.storyChapterRow.isLocked>img{filter:grayscale(1);opacity:.4}.storyEmpty{padding:48px 0;text-align:center;opacity:.6}
@media(max-width:760px){.storyLibraryHeading{margin-bottom:18px}.storyLibraryHeading h2{font-size:24px!important}.storyContinue{gap:12px;flex-wrap:wrap;padding:18px 0}.storyContinue>div{flex-basis:75%}.storyContinue button{margin-left:34px;font-size:13px}.storyCollections{gap:4px 20px}.storyCollections button{font-size:11px}.storyChapterRow{grid-template-columns:64px minmax(0,1fr);gap:12px;padding:18px 0}.storyChapterRow>img{width:64px;height:90px}.storyChapterInfo h3{font-size:15px}.storyChapterAction{grid-column:2;display:flex;align-items:center;justify-content:space-between;gap:8px}.storyChapterAction small{font-size:10px}.storyChapterAction button{font-size:11px;padding:8px}.storyTools{gap:8px}.storyTools select{max-width:128px}.storyRouteTabs button{padding:8px;font-size:12px}}
`;
