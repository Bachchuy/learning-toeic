/**
 * Business Rules & Validator Logic cho Hàng đợi Duyệt Đề Admin (M11 /admin/review)
 * Tuân thủ docs/04-business-rules.md §4.9 & docs/05-design/screens.md M10
 */

export interface ValidationCheckItem {
  id: string; // S3, S4, S5, S6
  name: string;
  status: "pass" | "fail" | "warn";
  description: string;
}

export interface AutomatedValidatorReport {
  overallPass: boolean;
  checks: ValidationCheckItem[];
}

/**
 * Kiểm tra xem stem có đúng một chỗ trống hay không (Quy tắc S3)
 * Chỗ trống trong đề TOEIC Part 5 thường là chuỗi 3 dấu gạch dưới trở lên, ví dụ "___", "______"
 */
export function validateStemBlank(stem: string): {
  valid: boolean;
  blankCount: number;
  error?: string;
} {
  if (!stem || typeof stem !== "string") {
    return { valid: false, blankCount: 0, error: "Nội dung câu hỏi không được để trống" };
  }

  // Regex tìm các vị trí có ít nhất 2 dấu gạch dưới liên tiếp (ví dụ: __, ______, ...)
  const blankMatches = stem.match(/_{2,}/g) || [];
  const blankCount = blankMatches.length;

  if (blankCount === 0) {
    return {
      valid: false,
      blankCount: 0,
      error: "Câu hỏi phải có một chỗ trống để điền (ví dụ: ______)",
    };
  }

  if (blankCount > 1) {
    return {
      valid: false,
      blankCount,
      error: `Câu hỏi Part 5 chỉ được có đúng 1 chỗ trống (hiện có ${blankCount} chỗ trống)`,
    };
  }

  return { valid: true, blankCount: 1 };
}

/**
 * Kiểm tra 4 phương án đáp án A, B, C, D (Quy tắc S4)
 * Yêu cầu: Đúng 4 phương án, không phương án nào rỗng, và không phương án nào trùng lặp nhau
 */
export function validateOptions(options: string[]): {
  valid: boolean;
  error?: string;
} {
  if (!Array.isArray(options) || options.length !== 4) {
    return { valid: false, error: "Câu hỏi phải có đúng 4 phương án lựa chọn (A, B, C, D)" };
  }

  const trimmed = options.map((opt) => (opt || "").trim());

  // Kiểm tra rỗng
  for (let i = 0; i < 4; i++) {
    if (trimmed[i].length === 0) {
      const label = String.fromCharCode(65 + i); // A, B, C, D
      return { valid: false, error: `Phương án ${label} không được để trống` };
    }
  }

  // Kiểm tra trùng lặp
  const uniqueSet = new Set(trimmed.map((opt) => opt.toLowerCase()));
  if (uniqueSet.size < 4) {
    return { valid: false, error: "Các phương án lựa chọn không được trùng lặp nhau" };
  }

  return { valid: true };
}

/**
 * Kiểm tra chỉ số đáp án đúng (Quy tắc S5)
 */
export function validateCorrectIndex(index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index <= 3;
}

export interface QuestionForValidation {
  stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_index?: number;
  explanation?: {
    rule_vi?: string;
    why_correct_vi?: string;
    why_wrong_vi?: Record<string, string>;
  } | null;
}

/**
 * Chạy bộ kiểm định chất lượng tự động (Validator Report S3 - S6)
 */
export function runAutomatedValidator(question: QuestionForValidation): AutomatedValidatorReport {
  const checks: ValidationCheckItem[] = [];

  // S3: Kiểm tra chỗ trống
  const blankRes = validateStemBlank(question.stem);
  checks.push({
    id: "S3",
    name: "Kiểm tra Chỗ trống",
    status: blankRes.valid ? "pass" : "fail",
    description: blankRes.valid
      ? "Đúng 1 chỗ trống hợp lệ trong câu"
      : blankRes.error || "Lỗi chỗ trống",
  });

  // S4: Kiểm tra 4 phương án
  const optRes = validateOptions([
    question.option_a,
    question.option_b,
    question.option_c,
    question.option_d,
  ]);
  checks.push({
    id: "S4",
    name: "Kiểm tra 4 Phương án",
    status: optRes.valid ? "pass" : "fail",
    description: optRes.valid
      ? "Đủ 4 phương án phân biệt, không trùng lặp"
      : optRes.error || "Lỗi phương án",
  });

  // S5: Kiểm tra đáp án chính xác
  const hasValidIndex = question.correct_index !== undefined && validateCorrectIndex(question.correct_index);
  checks.push({
    id: "S5",
    name: "Chỉ số Đáp án",
    status: hasValidIndex ? "pass" : "fail",
    description: hasValidIndex
      ? `Đáp án đúng là phương án ${String.fromCharCode(65 + (question.correct_index ?? 0))}`
      : "Thiếu hoặc sai chỉ số đáp án đúng (0-3)",
  });

  // S6: Kiểm tra giải thích sư phạm (Bắt buộc phải có cả rule_vi và why_correct_vi để được xuất bản)
  const expl = question.explanation;
  const hasRule = !!expl?.rule_vi && expl.rule_vi.trim().length > 0;
  const hasWhyCorrect = !!expl?.why_correct_vi && expl.why_correct_vi.trim().length > 0;

  if (hasRule && hasWhyCorrect) {
    checks.push({
      id: "S6",
      name: "Giải thích Sư phạm",
      status: "pass",
      description: "Có đầy đủ Quy tắc cốt lõi và Lý do chọn đáp án",
    });
  } else {
    checks.push({
      id: "S6",
      name: "Giải thích Sư phạm",
      status: "fail",
      description: "Bắt buộc phải có cả Quy tắc cốt lõi (rule_vi) và Lý do chọn đáp án (why_correct_vi)",
    });
  }

  const overallPass = checks.every((c) => c.status === "pass");

  return {
    overallPass,
    checks,
  };
}
