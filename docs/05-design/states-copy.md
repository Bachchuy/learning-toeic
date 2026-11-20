<!-- Trích từ Master Blueprint v1.0 · 23/10/2026 -->
<!-- Nguồn gốc: archive/master-blueprint-v1.0.md -->

### 5.10 Ma trận trạng thái tối thiểu cần có cho mỗi màn hình

| Màn hình | Rỗng | Đang tải | Lỗi | Đặc thù |
| --- | --- | --- | --- | --- |
| Login | — | Loading nút | Lỗi xác thực | Đăng ký thành công, quên mật khẩu |
| Dashboard | Người mới, 0 thẻ | Skeleton | \[Thử lại\] | Low-data |
| /practice/new | Hết câu | Skeleton | \[Thử lại\] | Ít câu mới |
| /practice/\[id\] | — | Đang chấm | Mất mạng | Sai/đúng; câu bị rút |
| /result | 10/10 | Skeleton | \[Thử lại\] | Drill, kết quả Drill |
| /vocab | 0 từ, không có kết quả | Skeleton | Lỗi lưu | Trùng, sửa tại chỗ, xóa |
| /review | Không có thẻ đến hạn | Skeleton | Lỗi lưu | Phiên xong |
| /stats | Người mới, biểu đồ rỗng | Skeleton | \[Thử lại\] | Đủ dữ liệu |
| /profile | — | Đang lưu/xuất | Lỗi điểm, lỗi mạng | Xóa tài khoản |
| /admin/review | Hàng đợi trống | Skeleton | Không được phép | Edit Mode |

### 5.11 Nội dung và giọng điệu

Tiếng Việt, ngắn, thân thiện, không đổ lỗi cho người học. Các câu quyết định đã có trong thiết kế: "Email hoặc mật khẩu không đúng"; "Chỉ còn 4 câu mới"; "Bạn đã làm đúng hết câu của chủ điểm này trong 7 ngày qua"; "Từ này đã có trong sổ"; "Chế độ ôn lại tạm thời — Không lưu vào lịch sử và không đổi điểm thống kê"; "Chưa đủ dữ liệu (X/5 câu)". Nhãn độ vững phải có chú thích ngắn giải thích ý nghĩa ngay trên giao diện.

