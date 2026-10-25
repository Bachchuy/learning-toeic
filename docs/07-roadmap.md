<!-- Trích từ Master Blueprint v1.0 · 23/10/2026 -->
<!-- Nguồn gốc: archive/master-blueprint-v1.0.md -->

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

