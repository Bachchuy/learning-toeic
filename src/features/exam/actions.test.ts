import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreateClient = vi.fn();
const mockCreateAdminClient = vi.fn();
const mockGetOptionalUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockCreateClient(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mockCreateAdminClient(),
}));

vi.mock("@/shared/auth", () => ({
  getOptionalUser: () => mockGetOptionalUser(),
}));

import {
  getExamListAction,
  submitReadingExamAction,
  submitListeningExamAction,
} from "./actions";

describe("exam server actions — Findings 1, 2, 3", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Finding 3: getExamListAction (DB-only, no MOCK_TESTS fallback)", () => {
    it("trả về mảng rỗng [] khi DB không có đề published nào", async () => {
      mockCreateClient.mockResolvedValue({
        from: () => ({
          select: () => ({
            eq: () => ({
              order: async () => ({ data: [], error: null }),
            }),
          }),
        }),
      });

      const list = await getExamListAction();
      expect(list).toEqual([]);
    });

    it("trả về mảng rỗng [] khi truy vấn DB gặp lỗi", async () => {
      mockCreateClient.mockResolvedValue({
        from: () => ({
          select: () => ({
            eq: () => ({
              order: async () => ({
                data: null,
                error: { message: "connection failed" },
              }),
            }),
          }),
        }),
      });

      const list = await getExamListAction();
      expect(list).toEqual([]);
    });

    it("trả về danh sách đề thi khi DB có đề status = published", async () => {
      const eqSpy = vi.fn().mockReturnValue({
        order: async () => ({
          data: [
            {
              id: "exam-pub-1",
              slug: "ets-2024-test-1",
              title: "ETS TOEIC 2024 Test 1",
              description: "Đề chuẩn ETS",
              exam_type: "full",
              target_score: 650,
              duration_minutes: 75,
              total_questions: 100,
              parts_summary: { part5: 30, part6: 16, part7: 54, totalReading: 100 },
            },
          ],
          error: null,
        }),
      });

      mockCreateClient.mockResolvedValue({
        from: () => ({
          select: () => ({
            eq: eqSpy,
          }),
        }),
      });

      const list = await getExamListAction();
      expect(eqSpy).toHaveBeenCalledWith("status", "published");
      expect(list).toHaveLength(1);
      expect(list[0]?.slug).toBe("ets-2024-test-1");
    });
  });

  describe("Finding 1 & 2: submitReadingExamAction & submitListeningExamAction", () => {
    const sampleReadingExam = {
      id: "exam-1",
      slug: "ets-test-1",
      title: "ETS Test 1",
      content: {
        reading: {
          part5: [
            {
              id: "q101",
              stem: "The report _____ yesterday.",
              options: ["finish", "finished", "was finished", "finishing"],
            },
          ],
        },
      },
    };

    const sampleListeningExam = {
      id: "exam-1",
      slug: "ets-test-1",
      title: "ETS Test 1",
      content: {
        listening: {
          part1: [
            {
              id: "q1",
              questionNumber: 1,
              options: ["A", "B", "C", "D"],
            },
          ],
        },
      },
    };

    it("từ chối đề Reading draft/retired (thiếu status = published), không đọc exam_set_answers và không ghi exam_attempts", async () => {
      mockGetOptionalUser.mockResolvedValue({ user: { id: "user-1" } });

      const eqCalls: Array<[string, unknown]> = [];
      const answersSelectSpy = vi.fn();
      const attemptsInsertSpy = vi.fn();

      mockCreateAdminClient.mockReturnValue({
        from: (table: string) => {
          if (table === "exam_sets") {
            const builder = {
              select: () => builder,
              eq: (col: string, val: unknown) => {
                eqCalls.push([col, val]);
                return builder;
              },
              maybeSingle: async () => ({ data: null, error: null }),
            };
            return builder;
          }
          if (table === "exam_set_answers") {
            return { select: answersSelectSpy };
          }
          if (table === "exam_attempts") {
            return { insert: attemptsInsertSpy };
          }
          throw new Error(`Unexpected table ${table}`);
        },
      });

      const res = await submitReadingExamAction({
        examSetId: "draft-exam-id",
        userAnswers: { q101: 2 },
        timeSpentSeconds: 120,
      });

      expect(res.success).toBe(false);
      expect(eqCalls).toContainEqual(["id", "draft-exam-id"]);
      expect(eqCalls).toContainEqual(["status", "published"]);
      expect(answersSelectSpy).not.toHaveBeenCalled();
      expect(attemptsInsertSpy).not.toHaveBeenCalled();
    });

    it("từ chối đề Listening draft/retired (thiếu status = published), không đọc exam_set_answers và không ghi exam_attempts", async () => {
      mockGetOptionalUser.mockResolvedValue({ user: { id: "user-1" } });

      const eqCalls: Array<[string, unknown]> = [];
      const answersSelectSpy = vi.fn();
      const attemptsInsertSpy = vi.fn();

      mockCreateAdminClient.mockReturnValue({
        from: (table: string) => {
          if (table === "exam_sets") {
            const builder = {
              select: () => builder,
              eq: (col: string, val: unknown) => {
                eqCalls.push([col, val]);
                return builder;
              },
              maybeSingle: async () => ({ data: null, error: null }),
            };
            return builder;
          }
          if (table === "exam_set_answers") {
            return { select: answersSelectSpy };
          }
          if (table === "exam_attempts") {
            return { insert: attemptsInsertSpy };
          }
          throw new Error(`Unexpected table ${table}`);
        },
      });

      const res = await submitListeningExamAction({
        examSetId: "retired-exam-id",
        userAnswers: { q1: 1 },
        timeSpentSeconds: 90,
      });

      expect(res.success).toBe(false);
      expect(eqCalls).toContainEqual(["id", "retired-exam-id"]);
      expect(eqCalls).toContainEqual(["status", "published"]);
      expect(answersSelectSpy).not.toHaveBeenCalled();
      expect(attemptsInsertSpy).not.toHaveBeenCalled();
    });

    it("trả về success: false khi INSERT exam_attempts thất bại hoặc thiếu bản ghi trả về (Reading & Listening)", async () => {
      mockGetOptionalUser.mockResolvedValue({ user: { id: "user-1" } });

      const makeAdminMock = (
        examRow: unknown,
        partNum: number,
        questionId: string,
        insertResult: { data: { id: string } | null; error: unknown }
      ) => ({
        from: (table: string) => {
          if (table === "exam_sets") {
            const builder = {
              select: () => builder,
              eq: () => builder,
              maybeSingle: async () => ({ data: examRow, error: null }),
            };
            return builder;
          }
          if (table === "exam_set_answers") {
            return {
              select: () => ({
                eq: () => ({
                  in: async () => ({
                    data: [
                      {
                        question_id: questionId,
                        part: partNum,
                        correct_answer: "C",
                        correct_index: 2,
                        evidence: null,
                        explanation: "Explanation",
                        explanation_vi: "Giải thích",
                      },
                    ],
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === "exam_attempts") {
            return {
              insert: () => ({
                select: () => ({
                  maybeSingle: async () => insertResult,
                }),
              }),
            };
          }
          throw new Error(`Unexpected table ${table}`);
        },
      });

      // 1. Reading: INSERT trả lỗi DB
      mockCreateAdminClient.mockReturnValue(
        makeAdminMock(sampleReadingExam, 5, "q101", {
          data: null,
          error: { message: "insert failed" },
        })
      );
      const readingErrRes = await submitReadingExamAction({
        examSetId: "exam-1",
        userAnswers: { q101: 2 },
        timeSpentSeconds: 300,
      });
      expect(readingErrRes.success).toBe(false);
      expect(readingErrRes.evaluation).toBeUndefined();

      // 2. Reading: INSERT không trả về bản ghi (data: null)
      mockCreateAdminClient.mockReturnValue(
        makeAdminMock(sampleReadingExam, 5, "q101", {
          data: null,
          error: null,
        })
      );
      const readingNullRes = await submitReadingExamAction({
        examSetId: "exam-1",
        userAnswers: { q101: 2 },
        timeSpentSeconds: 300,
      });
      expect(readingNullRes.success).toBe(false);

      // 3. Listening: INSERT trả lỗi DB
      mockCreateAdminClient.mockReturnValue(
        makeAdminMock(sampleListeningExam, 1, "q1", {
          data: null,
          error: { message: "insert failed" },
        })
      );
      const listeningErrRes = await submitListeningExamAction({
        examSetId: "exam-1",
        userAnswers: { q1: 2 },
        timeSpentSeconds: 200,
      });
      expect(listeningErrRes.success).toBe(false);
      expect(listeningErrRes.evaluation).toBeUndefined();

      // 4. Đường thành công (Reading & Listening published + INSERT trả về id)
      mockCreateAdminClient.mockReturnValue(
        makeAdminMock(sampleReadingExam, 5, "q101", {
          data: { id: "attempt-reading-ok" },
          error: null,
        })
      );
      const readingOkRes = await submitReadingExamAction({
        examSetId: "exam-1",
        userAnswers: { q101: 2 },
        timeSpentSeconds: 300,
      });
      expect(readingOkRes.success).toBe(true);
      expect(readingOkRes.attemptId).toBe("attempt-reading-ok");
      expect(readingOkRes.evaluation?.rawScore).toBe(1);

      mockCreateAdminClient.mockReturnValue(
        makeAdminMock(sampleListeningExam, 1, "q1", {
          data: { id: "attempt-listening-ok" },
          error: null,
        })
      );
      const listeningOkRes = await submitListeningExamAction({
        examSetId: "exam-1",
        userAnswers: { q1: 2 },
        timeSpentSeconds: 200,
      });
      expect(listeningOkRes.success).toBe(true);
      expect(listeningOkRes.attemptId).toBe("attempt-listening-ok");
      expect(listeningOkRes.evaluation?.rawScore).toBe(1);
    });
  });
});
