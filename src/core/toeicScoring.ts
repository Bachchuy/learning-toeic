/**
 * TOEIC Estimated Reference Scoring Module (Thang điểm ước tính tham chiếu TOEIC)
 *
 * LƯU Ý PHÁP LÝ & CHUYÊN MÔN:
 * ETS (Educational Testing Service) KHÔNG công bố một bảng quy đổi số câu đúng sang điểm
 * cố định duy nhất cho mọi đề thi. Mỗi mã đề thi thật đều sử dụng kỹ thuật cân bằng thống kê
 * (Statistical Equating) và lý thuyết ứng đáp câu hỏi (Item Response Theory - IRT) để quy đổi
 * điểm dựa trên độ khó thực tế của từng đề thi.
 *
 * Bảng điểm dưới đây là thang quy đổi ước tính tham chiếu tiêu chuẩn (Estimated Reference Mapping),
 * phục vụ việc ước lượng phong độ luyện tập của người học, không phải bảng quy đổi chính thức
 * của một mã đề thi ETS cụ thể nào.
 *
 * Quy chuẩn điểm số:
 * - Listening: 0-100 câu đúng -> Ước tính 5-495 điểm (bội số của 5)
 * - Reading: 0-100 câu đúng -> Ước tính 5-495 điểm (bội số của 5)
 * - Total: 10-990 điểm (bội số của 5)
 */

// Bảng điểm ước tính tham chiếu cho Listening (Raw to Estimated Scaled Score)
const ESTIMATED_LISTENING_SCORE_MAP: Record<number, number> = {
  0: 5, 1: 5, 2: 5, 3: 5, 4: 5, 5: 5, 6: 10, 7: 15, 8: 20, 9: 25, 10: 30,
  11: 35, 12: 40, 13: 45, 14: 50, 15: 55, 16: 60, 17: 65, 18: 70, 19: 75, 20: 80,
  21: 85, 22: 90, 23: 95, 24: 100, 25: 110, 26: 115, 27: 120, 28: 125, 29: 130, 30: 135,
  31: 140, 32: 145, 33: 150, 34: 160, 35: 165, 36: 170, 37: 175, 38: 180, 39: 185, 40: 190,
  41: 195, 42: 200, 43: 210, 44: 215, 45: 220, 46: 230, 47: 235, 48: 240, 49: 245, 50: 250,
  51: 255, 52: 260, 53: 270, 54: 275, 55: 280, 56: 290, 57: 295, 58: 300, 59: 310, 60: 315,
  61: 320, 62: 325, 63: 330, 64: 340, 65: 345, 66: 350, 67: 360, 68: 365, 69: 370, 70: 380,
  71: 385, 72: 390, 73: 395, 74: 400, 75: 405, 76: 410, 77: 420, 78: 425, 79: 430, 80: 440,
  81: 445, 82: 450, 83: 460, 84: 465, 85: 470, 86: 475, 87: 480, 88: 485, 89: 490, 90: 495,
  91: 495, 92: 495, 93: 495, 94: 495, 95: 495, 96: 495, 97: 495, 98: 495, 99: 495, 100: 495
};

// Bảng điểm ước tính tham chiếu cho Reading (Raw to Estimated Scaled Score)
const ESTIMATED_READING_SCORE_MAP: Record<number, number> = {
  0: 5, 1: 5, 2: 5, 3: 5, 4: 5, 5: 5, 6: 10, 7: 15, 8: 20, 9: 25, 10: 30,
  11: 35, 12: 40, 13: 40, 14: 45, 15: 50, 16: 55, 17: 60, 18: 65, 19: 70, 20: 75,
  21: 80, 22: 85, 23: 90, 24: 95, 25: 100, 26: 105, 27: 110, 28: 115, 29: 120, 30: 125,
  31: 130, 32: 135, 33: 140, 34: 145, 35: 150, 36: 155, 37: 160, 38: 165, 39: 170, 40: 175,
  41: 180, 42: 185, 43: 190, 44: 195, 45: 200, 46: 205, 47: 210, 48: 215, 49: 220, 50: 225,
  51: 230, 52: 235, 53: 240, 54: 245, 55: 250, 56: 255, 57: 260, 58: 265, 59: 270, 60: 280,
  61: 285, 62: 290, 63: 295, 64: 300, 65: 305, 66: 310, 67: 320, 68: 325, 69: 330, 70: 335,
  71: 340, 72: 350, 73: 355, 74: 360, 75: 365, 76: 370, 77: 380, 78: 385, 79: 390, 80: 395,
  81: 400, 82: 405, 83: 410, 84: 415, 85: 420, 86: 430, 87: 435, 88: 445, 89: 450, 90: 455,
  91: 465, 92: 470, 93: 480, 94: 485, 95: 490, 96: 495, 97: 495, 98: 495, 99: 495, 100: 495
};

/**
 * Ước tính điểm Listening từ số câu đúng (Raw Score)
 * @param rawCount Số câu đúng (0 - 100)
 * @returns Điểm ước tính Listening (5 - 495)
 */
export function estimateListeningScore(rawCount: number): number {
  if (typeof rawCount !== "number" || isNaN(rawCount)) return 5;
  const count = Math.max(0, Math.min(100, Math.round(rawCount)));
  return ESTIMATED_LISTENING_SCORE_MAP[count] ?? 5;
}

/**
 * Ước tính điểm Reading từ số câu đúng (Raw Score)
 * @param rawCount Số câu đúng (0 - 100)
 * @returns Điểm ước tính Reading (5 - 495)
 */
export function estimateReadingScore(rawCount: number): number {
  if (typeof rawCount !== "number" || isNaN(rawCount)) return 5;
  const count = Math.max(0, Math.min(100, Math.round(rawCount)));
  return ESTIMATED_READING_SCORE_MAP[count] ?? 5;
}

/**
 * Ước tính tổng điểm TOEIC từ số câu đúng Listening và Reading
 * @param listeningRaw Số câu đúng Listening (0 - 100)
 * @param readingRaw Số câu đúng Reading (0 - 100)
 * @returns Kết quả điểm ước tính Listening, Reading và Tổng điểm
 */
export function estimateTotalScore(
  listeningRaw: number,
  readingRaw: number
): {
  listeningScore: number;
  readingScore: number;
  totalScore: number;
} {
  const listeningScore = estimateListeningScore(listeningRaw);
  const readingScore = estimateReadingScore(readingRaw);
  return {
    listeningScore,
    readingScore,
    totalScore: listeningScore + readingScore,
  };
}

// ==============================================================================
// CÁC HÀM TƯƠNG THÍCH NGƯỢC (BACKWARD COMPATIBILITY ALIASES)
// ==============================================================================
export const calculateListeningScore = estimateListeningScore;
export const calculateReadingScore = estimateReadingScore;
export const calculateTotalScore = estimateTotalScore;
