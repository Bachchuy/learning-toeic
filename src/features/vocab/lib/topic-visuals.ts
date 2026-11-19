import type { ComponentType } from "react";
import {
  Award,
  BookOpen,
  BookOpenText,
  BrainCircuit,
  Briefcase,
  Building2,
  Calculator,
  CloudCog,
  Code2,
  Database,
  Factory,
  FileCheck,
  FileText,
  Globe,
  GraduationCap,
  Headphones,
  HeartPulse,
  HelpCircle,
  Landmark,
  Layers,
  Lightbulb,
  Link2,
  Mail,
  Megaphone,
  Network,
  Plane,
  Receipt,
  Server,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Tags,
  TrendingUp,
  Truck,
  Users,
  Utensils,
} from "lucide-react";

export interface TopicVisual {
  icon: ComponentType<{ className?: string }>;
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
  airlines: {
    icon: Plane,
    titleVi: "Hàng không & Chuyến bay",
    badgeColor: "bg-sky-50 text-sky-600 border-sky-100",
  },
  trains: {
    icon: Plane,
    titleVi: "Đường sắt & Tàu hỏa",
    badgeColor: "bg-sky-50 text-sky-600 border-sky-100",
  },
  accounting: {
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
  banking: {
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
  conference: {
    icon: Users,
    titleVi: "Hội nghị & Diễn đàn",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
  },
  "construction, real estate & facilities": {
    icon: Building2,
    titleVi: "Xây dựng & Bất động sản",
    badgeColor: "bg-orange-50 text-orange-600 border-orange-100",
  },
  contracts: {
    icon: FileText,
    titleVi: "Hợp đồng thương mại",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  "cooking as a career": {
    icon: Utensils,
    titleVi: "Nghề bếp & Ẩm thực",
    badgeColor: "bg-orange-50 text-orange-600 border-orange-100",
  },
  correspondence: {
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
  electronics: {
    icon: Globe,
    titleVi: "Thiết bị điện tử",
    badgeColor: "bg-cyan-50 text-cyan-600 border-cyan-100",
  },
  events: {
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
  health: {
    icon: HeartPulse,
    titleVi: "Sức khỏe & Đời sống",
    badgeColor: "bg-rose-50 text-rose-600 border-rose-100",
  },
  "health & medical": {
    icon: HeartPulse,
    titleVi: "Y tế & Chăm sóc sức khỏe",
    badgeColor: "bg-rose-50 text-rose-600 border-rose-100",
  },
  hospitals: {
    icon: HeartPulse,
    titleVi: "Bệnh viện & Điều trị",
    badgeColor: "bg-rose-50 text-rose-600 border-rose-100",
  },
  hotels: {
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
  inventory: {
    icon: ShoppingBag,
    titleVi: "Quản lý tồn kho & Kho bãi",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
  },
  investment: {
    icon: TrendingUp,
    titleVi: "Đầu tư tài chính",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  invoice: {
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
  marketing: {
    icon: Megaphone,
    titleVi: "Tiếp thị & Thị trường",
    badgeColor: "bg-pink-50 text-pink-600 border-pink-100",
  },
  "marketing & advertising": {
    icon: Megaphone,
    titleVi: "Tiếp thị & Quảng cáo",
    badgeColor: "bg-pink-50 text-pink-600 border-pink-100",
  },
  media: {
    icon: Megaphone,
    titleVi: "Truyền thông & Báo chí",
    badgeColor: "bg-pink-50 text-pink-600 border-pink-100",
  },
  "meetings & stand-ups": {
    icon: Users,
    titleVi: "Họp nhóm & Stand-up",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
  },
  movies: {
    icon: Sparkles,
    titleVi: "Điện ảnh & Chiếu phim",
    badgeColor: "bg-purple-50 text-purple-600 border-purple-100",
  },
  museums: {
    icon: Landmark,
    titleVi: "Bảo tàng & Triển lãm",
    badgeColor: "bg-purple-50 text-purple-600 border-purple-100",
  },
  music: {
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
  pharmacy: {
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
  security: {
    icon: ShieldAlert,
    titleVi: "An toàn & Bảo mật thông tin",
    badgeColor: "bg-rose-50 text-rose-600 border-rose-100",
  },
  "selecting a restaurant": {
    icon: Utensils,
    titleVi: "Chọn lựa nhà hàng",
    badgeColor: "bg-orange-50 text-orange-600 border-orange-100",
  },
  shipping: {
    icon: Truck,
    titleVi: "Vận chuyển hàng hóa",
    badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
  },
  shopping: {
    icon: ShoppingBag,
    titleVi: "Mua sắm thương mại",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  "tax, insurance & payments": {
    icon: Receipt,
    titleVi: "Thuế, Bảo hiểm & Chi trả",
    badgeColor: "bg-teal-50 text-teal-600 border-teal-100",
  },
  taxes: {
    icon: Receipt,
    titleVi: "Thuế & Nghĩa vụ thuế",
    badgeColor: "bg-teal-50 text-teal-600 border-teal-100",
  },
  "testing & qa": {
    icon: FileCheck,
    titleVi: "Kiểm thử phần mềm (QA)",
    badgeColor: "bg-teal-50 text-teal-600 border-teal-100",
  },
  theater: {
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
  warranties: {
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
 * Tra cứu Icon, tên tiếng Việt và màu sắc cho từng thẻ chủ điểm (1-1 hoặc fallback tên gốc).
 */
export function getTopicVisuals(topicName: string): TopicVisual {
  const norm = topicName.trim().toLowerCase().replace(/['’]/g, "'");

  if (TOPIC_EXACT_MAP[norm]) {
    return TOPIC_EXACT_MAP[norm];
  }

  return {
    icon: BookOpen,
    titleVi: topicName.trim(),
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
  };
}

/**
 * Sinh danh sách số trang hiển thị kèm dấu lược (...).
 */
export function getPageNumbers(current: number, total: number): (number | "...")[] {
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
