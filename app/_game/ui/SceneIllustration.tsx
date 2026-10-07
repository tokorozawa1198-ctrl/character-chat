"use client";

import { useEffect, useRef, useState } from "react";

export function SceneIllustration({ image, video, title }: { image: string; video?: string; title: string }) {
  const [animate, setAnimate] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAnimate(!preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => { setFailed(false); setEnded(false); setPaused(false); }, [video]);
  useEffect(() => {
    if (video && animate) videoRef.current?.play().catch(() => setPaused(true));
  }, [video, animate]);

  function togglePlayback() {
    const player = videoRef.current;
    if (!player) return;
    if (player.paused || player.ended) {
      if (player.ended) player.currentTime = 0;
      player.play().catch(() => setPaused(true));
    } else player.pause();
  }

  return <div className="vnMediaFrame">
    <img src={image} alt={title} className="vnSceneImg" onError={(event) => { event.currentTarget.src = "/oppa1.png"; }} />
    {video && animate && !failed && <>
      <video ref={videoRef} key={video} src={video} poster={image} autoPlay muted playsInline preload="metadata" aria-label={`${title} · 장면 연출`} onPlay={() => { setPaused(false); setEnded(false); }} onPause={() => setPaused(true)} onEnded={() => setEnded(true)} onError={() => setFailed(true)} />
      <button type="button" className="vnPlaybackControl" onClick={togglePlayback}>{ended ? "연출 다시 보기" : paused ? "연출 재생" : "연출 일시정지"}</button>
    </>}
  </div>;
}
