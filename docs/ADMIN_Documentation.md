# Admin Access Documentation
## Waste2Taste — Admin Panel Strategy

> **Status:** Akun admin aktif. Admin operations menggunakan Supabase Studio sebagai dashboard MVP.

---

## 1. Kredensial Admin

| Field | Value |
|-------|-------|
| Email | `admin@waste2taste.com` |
| Password | *(disimpan terpisah, japri ke anggota tim yang membutuhkan)* |
| Role | `admin` |
| Permissions | `["all"]` |
| Created | Mei 2026 |

> **PENTING:** Password admin TIDAK ditulis di dokumen ini. Kalau anggota tim butuh akses, hubungi penanggung jawab database secara langsung.

---

## 2. Filosofi: Kenapa Pakai Supabase Studio sebagai Admin Panel?

Untuk MVP Waste2Taste, kami memilih pendekatan **"build vs buy"** dengan memanfaatkan Supabase Studio sebagai admin dashboard, daripada membangun aplikasi admin terpisah dari nol.

### Pertimbangan teknis:

1. **Time-to-market.** Membangun admin panel custom memerlukan estimasi 15-25 jam pengembangan untuk fitur dasar (CRUD resep, manajemen user, statistik). Supabase Studio sudah menyediakan semua itu langsung pakai.

2. **Konsistensi keamanan.** Supabase Studio dilindungi oleh authentication & authorization yang sama dengan database utama, mengurangi permukaan serangan dibanding aplikasi admin terpisah yang harus dijaga sendiri.

3. **Maintenance overhead.** Aplikasi admin terpisah memerlukan deployment, monitoring, dan update tersendiri. Studio bawaan terkelola otomatis oleh platform.

4. **Standar industri.** Banyak startup tahap awal (seed-stage) menerapkan pola yang sama: Linear, Vercel, dan Notion semua memulai dengan admin operations melalui database tools sebelum membangun panel custom.

### Trade-off yang dipertimbangkan:

- ✅ **Pro:** Cepat, aman, gratis, fitur lengkap
- ⚠️ **Kontra:** Admin harus paham UI database dasar (bukan masalah karena admin biasanya teknis)
- ⚠️ **Kontra:** Tidak ada branding/customization (bukan masalah untuk operasional internal)

---

## 3. Cara Akses Admin Dashboard (Supabase Studio)

### Untuk Anggota Tim Internal

Admin operations dilakukan melalui Supabase Dashboard, bukan melalui aplikasi mobile Waste2Taste.

**Langkah login admin:**

1. Buka https://supabase.com/dashboard
2. Login dengan akun yang sudah di-invite ke project Waste2Taste
3. Pilih project `waste2taste`
4. Akses penuh ke semua tabel, RLS policies, Edge Functions, dll

> Admin **tidak** login melalui aplikasi mobile. Aplikasi mobile khusus untuk end-user.

---

## 4. Operasi Admin yang Tersedia

### 4.1 Manajemen Resep (CRUD)

**Lokasi:** Table Editor → `recipes`

**Cara tambah resep baru:**
1. Klik **Insert → Insert row**
2. Isi field: title, description, instructions, prep_time_minutes, cook_time_minutes, servings, difficulty
3. Set `is_published: true` untuk publikasi langsung
4. Save

**Cara hubungkan bahan ke resep:**
1. Buka tabel `recipe_ingredients`
2. Insert row dengan `recipe_id`, `ingredient_id`, `quantity`, `unit`

**Cara generate info nutrisi otomatis:**
1. Buka **Edge Functions → get-recipe-nutrition**
2. Klik Test → input `{"recipe_id": ID_RESEP}`
3. Run → nutrisi otomatis tersimpan ke tabel `nutrition_info`

### 4.2 Manajemen Bahan Makanan

**Lokasi:** Table Editor → `ingredients`

Setiap bahan baru sebaiknya disertai `usda_food_id` agar bisa fetch nutrisi otomatis. Cara cari USDA ID:
1. Buka https://fdc.nal.usda.gov/
2. Cari bahan yang diinginkan
3. Catat ID-nya, masukkan ke kolom `usda_food_id`

### 4.3 Manajemen User

**Lokasi:** Authentication → Users (untuk akun) + Table Editor → `users` (untuk profil)

**Banned user:**
- Update kolom `is_active` jadi `false` di tabel `users`
- Atau di Authentication, klik user → "Ban user"

**Hapus user permanen:**
- Authentication → Users → klik user → Delete user
- Cascade delete otomatis menghapus profil, scan history, favorites, dll (berkat foreign key constraints)

**Promosi user jadi admin:**
```sql
UPDATE users
SET role_id = (SELECT role_id FROM roles WHERE role_name = 'admin')
WHERE email = 'EMAIL_USER_DI_SINI';
```

### 4.4 Lihat Statistik & Laporan

**Lokasi:** SQL Editor → jalankan query analitik

Beberapa query siap pakai:

```sql
-- Total user aktif
SELECT COUNT(*) AS total_active_users
FROM users WHERE is_active = true;

-- Resep paling populer (berdasarkan favorit)
SELECT r.title, COUNT(f.favorite_id) AS total_favorites
FROM recipes r
LEFT JOIN favorites f ON f.recipe_id = r.recipe_id
GROUP BY r.recipe_id, r.title
ORDER BY total_favorites DESC
LIMIT 10;

-- Statistik scan harian
SELECT DATE(scanned_at) AS tanggal, COUNT(*) AS jumlah_scan
FROM scan_history
WHERE scanned_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(scanned_at)
ORDER BY tanggal DESC;

-- Resep dengan rating tertinggi
SELECT r.title, AVG(rv.rating) AS avg_rating, COUNT(rv.review_id) AS jumlah_review
FROM recipes r
LEFT JOIN reviews rv ON rv.recipe_id = r.recipe_id
GROUP BY r.recipe_id, r.title
HAVING COUNT(rv.review_id) > 0
ORDER BY avg_rating DESC;
```

### 4.5 Monitor Edge Functions

**Lokasi:** Edge Functions → pilih function → Logs

Untuk monitor performa & error pada API custom (get-recipe-nutrition, scan-ingredients).

---

## 5. Pembagian Tugas Saat Ini

| Komponen | Status | PIC |
|----------|--------|-----|
| Database schema | ✅ Selesai | Backend |
| RLS policies | ✅ Selesai | Backend |
| Authentication | ✅ Selesai | Backend |
| Frontend integration auth | ✅ Selesai | Backend |
| API Nutrisi (USDA) | ✅ Selesai | Backend |
| API Scan (Vision) | ⏸️ Pending (ganti provider) | Backend |
| **Admin panel (Studio)** | **✅ Selesai (dokumentasi ini)** | **Backend** |
| Frontend UI lainnya | 🔄 Ongoing | Frontend |
| Sinkronisasi data resep frontend ↔ backend | ❓ Perlu diskusi tim | TBD |

---

## 6. Catatan untuk Paper

Pendekatan ini bisa kamu bahas di bab implementasi/diskusi paper sebagai berikut:

> "Untuk operasi administratif sistem, kami mengadopsi pendekatan **platform-as-admin-panel** dengan memanfaatkan Supabase Studio yang sudah disediakan platform sebagai antarmuka manajemen data. Pendekatan ini sejalan dengan prinsip **build vs buy** yang umum diterapkan pada tahap MVP (Minimum Viable Product), di mana fungsi non-core dialihkan ke layanan terkelola untuk fokus pada pengembangan fitur inti. Keputusan ini mengurangi estimasi waktu pengembangan sebesar 15-25 jam tanpa mengorbankan kemampuan operasional, sekaligus meningkatkan keamanan karena admin operations berbagi infrastruktur autentikasi yang sama dengan database utama."

Itu paragraf yang jujur, profesional, dan menunjukkan **engineering trade-off awareness** — sesuatu yang dosen pembimbing biasanya hargai lebih dari sekadar "kami bangun semuanya dari nol."

### Referensi pendukung untuk paper:

- **Lean Startup principles** (Ries, 2011) — soal MVP & validating before building
- **Postgres Row Level Security** — sebagai mekanisme primary enforcement untuk admin/user separation
- Dokumentasi Supabase: https://supabase.com/docs/guides/auth/managing-user-data

---

## 7. Roadmap (Kalau Mau Lanjut di Masa Depan)

Kalau di iterasi berikutnya (post-MVP), tim memutuskan untuk membangun admin panel custom:

1. **Phase 1:** Web dashboard read-only (statistik & laporan)
2. **Phase 2:** CRUD resep + bahan via web UI
3. **Phase 3:** Manajemen user lengkap dengan audit log
4. **Phase 4:** Analytics dashboard real-time

Stack yang direkomendasikan: Next.js + Supabase JS SDK (akan terhubung ke database yang sama, RLS otomatis berlaku).

---

*Last updated: Mei 2026*
