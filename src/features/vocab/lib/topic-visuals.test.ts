import { describe, it, expect } from "vitest";
import { getPageNumbers, getTopicVisuals } from "./topic-visuals";

describe("topic-visuals helpers", () => {
  it("ánh xạ 1-1 chính xác các chủ điểm đã biết (kể cả khoảng trắng/viết hoa)", () => {
    const ai = getTopicVisuals("AI & Machine Learning");
    expect(ai.titleVi).toBe("Trí tuệ nhân tạo & ML");

    const contracts = getTopicVisuals("  Contracts  ");
    expect(contracts.titleVi).toBe("Hợp đồng thương mại");

    const doctor = getTopicVisuals("Doctor’s Office");
    expect(doctor.titleVi).toBe("Phòng khám & Bác sĩ");
  });

  it("giữ nguyên tên gốc làm fallback an toàn khi chủ điểm chưa có trong từ điển", () => {
    const unknown = getTopicVisuals("  Quantum Supply Chains  ");
    expect(unknown.titleVi).toBe("Quantum Supply Chains");
    expect(unknown.badgeColor).toContain("bg-slate-100");
  });

  it("tạo phân trang đúng ở mọi trường hợp (ngắn, đầu, giữa, cuối)", () => {
    expect(getPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageNumbers(2, 10)).toEqual([1, 2, 3, 4, 5, "...", 10]);
    expect(getPageNumbers(5, 10)).toEqual([1, "...", 4, 5, 6, "...", 10]);
    expect(getPageNumbers(9, 10)).toEqual([1, "...", 6, 7, 8, 9, 10]);
  });

  it("tính đúng tiến độ 3 trạng thái FSRS và bộ đếm THẺ 0 / 0 khi chưa có thẻ", () => {
    const computeBookCompletion = (params: {
      isImported: boolean;
      reviewedCount: number;
      wordsCount: number;
      deckDue: number;
    }) => {
      if (!params.isImported || params.reviewedCount === 0) return 0;
      if (params.deckDue === 0) return 100;
      return params.wordsCount > 0
        ? Math.min(
            100,
            Math.max(8, Math.round(((params.wordsCount - params.deckDue) / params.wordsCount) * 100))
          )
        : 0;
    };

    // 1. Sổ chưa nạp: phải là 0% (không được báo 100% Đã ôn xong ảo)
    expect(
      computeBookCompletion({
        isImported: false,
        reviewedCount: 0,
        wordsCount: 1725,
        deckDue: 0,
      })
    ).toBe(0);

    // 2. Sổ mới nạp nhưng chưa ôn lượt nào (reps === 0): phải là 0%
    expect(
      computeBookCompletion({
        isImported: true,
        reviewedCount: 0,
        wordsCount: 615,
        deckDue: 615,
      })
    ).toBe(0);

    // 3. Sổ đã nạp, đã ôn > 0 thẻ và hết thẻ đến hạn hôm nay: 100%
    expect(
      computeBookCompletion({
        isImported: true,
        reviewedCount: 15,
        wordsCount: 115,
        deckDue: 0,
      })
    ).toBe(100);

    // 4. Bộ đếm ReviewHeader khi totalCards === 0 phải hiển thị THẺ 0 / 0 thay vì THẺ 1 / 0
    const formatHeaderCardCounter = (currentIndex: number, totalCards: number) =>
      `THẺ ${totalCards > 0 ? Math.min(currentIndex + 1, totalCards) : 0} / ${totalCards}`;

    expect(formatHeaderCardCounter(0, 0)).toBe("THẺ 0 / 0");
    expect(formatHeaderCardCounter(0, 15)).toBe("THẺ 1 / 15");
  });
});
