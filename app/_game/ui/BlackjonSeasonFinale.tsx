"use client";

import { useEffect, useRef, useState } from "react";

export function BlackjonSeasonNotice({ onReplay }: { onReplay: () => void }) {
  return <section className="blackjonSeasonNotice" aria-labelledby="blackjon-season-notice-title">
    <style>{`
      .blackjonSeasonNotice{margin:16px 0;padding:22px;border:1px solid #72505a;border-radius:12px;background:linear-gradient(135deg,#21161e,#11131c);color:#f4e6e9}
      .app .panel .blackjonSeasonNotice h2{margin:0 0 8px;font-size:20px;letter-spacing:.06em;color:#f4e6e9 !important;background:none;-webkit-text-fill-color:#f4e6e9;animation:none}
      .blackjonSeasonNotice p{margin:6px 0;font-size:13px;line-height:1.7;color:#d1bdc4}
      .blackjonSeasonNotice button{margin-top:12px;min-height:44px;padding:10px 16px;border:1px solid #9d7482;border-radius:6px;background:#2b1c27;color:#ffeaf0;cursor:pointer}
      .blackjonSeasonNotice button:focus-visible{outline:2px solid #f4c4c4;outline-offset:3px}
    `}</style>
    <h2 id="blackjon-season-notice-title">시즌 1부 종료</h2>
    <p>흑존 · 충돌 20화 완독. 끝난 것은, 기다림뿐이었다.</p>
    <p>시즌 2는 21화부터 이어집니다. 21화는 아직 공개되지 않았습니다.</p>
    <button type="button" onClick={onReplay}>시즌 1 종료 연출 다시 보기</button>
  </section>;
}

// 정지 원화를 이용한 종료 연출. 자동 재생 음성·빠른 섬광·자동 닫힘은 없다.
export function BlackjonSeasonFinale({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [skip, setSkip] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return <dialog
    ref={dialogRef}
    className="blackjonFinale"
    data-skip={skip}
    data-ready={ready}
    aria-labelledby="blackjon-season-title"
    aria-describedby="blackjon-season-description"
    onCancel={(event) => { event.preventDefault(); onClose(); }}
  >
    <style>{STYLES}</style>
    <div className="blackjonFinalePortrait" aria-hidden="true">
      <img src="/blackjon_ep20_collision_finale.png" alt="" onLoad={() => setReady(true)} onError={() => setReady(true)} />
    </div>
    <div className="blackjonFinaleShade" aria-hidden="true" />
    <div className="blackjonFinaleBlackout" aria-hidden="true" />
    <div className="blackjonFinaleWhispers" aria-hidden="true">
      <p>형이 어디 가든.</p>
      <p>저도 같이 가면 되니까.</p>
    </div>
    <section className="blackjonFinaleCard">
      <p className="blackjonFinaleEyebrow">흑존 · 충돌</p>
      <h1 id="blackjon-season-title">시즌 1부 종료</h1>
      <blockquote>“저 이제 기다리는 거 안 할래요.”</blockquote>
      <p id="blackjon-season-description">끝난 것은, 기다림뿐이었다.</p>
      <p className="blackjonFinaleNext">시즌 2에서 계속됩니다 · 21화부터</p>
    </section>
    <nav className="blackjonFinaleControls" aria-label="시즌 종료 연출 조작">
      <button type="button" onClick={() => setSkip(true)} disabled={skip} autoFocus>연출 건너뛰기</button>
      <button type="button" onClick={onClose}>목차로 돌아가기</button>
    </nav>
  </dialog>;
}

const STYLES = `
.blackjonFinale{position:fixed;inset:0;margin:0;padding:0;border:0;max-width:none;max-height:none;width:100%;height:100%;height:100dvh;background:#030406;color:#f5f0ed;overflow:hidden;isolation:isolate}
.blackjonFinale::backdrop{background:#030406}
.blackjonFinalePortrait{position:absolute;inset:0;display:flex;justify-content:center;overflow:hidden}
.blackjonFinalePortrait img{height:100%;width:auto;max-width:none;object-fit:cover;object-position:center 34%;transform-origin:50% 36%;filter:brightness(.76) saturate(.7);animation:bjFinaleApproach 12s cubic-bezier(.14,.45,.24,1) both;animation-play-state:paused}
.blackjonFinaleShade{position:absolute;inset:0;background:linear-gradient(0deg,#030406 0%,rgba(3,4,6,.92) 14%,transparent 56%),radial-gradient(ellipse at 50% 34%,transparent 18%,rgba(3,4,6,.24) 60%,#030406 100%);pointer-events:none}
.blackjonFinaleBlackout{position:absolute;inset:0;z-index:1;background:#000;pointer-events:none;animation:bjFinaleReveal 2.4s ease both;animation-play-state:paused}
.blackjonFinaleWhispers{position:absolute;inset:0;pointer-events:none;display:grid;place-items:center;z-index:2}
.blackjonFinaleWhispers p{position:absolute;top:65%;margin:0;padding:0 22px;font-size:clamp(17px,2.4vw,28px);letter-spacing:.13em;color:#ede1df;text-align:center;text-shadow:0 2px 18px #000;opacity:0;animation:bjFinaleWhisper 3.2s ease 1.5s both;animation-play-state:paused}
.blackjonFinaleWhispers p:nth-child(2){animation-delay:4.8s;color:#e2c2c2}
.blackjonFinaleCard{position:absolute;bottom:max(106px,calc(env(safe-area-inset-bottom) + 96px));left:16px;right:16px;text-align:center;z-index:2;opacity:0;animation:bjFinaleTitle 2s ease 8.2s both;animation-play-state:paused}
.blackjonFinaleEyebrow{font-size:12px;letter-spacing:.32em;color:#d8abab;margin:0 0 12px}
.blackjonFinaleCard h1{font-family:Georgia,'Noto Serif KR',serif;font-size:clamp(28px,4.5vw,52px);font-weight:500;letter-spacing:.12em;line-height:1.4;margin:0;text-shadow:0 1px 20px #000}
.blackjonFinaleCard blockquote{margin:20px 0 12px;font-size:clamp(16px,2vw,23px);color:#f3d9d6;line-height:1.6}
.blackjonFinaleCard #blackjon-season-description{font-size:14px;line-height:1.6;color:#cbbfc0;margin:0}
.blackjonFinaleNext{margin:16px 0 0;font-size:12px;letter-spacing:.08em;line-height:1.7;color:#b3a9ac}
.blackjonFinaleControls{position:absolute;bottom:max(24px,env(safe-area-inset-bottom));left:16px;right:16px;display:flex;justify-content:center;gap:12px;z-index:3}
.blackjonFinaleControls button{min-height:44px;padding:10px 18px;border:1px solid #66565c;border-radius:4px;background:#0c0b10;color:#f0e2e4;font-size:13px;cursor:pointer}
.blackjonFinaleControls button:focus-visible{outline:2px solid #f4c4c4;outline-offset:4px}
.blackjonFinaleControls button:disabled{color:#a499a0;cursor:default}
.blackjonFinale[data-ready=true] .blackjonFinalePortrait img,.blackjonFinale[data-ready=true] .blackjonFinaleBlackout,.blackjonFinale[data-ready=true] .blackjonFinaleWhispers p,.blackjonFinale[data-ready=true] .blackjonFinaleCard{animation-play-state:running}
.blackjonFinale[data-skip=true] .blackjonFinalePortrait img{animation:none;transform:scale(1.13)}
.blackjonFinale[data-skip=true] .blackjonFinaleBlackout,.blackjonFinale[data-skip=true] .blackjonFinaleWhispers{display:none}
.blackjonFinale[data-skip=true] .blackjonFinaleCard{animation:none;opacity:1}
@keyframes bjFinaleApproach{from{transform:scale(1);filter:brightness(.86) saturate(.85)}to{transform:scale(1.13);filter:brightness(.76) saturate(.7)}}
@keyframes bjFinaleReveal{0%,22%{opacity:1}100%{opacity:0}}
@keyframes bjFinaleWhisper{0%,100%{opacity:0;transform:translateY(5px)}20%,75%{opacity:1;transform:translateY(0)}}
@keyframes bjFinaleTitle{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:600px){.blackjonFinalePortrait img{width:100%;height:100%;object-fit:cover;object-position:50% 30%}.blackjonFinaleCard{bottom:max(100px,calc(env(safe-area-inset-bottom) + 86px))}.blackjonFinaleCard blockquote{margin:15px 0 10px}.blackjonFinaleControls{gap:8px}.blackjonFinaleControls button{padding:10px 12px}}
@media(max-height:600px){.blackjonFinaleCard{bottom:75px}.blackjonFinaleCard h1{font-size:27px}.blackjonFinaleCard blockquote{margin:8px 0;font-size:16px}.blackjonFinaleEyebrow{margin-bottom:5px}.blackjonFinaleNext{margin-top:7px}.blackjonFinaleControls{bottom:12px}.blackjonFinaleWhispers p{top:56%}}
@media(prefers-reduced-motion:reduce){.blackjonFinale .blackjonFinalePortrait img{animation:none;transform:none}.blackjonFinale .blackjonFinaleBlackout,.blackjonFinale .blackjonFinaleWhispers{display:none}.blackjonFinale .blackjonFinaleCard{animation:none;opacity:1}}
`;
