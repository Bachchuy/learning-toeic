import { z } from "zod";

export type OptionLetter = "A" | "B" | "C" | "D";

export const OPTION_LETTERS_4: readonly OptionLetter[] = ["A", "B", "C", "D"] as const;
export const OPTION_LETTERS_3: readonly ("A" | "B" | "C")[] = ["A", "B", "C"] as const;

export const CANONICAL_PART5_TAGS = [
  { id: 1, code: "tenses", name: "Thì động từ (Tenses)" },
  { id: 2, code: "subject_verb", name: "Hòa hợp Chủ ngữ - Động từ" },
  { id: 3, code: "passive_voice", name: "Câu bị động (Passive Voice)" },
  { id: 4, code: "modals", name: "Động từ khuyết thiếu (Modal Verbs)" },
  { id: 5, code: "gerund_infinitive", name: "Danh động từ & Động từ nguyên mẫu (V-ing / To-V)" },
  { id: 6, code: "participles", name: "Phân từ & Rút gọn mệnh đề" },
  { id: 7, code: "relative_clauses", name: "Mệnh đề quan hệ (Relative Clauses)" },
  { id: 8, code: "conditionals", name: "Câu điều kiện & Thể giả định" },
  { id: 9, code: "comparisons", name: "Cấu trúc so sánh (Comparisons)" },
  { id: 10, code: "conjunctions_prepositions", name: "Liên từ & Giới từ" },
  { id: 11, code: "nouns_pronouns", name: "Danh từ & Đại từ" },
  { id: 12, code: "adjectives_adverbs", name: "Tính từ & Trạng từ" },
  { id: 13, code: "inversion", name: "Đảo ngữ (Inversion)" },
  { id: 14, code: "word_form", name: "Từ loại (Word Form)" },
  { id: 15, code: "collocations", name: "Cụm từ cố định (Collocations)" },
  { id: 16, code: "parallel_structure", name: "Cấu trúc song hành (Parallelism)" },
] as const;

/**
 * Danh sách đầy đủ các chuỗi mẫu rập khuôn / dự phòng từ các đợt ingest cũ hoặc parser fallback.
 * Dùng chung cho cả Runtime Sanitizer (schemas.ts), AI Refiner (refine-explanations-ai.ts) và QA Audit.
 */
export const GENERIC_TEMPLATE_SUBSTRINGS: readonly string[] = [
  "Phương án sai theo ngữ cảnh",
  "Phương án sai",
  "sai theo ngữ cảnh",
  "không phù hợp về ngữ nghĩa hoặc không tạo thành cụm từ tự nhiên",
  "tạo thành cấu trúc so sánh chuẩn xác theo dấu hiệu ngữ pháp trong câu",
  "Quy tắc nhận diện từ loại (Word Form). Xác định vị trí của chỗ trống",
  "Quy tắc chia thì động từ (Tenses) và sự phối hợp thì trong câu. Dựa vào dấu hiệu thời gian",
  "Quy tắc sử dụng Đại từ (Pronouns) và Danh từ. Phân biệt rõ giữa",
  "Từ khóa chính trong câu",
  "Đáp án đúng. Mang nghĩa và cấu trúc chuẩn xác nhất cho câu.",
  "Phương án này không phù hợp với cấu trúc ngữ pháp của câu.",
  "Phương án này thỏa mãn hoàn toàn cấu trúc ngữ pháp và ngữ cảnh của câu.",
  "Phương án này tạo nên cấu trúc ngữ pháp chuẩn xác và truyền đạt đúng ý nghĩa trong ngữ cảnh câu.",
  "Cấu trúc ngữ pháp trọng tâm theo chuẩn đề thi TOEIC Part 5.",
  "Quy tắc ngữ pháp chuẩn ETS.",
  "Dịch nghĩa câu hỏi theo ngữ cảnh công sở.",
  "Đáp án chính xác theo ngữ cảnh bài đọc.",
  "tuân thủ đúng dạng động từ theo cấu trúc chuẩn",
  "kết nối chính xác ngữ nghĩa và ngữ pháp với thành phần đứng sau",
  "thể hiện đúng ý nghĩa mức độ khả năng/bắt buộc",
  "hoàn thiện cấu trúc ngữ pháp của câu",
  "chia đúng thì của động từ phù hợp với mốc thời gian",
  "đảm nhiệm đúng chức năng ngữ pháp trong vị trí cụm danh từ",
  "sai từ loại, không đứng vào vị trí ngữ pháp này",
  "sai thì hoặc sai dạng chia động từ theo chủ ngữ",
  "sai chức năng ngữ pháp (chủ ngữ/tân ngữ/sở hữu)",
  "không phù hợp về cấu trúc (cần Noun/Clause)",
  "mang ngữ nghĩa phù hợp nhất với ngữ cảnh của câu và kết hợp tự nhiên với các từ xung quanh",
] as const;

/**
 * Các mẫu câu sáo rỗng khi AI viết lướt quá ngắn (không phân tích cụ thể từ/cấu trúc).
 */
const VAGUE_SHORT_OPTION_PATTERNS: readonly RegExp[] = [
  /^(?:(?:phương án\s*)?(?:sai|không đúng|không phù hợp|không hợp lý)\s*(?:vì|do)?\s*)?(?:không phù hợp (?:với )?|sai\s*)?(?:ngữ pháp|ngữ nghĩa|ngữ cảnh|cấu trúc|thì|từ loại)(?:\s*của câu)?\.?$/i,
  /^(?:sai\s*(?:vì|do)\s*)?không hợp nghĩa(?:\s*(?:trong|của) câu)?\.?$/i,
  /^đáp án đúng\.?$/i,
];

/**
 * Chỉ kiểm tra xem chuỗi có khớp với các mẫu template/boilerplate rập khuôn đã biết hay không
 * (An toàn để lọc runtime trong parseExplanation mà không xóa nhầm ghi chú ngắn hợp lệ).
 */
export function isBoilerplateTemplateText(text?: string | null): boolean {
  if (typeof text !== "string") return false;
  const trimmed = text.trim();
  if (!trimmed) return false;

  for (const sub of GENERIC_TEMPLATE_SUBSTRINGS) {
    if (trimmed.includes(sub)) {
      return true;
    }
  }
  return false;
}

export function isGenericExplanationText(text?: string | null): boolean {
  if (typeof text !== "string") return true;
  const trimmed = text.trim();
  if (!trimmed) return true;

  if (isBoilerplateTemplateText(trimmed)) {
    return true;
  }

  for (const pattern of VAGUE_SHORT_OPTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }

  return false;
}

export interface Part5QualityCheckOptions {
  requireExample?: boolean;
}

/**
 * Kiểm tra lời giải Part 5 có bị thiếu trường, quá chung chung hay dính template cũ cần AI tinh chỉnh lại không.
 */
export function isPart5ExplanationNeedsRefinement(
  explanation: unknown,
  options?: Part5QualityCheckOptions
): boolean {
  if (!explanation || typeof explanation !== "object" || Array.isArray(explanation)) {
    return true;
  }

  const expl = explanation as Record<string, unknown>;
  const serialized = JSON.stringify(expl);
  for (const sub of GENERIC_TEMPLATE_SUBSTRINGS) {
    if (serialized.includes(sub)) {
      return true;
    }
  }

  const ruleVi = typeof expl.rule_vi === "string" ? expl.rule_vi.trim() : "";
  const whyCorrect = typeof expl.why_correct_vi === "string" ? expl.why_correct_vi.trim() : "";
  const translation =
    typeof expl.full_translation_vi === "string" ? expl.full_translation_vi.trim() : "";
  const tipVi = typeof expl.tip_vi === "string" ? expl.tip_vi.trim() : "";
  const exampleEn = typeof expl.example_en === "string" ? expl.example_en.trim() : "";

  if (ruleVi.length < 20 || isGenericExplanationText(ruleVi)) return true;
  if (whyCorrect.length < 25 || isGenericExplanationText(whyCorrect)) return true;
  if (translation.length < 10 || isGenericExplanationText(translation)) return true;
  if (tipVi.length < 15 || isGenericExplanationText(tipVi)) return true;
  if (options?.requireExample && exampleEn.length < 10) return true;

  const analysis = expl.options_analysis;
  if (!analysis || typeof analysis !== "object" || Array.isArray(analysis)) {
    return true;
  }

  const analysisObj = analysis as Record<string, unknown>;
  for (const letter of OPTION_LETTERS_4) {
    const val = analysisObj[letter];
    if (typeof val !== "string" || val.trim().length < 15 || isGenericExplanationText(val)) {
      return true;
    }
  }

  return false;
}

/**
 * Kiểm tra lời giải Part 6 / Part 7 (lưu trong question_answers.explanation) có cần nâng cấp không.
 * Phát hiện cả trường hợp lưu plain string (105 câu bổ sung) lẫn object cũ thiếu options_analysis.
 */
export function isReadingExplanationNeedsRefinement(explanation: unknown): boolean {
  if (!explanation || typeof explanation !== "object" || Array.isArray(explanation)) {
    return true;
  }

  const expl = explanation as Record<string, unknown>;
  const translation =
    (typeof expl.full_translation_vi === "string" && expl.full_translation_vi.trim()) ||
    (typeof expl.translation === "string" && expl.translation.trim()) ||
    "";
  const whyCorrect =
    (typeof expl.why_correct_vi === "string" && expl.why_correct_vi.trim()) ||
    (typeof expl.analysis === "string" && expl.analysis.trim()) ||
    "";
  const keyClue =
    (typeof expl.key_clue === "string" && expl.key_clue.trim()) ||
    (typeof expl.evidence === "string" && expl.evidence.trim()) ||
    "";
  const tipVi = typeof expl.tip_vi === "string" ? expl.tip_vi.trim() : "";

  if (translation.length < 10 || isGenericExplanationText(translation)) return true;
  if (whyCorrect.length < 25 || isGenericExplanationText(whyCorrect)) return true;
  if (keyClue.length < 5) return true;
  if (tipVi.length < 12) return true;

  const analysis = expl.options_analysis;
  if (!analysis || typeof analysis !== "object" || Array.isArray(analysis)) {
    return true;
  }

  const analysisObj = analysis as Record<string, unknown>;
  for (const letter of OPTION_LETTERS_4) {
    const val = analysisObj[letter];
    if (typeof val !== "string" || val.trim().length < 15 || isGenericExplanationText(val)) {
      return true;
    }
  }

  return false;
}

export interface ExamAnswerRecordForQuality {
  part: number;
  explanation?: string | null;
  explanation_vi?: string | null;
  evidence?: string | null;
}

export const ExamStructuredExplanationSchema = z.object({
  part: z.number().int().min(1).max(7).optional(),
  question_type_vi: z.string().min(1),
  strategy_vi: z.string().min(1),
  evidence: z.string().optional(),
  why_correct_vi: z.string().min(1),
  options_analysis: z
    .object({
      A: z.string().optional(),
      B: z.string().optional(),
      C: z.string().optional(),
      D: z.string().optional(),
    })
    .optional(),
  tip_vi: z.string().optional(),
  translation_vi: z.string().optional(),
  vocab_hints: z
    .array(
      z.object({
        word: z.string(),
        meaning_vi: z.string(),
      })
    )
    .optional(),
});

export type ExamStructuredExplanation = z.infer<typeof ExamStructuredExplanationSchema>;

export interface ParsedExamExplanation {
  isStructured: boolean;
  questionTypeVi?: string;
  strategyVi?: string;
  evidence?: string;
  whyCorrectVi?: string;
  optionsAnalysis?: Partial<Record<OptionLetter, string>>;
  tipVi?: string;
  translationVi?: string;
  vocabHints?: Array<{ word: string; meaning_vi: string }>;
  summary?: string;
}

/**
 * Kiểm tra một bản ghi `exam_set_answers` (Part 1–7) đã đạt chuẩn cấu trúc chi tiết từng phương án chưa.
 */
export function isExamAnswerNeedsRefinement(row: ExamAnswerRecordForQuality): boolean {
  const raw = (row.explanation || "").trim();
  if (!raw || !raw.startsWith("{")) {
    return true;
  }

  try {
    const parsedJson = JSON.parse(raw);
    const parsed = ExamStructuredExplanationSchema.safeParse(parsedJson);
    if (!parsed.success) return true;

    const data = parsed.data;
    if (data.strategy_vi.trim().length < 15 || isGenericExplanationText(data.strategy_vi)) {
      return true;
    }
    if (data.why_correct_vi.trim().length < 20 || isGenericExplanationText(data.why_correct_vi)) {
      return true;
    }

    const translation = (data.translation_vi || row.explanation_vi || "").trim();
    if (translation.length < 10) return true;
    if (!data.tip_vi || data.tip_vi.trim().length < 12) return true;

    const requiredLetters = row.part === 2 ? OPTION_LETTERS_3 : OPTION_LETTERS_4;
    const analysis = data.options_analysis;
    if (!analysis) return true;

    for (const letter of requiredLetters) {
      const val = analysis[letter];
      if (typeof val !== "string" || val.trim().length < 12 || isGenericExplanationText(val)) {
        return true;
      }
    }

    return false;
  } catch {
    return true;
  }
}

/**
 * Phân tích dữ liệu `exam_set_answers.explanation` + `explanation_vi` tương thích ngược:
 * - Nếu là JSON chuẩn hóa -> trả về `isStructured: true` đầy đủ từng phần.
 * - Nếu là chuỗi văn bản cũ -> trả về `isStructured: false` với `summary` và `translationVi`.
 */
export function parseExamExplanation(
  rawExplanation?: string | null,
  rawExplanationVi?: string | null
): ParsedExamExplanation | null {
  const trimmed = typeof rawExplanation === "string" ? rawExplanation.trim() : "";
  const trimmedVi = typeof rawExplanationVi === "string" ? rawExplanationVi.trim() : "";

  if (!trimmed && !trimmedVi) {
    return null;
  }

  if (trimmed.startsWith("{")) {
    try {
      const json = JSON.parse(trimmed);
      const parsed = ExamStructuredExplanationSchema.safeParse(json);
      if (parsed.success) {
        const d = parsed.data;
        const cleanOptions: Partial<Record<OptionLetter, string>> = {};
        if (d.options_analysis) {
          for (const letter of OPTION_LETTERS_4) {
            const val = d.options_analysis[letter]?.trim();
            if (val) {
              cleanOptions[letter] = val;
            }
          }
        }
        return {
          isStructured: true,
          questionTypeVi: d.question_type_vi.trim(),
          strategyVi: d.strategy_vi.trim(),
          evidence: d.evidence?.trim() || undefined,
          whyCorrectVi: d.why_correct_vi.trim(),
          optionsAnalysis:
            Object.keys(cleanOptions).length > 0 ? cleanOptions : undefined,
          tipVi: d.tip_vi?.trim() || undefined,
          translationVi: d.translation_vi?.trim() || trimmedVi || undefined,
          vocabHints: d.vocab_hints,
          summary: d.why_correct_vi.trim(),
        };
      }
    } catch {
      // Fall through to legacy plain text
    }
  }

  return {
    isStructured: false,
    summary: trimmed || undefined,
    translationVi: trimmedVi || undefined,
  };
}

/**
 * Chuyển cấu trúc giải thích sang một chuỗi tóm tắt đọc được khi cần log/QA hoặc fallback text.
 */
export function formatExamExplanationSummary(data: ExamStructuredExplanation): string {
  const lines: string[] = [];
  if (data.question_type_vi) lines.push(`[${data.question_type_vi}]`);
  if (data.strategy_vi) lines.push(`Quy tắc/Chiến lược: ${data.strategy_vi}`);
  if (data.why_correct_vi) lines.push(`Lý do đúng: ${data.why_correct_vi}`);
  if (data.options_analysis) {
    for (const letter of OPTION_LETTERS_4) {
      const reason = data.options_analysis[letter];
      if (reason) lines.push(`(${letter}) ${reason}`);
    }
  }
  if (data.tip_vi) lines.push(`Mẹo: ${data.tip_vi}`);
  return lines.join("\n");
}

// ============================================================================
// PROMPT BUILDERS & GEMINI JSON RESPONSE SCHEMAS (PART 1 -> PART 7)
// ============================================================================

export const PART5_SITUATION_GUIDELINES = `
QUY TẮC PHÂN TÍCH CỤ THỂ THEO TỪNG TÌNH HUỐNG PART 5 (BẮT BUỘC ÁP DỤNG ĐÚNG TÌNH HUỐNG CỦA CÂU):
- Tình huống 1 — Từ loại (Word Form, tag 14): Bắt buộc trích dẫn trực tiếp 1–2 từ đứng NGAY TRƯỚC và NGAY SAU chỗ trống trong đề bài để chứng minh công thức vị trí (vd: sau mạo từ 'a' và trước danh từ 'summary' → cần Tính từ). Trong options_analysis, ghi rõ TỪ LOẠI (n/v/adj/adv) + NGHĨA TIẾNG VIỆT + lý do đúng/sai ngữ pháp cho TỪNG phương án A, B, C, D.
- Tình huống 2 — Thì động từ / Bị động / Hòa hợp S-V / Phân từ (tag 1, 2, 3, 6): Bắt buộc trích dẫn nguyên văn từ khóa thời gian (since..., by the time..., yesterday...), chủ ngữ số ít/nhiều, hoặc dấu hiệu bị động (by..., be + V3/ed, vật không tự thực hiện hành động) từ đề bài. Trong options_analysis, chỉ rõ TỪNG phương án sai ở thì nào, chủ động vs bị động, số ít vs số nhiều, hay V-ing (chủ động) vs V3/ed (bị động).
- Tình huống 3 — Liên từ / Giới từ / Song hành (tag 10, 16): Bắt buộc phân tích thành phần theo sau chỗ trống là CỤM DANH TỪ / V-ing hay MỆNH ĐỀ (S + V) và nêu rõ quan hệ logic (tương phản, nguyên nhân-kết quả, điều kiện, mốc thời gian). Trong options_analysis, phân loại rõ từ đó là giới từ, liên từ phụ thuộc, hay trạng từ liên kết kèm nghĩa tiếng Việt.
- Tình huống 4 — Giả định / Điều kiện / So sánh / Mệnh đề quan hệ / V-ing & To-V / Đại từ / Modal (tag 4, 5, 7, 8, 9, 11, 12, 13): Trích dẫn từ kích hoạt cụ thể trong đề bài (requested that, If..., than, danh từ chỉ người/vật trước đại từ quan hệ, động từ đi với to-V/V-ing) và giải thích rõ cấu trúc đúng/sai của cả 4 phương án A, B, C, D.
- Tình huống 5 — Từ vựng ngữ cảnh & Cụm từ cố định (Collocations, tag 15): Bắt buộc dịch nghĩa chính xác của TẤT CẢ 4 phương án A, B, C, D trong ngữ cảnh công sở, chỉ rõ cụm từ đi kèm/giới từ/động từ-tân ngữ ăn khớp (collocation), và giải thích cụ thể vì sao 3 từ còn lại lệch nghĩa hoặc không ghép được với từ khóa trong câu.

LUẬT CHỐNG SÁO RỖNG (CẤM VI PHẠM):
- TUYỆT ĐỐI KHÔNG viết chung chung kiểu: "không phù hợp với ngữ cảnh", "sai ngữ pháp", "không tạo thành cụm từ tự nhiên", "không đúng thì" mà không nói rõ nghĩa, từ loại, thì hoặc từ khóa chứng minh.
- Mọi lời giải ở why_correct_vi và options_analysis phải nhắc tên chính từ/cụm từ của phương án đó và trích dẫn từ khóa từ đề bài.
`.trim();

export interface Part5RefinementInput {
  stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correctIndex: number;
}

export const PART5_GEMINI_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    tag_id: { type: "INTEGER" },
    rule_vi: { type: "STRING" },
    why_correct_vi: { type: "STRING" },
    full_translation_vi: { type: "STRING" },
    tip_vi: { type: "STRING" },
    example_en: { type: "STRING" },
    options_analysis: {
      type: "OBJECT",
      properties: {
        A: { type: "STRING" },
        B: { type: "STRING" },
        C: { type: "STRING" },
        D: { type: "STRING" },
      },
      required: ["A", "B", "C", "D"],
    },
    vocab_hints: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          word: { type: "STRING" },
          meaning_vi: { type: "STRING" },
        },
        required: ["word", "meaning_vi"],
      },
    },
  },
  required: [
    "tag_id",
    "rule_vi",
    "why_correct_vi",
    "full_translation_vi",
    "tip_vi",
    "example_en",
    "options_analysis",
    "vocab_hints",
  ],
};

export function buildPart5RefinementPrompt(q: Part5RefinementInput): string {
  const letters = OPTION_LETTERS_4;
  const correctLetter = letters[q.correctIndex] || "A";
  const optionsArr = [q.option_a, q.option_b, q.option_c, q.option_d];
  const correctText = optionsArr[q.correctIndex] || "";

  return `
Bạn là chuyên gia sư phạm TOEIC 990 điểm. Hãy viết lời giải chi tiết, chuẩn xác, cụ thể theo đúng tình huống ngữ pháp/từ vựng cho câu hỏi TOEIC Part 5 sau:

ĐỀ BÀI: "${q.stem}"
A. ${q.option_a}
B. ${q.option_b}
C. ${q.option_c}
D. ${q.option_d}
ĐÁP ÁN ĐÚNG: ${correctLetter} (${correctText})

DANH SÁCH 16 CHỦ ĐIỂM NGỮ PHÁP (Chọn đúng 1 tag_id phản ánh bản chất ngữ pháp của câu):
${JSON.stringify(CANONICAL_PART5_TAGS.map((t) => ({ id: t.id, name: t.name })))}

${PART5_SITUATION_GUIDELINES}

YÊU CẦU CẤU TRÚC ĐẦU RA:
1. tag_id: Số nguyên 1..16 phản ánh đúng bản chất câu hỏi (vd: chỗ trống cần Danh từ làm chủ ngữ -> 14 Word Form hoặc 11 Nouns; KHÔNG gán nhầm Comparisons chỉ vì câu có 'than' trong mốc thời gian).
2. rule_vi: Quy tắc ngữ pháp / collocation trọng tâm, nêu rõ cấu trúc nhận diện.
3. why_correct_vi: Trích dẫn từ khóa trong đề bài để chứng minh vì sao ${correctLetter} (${correctText}) thỏa mãn cấu trúc và ngữ nghĩa.
4. full_translation_vi: Dịch trọn vẹn câu đề đã điền đáp án đúng sang tiếng Việt tự nhiên, sát ngữ cảnh công sở.
5. tip_vi: Mẹo nhận diện nhanh trong 10–15 giây khi làm bài thi thật.
6. example_en: 1 câu ví dụ tiếng Anh ngắn gọn (ngữ cảnh công sở) minh họa chính quy tắc/cụm từ đó.
7. options_analysis: Phân tích tường tận TỪNG PHƯƠNG ÁN A, B, C, D (bắt buộc nêu rõ chữ của phương án, từ loại/nghĩa tiếng Việt, lý do đúng hoặc sai cụ thể).
8. vocab_hints: 2–3 từ vựng/cụm từ công sở quan trọng nhất trong câu.

TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON:
{
  "tag_id": <số nguyên 1..16>,
  "rule_vi": "<nội dung>",
  "why_correct_vi": "<nội dung>",
  "full_translation_vi": "<dịch nghĩa câu hoàn chỉnh>",
  "tip_vi": "<nội dung>",
  "example_en": "<câu ví dụ tiếng Anh ngắn>",
  "options_analysis": {
    "A": "<phân tích cụ thể A>",
    "B": "<phân tích cụ thể B>",
    "C": "<phân tích cụ thể C>",
    "D": "<phân tích cụ thể D>"
  },
  "vocab_hints": [
    { "word": "<từ vựng>", "meaning_vi": "<nghĩa tiếng Việt>" }
  ]
}
`.trim();
}

export interface Part6RefinementInput {
  passageTitle?: string;
  passageType?: string;
  passageContent: string;
  stem: string;
  orderInPassage?: number | null;
  questionSubType?: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correctIndex: number;
}

export const READING_GEMINI_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    question_type_vi: { type: "STRING" },
    rule_vi: { type: "STRING" },
    why_correct_vi: { type: "STRING" },
    key_clue: { type: "STRING" },
    full_translation_vi: { type: "STRING" },
    tip_vi: { type: "STRING" },
    options_analysis: {
      type: "OBJECT",
      properties: {
        A: { type: "STRING" },
        B: { type: "STRING" },
        C: { type: "STRING" },
        D: { type: "STRING" },
      },
      required: ["A", "B", "C", "D"],
    },
    vocab_hints: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          word: { type: "STRING" },
          meaning_vi: { type: "STRING" },
        },
        required: ["word", "meaning_vi"],
      },
    },
  },
  required: [
    "question_type_vi",
    "rule_vi",
    "why_correct_vi",
    "key_clue",
    "full_translation_vi",
    "tip_vi",
    "options_analysis",
    "vocab_hints",
  ],
};

export function buildPart6RefinementPrompt(q: Part6RefinementInput): string {
  const letters = OPTION_LETTERS_4;
  const correctLetter = letters[q.correctIndex] || "A";
  const optionsArr = [q.option_a, q.option_b, q.option_c, q.option_d];
  const correctText = optionsArr[q.correctIndex] || "";

  return `
Bạn là chuyên gia luyện thi TOEIC 990 điểm. Hãy viết lời giải chi tiết, sát ngữ cảnh đoạn văn cho câu hỏi TOEIC Part 6 (Text Completion) dưới đây:

THỂ LOẠI BÀI ĐỌC: ${q.passageType || "Văn bản công sở"} | TIÊU ĐỀ: ${q.passageTitle || "N/A"}
NỘI DUNG ĐOẠN VĂN:
"""
${q.passageContent}
"""

CÂU HỎI CẦN GIẢI (Chỗ trống #${q.orderInPassage ?? "?"} | Dạng: ${q.questionSubType || "Tự xác định"}):
"${q.stem}"
A. ${q.option_a}
B. ${q.option_b}
C. ${q.option_c}
D. ${q.option_d}
ĐÁP ÁN ĐÚNG: ${correctLetter} (${correctText})

QUY TẮC PHÂN TÍCH CỤ THỂ THEO ĐÚNG TÌNH HUỐNG PART 6:
- Tình huống 1 — Điền từ/cụm từ vào chỗ trống (Từ loại, Thì động từ, Liên từ, Từ vựng ngữ cảnh):
  + Phân tích cả cấu trúc câu chứa chỗ trống LẪN ngữ cảnh đoạn văn xung quanh (mạch thời gian của đoạn, từ nối với câu trước).
  + Phân tích từng phương án A–D: ghi rõ từ loại, nghĩa tiếng Việt, và lý do khớp/lệch ngữ pháp hoặc mạch nghĩa đoạn văn.
- Tình huống 2 — Điền cả câu hoàn chỉnh (Sentence Insertion):
  + Bắt buộc trích dẫn ý chính của CÂU NGAY TRƯỚC và CÂU NGAY SAU chỗ trống (chú ý đại từ thay thế như this/these/they, từ nối however/furthermore/therefore, sự chuyển tiếp chủ đề).
  + Dịch nghĩa phương án đúng và chỉ rõ vì sao 3 câu sai A–D lạc chủ đề, mâu thuẫn thời gian/đối tượng hoặc làm đứt mạch logic đoạn văn.

LUẬT CHỐNG SÁO RỖNG:
- Không viết chung chung "không hợp ngữ cảnh đoạn văn". Phải chỉ rõ dẫn chứng trong đoạn văn và dịch nghĩa từng phương án.

TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON:
{
  "question_type_vi": "<vd: Điền câu liên kết đoạn (Sentence Insertion) hoặc Thì động từ trong đoạn văn>",
  "rule_vi": "<quy tắc ngữ pháp hoặc nguyên tắc liên kết mạch văn>",
  "why_correct_vi": "<giải thích chi tiết vì sao đáp án đúng khớp ngữ cảnh & cấu trúc>",
  "key_clue": "<trích dẫn nguyên văn câu/cụm dẫn chứng trong đoạn văn>",
  "full_translation_vi": "<dịch nghĩa câu hoàn chỉnh sau khi điền đáp án đúng>",
  "tip_vi": "<mẹo nhận diện nhanh cho dạng câu Part 6 này>",
  "options_analysis": {
    "A": "<phân tích cụ thể A>",
    "B": "<phân tích cụ thể B>",
    "C": "<phân tích cụ thể C>",
    "D": "<phân tích cụ thể D>"
  },
  "vocab_hints": [
    { "word": "<từ vựng>", "meaning_vi": "<nghĩa tiếng Việt>" }
  ]
}
`.trim();
}

export interface Part7RefinementInput {
  passageTitle?: string;
  passageType?: string;
  passageContent: string;
  stem: string;
  questionSubType?: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correctIndex: number;
}

export function buildPart7RefinementPrompt(q: Part7RefinementInput): string {
  const letters = OPTION_LETTERS_4;
  const correctLetter = letters[q.correctIndex] || "A";
  const optionsArr = [q.option_a, q.option_b, q.option_c, q.option_d];
  const correctText = optionsArr[q.correctIndex] || "";

  return `
Bạn là chuyên gia luyện thi TOEIC Reading 990 điểm. Hãy viết lời giải đọc hiểu cực kỳ tường minh, trích dẫn bằng chứng chính xác từ bài đọc cho câu hỏi TOEIC Part 7 sau:

THỂ LOẠI VĂN BẢN: ${q.passageType || "Bài đọc"} | TIÊU ĐỀ: ${q.passageTitle || "N/A"}
NỘI DUNG BÀI ĐỌC:
"""
${q.passageContent}
"""

CÂU HỎI (Dạng gợi ý: ${q.questionSubType || "Tự phân loại"}):
"${q.stem}"
A. ${q.option_a}
B. ${q.option_b}
C. ${q.option_c}
D. ${q.option_d}
ĐÁP ÁN ĐÚNG: ${correctLetter} (${correctText})

QUY TẮC PHÂN TÍCH CỤ THỂ THEO TỪNG DẠNG CÂU HỎI PART 7:
- Câu hỏi Ý chính / Mục đích (Main Idea / Purpose): Chỉ rõ câu chủ đề / tiêu đề Subject / đoạn mở đầu nêu mục tiêu của văn bản, và loại trừ các phương án chỉ là chi tiết nhỏ hoặc bịa đặt.
- Câu hỏi Chi tiết (Detail): Chỉ rõ CẶP PARAPHRASE (cụm từ gốc trong bài đọc <-> cụm từ viết lại ở đáp án đúng).
- Câu hỏi Ngoại trừ / Phủ định (NOT / EXCEPT / NOT TRUE): BẮT BUỘC liệt kê vị trí bằng chứng trong bài cho CẢ 3 PHƯƠNG ÁN ĐƯỢC NHẮC ĐẾN (nên bị loại), và khẳng định phương án đúng là điều không xuất hiện hoặc trái ngược thông tin bài đọc.
- Câu hỏi Suy luận (Inference / Implied): Giải thích rõ chuỗi suy luận từng bước từ dữ kiện nguyên văn trong bài đọc (không suy diễn vô căn cứ).
- Câu hỏi Từ vựng ngữ cảnh (Closest in meaning): Trích nguyên câu chứa từ đó trong bài, giải thích nghĩa trong ngữ cảnh và dịch nghĩa cả 4 đáp án A–D.
- Với MỌI phương án nhiễu trong options_analysis: phải dịch ngắn gọn ý phương án và nêu rõ loại bẫy (*Không được nhắc đến (Not Mentioned) / Trái ngược bài đọc / Sai mốc thời gian-con số / Đánh tráo đối tượng*).

TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON:
{
  "question_type_vi": "<vd: Câu hỏi chi tiết (Detail & Paraphrase) / Câu hỏi ngoại trừ (NOT) / Suy luận...>",
  "rule_vi": "<nguyên tắc xử lý dạng câu hỏi đọc hiểu này>",
  "why_correct_vi": "<phân tích cặp paraphrase hoặc chuỗi suy luận dẫn đến đáp án đúng>",
  "key_clue": "<trích dẫn NGUYÊN VĂN 1-2 câu tiếng Anh chứa bằng chứng trong bài đọc>",
  "full_translation_vi": "<dịch tiếng Việt câu hỏi + đáp án đúng + câu bằng chứng chính>",
  "tip_vi": "<mẹo scanning & tránh bẫy nhiễu Part 7>",
  "options_analysis": {
    "A": "<dịch ý + phân tích A đúng/sai ở đâu trong bài>",
    "B": "<dịch ý + phân tích B đúng/sai ở đâu trong bài>",
    "C": "<dịch ý + phân tích C đúng/sai ở đâu trong bài>",
    "D": "<dịch ý + phân tích D đúng/sai ở đâu trong bài>"
  },
  "vocab_hints": [
    { "word": "<từ vựng / cặp paraphrase>", "meaning_vi": "<nghĩa tiếng Việt>" }
  ]
}
`.trim();
}

export interface ExamRefinementInput {
  part: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  stem: string;
  options: string[];
  correctIndex: number;
  contextText?: string; // scene / transcript / passage
  existingEvidence?: string | null;
  existingExplanation?: string | null;
  existingExplanationVi?: string | null;
}

export function getExamGeminiResponseSchema(part: number) {
  const optionProps: Record<string, { type: string }> = {
    A: { type: "STRING" },
    B: { type: "STRING" },
    C: { type: "STRING" },
  };
  const requiredOpts = ["A", "B", "C"];
  if (part !== 2) {
    optionProps.D = { type: "STRING" };
    requiredOpts.push("D");
  }

  return {
    type: "OBJECT",
    properties: {
      question_type_vi: { type: "STRING" },
      strategy_vi: { type: "STRING" },
      evidence: { type: "STRING" },
      why_correct_vi: { type: "STRING" },
      tip_vi: { type: "STRING" },
      translation_vi: { type: "STRING" },
      options_analysis: {
        type: "OBJECT",
        properties: optionProps,
        required: requiredOpts,
      },
      vocab_hints: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            word: { type: "STRING" },
            meaning_vi: { type: "STRING" },
          },
          required: ["word", "meaning_vi"],
        },
      },
    },
    required: [
      "question_type_vi",
      "strategy_vi",
      "evidence",
      "why_correct_vi",
      "tip_vi",
      "translation_vi",
      "options_analysis",
      "vocab_hints",
    ],
  };
}

function getExamPartSpecificRules(part: number): string {
  switch (part) {
    case 1:
      return `
ĐẶC THÙ PART 1 (MÔ TẢ TRANH — 4 ĐÁP ÁN A, B, C, D):
- Dựa vào mô tả cảnh bức tranh (scene) và 4 câu thoại A–D:
  + strategy_vi: Chỉ rõ câu này thuộc tranh tả người hành động (S + is/are + V-ing), bị động đang diễn ra (is/are being + V3/ed), hay tranh vật/trạng thái (has been + V3/ed / is + giới từ vị trí).
  + evidence: Chi tiết trực quan chính trong tranh khớp với đáp án đúng.
  + options_analysis: Dịch tiếng Việt CẢ 4 CÂU A, B, C, D và giải thích rõ bẫy ở từng câu sai (sai chủ thể, sai động từ hành động, nhắc vật không có trong tranh, bẫy thì đang diễn ra vs trạng thái tĩnh).
  + translation_vi: Bản dịch tiếng Việt đầy đủ của cả 4 phương án A, B, C, D.`;
    case 2:
      return `
ĐẶC THÙ PART 2 (HỎI – ĐÁP — CHỈ CÓ 3 ĐÁP ÁN A, B, C):
- CHỈ trả về 3 khóa A, B, C trong options_analysis (KHÔNG thêm D).
- Phân loại rõ dạng câu hỏi: Wh-question (Where/When/Who/Why/How), Yes/No question, Choice question (A or B), Tag/Negative question, hay Statement/Request.
- strategy_vi & why_correct_vi: Chỉ rõ đáp án đúng là trả lời trực tiếp hay trả lời gián tiếp / né tránh thông minh (vd: "I don't know / Ask Ms. X / It depends...").
- options_analysis: Dịch nghĩa câu trả lời và phân tích rõ từng bẫy của 2 câu sai (bẫy lặp từ Word Repetition, bẫy đồng âm Similar Sound, bẫy trả lời Yes/No cho câu hỏi Wh-, sai chủ ngữ/thời gian).
- translation_vi: Dịch tiếng Việt câu hỏi gốc và cả 3 lựa chọn A, B, C.`;
    case 3:
    case 4:
      return `
ĐẶC THÙ PART ${part} (${part === 3 ? "HỘI THOẠI NGẮN" : "BÀI NÓI NGẮN"} — 4 ĐÁP ÁN A, B, C, D):
- Xác định rõ dạng câu hỏi: Ý chính/Chủ đề/Nghề nghiệp-Địa điểm, Chi tiết cụ thể, Hàm ý câu trích dẫn ("What does the speaker mean when he/she says..."), hay Đối chiếu bảng biểu/lịch trình.
- evidence: Trích dẫn NGUYÊN VĂN câu nói trong transcript chứa đáp án.
- why_correct_vi: Giải thích cách paraphrase từ lời nói trong transcript sang đáp án đúng (hoặc hàm ý thực tế trong ngữ cảnh giao tiếp).
- options_analysis: Dịch nghĩa ngắn và giải thích rõ vì sao từng phương án A–D đúng hoặc là bẫy (bẫy từ khóa có nghe thấy nhưng sai đối tượng/sai thời điểm/ngược nghĩa/không được nhắc đến).
- translation_vi: Dịch tiếng Việt câu hỏi, câu bằng chứng trong transcript và các phương án chính.`;
    case 5:
      return PART5_SITUATION_GUIDELINES;
    case 6:
      return `
ĐẶC THÙ PART 6 (ĐIỀN TỪ / ĐIỀN CÂU VÀO ĐOẠN VĂN — 4 ĐÁP ÁN A, B, C, D):
- Phân biệt rõ: điền ngữ pháp/từ vựng trong ngữ cảnh đoạn văn hay điền cả câu hoàn chỉnh (Sentence Insertion).
- Với câu điền ngữ pháp/từ vựng: nêu rõ dấu hiệu quanh chỗ trống + ngữ cảnh đoạn văn, phân tích từ loại/nghĩa/cấu trúc cả 4 phương án A–D.
- Với câu điền câu: chỉ rõ mạch liên kết với câu liền trước và câu liền sau, và giải thích vì sao 3 câu sai lạc mạch hoặc mâu thuẫn.`;
    case 7:
    default:
      return `
ĐẶC THÙ PART 7 (ĐỌC HIỂU ĐOẠN ĐƠN / ĐA ĐOẠN — 4 ĐÁP ÁN A, B, C, D):
- Phân loại rõ dạng câu hỏi (Main Idea/Purpose, Detail & Paraphrase, NOT/EXCEPT, Inference, Vocabulary in Context, Sentence Insertion).
- evidence: Trích nguyên văn câu/cụm chứa thông tin từ bài đọc.
- Nếu là câu NOT/EXCEPT: chỉ rõ vị trí chứng minh 3 đáp án kia CÓ trong bài để loại trừ.
- options_analysis: Dịch ý và chỉ rõ bẫy của từng phương án A–D (Not Mentioned / Opposite / Wrong Detail / Out of Scope).`;
  }
}

export function buildExamRefinementPrompt(q: ExamRefinementInput): string {
  const letters = q.part === 2 ? OPTION_LETTERS_3 : OPTION_LETTERS_4;
  const correctLetter = letters[q.correctIndex] || "A";
  const optionsBlock = letters
    .map((l, idx) => `${l}. ${q.options[idx] ?? ""}`)
    .join("\n");

  const contextSection = q.contextText
    ? `\nNGỮ CẢNH / BÀI ĐỌC / TRANSCRIPT / MÔ TẢ TRANH:\n"""\n${q.contextText}\n"""\n`
    : "";

  const referenceHints =
    q.existingEvidence || q.existingExplanation
      ? `\nGỢI Ý THAM KHẢO SẴN CÓ (chỉ dùng để đối chiếu, phải viết lại đầy đủ và chuẩn xác hơn):\n- Evidence cũ: ${q.existingEvidence || "N/A"}\n- Giải thích cũ: ${q.existingExplanation || "N/A"}\n- Bản dịch cũ: ${q.existingExplanationVi || "N/A"}\n`
      : "";

  return `
Bạn là chuyên gia sư phạm luyện thi TOEIC 990 điểm. Hãy chuẩn hóa và viết lời giải chi tiết, chuẩn xác, phân tích đầy đủ TỪNG PHƯƠNG ÁN cho câu hỏi TOEIC Part ${q.part} sau:
${contextSection}
CÂU HỎI: "${q.stem}"
${optionsBlock}
ĐÁP ÁN ĐÚNG: ${correctLetter} (${q.options[q.correctIndex] ?? ""})
${referenceHints}
${getExamPartSpecificRules(q.part)}

LUẬT CHỐNG SÁO RỖNG:
- TUYỆT ĐỐI KHÔNG viết chung chung ("sai ngữ cảnh", "không đúng", "không nhắc đến" mà không giải thích cụ thể nội dung phương án đó là gì).
- Mỗi mục trong options_analysis phải nêu rõ nội dung/từ khóa của phương án đó và lý do đúng/sai cụ thể bằng tiếng Việt tự nhiên.

TRẢ VỀ DUY NHẤT 1 ĐỐI TƯỢNG JSON:
{
  "question_type_vi": "<tên dạng câu hỏi cụ thể của Part ${q.part}>",
  "strategy_vi": "<quy tắc ngữ pháp / chiến lược xử lý dạng bài này>",
  "evidence": "<trích dẫn nguyên văn từ khóa/câu dẫn chứng hoặc chi tiết tranh>",
  "why_correct_vi": "<giải thích rõ ràng cơ chế chọn đáp án ${correctLetter}>",
  "tip_vi": "<mẹo làm nhanh và tránh bẫy>",
  "translation_vi": "<dịch tiếng Việt đầy đủ câu hỏi, bằng chứng và các phương án>",
  "options_analysis": {
    ${letters.map((l) => `"${l}": "<phân tích cụ thể ${l}>"`).join(",\n    ")}
  },
  "vocab_hints": [
    { "word": "<từ vựng / paraphrase>", "meaning_vi": "<nghĩa tiếng Việt>" }
  ]
}
`.trim();
}
