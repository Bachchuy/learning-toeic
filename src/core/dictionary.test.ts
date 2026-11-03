import { describe, it, expect } from "vitest";
import {
  normalizeWord,
  selectBestUsAudioUrl,
  selectBestAudioForPos,
  validateSafeAudioUrl,
  parseFreeDictResponse,
  parseFreeDictEntries,
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

    it("từ chối các URL không an toàn hoặc không phải HTTPS", () => {
      const insecure = [
        { audio: "http://insecure-cdn.com/audio.mp3" },
        { audio: "javascript:alert(1)" },
        { audio: "data:audio/mp3;base64,AAAA" },
      ];
      expect(selectBestUsAudioUrl(insecure)).toBe("");
    });
  });

  describe("2b. Phân định Audio bản xứ theo Từ loại (selectBestAudioForPos)", () => {
    const mockMultiEntries = [
      {
        word: "contract",
        phonetics: [
          { audio: "https://api.dictionaryapi.dev/media/pronunciations/en/contract-1-uk.mp3" },
          { audio: "https://api.dictionaryapi.dev/media/pronunciations/en/contract-1-us.mp3" },
        ],
        meanings: [{ partOfSpeech: "noun", definitions: [{ definition: "A binding agreement." }] }],
      },
      {
        word: "contract",
        phonetics: [
          { audio: "https://api.dictionaryapi.dev/media/pronunciations/en/contract-2-uk.mp3" },
          { audio: "https://api.dictionaryapi.dev/media/pronunciations/en/contract-2-us.mp3" },
        ],
        meanings: [{ partOfSpeech: "verb", definitions: [{ definition: "To enter into agreement; decrease in size." }] }],
      },
    ];

    it("chọn đúng file audio US của Danh từ khi posHint = 'noun'", () => {
      expect(selectBestAudioForPos(mockMultiEntries, "noun")).toBe(
        "https://api.dictionaryapi.dev/media/pronunciations/en/contract-1-us.mp3"
      );
    });

    it("chọn đúng file audio US của Động từ khi posHint = 'verb'", () => {
      expect(selectBestAudioForPos(mockMultiEntries, "verb")).toBe(
        "https://api.dictionaryapi.dev/media/pronunciations/en/contract-2-us.mp3"
      );
    });

    it("chọn file audio US bất kỳ nếu không truyền posHint", () => {
      expect(selectBestAudioForPos(mockMultiEntries)).toBe(
        "https://api.dictionaryapi.dev/media/pronunciations/en/contract-1-us.mp3"
      );
    });
  });

  describe("2c. Kiểm định URL âm thanh an toàn (validateSafeAudioUrl)", () => {
    it("chấp nhận URL HTTPS từ domain uy tín hoặc file mp3 hợp lệ", () => {
      expect(
        validateSafeAudioUrl(
          "https://api.dictionaryapi.dev/media/pronunciations/en/word-us.mp3"
        )
      ).toBe("https://api.dictionaryapi.dev/media/pronunciations/en/word-us.mp3");

      expect(
        validateSafeAudioUrl("https://ssl.gstatic.com/dictionary/static/sounds/20200429/word--_us_1.mp3")
      ).toBe("https://ssl.gstatic.com/dictionary/static/sounds/20200429/word--_us_1.mp3");
    });

    it("chặn các URL độc hại, giao thức lạ hoặc không phải HTTPS", () => {
      expect(validateSafeAudioUrl("http://example.com/audio.mp3")).toBe("");
      expect(validateSafeAudioUrl("javascript:exploit()")).toBe("");
      expect(validateSafeAudioUrl("ftp://files.com/audio.mp3")).toBe("");
      expect(validateSafeAudioUrl("data:text/html,<script>alert(1)</script>")).toBe("");
      expect(validateSafeAudioUrl(null)).toBe("");
      expect(validateSafeAudioUrl("")).toBe("");
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

    it("gom đầy đủ các từ loại và định nghĩa khi API trả về nhiều entries (parseFreeDictEntries)", () => {
      const mockMulti = [
        {
          word: "contract",
          phonetic: "/ˈkɒntɹækt/",
          phonetics: [{ audio: "https://api.dictionaryapi.dev/media/pronunciations/en/contract-1-us.mp3" }],
          meanings: [
            {
              partOfSpeech: "noun",
              definitions: [{ definition: "An agreement between two or more parties." }],
            },
          ],
        },
        {
          word: "contract",
          phonetic: "/kənˈtɹækt/",
          phonetics: [{ audio: "https://api.dictionaryapi.dev/media/pronunciations/en/contract-2-us.mp3" }],
          meanings: [
            {
              partOfSpeech: "verb",
              definitions: [{ definition: "To enter into an agreement with someone." }],
            },
          ],
        },
      ];

      const result = parseFreeDictEntries(mockMulti);
      expect(result.word).toBe("contract");
      expect(result.part_of_speech).toBe("noun_verb");
      expect(result.definition_en).toBe("An agreement between two or more parties.");
      expect(result.audio_url).toBe("https://api.dictionaryapi.dev/media/pronunciations/en/contract-1-us.mp3");
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

    it("đảm bảo các cụm từ (Phrases) có đầy đủ phiên âm nhiều từ và ví dụ thực tế", () => {
      const phrases = ["nice to meet you", "look forward to", "in charge of", "take advantage of"];
      for (const p of phrases) {
        const item = CURATED_TOEIC_TERMS[p];
        expect(item).toBeDefined();
        expect(item.part_of_speech).toBe("phrase");
        expect(item.phonetic).toBeDefined();
        expect(item.examples && item.examples.length > 0).toBe(true);
      }
    });

    it("đảm bảo các từ loại kép (Danh từ & Động từ) có phân định nghĩa kép rõ ràng", () => {
      const duals = ["record", "present", "contract", "conduct"];
      for (const d of duals) {
        const item = CURATED_TOEIC_TERMS[d];
        expect(item).toBeDefined();
        expect(item.part_of_speech).toBe("noun_verb");
        expect(item.meaning_vi).toContain("[n]");
        expect(item.meaning_vi).toContain("[v]");
      }
    });
  });
});
