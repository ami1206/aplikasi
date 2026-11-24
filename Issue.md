# Issue: Implementasi Fitur Get Current User yang Sedang Login (GET /api/users/current)

## 1. Ringkasan & Tujuan Fitur
Menambahkan endpoint untuk mengambil profil pengguna yang saat ini sedang aktif (login). Identifikasi pengguna dilakukan melalui **Bearer Token** yang dikirimkan pada HTTP Request Header `Authorization`. Token tersebut akan dicocokkan dengan session yang tersimpan di tabel `sessions`, lalu mengambil data profil pengguna dari tabel `users` (tanpa menyertakan password).

Dokumen perencanaan ini disusun secara terperinci sebagai panduan teknis yang siap dieksekusi oleh junior programmer atau AI model.

---

## 2. Spesifikasi Kontrak API (API Contract)

### Endpoint
`GET /api/users/current`

### Request Headers
| Header Key      | Value Format            | Keterangan                                              |
| --------------- | ----------------------- | ------------------------------------------------------- |
| `Authorization` | `Bearer <token>`        | Token UUID sesi login yang tersimpan di tabel `sessions` |

*(Endpoint ini tidak membutuhkan Request Body)*

### Response Body

#### 1. Respons Berhasil (HTTP 200 OK)
Jika token valid dan session ditemukan di database:
```json
{
  "data": {
    "id": 1,
    "name": "ami",
    "email": "ami915@gmail.com",
    "created_at": "2026-11-23T13:00:00.000Z"
  }
}
```

> **Catatan Keamanan (Security Requirement):**
> Kolom `password` **TIDAK BOLEH** disertakan dalam response body. Hanya field `id`, `name`, `email`, dan `created_at` yang dikembalikan ke client.

#### 2. Respons Error - Tidak Terautentikasi (HTTP 401 Unauthorized)
Jika:
- Header `Authorization` tidak dikirimkan.
- Format header bukan `Bearer <token>`.
- Token tidak ditemukan / tidak cocok dengan session yang ada di database.

Maka kembalikan status HTTP `401 Unauthorized` dengan body:
```json
{
  "error": "Unauthorized"
}
```

---

## 3. Konvensi Struktur Folder & Penamaan File

Tetap mempertahankan pola modular yang telah disepakati:

```text
src/
├── routes/
│   └── users-route.ts         # Endpoint GET /current & ekstraksi header Authorization
├── services/
│   └── users-service.ts       # Logika bisnis: verifikasi token session & join query ke tabel users
├── db/
│   ├── schema/
│   │   ├── users.ts           # Skema tabel users
│   │   ├── sessions.ts        # Skema tabel sessions
│   │   └── index.ts
│   └── index.ts
└── index.ts                   # Entry point aplikasi
```

**Aturan Penamaan File:**
- Route: `src/routes/users-route.ts`
- Service: `src/services/users-service.ts`

---

## 4. Mekanisme Alur Query Database (Join Schema)

Untuk mendapatkan user berdasarkan token:
1. Hubungkan tabel `sessions` dengan tabel `users` berdasarkan relasi `sessions.userId = users.id`.
2. Filter berdasarkan `sessions.token = <token>`.
3. Pilih hanya field yang dibutuhkan:
   - `id`: `users.id`
   - `name`: `users.name`
   - `email`: `users.email`
   - `createdAt`: `users.createdAt` (diformat sebagai `created_at` pada JSON response)

---

## 5. Panduan Tahapan Implementasi (Step-by-Step Guide)

### Tahap 1: Tambahkan Method `getCurrentUser` pada Service Layer (`src/services/users-service.ts`)
1. Buka file `src/services/users-service.ts`.
2. Tambahkan tipe hasil query untuk current user, misalnya:
   ```ts
   export interface CurrentUserOutput {
     id: number;
     name: string;
     email: string;
     created_at: string | Date;
   }
   ```
3. Tambahkan method statis `UsersService.getCurrentUser(token: string)`:
   - Jalankan query Drizzle yang melakukan `innerJoin` dari `sessions` ke `users`:
     ```ts
     const [user] = await db
       .select({
         id: users.id,
         name: users.name,
         email: users.email,
         created_at: users.createdAt,
       })
       .from(sessions)
       .innerJoin(users, eq(sessions.userId, users.id))
       .where(eq(sessions.token, token))
       .limit(1);
     ```
   - **Jika user ditemukan**: Kembalikan `{ success: true, data: user }`.
   - **Jika tidak ditemukan**: Kembalikan `{ success: false, error: "Unauthorized" }`.

### Tahap 2: Tambahkan Endpoint `GET /current` pada Route Layer (`src/routes/users-route.ts`)
1. Buka file `src/routes/users-route.ts`.
2. Tambahkan route handler `GET /current` (dengan prefix `/api/users`, otomatis menjadi `GET /api/users/current`).
3. **Ekstraksi dan Validasi Authorization Header**:
   - Ambil header dari request: `const authHeader = headers.authorization`.
   - Periksa apakah `authHeader` ada dan dimulai dengan prefix `"Bearer "`:
     ```ts
     if (!authHeader || !authHeader.startsWith("Bearer ")) {
       set.status = 401;
       return { error: "Unauthorized" };
     }
     ```
   - Ambil token murni: `const token = authHeader.substring(7).trim()`.
   - Jika `token` kosong, kembalikan status 401 dan `{ error: "Unauthorized" }`.
4. Panggil service `UsersService.getCurrentUser(token)`:
   - Jika `!result.success`: set `set.status = 401` dan kembalikan `{ error: "Unauthorized" }`.
   - Jika `result.success`: set `set.status = 200` dan kembalikan `{ data: result.data }`.

### Tahap 3: Pengujian & Validasi (Testing)
1. Buat file pengujian di `test/users-current.test.ts`.
2. Uji skenario berikut menggunakan `app.handle(new Request(...))`:
   - **Test 1 (Sukses)**: Kirim `GET /api/users/current` dengan header `Authorization: Bearer <valid-token>`. Verifikasi status `200` dan body memuat `{ data: { id, name, email, created_at } }`.
   - **Test 2 (Token Tidak Valid / Tidak Ditemukan)**: Mock/stub service mengembalikan `Unauthorized`. Verifikasi status `401` dan body `{ error: "Unauthorized" }`.
   - **Test 3 (Header Authorization Kosong)**: Kirim request tanpa header `Authorization`. Verifikasi status `401` dan body `{ error: "Unauthorized" }`.
   - **Test 4 (Format Header Salah)**: Kirim request dengan header `Authorization: Basic 12345` atau tanpa kata `Bearer`. Verifikasi status `401` dan body `{ error: "Unauthorized" }`.
   - **Test 5 (Keamanan Password)**: Pastikan properti `password` tidak ada pada response body.
3. Jalankan pengujian:
   ```bash
   bun test
   ```

---

## 6. Kriteria Keberhasilan (Acceptance Criteria Checklist)

Sebelum pekerjaan dinyatakan selesai, verifikasi seluruh poin berikut:
- [ ] Endpoint `GET /api/users/current` tersedia dan terdaftar di server ElysiaJS.
- [ ] Header `Authorization: Bearer <token>` diparsing dengan benar.
- [ ] Jika header `Authorization` kosong atau formatnya bukan `Bearer <token>`, server mengembalikan status `401` dan `{ "error": "Unauthorized" }`.
- [ ] Query Drizzle ORM mencari data user dengan mencocokkan `token` pada tabel `sessions` yang berelasi ke `users`.
- [ ] Jika token tidak cocok / session kedaluwarsa / tidak ada, server mengembalikan status `401` dan `{ "error": "Unauthorized" }`.
- [ ] Response sukses (HTTP 200) mengembalikan field `id`, `name`, `email`, dan `created_at` di dalam properti `data`.
- [ ] Field sensitif `password` tidak disertakan di dalam response data.
- [ ] Seluruh unit test pada `bun test` berhasil passing tanpa error.
