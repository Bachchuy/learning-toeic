/**
 * Tiện ích Phát Âm Kép (Dual-Engine Pronunciation Player)
 * 1. Ưu tiên phát file âm thanh giọng bản xứ (US MP3 từ CDN)
 * 2. Dự phòng tự động bằng Web Speech API (HTML5 SpeechSynthesis en-US)
 */

/**
 * Chuẩn hóa văn bản trước khi đưa vào Web Speech API:
 * - Loại bỏ các dấu "/" hoặc "\" (ví dụ: "historic / historical" -> "historic, historical")
 * - Giúp Web Speech API ngắt nghỉ tự nhiên bằng dấu phẩy ", ", triệt tiêu việc đọc ký tự "/" thành âm "slash" / "gạch chéo"
 * - Hỗ trợ chuẩn hóa tiền tố "to " cho động từ (posHint === "verb")
 */
export function prepareSpokenText(
  word: string,
  posHint?: "noun" | "verb"
): string {
  if (!word) return "";

  // 1. Loại bỏ slash hoặc backslash ở đầu và cuối chuỗi (ví dụ: /word/)
  const trimmed = word.replace(/^[\/\\]+|[\/\\]+$/g, "").trim();
  if (!trimmed) return "";

  // 2. Tách các cụm từ theo dấu gạch chéo hoặc gạch chéo ngược
  const segments = trimmed
    .split(/[\/\\]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (segments.length === 0) return "";

  // 3. Nếu là động từ, thêm tiền tố "to " cho từng từ để kích hoạt đúng trọng âm động từ
  if (posHint === "verb") {
    return segments
      .map((s) => (s.startsWith("to ") ? s : `to ${s}`))
      .join(", ");
  }

  // 4. Nối các từ lại bằng dấu phẩy và khoảng trắng ", "
  // Dấu phẩy tạo khoảng dừng tự nhiên và triệt tiêu việc đọc ký tự "/" thành âm thanh "slash"
  return segments.join(", ");
}

export async function playPronunciation(
  word: string,
  audioUrl?: string,
  posHint?: "noun" | "verb"
): Promise<void> {
  if (!word && !audioUrl) return;

  // 1. Thử phát bằng Audio URL nếu có (chỉ ưu tiên khi không chỉ định posHint đặc thù)
  if (audioUrl && typeof window !== "undefined" && !posHint) {
    try {
      const audio = new Audio(audioUrl);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        return;
      }
    } catch {
      // Audio URL lỗi mạng hoặc 404 -> Chuyển sang Web Speech API
    }
  }

  // 2. Dự phòng bằng Web Speech API native của trình duyệt (Hỗ trợ phân biệt Danh từ / Động từ)
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel(); // Dừng câu đang đọc dở nếu có
      const spokenText = prepareSpokenText(word, posHint);
      if (!spokenText) return;

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = "en-US";
      utterance.rate = 0.88; // Tốc độ vừa phải chuẩn giáo dục
      window.speechSynthesis.speak(utterance);
    } catch {
      // Trình duyệt không hỗ trợ Web Speech API
    }
  }
}

/**
 * Phát âm tuần tự cả 2 dạng Danh từ và Động từ cho từ đa từ loại (Dual POS)
 * Giúp người học phân biệt rõ ràng trọng âm âm tiết 1 (Danh từ) và âm tiết 2 (Động từ).
 * Ví dụ: "record", "present", "contract", "conduct", "produce", "object"
 */
export async function playDualPronunciation(word: string): Promise<void> {
  if (!word || typeof window === "undefined") return;

  // 1. Phát âm dạng danh từ
  await playPronunciation(word, undefined, "noun");

  // 2. Tạm dừng 750ms rồi phát âm dạng động từ
  await new Promise((resolve) => setTimeout(resolve, 750));
  await playPronunciation(word, undefined, "verb");
}
