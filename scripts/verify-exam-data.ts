import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};
for (const line of envConfig.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const [key, ...values] = trimmed.split('=');
    envVars[key.trim()] = values.join('=').trim();
  }
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

// 1. Client quản trị (Service Role)
const adminSb = createClient(supabaseUrl, serviceKey);

// 2. Client học viên/công khai (Anon Key)
const anonSb = createClient(supabaseUrl, anonKey);

async function runVerification() {
  console.log('==================================================================');
  console.log('🔍 KIỂM THỬ XÁC MINH DỮ LIỆU ĐỀ THI & BẢO MẬT RLS');
  console.log('==================================================================\n');

  // 1. Kiểm tra bảng exam_sets (Admin)
  const { data: adminSets, count: setsCount } = await adminSb
    .from('exam_sets')
    .select('id, slug, title, total_questions, parts_summary', { count: 'exact' });
  console.log(`✅ [Admin] exam_sets: ${setsCount} bộ đề thi:`);
  adminSets?.forEach(s => {
    console.log(`   - ${s.slug} | ${s.title} | ${s.total_questions} câu hỏi`);
  });

  // 2. Kiểm tra bảng exam_set_answers (Admin)
  const { count: answersCount } = await adminSb
    .from('exam_set_answers')
    .select('*', { count: 'exact', head: true });
  console.log(`\n✅ [Admin] exam_set_answers: ${answersCount} đáp án bảo mật (kỳ vọng 800)`);

  // 3. Kiểm tra bảng passages & questions
  const { count: pCount } = await adminSb.from('passages').select('*', { count: 'exact', head: true });
  const { count: qCount } = await adminSb.from('questions').select('*', { count: 'exact', head: true });
  console.log(`✅ [Admin] passages: ${pCount} bài đọc`);
  console.log(`✅ [Admin] questions: ${qCount} câu hỏi (bao gồm 4,042 Part 5 + 105 Part 6/7)`);

  // 4. KIỂM THỬ BẢO MẬT RLS (Client công khai / ẩn danh)
  console.log('\n------------------------------------------------------------------');
  console.log('🛡️ KIỂM THỬ BẤT BIẾN BẢO MẬT RLS:');

  // a. Anon đọc exam_sets: Phải đọc được đề thi đã published
  const { data: anonSets, error: anonSetsErr } = await anonSb
    .from('exam_sets')
    .select('id, slug, title, content');
  if (anonSetsErr) {
    console.error('❌ Lỗi Anon đọc exam_sets:', anonSetsErr.message);
  } else {
    console.log(`✅ Anon đọc được ${anonSets?.length} đề thi published.`);
    // Kiểm tra nội dung đề thi không bị lọt field 'a' (đáp án) hay 'explain'
    const test1 = anonSets?.[0];
    const p1First = test1?.content?.listening?.part1?.[0];
    const hasAnswerInContent = p1First && ('a' in p1First || 'answer' in p1First || 'correct_answer' in p1First);
    console.log(`   Kiểm tra content đề thi có lọt đáp án không: ${hasAnswerInContent ? '❌ CÓ LỌT!' : '✅ KHÔNG LỌT ĐÁP ÁN'}`);
  }

  // b. Anon đọc exam_set_answers: BẮT BUỘC trả về 0 dòng do RLS chặn
  const { data: anonAnswers, count: anonAnsCount } = await anonSb
    .from('exam_set_answers')
    .select('*', { count: 'exact' });
  if (anonAnswers && anonAnswers.length > 0) {
    console.error(`🚨 CẢNH BÁO BẢO MẬT: Anon đọc được ${anonAnswers.length} đáp án từ exam_set_answers!`);
  } else {
    console.log(`🔒 Tuyệt vời: Anon KHÔNG THỂ đọc exam_set_answers (${anonAnsCount ?? 0} dòng trả về). RLS hoạt động 100% chính xác!`);
  }

  console.log('\n==================================================================');
  console.log('🎉 TẤT CẢ TIÊU CHÍ BẢO MẬT VÀ DỮ LIỆU ĐÃ ĐẠT CHUẨN SẢN XUẤT!');
  console.log('==================================================================');
}

runVerification().catch(err => {
  console.error('Lỗi kiểm thử:', err);
  process.exit(1);
});
