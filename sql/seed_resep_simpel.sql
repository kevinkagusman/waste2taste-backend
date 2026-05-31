-- ============================================================
-- WASTE2TASTE - ISI DATA RESEP (versi simpel, langsung jalan)
-- Copy semua, paste ke query baru di SQL Editor, klik Run.
-- TIDAK perlu ganti apa pun.
-- ============================================================

-- ---- Isi bahan-bahan ----
INSERT INTO ingredients (name, category_id, usda_food_id) VALUES
  ('Tomat',          (SELECT category_id FROM categories WHERE category_name='Sayuran'), '170457'),
  ('Bawang Bombay',  (SELECT category_id FROM categories WHERE category_name='Sayuran'), '170000'),
  ('Bawang Putih',   (SELECT category_id FROM categories WHERE category_name='Bumbu'),   '169230'),
  ('Telur Ayam',     (SELECT category_id FROM categories WHERE category_name='Produk Susu'), '173424'),
  ('Wortel',         (SELECT category_id FROM categories WHERE category_name='Sayuran'), '170393'),
  ('Daging Ayam',    (SELECT category_id FROM categories WHERE category_name='Daging'),  '171477'),
  ('Beras',          (SELECT category_id FROM categories WHERE category_name='Biji-bijian'), '169756'),
  ('Cabai Merah',    (SELECT category_id FROM categories WHERE category_name='Bumbu'),   '170106');

-- ---- Isi resep ----
INSERT INTO recipes (title, description, instructions, prep_time_minutes, cook_time_minutes, servings, difficulty, is_published)
VALUES
  ('Tumis Tomat Telur',
   'Hidangan praktis dan bergizi dari bahan sederhana.',
   E'1. Kocok telur, sisihkan.\n2. Tumis bawang putih hingga harum.\n3. Masukkan tomat, masak hingga layu.\n4. Tuang telur kocok, aduk hingga matang.\n5. Bumbui garam secukupnya, sajikan.',
   10, 15, 2, 'easy', true),

  ('Nasi Goreng Sederhana',
   'Nasi goreng rumahan dengan bahan seadanya.',
   E'1. Tumis bawang putih dan bawang bombay.\n2. Masukkan nasi, aduk rata.\n3. Tambahkan telur, orak-arik.\n4. Beri kecap dan garam, aduk hingga merata.\n5. Sajikan hangat.',
   10, 12, 1, 'easy', true);

-- ---- Hubungkan resep dengan bahannya ----
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, is_optional) VALUES
  ((SELECT recipe_id FROM recipes WHERE title='Tumis Tomat Telur'),
   (SELECT ingredient_id FROM ingredients WHERE name='Tomat'), 2, 'buah', false),
  ((SELECT recipe_id FROM recipes WHERE title='Tumis Tomat Telur'),
   (SELECT ingredient_id FROM ingredients WHERE name='Telur Ayam'), 3, 'butir', false),
  ((SELECT recipe_id FROM recipes WHERE title='Tumis Tomat Telur'),
   (SELECT ingredient_id FROM ingredients WHERE name='Bawang Putih'), 3, 'siung', false),
  ((SELECT recipe_id FROM recipes WHERE title='Nasi Goreng Sederhana'),
   (SELECT ingredient_id FROM ingredients WHERE name='Beras'), 200, 'gram', false),
  ((SELECT recipe_id FROM recipes WHERE title='Nasi Goreng Sederhana'),
   (SELECT ingredient_id FROM ingredients WHERE name='Telur Ayam'), 1, 'butir', false),
  ((SELECT recipe_id FROM recipes WHERE title='Nasi Goreng Sederhana'),
   (SELECT ingredient_id FROM ingredients WHERE name='Bawang Bombay'), 1, 'buah', true);

-- ---- Isi info nutrisi (per porsi) ----
INSERT INTO nutrition_info (recipe_id, calories, carbohydrates_g, protein_g, fat_g, fiber_g, sugar_g, sodium_mg, data_source)
VALUES
  ((SELECT recipe_id FROM recipes WHERE title='Tumis Tomat Telur'),
   210.5, 8.2, 14.5, 13.8, 2.1, 4.5, 320, 'manual'),
  ((SELECT recipe_id FROM recipes WHERE title='Nasi Goreng Sederhana'),
   380.0, 58.5, 12.0, 11.2, 1.8, 3.2, 450, 'manual');

-- ============================================================
-- SELESAI. Cek tabel recipes, harusnya muncul 2 resep.
-- ============================================================
