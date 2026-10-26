/**
 * Tiện ích Phát Âm Kép (Dual-Engine Pronunciation Player)
 * 1. Ưu tiên phát file âm thanh giọng bản xứ (US MP3 từ CDN)
 * 2. Dự phòng tự động bằng Web Speech API (HTML5 SpeechSynthesis en-US)
 */

export async function playPronunciation(word: string, audioUrl?: string): Promise<void> {
  if (!word && !audioUrl) return;

  // 1. Thử phát bằng Audio URL nếu có
  if (audioUrl && typeof window !== "undefined") {
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

  // 2. Dự phòng bằng Web Speech API native của trình duyệt
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel(); // Dừng câu đang đọc dở nếu có
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.9; // Tốc độ vừa phải chuẩn giáo dục
      window.speechSynthesis.speak(utterance);
    } catch {
      // Trình duyệt không hỗ trợ Web Speech API
    }
  }
}
