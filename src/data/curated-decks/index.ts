import essential600Data from "./essential-600-words.json";
import etsVocabData from "./ets-part5-vocab.json";
import commonIdiomsData from "./common-toeic-idioms.json";
import itVocabData from "./it-vocab.json";

export interface CuratedVocabItem {
  word: string;
  part_of_speech: string;
  meaning: string;
  phonetic: string;
  explanation: string;
  example: string;
  example_translation: string;
  image_url?: string;
  audio_url?: string;
  topic: string;
}

export interface CuratedDeckMeta {
  id: string;
  title: string;
  englishTitle: string;
  subtitle: string;
  description: string;
  totalCards: number;
  badge: string;
  badgeType: "primary" | "pro" | "accent";
  color: string;
  icon: "book" | "sparkles" | "award" | "code";
  items: CuratedVocabItem[];
}

export const CURATED_DECKS: CuratedDeckMeta[] = [
  {
    id: "essential-600",
    title: "600 từ vựng thiết yếu cho TOEIC",
    englishTitle: "600 ESSENTIAL WORDS for the TOEIC",
    subtitle: "Master Vocabulary for Success",
    description: "Trọn bộ 615 từ vựng nền tảng theo 50 chủ đề kinh doanh, công sở kinh điển (Contracts, Marketing, Warranties, Salaries...). Kèm phiên âm IPA và ví dụ song ngữ.",
    totalCards: essential600Data.length,
    badge: "PHỔ BIẾN NHẤT",
    badgeType: "primary",
    color: "#2563EB",
    icon: "book",
    items: essential600Data as CuratedVocabItem[],
  },
  {
    id: "ets-vocab",
    title: "Từ vựng ETS TOEIC Part 5",
    englishTitle: "ETS TOEIC High-Frequency Vocabulary",
    subtitle: "Build Your Advanced English Foundation",
    description: "Tuyển tập các từ vựng xuất hiện tần suất cao nhất trong đề thi ETS (ETS 2020 - 2024), trọng tâm vào các bẫy từ loại và ngữ cảnh Part 5 & 6.",
    totalCards: etsVocabData.length,
    badge: "ĐỀ THI THẬT",
    badgeType: "pro",
    color: "#0F172A",
    icon: "award",
    items: etsVocabData as CuratedVocabItem[],
  },
  {
    id: "common-idioms",
    title: "Thành Ngữ & Cụm Từ TOEIC Phổ Biến",
    englishTitle: "Common TOEIC Idioms & Collocations",
    subtitle: "Master Figurative Language & Boost Band Score",
    description: "Bộ cụm động từ (Phrasal Verbs) và thành ngữ công sở (Business Collocations) ăn điểm nhất trong đề thi TOEIC để làm nhanh các câu Part 5 & 7.",
    totalCards: commonIdiomsData.length,
    badge: "BỨT PHÁ ĐIỂM",
    badgeType: "accent",
    color: "#047857",
    icon: "sparkles",
    items: commonIdiomsData as CuratedVocabItem[],
  },
  {
    id: "it-vocab",
    title: "Từ vựng Tiếng Anh IT & Công Nghệ",
    englishTitle: "English for Information Technology",
    subtitle: "Tech Vocabulary & Coding Collocations",
    description: "Bộ 778 từ vựng tiếng Anh chuyên ngành CNTT, lập trình, mạng, an ninh mạng và quản lý dự án phần mềm. Tối ưu cho sinh viên IT & kỹ sư công nghệ thi TOEIC.",
    totalCards: itVocabData.length,
    badge: "DÀNH CHO DÂN IT",
    badgeType: "accent",
    color: "#4338CA",
    icon: "code",
    items: itVocabData as CuratedVocabItem[],
  },
];

export function getCuratedDeckById(id: string): CuratedDeckMeta | undefined {
  return CURATED_DECKS.find((d) => d.id === id);
}
