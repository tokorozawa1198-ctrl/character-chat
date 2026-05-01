import { NextResponse } from "next/server";

const localImages = [
  "/oppa.png",
  "/oppa1.png",
  "/oppa2.png",
  "/oppa3.png",
  "/oppa5.png",
  "/oppa6.png",
  "/oppa7.png",
  "/oppa8.png",
  "/oppa9.png",
  "/oppa11.png",
  "/oppa12.png",
  "/oppa13.png",
  "/oppa14.png",
  "/oppa17.png",
  "/oppa18.png",
  "/oppa_smile.png",
  "/oppa_shy.png",
];

function pickLocalImage(prompt: string) {
  const t = prompt.replace(/\s/g, "");
  if (/부끄|좋아|보고싶|귀엽|칭찬/.test(t)) return "/oppa_shy.png";
  if (/화나|질투|다른사람|삐짐/.test(t)) return "/oppa_angry.png";
  if (/웃|장난|ㅋㅋ/.test(t)) return "/oppa_smile2.png";
  return localImages[Math.floor(Math.random() * localImages.length)];
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json().catch(() => ({ prompt: "" }));
    return NextResponse.json({ image: pickLocalImage(String(prompt ?? "")), mode: "local-gallery" });
  } catch (error: any) {
    console.error("/api/image error", error);
    return NextResponse.json({ image: "/oppa_smile.png", error: error?.message });
  }
}
