<!-- Trích từ Master Blueprint v1.0 · 23/10/2026 -->
<!-- Nguồn gốc: archive/master-blueprint-v1.0.md -->

### 5.8 Responsive

- **Mobile (360–767px)**: thiết kế mặc định, 1 cột; Bottom Nav 56px; Focused Header 52px; nút hành động (Nộp, Tiếp tục, Lật thẻ) ghim đáy trong Sticky Action Bar 72px; Bottom Sheet trượt lên; không tràn ngang, không chồng lấn.
- **Tablet (768–1023px)**: container tối đa 768px căn giữa; lưới 2 cột cho thẻ phụ; khung làm bài, flashcard, login, profile giới hạn 640px.
- **Desktop (từ 1024px, chuẩn 1280px; kiểm tra thêm 1440px)**: Sidebar trái 240px; Dashboard và `/stats` chia 2 cột (5/12 và 7/12); phiên học sau khi nộp chia 2 cột; Sheet đổi thành Dialog giữa màn hình.
- Bảng và danh sách dài chuyển thành dòng xếp dọc trên mobile; nội dung rộng cuộn trong khung riêng, không cuộn ngang cả trang.

### 5.9 Accessibility (WCAG 2.1 AA)

- **Tương phản**: chữ ≥ 4,5:1 (theo số đo lại ở 5.2); viền ô nhập và đối tượng giao diện ≥ 3:1.
- **Vùng chạm** ≥ 44×44px (CTA 48, Option Row 52, nút chấm thẻ 60), khoảng cách ≥ 8px.
- **Focus**: `outline: 2px solid #2563EB; outline-offset: 2px` cho mọi phần tử tương tác; Sheet và Dialog bẫy focus và trả focus khi đóng.
- **Không dùng màu làm tín hiệu duy nhất**: đúng/sai và độ vững có 3 lớp: ký hiệu \[✓\] \[✗\] \[!\] \[\~\] \[?\], huy hiệu chữ, màu viền/nền.
- **Trình đọc màn hình**: phản hồi `aria-live="polite"`; nhóm phương án `role="radiogroup"` và `role="radio"`; biểu đồ SVG `aria-hidden` kèm bảng `sr-only`; thanh độ vững `role="progressbar"` có giá trị.
- **Bàn phím**: Enter (Nộp/Tiếp tục), Space (lật thẻ), A–D hoặc 1–4 (chọn đáp án; ở `/review` 1–4 là chấm), J K Y N (admin). Phím một ký tự chỉ hoạt động ở các màn hình này và **không hoạt động khi con trỏ ở ô nhập** (WCAG 2.1.4); phím tắt chỉ hoạt động khi khu vực câu hỏi, thẻ hoặc hàng đợi admin đang có focus (tự focus khi vào màn hình), nên không cần công tắc tắt \[ĐÃ CHỐT\].
- Thu phóng đến 200% không mất nội dung; tôn trọng `prefers-reduced-motion`.
- Kiểm tra: axe mỗi màn hình mới + thử toàn bộ luồng chính bằng bàn phím.

