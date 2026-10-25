import { describe, it, expect } from "vitest";
import {
  dbCardToFSRSCard,
  formatFSRSInterval,
  previewFSRSRatings,
  calculateFSRSReview,
  type DBCardRow,
} from "./fsrs";

describe("FSRS Core Engine (§4.6b, D-22, D-23, D-24)", () => {
  const mockNow = new Date("2026-10-26T08:00:00Z");

  const newCard: DBCardRow = {
    id: "card-123",
    user_id: "user-456",
    vocab_entry_id: "vocab-789",
    state: 0, // New
    stability: 0,
    difficulty: 0,
    due: mockNow.toISOString(),
    reps: 0,
    lapses: 0,
  };

  it("converts DB card row to valid FSRS Card structure", () => {
    const fsrsCard = dbCardToFSRSCard(newCard);
    expect(fsrsCard.state).toBe(0);
    expect(fsrsCard.stability).toBe(0);
    expect(fsrsCard.difficulty).toBe(0);
    expect(fsrsCard.reps).toBe(0);
    expect(fsrsCard.lapses).toBe(0);
    expect(fsrsCard.due.toISOString()).toBe(mockNow.toISOString());
  });

  it("formats FSRS intervals properly in Vietnamese", () => {
    const after10Mins = new Date(mockNow.getTime() + 10 * 60 * 1000);
    expect(formatFSRSInterval(mockNow, after10Mins)).toBe("10 phút");

    const after3Hours = new Date(mockNow.getTime() + 3 * 60 * 60 * 1000);
    expect(formatFSRSInterval(mockNow, after3Hours)).toBe("3 giờ");

    const after2Days = new Date(mockNow.getTime() + 2 * 24 * 60 * 60 * 1000);
    expect(formatFSRSInterval(mockNow, after2Days)).toBe("2 ngày");

    const after45Days = new Date(mockNow.getTime() + 45 * 24 * 60 * 60 * 1000);
    expect(formatFSRSInterval(mockNow, after45Days)).toBe("2 tháng");
  });

  it("generates previews for 4 ratings (Again, Hard, Good, Easy)", () => {
    const previews = previewFSRSRatings(newCard, mockNow);
    expect(previews).toHaveLength(4);

    expect(previews[0].rating).toBe(1);
    expect(previews[0].ratingLabel).toBe("Lại");
    expect(previews[0].intervalText).toBeDefined();

    expect(previews[1].rating).toBe(2);
    expect(previews[1].ratingLabel).toBe("Khó");

    expect(previews[2].rating).toBe(3);
    expect(previews[2].ratingLabel).toBe("Tốt");

    expect(previews[3].rating).toBe(4);
    expect(previews[3].ratingLabel).toBe("Dễ");

    // Interval của Easy phải lớn hơn hoặc bằng Good
    expect(previews[3].due.getTime()).toBeGreaterThanOrEqual(
      previews[2].due.getTime()
    );
  });

  it("calculates review and creates audit log payload for card_reviews", () => {
    // Chấm thẻ "Good" (Rating 3)
    const result = calculateFSRSReview(newCard, 3, mockNow);

    // Thẻ được cập nhật: reps tăng lên 1, stability > 0, due chuyển sang tương lai
    expect(result.updatedCard.reps).toBe(1);
    expect(result.updatedCard.stability).toBeGreaterThan(0);
    expect(new Date(result.updatedCard.due).getTime()).toBeGreaterThan(
      mockNow.getTime()
    );
    expect(result.updatedCard.last_review).toBe(mockNow.toISOString());

    // Bản ghi lịch sử card_reviews
    expect(result.reviewLog.card_id).toBe("card-123");
    expect(result.reviewLog.user_id).toBe("user-456");
    expect(result.reviewLog.rating).toBe(3);
    expect(result.reviewLog.state_before).toBe(0);
    expect(result.reviewLog.reviewed_at).toBe(mockNow.toISOString());
  });

  it("increments lapses when rated Again (Rating 1) during review state", () => {
    const reviewingCard: DBCardRow = {
      ...newCard,
      state: 2, // Review state
      stability: 5.5,
      difficulty: 4.2,
      reps: 3,
      lapses: 0,
    };

    const result = calculateFSRSReview(reviewingCard, 1, mockNow);
    expect(result.updatedCard.lapses).toBe(1);
    expect(result.reviewLog.rating).toBe(1);
    expect(result.reviewLog.state_before).toBe(2);
  });
});
