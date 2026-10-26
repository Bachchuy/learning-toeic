/**
 * Ingestion Script: Full TOEIC Mock Exams & Reading Practice Banks
 *
 * 1. Nạp 4 bộ đề thi thử hoàn chỉnh (Full Mock Tests - 800 câu hỏi ETS Part 1-7)
 *    vào bảng `exam_sets` và `exam_set_answers`.
 * 2. Tuân thủ tuyệt đối bất biến bảo mật:
 *    - `exam_sets.content` KHÔNG chứa bất kỳ đáp án hay lời giải nào.
 *    - Toàn bộ đáp án đúng, bằng chứng dẫn chứng và giải thích được bảo vệ tại `exam_set_answers` (RLS Admin/Server only).
 * 3. Nạp ngân hàng bài đọc bổ trợ Part 6 & Part 7 từ N_reading_practice_new.json và G_reading_part6_7.json vào `passages` & `questions`.
 * 4. Tạo bản sao dự phòng offline JSON tại `src/data/mock-tests/`.
 */

import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// 1. Nạp biến môi trường
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...values] = trimmed.split('=');
      process.env[key.trim()] = values.join('=').trim();
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Lỗi: Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Hàm tạo UUID xác định (deterministic UUID v4-compliant) từ chuỗi
function toDeterministicUUID(namespace: string, id: string): string {
  const hash = crypto.createHash('md5').update(`${namespace}:${id}`).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

// Chuẩn hóa loại bài đọc cho check constraint của passages.passage_type
function normalizePassageType(docType: string): string {
  const dt = (docType || '').toLowerCase();
  if (dt.includes('email') || dt.includes('e-mail')) return 'email';
  if (dt.includes('memo')) return 'memo';
  if (dt.includes('notice')) return 'notice';
  if (dt.includes('article') || dt.includes('báo')) return 'article';
  if (dt.includes('advertisement') || dt.includes('ad') || dt.includes('quảng cáo')) return 'advertisement';
  if (dt.includes('letter') || dt.includes('thư')) return 'letter';
  if (dt.includes('form') || dt.includes('đơn')) return 'form';
  if (dt.includes('schedule') || dt.includes('lịch')) return 'schedule';
  if (dt.includes('chat') || dt.includes('tin nhắn')) return 'chat';
  return 'multi_passage';
}

const LETTERS = ['A', 'B', 'C', 'D'] as const;

async function ingestMockTests() {
  console.log('==================================================================');
  console.log('🚀 BẮT ĐẦU NẠP DỮ LIỆU ĐỀ THI MOCK EXAMS & BÀI ĐỌC ETS');
  console.log('==================================================================\n');

  // ============================================================================
  // PHẦN 1: Nạp 4 Bộ Đề Full Mock Tests (800 câu hỏi) từ O_mock_tests.json
  // ============================================================================
  console.log('📥 1. Đang tải dữ liệu O_mock_tests.json...');
  const mockRes = await fetch(
    'https://raw.githubusercontent.com/HuynhDucKhoi0105/English-ETS-TOEIC-web/main/data/O_mock_tests.json'
  );
  if (!mockRes.ok) {
    throw new Error(`Không thể tải O_mock_tests.json: HTTP ${mockRes.status}`);
  }
  const rawMockTests = (await mockRes.json()) as any[];
  console.log(`✅ Đã tải thành công ${rawMockTests.length} bộ đề thi thử.\n`);

  const mockTestsDir = path.resolve(process.cwd(), 'src/data/mock-tests');
  if (!fs.existsSync(mockTestsDir)) {
    fs.mkdirSync(mockTestsDir, { recursive: true });
  }

  const targetScores = [800, 850, 800, 900];
  const testDescriptions = [
    'Đề thi thử TOEIC 2024 Test 1 - Chuẩn format ETS với 200 câu hỏi Listening (Part 1-4) và Reading (Part 5-7). Phù hợp kiểm tra năng lực đầu vào và mục tiêu 650-800+.',
    'Đề thi thử TOEIC 2024 Test 2 - Độ khó nâng cao, tập trung bẫy từ vựng công sở Part 5 và bài đọc phức hợp Double/Triple Passage Part 7. Mục tiêu 800-850+.',
    'Đề thi thử TOEIC 2024 Test 3 - Cân bằng toàn diện giữa tốc độ nghe Part 3-4 và khả năng phân tích câu Part 6-7. Phù hợp rèn luyện sức bền phòng thi.',
    'Đề thi thử TOEIC 2024 Test 4 - Bộ đề phân loại cao cấp với các ngữ cảnh kinh doanh, logistics và hợp đồng thương mại quốc tế. Mục tiêu 850-900+.'
  ];

  for (let tIdx = 0; tIdx < rawMockTests.length; tIdx++) {
    const rawTest = rawMockTests[tIdx];
    const testNum = tIdx + 1;
    const slug = `ets-2024-full-test-${testNum}`;
    const title = `ETS TOEIC 2024 - Full Practice Test ${testNum}`;
    const targetScore = targetScores[tIdx] || 800;
    const description = testDescriptions[tIdx];

    console.log(`⚙️ Đang xử lý ${slug} (${title})...`);

    // Danh sách lưu câu hỏi cho content (KHÔNG CÓ ĐÁP ÁN)
    const sanitizedContent: any = {
      listening: {
        part1: [],
        part2: [],
        part3: [],
        part4: []
      },
      reading: {
        part5: [],
        part6: [],
        part7: []
      }
    };

    // Danh sách lưu đáp án cho exam_set_answers (BẢO MẬT)
    const answersToInsert: any[] = [];

    // --- Part 1 (6 câu) ---
    rawTest.L.p1.forEach((q: any, i: number) => {
      const qId = `t${testNum}_p1_${String(i + 1).padStart(2, '0')}`;
      sanitizedContent.listening.part1.push({
        id: qId,
        scene: q.scene,
        options: q.o,
        audioScript: q.scene
      });
      answersToInsert.push({
        question_id: qId,
        part: 1,
        correct_answer: LETTERS[q.a],
        correct_index: q.a,
        evidence: q.scene,
        explanation: q.e || '',
        explanation_vi: Array.isArray(q.tr) ? q.tr.join(' | ') : (q.tr || '')
      });
    });

    // --- Part 2 (25 câu: 7-31) ---
    rawTest.L.p2.forEach((q: any, i: number) => {
      const qNum = i + 7;
      const qId = `t${testNum}_p2_${String(qNum).padStart(2, '0')}`;
      sanitizedContent.listening.part2.push({
        id: qId,
        stem: q.q,
        options: q.o
      });
      answersToInsert.push({
        question_id: qId,
        part: 2,
        correct_answer: LETTERS[q.a],
        correct_index: q.a,
        evidence: q.q,
        explanation: q.e || '',
        explanation_vi: q.tr || ''
      });
    });

    // --- Part 3 (13 đoạn, 39 câu: 32-70) ---
    let p3QCounter = 32;
    rawTest.L.p3.forEach((conv: any, cIdx: number) => {
      const convId = `t${testNum}_p3_c${cIdx + 1}`;
      const convQuestions: any[] = [];

      conv.qs.forEach((q: any) => {
        const qId = `t${testNum}_p3_${p3QCounter}`;
        p3QCounter++;
        convQuestions.push({
          id: qId,
          stem: q.q,
          options: q.o
        });
        answersToInsert.push({
          question_id: qId,
          part: 3,
          correct_answer: LETTERS[q.a],
          correct_index: q.a,
          evidence: q.ev || '',
          explanation: q.e || '',
          explanation_vi: ''
        });
      });

      sanitizedContent.listening.part3.push({
        id: convId,
        lines: conv.lines.map((l: any) => ({ speaker: l.s, text: l.t })),
        questions: convQuestions
      });
    });

    // --- Part 4 (10 bài nói, 30 câu: 71-100) ---
    let p4QCounter = 71;
    rawTest.L.p4.forEach((talk: any, tIdxInner: number) => {
      const talkId = `t${testNum}_p4_t${tIdxInner + 1}`;
      const talkQuestions: any[] = [];

      talk.qs.forEach((q: any) => {
        const qId = `t${testNum}_p4_${p4QCounter}`;
        p4QCounter++;
        talkQuestions.push({
          id: qId,
          stem: q.q,
          options: q.o
        });
        answersToInsert.push({
          question_id: qId,
          part: 4,
          correct_answer: LETTERS[q.a],
          correct_index: q.a,
          evidence: q.ev || '',
          explanation: q.e || '',
          explanation_vi: ''
        });
      });

      sanitizedContent.listening.part4.push({
        id: talkId,
        type: talk.type,
        speaker: talk.s,
        script: talk.talk,
        questions: talkQuestions
      });
    });

    // --- Part 5 (30 câu: 101-130) ---
    rawTest.R.p5.forEach((q: any, i: number) => {
      const qNum = i + 101;
      const qId = `t${testNum}_p5_${qNum}`;
      sanitizedContent.reading.part5.push({
        id: qId,
        stem: q.q,
        options: q.o,
        grammarTag: q.t,
        difficulty: q.lv
      });
      answersToInsert.push({
        question_id: qId,
        part: 5,
        correct_answer: LETTERS[q.a],
        correct_index: q.a,
        evidence: q.q,
        explanation: q.e || '',
        explanation_vi: q.tr || ''
      });
    });

    // --- Part 6 (4 đoạn, 16 câu: 131-146) ---
    let p6QCounter = 131;
    rawTest.R.p6.forEach((p: any, pIdx: number) => {
      const passageId = `t${testNum}_p6_${pIdx + 1}`;
      const pQuestions: any[] = [];

      p.questions.forEach((q: any, qIdx: number) => {
        const qId = `t${testNum}_p6_${p6QCounter}`;
        p6QCounter++;
        pQuestions.push({
          id: qId,
          blank: qIdx + 1,
          stem: q.q,
          options: q.options,
          type: q.type
        });
        answersToInsert.push({
          question_id: qId,
          part: 6,
          correct_answer: LETTERS[q.answerIdx],
          correct_index: q.answerIdx,
          evidence: q.evidence || '',
          explanation: q.explain || '',
          explanation_vi: ''
        });
      });

      sanitizedContent.reading.part6.push({
        id: passageId,
        part: p.part || 'Part 6',
        docType: p.docType || 'Text',
        title: p.title || '',
        passage: p.passage || '',
        questions: pQuestions
      });
    });

    // --- Part 7 (15 đoạn, 54 câu: 147-200) ---
    let p7QCounter = 147;
    rawTest.R.p7.forEach((p: any, pIdx: number) => {
      const passageId = `t${testNum}_p7_${pIdx + 1}`;
      const pQuestions: any[] = [];

      p.questions.forEach((q: any) => {
        const qId = `t${testNum}_p7_${p7QCounter}`;
        p7QCounter++;
        pQuestions.push({
          id: qId,
          stem: q.q,
          options: q.options,
          type: q.type
        });
        answersToInsert.push({
          question_id: qId,
          part: 7,
          correct_answer: LETTERS[q.answerIdx],
          correct_index: q.answerIdx,
          evidence: q.evidence || '',
          explanation: q.explain || '',
          explanation_vi: ''
        });
      });

      sanitizedContent.reading.part7.push({
        id: passageId,
        part: p.part || 'Part 7',
        docType: p.docType || 'Reading Passage',
        title: p.title || '',
        passage: p.passage || '',
        questions: pQuestions
      });
    });

    const partsSummary = {
      part1: sanitizedContent.listening.part1.length,
      part2: sanitizedContent.listening.part2.length,
      part3: sanitizedContent.listening.part3.reduce((sum: number, c: any) => sum + c.questions.length, 0),
      part4: sanitizedContent.listening.part4.reduce((sum: number, t: any) => sum + t.questions.length, 0),
      part5: sanitizedContent.reading.part5.length,
      part6: sanitizedContent.reading.part6.reduce((sum: number, p: any) => sum + p.questions.length, 0),
      part7: sanitizedContent.reading.part7.reduce((sum: number, p: any) => sum + p.questions.length, 0),
      totalListening: 100,
      totalReading: 100,
      totalQuestions: 200
    };

    console.log(`   📊 Tổng câu hỏi: ${answersToInsert.length} câu (100 L + 100 R)`);

    // Upsert vào exam_sets
    const examSetPayload = {
      slug,
      title,
      description,
      exam_type: 'full_test',
      target_score: targetScore,
      duration_minutes: 120,
      total_questions: 200,
      parts_summary: partsSummary,
      content: sanitizedContent,
      status: 'published'
    };

    const { data: upsertedSet, error: setErr } = await supabase
      .from('exam_sets')
      .upsert(examSetPayload, { onConflict: 'slug' })
      .select('id')
      .single();

    if (setErr || !upsertedSet) {
      console.error(`❌ Lỗi upsert exam_set ${slug}:`, setErr);
      continue;
    }

    const examSetId = upsertedSet.id;
    console.log(`   💾 Đã lưu exam_sets (ID: ${examSetId})`);

    // Xóa đáp án cũ nếu có rồi nạp mới
    await supabase.from('exam_set_answers').delete().eq('exam_set_id', examSetId);

    const fullAnswers = answersToInsert.map(a => ({
      ...a,
      exam_set_id: examSetId
    }));

    // Insert batch 50 câu mỗi lần
    for (let b = 0; b < fullAnswers.length; b += 50) {
      const batch = fullAnswers.slice(b, b + 50);
      const { error: ansErr } = await supabase.from('exam_set_answers').insert(batch);
      if (ansErr) {
        console.error(`❌ Lỗi insert exam_set_answers batch ${b}:`, ansErr);
      }
    }
    console.log(`   🔒 Đã lưu 200 đáp án bảo mật vào exam_set_answers`);

    // Lưu file JSON dự phòng offline
    const localFilePath = path.join(mockTestsDir, `ets-test-${testNum}.json`);
    fs.writeFileSync(
      localFilePath,
      JSON.stringify(
        {
          id: examSetId,
          slug,
          title,
          description,
          exam_type: 'full_test',
          target_score: targetScore,
          duration_minutes: 120,
          total_questions: 200,
          parts_summary: partsSummary,
          content: sanitizedContent
        },
        null,
        2
      ),
      'utf-8'
    );
    console.log(`   📁 Đã ghi bản sao offline: src/data/mock-tests/ets-test-${testNum}.json\n`);
  }

  // ============================================================================
  // PHẦN 2: Nạp Bài Đọc Luyện Thêm (Part 6 & Part 7) vào `passages` & `questions`
  // ============================================================================
  console.log('------------------------------------------------------------------');
  console.log('📥 2. Nạp ngân hàng bài đọc bổ trợ từ N_reading_practice_new.json...');
  const nRes = await fetch(
    'https://raw.githubusercontent.com/HuynhDucKhoi0105/English-ETS-TOEIC-web/main/data/N_reading_practice_new.json'
  );
  if (nRes.ok) {
    const nPassages = (await nRes.json()) as any[];
    console.log(`   Đã tải ${nPassages.length} bài đọc luyện tập mới.`);
    await ingestSupplementaryPassages(nPassages, 'supplementary-n');
  }

  console.log('------------------------------------------------------------------');
  console.log('📥 3. Nạp ngân hàng bài đọc từ G_reading_part6_7.json...');
  const gRes = await fetch(
    'https://raw.githubusercontent.com/HuynhDucKhoi0105/English-ETS-TOEIC-web/main/data/G_reading_part6_7.json'
  );
  if (gRes.ok) {
    const gData = (await gRes.json()) as any;
    const gPassages = gData.items || [];
    console.log(`   Đã tải ${gPassages.length} bài đọc Part 6 & 7 bổ sung.`);
    await ingestSupplementaryPassages(gPassages, 'supplementary-g');
  }

  // ============================================================================
  // PHẦN 3: Tạo file Index cho Offline Mock Tests
  // ============================================================================
  createMockTestsIndexFile(mockTestsDir);

  console.log('\n==================================================================');
  console.log('🎉 TOÀN BỘ DỮ LIỆU ĐỀ THI VÀ BÀI ĐỌC ĐÃ ĐƯỢC NẠP THÀNH CÔNG!');
  console.log('==================================================================');
}

async function ingestSupplementaryPassages(passagesList: any[], namespace: string) {
  let passageSuccess = 0;
  let questionSuccess = 0;

  for (const p of passagesList) {
    const rawId = p.id || String(Math.random());
    const passageUuid = toDeterministicUUID(namespace, rawId);
    const partNum = p.part && p.part.includes('6') ? 6 : 7;
    const passageType = normalizePassageType(p.docType);

    // 1. Insert/Upsert passage
    const { error: pErr } = await supabase.from('passages').upsert({
      id: passageUuid,
      part: partNum,
      passage_type: passageType,
      title: p.title || `Reading Passage (${p.docType || 'TOEIC'})`,
      context_info: { docType: p.docType, part: p.part },
      content: p.passage || '',
      content_blocks: [],
      status: 'published'
    }, { onConflict: 'id' });

    if (pErr) {
      console.warn(`   ⚠️ Lỗi lưu passage ${rawId}:`, pErr.message);
      continue;
    }
    passageSuccess++;

    // 2. Insert questions
    const qs = p.questions || [];
    for (let qIdx = 0; qIdx < qs.length; qIdx++) {
      const q = qs[qIdx];
      const qUuid = toDeterministicUUID(`${namespace}-q`, `${rawId}-${qIdx}`);
      const options = q.options || [];
      if (options.length < 4) continue;

      const answerIdx = typeof q.answerIdx === 'number' ? q.answerIdx : (q.answer ? LETTERS.indexOf(q.answer) : 0);
      const safeAnswerIdx = answerIdx >= 0 && answerIdx <= 3 ? answerIdx : 0;

      const stem = q.q || `[${qIdx + 1}] Choose the correct option:`;
      const contentHash = crypto
        .createHash('sha256')
        .update(`${stem}-${options.join('-')}`)
        .digest('hex');

      const { error: qErr } = await supabase.from('questions').upsert(
        {
          id: qUuid,
          part: partNum,
          passage_id: passageUuid,
          order_in_passage: qIdx + 1,
          question_sub_type: q.type || (partNum === 6 ? 'chèn câu' : 'chi tiết'),
          stem: stem,
          option_a: options[0],
          option_b: options[1],
          option_c: options[2],
          option_d: options[3],
          content_hash: contentHash,
          difficulty: 2,
          status: 'published'
        },
        { onConflict: 'id' }
      );

      if (qErr) {
        console.warn(`   ⚠️ Lỗi lưu question ${qUuid}:`, qErr.message);
        continue;
      }

      // 3. Insert question_answers
      const { error: ansErr } = await supabase.from('question_answers').upsert({
        question_id: qUuid,
        correct_index: safeAnswerIdx,
        explanation: q.explain || q.evidence || 'Đáp án chính xác theo ngữ cảnh bài đọc.'
      }, { onConflict: 'question_id' });

      if (!ansErr) {
        questionSuccess++;
      }
    }
  }

  console.log(`   ✅ Đã nạp ${passageSuccess} bài đọc và ${questionSuccess} câu hỏi vào passages/questions.`);
}

function createMockTestsIndexFile(dir: string) {
  const indexContent = `/**
 * Mock Tests Index & Metadata
 * Tự động đồng bộ hóa với cơ sở dữ liệu Supabase exam_sets.
 */

import etsTest1 from './ets-test-1.json';
import etsTest2 from './ets-test-2.json';
import etsTest3 from './ets-test-3.json';
import etsTest4 from './ets-test-4.json';
import type { ExamSet } from '@/types/exam';

export const MOCK_TESTS: ExamSet[] = [
  etsTest1 as unknown as ExamSet,
  etsTest2 as unknown as ExamSet,
  etsTest3 as unknown as ExamSet,
  etsTest4 as unknown as ExamSet,
];

export function getMockTestBySlug(slug: string): ExamSet | undefined {
  return MOCK_TESTS.find((test) => test.slug === slug);
}

export function getAllMockTestsMeta() {
  return MOCK_TESTS.map((t) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    description: t.description,
    exam_type: t.exam_type,
    target_score: t.target_score,
    duration_minutes: t.duration_minutes,
    total_questions: t.total_questions,
    parts_summary: t.parts_summary,
  }));
}
`;
  fs.writeFileSync(path.join(dir, 'index.ts'), indexContent, 'utf-8');
  console.log(`📁 Đã tạo file: src/data/mock-tests/index.ts`);
}

ingestMockTests().catch((err) => {
  console.error('❌ Thất bại:', err);
  process.exit(1);
});
