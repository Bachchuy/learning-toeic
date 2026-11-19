# Tôi Yêu Em Íc — Nền Tảng Luyện Thi TOEIC Thích Ứng (Adaptive Learning Platform)

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live_Demo-learning--toeic.vercel.app-0070F3?style=flat-square&logo=vercel)](https://learning-toeic.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x_Strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_RLS-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-267_Passed-6E9F18?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E_%2B_Axe_A11y-45ba4b?style=flat-square&logo=playwright)](https://playwright.dev/)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-4338CA?style=flat-square)](https://www.w3.org/WAI/WCAG21/quickref/)
[![License](https://img.shields.io/badge/License-MIT-gray?style=flat-square)](LICENSE)

**Nền tảng luyện thi TOEIC thích ứng cá nhân hóa ("Tôi Yêu Em Íc — Học TOEIC Dễ Dàng") tích hợp thuật toán lặp lại ngắt quãng FSRS, đánh giá độ vững ngữ pháp chuẩn toán học Adaptive Rolling Mastery (Wilson Score Interval) và bảo mật dữ liệu cấp cơ sở dữ liệu (Database-level RLS & Anti-Oracle).**

[Tính Năng](#-tính-năng-nổi-bật-key-features) • [Nguyên Lý Cốt Lõi](#-nguyên-lý-thiết-kế-cốt-lõi-core-principles) • [Cài Đặt](#-hướng-dẫn-cài-đặt-getting-started) • [Kiến Trúc](#-cấu-trúc-mã-nguồn-architecture-overview) • [Kiểm Thử](#-hệ-thống-kiểm-thử--chất-lượng-quality-gates)

</div>

---

## 💡 Nguyên Lý Thiết Kế Cốt Lõi (Core Principles)

Đa số ứng dụng luyện thi chỉ dừng lại ở việc chấm Đúng/Sai và hiển thị đáp án. **Tôi Yêu Em Íc** được thiết kế theo triết lý **"Hiểu bản chất vì sao sai"** kết hợp với mô hình toán học thực chứng:

1. **Không rò rỉ đáp án & Chống khai thác đáp án (Zero-Leak & Anti-Oracle Security)**:
   - Đáp án đúng (`question_answers`, `exam_set_answers`) nằm tại các bảng riêng biệt với chính sách **Row-Level Security (RLS)** khóa hoàn toàn quyền `SELECT` từ client (`anon`, `authenticated`).
   - Toàn bộ việc chấm điểm diễn ra tại PostgreSQL `SECURITY DEFINER` RPC (cố định `SET search_path = public, pg_temp`) và Server Actions. Với bài thi thử, các câu bỏ trống (`unanswered`) tự động ẩn đáp án và lời giải để ngăn hành vi nộp bài trắng thu thập đề.
2. **Đo lường năng lực chuẩn xác (Adaptive Rolling Mastery — Wilson Score Lower Bound)**:
   - Thay vì dùng tỷ lệ phần trăm trung bình cộng dễ gây ảo tưởng khi mẫu nhỏ, hệ thống tính **cận dưới khoảng tin cậy Wilson ($z=1.0$, cửa sổ trượt 20 câu gần nhất)** kết hợp cơ chế **Fast-track** ($n \ge 8$ câu và độ chính xác $\ge 90\%$) để phản ánh trung thực năng lực hiện tại.
3. **Ghi nhớ từ vựng tối ưu (FSRS Spaced Repetition)**:
   - Tích hợp thuật toán Free Spaced Repetition Scheduler (`ts-fsrs` 5.4.2) trên server, đi kèm **Kệ Sổ 3 Tầng** và chế độ **Ôn tập tự do (Cram Mode / `studyAll`)** cho phép học viên chủ động ôn lại từ vựng trước hạn bất cứ lúc nào.
4. **Ngôn ngữ thiết kế Precision Swiss**:
   - Giao diện tối giản, phẳng, viền `1px` sắc nét, tối ưu khả năng tập trung đọc hiểu, đạt chuẩn tương phản thị giác **WCAG 2.1 AA**, tối ưu vùng chạm di động $\ge 44\text{px}$ từ màn hình `360px` đến `1280px` và hỗ trợ phím tắt bàn phím toàn diện.

---

## 🌟 Tính Năng Nổi Bật (Key Features)

### 1. Lộ Trình Ngữ Pháp 4 Chặng & Lý Thuyết Chuyên Sâu (`/learn`, `/learn/[tagCode]`)
- Hệ thống hóa **16 chủ điểm ngữ pháp TOEIC trọng tâm** chia theo 4 chặng lộ trình từ Nền tảng đến Chinh phục $750+$.
- Mỗi bài học tích hợp lý thuyết cấu trúc, công thức nhận diện nhanh, bảng từ khóa xuất hiện trong đề thi thật, bộ câu hỏi mini-check tương tác và chức năng tô sáng (highlight) ghi chú cá nhân.

### 2. Phiên Luyện Tập Tập Trung & Giải Thích Thích Ứng 4 Lớp (`/practice/new`, `/practice/[id]`)
- Tùy chọn quy mô linh hoạt (5, 10, 20 câu) cho Part 5 hoặc luyện đọc đoạn văn Part 6 & Part 7 (`/reading/[id]`).
- **Làm đúng**: Hiển thị phản hồi gọn gàng để giữ nhịp độ giải đề, có thể bấm mở rộng khi cần.
- **Làm sai**: Tự động bung 4 lớp giải thích sư phạm: _Quy tắc cốt lõi_, _Phân tích ngữ cảnh câu_, _Phân tích bẫy của 4 phương án A/B/C/D_, _Dịch nghĩa toàn văn_ và _Chip lưu nhanh từ vựng ăn điểm_.
- **Chế độ Ôn lại lỗi sai tức thì (Instant Drill Mode)**: Làm lại ngay các câu vừa sai hoàn toàn tại client — **bất biến** không ghi vào bảng `attempts` và không làm nhiễu chỉ số độ vững Wilson.

### 3. Kệ Sổ Từ Vựng 3 Tầng & 5 Chế Độ Ôn Tập FSRS (`/vocab`, `/review`)
- **Kho 4 Bộ Thẻ Chuẩn (3.230+ từ vựng & thành ngữ)**: _Từ vựng ETS TOEIC (1.725 từ)_, _600 Từ vựng thiết yếu Barron's (615 từ / 50 chủ điểm)_, _Thành ngữ TOEIC 800+ (115 cụm)_, và _Tiếng Anh CNTT & Phần mềm (775 từ, có công tắc tách/gộp lịch FSRS)_.
- **3 trạng thái tiến độ FSRS minh bạch**: Phân biệt rõ **`Chưa nạp vào sổ` (0%)**, **`Mới nạp · Chờ học` (0%)**, và **`Cần ôn hôm nay` / `✓ Đã ôn xong hôm nay` (100%)**. Hỗ trợ **1-Click Nạp & Ôn tập** tự động.
- **5 chế độ ôn tập đa giác quan tại `/review`**: _Đoán từ (Typing Active Recall)_, _Flashcard 2 mặt_, _Trắc nghiệm 4 lựa chọn_, _Trắc nghiệm đảo chiều_, và _Lặp lại phát âm (Speaking)_. Hỗ trợ **Ôn lại trước hạn (Free Review / Cram Mode)** ngay cả khi đã hoàn thành hết thẻ đến hạn trong ngày.

### 4. Phòng Thi Thử TOEIC Reading & Listening Chuẩn ETS (`/exam`)
- **Phòng thi Reading (`/exam/[slug]`)**: 100 câu (Part 5, 6, 7) trong 75 phút, giao diện chia đôi màn hình bài đọc – câu hỏi, tự động lưu nháp phiên thi vào `localStorage`.
- **Phòng thi Listening (`/exam/[slug]/listening`)**: 100 câu (Part 1 Mô tả tranh, Part 2 Hỏi – Đáp 3 lựa chọn A–C, Part 3 Hội thoại ngắn, Part 4 Bài nói chuyện) trong 45 phút với trình phát âm thanh đa giọng đọc (`en-US` Nam/Nữ, chỉnh tốc độ `0.85x / 1.0x / 1.15x`) và công tắc xem Transcript khi tự học.
- **Chấm điểm & Lịch sử thi (`/exam#history`)**: Quy đổi điểm tham chiếu chuẩn thang $5 - 495$, thống kê thời gian làm bài và lưu lịch sử điểm cao nhất theo từng kỹ năng.

### 5. Thống Kê Độ Vững 16 Chủ Điểm & Chuỗi Ngày Học (`/`, `/stats`)
- Theo dõi tiến độ học tập qua 4 mức năng lực Adaptive Rolling Mastery: _Chưa đủ dữ liệu (< 5 câu)_, _Đang hổng (< 50%)_, _Đang củng cố (50% – 74%)_, và _Đã vững ($\ge 75\%$ hoặc Fast-track)_.
- Biểu đồ tần suất luyện tập 14 ngày gần nhất chuẩn khả năng tiếp cận (kèm bảng dữ liệu `sr-only` cho trình đọc màn hình).

### 6. Xác Thực Bảo Mật, Quản Lý Hồ Sơ & Cổng Kiểm Duyệt Admin (`/login`, `/profile`, `/admin/*`)
- Hỗ trợ đăng nhập Email/Mật khẩu, **Google OAuth**, luồng **Quên & Đặt lại mật khẩu** (`/reset-password`, `/auth/callback`), giới hạn tần suất (Server Rate Limiting) chống brute-force.
- Quản lý mục tiêu điểm số ($10 - 990$), xuất toàn bộ dữ liệu học tập cá nhân ra JSON và xóa tài khoản vĩnh viễn theo chuẩn quyền riêng tư (`/terms`, `/privacy`).
- Cổng quản trị `/admin/review` & `/admin/insights` dành riêng cho vai trò `admin` để kiểm duyệt ngân hàng câu hỏi bằng phím tắt ($J/K/Y/N/E$) và xử lý phản hồi báo lỗi từ học viên.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Tầng | Công nghệ | Mục đích & Lý do lựa chọn |
| :--- | :--- | :--- |
| **Frontend** | Next.js `16.4.6` (App Router), React `19.3.0` | Server Components, Server Actions, tối ưu hóa bundle & tốc độ tải trang |
| **Styling** | Tailwind CSS v4, Lucide Icons | Hệ thống Design Tokens Precision Swiss nhất quán, không phụ thuộc UI kit nặng |
| **Database & Auth** | Supabase (PostgreSQL, SSR Auth) | Row-Level Security (RLS) trên toàn bộ 20 bảng, `SECURITY DEFINER` RPCs |
| **Thuật toán** | `ts-fsrs` (`5.4.2`), Wilson Score ($z=1.0$) | Lập lịch ôn tập FSRS và đo lường năng lực học tập không thiên vị mẫu nhỏ |
| **Validation** | TypeScript `5.x` Strict, Zod | Kiểm tra chặt chẽ mọi đầu vào Server Actions và biên dữ liệu |
| **Kiểm thử** | Vitest, Playwright, `@axe-core/playwright`, pgTAP | 34 file unit/contract test (267 tests), E2E + WCAG 2.1 AA audit, 47 SQL RLS assertions |

---

## 🚀 Hướng Dẫn Cài Đặt (Getting Started)

### 1. Yêu cầu môi trường
- **Node.js**: Phiên bản `>= 20.0.0` (Khuyến nghị Node.js v22 LTS).
- **Trình quản lý gói**: `npm`.

### 2. Cài đặt mã nguồn
```bash
git clone https://github.com/Bachchuy/learning-toeic.git
cd learning-toeic
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env.local` từ file mẫu [`.env.example`](.env.example):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Khởi tạo Cơ sở Dữ liệu & Dữ liệu Mẫu (Local / Staging)
```bash
npm run db:setup
```

### 5. Khởi chạy ứng dụng ở chế độ phát triển
```bash
npm run dev
```
Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

---

## 🛡️ Hệ Thống Kiểm Thử & Chất Lượng (Quality Gates)

Dự án tích hợp sẵn hàng rào bảo vệ cơ sở dữ liệu (`tests/db-safety-guard.ts`): khi chạy `npm run test` thông thường, các bài kiểm thử có thao tác ghi lên Supabase thực sẽ tự động được bỏ qua an toàn (`skipped`), chỉ kích hoạt khi truyền biến môi trường `RUN_LIVE_DB_TESTS=1` trên môi trường Staging/Local cô lập.

```bash
# 1. Kiểm tra kiểu tĩnh nghiêm ngặt (TypeScript Strict Mode)
npm run typecheck

# 2. Kiểm tra quy tắc mã nguồn (ESLint - 0 errors, 0 warnings)
npm run lint

# 3. Chạy bộ Unit, Domain & Security Contract Tests (34 test files / 267 passed)
npm run test

# 4. Kiểm tra lỗ hổng bảo mật thư viện Production
npm audit --omit=dev

# 5. Kiểm tra build sản phẩm (Next.js 16 Turbopack Production Build)
npm run build

# 6. Chạy kiểm thử tích hợp DB & E2E Playwright + Axe WCAG 2.1 AA (Chỉ chạy trên Staging/Local DB)
# RUN_LIVE_DB_TESTS=1 npm run test:db
# npm run test:e2e
```

---

## 🏛️ Cấu Trúc Mã Nguồn (Architecture Overview)

```text
learning-toeic/
├── .github/workflows/
│   └── ci.yml                  # Pipeline GitHub Actions: Lint, Typecheck, Vitest & Production Build
├── e2e/                        # Kiểm thử E2E Playwright & kiểm toán khả năng tiếp cận Axe WCAG 2.1 AA
├── public/                     # Tài nguyên tĩnh: biểu tượng thương hiệu, hình minh họa, favicon
├── scripts/                    # Công cụ khởi tạo migration, nạp câu hỏi & bộ thẻ mẫu cho local/staging
├── src/
│   ├── app/                    # Next.js 16 App Router (Pages, Layouts & Route Handlers)
│   │   ├── (auth)/             # Xác thực: /login, /reset-password
│   │   ├── auth/callback/      # Trao đổi phiên PKCE cho OAuth & khôi phục mật khẩu
│   │   ├── exam/               # Phòng thi thử Reading (/exam/[slug]) & Listening (/exam/[slug]/listening)
│   │   ├── learn/              # Lộ trình ngữ pháp 4 chặng & 16 bài học chi tiết (/learn/[tagCode])
│   │   ├── practice/           # Khởi tạo & làm bài luyện tập thích ứng (/practice/new, /practice/[id])
│   │   ├── reading/            # Luyện đọc hiểu đoạn văn Part 6 & Part 7 (/reading/[id])
│   │   ├── review/             # Phòng ôn tập từ vựng FSRS 5 chế độ (/review)
│   │   ├── vocab/              # Kệ sổ từ vựng 3 tầng & thư viện 4 bộ thẻ chuẩn (/vocab)
│   │   ├── stats/              # Phân tích độ vững 16 chủ điểm & tần suất 14 ngày (/stats)
│   │   ├── profile/            # Hồ sơ học viên, xuất dữ liệu JSON & quản lý tài khoản (/profile)
│   │   ├── terms/ & privacy/   # Điều khoản sử dụng & Chính sách bảo mật công khai
│   │   └── admin/              # Cổng kiểm duyệt câu hỏi & phản hồi (/admin/review, /admin/insights)
│   ├── components/             # Hệ thống UI Precision Swiss & điều hướng AppNav
│   ├── core/                   # Pure Domain Logic (FSRS, Wilson ARM, TOEIC Scoring, Exam Evaluators)
│   ├── data/curated-decks/     # Dữ liệu 4 bộ thẻ từ vựng TOEIC & CNTT chuẩn hóa
│   ├── features/               # Các module tính năng độc lập (Server Actions, Schemas, Components)
│   └── lib/                    # Supabase SSR clients, bộ giới hạn tần suất (rateLimit) & tiện ích âm thanh
├── supabase/
│   ├── migrations/             # 26 bản nâng cấp PostgreSQL schema, RLS policies & SECURITY DEFINER RPCs
│   └── tests/                  # Bộ kiểm thử pgTAP SQL kiểm chứng bất biến RLS & công thức Wilson
└── tests/                      # Bộ kiểm thử bảo mật, chống lộ đáp án, ranh giới bundle & WCAG a11y
```

---

## 📄 Bản Quyền & Giấy Phép

Phát hành theo giấy phép [MIT](LICENSE). Dự án được xây dựng phục vụ mục đích học tập, nghiên cứu kỹ thuật và phát triển giáo dục độc lập. Không liên kết chính thức hay đại diện cho Educational Testing Service (ETS).
