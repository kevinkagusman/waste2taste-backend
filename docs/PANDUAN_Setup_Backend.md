# Panduan Setup Backend Waste2Taste
## Untuk Pemula Total — Windows

> Ikuti urut dari atas ke bawah. Jangan lompat. Kalau ada yang error, catat di langkah mana, nanti tanya lagi.

---

## Sebelum Mulai: Yang Akan Kita Pakai

| Layanan | Fungsi | Bayar? |
|---------|--------|--------|
| **Supabase** | Database + Login (auth) + Storage gambar | Gratis (cukup untuk paper) |
| **Vercel** | Deploy kode API kita ke internet | Gratis |
| **GitHub** | Tempat simpan kode (wajib untuk Vercel) | Gratis |

> **Google Cloud kita SKIP dulu.** Itu baru perlu nanti kalau ML model sudah jadi. Jangan dipikirkan sekarang.

---

# BAGIAN 0: Install Tools di Laptop (sekali saja)

## 0.1 Install Node.js

1. Buka browser, ke alamat: **https://nodejs.org**
2. Klik tombol hijau yang ada tulisan **"LTS"** (Long Term Support). Jangan pilih yang "Current".
3. Download selesai → buka file `.msi`-nya → klik **Next** terus sampai **Install** → tunggu → **Finish**.
4. **Cek berhasil atau belum:** tekan tombol Windows, ketik `cmd`, buka **Command Prompt**. Lalu ketik:
   ```
   node --version
   ```
   Kalau muncul tulisan seperti `v20.x.x`, berarti berhasil.

## 0.2 Install Visual Studio Code (tempat ngoding)

1. Ke alamat: **https://code.visualstudio.com**
2. Klik **Download for Windows** → install seperti biasa (Next-next-finish).
3. Saat install, **centang** opsi "Add to PATH" kalau ada.

## 0.3 Install Git

1. Ke alamat: **https://git-scm.com/download/win**
2. Download otomatis jalan → install. Klik **Next** terus saja (setting default sudah aman).
3. Cek di Command Prompt:
   ```
   git --version
   ```
   Kalau muncul `git version 2.x.x`, berhasil.

---

# BAGIAN 1: Daftar Akun (semua pakai GitHub biar gampang)

## 1.1 Daftar GitHub dulu

1. Ke **https://github.com** → klik **Sign up**
2. Pakai email kamu, bikin username + password
3. Verifikasi email (cek inbox)

## 1.2 Daftar Supabase

1. Ke **https://supabase.com** → klik **Start your project**
2. Klik **Continue with GitHub** (biar nyambung, nggak usah bikin password baru)
3. Izinkan akses → selesai

## 1.3 Daftar Vercel

1. Ke **https://vercel.com** → klik **Sign Up**
2. Pilih **Continue with GitHub** lagi
3. Izinkan akses → selesai

> Sekarang kamu punya 3 akun yang saling terhubung lewat GitHub. 

---

# BAGIAN 2: Bikin Database di Supabase

Ini bagian inti. Kabar baiknya: skema database sudah kita siapkan, tinggal copy-paste.

## 2.1 Bikin Project Baru

1. Login Supabase → klik **New Project**
2. Isi:
   - **Name:** `waste2taste`
   - **Database Password:** bikin password kuat, **CATAT di notepad** (penting, jangan hilang!)
   - **Region:** pilih **Southeast Asia (Singapore)** — paling dekat Indonesia, biar cepat
3. Klik **Create new project** → tunggu 1-2 menit sampai selesai loading.

## 2.2 Bikin Semua Tabel

1. Di menu kiri Supabase, klik ikon **SQL Editor** (gambar seperti terminal)
2. Klik **New query**
3. Copy SELURUH kode SQL di file `database_setup.sql` (file terpisah yang saya buatkan)
4. Paste ke editor → klik tombol **Run** (atau Ctrl+Enter)
5. Kalau muncul "Success. No rows returned" → berarti SEMUA TABEL BERHASIL DIBUAT 🎉

## 2.3 Cek Tabelnya

1. Klik menu **Table Editor** di kiri
2. Kamu akan lihat 12 tabel: users, roles, recipes, ingredients, dll.
3. Kalau ada semua, lanjut.

---

# BAGIAN 3: Aktifkan Login (Auth)

Supabase sudah menyediakan sistem login, tinggal nyalakan.

1. Di menu kiri, klik **Authentication**
2. Klik tab **Providers** (atau **Sign In / Up**)
3. Pastikan **Email** dalam keadaan ON (biasanya sudah default ON)
4. Untuk MVP/paper, **matikan "Confirm email"** dulu biar gampang testing:
   - Masuk ke **Authentication → Settings**
   - Cari "Confirm email" → matikan (toggle off)
   - > Nanti pas mau launch beneran, nyalakan lagi.

> Selesai. Sistem login email+password kamu sudah aktif tanpa nulis kode apa pun.

---

# BAGIAN 4: Ambil "Kunci" Koneksi

Aplikasi kamu perlu "kunci" untuk nyambung ke Supabase.

1. Di Supabase, klik ikon **Settings** (roda gigi) di kiri bawah
2. Klik **API**
3. Kamu akan lihat:
   - **Project URL** → contoh: `https://abcdefgh.supabase.co`
   - **anon public key** → kode panjang
4. **CATAT keduanya** di notepad. Ini yang nanti dipakai menyambung aplikasi.

> ⚠️ **PENTING:** Ada juga key namanya `service_role`. JANGAN PERNAH share atau upload key ini ke mana pun. Itu kunci master yang bisa apa saja ke database kamu.

---

# BAGIAN 5: Apa Selanjutnya?

Sampai sini, kamu sudah punya:
- ✅ Database lengkap 12 tabel
- ✅ Sistem login aktif
- ✅ Storage untuk gambar
- ✅ Kunci koneksi

**Yang BELUM dan perlu dikerjakan nanti** (kita lakukan bertahap, jangan sekarang):

1. **Hubungkan ke aplikasi React Native** pakai Supabase SDK
2. **Bikin API custom kecil** untuk 2 hal yang Supabase nggak bisa otomatis:
   - Kirim foto ke ML model & terima hasil deteksi
   - Ambil data nutrisi dari API USDA
3. **Deploy API itu ke Vercel**

> Langkah 1-5 di atas dulu yang dikerjakan. Kalau sudah selesai semua dan nggak ada error, kabari saya. Nanti kita lanjut ke bagian menghubungkan ke aplikasi.

---

## Kalau Stuck / Error

Catat 3 hal ini lalu tanya saya:
1. Kamu lagi di **langkah berapa**
2. **Pesan error**-nya apa (screenshot kalau perlu)
3. Apa yang **kamu harapkan terjadi** vs apa yang **sebenarnya terjadi**

Jangan frustrasi kalau error — itu normal banget buat semua programmer, bahkan yang senior.
