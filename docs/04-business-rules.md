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

### 4.7 Độ vững và thống kê (Mô hình Adaptive Rolling Mastery - D-25)

- `mastery_pct`: Tính theo mô hình Adaptive Rolling Mastery (z = 1.0, cửa sổ trượt tối đa 20 lượt gần nhất, có cơ chế Fast-track cho học viên xuất sắc n >= 8 đúng >= 90%).
- Nhãn: dưới 5 lượt → "Đang khởi động" (X/5); dưới 50 → "Cần củng cố"; 50 đến dưới 75 → "Khá chắc"; từ 75 hoặc Fast-track → "Thành thạo".
- Dashboard: thẻ luyện tập đề xuất (chủ điểm yếu nhất đủ dữ liệu; người mới chưa có dữ liệu thì đề xuất chủ điểm phổ biến), thẻ nhắc ôn, Top 3 chủ điểm cần chú ý (mobile), chuỗi ngày.
- `/stats`: thẻ gợi ý chủ điểm cải thiện, biểu đồ 14 ngày (SVG, có bảng ẩn cho trình đọc màn hình), Nhóm 1 (đã có dữ liệu) và Nhóm 2 (đang khởi động), nút [Luyện ngay]. Xóa bỏ mọi thuật ngữ toán học ("Wilson") trên giao diện người dùng.

### 4.8 Hồ sơ

- Sửa tên hiển thị và điểm mục tiêu bất kỳ lúc nào; xuất dữ liệu cá nhân dạng JSON; đăng xuất; vùng nguy hiểm: xóa tài khoản (D-17).

### 4.9 Admin

- Hàng đợi `needs_review`: nội dung câu, đáp án, giải thích, báo cáo kiểm định (`validator_report`), lý do vào hàng đợi.
- Hành động: Duyệt (Y) → `published`; Loại (N) → `retired`; Sửa nhẹ (kiểm tra đúng một chỗ trống, đúng một đáp án) → ghi `review_log`. Phím J/K chuyển câu.
- Chỉ tài khoản `role = admin` mới thấy; bảo vệ thật bằng RLS, ẩn nút chỉ là phụ.

### 4.10 Luyện đọc hiểu đoạn văn (Part 6 & Part 7 Passage Practice - D-26)

- Phân loại đoạn văn: `cloze` (Part 6 - điền từ vào đoạn văn 16 câu), `single` (Part 7 - đoạn đơn), `multi` (Part 7 - đoạn kép/ba). Mỗi bài đọc liên kết 1-n với các câu hỏi (`questions.passage_id`).
- Chấm điểm & Nộp bài an toàn: Gọi RPC `submit_passage_answers`.
  1. Payload gửi lên: mảng các câu đã chọn `[{question_id, selected_index}]`.
  2. Bất biến bảo mật: Server chỉ kiểm tra, chấm điểm, lưu `attempts` và trả về đáp án đúng/giải thích cho các câu ĐÃ CHỌN hợp lệ (`selected_index >= 0`).
  3. Tuyệt đối không trả về đáp án của câu chưa làm, không tính câu chưa làm là câu sai, ngăn chặn triệt để hành vi quét đáp án (oracle leak).
  4. Giao dịch nguyên tử: Mọi lượt làm trong cùng một lần nộp được ghi nhất quán trong một transaction PostgreSQL.

### 4.11 Thi thử Đọc hiểu ETS (Reading Exam Simulator - D-27)

- Cấu trúc đề chuẩn: 100 câu Đọc hiểu (Part 5: 30 câu, Part 6: 16 câu, Part 7: 54 câu).
- Bộ đếm thời gian nghiêm ngặt 75 phút:
  - Khác với Luyện tập Part 5 hàng ngày (luôn tuân thủ PD-06: không bấm giờ), chế độ Thi thử Exam Simulator bắt buộc đếm ngược 75 phút mô phỏng áp lực phòng thi thật.
  - Hết 75 phút: Tự động khóa thao tác và nộp bài với các câu đã chọn.
- Điều hướng & Trạng thái làm bài (Question Palette):
  - Hiển thị ma trận 100 nút câu hỏi (101 - 200).
  - Phân loại trực quan: Đã làm (xanh dương nhạt), Chưa làm (trắng viền xám), Đánh dấu cờ xem lại (chấm vàng cam).
  - Phím tắt bàn phím: A/B/C/D chọn đáp án nhanh, F gắn cờ, Mũi tên trái/phải chuyển câu.
- Thang điểm tham chiếu ETS (Estimated Reference Scoring):
  - Chuyển đổi số câu đúng (0 - 100) sang dải điểm 5 - 495 theo Bảng ánh xạ tham chiếu chuẩn hóa từ dữ liệu ETS công khai.
  - Khuyến cáo bắt buộc hiển thị trên UI: Điểm số chỉ mang tính chất tham khảo, không đại diện cho chứng chỉ ETS TOEIC chính thức.

### 4.12 Sổ từ vựng mở rộng & Bộ thẻ mẫu (Curated Decks & Custom Notebooks - D-28, D-29)

- Bộ thẻ định sẵn (Curated Decks): Cung cấp các gói từ vựng chất lượng cao nạp sẵn:
  - Barron's 600 Essential Words for the TOEIC (50 chủ đề kinh thương).
  - Từ vựng Công nghệ Thông tin (IT TOEIC) & Idioms văn phòng.
  - Hỗ trợ phát âm song song Danh từ / Động từ (`nounAudioUrl`, `verbAudioUrl`) cho các từ đổi trọng âm theo từ loại (ví dụ: *record*, *present*).
  - Nạp 1 chạm: Người học có thể nạp toàn bộ một danh mục vào sổ từ cá nhân chỉ bằng một click, tự động khởi tạo thẻ FSRS ở trạng thái mới.
- Sổ tay tùy chỉnh (Custom Notebooks): Cho phép tạo nhiều sổ tay phân loại theo mục đích cá nhân (ví dụ: "Từ vựng dễ nhầm", "Từ vựng Hợp đồng"), liên kết khóa ngoại với `vocab_entries`.

### 4.13 Bộ đệm từ điển toàn cục (Global Dictionary Cache - D-30)

- Tra cứu API: Tích hợp Free Dictionary API để tra nhanh nghĩa, phiên âm IPA, từ loại và phát âm audio.
- Bộ đệm Server-Side: Mọi kết quả tra cứu được lưu đệm trong bảng `dictionary_cache`. Khi người dùng khác tra cùng từ, hệ thống đọc trực tiếp từ cache DB, giảm 90% latency và triệt tiêu giới hạn rate limit của API bên thứ ba.
- Bảo vệ dữ liệu & Audio: Chỉ ghi cache thông qua SSR / Server Actions đáng tin cậy (service_role), cấm client sửa tùy ý. URL âm thanh bắt buộc qua hàm kiểm tra whitelist domain CDN được phê duyệt.

### 4.14 Bài học lý thuyết ngữ pháp 16 chủ điểm (`/learn` - D-31)

- Cung cấp 16 mô-đun bài học ngữ pháp sư phạm chuyên sâu tại `/learn` và `/learn/[tagCode]`.
- Cấu trúc bài học: Khái niệm & Bản chất -> Dấu hiệu nhận biết trong đề thi -> Các bẫy đề thi thường gặp -> Ví dụ mẫu song ngữ.
- Tích hợp liên hoàn: Từ bài học ngữ pháp có nút bấm chuyển thẳng sang Luyện tập Part 5 của chính chủ điểm đó (`/practice/new?tagId=...`).

