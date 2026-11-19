/**
 * Kiểu dữ liệu và hàm tách đoạn đánh dấu trọng tâm ngữ pháp thuần túy.
 * Tách riêng khỏi bản đồ `LESSON_EXAMPLE_HIGHLIGHTS` để client bundle gọn nhẹ.
 */

export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

/**
 * Tách câu văn bản thành các đoạn thường và đoạn được gạch chân / tô sáng
 * không chồng lấn, ưu tiên khớp cụm dài trước và khớp theo vị trí đầu tiên hợp lệ.
 */
export function splitTextWithHighlights(
  text: string,
  highlights: string[]
): HighlightSegment[] {
  if (!text || highlights.length === 0) {
    return text ? [{ text, highlighted: false }] : [];
  }

  // Sắp xếp cụm dài hơn trước để tránh cụm ngắn cắt ngang cụm dài
  const sortedPhrases = Array.from(
    new Set(highlights.map((h) => h.trim()).filter(Boolean))
  ).sort((a, b) => b.length - a.length);

  interface Span {
    start: number;
    end: number;
  }

  const spans: Span[] = [];

  for (const phrase of sortedPhrases) {
    let searchFrom = 0;
    while (searchFrom < text.length) {
      const idx = text.indexOf(phrase, searchFrom);
      if (idx === -1) break;
      const end = idx + phrase.length;

      const overlaps = spans.some(
        (existing) => idx < existing.end && end > existing.start
      );
      if (!overlaps) {
        spans.push({ start: idx, end });
        break; // Mỗi cụm mục tiêu đánh dấu một lần tiêu biểu nhất trong ví dụ
      }
      searchFrom = idx + 1;
    }
  }

  if (spans.length === 0) {
    return [{ text, highlighted: false }];
  }

  spans.sort((a, b) => a.start - b.start);

  const segments: HighlightSegment[] = [];
  let cursor = 0;

  for (const span of spans) {
    if (span.start > cursor) {
      segments.push({
        text: text.slice(cursor, span.start),
        highlighted: false,
      });
    }
    segments.push({
      text: text.slice(span.start, span.end),
      highlighted: true,
    });
    cursor = span.end;
  }

  if (cursor < text.length) {
    segments.push({
      text: text.slice(cursor),
      highlighted: false,
    });
  }

  return segments;
}
