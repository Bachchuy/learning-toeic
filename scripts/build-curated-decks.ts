/**
 * Script Xây dựng & Nạp 2 Bộ Thẻ TOEIC Chuẩn:
 * 1. Thành Ngữ TOEIC Phổ Biến (114 Thành ngữ / Phrasal Verbs)
 * 2. Từ Vựng ETS TOEIC (1.725 Từ vựng thực chiến chuẩn ETS)
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { IDIOMS_114 } from "./generate-curated-decks-full";
import type { CuratedVocabItem } from "../src/data/curated-decks";

// 1. Đọc biến môi trường
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface RawETSVocab {
  id: string;
  w: string;
  pos: string;
  vi: string;
  ex: string;
  tag: string;
  ipa: string;
  exvi: string;
  syn?: string;
  col?: string;
  top?: string;
  lv?: number;
}

async function run() {
  console.log("=== BẮT ĐẦU XÂY DỰNG 2 BỘ THẺ TOEIC CHUẨN ===");

  // --------------------------------------------------------------------------
  // BƯỚC 1: XUẤT BẢN FILE JSON 114 THÀNH NGỮ
  // --------------------------------------------------------------------------
  const idiomsPath = path.resolve(
    process.cwd(),
    "src/data/curated-decks/common-toeic-idioms.json"
  );
  fs.writeFileSync(idiomsPath, JSON.stringify(IDIOMS_114, null, 2), "utf-8");
  console.log(`✅ Đã xuất bản: ${idiomsPath} (${IDIOMS_114.length} thành ngữ).`);

  // --------------------------------------------------------------------------
  // BƯỚC 2: TẢI & XUẤT BẢN FILE JSON 1.725 TỪ VỰNG ETS TOEIC
  // --------------------------------------------------------------------------
  console.log("\n📦 Đang tải dữ liệu từ vựng ETS TOEIC từ repo nguồn...");
  const rawETSRes = await fetch(
    "https://raw.githubusercontent.com/HuynhDucKhoi0105/English-ETS-TOEIC-web/main/data/I_toeic_vocab_new.json"
  );
  if (!rawETSRes.ok) {
    throw new Error(`Lỗi tải dữ liệu ETS: ${rawETSRes.statusText}`);
  }
  const rawETSVocab: RawETSVocab[] = await rawETSRes.json();
  console.log(`- Đã tải ${rawETSVocab.length} từ vựng ETS thô.`);

  // Chuẩn hóa định dạng CuratedVocabItem
  const etsCuratedList = rawETSVocab.map((item) => ({
    word: item.w.trim(),
    part_of_speech: item.pos || "word",
    meaning: item.vi.trim(),
    phonetic: item.ipa ? (item.ipa.startsWith("/") ? item.ipa : `/${item.ipa}/`) : "",
    explanation: item.col
      ? `Cụm từ: ${item.col}`
      : item.syn
      ? `Từ đồng nghĩa: ${item.syn}`
      : "Từ vựng trọng tâm bài thi ETS TOEIC",
    example: item.ex.trim(),
    example_translation: item.exvi.trim(),
    topic: item.top ? item.top.trim() : "ETS Business Core",
  }));

  const etsPath = path.resolve(
    process.cwd(),
    "src/data/curated-decks/ets-part5-vocab.json"
  );
  fs.writeFileSync(etsPath, JSON.stringify(etsCuratedList, null, 2), "utf-8");
  console.log(`✅ Đã xuất bản: ${etsPath} (${etsCuratedList.length} từ vựng ETS).`);

  // --------------------------------------------------------------------------
  // BƯỚC 3: CẬP NHẬT METADATA INDEX
  // --------------------------------------------------------------------------
  const indexPath = path.resolve(process.cwd(), "src/data/curated-decks/index.ts");
  const indexContent = `import essential600 from "./essential-600-words.json";
import etsPart5 from "./ets-part5-vocab.json";
import commonIdioms from "./common-toeic-idioms.json";
import itVocab from "./it-vocab.json";

export interface CuratedDeckItem {
  word: string;
  part_of_speech: string;
  meaning: string;
  phonetic: string;
  explanation: string;
  example: string;
  example_translation: string;
  topic: string;
}

export interface CuratedDeck {
  id: string;
  name: string;
  description: string;
  totalWords: number;
  badge: string;
  themeColor: string;
  icon: string;
  items: CuratedDeckItem[];
}

export const CURATED_DECKS: CuratedDeck[] = [
  {
    id: "essential-600-words",
    name: "600 Từ vựng thiết yếu TOEIC",
    description:
      "Bộ 50 chủ điểm kinh điển Barron's 600 Essential Words cho kỳ thi TOEIC.",
    totalWords: essential600.length,
    badge: "Kinh điển",
    themeColor: "from-blue-600 to-indigo-700",
    icon: "BookOpen",
    items: essential600 as CuratedDeckItem[],
  },
  {
    id: "ets-part5-vocab",
    name: "Từ vựng ETS TOEIC",
    description:
      "Kho 1.700+ từ vựng then chốt xuất hiện liên tục trong đề thi ETS các năm.",
    totalWords: etsPart5.length,
    badge: "Đề thi thật",
    themeColor: "from-emerald-600 to-teal-700",
    icon: "Target",
    items: etsPart5 as CuratedDeckItem[],
  },
  {
    id: "common-toeic-idioms",
    name: "Thành Ngữ TOEIC Phổ Biến",
    description:
      "114 thành ngữ và cụm động từ công sở điểm 800+ xuất hiện trong Part 3, 4, 7.",
    totalWords: commonIdioms.length,
    badge: "Mục tiêu 800+",
    themeColor: "from-amber-500 to-orange-600",
    icon: "Sparkles",
    items: commonIdioms as CuratedDeckItem[],
  },
  {
    id: "it-vocab",
    name: "Từ vựng Tiếng Anh Chuyên ngành IT",
    description:
      "Bộ hơn 770 thuật ngữ công nghệ, phát triển phần mềm, DevOps và Cloud.",
    totalWords: itVocab.length,
    badge: "Chuyên ngành",
    themeColor: "from-violet-600 to-purple-700",
    icon: "Laptop",
    items: itVocab as CuratedDeckItem[],
  },
];
`;
  fs.writeFileSync(indexPath, indexContent, "utf-8");
  console.log(`✅ Đã cập nhật metadata: ${indexPath}`);

  // --------------------------------------------------------------------------
  // BƯỚC 4: NẠP VÀO DATABASE CHO USER
  // --------------------------------------------------------------------------
  console.log("\n🚀 Đang nạp vào cơ sở dữ liệu Supabase cho người dùng...");
  const { data: users, error: uErr } = await supabase.auth.admin.listUsers();
  if (uErr || !users.users || users.users.length === 0) {
    console.error("❌ Không lấy được danh sách user:", uErr);
    return;
  }

  const user = users.users[0];
  console.log(`- Đang xử lý cho tài khoản: ${user.email} (ID: ${user.id})`);

  // Hàm hỗ trợ nạp deck
  async function seedDeckForUser(
    deckName: string,
    description: string,
    items: CuratedVocabItem[]
  ) {
    // 1. Tạo hoặc lấy Notebook
    let notebookId: string;
    const { data: existingNb } = await supabase
      .from("notebooks")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", deckName)
      .maybeSingle();

    if (existingNb) {
      notebookId = existingNb.id;
      console.log(`  * Đã có sổ '${deckName}': ${notebookId}`);
    } else {
      const { data: newNb, error: nbErr } = await supabase
        .from("notebooks")
        .insert({
          user_id: user.id,
          name: deckName,
          description,
        })
        .select("id")
        .single();

      if (nbErr || !newNb) {
        console.error(`  ❌ Lỗi tạo notebook '${deckName}':`, nbErr);
        return;
      }
      notebookId = newNb.id;
      console.log(`  * Đã tạo mới sổ '${deckName}': ${notebookId}`);
    }

    // 2. Chuẩn bị mảng vocab_entries
    const seenLemmas = new Set<string>();
    const vocabRows = [];

    for (const item of items) {
      const lemma = item.word.toLowerCase().trim();
      if (seenLemmas.has(lemma)) continue;
      seenLemmas.add(lemma);

      vocabRows.push({
        user_id: user.id,
        notebook_id: notebookId,
        word: item.word.trim(),
        lemma,
        meaning: item.meaning.trim(),
        part_of_speech: item.part_of_speech || "word",
        phonetic: item.phonetic || null,
        context_sentence: item.example.trim(),
        context_translation: item.example_translation
          ? item.example_translation.trim()
          : null,
        metadata: {
          topic: item.topic,
          explanation: item.explanation,
        },
      });
    }

    // Upsert theo lô 100 từ
    let inserted = 0;
    const BATCH_SIZE = 100;
    for (let i = 0; i < vocabRows.length; i += BATCH_SIZE) {
      const chunk = vocabRows.slice(i, i + BATCH_SIZE);
      const { error: insErr } = await supabase
        .from("vocab_entries")
        .upsert(chunk, {
          onConflict: "user_id,lemma",
          ignoreDuplicates: true,
        });

      if (insErr) {
        console.error(`  ❌ Lỗi chèn lô ${i}:`, insErr);
      } else {
        inserted += chunk.length;
      }
      process.stdout.write(`\r  Tiến độ: ${inserted}/${vocabRows.length} từ...`);
    }

    console.log(`\n  🎉 Hoàn tất sổ '${deckName}': ${inserted} từ vựng.`);
  }

  // Nạp bộ 114 Thành ngữ
  console.log("\n--- Nạp Sổ 1: Thành Ngữ TOEIC Phổ Biến (114 từ) ---");
  await seedDeckForUser(
    "Thành Ngữ TOEIC Phổ Biến",
    "114 thành ngữ và cụm động từ công sở điểm 800+ xuất hiện trong Part 3, 4, 7.",
    IDIOMS_114
  );

  // Nạp bộ 1.725 Từ vựng ETS
  console.log("\n--- Nạp Sổ 2: Từ vựng ETS TOEIC (1.725 từ) ---");
  await seedDeckForUser(
    "Từ vựng ETS TOEIC",
    "Kho 1.700+ từ vựng then chốt xuất hiện liên tục trong đề thi ETS các năm.",
    etsCuratedList
  );

  // Thống kê tổng số từ vựng trong sổ của user
  const { count: totalUserVocab } = await supabase
    .from("vocab_entries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  console.log(`\n========================================================`);
  console.log(`🎉 TỔNG KHO TỪ VỰNG TRONG SỔ CỦA USER HIỆN TẠI: ${totalUserVocab} TỪ!`);
  console.log(`========================================================`);
}

run().catch((err) => {
  console.error("Lỗi:", err);
  process.exit(1);
});
