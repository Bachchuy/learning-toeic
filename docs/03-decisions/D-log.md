<!-- Trích từ Master Blueprint v1.0 · 23/10/2026 -->
<!-- Nguồn gốc: archive/master-blueprint-v1.0.md -->

### 3.2 Mâu thuẫn đã giải quyết và quyết định bổ sung

Những mục này phát sinh khi đối chiếu 12 tài liệu với nhau và với PDF. Mỗi mục có phương án mặc định.

| ID | Vấn đề | Quyết định thống nhất | Trạng thái |
| --- | --- | --- | --- |
| D-01 | Hai bản Handoff khác nhau | Mục 5 của tài liệu này thay thế cả hai; lấy bản v3 làm nền, bổ sung token `status.insufficient` và `/admin/batches` (hoãn) từ bản Official | \[ĐÃ CHỐT\] |
| D-02 | "9 màn hình" nhưng bảng có 10 dòng | Chốt **10 màn hình MVP**: Login, Dashboard, Chọn chủ điểm, Làm bài (+ phản hồi và giải thích), Kết quả, Sổ từ vựng, Ôn FSRS, Thống kê, Hồ sơ, Admin review | \[ĐÃ CHỐT\] |
| D-03 | UI ghi thời gian hẹn Lại 10 phút / Khó 1 ngày / Tốt 6 ngày / Dễ 15 ngày, trái với PDF (đơn vị ngày; Lại cho 1 ngày; Khó/Tốt/Dễ cùng 1 ngày ở lần ôn đầu, cùng 6 ngày ở lần hai) | Thay bởi D-22. Thời gian hẹn trên nút lấy từ hàm xem trước của thư viện FSRS (có thể tính bằng phút hoặc ngày); mục SM-2 trong PDF (4.5) không còn áp dụng; các số trong mockup chỉ là ví dụ. | \[THAY THẾ bởi D-22\] |
| D-04 | Số liệu mockup độ vững lệch Wilson | Mọi test và dữ liệu mẫu lấy từ công thức Wilson (z = 1,96): `wilson_lower(2,2)` ≈ 0,342; `wilson_lower(8,10)` ≈ 0,490; 6/10 ≈ 31,3%; 18/20 ≈ 69,9% (nhãn Khá, không phải Vững) | \[ĐÃ CHỐT\] |
| D-05 | Breakpoint không thống nhất (desktop 1440 hay ≥1024) | Mobile 360–767; Tablet 768–1023; Desktop từ 1024 (chuẩn thiết kế 1280; kiểm tra thêm 1440). 2 cột từ 1024 | \[THỐNG NHẤT\] |
| D-06 | Chiều cao nút chấm thẻ: 56px (Design System) hay 60px (Handoff) | **60px** (vùng chạm lớn, 4 cột trên mobile) | \[THỐNG NHẤT\] |
| D-07 | Màu ngoài token: `#F43F5E` (viền lỗi), `#CBD5E1` (viền nút/ô nhập), `#DBEAFE` (biểu đồ) | Viền lỗi dùng `status.error.text` (#BE123C). Thêm token `border.input` = #8190A6 (3,24:1 trên nền trắng, 3,10:1 trên #F8FAFC; đạt yêu cầu 3:1 cho ranh giới ô nhập). #CBD5E1 trong Handoff gốc chỉ đạt 1,48:1 nên bị bỏ. Cột biểu đồ dùng `primary` với độ trong suốt thay vì thêm màu mới. | \[ĐÃ CHỐT\] |
| D-08 | Danh sách sự kiện của PDF khác PD-02 | Bảng `events` cho phép: `explanation_viewed`, `explanation_expand_clicked`, `report_opened`, `vocab_saved`, `review_started` (thay `explanation_opened`) | \[THỐNG NHẤT\] |
| D-09 | Schema giải thích chưa có `vocab_hints` | Thêm trường tùy chọn `vocab_hints` vào JSON giải thích; Zod phải chịu được dữ liệu thiếu trường (UI ẩn Word Chip, vẫn cho nhập tay) | \[THỐNG NHẤT\] |
| D-10 | Cảnh báo "Chỉ còn N câu mới" có trong Brief nhưng thiếu ở Handoff | **Bắt buộc** ở `/practice/new`: còn ít hơn quy mô chọn thì nhắc rõ và tạo phiên ngắn hơn; còn 0 câu thì báo "Bạn đã làm đúng hết câu của chủ điểm này trong 7 ngày qua" và vô hiệu hóa | \[ĐÃ CHỐT\] |
| D-11 | Nguồn câu hỏi MVP | Nạp từ file JSONL bằng script, theo lô 16 câu (mỗi chủ điểm một câu); mục tiêu khoảng 100 câu cho bản demo, bắt đầu M4 với 30 câu. LLM chỉ dùng **ngoài ứng dụng** để soạn nháp; bạn duyệt tay theo checklist (đúng một đáp án, một chỗ trống, giải thích đúng, không dùng đề thật) và nhờ người có TOEIC cao duyệt mẫu khoảng 20%. Ứng dụng lúc chạy không gọi LLM. | \[ĐÃ CHỐT\] |
| D-12 | PDF dùng monorepo pnpm và dịch vụ Python | Một ứng dụng Next.js duy nhất; logic thuần ở `src/core`; bỏ `services/pipeline` khỏi MVP | \[THỐNG NHẤT\] |
| D-13 | `/admin/batches` và US-E2 | Hoãn đến khi có pipeline sinh đề; MVP chỉ có `/admin/review` | \[ĐÃ CHỐT\] |
| D-14 | Ghi dữ liệu từ client | Mọi thao tác ghi đi qua Server Actions (Zod ở server); browser client của Supabase chỉ dùng cho đăng nhập | \[THỐNG NHẤT\] |
| D-15 | Cách đếm mastery | Đếm mọi `attempts` của người dùng theo chủ điểm (theo `v_skill_mastery` của PDF), dùng `tag_id` chụp sẵn trong attempts | \[THỐNG NHẤT\] |
| D-16 | Múi giờ | Mọi thời điểm lưu UTC; chuỗi ngày, biểu đồ 14 ngày (theo ngày lịch) và hạn ôn hiển thị theo Asia/Ho\_Chi\_Minh; loại câu đã làm đúng tính theo 7×24 giờ trượt | \[ĐÃ CHỐT\] |
| D-17 | Xóa tài khoản | Dialog: nêu rõ dữ liệu bị xóa, người dùng gõ đúng "XOA" mới bật nút Destructive; thực thi bằng service role ở server; thất bại hiện thông báo, không đăng xuất | \[THỐNG NHẤT\] |
| D-18 | Thanh độ vững: thanh liên tục 8px (v3) hay 10 đốt (Official, wireframe) | Thanh liên tục cao 8px với `role=progressbar` và giá trị số bằng chữ mono | \[THỐNG NHẤT\] |
| D-19 | "Chuỗi ngày" chưa được định nghĩa | Một ngày được tính khi có ít nhất 1 câu luyện (attempt) hoặc ít nhất 1 thẻ ôn (card\_reviews), theo múi giờ ở D-16 | \[ĐÃ CHỐT\] |
| D-20 | Tên hàm tạo phiên | RPC `create_session` (theo PDF); wireframe gọi `startSession` chỉ là tên hành động ở UI | \[THỐNG NHẤT\] |
| D-21 | Báo cáo QA 4.3: AC-08 (responsive thực tế ở 768 và 1440) chưa kiểm | Kiểm tay ở 360, 390, 768, 1280, 1440 sau mỗi màn hình hoàn thành; ghi kết quả vào `docs/qa/` | \[THỐNG NHẤT\] |
| D-22 | Lập lịch ôn tập: SM-2 (PDF, ADR-007) hay FSRS | Dùng FSRS thay SM-2 (quyết định của Product Owner, 23/10/2026). Đảo ADR-007 và bỏ FSRS khỏi danh sách ngoài phạm vi. Bốn nút Lại / Khó / Tốt / Dễ ứng với Again / Hard / Good / Easy; mockup Lại hẹn 10 phút hợp lệ nhờ bước học ngắn hạn của FSRS. | \[ĐÃ CHỐT\] |
| D-23 | Cần lịch sử ôn để dùng FSRS về sau | Thêm bảng card\_reviews (một dòng mỗi lần chấm: thẻ, mức chấm, thời điểm, trạng thái thẻ trước khi chấm), ghi cùng giao dịch với cập nhật review\_cards. Bảng thuộc dữ liệu người dùng (xuất và xóa cùng tài khoản). Không trùng với review\_log (nhật ký quyết định của admin). | \[THỐNG NHẤT\] |
| D-24 | Thư viện và cấu hình FSRS | Dùng ts-fsrs (TypeScript, mã nguồn mở, cần Node.js 20 trở lên), chạy ở server. Khóa phiên bản chính xác, ghi vào ADR, kiểm tra giấy phép và phiên bản FSRS hiện hành khi cài. Mức nhớ mục tiêu mặc định 0,9; tắt enable\_fuzz khi kiểm thử; bước học ngắn hạn theo cấu hình của thư viện; tham số lưu ngoài mã nguồn phải được Zod kiểm tra. Chưa tối ưu tham số theo từng người trong MVP. | \[THỐNG NHẤT\] |

