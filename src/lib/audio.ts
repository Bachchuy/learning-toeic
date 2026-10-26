/**
 * Tiện ích Phát Âm Kép (Dual-Engine Pronunciation Player)
 * 1. Ưu tiên phát file âm thanh giọng bản xứ (US MP3 từ CDN)
 * 2. Dự phòng tự động bằng Web Speech API (HTML5 SpeechSynthesis en-US)
 */

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
      // Với động từ có trọng âm âm tiết 2 (record, conduct, present), tiền tố "to " kích hoạt trọng âm động từ chuẩn xác
      const spokenText = posHint === "verb" ? `to ${word}` : word;
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = "en-US";
      utterance.rate = 0.88; // Tốc độ vừa phải chuẩn giáo dục
      window.speechSynthesis.speak(utterance);
    } catch {
      // Trình duyệt không hỗ trợ Web Speech API
    }
  }
}
