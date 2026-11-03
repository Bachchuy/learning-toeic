# PROJECT_CONTEXT.md — BỘ NHỚ KIẾN TRÚC & LUỒNG DỮ LIỆU DỰ ÁN

> **Mục đích:** Tài liệu nạp nhanh kiến trúc hệ thống, bản đồ luồng dữ liệu liên hoàn (Data Flows), và các ranh giới bất khả xâm phạm. Giúp AI và Developer giữ vững ngữ cảnh, ngăn ngừa trôi lệch ngữ cảnh (Context Drift).

---

## 1. Tóm Lược Sản Phẩm & Core Stack

- **Sản phẩm:** Nền tảng học & luyện đề TOEIC Part 5 thông minh, giải thích ngữ pháp thích ứng, lặp lại ngắt quãng FSRS, đo lường năng lực Adaptive Rolling Mastery (Wilson).
- **Frontend / Framework:** Next.js 16.4.3 (App Router, Turbopack, React 19, Server Components mặc định).
- **Styling & Tokens:** Tailwind CSS v4, Lucide React, Design Tokens độc quyền (Swiss LearningGrid, không màu ngoài bảng token, viền input `#8190A6`).
- **Backend / Database:** Supabase Postgres, SSR Cookie Auth (`@supabase/ssr`), Row Level Security (RLS) 100% bảng, Server RPC functions.
- **Core Algorithms (`src/core/`):** 
  - `ts-fsrs` (5.4.2) chạy server-side;
  - Adaptive Rolling Mastery (Wilson z=1.0, rolling window 20, fast-track n>=8 & >=90% - D-25);
  - State reducer cho bài luyện tập (`practiceReducer.ts`).
- **Testing Suite:** Vitest 5 (Unit & Invariants), Playwright 1.64 (E2E), axe-core (A11y compliance).

---

## 2. Bản Đồ 5 Luồng Dữ Liệu Liên Hoàn (End-to-End Data Flows)

### Flow 1: Xác thực & Điều hướng bảo vệ (Auth & Protected Routes)
```
User nhập email/password
  └─► /login (Client Form Validation: email format, required password)
        └─► Supabase Auth: signInWithPassword
              └─► Thiết lập Cookie phiên SSR (setAll cookies trong cookie store)
                    └─► src/middleware.ts chặn và kiểm soát mọi request:
                          ├─► Đã login + vào /login -> Chuyển hướng về / hoặc ?next=
                          ├─► Chưa login + vào route bảo vệ -> Chuyển hướng về /login?next=<path>
                          ├─► Audio public route (/api/audio/*) -> Cho qua không cần auth
                          └─► Refresh trang -> middleware tự động làm mới token session
```

### Flow 2: Phiên Làm Bài & Bảo Vệ Đáp Án (Practice & Question Shielding)
```
Người dùng chọn chủ điểm & quy mô (5/10/20 câu) tại /practice/new
  └─► Gọi RPC create_session(topic_id, size)
        └─► Server lấy danh sách câu hỏi: CHỈ gồm id, stem, 4 options, tag_id, difficulty
              ⚠️ TUYỆT ĐỐI KHÔNG gửi correct_index và explanation về Client
  └─► Client nạp vào practiceReducer (state thuần túy trên client)
  └─► Người dùng chọn phương án -> Bấm "Nộp bài" (Enter / Click)
        └─► Gọi RPC submit_answer(session_id, question_id, selected_index)
              ├─► Server so khớp với bảng question_answers (RLS cấm client SELECT)
              ├─► Ghi 1 bản ghi vào bảng attempts (Nguồn sự thật duy nhất tính Mastery)
              └─► Trả về kết quả: correct, explanation thích ứng (sai: full; đúng: collapsed), vocab_hints
  └─► Màn hình kết quả (/practice/[id]/result):
        ├─► Nút "Luyện lại câu sai" (Drill)
        └─► Drill chạy 100% Client-side: KHÔNG ghi DB, KHÔNG đổi Mastery (Bất biến tối thượng)
```

### Flow 3: Ôn Tập Lặp Lại Ngắt Quãng FSRS (Spaced Repetition)
```
Truy cập /review
  └─► Server truy vấn review_cards WHERE due_date <= NOW()
  └─► Thẻ hiển thị mặt trước -> Người dùng bấm Lật thẻ (Space)
  └─► 4 nút chấm điểm (60px): Lỗi (Again) - Khó (Hard) - Tốt (Good) - Dễ (Easy)
        └─► Gọi Server Action / API tính toán lịch ôn bằng ts-fsrs (v5.4.2)
              ├─► Ghi lịch sử chấm thẻ vào card_reviews (Append-only, không xóa/sửa)
              └─► Cập nhật state thẻ trong review_cards (stability, difficulty, scheduled_days, due)
```

### Flow 4: Sổ Từ Vựng (Vocabulary Notebook)
```
Người dùng xem giải thích câu hỏi -> Thấy các Word Chip từ vocab_hints
  └─► Bấm vào Chip -> Mở Bottom Sheet (Mobile 360px) hoặc Dialog (Desktop 1280px)
        └─► Bấm "Lưu vào sổ" -> Ghi vào bảng vocab_entries
              ⚠️ Ràng buộc Unique Constraint: (user_id, lemma)
              ├─► Nếu từ mới: Lưu thành công, hiển thị Toast thông báo
              └─► Nếu từ đã có: Bắt lỗi 409 conflict -> Thông báo thân thiện "Từ này đã có trong sổ"
```

### Flow 5: Bảng Điều Khiển & Đề Xuất (Dashboard Mastery)
```
Truy cập trang chủ /
  └─► Đọc VIEW v_skill_mastery (security_invoker):
        └─► Tính toán theo công thức Adaptive Rolling Mastery (Wilson z=1.0, window 20, fast-track):
              ├─► < 5 câu: Nhãn "Chưa đủ dữ liệu (X/5 câu)" (status.insufficient)
              ├─► < 50%: Nhãn "Cần ôn" (status.error)
              ├─► < 75%: Nhãn "Khó" (status.warning)
              └─► ≥ 75%: Nhãn "Vững" (status.success)
  └─► Đề xuất Top 3 chủ điểm yếu nhất cần luyện tập ngay
```

---

## 3. Ranh Giới Thư Mục & Phân Trách Nhiệm (Folder Boundaries)

| Thư mục | Trách nhiệm | Ranh giới cấm chạm (Boundaries) |
|---|---|---|
| `src/core/` | Thuật toán học tập thuần túy (`fsrs.ts`, `wilson.ts`, `practiceReducer.ts`, `drill.ts`). | **CẤM** gọi database, **CẤM** import Supabase client, **CẤM** dùng React hooks hay browser API. |
| `src/lib/supabase/` | Khởi tạo Supabase clients (client, server, middleware). | Chỉ cấu hình kết nối và cookie store, không chứa logic nghiệp vụ TOEIC. |
| `src/features/` | Mã nguồn nghiệp vụ phân theo tính năng (`auth`, `practice`, `review`, `vocab`, `admin`). | Chỉ tương tác qua Server Actions, RPC hoặc Core reducers; không tự viết SQL trực tiếp trên frontend. |
| `src/components/` | UI Components dùng chung (Button, Sheet, Dialog, Toast). | Phải tuân thủ Design Tokens, mobile-first 360px, chuẩn accessibility WCAG 2.1 AA. |
| `supabase/migrations/` | Nguồn sự thật duy nhất về Schema, RLS và hàm RPC. | Mọi thay đổi cấu trúc bảng hoặc RLS phải thông qua migration file có timestamp. |

---

## 4. Tóm Tắt Các Bảng CSDL Cốt Lõi (Database Entities)

- `profiles`: Lưu thông tin người dùng, `target_score`, `role` (user/admin). Client không có quyền sửa `role`.
- `questions`: Đề bài, 4 options, `tag_id`, trạng thái (`published`/`retired`). Không chứa đáp án.
- `question_answers`: `correct_index`, `explanation` JSON. CẤM cấp quyền SELECT cho `anon` và `authenticated`.
- `practice_sessions`: Lưu phiên làm bài, người dùng, thời gian bắt đầu, trạng thái.
- `attempts`: Lưu từng lần trả lời chính thức. Nguồn dữ liệu DUY NHẤT để tính toán Mastery.
- `vocab_entries`: Sổ từ vựng cá nhân, unique `(user_id, lemma)`.
- `review_cards`: Trạng thái thẻ FSRS (stability, difficulty, due, reps, lapses).
- `card_reviews`: Lịch sử chấm thẻ FSRS (append-only audit log).
- `question_reports`: Báo lỗi câu hỏi; tự động rút câu hỏi khi có 3 báo lỗi cùng lý do.
