"use client";

import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface ExamPassageViewerProps {
  docType?: string | null;
  title?: string | null;
  content: string;
}

export function ExamPassageViewer({
  docType,
  title,
  content,
}: ExamPassageViewerProps) {
  return (
    <Card className="p-5 bg-white border border-[#E2E8F0] shadow-2xs space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-[#F1F5F9]">
        <FileText className="w-4 h-4 text-[#2563EB]" />
        <span className="text-xs font-bold text-[#0F172A] uppercase">
          {docType || "Văn bản bài đọc"}
        </span>
        {title && (
          <span className="text-xs text-[#475569] truncate">
            — {title}
          </span>
        )}
      </div>

      <div className="text-sm text-[#0F172A] leading-relaxed whitespace-pre-line font-serif bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0] max-h-[360px] overflow-y-auto">
        {content}
      </div>
    </Card>
  );
}
