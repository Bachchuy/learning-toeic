<!-- Trích từ Master Blueprint v1.0 · 23/10/2026 -->
<!-- Nguồn gốc: archive/master-blueprint-v1.0.md -->

## 12. Task đầu tiên và định nghĩa hoàn thành

**Task đầu tiên**: khởi tạo dự án Next.js + TypeScript strict kèm bộ cổng chất lượng, chưa có tính năng nào. Phạm vi: tạo dự án, bật `strict`, cấu hình Tailwind, ESLint, Prettier, Vitest; một trang chủ trống và một test đơn giản; `.env.example`; `.env.local` bị bỏ qua; README ghi cách chạy; `AGENTS.md` với các bất biến ở mục 9; commit đầu tiên.

Vì sao làm trước: mọi milestone sau phụ thuộc vào nó, rủi ro thấp, và nó dựng sẵn cơ chế kiểm tra mà quy trình AI coding cần từ task thứ hai. Mọi câu hỏi mở đã được chốt nên có thể bắt đầu ngay.

Tiêu chí hoàn thành: `dev`, `lint`, `typecheck`, `test` chạy thành công từ máy sạch theo README; `strict` bật, không có `any` hay `ts-ignore`; không có secret trong repo; bạn tự giải thích được ba thư mục `app`, `core`, `components` dùng để làm gì.

**Definition of Ready** (một task được phép bắt đầu): có spec một câu, tiêu chí nghiệm thu, danh sách file được phép sửa, PD liên quan, không còn mục CẦN XÁC NHẬN chặn việc.

**Definition of Done** (một task được coi là xong): lint, typecheck, test liên quan xanh; pgTAP xanh nếu đụng database; có trạng thái rỗng, loading, lỗi; khớp token và component ở mục 5; đã kiểm tay ở 360px và 1280px; không có màu hay font ngoài token; đã review diff và giải thích được; tài liệu cập nhật (mục 3 nếu có quyết định mới).

Lưu ý: tôi chưa đối chiếu với tài liệu hiện hành của Next.js và Supabase (phiên bản, giá, giới hạn gói miễn phí); hãy kiểm tra đúng phiên bản bạn cài khi bắt đầu M1.

