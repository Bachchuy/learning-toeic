"use client";

import React from "react";

interface StreakFlameProps {
  streak?: number;
  size?: "sm" | "md" | "lg" | "xl";
  isLitToday?: boolean;
  className?: string;
  animate?: boolean;
}

/**
 * Biểu tượng Lửa Streak phong cách Duolingo
 * - Khi streak > 0: Ngọn lửa chuyển sắc đỏ-cam-vàng rực rỡ kèm lõi nhiệt phát sáng
 * - Khi isLitToday = true: Hiệu ứng tỏa sáng ấm áp (warm fire glow) và đốm lửa nhảy múa
 * - Khi streak = 0: Lửa xám ngủ đông (chờ thắp sáng hôm nay)
 */
export function StreakFlame({
  streak = 0,
  size = "md",
  isLitToday = false,
  className = "",
  animate = true,
}: StreakFlameProps) {
  const isBurning = streak > 0;

  const sizePixels = {
    sm: 24,
    md: 36,
    lg: 48,
    xl: 60,
  }[size];

  // ID duy nhất cho gradient SVG để tránh trùng lặp khi render nhiều component
  const uniqueId = React.useId().replace(/:/g, "");

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${
        isBurning && animate ? "hover:scale-110 transition-transform duration-300" : ""
      } ${className}`}
      style={{ width: sizePixels, height: sizePixels }}
      aria-label={`Chuỗi học tập: ${streak} ngày`}
      role="img"
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full overflow-visible ${
          isBurning && animate ? "animate-[flame-flicker_2.4s_ease-in-out_infinite]" : ""
        }`}
      >
        <defs>
          {/* 1. Gradient thân lửa ngoài: Đỏ rực -> Cam tươi -> Vàng cam */}
          <linearGradient
            id={`flameOuter-${uniqueId}`}
            x1="32"
            y1="2"
            x2="35"
            y2="60"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FF3333" />
            <stop offset="30%" stopColor="#FF5722" />
            <stop offset="70%" stopColor="#FF9800" />
            <stop offset="100%" stopColor="#FFB300" />
          </linearGradient>

          {/* 2. Gradient lõi lửa trong: Vàng chanh phát sáng -> Cam vàng */}
          <linearGradient
            id={`flameInner-${uniqueId}`}
            x1="35"
            y1="28"
            x2="35"
            y2="52"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFF9C4" />
            <stop offset="35%" stopColor="#FFEE58" />
            <stop offset="80%" stopColor="#FFCA28" />
            <stop offset="100%" stopColor="#FFA000" />
          </linearGradient>

          {/* 3. Lửa xám khi streak = 0 */}
          <linearGradient
            id={`flameMuted-${uniqueId}`}
            x1="32"
            y1="2"
            x2="35"
            y2="60"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="50%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          {/* 4. Bộ lọc ánh sáng rực rỡ (Drop Shadow / Glow) */}
          <filter id={`flameGlow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation="3.5"
              floodColor="#FF5722"
              floodOpacity={isLitToday ? "0.45" : "0.25"}
            />
          </filter>
        </defs>

        {/* LỚP 1: THÂN LỬA CHÍNH (Outer Flame Body) */}
        <path
          d="M32 2C32 2 24.5 11.5 24.5 21C24.5 25.5 27 29.5 30 32C23.5 31.2 18 36.5 18 43C18 52.4 25.6 60 35 60C44.4 60 52 52.4 52 43C52 30.5 41.5 21.5 41.5 21.5C41.5 21.5 43.5 27 41 29.5C38.5 32 33.5 28 33.5 21C33.5 12 32 2 32 2Z"
          fill={isBurning ? `url(#flameOuter-${uniqueId})` : `url(#flameMuted-${uniqueId})`}
          filter={isBurning ? `url(#flameGlow-${uniqueId})` : undefined}
        />

        {/* LỚP 2: LÕI NHIỆT RỰC SÁNG (Inner Core Heart) */}
        {isBurning ? (
          <path
            d="M35 28C35 28 30 34 30 39C30 43.5 32.5 47 35 47C37.5 47 40 43.5 40 39C40 34.5 37 31.5 37 31.5C37 31.5 38 33.5 37 35C36 36.5 34 35 34 33C34 30.5 35 28 35 28Z"
            fill={`url(#flameInner-${uniqueId})`}
            opacity="0.95"
          />
        ) : (
          <path
            d="M35 32C32.5 32 30.5 34 30.5 37C30.5 41 33 44 35 44C37 44 39.5 41 39.5 37C39.5 34 37.5 32 35 32Z"
            fill="#FFFFFF"
            opacity="0.4"
          />
        )}

        {/* LỚP 3: CÁC ĐỐM LỬA / TIA LỬA BẮN LÊN (Embers / Sparks) */}
        {isBurning && (
          <>
            {/* Đốm lửa nhỏ bên trái */}
            <circle
              cx="20"
              cy="16"
              r="2"
              fill="#FFA000"
              className={animate ? "animate-[flame-spark_2s_ease-in-out_infinite]" : ""}
              opacity="0.85"
            />
            {/* Đốm lửa nhỏ bên phải */}
            <circle
              cx="45"
              cy="13"
              r="2.5"
              fill="#FF5722"
              className={animate ? "animate-[flame-spark_2.5s_ease-in-out_infinite_0.4s]" : ""}
              opacity="0.9"
            />
            {/* Đốm lửa bay cao phía trên */}
            <circle
              cx="33"
              cy="0"
              r="1.5"
              fill="#FFD54F"
              className={animate ? "animate-[flame-spark_1.8s_ease-in-out_infinite_0.8s]" : ""}
              opacity="0.8"
            />
          </>
        )}
      </svg>
    </div>
  );
}
