import type { WordFamilyMember } from "@/features/vocab/types";
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
  word_families?: WordFamilyMember[];
  collocations?: string[];
  synonyms?: string[];
  usage_note?: string;
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
    description:
      "Trọn bộ 615 từ vựng nền tảng theo 50 chủ đề kinh doanh, công sở kinh điển (Contracts, Marketing, Warranties, Salaries...). Kèm phiên âm IPA và ví dụ song ngữ.",
    totalCards: essential600Data.length,
    badge: "PHỔ BIẾN NHẤT",
    badgeType: "primary",
    color: "#2563EB",
    icon: "book",
    items: essential600Data as CuratedVocabItem[],
  },
  {
    id: "ets-vocab",
    title: "Từ vựng ETS TOEIC",
    englishTitle: "ETS TOEIC Vocabulary (1.700+ Words)",
    subtitle: "Build Your Advanced English Foundation",
    description:
      "Kho 1.700+ từ vựng then chốt xuất hiện liên tục trong đề thi ETS (ETS 2020 - 2026), trọng tâm vào từ loại và ngữ cảnh thương mại thực chiến.",
    totalCards: etsVocabData.length,
    badge: "ĐỀ THI THẬT",
    badgeType: "pro",
    color: "#0F172A",
    icon: "award",
    items: etsVocabData as CuratedVocabItem[],
  },
  {
    id: "common-idioms",
    title: "Thành Ngữ TOEIC Phổ Biến",
    englishTitle: "Common TOEIC Idioms & Collocations (114 Idioms)",
    subtitle: "Master Figurative Language & Boost Band Score",
    description:
      "114 thành ngữ và cụm động từ công sở điểm 800+ xuất hiện trong Part 3, 4, 7 để làm nhanh các câu hỏi ngữ cảnh.",
    totalCards: commonIdiomsData.length,
    badge: "MỤC TIÊU 800+",
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
    description:
      "Bộ 778 từ vựng tiếng Anh chuyên ngành CNTT, lập trình, mạng, an ninh mạng và quản lý dự án phần mềm. Tối ưu cho sinh viên IT & kỹ sư công nghệ thi TOEIC.",
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
