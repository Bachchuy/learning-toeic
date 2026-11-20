<!-- Trích từ Master Blueprint v1.0 · 23/10/2026 -->
<!-- Nguồn gốc: archive/master-blueprint-v1.0.md -->

## 5. Đặc tả thiết kế giao diện (thay thế hai bản Handoff)

### 5.1 Hướng thị giác

**Visual Direction 2 — "Precision Swiss LearningGrid"**: lưới chính xác, thẻ phẳng dùng viền 1px thay vì bóng đổ, số liệu dùng chữ đơn cách (mono), màu chỉ dùng để truyền trạng thái (đúng, sai, khá, vững). Không gradient, không animation trang trí, không ảnh minh họa rời rạc. Mỗi trang ưu tiên đúng nhiệm vụ của nó (làm bài, ôn thẻ, đọc thống kê, duyệt đề).

### 5.2 Token màu

Cột "Tương phản đo lại" là giá trị tính thực tế theo công thức WCAG (các số được ghi trong Handoff gốc có vài chỗ lệch nhẹ, ví dụ #B45309 trên #FFFBEB chỉ đạt 4,84:1 chứ không phải 5,1:1; vẫn đạt AA 4,5:1).

| Token | HEX | Tương phản đo lại | Dùng cho |
| --- | --- | --- | --- |
| `color.primary.default` | #2563EB | 5,17:1 trên trắng; 4,94:1 trên #F8FAFC | Nút Primary, thanh tiến độ, viền phương án đang chọn, focus ring |
| `color.primary.hover` | #1D4ED8 | cao hơn primary | Hover/active nút Primary |
| `color.primary.subtle` | #EFF6FF | nền (chữ xanh trên nền này đạt 4,75:1) | Nền phương án đang chọn (trước khi nộp) |
| `color.secondary.default` | #0F172A | 17,85:1 trên trắng | Nút phụ quan trọng, huy hiệu chuỗi ngày, keycap kích hoạt |
| `color.bg.page` | #F8FAFC | nền | Nền trang |
| `color.bg.surface` | #FFFFFF | nền | Thẻ, modal, sheet, thẻ câu hỏi |
| `color.bg.muted` | #F1F5F9 | nền | Hộp Quy tắc, keycap mặc định, rãnh tiến độ, trạng thái chỉ đọc |
| `color.text.primary` | #0F172A | 17,85:1 | Tiêu đề, câu hỏi, phương án, văn bản chính |
| `color.text.secondary` | #475569 | 7,58:1 trên trắng; 6,92:1 trên #F1F5F9 | Phụ đề, nhãn overline, thời gian, số câu đúng thô |
| `color.border.default` | #E2E8F0 | 1,23:1 (trang trí, không dùng để nhận diện ô nhập) | Viền thẻ, đường kẻ bảng |
| `color.border.input` (**mới, D-07**) | #8190A6 | 3,24:1 trên trắng; 3,10:1 trên #F8FAFC | Viền ô nhập, nút Secondary. #CBD5E1 trong Handoff gốc chỉ 1,48:1 nên không đủ để nhận diện ranh giới ô nhập (WCAG 1.4.11 yêu cầu 3:1) |
| `status.success` | text #047857 · bg #ECFDF5 | 5,21:1 trên nền; chữ trắng trên #047857 5,48:1 | Đáp án đúng, nhãn \[✓\] Vững (nút Dễ) |
| `status.error` | text #BE123C · bg #FFF1F2 | 5,72:1 trên nền; chữ trắng trên #BE123C 6,29:1 | Đáp án sai, lỗi mạng, nhãn \[!\] Cần ôn, viền ô nhập lỗi (thay #F43F5E), nút Destructive, nút Lại |
| `status.warning` | text #B45309 · bg #FFFBEB | 4,84:1 trên nền; 5,02:1 trên trắng | Nhãn \[\~\] Khá, cảnh báo ít câu mới, nút Khó |
| `status.info` | text #4338CA · bg #EEF2FF | 7,07:1 trên nền | Băng rôn Chế độ ôn lại tạm thời (Drill) |
| `status.insufficient` | text #475569 · bg #F1F5F9 | 6,92:1 | Nhãn \[?\] Chưa đủ dữ liệu |

Quy tắc: **không tạo màu ngoài bảng này.** Cột biểu đồ 14 ngày dùng `primary` với độ trong suốt (không dùng #DBEAFE riêng). Khi cần màu mới: sửa bảng này trước.

### 5.3 Chữ

- Sans: 'Be Vietnam Pro', 'Inter', hệ thống; Mono: 'JetBrains Mono', 'Geist Mono' (bắt buộc cho số liệu, tiến độ, thời gian, `tabular-nums`). Nạp bằng `next/font`; không thêm font thứ ba; có font dự phòng.
- Heading 1: 24px (desktop) / 20px (mobile), Bold 700, dòng 1,3. Heading 2: 18/17px, SemiBold 600, dòng 1,35.
- Câu hỏi (stem): 20/18px, Medium 500, dòng 1,6. Giải thích: 16px, Regular 400, từ khóa SemiBold 600, dòng 1,6.
- Overline: 12px, Bold, IN HOA, cách chữ +0,06em. Số liệu: 13–14px mono, Medium.
- Input trên mobile từ 16px (tránh iOS tự phóng to).

### 5.4 Khoảng cách, bo góc, độ nổi

- Spacing cơ sở 4px: sp-1 4, sp-2 8, sp-3 12, sp-4 16, sp-5 20, sp-6 24, sp-8 32.
- Radius: sm 6, md 8, lg 10, sheet 16 (góc trên của Bottom Sheet).
- Thẻ mặc định **không đổ bóng** (viền 1px). Chỉ Bottom Sheet và Modal dùng shadow-xl.
- Chuyển động tối thiểu (mở sheet, mở accordion); tôn trọng `prefers-reduced-motion`.

