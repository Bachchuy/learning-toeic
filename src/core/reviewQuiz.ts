/**
 * Module: reviewQuiz.ts
 * Thuật toán phục vụ Hệ thống Ôn tập Từ vựng Đa năng (Versatile Review Suite)
 * - Sinh câu hỏi trắc nghiệm xuôi (EN -> VI) và đảo (VI -> EN) với distractors hợp lý
 * - Thuật toán gợi ý ký tự từng nấc (Hint Revealer)
 * - So khớp chính tả với khoảng cách Levenshtein (Typo Tolerance)
 */

export interface QuizOption {
  id: string;
  label: string;
  isCorrect: boolean;
  word?: string;
}

/**
 * Tính khoảng cách Levenshtein giữa 2 chuỗi
 * Dùng để phát hiện lỗi gõ phím nhẹ (Typo Tolerance)
 */
export function calculateLevenshteinDistance(a: string, b: string): number {
  const s1 = a.trim().toLowerCase();
  const s2 = b.trim().toLowerCase();

  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Kiểm tra kết quả nhập từ của học viên:
 * - isExact: Khớp hoàn toàn (không phân biệt hoa thường)
 * - isClose: Gần đúng (sai 1 ký tự đối với từ từ 4 ký tự trở lên)
 */
export function evaluateSpellingInput(
  input: string,
  targetWord: string
): { isExact: boolean; isClose: boolean; distance: number } {
  const cleanInput = input.trim().toLowerCase();
  const cleanTarget = targetWord.trim().toLowerCase();

  if (!cleanInput) {
    return { isExact: false, isClose: false, distance: cleanTarget.length };
  }

  if (cleanInput === cleanTarget) {
    return { isExact: true, isClose: false, distance: 0 };
  }

  const distance = calculateLevenshteinDistance(cleanInput, cleanTarget);
  const isClose = distance === 1 && cleanTarget.length >= 4;

  return { isExact: false, isClose, distance };
}

/**
 * Tạo chuỗi ký tự gợi ý theo từng cấp độ bấm nút Gợi ý:
 * - Cấp 0: Toàn bộ là dấu sao * (độ dài bằng từ)
 * - Cấp 1: Hiện ký tự đầu tiên
 * - Cấp 2: Hiện ký tự đầu và ký tự cuối
 * - Cấp 3+: Hiện thêm các ký tự ở vị trí xen kẽ
 */
export function generateHintDisplay(word: string, hintLevel: number): string {
  const clean = word.trim();
  if (!clean) return "";

  const chars = clean.split("");
  const len = chars.length;

  if (hintLevel <= 0) {
    return chars.map((c) => (c === " " ? " " : "*")).join("");
  }

  return chars
    .map((c, index) => {
      if (c === " " || c === "-" || c === "'") return c;

      // Cấp 1: Ký tự đầu
      if (hintLevel >= 1 && index === 0) return c;

      // Cấp 2: Ký tự cuối
      if (hintLevel >= 2 && index === len - 1) return c;

      // Cấp 3: Ký tự ở giữa
      if (hintLevel >= 3 && index === Math.floor(len / 2)) return c;

      // Cấp 4+: Các ký tự chẵn
      if (hintLevel >= 4 && index % 2 === 0) return c;

      return "*";
    })
    .join("");
}

/**
 * Trộn mảng ngẫu nhiên (Fisher-Yates)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Sinh danh sách 4 phương án trắc nghiệm:
 * - Mode 'en_to_vi': Đề bài là tiếng Anh, 4 phương án là nghĩa tiếng Việt
 * - Mode 'vi_to_en': Đề bài là tiếng Việt, 4 phương án là từ tiếng Anh
 */
export function generateQuizOptions(
  currentCard: { word: string; meaning: string },
  allCards: Array<{ word: string; meaning: string }>,
  mode: "en_to_vi" | "vi_to_en" = "en_to_vi"
): QuizOption[] {
  const correctLabel = mode === "en_to_vi" ? currentCard.meaning : currentCard.word;

  // Lọc lấy các phương án khác nhau làm distractor
  const pool = allCards
    .filter((c) => c.word.toLowerCase() !== currentCard.word.toLowerCase())
    .map((c) => ({
      word: c.word,
      label: mode === "en_to_vi" ? c.meaning : c.word,
    }))
    // Loại bỏ các label trùng nhau
    .filter(
      (item, idx, self) =>
        item.label !== correctLabel &&
        self.findIndex((t) => t.label.toLowerCase() === item.label.toLowerCase()) === idx
    );

  // Chọn tối đa 3 distractors
  const shuffledDistractors = shuffleArray(pool).slice(0, 3);

  // Dự phòng nếu không đủ thẻ trong kho
  const fallbackDistractors =
    mode === "en_to_vi"
      ? [
          { word: "reschedule", label: "sắp xếp lại lịch trình" },
          { word: "inventory", label: "hàng tồn kho, kiểm kê" },
          { word: "reimburse", label: "hoàn trả, bồi hoàn chi phí" },
          { word: "compliance", label: "sự tuân thủ quy định" },
        ]
      : [
          { word: "negotiate", label: "negotiate" },
          { word: "implement", label: "implement" },
          { word: "accommodate", label: "accommodate" },
          { word: "authorize", label: "authorize" },
        ];

  let index = 0;
  while (shuffledDistractors.length < 3 && index < fallbackDistractors.length) {
    const fb = fallbackDistractors[index];
    if (
      fb.label !== correctLabel &&
      !shuffledDistractors.some((d) => d.label === fb.label)
    ) {
      shuffledDistractors.push(fb);
    }
    index++;
  }

  const options: QuizOption[] = [
    {
      id: "correct",
      label: correctLabel,
      isCorrect: true,
      word: currentCard.word,
    },
    ...shuffledDistractors.map((d, i) => ({
      id: `distractor-${i}`,
      label: d.label,
      isCorrect: false,
      word: d.word,
    })),
  ];

  return shuffleArray(options);
}
