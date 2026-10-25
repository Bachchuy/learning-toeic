/**
 * Tính tỷ lệ chính xác (Accuracy percentage)
 * Thuộc phạm vi core domain: Pure logic, không phụ thuộc UI hay DB
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total <= 0) return 0;
  if (correct < 0) return 0;
  if (correct >= total) return 100;
  return Math.round((correct / total) * 100);
}
