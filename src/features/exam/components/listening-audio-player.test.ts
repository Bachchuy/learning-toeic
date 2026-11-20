import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import type { Browser } from "@playwright/test";
import {
  splitSegmentsIntoTtsChunks,
  runSequentialTtsFallback,
  TTS_MAX_CHUNK_CHARS,
  type AudioLike,
  type SpeechSegment,
} from "./listening-audio-player";
import {
  bundleBrowserHarness,
  launchTestChromium,
} from "../../../../tests/helpers/chromium-react-harness";

describe("listening-audio-player fallback TTS chunking & sequential playback (Finding 4)", () => {
  it("chia bài nghe dài (> 700 ký tự) thành các đoạn <= 180 ký tự mà không làm mất chữ", () => {
    const segments: SpeechSegment[] = [
      {
        speaker: "W",
        text: "Good morning everyone, and welcome to the quarterly logistics review for our Asia-Pacific distribution centers. Today we will examine shipping lead times, warehouse automation upgrades, and customs clearance procedures across all regional ports.",
      },
      {
        speaker: "M",
        text: "Thank you, Sarah. As shown on the second slide, our container turnaround time in Da Nang and Singapore improved by eighteen percent after we deployed the barcode scanning workflow in October, and we expect further gains next quarter.",
      },
      {
        speaker: "W2",
        text: "Before we finalize the budget allocation for next fiscal year, please submit your department equipment requests through the internal procurement portal no later than Friday afternoon at five o'clock.",
      },
    ];

    const chunks = splitSegmentsIntoTtsChunks(segments, TTS_MAX_CHUNK_CHARS);

    expect(chunks.length).toBeGreaterThan(3);
    for (const chunk of chunks) {
      expect(chunk.text.length).toBeGreaterThan(0);
      expect(chunk.text.length).toBeLessThanOrEqual(TTS_MAX_CHUNK_CHARS);
    }

    // Ghép lại theo từng segmentIndex phải khớp 100% văn bản gốc (không mất bất kỳ từ nào)
    segments.forEach((seg, segIdx) => {
      const reconstructed = chunks
        .filter((c) => c.segmentIndex === segIdx)
        .map((c) => c.text)
        .join(" ");
      expect(reconstructed).toBe(seg.text.trim().replace(/\s+/g, " "));
    });
  });

  it("cắt an toàn chuỗi đơn không khoảng trắng dài hơn giới hạn mà không bỏ sót ký tự", () => {
    const longToken = "A".repeat(410);
    const chunks = splitSegmentsIntoTtsChunks([{ text: longToken }], 180);

    expect(chunks.map((c) => c.text.length)).toEqual([180, 180, 50]);
    expect(chunks.map((c) => c.text).join("")).toBe(longToken);
  });

  it("phát tuần tự toàn bộ các chunk theo đúng thứ tự và áp dụng tốc độ đọc động", () => {
    const chunks = [
      { segmentIndex: 0, text: "First part of the conversation." },
      { segmentIndex: 0, text: "Second part of the first speaker." },
      { segmentIndex: 1, text: "Response from the second speaker." },
    ];

    const playedUrls: string[] = [];
    const playedRates: number[] = [];
    const startedChunks: Array<[number, number]> = [];
    let currentRate = 1;
    let completed = false;
    let errored = false;

    const fakeAudio: AudioLike = {
      src: "",
      currentTime: 0,
      playbackRate: 1,
      onended: null,
      onerror: null,
      play: vi.fn(async () => {
        playedUrls.push(fakeAudio.src);
        playedRates.push(fakeAudio.playbackRate);
      }),
      pause: vi.fn(),
    };

    runSequentialTtsFallback({
      chunks,
      startChunkIndex: 0,
      audio: fakeAudio,
      getRate: () => currentRate,
      isCancelled: () => false,
      onChunkStart: (chunkIdx, segIdx) => {
        startedChunks.push([chunkIdx, segIdx]);
      },
      onComplete: () => {
        completed = true;
      },
      onError: () => {
        errored = true;
      },
    });

    // Chunk 0 bắt đầu ngay lập tức
    expect(playedUrls).toHaveLength(1);
    expect(decodeURIComponent(playedUrls[0] ?? "")).toContain(chunks[0]!.text);

    // Đổi tốc độ sang 1.15x trước khi chunk 0 kết thúc
    currentRate = 1.15;
    fakeAudio.onended?.(new Event("ended"));

    // Chunk 1 được phát tiếp với tốc độ mới 1.15x
    expect(playedUrls).toHaveLength(2);
    expect(decodeURIComponent(playedUrls[1] ?? "")).toContain(chunks[1]!.text);
    expect(playedRates[1]).toBe(1.15);

    // Chunk 1 kết thúc -> Chunk 2
    fakeAudio.onended?.(new Event("ended"));
    expect(playedUrls).toHaveLength(3);
    expect(decodeURIComponent(playedUrls[2] ?? "")).toContain(chunks[2]!.text);
    expect(completed).toBe(false);

    // Chunk 2 kết thúc -> Hoàn tất toàn bộ hàng đợi
    fakeAudio.onended?.(new Event("ended"));
    expect(completed).toBe(true);
    expect(errored).toBe(false);
    expect(startedChunks).toEqual([
      [0, 0],
      [1, 0],
      [2, 1],
    ]);
  });

  it("dừng ngay lập tức và không phát chunk tiếp theo khi bị hủy (chuyển câu / unmount / pause)", () => {
    const chunks = [
      { segmentIndex: 0, text: "Chunk one." },
      { segmentIndex: 1, text: "Chunk two." },
    ];

    let cancelled = false;
    const playedUrls: string[] = [];
    let completed = false;

    const fakeAudio: AudioLike = {
      src: "",
      currentTime: 0,
      playbackRate: 1,
      onended: null,
      onerror: null,
      play: vi.fn(async () => {
        playedUrls.push(fakeAudio.src);
      }),
      pause: vi.fn(),
    };

    runSequentialTtsFallback({
      chunks,
      startChunkIndex: 0,
      audio: fakeAudio,
      getRate: () => 1,
      isCancelled: () => cancelled,
      onChunkStart: () => {},
      onComplete: () => {
        completed = true;
      },
      onError: () => {},
    });

    expect(playedUrls).toHaveLength(1);

    // Hủy playback trước khi onended của chunk 0 kích hoạt
    cancelled = true;
    fakeAudio.onended?.(new Event("ended"));

    expect(playedUrls).toHaveLength(1);
    expect(completed).toBe(false);
  });

  it("báo lỗi qua onError và dừng phát khi audio.onerror hoặc play() bị từ chối", async () => {
    const chunks = [
      { segmentIndex: 0, text: "Chunk one." },
      { segmentIndex: 1, text: "Chunk two." },
    ];

    let errorCount = 0;
    const fakeAudio: AudioLike = {
      src: "",
      currentTime: 0,
      playbackRate: 1,
      onended: null,
      onerror: null,
      play: vi.fn(async () => {}),
      pause: vi.fn(),
    };

    runSequentialTtsFallback({
      chunks,
      startChunkIndex: 0,
      audio: fakeAudio,
      getRate: () => 1,
      isCancelled: () => false,
      onChunkStart: () => {},
      onComplete: () => {},
      onError: () => {
        errorCount += 1;
      },
    });

    fakeAudio.onerror?.(new Event("error"));
    expect(errorCount).toBe(1);

    // Kiểm tra trường hợp play() reject
    const rejectingAudio: AudioLike = {
      src: "",
      currentTime: 0,
      playbackRate: 1,
      onended: null,
      onerror: null,
      play: vi.fn(async () => {
        throw new Error("NotAllowedError");
      }),
      pause: vi.fn(),
    };

    runSequentialTtsFallback({
      chunks,
      startChunkIndex: 0,
      audio: rejectingAudio,
      getRate: () => 1,
      isCancelled: () => false,
      onChunkStart: () => {},
      onComplete: () => {},
      onError: () => {
        errorCount += 1;
      },
    });

    await Promise.resolve();
    expect(errorCount).toBe(2);
  });
});

interface PlayerMountProps {
  title: string;
  audioUrl?: string;
  segments: SpeechSegment[];
}

interface AudioInstanceSnapshot {
  src: string;
  currentTime: number;
  playbackRate: number;
  paused: boolean;
  playCalls: number;
  pauseCalls: number;
  hasOnEnded: boolean;
  hasOnError: boolean;
}

describe("ListeningAudioPlayer — real React 19 + Chromium browser regressions", () => {
  let browser: Browser;
  let bundledScript: string;

  beforeAll(async () => {
    const entryCode = `
      import React from "react";
      import { createRoot } from "react-dom/client";
      import { ListeningAudioPlayer } from "./src/features/exam/components/listening-audio-player";

      const container = document.getElementById("root");
      let root = container ? createRoot(container) : null;

      window.__mountPlayer = (props) => {
        const el = document.getElementById("root");
        if (!el) throw new Error("Missing #root");
        if (!root) root = createRoot(el);
        root.render(React.createElement(ListeningAudioPlayer, props));
      };

      window.__unmountPlayer = () => {
        if (root) {
          root.unmount();
          root = null;
        }
      };
    `;

    const [script, launched] = await Promise.all([
      bundleBrowserHarness(entryCode),
      launchTestChromium(),
    ]);
    bundledScript = script;
    browser = launched;
  }, 30_000);

  afterAll(async () => {
    await browser?.close();
  });

  async function setupPlayerPage(props: PlayerMountProps) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.setContent(
      '<!doctype html><html><body><div id="root"></div></body></html>'
    );

    await page.evaluate(() => {
      interface StubAudioInstance {
        src: string;
        currentTime: number;
        playbackRate: number;
        paused: boolean;
        ended: boolean;
        playCalls: number;
        pauseCalls: number;
        onended: ((ev: Event) => unknown) | null;
        onerror: ((ev: Event | string) => unknown) | null;
        play: () => Promise<void>;
        pause: () => void;
      }

      const instances: StubAudioInstance[] = [];
      (window as unknown as { __audioInstances: StubAudioInstance[] }).__audioInstances =
        instances;

      class MockBrowserAudio implements StubAudioInstance {
        src: string;
        currentTime = 0;
        playbackRate = 1;
        paused = true;
        ended = false;
        playCalls = 0;
        pauseCalls = 0;
        onended: ((ev: Event) => unknown) | null = null;
        onerror: ((ev: Event | string) => unknown) | null = null;

        constructor(src = "") {
          this.src = src;
          instances.push(this);
        }

        play() {
          this.paused = false;
          this.playCalls += 1;
          return Promise.resolve();
        }

        pause() {
          this.paused = true;
          this.pauseCalls += 1;
        }
      }

      (window as unknown as { Audio: typeof MockBrowserAudio }).Audio = MockBrowserAudio;
    });

    await page.addScriptTag({ content: bundledScript });
    await page.evaluate((initialProps) => {
      (
        window as unknown as { __mountPlayer: (p: PlayerMountProps) => void }
      ).__mountPlayer(initialProps);
    }, props);

    return page;
  }

  async function getAudioSnapshot(
    page: Awaited<ReturnType<Browser["newPage"]>>,
    index: number
  ): Promise<AudioInstanceSnapshot> {
    return page.evaluate((idx) => {
      const list = (
        window as unknown as {
          __audioInstances: Array<{
            src: string;
            currentTime: number;
            playbackRate: number;
            paused: boolean;
            playCalls: number;
            pauseCalls: number;
            onended: ((ev: Event) => unknown) | null;
            onerror: ((ev: Event | string) => unknown) | null;
          }>;
        }
      ).__audioInstances;
      const inst = list[idx];
      if (!inst) {
        throw new Error(`Missing __audioInstances[${idx}]`);
      }
      return {
        src: inst.src,
        currentTime: inst.currentTime,
        playbackRate: inst.playbackRate,
        paused: inst.paused,
        playCalls: inst.playCalls,
        pauseCalls: inst.pauseCalls,
        hasOnEnded: typeof inst.onended === "function",
        hasOnError: typeof inst.onerror === "function",
      };
    }, index);
  }

  it("restores audio.onerror on replay and resets playback status + displays error notice when error fires after play() resolves", async () => {
    const page = await setupPlayerPage({
      title: "Part 3 · Câu 32–34",
      audioUrl: "/audio/part3-q32.mp3",
      segments: [{ speaker: "W", text: "Good morning everyone." }],
    });

    try {
      // 1. Initial play
      await page.getByRole("button", { name: "Nghe đoạn audio" }).click();
      await page.getByText("Đang phát...").waitFor({ state: "visible" });
      await page.getByRole("button", { name: "Tạm dừng audio" }).waitFor({ state: "visible" });
      await page.evaluate(() => new Promise((r) => setTimeout(r, 0)));

      // 2. Click "Nghe lại từ đầu" — stopPlayback clears handlers first, handleReplay must restore onerror
      await page.getByRole("button", { name: "Nghe lại từ đầu" }).click();
      await page.getByText("Đang phát...").waitFor({ state: "visible" });

      // Wait until play() promise has resolved before dispatching the media error
      await page.evaluate(() => new Promise((r) => setTimeout(r, 0)));

      const beforeError = await getAudioSnapshot(page, 0);
      expect(beforeError.playCalls).toBe(2);
      expect(beforeError.currentTime).toBe(0);
      expect(beforeError.hasOnError).toBe(true);
      expect(beforeError.hasOnEnded).toBe(true);

      // 3. Dispatch media error after play() resolved
      await page.evaluate(() => {
        const list = (
          window as unknown as {
            __audioInstances: Array<{
              onerror: ((ev: Event) => unknown) | null;
            }>;
          }
        ).__audioInstances;
        list[0]?.onerror?.(new Event("error"));
      });

      await page.getByRole("button", { name: "Nghe đoạn audio" }).waitFor({ state: "visible" });
      expect(await page.getByText("Đang phát...").count()).toBe(0);
      await page
        .getByText("Không tải được file âm thanh của câu này.")
        .waitFor({ state: "visible" });

      // 4. Subsequent replay clears previous error notice and keeps onerror attached
      await page.getByRole("button", { name: "Nghe lại từ đầu" }).click();
      await page.getByText("Đang phát...").waitFor({ state: "visible" });
      await page.evaluate(() => new Promise((r) => setTimeout(r, 0)));
      expect(await page.getByText("Không tải được file âm thanh của câu này.").count()).toBe(0);

      await page.evaluate(() => {
        const list = (
          window as unknown as {
            __audioInstances: Array<{
              onerror: ((ev: Event) => unknown) | null;
            }>;
          }
        ).__audioInstances;
        list[0]?.onerror?.(new Event("error"));
      });

      await page.getByRole("button", { name: "Nghe đoạn audio" }).waitFor({ state: "visible" });
      await page
        .getByText("Không tải được file âm thanh của câu này.")
        .waitFor({ state: "visible" });
    } finally {
      await page.close();
    }
  }, 15_000);

  it("preserves pause/resume, dynamic speed changes, question switch cleanup, and unmount cleanup in real React DOM", async () => {
    const page = await setupPlayerPage({
      title: "Part 3 · Câu 32–34",
      audioUrl: "/audio/part3-q32.mp3",
      segments: [{ speaker: "W", text: "Please review the schedule." }],
    });

    try {
      await page.getByRole("button", { name: "Nghe đoạn audio" }).click();
      await page.getByText("Đang phát...").waitFor({ state: "visible" });

      // Speed change while playing
      await page.getByRole("button", { name: "1.15x" }).click();
      expect(
        await page.getByRole("button", { name: "1.15x" }).getAttribute("aria-pressed")
      ).toBe("true");
      expect((await getAudioSnapshot(page, 0)).playbackRate).toBe(1.15);

      // Pause & resume
      await page.getByRole("button", { name: "Tạm dừng audio" }).click();
      await page.getByRole("button", { name: "Nghe tiếp" }).waitFor({ state: "visible" });
      expect((await getAudioSnapshot(page, 0)).pauseCalls).toBe(1);

      await page.getByRole("button", { name: "Nghe tiếp" }).click();
      await page.getByText("Đang phát...").waitFor({ state: "visible" });
      expect((await getAudioSnapshot(page, 0)).playbackRate).toBe(1.15);

      // Switch to next question (new audioUrl -> useEffect cleanup runs on old instance)
      await page.evaluate(() => {
        (
          window as unknown as { __mountPlayer: (p: PlayerMountProps) => void }
        ).__mountPlayer({
          title: "Part 4 · Câu 71–73",
          audioUrl: "/audio/part4-q71.mp3",
          segments: [{ speaker: "M", text: "Attention passengers." }],
        });
      });

      await page.getByText("Part 4 · Câu 71–73").waitFor({ state: "visible" });
      await page.getByRole("button", { name: "Nghe đoạn audio" }).waitFor({ state: "visible" });

      const firstAfterSwitch = await getAudioSnapshot(page, 0);
      expect(firstAfterSwitch.paused).toBe(true);
      expect(firstAfterSwitch.hasOnEnded).toBe(false);
      expect(firstAfterSwitch.hasOnError).toBe(false);

      // Start playback on new question and verify cleanup on unmount
      await page.getByRole("button", { name: "Nghe đoạn audio" }).click();
      await page.getByText("Đang phát...").waitFor({ state: "visible" });

      await page.evaluate(() => {
        (window as unknown as { __unmountPlayer: () => void }).__unmountPlayer();
      });

      const secondAfterUnmount = await getAudioSnapshot(page, 1);
      expect(secondAfterUnmount.paused).toBe(true);
      expect(secondAfterUnmount.hasOnEnded).toBe(false);
      expect(secondAfterUnmount.hasOnError).toBe(false);
    } finally {
      await page.close();
    }
  }, 15_000);
});
