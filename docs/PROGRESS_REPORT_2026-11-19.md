# BÁO CÁO TỔNG HỢP TIẾN ĐỘ DỰ ÁN: TỪ KIỂM TOÁN BAN ĐẦU ĐẾN HOÀN THÀNH BATCH 8

> **Tên thương hiệu:** Tôi Yêu Em Íc  
> **Ngày lập báo cáo:** 2026-11-19  
> **Base commit:** `main` @ `adc8b7e`  
> **Trạng thái hiện tại:** `READY_FOR_REVIEW` / `READY_FOR_CODEX_REVIEW` *(chưa tự đánh dấu `ACCEPTED`)*  
> **Bàn giao kỹ thuật chi tiết:** [.ai/HANDOFF.md](../.ai/HANDOFF.md) · **Kế hoạch phục hồi:** [RECOVERY_PLAN.md](RECOVERY_PLAN.md)

---

## 1. Tóm tắt điều hành (Executive Summary)

Toàn bộ chu trình phục hồi kỹ thuật **Post-Audit Recovery (Batch 0 → Batch 8)**, chuẩn hóa thương hiệu **"Tôi Yêu Em Íc"**, kiểm định UI/UX trên Figma, và vá bảo mật trực tiếp trên Supabase (`etcpholhbhtpttbuackx`) đã được triển khai đầy đủ qua **9 Batch** (`Batch 0`–`Batch 7` + `Batch 8` Đợt A, Đợt B, Đợt C) cùng **2 SQL migrations P0/P1** đã áp dụng thành công trên database.

### Các kết quả nổi bật nhất
- **An toàn dữ liệu & chống rò đáp án (Zero Data Leak):** Đã đóng lỗ hổng `submit_passage_answers` overload, khôi phục hợp đồng `get_session_review`, khóa RLS `practice_sessions`/`session_questions` về `FOR SELECT`, chặn bypass `POST /login` (`Next-Action`), đóng 100% cảnh báo `function_search_path_mutable` và `anon_security_definer_function_executable` trên Supabase Advisors, và áp dụng F2 anti-oracle cho cả **Reading** lẫn **Listening** `/exam`.
- **An toàn vận hành & Kiểm thử tự động:** Tách biệt test offline và test DB live khỏi production (`etcpholhbhtpttbuackx`), thêm 8 test file mới nâng bộ kiểm thử offline Vitest từ `26 files / 213 tests` lên **`34 files / 266 passed | 16 skipped (282)`**, bổ sung `@axe-core/playwright` (`WCAG 2.1 AA`) và bộ kiểm thử SQL `pgTAP` (`47` assertions trong `supabase/tests/`).
- **Hoàn thiện sản phẩm & UX:** Thống nhất thương hiệu `"Tôi Yêu Em Íc"` (giữ 100% token màu gốc Precision Swiss), làm gọn Dashboard, hoàn thiện trang Pháp lý (`/terms`, `/privacy`), luồng Quên mật khẩu + Google OAuth, giới hạn tần suất máy chủ (`rateLimit.ts`), Lịch sử điểm thi (`/exam#history`), Phòng thi **Listening Part 1–4** (`/exam/[slug]/listening`), và tách 2 God Component khổng lồ (`vocab-list-view.tsx`: `2,829 → 1,972` dòng; `lesson-detail-view.tsx`: `1,701 → 697` dòng).

---

## 2. Lộ trình thực hiện từ ngày đầu đến hiện tại

### Giai đoạn 1 — Kiểm toán toàn diện, Thẩm định & Hợp nhất tri thức
1. **Full Project Audit & Independent Review (`MD-01`–`MD-07`):**
   - Phát hiện và phân loại **15 nguyên nhân gốc (`RC-01`–`RC-15`)** về bảo mật RPC/RLS, rò đáp án, lỗi tích hợp stats/profile/vocab/review/admin, phình bundle `/learn`, overflow mobile `360px`, và phần roadmap còn thiếu.
   - Áp dụng **7 hiệu chỉnh từ đánh giá phản biện (`MD-01`–`MD-07`)**: đóng bypass `POST /login` với `Next-Action`, hạ `practice_sessions` RLS xuống `FOR SELECT`, từ chối view cũ `v_skill_mastery` (`z=1.96`) để giữ ARM `D-25` (`z=1.0`, window `20`), giữ `audio.tflat.vn` + TTS nội bộ `/api/audio/tts`, lọc trước lemma đã có khi nạp bộ thẻ, bỏ fallback JSON không chấm được ở `/exam/[slug]`, và gộp các bản vá DB thành SQL migration nguyên tử.
2. **Hợp nhất hệ thống tài liệu 3 tầng:**
   - **Layer 1:** [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) (điểm vào ngắn gọn, quy tắc tải ngữ cảnh & bất biến).
   - **Layer 2:** [docs/RECOVERY_PLAN.md](RECOVERY_PLAN.md) (kế hoạch từng Batch + chỉ mục bằng chứng `RC-01..15`).
   - **Layer 3:** [docs/INDEX.md](INDEX.md) và đặc tả chi tiết trong `docs/`.

---

### Giai đoạn 2 — Phục hồi lõi P0/P1/P2 (`Batch 0` → `Batch 7`)

| Batch | Mức ưu tiên | Hạng mục đã hoàn thành & kiểm chứng |
| :--- | :---: | :--- |
| **Batch 0** | P0 | Tạo hàng rào an toàn [tests/db-safety-guard.ts](../tests/db-safety-guard.ts) + tích hợp `playwright.config.ts` & `tests/remediation-integration.test.ts` chặn test đụng production `etcpholhbhtpttbuackx`; tách `npm run test` (offline) khỏi `npm run test:db`; thay thế test hằng đẳng thức Drill trong [tests/invariants-integration.test.ts](../tests/invariants-integration.test.ts). |
| **Batch 1** | P0 | Tạo và áp dụng migration **F1** [20261119000001_p0_rpc_and_rls_hardening.sql](../supabase/migrations/20261119000001_p0_rpc_and_rls_hardening.sql) trên `etcpholhbhtpttbuackx`: xóa overload 2-tham-số `submit_passage_answers`, đổi RLS `practice_sessions`/`session_questions` sang `FOR SELECT`, khôi phục object trả về của `get_session_review` (chỉ trả đáp án khi `completed_at IS NOT NULL`), lọc `part = 5 AND passage_id IS NULL` trong `create_session`, thêm `status = 'pending'` cho `check_question_reports`. Thêm Zod validator & banner `role="alert"` cho Part 6/7. |
| **Batch 2** | P0 | Vá xác thực trước `createAdminClient()` ở `submitReadingExamAction` & `lookupWordAction`; bỏ fallback JSON ở `getReadingExamAction`; áp dụng **F2 (Option A)** ẩn đáp án/bằng chứng/giải thích câu chưa trả lời trong [src/core/examReading.ts](../src/core/examReading.ts); bỏ `alert()`, gắn thông báo miễn trừ nhãn hiệu ETS trên `/exam`. |
| **Batch 3** | P1 | Sửa nút Thử lại khi `status === "error"` trong `practiceReducer.ts` & `practice-runner.tsx`; giữ `why_wrong_vi` khi parse giải thích; lọc Part 5 & phân trang chủ đề; sửa truy vấn ARM **D-25** (`ORDER BY answered_at DESC LIMIT 2000` rồi `.reverse()` sang tăng dần theo thời gian); sửa query params `?topic=`/`&count=10` giữa `/stats`, Dashboard và `/practice/new`; sửa Profile JSON export (`part_of_speech` + `card_reviews`), bỏ nhãn `"Wilson"` cũ. |
| **Batch 4** | P1 | Sửa lỗi cắt chữ regex `/^[to\s]+/i` → `/^to\s+/i` trong [src/app/api/audio/tts/route.ts](../src/app/api/audio/tts/route.ts), thêm kiểm tra auth `401`, giới hạn input `200` ký tự, cache Map `1,000` mục và `redirect: "error"`; siết whitelist URL âm thanh (`&&`) sau khi thêm `"audio.tflat.vn"` bảo toàn 100% audio bộ thẻ; chặn ghi cache rỗng cho từ vô nghĩa. |
| **Batch 5** | P1 | Bổ sung `sanitizePostgrestSearch()` chống lỗi `.or()` với ký tự đặc biệt; thực thi **F3** nhập bộ thẻ không ghi đè nghĩa/sổ người dùng và đếm chính xác từ mới; kẹp `limit (1..100)` & cập nhật `updatedPreviews` khi ôn lại thẻ trong `/review`; đồng bộ `previous_status` thật & UI state khi Admin duyệt/sửa câu hỏi. |
| **Batch 6** | P1/P2 | Khắc phục tràn ngang Bottom Nav `360px` (`grid-cols-6`); xử lý chồng lấp thanh hành động cố định ở `/admin/review`; chuẩn hóa `buttonVariants()` và loại bỏ toàn bộ **23 chỗ lồng `<Link><Button>`** qua kiểm thử tự động [tests/accessibility-audit.test.ts](../tests/accessibility-audit.test.ts). |
| **Batch 7** | P2 | Tách helper thuần `lessonExerciseUtils.ts`, `lessonHighlightUtils.ts`; tính toán lý thuyết/module tại Server Component giảm phình client bundle ở `/learn/[tagCode]` (bảo vệ qua `tests/bundle-boundaries.test.ts`); bọc `React.cache()` cho `exam/[slug]` & `reading/[id]`; xóa 7 file dead code (`curated-decks-modal.tsx`, `lib/supabase/client.ts`, `shared/index.ts`, 4 `.gitkeep`); nâng `next` & `eslint-config-next` lên **`16.4.6`** (`0` lỗ hổng runtime); thêm bước `next build` vào CI (`.github/workflows/ci.yml`). |

---

### Giai đoạn 3 — Chuẩn hóa Thương hiệu (`F5`) & Kiểm định UI/UX trên Figma
- **Thương hiệu chính thức:** **"Tôi Yêu Em Íc"** — đồng bộ toàn bộ `layout.tsx`, `BrandLogo`, `/login` và xóa các hậu tố tiêu đề trang lặp (`| TOEIC`, `| TOEIC AI`).
- **Figma Audit Board:** Xây dựng file `Tôi Yêu Em Íc — UI/UX Audit & Refinement` (`https://www.figma.com/design/fJfE9orMurMSbNJFV34Z9K`) gồm 3 trang (`01 · Brand & Design Tokens`, `02 · Core UI/UX Refinements`, `03 · Batch 8 (F6) UX Blueprints`), bảo tồn 100% bảng token màu Precision Swiss. *(Ghi chú: công cụ Mobbin MCP trả thông báo yêu cầu gói trả phí nên không dùng thay thế.)*

---

### Giai đoạn 4 — Batch 8 Hoàn chỉnh (`Wave A` → `Đợt B` → `Đợt C`)

#### 1. Wave A — Đóng Security Advisors, Pháp lý, Rate Limit, Quên mật khẩu, Lịch sử thi & Dashboard
- **Database Security Hardening (Live trên `etcpholhbhtpttbuackx`):**
  - Áp dụng [20261119000002_p1_security_advisors_hardening.sql](../supabase/migrations/20261119000002_p1_security_advisors_hardening.sql): khóa 6 admin policy về `TO authenticated`, ghim `SET search_path = public` cho `wilson_lower`, thu hồi quyền `PUBLIC`/`anon` trên `submit_answer`, `finish_session`, `is_admin` và khóa các trigger `SECURITY DEFINER`.
  - Kết quả `get_advisors("security")` trực tiếp sau migration: **0** `function_search_path_mutable` và **0** `anon_security_definer_function_executable` (từ 10 cảnh báo anon ban đầu về `0`).
- **Rate Limiting Máy chủ:** Tạo [src/lib/rateLimit.ts](../src/lib/rateLimit.ts) (`Map` giới hạn `5,000` khóa) + [src/lib/rateLimit.test.ts](../src/lib/rateLimit.test.ts), áp dụng cho `/api/audio/tts` (`60/60s`), từ điển (`30/60s`), góp ý (`5/15m`), đăng nhập (`10/15m`), đăng ký (`5/15m`), và đặt lại mật khẩu (`3/15m`).
- **Trang Pháp lý & Định tuyến:** Tạo [/terms](../src/app/terms/page.tsx) và [/privacy](../src/app/privacy/page.tsx); cập nhật [src/proxy.ts](../src/proxy.ts) và footer tại [src/components/layout/app-nav.tsx](../src/components/layout/app-nav.tsx) & `/login`.
- **Luồng Quên Mật Khẩu:** Tạo [/auth/callback](../src/app/auth/callback/route.ts), [/reset-password](../src/app/(auth)/reset-password/page.tsx), chế độ `"forgot"` tại [/login](../src/app/(auth)/login/page.tsx) và các Server Action `requestPasswordResetAction`, `updatePasswordAction` trong [src/features/auth/actions.ts](../src/features/auth/actions.ts).
- **Lịch sử Thi thử & Dashboard Refresh:** Bổ sung `getExamHistoryAction` và `<section id="history">` trên `/exam`; làm phẳng thẻ Streak theo token `bg-[#FFFBEB] border-[#FDE68A]` và gắn link `/exam#history` trên [dashboard-view.tsx](../src/features/dashboard/components/dashboard-view.tsx).

#### 2. Đợt B — Google OAuth, Tách God Component, `@axe-core/playwright` & `pgTAP`
- **Google OAuth + Chống Open Redirect:** Siết `sanitizeInternalNext` & `/auth/callback` (chặn cả `//` và `/\`), bổ sung `signInWithGoogleAction` (`rateLimit` 20/15m theo IP) và nút Secondary `"Tiếp tục với Google"` trên `/login` (vẫn giữ đúng 1 nút Primary).
- **Tách God Components (Giảm độ phức tạp bảo trì):**
  - `src/features/vocab/components/vocab-list-view.tsx`: giảm từ **`2,829` dòng → `1,972` dòng** (`-857` dòng), tách ra:
    - [topic-visuals.ts](../src/features/vocab/lib/topic-visuals.ts) (`592` dòng) + [topic-visuals.test.ts](../src/features/vocab/lib/topic-visuals.test.ts) (`3` tests)
    - [vocab-curated-decks-tab.tsx](../src/features/vocab/components/vocab-curated-decks-tab.tsx) (`183` dòng)
    - [vocab-topics-grid.tsx](../src/features/vocab/components/vocab-topics-grid.tsx) (`187` dòng)
  - `src/features/learn/components/lesson-detail-view.tsx`: giảm từ **`1,701` dòng → `697` dòng** (`-1,004` dòng), tách ra:
    - [lesson-highlights-context.tsx](../src/features/learn/components/lesson-highlights-context.tsx) (`102` dòng)
    - [lesson-detail-cards.tsx](../src/features/learn/components/lesson-detail-cards.tsx) (`465` dòng)
    - [lesson-theory-sections.tsx](../src/features/learn/components/lesson-theory-sections.tsx) (`496` dòng)
- **Kiểm thử Accessibility & Database tự động:**
  - Cài `@axe-core/playwright` (`devDependencies`, giữ `npm audit --omit=dev` = `0 vulnerabilities`) và nâng cấp [e2e/responsive-a11y.spec.ts](../e2e/responsive-a11y.spec.ts) quét chuẩn **WCAG 2.1 AA** cho `/login`, `/reset-password`, `/terms`, `/privacy` ở hai khung hình `360px` và `1280px` (kèm cập nhật thứ tự Tab bàn phím qua `"Quên mật khẩu?"`).
  - Xây dựng bộ test **pgTAP** gồm [01_rls_and_security_invariants.sql](../supabase/tests/01_rls_and_security_invariants.sql) (`36` assertions kiểm tra 20 bảng RLS, thu hồi `EXECUTE` cho `anon`, đọc 0 dòng `question_answers`/`exam_set_answers`, cách ly dữ liệu đa user, khóa role escalation & khóa INSERT trực tiếp `practice_sessions`) và [02_wilson_and_rpc_contracts.sql](../supabase/tests/02_wilson_and_rpc_contracts.sql) (`11` assertions kiểm tra 9 mốc Wilson Phụ lục A + hợp đồng `pg_proc`), kèm [pgtap-suite-contract.test.ts](../tests/pgtap-suite-contract.test.ts).

#### 3. Đợt C — Phòng thi TOEIC Listening Part 1–4 (`/exam/[slug]/listening`)
- **Core Logic Thuần:** [src/core/examListening.ts](../src/core/examListening.ts) + [src/core/examListening.test.ts](../src/core/examListening.test.ts) (`flattenListeningContent`, `evaluateListeningExam` chấm 100 câu Part 1–4 theo `estimateListeningScore` thang `5–495`, giới hạn Part 2 đúng `3` phương án A–C, áp dụng **F2 anti-oracle**, `getListeningProficiencyLevel` theo token màu dự án).
- **Server Actions & Route:** Mở rộng [src/features/exam/types.ts](../src/features/exam/types.ts) & [src/features/exam/actions.ts](../src/features/exam/actions.ts) với `getListeningExamAction` (không fallback dữ liệu local thiếu đáp án theo `MD-06`), `submitListeningExamAction`, và cập nhật `getExamHistoryAction` phân biệt `Reading` / `Listening` (`examMode`).
- **Giao diện Phòng thi & Xem lại:** Tạo route [/exam/[slug]/listening](../src/app/exam/[slug]/listening/page.tsx), trình phát audio [listening-audio-player.tsx](../src/features/exam/components/listening-audio-player.tsx) (hỗ trợ cả file `audioUrl` lẫn `SpeechSynthesis en-US` phân biệt giọng Nam/Nữ `M`/`W` và tốc độ `0.85x`/`1.0x`/`1.15x`, fallback `/api/audio/tts`), phòng thi 45 phút [listening-exam-simulator.tsx](../src/features/exam/components/listening-exam-simulator.tsx) (tắt transcript mặc định, có công tắc tự học, bảng câu hỏi Part 1–4), màn kết quả [listening-result-view.tsx](../src/features/exam/components/listening-result-view.tsx), và cập nhật thẻ đề + lịch sử tại [exam-list-view.tsx](../src/features/exam/components/exam-list-view.tsx).

#### 4. Đợt D — Sửa triệt để lỗi Từ vựng / FSRS Review, Chuẩn hóa UI/UX Precision Swiss & Liên kết Customizations
- **Triệt tiêu lỗi "Chưa học từ nào đã báo ✓ Đã ôn xong (100%)" tại `/vocab`:**
  - Cập nhật [vocab-list-view.tsx](../src/features/vocab/components/vocab-list-view.tsx) và [vocab-topics-grid.tsx](../src/features/vocab/components/vocab-topics-grid.tsx) tách bạch **3 trạng thái FSRS trung thực** dựa trên `isImported`, `importedCount`, `reviewedCount` (`reps > 0 || state > 0`) và `deckDue`:
    1. **`Chưa nạp vào sổ` (Thanh tiến độ `0%`, badge trung tính `#F1F5F9`/`#475569`):** Khi bộ thẻ chuẩn chưa được nạp vào tài khoản.
    2. **`Mới nạp · {N} thẻ chờ học` (Thanh tiến độ `0%`, badge `#EFF6FF`/`#2563EB`):** Khi đã nạp bộ thẻ nhưng học viên chưa ôn tập lượt nào.
    3. **`{deckDue} thẻ cần ôn` / `✓ Đã ôn xong hôm nay` (`100%`, `#047857`):** Chỉ hiển thị **`Đã ôn xong hôm nay`** khi `isImported && reviewedCount > 0 && deckDue === 0`.
  - Cập nhật banner FSRS đầu trang `/vocab` và thẻ FSRS trên Dashboard ([dashboard-view.tsx](../src/features/dashboard/components/dashboard-view.tsx) + `totalReviewCardsCount` trong [src/features/stats/actions.ts](../src/features/stats/actions.ts)) để khi học viên có `0` thẻ trong `review_cards` sẽ hiển thị trạng thái hướng dẫn **"Chưa có thẻ từ vựng trong lịch ôn FSRS"** thay vì báo hoàn thành ảo.
- **Mở khóa 1-Click Auto-Import & Chế độ Ôn lại trước hạn (Free Review / Cram Mode `studyAll=true`) tại `/vocab` & `/review`:**
  - Bấm **`"Nạp & Ôn tập"`** trên bất kỳ cuốn sổ hoặc chủ điểm chưa nạp nào tại Kệ Sổ `/vocab` sẽ tự động gọi `importCuratedDeckAction` rồi chuyển thẳng vào `/review?notebookId=...&limit=15&studyAll=true`.
  - Sửa lỗi hiển thị **`THẺ 1 / 0`** thành **`THẺ 0 / 0`** trong [review-header.tsx](../src/features/review/components/review-header.tsx).
  - Bổ sung 2 nhánh hành động rõ ràng tại màn hình trống của [review-view.tsx](../src/features/review/components/review-view.tsx):
    - Khi `totalCardsCount > 0` (đã hoàn thành thẻ đến hạn hôm nay): Hiển thị nút Primary **`"Ôn lại trước hạn ({N} thẻ)"`** kích hoạt ngay chế độ ôn tự do (`studyAll: true`).
    - Khi `totalCardsCount === 0` (chưa nạp thẻ nào): Hiển thị nút Primary **`"Khám phá & Nạp bộ thẻ từ vựng →"`** dẫn về `/vocab`.
  - Bổ sung công tắc **`"Ôn tập tự do (Gộp cả thẻ chưa đến hạn FSRS)"`** và sửa tùy chọn **`"Tối đa (100)"`** (`limit=100`) trong [review-setup-modal.tsx](../src/features/review/components/review-setup-modal.tsx).
- **Đồng bộ UI/UX Precision Swiss & Khắc phục lỗi bố cục toàn hệ thống (Design QA Score `73/100` → `94/100`):**
  - **Sidebar Desktop ([app-nav.tsx](../src/components/layout/app-nav.tsx)):** Đưa cụm liên kết `Điều khoản · Bảo mật · ETS 2026` lên trên nút `"Góp ý & Báo lỗi"` kèm khoảng đệm đáy `pb-11`, chấm dứt hoàn toàn lỗi bị nút nổi góc trái dưới che khuất; bỏ `backdrop-blur-md` trên header di động.
  - **Biểu đồ 14 ngày & Trạng thái Học viên mới ([dashboard-view.tsx](../src/features/dashboard/components/dashboard-view.tsx), [stats-view.tsx](../src/features/stats/components/stats-view.tsx)):** Loại bỏ hoàn toàn dải màu cam ngoài token (`#FF4500 → #FFA000`, `from-orange-50 to-amber-50`) và hiệu ứng `🔥` `flame-flicker` lặp vô hạn trên biểu đồ 14 ngày, thay bằng hệ token chuẩn `#2563EB` / `#EFF6FF`; đổi tiêu đề và CTA cho học viên mới (`totalAttempts === 0`) thành *"3 chủ điểm nền tảng gợi ý bắt đầu"* và *"Làm bài chẩn đoán đầu tiên (10 câu) →"*.
  - **Các màn hình `/exam`, `/practice/[id]`, `/profile`:** Đảm bảo đúng 1 nút Primary duy nhất trên [exam-list-view.tsx](../src/features/exam/components/exam-list-view.tsx) kèm thẻ empty state khi `exams.length === 0`; thêm guard chống crash khi `!currentQuestion` trong [practice-runner.tsx](../src/features/practice/components/practice-runner.tsx); bổ sung phím `Escape` và nút đóng `44×44px` cho modal xóa tài khoản trong [profile-view.tsx](../src/features/profile/components/profile-view.tsx).
- **Liên kết hệ thống Customizations (`.cursor/rules`, `skills/`, `.agents/skills/`):**
  - Thêm `globs: src/**/*.tsx,src/**/*.css` vào [.cursor/rules/dmctn-taste-gate.mdc](../.cursor/rules/dmctn-taste-gate.mdc).
  - Đồng bộ quy chuẩn icon `lucide-react` trong [skills/component-taste/SKILL.md](../skills/component-taste/SKILL.md) và [skills/ui-workflow/SKILL.md](../skills/ui-workflow/SKILL.md) khớp bất biến kiến trúc `§6.2`.
  - Tạo [docs/brand-guidelines.md](brand-guidelines.md) và [assets/design-tokens.json](../assets/design-tokens.json) làm cầu nối chuẩn cho `.agents/skills/brand` và `.agents/skills/design-system`.

---

## 3. Bằng chứng kiểm chứng mới nhất

Toàn bộ lệnh kiểm tra được chạy tuần tự sau khi hoàn tất mã nguồn Batch 8 (Đợt A + B + C + D):

| Hạng mục kiểm tra | Kết quả | Chi tiết ghi nhận |
| :--- | :---: | :--- |
| `npm run typecheck` | **PASS** | `tsc --noEmit` exit `0`, 0 lỗi TypeScript strict |
| `npm run lint` | **PASS** | `eslint` exit `0`, **0 errors, 0 warnings** |
| `npm run test` | **PASS** | `vitest run` exit `0`: **34/34 file test**, **267 passed \| 16 skipped (283)** *(16 live DB test trong `remediation-integration.test.ts` tự bỏ qua an toàn khi offline theo Batch 0)* |
| `npm run build` | **PASS** | Next.js `16.4.6` Turbopack exit `0`: **30/30** static/SSG routes + dynamic routes gồm `/exam/[slug]/listening`, `/auth/callback`, `/exam`, `/terms`, `/privacy`, `/reset-password` |
| `npm audit --omit=dev` | **PASS** | `found 0 vulnerabilities` (exit `0`) |
| Supabase Security Advisors | **PASS** | Dự án `etcpholhbhtpttbuackx`: **0** `function_search_path_mutable`, **0** `anon_security_definer_function_executable` |

---

## 4. Cấu hình thủ công & Kiểm thử Staging cần làm trước khi chốt Production

1. **Supabase Auth Dashboard (`etcpholhbhtpttbuackx`):**
   - Bật **Leaked Password Protection** để đóng cảnh báo `auth_leaked_password_protection`.
   - Thêm URL `/auth/callback` (local & domain production tương ứng `NEXT_PUBLIC_SITE_URL`) vào danh sách **Redirect URLs**.
   - Bật và cấu hình **Google Provider** (Client ID / Secret + Authorized Redirect URI từ Supabase) để kích hoạt nút `"Tiếp tục với Google"`.
2. **Dữ liệu đề thi `exam_sets` trên DB:**
   - Truy vấn kiểm tra thực tế trên `etcpholhbhtpttbuackx` hiện ghi nhận `questions = 56`, `question_answers = 56`, `grammar_tags = 16`, còn `exam_sets = 0` / `exam_set_answers = 0`. Khi được phép nạp dữ liệu đề thi trên staging/production, cần chạy script seed đề (`scripts/ingest-mock-tests.ts` trên môi trường đích đã duyệt) để mở route chi tiết `/exam/[slug]` và `/exam/[slug]/listening` (tránh `notFound()` do cơ chế `MD-06` không cho phép fallback đề không có đáp án).
3. **Chạy kiểm thử tích hợp trên Staging cô lập (không chạy trên `etcpholhbhtpttbuackx`):**
   - `RUN_LIVE_DB_TESTS=1 npm run test:db`
   - `supabase test db` (chạy `supabase/tests/01_rls_and_security_invariants.sql` & `02_wilson_and_rpc_contracts.sql`)
   - `npm run test:e2e` (chạy Playwright + `@axe-core/playwright` với `npm run dev` hoặc server staging)
4. **Duyệt cuối (`Codex Review Gate`):**
   - Toàn bộ thay đổi đang ở trạng thái **`READY_FOR_REVIEW` / `READY_FOR_CODEX_REVIEW`** để người dùng và Codex Reviewer kiểm tra, nghiệm thu độc lập trước khi gắn `ACCEPTED`.
