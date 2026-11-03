<!-- Trích từ Master Blueprint v1.0 · 23/10/2026 -->
<!-- Nguồn gốc: archive/master-blueprint-v1.0.md -->

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

### 8.1 Chiến lược kiểm thử chống hồi quy & Kiểm thử tích hợp (Regression & Integration Testing)

Hệ thống bổ sung bộ kiểm thử tự động toàn diện chống lỗi hồi quy kỹ thuật (`tests/remediation-integration.test.ts` và `tests/REGRESSION_CHECKLIST.md`):

1. **Kiểm thử Bảo mật RPC (`submit_passage_answers`)**:
   - Xác minh payload âm (`selected_index = -1`) hoặc câu không chọn bị loại bỏ hoàn toàn khỏi kết quả trả về và `attempts`.
   - Xác minh câu hỏi không thuộc passage bị từ chối với lỗi `QUESTION_NOT_IN_PASSAGE`.
   - Xác minh câu hỏi trùng lặp trong cùng một payload bị từ chối với `DUPLICATE_QUESTION_IN_PAYLOAD`.
   - Xác minh UUID sai định dạng bị bắt lỗi validation trước khi ép kiểu.
   - Xác minh quyền thực thi: `anon` và `authenticated` bị REVOKE, chỉ server action/service_role mới gọi được khi cần.

2. **Kiểm thử Tính nguyên tử FSRS (`record_card_review_atomic`)**:
   - Cập nhật trạng thái thẻ `review_cards` và thêm bản ghi lịch sử `card_reviews` trong cùng một giao dịch ACID.
   - Kiểm tra rollback: nếu một thao tác vi phạm ràng buộc, không có dữ liệu dở dang nào được lưu lại.
   - Xác minh RLS: Client thông thường (`authenticated`, `anon`) chỉ có quyền SELECT, không thể tự ý sửa trường `stability`, `difficulty` hay can thiệp FSRS.

3. **Kiểm thử Thống kê ARM (Adaptive Rolling Mastery)**:
   - Đối chiếu kết quả giữa SQL View `v_skill_mastery` và hàm TypeScript `calculateAdaptiveMastery`.
   - Đảm bảo cửa sổ trượt 20 lượt gần nhất hoạt động chính xác qua hàm cửa sổ `ROW_NUMBER()` trong PostgreSQL.
   - Xác minh cơ chế Fast-track thăng hạng sớm cho học viên xuất sắc (n >= 8, tỉ lệ đúng >= 90%).

4. **Kiểm thử Từ điển & Âm thanh**:
   - Kiểm tra hàm `validateSafeAudioUrl`: chỉ chấp nhận URL hợp lệ từ các CDN âm thanh được whitelist (`ssl.gstatic.com`, `commons.wikimedia.org`, `dictionary.cambridge.org`, v.v.), từ chối các URL giả mạo hoặc IP nội bộ (SSRF).
   - Kiểm tra RLS bảng `dictionary_cache`: từ chối mọi yêu cầu INSERT/UPDATE trực tiếp từ client.
