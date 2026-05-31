# Dokumen Serah-Terima Backend
## Waste2Taste — Untuk Tim Frontend

> Dokumen ini berisi semua yang dibutuhkan tim frontend untuk menghubungkan aplikasi ke database. Backend (database + auth) sudah siap pakai.

---

## 1. Status Backend

| Komponen | Status | Keterangan |
|----------|--------|------------|
| Database (12 tabel) | ✅ Siap | Skema lengkap sesuai ERD |
| Autentikasi (login/register) | ✅ Siap | Email + password via Supabase Auth |
| Keamanan (RLS) | ✅ Aktif | Data tiap user terlindungi |
| Storage gambar | ✅ Siap | Untuk foto scan |
| Data contoh | ✅ Ada | 2 resep + 8 bahan untuk testing |

---

## 2. Kredensial Koneksi

Untuk menyambung aplikasi ke Supabase, gunakan dua nilai berikut:

```
SUPABASE_URL  = https://zzthcvjfmlyppjtuouud.supabase.co
SUPABASE_KEY  = sb_publishable_... (Publishable Key, ambil dari dashboard)
```

> **Catatan keamanan:** Publishable Key memang aman dipakai di aplikasi karena database sudah dilindungi RLS. JANGAN pernah pakai Secret Key di aplikasi.

> Simpan kedua nilai ini di file `.env` (jangan di-commit ke GitHub). Lihat contoh di bagian 5.

---

## 3. Cara Pasang Supabase di React Native

### 3.1 Install library

Di terminal, dalam folder project React Native:

```bash
npm install @supabase/supabase-js
npm install @react-native-async-storage/async-storage
npm install react-native-url-polyfill
```

### 3.2 Bikin file koneksi

Buat file baru: `lib/supabase.js`

```javascript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

## 4. Contoh Penggunaan (Cheat Sheet)

### 4.1 Register user baru

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});
```

### 4.2 Login

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

### 4.3 Logout

```javascript
const { error } = await supabase.auth.signOut();
```

### 4.4 Ambil daftar resep

```javascript
const { data, error } = await supabase
  .from('recipes')
  .select('*')
  .eq('is_published', true);
```

### 4.5 Ambil detail resep + bahan + nutrisi sekaligus

```javascript
const { data, error } = await supabase
  .from('recipes')
  .select(`
    *,
    recipe_ingredients ( quantity, unit, ingredients ( name ) ),
    nutrition_info ( * )
  `)
  .eq('recipe_id', 1)
  .single();
```

### 4.6 Simpan resep ke favorit

```javascript
const { data: { user } } = await supabase.auth.getUser();

const { error } = await supabase
  .from('favorites')
  .insert({ user_id: user.id, recipe_id: 1 });
```

### 4.7 Ambil favorit milik user yang sedang login

```javascript
const { data, error } = await supabase
  .from('favorites')
  .select('*, recipes(*)');
// RLS otomatis memfilter hanya favorit user ini, jadi nggak perlu .eq()
```

### 4.8 Tulis review

```javascript
const { data: { user } } = await supabase.auth.getUser();

const { error } = await supabase
  .from('reviews')
  .insert({
    user_id: user.id,
    recipe_id: 1,
    rating: 5,
    comment: 'Enak banget!'
  });
```

---

## 5. Contoh File .env

Buat file `.env` di root project (JANGAN di-commit):

```
EXPO_PUBLIC_SUPABASE_URL=https://zzthcvjfmlyppjtuouud.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_xxxxxxxxxxxxx
```

Lalu tambahkan `.env` ke file `.gitignore`.

---

## 6. Struktur Tabel (Ringkasan untuk Frontend)

Tabel yang paling sering dipakai frontend:

| Tabel | Isi | Akses |
|-------|-----|-------|
| `recipes` | Data resep | Baca: semua, Tulis: admin |
| `ingredients` | Master bahan | Baca: semua, Tulis: admin |
| `nutrition_info` | Info gizi resep | Baca: semua |
| `favorites` | Favorit user | Privat per-user |
| `reviews` | Rating & komentar | Baca: semua, Tulis: pemilik |
| `scan_history` | Riwayat scan | Privat per-user |
| `cooking_history` | Riwayat masak | Privat per-user |

> Detail lengkap kolom tiap tabel ada di dokumen `03_Database_Design.md`.

---

## 7. Hal yang BELUM Tersedia (perlu API custom terpisah)

Dua fitur ini TIDAK bisa langsung dari Supabase, perlu dihubungkan ke API eksternal (sedang/akan dikerjakan terpisah):

1. **Scan foto → deteksi bahan** — perlu API ML (sesuai info tim, pakai API jadi)
2. **Ambil data nutrisi otomatis dari USDA** — perlu API gizi eksternal

Untuk sementara, data nutrisi resep contoh sudah diisi manual agar frontend bisa tetap menampilkannya saat testing.

---

## 8. Kontak

Kalau ada kendala koneksi atau butuh tambahan data contoh, hubungi anggota tim yang menangani database.
