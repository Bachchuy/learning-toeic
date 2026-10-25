<!-- Trích từ Master Blueprint v1.0 · 23/10/2026 -->
<!-- Nguồn gốc: archive/master-blueprint-v1.0.md -->

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

