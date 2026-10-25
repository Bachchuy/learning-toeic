<!-- Trích từ Master Blueprint v1.0 · 23/10/2026 -->
<!-- Nguồn gốc: archive/master-blueprint-v1.0.md -->

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

