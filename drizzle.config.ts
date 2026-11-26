
import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile?.(".env");
} catch {
  // Abaikan jika file .env tidak ada
}

console.log("=== DATABASE CONFIG CHECK ===");
console.log("HOST:", process.env.DATABASE_HOST);
console.log("PORT:", process.env.DATABASE_PORT);
console.log("USER:", process.env.DATABASE_USER);
console.log("PASSWORD SET:", Boolean(process.env.DATABASE_PASSWORD));
console.log("DATABASE:", process.env.DATABASE_NAME);
console.log("=============================");

export default defineConfig({
  dialect: "mysql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    host: process.env.DATABASE_HOST || "127.0.0.1",
    port: Number(process.env.DATABASE_PORT || 3306),
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD ?? "",
    database: process.env.DATABASE_NAME || "aplikasi_db",
  },
});
