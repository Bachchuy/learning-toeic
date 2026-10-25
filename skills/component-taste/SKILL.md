---
name: component-taste
description: Component-level design taste guide & rules for web/SaaS/learning app. Anti-slop component execution, states, borders, tokens, accessibility, and interaction polish.
---

# Component Taste Guide — DMCTN R2

Hướng dẫn chuẩn hóa các component cốt lõi, loại bỏ hoàn toàn các mẫu UI rập khuôn (AI slop), tuân thủ triết lý **Precision Swiss LearningGrid** và hệ thống design token của dự án.

---

## 1. Nguyên tắc cốt lõi của Component

1. **Một hệ token duy nhất**: Mọi component phải ăn khớp với CSS variables / Tailwind tokens trong `docs/05-design/design-direction.md`. Tuyệt đối không hardcode HEX tùy tiện.
2. **Đầy đủ ma trận trạng thái (State Matrix)**: Default, Hover, Active/Pressed, Focus, Disabled, Loading, Error, Empty.
3. **Chống AI Slop**:
   - ❌ Không dùng gradient tím/cyan neon, không CTA glow hoặc shadow quá đà.
   - ❌ Không dùng border mờ nhạt không đạt độ tương phản 3:1 với ô nhập liệu (`border.input` phải là `#8190A6`).
   - ❌ Không dùng card viền bóng mờ vô nghĩa; ưu tiên flat 1px border.

---

## 2. Quy chuẩn chi tiết từng Component

### 2.1 Button (Nút bấm)
- **Primary Button**:
  - Background: `color.primary.default` (`#2563EB`), Hover: `color.primary.hover` (`#1D4ED8`).
  - Chiều cao: 48px cho mobile CTA chính, 44px cho thao tác phụ. Radius: 8px. Font: SemiBold 15-16px.
  - **Quy tắc bất biến**: Mỗi màn hình chỉ **duy nhất một nút Primary**.
- **Secondary Button**:
  - Border: `color.border.input` (`#8190A6`), Text: `color.text.primary` (`#0F172A`), Background: Transparent / Surface.
- **Destructive Button**:
  - Background: `status.error` (`#BE123C`), dùng riêng cho vùng nguy hiểm (Xóa tài khoản).
- **Disabled State (Quan trọng)**:
  - Áp dụng `opacity: 0.4` lên **toàn bộ component wrapper** (cả text lẫn background), kèm thuộc tính `disabled` và `aria-disabled="true"`. Không click, không hover effect.

### 2.2 Answer Option Row (Phương án trắc nghiệm A/B/C/D)
Component trung tâm của app luyện thi:
- **Kích thước**: Chiều cao tối thiểu 52px, padding 12px, radius 8px.
- **Keycap (A, B, C, D)**: 28x28px, radius 6px, font chữ mono.
- **5 Trạng thái bắt buộc**:
  1. *Default*: Border `color.border.default`, Background `color.bg.surface`.
  2. *Selected (trước khi nộp)*: Background `color.primary.subtle` (`#EFF6FF`), Border `color.primary.default` (`#2563EB`).
  3. *Correct (sau khi nộp)*: Background `#ECFDF5`, Border `#047857`, Kèm biểu tượng `[✓]`.
  4. *Incorrect (sau khi nộp)*: Background `#FFF1F2`, Border `#BE123C`, Kèm biểu tượng `[✗]`.
  5. *Unselected (sau khi nộp)*: Mờ nhẹ, không nhận tương tác bấm.
- **Accessibility**: Bắt buộc gắn `role="radiogroup"` và `role="radio"`, hỗ trợ phím số 1-4 hoặc chữ A-D.

### 2.3 Adaptive Explanation Box (Hộp giải thích thích ứng)
- Viền trái 4px đặc trưng với màu `color.primary.default` (`#2563EB`).
- Padding 16px, radius 10px, nền `color.bg.surface`.
- Sai → Tự động mở toàn bộ (`Expanded`), ghi nhận `explanation_viewed`.
- Đúng → Thu gọn (`Collapsed`), chỉ hiện Quy tắc cốt lõi + nút `[+ Mở rộng]` để người học không bị ngợp.
- Accessibility: Bọc trong vùng `aria-live="polite"` để screen reader thông báo nhẹ nhàng khi xuất hiện.

### 2.4 FSRS Flashcard Component
- Thẻ kích thước tối thiểu 240px chiều cao, padding 20px.
- Mặt trước: Câu ngữ cảnh đục lỗ `[ ? ]` + nút Primary `[Hiện đáp án]`.
- Mặt sau: Từ vựng nổi bật (Bold 22px), phiên âm, nghĩa tiếng Việt.
- **4 nút chấm thẻ**: Cao **60px** (chuẩn vùng chạm ngón tay).
  - Lỗi (`Again`) → Nền đỏ nhạt, text đỏ.
  - Khó (`Hard`) → Nền vàng nhạt, text vàng đậm.
  - Tốt (`Good`) → Nền xanh dương nhạt.
  - Dễ (`Easy`) → Nền xanh lá nhạt.
  - Thời gian hẹn (ví dụ: "10m", "1d", "4d") lấy trực tiếp từ hàm `repeat()` của thư viện `ts-fsrs`.

### 2.5 Word Chip & Bottom Sheet
- **Word Chip**: Cao 36px, radius 6px. Trạng thái toggle cần gắn `aria-pressed="true|false"`.
- **Bottom Sheet (Mobile) / Dialog (Desktop)**:
  - Mobile: Trượt mượt từ dưới lên, bo góc trên 16px, padding 20px, có overlay nền mờ nhẹ.
  - Desktop: Tự động chuyển thành Modal Dialog căn giữa màn hình.
  - Focus trap: Khi mở ra, focus lập tức nhảy vào tiêu đề hoặc ô nhập liệu đầu tiên; đóng bằng phím `Escape`, nút `[X]` hoặc chạm vùng tối ngoài modal.

### 2.6 Input & Form Fields
- Chiều cao tối thiểu 44px, radius 8px.
- Mobile font size bắt buộc: **tối thiểu 16px** (chống lỗi iOS Safari tự động zoom trang).
- Border: `color.border.input` (`#8190A6`) đạt chuẩn WCAG 3:1.
- Focus: `outline: 2px solid #2563EB; outline-offset: 2px`.
- Luôn có `<label>` ngữ nghĩa rõ ràng phía trên, không thay thế label bằng placeholder.

---

## 3. Checklist tự kiểm tra Component trước khi bàn giao
- [ ] Không có mã màu nào nằm ngoài danh mục `docs/05-design/design-direction.md`.
- [ ] Mọi nút bấm đều có touch target ≥ 44x44px.
- [ ] Các icon trang trí đã được gán `aria-hidden="true"`.
- [ ] Các icon tương tác đều có `aria-label` mô tả hành động.
- [ ] Không phụ thuộc vào duy nhất một màu sắc để diễn đạt ý nghĩa (luôn kèm icon/text).
- [ ] Responsive hiển thị chuẩn ở cả mobile 360px và desktop 1280px.


---

## 4. Token-correct Color Reference (tra nhanh khi code)

> ⚠️ Dùng CSS var, không hardcode HEX. Các màu dưới đây là giá trị chuẩn khớp token.

| Trạng thái | Background CSS var | Border/Text CSS var | Sai (KHÔNG dùng) |
|---|---|---|---|
| Correct | `var(--status-success-bg)` = `#ECFDF5` | `var(--status-success-text)` = `#047857` | ~~#22C55E, #16A34A, #F0FDF4~~ |
| Incorrect | `var(--status-error-bg)` = `#FFF1F2` | `var(--status-error-text)` = `#BE123C` | ~~#EF4444, #DC2626, #FEF2F2~~ |
| Selected | `var(--color-primary-subtle)` = `#EFF6FF` | `var(--color-primary-default)` = `#2563EB` | ✓ đúng |
| Warning | `var(--status-warning-bg)` = `#FFFBEB` | `var(--status-warning-text)` = `#B45309` | ~~#F59E0B, #FBBF24~~ |

### Icon library
- **Bắt buộc**: `@phosphor-icons/react` — `weight="fill"` cho status icons, `weight="regular"` cho UI icons
- **Không dùng**: `lucide-react` (đã có trong legacy, sẽ migrate dần)

### Card variants chuẩn
- `variant="default"` — card trắng, border 1px (mặc định)
- `variant="question"` — border-left 3px primary (dùng cho câu hỏi, explanation box)
- `variant="stat"` — nền ấm `#FAFAF7`, dùng cho KPI tiles

### Typography moments (chống scale phẳng)
- H1 desktop: **≥ 28px** (tracking `−0.02em`, leading `1.2`) — không để default 24px
- Overline: **11px mono bold uppercase tracking-[0.08em]** — luôn đi trước H1 lớn
- Mono number: `tabular-nums`, font-mono, size **28–32px** cho KPI
