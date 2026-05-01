import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json().catch(() => ({ text: "" }));
    const input = String(text ?? "").trim().slice(0, 2000);

    if (!input || !process.env.OPENAI_API_KEY) {
      return NextResponse.json({ audio: null });
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL || "tts-1",
        voice: process.env.OPENAI_TTS_VOICE || "onyx",
        input,
        speed: 1.05,
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("TTS API error", errorText);
      return NextResponse.json({ audio: null, error: "TTS API error" });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return NextResponse.json({ audio: `data:audio/mpeg;base64,${base64}` });
  } catch (error: any) {
    console.error("/api/tts error", error);
    return NextResponse.json({ audio: null, error: error?.message });
  }
}
