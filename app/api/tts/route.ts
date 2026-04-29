import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "sQ3a15DhENXU8pKTHlcc"; //

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text 필요" }, { status: 400 });
    }

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: "ELEVENLABS_API_KEY 없음" }, { status: 500 });
    }

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text.slice(0, 2500),
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.65,        // 👈 높을수록 안정적이고 진지하게 (0.5 → 0.65)
          similarity_boost: 0.8,  // 👈 원본 목소리와 유사도
          style: 0.2,             // 👈 낮을수록 감정 과잉 줄어듦 (0.3 → 0.2)
          use_speaker_boost: true,
          speed: 0.95,            // 👈 약간 느리게 (미연시 분위기)
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("ElevenLabs API 에러:", res.status, errText);
      return NextResponse.json({ error: `ElevenLabs 에러: ${res.status}` }, { status: 500 });
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    return NextResponse.json({
      audio: `data:audio/mpeg;base64,${base64}`,
    });
  } catch (e: any) {
    console.error("TTS 에러:", e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}