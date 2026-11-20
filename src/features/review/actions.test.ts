import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetOptionalUser = vi.fn();
const mockCreateAdminClient = vi.fn();
const mockTrackEventAction = vi.fn();

vi.mock("@/shared/auth", () => ({
  getOptionalUser: () => mockGetOptionalUser(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mockCreateAdminClient(),
}));

vi.mock("@/features/practice/actions", () => ({
  trackEventAction: (...args: unknown[]) => mockTrackEventAction(...args),
}));

import { getReviewCardsAction } from "./actions";

interface NotebookFixture {
  id: string;
  user_id: string;
  name: string;
}

interface ReviewCardFixture {
  id: string;
  vocab_entry_id: string;
  user_id: string;
  state: number;
  stability: number;
  difficulty: number;
  due: string;
  last_review: string | null;
  reps: number;
  lapses: number;
  vocab_entries: {
    id: string;
    word: string;
    lemma: string;
    meaning: string;
    context_sentence: string;
    context_translation?: string;
    part_of_speech?: string;
    phonetic?: string;
    metadata?: {
      topic?: string;
      audio_url?: string;
      phonetic?: string;
    };
    notebook_id: string;
  };
}

interface FilterOp {
  op: "eq" | "neq" | "lte" | "gt";
  column: string;
  value: unknown;
}

interface RecordedQuery {
  table: string;
  head: boolean;
  singleMode: "none" | "single" | "maybeSingle";
  filters: FilterOp[];
  orderColumn?: string;
  limitValue?: number;
}

function getFieldValue(row: NotebookFixture | ReviewCardFixture, column: string): unknown {
  if (column === "id") return row.id;
  if (column === "user_id") return row.user_id;
  if (column === "name" && "name" in row) return row.name;
  if (!("vocab_entries" in row)) return undefined;
  if (column === "due") return row.due;
  if (column === "last_review") return row.last_review;
  if (column === "vocab_entries.notebook_id") return row.vocab_entries.notebook_id;
  if (column === "vocab_entries.metadata->>topic") {
    return row.vocab_entries.metadata?.topic;
  }
  return undefined;
}

function createMockSupabase(fixtures: {
  notebooks: NotebookFixture[];
  reviewCards: ReviewCardFixture[];
}) {
  const recordedQueries: RecordedQuery[] = [];

  const from = (table: string) => {
    const state: RecordedQuery = {
      table,
      head: false,
      singleMode: "none",
      filters: [],
    };

    const execute = async (): Promise<{
      data: unknown;
      count?: number | null;
      error: null;
    }> => {
      recordedQueries.push({
        ...state,
        filters: [...state.filters],
      });

      const sourceRows: Array<NotebookFixture | ReviewCardFixture> =
        table === "notebooks" ? fixtures.notebooks : fixtures.reviewCards;

      let matched = sourceRows.filter((row) =>
        state.filters.every((f) => {
          const val = getFieldValue(row, f.column);
          if (f.op === "eq") return val === f.value;
          if (f.op === "neq") return val !== f.value;
          if (f.op === "lte") return String(val ?? "") <= String(f.value ?? "");
          if (f.op === "gt") return String(val ?? "") > String(f.value ?? "");
          return true;
        })
      );

      if (state.orderColumn === "due") {
        matched = [...matched].sort((a, b) =>
          String(getFieldValue(a, "due") ?? "").localeCompare(
            String(getFieldValue(b, "due") ?? "")
          )
        );
      } else if (state.orderColumn === "last_review") {
        matched = [...matched].sort((a, b) => {
          const av = getFieldValue(a, "last_review");
          const bv = getFieldValue(b, "last_review");
          if (!av && !bv) return 0;
          if (!av) return -1;
          if (!bv) return 1;
          return String(av).localeCompare(String(bv));
        });
      }

      if (typeof state.limitValue === "number") {
        matched = matched.slice(0, state.limitValue);
      }

      if (state.head) {
        return { data: null, count: matched.length, error: null };
      }
      if (state.singleMode === "single" || state.singleMode === "maybeSingle") {
        return { data: matched[0] ?? null, error: null };
      }
      return { data: matched, error: null };
    };

    const builder = {
      select: (_columns?: string, opts?: { count?: string; head?: boolean }) => {
        if (opts?.head) {
          state.head = true;
        }
        return builder;
      },
      eq: (column: string, value: unknown) => {
        state.filters.push({ op: "eq", column, value });
        return builder;
      },
      neq: (column: string, value: unknown) => {
        state.filters.push({ op: "neq", column, value });
        return builder;
      },
      lte: (column: string, value: unknown) => {
        state.filters.push({ op: "lte", column, value });
        return builder;
      },
      gt: (column: string, value: unknown) => {
        state.filters.push({ op: "gt", column, value });
        return builder;
      },
      order: (column: string) => {
        state.orderColumn = column;
        return builder;
      },
      limit: (count: number) => {
        state.limitValue = count;
        return builder;
      },
      single: () => {
        state.singleMode = "single";
        return execute();
      },
      maybeSingle: () => {
        state.singleMode = "maybeSingle";
        return execute();
      },
      then: <TResult1 = unknown, TResult2 = never>(
        onfulfilled?:
          | ((value: { data: unknown; count?: number | null; error: null }) => TResult1 | PromiseLike<TResult1>)
          | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
      ) => execute().then(onfulfilled ?? undefined, onrejected ?? undefined),
    };

    return builder;
  };

  return {
    supabase: { from },
    recordedQueries,
  };
}

function makeCardFixture(overrides: {
  id: string;
  word: string;
  meaning: string;
  notebookId: string;
  topic: string;
  due: string;
}): ReviewCardFixture {
  return {
    id: overrides.id,
    vocab_entry_id: `ve-${overrides.id}`,
    user_id: "user-1",
    state: 2,
    stability: 4,
    difficulty: 5,
    due: overrides.due,
    last_review: "2025-01-01T00:00:00.000Z",
    reps: 1,
    lapses: 0,
    vocab_entries: {
      id: `ve-${overrides.id}`,
      word: overrides.word,
      lemma: overrides.word,
      meaning: overrides.meaning,
      context_sentence: `Example with ${overrides.word}.`,
      part_of_speech: "noun",
      phonetic: "/tɛst/",
      metadata: {
        topic: overrides.topic,
        phonetic: "/tɛst/",
      },
      notebook_id: overrides.notebookId,
    },
  };
}

const DEFAULT_NOTEBOOKS: NotebookFixture[] = [
  { id: "nb-it", user_id: "user-1", name: "Từ vựng Tiếng Anh IT & Công Nghệ" },
  { id: "nb-toeic", user_id: "user-1", name: "600 Essential Words" },
];

describe("review server actions — excludeDeck across cram fallback & upcoming-date queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("excludes IT cards from cramQuery and upcomingQuery when topic due query is empty", async () => {
    const itCard = makeCardFixture({
      id: "card-it-api",
      word: "endpoint",
      meaning: "điểm cuối API",
      notebookId: "nb-it",
      topic: "API",
      due: "2099-05-10T08:00:00.000Z",
    });

    const mock = createMockSupabase({
      notebooks: DEFAULT_NOTEBOOKS,
      reviewCards: [itCard],
    });
    mockGetOptionalUser.mockResolvedValue({
      user: { id: "user-1" },
      supabase: mock.supabase,
    });

    const res = await getReviewCardsAction({
      topic: "API",
      limit: 15,
      studyAll: false,
      excludeDeck: "it-vocab",
    });

    expect(res.cards).toEqual([]);
    expect(res.totalCardsCount).toBe(0);
    expect(res.nextDueFormatted).toBeUndefined();

    const reviewCardQueries = mock.recordedQueries.filter(
      (q) => q.table === "review_cards" && !q.head
    );
    // Initial cardsQuery, cramQuery fallback, upcomingQuery
    expect(reviewCardQueries).toHaveLength(3);
    for (const query of reviewCardQueries) {
      expect(query.filters).toContainEqual({
        op: "neq",
        column: "vocab_entries.notebook_id",
        value: "nb-it",
      });
    }
  });

  it("keeps non-IT TOEIC cards during topic cram fallback while never letting excluded IT cards re-enter", async () => {
    const itCard = makeCardFixture({
      id: "card-it-shared",
      word: "payload",
      meaning: "tải trọng dữ liệu",
      notebookId: "nb-it",
      topic: "API",
      due: "2099-05-10T08:00:00.000Z",
    });
    const toeicCard = makeCardFixture({
      id: "card-toeic-shared",
      word: "integration",
      meaning: "tích hợp",
      notebookId: "nb-toeic",
      topic: "API",
      due: "2099-06-15T10:30:00.000Z",
    });

    const mock = createMockSupabase({
      notebooks: DEFAULT_NOTEBOOKS,
      reviewCards: [itCard, toeicCard],
    });
    mockGetOptionalUser.mockResolvedValue({
      user: { id: "user-1" },
      supabase: mock.supabase,
    });

    const res = await getReviewCardsAction({
      topic: "API",
      limit: 15,
      studyAll: false,
      excludeDeck: "it-vocab",
    });

    expect(res.totalCardsCount).toBe(1);
    expect(res.cards.map((c) => c.id)).toEqual(["card-toeic-shared"]);
    expect(res.cards[0]?.previews?.map((p) => p.rating)).toEqual([1, 2, 3, 4]);
    expect(res.nextDueFormatted).toBeUndefined();
  });

  it("excludes IT cards when Cram fallback triggers by selecting the IT notebookId with excludeDeck=it-vocab", async () => {
    const itCard = makeCardFixture({
      id: "card-it-nb",
      word: "deployment",
      meaning: "triển khai",
      notebookId: "nb-it",
      topic: "DevOps",
      due: "2099-05-10T08:00:00.000Z",
    });

    const mock = createMockSupabase({
      notebooks: DEFAULT_NOTEBOOKS,
      reviewCards: [itCard],
    });
    mockGetOptionalUser.mockResolvedValue({
      user: { id: "user-1" },
      supabase: mock.supabase,
    });

    const res = await getReviewCardsAction({
      notebookId: "nb-it",
      limit: 15,
      studyAll: false,
      excludeDeck: "it-vocab",
    });

    expect(res.cards).toEqual([]);
    expect(res.totalCardsCount).toBe(0);
    expect(res.nextDueFormatted).toBeUndefined();
  });

  it("ignores earlier due dates from excluded IT cards in the upcoming-date query", async () => {
    const itDueIso = "2099-03-10T02:00:00.000Z";
    const toeicDueIso = "2099-06-15T10:30:00.000Z";

    const expectedToeicDue = new Date(toeicDueIso).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    const unexpectedItDue = new Date(itDueIso).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const mock = createMockSupabase({
      notebooks: DEFAULT_NOTEBOOKS,
      reviewCards: [
        makeCardFixture({
          id: "card-it-soon",
          word: "webhook",
          meaning: "cổng gọi lại",
          notebookId: "nb-it",
          topic: "API",
          due: itDueIso,
        }),
        makeCardFixture({
          id: "card-toeic-later",
          word: "invoice",
          meaning: "hóa đơn",
          notebookId: "nb-toeic",
          topic: "Accounting",
          due: toeicDueIso,
        }),
      ],
    });
    mockGetOptionalUser.mockResolvedValue({
      user: { id: "user-1" },
      supabase: mock.supabase,
    });

    const res = await getReviewCardsAction({
      limit: 15,
      studyAll: false,
      excludeDeck: "it-vocab",
    });

    expect(res.cards).toEqual([]);
    expect(res.totalCardsCount).toBe(1);
    expect(res.nextDueFormatted).toBe(expectedToeicDue);
    expect(res.nextDueFormatted).not.toBe(unexpectedItDue);
  });

  it("returns IT cards normally during topic cram fallback when excludeDeck is not set", async () => {
    const itCard = makeCardFixture({
      id: "card-it-opt-in",
      word: "endpoint",
      meaning: "điểm cuối API",
      notebookId: "nb-it",
      topic: "API",
      due: "2099-05-10T08:00:00.000Z",
    });

    const mock = createMockSupabase({
      notebooks: DEFAULT_NOTEBOOKS,
      reviewCards: [itCard],
    });
    mockGetOptionalUser.mockResolvedValue({
      user: { id: "user-1" },
      supabase: mock.supabase,
    });

    const res = await getReviewCardsAction({
      topic: "API",
      limit: 15,
      studyAll: false,
    });

    expect(res.cards.map((c) => c.id)).toEqual(["card-it-opt-in"]);
    expect(res.cards[0]?.previews?.map((p) => p.rating)).toEqual([1, 2, 3, 4]);
    const hasNeq = mock.recordedQueries.some((q) =>
      q.filters.some((f) => f.op === "neq" && f.column === "vocab_entries.notebook_id")
    );
    expect(hasNeq).toBe(false);
  });
});
