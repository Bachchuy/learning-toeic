<!-- Trích từ Master Blueprint v1.0 · 23/10/2026 -->
<!-- Nguồn gốc: archive/master-blueprint-v1.0.md -->

## 3. Sổ quyết định hợp nhất

### 3.1 Quyết định sản phẩm (PD) — bất biến

| ID | Quyết định | Trạng thái |
| --- | --- | --- |
| PD-01 | Lưu từ vựng nhanh bằng Bottom Sheet (mobile) hoặc Dialog (desktop); tự điền câu ngữ cảnh; Word Chip từ câu hỏi và 4 phương án; nghĩa tiếng Việt gợi ý nhưng sửa được | \[ĐÃ CHỐT\] |
| PD-02 | Trả lời **sai**: tự mở toàn bộ giải thích. Trả lời **đúng**: hiện Quy tắc cốt lõi, thu gọn phần còn lại, có nút mở. Đo bằng hai sự kiện `explanation_viewed` và `explanation_expand_clicked`; không dùng lượt mở làm chỉ số độ hiểu | \[ĐÃ CHỐT\] |
| PD-03 | Luyện lại câu sai bằng Client-side Drill: không tạo attempt, không đổi `mastery_pct`, giao diện phân biệt rõ với kết quả phiên chính thức, nhãn "Chế độ ôn lại tạm thời" | \[ĐÃ CHỐT\] |
| PD-04 | Sau đăng nhập vào thẳng Dashboard; `/profile` gồm tên hiển thị, điểm mục tiêu 10–990, xuất dữ liệu, xóa tài khoản với xác nhận 2 lớp | \[ĐÃ CHỐT\] |
| PD-05 | Nhãn theo cận dưới Wilson: dưới 50% Cần ôn; 50% đến dưới 75% Khá; từ 75% Vững; dưới 5 lượt: Chưa đủ dữ liệu (X/5). **Ngưỡng 5 là ngưỡng UX tạm thời, cần xác nhận lại với dữ liệu thật** | \[ĐÃ CHỐT\] (ngưỡng 5: tạm) |
| PD-06 | Không có chế độ bấm giờ trong MVP; ẩn toàn bộ UI hẹn giờ | \[ĐÃ CHỐT\] |
| PD-07 | Drill chỉ một lượt (kèm "Luyện lại lần nữa" ở màn tổng kết Drill), chấm tại client | \[ĐÃ CHỐT\] |
| PD-08 | Dashboard mobile chỉ hiện Top 3 chủ điểm đủ từ 5 câu; chủ điểm dưới 5 câu gắn nhãn Chưa đủ dữ liệu | \[ĐÃ CHỐT\] |
| PD-09 | Word Chip lấy từ `vocab_hints` đi kèm giải thích; không gọi LLM lúc làm bài | \[ĐÃ CHỐT\] |

