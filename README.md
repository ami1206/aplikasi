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
│   ├── routes/          # Routing ElysiaJS (users-route.ts, dsb.)
│   ├── services/        # Business logic aplikasi (users-service.ts, dsb.)
│   ├── modules/         # Modul pendukung (health check, dsb.)
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

### 4. Menjalankan Server & Testing
- **Development (Hot Reload)**:
  ```bash
  bun run dev
  ```
- **Menjalankan Unit Test**:
  ```bash
  bun test
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
- `POST /api/users` : Registrasi akun pengguna baru (password otomatis di-hash dengan bcrypt)
  - **Body**: `{ "name": "Ami", "email": "ami915@gmail.com", "password": "rahasia" }`
  - **Success**: `{ "data": "OK" }`
  - **Error (Duplicate)**: `{ "error": "Email sudah terdaftar" }`
- `POST /api/users/login` : Autentikasi pengguna & pembuatan token session UUID
  - **Body**: `{ "email": "ami915@gmail.com", "password": "rahasia" }`
  - **Success**: `{ "data": "<token-uuid>" }`
  - **Error**: `{ "error": "Email atau password salah" }`
- `GET /api/users/current` : Mengambil data pengguna yang sedang login berdasarkan Bearer Token
  - **Header**: `Authorization: Bearer <token>`
  - **Success**: `{ "data": { "id": 1, "name": "ami", "email": "ami915@gmail.com", "created_at": "timestamp" } }`
  - **Error**: `{ "error": "Unauthorized" }`
- `DELETE /api/users/logout` : Logout pengguna dan menghapus sesi token dari database
  - **Header**: `Authorization: Bearer <token>`
  - **Success**: `{ "data": "OK" }`
  - **Error**: `{ "error": "Unauthorized" }`
