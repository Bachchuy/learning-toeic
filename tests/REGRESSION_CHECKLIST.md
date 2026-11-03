# REGRESSION CHECKLIST — HÀNG RÀO KIỂM THỬ HỒI QUY

> **Quy định nghiêm ngặt:** Trước khi merge code hoặc kết thúc bất kỳ task nào, Developer và AI Mentor bắt buộc phải kiểm tra qua toàn bộ các mục dưới đây. Nếu có bất kỳ mục nào FAIL, task KHÔNG ĐƯỢC PHÉP nghiệm thu.

---

## PHẦN A: BẢO VỆ HÀNH VI CỐT LÕI (GOLDEN PATHS)

### 1. Xác thực & Điều hướng bảo vệ (Auth & Session Flow)
- [ ] **R1.1**: Chưa đăng nhập truy cập route bảo vệ (`/`, `/practice/new`, `/review`, `/vocab`, `/profile`) -> Bị chuyển hướng chính xác sang `/login?next=<path>`.
- [ ] **R1.2**: Đăng nhập bằng email/password hợp lệ -> Lưu cookie phiên SSR -> Chuyển hướng đúng về trang đích (`next`) hoặc `/`.
- [ ] **R1.3**: Refresh trang khi đang ở trang bảo vệ -> Giữ nguyên phiên, không bị văng ra trang `/login`.
- [ ] **R1.4**: Bấm Đăng xuất -> Xóa sạch session cookies -> Mọi truy cập sau đó vào route bảo vệ đều bị chặn.
- [ ] **R1.5**: Form đăng nhập/đăng ký có đầy đủ client validation (email sai format, password trống) và hiển thị thông báo lỗi rõ ràng.

### 2. Làm bài & Bảo vệ đáp án (Practice & Question Shielding)
- [ ] **R2.1**: Dữ liệu câu hỏi tải về client tuyệt đối KHÔNG chứa trường `correct_index` hay `explanation`.
- [ ] **R2.2**: Người dùng chọn đáp án và nộp -> Gọi RPC `submit_answer` -> Nhận kết quả và giải thích tương ứng.
- [ ] **R2.3**: Khi làm bài sai -> Mở rộng toàn bộ giải thích; khi làm đúng -> Thu gọn giải thích (có nút mở ra).
- [ ] **R2.4**: Chế độ Drill (Ôn câu sai tại chỗ) -> Chỉ xử lý trên local memory/state, tuyệt đối KHÔNG ghi vào DB và KHÔNG đổi Mastery.

### 3. Ôn tập FSRS (Spaced Repetition)
- [ ] **R3.1**: Màn hình `/review` hiển thị đúng danh sách thẻ đến hạn (`due_cards`).
- [ ] **R3.2**: Chấm thẻ với 4 nút (Lỗi/Khó/Tốt/Dễ) -> Tính toán đúng `scheduled_days` theo `ts-fsrs`.
- [ ] **R3.3**: Mỗi lần chấm thẻ ghi đúng 1 bản ghi vào `card_reviews` (append-only) và cập nhật `review_cards`.

### 4. Sổ từ vựng (Vocabulary Notebook)
- [ ] **R4.1**: Nhấp vào Word Chip trong giải thích -> Mở Bottom Sheet (trên mobile 360px) hoặc Dialog (trên desktop 1280px).
- [ ] **R4.2**: Bấm Lưu từ -> Ghi vào `vocab_entries` thành công kèm lemma.
- [ ] **R4.3**: Lưu từ đã có trong sổ -> Hiển thị cảnh báo "Từ này đã có trong sổ", không gây lỗi crash ứng dụng.

### 5. An toàn CSDL & Phân quyền (Security & RLS)
- [ ] **R5.1**: Mọi bảng mới hoặc sửa đổi đều có `ENABLE ROW LEVEL SECURITY`.
- [ ] **R5.2**: Client (`anon`, `authenticated`) không thể SELECT trực tiếp từ bảng `question_answers`.
- [ ] **R5.3**: Client không thể tự UPDATE trường `role` trong bảng `profiles`.

### 6. Giao diện & Trải nghiệm (UI, Responsive & A11y)
- [ ] **R6.1**: Kiểm tra hiển thị chuẩn ở breakpoint Mobile nhỏ nhất (360px) không bị tràn ngang (horizontal scroll).
- [ ] **R6.2**: Mỗi màn hình chỉ có duy nhất 1 nút Primary.
- [ ] **R6.3**: Bàn phím điều hướng hoạt động đầy đủ: Phím A-D chọn đáp án, Enter nộp bài, Space lật thẻ FSRS.
- [ ] **R6.4**: Độ tương phản màu sắc đạt WCAG 2.1 AA (chữ trên nền, viền input `#8190A6`).

---

## PHẦN B: KIỂM TOÁN DIFF PHẪU THUẬT (SURGICAL DIFF AUDIT - CLAUDE.md)
- [ ] **D1. Traceability**: Mọi dòng code thay đổi trong git diff đều có lý do trực tiếp từ yêu cầu của task.
- [ ] **D2. No Adjacent Tampering**: Không có code lân cận, định dạng thụt lề hay comment cũ không liên quan bị sửa/xóa.
- [ ] **D3. No Orphan Code**: Không để lại biến, import, hàm thừa do chính thay đổi của mình tạo ra.
- [ ] **D4. Style Match**: Code mới viết khớp hoàn toàn với quy ước và phong cách của code hiện hữu trong project.
- [ ] **D5. No Speculative Bloat**: Không có tính năng thừa, abstraction cho code dùng 1 lần, hoặc cấu hình tương lai không được yêu cầu.

---

## Lệnh kiểm thử bắt buộc trước khi bàn giao:
```bash
npm run typecheck       # Phải đạt 0 lỗi TypeScript
npm run test            # Toàn bộ Unit & Invariant tests phải PASS
npm run test:e2e        # E2E test cho Auth và Protected Routes
```
