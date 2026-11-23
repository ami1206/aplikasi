# Aplikasi Backend API

Project backend berbasis **Bun**, **ElysiaJS**, **Drizzle ORM**, dan **MySQL**.

## Tech Stack
- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [ElysiaJS](https://elysiajs.com/)
- **Database & ORM**: [Drizzle ORM](https://orm.drizzle.team/) & MySQL (`mysql2`)
- **Documentation**: Swagger UI (`@elysiajs/swagger`)

---

## Struktur Folder
```text
├── src/
│   ├── config/          # Konfigurasi app & environment
│   ├── db/              # Setup database & Drizzle
│   │   ├── schema/      # Skema tabel database (Users, dsb.)
│   │   └── index.ts     # Inisialisasi koneksi MySQL pool & Drizzle
│   ├── modules/         # Route handlers & controller per fitur
│   │   ├── health/      # Health check endpoint
│   │   └── users/       # CRUD endpoints pengguna
│   └── index.ts         # Entry point aplikasi & middleware
├── drizzle/             # File migrasi SQL hasil generate Drizzle
├── drizzle.config.ts    # Konfigurasi Drizzle Kit
├── .env.example         # Template environment variables
├── package.json
└── tsconfig.json
```

---

## Memulai (Quick Start)

### 1. Install Dependencies
```bash
bun install
```

### 2. Konfigurasi Environment
Salin template `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Sesuaikan konfigurasi kredensial MySQL (`DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, dsb).

### 3. Database Migration
- Generate migrasi SQL:
  ```bash
  bun run db:generate
  ```
- Push schema ke database secara langsung:
  ```bash
  bun run db:push
  ```
- Buka Drizzle Studio:
  ```bash
  bun run db:studio
  ```

### 4. Menjalankan Server
- **Development (Hot Reload)**:
  ```bash
  bun run dev
  ```
- **Production**:
  ```bash
  bun run start
  ```

---

## Endpoint Utama
- `GET /` : Informasi status API dasar
- `GET /health` : Status kesehatan server & status koneksi database
- `GET /swagger` : Dokumentasi interaktif Swagger / OpenAPI
- `GET /users` : Daftar semua user
- `POST /users` : Membuat user baru (`{ "name": string, "email": string }`)
- `GET /users/:id` : Detail user berdasarkan ID
