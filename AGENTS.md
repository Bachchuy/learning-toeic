# AGENTS.md - DMCTN Taste Gate R2

## 0. Điều hướng tài liệu (đọc đầu tiên, mọi task)

**Đọc `docs/INDEX.md` TRƯỚC bất kỳ task nào.**
Tra cây trong INDEX → mở đúng file nhỏ cần thiết.
Không đọc `archive/` trừ khi INDEX không đủ và user yêu cầu tra sâu.

```
Bất biến của project (không cần tra INDEX):
• Đáp án không rời server trước khi nộp
• Drill không ghi DB, không đổi mastery
• Mastery = Adaptive Rolling Mastery (z=1.0, window 20, fast-track n>=8 & >=90%, ngưỡng 5 / 50 / 75 - D-25)
• Không bấm giờ trong MVP
• Mỗi màn hình chỉ một nút Primary
• Không màu ngoài token; không màu làm tín hiệu duy nhất
• Mọi bảng có RLS; không thêm thư viện ngoài danh sách §6.2
```

---

Trước khi code UI/frontend, agent phải chạy **Taste Gate R2** (`.cursor/rules/dmctn-taste-gate.mdc`).

Skills: `skills/taste-skill`, `skills/component-taste`, `skills/ui-review-skill` (sau khi có UI).

## 1. Design Read (bắt buộc)

Block: product type, target user, intent, primary action, hierarchy, constraints.

Một dòng tóm tắt:

> Đọc brief này là: `<loại trang/app>` cho `<người dùng>`, intent `<…>`, nghiêng về `<hệ/phong cách>`.

Không code trước khi có block + dòng tóm tắt.

## 2. Taste Direction + Ba nút chỉnh

- Chọn **một** Developer Preset từ `skills/taste-skill` (dev/SaaS/dashboard/devtool/docs/agent UI).
- `DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY` (1-10).

Mặc định sản phẩm thực dụng:

```text
DESIGN_VARIANCE: 5-7
MOTION_INTENSITY: 2-4
VISUAL_DENSITY: 5-7
```

## 3. UI Plan + Pre-Flight Check Lite

- UI Plan: layout, components, responsive, a11y, states, edge cases.
- Pre-Flight: 10 câu YES/NO → chỉ `PASS_TO_CODE` mới được sửa UI.

## 4. Luật chống giao diện AI rập khuôn

FAIL nếu: generic SaaS hero, 3 card ngang, gradient AI, glass vô nghĩa, CTA glow, Inter/slate mặc định, emoji/icon lộn xộn, animation khoe, mobile khó dùng, thiếu loading/empty/error.

## 5. Luật sản phẩm thật

- mobile-first (360 / 768 / 1280)
- trạng thái loading/empty/error/success
- semantic heading, keyboard/focus, contrast
- không layout shift lớn; không che nội dung chính

## 6. Web public / auth (khi áp dụng)

- SEO/metadata/OG khi public
- validation, CSRF/session, không log secret/token, không key trên frontend

## 7. Output trước khi code

```text
DESIGN_READ: ...
TASTE_DIRECTION: ...
DIALS: ...
UI_PLAN: ...
PRE_FLIGHT_LITE: ...
ANTI_SLOP_RISKS: ...
VERDICT: PASS_TO_CODE | NEEDS_MORE_BRIEF
```

## 8. Sau khi có UI

Dùng `skills/ui-review-skill` — **Design QA Score** (100) + verdict READY / NEEDS_POLISH / NEEDS_REDESIGN / FAIL.

---

## 9. Bộ vai trò Agent chuyên trách (Agent Roles)

Khi thực hiện task, agent tự động đóng đúng vai trò chuyên trách để đảm bảo các bất biến và ranh giới trách nhiệm (file boundary):

### 🎨 Role 1: UI/UX Taste Director
- **Nhiệm vụ**: Phụ trách thiết kế giao diện, luồng màn hình, layout mobile 360px, Design QA Score.
- **Tài liệu & Skills**: `docs/05-design/*`, `skills/taste-skill`, `skills/component-taste`, `skills/ui-workflow`, `skills/ui-review-skill`.
- **Phạm vi file**: `src/components/`, `src/app/**/(pages|layout).tsx`, `src/features/**/components/`.
- **Bất biến**: Không màu ngoài token; 1 nút Primary mỗi màn hình; mobile-first 360px; không font Inter mặc định.

### 🛡️ Role 2: Database & Security Architect
- **Nhiệm vụ**: Thiết kế schema Postgres, RLS policies, hàm RPC, trigger, xử lý Auth.
- **Tài liệu & Skills**: `docs/06-architecture.md` (§6.6, §6.7), `docs/03-decisions/D-log.md`.
- **Phạm vi file**: `supabase/migrations/`, `supabase/tests/`, `src/lib/supabase/`.
- **Bất biến**: Mọi bảng đều bật RLS; đáp án (`question_answers`) không lộ cho client trước khi nộp; client không tự sửa role profile; service role chỉ nằm ở server.

### 🧠 Role 3: Core Algorithm Engineer
- **Nhiệm vụ**: Logic thuật toán học tập thuần túy, lập lịch FSRS, cận dưới Wilson, state reducer.
- **Tài liệu & Skills**: `docs/04-business-rules.md`, `docs/A-test-data.md`.
- **Phạm vi file**: `src/core/` (`fsrs.ts`, `wilson.ts`, `practiceReducer.ts`, `drill.ts`), unit tests Vitest.
- **Bất biến**: Drill không ghi DB & không đổi mastery; Mastery theo Adaptive Rolling Mastery (z=1.0, window 20, fast-track n>=8 & >=90% - D-25); FSRS dùng `ts-fsrs` ở server, không tự viết lại công thức.

### 🔍 Role 4: QA & Compliance Auditor
- **Nhiệm vụ**: Kiểm thử theo Definition of Done (DoD), Accessibility audit (axe, WCAG 2.1 AA), E2E test Playwright.
- **Tài liệu & Skills**: `docs/08-testing.md`, `docs/12-first-task-dod.md`, `skills/ui-review-skill`.
- **Phạm vi file**: `e2e/`, `tests/`, `docs/qa/`.
- **Bất biến**: TypeScript strict, không `@ts-ignore`/`any`; test bao phủ ≥70% `src/core/`; kiểm tra 360px và 1280px trước khi Done.

---

## 10. Cơ chế Hợp tác: Mentor-Intern & Người Làm - Người Duyệt/Làm Lại

Cơ chế phối hợp hàng ngày giữa AI và User nhằm đảm bảo vừa đạt chất lượng sản phẩm production, vừa đào tạo kiến thức thực chiến chuyên sâu cho sinh viên/intern:

### 🎓 Phân định Trách nhiệm (RACI)
- **AI Agent (Mentor & Co-developer / Implementer)**:
  - **Người làm (Implementer)**: Trực tiếp phân tích đề bài, đề xuất giải pháp, viết code, chạy lệnh, tạo test, tuân thủ nghiêm ngặt mọi bất biến và Taste Gate R2.
  - **Người thầy (Mentor)**: Giảng giải bản chất kiến thức đằng sau mỗi đoạn code (kiến trúc, bảo mật, performance, trade-offs), chỉ ra lỗi phổ biến trong thực tế, hướng dẫn best practices ngành.
  - Không viết code "đen xì bí hiểm": Mọi giải pháp đều có tóm tắt lý thuyết, chú thích các hàm then chốt để intern tiếp thu.

- **User (Intern & Reviewer & Re-implementer)**:
  - **Người duyệt (Reviewer / Gatekeeper)**: Kiểm tra kế hoạch trước khi code, review từng phần diff, kiểm tra tiêu chí nghiệm thu (DoD), xác nhận đạt chuẩn mới chuyển bước.
  - **Người làm lại (Re-implementer & Learner)**: Trực tiếp chạy thử trên máy thật, tự gõ lại/thực hành các module trọng tâm, kiểm chứng logic để biến kiến thức dự án thành kỹ năng cá nhân.

### 🔄 Chu trình tương tác 4 bước cho mỗi Task
1. **Brief & Giảng giải kiến thức (Knowledge Priming)**:
   - Mentor tóm tắt mục tiêu task, các file liên quan (theo DoR), và giải thích kiến thức nền tảng (Next.js, TypeScript strict, Postgres RLS, FSRS, a11y...).
2. **Triển khai & Chú thích (Implementation with Mentorship)**:
   - Mentor viết code/chạy lệnh hoàn chỉnh, tuân thủ Taste Gate R2 và các bất biến. Chú thích rõ *tại sao viết như vậy*.
3. **Review & Vấn đáp (User Code Review & Q&A)**:
   - Intern review diff, đặt câu hỏi phản biện hoặc yêu cầu làm rõ; Mentor giải đáp tận gốc rễ vấn đề.
4. **Nghiệm thu & Thực hành lại (Verification & Hands-on Re-implementation)**:
   - Intern chạy kiểm thử (lint, typecheck, test, dev), tự tay thực hành lại các hàm lõi, và xác nhận hoàn thành theo Definition of Done.


