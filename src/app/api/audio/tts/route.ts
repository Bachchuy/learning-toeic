import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: /api/audio/tts
 * Proxy TTS âm thanh giọng bản xứ en-US chuẩn xác:
 * - Giải quyết triệt để vấn đề CORS/Referer block khi gọi TTS từ trình duyệt client
 * - Phân định rõ nét từ loại (Noun: "the <word>", Verb: "to <word>") đối với các từ đa từ loại (Heteronyms)
 * - Cache audio stream tại client để tối ưu tốc độ và tiết kiệm băng thông
 */
/**
 * Bảng phiên âm ngữ âm học (Phonetic Respelling) cho Động từ đa từ loại (Heteronyms)
 * Ép engine TTS phát âm trọng âm âm tiết 2 (Stress Syllable 2) chuẩn xác ngữ âm học,
 * TUYỆT ĐỐI KHÔNG thêm bất kỳ từ đệm nào như "to " hay "the " gây khó chịu cho người học.
 */
const VERB_PHONETIC_RESPEL: Record<string, string> = {
  contract: "kuhn-tract",
  record: "ri-cord",
  present: "pri-zent",
  conduct: "kuhn-duct",
  produce: "pruh-duce",
  project: "pruh-ject",
  increase: "in-crease",
  decrease: "di-crease",
  permit: "per-mit",
  export: "ek-sport",
  import: "im-port",
  refund: "ri-fund",
  transport: "trans-port",
  transfer: "trans-fer",
  discount: "dis-count",
  conflict: "kuhn-flict",
  progress: "pruh-gress",
  survey: "sur-vey",
  address: "uh-dress",
  object: "uhb-ject",
  subject: "suhb-ject",
  contrast: "kuhn-trast",
  contest: "kuhn-test",
  defect: "di-fect",
  suspect: "suh-spect",
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const word = searchParams.get("word")?.trim();
  const text = searchParams.get("text")?.trim();
  const pos = searchParams.get("pos")?.toLowerCase().trim();

  const rawTarget = text || word || "";

  if (!rawTarget) {
    return new NextResponse("Missing query text or word", { status: 400 });
  }

  const cleanWord = rawTarget.toLowerCase().trim();
  let spokenQuery = rawTarget;

  // Với Động từ của từ đa từ loại: áp dụng Phonetic Respelling để nhấn trọng âm âm tiết 2,
  // TUYỆT ĐỐI chỉ đọc đúng từ đó, không bao giờ kèm từ 'to' hay bất kỳ từ đệm nào
  if (pos === "verb" && VERB_PHONETIC_RESPEL[cleanWord]) {
    spokenQuery = VERB_PHONETIC_RESPEL[cleanWord];
  }

  try {
    const upstreamUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en-US&client=tw-ob&q=${encodeURIComponent(
      spokenQuery
    )}`;

    const response = await fetch(upstreamUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "audio/mpeg, audio/*;q=0.9",
      },
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch audio from upstream", {
        status: response.status,
      });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Lỗi proxy /api/audio/tts:", error);
    return new NextResponse("Internal audio proxy error", { status: 500 });
  }
}
