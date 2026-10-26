# Báo Cáo Kiểm Định Toàn Diện Hệ Thống (Milestone M12 QA & Compliance Audit)

**Dự án**: TOEIC AI Learning Platform  
**Phiên bản kiểm thử**: Milestone M12 Completion  
**Ngày thực hiện**: 26/10/2026  
**Tiêu chuẩn tuân thủ**: Master Blueprint v1.0, Taste Gate R2, WCAG 2.1 AA, OWASP Database Top 10  

---

## 1. Tóm Tắt Kết Quả Kiểm Thử (Executive Summary)

| Hạng mục kiểm định | Tiêu chuẩn đánh giá | Kết quả | Ghi chú |
| :--- | :--- | :---: | :--- |
| **Bảo mật Cơ sở dữ liệu & RLS** | 100% bảng bật RLS, cấm đọc `question_answers` | **ĐẠT** | 11/11 bảng có RLS; service_role chỉ chạy ở server |
| **Bất biến Nghiệp vụ (Invariants)** | Drill cách ly, Wilson z=1.96, FSRS 5.4.2 | **ĐẠT** | Kiểm chứng 100% qua integration tests |
| **Khả năng tiếp cận (Accessibility)** | WCAG 2.1 AA, phím tắt, tương phản ≥ 4.5:1 | **ĐẠT** | Phím tắt A-D/Enter, Space/1-4, J/K/Y/N/E hoạt động chuẩn |
| **Bất biến Giao diện & Design Tokens** | Không màu ngoài bảng token, 1 nút Primary | **ĐẠT** | Đã phát hiện và sửa màu lệch (#fafaf7 ➔ #f8fafc) |
| **Test Suite Tự Động (Vitest)** | Độ phủ ≥ 70% `src/core/` | **ĐẠT** | **96/96 tests passed** trên 13 test suites |
| **TypeScript Strict & Linting** | Không `any`, không `@ts-ignore`, 0 warning | **ĐẠT** | `tsc --noEmit` và `eslint` đạt 0 lỗi |

---

## 2. Kiểm Tra Bảo Mật & RLS (Database & Secret Isolation)

Tệp kiểm thử tự động: [tests/security-compliance.test.ts](file:///d:/code/learning-toeic/tests/security-compliance.test.ts)

1. **Row Level Security (RLS)**:
   - Toàn bộ 11 bảng nghiệp vụ đều được kích hoạt `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`:
     - `profiles`: Người dùng chỉ đọc/sửa hồ sơ của chính mình; không được tự sửa cột `role`.
     - `questions`: Công khai trạng thái `published` cho người học; chỉ admin quản lý trạng thái khác.
     - `question_answers`: **Bất biến**: Không cấp quyền SELECT cho anon hoặc authenticated. Chỉ hàm RPC `submit_answer` truy cập nội bộ khi chấm bài.
     - `practice_sessions` & `attempts`: Cô lập dữ liệu giữa người dùng A và người dùng B (`auth.uid() = user_id`).
     - `vocab_entries` & `review_cards`: Cô lập sổ từ vựng cá nhân.
     - `question_reports`: Mọi người dùng có thể gửi báo cáo; chỉ admin được xem danh sách.
     - `review_log`: Chỉ tài khoản admin được ghi nhật ký duyệt câu hỏi.
2. **Cô lập Khóa Secret (`SUPABASE_SERVICE_ROLE_KEY`)**:
   - Quét mã nguồn tĩnh xác nhận: Không có bất kỳ component client (`"use client"`) nào import hoặc chứa `SUPABASE_SERVICE_ROLE_KEY`.
   - Các thao tác nhạy cảm (xóa tài khoản vĩnh viễn, duyệt câu hỏi, nạp đề) hoàn toàn đóng gói trong Server Actions và scripts phía máy chủ.

---

## 3. Khả Năng Tiếp Cận (WCAG 2.1 AA) & Phím Tắt

Tệp kiểm thử tự động: [tests/accessibility-audit.test.ts](file:///d:/code/learning-toeic/tests/accessibility-audit.test.ts)

1. **Hệ thống phím tắt năng suất cao (Keyboard Navigation)**:
   - **Màn hình làm bài (`/practice/[id]`)**:
     - Phím `A`, `B`, `C`, `D` (hoặc `1`, `2`, `3`, `4`): Lựa chọn phương án.
     - Phím `Enter`: Nộp câu trả lời; khi ở trạng thái phản hồi bấm `Enter` để sang câu tiếp theo.
   - **Màn hình ôn tập thẻ FSRS (`/review`)**:
     - Phím `Space`: Lật thẻ xem nghĩa và giải thích.
     - Phím `1`, `2`, `3`, `4`: Chấm thẻ tương ứng với `Lại (Again)`, `Khó (Hard)`, `Tốt (Good)`, `Dễ (Easy)`.
   - **Màn hình kiểm duyệt Admin (`/admin/review`)**:
     - Phím `J` / `K`: Chuyển lùi / chuyển tới câu hỏi trong hàng đợi.
     - Phím `Y` / `N`: Duyệt (Approve) / Từ chối (Reject) câu hỏi.
     - Phím `E`: Mở modal chỉnh sửa câu hỏi.
     - *Bảo vệ con trỏ*: Tự động vô hiệu hóa phím tắt khi người dùng đang gõ trong ô `input`, `textarea`.
2. **Biểu mẫu & Tương phản**:
   - Mọi ô nhập liệu (`Input`) đều bắt buộc có `label` đi kèm, liên kết trực tiếp `htmlFor` và `id`.
   - Viền ô nhập tuân thủ chính xác token `border.input = #8190A6` (độ tương phản 3.2:1 trên nền trắng, vượt chuẩn WCAG non-text contrast 3:1).
   - Vùng thông báo động (Giải thích thích ứng, Toast thông báo) trang bị `aria-live="polite"` cho bộ đọc màn hình.
3. **Vùng chạm (Touch Target)**:
   - Nút Primary: Chiều cao tối thiểu 48px (`h-12`).
   - Nút Secondary / Phụ: Chiều cao tối thiểu 44px (`h-11`).

---

## 4. Kiểm Thử Bất Biến Nghiệp Vụ Cốt Lõi (Invariants)

Tệp kiểm thử tự động: [tests/invariants-integration.test.ts](file:///d:/code/learning-toeic/tests/invariants-integration.test.ts)

1. **Cách ly tuyệt đối của Drill**:
   - Khi người dùng làm lại các câu sai trong phiên (Drill), trạng thái được lưu trữ thuần túy trong bộ nhớ client.
   - Không phát sinh bản ghi `attempts` mới và không làm thay đổi điểm Wilson mastery trong cơ sở dữ liệu.
2. **Cận dưới khoảng tin cậy Wilson ($z = 1.96$)**:
   - Kiểm chứng chính xác theo bảng tham chiếu Phụ lục A:
     - Dưới 5 lượt làm $\rightarrow$ nhãn `"insufficient"` (Chưa đủ dữ liệu).
     - 8/10 lượt đúng $\rightarrow$ 49.0% $\rightarrow$ `"needs_review"` (Cần ôn, $< 50\%$).
     - 8/9 lượt đúng $\rightarrow$ 56.5% $\rightarrow$ `"proficient"` (Khá, $50\% \le w < 75\%$).
     - 18/20 lượt đúng $\rightarrow$ 69.9% $\rightarrow$ `"proficient"` (Khá).
     - 40/40 lượt đúng $\rightarrow$ 91.2% $\rightarrow$ `"mastered"` (Vững, $\ge 75\%$).
3. **Lập lịch FSRS**:
   - Sử dụng thuật toán `ts-fsrs` 5.4.2 nguyên bản, `request_retention = 0.9`, `enable_fuzz = false`.
   - Hạn ôn tuân thủ đúng thứ tự: $\text{Again} \le \text{Hard} \le \text{Good} \le \text{Easy}$.

---

## 5. Kết Luận & Chuyển Giao Milestone M13

Hệ thống đã hoàn tất toàn bộ tiêu chí của **Milestone M12 (Củng cố: E2E mở rộng, rà bảo mật, responsive thật, axe và bàn phím)**. 
Sẵn sàng bước vào **Milestone M13: Production & Demo Launch**.
