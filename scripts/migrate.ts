import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// 1. Đọc biến môi trường từ .env.local nếu chưa có
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...values] = trimmed.split("=");
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = values.join("=").trim();
      }
    }
  }
}

// 2. Xác định Database URL: Ưu tiên tham số dòng lệnh --url, sau đó đến biến DATABASE_URL
let dbUrl = process.env.DATABASE_URL;

for (const arg of process.argv.slice(2)) {
  if (arg.startsWith("--url=")) {
    dbUrl = arg.slice(6).trim();
  }
}

if (!dbUrl) {
  console.error("❌ LỖI: Không tìm thấy chuỗi kết nối DATABASE_URL!");
  console.error("👉 Vui lòng điền DATABASE_URL vào file .env.local");
  console.error("   Hoặc truyền trực tiếp: npm run db:migrate -- --url=\"postgresql://...\"");
  process.exit(1);
}

// Ẩn mật khẩu khi log ra màn hình
const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");

console.log("==================================================================");
console.log("🐘 BẮT ĐẦU TỰ ĐỘNG HÓA MIGRATION SCHEMA CHO DATABASE");
console.log(`🎯 Đích: ${maskedUrl}`);
console.log("📁 Thư mục nguồn: supabase/migrations/*.sql");
console.log("==================================================================\n");

try {
  // Thực thi lệnh supabase db push với URL chỉ định
  const command = `npx supabase db push --db-url "${dbUrl}" --include-all --yes`;
  
  execSync(command, {
    stdio: "inherit",
    env: { ...process.env },
  });

  console.log("\n✅ HOÀN TẤT THÀNH CÔNG!");
  console.log("✨ Toàn bộ bảng, RLS policies, trigger và hàm RPC đã được áp dụng tự động.");
} catch (error) {
  console.error("\n❌ LỖI TRONG QUÁ TRÌNH MIGRATION:", error);
  process.exit(1);
}
