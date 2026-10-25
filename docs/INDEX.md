# INDEX — TOEIC AI Docs Navigator

> **Quy tắc:** Đọc file này TRƯỚC mọi task. Tra cây → mở đúng file. Không đọc `archive/`.

---

## 🔴 Token màu tra nhanh (không cần mở file)

| Token | HEX | Dùng cho |
|-------|-----|----------|
| `color.primary.default` | `#2563EB` | Nút Primary, thanh tiến độ, focus ring |
| `color.primary.hover` | `#1D4ED8` | Hover/active Primary |
| `color.primary.subtle` | `#EFF6FF` | Nền phương án đang chọn |
| `color.secondary.default` | `#0F172A` | Nút phụ quan trọng, huy hiệu chuỗi ngày |
| `color.bg.page` | `#F8FAFC` | Nền trang |
| `color.bg.surface` | `#FFFFFF` | Thẻ, modal, sheet |
| `color.bg.muted` | `#F1F5F9` | Hộp Quy tắc, keycap, chỉ đọc |
| `color.text.primary` | `#0F172A` | Tiêu đề, câu hỏi, phương án |
| `color.text.secondary` | `#475569` | Phụ đề, nhãn overline, thời gian |
| `color.border.default` | `#E2E8F0` | Viền thẻ (trang trí) |
| `color.border.input` | `#8190A6` | Viền ô nhập, nút Secondary |
| `status.success` | text `#047857` · bg `#ECFDF5` | Đúng, nhãn Vững |
| `status.error` | text `#BE123C` · bg `#FFF1F2` | Sai, lỗi mạng, nhãn Cần ôn |
| `status.warning` | text `#B45309` · bg `#FFFBEB` | Nhãn Khó, cảnh báo ít câu |
| `status.info` | text `#4338CA` · bg `#EEF2FF` | Banner Drill "Chỉ ôn lại tạm thời" |
| `status.insufficient` | text `#475569` · bg `#F1F5F9` | Nhãn Chưa đủ dữ liệu |

**Quy tắc màu:** Không tạo màu ngoài bảng. Cột biểu đồ dùng `primary` + opacity, không thêm màu mới.

---

## Cây 1 — WHAT (sản phẩm là gì)

```
Tầm nhìn / vision / mục tiêu
  └─► 01-vision-users-scope.md  §1.1

Người dùng / persona / Linh / Hằng / admin
  └─► 01-vision-users-scope.md  §1.2

Trong / ngoài phạm vi MVP
  └─► 01-vision-users-scope.md  §1.3

User stories / US-F1 / US-A1 / US-B1 ...
  └─► 01-vision-users-scope.md  §1.4

Non-functional / LCP / WCAG / bảo mật / SLA
  └─► 01-vision-users-scope.md  §1.5

Ràng buộc pháp lý / ETS / dữ liệu cá nhân
  └─► 01-vision-users-scope.md  §1.6
```

---

## Cây 2 — WHY (tại sao quyết định X)

```
12 nguyên tắc dẫn đường / philosophy / "Hiểu vì sao sai"
  └─► 02-principles.md

Product Decisions đã chốt / PD-01 → PD-09
  └─► 03-decisions/PD-log.md

  Tra nhanh PD:
  PD-01  Lưu từ → Bottom Sheet / Dialog; Word Chip từ vocab_hints
  PD-02  Sai → mở toàn bộ giải thích; Đúng → thu gọn, có nút mở
  PD-03  Drill client-side, KHÔNG ghi DB, KHÔNG đổi mastery
  PD-04  Đăng nhập xong → Dashboard ngay; /profile không nổi bật
  PD-05  Nhãn Wilson: <5 lượt "Chưa đủ"; <50% "Cần ôn"; <75% "Khó"; ≥75% "Vững"
  PD-06  KHÔNG có chế độ bấm giờ trong MVP
  PD-07  Drill chỉ một lượt, chấm tại client
  PD-08  Dashboard mobile: chỉ Top 3 chủ điểm có ≥5 câu
  PD-09  Word Chip lấy từ vocab_hints đi kèm giải thích; không gọi LLM khi làm bài

Conflict resolutions / D-01 → D-24
  └─► 03-decisions/D-log.md

  Tra nhanh D:
  D-02   10 màn hình MVP (danh sách chính thức)
  D-05   Breakpoint: 360-767 / 768-1023 / 1024+ (chuẩn 1280)
  D-06   Nút chấm thẻ FSRS: 60px (không phải 56px)
  D-07   border.input = #8190A6 (không dùng #CBD5E1 — chỉ 1.48:1)
  D-10   Cảnh báo "Chỉ còn N câu mới" ở /practice/new — bắt buộc
  D-11   Nguồn câu hỏi: JSONL ngoài app; LLM soạn nháp ngoài; không gọi LLM khi chạy
  D-16   Múi giờ: lưu UTC; hiển thị Asia/Ho_Chi_Minh
  D-18   Thanh tiến độ: liên tục 8px (không phải 10 đốt)
  D-22   Lập lịch FSRS (thay SM-2); 4 nút Lỗi/Khó/Tốt/Dễ = Again/Hard/Good/Easy
  D-23   card_reviews: ghi mỗi lần chấm thẻ (append-only)
  D-24   Dùng ts-fsrs; khóa version chính xác; chạy ở server
```

---

## Cây 3 — HOW (logic nghiệp vụ)

```
Tài khoản / đăng ký / đăng nhập / role / trigger hồ sơ
  └─► 04-business-rules.md  §4.1

Phiên luyện tập / session / lọc 7 ngày / quy mô 5-10-20
  └─► 04-business-rules.md  §4.2

Giải thích thích ứng / PD-02 / expanded vs collapsed
  └─► 04-business-rules.md  §4.3

Báo lỗi câu hỏi / 3 báo cùng lý do → needs_review
  └─► 04-business-rules.md  §4.4

Kết quả phiên / Drill / client-side / không ghi DB
  └─► 04-business-rules.md  §4.5

Từ vựng / lưu từ / lemma / trùng → "Từ này đã có"
  └─► 04-business-rules.md  §4.6

FSRS / flashcard / chấm thẻ / hàng đợi trong phiên / OQ-2
  └─► 04-business-rules.md  §4.6b

Mastery / Wilson z=1.96 / ngưỡng 5/50/75 / nhãn 4 loại
  └─► 04-business-rules.md  §4.7

Dashboard / thẻ đề xuất / Top 3 / chuỗi ngày
  └─► 04-business-rules.md  §4.7

Profile / xuất JSON / xóa tài khoản 2 lớp (D-17)
  └─► 04-business-rules.md  §4.8

Admin / duyệt câu / J-K-Y-N / review_log
  └─► 04-business-rules.md  §4.9
```

---

## Cây 4 — UI (thiết kế & code giao diện)

```
Visual direction / "Precision Swiss LearningGrid" / không gradient
  └─► 05-design/design-direction.md  §5.1

Token màu (chi tiết đầy đủ với contrast ratio)
  └─► 05-design/design-direction.md  §5.2
  (xem bảng nhanh ở đầu file INDEX này)

Typography / Be Vietnam Pro / JetBrains Mono / size scale
  └─► 05-design/design-direction.md  §5.3

Spacing / radius / shadow / motion
  └─► 05-design/design-direction.md  §5.4

─── Components ───────────────────────────────────────────
  └─► 05-design/components.md  §5.5

  Navigation      Bottom Bar 4 tab (mobile) / Sidebar 240px (desktop)
  Button          Primary 48px / phụ 44px / disabled / loading
  Input           border.input viền; font ≥16px mobile; label bắt buộc
  Segmented Pill  5 / 10 / 20 câu; cao 44px
  Answer Option   5 states: default/hover/selected/correct/incorrect/unselected
  Explanation     Expanded (sai) / Collapsed (đúng) + aria-live="polite"
  Word Chip+Sheet Chip 36px; Sheet mobile / Dialog desktop; focus trap
  FSRS Flashcard  Thẻ 240px; 4 nút 60px; thời gian từ repeat() thư viện
  Topic Mastery   Thanh 8px; badge 24px; Nhóm 1 (đủ DL) / Nhóm 2 (<5 câu)
  Admin Review    Split 2 cột desktop; xếp dọc mobile
  Toast           Không che nút ghim; offset 88px khi có Sticky Action Bar

─── Màn hình cụ thể ──────────────────────────────────────
  └─► 05-design/screens.md  §5.6

  M1  /login              Đăng nhập / Đăng ký / quên mật khẩu
  M2  /                   Dashboard → đẩy vào phiên học ngay
  M3  /practice/new       Chọn chủ điểm + quy mô phiên
  M4  /practice/[id]      Làm bài tập trung (Focused Header, Sticky Action Bar)
  M5  /practice/[id]/result  Kết quả + Drill
  M6  /vocab              Sổ từ vựng (tìm kiếm, sửa tại chỗ, xóa)
  M7  /review             Ôn FSRS ngắt quãng
  M8  /stats              Thống kê (chẩn đoán điểm yếu, biểu đồ 14 ngày)
  M9  /profile            Hồ sơ + vùng nguy hiểm xóa tài khoản
  M10 /admin/review        Duyệt câu hỏi hàng đợi

─── Tương tác quan trọng ────────────────────────────────
  └─► 05-design/interactions.md  §5.7
  (Đăng nhập, nộp câu, lưu từ, Drill, chấm FSRS, admin duyệt)

─── Responsive ──────────────────────────────────────────
  └─► 05-design/responsive-a11y.md  §5.8
  Mobile 360-767: Bottom Nav, Sticky Bar, Bottom Sheet
  Tablet 768-1023: container max 768px, 2 cột thẻ phụ
  Desktop 1024+: Sidebar, Dashboard 2-cột 5/12+7/12

─── Accessibility ───────────────────────────────────────
  └─► 05-design/responsive-a11y.md  §5.9
  Contrast / vùng chạm / focus ring / không màu làm tín hiệu
  Phím tắt: Enter nộp; Space lật thẻ; A-D chọn đáp án; J/K/Y/N admin

─── State matrix (empty/loading/error mỗi màn) ──────────
  └─► 05-design/states-copy.md  §5.10

─── Copy tiếng Việt đã chốt ─────────────────────────────
  └─► 05-design/states-copy.md  §5.11
  "Email hoặc mật khẩu không đúng"
  "Chỉ còn 4 câu mới"
  "Bạn đã làm đúng hết câu của chủ điểm này trong 7 ngày qua"
  "Từ này đã có trong sổ"
  "Chỉ để ôn lại tạm thời - Không lưu vào lịch sử"
  "Chưa đủ dữ liệu (X/5 câu)"
```

---

## Cây 5 — TECH (kiến trúc & code)

```
Kiến trúc tổng quan / Next.js / Supabase / luồng dữ liệu 6 luồng
  └─► 06-architecture.md  §6.1

Stack & quyết định công nghệ / shadcn / ts-fsrs / Vitest / Playwright
  └─► 06-architecture.md  §6.2

Routes / quyền / render mode
  └─► 06-architecture.md  §6.3

  (auth)   /login, /auth/callback      — công khai
  (app)    /, /practice/new, /vocab, /stats, /profile, /result  — có nav
  (focus)  /practice/[id], /review     — ẩn nav
  (admin)  /admin/review               — role=admin

Quy tắc code / Server Component mặc định / reducer / form
  └─► 06-architecture.md  §6.4

Cấu trúc thư mục / app / features / core / lib / supabase
  └─► 06-architecture.md  §6.5

Data model / bảng / RPC / view
  └─► 06-architecture.md  §6.6

  Tra nhanh bảng:
  profiles          Tên, target_score, role (không tự sửa role)
  questions         Stem, 4 lựa chọn, tag, trạng thái published/retired
  question_answers  correct_index + giải thích JSON — không cho client đọc
  practice_sessions Phiên và danh sách câu
  attempts          Mỗi lần nộp chính thức — NGUỒN DUY NHẤT thống kê
  vocab_entries     Từ + nghĩa + ngữ cảnh; unique (user, lemma)
  review_cards      Trạng thái FSRS mỗi thẻ
  card_reviews      Lịch sử chấm thẻ append-only (D-23)
  question_reports  Báo lỗi; trigger rút câu sau 3 báo
  events            Sự kiện analytics (không ghi nội dung câu trả lời)
  v_skill_mastery   VIEW Wilson — security_invoker

  RPC: create_session · submit_answer · finish_session · get_session_review
  Fn:  is_admin() · wilson_lower()

Bảo mật / RLS bắt buộc mọi bảng / service role / OAuth / secret
  └─► 06-architecture.md  §6.7

Môi trường / local / staging / production / .env.example
  └─► 06-architecture.md  §6.8
```

---

## Cây 6 — PLAN (lộ trình & kiểm thử)

```
Lộ trình M0-M13 / milestone / giờ ước tính / lỗi hay gặp
  └─► 07-roadmap.md  §7

  Tra nhanh milestone:
  M0  Chốt đặc tả (hoàn thành 24/10/2026)
  M1  Khởi tạo dự án + CI                          6-10h
  M2  Token, layout, điều hướng, components cơ bản  8-12h
  M3  Schema + RLS + đăng nhập email                14-20h
  M4  Vertical slice: làm bài → staging             16-24h  ← mốc quan trọng nhất
  M5  Giải thích thích ứng + báo lỗi + sự kiện      8-12h
  M6  /practice/new cảnh báo + kết quả + Drill      10-14h
  M7  Bottom Sheet từ vựng + /vocab                 10-14h
  M8  /review FSRS                                  14-20h
  M9  Dashboard + /stats (Wilson)                   12-18h
  M10 /profile + xóa tài khoản                       6-10h
  M11 /admin/review                                 10-16h
  M12 E2E + bảo mật + responsive + a11y             12-18h
  M13 Production + demo                              6-10h

Definition of Ready / Definition of Done
  └─► 07-roadmap.md  §7 (cuối)  /  12-first-task-dod.md

Chiến lược kiểm thử / pgTAP / Vitest / Playwright / axe
  └─► 08-testing.md  §8

Quy trình 7 bước làm việc với AI / spec → review diff
  └─► 09-ai-workflow.md  §9

Sổ rủi ro / xác suất / giảm thiểu / dấu hiệu
  └─► 10-risks.md  §10

Câu hỏi mở OQ-1→OQ-7 (tất cả đã chốt 24/10/2026)
  └─► 11-open-questions.md  §11
```

---

## Cây 7 — DATA (dữ liệu kiểm thử)

```
Wilson test values / wilson_lower(correct, total) / ngưỡng 5 câu
  └─► A-test-data.md  §A.1

FSRS snapshot / ts-fsrs 5.4.2 / bảng 7 bước chấm / chuỗi trong phiên
  └─► A-test-data.md  §A.2
```

---

## Cây 8 — SKILLS & ROLES (kỹ năng & vai trò Agent)

```
─── Vai trò Agent (AGENTS.md §9) ─────────────────────────
UI/UX Taste Director (Giao diện, layout 360px, Design QA)
  └─► docs/05-design/* · skills/taste-skill · skills/component-taste

Database & Security Architect (Postgres, RLS, RPC, Auth)
  └─► docs/06-architecture.md §6.6-6.7 · docs/03-decisions/D-log.md

Core Algorithm Engineer (FSRS scheduling, Wilson mastery, Drill)
  └─► docs/04-business-rules.md · docs/A-test-data.md

QA & Compliance Auditor (DoD, WCAG 2.1 AA, Playwright, axe)
  └─► docs/08-testing.md · docs/12-first-task-dod.md · skills/ui-review-skill

Cơ chế Hợp tác Mentor-Intern & Người làm - Người duyệt/Làm lại
  └─► AGENTS.md §10

─── Skills tra cứu nhanh ─────────────────────────────────
taste-skill        Quy trình Taste Gate R2: Design Read → Direction → Pre-Flight
  └─► skills/taste-skill/SKILL.md

component-taste    Chuẩn thiết kế chi tiết từng component (Button, Row, Sheet...)
  └─► skills/component-taste/SKILL.md

ui-workflow        Quy trình thống nhất 3 tầng (Taste Gate × ui-ux-pro-max × AGENTS)
  └─► skills/ui-workflow/SKILL.md

ui-review-skill    Bộ chấm điểm Design QA Score (100đ) + audit checklist
  └─► skills/ui-review-skill/SKILL.md

redesign-skill     Quy trình audit và cải tạo UI hiện có (4 modes)
  └─► skills/redesign-skill/SKILL.md

ui-ux-pro-max      Kho dữ liệu UI intelligence (palette, font, styles, stacks)
  └─► .agents/skills/ui-ux-pro-max/SKILL.md
```

---

## Bản đồ file ↔ milestone

> Dùng khi cần biết milestone X cần đọc file gì.

| Milestone | Files cần đọc |
|-----------|--------------|
| M1 setup | `06-architecture.md` §6.4-6.5-6.8 |
| M2 tokens+components | `05-design/design-direction.md` · `05-design/components.md` |
| M3 schema+RLS | `06-architecture.md` §6.6-6.7 · `03-decisions/D-log.md` |
| M4 vertical slice | `05-design/screens.md` M4 · `04-business-rules.md` §4.2-4.3 · `06-architecture.md` §6.1 |
| M5 giải thích+báo lỗi | `04-business-rules.md` §4.3-4.4 · `05-design/components.md` #adaptive-explanation |
| M6 kết quả+Drill | `04-business-rules.md` §4.5 · `05-design/screens.md` M5 |
| M7 từ vựng | `04-business-rules.md` §4.6 · `05-design/screens.md` M6 |
| M8 FSRS | `04-business-rules.md` §4.6b · `03-decisions/D-log.md` D-22-23-24 · `A-test-data.md` |
| M9 stats | `04-business-rules.md` §4.7 · `05-design/screens.md` M2+M8 · `A-test-data.md` |
| M10 profile | `04-business-rules.md` §4.8 · `05-design/screens.md` M9 |
| M11 admin | `04-business-rules.md` §4.9 · `05-design/screens.md` M10 |
| M12 QA | `08-testing.md` · `05-design/responsive-a11y.md` |

---

*INDEX tạo: 25/10/2026 · Cập nhật khi có quyết định mới trong `03-decisions/`*
