"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export const LEARN_PROGRESS_STORAGE_KEY = "toeic_learn_progress_v1";
const LEARN_PROGRESS_CHANGE_EVENT = "toeic:learn-progress-changed";
const EMPTY_RAW_SNAPSHOT = "{}";

export interface StoredExerciseAttempt {
  isCorrect: boolean;
  selectedIndex?: number;
  typedAnswer?: string;
}

export interface TopicLearnProgress {
  solved: Record<string, StoredExerciseAttempt>;
  recallMode: boolean;
}

export type LearnProgressStore = Record<string, TopicLearnProgress>;

const EMPTY_TOPIC_PROGRESS: TopicLearnProgress = {
  solved: {},
  recallMode: false,
};

function isValidAttempt(value: unknown): value is StoredExerciseAttempt {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (typeof record.isCorrect !== "boolean") return false;

  const hasValidMcq =
    typeof record.selectedIndex === "number" &&
    Number.isInteger(record.selectedIndex) &&
    record.selectedIndex >= 0 &&
    record.selectedIndex <= 3;

  const hasValidTyped =
    typeof record.typedAnswer === "string" &&
    record.typedAnswer.trim().length > 0;

  return hasValidMcq || hasValidTyped;
}

/**
 * Giải mã chuỗi JSON từ localStorage thành LearnProgressStore an toàn.
 * Không bao giờ ném lỗi ngay cả khi dữ liệu trình duyệt bị hỏng hoặc sai schema.
 */
export function parseLearnProgressStore(raw: string): LearnProgressStore {
  if (!raw || raw === EMPTY_RAW_SNAPSHOT) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const result: LearnProgressStore = {};
    for (const [tagCode, entry] of Object.entries(
      parsed as Record<string, unknown>
    )) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        continue;
      }
      const entryObj = entry as Record<string, unknown>;
      const solved: Record<string, StoredExerciseAttempt> = {};
      if (
        entryObj.solved &&
        typeof entryObj.solved === "object" &&
        !Array.isArray(entryObj.solved)
      ) {
        for (const [exId, attempt] of Object.entries(
          entryObj.solved as Record<string, unknown>
        )) {
          if (isValidAttempt(attempt)) {
            solved[exId] = attempt;
          }
        }
      }
      result[tagCode] = {
        solved,
        recallMode: Boolean(entryObj.recallMode),
      };
    }
    return result;
  } catch {
    return {};
  }
}

export function applyExerciseResultToStore(
  store: LearnProgressStore,
  tagCode: string,
  exerciseId: string,
  attempt: StoredExerciseAttempt
): LearnProgressStore {
  const prevTopic = store[tagCode] ?? EMPTY_TOPIC_PROGRESS;
  return {
    ...store,
    [tagCode]: {
      ...prevTopic,
      solved: {
        ...prevTopic.solved,
        [exerciseId]: attempt,
      },
    },
  };
}

export function clearExerciseResultFromStore(
  store: LearnProgressStore,
  tagCode: string,
  exerciseId: string
): LearnProgressStore {
  const prevTopic = store[tagCode];
  if (!prevTopic || !(exerciseId in prevTopic.solved)) {
    return store;
  }
  const nextSolved = { ...prevTopic.solved };
  delete nextSolved[exerciseId];
  return {
    ...store,
    [tagCode]: {
      ...prevTopic,
      solved: nextSolved,
    },
  };
}

export function setTopicRecallModeInStore(
  store: LearnProgressStore,
  tagCode: string,
  recallMode: boolean
): LearnProgressStore {
  const prevTopic = store[tagCode] ?? EMPTY_TOPIC_PROGRESS;
  return {
    ...store,
    [tagCode]: {
      ...prevTopic,
      recallMode,
    },
  };
}

export function resetTopicProgressInStore(
  store: LearnProgressStore,
  tagCode: string
): LearnProgressStore {
  const prevTopic = store[tagCode];
  if (!prevTopic) return store;
  return {
    ...store,
    [tagCode]: {
      ...prevTopic,
      solved: {},
    },
  };
}

function readRawSnapshot(): string {
  if (typeof window === "undefined") return EMPTY_RAW_SNAPSHOT;
  try {
    return window.localStorage.getItem(LEARN_PROGRESS_STORAGE_KEY) || EMPTY_RAW_SNAPSHOT;
  } catch {
    return EMPTY_RAW_SNAPSHOT;
  }
}

function writeStore(nextStore: LearnProgressStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      LEARN_PROGRESS_STORAGE_KEY,
      JSON.stringify(nextStore)
    );
    window.dispatchEvent(new Event(LEARN_PROGRESS_CHANGE_EVENT));
  } catch {
    // Bỏ qua an toàn nếu trình duyệt chặn storage (private mode / quota exceeded)
  }
}

function subscribeToLearnProgress(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === LEARN_PROGRESS_STORAGE_KEY) {
      onStoreChange();
    }
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(LEARN_PROGRESS_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(LEARN_PROGRESS_CHANGE_EVENT, onStoreChange);
  };
}

function getServerSnapshot(): string {
  return EMPTY_RAW_SNAPSHOT;
}

/**
 * Đọc toàn bộ tiến độ tự luyện lý thuyết (chỉ lưu localStorage phía client,
 * tách biệt hoàn toàn với bảng attempts và Mastery trên DB).
 */
export function useAllLearnProgress(): LearnProgressStore {
  const raw = useSyncExternalStore(
    subscribeToLearnProgress,
    readRawSnapshot,
    getServerSnapshot
  );
  return useMemo(() => parseLearnProgressStore(raw), [raw]);
}

/**
 * Hook quản lý tiến độ và chế độ Ẩn dịch cho một chủ điểm cụ thể.
 */
export function useLearnTopicProgress(tagCode: string) {
  const store = useAllLearnProgress();
  const topicProgress = store[tagCode] ?? EMPTY_TOPIC_PROGRESS;

  const recordExerciseResult = useCallback(
    (exerciseId: string, attempt: StoredExerciseAttempt) => {
      const current = parseLearnProgressStore(readRawSnapshot());
      writeStore(
        applyExerciseResultToStore(current, tagCode, exerciseId, attempt)
      );
    },
    [tagCode]
  );

  const clearExerciseResult = useCallback(
    (exerciseId: string) => {
      const current = parseLearnProgressStore(readRawSnapshot());
      writeStore(clearExerciseResultFromStore(current, tagCode, exerciseId));
    },
    [tagCode]
  );

  const setRecallMode = useCallback(
    (enabled: boolean) => {
      const current = parseLearnProgressStore(readRawSnapshot());
      writeStore(setTopicRecallModeInStore(current, tagCode, enabled));
    },
    [tagCode]
  );

  const resetProgress = useCallback(() => {
    const current = parseLearnProgressStore(readRawSnapshot());
    writeStore(resetTopicProgressInStore(current, tagCode));
  }, [tagCode]);

  return {
    solved: topicProgress.solved,
    recallMode: topicProgress.recallMode,
    recordExerciseResult,
    clearExerciseResult,
    setRecallMode,
    resetProgress,
  };
}
