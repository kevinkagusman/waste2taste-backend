-- ============================================================
-- WASTE2TASTE - ROW LEVEL SECURITY (RLS) SETUP
-- Jalankan di Supabase SQL Editor SETELAH database_setup.sql
-- Versi: 1.0
-- ============================================================
-- Tujuan: mengunci data agar tiap user hanya bisa akses
-- datanya sendiri, sementara konten publik (resep, bahan)
-- bisa dibaca semua tapi hanya admin yang bisa ubah.
-- ============================================================

-- ------------------------------------------------------------
-- LANGKAH 1: Nyalakan RLS di semua tabel
-- ------------------------------------------------------------
ALTER TABLE users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories             ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients            ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients     ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_info         ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history           ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_ingredients   ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites              ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews                ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_history        ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- LANGKAH 2: Fungsi bantu untuk cek apakah user adalah admin
-- (dipakai berulang di aturan-aturan di bawah)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE users.user_id = auth.uid()
      AND users.role_id = (SELECT role_id FROM roles WHERE role_name = 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- BAGIAN A: TABEL DATA PRIBADI (privat per-user)
-- User hanya bisa lihat & ubah datanya sendiri
-- ============================================================

-- ---- USERS: user lihat & edit profil sendiri ----
CREATE POLICY "User lihat profil sendiri"
  ON users FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "User edit profil sendiri"
  ON users FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "User bisa insert profil sendiri"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ---- SCAN_HISTORY ----
CREATE POLICY "User kelola scan sendiri"
  ON scan_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---- DETECTED_INGREDIENTS (lewat scan miliknya) ----
CREATE POLICY "User lihat deteksi dari scan sendiri"
  ON detected_ingredients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM scan_history
      WHERE scan_history.scan_id = detected_ingredients.scan_id
        AND scan_history.user_id = auth.uid()
    )
  );

-- ---- RECIPE_RECOMMENDATIONS (lewat scan miliknya) ----
CREATE POLICY "User lihat rekomendasi dari scan sendiri"
  ON recipe_recommendations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM scan_history
      WHERE scan_history.scan_id = recipe_recommendations.scan_id
        AND scan_history.user_id = auth.uid()
    )
  );

-- ---- FAVORITES ----
CREATE POLICY "User kelola favorit sendiri"
  ON favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---- COOKING_HISTORY ----
CREATE POLICY "User kelola riwayat masak sendiri"
  ON cooking_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- BAGIAN B: REVIEWS (kombinasi: baca publik, tulis pribadi)
-- Semua orang boleh BACA review, tapi cuma boleh tulis/edit
-- review milik sendiri
-- ============================================================
CREATE POLICY "Semua bisa baca review"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "User tulis review sendiri"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User edit review sendiri"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "User hapus review sendiri"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- BAGIAN C: KONTEN PUBLIK (resep, bahan, kategori, nutrisi)
-- Semua orang boleh BACA, tapi cuma ADMIN yang boleh ubah
-- ============================================================

-- ---- RECIPES ----
CREATE POLICY "Semua bisa baca resep"
  ON recipes FOR SELECT
  USING (true);

CREATE POLICY "Admin kelola resep"
  ON recipes FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ---- RECIPE_INGREDIENTS ----
CREATE POLICY "Semua bisa baca bahan resep"
  ON recipe_ingredients FOR SELECT
  USING (true);

CREATE POLICY "Admin kelola bahan resep"
  ON recipe_ingredients FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ---- NUTRITION_INFO ----
CREATE POLICY "Semua bisa baca nutrisi"
  ON nutrition_info FOR SELECT
  USING (true);

CREATE POLICY "Admin kelola nutrisi"
  ON nutrition_info FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ---- INGREDIENTS ----
CREATE POLICY "Semua bisa baca bahan"
  ON ingredients FOR SELECT
  USING (true);

CREATE POLICY "Admin kelola bahan"
  ON ingredients FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ---- CATEGORIES ----
CREATE POLICY "Semua bisa baca kategori"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admin kelola kategori"
  ON categories FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ---- ROLES (hanya admin yang boleh lihat & ubah) ----
CREATE POLICY "Admin kelola roles"
  ON roles FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- SELESAI! Database kamu sekarang aman.
-- Cara cek: buka Table Editor, tiap tabel akan ada ikon
-- gembok hijau bertuliskan "RLS enabled".
-- ============================================================
