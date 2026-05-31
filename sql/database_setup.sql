-- ============================================================
-- WASTE2TASTE - DATABASE SETUP SCRIPT
-- Untuk dijalankan di Supabase SQL Editor
-- Versi: 1.0
-- ============================================================
-- Cara pakai: copy SELURUH isi file ini, paste ke Supabase
-- SQL Editor, lalu klik Run.
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABEL ROLES (peran: user / admin)
-- ------------------------------------------------------------
CREATE TABLE roles (
    role_id      SERIAL PRIMARY KEY,
    role_name    VARCHAR(50) UNIQUE NOT NULL,
    permissions  JSONB NOT NULL DEFAULT '[]',
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Isi data awal role
INSERT INTO roles (role_name, permissions) VALUES
  ('user',  '["scan", "view_recipes", "save_favorites", "write_review"]'),
  ('admin', '["all"]');

-- ------------------------------------------------------------
-- 2. TABEL CATEGORIES (kategori bahan: sayuran, daging, dll)
-- ------------------------------------------------------------
CREATE TABLE categories (
    category_id    SERIAL PRIMARY KEY,
    category_name  VARCHAR(100) UNIQUE NOT NULL,
    description    TEXT
);

-- ------------------------------------------------------------
-- 3. TABEL USERS (profil pengguna)
-- Catatan: Supabase punya tabel auth.users sendiri untuk login.
-- Tabel ini menyimpan DATA TAMBAHAN profil, terhubung via user_id.
-- ------------------------------------------------------------
CREATE TABLE users (
    user_id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email                VARCHAR(255) UNIQUE NOT NULL,
    full_name            VARCHAR(100) NOT NULL,
    profile_picture_url  VARCHAR(500),
    role_id              INTEGER NOT NULL REFERENCES roles(role_id) DEFAULT 1,
    is_active            BOOLEAN DEFAULT TRUE,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);

-- ------------------------------------------------------------
-- 4. TABEL INGREDIENTS (master bahan makanan)
-- ------------------------------------------------------------
CREATE TABLE ingredients (
    ingredient_id  SERIAL PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    category_id    INTEGER REFERENCES categories(category_id),
    usda_food_id   VARCHAR(50),
    description    TEXT,
    image_url      VARCHAR(500),
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_ingredients_category ON ingredients(category_id);

-- ------------------------------------------------------------
-- 5. TABEL RECIPES (resep)
-- ------------------------------------------------------------
CREATE TABLE recipes (
    recipe_id          SERIAL PRIMARY KEY,
    title              VARCHAR(200) NOT NULL,
    description        TEXT,
    instructions       TEXT NOT NULL,
    prep_time_minutes  INTEGER,
    cook_time_minutes  INTEGER,
    servings           INTEGER DEFAULT 1,
    difficulty         VARCHAR(20) CHECK (difficulty IN ('easy','medium','hard')),
    image_url          VARCHAR(500),
    created_by         UUID REFERENCES users(user_id),
    is_published       BOOLEAN DEFAULT TRUE,
    created_at         TIMESTAMPTZ DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recipes_title ON recipes(title);

-- ------------------------------------------------------------
-- 6. TABEL RECIPE_INGREDIENTS (bahan-bahan tiap resep)
-- ------------------------------------------------------------
CREATE TABLE recipe_ingredients (
    recipe_ingredient_id  SERIAL PRIMARY KEY,
    recipe_id             INTEGER NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    ingredient_id         INTEGER NOT NULL REFERENCES ingredients(ingredient_id),
    quantity              DECIMAL(10,2) NOT NULL,
    unit                  VARCHAR(50) NOT NULL,
    is_optional           BOOLEAN DEFAULT FALSE,
    notes                 TEXT,
    UNIQUE(recipe_id, ingredient_id)
);

CREATE INDEX idx_recipe_ing_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ing_ingredient ON recipe_ingredients(ingredient_id);

-- ------------------------------------------------------------
-- 7. TABEL NUTRITION_INFO (info gizi tiap resep)
-- ------------------------------------------------------------
CREATE TABLE nutrition_info (
    nutrition_id     SERIAL PRIMARY KEY,
    recipe_id        INTEGER UNIQUE NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    calories         DECIMAL(10,2),
    carbohydrates_g  DECIMAL(10,2),
    protein_g        DECIMAL(10,2),
    fat_g            DECIMAL(10,2),
    fiber_g          DECIMAL(10,2),
    sugar_g          DECIMAL(10,2),
    sodium_mg        DECIMAL(10,2),
    data_source      VARCHAR(50),
    last_updated     TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 8. TABEL SCAN_HISTORY (riwayat scan foto)
-- ------------------------------------------------------------
CREATE TABLE scan_history (
    scan_id             SERIAL PRIMARY KEY,
    user_id             UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    image_url           VARCHAR(500) NOT NULL,
    status              VARCHAR(20) CHECK (status IN ('success','failed','partial')),
    processing_time_ms  INTEGER,
    scanned_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scan_user ON scan_history(user_id, scanned_at);

-- ------------------------------------------------------------
-- 9. TABEL DETECTED_INGREDIENTS (bahan hasil deteksi tiap scan)
-- ------------------------------------------------------------
CREATE TABLE detected_ingredients (
    detection_id    SERIAL PRIMARY KEY,
    scan_id         INTEGER NOT NULL REFERENCES scan_history(scan_id) ON DELETE CASCADE,
    ingredient_id   INTEGER NOT NULL REFERENCES ingredients(ingredient_id),
    confidence      DECIMAL(5,4) NOT NULL,
    bounding_box    JSONB,
    is_confirmed    BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_detected_scan ON detected_ingredients(scan_id);

-- ------------------------------------------------------------
-- 10. TABEL RECIPE_RECOMMENDATIONS (hasil rekomendasi resep)
-- ------------------------------------------------------------
CREATE TABLE recipe_recommendations (
    recommendation_id  SERIAL PRIMARY KEY,
    scan_id            INTEGER NOT NULL REFERENCES scan_history(scan_id) ON DELETE CASCADE,
    recipe_id          INTEGER NOT NULL REFERENCES recipes(recipe_id),
    match_score        DECIMAL(5,4) NOT NULL,
    rank               INTEGER NOT NULL,
    created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reco_scan ON recipe_recommendations(scan_id);

-- ------------------------------------------------------------
-- 11. TABEL FAVORITES (resep favorit user)
-- ------------------------------------------------------------
CREATE TABLE favorites (
    favorite_id  SERIAL PRIMARY KEY,
    user_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    recipe_id    INTEGER NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    saved_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, recipe_id)
);

CREATE INDEX idx_fav_user ON favorites(user_id);

-- ------------------------------------------------------------
-- 12. TABEL REVIEWS (rating & review resep)
-- ------------------------------------------------------------
CREATE TABLE reviews (
    review_id   SERIAL PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    recipe_id   INTEGER NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, recipe_id)
);

CREATE INDEX idx_reviews_recipe ON reviews(recipe_id);

-- ------------------------------------------------------------
-- 13. TABEL COOKING_HISTORY (riwayat masak)
-- ------------------------------------------------------------
CREATE TABLE cooking_history (
    history_id  SERIAL PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    recipe_id   INTEGER NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    notes       TEXT,
    cooked_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cooking_user ON cooking_history(user_id);

-- ============================================================
-- SELESAI! 13 perintah CREATE TABLE sudah dijalankan.
-- (12 tabel inti sesuai ERD + tabel users terhubung ke auth)
-- ============================================================

-- ------------------------------------------------------------
-- BONUS: Data contoh kategori biar tabel nggak kosong
-- ------------------------------------------------------------
INSERT INTO categories (category_name, description) VALUES
  ('Sayuran',     'Berbagai jenis sayuran segar'),
  ('Daging',      'Daging sapi, ayam, dan lainnya'),
  ('Buah',        'Buah-buahan segar'),
  ('Biji-bijian', 'Beras, gandum, kacang-kacangan'),
  ('Bumbu',       'Bumbu dan rempah dapur'),
  ('Produk Susu', 'Susu, keju, telur, dan turunannya');
