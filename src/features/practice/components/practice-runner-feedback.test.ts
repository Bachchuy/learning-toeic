import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import type { Browser, BrowserContext, Page } from "@playwright/test";
import type { Plugin } from "esbuild";
import AxeBuilder from "@axe-core/playwright";
import * as tailwindcss from "tailwindcss";
import { Scanner } from "@tailwindcss/oxide";
import type {
  PracticeQuestion,
  SessionReviewItem,
  SessionReviewResponse,
  SubmitAnswerResponse,
} from "../types";
import { parseExplanation } from "../schemas";
import {
  bundleBrowserHarness,
  launchTestChromium,
} from "../../../../tests/helpers/chromium-react-harness";

const require = createRequire(import.meta.url);

const mockSubmitAnswer = vi.fn<
  (sessionId: string, questionId: string, selectedIndex: number) => Promise<{
    result?: SubmitAnswerResponse;
    error?: string;
  }>
>();
const mockFinishSession = vi.fn<
  (sessionId: string) => Promise<{ success: boolean; error?: string }>
>();
const mockTrackEvent = vi.fn<
  (eventName: string, metadata?: Record<string, unknown>) => Promise<{ success: boolean }>
>();
const mockReportQuestion = vi.fn<
  (questionId: string, reason: string, notes?: string) => Promise<{
    success: boolean;
    message: string;
  }>
>();

const PRACTICE_BROWSER_PLUGINS: Plugin[] = [
  {
    name: "practice-next-and-actions-shims",
    setup(pluginBuild) {
      pluginBuild.onResolve({ filter: /^next\/navigation$/ }, () => ({
        path: "next/navigation",
        namespace: "practice-browser-shim",
      }));
      pluginBuild.onResolve({ filter: /^next\/link$/ }, () => ({
        path: "next/link",
        namespace: "practice-browser-shim",
      }));
      pluginBuild.onResolve({ filter: /^\.\.\/actions$/ }, (args) => {
        const importer = args.importer.replace(/\\/g, "/");
        if (
          importer.endsWith("/src/features/practice/components/practice-runner.tsx") ||
          importer.endsWith("/src/features/practice/components/question-report-modal.tsx")
        ) {
          return {
            path: "practice-actions-bridge",
            namespace: "practice-browser-shim",
          };
        }
        return undefined;
      });
      pluginBuild.onResolve({ filter: /^@\/features\/vocab\/actions$/ }, () => ({
        path: "vocab-actions-bridge",
        namespace: "practice-browser-shim",
      }));

      pluginBuild.onLoad({ filter: /.*/, namespace: "practice-browser-shim" }, (args) => {
        if (args.path === "next/navigation") {
          return {
            loader: "ts",
            contents: `
              export function useRouter() {
                return {
                  push: (url: string) => {
                    const fn = (window as unknown as { __practiceRouterPush?: (u: string) => void }).__practiceRouterPush;
                    fn?.(url);
                  },
                  replace: (url: string) => {
                    const fn = (window as unknown as { __practiceRouterPush?: (u: string) => void }).__practiceRouterPush;
                    fn?.(url);
                  },
                  refresh: () => {},
                };
              }
            `,
          };
        }

        if (args.path === "next/link") {
          return {
            loader: "tsx",
            resolveDir: process.cwd(),
            contents: `
              import React from "react";
              export default function Link({
                href,
                children,
                ...rest
              }: {
                href: string | { pathname?: string };
                children?: React.ReactNode;
              } & Record<string, unknown>) {
                const resolvedHref =
                  typeof href === "string" ? href : (href?.pathname ?? "#");
                return <a href={resolvedHref} {...rest}>{children}</a>;
              }
            `,
          };
        }

        if (args.path === "practice-actions-bridge") {
          return {
            loader: "ts",
            contents: `
              export async function submitAnswerAction(
                sessionId: string,
                questionId: string,
                selectedIndex: number
              ) {
                const fn = (window as unknown as {
                  __practiceSubmitAnswer?: (
                    s: string,
                    q: string,
                    i: number
                  ) => Promise<unknown>;
                }).__practiceSubmitAnswer;
                if (!fn) throw new Error("Missing __practiceSubmitAnswer bridge");
                return fn(sessionId, questionId, selectedIndex);
              }

              export async function finishSessionAction(sessionId: string) {
                const fn = (window as unknown as {
                  __practiceFinishSession?: (s: string) => Promise<unknown>;
                }).__practiceFinishSession;
                return fn ? fn(sessionId) : { success: true };
              }

              export async function trackEventAction(
                eventName: string,
                metadata?: Record<string, unknown>
              ) {
                const fn = (window as unknown as {
                  __practiceTrackEvent?: (
                    name: string,
                    meta?: Record<string, unknown>
                  ) => Promise<unknown>;
                }).__practiceTrackEvent;
                return fn ? fn(eventName, metadata) : { success: true };
              }

              export async function reportQuestionAction(
                questionId: string,
                reason: string,
                notes?: string
              ) {
                const fn = (window as unknown as {
                  __practiceReportQuestion?: (
                    q: string,
                    r: string,
                    n?: string
                  ) => Promise<unknown>;
                }).__practiceReportQuestion;
                return fn
                  ? fn(questionId, reason, notes)
                  : { success: true, message: "ok" };
              }
            `,
          };
        }

        if (args.path === "vocab-actions-bridge") {
          return {
            loader: "ts",
            contents: `
              export async function saveBatchVocabAction() {
                return { savedCount: 0, skippedCount: 0 };
              }
            `,
          };
        }

        return undefined;
      });
    },
  },
];

async function buildProjectTailwindCss(): Promise<string> {
  const scanner = new Scanner({
    sources: [
      {
        base: path.resolve(process.cwd(), "src/features/practice/components"),
        pattern: "**/*.tsx",
        negated: false,
      },
      {
        base: path.resolve(process.cwd(), "src/components/ui"),
        pattern: "**/*.tsx",
        negated: false,
      },
      {
        base: path.resolve(process.cwd(), "src/components/layout"),
        pattern: "**/*.tsx",
        negated: false,
      },
      {
        base: path.resolve(process.cwd(), "src/features/vocab/components"),
        pattern: "vocab-save-modal.tsx",
        negated: false,
      },
    ],
  });
  const candidates = scanner.scan();
  const globalsCss = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/globals.css"),
    "utf-8"
  );

  const compiled = await tailwindcss.compile(globalsCss, {
    loadStylesheet: async (id: string) => {
      const resolved = require.resolve(
        id === "tailwindcss" ? "tailwindcss/index.css" : id
      );
      return {
        path: resolved,
        base: path.dirname(resolved),
        content: fs.readFileSync(resolved, "utf-8"),
      };
    },
  });

  return compiled.build(candidates);
}

function countExactOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let pos = 0;
  while (true) {
    const idx = haystack.indexOf(needle, pos);
    if (idx === -1) break;
    count += 1;
    pos = idx + needle.length;
  }
  return count;
}

const Q1_WORD_FORM: PracticeQuestion = {
  id: "q-wrong-a",
  order_index: 1,
  stem: "Mr. Tanaka presented a ____ summary of the quarterly financial results at yesterday's meeting.",
  option_a: "briefly",
  option_b: "briefing",
  option_c: "brief",
  option_d: "briefed",
  tag_id: 14,
  tag_name_vi: "Từ loại (Word Form)",
  difficulty: 1,
};

const Q2_TENSES: PracticeQuestion = {
  id: "q-wrong-d",
  order_index: 2,
  stem: "Ms. Gomez ____ as the director of the marketing department since January of last year.",
  option_a: "works",
  option_b: "has worked",
  option_c: "worked",
  option_d: "is working",
  tag_id: 1,
  tag_name_vi: "Thì động từ (Tenses)",
  difficulty: 1,
};

const Q3_MISSING_OPTION_REASON: PracticeQuestion = {
  id: "q-missing-reason",
  order_index: 3,
  stem: "All budget proposals must be ____ by the finance committee prior to Friday afternoon.",
  option_a: "review",
  option_b: "reviewing",
  option_c: "reviewed",
  option_d: "reviews",
  tag_id: 3,
  tag_name_vi: "Câu bị động (Passive Voice)",
  difficulty: 2,
};

const Q4_CORRECT: PracticeQuestion = {
  id: "q-correct",
  order_index: 4,
  stem: "Please submit the signed reimbursement form ____ the end of this month.",
  option_a: "by",
  option_b: "since",
  option_c: "among",
  option_d: "despite",
  tag_id: 10,
  tag_name_vi: "Liên từ & Giới từ",
  difficulty: 1,
};

describe("Part 5 PracticeRunner wrong-answer feedback, fallback & keyboard disclosure (isolated Chromium)", () => {
  let browser: Browser;
  let bundledScript: string;
  let compiledCss: string;
  const screenshotDir = process.env.CAPTURE_PART5_SCREENSHOTS_DIR || "";

  beforeAll(async () => {
    const entryCode = `
      import React from "react";
      import { createRoot, type Root } from "react-dom/client";
      import { PracticeRunner } from "./src/features/practice/components/practice-runner";
      import { DrillRunner } from "./src/features/practice/components/drill-runner";
      import { PracticeResultView } from "./src/features/practice/components/practice-result-view";
      import type {
        PracticeQuestion,
        SessionReviewItem,
        SessionReviewResponse,
      } from "./src/features/practice/types";

      let root: Root | null = null;

      (
        window as unknown as {
          __mountPractice: (sessionId: string, questions: PracticeQuestion[]) => void;
        }
      ).__mountPractice = (sessionId: string, questions: PracticeQuestion[]) => {
        const el = document.getElementById("root");
        if (!el) throw new Error("Missing #root");
        if (!root) root = createRoot(el);
        root.render(
          React.createElement(
            "main",
            {
              id: "main-content",
              className:
                "min-h-dvh w-full scrollbar-gutter-stable bg-[var(--color-bg-page)]",
            },
            React.createElement(PracticeRunner, {
              key: sessionId,
              sessionId,
              questions,
            })
          )
        );
      };

      (
        window as unknown as {
          __mountDrill: (wrongItems: SessionReviewItem[]) => void;
        }
      ).__mountDrill = (wrongItems: SessionReviewItem[]) => {
        const el = document.getElementById("root");
        if (!el) throw new Error("Missing #root");
        if (!root) root = createRoot(el);
        root.render(
          React.createElement(
            "main",
            {
              id: "main-content",
              className:
                "min-h-dvh w-full scrollbar-gutter-stable bg-[var(--color-bg-page)] p-4",
            },
            React.createElement(DrillRunner, {
              wrongItems,
              onExitDrill: () => {},
            })
          )
        );
      };

      (
        window as unknown as {
          __mountResult: (review: SessionReviewResponse) => void;
        }
      ).__mountResult = (review: SessionReviewResponse) => {
        const el = document.getElementById("root");
        if (!el) throw new Error("Missing #root");
        if (!root) root = createRoot(el);
        root.render(
          React.createElement(
            "main",
            {
              id: "main-content",
              className:
                "min-h-dvh w-full scrollbar-gutter-stable bg-[var(--color-bg-page)] p-4",
            },
            React.createElement(PracticeResultView, { review })
          )
        );
      };

      (window as unknown as { __unmountPractice: () => void }).__unmountPractice = () => {
        if (root) {
          root.unmount();
          root = null;
        }
      };
    `;

    const [script, css, launched] = await Promise.all([
      bundleBrowserHarness(entryCode, PRACTICE_BROWSER_PLUGINS),
      buildProjectTailwindCss(),
      launchTestChromium(),
    ]);

    bundledScript = script;
    compiledCss = css;
    browser = launched;

    if (screenshotDir) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  }, 45_000);

  afterAll(async () => {
    await browser?.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockFinishSession.mockResolvedValue({ success: true });
    mockTrackEvent.mockResolvedValue({ success: true });
    mockReportQuestion.mockResolvedValue({ success: true, message: "ok" });
  });

  async function openPracticeSession(
    questions: PracticeQuestion[],
    viewport: { width: number; height: number } = { width: 1280, height: 800 }
  ) {
    const navigatedUrls: string[] = [];
    const context: BrowserContext = await browser.newContext({ viewport });
    const page: Page = await context.newPage();

    await page.route("http://practice.test/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html; charset=utf-8",
        body: `<!doctype html>
          <html lang="vi">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <title>Phiên luyện tập Part 5</title>
              <style>
                :root {
                  --font-be-vietnam-pro: "Segoe UI", system-ui, -apple-system, Arial, sans-serif;
                  --font-jetbrains-mono: Consolas, "Courier New", monospace;
                }
                ${compiledCss}
              </style>
            </head>
            <body class="min-h-dvh bg-[var(--color-bg-page)] text-[var(--color-text-primary)] font-sans">
              <div id="root"></div>
            </body>
          </html>`,
      });
    });

    await page.exposeFunction(
      "__practiceSubmitAnswer",
      async (sessionId: string, questionId: string, selectedIndex: number) =>
        mockSubmitAnswer(sessionId, questionId, selectedIndex)
    );
    await page.exposeFunction(
      "__practiceFinishSession",
      async (sessionId: string) => mockFinishSession(sessionId)
    );
    await page.exposeFunction(
      "__practiceTrackEvent",
      async (eventName: string, metadata?: Record<string, unknown>) =>
        mockTrackEvent(eventName, metadata)
    );
    await page.exposeFunction(
      "__practiceReportQuestion",
      async (questionId: string, reason: string, notes?: string) =>
        mockReportQuestion(questionId, reason, notes)
    );
    await page.exposeFunction("__practiceRouterPush", (url: string) => {
      navigatedUrls.push(url);
    });

    await page.goto("http://practice.test/practice/sess-isolated");
    await page.addScriptTag({ content: bundledScript });
    await page.evaluate(
      ({ sessionId, qs }) => {
        (
          window as unknown as {
            __mountPractice: (s: string, q: PracticeQuestion[]) => void;
          }
        ).__mountPractice(sessionId, qs);
      },
      { sessionId: "sess-isolated", qs: questions }
    );
    await page.locator('[role="radiogroup"]').waitFor({ state: "visible" });

    return {
      page,
      navigatedUrls,
      close: async () => {
        await page.evaluate(() => {
          (
            window as unknown as { __unmountPractice?: () => void }
          ).__unmountPractice?.();
        });
        await context.close();
      },
    };
  }

  async function assertZeroOverflowAndA11y(page: Page, contextLabel: string) {
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
    );
    expect(overflow, `Tràn ngang tại ${contextLabel}`).toBe(false);

    const axeResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      axeResults.violations,
      `Vi phạm WCAG tại ${contextLabel}: ${JSON.stringify(axeResults.violations, null, 2)}`
    ).toEqual([]);
  }

  async function maybeCaptureScreenshot(
    page: Page,
    fileName: string,
    scrollTargetSelector?: string
  ) {
    if (!screenshotDir) return;
    await page.evaluate((selector) => {
      if (selector) {
        const el = document.querySelector(selector);
        if (el) {
          const rect = el.getBoundingClientRect();
          window.scrollTo(0, Math.max(0, window.scrollY + rect.top - 72));
          return;
        }
      }
      window.scrollTo(0, 0);
    }, scrollTargetSelector ?? null);
    await page.waitForTimeout(80);
    await page.screenshot({
      path: path.join(screenshotDir, fileName),
      fullPage: false,
    });
  }

  it("chỉ hiển thị phản hồi sau khi server chấm xong (ẩn hoàn toàn trước khi nộp, khi đang chờ và khi lỗi mạng)", async () => {
    let resolveServer!: (val: { result: SubmitAnswerResponse }) => void;
    const deferred = new Promise<{ result: SubmitAnswerResponse }>((resolve) => {
      resolveServer = resolve;
    });

    mockSubmitAnswer
      .mockResolvedValueOnce({ error: "Mất kết nối tạm thời" })
      .mockImplementationOnce(() => deferred);

    const session = await openPracticeSession([Q1_WORD_FORM]);
    try {
      const { page } = session;

      // 1. Trạng thái answering: chưa chọn và đã chọn A nhưng chưa nộp -> tuyệt đối không có phản hồi
      await page.locator('[data-option-label="A"] button[role="radio"]').click();
      expect(await page.getByText("Bạn chọn · Sai").count()).toBe(0);
      expect(await page.getByText("Đáp án đúng").count()).toBe(0);
      expect(await page.locator('[data-testid="selected-option-feedback"]').count()).toBe(0);
      expect(await page.locator('[data-testid="explanation-details-toggle"]').count()).toBe(0);
      expect(await page.locator("text=/^(ĐÚNG|SAI)$/").count()).toBe(0);

      // 2. Nộp lần 1 bị lỗi server -> vẫn giữ lựa chọn, không hiện phản hồi đáp án
      await page.getByRole("button", { name: "Nộp đáp án" }).click();
      await page.getByRole("alert").waitFor({ state: "visible" });
      expect(await page.getByText("Bạn chọn · Sai").count()).toBe(0);
      expect(await page.getByText("Đáp án đúng").count()).toBe(0);
      expect(await page.locator('[data-testid="selected-option-feedback"]').count()).toBe(0);

      // 3. Bấm Thử lại -> đang chờ server (submitting) -> vẫn chưa được hiện phản hồi
      await page.getByRole("button", { name: "Thử lại" }).click();
      expect(await page.getByText("Bạn chọn · Sai").count()).toBe(0);
      expect(await page.getByText("Đáp án đúng").count()).toBe(0);
      expect(await page.locator('[data-testid="selected-option-feedback"]').count()).toBe(0);

      // 4. Server chấm xong -> mới hiện phản hồi
      resolveServer({
        result: {
          is_correct: false,
          selected_index: 0,
          correct_index: 2,
          explanation: parseExplanation({
            rule_vi: "Sau mạo từ a/an/the và trước danh từ là tính từ.",
            why_correct_vi: "Cần tính từ 'brief' để bổ nghĩa cho danh từ 'summary'.",
            why_wrong_vi: [
              {
                option: "A",
                reason_vi: "briefly là trạng từ (-ly), không dùng để bổ nghĩa trực tiếp cho danh từ summary.",
              },
            ],
          }),
        },
      });

      await page.locator('[data-testid="selected-option-feedback"]').waitFor({
        state: "visible",
      });
      expect(await page.getByText("Bạn chọn · Sai", { exact: true }).count()).toBe(1);
      expect(
        await page
          .locator('[role="radiogroup"]')
          .getByText("Đáp án đúng", { exact: true })
          .count()
      ).toBe(1);
    } finally {
      await session.close();
    }
  }, 15_000);

  it("sai ở A: giữ thứ tự A–D, gắn nhãn 'Bạn chọn · Sai' + lời giải ngay dưới A, đánh dấu 'Đáp án đúng' ở C, mở/đóng quy tắc/bản dịch/ví dụ, không gạch chân đề", async () => {
    mockSubmitAnswer.mockResolvedValueOnce({
      result: {
        is_correct: false,
        selected_index: 0,
        correct_index: 2,
        explanation: parseExplanation({
          rule_vi: "Cấu trúc cụm danh từ: Mạo từ (a/an/the) + Tính từ + Danh từ.",
          why_correct_vi:
            "Chỗ trống đứng sau mạo từ 'a' và trước danh từ 'summary', nên cần tính từ 'brief'.",
          full_translation_vi:
            "Ông Tanaka đã trình bày một bản tóm tắt ngắn gọn về kết quả tài chính quý tại cuộc họp hôm qua.",
          example_en: "She gave a brief presentation on the new budget plan.",
          why_wrong_vi: [
            {
              option: "A",
              reason_vi:
                "briefly là trạng từ nên không đứng trực tiếp trước danh từ summary để bổ nghĩa.",
            },
          ],
          options_analysis: {
            A: "briefly (adv): trạng từ.",
            B: "briefing (n): cuộc họp ngắn, không phù hợp nghĩa khi đứng trước summary.",
            C: "brief (adj): ngắn gọn, đứng trước bổ nghĩa danh từ summary.",
            D: "briefed (v-ed): dạng quá khứ/phân từ, không hợp ngữ cảnh.",
          },
          vocab_hints: [{ word: "summary", meaning_vi: "bản tóm tắt" }],
        }),
      },
    });

    const session = await openPracticeSession([Q1_WORD_FORM], {
      width: 1280,
      height: 800,
    });
    try {
      const { page } = session;

      // Stem không có thẻ gạch chân/highlight ở đợt này
      expect(await page.locator("h2 u, h2 mark").count()).toBe(0);

      await page.locator('[data-option-label="A"] button[role="radio"]').click();
      await page.getByRole("button", { name: "Nộp đáp án" }).click();

      const inlineFeedback = page.locator('[data-testid="selected-option-feedback"]');
      await inlineFeedback.waitFor({ state: "visible" });

      // Giữ nguyên thứ tự A-D
      const order = await page
        .locator('[role="radiogroup"] > [data-option-label]')
        .evaluateAll((els) => els.map((el) => el.getAttribute("data-option-label")));
      expect(order).toEqual(["A", "B", "C", "D"]);

      // Nhãn ở A và C
      const optA = page.locator('[data-option-label="A"]');
      const optC = page.locator('[data-option-label="C"]');
      expect(await optA.getByText("Bạn chọn · Sai").count()).toBe(1);
      expect(await optC.getByText("Đáp án đúng").count()).toBe(1);
      expect(
        await optA.locator('[data-testid="selected-option-feedback"]').textContent()
      ).toContain("briefly là trạng từ");

      // Lời giải của A nằm ngay dưới nút A và phía trên nút B
      const boxABtn = await optA.locator('button[role="radio"]').boundingBox();
      const boxInline = await inlineFeedback.boundingBox();
      const boxBBtn = await page
        .locator('[data-option-label="B"] button[role="radio"]')
        .boundingBox();
      expect(boxABtn && boxInline && boxBBtn).toBeTruthy();
      expect(boxABtn!.y + boxABtn!.height).toBeLessThanOrEqual(boxInline!.y + 1);
      expect(boxInline!.y + boxInline!.height).toBeLessThanOrEqual(boxBBtn!.y + 1);

      // Kiểm tra responsive & a11y + chụp ảnh 1280px (trạng thái thu gọn)
      await assertZeroOverflowAndA11y(page, "wrong-A 1280px collapsed");
      await maybeCaptureScreenshot(page, "wrong-a-1280.png");

      // Mở quy tắc, bản dịch, ví dụ và phân tích các phương án còn lại
      const toggleBtn = page.locator('[data-testid="explanation-details-toggle"]');
      expect(await toggleBtn.getAttribute("aria-expanded")).toBe("false");
      expect(
        await page.locator('[data-testid="remaining-options-analysis"]').count()
      ).toBe(0);
      await toggleBtn.click();
      expect(await toggleBtn.getAttribute("aria-expanded")).toBe("true");
      const panel = page.locator('[data-testid="explanation-details-panel"]');
      await panel.waitFor({ state: "visible" });
      expect(await panel.textContent()).toContain("Cấu trúc cụm danh từ");
      expect(await panel.textContent()).toContain("Ông Tanaka đã trình bày");
      expect(await panel.textContent()).toContain(
        "She gave a brief presentation on the new budget plan."
      );

      // Phân tích các phương án còn lại hiện B, C, D và bỏ qua A (đã hiện dưới lựa chọn A)
      const remainingBlock = panel.locator('[data-testid="remaining-options-analysis"]');
      await remainingBlock.waitFor({ state: "visible" });
      expect(await remainingBlock.locator('[data-analysis-option="A"]').count()).toBe(0);
      expect(await remainingBlock.locator('[data-analysis-option="B"]').textContent()).toContain(
        "cuộc họp ngắn"
      );
      expect(await remainingBlock.locator('[data-analysis-option="C"]').textContent()).toContain(
        "Đáp án đúng"
      );
      expect(await remainingBlock.locator('[data-analysis-option="D"]').textContent()).toContain(
        "dạng quá khứ/phân từ"
      );

      await assertZeroOverflowAndA11y(page, "wrong-A 1280px expanded");
      await maybeCaptureScreenshot(
        page,
        "wrong-a-expanded-1280.png",
        '[data-testid="explanation-details-toggle"]'
      );

      // Kiểm tra ở mobile 360px
      await page.setViewportSize({ width: 360, height: 740 });
      await assertZeroOverflowAndA11y(page, "wrong-A 360px expanded");
      await maybeCaptureScreenshot(
        page,
        "wrong-a-expanded-360.png",
        '[data-testid="explanation-details-toggle"]'
      );

      await toggleBtn.click();
      expect(await toggleBtn.getAttribute("aria-expanded")).toBe("false");
      await assertZeroOverflowAndA11y(page, "wrong-A 360px collapsed");
      await maybeCaptureScreenshot(page, "wrong-a-360.png");
    } finally {
      await session.close();
    }
  }, 20_000);

  it("sai ở D (lấy lời giải từ options_analysis): giữ thứ tự A–D, đặt lời giải ngay dưới D và đánh dấu Đáp án đúng ở B", async () => {
    mockSubmitAnswer.mockResolvedValueOnce({
      result: {
        is_correct: false,
        selected_index: 3,
        correct_index: 1,
        explanation: parseExplanation({
          rule_vi: "Dấu hiệu 'since + mốc thời gian' dùng thì Hiện tại hoàn thành.",
          why_correct_vi:
            "Cụm 'since January of last year' cho thấy hành động bắt đầu trong quá khứ và kéo dài tới hiện tại.",
          full_translation_vi:
            "Bà Gomez đã giữ chức giám đốc bộ phận tiếp thị từ tháng Giêng năm ngoái.",
          options_analysis: {
            A: "works: thì Hiện tại đơn không diễn tả quãng thời gian từ quá khứ tới hiện tại.",
            B: "has worked: thì Hiện tại hoàn thành phù hợp với since.",
            C: "worked: thì Quá khứ đơn dùng cho việc đã kết thúc.",
            D: "is working: thì Hiện tại tiếp diễn không dùng với cấu trúc since + mốc thời gian.",
          },
        }),
      },
    });

    const session = await openPracticeSession([Q2_TENSES], {
      width: 1280,
      height: 800,
    });
    try {
      const { page } = session;

      await page.locator('[data-option-label="D"] button[role="radio"]').click();
      await page.getByRole("button", { name: "Nộp đáp án" }).click();

      const inlineFeedback = page.locator('[data-testid="selected-option-feedback"]');
      await inlineFeedback.waitFor({ state: "visible" });

      const order = await page
        .locator('[role="radiogroup"] > [data-option-label]')
        .evaluateAll((els) => els.map((el) => el.getAttribute("data-option-label")));
      expect(order).toEqual(["A", "B", "C", "D"]);

      const optB = page.locator('[data-option-label="B"]');
      const optD = page.locator('[data-option-label="D"]');
      expect(await optB.getByText("Đáp án đúng").count()).toBe(1);
      expect(await optD.getByText("Bạn chọn · Sai").count()).toBe(1);
      expect(
        await optD.locator('[data-testid="selected-option-feedback"]').textContent()
      ).toContain("is working: thì Hiện tại tiếp diễn");

      const boxDBtn = await optD.locator('button[role="radio"]').boundingBox();
      const boxInline = await inlineFeedback.boundingBox();
      expect(boxDBtn && boxInline).toBeTruthy();
      expect(boxDBtn!.y + boxDBtn!.height).toBeLessThanOrEqual(boxInline!.y + 1);

      await assertZeroOverflowAndA11y(page, "wrong-D 1280px");
      await maybeCaptureScreenshot(page, "wrong-d-1280.png");

      await page.setViewportSize({ width: 360, height: 740 });
      await assertZeroOverflowAndA11y(page, "wrong-D 360px");
      await maybeCaptureScreenshot(page, "wrong-d-360.png");
    } finally {
      await session.close();
    }
  }, 15_000);

  it("câu thiếu lời giải riêng cho phương án đã chọn: hiển thị lý do đáp án đúng đúng một lần (không lặp)", async () => {
    const whyCorrect =
      "Sau cụm động từ khuyết thiếu bị động 'must be' cần dùng phân từ hai 'reviewed'.";

    mockSubmitAnswer.mockResolvedValueOnce({
      result: {
        is_correct: false,
        selected_index: 0,
        correct_index: 2,
        explanation: parseExplanation({
          rule_vi: "Thể bị động với động từ khuyết thiếu: modal + be + V3/ed.",
          why_correct_vi: whyCorrect,
          full_translation_vi:
            "Mọi đề xuất ngân sách phải được ủy ban tài chính rà soát trước chiều thứ Sáu.",
        }),
      },
    });

    const session = await openPracticeSession([Q3_MISSING_OPTION_REASON], {
      width: 1280,
      height: 800,
    });
    try {
      const { page } = session;

      await page.locator('[data-option-label="A"] button[role="radio"]').click();
      await page.getByRole("button", { name: "Nộp đáp án" }).click();

      const inlineFeedback = page.locator('[data-testid="selected-option-feedback"]');
      await inlineFeedback.waitFor({ state: "visible" });

      expect(await inlineFeedback.textContent()).toContain(whyCorrect);
      const bodyText = await page.evaluate(() => document.body.innerText);
      expect(countExactOccurrences(bodyText, whyCorrect)).toBe(1);

      // Nút mở chi tiết chỉ ghi đúng phần hiện có (không nhắc tới ví dụ vì thiếu example_en)
      const toggleBtn = page.locator('[data-testid="explanation-details-toggle"]');
      expect(await toggleBtn.textContent()).toContain("Mở quy tắc và bản dịch");

      await assertZeroOverflowAndA11y(page, "missing-reason 1280px");
      await maybeCaptureScreenshot(page, "wrong-missing-reason-1280.png");

      await page.setViewportSize({ width: 360, height: 740 });
      await assertZeroOverflowAndA11y(page, "missing-reason 360px");
      await maybeCaptureScreenshot(page, "wrong-missing-reason-360.png");
    } finally {
      await session.close();
    }
  }, 15_000);

  it("lượt trả lời đúng: đánh dấu 'Đáp án đúng', không có 'Bạn chọn · Sai', giữ lý do đúng một lần và cho mở chi tiết", async () => {
    const whyCorrect =
      "Giới từ 'by' đi với mốc thời gian 'the end of this month' mang nghĩa 'trước hoặc chậm nhất vào'.";

    mockSubmitAnswer.mockResolvedValueOnce({
      result: {
        is_correct: true,
        selected_index: 0,
        correct_index: 0,
        explanation: parseExplanation({
          rule_vi: "by + mốc thời gian = trước / muộn nhất vào thời điểm đó.",
          why_correct_vi: whyCorrect,
          full_translation_vi:
            "Vui lòng nộp biểu mẫu hoàn tiền đã ký trước cuối tháng này.",
          example_en: "All reports must be submitted by Friday.",
          options_analysis: {
            A: "by: trước hoặc chậm nhất vào một mốc thời gian.",
            B: "since: kể từ một mốc quá khứ tới hiện tại.",
            C: "among: ở giữa từ ba đối tượng trở lên.",
            D: "despite: mặc dù (chỉ nhượng bộ, không chỉ hạn chót).",
          },
        }),
      },
    });

    const session = await openPracticeSession([Q4_CORRECT], {
      width: 1280,
      height: 800,
    });
    try {
      const { page } = session;

      await page.locator('[data-option-label="A"] button[role="radio"]').click();
      await page.getByRole("button", { name: "Nộp đáp án" }).click();

      await page.getByText("ĐÚNG", { exact: true }).waitFor({ state: "visible" });
      expect(await page.getByText("Bạn chọn · Sai").count()).toBe(0);
      expect(await page.locator('[data-testid="selected-option-feedback"]').count()).toBe(0);
      expect(
        await page.locator('[data-option-label="A"]').getByText("Đáp án đúng").count()
      ).toBe(1);

      const bodyText = await page.evaluate(() => document.body.innerText);
      expect(countExactOccurrences(bodyText, whyCorrect)).toBe(1);

      const toggleBtn = page.locator('[data-testid="explanation-details-toggle"]');
      expect(await toggleBtn.getAttribute("aria-expanded")).toBe("false");
      expect(
        await page.locator('[data-testid="remaining-options-analysis"]').count()
      ).toBe(0);

      await assertZeroOverflowAndA11y(page, "correct 1280px");
      await maybeCaptureScreenshot(page, "correct-1280.png");

      await page.setViewportSize({ width: 360, height: 740 });
      await assertZeroOverflowAndA11y(page, "correct 360px");
      await maybeCaptureScreenshot(page, "correct-360.png");

      // Mở lời giải khi trả lời đúng -> hiện phân tích các phương án A-D
      await toggleBtn.click();
      const remaining = page.locator('[data-testid="remaining-options-analysis"]');
      await remaining.waitFor({ state: "visible" });
      expect(await remaining.locator('[data-analysis-option="A"]').textContent()).toContain(
        "chậm nhất vào một mốc thời gian"
      );
      expect(await remaining.locator('[data-analysis-option="B"]').textContent()).toContain(
        "kể từ một mốc quá khứ"
      );
      expect(await remaining.locator('[data-analysis-option="C"]').textContent()).toContain(
        "ba đối tượng trở lên"
      );
      expect(await remaining.locator('[data-analysis-option="D"]').textContent()).toContain(
        "không chỉ hạn chót"
      );
    } finally {
      await session.close();
    }
  }, 15_000);

  it("thao tác bàn phím: A để chọn, Enter để nộp, focus ở nút mở lời giải bấm Enter để mở/đóng mà không sang câu, Enter ngoài nút mới sang câu 2", async () => {
    mockSubmitAnswer.mockResolvedValueOnce({
      result: {
        is_correct: false,
        selected_index: 0,
        correct_index: 2,
        explanation: parseExplanation({
          rule_vi: "Cấu trúc mạo từ + tính từ + danh từ.",
          why_correct_vi: "Cần tính từ 'brief' đứng trước 'summary'.",
          full_translation_vi: "Ông Tanaka đã trình bày bản tóm tắt ngắn gọn.",
          example_en: "She gave a brief update.",
          why_wrong_vi: [
            { option: "A", reason_vi: "briefly là trạng từ." },
          ],
        }),
      },
    });

    const session = await openPracticeSession([Q1_WORD_FORM, Q2_TENSES], {
      width: 1280,
      height: 800,
    });
    try {
      const { page } = session;

      // 1. Nhấn A chọn phương án A -> aria-checked=true
      await page.keyboard.press("a");
      expect(
        await page
          .locator('[data-option-label="A"] button[role="radio"]')
          .getAttribute("aria-checked")
      ).toBe("true");

      // 2. Nhấn Enter để nộp bài
      await page.keyboard.press("Enter");
      await page.locator('[data-testid="selected-option-feedback"]').waitFor({
        state: "visible",
      });

      // 3. Focus tới nút mở lời giải bằng Tab -> kiểm tra thực sự focus được tới nút
      const toggleBtn = page.locator('[data-testid="explanation-details-toggle"]');
      let reachedToggle = false;
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press("Tab");
        const isToggleFocused = await toggleBtn.evaluate(
          (el) => document.activeElement === el
        );
        if (isToggleFocused) {
          reachedToggle = true;
          break;
        }
      }
      expect(reachedToggle).toBe(true);
      expect(await toggleBtn.getAttribute("aria-expanded")).toBe("false");

      // 4. Bấm Enter khi đang focus ở nút mở lời giải -> mở lời giải và VẪN ở Câu 1
      await page.keyboard.press("Enter");
      expect(await toggleBtn.getAttribute("aria-expanded")).toBe("true");
      await page.locator('[data-testid="explanation-details-panel"]').waitFor({
        state: "visible",
      });
      expect(await page.locator("header").textContent()).toContain("Câu 1 / 2");

      // 5. Bấm Enter lần nữa khi vẫn focus ở nút -> đóng lời giải và VẪN ở Câu 1
      await page.keyboard.press("Enter");
      expect(await toggleBtn.getAttribute("aria-expanded")).toBe("false");
      expect(
        await page.locator('[data-testid="explanation-details-panel"]').count()
      ).toBe(0);
      expect(await page.locator("header").textContent()).toContain("Câu 1 / 2");

      // 6. Focus về vùng kết quả không phải nút -> nhấn Enter để chuyển sang Câu 2
      await page.locator('[tabindex="-1"]').first().focus();
      await page.keyboard.press("Enter");
      await page.getByText(Q2_TENSES.stem).waitFor({ state: "visible" });
      expect(await page.locator("header").textContent()).toContain("Câu 2 / 2");
    } finally {
      await session.close();
    }
  }, 15_000);

  it("Finding 1 (parser -> UI): why_wrong_vi: [{ option: 'A' }] thiếu reason_vi không hiện câu chung chung; ưu tiên options_analysis.A rồi fallback why_correct_vi đúng 1 lần", async () => {
    const whyCorrect =
      "Sau động từ khuyết thiếu bị động 'must be' phải dùng quá khứ phân từ 'reviewed'.";

    // Kịch bản A: Có options_analysis.A thật -> ưu tiên hiện phân tích của A, bỏ qua A khi mở phân tích còn lại
    mockSubmitAnswer.mockResolvedValueOnce({
      result: {
        is_correct: false,
        selected_index: 0,
        correct_index: 2,
        explanation: parseExplanation({
          why_wrong_vi: [{ option: "A" }],
          options_analysis: {
            A: "review là động từ nguyên mẫu, không hợp sau trợ động từ bị động 'be'.",
            B: "reviewing mang nghĩa chủ động tiếp diễn.",
          },
          why_correct_vi: whyCorrect,
          rule_vi: "Bị động với modal verb: modal + be + V3/ed.",
        }),
      },
    });

    const sessionWithAnalysis = await openPracticeSession([Q3_MISSING_OPTION_REASON]);
    try {
      const { page } = sessionWithAnalysis;
      await page.locator('[data-option-label="A"] button[role="radio"]').click();
      await page.getByRole("button", { name: "Nộp đáp án" }).click();

      const inlineFeedback = page.locator('[data-testid="selected-option-feedback"]');
      await inlineFeedback.waitFor({ state: "visible" });

      expect(await inlineFeedback.textContent()).toContain(
        "review là động từ nguyên mẫu"
      );
      expect(
        await page
          .getByText("Phương án này không phù hợp với cấu trúc ngữ pháp của câu.")
          .count()
      ).toBe(0);

      await page.locator('[data-testid="explanation-details-toggle"]').click();
      const remaining = page.locator('[data-testid="remaining-options-analysis"]');
      await remaining.waitFor({ state: "visible" });
      expect(await remaining.locator('[data-analysis-option="A"]').count()).toBe(0);
      expect(await remaining.locator('[data-analysis-option="B"]').textContent()).toContain(
        "reviewing mang nghĩa chủ động tiếp diễn."
      );
    } finally {
      await sessionWithAnalysis.close();
    }

    // Kịch bản B: Không có options_analysis.A -> dùng why_correct_vi đúng 1 lần ngay dưới A, không hiện câu chung chung
    mockSubmitAnswer.mockResolvedValueOnce({
      result: {
        is_correct: false,
        selected_index: 0,
        correct_index: 2,
        explanation: parseExplanation({
          why_wrong_vi: [{ option: "A" }],
          why_correct_vi: whyCorrect,
          rule_vi: "Bị động với modal verb: modal + be + V3/ed.",
        }),
      },
    });

    const sessionFallback = await openPracticeSession([Q3_MISSING_OPTION_REASON]);
    try {
      const { page } = sessionFallback;
      await page.locator('[data-option-label="A"] button[role="radio"]').click();
      await page.getByRole("button", { name: "Nộp đáp án" }).click();

      const inlineFeedback = page.locator('[data-testid="selected-option-feedback"]');
      await inlineFeedback.waitFor({ state: "visible" });

      expect(await inlineFeedback.textContent()).toContain(whyCorrect);
      expect(
        await page
          .getByText("Phương án này không phù hợp với cấu trúc ngữ pháp của câu.")
          .count()
      ).toBe(0);
      const bodyText = await page.evaluate(() => document.body.innerText);
      expect(countExactOccurrences(bodyText, whyCorrect)).toBe(1);
    } finally {
      await sessionFallback.close();
    }
  }, 15_000);

  it("Finding 3: DrillRunner và PracticeResultView vẫn hiển thị ngay bản dịch toàn câu mà không bắt bấm mở rộng", async () => {
    const sharedTranslation =
      "Ông Tanaka đã trình bày một bản tóm tắt ngắn gọn về kết quả tài chính quý.";
    const sharedItem: SessionReviewItem = {
      question_id: "q-shared-1",
      order_index: 1,
      stem: Q1_WORD_FORM.stem,
      option_a: Q1_WORD_FORM.option_a,
      option_b: Q1_WORD_FORM.option_b,
      option_c: Q1_WORD_FORM.option_c,
      option_d: Q1_WORD_FORM.option_d,
      tag_name_vi: "Từ loại (Word Form)",
      selected_index: 0,
      correct_index: 2,
      is_correct: false,
      explanation: parseExplanation({
        rule_vi: "Mạo từ + tính từ + danh từ.",
        why_correct_vi: "Cần tính từ 'brief' đứng trước danh từ 'summary'.",
        full_translation_vi: sharedTranslation,
        tip_vi: "Nhìn danh từ đứng sau chỗ trống.",
      }),
    };

    const context: BrowserContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page: Page = await context.newPage();

    try {
      await page.route("http://practice.test/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "text/html; charset=utf-8",
          body: `<!doctype html>
            <html lang="vi">
              <head>
                <meta charset="utf-8" />
                <style>
                  :root {
                    --font-be-vietnam-pro: "Segoe UI", system-ui, -apple-system, Arial, sans-serif;
                    --font-jetbrains-mono: Consolas, "Courier New", monospace;
                  }
                  ${compiledCss}
                </style>
              </head>
              <body class="min-h-dvh bg-[var(--color-bg-page)] text-[var(--color-text-primary)] font-sans">
                <div id="root"></div>
              </body>
            </html>`,
        });
      });

      // 1. Kiểm tra DrillRunner
      await page.goto("http://practice.test/drill");
      await page.addScriptTag({ content: bundledScript });
      await page.evaluate((items) => {
        (
          window as unknown as { __mountDrill: (i: SessionReviewItem[]) => void }
        ).__mountDrill(items);
      }, [sharedItem]);

      await page.getByRole("radio").first().click();
      await page.getByRole("button", { name: "Kiểm tra đáp án" }).click();

      const drillTranslation = page.locator('[data-testid="visible-translation"]');
      await drillTranslation.waitFor({ state: "visible" });
      expect(await drillTranslation.textContent()).toContain(sharedTranslation);
      expect(
        await page
          .locator('[data-testid="explanation-details-toggle"]')
          .getAttribute("aria-expanded")
      ).toBe("false");

      // 2. Kiểm tra PracticeResultView
      const reviewPayload: SessionReviewResponse = {
        session_id: "sess-result",
        total_questions: 1,
        completed_at: "2026-11-20T07:05:00.000Z",
        created_at: "2026-11-20T07:00:00.000Z",
        correct_count: 0,
        attempts: [sharedItem],
      };

      await page.evaluate((review) => {
        (
          window as unknown as { __mountResult: (r: SessionReviewResponse) => void }
        ).__mountResult(review);
      }, reviewPayload);

      await page
        .getByRole("button", {
          name: /Xem giải thích chi tiết & phân tích 4 phương án/,
        })
        .click();

      const resultTranslation = page.locator('[data-testid="visible-translation"]');
      await resultTranslation.waitFor({ state: "visible" });
      expect(await resultTranslation.textContent()).toContain(sharedTranslation);
      expect(
        await page
          .locator('[data-testid="explanation-details-toggle"]')
          .getAttribute("aria-expanded")
      ).toBe("false");
    } finally {
      await page.evaluate(() => {
        (
          window as unknown as { __unmountPractice?: () => void }
        ).__unmountPractice?.();
      });
      await context.close();
    }
  }, 15_000);
});
