# Issue: Inisialisasi Project Backend (Bun + ElysiaJS + Drizzle ORM + MySQL)

## 1. Deskripsi & Tujuan (Overview)
Inisialisasi dan scaffolding project backend baru berbasis **Bun** dengan framework **ElysiaJS**, ORM **Drizzle**, dan database **MySQL**. 

Dokumen ini disusun sebagai panduan *high-level* untuk programmer atau AI agent yang akan mengeksekusi implementasi, mencakup struktur arsitektur, tahapan eksekusi, serta kriteria keberhasilan.

---

## 2. Tech Stack & Dependencies

- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **Language**: TypeScript
- **Web Framework**: [ElysiaJS](https://elysiajs.com/)
  - Core: `elysia`
  - Rekomendasi Plugin: `@elysiajs/cors`, `@elysiajs/swagger` (dokumentasi API otomatis)
- **Database & ORM**:
  - ORM: `drizzle-orm`
  - CLI & Migration Tool: `drizzle-kit` (dev dependency)
  - Driver: `mysql2`
- **Environment Management**: Environment variables bawaan Bun (`.env`)

---

## 3. High-Level Folder Structure (Rekomendasi)

Implementasi disarankan menggunakan pola modular terstruktur agar mudah dikembangkan:

```text
├── src/
│   ├── config/          # Konfigurasi app & environment variable
│   ├── db/              # Setup koneksi database & Drizzle client
│   │   ├── schema/      # Definisi schema tabel Drizzle
│   │   └── index.ts     # Inisialisasi koneksi db & export instance
│   ├── modules/         # Modul fitur (misal: users, auth, dll.)
│   │   ├── [feature]/   # Controller / route handler & service per fitur
│   ├── middlewares/     # Global error handler, logger, CORS, dll.
│   └── index.ts         # Entry point aplikasi (Elysia instance & server listener)
├── drizzle/             # Folder output migrasi SQL dari drizzle-kit
├── drizzle.config.ts    # File konfigurasi Drizzle Kit
├── .env.example         # Template konfigurasi environment
├── .gitignore           # File ignore untuk git (node_modules, .env, dll.)
├── package.json
├── tsconfig.json
└── README.md
```

---

## 4. Rencana Tahapan Eksekusi (Implementation Milestones)

### Fase 1: Setup Lingkungan & Inisialisasi Project
1. Inisialisasi project Bun pada root direktori (`bun init`).
2. Instalasi dependencies utama (`elysia`, `drizzle-orm`, `mysql2`).
3. Instalasi dev dependencies (`drizzle-kit`, `@types/bun`).
4. Setup konfigurasi TypeScript (`tsconfig.json`) sesuai standar Bun & Elysia.
5. Buat file `.env.example` dan `.env` yang memuat konfigurasi koneksi MySQL (`DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `PORT`).

### Fase 2: Konfigurasi Database & Drizzle ORM
1. Buat koneksi database MySQL menggunakan connection pool (`mysql2/promise`) dan hubungkan ke Drizzle client di `src/db/index.ts`.
2. Buat file konfigurasi Drizzle (`drizzle.config.ts`) yang mengarah ke folder schema dan database credentials.
3. Definisikan minimal satu contoh schema (misalnya tabel `users` atau health log) di `src/db/schema/`.
4. Tambahkan script migrasi pada `package.json` untuk mempermudah eksekusi:
   - `db:generate` (generate file SQL migrasi)
   - `db:migrate` atau `db:push` (menerapkan skema ke MySQL)
   - `db:studio` (Drizzle Studio web UI untuk inspeksi data)

### Fase 3: Setup Server ElysiaJS & Routing
1. Buat instance Elysia di `src/index.ts`.
2. Pasang plugin pendukung (CORS dan Swagger UI untuk OpenAPI documentation).
3. Buat endpoint dasar:
   - `GET /` atau `GET /health` untuk memverifikasi status server & koneksi database.
4. Terapkan pemisahan routing modular (menggunakan `app.group` atau file router terpisah) untuk endpoint API masa depan.
5. Setup *global error handling* standar untuk menangkap error validasi dan database exception.

### Fase 4: Pengujian & Validasi
1. Pastikan server dapat berjalan lancar menggunakan `bun run dev` (dengan hot reload).
2. Verifikasi integrasi Drizzle ke database MySQL (pastikan koneksi berhasil dan query dasar dapat dieksekusi).
3. Verifikasi Swagger docs terbuka dengan benar di browser (misalnya pada `/swagger`).

---

## 5. Acceptance Criteria (Kriteria Selesai)

Project dinyatakan selesai diimplementasikan jika memenuhi checklist berikut:
- [ ] Project berhasil diinisialisasi menggunakan Bun dengan file `package.json` yang rapi.
- [ ] Dependencies ElysiaJS, Drizzle ORM, dan driver MySQL terpasang dan kompatibel.
- [ ] File konfigurasi `drizzle.config.ts` dan koneksi DB sudah siap digunakan.
- [ ] File `.env.example` tersedia dengan dokumentasi variabel environment yang jelas.
- [ ] Server dapat dijalankan dengan perintah `bun --watch src/index.ts` atau script `bun run dev` tanpa error.
- [ ] Endpoint `GET /health` (atau sejenisnya) merespons status `200 OK`.
- [ ] Drizzle Kit dapat melakukan *generate* atau *push* schema ke MySQL.
- [ ] Dokumentasi singkat cara menjalankan dan migrasi database ditulis pada `README.md`.

---

## 6. Catatan untuk Implementer / AI Model
- Gunakan schema type validation bawaan Elysia (`t` dari Elysia / TypeBox) jika membuat endpoint CRUD.
- Hindari hardcode credential database di dalam kode; selalu baca dari `process.env`.
- Jaga kode tetap bersih, modular, dan terstruktur sesuai folder structure yang telah ditentukan.
