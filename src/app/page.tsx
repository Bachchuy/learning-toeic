"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const [inputValue, setInputValue] = useState("");
  const [hasError, setHasError] = useState(false);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* ========================================================
          Header Section
          ======================================================== */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="mastered">Milestone 2</Badge>
            <span className="text-xs font-mono text-[#475569]">Design Tokens & Core UI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            Precision Swiss LearningGrid
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            Hệ thống Design Tokens và thư viện linh kiện giao diện nền tảng cho TOEIC AI.
          </p>
        </div>

        {/* Bất biến: Mỗi màn hình chỉ MỘT nút Primary duy nhất */}
        <div>
          <Link href="/practice/new">
            <Button variant="primary" size="cta">
              Bắt đầu luyện ngay →
            </Button>
          </Link>
        </div>
      </section>

      {/* ========================================================
          1. Badges & 3-Layer Signal Showcase (WCAG AA Compliance)
          ======================================================== */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>1. Trạng thái Độ vững (3-Layer Status Signals)</CardTitle>
            <CardDescription>
              Quy tắc bất biến: Không dùng màu làm tín hiệu duy nhất. Luôn kết hợp Ký hiệu + Chữ + Màu viền/nền.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2.5 items-center">
            <Badge variant="mastered" />
            <Badge variant="proficient" />
            <Badge variant="needs_review" />
            <Badge variant="insufficient" />
            <Badge variant="info">Chế độ ôn lại tạm thời (Drill)</Badge>
          </CardContent>
        </Card>
      </section>

      {/* ========================================================
          2. Button Variants & Standards
          ======================================================== */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>2. Nút bấm (Button Variants & Heights)</CardTitle>
            <CardDescription>
              Primary (48px CTA chính), Secondary (44px phụ, viền #8190A6), Ghost (44px), Destructive (vùng nguy hiểm).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => setHasError(!hasError)}>
              Toggle Input Error
            </Button>
            <Button variant="ghost">Nút Ghost</Button>
            <Button variant="destructive">Xóa tài khoản</Button>
            <Button variant="secondary" disabled>
              Vô hiệu hóa (40%)
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* ========================================================
          3. Input Components (WCAG Contrast & Mobile 16px)
          ======================================================== */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>3. Ô nhập liệu (Input Form Field)</CardTitle>
            <CardDescription>
              Chiều cao 44px, viền #8190A6 (đạt độ tương phản 3.24:1 trên nền trắng), font 16px chống iOS tự phóng to.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email đăng nhập"
              type="email"
              placeholder="linh.tran@example.com"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              hint="Dùng email để đồng bộ tiến trình học tập"
              error={hasError ? "Email hoặc mật khẩu không đúng" : undefined}
            />

            <Input
              label="Điểm mục tiêu (Target Score)"
              type="text"
              readOnly
              value="750 / 990 (Chỉ đọc)"
              disabled
              hint="Trạng thái vô hiệu hóa (disabled / read-only)"
            />
          </CardContent>
        </Card>
      </section>

      {/* ========================================================
          4. Swiss Grid Flat Card Style
          ======================================================== */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="text-center p-4">
            <div className="text-xs font-mono text-[#475569] uppercase tracking-wider">
              Chuỗi ngày học
            </div>
            <div className="text-3xl font-mono font-bold text-[#0F172A] my-1">
              7 <span className="text-sm font-normal text-[#475569]">ngày</span>
            </div>
            <span className="text-xs text-[#047857] font-medium font-mono">Đạt mục tiêu tuần</span>
          </Card>

          <Card className="text-center p-4">
            <div className="text-xs font-mono text-[#475569] uppercase tracking-wider">
              Thẻ cần ôn hôm nay
            </div>
            <div className="text-3xl font-mono font-bold text-[#2563EB] my-1">
              14 <span className="text-sm font-normal text-[#475569]">thẻ FSRS</span>
            </div>
            <span className="text-xs text-[#475569] font-mono">Đến hạn ngắt quãng</span>
          </Card>

          <Card className="text-center p-4">
            <div className="text-xs font-mono text-[#475569] uppercase tracking-wider">
              Độ vững trung bình
            </div>
            <div className="text-3xl font-mono font-bold text-[#0F172A] my-1">
              82<span className="text-sm font-normal text-[#475569]">%</span>
            </div>
            <span className="text-xs text-[#047857] font-medium font-mono">Wilson z=1.96</span>
          </Card>
        </div>
      </section>
    </div>
  );
}
