/**
 * Core utility functions for TOEIC Exam Timer (75-minute Reading Simulator)
 * Pure, deterministic, zero-dependency.
 */

export const ETS_READING_DURATION_MINUTES = 75;
export const ETS_READING_TOTAL_SECONDS = ETS_READING_DURATION_MINUTES * 60; // 4500 seconds

/**
 * Format số giây thành chuỗi hiển thị MM:SS
 */
export function formatExamTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Xác định Tailwind color class theo ngưỡng thời gian còn lại:
 * - < 300s (5 phút): Đỏ nguy hiểm + hiệu ứng nhấp nháy animate-pulse
 * - < 600s (10 phút): Vàng cam cảnh báo
 * - Mặc định: Xám tối bình thường
 */
export function getExamTimerColorClass(secondsRemaining: number): string {
  if (secondsRemaining < 300) {
    return "text-[#BE123C] bg-[#FFF1F2] border-[#FECDD3] animate-pulse";
  }
  if (secondsRemaining < 600) {
    return "text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]";
  }
  return "text-[#0F172A] bg-[#F8FAFC] border-[#E2E8F0]";
}

/**
 * Tính số giây đã thi từ thời gian còn lại
 */
export function calculateTimeSpentSeconds(
  totalDurationMinutes: number,
  secondsRemaining: number
): number {
  const totalSeconds = totalDurationMinutes * 60;
  return Math.max(0, totalSeconds - Math.max(0, secondsRemaining));
}
