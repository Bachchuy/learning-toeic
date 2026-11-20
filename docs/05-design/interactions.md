<!-- Trích từ Master Blueprint v1.0 · 23/10/2026 -->
<!-- Nguồn gốc: archive/master-blueprint-v1.0.md -->

### 5.7 Tương tác quan trọng

| Tương tác | Kích hoạt | Điều kiện | Kết quả | Lỗi |
| --- | --- | --- | --- | --- |
| Đăng nhập | \[Đăng nhập\] | Email và mật khẩu hợp lệ | Xác thực → `/` | "Email hoặc mật khẩu không đúng" |
| Nộp câu | \[Nộp đáp án\] hoặc Enter | Đã chọn một phương án | RPC `submit_answer` → đúng/sai, đáp án, giải thích; màu + ký hiệu | Mất mạng: giữ lựa chọn, \[Thử lại\] |
| Lưu từ | \[+ Lưu từ vựng\] | Ở màn Phản hồi hoặc Kết quả | Mở Sheet, điền ngữ cảnh, chạm Word Chip để điền từ và nghĩa gợi ý | Trùng (23505): "Từ này đã có trong sổ" |
| Drill | \[Luyện lại X câu sai\] | Có ít nhất 1 câu sai | Drill tại client, không ghi `attempts` | Không có (chạy cục bộ) |
| Chấm FSRS | Nút Lại/Khó/Tốt/Dễ hoặc phím 1–4 | Đang ở mặt sau | Thư viện FSRS tính lịch từ trạng thái thẻ trong DB → cập nhật `review_cards` và ghi `card_reviews` trong một giao dịch → thẻ tiếp | Lỗi DB: toast, không sang thẻ sau |
| Admin duyệt | Y / N | Còn câu trong hàng đợi | `published` / `retired`, ghi `review_log`, sang câu kế | Lỗi RLS: báo không được phép |

