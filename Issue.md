# Issue: Implementasi Fitur Registrasi Pengguna Baru (POST /api/users)

## 1. Ringkasan & Tujuan Fitur
Menambahkan fitur registrasi akun pengguna baru ke dalam backend API. Fitur ini mencakup penyesuaian skema database `users` dengan enkripsi password (bcrypt), pemisahan arsitektur ke layer `routes` dan `services`, serta validasi request & response sesuai kontrak API yang telah ditentukan.

Dokumen perencanaan ini dirancang secara terstruktur dan terperinci sebagai panduan teknis yang siap dieksekusi oleh junior programmer atau AI model.

---

## 2. Spesifikasi Database (Tabel `users`)

Tabel `users` pada MySQL harus memiliki struktur kolom sebagai berikut:

| Nama Kolom   | Tipe Data      | Atribut / Constraint                    | Keterangan                             |
| ------------ | -------------- | --------------------------------------- | -------------------------------------- |
| `id`         | `INTEGER`      | Primary Key, Auto Increment             | Identitas unik user                   |
| `name`       | `VARCHAR(255)` | `NOT NULL`                              | Nama lengkap user                      |
| `email`      | `VARCHAR(255)` | `NOT NULL`, `UNIQUE`                    | Email user (tidak boleh duplikat)      |
| `password`   | `VARCHAR(255)` | `NOT NULL`                              | Hasil hash password menggunakan bcrypt |
| `created_at` | `TIMESTAMP`    | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP`| Waktu akun dibuat                      |

> **Catatan Teknis Enkripsi:** 
> Karena menggunakan runtime **Bun**, hashing bcrypt dapat dilakukan langsung secara native tanpa dependensi tambahan menggunakan:
> ```ts
> await Bun.password.hash(password, {
>   algorithm: "bcrypt",
>   cost: 10,
> });
> ```

---

## 3. Spesifikasi Kontrak API (API Contract)

### Endpoint
`POST /api/users`

### Request Headers
`Content-Type: application/json`

### Request Body
```json
{
  "name": "Ami",
  "email": "ami915@gmail.com",
  "password": "rahasia"
}
```

### Validasi Input (Request Validation)
- `name`: String, wajib diisi (`minLength: 1`)
- `email`: String format email valid, wajib diisi
- `password`: String, wajib diisi (`minLength: 1`)

### Response Body

#### 1. Respons Berhasil (HTTP 200 / 201)
```json
{
  "data": "OK"
}
```

#### 2. Respons Error - Email Duplikat (HTTP 400 / 409)
Jika email yang didaftarkan sudah ada di database:
```json
{
  "error": "Email sudah terdaftar"
}
```

---

## 4. Konvensi Struktur Folder & Penamaan File

Proyek harus memisahkan routing dan logika bisnis ke dalam struktur modular di bawah folder `src/`:

```text
src/
├── routes/
│   └── users-route.ts      # Definisi routing ElysiaJS & validasi request/response
├── services/
│   └── users-service.ts    # Business logic (cek email, hash password, query Drizzle)
├── db/
│   ├── schema/
│   │   ├── users.ts        # Definisi skema tabel users (Drizzle ORM)
│   │   └── index.ts        # Export seluruh skema
│   └── index.ts            # Instance database Drizzle & MySQL pool
├── config/
│   └── env.ts
└── index.ts                # Entry point server (registrasi plugin & usersRoute)
```

**Aturan Penamaan File:**
- File route diletakkan di `src/routes/` dengan format: `[nama-fitur]-route.ts` (contoh: `users-route.ts`).
- File service diletakkan di `src/services/` dengan format: `[nama-fitur]-service.ts` (contoh: `users-service.ts`).

---

## 5. Panduan Tahapan Implementasi (Step-by-Step Guide)

### Tahap 1: Perbarui Skema Database & Jalankan Migrasi
1. Buka file skema `src/db/schema/users.ts`.
2. Pastikan kolom tabel `users` memiliki:
   - `id`: `serial("id").primaryKey()`
   - `name`: `varchar("name", { length: 255 }).notNull()`
   - `email`: `varchar("email", { length: 255 }).notNull().unique()`
   - `password`: `varchar("password", { length: 255 }).notNull()`
   - `createdAt`: `timestamp("created_at").defaultNow().notNull()`
3. Jalankan perintah generate migrasi SQL:
   ```bash
   bun run db:generate
   ```

### Tahap 2: Buat Service Layer (`src/services/users-service.ts`)
1. Buat file baru di `src/services/users-service.ts`.
2. Buat fungsi registrasi (misalnya `UsersService.register(input)`).
3. **Langkah logika di dalam service:**
   - Query ke database melalui Drizzle untuk memeriksa apakah `email` sudah ada di tabel `users`.
   - **Jika email ditemukan**: Kembalikan indikator bahwa `"Email sudah terdaftar"`.
   - **Jika email belum ada**:
     - Lakukan hashing pada password menggunakan `await Bun.password.hash(password, { algorithm: "bcrypt", cost: 10 })`.
     - Insert data user baru (`name`, `email`, `password` yang sudah di-hash) ke dalam database.
     - Kembalikan nilai sukses `{ success: true, data: "OK" }`.

### Tahap 3: Buat Route Layer (`src/routes/users-route.ts`)
1. Buat file baru di `src/routes/users-route.ts`.
2. Inisialisasi route Elysia dengan prefix `/api/users`.
3. Definisikan endpoint `POST /`.
4. Pasang validasi request body menggunakan Elysia TypeBox (`t.Object`).
5. Panggil fungsi service `UsersService.register`.
6. Atur respons sesuai spesifikasi:
   - Jika berhasil: kembalikan `{ data: "OK" }`.
   - Jika gagal karena email duplikat: set status HTTP 400 dan kembalikan `{ error: "Email sudah terdaftar" }`.

### Tahap 4: Daftarkan Route ke Aplikasi Utama (`src/index.ts`)
1. Buka file `src/index.ts`.
2. Import `usersRoute` dari `./routes/users-route`.
3. Daftarkan router menggunakan `.use(usersRoute)`.

### Tahap 5: Pengujian & Validasi (Testing)
1. Buat file unit test di `test/users-registration.test.ts`.
2. Uji skenario sukses: registrasi user baru dengan email unik menghasilkan `{ data: "OK" }`.
3. Uji skenario duplikat: registrasi ulang dengan email yang sama menghasilkan `{ error: "Email sudah terdaftar" }`.
4. Uji validasi: format email tidak valid ditolak dengan status 400.
5. Jalankan pengujian:
   ```bash
   bun test
   ```

---

## 6. Kriteria Keberhasilan (Acceptance Criteria Checklist)

Sebelum pekerjaan dinyatakan selesai, verifikasi seluruh poin berikut:
- [x] Skema tabel `users` memiliki kolom `id`, `name`, `email`, `password`, dan `created_at`.
- [x] File migrasi SQL untuk perubahan skema tabel berhasil digenerate via `bun run db:generate`.
- [x] Password disimpan dalam bentuk hash bcrypt (tidak pernah disimpan dalam plain text).
- [x] Struktur folder memuat `src/routes/users-route.ts` dan `src/services/users-service.ts`.
- [x] Endpoint `POST /api/users` dengan body valid dan email baru mengembalikan status 200/201 dan `{ "data": "OK" }`.
- [x] Endpoint `POST /api/users` dengan email yang sudah ada mengembalikan status 400 dan `{ "error": "Email sudah terdaftar" }`.
- [x] Validasi tipe input (name, email, password) aktif dan menolak input yang tidak sesuai.
- [x] Seluruh unit test pada `bun test` berhasil passing tanpa error.
