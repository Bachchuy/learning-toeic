/**
 * Business Rules & Validation Logic cho Hồ sơ Người dùng (M10 Profile)
 * Tuân thủ docs/04-business-rules.md §4.8 & docs/03-decisions/D-log.md D-17
 */

export interface ProfileValidationResult {
  valid: boolean;
  error?: string;
  cleanedDisplayName?: string;
  validatedScore?: number;
}

/**
 * Kiểm tra điểm mục tiêu TOEIC (Thang điểm 10 - 990 theo chuẩn ETS)
 */
export function validateTargetScore(score: number | string): {
  valid: boolean;
  error?: string;
  validatedScore?: number;
} {
  const num = typeof score === "string" ? parseInt(score.trim(), 10) : score;

  if (isNaN(num)) {
    return {
      valid: false,
      error: "Điểm mục tiêu phải là một số nguyên từ 10 đến 990",
    };
  }

  if (num < 10 || num > 990) {
    return {
      valid: false,
      error: "Điểm mục tiêu TOEIC phải nằm trong khoảng từ 10 đến 990 điểm",
    };
  }

  // Điểm TOEIC thường làm tròn tới bội số của 5 (ví dụ: 650, 725), tuy nhiên hệ thống chấp nhận số nguyên từ 10-990
  return {
    valid: true,
    validatedScore: num,
  };
}

/**
 * Kiểm tra và làm sạch tên hiển thị người dùng
 */
export function validateDisplayName(name: string): {
  valid: boolean;
  error?: string;
  cleaned: string;
} {
  const cleaned = name.trim();

  if (cleaned.length === 0) {
    return {
      valid: true,
      cleaned: "Học viên",
    };
  }

  if (cleaned.length > 50) {
    return {
      valid: false,
      error: "Tên hiển thị không được vượt quá 50 ký tự",
      cleaned: cleaned.slice(0, 50),
    };
  }

  return {
    valid: true,
    cleaned,
  };
}

/**
 * Kiểm tra mã xác nhận xóa tài khoản vĩnh viễn (D-17)
 * Yêu cầu người dùng gõ chính xác "XOA" (chấp nhận xoa/XOA có khoảng trắng)
 */
export function validateDeleteConfirmation(confirmation: string): boolean {
  if (!confirmation) return false;
  return confirmation.trim().toUpperCase() === "XOA";
}

export interface UserExportPayload {
  exportedAt: string;
  version: string;
  profile: {
    id: string;
    email: string;
    displayName: string;
    targetScore: number;
    role: string;
    createdAt: string;
  };
  summary: {
    totalVocab: number;
    totalAttempts: number;
    totalCards: number;
  };
  vocabList: Array<{
    word: string;
    pos?: string;
    meaning: string;
    contextSentence?: string;
    savedAt: string;
  }>;
  reviewCards: Array<{
    cardId: string;
    state: number;
    stability: number;
    difficulty: number;
    due: string;
    reps: number;
    lapses: number;
  }>;
  recentAttempts: Array<{
    questionId: string;
    tagId: number;
    isCorrect: boolean;
    answeredAt: string;
  }>;
}

/**
 * Chuẩn bị dữ liệu xuất JSON sạch sẽ cho học viên tải về (Data Ownership)
 */
export function buildUserExportJson(payload: UserExportPayload): string {
  return JSON.stringify(payload, null, 2);
}
