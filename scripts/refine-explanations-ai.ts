/**
 * Script tự động tinh chỉnh và chuẩn hóa lời giải sư phạm TOEIC TOÀN DIỆN (Part 1 -> Part 7) bằng Gemini AI.
 *
 * Phạm vi hỗ trợ:
 * - Part 6 & Part 7 Reading (`questions` + `passages` -> `question_answers`)
 * - Part 5 Practice (`questions` -> `question_answers`, chi tiết 5 nhóm tình huống & chống sáo rỗng)
 * - Đề thi thử Mock Exam (`exam_sets` + `exam_set_answers` cho cả Listening Part 1–4 & Reading Part 5–7)
 *
 * Cách chạy:
 *   npx tsx scripts/refine-explanations-ai.ts
 *   npx tsx scripts/refine-explanations-ai.ts --part=all --limit=200
 *   npx tsx scripts/refine-explanations-ai.ts --part=exam --limit=50 --dry-run
 *   TARGET_PART=6 LIMIT=50 npx tsx scripts/refine-explanations-ai.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { flattenListeningContent } from "../src/core/examListening";
import {
  buildExamRefinementPrompt,
  buildPart5RefinementPrompt,
  buildPart6RefinementPrompt,
  buildPart7RefinementPrompt,
  getExamGeminiResponseSchema,
  isExamAnswerNeedsRefinement,
  isGenericExplanationText,
  isPart5ExplanationNeedsRefinement,
  isReadingExplanationNeedsRefinement,
  PART5_GEMINI_RESPONSE_SCHEMA,
  READING_GEMINI_RESPONSE_SCHEMA,
} from "../src/core/explanationQuality";

// 1. Nạp biến môi trường từ .env.local (chỉ điền biến chưa có để không ghi đè GitHub Secrets)
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...values] = trimmed.split("=");
      const k = key.trim();
      if (!process.env[k]) {
        process.env[k] = values.join("=").trim();
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Lỗi: Thiếu thông tin kết nối Supabase:");
  console.error(`   - NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "Đã có" : "THIẾU"}`);
  console.error(`   - SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? "Đã có" : "THIẾU"}`);
  process.exit(1);
}

if (!geminiApiKey) {
  console.error("❌ Lỗi: Thiếu GEMINI_API_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface ModelInfo {
  name: string;
  rpmLimit: number;
  minDelayMs: number;
  dailyLimit: number;
}

const minRequestDelayMs = Math.max(
  4000,
  parseInt(process.env.REQUEST_DELAY_MS || "6500", 10) || 6500
);

const MODEL_POOLS: ModelInfo[] = [
  // Tier 1: 500 RPD / 15 RPM
  { name: "gemini-3.1-flash-lite", rpmLimit: 15, minDelayMs: Math.max(minRequestDelayMs, 6500), dailyLimit: 500 },
  { name: "gemini-3.5-flash-lite", rpmLimit: 15, minDelayMs: Math.max(minRequestDelayMs, 6500), dailyLimit: 500 },
  { name: "gemini-flash-lite-latest", rpmLimit: 15, minDelayMs: Math.max(minRequestDelayMs, 6500), dailyLimit: 500 },

  // Tier 2: 20 RPD / 5 RPM
  { name: "gemini-3.6-flash", rpmLimit: 5, minDelayMs: Math.max(minRequestDelayMs, 14000), dailyLimit: 20 },
  { name: "gemini-3.5-flash", rpmLimit: 5, minDelayMs: Math.max(minRequestDelayMs, 14000), dailyLimit: 20 },
  { name: "gemini-3-flash-preview", rpmLimit: 5, minDelayMs: Math.max(minRequestDelayMs, 14000), dailyLimit: 20 },
];

const exhaustedDailyModels = new Set<string>();

async function callGeminiWithRetry(
  prompt: string,
  responseSchema: Record<string, unknown>,
  maxRetries = 2
): Promise<{ text: string; delayMs: number; modelUsed: string }> {
  let lastError: unknown = null;

  for (const model of MODEL_POOLS) {
    if (exhaustedDailyModels.has(model.name)) {
      continue;
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:generateContent?key=${geminiApiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema,
              temperature: 0.2,
            },
          }),
          signal: AbortSignal.timeout(30000),
        });

        if (res.ok) {
          const json = await res.json();
          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return { text, delayMs: model.minDelayMs, modelUsed: model.name };
          }
        }

        const errText = await res.text();

        if (res.status === 429) {
          const errLower = errText.toLowerCase();
          const isDailyQuota =
            errLower.includes("perday") ||
            errLower.includes("per_day") ||
            errLower.includes("requests per day") ||
            errLower.includes("daily limit");

          if (isDailyQuota) {
            console.log(
              `      🛑 Model [${model.name}] đã hết hạn ngạch ngày (${model.dailyLimit} RPD). Đổi sang model tiếp theo trong pool...`
            );
            exhaustedDailyModels.add(model.name);
            break;
          }

          const retryMatch = errText.match(/retry\s+in\s+(\d+(?:\.\d+)?)s/i);
          const hintedSec = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) + 2 : 0;
          const waitSec = Math.min(90, Math.max(attempt * 15, hintedSec));
          console.log(
            `      ⏳ Giới hạn tốc độ RPM trên [${model.name}]. Chờ ${waitSec}s rồi thử lại lần ${attempt}/${maxRetries}...`
          );
          await new Promise((r) => setTimeout(r, waitSec * 1000));
          continue;
        }

        if (res.status === 503) {
          const waitSec = attempt * 3;
          console.log(
            `      ⏳ Máy chủ 503 High Demand trên [${model.name}]. Chờ ${waitSec}s thử lại lần ${attempt}/${maxRetries}...`
          );
          await new Promise((r) => setTimeout(r, waitSec * 1000));
          continue;
        }

        throw new Error(`Gemini API HTTP ${res.status}: ${errText}`);
      } catch (err: unknown) {
        lastError = err;
        if (attempt < maxRetries) {
          const waitSec = attempt * 2;
          const msg = err instanceof Error ? err.message : String(err);
          console.log(`      ⚠️ Lỗi kết nối (${msg.slice(0, 80)}). Chờ ${waitSec}s thử lại...`);
          await new Promise((r) => setTimeout(r, waitSec * 1000));
        }
      }
    }
  }

  if (exhaustedDailyModels.size >= MODEL_POOLS.length) {
    throw new Error(
      "DAILY_QUOTA_EXCEEDED: Toàn bộ model dự phòng trong pool đều đã đạt giới hạn Daily Quota."
    );
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Không thể kết nối đến Gemini sau khi đã thử qua toàn bộ pool model.");
}

function extractJson<T = Record<string, unknown>>(rawJsonText: string): T {
  if (!rawJsonText || typeof rawJsonText !== "string") {
    throw new Error("Phản hồi rỗng từ AI");
  }

  let clean = rawJsonText.trim();
  clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  try {
    return JSON.parse(clean) as T;
  } catch {
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start !== -1 && end > start) {
      const jsonCandidate = clean.slice(start, end + 1);
      try {
        return JSON.parse(jsonCandidate) as T;
      } catch {
        let sanitized = jsonCandidate.replace(/,\s*([\}\]])/g, "$1");
        sanitized = sanitized.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "$1");
        try {
          return JSON.parse(sanitized) as T;
        } catch {
          const escaped = sanitized.replace(/"((?:\\.|[^"\\])*)"/g, (match) => {
            return match
              .replace(/\r/g, "")
              .replace(/\n/g, "\\n")
              .replace(/\t/g, "\\t");
          });
          return JSON.parse(escaped) as T;
        }
      }
    }
    throw new Error("Không thể trích xuất JSON hợp lệ từ phản hồi AI: " + rawJsonText.slice(0, 100));
  }
}

interface CliConfig {
  targetPart: "all" | "5" | "6" | "7" | "reading" | "exam";
  specificQId?: string;
  maxToProcess: number;
  batchSize: number;
  cooldownSeconds: number;
  dryRun: boolean;
  requireExample: boolean;
}

function parseCliConfig(): CliConfig {
  const args = process.argv.slice(2);
  const getArg = (prefix: string): string | undefined => {
    const found = args.find((a) => a.startsWith(`${prefix}=`));
    return found ? found.slice(prefix.length + 1) : undefined;
  };

  const rawPart = (getArg("--part") || process.env.TARGET_PART || "all").toLowerCase();
  const validParts = ["all", "5", "6", "7", "reading", "exam"] as const;
  const targetPart = (validParts.includes(rawPart as (typeof validParts)[number])
    ? rawPart
    : "all") as CliConfig["targetPart"];

  return {
    targetPart,
    specificQId: getArg("--question-id") || process.env.QUESTION_ID,
    maxToProcess: parseInt(getArg("--limit") || process.env.LIMIT || "200", 10),
    batchSize: parseInt(getArg("--batch-size") || process.env.BATCH_SIZE || "50", 10),
    cooldownSeconds: parseInt(getArg("--cooldown") || process.env.COOLDOWN_SECONDS || "25", 10),
    dryRun: args.includes("--dry-run") || process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true",
    requireExample:
      args.includes("--require-example") ||
      process.env.REQUIRE_EXAMPLE === "1" ||
      process.env.REQUIRE_EXAMPLE === "true",
  };
}

interface RunState {
  totalProcessed: number;
  totalRefined: number;
  totalSkipped: number;
  totalFailed: number;
  consecutiveErrors: number;
  currentDelayMs: number;
  currentBatchRefined: number;
  batchCounter: number;
  reachedDailyQuota: boolean;
}

async function handlePaceAndCooldown(cfg: CliConfig, state: RunState) {
  if (state.currentBatchRefined >= cfg.batchSize && state.totalRefined < cfg.maxToProcess) {
    console.log(`\n==========================================================`);
    console.log(`☕ HOÀN THÀNH MẺ #${state.batchCounter} (${state.currentBatchRefined} câu đã vá mới).`);
    console.log(`   Tiến độ tổng: ${state.totalRefined}/${cfg.maxToProcess} câu đã vá.`);
    console.log(`   Tạm nghỉ ${cfg.cooldownSeconds}s để API làm mát trước khi sang mẻ #${state.batchCounter + 1}...`);
    console.log(`==========================================================\n`);
    state.batchCounter++;
    state.currentBatchRefined = 0;
    await new Promise((r) => setTimeout(r, cfg.cooldownSeconds * 1000));
  }

  const jitterMs = 400 + Math.floor(Math.random() * 700);
  await new Promise((r) => setTimeout(r, state.currentDelayMs + jitterMs));
}

function handleItemError(err: unknown, state: RunState) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`   ❌ Lỗi: ${msg}`);
  state.totalFailed++;
  state.consecutiveErrors++;

  if (msg.includes("DAILY_QUOTA_EXCEEDED") || state.consecutiveErrors >= 3) {
    state.reachedDailyQuota = true;
    console.log("\n==========================================================");
    console.log("🛑 THÔNG BÁO: Dừng tiến trình do chạm giới hạn Daily Quota hoặc lỗi liên tiếp >= 3.");
    console.log("==========================================================");
  }
}

// ============================================================================
// PHASE 1: READING PASSAGES (PART 6 & PART 7)
// ============================================================================
async function refineReadingPhase(cfg: CliConfig, state: RunState, parts: Array<6 | 7>) {
  console.log(`\n📚 [PHASE READING] Quét câu hỏi Part ${parts.join(" & ")}...`);

  let qQuery = supabase
    .from("questions")
    .select(
      "id, part, passage_id, order_in_passage, question_sub_type, stem, option_a, option_b, option_c, option_d"
    )
    .in("part", parts)
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (cfg.specificQId) {
    qQuery = qQuery.eq("id", cfg.specificQId);
  }

  const { data: questions, error } = await qQuery;
  if (error || !questions || questions.length === 0) {
    console.log("   ℹ️ Không có câu hỏi Part 6/7 nào cần xử lý.");
    return;
  }

  const passageIds = Array.from(
    new Set(questions.map((q) => q.passage_id).filter((id): id is string => Boolean(id)))
  );
  const passageMap = new Map<
    string,
    { title: string; passage_type: string; content: string; context_info: Record<string, string> }
  >();

  for (let i = 0; i < passageIds.length; i += 40) {
    const { data: pRows } = await supabase
      .from("passages")
      .select("id, title, passage_type, content, context_info")
      .in("id", passageIds.slice(i, i + 40));
    for (const p of pRows || []) {
      passageMap.set(p.id, {
        title: p.title || "",
        passage_type: p.passage_type || "",
        content: p.content || "",
        context_info: (p.context_info || {}) as Record<string, string>,
      });
    }
  }

  const answersMap = new Map<string, { correct_index: number; explanation: unknown }>();
  for (let i = 0; i < questions.length; i += 40) {
    const { data: aRows } = await supabase
      .from("question_answers")
      .select("question_id, correct_index, explanation")
      .in(
        "question_id",
        questions.slice(i, i + 40).map((q) => q.id)
      );
    for (const a of aRows || []) {
      answersMap.set(a.question_id, a);
    }
  }

  for (const q of questions) {
    if (state.totalRefined >= cfg.maxToProcess || state.reachedDailyQuota) break;
    state.totalProcessed++;

    const aData = answersMap.get(q.id);
    if (!aData) {
      state.totalSkipped++;
      continue;
    }

    if (!cfg.specificQId && !isReadingExplanationNeedsRefinement(aData.explanation)) {
      state.totalSkipped++;
      continue;
    }

    const passage = q.passage_id ? passageMap.get(q.passage_id) : undefined;
    if (!passage?.content) {
      state.totalSkipped++;
      continue;
    }

    const contextHeader = Object.entries(passage.context_info || {})
      .filter(([, v]) => Boolean(v))
      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
      .join("\n");
    const fullPassageText = contextHeader
      ? `${contextHeader}\n\n${passage.content}`
      : passage.content;

    console.log(
      `[#${state.totalRefined + 1}/${cfg.maxToProcess}] [Part ${q.part}] Đang vá: "${q.stem.slice(0, 50)}..." (ID: ${q.id})`
    );

    try {
      const prompt =
        q.part === 6
          ? buildPart6RefinementPrompt({
              passageTitle: passage.title,
              passageType: passage.passage_type,
              passageContent: fullPassageText,
              stem: q.stem,
              orderInPassage: q.order_in_passage,
              questionSubType: q.question_sub_type,
              option_a: q.option_a,
              option_b: q.option_b,
              option_c: q.option_c,
              option_d: q.option_d,
              correctIndex: aData.correct_index,
            })
          : buildPart7RefinementPrompt({
              passageTitle: passage.title,
              passageType: passage.passage_type,
              passageContent: fullPassageText,
              stem: q.stem,
              questionSubType: q.question_sub_type,
              option_a: q.option_a,
              option_b: q.option_b,
              option_c: q.option_c,
              option_d: q.option_d,
              correctIndex: aData.correct_index,
            });

      const { text, delayMs, modelUsed } = await callGeminiWithRetry(
        prompt,
        READING_GEMINI_RESPONSE_SCHEMA
      );
      state.currentDelayMs = delayMs;

      const refined = extractJson<{
        question_type_vi: string;
        rule_vi: string;
        why_correct_vi: string;
        key_clue: string;
        full_translation_vi: string;
        tip_vi: string;
        options_analysis: Record<"A" | "B" | "C" | "D", string>;
        vocab_hints: Array<{ word: string; meaning_vi: string }>;
      }>(text);

      const updatedExplanation = {
        question_type_vi: refined.question_type_vi,
        rule_vi: refined.rule_vi,
        why_correct_vi: refined.why_correct_vi,
        analysis: refined.why_correct_vi,
        key_clue: refined.key_clue,
        evidence: refined.key_clue,
        full_translation_vi: refined.full_translation_vi,
        translation: refined.full_translation_vi,
        tip_vi: refined.tip_vi,
        options_analysis: refined.options_analysis,
        vocab_hints: refined.vocab_hints,
      };

      if (cfg.dryRun) {
        console.log(`   🧪 [DRY-RUN Part ${q.part}] Model [${modelUsed}]:`, JSON.stringify(updatedExplanation, null, 2).slice(0, 500));
      } else {
        const { error: updateErr } = await supabase
          .from("question_answers")
          .update({ explanation: updatedExplanation })
          .eq("question_id", q.id);

        if (updateErr) throw new Error(updateErr.message);
        console.log(`   ✅ Đã vá Part ${q.part} thành công bằng [${modelUsed}]!`);
      }

      state.totalRefined++;
      state.currentBatchRefined++;
      state.consecutiveErrors = 0;

      await handlePaceAndCooldown(cfg, state);
    } catch (err) {
      handleItemError(err, state);
    }
  }
}

// ============================================================================
// PHASE 2: PART 5 PRACTICE BANK
// ============================================================================
async function refinePart5Phase(cfg: CliConfig, state: RunState) {
  console.log(`\n📘 [PHASE PART 5] Quét ngân hàng câu hỏi Part 5...`);
  let offset = 0;
  const pageSize = 50;

  while (state.totalRefined < cfg.maxToProcess && !state.reachedDailyQuota) {
    let query = supabase
      .from("questions")
      .select("id, stem, option_a, option_b, option_c, option_d, tag_id, part")
      .eq("part", 5)
      .eq("status", "published")
      .order("created_at", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (cfg.specificQId) {
      query = supabase
        .from("questions")
        .select("id, stem, option_a, option_b, option_c, option_d, tag_id, part")
        .eq("id", cfg.specificQId);
    }

    const { data: questions, error } = await query;
    if (error || !questions || questions.length === 0) {
      console.log("📦 Đã quét hết toàn bộ ngân hàng Part 5.");
      break;
    }

    const { data: pageAnswers, error: aListErr } = await supabase
      .from("question_answers")
      .select("question_id, correct_index, explanation")
      .in(
        "question_id",
        questions.map((item) => item.id)
      );

    if (aListErr) {
      console.error(`❌ Lỗi tải question_answers trang offset ${offset}:`, aListErr.message);
      break;
    }

    const answersMap = new Map<string, { correct_index: number; explanation: unknown }>();
    for (const row of pageAnswers || []) {
      answersMap.set(row.question_id, row);
    }

    console.log(
      `\n--- [Mẻ #${state.batchCounter}] Quét Part 5 offset ${offset} -> ${offset + questions.length} (${questions.length} câu) ---`
    );

    for (const q of questions) {
      if (state.totalRefined >= cfg.maxToProcess || state.reachedDailyQuota) break;
      state.totalProcessed++;

      const aData = answersMap.get(q.id);
      if (!aData) {
        state.totalSkipped++;
        continue;
      }

      const needsRefine = isPart5ExplanationNeedsRefinement(aData.explanation, {
        requireExample: cfg.requireExample,
      });
      if (!needsRefine && !cfg.specificQId) {
        state.totalSkipped++;
        continue;
      }

      console.log(
        `[#${state.totalRefined + 1}/${cfg.maxToProcess}] (Mẻ ${state.batchCounter}: ${state.currentBatchRefined + 1}/${cfg.batchSize}) Đang vá Part 5: "${q.stem.slice(0, 50)}..." (ID: ${q.id})`
      );

      try {
        const prompt = buildPart5RefinementPrompt({
          stem: q.stem,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correctIndex: aData.correct_index,
        });

        const { text, delayMs, modelUsed } = await callGeminiWithRetry(
          prompt,
          PART5_GEMINI_RESPONSE_SCHEMA
        );
        state.currentDelayMs = delayMs;

        const refined = extractJson<{
          tag_id: number;
          rule_vi: string;
          why_correct_vi: string;
          full_translation_vi: string;
          tip_vi: string;
          example_en: string;
          options_analysis: Record<"A" | "B" | "C" | "D", string>;
          vocab_hints: Array<{ word: string; meaning_vi: string }>;
        }>(text);

        const existingObj =
          aData.explanation && typeof aData.explanation === "object"
            ? (aData.explanation as Record<string, unknown>)
            : null;
        const existingTrans =
          typeof existingObj?.full_translation_vi === "string" &&
          !isGenericExplanationText(existingObj.full_translation_vi)
            ? existingObj.full_translation_vi.trim()
            : null;

        const updatedExplanation = {
          rule_vi: refined.rule_vi,
          why_correct_vi: refined.why_correct_vi,
          full_translation_vi: existingTrans || refined.full_translation_vi || "",
          tip_vi: refined.tip_vi,
          example_en: refined.example_en || "",
          options_analysis: refined.options_analysis,
          vocab_hints: refined.vocab_hints,
        };

        if (isPart5ExplanationNeedsRefinement(updatedExplanation)) {
          console.warn(
            `   ⚠️ Cảnh báo: AI trả về lời giải còn hơi ngắn/sáo rỗng ở câu ${q.id}, vẫn lưu và đánh dấu để theo dõi.`
          );
        }

        if (cfg.dryRun) {
          console.log(`   🧪 [DRY-RUN Part 5] Model [${modelUsed}]:`, JSON.stringify(updatedExplanation, null, 2).slice(0, 500));
        } else {
          const nextTagId =
            Number.isInteger(refined.tag_id) && refined.tag_id >= 1 && refined.tag_id <= 16
              ? refined.tag_id
              : null;
          if (nextTagId && nextTagId !== q.tag_id) {
            await supabase.from("questions").update({ tag_id: nextTagId }).eq("id", q.id);
            console.log(`   🏷️  Đổi tag_id: ${q.tag_id} -> ${nextTagId}`);
          }

          const { error: updateErr } = await supabase
            .from("question_answers")
            .update({ explanation: updatedExplanation })
            .eq("question_id", q.id);

          if (updateErr) throw new Error(updateErr.message);
          console.log(`   ✅ Đã vá Part 5 thành công bằng [${modelUsed}]!`);
        }

        state.totalRefined++;
        state.currentBatchRefined++;
        state.consecutiveErrors = 0;

        await handlePaceAndCooldown(cfg, state);
      } catch (err) {
        handleItemError(err, state);
      }
    }

    if (cfg.specificQId || state.reachedDailyQuota) break;
    offset += pageSize;
  }
}

// ============================================================================
// PHASE 3: EXAM SETS (EXAM_SET_ANSWERS PART 1 -> PART 7)
// ============================================================================
interface ExamContextItem {
  part: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  stem: string;
  options: string[];
  contextText?: string;
}

function buildExamQuestionContextMap(content: Record<string, unknown>): Map<string, ExamContextItem> {
  const map = new Map<string, ExamContextItem>();

  // Listening Part 1-4
  const listening = content.listening as Record<string, unknown> | undefined;
  if (listening) {
    const { questions, groups } = flattenListeningContent(listening as never);
    const groupMap = new Map(groups.map((g) => [g.id, g]));

    for (const q of questions) {
      const grp = q.groupId ? groupMap.get(q.groupId) : undefined;
      let contextText: string | undefined;
      if (q.part === 1) {
        contextText = q.scene || grp?.scene;
      } else if (q.part === 3 && grp?.lines) {
        contextText = grp.lines.map((l) => `${l.speaker}: ${l.text}`).join("\n");
      } else if (q.part === 4 && grp?.script) {
        contextText = grp.script;
      }

      map.set(q.id, {
        part: q.part,
        stem: q.stem,
        options: q.options,
        contextText,
      });
    }
  }

  // Reading Part 5-7
  const reading = content.reading as Record<string, unknown> | undefined;
  if (reading) {
    const p5 = (reading.part5 || []) as Array<{ id: string; stem: string; options: string[] }>;
    for (const q of p5) {
      map.set(q.id, { part: 5, stem: q.stem, options: q.options });
    }

    const p6 = (reading.part6 || []) as Array<{
      title?: string;
      docType?: string;
      passage: string;
      questions: Array<{ id: string; stem: string; options: string[] }>;
    }>;
    for (const p of p6) {
      const passageCtx = `${p.docType ? `[${p.docType}] ` : ""}${p.title || ""}\n${p.passage}`.trim();
      for (const q of p.questions || []) {
        map.set(q.id, { part: 6, stem: q.stem, options: q.options, contextText: passageCtx });
      }
    }

    const p7 = (reading.part7 || []) as Array<{
      title?: string;
      docType?: string;
      passage: string;
      questions: Array<{ id: string; stem: string; options: string[] }>;
    }>;
    for (const p of p7) {
      const passageCtx = `${p.docType ? `[${p.docType}] ` : ""}${p.title || ""}\n${p.passage}`.trim();
      for (const q of p.questions || []) {
        map.set(q.id, { part: 7, stem: q.stem, options: q.options, contextText: passageCtx });
      }
    }
  }

  return map;
}

async function refineExamPhase(cfg: CliConfig, state: RunState) {
  console.log(`\n📝 [PHASE EXAM SETS] Quét các bộ đề thi thử (Part 1–7)...`);

  const { data: examSets, error: setErr } = await supabase
    .from("exam_sets")
    .select("id, slug, title, content")
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (setErr || !examSets || examSets.length === 0) {
    console.log("   ℹ️ Không có bộ đề thi thử nào đang published.");
    return;
  }

  for (const examSet of examSets) {
    if (state.totalRefined >= cfg.maxToProcess || state.reachedDailyQuota) break;

    const contextMap = buildExamQuestionContextMap(
      (examSet.content || {}) as Record<string, unknown>
    );

    let ansOffset = 0;
    while (state.totalRefined < cfg.maxToProcess && !state.reachedDailyQuota) {
      let ansQuery = supabase
        .from("exam_set_answers")
        .select("id, question_id, part, correct_index, evidence, explanation, explanation_vi")
        .eq("exam_set_id", examSet.id)
        .order("part", { ascending: true })
        .order("question_id", { ascending: true })
        .range(ansOffset, ansOffset + 99);

      if (cfg.specificQId) {
        ansQuery = ansQuery.eq("question_id", cfg.specificQId);
      }

      const { data: answers, error: ansErr } = await ansQuery;
      if (ansErr || !answers || answers.length === 0) break;

      for (const row of answers) {
        if (state.totalRefined >= cfg.maxToProcess || state.reachedDailyQuota) break;
        state.totalProcessed++;

        if (!cfg.specificQId && !isExamAnswerNeedsRefinement(row)) {
          state.totalSkipped++;
          continue;
        }

        const qCtx = contextMap.get(row.question_id);
        if (!qCtx) {
          state.totalSkipped++;
          continue;
        }

        console.log(
          `[#${state.totalRefined + 1}/${cfg.maxToProcess}] [${examSet.slug} · Part ${row.part}] Đang chuẩn hóa: ${row.question_id}`
        );

        try {
          const prompt = buildExamRefinementPrompt({
            part: qCtx.part,
            stem: qCtx.stem,
            options: qCtx.options,
            correctIndex: row.correct_index,
            contextText: qCtx.contextText,
            existingEvidence: row.evidence,
            existingExplanation: row.explanation,
            existingExplanationVi: row.explanation_vi,
          });

          const { text, delayMs, modelUsed } = await callGeminiWithRetry(
            prompt,
            getExamGeminiResponseSchema(row.part)
          );
          state.currentDelayMs = delayMs;

          const refined = extractJson<{
            question_type_vi: string;
            strategy_vi: string;
            evidence: string;
            why_correct_vi: string;
            tip_vi: string;
            translation_vi: string;
            options_analysis: Record<string, string>;
            vocab_hints?: Array<{ word: string; meaning_vi: string }>;
          }>(text);

          const structuredPayload = {
            part: row.part,
            question_type_vi: refined.question_type_vi,
            strategy_vi: refined.strategy_vi,
            evidence: refined.evidence || row.evidence || "",
            why_correct_vi: refined.why_correct_vi,
            tip_vi: refined.tip_vi,
            translation_vi: refined.translation_vi || row.explanation_vi || "",
            options_analysis: refined.options_analysis,
            vocab_hints: refined.vocab_hints || [],
          };

          if (cfg.dryRun) {
            console.log(
              `   🧪 [DRY-RUN Exam Part ${row.part}] Model [${modelUsed}]:`,
              JSON.stringify(structuredPayload, null, 2).slice(0, 500)
            );
          } else {
            const { error: upErr } = await supabase
              .from("exam_set_answers")
              .update({
                evidence: structuredPayload.evidence || row.evidence,
                explanation: JSON.stringify(structuredPayload),
                explanation_vi: structuredPayload.translation_vi,
              })
              .eq("id", row.id);

            if (upErr) throw new Error(upErr.message);
            console.log(`   ✅ Đã chuẩn hóa ${row.question_id} bằng [${modelUsed}]!`);
          }

          state.totalRefined++;
          state.currentBatchRefined++;
          state.consecutiveErrors = 0;

          await handlePaceAndCooldown(cfg, state);
        } catch (err) {
          handleItemError(err, state);
        }
      }

      if (cfg.specificQId) break;
      ansOffset += 100;
    }
  }
}

async function main() {
  const cfg = parseCliConfig();

  console.log("==========================================================");
  console.log("🚀 BẮT ĐẦU QUY TRÌNH NÂNG CẤP LỜI GIẢI TOEIC P1–P7 BẰNG GEMINI");
  console.log("==========================================================\n");
  console.log("🎯 Cấu hình phiên chạy:");
  console.log(`   - Phạm vi (TARGET_PART): ${cfg.targetPart}`);
  console.log(`   - Mục tiêu tối đa:       ${cfg.maxToProcess} câu`);
  console.log(`   - Kích thước mỗi mẻ:     ${cfg.batchSize} câu (nghỉ ${cfg.cooldownSeconds}s)`);
  console.log(`   - Chế độ Dry Run:        ${cfg.dryRun ? "BẬT (không ghi DB)" : "TẮT"}`);
  console.log(`   - Ép có example_en P5:   ${cfg.requireExample ? "BẬT" : "TẮT"}\n`);

  const state: RunState = {
    totalProcessed: 0,
    totalRefined: 0,
    totalSkipped: 0,
    totalFailed: 0,
    consecutiveErrors: 0,
    currentDelayMs: minRequestDelayMs,
    currentBatchRefined: 0,
    batchCounter: 1,
    reachedDailyQuota: false,
  };

  if (cfg.targetPart === "all" || cfg.targetPart === "reading") {
    await refineReadingPhase(cfg, state, [6, 7]);
  } else if (cfg.targetPart === "6") {
    await refineReadingPhase(cfg, state, [6]);
  } else if (cfg.targetPart === "7") {
    await refineReadingPhase(cfg, state, [7]);
  }

  if (
    (cfg.targetPart === "all" || cfg.targetPart === "5") &&
    state.totalRefined < cfg.maxToProcess &&
    !state.reachedDailyQuota
  ) {
    await refinePart5Phase(cfg, state);
  }

  if (
    (cfg.targetPart === "all" || cfg.targetPart === "exam") &&
    state.totalRefined < cfg.maxToProcess &&
    !state.reachedDailyQuota
  ) {
    await refineExamPhase(cfg, state);
  }

  console.log("\n==========================================================");
  console.log("🎉 KẾT THÚC TIẾN TRÌNH:");
  console.log(`   - Đã hoàn thành:       ${state.batchCounter} mẻ`);
  console.log(`   - Tổng câu đã quét:    ${state.totalProcessed}`);
  console.log(`   - Đã vá mới thành công:${state.totalRefined}`);
  console.log(`   - Bỏ qua (đã chuẩn):   ${state.totalSkipped}`);
  console.log(`   - Lỗi:                 ${state.totalFailed}`);
  console.log("==========================================================");
}

main().catch((err) => {
  console.error("Lỗi:", err);
  process.exit(1);
});
