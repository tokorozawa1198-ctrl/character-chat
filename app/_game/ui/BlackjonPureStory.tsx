"use client";

import { BLACKJON_PURE_EP1_ENTRY } from "../../blackjonPureEpisode1";
import { BLACKJON_PURE_EP2_ENTRY } from "../../blackjonPureEpisode2";
import { BLACKJON_PURE_EP3_ENTRY } from "../../blackjonPureEpisode3";
import { BLACKJON_PURE_EP4_ENTRY } from "../../blackjonPureEpisode4";
import { BLACKJON_PURE_EP5_ENTRY } from "../../blackjonPureEpisode5";

export function BlackjonPureStory({ completed, completed2, completed3, completed4, completed5, resumeId, onStart }: {
  completed: boolean;
  completed2: boolean;
  completed3: boolean;
  completed4: boolean;
  completed5: boolean;
  resumeId?: string;
  onStart: (id: string) => void;
}) {
  return <section className="blackjonPureStory" aria-labelledby="blackjon-pure-heading">
    <style>{`
      .blackjonPureStory{max-width:1060px;margin:0 auto 32px;display:grid;grid-template-columns:180px minmax(0,1fr);gap:24px;padding:22px;border:1px solid var(--line,#635c60);border-radius:8px;background:var(--raised,#22272a);color:var(--ink,#f2f1ee)}
      .blackjonPureStory>img{width:100%;height:100%;max-height:240px;object-fit:cover;border-radius:5px}
      .novelApp .blackjonPureStory h2{font-size:23px;margin:8px 0 12px;color:inherit;animation:none}
      .blackjonPureStory p{font-size:14px;line-height:1.8;margin:8px 0}.blackjonPureStory small{font-size:12px}
      .blackjonPureStory nav{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
      .blackjonPureStory button{min-height:44px;padding:10px 16px;border:1px solid var(--accent,#d5b8b5);border-radius:5px;background:var(--surface,#171b1e);color:inherit;font-size:14px}
      .blackjonPureStory button:focus-visible{outline:2px solid var(--accent,#d5b8b5);outline-offset:3px}
      .blackjonPureStory button:disabled{opacity:.55;cursor:not-allowed}
      .blackjonPureStory .pureNextEpisode{margin-top:22px;padding-top:18px;border-top:1px solid var(--line,#635c60)}
      .blackjonPureStory h3{margin:8px 0;font-size:18px;color:inherit}
      @media(max-width:600px){.blackjonPureStory{grid-template-columns:1fr;gap:16px;padding:18px}.blackjonPureStory>img{height:180px;object-position:center 35%}.novelApp .blackjonPureStory h2{font-size:21px}.blackjonPureStory button{flex:1}}
    `}</style>
    <img src="/blackjon_pure_ep1_shop.png" alt="히로시마 반찬가게에서 한국말을 듣고 반가워하는 흑존" />
    <div>
      <small>흑존 · 순애 외전 {completed ? "· 1화 완독" : "· 새로운 첫 만남"}</small>
      <h2 id="blackjon-pure-heading">1화 — 저도 여기 살아요</h2>
      <p>같은 동네에서 저녁을 고르던 두 한국인. 반찬 이야기가 끝났는데도, 조금 더 말하고 싶어졌다.</p>
      <p>기존 공모·침식·충돌과 별개로 처음부터 시작하는 이야기입니다. 본편 분기와 관계 수치는 바뀌지 않습니다.</p>
      <nav aria-label="흑존 순애 외전 읽기">
        {resumeId && <button onClick={() => onStart(resumeId)}>순애 외전 이어 읽기</button>}
        <button onClick={() => onStart(BLACKJON_PURE_EP1_ENTRY)}>{resumeId ? "1화 처음부터" : completed ? "순애 외전 1화 다시 읽기" : "순애 외전 1화 읽기"}</button>
      </nav>
      <div className="pureNextEpisode">
        <small>{completed2 ? "2화 완독" : completed ? "다음 이야기" : "1화를 마치면 열립니다"}</small>
        <h3>2화 — 밥만 먹기는 아쉬워서</h3>
        <p>첫 저녁 약속, 함께 걷던 길, 두 사람이 처음 같이 나온 사진. 부끄러워도 묻고 싶은 말은 남겨두지 않기로 했다.</p>
        <nav aria-label="흑존 순애 외전 2화 읽기">
          <button disabled={!completed} onClick={() => onStart(BLACKJON_PURE_EP2_ENTRY)}>{completed2 ? "순애 외전 2화 다시 읽기" : "순애 외전 2화 읽기"}</button>
        </nav>
      </div>
      <div className="pureNextEpisode">
        <small>{completed3 ? "3화 완독" : completed2 ? "다음 이야기" : "2화를 마치면 열립니다"}</small>
        <h3>3화 — 사진에 안 남은 것</h3>
        <p>먼저 기다리던 형, 서로 다르게 고른 그림. 첫 데이트에서 가장 오래 남은 순간은 사진에 없었다.</p>
        <nav aria-label="흑존 순애 외전 3화 읽기">
          <button disabled={!completed2} onClick={() => onStart(BLACKJON_PURE_EP3_ENTRY)}>{completed3 ? "순애 외전 3화 다시 읽기" : "순애 외전 3화 읽기"}</button>
        </nav>
      </div>
      <div className="pureNextEpisode">
        <small>{completed4 ? "4화 완독" : completed3 ? "다음 이야기" : "3화를 마치면 열립니다"}</small>
        <h3>4화 — 못한 날에도 만나고 싶어서</h3>
        <p>멋있게 보이고 싶던 날, 생각대로 되지 않아도 형은 곁에 있었다. 조금 더 기대고 싶은 마음을 이번에는 숨기지 않았다.</p>
        <nav aria-label="흑존 순애 외전 4화 읽기">
          <button disabled={!completed3} onClick={() => onStart(BLACKJON_PURE_EP4_ENTRY)}>{completed4 ? "순애 외전 4화 다시 읽기" : "순애 외전 4화 읽기"}</button>
        </nav>
      </div>
      <div className="pureNextEpisode">
        <small>{completed5 ? "5화 완독" : completed4 ? "다음 이야기" : "4화를 마치면 열립니다"}</small>
        <h3>5화 — 화요일은 아직 멀어서</h3>
        <p>형이 먼저 만나자고 한 목요일. 늘 보던 노을도, 헤어질 때 조금 늦게 놓인 손도 자꾸 생각났다. 오늘 만났는데 벌써 보고 싶었다.</p>
        <nav aria-label="흑존 순애 외전 5화 읽기">
          <button disabled={!completed4} onClick={() => onStart(BLACKJON_PURE_EP5_ENTRY)}>{completed5 ? "순애 외전 5화 다시 읽기" : "순애 외전 5화 읽기"}</button>
        </nav>
      </div>
    </div>
  </section>;
}
