export interface ReviewSessionConfig {
  notebookId?: string;
  topic?: string;
  limit: number;
  studyAll: boolean;
  excludeDeck?: string;
}

export function parseReviewLimit(raw?: string): number {
  const parsed = raw ? parseInt(raw, 10) : 15;
  return Number.isFinite(parsed) ? Math.min(100, Math.max(1, parsed)) : 15;
}

export function buildReviewFilterKey(config: ReviewSessionConfig): string {
  return [
    config.notebookId ?? "",
    config.topic ?? "",
    String(config.limit),
    config.studyAll ? "all" : "due",
    config.excludeDeck ?? "",
  ].join("|");
}

export function buildReviewUrl(config: ReviewSessionConfig): string {
  const params = new URLSearchParams();
  if (config.notebookId) params.set("notebookId", config.notebookId);
  if (config.topic) params.set("topic", config.topic);
  const safeLimit =
    config.limit > 0 ? Math.min(100, Math.max(1, Math.trunc(config.limit))) : 100;
  params.set("limit", String(safeLimit));
  if (config.studyAll) params.set("studyAll", "true");
  if (config.excludeDeck) params.set("excludeDeck", config.excludeDeck);
  return `/review?${params.toString()}`;
}
