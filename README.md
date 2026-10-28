# TOEIC AI — Nền Tảng Luyện Thi TOEIC Thích Ứng (Adaptive Learning Platform)

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x_Strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_RLS-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-146_Passed-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-4338CA?style=flat-square)](https://www.w3.org/WAI/WCAG21/quickref/)
[![License](https://img.shields.io/badge/License-MIT-gray?style=flat-square)](LICENSE)

**Nền tảng luyện thi TOEIC thích ứng cá nhân hóa với thuật toán lặp lại ngắt quãng FSRS, đánh giá độ vững ngữ pháp chuẩn toán học Wilson Score Interval và bảo mật dữ liệu cấp cơ sở dữ liệu (Database-level Security).**

[Tính Năng](#-tính-năng-nổi-bật-key-features) • [Nguyên Lý Cốt Lõi](#-nguyên-lý-thiết-kế-cốt-lõi-core-principles) • [Cài Đặt](#-hướng-dẫn-cài-đặt-getting-started) • [Kiến Trúc](#-cấu-trúc-mã-nguồn-architecture-overview) • [Kiểm Thử](#-hệ-thống-kiểm-thử--chất-lượng-quality-gates)

</div>

---

## 💡 Tại Sao Lại Là TOEIC AI?

Đa số các ứng dụng luyện thi hiện nay chỉ dừng lại ở việc chấm điểm Đúng/Sai và hiển thị đáp án. **TOEIC AI** được thiết kế theo triết lý **"Hiểu vì sao sai"** kết hợp với mô hình toán học thực chứng:

1. **Không rò rỉ đáp án (Zero-Leak Security)**: Đáp án đúng (`question_answers`) được lưu trữ tại bảng riêng biệt với chính sách **Row-Level Security (RLS)** nghiêm ngặt. Client không bao giờ nhận được đáp án trước khi hoàn thành bài thi; việc chấm điểm diễn ra hoàn toàn tại PostgreSQL RPC / Server Actions.
2. **Đo lường năng lực chuẩn xác (Wilson Score Lower Bound)**: Thay vì dùng tỷ lệ phần trăm đơn giản (dễ sai lệch khi số lượng câu làm còn ít), hệ thống tính **cận dưới khoảng tin cậy Wilson ($z=1.0$, rolling window 20)** để xác định chính xác học viên thực sự đã _Vững_ hay chỉ là _May mắn_.
3. **Ghi nhớ từ vựng tối ưu (FSRS Engine)**: Tích hợp thuật toán Free Spaced Repetition Scheduler (`ts-fsrs` 5.4.2) thế hệ mới, vượt trội hơn mô hình SuperMemo SM-2 truyền thống.
4. **Trải nghiệm Swiss Precision**: Giao diện tối giản loại bỏ xao nhãng, đạt chuẩn tương phản thị giác WCAG 2.1 AA, hỗ trợ đầy đủ phím tắt bàn phím ($A/B/C/D$, $Space$, $Enter$, $J/K/Y/N/E$).

---

## 🌟 Tính Năng Nổi Bật (Key Features)

### 1. Phiên Luyện Tập Tập Trung (Focused Practice Session)

- Tùy chọn quy mô linh hoạt (5, 10, hoặc 20 câu) theo từng chủ điểm ngữ pháp hoặc ngẫu nhiên toàn diện Part 5.
- Thanh tiến độ liên tục 8px, Focused Header loại bỏ navigation xao nhãng, hỗ trợ hotkeys toàn diện.

### 2. Giải Thích Thích Ứng 4 Lớp Sư Phạm (Adaptive Explanations)

- **Làm đúng**: Thu gọn giải thích để duy trì nhịp độ làm bài nhanh, có tùy chọn mở rộng.
- **Làm sai**: Tự động mở bung 4 lớp giải thích chuyên sâu: _Quy tắc cốt lõi_, _Phân tích lý do chọn_, _Phân tích bẫy trong 4 lựa chọn_, _Dịch nghĩa toàn văn_ và _Từ vựng ăn điểm_.

### 3. Chế Độ Ôn Lại Lỗi Sai Tức Thì (Instant Drill Mode)

- Cho phép người học làm lại ngay các câu vừa làm sai sau khi kết thúc phiên luyện tập.
- **Bất biến**: Chạy hoàn toàn tại client, không ghi đè lịch sử `attempts` và không làm sai lệch chỉ số độ vững Wilson của học viên.

### 4. Sổ Từ Vựng & Thẻ Ghi Nhớ FSRS (Vocab Spaced Repetition)

- Lưu từ vựng nhanh trực tiếp từ bảng giải thích câu hỏi hoặc thêm thủ công.
- Hỗ trợ phát âm audio bản ngữ và tra cứu định nghĩa tức thì.
- Lập lịch ngắt quãng tối ưu theo 4 trạng thái: _Lại (Again)_, _Khó (Hard)_, _Tốt (Good)_, _Dễ (Easy)_.

### 5. Thi Thử Mô Phỏng Đọc Hiểu TOEIC Đầy Đủ (Part 5, 6, 7 Simulation)

- Mô phỏng phòng thi thực tế: 100 câu đọc hiểu trong 75 phút.
- Hỗ trợ cấu trúc bài đọc đa văn bản (Passages Part 6 & 7) với hiển thị văn bản song song câu hỏi.
- Bảng quy đổi điểm chuẩn ETS tự động chuyển đổi số câu đúng sang thang điểm $5 - 495$.

### 6. Chẩn Đoán Điểm Yếu Thích Ứng (Adaptive Rolling Mastery)

- Theo dõi 16 chủ điểm ngữ pháp trọng yếu Part 5 qua 4 trạng thái:
  - **Chưa đủ dữ liệu**: Dưới 5 lượt làm bài.
  - **Cần ôn**: Cận dưới Wilson $< 50\%$.
  - **Khá**: Cận dưới Wilson từ $50\% - 74\%$.
  - **Vững**: Cận dưới Wilson $\ge 75\%$ (hoặc Fast-track khi làm $\ge 8$ câu với độ chính xác $\ge 90\%$).

### 7. Cổng Quản Trị & Kiểm Duyệt Chuẩn Vàng (Admin Review Portal)

- Màn hình chia đôi tỷ lệ 7/12 & 5/12 tối ưu hóa cho chuyên gia duyệt đề thi.
- Bộ phím tắt điều hướng siêu tốc: $J/K$ (chuyển câu), $Y/N$ (duyệt/từ chối), $E$ (sửa nhanh).
- Tự động chạy báo cáo kiểm định 4 chuẩn vàng: S3 (1 chỗ trống duy nhất), S4 (4 phương án phân biệt), S5 (đáp án hợp lệ), S6 (giải thích đầy đủ cấu trúc).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Tầng           | Công nghệ                                | Mục đích & Lý do lựa chọn                                    |
| :------------- | :--------------------------------------- | :----------------------------------------------------------- |
| **Frontend**   | Next.js 16 (App Router), React 19        | Server Components, tối ưu hóa SEO & LCP, Server Actions      |
| **Styling**    | Tailwind CSS v4, Lucide / Phosphor Icons | Design Tokens nhất quán, hiệu năng compile tức thì           |
| **Database**   | Supabase (PostgreSQL 15)                 | Row-Level Security (RLS), Postgres Functions, RPCs           |
| **Thuật toán** | `ts-fsrs` (5.4.2)                        | Lập lịch giãn cách FSRS hiện đại, tính toán tại server       |
| **Toán học**   | Wilson Score Interval ($z=1.0$)          | Đo lường độ vững năng lực học tập không thiên vị mẫu nhỏ     |
| **Kiểm thử**   | Vitest, Playwright                       | Kiểm thử đa tầng: Unit, Integration, Invariants, a11y WCAG   |
| **CI/CD**      | GitHub Actions                           | Kiểm tra nghiêm ngặt Typecheck & Unit test khi tạo PR / Push |

---

## 🚀 Hướng Dẫn Cài Đặt (Getting Started)

### 1. Yêu cầu môi trường

- **Node.js**: Phiên bản `>= 20.0.0` (Khuyến nghị Node.js v22 LTS).
- **Trình quản lý gói**: `npm` hoặc `pnpm`.

### 2. Cài đặt mã nguồn

```bash
git clone https://github.com/Bachchuy/learning-toeic.git
cd learning-toeic
npm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env.local` từ mẫu [`.env.example`](file:///.env.example):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Khởi tạo Cơ sở Dữ liệu & Dữ liệu Mẫu

Lệnh sau sẽ tự động chạy các migration SQL, thiết lập RLS policies, hàm RPC và nạp ngân hàng câu hỏi & thẻ từ vựng mẫu:

```bash
npm run db:setup
```

### 5. Khởi chạy ứng dụng

```bash
npm run dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

---

## 🛡️ Hệ Thống Kiểm Thử & Chất Lượng (Quality Gates)

Dự án áp dụng quy chuẩn kiểm thử nghiêm ngặt trước khi triển khai:

```bash
# 1. Kiểm tra cú pháp và phong cách mã (ESLint) - 0 warnings, 0 errors
npm run lint

# 2. Kiểm tra kiểu tĩnh nghiêm ngặt (TypeScript Strict Mode)
npm run typecheck

# 3. Chạy 146 unit & integration tests (Vitest)
npm run test

# 4. Kiểm thử giao diện và luồng người dùng E2E (Playwright)
npm run test:e2e

# 5. Kiểm tra build sản phẩm (Turbopack Production Build)
npm run build
```

---

## 🏛️ Cấu Trúc Mã Nguồn (Architecture Overview)

```text
learning-toeic/
├── .github/workflows/
│   └── ci.yml                  # Tự động hóa kiểm thử Typecheck & Vitest
├── docs/                       # Master Blueprint, ADR và tài liệu thiết kế kỹ thuật
│   ├── INDEX.md                # Bản đồ điều hướng tài liệu (đọc đầu tiên)
│   ├── 01-vision-users-scope.md# Tầm nhìn sản phẩm, User Stories & Ràng buộc
│   ├── 04-business-rules.md    # Đặc tả nghiệp vụ toán học FSRS & Wilson Score
│   ├── 05-design/              # Design tokens, components & responsive specs
│   ├── 06-architecture.md      # Thiết kế Postgres, RLS, RPC & Server Actions
│   └── 08-testing.md           # Chiến lược kiểm thử tự động đa tầng
├── public/                     # Tài nguyên tĩnh: logo, brand assets, favicon
├── scripts/                    # Scripts khởi tạo và nạp dữ liệu chuẩn cho môi trường local
│   ├── migrate.ts              # Chạy migrations Supabase SQL
│   ├── seed-questions.ts       # Nạp ngân hàng câu hỏi Part 5 chuẩn hóa
│   ├── seed-batch-questions.ts # Nạp gói câu hỏi bổ sung
│   ├── seed-curated-decks.ts   # Nạp bộ thẻ từ vựng FSRS mẫu
│   └── verify-exam-data.ts     # Kiểm định tính toàn vẹn dữ liệu
├── src/
│   ├── app/                    # Next.js 16 App Router (Routes & Layouts)
│   │   ├── (auth)/             # Màn hình công khai: /login
│   │   ├── (app)/              # Màn hình chính có navigation: /, /stats, /vocab, /profile
│   │   ├── (focus)/            # Màn hình làm bài tập trung: /practice/[id], /review
│   │   ├── exam/               # Chế độ thi thử đọc hiểu: Part 5, 6, 7 (/exam)
│   │   └── admin/              # Cổng kiểm duyệt: /admin/review (Role=admin)
│   ├── components/ui/          # Thư viện UI Swiss Precision tuân thủ Design Tokens
│   ├── core/                   # Pure Domain Logic (ts-fsrs, Wilson, Practice Reducer)
│   ├── features/               # Module hóa theo tính năng (Practice, Vocab, Review, Exam, Admin)
│   └── lib/                    # Supabase client/server helper & utility functions
├── supabase/migrations/        # 17 migrations Postgres, RLS policies & RPC functions
└── tests/                      # Bộ kiểm thử tích hợp, bảo mật RLS và khả năng tiếp cận WCAG
```

---

## 🎬 Kịch Bản Trải Nghiệm Nhanh (Walkthrough Demo)

1. **Đăng ký / Đăng nhập**: Truy cập `/login` để tạo tài khoản học viên và nhận ngay hồ sơ cá nhân độc lập.
2. **Luyện tập Part 5**: Tại Dashboard hoặc `/practice/new`, chọn quy mô 5 câu thuộc chủ điểm _Thì động từ (Tenses)_ hoặc _Dạng từ (Word form)_. Sử dụng phím $A, B, C, D$ và $Enter$.
3. **Ôn lại lỗi sai tức thì (Drill)**: Khi kết thúc phiên làm bài có câu sai, bấm nút _Ôn lại lỗi sai (Drill)_ để giải lại ngay lập tức.
4. **Ôn tập thẻ từ vựng FSRS**: Vào mục `/review`, bấm $Space$ để lật thẻ và bấm $1, 2, 3, 4$ để ghi nhận mức độ ghi nhớ.
5. **Chế độ Thi thử Đọc hiểu (Exam Mode)**: Vào mục `/exam`, trải nghiệm bài thi TOEIC Reading hoàn chỉnh có đồng hồ đếm ngược và bảng điểm quy đổi tự động.
6. **Xem phân tích điểm yếu**: Vào mục `/stats` để theo dõi biểu đồ 14 ngày và chỉ số vững kiến thức tính theo Wilson Interval.
7. **Cổng kiểm duyệt Admin**: Đăng nhập tài khoản quyền Admin và truy cập `/admin/review` để duyệt ngân hàng câu hỏi bằng phím tắt $J/K/Y/N/E$.

---

## 📄 Bản Quyền & Giấy Phép

Phát hành theo giấy phép [MIT](LICENSE). Dự án được xây dựng phục vụ mục đích học tập, nghiên cứu kỹ thuật và phát triển giáo dục độc lập. Không liên kết chính thức hay đại diện cho Educational Testing Service (ETS).
