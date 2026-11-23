# Issue: Implementasi Fitur Login Pengguna & Manajemen Session (POST /api/users/login)

## 1. Ringkasan & Tujuan Fitur
Menambahkan fitur autentikasi login pengguna dan pencatatan sesi (session management) ke dalam backend API. Fitur ini mencakup pembuatan tabel `sessions` dengan relasi foreign key ke tabel `users`, verifikasi kredensial (email & password ber-hash bcrypt), pembuatan token UUID unik, serta validasi request & response sesuai kontrak API.

Dokumen perencanaan ini disusun secara terperinci sebagai panduan teknis yang siap dieksekusi oleh junior programmer atau AI model.

---

## 2. Spesifikasi Database (Tabel `sessions`)

Tabel `sessions` pada MySQL dibuat dengan struktur kolom sebagai berikut:

| Nama Kolom   | Tipe Data      | Atribut / Constraint                                      | Keterangan                                  |
| ------------ | -------------- | --------------------------------------------------------- | ------------------------------------------- |
| `id`         | `INTEGER`      | Primary Key, Auto Increment                               | Identitas unik baris session                |
| `token`      | `VARCHAR(255)` | `NOT NULL`, `UNIQUE`                                      | Token unik session berbentuk UUID string    |
| `user_id`    | `INTEGER`      | `NOT NULL`, Foreign Key mengarah ke `users(id)` (ON DELETE CASCADE) | ID pengguna pemilik session                 |
| `created_at` | `TIMESTAMP`    | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP`                  | Waktu session dibuat                        |

> **Catatan Teknis Pembuatan Token UUID:**
> Gunakan fungsi bawaan native JavaScript/Bun tanpa perlu menginstal package eksternal:
> ```ts
> const token = crypto.randomUUID();
> ```

---

## 3. Spesifikasi Kontrak API (API Contract)

### Endpoint
`POST /api/users/login`

### Request Headers
`Content-Type: application/json`

### Request Body
```json
{
  "email": "ami915@gmail.com",
  "password": "rahasia"
}
```

### Validasi Input (Request Validation)
- `email`: String dengan format email valid, wajib diisi.
- `password`: String, wajib diisi (`minLength: 1`).

### Response Body

#### 1. Respons Berhasil (HTTP 200)
Jika email ditemukan dan password cocok:
```json
{
  "data": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
}
```
*(Nilai `"data"` berisi token UUID session yang baru dibuat)*

#### 2. Respons Error - Kredensial Salah (HTTP 401 / 400)
Jika email tidak ditemukan ATAU password salah (gunakan pesan error generik demi keamanan):
```json
{
  "error": "Email atau password salah"
}
```

---

## 4. Konvensi Struktur Folder & Penamaan File

Tetap pertahankan arsitektur modular dengan memisahkan routing dan logika bisnis:

```text
src/
├── routes/
│   └── users-route.ts         # Menangani routing login (POST /api/users/login)
├── services/
│   └── users-service.ts       # Logika bisnis: verifikasi password, buat token UUID, simpan session
├── db/
│   ├── schema/
│   │   ├── users.ts           # Skema tabel users
│   │   ├── sessions.ts        # Skema tabel sessions (BARU)
│   │   └── index.ts           # Export users & sessions
│   └── index.ts               # Instance Drizzle & pool MySQL
└── index.ts                   # Entry point aplikasi
```

**Aturan Penamaan File:**
- Route: `src/routes/users-route.ts`
- Service: `src/services/users-service.ts`
- Schema: `src/db/schema/sessions.ts`

---

## 5. Panduan Tahapan Implementasi (Step-by-Step Guide)

### Tahap 1: Buat Skema Database `sessions` & Jalankan Migrasi Drizzle
1. Buat file baru di `src/db/schema/sessions.ts`.
2. Definisikan skema tabel `sessions` menggunakan Drizzle MySQL core:
   - `id`: `serial("id").primaryKey()`
   - `token`: `varchar("token", { length: 255 }).notNull().unique()`
   - `userId`: `int("user_id").notNull().references(() => users.id, { onDelete: "cascade" })`
   - `createdAt`: `timestamp("created_at").defaultNow().notNull()`
3. Ekspor skema `sessions` di `src/db/schema/index.ts`:
   ```ts
   export * from "./users";
   export * from "./sessions";
   ```
4. Jalankan perintah generate migrasi SQL:
   ```bash
   bun run db:generate
   ```

### Tahap 2: Tambahkan Logika Login pada Service Layer (`src/services/users-service.ts`)
1. Buka `src/services/users-service.ts`.
2. Tambahkan interface input login, misalnya `LoginUserInput` (`email` dan `password`).
3. Tambahkan method statis `UsersService.login(input)` dengan alur sebagai berikut:
   - **Langkah A (Cari User)**: Query user dari tabel `users` berdasarkan `email`. Jika user tidak ditemukan, langsung return `{ success: false, error: "Email atau password salah" }`.
   - **Langkah B (Verifikasi Password)**: Gunakan `Bun.password.verify(input.password, user.password)` untuk mencocokkan password plain text dengan hash bcrypt di database. Jika tidak cocok, return `{ success: false, error: "Email atau password salah" }`.
   - **Langkah C (Generate Token)**: Buat token session baru menggunakan `crypto.randomUUID()`.
   - **Langkah D (Simpan Session)**: Lakukan `db.insert(sessions).values({ token, userId: user.id })`.
   - **Langkah E (Return Sukses)**: Return `{ success: true, data: token }`.

### Tahap 3: Tambahkan Endpoint Login pada Route Layer (`src/routes/users-route.ts`)
1. Buka `src/routes/users-route.ts`.
2. Tambahkan route handler `POST /login` (karena route memiliki prefix `/api/users`, rute ini otomatis menjadi `POST /api/users/login`).
3. Tambahkan validasi body dengan Elysia TypeBox:
   ```ts
   body: t.Object({
     email: t.String({ format: "email" }),
     password: t.String({ minLength: 1 }),
   })
   ```
4. Panggil `UsersService.login(body)`:
   - Jika `!result.success`: set `set.status = 401` (atau `400`) dan kembalikan `{ error: result.error }`.
   - Jika `result.success`: set `set.status = 200` dan kembalikan `{ data: result.data }`.

### Tahap 4: Pengujian & Validasi (Testing)
1. Buat file pengujian di `test/users-login.test.ts`.
2. Uji skenario berikut menggunakan `app.handle(new Request(...))`:
   - **Test 1 (Login Berhasil)**: Mock/stub `UsersService.login` mengembalikan sukses dengan token UUID. Verifikasi status `200` dan body `{ data: "<uuid-token>" }`.
   - **Test 2 (Email/Password Salah)**: Mock/stub `UsersService.login` mengembalikan error kredensial salah. Verifikasi status `401`/`400` dan body `{ error: "Email atau password salah" }`.
   - **Test 3 (Validasi Input Gagal)**: Kirim request dengan format email yang tidak valid atau password kosong. Verifikasi penolakan validasi dengan status 400.
3. Jalankan pengujian:
   ```bash
   bun test
   ```

---

## 6. Kriteria Keberhasilan (Acceptance Criteria Checklist)

Sebelum pekerjaan dinyatakan selesai, verifikasi seluruh poin berikut:
- [x] Skema tabel `sessions` dibuat di `src/db/schema/sessions.ts` dan diekspor di `src/db/schema/index.ts`.
- [x] Kolom `user_id` pada `sessions` berelasi sebagai foreign key ke `users(id)`.
- [x] File migrasi SQL berhasil digenerate via `bun run db:generate`.
- [x] Logika login memverifikasi password dengan `Bun.password.verify` terhadap hash bcrypt.
- [x] Token session di-generate dalam format UUID (`crypto.randomUUID()`) dan tersimpan di tabel `sessions`.
- [x] Endpoint `POST /api/users/login` dengan kredensial benar mengembalikan status `200` dan `{ "data": "<token-uuid>" }`.
- [x] Endpoint `POST /api/users/login` dengan email atau password salah mengembalikan `{ "error": "Email atau password salah" }`.
- [x] Struktur kode tetap rapi mengikuti pola `routes` dan `services`.
- [x] Seluruh unit test pada `bun test` berhasil passing tanpa error.
