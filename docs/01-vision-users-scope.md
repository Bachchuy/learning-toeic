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

### 1.3 Bảng phân loại tính năng & Tiến hóa phạm vi (Feature Scope Status)

Dự án ban đầu được thiết kế theo MVP v1.0 tinh gọn (tập trung Part 5). Sau các đợt mở rộng có kiểm soát và kiểm toán kiến trúc, phạm vi thực tế của codebase hiện tại được phân loại minh bạch như sau:

| Tính năng / Hạng mục | Trạng thái kỹ thuật | Quyết định liên quan | Ghi chú & Triển khai thực tế |
| --- | --- | --- | --- |
| **Luyện Part 5 theo chủ điểm** | Implemented | M4, M6 | 16 chủ điểm, loại trừ câu đúng trong 7 ngày trượt, phản hồi tức thì |
| **Giải thích thích ứng 4 lớp** | Implemented | M5, PD-02 | Lưu sẵn trong DB, không gọi LLM lúc làm bài, Zod validate |
| **Client-side Drill (ôn lại tạm thời)** | Implemented | PD-03, PD-07 | Chấm cục bộ client, tuyệt đối không ghi DB, không đổi mastery |
| **Sổ từ vựng & Ôn tập ngắt quãng FSRS** | Implemented | M7, M8, D-22, D-32 | 	s-fsrs ở server, ghi thẻ và lịch sử qua RPC nguyên tử 
ecord_card_review_atomic |
| **Dashboard & Thống kê ARM** | Implemented | M9, D-25 | Adaptive Rolling Mastery (z=1.0, cửa sổ 20, Fast-track n>=8 & >=90%) |
| **Luyện Đọc hiểu đoạn văn Part 6 & 7** | Implemented | D-26 | Đề bài đục lỗ (Part 6) & đơn/đa văn bản (Part 7), chấm qua RPC an toàn |
| **Thi thử ETS Reading (Exam Simulator)** | Implemented | D-27 | 100 câu Part 5-7, bấm giờ 75 phút (chuẩn ETS), quy đổi điểm tham chiếu 5-495 |
| **Bộ thẻ từ vựng mẫu (Curated Decks)** | Implemented | D-28 | 600 từ Barron's, IT, Idioms; phát âm kép Noun/Verb; nạp 1 chạm |
| **Sổ tay từ vựng tùy chỉnh (Custom Notebooks)** | Implemented | D-29 | Bảng 
otebooks, gom nhóm thẻ từ vựng linh hoạt theo người dùng |
| **Tra từ điển & Bộ đệm (Dictionary Cache)** | Implemented | D-30 | Free Dictionary API, lưu đệm dictionary_cache, chặn ô nhiễm RLS |
| **Bài học ngữ pháp 16 chủ điểm (/learn)** | Implemented | D-31 | Lý thuyết sư phạm chuẩn cho 16 chủ điểm Part 5 |
| **Báo lỗi câu hỏi & Admin duyệt đề** | Implemented | M5, M11 | 3 báo cáo cùng lý do tự rút về 
eeds_review; admin duyệt Y/N/sửa |
| **Hồ sơ cá nhân & Quyền riêng tư** | Implemented | M10, PD-04 | Đổi tên, mục tiêu 10-990, xuất JSON, xóa tài khoản xác thực 2 lớp |
| **Thi thử Listening (Nghe hiểu Part 1-4)** | Partially implemented | — | Bảng quy đổi điểm ETS và cấu trúc dữ liệu đã sẵn sàng; đang chuẩn bị pipeline audio |
| **Hàng đợi kiểm thử E2E Playwright trên CI** | Implemented but unverified | M12 | File kịch bản E2E đã có trong e2e/; cần môi trường staging để chạy tự động |
| **Pipeline sinh đề AI trong app (/admin/batches)** | Planned | D-11, D-13 | Hoãn sau khi có số liệu vận hành thực tế; hiện sinh đề ngoài app |
| **Ứng dụng di động Native (React Native/Flutter)** | Planned | — | Web mobile-first PWA đạt chuẩn 360px đáp ứng đủ nhu cầu hiện tại |
| **Thanh toán & Gói hội viên (Monetization)** | Planned | — | Xem xét sau khi đạt mốc 1.000 người dùng tích cực |
| **Thuật toán SM-2 cũ** | Deprecated | D-22 | Đã thay thế hoàn toàn bằng mô hình trí nhớ FSRS hiện đại |
| **Thuật toán Wilson Lifetime z=1.96** | Deprecated | D-25 | Đã thay thế bằng Adaptive Rolling Mastery (ARM) phản ánh đúng tiến bộ |
| **Chế độ bấm giờ trong Luyện tập Part 5 hàng ngày** | Removed | PD-06 | Nghiêm cấm bấm giờ ở Daily Practice & Drill (chỉ có ở Exam Simulator) |

### 1.4 User story mở rộng

| ID | Nội dung | Ưu tiên | Triển khai ở | Trạng thái |
| --- | --- | --- | --- | --- |
| US-F1 | Đăng ký, đăng nhập bằng email hoặc Google | MUST | /login (M3) | Implemented |
| US-A1 | Làm một phiên 10 câu Part 5 theo chủ điểm | MUST | /practice/new, /practice/[id] (M4, M6) | Implemented |
| US-A2 | Xem đáp án đúng ngay sau mỗi câu | MUST | M4 | Implemented |
| US-B1 | Đọc giải thích vì sao đúng, vì sao các đáp án khác sai | MUST | M5 | Implemented |
| US-C1 | Lưu một từ cùng câu chứa nó vào sổ từ vựng | MUST | M7 | Implemented |
| US-C2 | Được nhắc ôn từ đúng thời điểm (ngắt quãng) | SHOULD | /review (M8) | Implemented |
| US-D1 | Xem tỉ lệ đúng theo từng chủ điểm (ARM) | SHOULD | /, /stats (M9) | Implemented |
| US-F2 | Báo lỗi một câu hỏi có vẻ sai | MUST | M5 | Implemented |
| US-E1 | Admin duyệt mẫu câu hỏi trước khi xuất bản | MUST | /admin/review (M11) | Implemented |
| US-P6 | Luyện đọc hiểu đoạn văn Part 6 & 7 | SHOULD | /reading/[id] (D-26) | Implemented |
| US-EX1 | Thi thử Full Reading 100 câu có bấm giờ 75 phút | SHOULD | /exam, /exam/[slug] (D-27) | Implemented |
| US-CD1 | Khám phá & nạp nhanh bộ từ vựng 600 từ Barron's | SHOULD | /vocab (Curated, D-28) | Implemented |
| US-NB1 | Tạo sổ tay từ vựng tùy chỉnh cá nhân | SHOULD | /vocab (Notebooks, D-29) | Implemented |
| US-DC1 | Tra nhanh từ điển tiếng Anh với phát âm chuẩn | COULD | Tra từ điển (D-30) | Implemented |
| US-LR1 | Học lý thuyết bài bản 16 chủ điểm ngữ pháp | SHOULD | /learn, /learn/[tagCode] (D-31) | Implemented |
| US-E2 | Admin xem chi phí và tỉ lệ đạt của lô sinh đề | SHOULD | **Hoãn** cùng pipeline AI (D-13) | Planned |
| US-A3 | Chế độ bấm giờ trong luyện tập Part 5 hàng ngày | COULD | Daily Practice | Removed (PD-06) |

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

