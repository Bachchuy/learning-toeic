/**
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
