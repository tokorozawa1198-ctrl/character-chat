"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { actionItems, galleryImages, moodImages, profile, quickReplies, visualChoices } from "./_game/data/character";
import { datingEvents, isDatingEventId, type DatingEventId } from "./_game/data/datingEvents";
import { clampAffinity, getAffinityDelta, getDirectEventId, getRandomEventId, getScenarioEventId, nowTime, pickMoodImage, wantsImage } from "./_game/engine/gameEngine";
import type { ActionItem, DatingEventChoice, Message, SeenEventRecord, SpeechRecognitionLike, ViewMode } from "./_game/types";

export default function Page() {
  const [started, setStarted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [currentImage, setCurrentImage] = useState(moodImages.normal);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "다시 시작할까? 나 여기 있어.", avatar: moodImages.normal, time: nowTime() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState(moodImages.normal);
  const [styleCount, setStyleCount] = useState(0);
  const [affinity, setAffinity] = useState(37);
  const [activeEvent, setActiveEvent] = useState<DatingEventId | null>(null);
  const [seenEventRecords, setSeenEventRecords] = useState<SeenEventRecord[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [gameFlags, setGameFlags] = useState<Record<string, boolean>>({});
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const lastAssistantMessage = useMemo(() => {
    return [...messages].reverse().find((m) => m.role === "assistant") ?? messages[0];
  }, [messages]);

  const affectionStage = useMemo(() => {
    if (affinity >= 90) return "연인 직전";
    if (affinity >= 75) return "썸 깊음";
    if (affinity >= 60) return "확실히 호감";
    if (affinity >= 45) return "친해짐";
    return "어색함";
  }, [affinity]);

  const status = useMemo(() => {
    if (loading) return "답장 쓰는 중...";
    if (affinity >= 90) return "너한테 많이 약해짐";
    if (affinity >= 75) return "괜히 붙어있고 싶음";
    if (affinity >= 55) return "장난치는 중";
    return "너 생각 중 ㅋㅋ";
  }, [loading, affinity]);

  async function speak(text: string) {
    if (!ttsEnabled) return;
    if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null; }
    try {
      setIsSpeaking(true);
      const res = await fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      const data = await res.json();
      if (!data.audio) { setIsSpeaking(false); return; }
      const audio = new Audio(data.audio);
      currentAudioRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); currentAudioRef.current = null; };
      audio.onerror = () => { setIsSpeaking(false); currentAudioRef.current = null; };
      await audio.play();
    } catch { setIsSpeaking(false); }
  }

  function initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("이 브라우저는 음성 인식을 지원하지 않습니다. 크롬을 써주세요."); return null; }
    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR"; recognition.interimResults = true; recognition.continuous = false;
    recognition.onresult = (event: any) => { setInput(Array.from(event.results).map((r: any) => r[0].transcript).join("")); };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    return recognition;
  }

  function toggleListening() {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const recognition = initRecognition(); if (!recognition) return;
    recognitionRef.current = recognition; recognition.start(); setIsListening(true);
  }

  useEffect(() => {
    const savedMessages = localStorage.getItem("geuntteokjon-messages");
    const savedAffinity = localStorage.getItem("geuntteokjon-affinity");
    const savedStyles = localStorage.getItem("style-examples");
    const savedSeenEvents = localStorage.getItem("geuntteokjon-seen-events");
    const savedTtsEnabled = localStorage.getItem("geuntteokjon-tts");
    const savedFlags = localStorage.getItem("geuntteokjon-flags");
    if (savedMessages) { try { const p = JSON.parse(savedMessages); if (Array.isArray(p) && p.length) setMessages(p); } catch { localStorage.removeItem("geuntteokjon-messages"); } }
    if (savedAffinity) { const p = Number(savedAffinity); if (!Number.isNaN(p)) setAffinity(p); }
    if (savedStyles) { try { const p = JSON.parse(savedStyles); setStyleCount(Array.isArray(p) ? p.length : 0); } catch { localStorage.removeItem("style-examples"); } }
    if (savedSeenEvents) { try { const p = JSON.parse(savedSeenEvents); if (Array.isArray(p)) setSeenEventRecords(p); } catch { localStorage.removeItem("geuntteokjon-seen-events"); } }
    if (savedTtsEnabled !== null) setTtsEnabled(savedTtsEnabled === "true");
    if (savedFlags) { try { setGameFlags(JSON.parse(savedFlags)); } catch { localStorage.removeItem("geuntteokjon-flags"); } }
  }, []);

  useEffect(() => { localStorage.setItem("geuntteokjon-messages", JSON.stringify(messages)); bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { localStorage.setItem("geuntteokjon-affinity", String(affinity)); }, [affinity]);
  useEffect(() => { localStorage.setItem("geuntteokjon-seen-events", JSON.stringify(seenEventRecords)); }, [seenEventRecords]);
  useEffect(() => { localStorage.setItem("geuntteokjon-tts", String(ttsEnabled)); }, [ttsEnabled]);
  useEffect(() => { localStorage.setItem("geuntteokjon-flags", JSON.stringify(gameFlags)); }, [gameFlags]);

  function getStyleExamples() { try { const saved = localStorage.getItem("style-examples"); return saved ? JSON.parse(saved).slice(0, 6) : []; } catch { return []; } }
  function saveStyleExample(text: string) { const cleaned = text.trim(); if (!cleaned) return; const current = getStyleExamples(); const next = [cleaned, ...current].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 6); localStorage.setItem("style-examples", JSON.stringify(next)); setStyleCount(next.length); }
  function clearStyleExamples() { localStorage.removeItem("style-examples"); setStyleCount(0); }

  function resetChat() {
    if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null; }
    setMessages([{ role: "assistant", content: "다시 시작할까? 나 여기 있어.", avatar: moodImages.normal, time: nowTime() }]);
    setCurrentImage(moodImages.normal); setAffinity(37); setActiveEvent(null);
    localStorage.setItem("geuntteokjon-messages", JSON.stringify([{ role: "assistant", content: "다시 시작할까? 나 여기 있어.", avatar: moodImages.normal, time: nowTime() }]));
  }

  function openProfile(image = currentImage) { setSelectedImage(image); setShowProfile(true); }

  function markEventSeen(eventId: DatingEventId) {
    const target = datingEvents[eventId];
    setSeenEventRecords((prev) => {
      if (prev.some((item) => item.id === eventId)) return prev;
      return [...prev, { id: eventId, title: target.title, seenAt: new Date().toISOString() }];
    });
  }

  function openDatingEvent(eventId: string) {
    if (!isDatingEventId(eventId)) return false;
    const target = datingEvents[eventId];
    if (seenEventRecords.some((item) => item.id === eventId)) return false;
    markEventSeen(eventId);
    setCurrentImage(target.image);
    setActiveEvent(eventId);
    setStarted(true);
    return true;
  }

  function triggerDatingEvent(text: string, nextAffinity: number) {
    if (activeEvent) return;

    const directEventId = getDirectEventId(text, nextAffinity);
    if (directEventId && openDatingEvent(directEventId)) return;

    const randomEventId = getRandomEventId(nextAffinity);
    if (randomEventId && openDatingEvent(randomEventId)) return;

    const scenarioEventId = getScenarioEventId(nextAffinity, seenEventRecords.map((event) => event.id));
    if (scenarioEventId) openDatingEvent(scenarioEventId);
  }

  function chooseDatingEvent(choice: DatingEventChoice) {
    const nextAffinity = clampAffinity(affinity + choice.affinity);
    setAffinity(nextAffinity); setActiveEvent(null);
    if (choice.nextEvent && !seenEventRecords.some((item) => item.id === choice.nextEvent)) { setTimeout(() => openDatingEvent(choice.nextEvent!), 350); }
    sendMessage(choice.text, { skipEventTrigger: true, forcedAffinity: nextAffinity });
  }

  function executeAction(action: ActionItem) {
    setCurrentImage(action.image ?? moodImages.smile);
    setAffinity((prev) => clampAffinity(prev + action.affinity)); setStarted(true);
    if (action.eventId && !seenEventRecords.some((item) => item.id === action.eventId)) { openDatingEvent(action.eventId); }
    sendMessage(action.text, { skipEventTrigger: true, forcedAffinity: clampAffinity(affinity + action.affinity) });
  }

  async function sendMessage(textOverride?: string, options?: { skipEventTrigger?: boolean; forcedAffinity?: number }) {
    const text = (textOverride ?? input).trim(); if (!text || loading) return;
    if (ttsEnabled && typeof AudioContext !== "undefined") { const audioCtx = new AudioContext(); if (audioCtx.state === "suspended") await audioCtx.resume(); audioCtx.close(); }
    const nextImage = pickMoodImage(text); setCurrentImage(nextImage); setInput(""); setLoading(true);
    const affinityDelta = options?.skipEventTrigger ? 0 : getAffinityDelta(text);
    const nextAffinity = options?.forcedAffinity ?? clampAffinity(affinity + affinityDelta);
    setAffinity(nextAffinity);
    if (!options?.skipEventTrigger) triggerDatingEvent(text, nextAffinity);
    const nextMessages: Message[] = [...messages, { role: "user", content: text, time: nowTime() }];
    setMessages(nextMessages); setStarted(true);
    try {
      const styleExamples = getStyleExamples();
      if (wantsImage(text)) {
        const waitReply = "잠깐만, 찍어볼게 ㅋㅋ";
        setMessages([...nextMessages, { role: "assistant", content: waitReply, avatar: nextImage, time: nowTime() }]);
        speak(waitReply);
        const imageRes = await fetch("/api/image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: text }) });
        const imageData = await imageRes.json();
        if (!imageData.image) throw new Error(imageData.error ?? "이미지 없음");
        const imageReply = "야 찍어왔다 ㅋㅋ 괜찮냐 😏";
        setMessages((prev) => [...prev, { role: "assistant", content: imageReply, avatar: nextImage, generatedImage: imageData.image, time: nowTime() }]);
        speak(imageReply); return;
      }
      const chatRes = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: nextMessages.map(({ role, content }) => ({ role, content })), styleExamples, affinity: nextAffinity }) });
      const chatData = await chatRes.json(); const reply = chatData.reply ?? "응? 다시 말해봐.";
      setMessages([...nextMessages, { role: "assistant", content: reply, avatar: nextImage, time: nowTime() }]);
      speak(reply);
    } catch {
      const errorReply = "아 뭔가 터졌다 😐 API나 배포 설정 문제인 듯";
      setCurrentImage(moodImages.angry);
      setMessages((prev) => [...prev, { role: "assistant", content: errorReply, avatar: moodImages.angry, time: nowTime() }]);
      speak(errorReply);
    } finally { setLoading(false); }
  }

  if (!started) {
    return (
      <main className="min-h-screen bg-[#F5F1EA] flex items-center justify-center p-4 text-[#1F1A17]">
        <section className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
          <div className="relative h-[620px]">
            <img src="/oppa1.png" alt={profile.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5" />
            <div className="absolute bottom-0 w-full p-7 text-white">
              <div className="max-w-[88%]">
                <h1 className="text-5xl font-black tracking-tight drop-shadow-lg">{profile.name}</h1>
                <p className="mt-2 text-sm font-medium opacity-90">{profile.location} · {profile.age} · {profile.height} · 온라인</p>
                <div className="my-5 h-px w-32 bg-white/35" />
                <p className="text-[15px] leading-relaxed text-white/90 drop-shadow">{profile.bio}</p>
              </div>
              <button onClick={() => setStarted(true)} className="mt-7 w-full rounded-2xl bg-white/95 py-4 font-black text-black shadow-lg backdrop-blur active:scale-[0.99]">대화 시작하기</button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F5F1EA] to-[#E7DED1] flex justify-center text-[#1F1A17]">
      <div className="relative min-h-screen w-full max-w-md overflow-hidden bg-[#F5F1EA] shadow-2xl">
        <header className="sticky top-0 z-30 bg-[#2B211D] px-4 py-3 text-white shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <img src={currentImage} alt={profile.name} onClick={() => openProfile(currentImage)} className="h-12 w-12 cursor-pointer rounded-2xl bg-white object-cover" />
              <div className="min-w-0">
                <h1 className="truncate text-lg font-black">{profile.name}</h1>
                <p className="truncate text-xs opacity-75">{status} · 말투 {styleCount}개 · ❤️ {affinity}%{isSpeaking && <span className="ml-1 text-green-300">🔊</span>}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setTtsEnabled((prev) => !prev)} className={`rounded-full px-2 py-1 text-[10px] font-bold ${ttsEnabled ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/40"}`}>{ttsEnabled ? "🔊" : "🔇"}</button>
              <button onClick={() => setShowProfile(true)} className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold">소개</button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(["chat", "visual", "action"] as ViewMode[]).map((mode) => (
              <button key={mode} onClick={() => setViewMode(mode)} className={`rounded-full py-2 text-xs font-bold ${viewMode === mode ? "bg-[#C97A35]" : "bg-white/10"}`}>{mode === "chat" ? "채팅" : mode === "visual" ? "연애겜" : "액션 🎮"}</button>
            ))}
          </div>
        </header>

        {viewMode === "chat" ? (
          <>
            <div className="flex gap-2 overflow-x-auto px-4 py-3">
              {quickReplies.map((q) => (<button key={q} onClick={() => sendMessage(q)} disabled={loading} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm shadow disabled:opacity-50">{q}</button>))}
            </div>
            <section className="space-y-4 px-4 pb-28">
              {messages.map((m, i) => (
                <div key={`${i}-${m.time ?? ""}`} className={m.role === "user" ? "flex justify-end" : "flex gap-2"}>
                  {m.role === "assistant" && <img src={m.avatar ?? moodImages.normal} alt={profile.name} onClick={() => openProfile(m.avatar ?? moodImages.normal)} className="mt-1 h-10 w-10 cursor-pointer rounded-full bg-white object-cover shadow" />}
                  <div className={m.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start"}>
                    {m.role === "assistant" && <p className="mb-1 text-xs opacity-50">{profile.name}</p>}
                    <div className={m.role === "user" ? "max-w-[280px] rounded-2xl rounded-tr-sm bg-[#FEE500] px-4 py-3 shadow-md whitespace-pre-wrap" : "max-w-[300px] rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-md whitespace-pre-wrap"}>
                      {m.content}
                      {m.generatedImage && <img src={m.generatedImage} alt="생성된 이미지" className="mt-3 w-full rounded-2xl shadow" />}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] opacity-35">
                      {m.time && <span>{m.time}</span>}
                      {m.role === "assistant" && <button onClick={() => saveStyleExample(m.content)}>👍 말투 저장</button>}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (<div className="flex gap-2"><img src={currentImage} alt={profile.name} className="h-10 w-10 rounded-full object-cover" /><div className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-md">답장 쓰는 중...</div></div>)}
              <div ref={bottomRef} />
            </section>
          </>
        ) : viewMode === "visual" ? (
          <section className="relative h-[calc(100vh-118px)] overflow-hidden">
            <img src={currentImage} alt={profile.name} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/15" />
            <div className="absolute right-4 top-4 rounded-full bg-black/50 px-4 py-2 text-sm font-bold text-white backdrop-blur">❤️ {affectionStage} · {affinity}%</div>
            <div className="absolute bottom-0 w-full p-4">
              <div className="rounded-3xl border border-white/10 bg-black/65 p-5 text-white shadow-2xl backdrop-blur">
                <div className="mb-3 flex items-center justify-between"><p className="text-sm font-black text-[#F7C27A]">{profile.name}</p><p className="text-xs opacity-60">{status}</p></div>
                <p className="min-h-[70px] text-lg leading-relaxed">{lastAssistantMessage?.content ?? "나 여기 있어."}</p>
                {lastAssistantMessage?.generatedImage && <img src={lastAssistantMessage.generatedImage} alt="생성된 이미지" className="mt-3 max-h-56 w-full rounded-2xl object-cover" />}
                <div className="mt-4 grid grid-cols-2 gap-2">{visualChoices.map((c) => (<button key={c.label} onClick={() => sendMessage(c.text)} disabled={loading} className="rounded-2xl bg-white/90 px-3 py-3 text-sm font-bold text-black shadow disabled:opacity-50">{c.label}</button>))}</div>
              </div>
            </div>
          </section>
        ) : (
          <section className="relative h-[calc(100vh-118px)] overflow-hidden">
            <img src={currentImage} alt={profile.name} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />
            <div className="absolute right-4 top-4 rounded-full bg-black/50 px-4 py-2 text-sm font-bold text-white backdrop-blur">❤️ {affectionStage} · {affinity}%</div>
            <div className="absolute bottom-0 w-full p-4">
              <div className="rounded-3xl border border-white/10 bg-black/65 p-5 text-white shadow-2xl backdrop-blur">
                <div className="mb-3"><p className="text-sm font-black text-[#F7C27A]">🎮 액션 선택</p><p className="text-xs opacity-60">근떡존에게 직접 행동을 취한다</p></div>
                <p className="min-h-[50px] text-sm leading-relaxed text-white/70 mb-4">{lastAssistantMessage?.content ?? "뭐 하고 싶은데...?"}</p>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                  {actionItems.map((action) => (
                    <button key={action.label} onClick={() => executeAction(action)} disabled={loading} className="rounded-2xl bg-white/90 px-3 py-3 text-left font-bold text-black shadow disabled:opacity-50 active:scale-[0.99] hover:bg-white transition">
                      <span className="text-lg">{action.emoji}</span><span className="ml-1 text-sm">{action.label}</span><span className="ml-1 text-[10px] opacity-40">+{action.affinity}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <footer className="sticky bottom-0 w-full max-w-md bg-[#F5F1EA] border-t border-black/10 p-3 flex gap-2 z-40">
          <button type="button" onClick={toggleListening} disabled={loading} className={`px-4 py-3 rounded-full font-bold text-white shadow-sm transition ${isListening ? "bg-red-500 animate-pulse" : "bg-[#2B211D]"} disabled:opacity-50`}>{isListening ? "🎤●" : "🎤"}</button>
          <input className="flex-1 bg-white rounded-full px-4 py-3 outline-none shadow-sm" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }} placeholder={isListening ? "듣고 있습니다..." : "메시지 입력"} />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="bg-[#2B211D] text-white px-5 py-3 rounded-full font-bold disabled:opacity-50">전송</button>
        </footer>

        {activeEvent && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-[2rem] bg-[#15100E] text-white shadow-2xl">
              <div className="relative h-80">
                <img src={datingEvents[activeEvent].image} alt={datingEvents[activeEvent].title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                <button onClick={() => setActiveEvent(null)} className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-white">✕</button>
                <div className="absolute bottom-0 p-5"><p className="text-xs font-bold text-[#F7C27A]">EVENT</p><h2 className="mt-1 text-3xl font-black">{datingEvents[activeEvent].title}</h2><p className="mt-1 text-xs opacity-70">{datingEvents[activeEvent].subtitle}</p></div>
              </div>
              <div className="space-y-4 p-5">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-white/90">{datingEvents[activeEvent].text}</p>
                <div className="space-y-2">
                  {datingEvents[activeEvent].choices.map((choice) => (
                    <button key={choice.label} onClick={() => chooseDatingEvent(choice)} disabled={loading} className="w-full rounded-2xl bg-white/95 px-4 py-3 text-left text-sm font-bold text-black shadow disabled:opacity-50 active:scale-[0.99]">
                      {choice.label}<span className="ml-2 text-xs opacity-50">{choice.affinity > 0 ? `+${choice.affinity}` : choice.affinity}</span>
                    </button>
                  ))}
                </div>
                <p className="text-center text-[11px] text-white/35">본 이벤트는 기록되어 자동으로 다시 뜨지 않음</p>
              </div>
            </div>
          </div>
        )}

        {showProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
            <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-[2rem] bg-[#F5F1EA] shadow-2xl">
              <div className="relative h-80 overflow-hidden rounded-t-[2rem]">
                <img src={selectedImage} alt={profile.name} onClick={() => setShowGallery(true)} className="h-full w-full cursor-pointer object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                <button onClick={() => setShowProfile(false)} className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-white">✕</button>
                <div className="absolute bottom-0 p-5 text-white"><h2 className="text-4xl font-black">{profile.name}</h2><p className="mt-1 text-sm opacity-85">{profile.location} · {profile.age} · {profile.height} · 온라인</p></div>
              </div>
              <div className="space-y-4 p-5">
                <div className="flex flex-wrap gap-2">{profile.tags.map((tag) => (<span key={tag} className="rounded-full bg-white px-3 py-1 text-xs shadow">{tag}</span>))}</div>
                <div className="rounded-3xl bg-white p-4 text-sm leading-relaxed shadow">{profile.bio}</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-3xl bg-white p-4 shadow"><p className="text-xs opacity-50">성격</p><p className="mt-1 font-bold">{profile.personality}</p></div>
                  <div className="rounded-3xl bg-white p-4 shadow"><p className="text-xs opacity-50">말투</p><p className="mt-1 font-bold">{profile.speech}</p></div>
                  <div className="col-span-2 rounded-3xl bg-white p-4 shadow"><p className="text-xs opacity-50">좋아하는 것</p><p className="mt-1 font-bold">{profile.likes.join(", ")}</p></div>
                  <div className="col-span-2 rounded-3xl bg-white p-4 shadow"><p className="text-xs opacity-50">취미</p><p className="mt-1 font-bold">{profile.hobbies.join(", ")}</p></div>
                  <div className="col-span-2 rounded-3xl bg-white p-4 shadow"><p className="text-xs opacity-50">너와의 관계</p><p className="mt-1 font-bold">{profile.relationship}</p></div>
                </div>
                <div className="rounded-3xl bg-white p-4 text-sm shadow">
                  <div className="flex items-center justify-between gap-2"><p className="text-xs opacity-50">본 이벤트</p><p className="text-xs font-bold opacity-60">{seenEventRecords.length}개</p></div>
                  {seenEventRecords.length ? (<div className="mt-2 space-y-1">{seenEventRecords.slice(-4).reverse().map((event) => (<p key={event.id} className="truncate text-xs opacity-70">{event.title} · {new Date(event.seenAt).toLocaleDateString("ko-KR")}</p>))}</div>) : (<p className="mt-2 text-xs opacity-40">아직 본 이벤트 없음</p>)}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setShowGallery(true)} className="rounded-2xl bg-[#2B211D] py-3 font-bold text-white">갤러리</button>
                  <button onClick={() => { clearStyleExamples(); resetChat(); setShowProfile(false); }} className="rounded-2xl bg-white py-3 font-bold shadow">초기화</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showGallery && (
          <div className="fixed inset-0 z-[60] flex flex-col bg-black/95 p-4">
            <button onClick={() => setShowGallery(false)} className="mb-3 self-end text-2xl text-white">✕</button>
            <div className="flex flex-1 items-center justify-center"><img src={selectedImage} alt="선택된 일러스트" className="max-h-full max-w-full rounded-2xl object-contain" /></div>
            <div className="flex gap-2 overflow-x-auto pt-4">{[moodImages.normal, moodImages.smile, moodImages.smile2, moodImages.shy, moodImages.angry, ...galleryImages].map((img) => (<img key={img} src={img} alt="일러스트" onClick={() => setSelectedImage(img)} className="h-20 w-20 shrink-0 cursor-pointer rounded-xl bg-white object-cover" />))}</div>
          </div>
        )}
      </div>
    </main>
  );
}