import { NextRequest, NextResponse } from "next/server";
import { cleanSpeechSegment } from "@/lib/audio";
import { selectBestAudioForPos, type FreeDictApiResponseItem } from "@/core/dictionary";

/**
 * In-memory cache lưu URL phát âm người bản xứ từ Từ điển để tối ưu hiệu năng
 */
const dictAudioUrlCache = new Map<string, string>();

/**
 * API Route: /api/audio/tts
 * Proxy TTS âm thanh giọng bản xứ en-US chuẩn xác:
 * - Ưu tiên hàng đầu: Tự động kéo file MP3 giọng người bản xứ thật từ Từ điển (Free Dictionary API / Cambridge / Wiktionary)
 * - Tự động bóc tách đúng file âm thanh của Danh từ vs Động từ cho các từ đa loại (contract, present, produce...)
 * - Dự phòng tự động bằng Google US English TTS (Giọng Nữ chuẩn)
 * - Cache audio stream tại client và CDN để đạt độ trễ 0ms
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const word = searchParams.get("word")?.trim();
  const text = searchParams.get("text")?.trim();
  const pos = searchParams.get("pos")?.toLowerCase().trim();

  let rawTarget = text || word || "";

  if (!rawTarget) {
    return new NextResponse("Missing query text or word", { status: 400 });
  }

  // 1. Nếu là từ đơn: Ưu tiên kéo Audio bản xứ người thật từ Từ điển
  const cleanBase = rawTarget.replace(/^[to\s]+/i, "").trim().toLowerCase();
  const isSingleWord = !cleanBase.includes(" ") && !cleanBase.includes("-");

  if (isSingleWord && cleanBase.length >= 2) {
    const cacheKey = `${cleanBase}:${pos || "default"}`;
    let nativeAudioUrl = dictAudioUrlCache.get(cacheKey);

    if (!nativeAudioUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const dictRes = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanBase)}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (dictRes.ok) {
          const entries = (await dictRes.json()) as FreeDictApiResponseItem[];
          if (Array.isArray(entries) && entries.length > 0) {
            nativeAudioUrl = selectBestAudioForPos(entries, pos);
            if (nativeAudioUrl) {
              dictAudioUrlCache.set(cacheKey, nativeAudioUrl);
            }
          }
        }
      } catch {
        // Bỏ qua lỗi mạng từ điển ngoài để chuyển sang fallback
      }
    }

    // Nếu tìm thấy audio người bản xứ trong từ điển -> Tải và stream trực tiếp
    if (nativeAudioUrl) {
      try {
        const audioRes = await fetch(nativeAudioUrl, {
          headers: {
            Accept: "audio/mpeg, audio/*;q=0.9",
          },
        });

        if (audioRes.ok) {
          const audioBuffer = await audioRes.arrayBuffer();
          if (audioBuffer.byteLength > 0) {
            return new NextResponse(audioBuffer, {
              status: 200,
              headers: {
                "Content-Type": "audio/mpeg",
                "Cache-Control":
                  "public, max-age=604800, s-maxage=604800, stale-while-revalidate=2592000",
              },
            });
          }
        }
      } catch {
        // Tải audio từ điển thất bại -> fallback sang Google TTS
      }
    }
  }

  // 2. Dự phòng: Google Translate TTS giọng Nữ chuẩn en-US
  // Với Động từ của từ đa từ loại (Heteronyms): Ép nhấn trọng âm âm tiết 2
  if (pos === "verb") {
    const lower = rawTarget.toLowerCase().trim();
    if (!lower.startsWith("to ")) {
      const cleanWord = lower.replace(/[-\s]+/g, " ").trim();
      rawTarget = `to ${cleanWord}`;
    }
  }

  // Làm sạch hoàn toàn các ký hiệu ngữ pháp, ngoặc đơn (n/v), v.v.
  const cleanTarget = cleanSpeechSegment(rawTarget);
  const spokenQuery = cleanTarget || rawTarget;

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
