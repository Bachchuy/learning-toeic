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

**Nội dung `AGENTS.md` (bất biến chuẩn hóa)**: Đáp án không rời server trước khi nộp; Drill không ghi DB & không đổi mastery; Mastery theo Adaptive Rolling Mastery (ARM: z=1.0, window 20, fast-track n>=8 & >=90% - D-25); Không bấm giờ trong Luyện tập Part 5 hàng ngày (PD-06; chỉ áp dụng 75 phút trong Exam Simulator - D-27); Mỗi màn hình một nút Primary; Không màu ngoài token; Không màu làm tín hiệu duy nhất; Mọi bảng có RLS; Không thêm thư viện ngoài danh sách §6.2 khi chưa có ADR.

### 9.1 Mười điều răn vàng bắt buộc cho AI Coding Agent (The 10 Golden Rules)

Mọi tác vụ can thiệp mã nguồn do AI Agent thực hiện bắt buộc phải tuân thủ nghiêm ngặt 10 quy tắc sau:

1. **Đọc yêu cầu và các quyết định liên quan trước khi sửa**: Luôn tra cứu `docs/INDEX.md`, `docs/03-decisions/` và `AGENTS.md` để nắm vững bất biến và bối cảnh kiến trúc trước khi gõ dòng code đầu tiên.
2. **Kiểm tra code hiện tại, không giả định**: Không suy diễn dựa trên tài liệu cũ hoặc tên file; phải trực tiếp đọc file nguồn hiện tại và kiểm tra Git status để bảo vệ công sức chưa commit của người dùng.
3. **Truy vết toàn bộ call sites**: Khi thay đổi một hàm, kiểu dữ liệu, API hoặc RPC, phải tìm và kiểm tra 100% các điểm gọi (call sites) liên quan trên toàn codebase.
4. **Xác định chức năng có nguy cơ hồi quy**: Phân tích kỹ lưỡng các luồng dữ liệu liên quan (auth session, RLS, transactional integrity, client state) có thể bị ảnh hưởng ngoài ý muốn.
5. **Viết hoặc cập nhật regression test**: Mọi bug fix hoặc thay đổi logic nghiệp vụ phải đi kèm bài test cụ thể chứng minh lỗi đã được khắc phục và không bị tái phát.
6. **Chạy test sau mỗi thay đổi**: Chạy `npm run typecheck`, `npm run test` (và `npm run build` đối với thay đổi kiến trúc/UI) sau mỗi bước sửa đổi; lặp lại cho đến khi toàn bộ đều xanh.
7. **Kiểm tra `git diff` cẩn trọng**: Tự review từng dòng diff trước khi báo cáo; bảo đảm mỗi dòng thay đổi đều truy nguyên được về mục tiêu của task (Surgical Changes).
8. **Tuyệt đối không xóa hoặc vô hiệu hóa test để che lỗi**: Nghiêm cấm xóa test, giảm assertion, skip test hoặc dùng `@ts-ignore` / `any` để vượt qua kiểm tra một cách giả tạo.
9. **Không tự ý mở rộng phạm vi (Simplicity First)**: Không phỏng đoán thêm tính năng ngoài yêu cầu; ưu tiên giải pháp tối giản, rõ ràng và dễ bảo trì nhất.
10. **Báo cáo trung thực & minh bạch**: Nêu rõ nguyên nhân gốc rễ, luồng sửa, rủi ro còn lại và các hạng mục chưa thể kiểm chứng tự động trong môi trường phát triển cục bộ.

### 9.2 Cơ chế Duy trì Một Nguồn Sự Thật Duy Nhất (Single Source of Truth - SSOT)

Để tránh hiện tượng tài liệu bị lệch pha (drift) so với mã nguồn thực tế:
- **Cấu trúc SSOT**: `docs/01-vision-users-scope.md` và `docs/03-decisions/` là nguồn sự thật tối thượng cho Phạm vi Sản phẩm (Product Scope) và Quyết định Kiến trúc (Architectural Decisions).
- **Quy trình cập nhật liên hoàn**:
  1. Khi một tính năng mới được triển khai hoặc một quyết định cũ được thay thế, Agent có trách nhiệm cập nhật đồng thời mã nguồn, bài kiểm thử và hồ sơ quyết định trong `docs/03-decisions/` (`PD-log.md` hoặc `D-log.md`).
  2. Bất biến trong `AGENTS.md` phải luôn trích dẫn trực tiếp mã quyết định (`D-xx` hoặc `PD-xx`) tương ứng.
  3. Cấm tuyệt đối việc tự ý ghi đè hoặc loại bỏ một quyết định đã chốt mà không có phân tích tác động và ghi nhận lịch sử thay thế.
