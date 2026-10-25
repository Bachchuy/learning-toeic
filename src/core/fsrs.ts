import {
  fsrs,
  generatorParameters,
  Rating,
  type Grade,
  type Card,
  type RecordLogItem,
  createEmptyCard,
} from "ts-fsrs";

export interface DBCardRow {
  id: string;
  user_id: string;
  vocab_entry_id: string;
  state: number; // 0=New, 1=Learning, 2=Review, 3=Relearning
  stability: number;
  difficulty: number;
  due: string | Date;
  last_review?: string | Date | null;
  reps: number;
  lapses: number;
}

export interface RatingPreview {
  rating: 1 | 2 | 3 | 4;
  ratingLabel: string;
  intervalText: string;
  due: Date;
}

/**
 * Khởi tạo engine FSRS với cấu hình chuẩn của hệ thống (§4.6b & D-24)
 * - request_retention = 0.9 (mức nhớ mục tiêu 90%)
 * - enable_fuzz = false (tắt rung ngẫu nhiên để kết quả ổn định và xác định khi kiểm thử)
 */
export function getFSRSEngine(enableFuzz: boolean = false) {
  const params = generatorParameters({
    request_retention: 0.9,
    enable_fuzz: enableFuzz,
  });
  return fsrs(params);
}

/**
 * Chuyển đổi dữ liệu thẻ từ cơ sở dữ liệu sang đối tượng Card của ts-fsrs
 */
export function dbCardToFSRSCard(row: DBCardRow): Card {
  const due = row.due instanceof Date ? row.due : new Date(row.due);
  const last_review = row.last_review
    ? row.last_review instanceof Date
      ? row.last_review
      : new Date(row.last_review)
    : undefined;

  const baseCard = createEmptyCard(due);

  return {
    ...baseCard,
    due,
    stability: Number(row.stability) || 0,
    difficulty: Number(row.difficulty) || 0,
    reps: Number(row.reps) || 0,
    lapses: Number(row.lapses) || 0,
    learning_steps: 0,
    state: row.state as 0 | 1 | 2 | 3,
    last_review,
  };
}

/**
 * Định dạng khoảng thời gian tương lai thành chuỗi tiếng Việt dễ hiểu
 * Ví dụ: "10 phút", "1 giờ", "1 ngày", "4 ngày" (§4.6b, D-03, D-22)
 */
export function formatFSRSInterval(now: Date, targetDue: Date): string {
  const diffMs = targetDue.getTime() - now.getTime();
  if (diffMs <= 0) return "Ngay bây giờ";

  const diffMinutes = Math.round(diffMs / (60 * 1000));
  if (diffMinutes < 60) {
    return `${Math.max(1, diffMinutes)} phút`;
  }

  const diffHours = Math.round(diffMs / (60 * 60 * 1000));
  if (diffHours < 24) {
    return `${diffHours} giờ`;
  }

  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays < 30) {
    return `${diffDays} ngày`;
  }

  const diffMonths = Math.round(diffDays / 30);
  return `${diffMonths} tháng`;
}

export const FSRS_RATING_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Lại (Again)",
  2: "Khó (Hard)",
  3: "Tốt (Good)",
  4: "Dễ (Easy)",
};

export const FSRS_SHORT_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Lại",
  2: "Khó",
  3: "Tốt",
  4: "Dễ",
};

/**
 * Xem trước khoảng thời gian và hạn ôn của 4 nút chấm (Again, Hard, Good, Easy)
 * Dùng trực tiếp hàm repeat() của ts-fsrs theo D-22 & D-24
 */
export function previewFSRSRatings(
  dbCard: DBCardRow,
  now: Date = new Date()
): RatingPreview[] {
  const f = getFSRSEngine(false);
  const card = dbCardToFSRSCard(dbCard);
  const repeatResults = f.repeat(card, now);

  const ratings: (1 | 2 | 3 | 4)[] = [
    Rating.Again as 1,
    Rating.Hard as 2,
    Rating.Good as 3,
    Rating.Easy as 4,
  ];

  return ratings.map((rating) => {
    const item: RecordLogItem = repeatResults[rating as Grade];
    const newDue = item.card.due;
    return {
      rating,
      ratingLabel: FSRS_SHORT_LABELS[rating],
      intervalText: formatFSRSInterval(now, newDue),
      due: newDue,
    };
  });
}

/**
 * Thực hiện chấm thẻ và tính toán trạng thái FSRS mới
 * Trả về dữ liệu để cập nhật bảng review_cards và ghi bản ghi vào card_reviews (§4.6b, D-23)
 */
export function calculateFSRSReview(
  dbCard: DBCardRow,
  rating: 1 | 2 | 3 | 4,
  now: Date = new Date()
) {
  const f = getFSRSEngine(false);
  const card = dbCardToFSRSCard(dbCard);
  const repeatResults = f.repeat(card, now);
  const result: RecordLogItem = repeatResults[rating as Grade];

  return {
    updatedCard: {
      state: result.card.state,
      stability: result.card.stability,
      difficulty: result.card.difficulty,
      due: result.card.due.toISOString(),
      last_review: now.toISOString(),
      reps: result.card.reps,
      lapses: result.card.lapses,
    },
    reviewLog: {
      card_id: dbCard.id,
      user_id: dbCard.user_id,
      rating,
      state_before: dbCard.state,
      stability_before: dbCard.stability,
      difficulty_before: dbCard.difficulty,
      reviewed_at: now.toISOString(),
    },
    nextDue: result.card.due,
  };
}
