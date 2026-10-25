<!-- Trích từ Master Blueprint v1.0 · 23/10/2026 -->
<!-- Nguồn gốc: archive/master-blueprint-v1.0.md -->

## 11. Câu hỏi mở: tất cả đã được chốt ngày 24/10/2026

1. **OQ-1 Nguồn và số lượng câu hỏi (ĐÃ CHỐT)**: LLM soạn nháp ngoài ứng dụng, bạn duyệt tay theo checklist (đúng một đáp án, một chỗ trống, giải thích đúng, không dùng đề thật), nạp JSONL theo lô 16 câu (mỗi chủ điểm một câu). Mục tiêu khoảng 100 câu (16 chủ điểm × 6 câu) cho bản demo; bắt đầu M4 với 30 câu; nhờ người có TOEIC cao duyệt mẫu khoảng 20%. Ước tính duyệt 3–5 phút mỗi câu.
2. **OQ-2 FSRS (ĐÃ CHỐT)**: thẻ bấm Lại hoặc đang ở bước học (đến hạn sau vài phút) được xếp lại ngay trong phiên (quyết định của Product Owner, 24/10/2026). Mặc định đi kèm: thẻ xếp cuối hàng đợi; hết thẻ khác thì hiện luôn, không bắt chờ; thời điểm chấm thực tế được đưa cho thư viện; mức nhớ mục tiêu 90%, người dùng không đổi được.
3. **OQ-3 (ĐÃ CHỐT)**: chấp nhận D-01, D-02, D-13: mục 5 là bản gốc duy nhất (hai bản Handoff cũ chuyển vào thư mục archive), 10 màn hình, hoãn `/admin/batches`.
4. **OQ-4 (ĐÃ CHỐT)**: chia bốn đợt như mục 7, không đặt hạn cố định; mục tiêu bản demo sớm là hoàn thành M0–M9.
5. **OQ-5 (ĐÃ CHỐT)**: Google OAuth làm ngay sau M4, khi đã có URL staging (khoảng 3–4 giờ), trước M13.
6. **OQ-6 (ĐÃ CHỐT)**: Asia/Ho\_Chi\_Minh; mọi thời điểm lưu UTC; chuỗi ngày tính khi có ít nhất 1 câu luyện hoặc 1 thẻ ôn; loại câu đã làm đúng theo 7×24 giờ trượt; biểu đồ 14 ngày theo ngày lịch giờ Việt Nam.
7. **OQ-7 (ĐÃ CHỐT)**: viền ô nhập `#8190A6` (3,24:1 trên nền trắng); có hộp thoại xác nhận khi thoát phiên; phím tắt một ký tự chỉ hoạt động khi khu vực câu hỏi, thẻ hoặc hàng đợi admin đang có focus (tự focus khi vào màn hình); `/vocab` có hai tab lọc Tất cả và Đến hạn.

