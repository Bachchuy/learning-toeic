/**
 * Logic cốt lõi xử lý văn bản đọc hiểu Part 6 & Part 7 (Passages Core Engine)
 */

import type { PassageType } from "@/features/reading/types";

export interface TextToken {
  type: "text";
  value: string;
}

export interface BlankToken {
  type: "blank";
  blankIndex: number; // Ví dụ: 131, 132, 133, 134 hoặc 1, 2, 3, 4
  rawText: string;
}

export type PassageToken = TextToken | BlankToken;

/**
 * Phân tích đoạn văn Part 6 thành chuỗi các Token văn bản và Token chỗ đục lỗ
 * Cho phép UI hiển thị các ô đục lỗ tương tác trực tiếp trong đoạn văn.
 */
export function tokenizePart6Content(content: string): PassageToken[] {
  if (!content) return [];
  const regex = /\[(\d+)\]/g;
  const tokens: PassageToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        value: content.slice(lastIndex, match.index),
      });
    }
    tokens.push({
      type: "blank",
      blankIndex: parseInt(match[1], 10),
      rawText: match[0],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    tokens.push({
      type: "text",
      value: content.slice(lastIndex),
    });
  }

  return tokens;
}

/**
 * Trả về nhãn tiếng Việt chuẩn học thuật cho từng thể loại bài đọc TOEIC
 */
export function getPassageTypeLabel(type: PassageType): string {
  switch (type) {
    case "email":
      return "Thư điện tử (E-mail)";
    case "memo":
      return "Thông báo nội bộ (Memorandum)";
    case "notice":
      return "Thông cáo công khai (Notice)";
    case "article":
      return "Bài báo thời sự (Article)";
    case "advertisement":
      return "Mục quảng cáo (Advertisement)";
    case "letter":
      return "Thư thương mại (Business Letter)";
    case "form":
      return "Biểu mẫu / Hóa đơn (Form / Invoice)";
    case "schedule":
      return "Lịch trình / Chương trình nghị sự (Schedule)";
    case "chat":
      return "Đoạn trò chuyện trực tuyến (Chat Discussion)";
    case "multi_passage":
      return "Bộ đoạn kép / ba (Multiple Passages)";
    default:
      return "Bài đọc hiểu";
  }
}

/**
 * Trả về class màu sắc theo Token chuẩn WCAG cho từng thể loại bài đọc
 */
export function getPassageTypeBadgeClass(type: PassageType): string {
  switch (type) {
    case "email":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "memo":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "notice":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "article":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "advertisement":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "letter":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}
