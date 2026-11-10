import type { FeedbackCategory, FeedbackStatus } from "./schemas";

export interface UserFeedbackItem {
  id: string;
  userId: string;
  category: FeedbackCategory;
  message: string;
  pagePath: string;
  viewport: string;
  status: FeedbackStatus;
  createdAt: string;
}

export interface TagInventoryStat {
  id: number;
  tagCode: string;
  nameVi: string;
  publishedCount: number;
}

export interface AdminInsightsData {
  usage: {
    profilesCount: number;
    sessionsCount: number;
    completedSessionsCount: number;
    attemptsCount: number;
    examAttemptsCount: number;
    reviewEventsCount: number;
    reportsCount: number;
    reportRatePercent: number;
  };
  eventBreakdown: Array<{ eventName: string; count: number }>;
  content: {
    part5Total: number;
    passageCount: number;
    examSetsCount: number;
    needsReviewCount: number;
    tagStats: TagInventoryStat[];
  };
  feedbacks: UserFeedbackItem[];
}
