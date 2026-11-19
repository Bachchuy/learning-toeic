import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  getAllGrammarLessons,
  getGrammarLessonSummaries,
} from "@/core/grammarLessons";
import { collectLessonHighlightsMap } from "@/core/lessonHighlights";

const HEAVY_LEARN_MODULES = new Set([
  "@/core/grammarLessons",
  "@/core/lessonExercises",
  "@/core/lessonHighlights",
  "@/core/lessonExtraExercises",
  "@/core/lessonExtraExamples",
]);

function hasRuntimeHeavyImport(source: string): string[] {
  const violations: string[] = [];
  const importRegex = /import\s+([\s\S]*?)\s+from\s+["']([^"']+)["']/g;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(source)) !== null) {
    const clause = match[1].trim();
    const target = match[2].trim();

    if (!HEAVY_LEARN_MODULES.has(target)) continue;

    // Cho phép `import type ... from "..."`
    if (/^type\s+/.test(clause)) continue;

    // Cho phép `import { type A, type B } from "..."` (tất cả specifier đều có `type`)
    if (/^\{[\s\S]*\}$/.test(clause)) {
      const inner = clause.slice(1, -1);
      const specifiers = inner
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (specifiers.length > 0 && specifiers.every((s) => /^type\s+/.test(s))) {
        continue;
      }
    }

    violations.push(`${target} -> ${clause.replace(/\s+/g, " ")}`);
  }

  return violations;
}

describe("Batch 7.1: /learn Client Bundle Boundary & Precomputed Props", () => {
  it("các component trong src/features/learn/components/ không import runtime kho dữ liệu ngữ pháp/bài tập nặng", () => {
    const componentsDir = path.resolve(
      process.cwd(),
      "src/features/learn/components"
    );
    const files = fs
      .readdirSync(componentsDir)
      .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));

    const allViolations: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(path.join(componentsDir, file), "utf-8");
      for (const v of hasRuntimeHeavyImport(content)) {
        allViolations.push(`${file}: ${v}`);
      }
    }

    expect(allViolations).toEqual([]);
  });

  it("collectLessonHighlightsMap và getGrammarLessonSummaries cung cấp đủ dữ liệu cho cả 16 chủ điểm", () => {
    const lessons = getAllGrammarLessons();
    const summaries = getGrammarLessonSummaries();

    expect(lessons).toHaveLength(16);
    expect(summaries).toHaveLength(16);

    for (let i = 0; i < lessons.length; i++) {
      const highlightsMap = collectLessonHighlightsMap(lessons[i]);
      expect(Object.keys(highlightsMap).length).toBeGreaterThan(0);

      expect(summaries[i].microSummary.moduleCount).toBeGreaterThanOrEqual(3);
      expect(summaries[i].microSummary.exerciseCount).toBeGreaterThanOrEqual(5);
      expect(summaries[i].microSummary.moduleTitles.length).toBe(
        summaries[i].microSummary.moduleCount
      );
    }
  });
});
