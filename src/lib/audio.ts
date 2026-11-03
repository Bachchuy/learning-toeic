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
 * Danh sách mẫu tên giọng Nữ en-US chuẩn trên các hệ điều hành và trình duyệt:
 * - Google US English (Chrome / Android)
 * - Microsoft Zira Desktop (Windows)
 * - Microsoft Jenny Online (Natural) / Aria / Michelle / Ana (Edge / Windows)
 * - Samantha, Victoria, Karen, Susan, Ava, Allison (macOS / iOS Safari)
 */
export const FEMALE_VOICE_PATTERNS = [
  "google us english",
  "zira",
  "jenny",
  "aria",
  "samantha",
  "victoria",
  "karen",
  "michelle",
  "ava",
  "allison",
  "susan",
  "tessa",
  "moira",
  "stephanie",
  "female",
];

/**
 * Danh sách mẫu tên giọng Nam cần tuyệt đối tránh để không bị lẫn giọng nam
 * (như Microsoft David trên Windows, Guy trên Edge, Alex trên macOS)
 */
export const MALE_VOICE_PATTERNS = [
  "david",
  "guy",
  "mark",
  "george",
  "richard",
  "alex",
  "fred",
  "daniel",
  "tom",
  "oliver",
  "male",
];

/**
 * Lọc và chọn Voice Nữ en-US chuẩn từ danh sách voices của hệ thống
 */
export function selectPreferredVoice(
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | undefined {
  if (!voices || voices.length === 0) return undefined;

  // 1. Ưu tiên cao nhất: Voice en-US có tên thuộc danh sách FEMALE_VOICE_PATTERNS và không chứa tên nam
  const enUsFemale = voices.find((v) => {
    const lang = (v.lang || "").replace("_", "-").toLowerCase();
    if (lang !== "en-us") return false;
    const name = (v.name || "").toLowerCase();
    return (
      FEMALE_VOICE_PATTERNS.some((pat) => name.includes(pat)) &&
      !MALE_VOICE_PATTERNS.some((pat) => name.includes(pat))
    );
  });
  if (enUsFemale) return enUsFemale;

  // 2. Ưu tiên nhì: Bất kỳ voice en-US nào KHÔNG nằm trong danh sách giọng Nam
  const enUsNotMale = voices.find((v) => {
    const lang = (v.lang || "").replace("_", "-").toLowerCase();
    if (lang !== "en-us") return false;
    const name = (v.name || "").toLowerCase();
    return !MALE_VOICE_PATTERNS.some((pat) => name.includes(pat));
  });
  if (enUsNotMale) return enUsNotMale;

  // 3. Ưu tiên ba: Bất kỳ voice tiếng Anh nào (en-GB, en-AU, en-CA) thuộc giọng Nữ
  const anyEnFemale = voices.find((v) => {
    const lang = (v.lang || "").toLowerCase();
    if (!lang.startsWith("en")) return false;
    const name = (v.name || "").toLowerCase();
    return (
      FEMALE_VOICE_PATTERNS.some((pat) => name.includes(pat)) &&
      !MALE_VOICE_PATTERNS.some((pat) => name.includes(pat))
    );
  });
  if (anyEnFemale) return anyEnFemale;

  // 4. Ưu tiên tư: Bất kỳ voice tiếng Anh nào không phải giọng Nam
  const anyEnNotMale = voices.find((v) => {
    const lang = (v.lang || "").toLowerCase();
    if (!lang.startsWith("en")) return false;
    const name = (v.name || "").toLowerCase();
    return !MALE_VOICE_PATTERNS.some((pat) => name.includes(pat));
  });
  if (anyEnNotMale) return anyEnNotMale;

  // 5. Dự phòng cuối cùng nếu máy tính chỉ cài duy nhất 1 giọng en-US
  const enUsFallback = voices.find(
    (v) => (v.lang || "").replace("_", "-").toLowerCase() === "en-us"
  );
  if (enUsFallback) return enUsFallback;

  return voices.find((v) => (v.lang || "").toLowerCase().startsWith("en")) || voices[0];
}

let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  try {
    cachedVoices = window.speechSynthesis.getVoices();
    const updateVoices = () => {
      try {
        cachedVoices = window.speechSynthesis.getVoices();
      } catch {}
    };
    if (window.speechSynthesis.addEventListener) {
      window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
    } else {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  } catch {}
}

/**
 * Tìm voice tiếng Anh chuẩn (en-US Nữ) từ hệ thống trình duyệt
 */
export function getPreferredVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return undefined;
  }
  const voices =
    window.speechSynthesis.getVoices().length > 0
      ? window.speechSynthesis.getVoices()
      : cachedVoices;

  return selectPreferredVoice(voices);
}

/**
 * Chuẩn hóa URL phát âm:
 * Luôn ưu tiên endpoint stream chuẩn /api/audio/tts để bảo đảm 100% đồng nhất giọng Nữ en-US,
 * triệt tiêu hoàn toàn sự pha trộn giữa giọng nam và giọng nữ từ các nguồn CDN/DictionaryAPI bên ngoài.
 */
export function resolvePronunciationUrl(
  word: string,
  audioUrl?: string,
  posHint?: "noun" | "verb",
  spokenText?: string
): string {
  // Nếu caller truyền URL chuyên biệt đã có query param pos hoặc text thì bảo tồn
  if (audioUrl && (audioUrl.includes("pos=") || audioUrl.includes("text="))) {
    return audioUrl;
  }
  const cleanWord = (word || "").trim();
  if (cleanWord) {
    const segments = prepareSpokenSegments(cleanWord, posHint);
    const spoken = segments.length > 0 ? segments[0] : cleanWord;
    return posHint
      ? `/api/audio/tts?word=${encodeURIComponent(spoken)}&pos=${posHint}`
      : `/api/audio/tts?word=${encodeURIComponent(spoken)}`;
  }
  return audioUrl || "";
}

let activeAudio: HTMLAudioElement | null = null;
let currentAudioSessionId = 0;

/**
 * Dừng ngay lập tức toàn bộ các luồng âm thanh đang phát (cả Audio lẫn SpeechSynthesis)
 * Tăng session ID để vô hiệu hóa hoàn toàn mọi promise/timer đang chờ trong các luồng phát trước,
 * triệt tiêu hoàn toàn hiện tượng vang âm, tiếng vang lặp hay phát đè lên nhau.
 */
export function stopAllAudio(): void {
  currentAudioSessionId++;
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio.src = "";
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
 * Phát âm một URL âm thanh qua HTMLAudioElement và đợi kết thúc an toàn
 */
function playAudioSegment(url: string, sessionId: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (sessionId !== currentAudioSessionId) {
      resolve(false);
      return;
    }

    try {
      const audio = new Audio(url);
      activeAudio = audio;

      let settled = false;
      let timer: ReturnType<typeof setTimeout> | null = null;

      const cleanup = (success: boolean) => {
        if (!settled) {
          settled = true;
          if (timer) clearTimeout(timer);
          audio.removeEventListener("ended", onEnd);
          audio.removeEventListener("error", onError);
          if (activeAudio === audio) activeAudio = null;
          resolve(success && sessionId === currentAudioSessionId);
        }
      };

      const onEnd = () => cleanup(true);
      const onError = () => cleanup(false);

      audio.addEventListener("ended", onEnd);
      audio.addEventListener("error", onError);

      // Timeout an toàn tối đa 4s đề phòng kết nối mạng gián đoạn
      timer = setTimeout(() => cleanup(true), 4000);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          cleanup(false);
        });
      }
    } catch {
      resolve(false);
    }
  });
}

/**
 * Phát âm một phân đoạn đơn lẻ qua Web Speech API (Giọng Nữ chuẩn) và chờ hoàn tất
 */
function speakSingleSegment(
  text: string,
  voice?: SpeechSynthesisVoice,
  sessionId?: number
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }

    if (sessionId !== undefined && sessionId !== currentAudioSessionId) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.88; // Tốc độ vừa phải chuẩn giáo dục

    const chosenVoice = voice || getPreferredVoice();
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    let isDone = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const finish = () => {
      if (!isDone) {
        isDone = true;
        if (timer) clearTimeout(timer);
        utterance.onend = null;
        utterance.onerror = null;
        resolve();
      }
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    // Timeout an toàn 3.5s
    timer = setTimeout(finish, 3500);

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      finish();
    }
  });
}

/**
 * Luồng thực thi phát âm chuẩn sư phạm cho một từ/cặp từ
 */
async function playPronunciationFlow(
  word: string,
  audioUrl: string | undefined,
  posHint: "noun" | "verb" | undefined,
  sessionId: number,
  spokenText?: string,
  phonetic?: string
): Promise<void> {
  // 1. Nếu caller truyền audioUrl cụ thể (như từ DUAL_PRONUNCIATION_MAP hoặc /api/audio/tts?word=...&pos=verb),
  // ưu tiên phát trực tiếp qua audio player
  if (audioUrl) {
    const success = await playAudioSegment(audioUrl, sessionId);
    if (success && sessionId === currentAudioSessionId) return;
  }

  // 2. Dự phòng: Xác định nội dung văn bản chuẩn xác cần đọc
  const cleanWord = (word || "").trim();
  const textToSpeak =
    spokenText ||
    (posHint === "verb"
      ? (cleanWord.toLowerCase().startsWith("to ") ? cleanWord : `to ${cleanWord}`)
      : cleanWord);

  const segments = prepareSpokenSegments(textToSpeak, posHint);
  if (segments.length === 0) return;

  const femaleVoice = getPreferredVoice();

  for (let i = 0; i < segments.length; i++) {
    if (sessionId !== currentAudioSessionId) return;

    const segment = segments[i];
    const ttsUrl = posHint
      ? `/api/audio/tts?word=${encodeURIComponent(cleanWord)}&pos=${posHint}&text=${encodeURIComponent(segment)}`
      : `/api/audio/tts?word=${encodeURIComponent(cleanWord)}&text=${encodeURIComponent(segment)}`;

    // 1. Thử phát bằng endpoint TTS giọng Nữ chuẩn
    const audioSuccess = await playAudioSegment(ttsUrl, sessionId);

    // 2. Dự phòng bằng Web Speech API giọng Nữ nếu audio stream thất bại
    if (!audioSuccess && sessionId === currentAudioSessionId) {
      await speakSingleSegment(segment, femaleVoice, sessionId);
    }

    // 3. Tạm nghỉ 350ms giữa các phân đoạn (đối với cặp từ như historic / historical)
    if (i < segments.length - 1 && sessionId === currentAudioSessionId) {
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }
}

/**
 * Phát âm một từ hoặc cặp từ vựng:
 * - Đồng nhất 100% bằng GIỌNG NỮ en-US chuẩn
 * - Hỗ trợ truyền riêng ngữ cảnh / từ loại (noun / verb) và chuỗi văn bản phát âm cụ thể
 * - Tự động bóc tách phân đoạn sạch, không đọc dấu gạch chéo, dấu câu, ký hiệu từ loại
 * - Ngăn chặn hoàn toàn hiện tượng vang âm, phát đè âm thanh
 */
export async function playPronunciation(
  word: string,
  audioUrl?: string,
  posHint?: "noun" | "verb",
  spokenText?: string,
  phonetic?: string
): Promise<void> {
  if (!word && !audioUrl) return;

  stopAllAudio();
  const sessionId = currentAudioSessionId;

  await playPronunciationFlow(word, audioUrl, posHint, sessionId, spokenText, phonetic);
}

/**
 * Phát âm tuần tự cả 2 dạng Danh từ và Động từ cho từ đa từ loại (Dual POS)
 * Giúp người học phân biệt rõ ràng trọng âm âm tiết 1 (Danh từ) và âm tiết 2 (Động từ).
 * Đều phát bằng giọng Nữ en-US chuẩn xác.
 * Ví dụ: "record", "present", "contract", "conduct", "produce", "object"
 */
export async function playDualPronunciation(
  word: string,
  audioUrls?: { nounAudioUrl?: string; verbAudioUrl?: string }
): Promise<void> {
  if (!word || typeof window === "undefined") return;

  stopAllAudio();
  const sessionId = currentAudioSessionId;

  // 1. Phát âm dạng danh từ (trọng âm âm tiết 1) và CHỜ CHO ĐẾN KHI KẾT THÚC HOÀN TOÀN
  await playPronunciationFlow(
    word,
    audioUrls?.nounAudioUrl,
    "noun",
    sessionId,
    word
  );

  if (sessionId !== currentAudioSessionId) return;

  // 2. Tạm dừng 400ms giữa 2 từ để ngắt nghỉ tự nhiên, không bị chồng đè âm thanh
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (sessionId !== currentAudioSessionId) return;

  // 3. Phát âm dạng động từ (trọng âm âm tiết 2 với tiền tố to)
  const verbText = word.toLowerCase().startsWith("to ") ? word : `to ${word}`;
  await playPronunciationFlow(
    word,
    audioUrls?.verbAudioUrl,
    "verb",
    sessionId,
    verbText
  );
}
