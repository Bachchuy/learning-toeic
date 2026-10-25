import { describe, it, expect } from "vitest";
import {
  normalizeLemma,
  completeStemWithAnswer,
  inferPartOfSpeech,
  getPosCategory,
  getPosBadgeInfo,
  generateNaturalExplanation,
} from "./vocab";
import { resolvePhonetic } from "./vocabDictionary";

describe("normalizeLemma", () => {
  it("chuẩn hóa từ vựng về chữ thường và xóa khoảng trắng", () => {
    expect(normalizeLemma("  Confidential  ")).toBe("confidential");
    expect(normalizeLemma("SHREDDED")).toBe("shredded");
    expect(normalizeLemma("Acquisitions")).toBe("acquisitions");
  });

  it("loại bỏ các dấu câu bám dính ở đầu hoặc đuôi từ", () => {
    expect(normalizeLemma('"brief"')).toBe("brief");
    expect(normalizeLemma("summary,")).toBe("summary");
    expect(normalizeLemma("meeting.")).toBe("meeting");
    expect(normalizeLemma("  'director'  ")).toBe("director");
  });

  it("chuẩn hóa cụm từ có nhiều khoảng trắng ở giữa", () => {
    expect(normalizeLemma("board    meeting")).toBe("board meeting");
    expect(normalizeLemma("  financial   results  ")).toBe("financial results");
  });

  it("trả về chuỗi rỗng khi đầu vào rỗng", () => {
    expect(normalizeLemma("")).toBe("");
    expect(normalizeLemma("   ")).toBe("");
  });
});

describe("completeStemWithAnswer", () => {
  it("thay thế chỗ trống ____ bằng đáp án đúng tạo thành câu hoàn chỉnh", () => {
    const stem = "The newly installed conveyor system operates much more ____ than the previous model.";
    const answer = "efficiently";
    const result = completeStemWithAnswer(stem, answer);

    expect(result).toBe(
      "The newly installed conveyor system operates much more efficiently than the previous model."
    );
    expect(result).not.toContain("____");
  });

  it("xử lý dấu gạch ngắn ___", () => {
    const stem = "All confidential files must be ___ before being discarded.";
    const answer = "shredded";
    const result = completeStemWithAnswer(stem, answer);

    expect(result).toBe(
      "All confidential files must be shredded before being discarded."
    );
  });
});

describe("inferPartOfSpeech & getPosCategory", () => {
  it("nhận diện cụm từ", () => {
    expect(inferPartOfSpeech("conveyor system")).toBe("Cụm từ (Phrase)");
    expect(getPosCategory(undefined, "", "board meeting")).toBe("phrase");
  });

  it("nhận diện trạng từ với đuôi ly", () => {
    expect(inferPartOfSpeech("efficiently")).toBe("Trạng từ (Adv)");
    expect(getPosCategory(undefined, "", "briefly")).toBe("adverb");
  });

  it("nhận diện danh từ theo đuôi", () => {
    expect(inferPartOfSpeech("presentation")).toBe("Danh từ (Noun)");
    expect(getPosCategory(undefined, "", "management")).toBe("noun");
  });

  it("nhận diện động từ", () => {
    expect(inferPartOfSpeech("operate")).toBe("Động từ (Verb)");
    expect(getPosCategory(undefined, "", "shredded")).toBe("verb");
  });

  it("trả về huy hiệu phân loại Danh - Động - Tính - Trạng chuẩn mực", () => {
    const nounBadge = getPosBadgeInfo("noun");
    expect(nounBadge.shortBadge).toBe("DANH TỪ");
    expect(nounBadge.category).toBe("noun");

    const verbBadge = getPosBadgeInfo("verb");
    expect(verbBadge.shortBadge).toBe("ĐỘNG TỪ");

    const adjBadge = getPosBadgeInfo("adjective");
    expect(adjBadge.shortBadge).toBe("TÍNH TỪ");

    const advBadge = getPosBadgeInfo("adverb");
    expect(advBadge.shortBadge).toBe("TRẠNG TỪ");
  });

  it("nhận diện từ loại kép cho các từ vừa là Danh từ vừa là Động từ (như export, increase, access)", () => {
    // Từ export không bị quy về "TỪ VỰNG" chung chung
    const exportCat = getPosCategory(undefined, "hàng xuất khẩu / xuất khẩu", "export");
    expect(exportCat).toBe("noun_verb");

    const exportBadge = getPosBadgeInfo(undefined, "hàng xuất khẩu / xuất khẩu", "export");
    expect(exportBadge.shortBadge).toBe("DANH TỪ · ĐỘNG TỪ");
    expect(exportBadge.labelFull).toBe("Danh từ (Noun) · Động từ (Verb)");

    // Khi posString chỉ định cả 2 từ loại
    const dualCat = getPosCategory("Danh từ (Noun) · Động từ (Verb)", "", "schedule");
    expect(dualCat).toBe("noun_verb");
  });

  it("nhận diện từ loại kép cho tính từ và trạng từ (như overseas)", () => {
    const overseasCat = getPosCategory(undefined, "ở nước ngoài, hải ngoại", "overseas");
    expect(overseasCat).toBe("adj_adv");

    const overseasBadge = getPosBadgeInfo(undefined, "ở nước ngoài, hải ngoại", "overseas");
    expect(overseasBadge.shortBadge).toBe("TÍNH TỪ · TRẠNG TỪ");
  });
});

describe("resolvePhonetic cho cụm từ và từ vựng", () => {
  it("sinh đầy đủ IPA chuẩn xác cho cụm từ (Phrases) từ các từ thành phần", () => {
    // Cụm từ 2 từ
    const keynoteSpeakerIpa = resolvePhonetic("keynote speaker");
    expect(keynoteSpeakerIpa).toBe("/ˈkiːnoʊt ˈspiːkər/");

    const exchangeRateIpa = resolvePhonetic("exchange rate");
    expect(exchangeRateIpa).toBe("/ɪksˈtʃeɪndʒ reɪt/");

    // Cụm từ 3 từ
    const favorableExchangeRatesIpa = resolvePhonetic("favorable exchange rates");
    expect(favorableExchangeRatesIpa).toBe("/ˈfeɪvərəbl ɪksˈtʃeɪndʒ reɪts/");

    // Cụm động từ
    const takeAdvantageOfIpa = resolvePhonetic("take advantage of");
    expect(takeAdvantageOfIpa).toBe("/teɪk ədˈvæntɪdʒ əv/");
  });

  it("trả về IPA chính xác cho từ đơn và từ có nhiều từ loại", () => {
    const exportIpa = resolvePhonetic("export");
    expect(exportIpa).toContain("ˈekspɔːrt");

    const boostIpa = resolvePhonetic("boost");
    expect(boostIpa).toBe("/buːst/");
  });
});

describe("generateNaturalExplanation", () => {
  it("sinh giải thích tự nhiên, ngắn gọn và đúng ngữ cảnh chuyên ngành", () => {
    const nounExp = generateNaturalExplanation("export", "hàng xuất khẩu", "noun");
    expect(nounExp).toContain("Danh từ mang nghĩa");
    expect(nounExp).not.toContain("thường xuyên xuất hiện trong các bài thi TOEIC");

    const verbExp = generateNaturalExplanation("boost", "thúc đẩy", "verb");
    expect(verbExp).toContain("Động từ diễn tả hành động");

    const adjExp = generateNaturalExplanation("favorable", "thuận lợi", "adjective");
    expect(adjExp).toContain("Tính từ mô tả đặc tính");

    const advExp = generateNaturalExplanation("efficiently", "hiệu quả", "adverb");
    expect(advExp).toContain("Trạng từ chỉ mức độ");

    const dualExp = generateNaturalExplanation("export", "xuất khẩu", "noun_verb");
    expect(dualExp).toContain("Từ đa năng (Danh từ & Động từ)");
  });
});
