<!-- Trích từ Master Blueprint v1.0 · 23/10/2026 -->
<!-- Nguồn gốc: archive/master-blueprint-v1.0.md -->

## 4. Quy tắc nghiệp vụ (Business Rules)

### 4.1 Tài khoản

- Đăng ký/đăng nhập bằng email + mật khẩu và Google OAuth (Supabase Auth). Đăng nhập thành công → `/` ngay (PD-04). Lỗi xác thực dùng thông báo chung "Email hoặc mật khẩu không đúng" (không tiết lộ email có tồn tại hay không).
- Hồ sơ tự tạo khi đăng ký (trigger). Vai trò mặc định `learner`; người dùng **không thể tự sửa `role`** (lỗi cần vá, PDF mục 14.1).
- Điểm mục tiêu hợp lệ 10–990; ngoài khoảng này báo lỗi tại ô nhập.

### 4.2 Phiên luyện tập

- Quy mô 5/10/20 câu; chọn một chủ điểm trong 16 chủ điểm hoặc ngẫu nhiên.
- Chỉ lấy câu `published` và loại câu người dùng **đã làm đúng trong 7 ngày gần nhất (7×24 giờ trượt, tính từ thời điểm hiện tại)**.
- Nếu còn ít hơn số câu chọn: tạo phiên với số câu còn lại và thông báo rõ. Còn 0: không tạo phiên (D-10).
- Mỗi câu được nộp tối đa một lần cho mỗi phiên; nộp lại không nhân đôi (`unique(session_id, question_id)`).
- Phản hồi gồm: đúng/sai, đáp án đúng, giải thích. Mất mạng: giữ nguyên lựa chọn và hiện nút \[Thử lại\].
- Người dùng chỉ lấy được đáp án của câu thuộc phiên của chính mình **sau khi nộp**.
- Thoát giữa chừng: các attempt đã nộp được giữ; phiên không có `finished_at`.

### 4.3 Giải thích thích ứng

- Bốn lớp: (1) tiêu đề phản hồi, (2) Quy tắc cốt lõi (`rule_vi`), (3) Vì sao đúng (`why_correct_vi`), (4) bảng loại trừ 3 phương án nhiễu (`why_wrong_vi`), kèm mẹo (`tip_vi`) và ví dụ (`example_en`) nếu có.
- Sai: mở toàn bộ; ghi `explanation_viewed`. Đúng: hiện nhãn Chính xác và Quy tắc cốt lõi, thu gọn phần còn lại; bấm mở thì ghi `explanation_expand_clicked`.
- Giải thích xuất hiện ngay dưới đáp án, không làm layout nhảy.
- Dữ liệu giải thích lỗi hoặc thiếu trường: dùng giá trị dự phòng, không làm hỏng trang.

### 4.4 Báo lỗi câu hỏi

- Lý do: `multiple_correct`, `none_correct`, `typo`, `unclear`, `other` (kèm ghi chú). Mỗi người chỉ báo một lý do một lần cho mỗi câu khi báo cáo còn mở.
- Đủ 3 báo cáo mở cùng lý do thì câu chuyển sang `needs_review` và ngừng xuất hiện với người học.
- Ghi chú của người dùng là dữ liệu, không bao giờ được đưa vào prompt hay thực thi.

### 4.5 Kết quả và Drill

- Kết quả chính thức: điểm X/Y, tổng thời gian, danh sách câu sai kèm giải thích; 10/10 thì ẩn Drill.
- Drill: chạy ở client trên mảng câu sai đã có; chấm cục bộ; băng rôn Indigo "Chế độ ôn lại tạm thời — Không lưu vào lịch sử và không đổi điểm thống kê"; kết quả Drill hiển thị tách biệt với kết quả phiên.
- Kiểm tra bắt buộc: sau Drill, bảng `attempts` và `mastery_pct` không đổi.

### 4.6 Từ vựng

- Lưu từ từ màn Phản hồi hoặc Kết quả: câu ngữ cảnh điền sẵn (chỉ đọc), Word Chip từ `vocab_hints`, nghĩa tiếng Việt sửa tự do.
- Một người dùng chỉ có một mục cho mỗi `lemma` (chuẩn hóa chữ thường, bỏ khoảng trắng thừa); trùng thì báo nhẹ "Từ này đã có trong sổ".
- Lưu từ tự tạo thẻ ôn (đến hạn ngay). Xóa từ xóa luôn thẻ.
- `/vocab`: tìm kiếm, lọc, sửa nghĩa tại chỗ, xóa; trạng thái rỗng và không có kết quả.

### 4.6b Ôn tập ngắt quãng (FSRS)

- Lập lịch bằng FSRS qua thư viện ts-fsrs, chạy ở server; không tự viết công thức. Mỗi thẻ lưu trạng thái trí nhớ: độ ổn định (`stability`), độ khó (`difficulty`), trạng thái (mới, đang học, ôn tập, học lại), hạn ôn (`due`), lần ôn cuối, số lần ôn và số lần quên.
- Mặt trước: câu ngữ cảnh đục lỗ. Mặt sau: từ, nghĩa và 4 nút Lại / Khó / Tốt / Dễ ứng với Again / Hard / Good / Easy. Thời gian hẹn dưới mỗi nút lấy từ hàm xem trước (`repeat`) của thư viện, nên có thể là phút (bước học ngắn hạn) hoặc ngày; không tự tính.
- Mức nhớ mục tiêu mặc định 90% (`request_retention` = 0,9); người dùng không đổi được trong MVP. Khi kiểm thử đặt `enable_fuzz` là false để kết quả xác định.
- Mỗi lần chấm ghi một dòng vào `card_reviews` (trạng thái thẻ trước khi chấm, mức chấm, thời điểm) cùng giao dịch với cập nhật `review_cards`; lịch sử này là điều kiện để tối ưu tham số FSRS về sau.
- Thẻ mới tạo khi lưu từ ở trạng thái mới và đến hạn ngay. Thẻ đang ở bước học (đến hạn sau vài phút) được xếp lại ngay trong phiên (OQ-2, đã chốt): đặt cuối hàng đợi; khi hết thẻ khác thì hiện luôn, không bắt người dùng chờ; thời điểm chấm thực tế được đưa cho thư viện.
- Phím tắt: Space lật thẻ; 1–4 chấm. Hết thẻ: màn hình hoàn tất kèm lịch hẹn kế tiếp. Lỗi lưu: toast, không sang thẻ sau.
- Ngoài MVP: tối ưu tham số FSRS theo từng người (cần đủ lịch sử chấm thẻ).

### 4.7 Độ vững và thống kê

- `mastery_pct = 100 × wilson_lower(đúng, tổng)` theo từng người dùng và chủ điểm, z = 1,96.
- Nhãn: dưới 5 lượt → Chưa đủ dữ liệu (X/5); dưới 50 → Cần ôn; 50 đến dưới 75 → Khá; từ 75 → Vững.
- Dashboard: thẻ luyện tập đề xuất (chủ điểm yếu nhất đủ dữ liệu; người mới chưa có dữ liệu thì đề xuất chủ điểm phổ biến), thẻ nhắc ôn, Top 3 chủ điểm cần chú ý (mobile), chuỗi ngày.
- `/stats`: thẻ cảnh báo điểm yếu, biểu đồ 14 ngày (SVG, có bảng ẩn cho trình đọc màn hình), Nhóm 1 (đủ dữ liệu) và Nhóm 2 (chưa đủ dữ liệu), nút \[Luyện chủ điểm yếu nhất ngay\].

### 4.8 Hồ sơ

- Sửa tên hiển thị và điểm mục tiêu bất kỳ lúc nào; xuất dữ liệu cá nhân dạng JSON; đăng xuất; vùng nguy hiểm: xóa tài khoản (D-17).

### 4.9 Admin

- Hàng đợi `needs_review`: nội dung câu, đáp án, giải thích, báo cáo kiểm định (`validator_report`), lý do vào hàng đợi.
- Hành động: Duyệt (Y) → `published`; Loại (N) → `retired`; Sửa nhẹ (kiểm tra đúng một chỗ trống, đúng một đáp án) → ghi `review_log`. Phím J/K chuyển câu.
- Chỉ tài khoản `role = admin` mới thấy; bảo vệ thật bằng RLS, ẩn nút chỉ là phụ.

