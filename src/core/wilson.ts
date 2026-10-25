/**
 * Module Thuật toán Độ vững Kỹ năng Wilson (Wilson Score Interval Lower Bound)
 * Tuân thủ nghiêm ngặt Master Blueprint: z = 1.96 (mức tin cậy 95%)
 * docs/04-business-rules.md §4.7 & docs/A-test-data.md §A.1
 * 
 * BẤT BIẾN:
 * - n < 5: Nhãn "Chưa đủ dữ liệu (X/5 câu)"
 * - n >= 5:
 *   - score < 50: "Cần ôn" (needs_review)
 *   - 50 <= score < 75: "Khá" (proficient)
 *   - score >= 75: "Vững" (mastered)
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
    labelVi: "Chưa đủ dữ liệu",
    shortText: "Chưa đủ DL",
    badgeClass: "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]",
    barClass: "bg-[#CBD5E1]",
  },
  needs_review: {
    label: "needs_review",
    labelVi: "Cần ôn",
    shortText: "Cần ôn",
    badgeClass: "bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]",
    barClass: "bg-[#BE123C]",
  },
  proficient: {
    label: "proficient",
    labelVi: "Khá",
    shortText: "Khá",
    badgeClass: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
    barClass: "bg-[#F59E0B]",
  },
  mastered: {
    label: "mastered",
    labelVi: "Vững",
    shortText: "Vững",
    badgeClass: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",
    barClass: "bg-[#047857]",
  },
};

/**
 * Tính Cận dưới khoảng tin cậy Wilson (Wilson lower bound)
 * @param correct Số lần làm đúng
 * @param total Tổng số lượt làm
 * @param z Hệ số tin cậy chuẩn (mặc định 1.96 cho 95%)
 * @returns Điểm cận dưới từ 0 đến 1 (chưa nhân 100)
 */
export function calculateWilsonLower(
  correct: number,
  total: number,
  z: number = 1.96
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
 * Làm tròn 1 chữ số thập phân, khớp chuẩn Phụ lục A
 * @param correct Số lần làm đúng
 * @param total Tổng số lượt làm
 * @returns Phần trăm độ vững (ví dụ: 49.0, 56.5, 60.1)
 */
export function calculateMasteryPercentage(
  correct: number,
  total: number
): number {
  if (total <= 0) return 0;
  const lower = calculateWilsonLower(correct, total);
  return Math.round(lower * 1000) / 10;
}

/**
 * Xác định phân loại nhãn độ vững dựa trên số lượt làm và điểm Wilson
 */
export function getMasteryLabel(total: number, masteryScore: number): MasteryLabel {
  if (total < 5) {
    return "insufficient";
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
  masteryScore: number
): MasteryBadgeInfo {
  const label = getMasteryLabel(total, masteryScore);
  return MASTERY_BADGE_MAP[label];
}
