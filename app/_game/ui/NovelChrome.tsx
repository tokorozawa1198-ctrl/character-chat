"use client";

import { ArrowRight, BookOpen, Camera, Compass, Gamepad2, Heart, House, Images, Menu, MessageCircle, Save, Settings, Shirt, ShoppingBag, Trophy, UserRound, X } from "lucide-react";

const icons = { home: House, chat: MessageCircle, scenarioMenu: BookOpen, gallery: Images, quests: Trophy, shop: ShoppingBag, g_game: Gamepad2, g_content: BookOpen, g_etc: Settings, profile: UserRound, save: Save, miniMap: Compass, wardrobe: Shirt };

export function ViewIcon({ view, size = 19 }: { view: string; size?: number }) {
  const Icon = icons[view as keyof typeof icons] ?? Heart;
  return <Icon size={size} strokeWidth={1.6} aria-hidden="true" />;
}

export function MobileMenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return <button className="novelMenuToggle" onClick={onClick} aria-expanded={open} aria-controls="game-navigation" aria-label={open ? "메뉴 닫기" : "메뉴 열기"} title={open ? "메뉴 닫기" : "메뉴 열기"}>{open ? <X size={21} /> : <Menu size={21} />}</button>;
}

export function NovelTitle({ image, onStart }: { image: string; onStart?: () => void }) {
  return <main className="novelTitle">
    <img className="novelTitleArt" src="/novel-keyvisual.png" alt="히로시마 강가에서 기다리는 근떡존" onError={(e) => { e.currentTarget.src = image; }} />
    <div className="novelTitleShade" />
    <div className="novelTitleBrand"><span>INTERACTIVE VISUAL NOVEL</span><span>HIROSHIMA</span></div>
    <div className="novelTitleCopy">
      <span className="novelEyebrow">너와 나, 그 사이의 이야기</span>
      <h1>근떡존</h1>
      <p>처음 마주친 순간부터,<br />아직 쓰이지 않은 우리의 마지막까지.</p>
      <button onClick={onStart} disabled={!onStart}>이야기 시작하기 <ArrowRight size={20} /></button>
    </div>
    <span className="novelTitleFoot">A STORY THAT STAYS WITH YOU</span>
  </main>;
}

export { ArrowRight, Camera, House, MessageCircle };
