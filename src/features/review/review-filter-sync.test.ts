import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import type { ReactElement } from "react";
import type { Browser, Page } from "@playwright/test";
import type { Plugin } from "esbuild";
import type { Notebook } from "@/features/vocab/types";
import type { ReviewCardItem, ReviewTopicInfo } from "./types";
import {
  bundleBrowserHarness,
  launchTestChromium,
} from "../../../tests/helpers/chromium-react-harness";

// Mock server-only dependencies of Server Component `ReviewPage` (no React/hook mocks!)
const mockRequireUser = vi.fn();
const mockGetReviewCardsAction = vi.fn();
const mockGetReviewTopicsAction = vi.fn();
const mockSubmitCardRatingAction = vi.fn();
const mockGetNotebooksAction = vi.fn();

vi.mock("@/shared/auth", () => ({
  requireUser: (opts: unknown) => mockRequireUser(opts),
}));

vi.mock("@/features/review/actions", () => ({
  getReviewCardsAction: (opts: unknown) => mockGetReviewCardsAction(opts),
  getReviewTopicsAction: (notebookId?: string) => mockGetReviewTopicsAction(notebookId),
  submitCardRatingAction: (cardId: string, rating: 1 | 2 | 3 | 4) =>
    mockSubmitCardRatingAction(cardId, rating),
}));

vi.mock("@/features/vocab/actions", () => ({
  getNotebooksAction: () => mockGetNotebooksAction(),
}));

import ReviewPage from "@/app/review/page";

interface SerializedReviewRoute {
  reactKey: string;
  props: Record<string, unknown>;
}

function makeCard(id: string, word: string, meaning = `Nghĩa ${word}`): ReviewCardItem {
  return {
    id,
    vocab_entry_id: `v-${id}`,
    user_id: "user-1",
    word,
    lemma: word.toLowerCase(),
    meaning,
    context_sentence: `Sentence containing ${word}.`,
    part_of_speech: "noun",
    state: 0,
    stability: 1,
    difficulty: 5,
    due: "2026-11-20T00:00:00.000Z",
    reps: 0,
    lapses: 0,
    previews: [
      { rating: 1, ratingLabel: "Lại", intervalText: "1 phút", due: new Date("2026-11-20T00:01:00.000Z") },
      { rating: 2, ratingLabel: "Khó", intervalText: "5 phút", due: new Date("2026-11-20T00:05:00.000Z") },
      { rating: 3, ratingLabel: "Tốt", intervalText: "1 ngày", due: new Date("2026-11-21T00:00:00.000Z") },
      { rating: 4, ratingLabel: "Dễ", intervalText: "4 ngày", due: new Date("2026-11-24T00:00:00.000Z") },
    ],
  };
}

const NOTEBOOKS: Notebook[] = [
  {
    id: "nb-1",
    user_id: "user-1",
    name: "600 Essential Words",
    color: "#2563EB",
    icon: "book",
    word_count: 50,
    created_at: "2026-01-01T00:00:00Z",
  },
];

const TOPICS: ReviewTopicInfo[] = [
  { name: "Marketing", totalCount: 12, dueCount: 0, learnedCount: 0 },
  { name: "Contracts", totalCount: 15, dueCount: 3, learnedCount: 2 },
];

function parseReviewSearchParams(url: string): Record<string, string | undefined> {
  const parsed = new URL(url, "http://review.test");
  return {
    notebookId: parsed.searchParams.get("notebookId") ?? undefined,
    topic: parsed.searchParams.get("topic") ?? undefined,
    limit: parsed.searchParams.get("limit") ?? undefined,
    studyAll: parsed.searchParams.get("studyAll") ?? undefined,
    excludeDeck: parsed.searchParams.get("excludeDeck") ?? undefined,
  };
}

function serializePageElement(el: ReactElement): SerializedReviewRoute {
  return {
    reactKey: String(el.key ?? ""),
    props: JSON.parse(JSON.stringify(el.props)) as Record<string, unknown>,
  };
}

const REVIEW_BROWSER_PLUGINS: Plugin[] = [
  {
    name: "review-next-and-actions-shims",
    setup(pluginBuild) {
      pluginBuild.onResolve({ filter: /^next\/navigation$/ }, () => ({
        path: "next/navigation",
        namespace: "review-browser-shim",
      }));
      pluginBuild.onResolve({ filter: /^next\/link$/ }, () => ({
        path: "next/link",
        namespace: "review-browser-shim",
      }));
      pluginBuild.onResolve({ filter: /^\.\.\/actions$/ }, (args) => {
        const importer = args.importer.replace(/\\/g, "/");
        if (importer.endsWith("/src/features/review/components/review-view.tsx")) {
          return {
            path: "review-actions-bridge",
            namespace: "review-browser-shim",
          };
        }
        return undefined;
      });

      pluginBuild.onLoad({ filter: /.*/, namespace: "review-browser-shim" }, (args) => {
        if (args.path === "next/navigation") {
          return {
            loader: "ts",
            contents: `
              function navigateWithBridge(url: string) {
                const win = window as unknown as {
                  __reviewRouterPush?: (u: string) => Promise<unknown>;
                  __applyReviewRoute?: (route: unknown) => void;
                };
                if (!win.__reviewRouterPush) return;
                void win.__reviewRouterPush(url).then((nextRoute) => {
                  if (nextRoute && win.__applyReviewRoute) {
                    window.history.pushState(null, "", url);
                    win.__applyReviewRoute(nextRoute);
                  }
                });
              }

              export function useRouter() {
                return {
                  push: navigateWithBridge,
                  replace: navigateWithBridge,
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
        if (args.path === "review-actions-bridge") {
          return {
            loader: "ts",
            contents: `
              export async function submitCardRatingAction(cardId: string, rating: 1 | 2 | 3 | 4) {
                const fn = (window as unknown as {
                  __reviewSubmitRating?: (c: string, r: 1 | 2 | 3 | 4) => Promise<unknown>;
                }).__reviewSubmitRating;
                if (!fn) throw new Error("Missing __reviewSubmitRating bridge");
                return fn(cardId, rating);
              }
              export async function getReviewCardsAction(options?: unknown) {
                const fn = (window as unknown as {
                  __reviewGetCards?: (opts?: unknown) => Promise<unknown>;
                }).__reviewGetCards;
                if (!fn) throw new Error("Missing __reviewGetCards bridge");
                return fn(options);
              }
            `,
          };
        }
        return undefined;
      });
    },
  },
];

describe("Review session config sync & real React 19 / Chromium navigation tests", () => {
  let browser: Browser;
  let bundledScript: string;

  beforeAll(async () => {
    const entryCode = `
      import React from "react";
      import { createRoot, type Root } from "react-dom/client";
      import { ReviewView } from "./src/features/review/components/review-view";

      interface RoutePayload {
        reactKey: string;
        props: Record<string, unknown>;
      }

      function ReviewHarness({ initialRoute }: { initialRoute: RoutePayload }) {
        const [route, setRoute] = React.useState<RoutePayload>(initialRoute);

        React.useLayoutEffect(() => {
          (
            window as unknown as {
              __applyReviewRoute: (nextRoute: RoutePayload) => void;
            }
          ).__applyReviewRoute = (nextRoute: RoutePayload) => {
            setRoute(nextRoute);
          };
        }, []);

        return React.createElement(ReviewView, {
          ...(route.props as Parameters<typeof ReviewView>[0]),
          key: route.reactKey,
        });
      }

      let root: Root | null = null;

      (
        window as unknown as {
          __mountReviewRoute: (initialRoute: RoutePayload) => void;
        }
      ).__mountReviewRoute = (initialRoute: RoutePayload) => {
        const el = document.getElementById("root");
        if (!el) throw new Error("Missing #root");
        if (!root) root = createRoot(el);
        root.render(React.createElement(ReviewHarness, { initialRoute }));
      };

      (window as unknown as { __unmountReviewApp: () => void }).__unmountReviewApp = () => {
        if (root) {
          root.unmount();
          root = null;
        }
      };
    `;

    const [script, launched] = await Promise.all([
      bundleBrowserHarness(entryCode, REVIEW_BROWSER_PLUGINS),
      launchTestChromium(),
    ]);
    bundledScript = script;
    browser = launched;
  }, 30_000);

  afterAll(async () => {
    await browser?.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireUser.mockResolvedValue({ id: "user-1" });
    mockGetNotebooksAction.mockResolvedValue(NOTEBOOKS);
    mockGetReviewTopicsAction.mockResolvedValue({ topics: TOPICS });
    mockSubmitCardRatingAction.mockResolvedValue({
      success: true,
      isShortTermLearningStep: false,
      nextDue: "2026-11-25T00:00:00.000Z",
    });
  });

  async function openReviewSession(initialUrl: string) {
    let currentUrl = initialUrl;
    let latestRoute = serializePageElement(
      (await ReviewPage({
        searchParams: Promise.resolve(parseReviewSearchParams(currentUrl)),
      })) as ReactElement
    );

    const page: Page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
    });

    await page.route("http://review.test/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html; charset=utf-8",
        body: '<!doctype html><html><body><div id="root"></div></body></html>',
      });
    });

    await page.exposeFunction("__reviewRouterPush", async (nextUrl: string) => {
      // App Router does not reload Server Component when target matches current URL
      if (nextUrl === currentUrl) {
        return null;
      }
      currentUrl = nextUrl;
      latestRoute = serializePageElement(
        (await ReviewPage({
          searchParams: Promise.resolve(parseReviewSearchParams(nextUrl)),
        })) as ReactElement
      );
      return latestRoute;
    });

    await page.exposeFunction(
      "__reviewSubmitRating",
      async (cardId: string, rating: 1 | 2 | 3 | 4) => mockSubmitCardRatingAction(cardId, rating)
    );

    await page.exposeFunction("__reviewGetCards", async (opts?: unknown) =>
      mockGetReviewCardsAction(opts)
    );

    await page.goto(`http://review.test${initialUrl}`);
    await page.addScriptTag({ content: bundledScript });
    await page.evaluate((route) => {
      (
        window as unknown as {
          __mountReviewRoute: (r: SerializedReviewRoute) => void;
        }
      ).__mountReviewRoute(route);
    }, latestRoute);
    await page.waitForFunction(
      () =>
        typeof (window as unknown as { __applyReviewRoute?: unknown })
          .__applyReviewRoute === "function"
    );

    return {
      page,
      getCurrentUrl: () => currentUrl,
      getLatestRoute: () => latestRoute,
      rateCardViaDom: async (word: string, rating: 1 | 2 | 3 | 4 = 3) => {
        const input = page.getByPlaceholder("Nhập từ tiếng Anh...");
        await input.fill(word);
        await page.getByRole("button", { name: /Kiểm tra đáp án/ }).click();
        const ratingPattern =
          rating === 1
            ? /\[1\]\s*Lại/
            : rating === 2
              ? /\[2\]\s*Khó/
              : rating === 3
                ? /\[3\]\s*Tốt/
                : /\[4\]\s*Dễ/;
        await page.getByRole("button", { name: ratingPattern }).click();
      },
      applyRouteInPlace: async (nextRoute: SerializedReviewRoute) => {
        latestRoute = nextRoute;
        await page.evaluate((route) => {
          (
            window as unknown as {
              __applyReviewRoute: (r: SerializedReviewRoute) => void;
            }
          ).__applyReviewRoute(route);
        }, nextRoute);
      },
      close: async () => {
        await page.evaluate(() => {
          (window as unknown as { __unmountReviewApp?: () => void }).__unmountReviewApp?.();
        });
        await page.close();
      },
    };
  }

  it("a) queue ban đầu rỗng [] → bật studyAll qua ReviewSetupModal & nút Ôn lại trước hạn → tải có thẻ", async () => {
    const cramCards = [makeCard("c1", "revenue"), makeCard("c2", "invoice")];

    mockGetReviewCardsAction.mockImplementation(async (opts: { studyAll?: boolean }) => ({
      cards: opts?.studyAll ? cramCards : [],
      totalCardsCount: 2,
      nextDueFormatted: "Ngày mai",
    }));

    const session = await openReviewSession("/review?limit=15");
    try {
      const { page } = session;
      await page
        .getByText("Bạn đã hoàn thành toàn bộ thẻ đến hạn hôm nay")
        .waitFor({ state: "visible" });
      await page.getByText("THẺ 0 / 0").waitFor({ state: "visible" });

      await page.locator("header").getByRole("button", { name: /Tùy chỉnh/ }).click();
      const modal = page.locator("div.fixed");
      const toggle = modal.locator("#review-study-all-toggle");
      expect(await toggle.getAttribute("aria-checked")).toBe("false");

      await toggle.click();
      expect(await toggle.getAttribute("aria-checked")).toBe("true");

      await modal.getByRole("button", { name: /Bắt đầu ôn tập/ }).click();

      await page.getByText("THẺ 1 / 2").waitFor({ state: "visible" });
      await page.getByText("Nghĩa revenue").waitFor({ state: "visible" });
      expect(session.getCurrentUrl()).toBe("/review?limit=15&studyAll=true");
      expect(new URL(page.url()).search).toBe("?limit=15&studyAll=true");
    } finally {
      await session.close();
    }

    // Also verify empty-state Primary CTA "Ôn lại trước hạn" navigates & loads cram cards
    const directSession = await openReviewSession("/review?limit=15");
    try {
      const { page } = directSession;
      await page.getByRole("button", { name: /Ôn lại trước hạn/ }).click();
      await page.getByText("THẺ 1 / 2").waitFor({ state: "visible" });
      await page.getByText("Nghĩa revenue").waitFor({ state: "visible" });
      expect(directSession.getCurrentUrl()).toBe("/review?limit=15&studyAll=true");
    } finally {
      await directSession.close();
    }
  }, 20_000);

  it("b) đổi notebook / topic / limit / studyAll → cập nhật queue mới và reset index, completion, summary, error (cả router và in-place props)", async () => {
    const initialCards = [makeCard("a1", "contract"), makeCard("a2", "clause")];
    const filteredCards = [makeCard("b1", "warranty"), makeCard("b2", "claim")];

    mockGetReviewCardsAction.mockImplementation(
      async (opts: {
        notebookId?: string;
        topic?: string;
        limit?: number;
        studyAll?: boolean;
      }) => {
        if (
          opts?.notebookId === "nb-1" &&
          opts?.topic === "Contracts" &&
          opts?.limit === 25 &&
          opts?.studyAll
        ) {
          return {
            cards: filteredCards,
            totalCardsCount: 2,
            notebookName: "600 Essential Words",
            topicName: "Contracts",
          };
        }
        return { cards: initialCards, totalCardsCount: 2 };
      }
    );

    const session = await openReviewSession("/review?limit=15");
    const firstKey = session.getLatestRoute().reactKey;
    try {
      const { page } = session;
      await page.getByText("Nghĩa contract").waitFor({ state: "visible" });

      // Rate card 1 -> advances to card 2, then trigger rating error on card 2
      await session.rateCardViaDom("contract", 3);
      await page.getByText("THẺ 2 / 2").waitFor({ state: "visible" });
      await page.getByText("Đã thuộc: 1/2").waitFor({ state: "visible" });

      mockSubmitCardRatingAction.mockResolvedValueOnce({
        success: false,
        error: "Lỗi tạm thời khi chấm thẻ",
      });
      await session.rateCardViaDom("clause", 3);
      await page.getByText("Lỗi tạm thời khi chấm thẻ").waitFor({ state: "visible" });

      // Change notebook, topic, limit, studyAll via modal
      await page.locator("header").getByRole("button", { name: /Tùy chỉnh/ }).click();
      const modal = page.locator("div.fixed");
      await modal.getByRole("button", { name: /600 Essential Words/ }).click();
      await modal.getByRole("button", { name: /Contracts/ }).click();
      await modal.getByRole("button", { name: /25 từ/ }).click();
      await modal.locator("#review-study-all-toggle").click();
      await modal.getByRole("button", { name: /Bắt đầu ôn tập/ }).click();

      await page.getByText("Nghĩa warranty").waitFor({ state: "visible" });
      await page.getByText("THẺ 1 / 2").waitFor({ state: "visible" });
      await page.getByText("Đã thuộc: 0/2").waitFor({ state: "visible" });
      expect(await page.getByText("Lỗi tạm thời khi chấm thẻ").count()).toBe(0);
      expect(session.getCurrentUrl()).toBe(
        "/review?notebookId=nb-1&topic=Contracts&limit=25&studyAll=true"
      );
      expect(session.getLatestRoute().reactKey).not.toBe(firstKey);
    } finally {
      await session.close();
    }

    // Complete 2-card session (isSessionComplete = true), then switch filter -> completion & summary must reset
    const completeSession = await openReviewSession("/review?limit=15");
    try {
      const { page } = completeSession;
      await sessionRateTwoCards(completeSession);
      await page.getByText("Hoàn thành phiên ôn tập!").waitFor({ state: "visible" });
      await page.getByText(/2 lượt ôn luyện/).waitFor({ state: "visible" });

      await page.locator("header").getByRole("button", { name: /Tùy chỉnh/ }).click();
      const modal = page.locator("div.fixed");
      await modal.getByRole("button", { name: /600 Essential Words/ }).click();
      await modal.getByRole("button", { name: /Contracts/ }).click();
      await modal.getByRole("button", { name: /25 từ/ }).click();
      await modal.locator("#review-study-all-toggle").click();
      await modal.getByRole("button", { name: /Bắt đầu ôn tập/ }).click();

      await page.getByText("Nghĩa warranty").waitFor({ state: "visible" });
      await page.getByText("THẺ 1 / 2").waitFor({ state: "visible" });
      await page.getByText("Đã thuộc: 0/2").waitFor({ state: "visible" });
      expect(await page.getByText("Hoàn thành phiên ôn tập!").count()).toBe(0);
    } finally {
      await completeSession.close();
    }

    // Also test in-place props update on the SAME mounted React instance (same reactKey, changed filterKey)
    const inPlaceSession = await openReviewSession("/review?limit=15");
    try {
      const { page } = inPlaceSession;
      await inPlaceSession.applyRouteInPlace({
        reactKey: "same-react-instance",
        props: {
          filterKey: "| |15|due|".replace(" ", ""),
          initialCards: [makeCard("x1", "alpha"), makeCard("x2", "beta")],
          totalCardsCount: 2,
          currentLimit: 15,
          currentStudyAll: false,
          notebooks: NOTEBOOKS,
          topics: TOPICS,
        },
      });
      await page.getByText("Nghĩa alpha").waitFor({ state: "visible" });
      await inPlaceSession.rateCardViaDom("alpha", 3);
      await page.getByText("THẺ 2 / 2").waitFor({ state: "visible" });

      mockSubmitCardRatingAction.mockResolvedValueOnce({
        success: false,
        error: "Lỗi đánh giá cũ",
      });
      await inPlaceSession.rateCardViaDom("beta", 3);
      await page.getByText("Lỗi đánh giá cũ").waitFor({ state: "visible" });

      await inPlaceSession.applyRouteInPlace({
        reactKey: "same-react-instance",
        props: {
          filterKey: "nb-1|Contracts|25|all|",
          notebookId: "nb-1",
          currentTopic: "Contracts",
          currentLimit: 25,
          currentStudyAll: true,
          initialCards: [makeCard("y1", "gamma")],
          totalCardsCount: 1,
          notebooks: NOTEBOOKS,
          topics: TOPICS,
        },
      });

      await page.getByText("Nghĩa gamma").waitFor({ state: "visible" });
      await page.getByText("THẺ 1 / 1").waitFor({ state: "visible" });
      await page.getByText("Đã thuộc: 0/1").waitFor({ state: "visible" });
      expect(await page.getByText("Lỗi đánh giá cũ").count()).toBe(0);
    } finally {
      await inPlaceSession.close();
    }
  }, 25_000);

  async function sessionRateTwoCards(
    session: Awaited<ReturnType<typeof openReviewSession>>
  ) {
    await session.rateCardViaDom("contract", 3);
    await session.page.getByText("Nghĩa clause").waitFor({ state: "visible" });
    await session.rateCardViaDom("clause", 3);
  }

  it("c) rerender cùng cấu hình (cùng key và filterKey) → giữ nguyên tiến độ phiên đang học", async () => {
    mockGetReviewCardsAction.mockResolvedValue({
      cards: [makeCard("r1", "agenda"), makeCard("r2", "budget")],
      totalCardsCount: 2,
      notebookName: "600 Essential Words",
      topicName: "Contracts",
    });

    const session = await openReviewSession(
      "/review?notebookId=nb-1&topic=Contracts&limit=15&studyAll=true"
    );
    try {
      const { page } = session;
      const routeSnapshot = session.getLatestRoute();

      await page.getByText("Nghĩa agenda").waitFor({ state: "visible" });
      await session.rateCardViaDom("agenda", 3);
      await page.getByText("THẺ 2 / 2").waitFor({ state: "visible" });
      await page.getByText("Đã thuộc: 1/2").waitFor({ state: "visible" });
      await page.getByText("Nghĩa budget").waitFor({ state: "visible" });

      // Re-render real React 19 root with same reactKey & filterKey and fresh card array reference
      await session.applyRouteInPlace({
        reactKey: routeSnapshot.reactKey,
        props: {
          ...routeSnapshot.props,
          initialCards: JSON.parse(
            JSON.stringify([makeCard("r1", "agenda"), makeCard("r2", "budget")])
          ),
        },
      });

      await page.getByText("THẺ 2 / 2").waitFor({ state: "visible" });
      await page.getByText("Đã thuộc: 1/2").waitFor({ state: "visible" });
      await page.getByText("Nghĩa budget").waitFor({ state: "visible" });
    } finally {
      await session.close();
    }
  }, 15_000);

  it("d) mở /review?limit=15 → chọn 'Marketing' ở sidebar → mở Tùy chỉnh chọn lại tất cả chủ đề với limit=15, studyAll=false → tải đúng queue ban đầu", async () => {
    const allDueCards = [makeCard("all-1", "dispatch"), makeCard("all-2", "invoice")];
    const marketingCards = [makeCard("mkt-1", "campaign"), makeCard("mkt-2", "brand")];

    mockGetReviewCardsAction.mockImplementation(
      async (opts: { topic?: string; limit?: number; studyAll?: boolean }) => {
        if (opts?.topic === "Marketing") {
          return {
            cards: marketingCards,
            totalCardsCount: 2,
            topicName: "Marketing",
          };
        }
        return {
          cards: allDueCards,
          totalCardsCount: 2,
        };
      }
    );

    const session = await openReviewSession("/review?limit=15");
    try {
      const { page } = session;
      await page.getByText("Nghĩa dispatch").waitFor({ state: "visible" });

      // Select "Marketing" in desktop sidebar -> navigates URL & loads Marketing queue
      await page.locator("aside").getByRole("button", { name: /Marketing/ }).click();
      await page.getByText("Nghĩa campaign").waitFor({ state: "visible" });
      expect(session.getCurrentUrl()).toBe("/review?topic=Marketing&limit=15");

      // Advance 1 card in Marketing and trigger an error to verify full reset on return
      await session.rateCardViaDom("campaign", 3);
      await page.getByText("THẺ 2 / 2").waitFor({ state: "visible" });
      mockSubmitCardRatingAction.mockResolvedValueOnce({
        success: false,
        error: "Lỗi trong phiên Marketing",
      });
      await session.rateCardViaDom("brand", 3);
      await page.getByText("Lỗi trong phiên Marketing").waitFor({ state: "visible" });

      // Open setup modal -> re-select "Tất cả chủ điểm" keeping limit=15, studyAll=false
      await page.locator("header").getByRole("button", { name: /Tùy chỉnh/ }).click();
      const modal = page.locator("div.fixed");
      expect(
        await modal.locator("#review-study-all-toggle").getAttribute("aria-checked")
      ).toBe("false");
      await modal.getByRole("button", { name: /Tất cả chủ điểm/ }).click();
      await modal.getByRole("button", { name: /Bắt đầu ôn tập/ }).click();

      // Target URL differs from /review?topic=Marketing&limit=15, so ReviewPage reloads /review?limit=15
      await page.getByText("Nghĩa dispatch").waitFor({ state: "visible" });
      await page.getByText("THẺ 1 / 2").waitFor({ state: "visible" });
      await page.getByText("Đã thuộc: 0/2").waitFor({ state: "visible" });
      expect(await page.getByText("Nghĩa campaign").count()).toBe(0);
      expect(await page.getByText("Lỗi trong phiên Marketing").count()).toBe(0);
      expect(session.getCurrentUrl()).toBe("/review?limit=15");
      expect(new URL(page.url()).search).toBe("?limit=15");
    } finally {
      await session.close();
    }
  }, 20_000);

  it("e) giữ nguyên excludeDeck=it-vocab khi đổi limit hoặc studyAll qua ReviewSetupModal và không tự thêm exclusion khi URL gốc không có", async () => {
    const coreToeicCards = [
      makeCard("core-1", "procurement"),
      makeCard("core-2", "shipment"),
    ];
    const allWithItCards = [
      makeCard("it-1", "refactor"),
      makeCard("core-1", "procurement"),
    ];

    mockGetReviewCardsAction.mockImplementation(
      async (opts: { excludeDeck?: string; limit?: number; studyAll?: boolean }) => ({
        cards: opts?.excludeDeck === "it-vocab" ? coreToeicCards : allWithItCards,
        totalCardsCount: 2,
      })
    );

    const excludedSession = await openReviewSession("/review?limit=15&excludeDeck=it-vocab");
    try {
      const { page } = excludedSession;
      await page.getByText("Nghĩa procurement").waitFor({ state: "visible" });
      expect(mockGetReviewCardsAction).toHaveBeenLastCalledWith(
        expect.objectContaining({ limit: 15, studyAll: false, excludeDeck: "it-vocab" })
      );

      // Change limit to 25 -> must keep excludeDeck=it-vocab
      await page.locator("header").getByRole("button", { name: /Tùy chỉnh/ }).click();
      let modal = page.locator("div.fixed");
      await modal.getByRole("button", { name: /25 từ/ }).click();
      await modal.getByRole("button", { name: /Bắt đầu ôn tập/ }).click();

      await page.waitForFunction(
        () => new URL(window.location.href).search === "?limit=25&excludeDeck=it-vocab"
      );
      expect(excludedSession.getCurrentUrl()).toBe(
        "/review?limit=25&excludeDeck=it-vocab"
      );
      expect(mockGetReviewCardsAction).toHaveBeenLastCalledWith(
        expect.objectContaining({ limit: 25, studyAll: false, excludeDeck: "it-vocab" })
      );
      await page.getByText("Nghĩa procurement").waitFor({ state: "visible" });

      // Toggle studyAll ON -> must still keep excludeDeck=it-vocab
      await page.locator("header").getByRole("button", { name: /Tùy chỉnh/ }).click();
      modal = page.locator("div.fixed");
      await modal.locator("#review-study-all-toggle").click();
      await modal.getByRole("button", { name: /Bắt đầu ôn tập/ }).click();

      await page.waitForFunction(
        () =>
          new URL(window.location.href).search ===
          "?limit=25&studyAll=true&excludeDeck=it-vocab"
      );
      expect(excludedSession.getCurrentUrl()).toBe(
        "/review?limit=25&studyAll=true&excludeDeck=it-vocab"
      );
      expect(mockGetReviewCardsAction).toHaveBeenLastCalledWith(
        expect.objectContaining({ limit: 25, studyAll: true, excludeDeck: "it-vocab" })
      );
      await page.getByText("Nghĩa procurement").waitFor({ state: "visible" });
    } finally {
      await excludedSession.close();
    }

    // Control: when initial URL has no excludeDeck, modal must NOT add one
    const regularSession = await openReviewSession("/review?limit=15");
    try {
      const { page } = regularSession;
      await page.getByText("Nghĩa refactor").waitFor({ state: "visible" });
      expect(mockGetReviewCardsAction).toHaveBeenLastCalledWith(
        expect.objectContaining({ limit: 15, studyAll: false, excludeDeck: undefined })
      );

      await page.locator("header").getByRole("button", { name: /Tùy chỉnh/ }).click();
      const modal = page.locator("div.fixed");
      await modal.getByRole("button", { name: /25 từ/ }).click();
      await modal.getByRole("button", { name: /Bắt đầu ôn tập/ }).click();

      await page.waitForFunction(
        () => new URL(window.location.href).search === "?limit=25"
      );
      expect(regularSession.getCurrentUrl()).toBe("/review?limit=25");
      expect(mockGetReviewCardsAction).toHaveBeenLastCalledWith(
        expect.objectContaining({ limit: 25, studyAll: false, excludeDeck: undefined })
      );
      await page.getByText("Nghĩa refactor").waitFor({ state: "visible" });
    } finally {
      await regularSession.close();
    }
  }, 20_000);
});
