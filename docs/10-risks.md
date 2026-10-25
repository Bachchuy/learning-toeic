<!-- Trích từ Master Blueprint v1.0 · 23/10/2026 -->
<!-- Nguồn gốc: archive/master-blueprint-v1.0.md -->

## 10. Sổ rủi ro

| Rủi ro | Xác suất / Ảnh hưởng | Giảm thiểu | Dấu hiệu |
| --- | --- | --- | --- |
| Chất lượng câu hỏi thấp, nhiều báo lỗi | Trung bình / Cao | Duyệt tay từng câu trước khi nạp; báo lỗi và hàng đợi duyệt; rút câu lỗi nhanh | Tỉ lệ báo lỗi trên 2% |
| Lộ đáp án hoặc dữ liệu người dùng | Thấp / Rất cao | Bảng đáp án tách riêng, RLS, pgTAP, rà soát chéo | Bất kỳ truy vấn chéo người dùng nào trong test |
| Phạm vi phình to, trễ tiến độ | Cao / Cao | MVP chỉ Part 5, MoSCoW, mục 2 nguyên tắc 12 | Hai milestone liên tiếp trễ |
| Kiệt sức, thiếu thời gian (làm một mình) | Cao / Cao | Nhịp bền vững, phạm vi nhỏ, nghỉ có kế hoạch, cắt COULD trước | Bỏ qua kiểm thử để kịp tiến độ |
| Rủi ro pháp lý về bản quyền hoặc nhãn hiệu | Thấp đến trung bình / Cao | Không dùng đề thật, tuyên bố không liên kết ETS, xin ý kiến chuyên môn trước khi thương mại hóa | Phát hiện trùng lặp với văn bản có sẵn |
| Số câu hỏi quá ít để thống kê có nghĩa | Trung bình / Trung bình | Mục tiêu khoảng 6 câu mỗi chủ điểm (khoảng 100 câu) để vượt ngưỡng 5 | Nhiều chủ điểm mãi ở Chưa đủ dữ liệu |
| Người học không quay lại | Trung bình / Cao | Phỏng vấn sớm, thử nghiệm khả dụng với 3–5 người, nhắc ôn hợp lý | Giữ chân ngày 7 thấp |
| Mâu thuẫn tài liệu quay lại | Trung bình / Trung bình | Mục 0.3 và sổ quyết định; chỉ sửa ở tài liệu này | Hai nguồn nói khác nhau |
| Thư viện FSRS đổi phiên bản, kết quả lập lịch đổi theo | Thấp đến trung bình / Trung bình | Khóa phiên bản chính xác; test snapshot kết quả; đọc ghi chú phát hành trước khi nâng cấp; lưu lịch sử chấm thẻ để dựng lại trạng thái | Test snapshot lệch sau khi cập nhật thư viện |

