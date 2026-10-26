/**
 * Script Seeding: Nạp các bộ thẻ từ vựng TOEIC chuẩn (Curated Decks)
 * Hỗ trợ nạp bộ 600 từ vựng thiết yếu, ETS TOEIC, và Thành ngữ vào tài khoản người dùng
 * 
 * CÁCH DÙNG:
 *   npx tsx scripts/seed-curated-decks.ts
 *   npx tsx scripts/seed-curated-decks.ts --deck=essential-600 --email=user@example.com
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { CURATED_DECKS, getCuratedDeckById } from "../src/data/curated-decks";

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
  console.error("❌ LỖI: Thiếu biến môi trường NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function normalizeLemma(rawWord: string): string {
  if (!rawWord) return "";
  return rawWord.trim().toLowerCase().replace(/^(to|a|an|the)\s+/, "").trim();
}

async function main() {
  const args = process.argv.slice(2);
  const emailArg = args.find((a) => a.startsWith("--email="))?.split("=")[1];
  const deckArg = args.find((a) => a.startsWith("--deck="))?.split("=")[1] || "essential-600";

  console.log("=================================================");
  console.log("🚀 BẮT ĐẦU SEED BỘ THẺ TỪ VỰNG CHUẨN TOEIC AI");
  console.log("=================================================");

  // 1. Tìm user đích
  let targetUserId: string | null = null;
  if (emailArg) {
    const { data: userData, error: userErr } = await supabase.auth.admin.listUsers();
    if (userErr || !userData) {
      console.error("❌ Không thể lấy danh sách users:", userErr);
      process.exit(1);
    }
    const found = userData.users.find((u) => u.email === emailArg);
    if (!found) {
      console.error(`❌ Không tìm thấy user với email: ${emailArg}`);
      process.exit(1);
    }
    targetUserId = found.id;
    console.log(`👤 Đích đến: ${found.email} (${targetUserId})`);
  } else {
    // Lấy user đầu tiên trong DB
    const { data: userData } = await supabase.auth.admin.listUsers();
    if (!userData || userData.users.length === 0) {
      console.error("❌ Chưa có người dùng nào trong Auth. Hãy đăng ký tài khoản trên web trước.");
      process.exit(1);
    }
    targetUserId = userData.users[0].id;
    console.log(`👤 Mặc định gán cho user đầu tiên: ${userData.users[0].email} (${targetUserId})`);
  }

  // 2. Lấy bộ thẻ
  const deck = getCuratedDeckById(deckArg);
  if (!deck) {
    console.error(`❌ Không tìm thấy bộ thẻ với ID: ${deckArg}. Các bộ thẻ khả dụng: ${CURATED_DECKS.map(d => d.id).join(", ")}`);
    process.exit(1);
  }

  console.log(`📦 Đang chuẩn bị nạp bộ thẻ: "${deck.title}" (${deck.items.length} thẻ)...`);

  // 3. Tìm hoặc tạo notebook
  const { data: existingNotebooks } = await supabase
    .from("notebooks")
    .select("id")
    .eq("user_id", targetUserId)
    .eq("name", deck.title);

  let notebookId = existingNotebooks?.[0]?.id;
  if (!notebookId) {
    const { data: newNotebook, error: nbError } = await supabase
      .from("notebooks")
      .insert({
        user_id: targetUserId,
        name: deck.title,
        description: deck.description,
        color: deck.color,
        icon: deck.icon,
      })
      .select("id")
      .single();

    if (nbError || !newNotebook) {
      console.error("❌ Không thể tạo sổ từ vựng:", nbError);
      process.exit(1);
    }
    notebookId = newNotebook.id;
    console.log(`📁 Đã tạo sổ từ mới: "${deck.title}" (ID: ${notebookId})`);
  } else {
    console.log(`📁 Đã tìm thấy sổ từ có sẵn: "${deck.title}" (ID: ${notebookId})`);
  }

  // 4. Lọc và chuẩn hóa danh sách từ cần nạp (Deduplicate lemma trong chính bộ thẻ và so với sổ người dùng)
  const { data: existingEntries } = await supabase
    .from("vocab_entries")
    .select("lemma")
    .eq("user_id", targetUserId);

  const existingLemmas = new Set(
    (existingEntries || []).map((e: { lemma: string }) => e.lemma)
  );

  const seenLemmas = new Set(existingLemmas);
  const itemsToInsert: typeof deck.items = [];

  for (const item of deck.items) {
    const lemma = normalizeLemma(item.word);
    if (!lemma) continue;
    if (seenLemmas.has(lemma)) {
      const existingIdx = itemsToInsert.findIndex(
        (i) => normalizeLemma(i.word) === lemma
      );
      if (existingIdx >= 0) {
        itemsToInsert[existingIdx] = {
          ...itemsToInsert[existingIdx],
          meaning: `${itemsToInsert[existingIdx].meaning}; ${item.meaning}`,
        };
      }
      continue;
    }
    seenLemmas.add(lemma);
    itemsToInsert.push({ ...item });
  }

  console.log(`🔍 Thống kê: ${deck.items.length} thẻ gốc | ${existingLemmas.size} từ đã có | ${itemsToInsert.length} từ độc bản cần nạp`);

  if (itemsToInsert.length === 0) {
    console.log("✅ Tất cả từ vựng trong bộ thẻ này đã có sẵn trong sổ từ của bạn.");
    return;
  }

  // 5. Batch insert theo chunk 50
  const CHUNK_SIZE = 50;
  let totalInserted = 0;

  for (let i = 0; i < itemsToInsert.length; i += CHUNK_SIZE) {
    const chunk = itemsToInsert.slice(i, i + CHUNK_SIZE);
    const rows = chunk.map((item) => ({
      user_id: targetUserId,
      word: item.word.trim(),
      lemma: normalizeLemma(item.word),
      meaning: item.meaning.trim(),
      context_sentence: item.example ? item.example.trim() : "",
      part_of_speech: item.part_of_speech || "",
      phonetic: item.phonetic || "",
      context_translation: item.example_translation ? item.example_translation.trim() : "",
      metadata: {
        topic: item.topic,
        detailed_explanation: item.explanation,
        image_url: item.image_url,
        audio_url: item.audio_url,
      },
      notebook_id: notebookId,
    }));

    const { error: insertError } = await supabase
      .from("vocab_entries")
      .upsert(rows, { onConflict: "user_id,lemma", ignoreDuplicates: true });

    if (insertError) {
      console.error(`❌ Lỗi batch ${i / CHUNK_SIZE + 1}:`, insertError.message);
    } else {
      totalInserted += rows.length;
      process.stdout.write(`⏳ Tiến độ: ${totalInserted}/${itemsToInsert.length} thẻ...\r`);
    }
  }

  console.log(`\n🎉 HOÀN THÀNH: Đã nạp thành công ${totalInserted} thẻ vào sổ "${deck.title}"!`);
  console.log("⚡ Các thẻ FSRS tương ứng trong bảng review_cards đã được kích hoạt tự động qua Trigger.");
  console.log("👉 Bạn có thể vào màn hình /vocab hoặc /review để bắt đầu học ngay.");
}

main().catch(console.error);
