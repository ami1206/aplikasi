# Issue: Implementasi Fitur Logout Pengguna & Penghapusan Sesi (DELETE /api/users/logout)

## 1. Ringkasan & Tujuan Fitur
Menambahkan endpoint untuk memfasilitasi proses *logout* pengguna. Ketika pengguna melakukan logout, server harus memverifikasi kepemilikan sesi melalui **Bearer Token** pada header `Authorization`, lalu menghapus data baris sesi terkait dari tabel `sessions` di database MySQL. Dengan begitu, token yang telah dihapus tidak dapat lagi digunakan untuk mengakses endpoint yang membutuhkan autentikasi (seperti `GET /api/users/current`).

Dokumen perencanaan ini disusun secara terperinci sebagai panduan teknis yang siap dieksekusi oleh junior programmer atau AI model.

---

## 2. Spesifikasi Kontrak API (API Contract)

### Endpoint
`DELETE /api/users/logout`

### Request Headers
| Header Key      | Value Format            | Keterangan                                                 |
| --------------- | ----------------------- | ---------------------------------------------------------- |
| `Authorization` | `Bearer <token>`        | Token UUID sesi pengguna aktif yang tersimpan di `sessions` |

*(Endpoint ini tidak membutuhkan Request Body)*

### Response Body

#### 1. Respons Berhasil (HTTP 200 OK)
Jika token valid, sesi ditemukan di database, dan berhasil dihapus:
```json
{
  "data": "OK"
}
```

#### 2. Respons Error - Tidak Terautentikasi (HTTP 401 Unauthorized)
Jika:
- Header `Authorization` tidak disertakan dalam request.
- Format header bukan `Bearer <token>` atau token bernilai kosong.
- Token tidak ditemukan / sudah tidak ada di dalam tabel `sessions`.

Maka kembalikan status HTTP `401 Unauthorized` dengan format:
```json
{
  "error": "Unauthorized"
}
```

---

## 3. Konvensi Struktur Folder & Penamaan File

Tetap mempertahankan pola arsitektur modular yang sudah ada:

```text
src/
├── routes/
│   └── users-route.ts         # Endpoint DELETE /logout & ekstraksi Bearer token
├── services/
│   └── users-service.ts       # Logika bisnis: verifikasi keberadaan sesi & delete baris session
├── db/
│   ├── schema/
│   │   ├── users.ts
│   │   ├── sessions.ts        # Skema tabel sessions
│   │   └── index.ts
│   └── index.ts
└── index.ts
```

**Aturan Penamaan File:**
- Route: `src/routes/users-route.ts`
- Service: `src/services/users-service.ts`

---

## 4. Alur Logika & Operasi Database

1. Ekstrak string `<token>` dari header `Authorization: Bearer <token>`.
2. Lakukan pengecekan awal pada tabel `sessions`:
   ```sql
   SELECT id FROM sessions WHERE token = ? LIMIT 1;
   ```
3. Jika sesi **tidak ditemukan**, batalkan operasi dan kembalikan error `Unauthorized`.
4. Jika sesi **ditemukan**, hapus data sesi dari database:
   ```sql
   DELETE FROM sessions WHERE token = ?;
   ```
5. Kembalikan data sukses `{ data: "OK" }`.

---

## 5. Panduan Tahapan Implementasi (Step-by-Step Guide)

### Tahap 1: Tambahkan Method `logout` pada Service Layer (`src/services/users-service.ts`)
1. Buka file `src/services/users-service.ts`.
2. Definisikan tipe hasil operasi logout:
   ```ts
   export type LogoutResult =
     | { success: true; data: "OK" }
     | { success: false; error: string };
   ```
3. Tambahkan method statis `UsersService.logout(token: string)`:
   - Query tabel `sessions` menggunakan Drizzle untuk mencari session dengan token terkait:
     ```ts
     const [session] = await db
       .select({ id: sessions.id })
       .from(sessions)
       .where(eq(sessions.token, token))
       .limit(1);
     ```
   - **Jika session tidak ditemukan**: Kembalikan `{ success: false, error: "Unauthorized" }`.
   - **Jika session ditemukan**: Hapus session tersebut dari database:
     ```ts
     await db.delete(sessions).where(eq(sessions.token, token));
     ```
   - Kembalikan `{ success: true, data: "OK" }`.

### Tahap 2: Tambahkan Endpoint `DELETE /logout` pada Route Layer (`src/routes/users-route.ts`)
1. Buka file `src/routes/users-route.ts`.
2. Tambahkan handler `.delete("/logout", ...)` (dengan prefix `/api/users`, otomatis menjadi `DELETE /api/users/logout`).
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
   - Jika `token` kosong, kembalikan status `401` dan `{ error: "Unauthorized" }`.
4. Panggil method `UsersService.logout(token)`:
   - Jika `!result.success`: set status `401` dan kembalikan `{ error: result.error }`.
   - Jika `result.success`: set status `200` dan kembalikan `{ data: result.data }`.

### Tahap 3: Pengujian & Validasi (Testing)
1. Buat file pengujian di `test/users-logout.test.ts`.
2. Uji skenario berikut menggunakan `app.handle(new Request(...))`:
   - **Test 1 (Logout Sukses)**: Mock/stub `UsersService.logout` mengembalikan `{ success: true, data: "OK" }`. Verifikasi respons berstatus `200` dengan body `{ data: "OK" }`.
   - **Test 2 (Token Tidak Ditemukan / Sudah Logout)**: Mock/stub `UsersService.logout` mengembalikan `{ success: false, error: "Unauthorized" }`. Verifikasi respons berstatus `401` dengan body `{ error: "Unauthorized" }`.
   - **Test 3 (Header Authorization Kosong)**: Kirim request `DELETE /api/users/logout` tanpa header `Authorization`. Verifikasi status `401` dan body `{ error: "Unauthorized" }`.
   - **Test 4 (Format Header Bukan Bearer)**: Kirim request dengan header `Authorization: Token 12345`. Verifikasi status `401` dan body `{ error: "Unauthorized" }`.
   - **Test 5 (Token Kosong setelah Bearer)**: Kirim header `Authorization: Bearer `. Verifikasi status `401` dan body `{ error: "Unauthorized" }`.
3. Jalankan seluruh pengujian:
   ```bash
   bun test
   ```

---

## 6. Kriteria Keberhasilan (Acceptance Criteria Checklist)

Sebelum pekerjaan dinyatakan selesai, verifikasi seluruh poin berikut:
- [x] Endpoint `DELETE /api/users/logout` tersedia dan terdaftar di server ElysiaJS.
- [x] Header `Authorization: Bearer <token>` diparsing dan divalidasi dengan benar.
- [x] Jika header `Authorization` kosong atau formatnya bukan `Bearer <token>`, server mengembalikan status `401` dan `{ "error": "Unauthorized" }`.
- [x] Query Drizzle ORM memverifikasi keberadaan token pada tabel `sessions` sebelum dihapus.
- [x] Jika token ditemukan, baris data pada tabel `sessions` berhasil dihapus (`db.delete`).
- [x] Jika token tidak ditemukan pada database, server mengembalikan status `401` dan `{ "error": "Unauthorized" }`.
- [x] Respons sukses mengembalikan HTTP `200 OK` dengan format `{ "data": "OK" }`.
- [x] Seluruh unit test pada `bun test` berhasil passing tanpa error.
