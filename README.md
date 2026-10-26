# TOEIC AI — Nền Tảng Luyện Thi TOEIC Thích Ứng (Adaptive Learning Platform)

> **TOEIC AI** là hệ thống luyện thi TOEIC Part 5 thông minh, cá nhân hóa lộ trình học theo từng học viên thông qua thuật toán lặp lại ngắt quãng **FSRS** (Free Spaced Repetition Scheduler) và đánh giá độ vững kỹ năng chuẩn toán học bằng **Khoảng tin cậy Wilson ($z=1.96$)**.

---

## 🌟 Tính Năng Nổi Bật (Key Features)

1. **Phiên Luyện Tập Tập Trung (Focused Practice Session)**:
   - Tùy chọn quy mô linh hoạt (5, 10, hoặc 20 câu) và chọn theo chủ điểm ngữ pháp hoặc ngẫu nhiên toàn diện.
   - Giao diện Swiss Precision tối giản, loại bỏ xao nhãng: thanh tiến độ liên tục, Focused Header, phím tắt $A, B, C, D$ và $Enter$.
   - **Bảo mật tuyệt đối**: Đáp án không bao giờ rời khỏi server trước khi người học nộp bài.
2. **Giải Thích Thích Ứng 4 Lớp Sư Phạm (Adaptive Pedagogical Explanation)**:
   - Làm đúng: Tự động thu gọn để giữ nhịp độ làm bài nhanh, có nút mở xem chi tiết.
   - Làm sai: Tự động bung toàn bộ 4 lớp giải thích chuyên sâu (Quy tắc, Lý do đúng, Phân tích 4 lựa chọn, Dịch nghĩa toàn văn, Mẹo thi và Từ vựng ăn điểm).
3. **Chế Độ Ôn Lại Lỗi Sai Tức Thì (Instant Drill Mode)**:
   - Người học được làm lại ngay các câu làm sai sau phiên để khắc sâu kiến thức.
   - **Bất biến**: Không ghi đè lịch sử `attempts` và không làm sai lệch chỉ số độ vững Wilson của người học.
4. **Sổ Từ Vựng & Thẻ Ghi Nhớ FSRS (Vocab Notebook & Spaced Repetition)**:
   - Lưu từ trực tiếp từ bảng giải thích câu hỏi chỉ bằng một chạm.
   - Hệ thống lập lịch FSRS (ts-fsrs 5.4.2) tự động tính toán thời gian ôn tập tối ưu cho 4 nút: *Lại (Again)*, *Khó (Hard)*, *Tốt (Good)*, *Dễ (Easy)*.
5. **Chẩn Đoán Điểm Yếu Chuẩn Toán Học (Wilson Score Interval)**:
   - Áp dụng cận dưới khoảng tin cậy Wilson ($z=1.96$) phân loại 16 chủ điểm ngữ pháp thành 4 trạng thái:
     - *Chưa đủ dữ liệu* ($< 5$ câu làm).
     - *Cần ôn* ($< 50\%$).
     - *Khá* ($50\% - 74\%$).
     - *Vững* ($\ge 75\%$).
6. **Cổng Quản Trị & Kiểm Duyệt Đề Thi S3–S6 (Admin Review Portal)**:
   - Giao diện chia đôi màn hình 7/12 & 5/12 với phím tắt $J/K$ (chuyển câu), $Y/N$ (duyệt/từ chối), $E$ (sửa).
   - Tự động chạy báo cáo kiểm định 4 chuẩn vàng (S3: 1 chỗ trống duy nhất, S4: 4 phương án phân biệt, S5: đáp án hợp lệ, S6: giải thích đầy đủ cấu trúc).
7. **Bộ Cào Đề Thi Tự Động (ETS Crawler & Ingestion Pipeline)**:
   - Hỗ trợ bóc tách đề từ văn bản thô, file Word/PDF, hoặc sao chép từ web (Study4, Prep, Toeic123).
   - Tự động phân loại ngữ pháp vào 16 chủ điểm chuẩn ETS và nạp an toàn vào cơ sở dữ liệu.

---

## 🛠️ Yêu Cầu & Cài Đặt (Getting Started)

### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản `>= 20.0.0` (Khuyến nghị Node.js v22+).
- **Trình quản lý gói**: `npm`.

### 2. Cài đặt mã nguồn
```bash
git clone https://github.com/Bachchuy/learning-toeic.git
cd learning-toeic
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env.local` từ mẫu `.env.example`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Khởi tạo Cơ sở Dữ liệu & Dữ liệu Mẫu
```bash
# Di chuyển schema, khởi tạo các hàm RPC và nạp ngân hàng câu hỏi chuẩn ETS
npm run db:setup

# (Tùy chọn) Bóc tách và nạp thêm đề ETS từ file văn bản
npm run db:crawl -- --file data/sample-ets-test.txt
```

### 5. Chạy môi trường phát triển
```bash
npm run dev
```
Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

---

## 🛡️ Bộ Cổng Chất Lượng (Quality Gates & Verification)

Dự án áp dụng quy trình kiểm soát chất lượng chuẩn kỹ thuật:

```bash
# 1. Kiểm tra cú pháp và phong cách mã (ESLint) - 0 errors, 0 warnings
npm run lint

# 2. Kiểm tra kiểu dữ liệu tĩnh nghiêm ngặt (TypeScript strict mode)
npm run typecheck

# 3. Chạy toàn bộ 96 unit, integration và security test suites (Vitest)
npm run test

# 4. Kiểm tra biên dịch bản phát hành sản phẩm (Next.js Turbopack Production Build)
npm run build
```

---

## 🏛️ Cấu Trúc Mã Nguồn (Architecture Overview)

```
learning-toeic/
├── data/                       # Dữ liệu đề thi ETS mẫu dùng cho crawler
├── docs/                       # Tài liệu Master Blueprint, ADR và tài liệu kỹ thuật
│   ├── INDEX.md                # Bản đồ điều hướng tài liệu (đọc đầu tiên)
│   ├── 04-business-rules.md    # Đặc tả nghiệp vụ toán học & logic học tập
│   ├── 05-design/              # Design tokens, components & responsive specs
│   ├── 06-architecture.md      # Thiết kế Postgres, RLS, RPC & Server Actions
│   ├── 13-crawler-guide.md     # Hướng dẫn cào & bóc tách đề thi ETS
│   └── qa/m12-audit-report.md  # Báo cáo kiểm định WCAG 2.1 AA & RLS
├── scripts/                    # Scripts migration, seed dữ liệu, cào đề và AI generation
│   ├── crawler-ets.ts          # Công cụ cào & bóc tách đề thi ETS tự động
│   ├── seed-batch-questions.ts # Nạp gói 64 câu hỏi Part 5 tuyển chọn
│   └── generate-questions-pipeline.ts # Pipeline tích hợp LLM sinh câu hỏi
├── src/
│   ├── app/                    # Next.js App Router (Routes & Layouts)
│   │   ├── (auth)/             # Màn hình công khai: /login
│   │   ├── (app)/              # Màn hình chính có navigation: /, /stats, /vocab, /profile
│   │   ├── (focus)/            # Màn hình làm bài tập trung: /practice/[id], /review
│   │   └── admin/              # Cổng kiểm duyệt: /admin/review (Role=admin)
│   ├── components/ui/          # Thư viện UI Swiss Precision tuân thủ Design Tokens
│   ├── core/                   # Pure Domain Logic (ts-fsrs, Wilson, Practice Reducer)
│   └── features/               # Module hóa theo tính năng (Practice, Vocab, Review, Admin)
├── supabase/                   # Migrations Postgres, RLS policies & RPC functions
└── tests/                      # Bộ kiểm thử tích hợp, bảo mật RLS và khả năng tiếp cận WCAG
```

---

## 🎬 Kịch Bản Trải Nghiệm Demo (Demo Walkthrough)

1. **Đăng nhập / Đăng ký**: Truy cập `/login`, tạo tài khoản học viên để nhận ngay hồ sơ cá nhân độc lập.
2. **Khởi tạo phiên luyện tập**: Tại Dashboard hoặc `/practice/new`, chọn quy mô 5 câu và chọn chủ điểm *Thì động từ (Tenses)* hoặc *Dạng từ (Word form)*.
3. **Trải nghiệm làm bài**:
   - Sử dụng phím $A, B, C, D$ và $Enter$.
   - Khi chọn sai, quan sát phần giải thích tự động mở bung 4 lớp và nhấn nút *Lưu từ* để thêm từ vựng mới vào sổ.
4. **Chế độ Drill**: Khi hoàn thành phiên, nếu có câu sai, bấm nút *Ôn lại lỗi sai (Drill)* để giải lại ngay lập tức.
5. **Ôn tập ngắt quãng FSRS**: Vào mục `/review`, bấm $Space$ để lật thẻ và bấm $1, 2, 3, 4$ để ghi nhận độ khó ghi nhớ.
6. **Xem báo cáo chẩn đoán**: Vào mục `/stats` để quan sát biểu đồ tiến độ học tập 14 ngày và chỉ số vững kiến thức theo từng chủ điểm.
7. **Cổng kiểm duyệt Admin**: Đăng nhập với tài khoản admin và truy cập `/admin/review` để duyệt hàng đợi câu hỏi bằng phím tắt $J/K/Y/N/E$.

---

## 📄 Bản Quyền & Giấy Phép

Dự án được xây dựng phục vụ mục đích nghiên cứu và giáo dục độc lập. Không liên kết chính thức hay đại diện cho Educational Testing Service (ETS).
