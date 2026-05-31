# API Specification
## Waste2Taste — REST API Documentation

**Version:** 1.0
**Base URL:** `https://api.waste2taste.com/v1`
**Format:** JSON
**Autentikasi:** Bearer Token (JWT)

---

## 1. Konvensi Umum

### 1.1 Format Response

Seluruh response API menggunakan format standar berikut untuk konsistensi:

```json
{
  "success": true,
  "data": { },
  "message": "Operasi berhasil",
  "timestamp": "2026-05-08T10:30:00Z"
}
```

Untuk error response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email tidak valid",
    "details": []
  },
  "timestamp": "2026-05-08T10:30:00Z"
}
```

### 1.2 HTTP Status Codes

| Kode | Arti | Penggunaan |
|------|------|------------|
| 200 | OK | Request berhasil |
| 201 | Created | Resource berhasil dibuat |
| 400 | Bad Request | Input tidak valid |
| 401 | Unauthorized | Token tidak ada atau invalid |
| 403 | Forbidden | Tidak punya akses ke resource |
| 404 | Not Found | Resource tidak ditemukan |
| 422 | Unprocessable Entity | Validasi gagal |
| 429 | Too Many Requests | Rate limit terlampaui |
| 500 | Internal Server Error | Error di sisi server |

### 1.3 Header Autentikasi

Endpoint yang membutuhkan autentikasi memerlukan header:

```
Authorization: Bearer <jwt_token>
```

---

## 2. Modul Autentikasi

### 2.1 Register

**Endpoint:** `POST /auth/register`
**Autentikasi:** Tidak diperlukan

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "Budi Santoso"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user_id": 42,
    "email": "user@example.com",
    "full_name": "Budi Santoso",
    "role": "user",
    "created_at": "2026-05-08T10:30:00Z"
  },
  "message": "Akun berhasil dibuat"
}
```

**Validasi:**
- Email harus format valid dan belum terdaftar
- Password minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka
- Full name minimal 2 karakter

### 2.2 Login

**Endpoint:** `POST /auth/login`
**Autentikasi:** Tidak diperlukan

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "user_id": 42,
      "email": "user@example.com",
      "full_name": "Budi Santoso",
      "role": "user"
    }
  }
}
```

### 2.3 Refresh Token

**Endpoint:** `POST /auth/refresh`
**Autentikasi:** Refresh token

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2.4 Logout

**Endpoint:** `POST /auth/logout`
**Autentikasi:** Bearer token

---

## 3. Modul Scan

### 3.1 Upload dan Scan Gambar

**Endpoint:** `POST /scan`
**Autentikasi:** Bearer token
**Content-Type:** `multipart/form-data`

**Request Body:**
```
image: <file>
max_results: 5 (opsional)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "scan_id": 1024,
    "image_url": "https://storage.waste2taste.com/scans/abc123.jpg",
    "detected_ingredients": [
      {
        "ingredient_id": 15,
        "name": "Tomat",
        "confidence": 0.94,
        "bounding_box": {"x1": 120, "y1": 80, "x2": 280, "y2": 240}
      },
      {
        "ingredient_id": 8,
        "name": "Bawang Bombay",
        "confidence": 0.87,
        "bounding_box": {"x1": 320, "y1": 150, "x2": 450, "y2": 270}
      }
    ],
    "processing_time_ms": 342,
    "scanned_at": "2026-05-08T10:30:00Z"
  }
}
```

### 3.2 Konfirmasi atau Koreksi Hasil Scan

**Endpoint:** `PATCH /scan/{scan_id}/ingredients`
**Autentikasi:** Bearer token

**Request Body:**
```json
{
  "confirmed_ingredient_ids": [15, 8],
  "added_ingredient_ids": [22],
  "removed_detection_ids": [3]
}
```

### 3.3 Daftar Riwayat Scan

**Endpoint:** `GET /scan/history`
**Autentikasi:** Bearer token

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `from_date` (ISO 8601)
- `to_date` (ISO 8601)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "scan_id": 1024,
        "image_url": "...",
        "ingredients_count": 3,
        "scanned_at": "2026-05-08T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "total_pages": 3
    }
  }
}
```

---

## 4. Modul Recipe

### 4.1 Mendapatkan Rekomendasi

**Endpoint:** `POST /recipes/recommend`
**Autentikasi:** Bearer token

**Request Body:**
```json
{
  "scan_id": 1024,
  "filters": {
    "max_cook_time": 30,
    "difficulty": "easy"
  },
  "limit": 10
}
```

Atau berdasarkan input manual:

```json
{
  "ingredient_ids": [15, 8, 22],
  "limit": 10
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "recipe_id": 301,
        "title": "Tumis Bawang Tomat",
        "image_url": "...",
        "match_score": 0.95,
        "missing_ingredients_count": 1,
        "prep_time_minutes": 10,
        "cook_time_minutes": 15,
        "difficulty": "easy",
        "rating_avg": 4.5,
        "rating_count": 128
      }
    ]
  }
}
```

### 4.2 Detail Resep

**Endpoint:** `GET /recipes/{recipe_id}`
**Autentikasi:** Bearer token

**Response (200):**
```json
{
  "success": true,
  "data": {
    "recipe_id": 301,
    "title": "Tumis Bawang Tomat",
    "description": "Hidangan praktis dengan bahan sederhana...",
    "instructions": "1. Potong bawang...\n2. Tumis hingga harum...",
    "prep_time_minutes": 10,
    "cook_time_minutes": 15,
    "servings": 2,
    "difficulty": "easy",
    "image_url": "...",
    "ingredients": [
      {
        "ingredient_id": 15,
        "name": "Tomat",
        "quantity": 200,
        "unit": "gram",
        "is_optional": false
      }
    ],
    "nutrition": {
      "calories": 145.5,
      "carbohydrates_g": 18.2,
      "protein_g": 4.5,
      "fat_g": 6.8,
      "fiber_g": 3.2,
      "sugar_g": 8.5,
      "sodium_mg": 320,
      "data_source": "USDA"
    },
    "rating_avg": 4.5,
    "rating_count": 128,
    "is_favorited": true
  }
}
```

### 4.3 Pencarian Resep

**Endpoint:** `GET /recipes/search`
**Autentikasi:** Bearer token

**Query Parameters:**
- `q` (search query)
- `difficulty` (easy, medium, hard)
- `max_time` (total time in minutes)
- `page`, `limit`

---

## 5. Modul Favorites

### 5.1 Tambah Favorit

**Endpoint:** `POST /favorites`
**Autentikasi:** Bearer token

**Request Body:**
```json
{
  "recipe_id": 301
}
```

### 5.2 Daftar Favorit

**Endpoint:** `GET /favorites`
**Autentikasi:** Bearer token

### 5.3 Hapus dari Favorit

**Endpoint:** `DELETE /favorites/{recipe_id}`
**Autentikasi:** Bearer token

---

## 6. Modul Reviews

### 6.1 Tulis Review

**Endpoint:** `POST /recipes/{recipe_id}/reviews`
**Autentikasi:** Bearer token

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Resepnya enak dan mudah diikuti!"
}
```

### 6.2 Daftar Review Resep

**Endpoint:** `GET /recipes/{recipe_id}/reviews`
**Autentikasi:** Bearer token

**Query Parameters:**
- `page`, `limit`
- `sort` (newest, oldest, highest_rating, lowest_rating)

---

## 7. Modul User Profile

### 7.1 Get Profile

**Endpoint:** `GET /users/me`
**Autentikasi:** Bearer token

### 7.2 Update Profile

**Endpoint:** `PATCH /users/me`
**Autentikasi:** Bearer token

**Request Body:**
```json
{
  "full_name": "Budi Santoso",
  "profile_picture_url": "..."
}
```

### 7.3 Change Password

**Endpoint:** `POST /users/me/change-password`
**Autentikasi:** Bearer token

**Request Body:**
```json
{
  "current_password": "OldPass123",
  "new_password": "NewPass456!"
}
```

---

## 8. Modul Admin

Seluruh endpoint admin memerlukan role `admin`. Akses oleh user biasa akan dijawab dengan HTTP 403.

### 8.1 Manajemen Resep

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/admin/recipes` | Daftar semua resep dengan filter |
| POST | `/admin/recipes` | Tambah resep baru |
| PUT | `/admin/recipes/{id}` | Update resep |
| DELETE | `/admin/recipes/{id}` | Hapus resep |

### 8.2 Manajemen Bahan

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/admin/ingredients` | Daftar bahan |
| POST | `/admin/ingredients` | Tambah bahan baru |
| PUT | `/admin/ingredients/{id}` | Update bahan |
| DELETE | `/admin/ingredients/{id}` | Hapus bahan |

### 8.3 Manajemen User

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/admin/users` | Daftar pengguna |
| PATCH | `/admin/users/{id}/ban` | Banned user |
| DELETE | `/admin/users/{id}` | Hapus akun user |

### 8.4 Statistik dan Laporan

**Endpoint:** `GET /admin/stats/dashboard`
**Autentikasi:** Bearer token (admin)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_users": 1542,
    "active_users_30d": 892,
    "total_scans_today": 234,
    "total_scans_30d": 5678,
    "popular_recipes": [
      {"recipe_id": 301, "title": "Tumis Bawang", "views": 450}
    ],
    "scan_success_rate": 0.87
  }
}
```

---

## 9. Rate Limiting

| Tier User | Request per Menit | Request per Jam |
|-----------|-------------------|-----------------|
| Anonymous | 10 | 100 |
| Authenticated User | 60 | 1000 |
| Admin | 120 | 5000 |

Endpoint scan memiliki limit khusus karena beban prosesnya berat: 20 scan per jam untuk user biasa.

Header response untuk rate limit:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1715164800
```

---

## 10. Error Codes

| Code | HTTP Status | Deskripsi |
|------|-------------|-----------|
| VALIDATION_ERROR | 422 | Input gagal validasi |
| AUTH_INVALID_CREDENTIALS | 401 | Email/password salah |
| AUTH_TOKEN_EXPIRED | 401 | Token kadaluarsa |
| AUTH_TOKEN_INVALID | 401 | Token tidak valid |
| AUTH_FORBIDDEN | 403 | Tidak memiliki akses |
| RESOURCE_NOT_FOUND | 404 | Resource tidak ada |
| DUPLICATE_RESOURCE | 409 | Resource sudah ada |
| FILE_TOO_LARGE | 413 | File melebihi 10MB |
| INVALID_FILE_TYPE | 415 | Format file tidak didukung |
| ML_SERVICE_UNAVAILABLE | 503 | ML service down |
| EXTERNAL_API_ERROR | 502 | API nutrisi error |
| RATE_LIMIT_EXCEEDED | 429 | Terlalu banyak request |
