"use client";

import { useState, useTransition, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { VocabEntry, Notebook } from "@/features/vocab/types";
import {
  getPosBadgeInfo,
  getPosCategory,
  getDualPronunciation,
  type PosCategory,
} from "@/core/vocab";
import { resolvePhonetic } from "@/core/phonetic";
import {
  updateVocabMeaningAction,
  deleteVocabAction,
  importCuratedDeckAction,
  type CuratedDeckStatus,
} from "@/features/vocab/actions";
import { VocabDetailModal } from "./vocab-detail-modal";
import { VocabCreateModal } from "./vocab-create-modal";
import { NotebookManagerModal } from "./notebook-manager-modal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioSpeakerButton } from "@/components/ui/audio-speaker-button";
import {
  Search,
  BookOpen,
  Sparkles,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  Plus,
  Folder,
  FolderPlus,
  Layers,
  ArrowRight,
  Loader2,
  Play,
  CheckCircle2,
  Flame,
  Library,
  LayoutGrid,
  BookOpenText,
  Truck,
  Factory,
  Building2,
  ShoppingBag,
  TrendingUp,
  Globe,
  Server,
  Code2,
  Database,
  CloudCog,
  Network,
  ShieldAlert,
  BrainCircuit,
  FileText,
  Megaphone,
  Users,
  Plane,
  Briefcase,
  HeartPulse,
  Headphones,
  Eye,
  EyeOff,
  TextQuote,
  Quote,
  GraduationCap,
  HelpCircle,
  Calculator,
  Landmark,
  Utensils,
  Mail,
  Receipt,
  FileCheck,
  Tags,
  Link2,
  Award,
  Lightbulb,
} from "lucide-react";

export interface TopicVisual {
  icon: React.ComponentType<{ className?: string }>;
  titleVi: string;
  badgeColor: string;
}

const TOPIC_EXACT_MAP: Record<string, TopicVisual> = {
  // 1. AI, Dữ liệu & Công nghệ
  "ai & machine learning": {
    icon: BrainCircuit,
    titleVi: "Trí tuệ nhân tạo & ML",
    badgeColor: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100",
  },
  "training & development": {
    icon: GraduationCap,
    titleVi: "Đào tạo & Phát triển",
    badgeColor: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
  "hiring and training": {
    icon: Users,
    titleVi: "Tuyển dụng & Đào tạo",
    badgeColor: "bg-purple-50 text-purple-600 border-purple-100",
  },
  "retail & products": {
    icon: ShoppingBag,
    titleVi: "Bán lẻ & Sản phẩm",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  "confusing pairs": {
    icon: HelpCircle,
    titleVi: "Cặp từ dễ gây nhầm lẫn",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
  },
  "airlines": {
    icon: Plane,
    titleVi: "Hàng không & Chuyến bay",
    badgeColor: "bg-sky-50 text-sky-600 border-sky-100",
  },
  "trains": {
    icon: Plane,
    titleVi: "Đường sắt & Tàu hỏa",
    badgeColor: "bg-sky-50 text-sky-600 border-sky-100",
  },
  "accounting": {
    icon: Calculator,
    titleVi: "Kế toán doanh nghiệp",
    badgeColor: "bg-teal-50 text-teal-600 border-teal-100",
  },
  "agile & scrum": {
    icon: Code2,
    titleVi: "Quy trình Agile & Scrum",
    badgeColor: "bg-sky-50 text-sky-600 border-sky-100",
  },
  "apply and interviewing": {
    icon: Users,
    titleVi: "Ứng tuyển & Phỏng vấn",
    badgeColor: "bg-violet-50 text-violet-600 border-violet-100",
  },
  "backend & architecture": {
    icon: Server,
    titleVi: "Hệ thống & Kiến trúc",
    badgeColor: "bg-violet-50 text-violet-600 border-violet-100",
  },
  "banking": {
    icon: Landmark,
    titleVi: "Ngân hàng & Tín dụng",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  "banking & investment": {
    icon: Landmark,
    titleVi: "Ngân hàng & Đầu tư",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  "board meeting & committees": {
    icon: Briefcase,
    titleVi: "Họp HĐQT & Ban điều hành",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
  },
  "business phrasal verbs & idioms": {
    icon: BookOpenText,
    titleVi: "Cụm từ & Thành ngữ KD",
    badgeColor: "bg-rose-50 text-rose-600 border-rose-100",
  },
  "business planning": {
    icon: TrendingUp,
    titleVi: "Kế hoạch kinh doanh",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
  },
  "car rentals": {
    icon: Plane,
    titleVi: "Thuê xe & Đi lại",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
  },
  "career & interviews": {
    icon: Users,
    titleVi: "Nghề nghiệp & Phỏng vấn",
    badgeColor: "bg-purple-50 text-purple-600 border-purple-100",
  },
  "clients & stakeholders": {
    icon: Users,
    titleVi: "Khách hàng & Cổ đông",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
  },
  "cloud & devops": {
    icon: CloudCog,
    titleVi: "Điện toán đám mây & DevOps",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
  },
  "code review & prs": {
    icon: Code2,
    titleVi: "Rà soát mã & Pull Request",
    badgeColor: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
  "community & environment": {
    icon: Globe,
    titleVi: "Cộng đồng & Môi trường",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  "computers and the internet": {
    icon: Globe,
    titleVi: "Máy tính & Internet",
    badgeColor: "bg-cyan-50 text-cyan-600 border-cyan-100",
  },
  "conference": {
    icon: Users,
    titleVi: "Hội nghị & Diễn đàn",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
  },
  "construction, real estate & facilities": {
    icon: Building2,
    titleVi: "Xây dựng & Bất động sản",
    badgeColor: "bg-orange-50 text-orange-600 border-orange-100",
  },
  "contracts": {
    icon: FileText,
    titleVi: "Hợp đồng thương mại",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  "cooking as a career": {
    icon: Utensils,
    titleVi: "Nghề bếp & Ẩm thực",
    badgeColor: "bg-orange-50 text-orange-600 border-orange-100",
  },
  "correspondence": {
    icon: Mail,
    titleVi: "Thư tín thương mại",
    badgeColor: "bg-sky-50 text-sky-600 border-sky-100",
  },
  "customer service": {
    icon: Headphones,
    titleVi: "Chăm sóc khách hàng",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  "databases & data": {
    icon: Database,
    titleVi: "Cơ sở dữ liệu & Dữ liệu",
    badgeColor: "bg-cyan-50 text-cyan-600 border-cyan-100",
  },
  "dentist's office": {
    icon: HeartPulse,
    titleVi: "Nha khoa & Răng hàm mặt",
    badgeColor: "bg-rose-50 text-rose-600 border-rose-100",
  },
  "doctor's office": {
    icon: HeartPulse,
    titleVi: "Phòng khám & Bác sĩ",
    badgeColor: "bg-rose-50 text-rose-600 border-rose-100",
  },
  "documentation & writing": {
    icon: FileText,
    titleVi: "Soạn thảo & Tài liệu kỹ thuật",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
  },
  "eating out": {
    icon: Utensils,
    titleVi: "Ẩm thực & Đi ăn ngoài",
    badgeColor: "bg-orange-50 text-orange-600 border-orange-100",
  },
  "economy & strategy": {
    icon: TrendingUp,
    titleVi: "Kinh tế & Chiến lược",
    badgeColor: "bg-teal-50 text-teal-600 border-teal-100",
  },
  "electronics": {
    icon: Globe,
    titleVi: "Thiết bị điện tử",
    badgeColor: "bg-cyan-50 text-cyan-600 border-cyan-100",
  },
  "events": {
    icon: Users,
    titleVi: "Sự kiện & Hội thảo",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
  },
  "events & conferences": {
    icon: Users,
    titleVi: "Sự kiện & Hội nghị",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
  },
  "finance & accounting": {
    icon: Calculator,
    titleVi: "Tài chính & Kế toán",
    badgeColor: "bg-teal-50 text-teal-600 border-teal-100",
  },
  "financial statements": {
    icon: Calculator,
    titleVi: "Báo cáo tài chính",
    badgeColor: "bg-teal-50 text-teal-600 border-teal-100",
  },
  "general travel": {
    icon: Plane,
    titleVi: "Du lịch tổng quan",
    badgeColor: "bg-sky-50 text-sky-600 border-sky-100",
  },
  "hr & recruitment": {
    icon: Users,
    titleVi: "Nhân sự & Tuyển dụng",
    badgeColor: "bg-purple-50 text-purple-600 border-purple-100",
  },
  "health": {
    icon: HeartPulse,
    titleVi: "Sức khỏe & Đời sống",
    badgeColor: "bg-rose-50 text-rose-600 border-rose-100",
  },
  "health & medical": {
    icon: HeartPulse,
    titleVi: "Y tế & Chăm sóc sức khỏe",
    badgeColor: "bg-rose-50 text-rose-600 border-rose-100",
  },
  "hospitals": {
    icon: HeartPulse,
    titleVi: "Bệnh viện & Điều trị",
    badgeColor: "bg-rose-50 text-rose-600 border-rose-100",
  },
  "hotels": {
    icon: Building2,
    titleVi: "Khách sạn & Lưu trú",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
  },
  "hotels & dining": {
    icon: Utensils,
    titleVi: "Khách sạn & Nhà hàng",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
  },
  "incidents & on-call": {
    icon: ShieldAlert,
    titleVi: "Sự cố hệ thống & Trực nhật",
    badgeColor: "bg-rose-50 text-rose-600 border-rose-100",
  },
  "inventory": {
    icon: ShoppingBag,
    titleVi: "Quản lý tồn kho & Kho bãi",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
  },
  "investment": {
    icon: TrendingUp,
    titleVi: "Đầu tư tài chính",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  "invoice": {
    icon: Receipt,
    titleVi: "Hóa đơn & Chứng từ",
    badgeColor: "bg-teal-50 text-teal-600 border-teal-100",
  },
  "job ads & recruitment": {
    icon: Users,
    titleVi: "Tuyển dụng & Tuyển mộ",
    badgeColor: "bg-purple-50 text-purple-600 border-purple-100",
  },
  "legal & contracts": {
    icon: FileText,
    titleVi: "Pháp lý & Hợp đồng",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  "logistics & shipping": {
    icon: Truck,
    titleVi: "Vận tải & Giao nhận",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
  },
  "management & corporate": {
    icon: Briefcase,
    titleVi: "Quản trị & Doanh nghiệp",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
  },
  "manufacturing & quality": {
    icon: Factory,
    titleVi: "Sản xuất & Chất lượng",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
  },
  "marketing": {
    icon: Megaphone,
    titleVi: "Tiếp thị & Thị trường",
    badgeColor: "bg-pink-50 text-pink-600 border-pink-100",
  },
  "marketing & advertising": {
    icon: Megaphone,
    titleVi: "Tiếp thị & Quảng cáo",
    badgeColor: "bg-pink-50 text-pink-600 border-pink-100",
  },
  "media": {
    icon: Megaphone,
    titleVi: "Truyền thông & Báo chí",
    badgeColor: "bg-pink-50 text-pink-600 border-pink-100",
  },
  "meetings & stand-ups": {
    icon: Users,
    titleVi: "Họp nhóm & Stand-up",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
  },
  "movies": {
    icon: Sparkles,
    titleVi: "Điện ảnh & Chiếu phim",
    badgeColor: "bg-purple-50 text-purple-600 border-purple-100",
  },
  "museums": {
    icon: Landmark,
    titleVi: "Bảo tàng & Triển lãm",
    badgeColor: "bg-purple-50 text-purple-600 border-purple-100",
  },
  "music": {
    icon: Sparkles,
    titleVi: "Âm nhạc & Nghệ thuật",
    badgeColor: "bg-purple-50 text-purple-600 border-purple-100",
  },
  "networking & systems": {
    icon: Network,
    titleVi: "Mạng & Hạ tầng hệ thống",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
  },
  "office & admin": {
    icon: Briefcase,
    titleVi: "Hành chính & Văn phòng",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
  },
  "office procedures": {
    icon: FileText,
    titleVi: "Quy trình nội bộ văn phòng",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
  },
  "office technology": {
    icon: Globe,
    titleVi: "Công nghệ văn phòng",
    badgeColor: "bg-cyan-50 text-cyan-600 border-cyan-100",
  },
  "ordering lunch": {
    icon: Utensils,
    titleVi: "Đặt cơm trưa & Ăn uống",
    badgeColor: "bg-orange-50 text-orange-600 border-orange-100",
  },
  "ordering supplies": {
    icon: ShoppingBag,
    titleVi: "Đặt mua văn phòng phẩm",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
  },
  "part 5 adjectives": {
    icon: Tags,
    titleVi: "Tính từ TOEIC Part 5",
    badgeColor: "bg-violet-50 text-violet-600 border-violet-100",
  },
  "part 5 adverbs": {
    icon: Tags,
    titleVi: "Trạng từ TOEIC Part 5",
    badgeColor: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
  "part 5 verbs": {
    icon: Tags,
    titleVi: "Động từ TOEIC Part 5",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
  },
  "pharmacy": {
    icon: HeartPulse,
    titleVi: "Hiệu thuốc & Dược phẩm",
    badgeColor: "bg-rose-50 text-rose-600 border-rose-100",
  },
  "prepositions & connectors": {
    icon: Link2,
    titleVi: "Giới từ & Liên từ nối",
    badgeColor: "bg-cyan-50 text-cyan-600 border-cyan-100",
  },
  "procurement & suppliers": {
    icon: ShoppingBag,
    titleVi: "Thu mua & Nhà cung cấp",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  "product & ux": {
    icon: Layers,
    titleVi: "Sản phẩm & Trải nghiệm (UX)",
    badgeColor: "bg-sky-50 text-sky-600 border-sky-100",
  },
  "product development": {
    icon: Layers,
    titleVi: "Nghiên cứu & Phát triển SP",
    badgeColor: "bg-sky-50 text-sky-600 border-sky-100",
  },
  "programming & software design": {
    icon: Code2,
    titleVi: "Lập trình & Thiết kế PM",
    badgeColor: "bg-sky-50 text-sky-600 border-sky-100",
  },
  "project management": {
    icon: Briefcase,
    titleVi: "Quản lý dự án",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
  },
  "promotions, pensions & award": {
    icon: Award,
    titleVi: "Thăng chức & Khen thưởng",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
  },
  "property & departments": {
    icon: Building2,
    titleVi: "Bất động sản & Phòng ban",
    badgeColor: "bg-orange-50 text-orange-600 border-orange-100",
  },
  "quality control": {
    icon: FileCheck,
    titleVi: "Kiểm soát chất lượng",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
  },
  "renting and leasing": {
    icon: Building2,
    titleVi: "Thuê & Cho thuê cơ sở",
    badgeColor: "bg-orange-50 text-orange-600 border-orange-100",
  },
  "salaries & benefits": {
    icon: Landmark,
    titleVi: "Lương bổng & Phúc lợi",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  "sales & negotiation": {
    icon: TrendingUp,
    titleVi: "Bán hàng & Đàm phán",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  "security": {
    icon: ShieldAlert,
    titleVi: "An toàn & Bảo mật thông tin",
    badgeColor: "bg-rose-50 text-rose-600 border-rose-100",
  },
  "selecting a restaurant": {
    icon: Utensils,
    titleVi: "Chọn lựa nhà hàng",
    badgeColor: "bg-orange-50 text-orange-600 border-orange-100",
  },
  "shipping": {
    icon: Truck,
    titleVi: "Vận chuyển hàng hóa",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
  },
  "shopping": {
    icon: ShoppingBag,
    titleVi: "Mua sắm thương mại",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  "tax, insurance & payments": {
    icon: Receipt,
    titleVi: "Thuế, Bảo hiểm & Chi trả",
    badgeColor: "bg-teal-50 text-teal-600 border-teal-100",
  },
  "taxes": {
    icon: Receipt,
    titleVi: "Thuế & Nghĩa vụ thuế",
    badgeColor: "bg-teal-50 text-teal-600 border-teal-100",
  },
  "testing & qa": {
    icon: FileCheck,
    titleVi: "Kiểm thử phần mềm (QA)",
    badgeColor: "bg-teal-50 text-teal-600 border-teal-100",
  },
  "theater": {
    icon: Sparkles,
    titleVi: "Sân khấu kịch nghệ",
    badgeColor: "bg-purple-50 text-purple-600 border-purple-100",
  },
  "travel & transportation": {
    icon: Plane,
    titleVi: "Du lịch & Giao thông",
    badgeColor: "bg-sky-50 text-sky-600 border-sky-100",
  },
  "unit 1: meetings & negotiations": {
    icon: Briefcase,
    titleVi: "Unit 1: Họp hành & Đàm phán",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
  },
  "unit 2: work & progress": {
    icon: Briefcase,
    titleVi: "Unit 2: Công việc & Tiến độ",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
  },
  "unit 3: office communication": {
    icon: Mail,
    titleVi: "Unit 3: Giao tiếp văn phòng",
    badgeColor: "bg-sky-50 text-sky-600 border-sky-100",
  },
  "unit 4: commerce & finance": {
    icon: Landmark,
    titleVi: "Unit 4: Thương mại & Tài chính",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  "unit 5: problem solving & decisions": {
    icon: Lightbulb,
    titleVi: "Unit 5: Giải quyết vấn đề",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
  },
  "unit 6: advanced workplace idioms": {
    icon: BookOpenText,
    titleVi: "Unit 6: Thành ngữ công sở",
    badgeColor: "bg-rose-50 text-rose-600 border-rose-100",
  },
  "warranties": {
    icon: Award,
    titleVi: "Bảo hành & Cam kết",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
  },
  "web, frontend & apis": {
    icon: Globe,
    titleVi: "Giao diện Web & API",
    badgeColor: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
};

/**
 * Hàm helper tự động gán Icon, Tên tiếng Việt phụ đề và Màu sắc Pastel cho từng Thẻ Chủ Điểm
 */
export function getTopicVisuals(topicName: string): TopicVisual {
  const norm = topicName.trim().toLowerCase();

  // 1. Kiểm tra bảng tra cứu tuyệt đối (Khớp 100% toàn bộ chủ điểm có trong hệ thống)
  if (TOPIC_EXACT_MAP[norm]) {
    return TOPIC_EXACT_MAP[norm];
  }

  // 2. Fallback nhận diện thông minh bằng từ khóa nguyên vẹn (word boundary regex), tránh trùng lặp substring
  if (/\b(ai|trí tuệ nhân tạo|machine learning|deep learning)\b/i.test(norm)) {
    return {
      icon: BrainCircuit,
      titleVi: "Trí tuệ nhân tạo & ML",
      badgeColor: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100",
    };
  }

  if (/\b(training|đào tạo|huấn luyện|instruction|education)\b/i.test(norm)) {
    return {
      icon: GraduationCap,
      titleVi: "Đào tạo & Phát triển",
      badgeColor: "bg-indigo-50 text-indigo-600 border-indigo-100",
    };
  }

  if (/\b(retail|bán lẻ|store|cửa hàng|shopping|mua sắm)\b/i.test(norm)) {
    return {
      icon: ShoppingBag,
      titleVi: "Bán lẻ & Sản phẩm",
      badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
    };
  }

  if (/\b(confusing|nhầm lẫn|tránh nhầm|pairs)\b/i.test(norm)) {
    return {
      icon: HelpCircle,
      titleVi: "Cặp từ dễ gây nhầm lẫn",
      badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
    };
  }

  if (/\b(logistic|shipping|vận tải|kho vận|giao nhận|freight)\b/i.test(norm)) {
    return {
      icon: Truck,
      titleVi: "Vận tải & Giao nhận",
      badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
    };
  }

  if (/\b(manufactur|sản xuất|chế tạo|nhà máy|factory)\b/i.test(norm)) {
    return {
      icon: Factory,
      titleVi: "Sản xuất & Chất lượng",
      badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
    };
  }

  if (/\b(construct|xây dựng|real estate|bất động sản|facility|cơ sở)\b/i.test(norm)) {
    return {
      icon: Building2,
      titleVi: "Xây dựng & Bất động sản",
      badgeColor: "bg-orange-50 text-orange-600 border-orange-100",
    };
  }

  if (/\b(procure|purchas|thu mua|đấu thầu|nhà cung cấp)\b/i.test(norm)) {
    return {
      icon: ShoppingBag,
      titleVi: "Thu mua & Đấu thầu",
      badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
    };
  }

  if (/\b(financ|econom|tài chính|kinh tế|ngân hàng|bank|đầu tư|invest)\b/i.test(norm)) {
    return {
      icon: TrendingUp,
      titleVi: "Tài chính & Kinh tế",
      badgeColor: "bg-teal-50 text-teal-600 border-teal-100",
    };
  }

  if (/\b(contract|hợp đồng|pháp lý|legal|thỏa thuận)\b/i.test(norm)) {
    return {
      icon: FileText,
      titleVi: "Hợp đồng & Pháp lý",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  if (/\b(market|advertis|tiếp thị|quảng cáo|media|truyền thông)\b/i.test(norm)) {
    return {
      icon: Megaphone,
      titleVi: "Tiếp thị & Quảng cáo",
      badgeColor: "bg-pink-50 text-pink-600 border-pink-100",
    };
  }

  if (/\b(hr|human resources|nhân sự|tuyển dụng|recruit|hiring)\b/i.test(norm)) {
    return {
      icon: Users,
      titleVi: "Nhân sự & Tuyển dụng",
      badgeColor: "bg-purple-50 text-purple-600 border-purple-100",
    };
  }

  if (/\b(travel|tour|du lịch|hotel|khách sạn|flight|airline|hàng không|công tác)\b/i.test(norm)) {
    return {
      icon: Plane,
      titleVi: "Du lịch & Công tác",
      badgeColor: "bg-sky-50 text-sky-600 border-sky-100",
    };
  }

  if (/\b(health|medic|y tế|sức khỏe|bệnh viện|hospital|clinic|phòng khám)\b/i.test(norm)) {
    return {
      icon: HeartPulse,
      titleVi: "Y tế & Sức khỏe",
      badgeColor: "bg-rose-50 text-rose-600 border-rose-100",
    };
  }

  if (/\b(customer|khách hàng|client|dịch vụ|chăm sóc|support|hỗ trợ)\b/i.test(norm)) {
    return {
      icon: Headphones,
      titleVi: "Dịch vụ khách hàng",
      badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
    };
  }

  // Mặc định cho các chủ điểm tự do chưa định nghĩa
  return {
    icon: BookOpen,
    titleVi: topicName,
    badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
  };
}

interface VocabListViewProps {
  initialEntries: VocabEntry[];
  initialDueCount?: number;
  initialNotebooks?: Notebook[];
  initialCuratedDecks?: CuratedDeckStatus[];
}

export function VocabListView({
  initialEntries,
  initialNotebooks = [],
  initialCuratedDecks = [],
}: VocabListViewProps) {
  const router = useRouter();
  // State quản lý tab nội tuyến (Inline Tab View)
  const [activeMainTab, setActiveMainTab] = useState<"my-vocab" | "standard-decks">("my-vocab");
  // State quản lý 2 chế độ xem trong tab "Sổ của tôi": Kệ sổ (shelf) vs Danh sách từ (words)
  const [viewMode, setViewMode] = useState<"shelf" | "words">("shelf");
  const [entries, setEntries] = useState<VocabEntry[]>(initialEntries);
  const [notebooks, setNotebooks] = useState<Notebook[]>(initialNotebooks);
  const [curatedDecks, setCuratedDecks] = useState<CuratedDeckStatus[]>(initialCuratedDecks);
  const [importingDeckId, setImportingDeckId] = useState<string | null>(null);

  const [selectedNotebookFilter, setSelectedNotebookFilter] = useState<string | null>(null);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNotebookManagerOpen, setIsNotebookManagerOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "due">("all");
  const [selectedPosFilter, setSelectedPosFilter] = useState<"all" | PosCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMeaning, setEditMeaning] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedDetailEntry, setSelectedDetailEntry] = useState<VocabEntry | null>(null);
  const [currentTime] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();

  // Hai công tắc tiện ích học tập trong danh sách từ
  // Công tắc 1: Che nghĩa tiếng Việt để tự nhớ (Flashcard mode trên danh sách)
  const [hideMeanings, setHideMeanings] = useState(false);
  // Công tắc 2: Hiện / ẩn câu ví dụ ngữ cảnh
  const [showExamples, setShowExamples] = useState(true);
  // Tập hợp các ID thẻ từ đã được bấm mở nghĩa khi đang ở chế độ Che nghĩa
  const [revealedCardIds, setRevealedCardIds] = useState<Set<string>>(() => new Set<string>());

  // Đếm số lượng thẻ đến hạn thực tế
  const dueCount = useMemo(() => {
    return entries.filter(
      (e) => e.card?.due && new Date(e.card.due).getTime() <= currentTime
    ).length;
  }, [entries, currentTime]);

  // Tổng số thẻ trong toàn bộ kho thẻ chuẩn
  const totalCuratedCards = useMemo(() => {
    return curatedDecks.reduce((sum, d) => sum + d.deck.totalCards, 0);
  }, [curatedDecks]);

  // Đếm số lượng theo từng loại từ: Danh · Động · Tính · Trạng · Cụm từ (Hỗ trợ từ loại kép)
  const posCounts = useMemo(() => {
    const counts = { noun: 0, verb: 0, adjective: 0, adverb: 0, phrase: 0 };
    for (const item of entries) {
      const cat = getPosCategory(item.part_of_speech, item.meaning, item.word);
      if (cat === "noun_verb") {
        counts.noun++;
        counts.verb++;
      } else if (cat === "noun_adj") {
        counts.noun++;
        counts.adjective++;
      } else if (cat === "adj_adv") {
        counts.adjective++;
        counts.adverb++;
      } else if (cat in counts) {
        counts[cat as keyof typeof counts]++;
      }
    }
    return counts;
  }, [entries]);

  // Danh sách chủ điểm (Topics) có sẵn trong sổ từ
  const availableTopics = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) {
      const t = e.metadata?.topic?.trim();
      if (t) {
        map.set(t, (map.get(t) || 0) + 1);
      }
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [entries]);

  // Tổng số mục trên Kệ sổ & Chủ điểm
  const shelfCount = useMemo(() => {
    const count = notebooks.length + availableTopics.length;
    return count > 0 ? count : (entries.length > 0 ? 1 : 0);
  }, [notebooks.length, availableTopics.length, entries.length]);

  // Tiêu đề của sổ/chủ điểm đang được lọc
  const activeFilteredTitle = useMemo(() => {
    if (selectedNotebookFilter) {
      const nb = notebooks.find((n) => n.id === selectedNotebookFilter);
      return nb ? nb.name : "Sổ cá nhân";
    }
    if (selectedTopicFilter) {
      return selectedTopicFilter;
    }
    return "Tất cả từ vựng";
  }, [selectedNotebookFilter, selectedTopicFilter, notebooks]);

  // Đường dẫn ôn tập của sổ/chủ điểm đang được lọc
  const activeFilteredReviewUrl = useMemo(() => {
    if (selectedNotebookFilter) {
      return `/review?notebookId=${selectedNotebookFilter}`;
    }
    if (selectedTopicFilter) {
      return `/review?topic=${encodeURIComponent(selectedTopicFilter)}&limit=15`;
    }
    return `/review?limit=15`;
  }, [selectedNotebookFilter, selectedTopicFilter]);

  // Hàm tính số thẻ đến hạn trong 1 chủ điểm
  const getTopicDueCount = (topicName: string) => {
    return entries.filter(
      (e) =>
        e.metadata?.topic?.trim() === topicName &&
        e.card?.due &&
        new Date(e.card.due).getTime() <= currentTime
    ).length;
  };

  // Hàm tính số thẻ đến hạn trong 1 sổ tự tạo
  const getNotebookDueCount = (notebookId: string) => {
    return entries.filter(
      (e) =>
        e.notebook_id === notebookId &&
        e.card?.due &&
        new Date(e.card.due).getTime() <= currentTime
    ).length;
  };

  // Lọc theo search, tab, từ loại, sổ tự tạo và chủ điểm
  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      // 0. Lọc theo Sổ từ vựng tự tạo
      if (selectedNotebookFilter !== null) {
        if (item.notebook_id !== selectedNotebookFilter) {
          return false;
        }
      }

      // 0b. Lọc theo Chủ điểm chuyên đề
      if (selectedTopicFilter !== null) {
        if (item.metadata?.topic?.trim() !== selectedTopicFilter) {
          return false;
        }
      }

      // 1. Lọc theo tab Đến hạn / Tất cả
      if (filterTab === "due") {
        if (!item.card?.due || new Date(item.card.due).getTime() > currentTime) {
          return false;
        }
      }

      // 2. Lọc theo phân loại từ loại: danh, động, tính, trạng, cụm từ (bao gồm từ loại kép)
      if (selectedPosFilter !== "all") {
        const itemCategory = getPosCategory(item.part_of_speech, item.meaning, item.word);
        if (selectedPosFilter === "noun") {
          if (
            itemCategory !== "noun" &&
            itemCategory !== "noun_verb" &&
            itemCategory !== "noun_adj"
          ) {
            return false;
          }
        } else if (selectedPosFilter === "verb") {
          if (itemCategory !== "verb" && itemCategory !== "noun_verb") {
            return false;
          }
        } else if (selectedPosFilter === "adjective") {
          if (
            itemCategory !== "adjective" &&
            itemCategory !== "noun_adj" &&
            itemCategory !== "adj_adv"
          ) {
            return false;
          }
        } else if (selectedPosFilter === "adverb") {
          if (itemCategory !== "adverb" && itemCategory !== "adj_adv") {
            return false;
          }
        } else if (itemCategory !== selectedPosFilter) {
          return false;
        }
      }

      // 3. Lọc theo từ khóa tìm kiếm
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchWord = item.word.toLowerCase().includes(q);
        const matchMeaning = item.meaning.toLowerCase().includes(q);
        const matchContext = item.context_sentence.toLowerCase().includes(q);
        const matchPOS = (item.part_of_speech || "").toLowerCase().includes(q);
        return matchWord || matchMeaning || matchContext || matchPOS;
      }

      return true;
    });
  }, [entries, filterTab, selectedPosFilter, selectedNotebookFilter, selectedTopicFilter, searchQuery, currentTime]);

  // Phân trang danh sách (Tránh quá tải DOM khi sổ có hàng trăm/nghìn từ vựng)
  const [pageSize, setPageSize] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);
  const listTopRef = useRef<HTMLDivElement>(null);

  // Bộ điều hướng bộ lọc (Tự động quay về trang 1 khi đổi tiêu chí lọc)
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: "all" | "due") => {
    setFilterTab(tab);
    setCurrentPage(1);
  };

  const handleNotebookFilter = (id: string | null) => {
    setSelectedNotebookFilter(id);
    setCurrentPage(1);
  };

  const handleTopicFilter = (topic: string | null) => {
    setSelectedTopicFilter(topic);
    setCurrentPage(1);
  };

  const handlePosFilter = (pos: "all" | PosCategory) => {
    setSelectedPosFilter(pos);
    setCurrentPage(1);
  };

  // Tính toán số trang và danh sách từ vựng của trang hiện tại
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedEntries = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredEntries.slice(startIndex, startIndex + pageSize);
  }, [filteredEntries, safeCurrentPage, pageSize]);

  // Cuộn mượt lên đầu danh sách thẻ khi chuyển trang
  const scrollToCardsTop = () => {
    if (typeof window !== "undefined" && listTopRef.current) {
      listTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Xử lý lưu chỉnh sửa nghĩa tại chỗ
  const handleSaveMeaning = (vocabId: string) => {
    if (!editMeaning.trim()) return;

    startTransition(async () => {
      const res = await updateVocabMeaningAction(vocabId, editMeaning);
      if (res.success) {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === vocabId ? { ...e, meaning: editMeaning.trim() } : e
          )
        );
        setEditingId(null);
      }
    });
  };

  // Xử lý xóa từ vựng
  const handleDelete = (vocabId: string) => {
    startTransition(async () => {
      const res = await deleteVocabAction(vocabId);
      if (res.success) {
        setEntries((prev) => prev.filter((e) => e.id !== vocabId));
        setConfirmDeleteId(null);
        if (selectedDetailEntry?.id === vocabId) {
          setSelectedDetailEntry(null);
        }
      }
    });
  };

  // Xử lý Bắt đầu học trực tiếp một bộ thẻ chuẩn
  const handleStartDeck = (deckStatus: CuratedDeckStatus) => {
    if (deckStatus.isImported && deckStatus.notebookId) {
      router.push(`/review?notebookId=${deckStatus.notebookId}`);
      return;
    }

    setImportingDeckId(deckStatus.deck.id);
    startTransition(async () => {
      try {
        const res = await importCuratedDeckAction(deckStatus.deck.id);
        if (res.success && res.notebook?.id) {
          setCuratedDecks((prev) =>
            prev.map((d) =>
              d.deck.id === deckStatus.deck.id
                ? {
                    ...d,
                    isImported: true,
                    notebookId: res.notebook?.id,
                    userCardsCount: (d.userCardsCount || 0) + (res.importedCount || 0),
                  }
                : d
            )
          );
          router.push(`/review?notebookId=${res.notebook.id}`);
        } else {
          alert(res.message);
        }
      } catch (err) {
        console.error("Lỗi khi nạp bộ thẻ:", err);
        alert("Có sự cố khi nạp bộ thẻ. Vui lòng thử lại.");
      } finally {
        setImportingDeckId(null);
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-2 pb-16 animate-in fade-in duration-200">
      {/* ========================================================= */}
      {/* TASK 1: Header Tinh Gọn & Hợp Nhất CTA (Layout 2 Cột 7:5) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Cột trái (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ghi nhớ ngắt quãng FSRS</span>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 truncate">
              Sổ từ vựng cá nhân
            </h1>
            <p className="text-sm text-[#475569] mt-1.5 leading-relaxed">
              Tổng cộng{" "}
              <span className="font-semibold text-slate-900 font-mono">
                {entries.length}
              </span>{" "}
              từ vựng được lưu trữ và tối ưu lịch ôn theo thuật toán FSRS.
            </p>
          </div>

          {/* Cụm nút công cụ phụ: + Thêm từ mới & Quản lý sổ */}
          <div className="flex items-center gap-2.5 pt-1 flex-wrap">
            <Button
              variant="secondary"
              size="default"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 h-10 px-4 text-xs font-semibold border-[#8190A6] text-slate-800 hover:bg-slate-100 transition-colors shadow-xs"
              title="Thêm từ vựng mới vào sổ"
            >
              <Plus className="w-4 h-4 text-[#2563EB]" />
              <span>Thêm từ mới</span>
            </Button>

            <Button
              variant="secondary"
              size="default"
              onClick={() => setIsNotebookManagerOpen(true)}
              className="flex items-center gap-1.5 h-10 px-4 text-xs font-semibold border-[#8190A6] text-slate-800 hover:bg-slate-100 transition-colors shadow-xs"
              title="Quản lý và tạo sổ riêng"
            >
              <FolderPlus className="w-4 h-4 text-indigo-600" />
              <span>Quản lý sổ</span>
            </Button>
          </div>
        </div>

        {/* Cột phải (lg:col-span-5): Action Card FSRS Nổi Bật */}
        <div className="lg:col-span-5">
          <Card
            className={`p-5 rounded-2xl border transition-all shadow-xs relative overflow-hidden ${
              dueCount > 0
                ? "bg-gradient-to-br from-[#EFF6FF] via-[#EEF2FF] to-white border-[#C7D2FE]"
                : "bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-white border-[#E2E8F0]"
            }`}
          >
            {dueCount > 0 ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-[#2563EB] text-white shadow-xs shrink-0">
                      <Flame className="w-5 h-5 fill-white" />
                    </span>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#4338CA]">
                        Mục tiêu hôm nay (Micro-learning)
                      </div>
                      <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                        <span className="font-mono text-[#2563EB] text-xl">
                          {dueCount}
                        </span>{" "}
                        thẻ đến hạn ôn tập
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#475569] leading-relaxed">
                  FSRS khuyến nghị chia nhỏ từng phiên 15 thẻ hoặc ôn theo chuyên đề để học sâu và duy trì trí nhớ dài hạn.
                </p>

                {/* 1 Nút Primary CTA duy nhất theo chuẩn Bất biến */}
                <div className="pt-1 flex items-center gap-3">
                  <Link href="/review?limit=15" className="flex-1">
                    <Button
                      variant="primary"
                      size="default"
                      className="w-full h-11 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Bắt đầu phiên 15 thẻ</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>

                  <Link
                    href="/review"
                    className="text-xs font-semibold text-[#4338CA] hover:text-[#2563EB] underline shrink-0 transition-colors"
                  >
                    Học theo chủ đề →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-emerald-100 text-[#047857] shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      Tuyệt vời! Không có thẻ đến hạn
                    </div>
                    <div className="text-xs text-[#475569] mt-0.5">
                      Bạn đã hoàn thành toàn bộ mục tiêu FSRS hôm nay.
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs text-[#475569]">
                    Sẵn sàng tiếp tục bứt phá?
                  </span>
                  <Link
                    href="/review"
                    className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
                  >
                    <span>Ôn tập tự do</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TASK 2: Tab View Nội Tuyến (Inline Tabs: Sổ từ của tôi & Thư Viện Bộ Thẻ) */}
      {/* ========================================================= */}
      <div className="border-b border-[#E2E8F0] pt-2">
        <div className="flex items-center gap-2" role="tablist" aria-label="Phân loại sổ từ">
          <button
            type="button"
            role="tab"
            aria-selected={activeMainTab === "my-vocab"}
            onClick={() => setActiveMainTab("my-vocab")}
            className={`px-4 sm:px-5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeMainTab === "my-vocab"
                ? "border-[#2563EB] text-[#2563EB] bg-[#EFF6FF]"
                : "border-transparent text-[#475569] hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Library className="w-4 h-4" />
            <span>Sổ từ của tôi</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                activeMainTab === "my-vocab"
                  ? "bg-[#2563EB] text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {entries.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeMainTab === "standard-decks"}
            onClick={() => setActiveMainTab("standard-decks")}
            className={`px-4 sm:px-5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeMainTab === "standard-decks"
                ? "border-[#2563EB] text-[#2563EB] bg-[#EFF6FF]"
                : "border-transparent text-[#475569] hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Thư Viện Bộ Thẻ</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                activeMainTab === "standard-decks"
                  ? "bg-[#2563EB] text-white"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {totalCuratedCards > 0 ? `${totalCuratedCards} từ` : "4 bộ"}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: KHO BỘ THẺ TOEIC CHUẨN (INLINE 3-COL GRID VIEW)  */}
      {/* ========================================================= */}
      {activeMainTab === "standard-decks" ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-slate-900">
                Kho Bộ Thẻ Biên Soạn Theo Chuẩn Đề Thi Thật
              </h2>
              <p className="text-xs text-[#475569]">
                Chọn bộ thẻ để nạp trực tiếp vào sổ cá nhân và kích hoạt lịch ôn ngắt quãng FSRS ngay lập tức.
              </p>
            </div>
            <div className="text-xs font-mono font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0] shrink-0 self-start sm:self-auto">
              Tổng cộng 4 bộ thẻ · {totalCuratedCards} từ vựng
            </div>
          </div>

          {/* Lưới Grid Bộ Thẻ 3 Cột Rộng Rãi Thoáng Mắt */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curatedDecks.map((deckStatus) => {
              const { deck, isImported } = deckStatus;
              const isImporting = importingDeckId === deck.id;

              return (
                <Card
                  key={deck.id}
                  className="overflow-hidden border border-[#E2E8F0] bg-white rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  {/* Phần Cover (Header màu của thẻ) */}
                  <div
                    className="p-5 text-white relative overflow-hidden flex flex-col justify-between min-h-[145px]"
                    style={{
                      backgroundColor:
                        deck.id === "essential-600"
                          ? "#2563EB"
                          : deck.id === "ets-vocab"
                          ? "#0F172A"
                          : deck.id === "common-idioms"
                          ? "#047857"
                          : "#4338CA",
                    }}
                  >
                    {/* Hàng trên: Badge phân loại + Trạng thái đã nạp */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs text-white border border-white/20">
                        {deck.badge}
                      </span>
                      {isImported && (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã nạp</span>
                        </span>
                      )}
                    </div>

                    {/* Tiêu đề chính to rõ + số lượng thẻ thực tế */}
                    <div className="mt-3">
                      <h3 className="text-lg font-bold tracking-tight text-white leading-snug line-clamp-2">
                        {deck.title}
                      </h3>
                      <div className="text-xs text-white/90 font-mono mt-1 flex items-center gap-1.5 font-medium">
                        {isImported ? (
                          <span>📚 Đã nạp {deckStatus.userCardsCount || deck.totalCards} / {deck.totalCards} thẻ</span>
                        ) : (
                          <span>📚 {deck.totalCards} thẻ từ vựng</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Phần Body của Deck Card */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-[#475569] leading-relaxed line-clamp-3">
                      {deck.description}
                    </p>

                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                        <Sparkles className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                        <span className="truncate">Chia nhỏ ~50 từ / chủ đề chuyên biệt</span>
                      </div>

                      {/* Nút Hành Động */}
                      {isImported ? (
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartDeck(deckStatus)}
                            className="w-full h-10 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                          >
                            <BookOpen className="w-4 h-4" />
                            <span>Học Flashcard ({deckStatus.userCardsCount || deck.totalCards} thẻ) →</span>
                          </button>

                          {deckStatus.notebookId && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedNotebookFilter(deckStatus.notebookId!);
                                setActiveMainTab("my-vocab");
                              }}
                              className="w-full text-center text-xs text-[#475569] hover:text-[#2563EB] hover:underline font-medium py-1 transition-colors cursor-pointer"
                            >
                              Xem danh sách từ trong Sổ từ cá nhân
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isImporting}
                          onClick={() => handleStartDeck(deckStatus)}
                          className="w-full h-10 px-4 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {isImporting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Đang nạp từ vựng...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>BẮT ĐẦU HỌC BỘ THẺ</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* VIEW 2: SỔ TỪ VỰNG CỦA TÔI (MÔ HÌNH KỆ SỔ 2 CẤP)          */
        /* ========================================================= */
        <div className="space-y-5">
          {/* A. Thanh công cụ phía trên (Top Control Bar) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8190A6]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  handleSearchChange(e.target.value);
                  if (e.target.value.trim()) {
                    setViewMode("words");
                  }
                }}
                placeholder="Tìm theo từ tiếng Anh, từ loại hoặc nghĩa..."
                className="w-full h-11 pl-10 pr-9 rounded-lg border border-[#8190A6] text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-white shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8190A6] hover:text-[#0F172A] p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Segmented Control Chuyển đổi 2 Chế độ xem */}
            <div className="inline-flex rounded-lg border border-[#8190A6] p-0.5 bg-[#F8FAFC] self-start sm:self-auto h-11 items-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  setViewMode("shelf");
                  setSelectedNotebookFilter(null);
                  setSelectedTopicFilter(null);
                }}
                className={`px-3.5 h-9.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "shelf"
                    ? "bg-white text-[#0F172A] shadow-xs"
                    : "text-[#475569] hover:text-[#0F172A]"
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-indigo-600" />
                <span>Kệ Chủ Điểm</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    viewMode === "shelf"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {shelfCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode("words");
                  setSelectedNotebookFilter(null);
                  setSelectedTopicFilter(null);
                }}
                className={`px-3.5 h-9.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "words"
                    ? "bg-white text-[#0F172A] shadow-xs"
                    : "text-[#475569] hover:text-[#0F172A]"
                }`}
              >
                <BookOpenText className="w-4 h-4 text-[#2563EB]" />
                <span>Tất Cả Từ Vựng</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    viewMode === "words"
                      ? "bg-[#2563EB] text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {entries.length}
                </span>
              </button>
            </div>
          </div>

          {/* B. CHẾ ĐỘ 1: KỆ SỔ & CHỦ ĐIỂM (viewMode === 'shelf') */}
          {viewMode === "shelf" ? (
            <div className="space-y-6 animate-in fade-in duration-150">
              {entries.length === 0 ? (
                <Card className="p-8 sm:p-12 text-center bg-white border border-[#E2E8F0] space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h3 className="text-lg font-bold text-[#0F172A]">
                      Bạn chưa có từ vựng nào trên kệ sổ
                    </h3>
                    <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                      Mỗi khi giải đề Part 5, bấm Lưu từ hoặc nạp các bộ thẻ chuẩn có sẵn. Hệ thống sẽ tự động phân loại theo sổ và chủ điểm giúp bạn học tập có hệ thống.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="default"
                      onClick={() => setActiveMainTab("standard-decks")}
                    >
                      Khám phá Kho bộ thẻ chuẩn →
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* 1. Các Sổ cá nhân tự tạo (Notebooks) */}
                  {notebooks.map((nb) => {
                    const nbDue = getNotebookDueCount(nb.id);
                    const matchingCount = entries.filter((e) => e.notebook_id === nb.id).length;
                    const wordCount = matchingCount > 0 ? matchingCount : (nb.word_count ?? 0);
                    const completionRate =
                      wordCount > 0
                        ? Math.min(100, Math.max(10, Math.round(((wordCount - nbDue) / wordCount) * 100)))
                        : 0;

                    return (
                      <Card
                        key={nb.id}
                        className="p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs hover:shadow-md hover:border-[#2563EB]/40 transition-all flex flex-col justify-between space-y-4 group"
                      >
                        <div className="space-y-3">
                          {/* Header thẻ: Icon + Tên sổ + Badge số từ */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs border"
                                style={{
                                  backgroundColor: `${nb.color}15`,
                                  borderColor: `${nb.color}30`,
                                  color: nb.color,
                                }}
                              >
                                <Folder className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                  Sổ cá nhân
                                </span>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate" title={nb.name}>
                                  {nb.name}
                                </h3>
                              </div>
                            </div>
                            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0 border border-slate-200">
                              {wordCount} từ
                            </span>
                          </div>

                          {/* Tiến độ FSRS & Trạng thái */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-medium">Trạng thái ôn tập:</span>
                              {nbDue > 0 ? (
                                <span className="font-bold text-[#4338CA] flex items-center gap-1 font-mono">
                                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                  {nbDue} thẻ cần ôn
                                </span>
                              ) : (
                                <span className="font-bold text-[#047857] flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Đã ôn xong
                                </span>
                              )}
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${completionRate}%`,
                                  backgroundColor: nbDue > 0 ? "#4338CA" : "#047857",
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Footer: 2 Nút hành động */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedNotebookFilter(nb.id);
                              setSelectedTopicFilter(null);
                              setViewMode("words");
                            }}
                            className="flex-1 h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                            <span>Mở sổ xem từ</span>
                          </button>

                          <Link
                            href={`/review?notebookId=${nb.id}`}
                            className="h-9 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
                          >
                            <span>Ôn tập</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </Card>
                    );
                  })}

                  {/* 2. Các Chủ điểm chuyên đề TOEIC (Topics) */}
                  {availableTopics.map((top) => {
                    const topDue = getTopicDueCount(top.name);
                    const visual = getTopicVisuals(top.name);
                    const TopicIcon = visual.icon;
                    const completionRate =
                      top.count > 0
                        ? Math.min(100, Math.max(10, Math.round(((top.count - topDue) / top.count) * 100)))
                        : 0;

                    return (
                      <Card
                        key={top.name}
                        className="p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs hover:shadow-md hover:border-[#2563EB]/40 transition-all flex flex-col justify-between space-y-4 group"
                      >
                        <div className="space-y-3">
                          {/* Header thẻ: Icon Box Chuẩn Hóa + Tên Việt / Anh 2 dòng + Badge số lượng từ */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${visual.badgeColor}`}
                              >
                                <TopicIcon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <h3
                                  className="text-sm sm:text-base font-bold text-slate-900 truncate"
                                  title={`${visual.titleVi} (${top.name})`}
                                >
                                  {visual.titleVi}
                                </h3>
                                <span className="text-xs text-slate-500 font-medium truncate block">
                                  {top.name}
                                </span>
                              </div>
                            </div>
                            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0 border border-slate-200">
                              {top.count} từ
                            </span>
                          </div>

                          {/* Tiến độ FSRS & Trạng thái */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-medium">Trạng thái ôn tập:</span>
                              {topDue > 0 ? (
                                <span className="font-bold text-[#4338CA] flex items-center gap-1 font-mono">
                                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                  {topDue} thẻ cần ôn
                                </span>
                              ) : (
                                <span className="font-bold text-[#047857] flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Đã ôn xong
                                </span>
                              )}
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${completionRate}%`,
                                  backgroundColor: topDue > 0 ? "#2563EB" : "#047857",
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Footer: 2 Nút hành động */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTopicFilter(top.name);
                              setSelectedNotebookFilter(null);
                              setViewMode("words");
                            }}
                            className="flex-1 h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                            <span>Mở sổ xem từ</span>
                          </button>

                          <Link
                            href={`/review?topic=${encodeURIComponent(top.name)}&limit=15`}
                            className="h-9 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
                          >
                            <span>Ôn tập</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </Card>
                    );
                  })}

                  {/* 3. Trường hợp chưa có sổ riêng và chưa có chủ điểm cụ thể */}
                  {notebooks.length === 0 && availableTopics.length === 0 && entries.length > 0 && (
                    <Card className="p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Sổ mặc định
                              </span>
                              <h3 className="text-base font-bold text-slate-900">
                                Sổ từ vựng chung
                              </h3>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {entries.length} từ
                          </span>
                        </div>
                        <p className="text-xs text-[#475569] leading-relaxed">
                          Tất cả các từ vựng đã được bạn lưu trong quá trình luyện tập Part 5.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setViewMode("words")}
                          className="flex-1 h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                          <span>Mở sổ xem từ</span>
                        </button>
                        <Link
                          href="/review?limit=15"
                          className="h-9 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
                        >
                          <span>Ôn tập</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* C. CHẾ ĐỘ 2: CHI TIẾT SỔ / TẤT CẢ TỪ VỰNG (viewMode === 'words') */
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Header Breadcrumb nếu đang mở từ 1 Sổ/Chủ điểm cụ thể */}
              {(selectedTopicFilter !== null || selectedNotebookFilter !== null) && (
                <div className="p-3 sm:p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNotebookFilter(null);
                        setSelectedTopicFilter(null);
                        setViewMode("shelf");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1 shadow-xs shrink-0"
                    >
                      <span>← Quay lại Kệ Chủ Điểm</span>
                    </button>
                    <span className="text-slate-300 hidden sm:inline">|</span>
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-xs text-slate-500 font-medium">Đang xem:</span>
                      <span className="text-xs sm:text-sm font-bold text-blue-950 truncate">
                        {activeFilteredTitle} ({filteredEntries.length} từ)
                      </span>
                    </div>
                  </div>

                  <Link
                    href={activeFilteredReviewUrl}
                    className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    <span>Ôn chủ điểm này ({filteredEntries.length} từ)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Hàng bộ lọc gọn gàng trên 1 dòng: Từ loại + Bộ lọc Trạng thái Đến hạn */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                {/* Các pill lọc TỪ LOẠI */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
                    Từ loại:
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePosFilter("all")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                      selectedPosFilter === "all"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Tất cả ({entries.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePosFilter("noun")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                      selectedPosFilter === "noun"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    Danh từ ({posCounts.noun})
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePosFilter("verb")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                      selectedPosFilter === "verb"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    }`}
                  >
                    Động từ ({posCounts.verb})
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePosFilter("adjective")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                      selectedPosFilter === "adjective"
                        ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                        : "bg-white text-amber-800 border-amber-200 hover:bg-amber-50"
                    }`}
                  >
                    Tính từ ({posCounts.adjective})
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePosFilter("adverb")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                      selectedPosFilter === "adverb"
                        ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                        : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
                    }`}
                  >
                    Trạng từ ({posCounts.adverb})
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePosFilter("phrase")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                      selectedPosFilter === "phrase"
                        ? "bg-slate-700 text-white border-slate-700 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Cụm từ ({posCounts.phrase})
                  </button>
                </div>

                {/* Cụm công cụ bên phải: Lọc Đến hạn + 2 Nút Công tắc (Che nghĩa & Hiện ví dụ) */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Bộ lọc trạng thái: Tất cả | Đến hạn */}
                  <div className="inline-flex rounded-lg border border-[#8190A6] p-0.5 bg-white self-start md:self-auto h-8 items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTabChange("all")}
                      className={`px-2.5 h-7 text-[11px] font-semibold rounded transition-all cursor-pointer font-mono ${
                        filterTab === "all"
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-[#475569] hover:text-[#0F172A]"
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabChange("due")}
                      className={`px-2.5 h-7 text-[11px] font-semibold rounded transition-all cursor-pointer font-mono ${
                        filterTab === "due"
                          ? "bg-[#EEF2FF] text-[#4338CA] shadow-xs"
                          : "text-[#475569] hover:text-[#4338CA]"
                      }`}
                    >
                      Đến hạn ({dueCount})
                    </button>
                  </div>

                  <div className="h-4 w-px bg-slate-200 hidden sm:block" />

                  {/* Nút Công tắc 1: Che nghĩa (text-amber-600 bg-amber-50) */}
                  <button
                    type="button"
                    onClick={() => {
                      setHideMeanings((prev) => !prev);
                      setRevealedCardIds(new Set());
                    }}
                    className={`h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                      hideMeanings
                        ? "bg-amber-50 text-amber-700 border-amber-300 font-bold shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                    title="Che nghĩa tiếng Việt để tự nhớ (Bấm vào thẻ để hiện nghĩa)"
                  >
                    {hideMeanings ? (
                      <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>{hideMeanings ? "Đang che nghĩa" : "Che nghĩa"}</span>
                  </button>

                  {/* Nút Công tắc 2: Hiện ví dụ (text-slate-600 bg-slate-100) */}
                  <button
                    type="button"
                    onClick={() => setShowExamples((prev) => !prev)}
                    className={`h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                      showExamples
                        ? "bg-slate-100 text-slate-700 border-slate-300 font-bold shadow-xs"
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                    }`}
                    title="Bật/Tắt hiển thị câu ví dụ ngữ cảnh"
                  >
                    {showExamples ? (
                      <TextQuote className="w-3.5 h-3.5 text-slate-700" />
                    ) : (
                      <Quote className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{showExamples ? "Hiện ví dụ" : "Ẩn ví dụ"}</span>
                  </button>
                </div>
              </div>

              {/* Neo cuộn trang mượt */}
              <div ref={listTopRef} className="-mt-2 scroll-mt-6" />

          {/* ========================================================= */}
          {/* LƯỚI TỪ VỰNG CÁ NHÂN (WORD CARDS)                          */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {paginatedEntries.map((item) => {
              const isEditing = editingId === item.id;
              const isDeleting = confirmDeleteId === item.id;
              const isDue =
                item.card?.due && new Date(item.card.due).getTime() <= currentTime;
              const posInfo = getPosBadgeInfo(item.part_of_speech, item.meaning, item.word);
              const dual = getDualPronunciation(item.word);
              const phonetic = resolvePhonetic(
                item.word,
                item.phonetic || item.metadata?.phonetic
              );

              return (
                <Card
                  key={item.id}
                  className="p-5 bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-3.5 hover:border-[#2563EB]/40 hover:shadow-sm transition-all"
                >
                  <div className="space-y-2.5">
                    {/* Header thẻ: Từ vựng + Từ loại + Trạng thái FSRS */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailEntry(item)}
                            className="text-lg sm:text-[19px] font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors cursor-pointer tracking-tight text-left"
                          >
                            {item.word}
                          </button>

                          {dual ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <AudioSpeakerButton word={item.word} posHint="noun" label="n" size="sm" />
                              <span className="text-[12px] font-ipa text-slate-500">{dual.nounIpa}</span>
                              <AudioSpeakerButton word={item.word} posHint="verb" label="v" size="sm" />
                              <span className="text-[12px] font-ipa text-slate-500">{dual.verbIpa}</span>
                            </div>
                          ) : (
                            <>
                              <AudioSpeakerButton word={item.word} size="sm" />
                              {phonetic && (
                                <span className="text-[13px] font-ipa font-normal text-slate-500 tracking-wide select-all">
                                  {phonetic}
                                </span>
                              )}
                            </>
                          )}

                          {/* Huy hiệu phân loại từ loại chuẩn: Danh · Động · Tính · Trạng */}
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider border ${posInfo.badgeClass}`}
                          >
                            {posInfo.shortBadge}
                          </span>

                          {/* Huy hiệu Đến hạn ôn */}
                          {isDue && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE]">
                              Đến hạn ôn
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Nút hành động */}
                      {!isEditing && !isDeleting && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailEntry(item)}
                            className="p-1.5 rounded-md text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                            title="Xem chi tiết thẻ từ"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(item.id);
                              setEditMeaning(item.meaning);
                              setConfirmDeleteId(null);
                            }}
                            className="p-1.5 rounded-md text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                            title="Sửa nghĩa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item.id)}
                            className="p-1.5 rounded-md text-[#64748B] hover:text-[#BE123C] hover:bg-[#FFF1F2] transition-colors cursor-pointer"
                            title="Xóa từ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Nghĩa tiếng Việt: Có thể sửa tại chỗ (Inline Edit) */}
                    {isEditing ? (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={editMeaning}
                          onChange={(e) => setEditMeaning(e.target.value)}
                          className="flex-1 h-9 px-2.5 rounded-md border border-[#2563EB] text-sm text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                          autoFocus
                        />
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleSaveMeaning(item.id)}
                          className="p-2 rounded-md bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors cursor-pointer"
                          title="Lưu nghĩa"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-2 rounded-md bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
                          title="Hủy"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : hideMeanings && !revealedCardIds.has(item.id) ? (
                      <div>
                        <button
                          type="button"
                          onClick={() => setRevealedCardIds((prev) => new Set(prev).add(item.id))}
                          className="text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/90 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          title="Bấm để mở nghĩa tiếng Việt"
                        >
                          <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                          <span>Bấm để hiện nghĩa</span>
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          if (hideMeanings) {
                            setRevealedCardIds((prev) => {
                              const next = new Set(prev);
                              next.delete(item.id);
                              return next;
                            });
                          } else {
                            setSelectedDetailEntry(item);
                          }
                        }}
                        className={`text-[15px] font-semibold text-[#1E40AF] cursor-pointer hover:underline ${
                          hideMeanings
                            ? "bg-amber-50/70 border border-amber-200 px-2 py-0.5 rounded inline-block text-amber-900"
                            : ""
                        }`}
                        title={hideMeanings ? "Bấm để che lại nghĩa" : "Xem chi tiết từ vựng"}
                      >
                        {item.meaning}
                      </div>
                    )}

                    {/* Câu ngữ cảnh hoàn chỉnh (Không có vết đục lỗ ____) - Kiểm soát bởi công tắc Hiện ví dụ */}
                    {showExamples && item.context_sentence && (
                      <div
                        onClick={() => setSelectedDetailEntry(item)}
                        className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer space-y-1.5 hover:bg-[#F1F5F9] transition-colors"
                      >
                        <div className="text-xs text-[#0F172A] font-medium leading-relaxed line-clamp-2">
                          &ldquo;{item.context_sentence}&rdquo;
                        </div>
                        {item.context_translation && (
                          <div className="text-[11px] text-[#64748B] italic line-clamp-1 border-t border-[#E2E8F0]/60 pt-1">
                            Dịch: &ldquo;{item.context_translation}&rdquo;
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Hộp xác nhận xóa */}
                  {isDeleting && (
                    <div className="p-2.5 rounded-md bg-[#FFF1F2] border border-[#FECDD3] flex items-center justify-between gap-2 text-xs text-[#BE123C] animate-in fade-in duration-150">
                      <span className="font-medium">Xác nhận xóa từ này?</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDelete(item.id)}
                          className="px-2 py-1 rounded bg-[#BE123C] text-white hover:bg-[#9F1239] font-semibold cursor-pointer"
                        >
                          Xóa
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 rounded bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Phân trang (Pagination) */}
          {filteredEntries.length > 0 && (
            <nav
              role="navigation"
              aria-label="Phân trang danh sách từ vựng"
              className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
            >
              <div className="text-[#475569] font-medium text-center sm:text-left">
                Hiển thị{" "}
                <span className="font-bold font-mono text-[#0F172A]">
                  {(safeCurrentPage - 1) * pageSize + 1}–
                  {Math.min(safeCurrentPage * pageSize, filteredEntries.length)}
                </span>{" "}
                trên tổng số{" "}
                <span className="font-bold font-mono text-[#0F172A]">
                  {filteredEntries.length}
                </span>{" "}
                từ vựng
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1 flex-wrap justify-center">
                  <button
                    type="button"
                    disabled={safeCurrentPage === 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      scrollToCardsTop();
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
                    aria-label="Trang trước"
                  >
                    ← Trước
                  </button>

                  {getPageNumbers(safeCurrentPage, totalPages).map((pageNum, idx) => {
                    if (pageNum === "...") {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1.5 py-1 text-slate-400 select-none font-mono"
                        >
                          …
                        </span>
                      );
                    }
                    const isCurrent = pageNum === safeCurrentPage;
                    return (
                      <button
                        key={`page-${pageNum}`}
                        type="button"
                        onClick={() => {
                          setCurrentPage(pageNum as number);
                          scrollToCardsTop();
                        }}
                        aria-current={isCurrent ? "page" : undefined}
                        className={`min-w-8 h-8 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-xs ${
                          isCurrent
                            ? "bg-[#2563EB] text-white shadow-sm"
                            : "bg-white text-slate-700 border border-[#E2E8F0] hover:bg-slate-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={safeCurrentPage === totalPages}
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      scrollToCardsTop();
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
                    aria-label="Trang sau"
                  >
                    Sau →
                  </button>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[#475569]">
                <span className="text-[11px]">Trang:</span>
                {[24, 48, 96].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                    className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold transition-all cursor-pointer ${
                      pageSize === size
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </nav>
          )}

          {/* Trạng thái rỗng & không tìm thấy kết quả */}
          {entries.length === 0 && (
            <Card className="p-8 sm:p-12 text-center bg-white border border-[#E2E8F0] space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-[#0F172A]">
                  Bạn chưa có từ vựng nào trong sổ
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  Mỗi khi gặp từ mới trong lúc giải đề, hãy bấm nút Lưu từ. Hệ thống sẽ tự động xếp lịch ôn ngắt quãng giúp bạn ghi nhớ tự nhiên và lâu dài.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/practice/new">
                  <Button variant="primary" size="default">
                    Bắt đầu làm bài luyện tập →
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {entries.length > 0 && filteredEntries.length === 0 && (
            <div className="p-8 text-center bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-sm text-[#475569] space-y-2">
              <div>Không tìm thấy từ vựng nào khớp với từ khóa &ldquo;{searchQuery}&rdquo;.</div>
              <button
                type="button"
                onClick={() => {
                  handleSearchChange("");
                  handleTabChange("all");
                  handleNotebookFilter(null);
                  handleTopicFilter(null);
                  handlePosFilter("all");
                }}
                className="text-xs font-semibold text-[#2563EB] underline cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
            </div>
          )}
        </div>
      )}

      {/* Modal Xem chi tiết từ vựng FSRS */}
      <VocabDetailModal
        entry={selectedDetailEntry}
        isOpen={!!selectedDetailEntry}
        onClose={() => setSelectedDetailEntry(null)}
        onEditClick={(entry) => {
          setEditingId(entry.id);
          setEditMeaning(entry.meaning);
        }}
        onDeleteClick={(id) => setConfirmDeleteId(id)}
      />

      {/* Modal Thêm từ vựng mới trực tiếp */}
      <VocabCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        notebooks={notebooks}
        selectedNotebookId={selectedNotebookFilter}
        onVocabCreated={(newEntry) => {
          setEntries((prev) => [newEntry, ...prev]);
          if (newEntry.notebook_id) {
            setNotebooks((prev) =>
              prev.map((nb) =>
                nb.id === newEntry.notebook_id
                  ? { ...nb, word_count: (nb.word_count ?? 0) + 1 }
                  : nb
              )
            );
          }
        }}
      />

      {/* Modal Quản lý & Tạo sổ từ vựng mới */}
      <NotebookManagerModal
        isOpen={isNotebookManagerOpen}
        onClose={() => setIsNotebookManagerOpen(false)}
        notebooks={notebooks}
        onNotebooksChanged={(updated) => setNotebooks(updated)}
      />
    </div>
  );
}

/**
 * Thuật toán sinh danh sách số trang hiển thị thông minh kèm dấu lược (...)
 */
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}
