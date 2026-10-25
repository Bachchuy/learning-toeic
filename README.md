# TOEIC AI Learning Platform

Hệ thống luyện thi TOEIC thích ứng (Adaptive Learning) áp dụng thuật toán lặp lại ngắt quãng **FSRS** (Free Spaced Repetition Scheduler) và đánh giá độ vững kiến thức bằng **Khoảng tin cậy Wilson**.

---

## 🚀 Hướng dẫn Cài đặt & Chạy dự án (Local Setup)

### 1. Yêu cầu môi trường
- **Node.js**: phiên bản `>= 20.0.0` (Khuyến nghị `v22` hoặc `v24`).
- **Trình quản lý gói**: `npm` (đi kèm Node.js).

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env.local` từ file mẫu:
```bash
cp .env.example .env.local
```
*(Lưu ý: Không bao giờ commit file `.env.local` chứa khóa bí mật lên Git)*.

---

## 🛡️ Bộ Cổng Chất lượng (Quality Gates)

Trước khi commit hoặc mở Pull Request, dự án yêu cầu 100% các cổng chất lượng sau phải vượt qua (PASS):

```bash
# 1. Khởi chạy Development Server (http://localhost:3000)
npm run dev

# 2. Kiểm tra lỗi cú pháp & phong cách mã (Linting)
npm run lint

# 3. Kiểm tra kiểu dữ liệu tĩnh nghiêm ngặt (TypeScript Strict Typecheck)
npm run typecheck

# 4. Chạy Unit Test kiểm tra logic nghiệp vụ thuần (Vitest)
npm run test
```

Các lệnh bổ sung:
```bash
# Chạy test ở chế độ theo dõi thay đổi (Watch mode)
npm run test:watch

# Tự động định dạng mã nguồn theo chuẩn Prettier
npm run format
```

---

## 🏛️ Kiến trúc 3 Phân vùng Cốt lõi (Three-Tier Core Directory)

- **`src/app/` (Routing & Next.js Framework)**: 
  Phụ trách routing (App Router), Server Components, Client boundary, layout phân vùng (`(auth)`, `(app)`, `(focus)`, `(admin)`).
- **`src/core/` (Pure Domain Logic - Trái tim thuật toán)**: 
  Chứa các hàm toán học và thuật toán học tập thuần túy (`FSRS`, `Wilson Score`, `Practice Reducer`). **Tuyệt đối không phụ thuộc vào React, Next.js hay Database**, giúp test chạy siêu tốc (mili-giây) và dễ tái sử dụng.
- **`src/components/` (UI Components)**: 
  Chứa các thành phần giao diện tái sử dụng tuân thủ nghiêm ngặt Design Tokens và chuẩn trợ năng Accessibility WCAG 2.1 AA.
