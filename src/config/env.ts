export const config = {
  port: Number(process.env.PORT) || 3000,
  database: {
    host: process.env.DATABASE_HOST || "127.0.0.1",
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "aplikasi_db",
  },
};
