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

