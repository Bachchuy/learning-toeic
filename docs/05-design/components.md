<!-- Trích từ Master Blueprint v1.0 · 23/10/2026 -->
<!-- Nguồn gốc: archive/master-blueprint-v1.0.md -->

### 5.5 Component

| Component | Biến thể và trạng thái | Thông số | Quy tắc |
| --- | --- | --- | --- |
| Navigation | Mobile Bottom Bar 4 tab (Luyện, Từ vựng, Thống kê, Tôi); Desktop Sidebar | Bar cao 56px; Sidebar rộng 240px | Ẩn hoàn toàn trong phiên tập trung (`/practice/[id]`, `/review`) |
| Button | Primary, Secondary, Ghost, Destructive; hover, focus (ring 2px), disabled (opacity 40%), loading | Cao 48px (CTA chính) / 44px (phụ); padding ngang 16; radius 8; chữ SemiBold 15–16px | **Mỗi màn hình chỉ một Primary.** Nút Destructive chỉ ở vùng nguy hiểm |
| Input, Search, Textarea | default, focus (viền #2563EB), lỗi (viền #BE123C + dòng chữ đỏ), chỉ đọc (nền #F1F5F9) | Cao 44px; radius 8; viền `border.input`; font ≥16px mobile | Bắt buộc có Label phía trên, không lạm dụng placeholder |
| Segmented Pill | 5 / 10 / 20 câu | Cao 44px | Dùng cho quy mô phiên |
| Answer Option Row | default, hover, selected (nền #EFF6FF + viền #2563EB), correct (nền #ECFDF5 + \[✓\]), incorrect (nền #FFF1F2 + \[✗\]), unselected sau khi nộp | Cao tối thiểu 52px; padding 12; radius 8; keycap 28×28, radius 6; khoảng cách 8 | Thành phần trung tâm của app. Ký hiệu A B C D khớp bàn phím; màu luôn kèm ký hiệu và chữ |
| Adaptive Explanation | Expanded (sai), Collapsed (đúng) có nút \[▼ Mở rộng\] | Padding 16; radius 10; Rule Box viền trái 4px #2563EB | Hiện ngay dưới đáp án, không làm layout nhảy; vùng `aria-live="polite"` |
| Word Chip và Sheet | Chip mặc định (#F1F5F9) / đã chọn (#2563EB); Sheet trượt từ dưới (mobile), Dialog (desktop) | Chip cao 36, radius 6; Sheet radius trên 16, padding 20 | Đóng bằng \[X\], nền ngoài hoặc Esc; focus bẩy trong Sheet |
| FSRS Flashcard | Mặt trước (cloze \[ ? \]), mặt sau, 4 nút | Thẻ cao tối thiểu 240px; padding 20; từ mặt sau Bold 22px; nút cao **60px** (D-06) | Thời gian hẹn hiển thị trong nút lấy từ hàm xem trước (`repeat`) của thư viện FSRS, có thể là phút hoặc ngày (D-03, D-22); Tốt và Dễ có thể hiện cùng thời gian (ví dụ cùng 1 ngày khi thẻ ra khỏi bước học) nên nhãn chữ luôn hiện kèm; mobile ép lưới 4 cột |
| Topic Mastery Row | Vững, Khá, Cần ôn, Chưa đủ dữ liệu (thanh xám, hiện X/5) | Hàng cao 60px; thanh 8px (D-18); badge cao 24px | Tách Nhóm 1 (đủ DL) và Nhóm 2 (<5 câu); mỗi dòng có nút \[Luyện >\] |
| Admin Review Item | Hàng câu hỏi, panel báo cáo kiểm định | Mật độ gọn, 14px; tag kiểm định mono 12px | Desktop ưu tiên: trái nội dung, phải báo cáo và nút |
| Toast, Alert, Dialog | thành công, lỗi, xác nhận | Toast không che nút hành động ghim | Lỗi mạng dùng Alert có nút Thử lại |
| Skeleton, Empty | khung xương khi tải, màn hình rỗng có hướng dẫn | — | Mỗi route có `loading`, `error`, trạng thái rỗng |

