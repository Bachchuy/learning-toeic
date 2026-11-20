# Brand Guidelines — Tôi Yêu Em Íc (Học TOEIC Dễ Dàng)

> Tài liệu cầu nối cho `.agents/skills/brand/SKILL.md` và `.cursor/rules/dmctn-taste-gate.mdc`. Mọi chi tiết kỹ thuật đối chiếu trực tiếp với [docs/05-design/design-direction.md](file:///d:/code/learning-toeic/docs/05-design/design-direction.md).

## 1. Định danh Thương hiệu (Brand Identity)
- **Tên thương hiệu:** **Tôi Yêu Em Íc**
- **Khẩu hiệu (Tagline):** *Học TOEIC Dễ Dàng*
- **Component chuẩn:** [src/components/ui/brand-logo.tsx](file:///d:/code/learning-toeic/src/components/ui/brand-logo.tsx) (`variant="full" | "horizontal" | "icon"`)
- **Định hướng thẩm mỹ:** **Precision Swiss** (35% Linear · 30% Stripe Docs · 20% Vercel · 15% Duolingo restraint) — đề cao sự tập trung, cấu trúc viền `1px` sắc nét, không gradient lòe loẹt, không glassmorphism tràn lan.

## 2. Hệ Màu Chuẩn (Approved Color Tokens)
> **Bất biến (`AGENTS.md §0`):** Không dùng bất kỳ màu nào ngoài hệ token dưới đây; không dùng màu làm tín hiệu duy nhất (luôn đi kèm nhãn chữ + icon).

| Vai trò | Token CSS | Mã HEX | Quy tắc sử dụng |
|---|---|---|---|
| Canvas chính | `--color-bg-canvas` | `#F8FAFC` | Nền trang học tập tập trung |
| Canvas ấm | `--color-bg-warm` | `#FAFAF7` | Nền thẻ thống kê / chỉ số phụ |
| Surface | `--color-bg-surface` | `#FFFFFF` | Nền Card, Modal, Sidebar |
| Muted | `--color-bg-muted` | `#F1F5F9` | Nền pill phụ, thanh tiến độ rỗng |
| Text Primary | `--color-text-primary` | `#0F172A` | Tiêu đề, câu hỏi TOEIC, nội dung chính |
| Text Secondary | `--color-text-secondary` | `#475569` | Mô tả phụ, nhãn hướng dẫn (tương phản AA ≥ 7:1) |
| Primary Default | `--color-primary-default` | `#2563EB` | Nút Primary duy nhất trên mỗi màn hình, trạng thái đang chọn |
| Primary Hover | `--color-primary-hover` | `#1D4ED8` | Hover nút Primary |
| Primary Subtle | `--color-primary-subtle` | `#EFF6FF` | Nền lựa chọn, tab đang mở, cột biểu đồ phụ |
| Border Subtle | `--color-border-subtle` | `#E2E8F0` | Viền thẻ `1px` mặc định |
| Border Strong | `--color-border-strong` | `#8190A6` | Viền ô nhập liệu, nút Secondary (WCAG 1.4.11 ≥ 3:1) |
| Success (Đúng/Vững) | `--status-success-*` | `#047857` / `#ECFDF5` / `#A7F3D0` | Đáp án đúng, `Đã vững`, `Đã ôn xong hôm nay` |
| Error (Sai/Hổng) | `--status-error-*` | `#BE123C` / `#FFF1F2` / `#FECDD3` | Đáp án sai, `Đang hổng`, cảnh báo xóa |
| Warning (Chú ý) | `--status-warning-*` | `#B45309` / `#FFFBEB` / `#FDE68A` | `Đang củng cố`, chuỗi ngày học (Streak) |
| Review (FSRS) | `--status-review-*` | `#4338CA` / `#EEF2FF` | Thẻ FSRS đến hạn ôn tập |

## 3. Typography & Iconography
- **Font Sans:** `Be Vietnam Pro` (`--font-sans`) — tối ưu dấu tiếng Việt và tốc độ đọc câu hỏi TOEIC.
- **Font Mono:** `JetBrains Mono` (`--font-mono`, `tabular-nums`) — dùng cho bộ đếm thẻ (`THẺ 0 / 0`), điểm số `5–495`, tỷ lệ `%`, đồng hồ đếm ngược.
- **Font IPA:** `Noto Sans` (`--font-ipa`) — hiển thị chuẩn ký hiệu phiên âm quốc tế IPA.
- **Icons:** Chỉ dùng `lucide-react` (không dùng emoji làm icon cấu trúc).

## 4. Giọng điệu Nội dung (Voice & Tone)
- **Trung thực & Rõ ràng:** Phân biệt minh bạch 3 trạng thái học tập (`Chưa nạp vào sổ` -> `Mới nạp · Chưa ôn` -> `Đã ôn xong hôm nay`). Không báo hoàn thành ảo khi học viên chưa học.
- **Khích lệ thực chất:** Dựa trên số liệu thật (Adaptive Rolling Mastery 20 câu gần nhất và lịch ôn FSRS), không dùng từ ngữ thổi phồng.
