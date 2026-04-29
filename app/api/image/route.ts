import OpenAI, { toFile } from "openai";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// public 폴더에 실제로 있는 파일만 넣기
const referenceImages = ["oppa1.png",];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userPrompt = body.prompt ?? "셀카 느낌";

    const publicDir = path.join(process.cwd(), "public");

    const imageFiles = await Promise.all(
      referenceImages.map(async (fileName) => {
        const filePath = path.join(publicDir, fileName);

        if (!fs.existsSync(filePath)) {
          throw new Error(`참고 이미지 없음: ${fileName}`);
        }

        const buffer = fs.readFileSync(filePath);
        return await toFile(buffer, fileName, { type: "image/png" });
      })
    );

    const result = await client.images.edit({
      model: "gpt-image-1",
      image: imageFiles,
      input_fidelity: "high",
      size: "1024x1024",
      prompt: `
첨부된 참고 이미지 속 남자 캐릭터를 기반으로 새 이미지를 만들어라.
반드시 같은 인물처럼 보이게 유지한다.

캐릭터 고정:
- 한국인 남자
- 금발
- 구릿빛 피부
- 큰 체격의 근육질
- 순한 인상
- 장난기 있는 표정
- 현대 캐릭터 일러스트 느낌

절대 금지:
- 여자 금지
- 로봇 금지
- 어린아이 금지
- 동물 금지
- 다른 인물 금지
- 참고 이미지와 전혀 다른 얼굴 금지

스타일:
- 기존 갤러리 일러스트와 비슷한 분위기
- 상반신 위주
- 자연스러운 사진/셀카 느낌

사용자 요청:
${userPrompt}
`,
    });

    const img = result.data?.[0]?.b64_json;

    if (!img) {
      return NextResponse.json(
        { error: "이미지 데이터가 비어 있음" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      image: `data:image/png;base64,${img}`,
    });
  } catch (e: any) {
    console.error("이미지 생성 에러:", e);

    return NextResponse.json(
      {
        error: e?.message ?? "이미지 생성 실패",
      },
      { status: 500 }
    );
  }
}