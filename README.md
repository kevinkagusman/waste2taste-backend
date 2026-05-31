# Waste2Taste — Backend

> AI-based mobile application for food waste reduction.
> Backend infrastructure: database schema, authentication, security policies, Edge Functions, and documentation.

**Computer Science Project — Bina Nusantara University**
**Team:** Willson · Vania · Albert · Haikal · Kevin

---

## 📋 Overview

Repository ini berisi seluruh komponen backend untuk aplikasi Waste2Taste:
database schema, Row Level Security policies, Edge Functions untuk integrasi
API eksternal, dan dokumentasi teknis lengkap.

**Stack:**
- **Database:** PostgreSQL via Supabase
- **Authentication:** Supabase Auth (email + password)
- **Serverless Functions:** Supabase Edge Functions (Deno + TypeScript)
- **External API:** USDA FoodData Central (nutrition data)

---

## 📁 Struktur Repository

```
waste2taste-backend/
├── README.md                          # File ini
│
├── sql/
│   ├── database_setup.sql             # Schema 13 tabel
│   ├── rls_security_setup.sql         # Row Level Security policies
│   ├── seed_data.sql                  # Data contoh
│   └── seed_resep_simpel.sql          # Update data resep (gram unit)
│
├── edge-functions/
│   └── get-recipe-nutrition/
│       └── index.ts                   # Hitung nutrisi via USDA API
│
├── docs/
│   ├── 01_SRS.md                      # Software Requirements Spec
│   ├── 02_System_Design.md            # Arsitektur sistem
│   ├── 03_Database_Design.md          # ERD & skema detail
│   ├── 04_API_Specification.md        # REST API endpoints
│   ├── ERD_Diagram.html               # Diagram ERD interaktif
│   ├── ADMIN_Documentation.md         # Panduan admin (Supabase Studio)
│   ├── HANDOFF_untuk_Frontend.md      # Dokumen serah-terima
│   └── PANDUAN_Setup_Backend.md       # Setup dari nol
│
└── integration/
    ├── lib/supabase.ts                # Koneksi Supabase untuk frontend
    ├── context/AuthContext.tsx        # Auth state management
    └── app/                           # Screen integrasi auth
```

---

## 🚀 Setup dari Nol

Lihat panduan lengkap di `docs/PANDUAN_Setup_Backend.md`. Ringkasan:

1. **Buat project Supabase** baru di https://supabase.com
2. **Jalankan SQL** berurutan di SQL Editor:
   1. `sql/database_setup.sql` — bikin 13 tabel
   2. `sql/rls_security_setup.sql` — aktifkan keamanan
   3. `sql/seed_data.sql` — isi data awal
   4. `sql/seed_resep_simpel.sql` — update unit resep
3. **Deploy Edge Function** `edge-functions/get-recipe-nutrition`
4. **Set environment variables** di Supabase Secrets:
   - `USDA_API_KEY` — dari https://fdc.nal.usda.gov/api-key-signup.html
5. **Test** Edge Function dengan payload `{ "recipe_id": 1 }`

---

## ✅ Status Implementasi

| Komponen | Status | Catatan |
|----------|--------|---------|
| Database schema (13 tabel, 3NF) | ✅ | Sesuai ERD |
| Row Level Security (16 policies) | ✅ | Per-user isolation aktif |
| Authentication (email + password) | ✅ | Supabase Auth |
| Frontend integration (login/signup/logout) | ✅ | React Native |
| Edge Function: nutrisi (USDA) | ✅ | Tested working |
| Edge Function: scan foto | ⏸️ | Pending — ganti AI provider |
| Admin account | ✅ | Via Supabase Studio |

---

## 🔐 Security

- **Row Level Security** aktif di semua tabel
- **Per-user data isolation** — user A tidak bisa akses data user B
- **Admin role separation** — fungsi `is_admin()` untuk privileged operations
- **Secrets** disimpan di Supabase Secrets, tidak di-commit ke repo
- **API keys** menggunakan environment variables

---

## 📊 Database Schema Highlights

13 tabel utama dengan relasi sesuai prinsip normalisasi 3NF:

**Core entities:** users, roles, categories, ingredients, recipes
**Relations:** recipe_ingredients, nutrition_info
**User activity:** scan_history, detected_ingredients, recipe_recommendations, favorites, reviews, cooking_history

ERD lengkap: `docs/ERD_Diagram.html` (buka di browser)

---

## 🔗 External Integrations

| Service | Purpose | API |
|---------|---------|-----|
| USDA FoodData Central | Nutrition data | https://api.nal.usda.gov/fdc/v1 |

---

## 📖 Dokumentasi Akademik

Dokumentasi yang relevan untuk paper:

- **`docs/01_SRS.md`** — Software Requirements Specification (IEEE 830-1998)
- **`docs/02_System_Design.md`** — Arsitektur & rekomendasi teknis
- **`docs/03_Database_Design.md`** — ERD lengkap & justifikasi desain
- **`docs/04_API_Specification.md`** — REST API documentation
- **`docs/ADMIN_Documentation.md`** — Strategi admin panel (build vs buy)

---

## 👥 Team Roles

| Member | Responsibility |
|--------|----------------|
| Kevin | Backend (database, auth, Edge Functions, integrasi) |
| Willson | Frontend |
| Vania | Frontend |
| Albert | Frontend |
| Haikal | Frontend |

---

## 📝 License

Academic project — Bina Nusantara University, 2026.
