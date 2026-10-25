# TOEIC AI — Bản thiết kế tổng thể và phương châm triển khai

*Master Blueprint v1.0 · cập nhật 23/10/2026 · ngôn ngữ: tiếng Việt*

Tài liệu này hợp nhất 12 tài liệu dự án (UX Brief + Product Decision Log, Wireframe v5, Visual Directions, Design System VD2, HiFi bước 3 và 4, ba báo cáo QA, hai bản Design Handoff Stage 5, Hướng dẫn phát triển kỹ thuật dạng PDF) và kế hoạch triển khai Stage 6 thành **một bản duy nhất**. Khi code, bạn chỉ cần mở tài liệu này; các tài liệu gốc chỉ dùng để tra cứu sâu.

## 0. Cách dùng tài liệu

### 0.1 Thứ bậc nguồn sự thật

Khi hai nguồn nói khác nhau, nguồn xếp trên thắng:

1. **Product Decision Log** (PD-01 đến PD-09): quyết định của Product Owner (chính bạn).
2. **Tài liệu này**: đã giải quyết các mâu thuẫn giữa các tài liệu gốc (xem mục 3.2).
3. **Design Tokens và Component** ở mục 5 (gộp từ Design System VD2 và Handoff).
4. **PDF kỹ thuật**: nguồn chi tiết cho schema SQL, hàm RPC, prompt pipeline (khi cần tra sâu).
5. **Wireframe và mockup**: chỉ minh họa bố cục. **Mọi con số trong mockup (41%, 58%, 82%, 10 phút, 15 ngày…) chỉ là ví dụ, không phải dữ liệu thật hay quy tắc.**

### 0.2 Nhãn trạng thái

- **\[ĐÃ CHỐT\]**: quyết định có trong Product Decision Log hoặc được mọi nguồn thống nhất.
- **\[THỐNG NHẤT\]**: các nguồn mâu thuẫn hoặc còn thiếu; tài liệu này chọn một phương án mặc định để bạn có thể bắt đầu. Bạn được quyền đổi, nhưng phải sửa ở đây trước khi sửa code.
- **\[CẦN XÁC NHẬN\]**: phụ thuộc vào thông tin bạn chưa cung cấp (xem mục 11).

### 0.3 Quy tắc khi gặp mâu thuẫn hoặc điều chưa rõ

Không tự đoán trong lúc code. Dừng lại, ghi vào mục 11 (câu hỏi mở), chọn phương án mặc định rẻ nhất để đảo ngược, và tiếp tục.

### 0.4 Số phận của các tài liệu gốc

| Tài liệu gốc | Vai trò sau khi hợp nhất |
| --- | --- |
| Product UX Brief MVP v3 | Nguồn gốc của PD-01 đến PD-06 và ma trận trạng thái UI; nội dung đã gộp vào mục 3 và 4 |
| Wireframe Phase 2 v5 | Tham chiếu luồng người dùng; bố cục thực tế theo mục 5 |
| Visual Directions v2, Design System VD2 | Lưu trữ; token và component đã gộp vào mục 5 |
| HiFi bước 3 và 4 | Tham chiếu hình ảnh (mockup minh họa) |
| Báo cáo QA (Phase 4, 4.2, 4.3) | Lịch sử; các lỗi còn tồn đọng nằm ở mục 3.2 và 11 |
| Hai bản Handoff Stage 5 | **Được thay thế bởi mục 5** (đã gộp và sửa mâu thuẫn) |
| PDF Hướng dẫn phát triển | Tham chiếu kỹ thuật sâu; các điều chỉnh so với PDF ghi ở mục 3.2 và 6 |

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

## 2. Phương châm (12 nguyên tắc dẫn đường)

1. **Hiểu vì sao sai, biết học gì tiếp.** Mọi tính năng phải phục vụ một trong hai việc này; nếu không, đừng làm.
2. **Học trước, tiện ích sau.** Đăng nhập xong vào thẳng Dashboard; `/profile` không bao giờ nổi bật hơn việc luyện tập (PD-04).
3. **Một hành động chính mỗi màn hình.** Chỉ một nút Primary cho hành vi cốt lõi.
4. **Đáp án không rời server trước khi người học nộp.** Client không bao giờ đọc được `correct_index` hay giải thích của câu chưa nộp.
5. **Lịch sử học chính thức chỉ do `attempts` tạo ra.** Drill không ghi DB, không đổi mastery (PD-03, PD-07).
6. **Số liệu trung thực.** Dùng cận dưới Wilson; không gán nhãn "Cần ôn" khi chưa đủ dữ liệu; mẫu nhỏ kéo điểm xuống, không thổi phồng (PD-05).
7. **Không dùng màu làm tín hiệu duy nhất.** Luôn kèm ký hiệu và chữ (✓ ✗ ! \~ ?).
8. **Đơn giản trước, mở rộng sau.** Modular monolith, một app, một lát cắt dọc chạy được sớm; không microservice, không thư viện "cho chắc".
9. **Mọi quyết định lớn có hồ sơ.** Ghi ADR ngắn; thay đổi phạm vi phải đi qua mục 3.
10. **Chưa có test và tài liệu thì chưa xong.** Đặc biệt phân quyền và RLS.
11. **Không giao cho AI thứ bạn không giải thích được.** Code bảo mật bạn phải tự đọc từng dòng.
12. **Không thêm tính năng ngoài MVP.** Ý tưởng mới ghi vào danh sách "sau v1.0", không chen vào milestone đang làm.

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

## 5. Đặc tả thiết kế giao diện (thay thế hai bản Handoff)

### 5.1 Hướng thị giác

**Visual Direction 2 — "Precision Swiss LearningGrid"**: lưới chính xác, thẻ phẳng dùng viền 1px thay vì bóng đổ, số liệu dùng chữ đơn cách (mono), màu chỉ dùng để truyền trạng thái (đúng, sai, khá, vững). Không gradient, không animation trang trí, không ảnh minh họa rời rạc. Mỗi trang ưu tiên đúng nhiệm vụ của nó (làm bài, ôn thẻ, đọc thống kê, duyệt đề).

### 5.2 Token màu

Cột "Tương phản đo lại" là giá trị tính thực tế theo công thức WCAG (các số được ghi trong Handoff gốc có vài chỗ lệch nhẹ, ví dụ #B45309 trên #FFFBEB chỉ đạt 4,84:1 chứ không phải 5,1:1; vẫn đạt AA 4,5:1).

| Token | HEX | Tương phản đo lại | Dùng cho |
| --- | --- | --- | --- |
| `color.primary.default` | #2563EB | 5,17:1 trên trắng; 4,94:1 trên #F8FAFC | Nút Primary, thanh tiến độ, viền phương án đang chọn, focus ring |
| `color.primary.hover` | #1D4ED8 | cao hơn primary | Hover/active nút Primary |
| `color.primary.subtle` | #EFF6FF | nền (chữ xanh trên nền này đạt 4,75:1) | Nền phương án đang chọn (trước khi nộp) |
| `color.secondary.default` | #0F172A | 17,85:1 trên trắng | Nút phụ quan trọng, huy hiệu chuỗi ngày, keycap kích hoạt |
| `color.bg.page` | #F8FAFC | nền | Nền trang |
| `color.bg.surface` | #FFFFFF | nền | Thẻ, modal, sheet, thẻ câu hỏi |
| `color.bg.muted` | #F1F5F9 | nền | Hộp Quy tắc, keycap mặc định, rãnh tiến độ, trạng thái chỉ đọc |
| `color.text.primary` | #0F172A | 17,85:1 | Tiêu đề, câu hỏi, phương án, văn bản chính |
| `color.text.secondary` | #475569 | 7,58:1 trên trắng; 6,92:1 trên #F1F5F9 | Phụ đề, nhãn overline, thời gian, số câu đúng thô |
| `color.border.default` | #E2E8F0 | 1,23:1 (trang trí, không dùng để nhận diện ô nhập) | Viền thẻ, đường kẻ bảng |
| `color.border.input` (**mới, D-07**) | #8190A6 | 3,24:1 trên trắng; 3,10:1 trên #F8FAFC | Viền ô nhập, nút Secondary. #CBD5E1 trong Handoff gốc chỉ 1,48:1 nên không đủ để nhận diện ranh giới ô nhập (WCAG 1.4.11 yêu cầu 3:1) |
| `status.success` | text #047857 · bg #ECFDF5 | 5,21:1 trên nền; chữ trắng trên #047857 5,48:1 | Đáp án đúng, nhãn \[✓\] Vững (nút Dễ) |
| `status.error` | text #BE123C · bg #FFF1F2 | 5,72:1 trên nền; chữ trắng trên #BE123C 6,29:1 | Đáp án sai, lỗi mạng, nhãn \[!\] Cần ôn, viền ô nhập lỗi (thay #F43F5E), nút Destructive, nút Lại |
| `status.warning` | text #B45309 · bg #FFFBEB | 4,84:1 trên nền; 5,02:1 trên trắng | Nhãn \[\~\] Khá, cảnh báo ít câu mới, nút Khó |
| `status.info` | text #4338CA · bg #EEF2FF | 7,07:1 trên nền | Băng rôn Chế độ ôn lại tạm thời (Drill) |
| `status.insufficient` | text #475569 · bg #F1F5F9 | 6,92:1 | Nhãn \[?\] Chưa đủ dữ liệu |

Quy tắc: **không tạo màu ngoài bảng này.** Cột biểu đồ 14 ngày dùng `primary` với độ trong suốt (không dùng #DBEAFE riêng). Khi cần màu mới: sửa bảng này trước.

### 5.3 Chữ

- Sans: 'Be Vietnam Pro', 'Inter', hệ thống; Mono: 'JetBrains Mono', 'Geist Mono' (bắt buộc cho số liệu, tiến độ, thời gian, `tabular-nums`). Nạp bằng `next/font`; không thêm font thứ ba; có font dự phòng.
- Heading 1: 24px (desktop) / 20px (mobile), Bold 700, dòng 1,3. Heading 2: 18/17px, SemiBold 600, dòng 1,35.
- Câu hỏi (stem): 20/18px, Medium 500, dòng 1,6. Giải thích: 16px, Regular 400, từ khóa SemiBold 600, dòng 1,6.
- Overline: 12px, Bold, IN HOA, cách chữ +0,06em. Số liệu: 13–14px mono, Medium.
- Input trên mobile từ 16px (tránh iOS tự phóng to).

### 5.4 Khoảng cách, bo góc, độ nổi

- Spacing cơ sở 4px: sp-1 4, sp-2 8, sp-3 12, sp-4 16, sp-5 20, sp-6 24, sp-8 32.
- Radius: sm 6, md 8, lg 10, sheet 16 (góc trên của Bottom Sheet).
- Thẻ mặc định **không đổ bóng** (viền 1px). Chỉ Bottom Sheet và Modal dùng shadow-xl.
- Chuyển động tối thiểu (mở sheet, mở accordion); tôn trọng `prefers-reduced-motion`.

### 5.5 Component

| Component | Biến thể và trạng thái | Thông số | Quy tắc |
| --- | --- | --- | --- |
| Navigation | Mobile Bottom Bar 4 tab (Luyện, Từ vựng, Thống kê, Tôi); Desktop Sidebar | Bar cao 56px; Sidebar rộng 240px | Ẩn hoàn toàn trong phiên tập trung (`/practice/[id]`, `/review`) |
| Button | Primary, Secondary, Ghost, Destructive; hover, focus (ring 2px), disabled (opacity 40%), loading | Cao 48px (CTA chính) / 44px (phụ); padding ngang 16; radius 8; chữ SemiBold 15–16px | **Mỗi màn hình chỉ một Primary.** Nút Destructive chỉ ở vùng nguy hiểm |
| Input, Search, Textarea | default, focus (viền #2563EB), lỗi (viền #BE123C + dòng chữ đỏ), chỉ đọc (nền #F1F5F9) | Cao 44px; radius 8; viền `border.input`; font ≥16px mobile | Bắt buộc có Label phía trên, không lạm dụng placeholder |
| Segmented Pill | 5 / 10 / 20 câu | Cao 44px | Dùng cho quy mô phiên |
| Answer Option Row | default, hover, selected (nền #EFF6FF + viền #2563EB), correct (nền #ECFDF5 + \[✓\]), incorrect (nền #FFF1F2 + \[✗\]), unselected sau khi nộp | Cao tối thiểu 52px; padding 12; radius 8; keycap 28×28, radius 6; khoảng cách 8 | Thành phần trung tâm của app. Ký hiệu A B C D khớp bàn phím; màu luôn kèm ký hiệu và chữ |
| Adaptive Explanation | Expanded (sai), Collapsed (đúng) có nút \[▼ Mở rộng\] | Padding 16; radius 10; Rule Box viền trái 4px #2563EB | Hiện ngay dưới đáp án, không làm layout nhảy; vùng `aria-live="polite"` |
| Word Chip và Sheet | Chip mặc định (#F1F5F9) / đã chọn (#2563EB); Sheet trượt từ dưới (mobile), Dialog (desktop) | Chip cao 36, radius 6; Sheet radius trên 16, padding 20 | Đóng bằng \[X\], nền ngoài hoặc Esc; focus bẩy trong Sheet |
| FSRS Flashcard | Mặt trước (cloze \[ ? \]), mặt sau, 4 nút | Thẻ cao tối thiểu 240px; padding 20; từ mặt sau Bold 22px; nút cao **60px** (D-06) | Thời gian hẹn hiển thị trong nút lấy từ hàm xem trước (`repeat`) của thư viện FSRS, có thể là phút hoặc ngày (D-03, D-22); Tốt và Dễ có thể hiện cùng thời gian (ví dụ cùng 1 ngày khi thẻ ra khỏi bước học) nên nhãn chữ luôn hiện kèm; mobile ép lưới 4 cột |
| Topic Mastery Row | Vững, Khá, Cần ôn, Chưa đủ dữ liệu (thanh xám, hiện X/5) | Hàng cao 60px; thanh 8px (D-18); badge cao 24px | Tách Nhóm 1 (đủ DL) và Nhóm 2 (<5 câu); mỗi dòng có nút \[Luyện >\] |
| Admin Review Item | Hàng câu hỏi, panel báo cáo kiểm định | Mật độ gọn, 14px; tag kiểm định mono 12px | Desktop ưu tiên: trái nội dung, phải báo cáo và nút |
| Toast, Alert, Dialog | thành công, lỗi, xác nhận | Toast không che nút hành động ghim | Lỗi mạng dùng Alert có nút Thử lại |
| Skeleton, Empty | khung xương khi tải, màn hình rỗng có hướng dẫn | — | Mỗi route có `loading`, `error`, trạng thái rỗng |

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

### 5.7 Tương tác quan trọng

| Tương tác | Kích hoạt | Điều kiện | Kết quả | Lỗi |
| --- | --- | --- | --- | --- |
| Đăng nhập | \[Đăng nhập\] | Email và mật khẩu hợp lệ | Xác thực → `/` | "Email hoặc mật khẩu không đúng" |
| Nộp câu | \[Nộp đáp án\] hoặc Enter | Đã chọn một phương án | RPC `submit_answer` → đúng/sai, đáp án, giải thích; màu + ký hiệu | Mất mạng: giữ lựa chọn, \[Thử lại\] |
| Lưu từ | \[+ Lưu từ vựng\] | Ở màn Phản hồi hoặc Kết quả | Mở Sheet, điền ngữ cảnh, chạm Word Chip để điền từ và nghĩa gợi ý | Trùng (23505): "Từ này đã có trong sổ" |
| Drill | \[Luyện lại X câu sai\] | Có ít nhất 1 câu sai | Drill tại client, không ghi `attempts` | Không có (chạy cục bộ) |
| Chấm FSRS | Nút Lại/Khó/Tốt/Dễ hoặc phím 1–4 | Đang ở mặt sau | Thư viện FSRS tính lịch từ trạng thái thẻ trong DB → cập nhật `review_cards` và ghi `card_reviews` trong một giao dịch → thẻ tiếp | Lỗi DB: toast, không sang thẻ sau |
| Admin duyệt | Y / N | Còn câu trong hàng đợi | `published` / `retired`, ghi `review_log`, sang câu kế | Lỗi RLS: báo không được phép |

### 5.8 Responsive

- **Mobile (360–767px)**: thiết kế mặc định, 1 cột; Bottom Nav 56px; Focused Header 52px; nút hành động (Nộp, Tiếp tục, Lật thẻ) ghim đáy trong Sticky Action Bar 72px; Bottom Sheet trượt lên; không tràn ngang, không chồng lấn.
- **Tablet (768–1023px)**: container tối đa 768px căn giữa; lưới 2 cột cho thẻ phụ; khung làm bài, flashcard, login, profile giới hạn 640px.
- **Desktop (từ 1024px, chuẩn 1280px; kiểm tra thêm 1440px)**: Sidebar trái 240px; Dashboard và `/stats` chia 2 cột (5/12 và 7/12); phiên học sau khi nộp chia 2 cột; Sheet đổi thành Dialog giữa màn hình.
- Bảng và danh sách dài chuyển thành dòng xếp dọc trên mobile; nội dung rộng cuộn trong khung riêng, không cuộn ngang cả trang.

### 5.9 Accessibility (WCAG 2.1 AA)

- **Tương phản**: chữ ≥ 4,5:1 (theo số đo lại ở 5.2); viền ô nhập và đối tượng giao diện ≥ 3:1.
- **Vùng chạm** ≥ 44×44px (CTA 48, Option Row 52, nút chấm thẻ 60), khoảng cách ≥ 8px.
- **Focus**: `outline: 2px solid #2563EB; outline-offset: 2px` cho mọi phần tử tương tác; Sheet và Dialog bẫy focus và trả focus khi đóng.
- **Không dùng màu làm tín hiệu duy nhất**: đúng/sai và độ vững có 3 lớp: ký hiệu \[✓\] \[✗\] \[!\] \[\~\] \[?\], huy hiệu chữ, màu viền/nền.
- **Trình đọc màn hình**: phản hồi `aria-live="polite"`; nhóm phương án `role="radiogroup"` và `role="radio"`; biểu đồ SVG `aria-hidden` kèm bảng `sr-only`; thanh độ vững `role="progressbar"` có giá trị.
- **Bàn phím**: Enter (Nộp/Tiếp tục), Space (lật thẻ), A–D hoặc 1–4 (chọn đáp án; ở `/review` 1–4 là chấm), J K Y N (admin). Phím một ký tự chỉ hoạt động ở các màn hình này và **không hoạt động khi con trỏ ở ô nhập** (WCAG 2.1.4); phím tắt chỉ hoạt động khi khu vực câu hỏi, thẻ hoặc hàng đợi admin đang có focus (tự focus khi vào màn hình), nên không cần công tắc tắt \[ĐÃ CHỐT\].
- Thu phóng đến 200% không mất nội dung; tôn trọng `prefers-reduced-motion`.
- Kiểm tra: axe mỗi màn hình mới + thử toàn bộ luồng chính bằng bàn phím.

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

## 6. Kiến trúc kỹ thuật

### 6.1 Tổng quan

**Modular monolith**: một ứng dụng Next.js (App Router, TypeScript strict) triển khai trên Vercel, dùng Supabase (Postgres, Auth, RLS, hàm RPC). Không microservice, không API server riêng, không gọi LLM khi người học làm bài.

- **Người học → Next.js**: trình duyệt gọi Server Components và Server Actions; middleware làm mới phiên đăng nhập.
- **Next.js → Supabase**: dùng phiên (JWT) của chính người dùng nên mọi truy vấn đi qua RLS; các thao tác nhạy cảm (nộp câu, tạo phiên, xem lại phiên) đi qua hàm RPC.
- **Khóa service role**: chỉ ở server, chỉ dùng cho xóa tài khoản và script nạp câu hỏi chạy trên máy bạn. Không bao giờ vào mã client.
- **Nội dung**: câu hỏi soạn ngoài ứng dụng (D-11), nạp bằng script từ JSONL vào `questions` và `question_answers`; admin duyệt qua `/admin/review`.

**Các luồng dữ liệu chính**

1. *Đăng nhập*: Supabase Auth, cookie phiên, trigger tự tạo hồ sơ, chuyển vào `/`.
2. *Làm bài*: Server Action gọi `create_session` → trả danh sách câu không kèm đáp án → client giữ trạng thái bằng reducer → mỗi lần nộp gọi `submit_answer` (kiểm tra câu thuộc phiên, ghi attempt, trả đúng/sai + đáp án + giải thích) → `finish_session` → trang kết quả gọi `get_session_review`.
3. *Drill*: chạy hoàn toàn ở client trên mảng câu sai đã có; không có lệnh ghi nào.
4. *Từ vựng và ôn tập*: lưu từ vào `vocab_entries`; trigger tạo `review_cards` (thẻ mới, đến hạn ngay); `/review` lấy thẻ đến hạn; Server Action dùng ts-fsrs tính trạng thái mới rồi ghi `review_cards` và `card_reviews` trong một giao dịch.
5. *Thống kê*: view `v_skill_mastery` (Wilson) và các truy vấn đọc cho `/` và `/stats`.
6. *Admin*: phiên của tài khoản `role = admin`, RLS qua `is_admin()`; ghi `review_log`.

### 6.2 Công nghệ và quyết định

| Hạng mục | Vai trò | MVP? | Cần tự hiểu / rủi ro |
| --- | --- | --- | --- |
| Next.js + TypeScript strict | UI và logic server trong một dự án | Ngay | Server vs Client Components, Server Actions; API đổi theo phiên bản: dùng tài liệu đúng phiên bản đã cài |
| Tailwind + shadcn/ui | Hiện thực token và component | Ngay, chỉ component cần dùng | Ánh xạ token HEX sang CSS variables; không giữ style mặc định lệch thiết kế |
| Supabase Postgres | Dữ liệu, RLS, RPC | Ngay | SQL, khóa ngoại, RLS, security definer; RLS sai là rủi ro số 1; kiểm tra giới hạn gói miễn phí theo bảng giá hiện hành |
| Supabase Auth | Email, Google, cookie phiên SSR | Email ngay (M3); Google ngay sau M4 | Cấu hình OAuth redirect cho từng môi trường |
| RPC + Server Actions | Logic bảo mật gần dữ liệu | Ngay | Transaction, idempotency, Zod; kiểm thử bằng pgTAP |
| Zod | Kiểm tra dữ liệu form và JSON giải thích | Ngay | Schema giải thích phải chịu được trường thiếu |
| Vitest | Kiểm thử logic thuần | Ngay | — |
| Playwright | E2E đường chính | Từ M4 | Tránh test chập chờn |
| GitHub Actions + Vercel | CI/CD, hosting | CI từ M1; deploy từ M4 | Tách staging và production |
| Sentry (PDF đề xuất) | Quan sát lỗi | Có thể sau | Không ghi nội dung câu trả lời |
| Pipeline AI Python/FastAPI | Sinh và kiểm duyệt đề hàng loạt | **Hoãn** (D-11, D-12) | Chi phí, chất lượng, bản quyền; làm khi có số liệu thật |
| ts-fsrs (FSRS) | Lập lịch ôn tập ngắt quãng, xem trước giờ hẹn cho 4 mức chấm | Ngay (M8) | Cần Node.js 20 trở lên; khóa phiên bản; hiểu Difficulty, Stability, Retrievability và 4 trạng thái thẻ (New, Learning, Review, Relearning); kiểm tra tham số lưu trữ bằng Zod; tối ưu tham số theo người dùng là việc sau MVP |

### 6.3 Route

| Route | Quyền | Render | Module |
| --- | --- | --- | --- |
| `/login`, `/auth/callback` | Công khai | Form Client; callback là Route Handler | auth |
| `/terms`, `/privacy` | Công khai | Server | (đề xuất, cho dòng pháp lý) |
| `/` | Đăng nhập | Server | stats, review, practice |
| `/practice/new` | Đăng nhập | Server + Client nhỏ | practice |
| `/practice/[sessionId]` | Chủ phiên | Server lấy dữ liệu + Client Runner | practice, explanation, vocab |
| `/practice/[sessionId]/result` | Chủ phiên | Server + Client cho Drill | practice |
| `/vocab` | Đăng nhập | Server + Client (tìm kiếm, sửa tại chỗ) | vocab |
| `/review` | Đăng nhập | Client | review |
| `/stats` | Đăng nhập | Server | stats |
| `/profile` | Đăng nhập | Server + Client form | profile |
| `/admin/review` | Admin | Server + Client (phím tắt) | admin |

Nhóm route: `(auth)` công khai; `(app)` có thanh điều hướng; `(focus)` ẩn điều hướng (`/practice/[sessionId]`, `/review`); `(admin)` có layout kiểm tra role (chỉ phục vụ giao diện; bảo mật thật là RLS).

### 6.4 Quy tắc code

- **Server Component là mặc định.** Chỉ đặt `"use client"` ở lá cây khi cần: phím tắt, reducer của phiên, Sheet, lật thẻ, sửa tại chỗ, Drill, phím tắt admin.
- Đọc dữ liệu ở Server Component; ghi qua Server Action (D-14); sau khi ghi gọi `revalidatePath`. Không truyền đáp án xuống client trước khi nộp. Không import module chỉ dành cho server vào client.
- **Trạng thái giao diện**: reducer thuần cho phiên làm bài (answering, submitting, feedback, error, finished); bộ lọc và tab ở URL; state cục bộ cho Sheet và Dialog; không dùng Redux hay Zustand.
- **Form**: form HTML + Server Action + Zod; validation phía client chỉ để phản hồi nhanh, server luôn kiểm tra lại; Server Action trả một dạng thống nhất (thành công hoặc lỗi theo từng trường).
- **Loading và lỗi**: mỗi route có `loading.tsx` (skeleton), `error.tsx` (nút Thử lại), `not-found.tsx`; trạng thái rỗng làm thành component dùng chung.
- **Kích thước**: một component khoảng 150 đến 250 dòng; logic thuần ở `core/`; tách phần hiển thị và phần xử lý.

### 6.5 Cấu trúc thư mục

```
toeic-ai/
├─ AGENTS.md                 # bất biến và quy tắc cho AI coding
├─ src/
│  ├─ app/
│  │  ├─ (auth)/login/
│  │  ├─ auth/callback/route.ts
│  │  ├─ (app)/              # có nav: /, practice/new, vocab, stats, profile, result
│  │  ├─ (focus)/            # ẩn nav: practice/[sessionId], review
│  │  └─ (admin)/admin/review/
│  ├─ features/              # auth, practice, vocab, review, stats, profile, admin
│  │  └─ <feature>/ components/ actions.ts queries.ts schemas.ts
│  ├─ core/                  # hàm thuần: sm2, mastery, scoring, practiceReducer, drill
│  ├─ components/ui/         # shadcn và primitive theo token
│  ├─ lib/supabase/          # browser, server, admin (admin chỉ ở server)
│  ├─ lib/track.ts
│  └─ types/database.ts      # sinh tự động từ schema
├─ supabase/{migrations,tests,seed}/
├─ data/questions/           # JSONL câu hỏi có phiên bản
├─ scripts/                  # import-questions
├─ e2e/  docs/{adr,specs,qa,security}/  .github/workflows/
```

`core/` là chỗ kiểm thử rẻ nhất (không phụ thuộc framework hay DB). `features/` giúp giao việc cho AI theo phạm vi file rõ ràng. `supabase/` là nguồn sự thật của schema: không sửa schema bằng giao diện web mà quên ghi lại.

### 6.6 Mô hình dữ liệu

| Thực thể | Mục đích và quan hệ | Gốc hay tính toán | Quyền |
| --- | --- | --- | --- |
| `profiles` | Tên hiển thị, `target_score` 10–990, `role`; 1–1 với người dùng Auth | Gốc | Người dùng sửa tên và điểm mục tiêu của mình, không sửa `role` |
| `grammar_tags` | 16 chủ điểm cố định | Gốc (seed) | Đọc: đăng nhập; ghi: admin |
| `questions` | Stem, 4 lựa chọn, tag, độ khó, trạng thái `draft`, `needs_review`, `published`, `retired`, `content_hash` | Gốc | Người học đọc `published`; admin đọc/ghi tất cả |
| `question_answers` | `correct_index` + giải thích JSON (kèm `vocab_hints`) | Gốc | Không có policy cho người học; chỉ qua RPC |
| `practice_sessions`, `session_questions` | Phiên và danh sách câu của phiên | Gốc | Chủ phiên |
| `attempts` | Mỗi lần nộp chính thức, có snapshot `tag_id` (ADR-009) | Gốc, nguồn duy nhất của thống kê | Đọc của mình; ghi qua `submit_answer` |
| `vocab_entries` | Từ, nghĩa, câu ngữ cảnh, câu nguồn; duy nhất theo (người dùng, lemma) | Gốc | Chủ sở hữu |
| `review_cards` | Trạng thái FSRS của thẻ: `stability`, `difficulty`, `state`, `due`, `last_review`, `reps`, `lapses` | Gốc | Chủ sở hữu |
| card\_reviews | Một dòng mỗi lần chấm thẻ: thẻ, mức chấm (Lại/Khó/Tốt/Dễ), thời điểm, trạng thái thẻ trước khi chấm (D-23) | Gốc, chỉ thêm, không sửa | Chủ sở hữu đọc; ghi qua giao dịch chấm thẻ |
| `question_reports` | Lý do, ghi chú, trạng thái; trigger rút câu sau 3 báo cùng lý do | Gốc | Người học thêm và đọc của mình; admin xử lý |
| `review_log` | Quyết định của admin | Gốc | Chỉ admin |
| `events` | Tên sự kiện thuộc danh sách đóng (D-08), không ghi nội dung câu trả lời | Gốc | Thêm và đọc của mình |
| `generation_batches` | Lô sinh đề và chi phí | Hoãn | Chỉ admin |
| Độ vững, chuỗi ngày, số thẻ đến hạn, hoạt động 14 ngày | Hiển thị Dashboard và `/stats` | **Tính toán** từ `attempts` và `review_cards` | Chỉ đọc |
| Drill | Trạng thái ôn lại tạm thời | **Không lưu DB** | — |

**Hàm RPC**: `create_session`, `submit_answer` (phiên bản có kiểm tra câu thuộc phiên và ghi `tag_id`), `finish_session`, `get_session_review`; hàm `is_admin()`; hàm `wilson_lower`; view `v_skill_mastery` dùng `security_invoker`.

**Chấm thẻ (FSRS)**: Server Action đọc trạng thái thẻ từ DB, dùng ts-fsrs tính trạng thái mới rồi ghi `review_cards` và `card_reviews` trong một giao dịch (RPC kiểm tra thẻ thuộc người gọi). Client không gửi trạng thái lịch tự tính.

**Bản vá bắt buộc khi viết migration** (PDF mục 14): policy `profiles` không cho tự đổi `role`; bảng `session_questions`; bật RLS cho mọi bảng (kể cả `grammar_tags`, `generation_batches`); trigger tạo hồ sơ khi đăng ký, trigger tạo thẻ ôn khi lưu từ, trigger rút câu khi đủ 3 báo cáo; thu hồi quyền thực thi hàm với `anon`.

### 6.7 Bảo mật và quyền riêng tư

- Mọi bảng bật RLS và có test; mọi view dùng `security_invoker`; client không đọc được cột đáp án (kiểm tra bằng cách gọi API trực tiếp, không chỉ tin giao diện).
- Khóa service role không bao giờ xuất hiện trong mã client; tìm tên biến trong phần mã client phải ra kết quả bằng không; quét secret trước mỗi commit và trong CI.
- Chống lấy đáp án hàng loạt bằng cách tạo nhiều phiên: giới hạn số phiên mỗi giờ và ghi nhận bất thường.
- OAuth redirect chỉ cho phép đúng domain; bật xác thực hai lớp cho tài khoản Supabase, GitHub, Vercel và tài khoản admin; giới hạn tần suất đăng nhập và các endpoint ghi.
- Ghi chú báo lỗi là dữ liệu người dùng: tham số hóa truy vấn, không bao giờ đưa vào prompt hay thực thi.
- Quyền riêng tư: chỉ thu thập email, tên hiển thị, điểm mục tiêu, dữ liệu học tập; cho phép xuất và xóa (xóa tài khoản kéo theo xóa dữ liệu nhờ `ON DELETE CASCADE`); chính sách viết bằng ngôn ngữ dễ hiểu và nêu việc theo dõi sự kiện.

### 6.8 Môi trường và cấu hình

Ba môi trường tách biệt: **local** (Supabase CLI), **staging**, **production** (database riêng cho từng môi trường). Biến môi trường chỉ lấy từ `.env.local` hoặc cấu hình nền tảng; có `.env.example` không chứa giá trị thật; khóa được xoay vòng định kỳ và tách theo môi trường.

## 7. Lộ trình triển khai

Nguyên tắc: có **vertical slice** chạy trên staging sớm (M4); component làm đến đâu dùng đến đó; Admin để cuối vì cần dữ liệu và báo lỗi; pipeline AI nằm ngoài MVP. Giờ ước tính là giờ làm việc thực (chưa gồm thời gian học); nếu mới với Next.js và TypeScript, nhân thêm khoảng 1,3 đến 1,5 lần. Chỉ lấp khoảng 70% công suất vào kế hoạch; 30% còn lại cho lỗi và việc phát sinh. Nếu trễ: cắt theo MoSCoW (bỏ COULD trước), **không cắt kiểm thử, tài liệu và kiểm tra bảo mật**.

| ID | Milestone và việc chính | Phụ thuộc | Nghiệm thu | Cần học | Độ khó | Giờ |
| --- | --- | --- | --- | --- | --- | --- |
| M0 | Chốt đặc tả: trả lời câu hỏi mở ở mục 11 (đã hoàn thành 24/10/2026) | — | Mục 3 và 11 không còn mục CẦN XÁC NHẬN chặn việc | — | Dễ | 3–4 |
| M1 | Khởi tạo dự án, công cụ, CI tối thiểu, Supabase local, `AGENTS.md` | M0 | `dev`, `lint`, `typecheck`, `test` xanh từ máy sạch; không có secret trong repo | App Router, biến môi trường | Trung bình | 6–10 |
| M2 | Token, khung layout, điều hướng, Button/Input/Card/Badge | M1 | Khớp mục 5 ở 360 và 1280px; focus ring đúng | CSS variables, Tailwind | Trung bình | 8–12 |
| M3 | Schema nền + RLS + bản vá, đăng nhập email, trigger hồ sơ | M1 | pgTAP xanh: A không đọc được dữ liệu B; không đọc được đáp án; không tự nâng role | SQL, RLS, security definer | Khó | 14–20 |
| M4 | **Vertical slice**: nạp 30 câu, tạo phiên, nộp, phản hồi cơ bản, kết quả thô, deploy staging | M2, M3 | Một người thật làm hết một phiên trên staging; một test E2E | Server Actions, reducer, Supabase SSR | Khó | 16–24 |
| M5 | Giải thích thích ứng (PD-02), Zod, `vocab_hints`, báo lỗi, sự kiện | M4 | Dữ liệu giải thích thiếu trường không làm hỏng trang; 3 báo cáo cùng lý do rút câu | Zod, `aria-live` | Trung bình | 8–12 |
| M6 | `/practice/new` (cảnh báo D-10), kết quả, Drill | M4 | Sau Drill `attempts` và mastery không đổi (có test) | State ở client | Trung bình | 10–14 |
| M7 | Bottom Sheet lưu từ, `/vocab` | M5 | Lưu trùng báo đúng; sửa và xóa có phản hồi; lưu từ tự tạo thẻ | Trigger, unique | Trung bình | 10–14 |
| M8 | `/review` FSRS: ts-fsrs ở server, lịch sử chấm thẻ, hàng đợi trong phiên | M7 | Chấm xong cập nhật hạn ôn và ghi lịch sử trong một giao dịch; thời gian trên nút khớp hàm xem trước; hết thẻ ra màn hình hoàn tất | FSRS (ổn định, độ khó, khả năng nhớ), trạng thái thẻ, dùng ts-fsrs | Trung bình–Khó | 14–20 |
| M9 | Dashboard và `/stats` | M6 | Khớp giá trị Wilson ở Phụ lục A; người mới hiện đúng trạng thái | GROUP BY, múi giờ | Khó | 12–18 |
| M10 | `/profile`, xuất JSON, xóa tài khoản | M3 | Xóa xong dữ liệu biến mất, người dùng bị đăng xuất; service role chỉ ở server | Dùng service role an toàn | Trung bình | 6–10 |
| M11 | `/admin/review` | M5 | Người thường không vào được và không đọc được dữ liệu admin dù đổi URL | Phân quyền theo role | Trung bình–Khó | 10–16 |
| M12 | Củng cố: E2E mở rộng, rà bảo mật, responsive thật (D-21), axe và bàn phím | M1–M11 | Không bảng nào thiếu RLS; không lỗi accessibility nghiêm trọng | Playwright, axe | Trung bình | 12–18 |
| M13 | Production và demo: URL, README, dữ liệu demo, ảnh hoặc video ngắn | M12 | Người ngoài mở URL và làm được một phiên | — | Dễ–TB | 6–10 |

Tổng khoảng 135–202 giờ làm việc. Google OAuth làm ngay sau M4, khi đã có URL staging (khoảng 3–4 giờ, chưa tính trong tổng; đã chốt ở OQ-5). Mỗi milestone kết thúc bằng một cổng kiểm tra; không bắt đầu milestone sau khi cổng chưa đạt.

**Chia đợt (đã chốt, OQ-4)**: không đặt hạn cố định; mỗi đợt kết thúc bằng một mốc chạy được.

- Đợt 1, M0–M2 (17–26 giờ): làm nhẹ, kết hợp học Next.js và TypeScript.
- Đợt 2, M3–M4 (30–44 giờ): mốc quan trọng nhất là bản demo chạy trên staging; Google OAuth làm ngay sau đó.
- Đợt 3, M5–M9 (54–78 giờ): tính năng học tập hoàn chỉnh; hết M9 là đã có bản demo CV dùng được (M0–M9: 101–148 giờ).
- Đợt 4, M10–M13 (34–54 giờ): hồ sơ, admin, củng cố chất lượng, production.

Ở 8 giờ mỗi tuần, tổng 135–202 giờ tương đương khoảng 17–25 tuần làm việc; nhân 1,3–1,5 nếu tính cả thời gian học.

Lỗi hay gặp theo giai đoạn: M1 commit nhầm secret hoặc tắt `strict`; M3 quên bật RLS ở một bảng hoặc đặt policy quá rộng; M4 để lộ đáp án trong payload, nộp lại tạo bản ghi đôi; M6 vô tình gọi `submit_answer` trong Drill; M7 không chuẩn hóa `lemma`; M8 tự viết công thức lập lịch thay vì dùng thư viện, quên lưu lịch sử mỗi lần chấm, lưu hạn ôn sai múi giờ; M9 gắn nhãn Cần ôn cho chủ điểm chưa đủ 5 câu; M10 để lộ service role ra client; M11 chỉ ẩn nút mà không có RLS.

**Sau MVP (có cổng quyết định):** pipeline AI theo PDF chương 5 và 16, `/admin/batches`, Part 6 và 7, chế độ bấm giờ, FSRS; chỉ làm khi có số liệu thật về nhu cầu số lượng câu hỏi và chất lượng.

## 8. Chiến lược kiểm thử

Ưu tiên theo rủi ro, không theo độ dễ:

1. **Phân quyền và RLS (pgTAP, từ M3)**: client không đọc được `question_answers`; người A không đọc dữ liệu người B; không tự đổi role; `submit_answer` từ chối câu không thuộc phiên.
2. **Unit test `core/` (Vitest, từ M1)**: lập lịch FSRS (test snapshot, Phụ lục A), nhãn mastery theo ngưỡng, tính điểm phiên, reducer, logic Drill, schema Zod. Mục tiêu phủ từ 70% lõi nghiệp vụ.
3. **Wilson trong database (pgTAP, M9)**: các giá trị ở Phụ lục A, ca ngưỡng 5 câu và người mới.
4. **Integration trên Supabase local**: tạo phiên → nộp → kết thúc → xem lại; lưu từ → tự tạo thẻ; báo lỗi đủ 3 lần chuyển `needs_review`.
5. **E2E Playwright**: đường chính (đăng nhập → luyện → xem giải thích → lưu từ → ôn); một test khẳng định Drill không ghi attempt.
6. **Responsive và accessibility**: kiểm tay ở 360, 390, 768, 1280, 1440 sau mỗi màn hình; axe; thử toàn bộ bằng bàn phím.
7. **Trạng thái lỗi và rỗng**: dùng ma trận ở mục 5.10 làm checklist.

Có thể để sau: kiểm thử hiệu năng (Lighthouse CI), quét bảo mật sâu, hồi quy trực quan. Test chập chờn thì sửa hoặc xóa, không để quen với CI đỏ.

## 9. Quy trình làm việc với AI coding

**Bảy bước mỗi task**: (1) viết spec nhỏ: mục tiêu một câu, hành vi, tiêu chí nghiệm thu, ràng buộc PD liên quan; (2) liệt kê file được phép sửa và file cấm động vào; (3) yêu cầu AI lập kế hoạch trước, chưa sửa; (4) làm từng phần nhỏ, mỗi phần một commit; (5) chạy lint, typecheck, test liên quan, và pgTAP khi đụng database; (6) review diff và tự giải thích lại hàm quan trọng nhất; (7) chỉ sang task tiếp khi đạt tiêu chí, kể cả chạy luồng thật bằng tay.

**Quy tắc**

- Mỗi task khoảng 5 file hoặc vài trăm dòng diff; vượt thì tách task.
- Quyết định kiến trúc nằm trong `AGENTS.md` và ADR; muốn đổi phải tạo ADR, không đổi trong lúc làm task.
- Tìm hàm hoặc component có sẵn trước khi viết mới; logic thuần chỉ ở `core/`.
- Cấm `any`, `@ts-ignore`, tắt rule khi chưa có lý do ghi chú; typecheck xanh mới merge.
- Secret chỉ ở biến môi trường server; `.env.local` không commit; quét secret trước commit; không dán khóa thật vào prompt.
- Nghiệm thu luôn gồm luồng chạy thật và kiểm tra dữ liệu trong DB, không chỉ nhìn giao diện. Code chạy được chưa phải bằng chứng sản phẩm đúng: đối chiếu với PD và test.
- Code bảo mật (RLS, RPC, auth, xóa tài khoản): bạn tự đọc từng dòng và có test riêng.
- Không chạy AI tự động qua đêm khi chưa có cổng kiểm tra và giới hạn phạm vi.
- Sau mỗi task ghi ba dòng: đã làm gì, đã học gì, còn gì chưa hiểu.

**Nội dung `AGENTS.md` (bất biến)**: Part 5 là toàn bộ MVP; đáp án không rời server trước khi nộp; Drill không ghi DB; mastery dùng Wilson z = 1,96, ngưỡng 5 / 50 / 75; không bấm giờ; mỗi màn hình một Primary; không màu ngoài token; không màu là tín hiệu duy nhất; mọi bảng có RLS; không thêm thư viện hoặc tính năng ngoài danh sách ở mục 6.2 khi chưa có ADR.

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

## 11. Câu hỏi mở: tất cả đã được chốt ngày 24/10/2026

1. **OQ-1 Nguồn và số lượng câu hỏi (ĐÃ CHỐT)**: LLM soạn nháp ngoài ứng dụng, bạn duyệt tay theo checklist (đúng một đáp án, một chỗ trống, giải thích đúng, không dùng đề thật), nạp JSONL theo lô 16 câu (mỗi chủ điểm một câu). Mục tiêu khoảng 100 câu (16 chủ điểm × 6 câu) cho bản demo; bắt đầu M4 với 30 câu; nhờ người có TOEIC cao duyệt mẫu khoảng 20%. Ước tính duyệt 3–5 phút mỗi câu.
2. **OQ-2 FSRS (ĐÃ CHỐT)**: thẻ bấm Lại hoặc đang ở bước học (đến hạn sau vài phút) được xếp lại ngay trong phiên (quyết định của Product Owner, 24/10/2026). Mặc định đi kèm: thẻ xếp cuối hàng đợi; hết thẻ khác thì hiện luôn, không bắt chờ; thời điểm chấm thực tế được đưa cho thư viện; mức nhớ mục tiêu 90%, người dùng không đổi được.
3. **OQ-3 (ĐÃ CHỐT)**: chấp nhận D-01, D-02, D-13: mục 5 là bản gốc duy nhất (hai bản Handoff cũ chuyển vào thư mục archive), 10 màn hình, hoãn `/admin/batches`.
4. **OQ-4 (ĐÃ CHỐT)**: chia bốn đợt như mục 7, không đặt hạn cố định; mục tiêu bản demo sớm là hoàn thành M0–M9.
5. **OQ-5 (ĐÃ CHỐT)**: Google OAuth làm ngay sau M4, khi đã có URL staging (khoảng 3–4 giờ), trước M13.
6. **OQ-6 (ĐÃ CHỐT)**: Asia/Ho\_Chi\_Minh; mọi thời điểm lưu UTC; chuỗi ngày tính khi có ít nhất 1 câu luyện hoặc 1 thẻ ôn; loại câu đã làm đúng theo 7×24 giờ trượt; biểu đồ 14 ngày theo ngày lịch giờ Việt Nam.
7. **OQ-7 (ĐÃ CHỐT)**: viền ô nhập `#8190A6` (3,24:1 trên nền trắng); có hộp thoại xác nhận khi thoát phiên; phím tắt một ký tự chỉ hoạt động khi khu vực câu hỏi, thẻ hoặc hàng đợi admin đang có focus (tự focus khi vào màn hình); `/vocab` có hai tab lọc Tất cả và Đến hạn.

## 12. Task đầu tiên và định nghĩa hoàn thành

**Task đầu tiên**: khởi tạo dự án Next.js + TypeScript strict kèm bộ cổng chất lượng, chưa có tính năng nào. Phạm vi: tạo dự án, bật `strict`, cấu hình Tailwind, ESLint, Prettier, Vitest; một trang chủ trống và một test đơn giản; `.env.example`; `.env.local` bị bỏ qua; README ghi cách chạy; `AGENTS.md` với các bất biến ở mục 9; commit đầu tiên.

Vì sao làm trước: mọi milestone sau phụ thuộc vào nó, rủi ro thấp, và nó dựng sẵn cơ chế kiểm tra mà quy trình AI coding cần từ task thứ hai. Mọi câu hỏi mở đã được chốt nên có thể bắt đầu ngay.

Tiêu chí hoàn thành: `dev`, `lint`, `typecheck`, `test` chạy thành công từ máy sạch theo README; `strict` bật, không có `any` hay `ts-ignore`; không có secret trong repo; bạn tự giải thích được ba thư mục `app`, `core`, `components` dùng để làm gì.

**Definition of Ready** (một task được phép bắt đầu): có spec một câu, tiêu chí nghiệm thu, danh sách file được phép sửa, PD liên quan, không còn mục CẦN XÁC NHẬN chặn việc.

**Definition of Done** (một task được coi là xong): lint, typecheck, test liên quan xanh; pgTAP xanh nếu đụng database; có trạng thái rỗng, loading, lỗi; khớp token và component ở mục 5; đã kiểm tay ở 360px và 1280px; không có màu hay font ngoài token; đã review diff và giải thích được; tài liệu cập nhật (mục 3 nếu có quyết định mới).

Lưu ý: tôi chưa đối chiếu với tài liệu hiện hành của Next.js và Supabase (phiên bản, giá, giới hạn gói miễn phí); hãy kiểm tra đúng phiên bản bạn cài khi bắt đầu M1.

## Phụ lục A. Dữ liệu kiểm thử chuẩn

**Wilson (z = 1,96), cận dưới, nhân 100 để ra `mastery_pct`**

| Đúng / Tổng | Mastery | Nhãn |
| --- | --- | --- |
| 2 / 2 | 34,2 | Chưa đủ dữ liệu (dưới 5 lượt) |
| 8 / 10 | 49,0 | Cần ôn |
| 6 / 10 | 31,3 | Cần ôn |
| 5 / 8 | 30,6 | Cần ôn |
| 9 / 12 | 46,8 | Cần ôn |
| 8 / 9 | 56,5 | Khá |
| 12 / 14 | 60,1 | Khá |
| 18 / 20 | 69,9 | Khá |

**FSRS (kiểm thử lập lịch)**: không tính tay giá trị mong đợi. Các tính chất dưới đây đã được chạy thử ngày 24/10/2026 với ts-fsrs 5.4.2 (giấy phép MIT, yêu cầu Node.js 20 trở lên) và tham số mặc định: mức nhớ mục tiêu 0,9; bước học 1 phút và 10 phút; bước học lại 10 phút; 21 trọng số (FSRS-6); `enable_fuzz` mặc định là false (ví dụ trong tài liệu thư viện đặt true). Mẫu thử gồm 5.600 cặp (thẻ, thời điểm) lấy từ 400 lịch sử chấm ngẫu nhiên. Giá trị cụ thể phụ thuộc phiên bản: khi nâng cấp phải chạy lại và xem xét có chủ đích.

- Thứ tự hạn ôn: Lại ≤ Khó ≤ Tốt ≤ Dễ (0 vi phạm). Dấu bằng có thật: 173 mẫu có Tốt = Dễ, xảy ra khi thẻ ra khỏi bước học và cùng hẹn 24 giờ. Vì vậy test dùng ≤ chứ không dùng <, và giao diện phải chịu được hai nút hiện cùng thời gian.
- Thẻ mới: Lại hẹn 1 phút, Khó 6 phút, Tốt 10 phút (chuyển sang Learning, độ ổn định lớn hơn 0), Dễ 8 ngày (vào thẳng Review).
- Chấm Lại làm độ ổn định giảm và độ khó tăng ở mọi mẫu đã thử (3.936 thẻ Review, 1.264 thẻ Learning hoặc Relearning). Thẻ Review chuyển sang Relearning (hẹn 10 phút); Learning vẫn là Learning; Relearning vẫn là Relearning.
- Trên thẻ Review: độ ổn định sau Lại ≤ Khó ≤ Tốt ≤ Dễ, và Tốt, Dễ không bao giờ làm giảm độ ổn định (0 vi phạm).
- Ôn sớm hơn hạn (thẻ bước học sớm đến 9 phút, thẻ Review sớm 2 ngày) vẫn đúng thứ tự và không sinh giá trị vô hạn hay NaN: an toàn khi hiện thẻ sắp đến hạn trong cùng phiên.
- Lưu và đọc lại: chuyển thẻ thành JSON, khôi phục `due` và `last_review` về kiểu Date rồi chấm tiếp cho kết quả giống hệt tính liên tục trong bộ nhớ (0 trong 300 chuỗi lệch). Quên khôi phục kiểu Date là lỗi dễ gặp.
- `due` là thời điểm tuyệt đối (UTC): kết quả giống nhau dưới Asia/Ho\_Chi\_Minh và America/Los\_Angeles; múi giờ chỉ ảnh hưởng cách hiển thị và chuỗi ngày.
- Fuzz: khi bật, 0 trong 200 cặp lần gọi trên thẻ Review cho kết quả khác nhau (ngẫu nhiên cố định theo thẻ), nhưng test vẫn đặt false.

Mốc tham chiếu (snapshot): thẻ tạo lúc 08:00 UTC ngày 24/10/2026, mỗi lần chấm đúng lúc thẻ đến hạn, tham số mặc định, fuzz tắt, ts-fsrs 5.4.2.

| Bước | Chấm | Trạng thái | Hẹn sau | Độ ổn định | Độ khó |
| --- | --- | --- | --- | --- | --- |
| 1 | Tốt | New → Learning | 10 phút | 2,307 | 2,118 |
| 2 | Tốt | Learning → Review | 2,0 ngày | 2,307 | 2,111 |
| 3 | Tốt | Review → Review | 11,0 ngày | 10,971 | 2,104 |
| 4 | Khó | Review → Review | 32,0 ngày | 32,228 | 4,744 |
| 5 | Lại | Review → Relearning | 10 phút | 2,402 | 8,258 |
| 6 | Tốt | Relearning → Review | 2,0 ngày | 2,402 | 8,244 |
| 7 | Dễ | Review → Review | 7,0 ngày | 7,451 | 7,643 |

Chuỗi trong phiên với thẻ mới: Lại → hẹn 1 phút; Lại → 1 phút; Tốt → 10 phút; Tốt → 24 giờ (vào Review).

Nguồn: [tài liệu ts-fsrs](https://open-spaced-repetition.github.io/ts-fsrs/); [tài liệu Anki về thuật toán](https://docs.ankiweb.net/faqs/what-spaced-repetition-algorithm.md).
