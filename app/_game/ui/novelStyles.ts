// Presentation-only layer. Character prompts, story text and game state belong to their existing modules.
export const NOVEL_CSS = `
html,body{background:#151719;letter-spacing:0}
.novelApp,.novelTitle{font-family:Pretendard,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;--font-display:Pretendard,sans-serif;--font-body:Pretendard,sans-serif}
.novelApp.novelApp{
 --surface:#171b1e;--raised:#22272a;--ink:#f2f1ee;--muted:#a7adb0;--accent:#d5b8b5;--line:#ffffff17;--accent-ink:#251d20;
 --bg-base:var(--surface);--bg-side:#121517;--bg-panel:var(--surface);--bg-card:var(--raised);--bg-card-glass:#22272ade;
 --border-card:var(--line);--border-card-hover:var(--accent);--accent-gold:var(--accent);--accent-gold-light:var(--ink);--accent-rose:var(--accent);--accent-pink:var(--accent);--accent-neon:var(--accent);
 --text-main:var(--ink);--text-side:var(--ink);--text-soft:var(--muted);--text-muted:var(--muted);--shadow-card:none;--shadow-glow:0 8px 28px #0002;
 display:grid;grid-template-columns:228px minmax(0,1fr);height:100dvh;min-height:0;overflow:hidden;color-scheme:dark;
}
.novelApp.theme-pure{--surface:#f5eff1;--raised:#fffafb;--ink:#49363e;--muted:#876f7a;--accent:#9e5d78;--line:#79556524;--accent-ink:#fff;--bg-side:#eee4e9;color-scheme:light}
.novelApp.theme-soft{--accent:#dca7b7}
.novelApp.theme-obsession{--surface:#171214;--raised:#241a1d;--ink:#ede0e2;--muted:#b29c9f;--accent:#c87882;--line:#c878822a;--bg-side:#110d0f;--accent-ink:#1a0e12}
.novelApp *{letter-spacing:0!important;box-sizing:border-box}
.novelApp button,.novelTitle button{font-family:inherit;cursor:pointer;transition:background .2s,border-color .2s,transform .2s}
.novelApp button:focus-visible,.novelApp input:focus-visible,.novelTitle button:focus-visible{outline:2px solid var(--accent,#d5b8b5);outline-offset:4px}
.novelApp button:disabled{cursor:default}
.novelApp .side{padding:20px 16px;display:flex;flex-direction:column;gap:14px;border-right:1px solid var(--line);overflow-y:auto;overflow-x:hidden;box-shadow:none;scrollbar-width:thin;scrollbar-color:var(--line) transparent}
.novelBrand{display:flex;align-items:center;justify-content:space-between;font-size:10px;font-weight:600;color:var(--muted);padding:0 8px}
.novelMenuToggle{display:none}
.novelApp .profileHead{gap:11px;padding:0 6px}
.novelApp .profileHead .avatar{width:42px;height:48px;object-fit:cover;border-radius:4px}
.novelApp .profileHead h1{font-size:19px;font-weight:650;margin:0 0 5px;color:var(--ink)}
.novelApp .profileHead p{font-size:11px;color:var(--muted);margin:0}
.novelApp .sideHeader{display:flex;flex-direction:column;gap:12px}
.novelApp .relBadge,.novelApp .statsBox,.novelApp .userLevelBar{padding:0 6px;margin:0;background:transparent!important;border:0!important;box-shadow:none!important;border-radius:0}
.novelApp .relBadgeTop{font-size:11px;gap:5px;color:var(--muted)}
.novelApp .relLvLabel,.novelApp .relLvName,.novelApp .relLvNext{font-size:11px;color:var(--muted)!important;text-shadow:none!important}
.novelApp .relProgressTrack{height:2px;margin-top:8px;background:var(--line)}
.novelApp .relProgressFill,.novelApp .userLvBarFill{background:var(--accent)!important;box-shadow:none!important}
.novelApp .statsBox{display:grid;grid-template-columns:1fr 1fr;gap:9px 14px}
.novelApp .statBar{margin:0}
.novelApp .statBar div{font-size:10px;color:var(--muted)!important;font-weight:400;text-shadow:none!important;margin-bottom:4px}
.novelApp .statBar b{font-weight:500;font-variant-numeric:tabular-nums}
.novelApp .statBar i{height:3px;background:var(--line)}
.novelApp .statBar:nth-child(1) em{background:#ca92a6}.novelApp .statBar:nth-child(2) em{background:#bd7979}.novelApp .statBar:nth-child(3) em{background:#ae8494}.novelApp .statBar:nth-child(4) em{background:#83ada6}
.novelApp .userLevelBar{order:5;margin-top:auto;border-top:1px solid var(--line)!important;padding-top:16px}
.novelApp .userLvBadge,.novelApp .coinChip{background:transparent!important;border:0!important;color:var(--accent)!important;padding:0;box-shadow:none}
.novelApp .userLvTitle,.novelApp .userLvExp,.novelApp .userLvRewardLink{color:var(--muted)!important;text-shadow:none!important;font-size:10px}
.novelApp .userLvBar{height:2px;margin:8px 0;background:var(--line)!important}
.novelApp .nav{display:flex;flex-direction:column;gap:4px;overflow:visible;padding-top:8px;border-top:1px solid var(--line)}
.novelApp.novelApp .nav button{display:flex;align-items:center;gap:12px;width:100%;min-height:42px;padding:10px 12px;font-size:13px;font-weight:500;border:1px solid transparent!important;border-radius:5px;background:transparent!important;color:var(--muted)!important;box-shadow:none!important;text-shadow:none!important;white-space:nowrap}
.novelApp.novelApp .nav button.active,.novelApp.novelApp .nav button:hover,.novelApp.novelApp .navGroupBtn.navGroupOpen{background:var(--raised)!important;color:var(--ink)!important;border-color:var(--line)!important}
.novelApp .nav button.active{box-shadow:inset 2px 0 var(--accent)!important}
.novelApp .nav button svg{flex:none}.novelApp .navCaret{margin-left:auto}
.novelApp .navGroup{position:relative;width:100%}
.novelApp .navDropdown{position:static!important;display:grid;grid-template-columns:1fr;min-width:0;width:100%;background:transparent!important;border:0!important;box-shadow:none!important;padding:3px 0 3px 18px;max-height:none;overflow:visible}
.novelApp .navDropdown button{min-height:34px;font-size:12px}
.novelApp .content{height:100%;min-height:0;background:var(--surface);isolation:isolate;overflow:hidden}
.novelApp .panel{padding:40px 44px;background:var(--surface)!important;animation:novelReveal .35s ease;backdrop-filter:none}
.novelApp .panel::after{display:none}
.novelApp .panel h2{font-size:27px;font-weight:600;color:var(--ink)!important;background:none!important;-webkit-text-fill-color:currentColor;text-shadow:none!important;margin:0 0 28px;line-height:1.3}
.novelApp .panel h3{color:var(--ink);font-size:17px;font-weight:550}
.novelApp .panel button{font-weight:550}
.novelApp .grid{grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
.novelApp.novelApp .cardBtn{border-radius:6px;box-shadow:none;background:var(--raised)!important;color:var(--ink)!important;padding:20px;line-height:1.6;overflow:hidden}
.novelApp .cardBtn b{font-weight:600;font-size:15px}.novelApp .cardBtn small{font-size:12px;color:var(--muted)!important}
.novelApp .scenarioCard{padding:0 0 18px!important;gap:8px;align-content:start}
.novelApp .scenarioCard>b,.novelApp .scenarioCard>small,.novelApp .scenarioLockReasons{margin:0 18px}
.novelScenarioThumb{width:100%;height:148px;object-fit:cover;display:block;margin-bottom:9px}
.novelApp .scenarioLocked{opacity:.6}.novelApp .scenarioLocked .novelScenarioThumb{filter:saturate(.35)}
.novelApp .scenarioLockChip{background:var(--surface);color:var(--muted);border:1px solid var(--line);font-size:10px}
.novelApp .hubDesc{color:var(--muted);font-style:normal;font-size:12px}
.novelApp .scenarioHubTabs,.novelApp .tabs{gap:5px;border-color:var(--line);padding-bottom:14px;scrollbar-width:thin}
.novelApp .scenarioHubTabs button,.novelApp .tabs button{border-radius:4px;background:transparent;color:var(--muted);border:1px solid var(--line);padding:9px 13px;font-size:12px}
.novelApp .scenarioHubTabs button.active,.novelApp .tabs button.active{background:var(--accent);color:var(--accent-ink);border-color:var(--accent);box-shadow:none}
.novelApp .homeView{position:relative;isolation:isolate;display:grid;grid-template-columns:minmax(280px,440px) minmax(180px,1fr);grid-template-rows:minmax(230px,1fr) auto auto;gap:24px;padding:64px 6% 34px;align-items:center;justify-items:start;min-height:100%;overflow:auto;background:#171b1e;font-family:inherit}
.novelApp .homeView::before{content:"";position:absolute;z-index:-3;inset:0;width:100%;height:100%;border-radius:0;filter:none;background:url('/novel-riverside.png') center/cover;opacity:.25;pointer-events:none}
.novelApp .homeView::after{content:"";position:absolute;z-index:-1;inset:0;background:linear-gradient(90deg,#171b1ef5 0%,#171b1eaa 32%,#171b1e00 62%),linear-gradient(0deg,#171b1e 0%,#171b1e00 60%);pointer-events:none}
.novelHomePortrait{position:absolute;z-index:-2;right:0;top:0;width:65%;height:100%;object-fit:cover;object-position:50% 18%;mask-image:linear-gradient(90deg,transparent,#000 25%);opacity:.95}
.novelApp .homeHeader{grid-column:1;align-self:center;text-align:left;margin:0;z-index:1}
.novelEyebrow{font-size:11px;font-weight:500;color:#c7bcb9;display:block;line-height:1.5}
.novelApp .homeLogo{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-start;gap:12px;padding:0;margin:18px 0}
.novelApp .homeLogo>span:not(.adminBadge){font-size:58px;color:#f6f1ef;text-shadow:none;font-weight:650;line-height:1.15}
.novelApp .homeLogo small{font-size:11px;padding:6px 10px;border:1px solid #d5b8b555;border-radius:3px;color:#ead4d1;background:#171b1e88;font-weight:500;box-shadow:none}
.novelHomeMood{margin:24px 0 0;font-size:15px;color:#e3d9d5;line-height:1.7}
.novelHomeMood>span{display:block;font-size:12px;color:#b0b0ae;margin-top:6px;max-width:280px}
.novelApp .homeStage{grid-column:2;grid-row:2 / 4;width:100%;height:220px;min-height:0;margin:0;align-self:end;justify-self:end;display:flex;justify-content:flex-end;align-items:flex-end;overflow:visible}
.novelApp .homeCharacterCard{position:relative;align-self:end;z-index:2}
.novelApp .homeCharacterCard img{width:145px;height:180px;max-height:none;object-fit:contain;filter:drop-shadow(0 8px 12px #0003)}
.novelApp .homeBubble{top:auto;bottom:180px;left:auto;right:0;width:175px;background:#24282bed!important;border:1px solid #c7bcb955!important;border-radius:12px;padding:12px 14px;color:#f4eae6!important;font:12px/1.65 Pretendard,sans-serif!important;box-shadow:0 8px 24px #0003;max-height:170px;overflow:visible;text-shadow:none!important}
.novelApp .homeBubble:before{display:none!important}.novelApp .homeBubble:after{left:auto;right:42px;width:10px;height:10px;bottom:-6px;background:#24282b;border-color:#c7bcb955}
.novelApp .homeCtaGrid{grid-column:1;grid-row:2;display:grid;width:100%;grid-template-columns:1fr 1fr;gap:8px;margin:0;z-index:2}
.novelApp.novelApp .homeCta{display:grid;grid-template-columns:24px 1fr 18px;align-items:center;gap:12px;min-height:64px;padding:15px;border-radius:4px;background:#1c2125e8!important;border:1px solid #ffffff25!important;box-shadow:none;color:#f1e7e4}
.novelApp.novelApp .homeCta:first-child{grid-column:1 / -1;background:#dcc3bf!important;color:#302324;min-height:70px}
.novelApp .homeCta::before{display:none}.novelApp .homeCtaEmoji{display:flex;font-size:18px;filter:none}
.novelApp .homeCta .homeCtaLabel{font-size:14px;font-weight:550;color:inherit!important}
.novelApp .homeCta:first-child .homeCtaLabel{color:#302324!important}
.novelApp .homeCta:first-child svg{color:#302324}
.novelApp .homeCta:last-child{grid-column:auto}.novelApp .homeCtaGrid .homeCta:nth-child(4){grid-column:1 / -1;min-height:48px}
.novelApp .homeCta:hover{transform:translateY(-2px);border-color:#d5b8b5!important}
.novelApp .homeWidgets{grid-column:1;grid-row:3;display:flex;flex-wrap:wrap;width:100%;gap:14px;margin:0}
.novelApp .homeWidget{background:transparent;border:0;border-top:1px solid #ffffff26;padding:12px 0;border-radius:0;flex:1;min-width:120px;box-shadow:none}
.novelApp .homeWidgetHead,.novelApp .homeWidgetHead strong{font-size:11px;color:#d5c9c6;font-weight:500}
.novelApp .homeWidgetBar{height:2px}.novelApp .homeWidgetBar div{background:#b992a4}
.novelApp .homeWidgetPetArt{width:32px;height:36px;border-radius:3px}.novelApp .homeWidgetPetBody b{font-size:12px}.novelApp .homeWidgetPetBody small{font-size:10px;color:#a5bfb7}
.novelApp.theme-pure .homeView{background:#352a31}.novelApp.theme-pure .homeView::after{background:linear-gradient(90deg,#352a31f5,#352a3170 48%,transparent),linear-gradient(0deg,#352a31,transparent 60%)}
.novelApp.theme-obsession .homeView{background:#190f13}.novelApp.theme-obsession .homeView::after{background:linear-gradient(90deg,#190f13f5,#190f1390 48%,transparent),linear-gradient(0deg,#190f13,transparent 70%)}
.novelApp.theme-obsession .novelHomePortrait{filter:saturate(.65)}
.novelApp.theme-obsession .homeBubble{background:#24171bed!important;color:#eadbdd!important;border-color:#9e5d6870!important}.novelApp.theme-obsession .homeBubble:after{background:#24171b;border-color:#9e5d6870}
.novelApp.theme-pure .homeBubble{background:#fff5f5f5!important;color:#5d3c4b!important;border-color:#c69da9!important}.novelApp.theme-pure .homeBubble:after{background:#fff5f5;border-color:#c69da9}
.novelChatHeader{display:flex;align-items:center;gap:12px;padding:18px 30px;border-bottom:1px solid var(--line);flex-shrink:0;background:var(--surface)}
.novelChatHeader img{width:37px;height:42px;object-fit:cover;border-radius:5px}.novelChatHeader>div{display:grid;gap:5px}.novelChatHeader strong{font-weight:600;font-size:15px}.novelChatHeader span{font-size:11px;color:var(--muted)}.novelChatRoute{margin-left:auto}
.novelApp .topBar{padding:12px 26px;gap:7px;background:var(--surface);border:0;flex:none;overflow-x:auto;min-height:0;scrollbar-width:thin}
.novelApp.novelApp .topBar button{background:transparent!important;color:var(--muted)!important;border:1px solid var(--line)!important;border-radius:5px;padding:8px 12px;font-size:11px;min-width:0;white-space:nowrap;box-shadow:none;font-weight:400}
.novelApp .chatArea{flex:1;min-height:0;overflow-y:auto;padding:22px max(28px,calc((100% - 860px)/2));background:var(--surface);gap:16px;overscroll-behavior:contain}
.novelApp .msgRow{gap:10px;margin:12px 0}.novelApp .chatAvatar{width:32px;height:38px;object-fit:contain;border-radius:0;background:transparent;flex:none}
.novelApp .bubble{padding:14px 18px;border-radius:3px 12px 12px 12px;border:1px solid var(--line);background:var(--raised)!important;color:var(--ink)!important;box-shadow:none!important;font-size:14px;font-weight:400;line-height:1.85;max-width:min(78%,600px);white-space:pre-wrap;overflow-wrap:anywhere;min-width:0}
.novelApp .bubble small{display:block;margin-top:8px;color:var(--muted)!important;font-size:10px;font-weight:400}
.novelApp .msgRow.user .bubble{background:var(--accent)!important;color:var(--accent-ink)!important;border:0;border-radius:12px 3px 12px 12px}
.novelApp .msgRow.user .bubble small{color:inherit!important;opacity:.65}
.novelApp .msgRow.narration .bubble{max-width:680px;width:100%;background:transparent!important;color:var(--muted)!important;border:0;border-left:2px solid var(--line);border-radius:0;font-size:13px;line-height:2;padding:8px 22px;font-style:normal}
.novelApp .inputBar{position:relative;display:grid;grid-template-columns:38px 38px minmax(0,1fr) 44px;gap:8px;align-items:center;padding:14px 26px max(14px,env(safe-area-inset-bottom));background:var(--surface)!important;border-top:1px solid var(--line);box-shadow:none;flex-shrink:0;width:100%;min-width:0}
.novelApp .inputBar input{width:100%;min-width:0;height:46px;padding:0 15px;border:1px solid var(--line);border-radius:6px;background:var(--raised)!important;color:var(--ink)!important;box-shadow:none;font:14px Pretendard,sans-serif}
.novelApp .inputBar input::placeholder{color:var(--muted)!important;opacity:.85}.novelApp .inputBar input:focus{border-color:var(--accent);box-shadow:none;outline:none}
.novelApp .inputBar button{display:grid;place-items:center;width:38px;min-width:0;height:42px;padding:0;border:0;border-radius:5px;background:transparent!important;color:var(--muted)!important;box-shadow:none}
.novelApp .inputBar button:last-child{width:44px;background:var(--accent)!important;color:var(--accent-ink)!important}.novelApp .inputBar button:disabled{opacity:.5}
.novelApp .bladderStatusBar{margin:0;padding:6px 28px;background:var(--surface);border:0;gap:9px;color:var(--muted);flex:none}.novelApp .bsbTrack{height:2px}.novelApp .bsbLabel{font-size:10px;color:var(--muted)}
.novelApp .galleryGrid{grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:16px}.novelApp .cgCard{height:auto;aspect-ratio:3/4;border-radius:5px;background:var(--raised)}
.novelApp .cgCardCaption{padding:28px 12px 13px;font-size:12px;font-weight:500}.novelApp .cgLockedBadge{font-size:22px;opacity:.65}
.novelApp .galleryProgress{background:transparent;border:0;border-bottom:1px solid var(--line);border-radius:0;padding:0 0 20px;color:var(--muted)}
.novelApp .galleryProgress span,.novelApp .galleryProgress strong{color:var(--muted);font-size:11px;font-weight:500}.novelApp .galleryProgressBar{height:3px;background:var(--line)}.novelApp .galleryProgressBar div{background:var(--accent)}
.novelApp .cgReaction{background:var(--raised);border-color:var(--line);border-radius:6px;box-shadow:none}.novelApp .cgReactionBody p{color:var(--ink);font-size:13px;font-weight:400}
.novelApp .profileIllustration img{border-radius:5px;border:0;max-height:600px;object-fit:cover}.novelApp .profileSummary h3{font-size:26px;font-weight:600}
.novelApp .profileStatsLine,.novelApp .profileDetails span,.novelApp .profileTextBlock p,.novelApp .profileMeta p{color:var(--muted)}
.novelApp .statusCard,.novelApp .profileMeta div,.novelApp .memoryPanel,.novelApp .statusNote,.novelApp .profileTextBlock{border-radius:5px;background:var(--raised)!important;border:1px solid var(--line)!important;box-shadow:none}
.novelApp .profileMeta div,.novelApp .profileTextBlock{background:transparent!important;border:0!important;border-top:1px solid var(--line)!important;padding:20px 0}
.novelApp .statusCard span{font-size:27px;-webkit-text-fill-color:var(--ink);font-weight:500}
.novelApp .memoryPanel p,.novelApp .memoryPanel small{color:var(--muted)}
.novelApp .questCard,.novelApp .shopCard,.novelApp .saveSlotCard,.novelApp .giftCard,.novelApp .petCard,.novelApp .achievementCard,.novelApp .diaryCard,.novelApp .letterCard{border-radius:6px!important;background:var(--raised)!important;color:var(--ink)!important;border-color:var(--line)!important;box-shadow:none!important}
.novelApp .panel :is(.advCard,.codexCard,.dailyCard,.mgCard,.soundCard,.snsPost,.journalEntry,.subUpcomingCard,.wardrobeCard,.achCard,.gachaPoolItem,.letterItem){background:var(--raised)!important;color:var(--ink)!important;border:1px solid var(--line)!important;border-radius:6px!important;box-shadow:none!important}
.novelApp .panel :is(.questTitle,.shopName,.giftName,.petName,.wardrobeName,.dailyTitle,.achTitle,.diaryCardTitle,.mapNodeTitle,.questProgressText,.questReward span,.ssScene,.letterReaderTitle,.advSectionTitle,.gachaSectionTitle,.subGroupTitle){color:var(--ink)!important;font-weight:550}
.novelApp .panel :is(.questDesc,.questHint,.shopDesc,.shopHint,.shopOwned,.giftDesc,.giftLockHint,.wardrobeDesc,.wardrobeHint,.dailyDesc,.achDesc,.diaryHint,.statsHint,.subGroupDesc,.mapHint,.mapNodeSubtitle,.miniMapHint,.ssPreview,.ssTime,.ssEmptyBody,.ssEmptyBody small,.snsHint,.snsPostText,.journalText,.gachaPityHint,.questReward small){color:var(--muted)!important;line-height:1.7;font-style:normal}
.novelApp .panel :is(.shopHeader,.achHeader,.snsHeader,.questReward,.giftReactionCard,.petFusionBox,.checkInCard,.quoteCard,.profileCard){background:var(--raised)!important;border:1px solid var(--line)!important;border-radius:6px;box-shadow:none;color:var(--ink)!important}
.novelApp .panel :is(.quoteText,.giftReactionText,.petFusionTitle,.petFusionDesc){color:var(--ink)!important}
.novelApp .panel :is(.shopBuyBtn,.ssBtnLoad,.ssBtnSave,.questClaimReady,.giftSendBtn){background:var(--accent)!important;color:var(--accent-ink)!important;border-radius:4px;box-shadow:none!important}
.novelApp .panel :is(.shopBuyBtn,.questClaimBtn):disabled{background:var(--surface)!important;color:var(--muted)!important;border:1px solid var(--line);border-radius:4px}
.novelApp .panel :is(.questProgressBar,.dailyProgressTrack){height:3px;background:var(--line)}.novelApp .questProgressBar div{background:var(--accent)!important}
.novelApp .ssStats span,.novelApp .ssRouteBadge{background:var(--surface);color:var(--muted);border-radius:3px}.novelApp .ssThumb{border-radius:4px;border:0}
.novelApp .saveSlotGrid{grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))}
.novelApp .panel :is(.questGrid,.shopGrid,.giftGrid,.wardrobeGrid,.petsGrid,.achGrid,.mgGrid,.advGrid,.dailyGrid,.codexGrid){gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))}
.novelApp .topBar,.novelApp .scenarioHubTabs,.novelApp .galleryTabs{scrollbar-width:none}.novelApp .topBar::-webkit-scrollbar,.novelApp .scenarioHubTabs::-webkit-scrollbar,.novelApp .galleryTabs::-webkit-scrollbar{display:none}
.novelApp .panel{scrollbar-width:thin;scrollbar-color:var(--line) transparent}
.novelApp .bigBtn{border-radius:5px;background:var(--accent)!important;color:var(--accent-ink)!important;box-shadow:none!important;font-size:13px}
.novelApp .routeBox{border-radius:0;background:transparent!important;border:0;border-bottom:1px solid var(--line);padding:0 0 20px}
.novelApp .scenarioOverlay{background:#090b0d;color:#f5f0ed}.novelApp .scenarioOverlay::before{filter:blur(18px);opacity:.35}.novelApp .scenarioOverlay::after{background:linear-gradient(0deg,#090b0de8,transparent 70%)}
.novelApp .vnImageStage{padding:0 0 180px}.novelApp .vnImageStage img{max-height:100%;height:100%;width:100%;object-fit:contain;filter:none}
.novelApp .vnTextbox{bottom:24px;width:min(1000px,calc(100% - 72px));max-height:65dvh;overflow:auto}
.novelApp .vnTitleRow{font-size:11px;color:#c7c0c1;font-weight:400;margin-bottom:12px}
.novelApp .vnName{background:#d5b8b5;color:#292125;border-radius:2px 2px 0 0;font-size:13px;padding:9px 24px;min-width:116px;text-shadow:none;text-align:center}
.novelApp .vnName-hidden{background:#99bcb5}.novelApp .vnName-narr{background:#40464b;color:#eee;font-style:normal}
.novelApp .vnDialogue{background:#11171be8;border:1px solid #ffffff24;border-top:2px solid #d5b8b5;border-radius:0 4px 4px 4px;padding:22px 30px;min-height:120px;max-height:29dvh;backdrop-filter:blur(16px)}
.novelApp .typeText{font-size:17px;line-height:1.9;color:#f0eceb;font-weight:400}
.novelApp .vnControls{gap:6px}.novelApp .vnControls button{font-size:11px;font-weight:400;background:#13191bd9;border:1px solid #ffffff20;border-radius:3px;padding:8px 15px}
.novelApp .vnChoices button{background:#182023ee;border:1px solid #d5b8b560;border-radius:4px;font-size:14px;font-weight:500;line-height:1.6;padding:14px 20px}.novelApp .vnChoices button:hover{background:#d5b8b5;color:#211a1c}
.novelApp .charSelectOverlay,.novelApp .tutorialOverlay{background:#0d1115eb;backdrop-filter:blur(15px)}
.novelApp .charSelectCard,.novelApp .tutorialCard{background:#191e22;border:1px solid #ffffff24;border-radius:8px;color:#eee;box-shadow:0 30px 80px #0005}
.novelApp .charSelectBtn{border-radius:6px;border-color:#ffffff28;background:#22292d;color:#eee}.novelApp .charSelectTag{background:#d5b8b5;color:#312127}
.novelTitle{position:relative;isolation:isolate;width:100%;min-height:100svh;background:#101518;color:#f5f0ed;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:90px 9%}
.novelTitleArt{position:absolute;inset:0;z-index:-3;width:100%;height:100%;object-fit:cover;object-position:65% center;background:#101518}
.novelTitleShade{position:absolute;inset:0;z-index:-2;background:linear-gradient(90deg,#101518fa,#101518d9 30%,#10151830 66%,transparent),linear-gradient(0deg,#101518b0,transparent 35%)}
.novelTitleBrand{position:absolute;top:35px;left:5%;right:5%;display:flex;justify-content:space-between;color:#d4cac5;font-size:10px}
.novelTitleCopy{max-width:500px;animation:novelReveal .9s ease}
.novelTitleCopy h1{font-family:Pretendard,sans-serif!important;font-weight:650;font-size:76px;line-height:1.2;margin:20px 0 30px;letter-spacing:0!important}
.novelTitleCopy p{font-size:15px;color:#c4bdba;line-height:1.9;margin:0 0 42px}
.novelTitleCopy button{display:flex;justify-content:space-between;align-items:center;gap:42px;padding:18px 24px;background:#ddc4bf;color:#2a2123;border:1px solid #ead8d4;border-radius:3px;font-weight:600;font-size:14px;min-width:240px}
.novelTitleCopy button:hover{background:#f0dcd7;transform:translateY(-2px)}
.novelTitleFoot{position:absolute;bottom:30px;font-size:9px;color:#999a99}
@keyframes novelReveal{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@media(min-width:1600px){.novelApp .homeView{padding-left:8%;grid-template-columns:470px 1fr}.novelApp .homeLogo>span:not(.adminBadge){font-size:68px}}
@media(max-width:1100px) and (min-width:761px){.novelApp.novelApp{grid-template-columns:195px minmax(0,1fr)}.novelApp .side{padding:20px 12px}.novelApp .homeView{padding:42px 28px 28px;grid-template-columns:minmax(240px,1fr) 155px;gap:18px}.novelApp .homeLogo>span:not(.adminBadge){font-size:46px}.novelApp .homeCharacterCard img{width:120px}.novelApp .homeBubble{width:150px}.novelApp .panel{padding:28px}}
@media(max-width:760px){
 .novelApp.novelApp{display:flex;flex-direction:column;height:100dvh;min-height:0;overflow:hidden}
 .novelApp .side{position:relative;top:auto;display:grid;grid-template-columns:minmax(0,1fr) 136px;gap:0 16px;flex:none;padding:10px 16px;border:0;border-bottom:1px solid var(--line);overflow:visible;z-index:30;background:var(--bg-side)!important;max-height:none}
 .novelApp .novelBrand{grid-column:1 / -1;padding:0;font-size:9px;min-height:32px}.novelMenuToggle{display:grid;place-items:center;width:32px;height:32px;padding:0;border:0;background:transparent;color:var(--ink)}
 .novelApp .profileHead{display:flex;padding:0;gap:8px}.novelApp .profileHead .avatar{width:27px;height:31px}.novelApp .profileHead h1{font-size:13px;margin-bottom:3px}.novelApp .profileHead p{font-size:9px}
 .novelApp .sideHeader{display:block}.novelApp .relBadge{display:none}.novelApp .statsBox{padding:0;gap:5px 10px}.novelApp .statBar div{font-size:8px;margin-bottom:3px}.novelApp .statBar i{height:2px}
 .novelApp .userLevelBar,.novelApp .loveMeterFloatBtn{display:none}
 .novelApp .nav{display:none}.novelApp.menuExpanded .nav{display:grid;position:absolute;top:100%;left:0;width:100%;max-height:calc(100dvh - 95px);overflow:auto;grid-template-columns:repeat(3,minmax(0,1fr));padding:16px;background:var(--bg-side);border-bottom:1px solid var(--line);box-shadow:0 20px 30px #0004;gap:8px}
 .novelApp .navGroup{grid-column:1 / -1}.novelApp.novelApp .nav button{font-size:12px;gap:7px;padding:10px 8px}.novelApp .navDropdown{grid-template-columns:repeat(3,minmax(0,1fr));padding:4px 0}
 .novelApp .content{flex:1;height:auto;min-height:0;overflow:hidden}
 .novelApp .panel{padding:24px 18px}.novelApp .panel h2{font-size:23px;margin-bottom:22px}.novelApp .grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.novelApp .cardBtn{padding:14px!important}.novelApp .scenarioCard{padding:0 0 14px!important}.novelApp .cardBtn b{font-size:12px}.novelApp .cardBtn small{font-size:10px}.novelScenarioThumb{height:115px}.novelApp .scenarioCard>b,.novelApp .scenarioCard>small,.novelApp .scenarioLockReasons{margin:0 10px}
 .novelApp .homeView{min-height:100%;display:grid;grid-template-columns:minmax(0,1fr) 116px;grid-template-rows:260px auto auto;gap:18px 8px;padding:28px 20px 24px;overflow:auto;align-content:start}
 .novelHomePortrait{width:85%;height:430px;object-fit:cover;object-position:50% 22%;mask-image:linear-gradient(0deg,transparent,#000 24%);opacity:.85}
 .novelApp .homeView::after{background:linear-gradient(90deg,#171b1e99,transparent 80%),linear-gradient(0deg,#171b1e 0%,#171b1e00 70%)}
 .novelApp .homeHeader{grid-column:1 / -1;align-self:start;padding-top:3px}.novelApp .homeLogo{margin:11px 0;gap:9px}.novelApp .homeLogo>span:not(.adminBadge){font-size:39px}.novelEyebrow{font-size:9px}.novelApp .homeLogo small{font-size:9px;padding:4px 7px}
 .novelHomeMood{font-size:12px;margin-top:15px}.novelHomeMood>span{font-size:10px;max-width:125px;line-height:1.7}
 .novelApp .homeStage{grid-row:2;grid-column:2;width:116px;height:180px;align-self:end}.novelApp .homeCharacterCard img{width:108px;height:135px}.novelApp .homeBubble{width:112px;right:0;bottom:132px;padding:9px 11px;font-size:11px!important;line-height:1.65!important;border-radius:10px;max-height:170px}
 .novelApp .homeCtaGrid{grid-column:1;grid-row:2;grid-template-columns:1fr;gap:7px}.novelApp.novelApp .homeCta{grid-template-columns:20px 1fr 15px;gap:9px;padding:12px;min-height:46px}.novelApp.novelApp .homeCta:first-child{min-height:55px;grid-column:auto}.novelApp .homeCtaGrid .homeCta:nth-child(4){grid-column:auto;min-height:46px}.novelApp .homeCta .homeCtaLabel{font-size:12px}.novelApp .homeCtaEmoji svg{width:18px}.novelCtaArrow{width:14px}
 .novelApp .homeWidgets{grid-column:1 / -1;grid-row:3}.novelApp .homeWidget{padding:10px 0}
 .novelChatHeader{padding:12px 16px}.novelChatHeader img{width:30px;height:34px}.novelChatHeader strong{font-size:13px}.novelChatHeader span{font-size:10px}
 .novelApp .topBar{padding:8px 14px}.novelApp.novelApp .topBar button{font-size:10px;padding:7px 10px}
 .novelApp .chatArea{padding:12px 14px}.novelApp .bubble{font-size:14px;line-height:1.8;padding:12px 14px;max-width:83%}.novelApp .chatAvatar{width:26px;height:32px}.novelApp .msgRow{gap:7px}.novelApp .msgRow.narration .bubble{font-size:12px;padding:8px 14px}
 .novelApp .inputBar{grid-template-columns:30px 30px minmax(0,1fr) 40px;padding:10px 10px max(10px,env(safe-area-inset-bottom));gap:4px}.novelApp .inputBar input{height:43px;font-size:16px;padding:0 10px}.novelApp .inputBar button{width:30px;height:40px}.novelApp .inputBar button:last-child{width:40px}.novelApp .inputBar .photoBtn{width:30px;min-width:0}.novelApp .bladderStatusBar{padding:5px 16px}
 .novelApp .galleryGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.novelApp .galleryProgress{gap:8px}.novelApp .cgReaction{grid-template-columns:50px minmax(0,1fr);padding:10px;gap:10px}.novelApp .cgReaction>img{width:50px;height:60px;border-radius:4px}.novelApp .cgReactionActions{grid-column:2}.novelApp .cgReactionBody p{font-size:12px}
 .novelApp .profileOverview{grid-template-columns:1fr!important}.novelApp .profileIllustration img{max-height:400px;object-position:center 20%}.novelApp .statusCards{grid-template-columns:1fr 1fr}.novelApp .statusCard{padding:12px;min-height:90px}.novelApp .profileDetails{flex-direction:row}
 .novelApp .vnImageStage{padding-bottom:210px}.novelApp .vnTextbox{bottom:12px;width:calc(100% - 24px);max-height:60dvh}.novelApp .vnTitleRow{font-size:10px;margin-bottom:8px}.novelApp .vnName{font-size:12px;padding:7px 16px;min-width:95px}.novelApp .vnDialogue{padding:16px 18px;min-height:125px;max-height:25dvh}.novelApp .typeText{font-size:15px;line-height:1.85}.novelApp .vnControls button{padding:8px 12px}.novelApp .vnChoices button{font-size:12px;padding:12px}
 .novelTitle{padding:100px 28px 70px;justify-content:flex-end}.novelTitleArt{object-fit:cover;object-position:60% center}.novelTitleShade{background:linear-gradient(0deg,#101518 0%,#101518df 24%,#10151833 65%,#10151822)}.novelTitleCopy h1{font-size:54px;margin:14px 0 18px}.novelTitleCopy p{font-size:13px;margin-bottom:25px}.novelTitleCopy button{min-width:225px;font-size:13px;padding:16px 20px}.novelTitleBrand{top:25px;font-size:8px}.novelTitleFoot{bottom:24px;font-size:8px}
}
@media(max-width:360px){.novelApp .homeView{padding:24px 14px;grid-template-columns:minmax(0,1fr) 100px}.novelApp .homeBubble{width:98px}.novelApp .homeStage{width:100px}.novelApp .homeCharacterCard img{width:95px}.novelApp .grid{grid-template-columns:1fr}.novelApp .galleryGrid{grid-template-columns:1fr 1fr}}
/* Character-first home: the equipped portrait stays the interactive centerpiece. */
.novelApp .homeView{flex:1;min-height:100%;height:100%;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:18px;padding:28px 32px max(28px,env(safe-area-inset-bottom));overflow-y:auto;overflow-x:hidden}
.novelApp .homeView::before{position:fixed;opacity:.23;background-position:center;inset:0}
.novelApp .homeView::after{position:fixed;background:#10181c66;inset:0}
.novelApp.theme-pure .homeView::after{background:#39233255}
.novelApp.theme-obsession .homeView::after{background:#180a12aa}
.novelApp .homeHeader{align-self:center;text-align:center;width:100%;flex:none;margin:0}
.novelApp .homeLogo{justify-content:center;margin:8px 0;gap:10px}
.novelApp .homeLogo>span:not(.adminBadge){font-size:32px}
.novelApp .novelHomeMood{margin:8px 0 0;font-size:12px}
.novelApp .novelHomeMood>span{max-width:none;font-size:11px;margin-top:3px}
.novelApp .homeStage{position:relative;display:flex;align-items:flex-end;justify-content:center;align-self:center;justify-self:auto;width:min(680px,100%);height:clamp(390px,54dvh,580px);min-height:390px;flex:1 0 auto;margin:0;padding:84px 0 12px;box-sizing:border-box}
.novelApp .homeCharacterCard{align-self:flex-end;max-width:100%;width:min(430px,86%);height:100%;display:flex;align-items:center;justify-content:center}
.novelApp .homeCharacterCard img{width:100%;height:100%;max-height:460px;object-fit:contain;filter:drop-shadow(0 22px 18px #0005);animation:homeCompanionFloat 4s ease-in-out infinite}
.novelApp .homeBubble{top:4px;right:8%;bottom:auto;left:auto;width:min(210px,62%);max-height:76px;overflow:auto;box-sizing:border-box;padding:10px 14px;font-size:12px!important;line-height:1.6!important}
.novelApp .homeBubble:after{right:auto;left:24px}
.novelApp .homeBubble{scrollbar-width:none}.novelApp .homeBubble::-webkit-scrollbar{display:none}
.novelApp .homeWardrobe{position:static;display:flex;align-items:center;gap:8px;background:#25242ddd;color:#f5e8ec;border:1px solid #c2a6ba66;border-radius:6px;padding:12px;cursor:pointer;font:inherit;font-size:12px}
.novelApp .homeCtaGrid{flex:none;width:min(680px,100%);grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.novelApp.novelApp .homeCta,.novelApp.novelApp .homeCta:first-child,.novelApp .homeCtaGrid .homeCta:nth-child(4){grid-column:auto;min-height:62px;padding:14px 12px;grid-template-columns:22px minmax(0,1fr);gap:8px}
.novelApp .homeCta .novelCtaArrow{display:none}
.novelApp .homeWidgets{flex:none;width:min(680px,100%);margin-top:0;padding-bottom:8px}
@keyframes homeCompanionFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-11px) scale(1.012)}}
@media(max-width:760px){.novelApp .homeView{padding:20px 18px 26px;gap:14px}.novelApp .homeLogo>span:not(.adminBadge){font-size:28px}.novelApp .homeStage{width:100%;height:clamp(340px,48dvh,470px);min-height:340px;padding-top:86px}.novelApp .homeCharacterCard{width:90%}.novelApp .homeCharacterCard img{max-height:370px}.novelApp .homeBubble{right:0;width:190px;max-height:78px}.novelApp .homeWardrobe{padding:10px}.novelApp .homeCtaGrid{grid-template-columns:repeat(2,minmax(0,1fr))}.novelApp.novelApp .homeCta{min-height:54px}.novelApp .novelHomeMood>span{max-width:100%}.novelApp .homeWidgets{gap:12px}}
/* Keep the dialogue anchored; oversized artwork must not scroll the whole scene. */
.novelApp .scenarioOverlay{height:100dvh;overflow:hidden;overscroll-behavior:none}
.novelApp .vnImageStage{height:100%;min-height:0;overflow:hidden;box-sizing:border-box}
.novelApp .vnImageStage img{min-height:0;max-height:100%;max-width:100%;object-fit:contain}
.novelApp .vnTextbox{position:absolute;top:auto;bottom:max(16px,env(safe-area-inset-bottom));margin:0;max-height:65dvh;overflow-y:auto;overscroll-behavior:contain}
@media(max-width:760px){.novelApp .vnTextbox{bottom:max(10px,env(safe-area-inset-bottom));max-height:60dvh}}
/* Archive and admin screens use one legible palette regardless of story route. */
.novelApp.novelApp:is([data-view="subScenarios"],[data-view="extraScenarios"],[data-view="admin"]){
 --surface:#15191d;--raised:#20262c;--ink:#f5f3ee;--muted:#bdc4c8;--accent:#e4b96d;--accent-ink:#231a0c;--line:#ffffff29;--bg-side:#111519;
 background:var(--surface);color:var(--ink);color-scheme:dark
}
.novelApp:is([data-view="subScenarios"],[data-view="extraScenarios"],[data-view="admin"]) .panel{width:100%;max-width:1100px;margin-inline:auto;box-sizing:border-box}
.novelApp:is([data-view="subScenarios"],[data-view="extraScenarios"],[data-view="admin"]) .panel h2{padding-bottom:18px;border-bottom:1px solid var(--line)}
.novelApp:is([data-view="subScenarios"],[data-view="extraScenarios"]) .scenarioHubTabs button.active{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.novelApp[data-view="subScenarios"] .subIntro,.novelApp[data-view="extraScenarios"] .hubDesc{background:none;border:0;padding:0 0 18px;margin:0 0 20px;border-bottom:1px solid var(--line);color:var(--muted);font-size:13px;font-weight:450;line-height:1.7}
.novelApp.novelApp[data-view="subScenarios"] .subGroup{background:#20262c!important;border:1px solid #ffffff2b!important;border-radius:14px;box-shadow:none;padding:22px;opacity:1;backdrop-filter:none}
.novelApp.novelApp[data-view="subScenarios"] .subGroupLocked{background:#1b2025!important;border-style:dashed!important}
.novelApp[data-view="subScenarios"] .subGroupEmoji{background:#e4b96d1c;border-color:#e4b96d40;border-radius:12px}
.novelApp[data-view="subScenarios"] .subGroupLabel{background:none;-webkit-text-fill-color:var(--ink);color:var(--ink);font-size:19px;font-weight:700;line-height:1.4}
.novelApp[data-view="subScenarios"] .subGroupDesc{display:block;min-width:0;white-space:normal;overflow-wrap:anywhere;color:var(--muted)!important;font-weight:450;font-size:13px;line-height:1.6}
.novelApp[data-view="subScenarios"] .subGroupCount{color:var(--accent);font-size:22px}
.novelApp[data-view="subScenarios"] .subGroupProgress small{color:var(--muted);font-size:11px}
.novelApp[data-view="subScenarios"] .subGroupBar{background:#ffffff20;height:4px;margin:18px 0}
.novelApp[data-view="subScenarios"] .subGroupBarFill{background:var(--accent);box-shadow:none}
.novelApp.novelApp[data-view="subScenarios"] .subEpisode,.novelApp.novelApp.theme-obsession[data-view="subScenarios"] .subEpisode{background:#181d22!important;border:1px solid #ffffff30!important;border-radius:10px;box-shadow:none;padding:16px;gap:7px;opacity:1;color:var(--ink)!important}
.novelApp.novelApp[data-view="subScenarios"] .subEpisode:hover{background:#252c33!important;border-color:#e4b96d88!important}
.novelApp.novelApp[data-view="subScenarios"] .subEpisode.subDone{border-color:#83b8a47a!important}
.novelApp.novelApp[data-view="subScenarios"] .subEpisodeLocked{border-style:dashed!important}
.novelApp[data-view="subScenarios"] .subEpisodeIcon{background:#e4b96d29;color:var(--accent)}
.novelApp[data-view="subScenarios"] .subEpisodeLocked .subEpisodeIcon{background:#ffffff1a;color:var(--muted)}
.novelApp.novelApp[data-view="subScenarios"] .subEpisode b{color:var(--ink)!important;font-size:14px;line-height:1.5}
.novelApp.novelApp[data-view="subScenarios"] .subEpisode small{color:var(--muted)!important;font-size:12px;font-weight:450;line-height:1.5}
.novelApp[data-view="subScenarios"] .subEpisodePlayBtn{min-height:42px;margin-top:8px;background:var(--accent);border:1px solid var(--accent);border-radius:7px;color:var(--accent-ink);font-size:13px;font-weight:700}
.novelApp[data-view="subScenarios"] .subEpisodePlayBtn:hover{background:#f3cc89;border-color:#f3cc89}
.novelApp[data-view="subScenarios"] .subEpisodeLocked .subEpisodePlayBtn{background:transparent;color:var(--accent);border-color:#e4b96d80}
.novelApp[data-view="subScenarios"] .subEpisodeLocked .subEpisodePlayBtn:hover{background:#e4b96d22}
.novelApp[data-view="subScenarios"] .subEpCostBadge{color:var(--accent);background:#e4b96d1c;border-color:#e4b96d55}
.novelApp[data-view="subScenarios"] .subUnlockConfirm{background:#e4b96d16;border-color:#e4b96d77;color:var(--ink)}
.novelApp[data-view="subScenarios"] .subUnlockYes{background:var(--accent);color:var(--accent-ink)}
.novelApp[data-view="subScenarios"] .subUnlockNo{background:var(--raised);color:var(--ink)}
.novelApp[data-view="extraScenarios"] .sectionStack{display:grid;gap:16px}
.novelApp[data-view="extraScenarios"] .sectionStack h3{margin:8px 0 0;font-size:17px;color:var(--ink)}
.novelApp[data-view="extraScenarios"] .sectionStack h3 small{color:var(--muted)!important}
.novelApp[data-view="extraScenarios"] .grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:12px}
.novelApp.novelApp[data-view="extraScenarios"] .cardBtn{min-height:112px;border:1px solid var(--line)!important;border-radius:10px;text-align:left;padding:18px!important}
.novelApp[data-view="extraScenarios"] .cardBtn b{display:block;font-size:15px;line-height:1.5;color:var(--ink)!important}
.novelApp[data-view="extraScenarios"] .cardBtn small{display:block;margin-top:8px;font-size:12px;line-height:1.55;color:var(--muted)!important}
.novelApp.novelApp[data-view="extraScenarios"] .scenarioLocked{opacity:1;background:#1b2025!important;border-style:dashed!important}
.novelApp.novelApp[data-view="extraScenarios"] .scenarioLocked b{color:#d1d5d7!important}
.novelApp[data-view="extraScenarios"] .scenarioLockChip{font-size:11px;color:var(--muted);background:#ffffff12}
.novelApp.novelApp[data-view="extraScenarios"] .secretRouteCard{background:#26231e!important;border-color:#e4b96d66!important;box-shadow:none;color:var(--ink)}
.novelApp[data-view="admin"] .adminPanel{gap:18px;max-width:900px}
.novelApp[data-view="admin"] .adminSection{min-width:0;gap:16px;padding:22px;background:var(--raised);border:1px solid var(--line);border-radius:12px}
.novelApp[data-view="admin"] .adminSectionTitle{color:var(--ink);font-size:17px;font-weight:700;letter-spacing:0;text-transform:none}
.novelApp[data-view="admin"] .memoryAdmin{color:var(--ink);gap:16px}
.novelApp[data-view="admin"] .memoryAdminHint,.novelApp[data-view="admin"] .memoryAdminCount,.novelApp[data-view="admin"] .memoryDate{color:var(--muted)}
.novelApp[data-view="admin"] .memoryAdminHint code{background:#ffffff17;color:var(--ink)}
.novelApp[data-view="admin"] .memoryAdminToolbar{flex-wrap:wrap}
.novelApp[data-view="admin"] .memoryAdminAddForm{background:#15191d;border:1px solid var(--line);padding:16px}
.novelApp[data-view="admin"] .memoryAdminInput,.novelApp[data-view="admin"] .memoryAdminTextarea{min-width:0;background:#15191d;border:1px solid #ffffff40;color:var(--ink);font-size:14px}
.novelApp[data-view="admin"] .memoryAdminInput::placeholder,.novelApp[data-view="admin"] .memoryAdminTextarea::placeholder{color:#aeb6ba;opacity:1}
.novelApp[data-view="admin"] .memoryAdminInput option{background:#20262c;color:var(--ink)}
.novelApp[data-view="admin"] .memoryAdminBtn{min-height:40px;background:#2d353d;border-color:#ffffff40;color:var(--ink);font-size:13px}
.novelApp[data-view="admin"] .memoryAdminBtn.primary{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.novelApp[data-view="admin"] .memoryAdminBtn.ghost{background:transparent}
.novelApp[data-view="admin"] .memoryAdminBtn.danger{background:#8d303033;border-color:#d98282;color:#ffd0d0}
.novelApp[data-view="admin"] .memoryAdminBtn:disabled{opacity:.55}
.novelApp[data-view="admin"] .memoryEmpty,.novelApp[data-view="admin"] .memoryItem{background:#181d22;border:1px solid var(--line);color:var(--ink)}
.novelApp[data-view="admin"] .memoryEmpty,.novelApp[data-view="admin"] .memoryItemText{color:var(--ink)}
.novelApp[data-view="admin"] .memoryBadge.auto{background:#80b5d729;color:#a6d8f5;border-color:#80b5d760}
.novelApp[data-view="admin"] .memoryBadge.manual{background:#e4b96d26;color:#f1d19d;border-color:#e4b96d60}
.novelApp[data-view="admin"] .memoryBadge.kind{background:#ffffff17;color:var(--muted);border-color:var(--line)}
.novelApp[data-view="admin"] .adminStatLabel,.novelApp[data-view="admin"] .adminStatVal{color:var(--ink)}
.novelApp[data-view="admin"] .adminStatBtns button,.novelApp[data-view="admin"] .adminRouteBtn{background:#2d353d;border-color:var(--line);color:var(--ink)}
.novelApp[data-view="admin"] .adminRouteBtn.active{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.novelApp[data-view="admin"] .adminLogoutBtn{color:#ffd0d0;border-color:#b65d5d80;background:#b65d5d22}
@media(max-width:760px){
 .novelApp[data-view="subScenarios"] .subGroup{padding:16px!important}.novelApp[data-view="subScenarios"] .subGroupHead{grid-template-columns:42px minmax(0,1fr) auto;gap:10px}.novelApp[data-view="subScenarios"] .subGroupEmoji{width:42px;height:42px;font-size:25px}.novelApp[data-view="subScenarios"] .subGroupLabel{font-size:16px}.novelApp[data-view="subScenarios"] .subGroupCount{font-size:18px}.novelApp[data-view="subScenarios"] .subEpisodes{grid-template-columns:1fr}
 .novelApp[data-view="extraScenarios"] .grid{grid-template-columns:1fr}.novelApp[data-view="extraScenarios"] .cardBtn{min-height:0}
 .novelApp[data-view="admin"] .adminSection{padding:16px}.novelApp[data-view="admin"] .memoryAdminAddRow{flex-wrap:wrap}.novelApp[data-view="admin"] .memoryAdminAddRow .memoryAdminInput{flex:1 1 100%}.novelApp[data-view="admin"] .adminStatRow{grid-template-columns:54px minmax(0,1fr) 42px}.novelApp[data-view="admin"] .adminStatBtns{grid-column:1/-1;justify-content:flex-end}
}
@media(prefers-reduced-motion:reduce){.novelApp *,.novelTitle *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;
