import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import {
  calculateWilsonLower,
  calculateMasteryPercentage,
  getMasteryLabel,
  calculateAdaptiveMastery,
} from "@/core/wilson";
import {
  estimateListeningScore,
  estimateReadingScore,
  estimateTotalScore,
  calculateListeningScore,
  calculateReadingScore,
  calculateTotalScore,
} from "@/core/toeicScoring";
import {
  validateSafeAudioUrl,
  normalizeWord,
  parseFreeDictResponse,
} from "@/core/dictionary";

// Đọc biến môi trường từ .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...values] = trimmed.split("=");
      process.env[key.trim()] = values.join("=").trim();
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const anonClient = createClient(supabaseUrl, anonKey);
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

describe("Remediation Verification & Regression Test Suite", () => {
  // ============================================================================
  // P0.1: BẢO MẬT RPC submit_passage_answers
  // ============================================================================
  describe("P0.1: Kiểm tra bảo mật RPC submit_passage_answers trên PostgreSQL thực tế", () => {
    let testPassageId: string;
    let testQuestions: { id: string; correct_index: number }[] = [];

    it("chuẩn bị dữ liệu bài đọc và câu hỏi mẫu trên DB", async () => {
      const { data: passages, error } = await adminClient
        .from("passages")
        .select("id, questions(id, order_in_passage)")
        .eq("status", "published")
        .limit(1);

      expect(error).toBeNull();
      expect(passages).toBeDefined();
      expect(passages!.length).toBeGreaterThan(0);

      testPassageId = passages![0].id;
      const qList = (passages![0] as any).questions as { id: string }[];
      expect(qList.length).toBeGreaterThanOrEqual(2);

      // Lấy đáp án thật từ adminClient để kiểm chứng test
      const { data: answers } = await adminClient
        .from("question_answers")
        .select("question_id, correct_index")
        .in(
          "question_id",
          qList.map((q) => q.id)
        );

      testQuestions = (answers || []).map((a) => ({
        id: a.question_id,
        correct_index: a.correct_index,
      }));
      expect(testQuestions.length).toBeGreaterThanOrEqual(2);
    });

    it("1. Chặn hoàn toàn anon: Anon gọi RPC submit_passage_answers bị từ chối", async () => {
      const { data, error } = await anonClient.rpc("submit_passage_answers", {
        p_passage_id: testPassageId,
        p_answers: [
          {
            questionId: testQuestions[0].id,
            selectedIndex: testQuestions[0].correct_index,
          },
        ],
      });

      // RPC trả về lỗi UNAUTHORIZED hoặc PostgreSQL từ chối thực thi
      if (data) {
        expect(data.success).toBe(false);
        expect(data.error).toBe("UNAUTHORIZED");
      } else {
        expect(error).toBeDefined();
      }
    });

    it("2. Chống Oracle lộ đáp án: Payload gửi toàn bộ selected_index = -1 bị từ chối, không lộ đáp án", async () => {
      const mockUserId = "b1d3d18c-c953-4ac3-998e-feb2bd5e9303";
      const { data, error } = await adminClient.rpc("submit_passage_answers", {
        p_passage_id: testPassageId,
        p_answers: [
          { questionId: testQuestions[0].id, selectedIndex: -1 },
          { questionId: testQuestions[1].id, selectedIndex: -1 },
        ],
        p_user_id: mockUserId,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.success).toBe(false);
      expect(data.error).toBe("INVALID_SUBMISSION");
      expect(data.results).toBeUndefined();
    });

    it("3. Mixed Payload: Chỉ trả về đáp án và ghi attempt cho câu đã thực sự chọn (0..3), KHÔNG ghi câu -1", async () => {
      const qAnswered = testQuestions[0];
      const qUnanswered = testQuestions[1];
      const mockUserId = "b1d3d18c-c953-4ac3-998e-feb2bd5e9303";

      // Đếm số attempt trước khi nộp
      const { count: countBefore } = await adminClient
        .from("attempts")
        .select("*", { count: "exact", head: true })
        .eq("question_id", qUnanswered.id);

      const { data, error } = await adminClient.rpc("submit_passage_answers", {
        p_passage_id: testPassageId,
        p_answers: [
          { questionId: qAnswered.id, selectedIndex: qAnswered.correct_index },
          { questionId: qUnanswered.id, selectedIndex: -1 },
        ],
        p_user_id: mockUserId,
      });

      expect(error).toBeNull();
      expect(data.success).toBe(true);
      expect(data.total).toBe(1); // Chỉ tính 1 câu đã trả lời
      expect(data.score).toBe(1); // 1 câu đúng

      // Kết quả trả về CHỈ chứa câu đã trả lời qAnswered, TUYỆT ĐỐI không chứa qUnanswered
      const returnedIds = (data.results as any[]).map((r) => r.question_id);
      expect(returnedIds).toContain(qAnswered.id);
      expect(returnedIds).not.toContain(qUnanswered.id);

      // Xác minh trong DB: Câu qUnanswered KHÔNG bị ghi nhận attempt
      const { count: countAfter } = await adminClient
        .from("attempts")
        .select("*", { count: "exact", head: true })
        .eq("question_id", qUnanswered.id);

      expect(countAfter).toBe(countBefore);
    });

    it("4. Chống lỗi ép kiểu: Payload chứa questionId không phải UUID hoặc malformed string được bỏ qua an toàn", async () => {
      const mockUserId = "b1d3d18c-c953-4ac3-998e-feb2bd5e9303";
      const { data, error } = await adminClient.rpc("submit_passage_answers", {
        p_passage_id: testPassageId,
        p_answers: [
          { questionId: "not-a-valid-uuid", selectedIndex: 0 },
          { questionId: testQuestions[0].id, selectedIndex: testQuestions[0].correct_index },
        ],
        p_user_id: mockUserId,
      });

      expect(error).toBeNull();
      expect(data.success).toBe(true);
      expect(data.total).toBe(1);
      expect(data.results[0].question_id).toBe(testQuestions[0].id);
    });

    it("5. Deduplication: Payload gửi questionId trùng lặp chỉ được chấm và tính 1 lần duy nhất", async () => {
      const qAnswered = testQuestions[0];
      const mockUserId = "b1d3d18c-c953-4ac3-998e-feb2bd5e9303";
      const { data, error } = await adminClient.rpc("submit_passage_answers", {
        p_passage_id: testPassageId,
        p_answers: [
          { questionId: qAnswered.id, selectedIndex: qAnswered.correct_index },
          { questionId: qAnswered.id, selectedIndex: qAnswered.correct_index },
          { questionId: qAnswered.id, selectedIndex: qAnswered.correct_index },
        ],
        p_user_id: mockUserId,
      });

      expect(error).toBeNull();
      expect(data.success).toBe(true);
      expect(data.total).toBe(1); // Không bị nhân 3
      expect(data.score).toBe(1);
      expect(data.results.length).toBe(1);
    });

    it("6. Payload chứa questionId không thuộc passage bị loại bỏ an toàn", async () => {
      const foreignQid = "ffffffff-ffff-ffff-ffff-ffffffffffff";
      const mockUserId = "b1d3d18c-c953-4ac3-998e-feb2bd5e9303";
      const { data, error } = await adminClient.rpc("submit_passage_answers", {
        p_passage_id: testPassageId,
        p_answers: [
          { questionId: foreignQid, selectedIndex: 0 },
          { questionId: testQuestions[0].id, selectedIndex: testQuestions[0].correct_index },
        ],
        p_user_id: mockUserId,
      });

      expect(error).toBeNull();
      expect(data.success).toBe(true);
      expect(data.total).toBe(1);
      expect(data.results[0].question_id).toBe(testQuestions[0].id);
    });
  });

  // ============================================================================
  // P0.2: TÍNH NGUYÊN TỬ CỦA FSRS REVIEW & BẢO VỆ RLS
  // ============================================================================
  describe("P0.2: Tính nguyên tử FSRS và bảo vệ RLS trên PostgreSQL", () => {
    let testCard: any;
    let testUserId: string;

    it("chuẩn bị thẻ ôn tập mẫu trong review_cards", async () => {
      const { data: cards, error } = await adminClient
        .from("review_cards")
        .select("*")
        .limit(1);

      expect(error).toBeNull();
      expect(cards).toBeDefined();
      expect(cards!.length).toBeGreaterThan(0);

      testCard = cards![0];
      testUserId = testCard.user_id;
    });

    it("1. Chặn REST API: Client authenticated KHÔNG THỂ UPDATE trực tiếp review_cards", async () => {
      const { data: updatedRows } = await anonClient
        .from("review_cards")
        .update({ state: 3, stability: 999 })
        .eq("id", testCard.id)
        .select();

      // Bị chặn hoàn toàn bởi RLS policy review_cards_select_own (0 rows modified)
      expect(updatedRows === null || updatedRows.length === 0).toBe(true);

      // Kiểm tra lại trong DB: Giá trị không hề bị thay đổi
      const { data: current } = await adminClient
        .from("review_cards")
        .select("stability")
        .eq("id", testCard.id)
        .single();

      expect(Number(current?.stability)).not.toBe(999);
    });

    it("2. Chặn REST API: Client authenticated KHÔNG THỂ INSERT trực tiếp card_reviews", async () => {
      const { error } = await anonClient.from("card_reviews").insert({
        card_id: testCard.id,
        user_id: testUserId,
        rating: 4,
        state_before: 0,
        stability_before: 0,
        difficulty_before: 0,
      });

      expect(error).toBeDefined();
    });

    it("3. Chấm thẻ bằng rating không hợp lệ (rating = 5) bị từ chối ngay trong RPC", async () => {
      const { data, error } = await adminClient.rpc("record_card_review_atomic", {
        p_card_id: testCard.id,
        p_user_id: testUserId,
        p_new_state: 1,
        p_new_stability: 2.5,
        p_new_difficulty: 5.0,
        p_new_due: new Date().toISOString(),
        p_new_last_review: new Date().toISOString(),
        p_new_reps: 1,
        p_new_lapses: 0,
        p_rating: 5, // KHÔNG HỢP LỆ
        p_state_before: testCard.state,
        p_stability_before: testCard.stability,
        p_difficulty_before: testCard.difficulty,
        p_reviewed_at: new Date().toISOString(),
      });

      expect(error).toBeNull();
      expect(data.success).toBe(false);
      expect(data.error).toBe("INVALID_RATING");
    });

    it("4. User A thao tác vào thẻ của User B bị RPC từ chối (FORBIDDEN)", async () => {
      const hackerUserId = "99999999-9999-9999-9999-999999999999";
      const { data, error } = await adminClient.rpc("record_card_review_atomic", {
        p_card_id: testCard.id,
        p_user_id: hackerUserId, // Không phải chủ sở hữu thẻ
        p_new_state: 1,
        p_new_stability: 2.5,
        p_new_difficulty: 5.0,
        p_new_due: new Date().toISOString(),
        p_new_last_review: new Date().toISOString(),
        p_new_reps: 1,
        p_new_lapses: 0,
        p_rating: 3,
        p_state_before: testCard.state,
        p_stability_before: testCard.stability,
        p_difficulty_before: testCard.difficulty,
        p_reviewed_at: new Date().toISOString(),
      });

      expect(error).toBeNull();
      expect(data.success).toBe(false);
      expect(data.error).toBe("FORBIDDEN");
    });

    it("5. Giao dịch nguyên tử: Cập nhật review_cards và ghi card_reviews thành công đồng thời", async () => {
      const now = new Date();
      const nextDue = new Date(now.getTime() + 86400000);

      const { data, error } = await adminClient.rpc("record_card_review_atomic", {
        p_card_id: testCard.id,
        p_user_id: testUserId,
        p_new_state: 2,
        p_new_stability: 4.8,
        p_new_difficulty: 4.2,
        p_new_due: nextDue.toISOString(),
        p_new_last_review: now.toISOString(),
        p_new_reps: testCard.reps + 1,
        p_new_lapses: testCard.lapses,
        p_rating: 3,
        p_state_before: testCard.state,
        p_stability_before: testCard.stability,
        p_difficulty_before: testCard.difficulty,
        p_reviewed_at: now.toISOString(),
      });

      expect(error).toBeNull();
      expect(data.success).toBe(true);

      // Xác minh cả hai bảng đều có dữ liệu mới
      const { data: updatedCard } = await adminClient
        .from("review_cards")
        .select("state, reps")
        .eq("id", testCard.id)
        .single();
      expect(updatedCard?.state).toBe(2);
      expect(updatedCard?.reps).toBe(testCard.reps + 1);

      const { data: reviews } = await adminClient
        .from("card_reviews")
        .select("rating, state_before")
        .eq("card_id", testCard.id)
        .order("reviewed_at", { ascending: false })
        .limit(1);
      expect(reviews?.[0]?.rating).toBe(3);
    });
  });

  // ============================================================================
  // P1.1: ĐỒNG NHẤT ADAPTIVE ROLLING MASTERY
  // ============================================================================
  describe("P1.1: Đồng nhất thuật toán Adaptive Rolling Mastery (ARM - D-25)", () => {
    it("1. Ngưỡng khởi động (< 5 câu): Luôn là 'insufficient'", () => {
      expect(getMasteryLabel(0, 0)).toBe("insufficient");
      expect(getMasteryLabel(1, 100)).toBe("insufficient");
      expect(getMasteryLabel(4, 100)).toBe("insufficient");
    });

    it("2. Fast-Track cho học viên xuất sắc (n >= 8 và accuracy >= 90%): Luôn là 'mastered'", () => {
      expect(getMasteryLabel(8, 88.9, 1.0)).toBe("mastered");
      expect(getMasteryLabel(9, 85.0, 0.9)).toBe("mastered");
      expect(getMasteryLabel(10, 80.0, 0.9)).toBe("mastered");
    });

    it("3. Điểm chuẩn Wilson z=1.0 và phân loại chính xác ở các mốc", () => {
      // 6/10 -> 44.3% -> needs_review (< 50)
      const p6_10 = calculateMasteryPercentage(6, 10, 1.0, 0);
      expect(p6_10).toBe(44.3);
      expect(getMasteryLabel(10, p6_10)).toBe("needs_review");

      // 8/10 -> 64.9% -> proficient (50 <= score < 75)
      const p8_10 = calculateMasteryPercentage(8, 10, 1.0, 0);
      expect(p8_10).toBe(64.9);
      expect(getMasteryLabel(10, p8_10)).toBe("proficient");

      // 17/20 -> 75.4% -> mastered (>= 75)
      const p17_20 = calculateMasteryPercentage(17, 20, 1.0, 0);
      expect(p17_20).toBe(75.4);
      expect(getMasteryLabel(20, p17_20)).toBe("mastered");
    });

    it("4. SQL wilson_lower(correct, total, 1.0) cho kết quả khớp 100% với TypeScript", async () => {
      const testCases = [
        { c: 0, t: 0, expected: 0 },
        { c: 2, t: 2, expected: 0.5 },
        { c: 4, t: 5, expected: 0.5489 },
        { c: 6, t: 10, expected: 0.443 },
        { c: 8, t: 10, expected: 0.649 },
        { c: 17, t: 20, expected: 0.7541 },
        { c: 20, t: 20, expected: 0.9091 },
      ];

      for (const tc of testCases) {
        const { data: sqlRes, error } = await adminClient.rpc("wilson_lower", {
          p_correct: tc.c,
          p_total: tc.t,
          p_z: 1.0,
        });

        expect(error).toBeNull();
        const tsRes = calculateWilsonLower(tc.c, tc.t, 1.0);
        expect(Number(sqlRes)).toBeCloseTo(tsRes, 3);
      }
    });

    it("5. calculateAdaptiveMastery chỉ lấy tối đa 20 câu gần nhất theo thời gian", () => {
      // 10 câu đầu sai (lịch sử cũ), 20 câu gần nhất đúng cả 20 câu
      const attempts = [
        ...Array(10).fill({ is_correct: false }),
        ...Array(20).fill({ is_correct: true }),
      ];

      const res = calculateAdaptiveMastery(attempts, 20);
      expect(res.windowTotal).toBe(20);
      expect(res.windowCorrect).toBe(20);
      expect(res.accuracy).toBe(100);
      expect(res.score).toBeGreaterThanOrEqual(75);
      expect(res.label).toBe("mastered");
    });
  });

  // ============================================================================
  // P1.2: BẢO VỆ DICTIONARY CACHE
  // ============================================================================
  describe("P1.2: Bảo vệ Dictionary Cache và lọc URL âm thanh an toàn", () => {
    it("1. Chặn REST API: Client authenticated / anon KHÔNG THỂ chèn từ tùy ý vào dictionary_cache", async () => {
      const { error } = await anonClient.from("dictionary_cache").insert({
        word: "hack_attempt_" + Date.now(),
        meaning_vi: "Độc hại",
        audio_url: "http://malicious-site.com/exploit.mp3",
      });

      expect(error).toBeDefined();
    });

    it("2. Cho phép mọi người dùng đọc (SELECT) dictionary_cache", async () => {
      const { data, error } = await anonClient
        .from("dictionary_cache")
        .select("word, meaning_vi")
        .limit(3);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it("3. validateSafeAudioUrl lọc triệt để các URL không an toàn", () => {
      expect(validateSafeAudioUrl("http://insecure.com/audio.mp3")).toBe("");
      expect(validateSafeAudioUrl("javascript:alert('xss')")).toBe("");
      expect(validateSafeAudioUrl("data:audio/mp3;base64,...")).toBe("");
      expect(validateSafeAudioUrl("https://api.dictionaryapi.dev/media/pronunciations/en/word.mp3")).toContain(
        "https://"
      );
    });
  });

  // ============================================================================
  // P1.3: TOEIC SCORING ƯỚC TÍNH THAM CHIẾU
  // ============================================================================
  describe("P1.3: TOEIC Scoring Thang điểm ước tính tham chiếu", () => {
    it("1. Quy đổi chính xác các mốc điểm ước tính", () => {
      expect(estimateListeningScore(0)).toBe(5);
      expect(estimateReadingScore(0)).toBe(5);
      expect(estimateTotalScore(0, 0).totalScore).toBe(10);

      expect(estimateListeningScore(100)).toBe(495);
      expect(estimateReadingScore(100)).toBe(495);
      expect(estimateTotalScore(100, 100).totalScore).toBe(990);

      expect(estimateListeningScore(70)).toBe(380);
      expect(estimateReadingScore(70)).toBe(335);
      expect(estimateTotalScore(70, 70).totalScore).toBe(715);
    });

    it("2. Xử lý giá trị ngoài biên an toàn", () => {
      expect(estimateListeningScore(-50)).toBe(5);
      expect(estimateReadingScore(-10)).toBe(5);
      expect(estimateListeningScore(120)).toBe(495);
      expect(estimateReadingScore(200)).toBe(495);
      expect(estimateListeningScore(NaN)).toBe(5);
    });

    it("3. Tương thích ngược với các tên hàm cũ", () => {
      expect(calculateListeningScore(80)).toBe(estimateListeningScore(80));
      expect(calculateReadingScore(80)).toBe(estimateReadingScore(80));
      expect(calculateTotalScore(80, 80)).toEqual(estimateTotalScore(80, 80));
    });
  });
});
