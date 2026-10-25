<!-- Trích từ Master Blueprint v1.0 · 23/10/2026 -->
<!-- Nguồn gốc: archive/master-blueprint-v1.0.md -->

### 5.6 Đặc tả 10 màn hình

**M1. Đăng nhập / Đăng ký — `/login`.** Mục tiêu: vào app nhanh nhất, không ép thiết lập hồ sơ.

- Cấu trúc: logo, tab Đăng nhập / Đăng ký (phân biệt rõ), form email + mật khẩu, CTA chính \[Đăng nhập\] hoặc \[Đăng ký\], \[Tiếp tục với Google\] (Secondary), \[Quên mật khẩu?\] (Ghost), dòng pháp lý ETS.
- Quên mật khẩu: form gửi liên kết; thông báo trung lập "Nếu email tồn tại, bạn sẽ nhận được liên kết".
- Trạng thái: loading (nút loading), lỗi xác thực (thông báo chung), lỗi từng trường (email sai định dạng, mật khẩu quá ngắn), đăng ký thành công (hướng dẫn tiếp theo, vào `/` nếu không bật xác thực email), Google bị hủy.
- Responsive: mobile 1 cột 100%; desktop thẻ giữa max-w-md.

**M2. Dashboard — `/`.** Mục tiêu: đẩy vào phiên học ngay.

- Cấu trúc: header + chuỗi ngày; thẻ "Luyện Part 5 đề xuất" (chủ điểm, nhãn, CTA chính \[Bắt đầu luyện 10 câu ngay\], liên kết "Chọn chủ điểm hoặc số câu khác"); thẻ nhắc ôn từ vựng \[Ôn X thẻ ngay\]; Top 3 chủ điểm cần chú ý.
- Mobile (PD-08): chỉ Top 3 + liên kết "Xem tất cả >" sang `/stats`. Desktop: 2 cột, trái 5/12 (thẻ luyện, thẻ ôn, biểu đồ 14 ngày), phải 7/12 (bảng 16 chủ điểm).
- Trạng thái: người mới 0 lượt (gợi ý chủ điểm phổ biến "Dạng từ", chưa cảnh báo yếu); Low-data (<5): \[?\] Chưa đủ dữ liệu (X/5), thanh xám; 0 thẻ đến hạn (thẻ ôn đổi thành thông báo không cần ôn); skeleton; lỗi tải có \[Thử lại\].

**M3. Chọn chủ điểm — `/practice/new`.** Mục tiêu: cấu hình phiên.

- Cấu trúc: tiêu đề, Segmented Pill 5/10/20, lựa chọn "Tất cả chủ điểm (ngẫu nhiên)" + danh sách 16 chủ điểm (nhãn độ vững, số câu còn), CTA chính \[Bắt đầu phiên luyện\]. **Không có công tắc bấm giờ.**
- Trạng thái (D-10): đủ câu; ít hơn số chọn (nhắc "Chỉ còn 4 câu mới" và tạo phiên 4 câu); hết câu (vô hiệu hóa hàng và giải thích lý do). Layout max-w-2xl.

**M4. Làm bài và phản hồi — `/practice/[sessionId]`.** Mục tiêu: làm bài tập trung, học từ lỗi sai.

- Cấu trúc: Focused Header 52px (\[X Thoát\], "Câu 3/10", thanh tiến độ, ẩn Navigation); chủ điểm; stem; 4 Answer Option Row; Sticky Action Bar 72px chứa nút chính \[Nộp đáp án\] rồi \[Tiếp tục\] (câu cuối: \[Xem kết quả\]); sau khi nộp: Adaptive Explanation, nút phụ \[+ Lưu từ vựng\] và \[! Báo lỗi\].
- Báo lỗi: Sheet với 5 lý do (radio) + ghi chú tùy chọn + \[Gửi\]; thành công: toast cảm ơn; trùng báo cáo đang mở: thông báo nhẹ.
- Trạng thái: chưa chọn (nút nộp khóa), đã chọn, đang chấm, lỗi mạng (giữ lựa chọn, \[Thử lại\]), phản hồi sai (mở đủ), phản hồi đúng (thu gọn), câu bị rút khỏi ngân hàng giữa phiên (bỏ qua, ghi nhận).
- Desktop: sau khi nộp chia 2 cột (câu hỏi trái, giải thích phải), không cần cuộn; khung câu hỏi max-w-xl. Tablet: khung giới hạn 640px.
- Thoát: về `/`; các câu đã nộp được giữ. Có hộp thoại xác nhận khi thoát giữa phiên với \[Ở lại\] (Primary) và \[Thoát\], kèm câu Các câu đã nộp được giữ lại \[ĐÃ CHỐT\].

**M5. Kết quả và Drill — `/practice/[sessionId]/result`.** Mục tiêu: tổng kết phiên chính thức và ôn lại câu sai.

- Cấu trúc: Score Card (X/Y mono, tổng thời gian), ô Drill (nền Indigo) với CTA chính \[Luyện lại X câu sai ngay\], danh sách Accordion câu sai (mở xem giải thích, \[+ Lưu từ\]), nút \[Về Dashboard\] và \[Luyện thêm\]. 10/10: ẩn Drill, CTA chính là \[Luyện thêm\].
- Drill Mode: băng rôn Indigo "Chế độ ôn lại tạm thời — Không lưu vào lịch sử và không đổi điểm thống kê"; chấm cục bộ; tổng kết riêng (đúng a/b), nút \[Luyện lại lần nữa\] và \[Về kết quả phiên\]. Layout max-w-2xl.

**M6. Sổ từ vựng — `/vocab`.** Mục tiêu: tìm lại và dùng từ đã học; không trình bày mỗi từ như một thẻ quá lớn.

- Cấu trúc: banner ôn tập \[Ôn X thẻ đến hạn ngay\]; ô tìm kiếm + hai tab lọc Tất cả và Đến hạn (theo wireframe Phase 2 v5); danh sách dòng gọn: từ, nghĩa tiếng Việt, câu ngữ cảnh cắt 2 dòng, trạng thái thẻ; hành động \[Sửa nghĩa\] (sửa tại chỗ: Input + Lưu/Hủy), \[Xóa từ\] (có xác nhận).
- Trạng thái: có dữ liệu; rỗng 0 từ ("Lưu từ đầu tiên từ phần giải thích sau khi làm bài"); không có kết quả tìm kiếm; skeleton; lỗi lưu. Desktop: lưới 2 cột.

**M7. Ôn tập FSRS — `/review`.** Mục tiêu: nhớ chủ động, ngắt quãng.

- Cấu trúc: header tiến độ "Thẻ 3/12" (ẩn Navigation); mặt trước: câu ngữ cảnh đục lỗ \[ ? \] + \[Hiện đáp án\]; mặt sau: từ lớn, nghĩa, 4 nút Lại / Khó / Tốt / Dễ kèm thời gian hẹn.
- Trạng thái: phiên xong (số thẻ đã ôn, phân bố mức nhớ, lịch hẹn kế tiếp, \[Về Dashboard\]); không có thẻ đến hạn; lỗi lưu. Desktop max-w-lg.

**M8. Thống kê — `/stats`.** Mục tiêu: chẩn đoán điểm yếu, **không phải dashboard đầy biểu đồ**.

- Cấu trúc: thẻ cảnh báo điểm yếu nhất + CTA chính \[Luyện chủ điểm yếu nhất ngay\]; chú thích 4 nhãn bằng ngôn ngữ dễ hiểu; biểu đồ 14 ngày (SVG, `aria-hidden`, kèm bảng `sr-only`); Nhóm 1 (đủ dữ liệu, sắp theo độ vững tăng dần) và Nhóm 2 (<5 câu); mỗi hàng có \[Luyện >\].
- Trạng thái: người mới (0 câu, biểu đồ rỗng kèm lời mời làm phiên đầu); đủ dữ liệu; loading; lỗi. Desktop: lưới 2 cột.

**M9. Hồ sơ — `/profile`.** Mục tiêu: quản lý tài khoản, không lấn át trải nghiệm học.

- Nhóm hợp lý: *Thông tin* (tên hiển thị, điểm mục tiêu 10–990, email chỉ đọc, CTA chính \[Lưu thay đổi\]); *Dữ liệu* (\[Xuất dữ liệu JSON\]); *Phiên* (\[Đăng xuất\]); *Vùng nguy hiểm* (\[Xóa tài khoản\] — Destructive, có viền riêng).
- Xóa tài khoản (D-17): Dialog nêu rõ điều sẽ mất, ô nhập "XOA", nút xóa bật khi gõ đúng; thành công → đăng xuất và về `/login` kèm thông báo; thất bại → thông báo lỗi, dữ liệu nguyên vẹn.
- Trạng thái: lưu thành công (toast), lỗi điểm ngoài 10–990, đang xuất dữ liệu, lỗi mạng. Layout max-w-lg căn giữa.

**M10. Admin — `/admin/review`.** Mục tiêu: duyệt nhanh, quét nhiều bản ghi, tránh thao tác nhầm.

- Cấu trúc: chia đôi. Trái: stem, 4 phương án (đáp án đúng đánh dấu), giải thích. Phải: báo cáo kiểm định (S3–S6, mono), lý do vào hàng đợi (ví dụ "3 báo cáo: nhiều đáp án đúng"), nút \[Y Duyệt\], \[N Loại\], \[Sửa nhẹ\]; số câu còn trong hàng đợi.
- Phím J/K chuyển câu, Y duyệt, N loại; **phím tắt không hoạt động khi con trỏ ở ô nhập**; mỗi quyết định ghi `review_log`.
- Edit Mode: sửa câu có kiểm tra đúng một chỗ trống và đúng 4 phương án.
- Trạng thái: hàng đợi trống, đang tải, lỗi phân quyền (báo không được phép).
- Mobile: các khối xếp dọc (nội dung, rồi báo cáo), nút Duyệt/Loại ghim dưới đáy để vẫn thao tác được.
- Không bổ sung công cụ quản trị ngoài phạm vi MVP.

