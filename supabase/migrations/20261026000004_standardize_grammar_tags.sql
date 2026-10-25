-- Migration: Chuẩn hóa thuật ngữ 16 chủ điểm ngữ pháp TOEIC Part 5
-- Loại bỏ các từ ngữ cũ/thừa: 'Thì thời' -> 'Thì động từ (Tenses)'
-- 'Cấu tạo từ' -> 'Từ loại (Word Form)'
-- 'Cụm từ cố định & Thành ngữ' -> 'Cụm từ cố định (Collocations)'

UPDATE public.grammar_tags 
SET name_vi = 'Thì động từ (Tenses)',
    description = 'Các thì đơn, tiếp diễn, hoàn thành và sự phối hợp thì trong câu'
WHERE tag_code = 'tenses';

UPDATE public.grammar_tags 
SET name_vi = 'Hòa hợp Chủ ngữ - Động từ',
    description = 'Quy tắc chia động từ theo chủ ngữ đơn, số nhiều, cụm danh từ và đại từ'
WHERE tag_code = 'subject_verb';

UPDATE public.grammar_tags 
SET name_vi = 'Động từ khuyết thiếu (Modal Verbs)',
    description = 'Các trợ động từ khuyết thiếu (can, could, should, must, may) và thể giả định'
WHERE tag_code = 'modals';

UPDATE public.grammar_tags 
SET name_vi = 'Danh động từ & Động từ nguyên mẫu (V-ing / To-V)',
    description = 'Quy tắc sử dụng V-ing và To-V theo sau các động từ và giới từ thông dụng'
WHERE tag_code = 'gerund_infinitive';

UPDATE public.grammar_tags 
SET name_vi = 'Phân từ & Rút gọn mệnh đề (Participles)',
    description = 'Hiện tại phân từ (V-ing), quá khứ phân từ (V-ed/V3) và mệnh đề phân từ rút gọn'
WHERE tag_code = 'participles';

UPDATE public.grammar_tags 
SET name_vi = 'Mệnh đề quan hệ (Relative Clauses)',
    description = 'Đại từ và trạng từ quan hệ (who, whom, which, that, whose, where, when) và rút gọn'
WHERE tag_code = 'relative_clauses';

UPDATE public.grammar_tags 
SET name_vi = 'Câu điều kiện & Thể giả định',
    description = 'Câu điều kiện loại 1, 2, 3, câu điều kiện hỗn hợp và đảo ngữ điều kiện'
WHERE tag_code = 'conditionals';

UPDATE public.grammar_tags 
SET name_vi = 'Cấu trúc so sánh (Comparisons)',
    description = 'So sánh bằng, so sánh hơn, so sánh nhất và so sánh kép (the more... the more...)'
WHERE tag_code = 'comparisons';

UPDATE public.grammar_tags 
SET name_vi = 'Từ loại (Word Form)',
    description = 'Nhận diện vị trí và chức năng của Danh từ, Động từ, Tính từ, Trạng từ'
WHERE tag_code = 'word_form';

UPDATE public.grammar_tags 
SET name_vi = 'Cụm từ cố định (Collocations)',
    description = 'Cụm từ đi liền nhau và cụm động từ (Phrasal Verbs) thường gặp trong môi trường công sở'
WHERE tag_code = 'collocations';

UPDATE public.grammar_tags 
SET name_vi = 'Cấu trúc song hành (Parallelism)',
    description = 'Quy tắc đồng dạng giữa các thành phần nối bởi liên từ kết hợp (and, or, but)'
WHERE tag_code = 'parallel_structure';
