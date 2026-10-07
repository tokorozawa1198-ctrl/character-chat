"use client";

import { useEffect, useState } from "react";

export function SceneIllustration({ image, video, title }: { image: string; video?: string; title: string }) {
  const [animate, setAnimate] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAnimate(!preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => setFailed(false), [video]);

  return <div className="vnMediaFrame">
    <img src={image} alt={title} className="vnSceneImg" onError={(event) => { event.currentTarget.src = "/oppa1.png"; }} />
    {video && animate && !failed && <video key={video} src={video} poster={image} autoPlay muted playsInline preload="metadata" aria-label={`${title} · 각성 연출`} onError={() => setFailed(true)} />}
  </div>;
}
