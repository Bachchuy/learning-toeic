/**
 * Module Thuật toán Độ vững Kỹ năng Thích ứng (Adaptive Rolling Mastery - ARM)
 * Quyết định Kiến trúc: D-25 (thay thế D-04 và cập nhật Invariant 3)
 * Tài liệu tham chiếu: docs/03-decisions/D-log.md & docs/04-business-rules.md §4.7
 * 
 * NGUYÊN TẮC HOẠT ĐỘNG 3 TẦNG LINH HOẠT:
 * 1. Tầng 1: Khởi động (n < 5) -> "Đang khởi động" (insufficient), màu xám trung tính, không phán xét
 * 2. Tầng 2: Fast-track thăng hạng sớm (n >= 8 và tỉ lệ đúng >= 90%) -> "Thành thạo" (mastered) ngay
 * 3. Tầng 3: Cửa sổ trượt chuẩn hóa (tối đa 20 lượt gần nhất, z = 1.0 chuẩn đo lường giáo dục 68% CI)
 *    - Score >= 75: "Thành thạo" (mastered) - màu xanh ngọc bích
 *    - 50 <= Score < 75: "Khá chắc" (proficient) - màu hổ phách
 *    - Score < 50: "Cần củng cố" (needs_review) - màu đỏ nhạt (chỉ khi phong độ thực sự yếu)
 */

export type MasteryLabel = "insufficient" | "needs_review" | "proficient" | "mastered";

export interface MasteryBadgeInfo {
  label: MasteryLabel;
  labelVi: string;
  shortText: string;
  badgeClass: string;
  barClass: string;
}

export const MASTERY_BADGE_MAP: Record<MasteryLabel, MasteryBadgeInfo> = {
  insufficient: {
    label: "insufficient",
    labelVi: "Đang khởi động",
    shortText: "Khởi động",
    badgeClass: "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]",
    barClass: "bg-[#CBD5E1]",
  },
  needs_review: {
    label: "needs_review",
    labelVi: "Cần củng cố",
    shortText: "Cần củng cố",
    badgeClass: "bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]",
    barClass: "bg-[#BE123C]",
  },
  proficient: {
    label: "proficient",
    labelVi: "Khá chắc",
    shortText: "Khá chắc",
    badgeClass: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
    barClass: "bg-[#F59E0B]",
  },
  mastered: {
    label: "mastered",
    labelVi: "Thành thạo",
    shortText: "Thành thạo",
    badgeClass: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",
    barClass: "bg-[#047857]",
  },
};

/**
 * Tính Cận dưới khoảng tin cậy Wilson (Wilson lower bound)
 * @param correct Số lần làm đúng
 * @param total Tổng số lượt làm
 * @param z Hệ số tin cậy chuẩn (mặc định 1.0 cho 68% chuẩn giáo dục)
 * @returns Điểm cận dưới từ 0 đến 1 (chưa nhân 100)
 */
export function calculateWilsonLower(
  correct: number,
  total: number,
  z: number = 1.0
): number {
  if (total <= 0 || correct < 0) return 0;
  if (correct > total) correct = total;

  const n = total;
  const p = correct / n;
  const z2 = z * z;

  const denominator = 1.0 + z2 / n;
  const center = p + z2 / (2.0 * n);
  const spread = z * Math.sqrt((p * (1.0 - p) + z2 / (4.0 * n)) / n);

  const lowerBound = (center - spread) / denominator;
  return Math.max(0, lowerBound);
}

/**
 * Tính phần trăm độ vững kỹ năng (Mastery Percentage) từ cận dưới Wilson
 * Áp dụng cửa sổ trượt tối đa maxWindow (mặc định 20 câu gần nhất)
 * @param correct Số lần làm đúng
 * @param total Tổng số lượt làm
 * @param z Hệ số tin cậy (mặc định 1.0)
 * @param maxWindow Kích thước tối đa của cửa sổ trượt (mặc định 20, 0 là không giới hạn)
 * @returns Phần trăm độ vững làm tròn 1 chữ số thập phân (ví dụ: 57.9, 64.9, 75.4)
 */
export function calculateMasteryPercentage(
  correct: number,
  total: number,
  z: number = 1.0,
  maxWindow: number = 20
): number {
  if (total <= 0) return 0;

  let effectiveTotal = total;
  let effectiveCorrect = correct;

  if (maxWindow > 0 && total > maxWindow) {
    effectiveTotal = maxWindow;
    effectiveCorrect = Math.round((correct / total) * maxWindow);
  }

  const lower = calculateWilsonLower(effectiveCorrect, effectiveTotal, z);
  return Math.round(lower * 1000) / 10;
}

/**
 * Xác định phân loại nhãn độ vững dựa trên số lượt làm, điểm Wilson và cơ chế Fast-Track
 * @param total Số lượt làm
 * @param masteryScore Điểm thành thạo (0 - 100)
 * @param accuracyRatio Tỉ lệ đúng thực tế (0 - 1, tùy chọn để kích hoạt Fast-Track)
 */
export function getMasteryLabel(
  total: number,
  masteryScore: number,
  accuracyRatio?: number
): MasteryLabel {
  if (total < 5) {
    return "insufficient";
  }

  // Tầng 2: Fast-Track cho học viên xuất sắc (D-25)
  if (total >= 8 && accuracyRatio !== undefined && accuracyRatio >= 0.9) {
    return "mastered";
  }

  if (masteryScore >= 75) {
    return "mastered";
  }
  if (masteryScore >= 50) {
    return "proficient";
  }
  return "needs_review";
}

/**
 * Lấy thông tin huy hiệu và màu thanh tiến độ cho chủ điểm ngữ pháp
 */
export function getMasteryBadgeInfo(
  total: number,
  masteryScore: number,
  accuracyRatio?: number
): MasteryBadgeInfo {
  const label = getMasteryLabel(total, masteryScore, accuracyRatio);
  return MASTERY_BADGE_MAP[label];
}

export interface AttemptRecord {
  is_correct: boolean;
  difficulty?: number;
}

export interface AdaptiveMasteryResult {
  score: number;
  label: MasteryLabel;
  badgeInfo: MasteryBadgeInfo;
  windowTotal: number;
  windowCorrect: number;
  accuracy: number;
  isFastTrack: boolean;
}

/**
 * Đánh giá độ thành thạo thích ứng trên mảng lịch sử làm bài (Adaptive Rolling Horizon)
 * @param attempts Danh sách các lần làm bài theo thứ tự thời gian
 * @param windowSize Kích thước cửa sổ trượt (mặc định 20 câu)
 */
export function calculateAdaptiveMastery(
  attempts: AttemptRecord[],
  windowSize: number = 20
): AdaptiveMasteryResult {
  if (!attempts || attempts.length === 0) {
    return {
      score: 0,
      label: "insufficient",
      badgeInfo: MASTERY_BADGE_MAP.insufficient,
      windowTotal: 0,
      windowCorrect: 0,
      accuracy: 0,
      isFastTrack: false,
    };
  }

  // Lấy tối đa windowSize câu gần nhất
  const windowAttempts = attempts.slice(-windowSize);
  const windowTotal = windowAttempts.length;
  const windowCorrect = windowAttempts.filter((a) => a.is_correct).length;
  const accuracy = Math.round((windowCorrect / windowTotal) * 100);
  const accuracyRatio = windowTotal > 0 ? windowCorrect / windowTotal : 0;

  const score = calculateMasteryPercentage(windowCorrect, windowTotal, 1.0, 0);
  const isFastTrack = windowTotal >= 8 && accuracyRatio >= 0.9;
  const label = getMasteryLabel(windowTotal, score, accuracyRatio);

  return {
    score,
    label,
    badgeInfo: MASTERY_BADGE_MAP[label],
    windowTotal,
    windowCorrect,
    accuracy,
    isFastTrack,
  };
}
