# Panduan Upload Project ke GitHub
## Waste2Taste — Untuk Pemula, dengan Fokus Keamanan

> Ikuti urut. Bagian KEAMANAN di langkah 2 itu WAJIB, jangan dilewati.

---

## Kenapa Pakai GitHub?

GitHub itu seperti "Google Drive khusus kode" yang:
- Menyimpan semua file project di satu tempat
- Bisa diakses & diedit bareng seluruh tim
- Mencatat riwayat perubahan (siapa ubah apa, kapan)
- Terlihat profesional untuk paper kamu (bukti pakai version control)

---

## LANGKAH 1: Siapkan Folder Project di Laptop

1. Bikin folder baru di laptop, misalnya `waste2taste-backend`
2. Pindahkan semua file yang sudah kita buat ke folder itu:
   - File-file `.sql` (database_setup, rls_security_setup, seed, dll)
   - File-file `.md` (SRS, system design, handoff, dll)
   - File ERD (`.html`)

---

## LANGKAH 2: ⚠️ KEAMANAN — Bikin File .gitignore (WAJIB)

Ini bagian PALING PENTING. Tujuannya: mencegah file rahasia ikut ter-upload.

1. Di dalam folder project, bikin file baru bernama persis: `.gitignore`
   (perhatikan ada titik di depannya, dan TIDAK ada ekstensi di belakang)
2. Isi file itu dengan teks berikut:

```
# File rahasia - JANGAN PERNAH di-upload
.env
.env.local
.env.*

# File sistem
node_modules/
.DS_Store
Thumbs.db

# File sementara
*.log
```

3. Simpan.

> **Kenapa penting?** Kalau kamu punya file `.env` berisi Secret Key Supabase,
> file `.gitignore` ini memastikan key rahasia itu TIDAK ikut ter-upload ke
> internet. Tanpa ini, key kamu bisa bocor dan database disalahgunakan orang.

---

## LANGKAH 3: Bikin Repository di GitHub

1. Buka **https://github.com** → login
2. Klik tombol **+** di kanan atas → **New repository**
3. Isi:
   - **Repository name:** `waste2taste-backend`
   - **Description:** (opsional) "Backend & database design for Waste2Taste"
   - **Visibility:**
     - **Private** → hanya kamu & tim yang bisa lihat (REKOMENDASI untuk sekarang)
     - **Public** → semua orang di internet bisa lihat (pilih ini nanti saat mau dipamerkan di paper, PASTIKAN nggak ada file rahasia)
   - **JANGAN centang** "Add a README" (kita sudah punya)
4. Klik **Create repository**
5. Halaman berikutnya akan menampilkan beberapa perintah — biarkan terbuka, kita pakai di langkah 4.

---

## LANGKAH 4: Upload Folder ke GitHub

### Cara Mudah (lewat website, tanpa perintah)

1. Di halaman repository yang baru dibuat, klik **"uploading an existing file"**
2. Drag-and-drop semua file dari folder project kamu ke situ
   (PASTIKAN file `.env` TIDAK ikut — kalau ada)
3. Scroll ke bawah, klik **Commit changes**
4. Selesai! File sudah online.

### Cara Profesional (lewat Git Bash / terminal)

Buka terminal di dalam folder project (klik kanan dalam folder → "Open Git Bash here"), lalu ketik satu per satu:

```bash
git init
git add .
git commit -m "Initial commit: backend & database setup"
git branch -M main
git remote add origin https://github.com/USERNAME/waste2taste-backend.git
git push -u origin main
```

> Ganti `USERNAME` dengan username GitHub kamu.
> Perintah lengkapnya juga muncul di halaman repository GitHub kamu, tinggal copy.

---

## LANGKAH 5: Undang Teman ke Repository

1. Di halaman repository, klik tab **Settings**
2. Di kiri, klik **Collaborators** (atau **Collaborators and teams**)
3. Klik **Add people**
4. Masukkan **username GitHub** atau **email** temanmu
5. Klik **Add** → temanmu akan dapat undangan
6. Setelah dia terima, dia bisa akses & edit repository

---

## Checklist Keamanan Sebelum Upload

Sebelum klik upload/commit, pastikan:

- [ ] File `.gitignore` sudah ada dan berisi `.env`
- [ ] TIDAK ada file `.env` di daftar yang akan di-upload
- [ ] TIDAK ada Secret Key (`sb_secret_...`) yang tertulis di file mana pun
- [ ] Publishable Key boleh ada (itu aman), tapi lebih rapi kalau juga disimpan di `.env`

> Kalau ragu, buka tiap file dan cari kata "secret". Kalau nggak ada, aman.

---

## Kalau Stuck

Catat di langkah berapa kamu berhenti + pesan error (kalau ada) + screenshot.
Tanya saya, nanti dibantu.
