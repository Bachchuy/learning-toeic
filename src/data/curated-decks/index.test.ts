import { describe, it, expect } from "vitest";
import { CURATED_DECKS, getCuratedDeckSummaries } from "./index";

describe("Curated Decks Metadata Summary", () => {
  it("getCuratedDeckSummaries trả về đủ 4 bộ thẻ gọn nhẹ không kèm mảng items", () => {
    const summaries = getCuratedDeckSummaries();
    expect(summaries).toHaveLength(CURATED_DECKS.length);

    for (let i = 0; i < CURATED_DECKS.length; i++) {
      const fullDeck = CURATED_DECKS[i];
      const summary = summaries[i];

      expect(summary.id).toBe(fullDeck.id);
      expect(summary.title).toBe(fullDeck.title);
      expect(summary.totalCards).toBe(fullDeck.totalCards);
      expect(summary).not.toHaveProperty("items");

      const expectedTopicCount = new Set(
        fullDeck.items.map((item) => item.topic?.trim()).filter(Boolean)
      ).size;
      expect(summary.topics).toHaveLength(expectedTopicCount);

      const summedTopicCards = Object.values(summary.topicCounts).reduce(
        (acc, count) => acc + count,
        0
      );
      const fullTopicCards = fullDeck.items.filter((item) => item.topic?.trim()).length;
      expect(summedTopicCards).toBe(fullTopicCards);
    }
  });
});
