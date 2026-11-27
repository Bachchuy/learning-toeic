import { describe, it, expect } from "vitest";
import {
  buildExamRefinementPrompt,
  buildPart5RefinementPrompt,
  buildPart6RefinementPrompt,
  buildPart7RefinementPrompt,
  formatExamExplanationSummary,
  getExamGeminiResponseSchema,
  isExamAnswerNeedsRefinement,
  isGenericExplanationText,
  isPart5ExplanationNeedsRefinement,
  isReadingExplanationNeedsRefinement,
  parseExamExplanation,
} from "./explanationQuality";

describe("explanationQuality core engine", () => {
  describe("isGenericExplanationText", () => {
    it("phát hiện đúng các câu boilerplate và câu quá chung chung", () => {
      expect(isGenericExplanationText(null)).toBe(true);
      expect(isGenericExplanationText("")).toBe(true);
      expect(isGenericExplanationText("Phương án sai theo ngữ cảnh.")).toBe(true);
      expect(
        isGenericExplanationText(
          "'quick' sai từ loại, không đứng vào vị trí ngữ pháp này trong câu."
        )
      ).toBe(true);
      expect(isGenericExplanationText("Sai vì không phù hợp với ngữ cảnh.")).toBe(true);
      expect(isGenericExplanationText("Không hợp nghĩa trong câu.")).toBe(true);
      expect(isGenericExplanationText("Dịch nghĩa câu hỏi theo ngữ cảnh công sở.")).toBe(true);
    });

    it("chấp nhận lời giải cụ thể có phân tích ngữ pháp/từ vựng rõ ràng", () => {
      expect(
        isGenericExplanationText(
          "brief (adj): ngắn gọn (Đúng: đứng sau mạo từ 'a' và bổ nghĩa cho danh từ 'summary')."
        )
      ).toBe(false);
    });
  });

  describe("isPart5ExplanationNeedsRefinement", () => {
    const completePart5 = {
      rule_vi: "Cấu trúc cụm danh từ: Mạo từ (a/an/the) + Tính từ + Danh từ.",
      why_correct_vi:
        "Sau mạo từ 'a' và trước danh từ 'summary' cần tính từ 'brief' để bổ nghĩa.",
      full_translation_vi: "Ông Tanaka đã trình bày bản tóm tắt ngắn gọn tại cuộc họp.",
      tip_vi: "Nhìn trước và sau chỗ trống [a + ___ + summary] để chọn ngay tính từ.",
      example_en: "She gave a brief summary of the plan.",
      options_analysis: {
        A: "brief (adj): ngắn gọn — Đúng vì bổ nghĩa cho danh từ 'summary'.",
        B: "briefly (adv): một cách ngắn gọn — Sai vì trạng từ không bổ nghĩa trực tiếp cho danh từ.",
        C: "briefed (v-ed): đã chỉ dẫn — Sai về thì và từ loại trong cụm danh từ.",
        D: "briefing (n): cuộc họp ngắn — Sai vì ghép 'briefing summary' không chuẩn nghĩa.",
      },
    };

    it("đạt chuẩn khi đầy đủ 4 tầng, bản dịch, và phân tích A-D chi tiết", () => {
      expect(isPart5ExplanationNeedsRefinement(completePart5)).toBe(false);
      expect(isPart5ExplanationNeedsRefinement(completePart5, { requireExample: true })).toBe(
        false
      );
    });

    it("bắt lỗi các câu vá đợt cũ thiếu full_translation_vi hoặc thiếu example_en khi requireExample=true", () => {
      const missingTranslation = { ...completePart5, full_translation_vi: undefined };
      expect(isPart5ExplanationNeedsRefinement(missingTranslation)).toBe(true);

      const missingExample = { ...completePart5, example_en: "" };
      expect(isPart5ExplanationNeedsRefinement(missingExample)).toBe(false);
      expect(
        isPart5ExplanationNeedsRefinement(missingExample, { requireExample: true })
      ).toBe(true);
    });

    it("bắt lỗi câu dùng mẫu Kaggle switch cũ hoặc phân tích A-D sáo rỗng", () => {
      const kaggleBoilerplate = {
        ...completePart5,
        why_correct_vi: "Phương án B (to sign) tuân thủ đúng dạng động từ theo cấu trúc chuẩn.",
      };
      expect(isPart5ExplanationNeedsRefinement(kaggleBoilerplate)).toBe(true);

      const vagueOption = {
        ...completePart5,
        options_analysis: {
          ...completePart5.options_analysis,
          C: "Sai ngữ pháp.",
        },
      };
      expect(isPart5ExplanationNeedsRefinement(vagueOption)).toBe(true);
    });
  });

  describe("isReadingExplanationNeedsRefinement", () => {
    it("phát hiện plain string (105 câu Part 6/7) và object thiếu options_analysis", () => {
      expect(isReadingExplanationNeedsRefinement("Trước danh từ cần tính từ.")).toBe(true);
      expect(
        isReadingExplanationNeedsRefinement({
          translation: "Dịch nghĩa câu.",
          analysis: "Giải thích chi tiết dựa vào ngữ cảnh đoạn văn công sở.",
          key_clue: "starting on Monday",
        })
      ).toBe(true);
    });

    it("đạt chuẩn khi đầy đủ key_clue, full_translation_vi, why_correct_vi, tip_vi và options_analysis A-D", () => {
      expect(
        isReadingExplanationNeedsRefinement({
          question_type_vi: "Điền câu liên kết đoạn",
          rule_vi: "Câu chèn phải nối mạch giữa câu trước (remote work) và câu sau (appreciate).",
          why_correct_vi:
            "Phương án B bổ sung phương án bàn làm việc cho nhân viên làm tại văn phòng.",
          key_clue: "Temporary workstations will also be available",
          full_translation_vi: "Các bàn làm việc tạm thời cũng sẽ sẵn sàng ở tầng hai.",
          tip_vi: "Đọc kỹ câu ngay trước và ngay sau chỗ trống để bắt từ nối 'also'.",
          options_analysis: {
            A: "Nói về thực đơn nhà ăn — lạc đề so với sửa chữa văn phòng.",
            B: "Đúng: nối tiếp phương án làm việc từ xa bằng bàn làm việc tạm tại chỗ.",
            C: "Nói về hợp đồng ký kết — không liên quan mạch văn.",
            D: "Nói về phí đỗ xe — sai chủ đề đoạn memo.",
          },
        })
      ).toBe(false);
    });
  });

  describe("isExamAnswerNeedsRefinement & parseExamExplanation", () => {
    const validPart2Json = JSON.stringify({
      part: 2,
      question_type_vi: "Câu hỏi Wh- (Where)",
      strategy_vi: "Nghe từ hỏi Where để tìm cụm giới từ chỉ địa điểm phù hợp.",
      evidence: "Where's the staff meeting being held this afternoon?",
      why_correct_vi: "Phương án B trả lời trực tiếp địa điểm phòng họp tầng hai.",
      tip_vi: "Loại ngay đáp án Yes/No khi nghe thấy từ hỏi Where.",
      translation_vi: "Cuộc họp nhân viên chiều nay được tổ chức ở đâu?",
      options_analysis: {
        A: "About the new schedule (Về lịch mới) — Sai vì trả lời nội dung What.",
        B: "In the second-floor conference room (Ở phòng họp tầng hai) — Đúng địa điểm.",
        C: "Yes, it was held last week — Bẫy Yes/No cho câu hỏi Wh- và lặp từ 'held'.",
      },
    });

    it("kiểm tra cấu trúc A-C cho Part 2 và A-D cho các Part khác", () => {
      expect(
        isExamAnswerNeedsRefinement({
          part: 2,
          explanation: validPart2Json,
          explanation_vi: "Cuộc họp chiều nay tổ chức ở đâu?",
        })
      ).toBe(false);

      // Part 3 thiếu D -> cần refine
      expect(
        isExamAnswerNeedsRefinement({
          part: 3,
          explanation: validPart2Json,
          explanation_vi: "Bản dịch đầy đủ.",
        })
      ).toBe(true);

      // Chuỗi văn bản thường cũ -> cần refine
      expect(
        isExamAnswerNeedsRefinement({
          part: 7,
          explanation: "Chọn (B) vì đúng với bài đọc.",
          explanation_vi: "",
        })
      ).toBe(true);
    });

    it("parseExamExplanation hỗ trợ cả JSON chuẩn lẫn chuỗi văn bản cũ và JSON lỗi", () => {
      const structured = parseExamExplanation(validPart2Json, "Fallback vi");
      expect(structured?.isStructured).toBe(true);
      expect(structured?.questionTypeVi).toBe("Câu hỏi Wh- (Where)");
      expect(structured?.optionsAnalysis?.B).toContain("Đúng địa điểm");
      expect(structured?.optionsAnalysis?.D).toBeUndefined();

      const legacy = parseExamExplanation("Explanation for #101", "Dịch nghĩa #101");
      expect(legacy).toEqual({
        isStructured: false,
        summary: "Explanation for #101",
        translationVi: "Dịch nghĩa #101",
      });

      const malformedJson = parseExamExplanation("{broken-json", "Dịch fallback");
      expect(malformedJson).toEqual({
        isStructured: false,
        summary: "{broken-json",
        translationVi: "Dịch fallback",
      });

      expect(parseExamExplanation("", "")).toBeNull();
    });

    it("formatExamExplanationSummary tạo tóm tắt đọc được", () => {
      const text = formatExamExplanationSummary({
        question_type_vi: "Part 5",
        strategy_vi: "Quy tắc từ loại",
        why_correct_vi: "Đứng sau mạo từ cần danh từ",
        options_analysis: { A: "Danh từ (Đúng)", B: "Tính từ (Sai)" },
        tip_vi: "Nhìn đuôi -tion",
      });
      expect(text).toContain("[Part 5]");
      expect(text).toContain("(A) Danh từ (Đúng)");
    });
  });

  describe("Prompt builders & Gemini schemas", () => {
    it("buildPart5RefinementPrompt chứa đủ 5 tình huống và luật chống sáo rỗng", () => {
      const prompt = buildPart5RefinementPrompt({
        stem: "The report was ______ reviewed by the committee.",
        option_a: "careful",
        option_b: "carefully",
        option_c: "care",
        option_d: "caring",
        correctIndex: 1,
      });
      expect(prompt).toContain("Tình huống 1 — Từ loại");
      expect(prompt).toContain("Tình huống 5 — Từ vựng ngữ cảnh");
      expect(prompt).toContain("LUẬT CHỐNG SÁO RỖNG");
      expect(prompt).toContain("example_en");
    });

    it("buildPart6RefinementPrompt và buildPart7RefinementPrompt bao phủ đúng đặc thù từng Part", () => {
      const p6 = buildPart6RefinementPrompt({
        passageContent: "Memo content [131]",
        stem: "[131] text",
        orderInPassage: 1,
        questionSubType: "sentence_insertion",
        option_a: "A",
        option_b: "B",
        option_c: "C",
        option_d: "D",
        correctIndex: 0,
      });
      expect(p6).toContain("Sentence Insertion");
      expect(p6).toContain("CÂU NGAY TRƯỚC và CÂU NGAY SAU");

      const p7 = buildPart7RefinementPrompt({
        passageContent: "Email content",
        stem: "Which of the following is NOT true?",
        option_a: "A",
        option_b: "B",
        option_c: "C",
        option_d: "D",
        correctIndex: 2,
      });
      expect(p7).toContain("NOT / EXCEPT");
      expect(p7).toContain("CẢ 3 PHƯƠNG ÁN ĐƯỢC NHẮC ĐẾN");
    });

    it("getExamGeminiResponseSchema & buildExamRefinementPrompt phân biệt Part 2 (A-C) và Part khác (A-D)", () => {
      const schemaP2 = getExamGeminiResponseSchema(2);
      expect(schemaP2.properties.options_analysis.required).toEqual(["A", "B", "C"]);
      expect(schemaP2.properties.options_analysis.properties).not.toHaveProperty("D");

      const schemaP4 = getExamGeminiResponseSchema(4);
      expect(schemaP4.properties.options_analysis.required).toEqual(["A", "B", "C", "D"]);

      const p2Prompt = buildExamRefinementPrompt({
        part: 2,
        stem: "Where is the printer?",
        options: ["On the second floor.", "Yes, I printed it.", "At 3 PM."],
        correctIndex: 0,
      });
      expect(p2Prompt).toContain("CHỈ CÓ 3 ĐÁP ÁN A, B, C");
      expect(p2Prompt).toContain("bẫy lặp từ");
    });
  });
});
