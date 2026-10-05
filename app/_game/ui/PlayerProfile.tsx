"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, UserRound, X } from "lucide-react";

const KEY = "geunddeokjon.player-profile.v1";
const AVATARS = ["/hidden_portrait.png", "/char_hidden.png", "/sd_geunddeok_idle.png", "/blackjon_profile_transparent.png"];
const FRAMES = [{ id: "gold", name: "금장" }, { id: "rose", name: "장미" }, { id: "steel", name: "흑철" }, { id: "starlight", name: "별빛" }] as const;
const THEMES = [{ id: "midnight", name: "한밤" }, { id: "sunset", name: "노을" }, { id: "blossom", name: "벚꽃" }] as const;
const TITLES = [{ id: "none", name: "칭호 없음" }, { id: "traveler", name: "히로시마 여행자" }, { id: "collector", name: "이야기 수집가" }, { id: "companion", name: "밤 산책 동행" }] as const;
type ProfileFrame = typeof FRAMES[number]["id"];
type ProfileTheme = typeof THEMES[number]["id"];
type ProfileTitle = typeof TITLES[number]["id"];
export type PlayerProfile = { nickname: string; address: string; bio: string; avatar: string; avatarFrame?: ProfileFrame; theme?: ProfileTheme; title?: ProfileTitle };
const EMPTY: PlayerProfile = { nickname: "", address: "", bio: "", avatar: AVATARS[0], avatarFrame: "gold", theme: "midnight", title: "none" };
const isAvatar = (value: unknown): value is string => typeof value === "string" && (AVATARS.includes(value) || (/^data:image\/(webp|jpeg);base64,[a-z0-9+/=]+$/i.test(value) && value.length < 350_000));
export const getProfileTitle = (id?: ProfileTitle) => TITLES.find((item) => item.id === id)?.name || "";

export function usePlayerProfile() {
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const value = JSON.parse(raw);
      if (typeof value.nickname !== "string" || !value.nickname.trim()) return;
      setPlayer({ nickname: value.nickname.trim().slice(0, 20), address: typeof value.address === "string" ? value.address.slice(0, 20) : "", bio: typeof value.bio === "string" ? value.bio.slice(0, 300) : "", avatar: isAvatar(value.avatar) ? value.avatar : AVATARS[0], avatarFrame: FRAMES.some((frame) => frame.id === value.avatarFrame) ? value.avatarFrame : "gold", theme: THEMES.some((theme) => theme.id === value.theme) ? value.theme : "midnight", title: TITLES.some((title) => title.id === value.title) ? value.title : "none" });
    } catch (error) { console.warn("[profile] Could not load profile", error); }
  }, []);
  function save(value: PlayerProfile) {
    localStorage.setItem(KEY, JSON.stringify(value));
    setPlayer(value);
  }
  return { player, save };
}

export function PlayerProfileEditor({ value, onSave, onCancel }: { value: PlayerProfile | null; onSave: (value: PlayerProfile) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(value || EMPTY);
  const [error, setError] = useState("");
  const photoInput = useRef<HTMLInputElement>(null);
  function addPhoto(file?: File) {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 5_000_000) { setError("PNG·JPG·WebP 사진을 5MB 이하로 선택해 주세요."); return; }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 320;
        const side = Math.min(image.width, image.height);
        const context = canvas.getContext("2d");
        if (!context) throw new Error("canvas-unavailable");
        context.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, 320, 320);
        const avatar = canvas.toDataURL("image/webp", 0.8);
        if (!isAvatar(avatar)) throw new Error("image-too-large");
        setDraft((current) => ({ ...current, avatar }));
        setError("");
      } catch { setError("사진을 처리하지 못했어요. 다른 사진으로 시도해 주세요."); }
      URL.revokeObjectURL(url);
    };
    image.onerror = () => { URL.revokeObjectURL(url); setError("사진을 열지 못했어요. 다른 사진으로 시도해 주세요."); };
    image.src = url;
  }
  return <div className="playerProfileBackdrop"><style>{STYLES}</style><section className="playerProfileDialog" role="dialog" aria-modal="true" aria-labelledby="player-profile-title">
    <button type="button" className="playerProfileClose" aria-label="프로필 닫기" onClick={onCancel}><X size={20}/></button>
    <span className="playerProfileEyebrow">YOUR STORY</span><h2 id="player-profile-title">{value ? "프로필 꾸미기" : "어떤 이름으로 만날까요?"}</h2>
    <div className={`playerProfilePreview playerProfileTheme-${draft.theme || "midnight"}`} aria-label="프로필 미리보기">
      <img className={`playerProfilePreviewAvatar playerProfileAvatar-${draft.avatarFrame || "gold"}`} src={draft.avatar} alt=""/>
      <div><small>PLAYER PROFILE</small><strong>{draft.nickname.trim() || "내 이름"}</strong><span>{getProfileTitle(draft.title) || "칭호를 선택해 보세요"}</span></div>
    </div>
    <form onSubmit={(event) => { event.preventDefault(); const nickname = draft.nickname.trim(); if (!nickname) { setError("닉네임을 입력해 주세요."); return; } try { onSave({ ...draft, nickname, address: draft.address.trim(), bio: draft.bio.trim() }); } catch { setError("프로필을 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요."); } }}>
      <fieldset><legend>프로필 이미지</legend><div className="playerAvatarOptions">{AVATARS.map((src, index) => <button type="button" key={src} aria-label={`프로필 이미지 ${index + 1}`} aria-pressed={draft.avatar === src} onClick={() => setDraft({ ...draft, avatar: src })}><img src={src} alt=""/></button>)}{!AVATARS.includes(draft.avatar) && <button type="button" aria-label="내 사진" aria-pressed="true" onClick={() => photoInput.current?.click()}><img src={draft.avatar} alt=""/></button>}<button type="button" className="playerPhotoAdd" onClick={() => photoInput.current?.click()}><Camera size={18}/><span>내 사진</span></button></div><input ref={photoInput} className="playerPhotoInput" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { addPhoto(event.target.files?.[0]); event.target.value = ""; }}/></fieldset>
      <fieldset className="playerFrameField"><legend>프사 테두리</legend><div className="playerFrameOptions">{FRAMES.map((frame) => <button type="button" key={frame.id} className={`playerFrameOption playerFrameOption-${frame.id}`} aria-pressed={(draft.avatarFrame || "gold") === frame.id} onClick={() => setDraft({ ...draft, avatarFrame: frame.id })}><span aria-hidden="true"/>{frame.name}</button>)}</div></fieldset>
      <fieldset className="playerChoiceField"><legend>프로필 배경</legend><div className="playerThemeOptions">{THEMES.map((theme) => <button type="button" key={theme.id} className={`playerThemeOption playerProfileTheme-${theme.id}`} aria-pressed={(draft.theme || "midnight") === theme.id} onClick={() => setDraft({ ...draft, theme: theme.id })}>{theme.name}</button>)}</div></fieldset>
      <fieldset className="playerChoiceField"><legend>칭호</legend><div className="playerTitleOptions">{TITLES.map((title) => <button type="button" key={title.id} aria-pressed={(draft.title || "none") === title.id} onClick={() => setDraft({ ...draft, title: title.id })}>{title.name}</button>)}</div></fieldset>
      <label>닉네임 <input autoFocus required maxLength={20} value={draft.nickname} placeholder="이름을 입력해 주세요" onChange={(e) => setDraft({ ...draft, nickname: e.target.value })}/></label>
      <label>원하는 호칭 <span>선택</span><input maxLength={20} value={draft.address} placeholder="예: 선생님, 히든님" onChange={(e) => setDraft({ ...draft, address: e.target.value })}/></label>
      <label>자기소개 <span>선택 · {draft.bio.length}/300</span><textarea maxLength={300} rows={3} value={draft.bio} placeholder="취미나 좋아하는 것, 알려주고 싶은 이야기" onChange={(e) => setDraft({ ...draft, bio: e.target.value })}/></label>
      <p className="playerProfileNote">프로필과 내 사진은 이 브라우저에만 저장됩니다. 닉네임은 시나리오 속 내 이름과 자유 채팅에 반영됩니다.</p>
      {error && <p role="alert">{error}</p>}<button className="playerProfileSubmit" type="submit">{value ? "변경 저장" : "이 이름으로 시작하기"}</button>
    </form>
  </section></div>;
}

export function PlayerProfileButton({ player, subtitle, onClick }: { player: PlayerProfile | null; subtitle?: string; onClick: () => void }) {
  return <><style>{STYLES}</style><button type="button" className={`playerProfileButton playerProfileTheme-${player?.theme || "midnight"}`} onClick={onClick} aria-label={`${player?.nickname || "내 프로필"} 프로필 꾸미기`}>{player ? <img className={`playerProfileAvatar playerProfileAvatar-${player.avatarFrame || "gold"}`} src={player.avatar} alt=""/> : <UserRound size={16}/>}<span className="playerProfileText"><strong>{player?.nickname || "내 프로필"}</strong>{subtitle && <small>{subtitle}</small>}</span></button></>;
}

const STYLES = `
.playerProfileBackdrop{position:fixed;inset:0;z-index:100000;background:rgba(8,9,14,.84);display:grid;place-items:center;padding:20px;overflow:auto;backdrop-filter:blur(12px);box-sizing:border-box}
.playerProfileDialog{position:relative;background:#202127;color:#f4edef;width:min(440px,100%);max-height:calc(100dvh - 40px);overflow:auto;padding:30px;border:1px solid #51414a;border-radius:8px;box-sizing:border-box;font-family:inherit}
.playerProfileDialog h2{font-size:24px;color:#fff;margin:10px 0 24px;letter-spacing:0}.playerProfileEyebrow{font-size:10px;color:#d6a5b6;letter-spacing:2px}.playerProfileClose{position:absolute;right:12px;top:12px;background:transparent;color:#ddd;border:0;padding:8px;cursor:pointer}
.playerProfilePreview{display:flex;align-items:center;gap:16px;min-height:108px;margin:0 0 24px;padding:16px;border:1px solid #ffffff48;border-radius:12px;color:#fff;box-sizing:border-box}.playerProfilePreview>div{display:grid;gap:4px;min-width:0}.playerProfilePreview small{font-size:10px;letter-spacing:1.6px;color:#fff9}.playerProfilePreview strong{font-size:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.playerProfilePreview span{font-size:12px;color:#fff}.playerProfilePreviewAvatar{width:70px;height:70px;flex:none;border-radius:50%;object-fit:cover;border:3px solid #deb974}.playerProfileTheme-midnight{background:linear-gradient(120deg,#111d2a,#293348 62%,#4a354e)}.playerProfileTheme-sunset{background:linear-gradient(120deg,#4d2d32,#965d47 62%,#d39c65)}.playerProfileTheme-blossom{background:linear-gradient(120deg,#46384d,#97627b 62%,#d493a6)}
.playerProfileDialog label{display:block;font-size:13px;margin-top:16px}.playerProfileDialog label span{color:#ada5ac;font-size:11px;margin-left:6px}.playerProfileDialog input,.playerProfileDialog textarea{display:block;width:100%;box-sizing:border-box;margin-top:8px;background:#15161b;color:#fff;border:1px solid #5c505b;border-radius:6px;padding:12px;font:inherit;font-size:16px;resize:vertical}.playerProfileDialog input:focus,.playerProfileDialog textarea:focus{outline:2px solid #d6a5b6;outline-offset:2px}
.playerProfileDialog fieldset{border:0;padding:0;margin:0}.playerProfileDialog legend{font-size:13px;margin-bottom:10px}.playerAvatarOptions{display:flex;gap:12px;flex-wrap:wrap}.playerAvatarOptions button{width:64px;height:64px;border-radius:50%;overflow:hidden;padding:0;border:2px solid transparent;background:#363038;cursor:pointer}.playerAvatarOptions button[aria-pressed=true]{border-color:#e7b0c3;box-shadow:0 0 0 3px #5a3b49}.playerAvatarOptions img{width:100%;height:100%;object-fit:cover}.playerAvatarOptions .playerPhotoAdd{display:grid;place-items:center;gap:0;border:1px dashed #b89eac;border-radius:12px;color:#f4edef;font-size:10px}.playerPhotoAdd span{margin:0!important;color:inherit!important;font-size:10px!important}.playerProfileDialog .playerPhotoInput{display:none}
.playerFrameField,.playerChoiceField{margin-top:18px!important}.playerFrameOptions,.playerThemeOptions,.playerTitleOptions{display:flex;gap:8px;flex-wrap:wrap}.playerFrameOption,.playerTitleOptions button{display:flex;align-items:center;gap:8px;min-height:44px;padding:6px 12px;border:1px solid #62565c;border-radius:8px;background:#28272c;color:#f4edef;cursor:pointer}.playerFrameOption[aria-pressed=true],.playerTitleOptions button[aria-pressed=true]{border-color:#e7b0c3;background:#4b3540}.playerFrameOption span{display:block;width:20px;height:20px;border-radius:50%;border:4px solid #deb974}.playerFrameOption-rose span{border-color:#d69ab4}.playerFrameOption-steel span{border-color:#8fa7b8}.playerFrameOption-starlight span{border-color:#bfc9ff;box-shadow:0 0 0 2px #6976bc88,0 0 12px #bfc9ff99}.playerProfileAvatar-starlight{border-color:#bfc9ff!important;box-shadow:0 0 0 2px #6976bc88,0 0 12px #bfc9ff99}
.playerThemeOption{min-width:88px;min-height:44px;padding:8px 12px;border:1px solid #ffffff55;border-radius:8px;color:#fff;font-size:12px;font-weight:700;cursor:pointer}.playerThemeOption[aria-pressed=true]{outline:2px solid #f5d7df;outline-offset:2px}.playerTitleOptions button{font-size:12px}
.playerProfileNote{font-size:11px;line-height:1.6;color:#aaa2aa;margin:16px 0}.playerProfileSubmit{position:sticky;bottom:0;z-index:2;width:100%;min-height:48px;padding:14px;border:0;border-radius:6px;background:#d6a5b6;color:#251820;font-weight:700;cursor:pointer;box-shadow:0 -8px 18px #202127}.playerProfileButton{display:flex;gap:8px;align-items:center;justify-content:flex-start;border:1px solid #ffffff48;color:#fff;padding:8px 12px;border-radius:6px;cursor:pointer;max-width:180px;min-width:0}.playerProfileAvatar{width:28px;height:28px;flex:none;border-radius:50%;object-fit:cover;border:2px solid #deb974}.playerProfileAvatar-rose{border-color:#d69ab4}.playerProfileAvatar-steel{border-color:#8fa7b8}.playerProfileText{display:grid;gap:2px;min-width:0;text-align:left}.playerProfileText strong,.playerProfileText small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.playerProfileText small{font-size:10px;color:#f2e9ed}.playerProfileText .playerProfileTitle{color:#ffe4af}
@media(max-width:760px){.side>.playerProfileButton{grid-column:1;grid-row:2;position:static;width:100%;max-width:none;min-height:60px;font-size:12px;padding:8px}.side>.playerProfileButton .playerProfileAvatar{width:40px;height:40px}.playerProfileDialog{padding:24px 20px}.playerProfileDialog h2{font-size:21px}.playerAvatarOptions{gap:8px}.playerAvatarOptions button{width:52px;height:52px}.playerProfilePreview{min-height:96px;padding:12px}.playerProfilePreviewAvatar{width:60px;height:60px}}
`;
