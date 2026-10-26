# Hướng Dẫn Cào & Nạp Đề Thi ETS TOEIC (ETS Crawler & Ingestion Pipeline)

Tài liệu hướng dẫn quy trình cào, bóc tách và nạp đề thi Part 5 từ các nguồn trực tuyến (Study4, Prep, Toeic123, đề thi thử, tệp PDF/Word) vào ngân hàng câu hỏi của hệ thống.

---

## 1. Cơ Chế Hoạt Động (Architecture)

Quy trình bóc tách bao gồm 5 tầng tự động hóa:

```
[Web/PDF/Text Thô] 
       │
       ▼
[1. Bộ Bóc Tách (Parser)] ───► Tách stem, 4 options (A-D), key đáp án, bản dịch & giải thích
       │
       ▼
[2. Bộ Phân Loại Ngữ Pháp] ──► Phân tích từ loại/hình thái học tự động xếp vào 16 chủ điểm chuẩn ETS
       │
       ▼
[3. Cổng Kiểm Định S3-S6]  ──► Kiểm tra: 1 chỗ trống duy nhất (______), 4 lựa chọn không trùng, đáp án hợp lệ
       │
       ▼
[4. Bộ Băm Định Danh (Hash)] ─► Băm MD5 tránh trùng lặp câu hỏi khi chạy nhiều lần
       │
       ▼
[5. Lưu Trữ Supabase]     ──► Ghi đồng thời vào bảng `questions` và `question_answers` (RLS bảo mật)
```

---

## 2. Cách Sử Dụng

### Cách 1: Nạp gói đề ETS chuẩn hóa có sẵn
Gói 10 câu mẫu chuẩn ngữ pháp cao cấp có sẵn trong code:
```bash
npm run db:crawl
```

### Cách 2: Cào / Bóc tách từ file đề bất kỳ
Khi bạn copy đề từ Study4, Prep, Toeic123, hoặc trích xuất từ file Word/PDF:
1. Lưu nội dung vào một file văn bản, ví dụ `data/my-test.txt`.
2. Định dạng câu hỏi hỗ trợ linh hoạt:
   ```text
   101. The manager praised Ms. Alvarez for handling the complaint so ______.
   (A) profession
   (B) professional
   (C) professionally
   (D) professionalism
   Answer: C
   Giải thích: Cần trạng từ bổ nghĩa cho động từ handling.
   Dịch: Người quản lý đã khen ngợi cô Alvarez...
   ```
3. Chạy lệnh nạp:
   ```bash
   npx tsx scripts/crawler-ets.ts --file data/my-test.txt
   ```

---

## 3. Các Tính Năng Thông Minh Đi Kèm

- **Tự động nhận diện chỗ trống**: Hỗ trợ mọi ký hiệu `...`, `…`, `____`, `[blank]` $\rightarrow$ tự động chuẩn hóa về `______`.
- **Tự động gán nhãn chủ điểm ngữ pháp**: Nhận diện tiền tố/hậu tố (`-ly`, `-tion`, `-ment`, đại từ, liên từ, mạo từ...) để map chuẩn xác vào 16 `grammar_tags`.
- **Tự động phân cấp độ khó (Difficulty 1, 2, 3)**: Dựa trên độ dài câu và cấu trúc mệnh đề.
- **Bảo toàn tính toàn vẹn (Zero Malformed Questions)**: Bất kỳ câu nào thiếu phương án, trùng lặp đáp án hoặc sai định dạng sẽ bị cổng kiểm tra tự động S3–S6 chặn lại, đảm bảo ngân hàng câu hỏi luôn sạch và chuẩn xác.
