import { describe, it, expect } from "vitest";
import {
  normalizeWord,
  selectBestUsAudioUrl,
  parseFreeDictResponse,
  CURATED_TOEIC_TERMS,
} from "./dictionary";

describe("Smart Dictionary Core Service", () => {
  describe("1. Chuẩn hóa từ khóa (normalizeWord)", () => {
    it("chuyển về chữ thường và cắt tỉa khoảng trắng", () => {
      expect(normalizeWord("  Implement  ")).toBe("implement");
      expect(normalizeWord("COMMENCE")).toBe("commence");
    });

    it("loại bỏ các dấu câu ở đầu và cuối từ", () => {
      expect(normalizeWord('"eligible"')).toBe("eligible");
      expect(normalizeWord("accommodate,")).toBe("accommodate");
      expect(normalizeWord("warranty.")).toBe("warranty");
      expect(normalizeWord("(negotiate)")).toBe("negotiate");
    });

    it("xử lý an toàn chuỗi rỗng", () => {
      expect(normalizeWord("")).toBe("");
      expect(normalizeWord("   ")).toBe("");
    });
  });

  describe("2. Bóc tách Audio chuẩn giọng Mỹ US (selectBestUsAudioUrl)", () => {
    it("ưu tiên link có chứa -us.mp3", () => {
      const phonetics = [
        { text: "/ˈɪmplɪment/", audio: "https://api.dictionaryapi.dev/media/uk.mp3" },
        { text: "/ˈɪmplɪment/", audio: "https://api.dictionaryapi.dev/media/implement-us.mp3" },
        { text: "/ˈɪmplɪment/", audio: "https://api.dictionaryapi.dev/media/au.mp3" },
      ];
      expect(selectBestUsAudioUrl(phonetics)).toBe("https://api.dictionaryapi.dev/media/implement-us.mp3");
    });

    it("dự phòng file mp3 bất kỳ nếu không có -us.mp3", () => {
      const phonetics = [
        { text: "/ˈɪmplɪment/", audio: "" },
        { text: "/ˈɪmplɪment/", audio: "https://api.dictionaryapi.dev/media/general.mp3" },
      ];
      expect(selectBestUsAudioUrl(phonetics)).toBe("https://api.dictionaryapi.dev/media/general.mp3");
    });

    it("trả về rỗng nếu không có audio hợp lệ", () => {
      expect(selectBestUsAudioUrl([])).toBe("");
      expect(selectBestUsAudioUrl([{ text: "/abc/" }])).toBe("");
    });
  });

  describe("3. Phân tích kết quả API (parseFreeDictResponse)", () => {
    it("bóc tách đầy đủ thông tin và đối chiếu kho từ vựng công sở TOEIC có sẵn", () => {
      const mockApiItem = {
        word: "implement",
        phonetic: "/ˈɪmplɪmənt/",
        phonetics: [
          { audio: "https://api.dictionaryapi.dev/media/pronunciations/en/implement-us.mp3" },
        ],
        meanings: [
          {
            partOfSpeech: "verb",
            definitions: [
              {
                definition: "To put into effect according to or by means of a definite plan or procedure.",
                example: "The company will implement new policies next month.",
              },
            ],
          },
        ],
      };

      const result = parseFreeDictResponse(mockApiItem);

      expect(result.word).toBe("implement");
      expect(result.phonetic).toBe("/ˈɪmplɪmənt/");
      expect(result.audio_url).toBe("https://api.dictionaryapi.dev/media/pronunciations/en/implement-us.mp3");
      expect(result.meaning_vi).toContain("Thi hành");
      expect(result.word_family?.length).toBeGreaterThan(0);
      expect(result.collocations?.length).toBeGreaterThan(0);
      expect(result.examples?.[0].en).toBe("The company will implement new policies next month.");
    });
  });

  describe("4. Kho từ vựng TOEIC tuyển chọn (CURATED_TOEIC_TERMS)", () => {
    it("đảm bảo các từ vựng bẫy hay gặp đều có đầy đủ họ từ (Word Family)", () => {
      const terms = ["implement", "eligible", "negotiate", "accommodate"];
      for (const term of terms) {
        const item = CURATED_TOEIC_TERMS[term];
        expect(item).toBeDefined();
        expect(item.word_family.length).toBeGreaterThanOrEqual(2);
        expect(item.collocations.length).toBeGreaterThanOrEqual(2);
      }
    });
  });
});
