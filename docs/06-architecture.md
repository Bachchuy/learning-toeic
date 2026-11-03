<!-- Trích từ Master Blueprint v1.0 · 23/10/2026 -->
<!-- Nguồn gốc: archive/master-blueprint-v1.0.md -->

## 6. Kiến trúc kỹ thuật

### 6.1 Tổng quan

**Modular monolith**: một ứng dụng Next.js (App Router, TypeScript strict) triển khai trên Vercel, dùng Supabase (Postgres, Auth, RLS, hàm RPC). Không microservice, không API server riêng, không gọi LLM khi người học làm bài.

- **Người học → Next.js**: trình duyệt gọi Server Components và Server Actions; middleware làm mới phiên đăng nhập.
- **Next.js → Supabase**: dùng phiên (JWT) của chính người dùng nên mọi truy vấn đi qua RLS; các thao tác nhạy cảm (nộp câu, tạo phiên, xem lại phiên) đi qua hàm RPC.
- **Khóa service role**: chỉ ở server, chỉ dùng cho xóa tài khoản và script nạp câu hỏi chạy trên máy bạn. Không bao giờ vào mã client.
- **Nội dung**: câu hỏi soạn ngoài ứng dụng (D-11), nạp bằng script từ JSONL vào `questions` và `question_answers`; admin duyệt qua `/admin/review`.

**Các luồng dữ liệu chính**

1. *Đăng nhập*: Supabase Auth, cookie phiên, trigger tự tạo hồ sơ, chuyển vào `/`.
2. *Làm bài*: Server Action gọi `create_session` → trả danh sách câu không kèm đáp án → client giữ trạng thái bằng reducer → mỗi lần nộp gọi `submit_answer` (kiểm tra câu thuộc phiên, ghi attempt, trả đúng/sai + đáp án + giải thích) → `finish_session` → trang kết quả gọi `get_session_review`.
3. *Drill*: chạy hoàn toàn ở client trên mảng câu sai đã có; không có lệnh ghi nào.
4. *Từ vựng và ôn tập (FSRS)*: lưu từ vào `vocab_entries` hoặc nạp từ Curated Deck (D-28); trigger tạo `review_cards` (thẻ mới, đến hạn ngay); `/review` lấy thẻ đến hạn; Server Action dùng `ts-fsrs` ở server tính toán trạng thái trí nhớ và gọi RPC `record_card_review_atomic` (D-32) cập nhật thẻ + ghi lịch sử `card_reviews` nguyên tử trong cùng 1 transaction. RLS chỉ mở quyền SELECT cho client.
5. *Đọc hiểu đoạn văn & Thi thử*: Đọc hiểu Part 6/7 nộp qua RPC `submit_passage_answers` có kiểm soát oracle leak (D-26); Thi thử `/exam/[slug]` chạy bộ đếm ngược 75 phút, nộp 100 câu qua Server Action và quy đổi thang điểm tham chiếu ETS 5-495 (D-27).
6. *Từ điển & Tra cứu*: Tra từ Free Dictionary API, ghi bộ đệm `dictionary_cache` qua Server Action bảo mật, lọc an toàn URL âm thanh (D-30).
7. *Thống kê*: view `v_skill_mastery` (Wilson) và các truy vấn đọc cho `/` và `/stats`.
8. *Admin*: phiên của tài khoản `role = admin`, RLS qua `is_admin()`; ghi `review_log`.

### 6.2 Công nghệ và quyết định

| Hạng mục | Vai trò | MVP? | Cần tự hiểu / rủi ro |
| --- | --- | --- | --- |
| Next.js + TypeScript strict | UI và logic server trong một dự án | Ngay | Server vs Client Components, Server Actions; API đổi theo phiên bản: dùng tài liệu đúng phiên bản đã cài |
| Tailwind + shadcn/ui | Hiện thực token và component | Ngay, chỉ component cần dùng | Ánh xạ token HEX sang CSS variables; không giữ style mặc định lệch thiết kế |
| Supabase Postgres | Dữ liệu, RLS, RPC | Ngay | SQL, khóa ngoại, RLS, security definer; RLS sai là rủi ro số 1; kiểm tra giới hạn gói miễn phí theo bảng giá hiện hành |
| Supabase Auth | Email, Google, cookie phiên SSR | Email ngay (M3); Google ngay sau M4 | Cấu hình OAuth redirect cho từng môi trường |
| RPC + Server Actions | Logic bảo mật gần dữ liệu | Ngay | Transaction, idempotency, Zod; kiểm thử bằng pgTAP |
| Zod | Kiểm tra dữ liệu form và JSON giải thích | Ngay | Schema giải thích phải chịu được trường thiếu |
| Vitest | Kiểm thử logic thuần | Ngay | — |
| Playwright | E2E đường chính | Từ M4 | Tránh test chập chờn |
| GitHub Actions + Vercel | CI/CD, hosting | CI từ M1; deploy từ M4 | Tách staging và production |
| Sentry (PDF đề xuất) | Quan sát lỗi | Có thể sau | Không ghi nội dung câu trả lời |
| Pipeline AI Python/FastAPI | Sinh và kiểm duyệt đề hàng loạt | **Hoãn** (D-11, D-12) | Chi phí, chất lượng, bản quyền; làm khi có số liệu thật |
| ts-fsrs (FSRS) | Lập lịch ôn tập ngắt quãng, xem trước giờ hẹn cho 4 mức chấm | Ngay (M8, D-32) | Chạy tại server; atomic RPC `record_card_review_atomic`; client không được tự ý sửa state FSRS |
| Free Dictionary API | Tra từ điển, IPA, phát âm audio | Mở rộng (D-30) | Lưu cache tại `dictionary_cache`, kiểm tra an toàn URL âm thanh, giảm tải mạng |

### 6.3 Route

| Route | Quyền | Render | Module |
| --- | --- | --- | --- |
| `/login`, `/auth/callback` | Công khai | Form Client; callback là Route Handler | auth |
| `/terms`, `/privacy` | Công khai | Server | (đề xuất, cho dòng pháp lý) |
| `/` | Đăng nhập | Server | stats, review, practice |
| `/practice/new` | Đăng nhập | Server + Client nhỏ | practice |
| `/practice/[sessionId]` | Chủ phiên | Server lấy dữ liệu + Client Runner | practice, explanation, vocab |
| `/practice/[sessionId]/result` | Chủ phiên | Server + Client cho Drill | practice |
| `/vocab` | Đăng nhập | Server + Client (tìm kiếm, sửa tại chỗ) | vocab |
| `/review` | Đăng nhập | Client | review |
| `/stats` | Đăng nhập | Server | stats |
| `/profile` | Đăng nhập | Server + Client form | profile |
| `/admin/review` | Admin | Server + Client (phím tắt) | admin |
| `/reading/[id]` | Đăng nhập | Server + Client | reading (Part 6/7 Passages) |
| `/exam` | Đăng nhập | Server | exam (Danh sách đề thi thử) |
| `/exam/[slug]` | Đăng nhập | Client Runner (FOCUSED 75m) | exam (ETS Exam Simulator) |
| `/learn` | Đăng nhập | Server | learn (16 bài học ngữ pháp) |
| `/learn/[tagCode]` | Đăng nhập | Server | learn (Chi tiết bài học) |
| `/api/audio/tts` | Đăng nhập | Route Handler | audio (Phát âm dự phòng) |

Nhóm route: `(auth)` công khai; `(app)` có thanh điều hướng; `(focus)` ẩn điều hướng (`/practice/[sessionId]`, `/review`); `(admin)` có layout kiểm tra role (chỉ phục vụ giao diện; bảo mật thật là RLS).

### 6.4 Quy tắc code

- **Server Component là mặc định.** Chỉ đặt `"use client"` ở lá cây khi cần: phím tắt, reducer của phiên, Sheet, lật thẻ, sửa tại chỗ, Drill, phím tắt admin.
- Đọc dữ liệu ở Server Component; ghi qua Server Action (D-14); sau khi ghi gọi `revalidatePath`. Không truyền đáp án xuống client trước khi nộp. Không import module chỉ dành cho server vào client.
- **Trạng thái giao diện**: reducer thuần cho phiên làm bài (answering, submitting, feedback, error, finished); bộ lọc và tab ở URL; state cục bộ cho Sheet và Dialog; không dùng Redux hay Zustand.
- **Form**: form HTML + Server Action + Zod; validation phía client chỉ để phản hồi nhanh, server luôn kiểm tra lại; Server Action trả một dạng thống nhất (thành công hoặc lỗi theo từng trường).
- **Loading và lỗi**: mỗi route có `loading.tsx` (skeleton), `error.tsx` (nút Thử lại), `not-found.tsx`; trạng thái rỗng làm thành component dùng chung.
- **Kích thước**: một component khoảng 150 đến 250 dòng; logic thuần ở `core/`; tách phần hiển thị và phần xử lý.

### 6.5 Cấu trúc thư mục

```
toeic-ai/
├─ AGENTS.md                 # bất biến và quy tắc cho AI coding
├─ src/
│  ├─ app/
│  │  ├─ (auth)/login/
│  │  ├─ auth/callback/route.ts
│  │  ├─ (app)/              # có nav: /, practice/new, vocab, stats, profile, result
│  │  ├─ (focus)/            # ẩn nav: practice/[sessionId], review
│  │  └─ (admin)/admin/review/
│  ├─ features/              # auth, practice, vocab, review, stats, profile, admin, reading, exam, learn, dictionary
│  │  └─ <feature>/ components/ actions.ts queries.ts schemas.ts
│  ├─ core/                  # hàm thuần: sm2, mastery, scoring, practiceReducer, drill
│  ├─ components/ui/         # shadcn và primitive theo token
│  ├─ lib/supabase/          # browser, server, admin (admin chỉ ở server)
│  ├─ lib/track.ts
│  └─ types/database.ts      # sinh tự động từ schema
├─ supabase/{migrations,tests,seed}/
├─ data/questions/           # JSONL câu hỏi có phiên bản
├─ scripts/                  # import-questions
├─ e2e/  docs/{adr,specs,qa,security}/  .github/workflows/
```

`core/` là chỗ kiểm thử rẻ nhất (không phụ thuộc framework hay DB). `features/` giúp giao việc cho AI theo phạm vi file rõ ràng. `supabase/` là nguồn sự thật của schema: không sửa schema bằng giao diện web mà quên ghi lại.

### 6.6 Mô hình dữ liệu

| Thực thể | Mục đích và quan hệ | Gốc hay tính toán | Quyền |
| --- | --- | --- | --- |
| `profiles` | Tên hiển thị, `target_score` 10–990, `role`; 1–1 với người dùng Auth | Gốc | Người dùng sửa tên và điểm mục tiêu của mình, không sửa `role` |
| `grammar_tags` | 16 chủ điểm cố định | Gốc (seed) | Đọc: đăng nhập; ghi: admin |
| `questions` | Stem, 4 lựa chọn, tag, độ khó, trạng thái `draft`, `needs_review`, `published`, `retired`, `content_hash` | Gốc | Người học đọc `published`; admin đọc/ghi tất cả |
| `question_answers` | `correct_index` + giải thích JSON (kèm `vocab_hints`) | Gốc | Không có policy cho người học; chỉ qua RPC |
| `practice_sessions`, `session_questions` | Phiên và danh sách câu của phiên | Gốc | Chủ phiên |
| `attempts` | Mỗi lần nộp chính thức, có snapshot `tag_id` (ADR-009) | Gốc, nguồn duy nhất của thống kê | Đọc của mình; ghi qua `submit_answer` |
| `vocab_entries` | Từ, nghĩa, câu ngữ cảnh, câu nguồn; duy nhất theo (người dùng, lemma) | Gốc | Chủ sở hữu |
| `review_cards` | Trạng thái FSRS của thẻ: `stability`, `difficulty`, `state`, `due`, `last_review`, `reps`, `lapses` | Gốc | Chủ sở hữu |
| card\_reviews | Một dòng mỗi lần chấm thẻ: thẻ, mức chấm (Lại/Khó/Tốt/Dễ), thời điểm, trạng thái thẻ trước khi chấm (D-23) | Gốc, chỉ thêm, không sửa | Chủ sở hữu đọc; ghi qua giao dịch chấm thẻ |
| `question_reports` | Lý do, ghi chú, trạng thái; trigger rút câu sau 3 báo cùng lý do | Gốc | Người học thêm và đọc của mình; admin xử lý |
| `review_log` | Quyết định của admin | Gốc | Chỉ admin |
| `events` | Tên sự kiện thuộc danh sách đóng (D-08), không ghi nội dung câu trả lời | Gốc | Thêm và đọc của mình |
| `generation_batches` | Lô sinh đề và chi phí | Hoãn | Chỉ admin |
| Độ vững, chuỗi ngày, số thẻ đến hạn, hoạt động 14 ngày | Hiển thị Dashboard và `/stats` | **Tính toán** từ `attempts` và `review_cards` | Chỉ đọc |
| Drill | Trạng thái ôn lại tạm thời | **Không lưu DB** | — |

**Hàm RPC**: `create_session`, `submit_answer` (phiên bản có kiểm tra câu thuộc phiên và ghi `tag_id`), `finish_session`, `get_session_review`; hàm `is_admin()`; hàm `wilson_lower`; view `v_skill_mastery` dùng `security_invoker`.

**Chấm thẻ (FSRS)**: Server Action đọc trạng thái thẻ từ DB, dùng ts-fsrs tính trạng thái mới rồi ghi `review_cards` và `card_reviews` trong một giao dịch (RPC kiểm tra thẻ thuộc người gọi). Client không gửi trạng thái lịch tự tính.

**Bản vá bắt buộc khi viết migration** (PDF mục 14): policy `profiles` không cho tự đổi `role`; bảng `session_questions`; bật RLS cho mọi bảng (kể cả `grammar_tags`, `generation_batches`); trigger tạo hồ sơ khi đăng ký, trigger tạo thẻ ôn khi lưu từ, trigger rút câu khi đủ 3 báo cáo; thu hồi quyền thực thi hàm với `anon`.

### 6.7 Bảo mật và quyền riêng tư

- Mọi bảng bật RLS và có test; mọi view dùng `security_invoker`; client không đọc được cột đáp án (kiểm tra bằng cách gọi API trực tiếp, không chỉ tin giao diện).
- Khóa service role không bao giờ xuất hiện trong mã client; tìm tên biến trong phần mã client phải ra kết quả bằng không; quét secret trước mỗi commit và trong CI.
- Chống lấy đáp án hàng loạt bằng cách tạo nhiều phiên: giới hạn số phiên mỗi giờ và ghi nhận bất thường.
- OAuth redirect chỉ cho phép đúng domain; bật xác thực hai lớp cho tài khoản Supabase, GitHub, Vercel và tài khoản admin; giới hạn tần suất đăng nhập và các endpoint ghi.
- Ghi chú báo lỗi là dữ liệu người dùng: tham số hóa truy vấn, không bao giờ đưa vào prompt hay thực thi.
- Quyền riêng tư: chỉ thu thập email, tên hiển thị, điểm mục tiêu, dữ liệu học tập; cho phép xuất và xóa (xóa tài khoản kéo theo xóa dữ liệu nhờ `ON DELETE CASCADE`); chính sách viết bằng ngôn ngữ dễ hiểu và nêu việc theo dõi sự kiện.

### 6.8 Môi trường và cấu hình

Ba môi trường tách biệt: **local** (Supabase CLI), **staging**, **production** (database riêng cho từng môi trường). Biến môi trường chỉ lấy từ `.env.local` hoặc cấu hình nền tảng; có `.env.example` không chứa giá trị thật; khóa được xoay vòng định kỳ và tách theo môi trường.

