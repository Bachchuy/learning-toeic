/**
 * Script Nạp Ngân Hàng Đề Lớn (Batch Seeder)
 * - Tự động chạy Validator S3 - S6 cho từng câu hỏi
 * - Nạp trực tiếp vào Supabase (cả questions và question_answers)
 * - Đồng bộ tức thời cho học viên làm bài
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { EXTENDED_QUESTIONS_BANK } from "./batch-questions-bank";
import { runAutomatedValidator } from "../src/core/adminReview";

// 1. Đọc biến môi trường từ .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...values] = trimmed.split("=");
      process.env[key.trim()] = values.join("=").trim();
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ LỖI: Thiếu biến môi trường NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("🚀 Bắt đầu quá trình nạp lô đề lớn 64 câu hỏi chuyên sâu chuẩn ETS...");

  // 1. Lấy bảng map tag_code -> tag_id
  const { data: tags, error: tagErr } = await supabase
    .from("grammar_tags")
    .select("id, tag_code");

  if (tagErr || !tags) {
    console.error("❌ Không thể lấy danh sách grammar_tags:", tagErr?.message);
    process.exit(1);
  }

  const tagMap = new Map<string, number>();
  for (const t of tags) {
    tagMap.set(t.tag_code, t.id);
  }

  // 2. Chạy kiểm định tự động toàn bộ ngân hàng
  console.log(`🔍 Đang kiểm định chất lượng tự động (Validator S3–S6) cho ${EXTENDED_QUESTIONS_BANK.length} câu...`);

  let validCount = 0;
  for (let i = 0; i < EXTENDED_QUESTIONS_BANK.length; i++) {
    const q = EXTENDED_QUESTIONS_BANK[i];
    const report = runAutomatedValidator({
      stem: q.stem,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_index: q.correct_index,
      explanation: q.explanation,
    });

    if (!report.overallPass) {
      console.error(`❌ Câu hỏi #${i + 1} (${q.tag_code}) KHÔNG ĐẠT chuẩn:`);
      report.checks.filter(c => c.status === "fail").forEach(c => console.error(`   - [${c.id}] ${c.description}`));
      process.exit(1);
    }
    validCount++;
  }
  console.log(`✅ Toàn bộ ${validCount}/${EXTENDED_QUESTIONS_BANK.length} câu hỏi đạt chuẩn 100% chất lượng!`);

  // 3. Nạp vào database
  console.log(`📦 Đang nạp vào cơ sở dữ liệu Supabase...`);
  let successCount = 0;

  for (let i = 0; i < EXTENDED_QUESTIONS_BANK.length; i++) {
    const q = EXTENDED_QUESTIONS_BANK[i];
    const tagId = tagMap.get(q.tag_code);
    if (!tagId) {
      console.warn(`⚠️ Không tìm thấy tag_id cho ${q.tag_code}`);
      continue;
    }

    const contentHash = `ets_bank_q${(i + 1).toString().padStart(3, "0")}_${q.tag_code}`;

    // Kiểm tra xem câu hỏi đã tồn tại theo content_hash chưa
    const { data: existingQ } = await supabase
      .from("questions")
      .select("id")
      .eq("content_hash", contentHash)
      .maybeSingle();

    let questionId = existingQ?.id;

    if (!questionId) {
      // Thêm mới câu hỏi
      const { data: inserted, error: qErr } = await supabase
        .from("questions")
        .insert({
          stem: q.stem,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          tag_id: tagId,
          difficulty: q.difficulty,
          status: "published",
          content_hash: contentHash,
        })
        .select("id")
        .single();

      if (qErr || !inserted) {
        console.error(`❌ Lỗi insert question ${contentHash}:`, qErr?.message);
        continue;
      }
      questionId = inserted.id;
    } else {
      // Cập nhật câu hỏi nếu đã có
      await supabase
        .from("questions")
        .update({
          stem: q.stem,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          tag_id: tagId,
          difficulty: q.difficulty,
          status: "published",
        })
        .eq("id", questionId);
    }

    // Upsert đáp án và giải thích
    const { error: aErr } = await supabase
      .from("question_answers")
      .upsert(
        {
          question_id: questionId,
          correct_index: q.correct_index,
          explanation: q.explanation,
        },
        { onConflict: "question_id" }
      );

    if (aErr) {
      console.error(`❌ Lỗi upsert question_answers ${contentHash}:`, aErr.message);
      continue;
    }

    successCount++;
  }

  console.log(`\n🎉 HOÀN TẤT THÀNH CÔNG!`);
  console.log(`✅ Đã nạp thành công ${successCount}/${EXTENDED_QUESTIONS_BANK.length} câu hỏi mới vào ngân hàng đề.`);
}

main().catch((err) => {
  console.error("❌ Lỗi ngoại lệ khi nạp đề:", err);
  process.exit(1);
});
