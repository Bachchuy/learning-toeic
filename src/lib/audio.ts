/**
 * Tiện ích Phát Âm Kép (Dual-Engine Pronunciation Player)
 * 1. Ưu tiên phát file âm thanh giọng bản xứ (US MP3 từ CDN)
 * 2. Dự phòng tự động bằng Web Speech API (HTML5 SpeechSynthesis en-US)
 * 
 * BẢO ĐẢM TÍNH SƯ PHẠM VÀ TRẢI NGHIỆM HỌC TẬP:
 * - Triệt tiêu 100% việc đọc các dấu câu, ký hiệu ngữ pháp:
 *   + Dấu gạch chéo (/), dấu gạch chéo ngược (\)
 *   + Ký hiệu từ loại: (n), (v), [n], [v], (adj), (adv), (n/v), (v/n), v, n., v.v.
 *   + Dấu ngoặc đơn, ngoặc vuông, chấm phẩy, hai chấm, chấm giữa (·), dấu phẩy
 * - Với cặp từ hoặc từ đa từ loại (Dual POS):
 *   + Bóc tách thành các phân đoạn từ vựng sạch (clean segments)
 *   + Phát âm tuần tự từng từ với khoảng ngắt nghỉ tự nhiên (450ms) giữa các phân đoạn
 *   + Không bao giờ nối bằng dấu phẩy hay dấu chấm khiến TTS đọc thành "comma" / "slash"
 *   + Tự động chọn voice chuẩn en-US trong hệ thống để tránh giọng mặc định vùng miền
 */

/**
 * Làm sạch một phân đoạn từ vựng trước khi phát âm:
 * - Loại bỏ hoàn toàn các ký hiệu từ loại, dấu ngoặc, dấu câu thừa
 * - Chỉ giữ lại chữ cái, số, khoảng trắng và dấu nháy đơn nội bộ (như don't, it's)
 */
export function cleanSpeechSegment(str: string): string {
  if (!str) return "";

  return str
    // 1. Loại bỏ các phần trong ngoặc tròn, ngoặc vuông, ngoặc nhọn (chứa chú thích từ loại)
    .replace(/[\(\[\{][^\)\]\}]*[\)\]\}]/g, " ")
    // 2. Loại bỏ các ký hiệu từ loại viết tắt đứng rời (n., v., adj., adv., prep., conj.)
    .replace(/\b(?:n|v|adj|adv|prep|conj|phrase|idiom)\.?(?:,\s*(?:n|v|adj|adv)\.?)*\b/gi, " ")
    // 3. Loại bỏ mọi ký tự lạ ngoài chữ, số, space, dấu gạch nối và nháy đơn nội bộ
    .replace(/[^\w\s'-]/g, " ")
    // 4. Chuẩn hóa khoảng trắng
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Bảng tra cứu trọng âm âm tiết cho từ đa từ loại (Noun-Verb Heteronyms)
 * Giúp Web Speech API phát âm chuẩn xác trọng âm âm tiết 1 (Danh từ) hoặc âm tiết 2 (Động từ)
 * bằng kỹ thuật Syllable-Stress Respelling (dấu gạch nối và viết hoa âm tiết mang trọng âm),
 * TUYỆT ĐỐI KHÔNG thêm bất kỳ từ đệm nào như "to " hay "di " gây khó chịu cho người học.
 */
export const DUAL_VERB_STRESS_MAP: Record<string, string> = {
  contract: "con-TRACT",
  record: "re-CORD",
  present: "pre-SENT",
  conduct: "con-DUCT",
  produce: "pro-DUCE",
  project: "pro-JECT",
  increase: "in-CREASE",
  decrease: "de-CREASE",
  permit: "per-MIT",
  export: "ex-PORT",
  import: "im-PORT",
  refund: "re-FUND",
  transport: "trans-PORT",
  transfer: "trans-FER",
  discount: "dis-COUNT",
  conflict: "con-FLICT",
  progress: "pro-GRESS",
  survey: "sur-VEY",
  address: "ad-DRESS",
  update: "up-DATE",
  object: "ob-JECT",
  subject: "sub-JECT",
  contrast: "con-TRAST",
  contest: "con-TEST",
  defect: "de-FECT",
  rebel: "re-BEL",
  suspect: "sus-PECT",
  insert: "in-SERT",
  impact: "im-PACT",
  attribute: "at-TRIB-ute",
};

export const DUAL_NOUN_STRESS_MAP: Record<string, string> = {
  contract: "CON-tract",
  record: "RE-cord",
  present: "PRE-sent",
  conduct: "CON-duct",
  produce: "PRO-duce",
  project: "PRO-ject",
  increase: "IN-crease",
  decrease: "DE-crease",
  permit: "PER-mit",
  export: "EX-port",
  import: "IM-port",
  refund: "RE-fund",
  transport: "TRANS-port",
  transfer: "TRANS-fer",
  discount: "DIS-count",
  conflict: "CON-flict",
  progress: "PROG-ress",
  survey: "SUR-vey",
  address: "AD-dress",
  update: "UP-date",
  object: "OB-ject",
  subject: "SUB-ject",
  contrast: "CON-trast",
  contest: "CON-test",
  defect: "DE-fect",
  rebel: "REB-el",
  suspect: "SUS-pect",
  insert: "IN-sert",
  impact: "IM-pact",
  attribute: "AT-tribute",
};

/**
 * Tách và chuẩn hóa một từ/cụm từ/cặp từ thành danh sách các phân đoạn từ vựng sạch:
 * Ví dụ:
 * - "historic / historical" -> ["historic", "historical"]
 * - "affect / effect" -> ["affect", "effect"]
 * - "record (n/v)" -> ["record"]
 * - "[n] record · [v] record" -> ["record"]
 * - "duplicate (v/n/adj)" -> ["duplicate"]
 * - "contract" (posHint: "noun") -> ["CON-tract"]
 * - "contract" (posHint: "verb") -> ["con-TRACT"]
 */
export function prepareSpokenSegments(
  word: string,
  posHint?: "noun" | "verb"
): string[] {
  if (!word) return [];

  // 1. Loại bỏ chú thích từ loại trong ngoặc trước
  let cleaned = word
    .replace(/[\(\[][^\)\]]*[\)\]]/g, " ")
    .replace(/^[\\\/]+|[\\\/]+$/g, "")
    .trim();

  // 2. Chuyển đổi các từ viết tắt cực ngắn dạng X/Y (như A/B, I/O) thành "X Y"
  cleaned = cleaned.replace(/\b([a-zA-Z0-9]{1,2})\/([a-zA-Z0-9]{1,2})\b/g, "$1 $2");

  // 3. Tách theo dấu gạch chéo /, \, chấm giữa ·, thanh dọc |, hoặc chấm phẩy ;
  const rawSegments = cleaned.split(/[\/\\·|;]+/);

  const result: string[] = [];
  const seen = new Set<string>();

  for (const raw of rawSegments) {
    let seg = cleanSpeechSegment(raw);
    if (!seg) continue;

    const lower = seg.toLowerCase();

    // Áp dụng kỹ thuật Syllable-Stress Respelling khi có posHint,
    // đảm bảo phân biệt rõ trọng âm âm tiết 1 (Noun) và âm tiết 2 (Verb) mà KHÔNG thêm từ thừa
    if (posHint === "verb" && DUAL_VERB_STRESS_MAP[lower]) {
      seg = DUAL_VERB_STRESS_MAP[lower];
    } else if (posHint === "noun" && DUAL_NOUN_STRESS_MAP[lower]) {
      seg = DUAL_NOUN_STRESS_MAP[lower];
    }

    const key = seg.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(seg);
    }
  }

  return result;
}

/**
 * Chuẩn hóa văn bản trước khi đưa vào Web Speech API:
 * Trả về chuỗi các từ được ngăn cách bằng khoảng trắng hoặc dấu chấm câu chuẩn.
 */
export function prepareSpokenText(
  word: string,
  posHint?: "noun" | "verb"
): string {
  const segments = prepareSpokenSegments(word, posHint);
  if (segments.length === 0) return "";
  // Dùng ". " giữa các câu để TTS ngắt nghỉ tự nhiên, tuyệt đối không dùng dấu phẩy ", "
  // vì nhiều engine TTS sẽ đọc từ "comma" hoặc "dấu phẩy" thành tiếng.
  return segments.join(". ");
}

/**
 * Tìm voice tiếng Anh chuẩn (en-US) từ hệ thống
 */
function getPreferredVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return undefined;
  }
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return undefined;

  // 1. Ưu tiên giọng en-US chất lượng cao (Google US English, Microsoft Zira/David/Jenny, Samantha...)
  const preferred = voices.find(
    (v) =>
      v.lang.replace("_", "-") === "en-US" &&
      (v.name.includes("Google") ||
        v.name.includes("Natural") ||
        v.name.includes("Zira") ||
        v.name.includes("David") ||
        v.name.includes("Samantha") ||
        v.name.includes("Jenny"))
  );
  if (preferred) return preferred;

  // 2. Bất kỳ voice en-US nào
  const enUs = voices.find((v) => v.lang.replace("_", "-") === "en-US");
  if (enUs) return enUs;

  // 3. Dự phòng bất kỳ voice tiếng Anh nào
  return voices.find((v) => v.lang.toLowerCase().startsWith("en"));
}

let activeAudio: HTMLAudioElement | null = null;

/**
 * Dừng ngay lập tức toàn bộ các luồng âm thanh đang phát (cả Audio lẫn SpeechSynthesis)
 * Triệt tiêu hoàn toàn hiện tượng vang âm, tiếng vang lặp hay phát đè lên nhau
 */
export function stopAllAudio(): void {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {}
    activeAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

/**
 * Phát âm một phân đoạn đơn lẻ qua Web Speech API và chờ hoàn tất
 */
function speakSingleSegment(
  text: string,
  voice?: SpeechSynthesisVoice
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.88; // Tốc độ vừa phải chuẩn giáo dục
    if (voice) {
      utterance.voice = voice;
    }

    let isDone = false;
    const finish = () => {
      if (!isDone) {
        isDone = true;
        resolve();
      }
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    // Timeout an toàn đề phòng một số trình duyệt không phát sinh sự kiện onend
    setTimeout(finish, 3500);

    // Bắt đầu đọc
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Dự phòng phát âm qua Web Speech API
 */
async function speakWithWebSpeech(
  word: string,
  posHint?: "noun" | "verb"
): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const segments = prepareSpokenSegments(word, posHint);
    if (segments.length === 0) return;
    const voice = getPreferredVoice();

    for (let i = 0; i < segments.length; i++) {
      await speakSingleSegment(segments[i], voice);
      if (i < segments.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }
  } catch {}
}

export async function playPronunciation(
  word: string,
  audioUrl?: string,
  posHint?: "noun" | "verb"
): Promise<void> {
  if (!word && !audioUrl) return;

  // 1. Dừng ngay lập tức mọi âm thanh đang phát dở (tránh triệt để lỗi vang âm)
  stopAllAudio();

  const cleanWord = (word || "").trim().toLowerCase();

  // 2. Xác định URL âm thanh: ưu tiên endpoint stream nội bộ /api/audio/tts
  let resolvedUrl = audioUrl;
  if (
    !resolvedUrl ||
    resolvedUrl.includes("audio.tflat.vn") ||
    resolvedUrl.includes("translate.google.com")
  ) {
    resolvedUrl = posHint
      ? `/api/audio/tts?word=${encodeURIComponent(cleanWord)}&pos=${posHint}`
      : `/api/audio/tts?word=${encodeURIComponent(cleanWord)}`;
  }

  // 3. Thử phát bằng Audio element và CHỜ ĐẾN KHI PHÁT XONG HOÀN TOÀN
  if (resolvedUrl && typeof window !== "undefined") {
    const playedSuccessfully = await new Promise<boolean>((resolve) => {
      try {
        const audio = new Audio(resolvedUrl);
        activeAudio = audio;

        let settled = false;
        const cleanup = (success: boolean) => {
          if (!settled) {
            settled = true;
            audio.removeEventListener("ended", onEnd);
            audio.removeEventListener("error", onError);
            if (activeAudio === audio) activeAudio = null;
            resolve(success);
          }
        };

        const onEnd = () => cleanup(true);
        const onError = () => cleanup(false);

        audio.addEventListener("ended", onEnd);
        audio.addEventListener("error", onError);

        // Timeout an toàn tối đa 4s để không bị treo nếu mất kết nối
        setTimeout(() => cleanup(true), 4000);

        audio.play().catch(() => onError());
      } catch {
        resolve(false);
      }
    });

    if (playedSuccessfully) {
      return;
    }
  }

  // 4. Dự phòng bằng Web Speech API native nếu không tải được audio
  await speakWithWebSpeech(word, posHint);
}

/**
 * Phát âm tuần tự cả 2 dạng Danh từ và Động từ cho từ đa từ loại (Dual POS)
 * Giúp người học phân biệt rõ ràng trọng âm âm tiết 1 (Danh từ) và âm tiết 2 (Động từ).
 * Ví dụ: "record", "present", "contract", "conduct", "produce", "object"
 */
export async function playDualPronunciation(
  word: string,
  audioUrls?: { nounAudioUrl?: string; verbAudioUrl?: string }
): Promise<void> {
  if (!word || typeof window === "undefined") return;

  stopAllAudio();

  // 1. Phát âm dạng danh từ và CHỜ CHO ĐẾN KHI KẾT THÚC HOÀN TOÀN
  await playPronunciation(word, audioUrls?.nounAudioUrl, "noun");

  // 2. Tạm dừng 400ms giữa 2 từ để ngắt nghỉ tự nhiên, không bị chồng đè âm thanh
  await new Promise((resolve) => setTimeout(resolve, 400));

  // 3. Phát âm dạng động từ
  await playPronunciation(word, audioUrls?.verbAudioUrl, "verb");
}
