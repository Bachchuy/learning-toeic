<!-- Trích từ Master Blueprint v1.0 · 23/10/2026 -->
<!-- Nguồn gốc: archive/master-blueprint-v1.0.md -->

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

