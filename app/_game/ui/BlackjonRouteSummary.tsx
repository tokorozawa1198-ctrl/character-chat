"use client";

import type { BlackjonRoute } from "../../gameTypes";
import { BLACKJON_ROUTES, BLACKJON_ROUTE_IDS } from "../../blackjonRoute";

export function BlackjonRouteSummary({ selected, onChoose }: { selected: BlackjonRoute | null; onChoose: () => void }) {
  return <section className="blackjonRouteSummary" aria-label="흑존 루트 선택 상태">
    <style>{STYLES}</style>
    <div className="blackjonRouteHeading"><div><small>10화 · 세 갈래의 사랑</small><h3 role="status">{selected ? `현재 선택: ${BLACKJON_ROUTES[selected].label}` : "형의 대답을 기다리는 중"}</h3></div><button onClick={onChoose}>{selected ? "분기 다시 선택" : "분기 선택으로"}</button></div>
    <ul>{BLACKJON_ROUTE_IDS.map((route) => <li key={route} data-selected={route === selected}><strong>{BLACKJON_ROUTES[route].label}{route === selected && " · 선택됨"}</strong><span>{BLACKJON_ROUTES[route].description}</span></li>)}</ul>
    <p>10화의 대답을 다시 고르면 현재 루트가 바뀝니다. 읽었던 장면은 다시 볼 수 있어요.</p>
  </section>;
}

const STYLES = `
.blackjonRouteSummary{margin-bottom:24px;padding:20px;border:1px solid #846574;border-radius:14px;background:#1c1922;color:#f6eef2}
.blackjonRouteHeading{display:flex;align-items:center;justify-content:space-between;gap:16px}.blackjonRouteHeading small{color:#d1b6c5;font-size:13px}.blackjonRouteHeading h3{margin:6px 0 0;font-size:20px}
.blackjonRouteHeading button{background:#ead2df;color:#261b24;border:1px solid #ead2df;border-radius:8px;padding:10px 16px;min-height:44px;font-weight:700;cursor:pointer;flex-shrink:0}
.blackjonRouteSummary ul{list-style:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:0;margin:18px 0 12px}.blackjonRouteSummary li{padding:13px;border:1px solid #ffffff26;border-radius:9px;background:#24212c}.blackjonRouteSummary li[data-selected=true]{border-color:#e4b9cf;background:#3b2938}.blackjonRouteSummary strong{display:block;font-size:15px;margin-bottom:7px}.blackjonRouteSummary li span,.blackjonRouteSummary p{color:#d7cbd4;font-size:14px;line-height:1.6}.blackjonRouteSummary p{margin:0}
@media(max-width:600px){.blackjonRouteSummary{padding:16px}.blackjonRouteHeading{align-items:flex-start;flex-wrap:wrap}.blackjonRouteSummary ul{grid-template-columns:1fr}.blackjonRouteHeading h3{font-size:18px}.blackjonRouteHeading button{font-size:14px}}
`;
