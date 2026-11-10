import { z } from "zod";

export const FeedbackCategorySchema = z.enum([
  "bug",
  "ux",
  "content",
  "feature",
  "other",
]);

export type FeedbackCategory = z.infer<typeof FeedbackCategorySchema>;

export const FeedbackStatusSchema = z.enum(["new", "reviewed", "resolved"]);

export type FeedbackStatus = z.infer<typeof FeedbackStatusSchema>;

export const SubmitFeedbackSchema = z.object({
  category: FeedbackCategorySchema,
  message: z
    .string()
    .trim()
    .min(5, "Vui lòng nhập ít nhất 5 ký tự để mô tả góp ý.")
    .max(2000, "Nội dung góp ý tối đa 2000 ký tự."),
  pagePath: z.string().trim().max(255).optional().default(""),
  viewport: z.string().trim().max(64).optional().default(""),
});

export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackSchema>;
