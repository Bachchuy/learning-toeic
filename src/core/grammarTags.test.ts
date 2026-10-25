import { describe, it, expect } from "vitest";
import { formatGrammarTagName, CANONICAL_GRAMMAR_TAGS } from "./grammarTags";

describe("CANONICAL_GRAMMAR_TAGS & formatGrammarTagName", () => {
  it("chuẩn hóa 'tenses' thành 'Thì động từ (Tenses)', loại bỏ hoàn toàn 'Thì thời'", () => {
    const formatted = formatGrammarTagName("tenses", "Thì thời (Tenses)");
    expect(formatted).toBe("Thì động từ (Tenses)");
    expect(formatted).not.toContain("Thì thời");
  });

  it("chuẩn hóa 'word_form' thành 'Từ loại (Word Form)', thay cho 'Cấu tạo từ'", () => {
    const formatted = formatGrammarTagName("word_form", "Cấu tạo từ (Word Form)");
    expect(formatted).toBe("Từ loại (Word Form)");
    expect(formatted).not.toContain("Cấu tạo từ");
  });

  it("chuẩn hóa 'collocations' thành 'Cụm từ cố định (Collocations)', loại bỏ 'Thành ngữ'", () => {
    const formatted = formatGrammarTagName("collocations", "Cụm từ cố định & Thành ngữ");
    expect(formatted).toBe("Cụm từ cố định (Collocations)");
    expect(formatted).not.toContain("Thành ngữ");
  });

  it("đảm bảo đủ 16 chủ điểm ngữ pháp cốt lõi TOEIC Part 5", () => {
    const keys = Object.keys(CANONICAL_GRAMMAR_TAGS);
    expect(keys.length).toBe(16);
  });
});
