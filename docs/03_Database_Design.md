# Database Design Document
## Waste2Taste — Schema & Data Specification

**Version:** 1.0
**Tanggal:** Mei 2026
**DBMS:** PostgreSQL 14+

---

## 1. Pendahuluan

Dokumen ini menjelaskan rancangan basis data aplikasi Waste2Taste secara terperinci. Skema database dirancang dengan prinsip normalisasi hingga bentuk normal ketiga (3NF) untuk mengurangi redundansi data dan menjaga integritas referensial. Pemilihan PostgreSQL didasarkan pada kebutuhan akan dukungan relasi kompleks, kemampuan menangani tipe data JSON, serta fitur full-text search yang akan digunakan pada pencarian resep.

---

## 2. Entity Relationship Diagram

Skema database terdiri dari 12 entitas yang saling berelasi. Diagram lengkap dapat dilihat pada lampiran (file ERD terpisah). Berikut adalah ringkasan relasi antar entitas:

| Entitas Sumber | Relasi | Entitas Tujuan | Kardinalitas |
|----------------|--------|----------------|--------------|
| USERS | performs | SCAN_HISTORY | 1 : N |
| USERS | saves | FAVORITES | 1 : N |
| USERS | writes | REVIEWS | 1 : N |
| USERS | has | COOKING_HISTORY | 1 : N |
| USERS | assigned to | ROLES | N : 1 |
| SCAN_HISTORY | produces | DETECTED_INGREDIENTS | 1 : N |
| DETECTED_INGREDIENTS | references | INGREDIENTS | N : 1 |
| SCAN_HISTORY | generates | RECIPE_RECOMMENDATIONS | 1 : N |
| RECIPE_RECOMMENDATIONS | suggests | RECIPES | N : 1 |
| RECIPES | contains | RECIPE_INGREDIENTS | 1 : N |
| RECIPE_INGREDIENTS | uses | INGREDIENTS | N : 1 |
| RECIPES | has | NUTRITION_INFO | 1 : 1 |
| INGREDIENTS | belongs to | CATEGORIES | N : 1 |

---

## 3. Definisi Tabel

### 3.1 Tabel `users`

Menyimpan data akun pengguna aplikasi, baik pengguna umum maupun administrator.

| Kolom | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| user_id | SERIAL | PRIMARY KEY | ID unik pengguna |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Alamat email pengguna |
| password_hash | VARCHAR(255) | NOT NULL | Hash password (bcrypt) |
| full_name | VARCHAR(100) | NOT NULL | Nama lengkap pengguna |
| profile_picture_url | VARCHAR(500) | NULL | URL foto profil |
| role_id | INTEGER | FK → roles, NOT NULL | Referensi peran pengguna |
| is_active | BOOLEAN | DEFAULT TRUE | Status aktif akun |
| created_at | TIMESTAMP | DEFAULT NOW() | Waktu pendaftaran |
| updated_at | TIMESTAMP | DEFAULT NOW() | Waktu update terakhir |

**Indeks:**
- `idx_users_email` pada kolom `email` untuk pencarian saat login
- `idx_users_role` pada kolom `role_id` untuk filtering admin

### 3.2 Tabel `roles`

Mendefinisikan peran-peran yang tersedia dalam sistem.

| Kolom | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| role_id | SERIAL | PRIMARY KEY | ID unik peran |
| role_name | VARCHAR(50) | UNIQUE, NOT NULL | Nama peran (user, admin) |
| permissions | JSONB | NOT NULL | Daftar izin dalam format JSON |
| created_at | TIMESTAMP | DEFAULT NOW() | Waktu pembuatan |

**Data default:**
```sql
INSERT INTO roles (role_name, permissions) VALUES
  ('user', '["scan", "view_recipes", "save_favorites", "write_review"]'),
  ('admin', '["all"]');
```

### 3.3 Tabel `categories`

Mengelompokkan bahan makanan berdasarkan jenisnya.

| Kolom | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| category_id | SERIAL | PRIMARY KEY | ID unik kategori |
| category_name | VARCHAR(100) | UNIQUE, NOT NULL | Nama kategori (sayuran, daging, dll) |
| description | TEXT | NULL | Deskripsi kategori |

### 3.4 Tabel `ingredients`

Menyimpan master data bahan makanan yang dikenali sistem.

| Kolom | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| ingredient_id | SERIAL | PRIMARY KEY | ID unik bahan |
| name | VARCHAR(150) | NOT NULL | Nama bahan |
| category_id | INTEGER | FK → categories | Kategori bahan |
| usda_food_id | VARCHAR(50) | NULL | ID referensi USDA untuk lookup nutrisi |
| description | TEXT | NULL | Deskripsi bahan |
| image_url | VARCHAR(500) | NULL | URL gambar referensi |
| created_at | TIMESTAMP | DEFAULT NOW() | Waktu pembuatan |

**Indeks:**
- `idx_ingredients_name` (full-text search)
- `idx_ingredients_category` pada `category_id`

### 3.5 Tabel `recipes`

Menyimpan data resep yang tersedia di aplikasi.

| Kolom | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| recipe_id | SERIAL | PRIMARY KEY | ID unik resep |
| title | VARCHAR(200) | NOT NULL | Judul resep |
| description | TEXT | NULL | Deskripsi singkat |
| instructions | TEXT | NOT NULL | Langkah memasak (markdown/JSON) |
| prep_time_minutes | INTEGER | NULL | Waktu persiapan |
| cook_time_minutes | INTEGER | NULL | Waktu memasak |
| servings | INTEGER | DEFAULT 1 | Jumlah porsi |
| difficulty | VARCHAR(20) | CHECK IN ('easy','medium','hard') | Tingkat kesulitan |
| image_url | VARCHAR(500) | NULL | URL gambar resep |
| created_by | INTEGER | FK → users | Admin yang membuat |
| is_published | BOOLEAN | DEFAULT TRUE | Status publikasi |
| created_at | TIMESTAMP | DEFAULT NOW() | Waktu pembuatan |
| updated_at | TIMESTAMP | DEFAULT NOW() | Waktu update |

### 3.6 Tabel `recipe_ingredients`

Tabel penghubung untuk relasi many-to-many antara resep dan bahan, sekaligus menyimpan kuantitas yang dibutuhkan.

| Kolom | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| recipe_ingredient_id | SERIAL | PRIMARY KEY | ID unik |
| recipe_id | INTEGER | FK → recipes, NOT NULL | Referensi resep |
| ingredient_id | INTEGER | FK → ingredients, NOT NULL | Referensi bahan |
| quantity | DECIMAL(10,2) | NOT NULL | Jumlah bahan |
| unit | VARCHAR(50) | NOT NULL | Satuan (gram, sdm, buah, dll) |
| is_optional | BOOLEAN | DEFAULT FALSE | Apakah bahan opsional |
| notes | TEXT | NULL | Catatan tambahan |

**Constraint unik:** `UNIQUE(recipe_id, ingredient_id)` untuk mencegah duplikasi bahan dalam satu resep.

### 3.7 Tabel `nutrition_info`

Menyimpan informasi nutrisi per resep.

| Kolom | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| nutrition_id | SERIAL | PRIMARY KEY | ID unik |
| recipe_id | INTEGER | FK → recipes, UNIQUE | Referensi resep |
| calories | DECIMAL(10,2) | NULL | Kalori per porsi (kcal) |
| carbohydrates_g | DECIMAL(10,2) | NULL | Karbohidrat (gram) |
| protein_g | DECIMAL(10,2) | NULL | Protein (gram) |
| fat_g | DECIMAL(10,2) | NULL | Lemak (gram) |
| fiber_g | DECIMAL(10,2) | NULL | Serat (gram) |
| sugar_g | DECIMAL(10,2) | NULL | Gula (gram) |
| sodium_mg | DECIMAL(10,2) | NULL | Natrium (miligram) |
| data_source | VARCHAR(50) | NULL | Sumber data (USDA, Edamam, manual) |
| last_updated | TIMESTAMP | DEFAULT NOW() | Waktu update terakhir |

### 3.8 Tabel `scan_history`

Menyimpan riwayat pemindaian yang dilakukan pengguna.

| Kolom | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| scan_id | SERIAL | PRIMARY KEY | ID unik scan |
| user_id | INTEGER | FK → users, NOT NULL | Pengguna yang melakukan scan |
| image_url | VARCHAR(500) | NOT NULL | URL gambar yang di-scan |
| scanned_at | TIMESTAMP | DEFAULT NOW() | Waktu scan |
| status | VARCHAR(20) | CHECK IN ('success','failed','partial') | Status hasil |
| processing_time_ms | INTEGER | NULL | Waktu proses ML (ms) |

### 3.9 Tabel `detected_ingredients`

Menyimpan bahan-bahan yang berhasil terdeteksi dari setiap scan.

| Kolom | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| detection_id | SERIAL | PRIMARY KEY | ID unik deteksi |
| scan_id | INTEGER | FK → scan_history, NOT NULL | Referensi scan |
| ingredient_id | INTEGER | FK → ingredients, NOT NULL | Bahan yang terdeteksi |
| confidence | DECIMAL(5,4) | NOT NULL | Skor kepercayaan ML (0–1) |
| bounding_box | JSONB | NULL | Koordinat bounding box dalam JSON |
| is_confirmed_by_user | BOOLEAN | DEFAULT FALSE | Apakah dikonfirmasi pengguna |

### 3.10 Tabel `recipe_recommendations`

Menyimpan hasil rekomendasi resep untuk setiap scan.

| Kolom | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| recommendation_id | SERIAL | PRIMARY KEY | ID unik |
| scan_id | INTEGER | FK → scan_history, NOT NULL | Referensi scan |
| recipe_id | INTEGER | FK → recipes, NOT NULL | Resep yang direkomendasikan |
| match_score | DECIMAL(5,4) | NOT NULL | Skor kecocokan (0–1) |
| rank | INTEGER | NOT NULL | Urutan rekomendasi |
| created_at | TIMESTAMP | DEFAULT NOW() | Waktu rekomendasi dibuat |

### 3.11 Tabel `favorites`

Menyimpan resep yang ditandai sebagai favorit oleh pengguna.

| Kolom | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| favorite_id | SERIAL | PRIMARY KEY | ID unik |
| user_id | INTEGER | FK → users, NOT NULL | Pengguna |
| recipe_id | INTEGER | FK → recipes, NOT NULL | Resep favorit |
| saved_at | TIMESTAMP | DEFAULT NOW() | Waktu disimpan |

**Constraint unik:** `UNIQUE(user_id, recipe_id)` agar pengguna tidak menyimpan resep yang sama dua kali.

### 3.12 Tabel `reviews`

Menyimpan rating dan review pengguna terhadap resep.

| Kolom | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| review_id | SERIAL | PRIMARY KEY | ID unik |
| user_id | INTEGER | FK → users, NOT NULL | Pengguna |
| recipe_id | INTEGER | FK → recipes, NOT NULL | Resep yang direview |
| rating | INTEGER | CHECK BETWEEN 1 AND 5 | Rating 1–5 |
| comment | TEXT | NULL | Komentar tertulis |
| created_at | TIMESTAMP | DEFAULT NOW() | Waktu review |
| updated_at | TIMESTAMP | DEFAULT NOW() | Waktu update |

### 3.13 Tabel `cooking_history`

Menyimpan riwayat resep yang sudah dimasak oleh pengguna.

| Kolom | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| history_id | SERIAL | PRIMARY KEY | ID unik |
| user_id | INTEGER | FK → users, NOT NULL | Pengguna |
| recipe_id | INTEGER | FK → recipes, NOT NULL | Resep yang dimasak |
| cooked_at | TIMESTAMP | DEFAULT NOW() | Waktu memasak |
| notes | TEXT | NULL | Catatan pribadi |

---

## 4. Justifikasi Desain

### 4.1 Pemisahan Tabel Scan dan Detected Ingredients

Pemisahan ini mengikuti prinsip normalisasi 1NF di mana satu kali scan dapat menghasilkan banyak bahan terdeteksi. Pendekatan ini juga memudahkan analisis akurasi model ML karena setiap deteksi memiliki confidence score sendiri yang dapat di-track.

### 4.2 Pemisahan Nutrition Info dari Recipes

Walaupun relasinya 1:1, nutrisi dipisah ke tabel sendiri karena beberapa alasan: data nutrisi diambil dari API eksternal yang dapat di-update secara independen, ukuran row recipes tetap kecil sehingga query listing resep lebih cepat, dan jika perlu ada audit log untuk perubahan nutrisi, struktur ini lebih bersih.

### 4.3 Penggunaan JSONB untuk Permissions

Kolom `permissions` di tabel `roles` menggunakan tipe JSONB karena daftar izin bersifat fleksibel dan dapat berkembang seiring waktu. PostgreSQL JSONB mendukung indexing dan query yang efisien terhadap field di dalamnya.

### 4.4 Soft Delete vs Hard Delete

Untuk akun pengguna, sistem menggunakan soft delete melalui kolom `is_active`. Pendekatan ini menjaga integritas referensial pada tabel-tabel yang merujuk ke `users` (favorites, reviews, scan_history), serta memungkinkan recovery jika diperlukan.

---

## 5. Strategi Indeksing

| Tabel | Kolom | Tipe Indeks | Tujuan |
|-------|-------|-------------|--------|
| users | email | B-tree (UNIQUE) | Login lookup |
| ingredients | name | GIN (full-text) | Pencarian bahan |
| recipes | title | GIN (full-text) | Pencarian resep |
| scan_history | user_id, scanned_at | B-tree composite | Riwayat user |
| detected_ingredients | scan_id | B-tree | Join lookup |
| recipe_ingredients | recipe_id, ingredient_id | B-tree composite | Matching engine |
| reviews | recipe_id | B-tree | Average rating query |

---

## 6. Strategi Backup dan Recovery

Backup database dilakukan dalam dua tingkat:

**Backup harian otomatis** menggunakan `pg_dump` yang dijadwalkan via cron job, disimpan di object storage terpisah dengan retensi 30 hari. **Point-in-time recovery (PITR)** menggunakan Write-Ahead Log (WAL) archiving untuk memungkinkan restore ke titik waktu spesifik dalam 7 hari terakhir. Pendekatan ini mengikuti praktik standar yang direkomendasikan dalam dokumentasi resmi PostgreSQL untuk lingkungan production.

---

## 7. Pertimbangan Skalabilitas

Pada fase awal, single-instance PostgreSQL sudah memadai. Ketika beban meningkat, beberapa strategi dapat diterapkan secara bertahap:

1. **Read replica** untuk mendistribusikan beban query baca
2. **Connection pooling** menggunakan PgBouncer
3. **Partitioning** pada tabel `scan_history` dan `detected_ingredients` berdasarkan tanggal jika ukurannya sudah mencapai jutaan baris
4. **Caching layer** dengan Redis untuk query yang sering diakses
