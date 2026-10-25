---
name: ui-review-skill
description: UI Design QA Audit & Scoring system for web and mobile interfaces. Thang điểm 100 tiêu chuẩn (Design QA Score), audit checklist a11y, mobile 360px, typography, anti-slop, and verdict determination (READY / NEEDS_POLISH / NEEDS_REDESIGN / FAIL).
---

# UI Review Skill — Design QA Audit (Thang điểm 100)

Dùng để đánh giá chất lượng giao diện (Design QA) sau khi hoàn thiện code UI hoặc trước khi merge PR. Đảm bảo giao diện đạt chuẩn thẩm mỹ cao cấp, không dính lỗi AI slop, thân thiện với mobile và chuẩn WCAG 2.1 AA.

---

## 1. Bảng chấm điểm Design QA Score (100 Điểm)

### Hạng mục 1: Visual Hierarchy & Design System (20 Điểm)
- **[5đ]** Áp dụng đúng triết lý thiết kế (ví dụ: *Precision Swiss LearningGrid*), không lai tạp phong cách.
- **[5đ]** Tuân thủ tuyệt đối Token màu của dự án (100% màu nằm trong bảng token, không tạo màu tùy tiện).
- **[5đ]** Cấu trúc phân cấp thông tin rõ ràng (Mắt người nhìn ngay ra điểm trọng tâm trong 3 giây đầu).
- **[5đ]** Mỗi màn hình chỉ có duy nhất **một hành động Primary nổi bật**.

### Hạng mục 2: Typography & Spacing Rhythm (20 Điểm)
- **[5đ]** Font chữ đúng quy định (ví dụ: `Be Vietnam Pro` + `JetBrains Mono` cho số liệu), không để default Inter.
- **[5đ]** Tỷ lệ kích thước chữ (Type scale) chuẩn, line-height cân đối, chiều dài dòng đọc vừa mắt (~60-75 ký tự).
- **[5đ]** Nhịp khoảng cách (Spacing rhythm) dựa trên hệ 4px/8px nhất quán, không dùng số ngẫu nhiên.
- **[5đ]** Bảng/danh sách số liệu áp dụng `tabular-nums` và font monospace.

### Hạng mục 3: Anti-Slop & Quality Polish (20 Điểm)
- **[5đ]** Không có gradient màu tím/cyan AI rập khuôn; không dùng hiệu ứng glassmorphism vô nghĩa.
- **[5đ]** Không có card rập khuôn dạng 3 cột generic SaaS; không có hiệu ứng CTA glow chói mắt.
- **[5đ]** Icon đồng nhất họ (ưu tiên Phosphor icons), stroke width đồng nhất, không dùng emoji làm biểu tượng chức năng.
- **[5đ]** Chuyển động vi mô (motion) tinh tế, phục vụ phản hồi hoặc trạng thái, tôn trọng `prefers-reduced-motion`.

### Hạng mục 4: Mobile-First & Responsive Layout (20 Điểm)
- **[5đ]** Hiển thị hoàn hảo ở kích thước hẹp **360px** (không tràn ngang, không vỡ layout).
- **[5đ]** Vùng chạm cảm ứng (Touch targets) ≥ 44x44px cho mọi nút bấm, link và lựa chọn.
- **[5đ]** Thao tác ngón cái thuận tiện (sử dụng Bottom Bar / Sticky Action Bar ở mobile).
- **[5đ]** Chuyển đổi linh hoạt và mượt mà giữa Mobile (360px), Tablet (768px), và Desktop (1280px).

### Hạng mục 5: Accessibility & State Resilience (20 Điểm)
- **[5đ]** Độ tương phản màu đạt chuẩn WCAG 2.1 AA (chữ ≥ 4.5:1, viền ô nhập liệu ≥ 3:1).
- **[5đ]** Không dùng màu sắc làm tín hiệu duy nhất (luôn đi kèm nhãn chữ hoặc ký hiệu như `[✓]`, `[✗]`, `[!]`).
- **[5đ]** Trạng thái bàn phím và Focus ring rõ ràng (`outline: 2px solid`, `outline-offset: 2px`), hỗ trợ phím tắt chuẩn.
- **[5đ]** Xử lý đầy đủ 4 trạng thái cốt lõi: Empty state, Loading skeleton, Error state có nút Thử lại, Success.

---

## 2. Thang đánh giá và Verdict

Tổng điểm = H1 + H2 + H3 + H4 + H5 (Tối đa 100 điểm)

| Điểm số | Verdict | Hành động tiếp theo |
| :--- | :--- | :--- |
| **90 - 100** | 🟢 **READY** | Sẵn sàng xuất xưởng / Merge vào nhánh chính. |
| **75 - 89** | 🟡 **NEEDS_POLISH** | Đạt yêu cầu cơ bản, cần tinh chỉnh các chi tiết nhỏ trước khi release. |
| **50 - 74** | 🟠 **NEEDS_REDESIGN** | Cần cơ cấu lại bố cục hoặc xử lý lại tương tác, chưa đạt chuẩn trải nghiệm. |
| **< 50** | 🔴 **FAIL** | Dính lỗi nghiêm trọng hoặc dính AI slop nặng, bắt buộc làm lại theo Taste Gate. |

---

## 3. Template Báo cáo Design QA (Mẫu xuất ra cho Agent)

```text
═══════════════════════════════════════════════════════
DESIGN QA AUDIT REPORT
Màn hình / Component: [Tên trang hoặc component]
Người đánh giá: [Agent Role / Reviewer]

CHẤM ĐIỂM:
1. Visual Hierarchy & Design System : [../20]
2. Typography & Spacing Rhythm      : [../20]
3. Anti-Slop & Quality Polish        : [../20]
4. Mobile-First & Responsive Layout  : [../20]
5. Accessibility & State Resilience  : [../20]
───────────────────────────────────────────────────────
TỔNG ĐIỂM: [../100]
VERDICT  : READY | NEEDS_POLISH | NEEDS_REDESIGN | FAIL

DANH SÁCH LỖI & ĐIỂM CẦN CẢI THIỆN:
- [P1 - Nghiêm trọng]: ...
- [P2 - Cần hoàn thiện]: ...
- [P3 - Gợi ý thêm]: ...
═══════════════════════════════════════════════════════
```
