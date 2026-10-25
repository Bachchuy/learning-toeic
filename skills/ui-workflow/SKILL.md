---
name: ui-workflow
description: >
  Unified 3-layer UI workflow: Taste Gate (process) × ui-ux-pro-max (data) × AGENTS.md (rule).
  Dùng khi bắt đầu bất kỳ task UI/frontend nào. Tích hợp sẵn Pre-Flight gate,
  design-system data search, dial mapping và QA score.
---

# UI Workflow — 3-Layer Unified

> **Scope:** Web · SaaS · Dashboard · Devtool · Docs · Agent UI · Native App  
> **Refs:** `skills/taste-skill/SKILL.md` · `ui-ux-pro-max/SKILL.md` · `AGENTS.md` · `.cursor/rules/dmctn-taste-gate.mdc`

---

## Kiến trúc 3 tầng

```
┌─────────────────────────────────────────────────────┐
│  LAYER 1 — PROJECT RULE                             │
│  AGENTS.md  →  kích hoạt workflow này trước code   │
└────────────────────┬────────────────────────────────┘
                     │ trigger
┌────────────────────▼────────────────────────────────┐
│  LAYER 2 — PROCESS GATE  (taste-skill)              │
│  Design Read → Taste Direction → UI Plan            │
│  Pre-Flight Lite → PASS_TO_CODE / NEEDS_MORE_BRIEF  │
└────────────────────┬────────────────────────────────┘
                     │ PASS_TO_CODE
┌────────────────────▼────────────────────────────────┐
│  LAYER 3 — DATA INTELLIGENCE  (ui-ux-pro-max)       │
│  design-system query · domain search · stack rules  │
│  → palette · typography · UX guidelines · snippets  │
└─────────────────────────────────────────────────────┘
```

**Quy tắc ưu tiên khi ba tầng cho output khác nhau:**

| Chiều | Ưu tiên |
|-------|---------|
| Quy trình (gate) | taste-skill > ui-ux-pro-max |
| Chống AI template | taste-skill Anti-Slop > mọi gợi ý khác |
| Data palette/style | ui-ux-pro-max (có data thực) > taste-skill (preset) |
| Typography font mặc định | taste-skill (nghiêm hơn — cấm Inter mặc định) |
| Dials khi conflict | taste-skill baseline → override bằng ui-ux-pro-max nếu có lý do |
| A11y checklist | ui-ux-pro-max (chi tiết hơn) bổ sung trên taste-skill |

---

## Bước 0 — Kiểm tra Python (ui-ux-pro-max prerequisite)

```bash
# Windows
python --version
```

Nếu chưa có → dừng, yêu cầu user cài Python 3 từ python.org. Không tự cài.

---

## Bước 1 — DESIGN READ  *(Layer 2: taste-skill)*

Bắt buộc. Không code trước khi hoàn thành block này.

```text
DESIGN_READ:
- Product type    : (SaaS / devtool / admin dashboard / docs / agent UI / app shell / marketing / redesign / native utility)
- Target user     : (dev / PM / ops / end user — cụ thể)
- User intent     : (họ muốn làm gì trên màn hình này?)
- Primary action  : (1 hành động chính phải nổi bật)
- Content hierarchy: (thứ tự ưu tiên nội dung)
- Technical constraints: (stack, DS có sẵn, a11y, perf, không đổi route/API)
- Available assets: (logo, màu brand, font, UI hiện tại nếu có)
```

Một dòng tóm tắt bắt buộc:

> Đọc brief này là: `<product type>` cho `<user>`, intent `<intent>`, nghiêng về `<style/system>`.

---

## Bước 2 — TASTE DIRECTION  *(Layer 2: taste-skill)*

Chọn **một** Developer Preset từ danh sách dưới.

```text
TASTE_DIRECTION:
- Developer preset : (xem § Preset Pack)
- Color direction  : (neutral / brand-tinted / high-contrast / monochrome)
- Typography direction: (sans editorial / geometric / mono-accent — không mặc định Inter)
- Component direction : (flat / bordered / elevated minimal — không glass toàn trang)
```

### Preset Pack (chọn 1)

| # | Preset | Best for | Motion | Density |
|---|--------|----------|:------:|:-------:|
| 1 | Developer Tool Console | CLI companion, IDE panel, log viewer | 1-3 | 6-8 |
| 2 | SaaS Product UI | Product app, onboarding, settings | 3-5 | 4-5 |
| 3 | Admin Dashboard | Ops, analytics, CRUD admin | 1-3 | 6-8 |
| 4 | AI Agent Workspace | Chat + tools + run history | 3-5 | 5-6 |
| 5 | Docs / Developer Portal | API docs, guides, changelog | 1-2 | 5-6 |
| 6 | Marketplace Listing | Extension/app store listing | 2-4 | 4-5 |
| 7 | Mobile Utility App | Utility, field tool, settings-light | 2-4 | 4-5 |
| 8 | Design System Starter | Tokens, primitives, doc nội bộ | 2-3 | 5-6 |
| 9 | Redesign Existing UI | Nâng UI giữ flow | 2-4 | theo brief |
| 10 | Image-to-Code UI | Implement từ mockup/screenshot | theo ảnh | theo ảnh |

---

## Bước 3 — DIALS  *(Layer 2 baseline → Layer 3 refine)*

```text
DIALS:
- DESIGN_VARIANCE  : (1-10)  — 1 an toàn / 10 phá cách
- MOTION_INTENSITY : (1-10)  — 1 tĩnh  / 10 cinematic
- VISUAL_DENSITY   : (1-10)  — 1 thoáng / 10 dày đặc
```

**Gợi ý baseline theo ngữ cảnh (taste-skill):**

| Ngữ cảnh | Variance | Motion | Density |
|---|:---:|:---:|:---:|
| Devtool console | 5-6 | 2-4 | 6-7 |
| SaaS product | 6-7 | 3-5 | 4-5 |
| Admin dashboard | 4-6 | 1-3 | 6-8 |
| Docs / portal | 4-5 | 1-2 | 5-6 |
| AI agent workspace | 6-7 | 3-5 | 5-6 |
| AGENTS.md mặc định | 5-7 | 2-4 | 5-7 |

**Sau khi có baseline → chạy Layer 3 để refine:**

```bash
python .agents/skills/ui-ux-pro-max/scripts/search.py "<product type> <keywords>" \
  --design-system \
  --variance <N> --motion <N> --density <N> \
  -p "<Project Name>"
```

> **Xử lý conflict dials:** Nếu ui-ux-pro-max suggest khác taste-skill baseline → ghi chú lý do và lấy giá trị có data thực hơn. Không override mà không giải thích.

---

## Bước 4 — DESIGN SYSTEM DATA  *(Layer 3: ui-ux-pro-max)*

Chạy sau khi có DIALS. Lấy palette · typography · style thực sự.

```bash
# Design system đầy đủ
python .agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system -p "<Project>"

# Nếu cần chi tiết thêm — domain search
python .agents/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain style
python .agents/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain color
python .agents/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain typography
python .agents/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain ux
python .agents/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack <stack>
```

**Lưu design system (nếu project dài hơi):**

```bash
python .agents/skills/ui-ux-pro-max/scripts/search.py "<query>" \
  --design-system --persist \
  -p "<Project Name>" --output-dir "d:/code/learning-toeic"
```

Tạo ra: `design-system/<project-slug>/MASTER.md` + `pages/<page>.md`

---

## Bước 5 — UI PLAN  *(Layer 2: taste-skill)*

```text
UI_PLAN:
- Layout structure  : (grid / sidebar+main / split / bento — lý do)
- Component list    : (navbar / hero / cards / table / form / …)
- Responsive plan   : (mobile-first: 360 / 768 / 1280)
- Accessibility plan: (focus order / contrast / headings / labels / reduced-motion)
- State plan        : (loading / empty / error / success cho từng vùng chính)
- Edge cases        : (no data / long text / overflow / keyboard-only)
- Design system map : (chọn 1: Fluent / Material 3 / Polaris / Primer / GOV.UK / Tailwind+shadcn)
```

**Design system map — quy tắc chọn (cả 2 layer đồng thuận):**

| Ngữ cảnh | Chọn |
|----------|------|
| Enterprise / Microsoft | Fluent UI |
| Material-flavored | Material 3 |
| Shopify admin | Polaris |
| GitHub / devtool | Primer-style |
| Trust / public sector | GOV.UK / USWDS |
| Indie SaaS / custom | Tailwind + shadcn (customize, không default) |

> **Một hệ thống mỗi project.**

---

## Bước 6 — PRE-FLIGHT CHECK LITE  *(Layer 2: taste-skill — gate)*

Chỉ `PASS_TO_CODE` mới được sửa file UI.

```text
PRE_FLIGHT_LITE:
1. Brief understood?            YES / NO
2. Page type identified?        YES / NO
3. Main user action clear?      YES / NO
4. Visual direction selected?   YES / NO
5. Anti-slop risks identified?  YES / NO
6. Responsive plan ready?       YES / NO
7. Accessibility risks checked? YES / NO
8. Component states considered? YES / NO
9. Copy tone selected?          YES / NO
10. Verdict: PASS_TO_CODE / NEEDS_MORE_BRIEF
```

---

## Bước 7 — ANTI-SLOP CHECK  *(Layer 2: taste-skill)*

FAIL nếu dự định dùng (không có lý do rõ):

- [ ] gradient tím/cyan AI mặc định
- [ ] glassmorphism vô nghĩa
- [ ] 3 feature card ngang rập khuôn
- [ ] CTA glow vô lý
- [ ] generic SaaS hero (headline + 2 CTA + mockup lơ lửng)
- [ ] emoji/icon lộn xộn (→ dùng Phosphor icons)
- [ ] animation loop vô nghĩa
- [ ] stock copy ("revolutionary", "seamless", "elevate")
- [ ] Inter + slate + rounded card mặc định khi không cần

```text
ANTI_SLOP_RISKS: (liệt kê rủi ro + cách tránh cụ thể)
```

---

## Bước 8 — CODE  *(với data từ Layer 3)*

Khi code, áp dụng:

### Icon rules (ui-ux-pro-max — cụ thể hơn)

- Thư viện mặc định: **Phosphor** (`@phosphor-icons/react`)
- Fallback: Heroicons — giữ nhất quán stroke/fill style
- Không dùng emoji làm structural icon
- Meaningful icon cần `aria-label`; decorative icon cần `aria-hidden="true"`

### Typography rules (taste-skill — nghiêm hơn)

- Không mặc định Inter trừ khi có lý do rõ
- Body: 60-75 ký tự/dòng
- Tối đa 2 font family có lý do
- Heading có nhịp rõ

### Motion rules (cả 2 layer đồng thuận)

- `prefers-reduced-motion` bắt buộc
- Motion phục vụ dẫn mắt / phản hồi / chuyển trạng thái
- Không loop vô hạn trừ khi phục vụ hiểu nội dung
- Timing dùng shared token — không hardcode mỗi component

### A11y rules (ui-ux-pro-max — chi tiết hơn, bổ sung)

- Text contrast ≥ 4.5:1 (normal) / 3:1 (large text / non-text UI)
- Touch targets ≥ 44×44pt (iOS) / 48×48dp (Android)
- Focus order khớp visual order
- Form: label + hint + error message rõ
- Màu không phải indicator duy nhất
- Sticky UI không che keyboard focus

---

## Bước 9 — SELF REVIEW  *(Layer 2: taste-skill)*

Chạy trước PR / chốt design.

```text
SELF_REVIEW:
- Brief alignment  : PASS / FAIL
- Visual hierarchy : PASS / FAIL
- Originality      : PASS / FAIL
- Accessibility    : PASS / FAIL
- Mobile           : PASS / FAIL
- Component quality: PASS / FAIL
- Verdict: PASS_TO_CODE / NEEDS_POLISH / NEEDS_REDESIGN
```

---

## Bước 10 — DESIGN QA SCORE  *(Layer 2: ui-review-skill)*

Dùng `skills/ui-review-skill/SKILL.md` sau khi có UI thực.

Verdict: **READY** / **NEEDS_POLISH** / **NEEDS_REDESIGN** / **FAIL**

---

## Output tổng hợp (template copy-paste trước code)

```text
═══════════════════════════════════════════════════════
DESIGN_READ:
  Product type      :
  Target user       :
  User intent       :
  Primary action    :
  Content hierarchy :
  Constraints       :
  Assets            :
  Summary           : Đọc brief này là: <type> cho <user>, intent <...>, nghiêng về <style>.

TASTE_DIRECTION:
  Developer preset  :
  Color direction   :
  Typography        :
  Component style   :

DIALS:
  DESIGN_VARIANCE   : /10  (baseline: taste-skill)
  MOTION_INTENSITY  : /10  (baseline: taste-skill)
  VISUAL_DENSITY    : /10  (baseline: taste-skill)
  [ui-ux-pro-max override note]:

DESIGN_SYSTEM_DATA: (từ ui-ux-pro-max script output)
  Style             :
  Palette           :
  Typography        :
  Effects           :
  Anti-patterns     :

UI_PLAN:
  Layout            :
  Components        :
  Responsive        : mobile-first 360 / 768 / 1280
  A11y plan         :
  States            : loading / empty / error / success
  Edge cases        :
  DS map            :

PRE_FLIGHT_LITE:
  1. YES/NO  2. YES/NO  3. YES/NO  4. YES/NO  5. YES/NO
  6. YES/NO  7. YES/NO  8. YES/NO  9. YES/NO
  10. Verdict: PASS_TO_CODE / NEEDS_MORE_BRIEF

ANTI_SLOP_RISKS:

VERDICT: PASS_TO_CODE | NEEDS_MORE_BRIEF
═══════════════════════════════════════════════════════
```

---

## Quy tắc conflict resolution (tóm tắt)

| Khi nào | Áp dụng |
|---------|---------|
| Process / gate | **taste-skill** thắng |
| Anti-template / slop guard | **taste-skill** thắng |
| Font mặc định | **taste-skill** thắng (không Inter mặc định) |
| Palette / style data thực | **ui-ux-pro-max** thắng |
| A11y checklist đầy đủ | **ui-ux-pro-max** thắng (dùng bổ sung) |
| Dials baseline | taste-skill → refine bằng ui-ux-pro-max output |
| Native app (safe-areas, touch) | **ui-ux-pro-max** (sâu hơn) |
| Web/SaaS/Dashboard | **taste-skill** (focus hơn) |
