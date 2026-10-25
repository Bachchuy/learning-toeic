<!-- Trích từ Master Blueprint v1.0 · 23/10/2026 -->
<!-- Nguồn gốc: archive/master-blueprint-v1.0.md -->

## 1. Tầm nhìn, người dùng, phạm vi

### 1.1 Tầm nhìn

> Giúp người tự học TOEIC không chỉ biết đáp án đúng mà hiểu vì sao sai và biết phải học gì tiếp theo.

TOEIC AI là nền tảng luyện tập **độc lập**, không liên kết với ETS. Không dùng logo ETS, không sao chép đề thật.

### 1.2 Người dùng

- **Linh, 21 tuổi, sinh viên năm cuối**, cần TOEIC 600+ để tốt nghiệp. Học buổi tối trên điện thoại, 20–30 phút mỗi lần. Nỗi đau: làm sai nhưng không biết sửa thế nào. → Ưu tiên mobile, phiên ngắn, giải thích rõ.
- **Hùng, 27 tuổi, nhân viên văn phòng**, cần 750+ để xét thăng chức. Học trên laptop, thích xem thống kê. Nỗi đau: không biết điểm yếu ở chủ điểm nào. → Ưu tiên Dashboard và `/stats` rõ ràng.
- **Quản trị viên (chính bạn)**: duyệt mẫu câu hỏi, xử lý báo lỗi.

### 1.3 Phạm vi MVP v1.0

**Trong phạm vi:**

- Đăng ký/đăng nhập (email và Google), vào thẳng Dashboard.
- Luyện Part 5 theo chủ điểm hoặc ngẫu nhiên (5/10/20 câu), loại câu đã làm đúng trong 7 ngày qua.
- Phản hồi tức thì và giải thích thích ứng.
- Kết quả phiên và Client-side Drill (ôn lại tạm thời câu sai).
- Sổ từ vựng có câu ngữ cảnh; ôn tập ngắt quãng FSRS (4 mức nhớ).
- Dashboard và `/stats`: độ vững 16 chủ điểm theo cận dưới Wilson, hoạt động 14 ngày.
- Báo lỗi câu hỏi (đủ 3 báo cùng lý do thì rút về hàng đợi duyệt).
- Hồ sơ `/profile`: tên hiển thị, điểm mục tiêu 10–990, xuất dữ liệu JSON, xóa tài khoản.
- Trang admin duyệt câu hỏi `/admin/review`.

**Ngoài phạm vi (đã khóa, không thêm):** chế độ bấm giờ (PD-06), lưu lịch sử luyện lại vào DB (PD-03), bắt buộc onboarding hồ sơ (PD-04), Part 6/7, Listening, tự động học từ báo lỗi, ứng dụng di động gốc, thanh toán, bảng xếp hạng, mạng xã hội, `/admin/batches` và pipeline sinh đề AI chạy trong sản phẩm (hoãn, xem D-11 và D-13).

### 1.4 User story

| ID | Nội dung | Ưu tiên | Triển khai ở |
| --- | --- | --- | --- |
| US-F1 | Đăng ký, đăng nhập bằng email hoặc Google | MUST | `/login` (M3) |
| US-A1 | Làm một phiên 10 câu Part 5 theo chủ điểm | MUST | `/practice/new`, `/practice/[id]` (M4, M6) |
| US-A2 | Xem đáp án đúng ngay sau mỗi câu | MUST | M4 |
| US-B1 | Đọc giải thích vì sao đúng, vì sao các đáp án khác sai | MUST | M5 |
| US-C1 | Lưu một từ cùng câu chứa nó vào sổ từ vựng | MUST | M7 |
| US-C2 | Được nhắc ôn từ đúng thời điểm (ngắt quãng) | SHOULD | `/review` (M8) |
| US-D1 | Xem tỉ lệ đúng theo từng chủ điểm | SHOULD | `/`, `/stats` (M9) |
| US-F2 | Báo lỗi một câu hỏi có vẻ sai | MUST | M5 |
| US-E1 | Admin duyệt mẫu câu hỏi trước khi xuất bản | MUST | `/admin/review` (M11) |
| US-E2 | Admin xem chi phí và tỉ lệ đạt của lô sinh đề | SHOULD | **Hoãn** cùng pipeline AI (D-13) |
| US-A3 | Chế độ bấm giờ | COULD | **Loại khỏi MVP** (PD-06) |

Tiêu chí chấp nhận mẫu cho US-A1: tạo phiên đúng 10 câu đã duyệt thuộc chủ điểm đã chọn, không có câu nào đã làm đúng trong 7 ngày gần nhất; nếu chủ điểm chỉ còn 4 câu đủ điều kiện thì tạo phiên 4 câu và hiển thị thông báo rõ ràng. Với US-F2: báo cáo lưu kèm mã câu hỏi và thời điểm; câu bị đánh dấu cần duyệt lại khi đạt 3 báo cáo cùng lý do.

### 1.5 Yêu cầu phi chức năng (đo được)

| Nhóm | Chỉ tiêu |
| --- | --- |
| Hiệu năng | LCP trang luyện tập dưới 2,5 giây trên 4G; API không gọi LLM p95 dưới 500 ms |
| Bảo mật | Bật RLS cho mọi bảng; không lộ khóa phía client; client không đọc được cột đáp án |
| Chất lượng nội dung | Câu bị báo lỗi dưới 2% sau 1000 lượt làm; mẫu duyệt tay đạt từ 95% |
| Khả dụng | Hướng tới WCAG 2.1 AA; dùng tốt ở 360 px |
| Bảo trì | Độ phủ kiểm thử từ 70% cho lõi nghiệp vụ (`core/`) |
| Quyền riêng tư | Cho phép xuất và xóa dữ liệu của chính người dùng |
| Độ sẵn sàng | Mục tiêu MVP 99% mỗi tháng |

*Chỉ tiêu "giải thích hiển thị dưới 3 giây (streaming)" của PDF không còn áp dụng vì giải thích được sinh sẵn và lưu trong DB, không gọi LLM khi người học làm bài.*

### 1.6 Ràng buộc pháp lý

- Ghi rõ trên sản phẩm (trang đăng nhập, chân trang): không liên kết với ETS.
- Không dán đề thật vào prompt; prompt mô tả kỹ năng và chủ điểm cần kiểm tra.
- Kiểm tra điều khoản của nhà cung cấp LLM về quyền dùng đầu ra.
- Dữ liệu cá nhân người dùng Việt Nam: đối chiếu Nghị định 13/2023/NĐ-CP và luật bảo vệ dữ liệ cá nhân hiện hành trước khi ra mắt công khai. Hãy xin ý kiến chuyên môn trước khi thu thập dữ liệu ở quy mô thương mại.

