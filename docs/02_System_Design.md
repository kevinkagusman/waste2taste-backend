# System Design Document
## Waste2Taste — Architecture & Technical Recommendations

**Version:** 1.0
**Tanggal:** Mei 2026

---

## 1. Gambaran Umum Arsitektur

Waste2Taste dibangun menggunakan arsitektur three-tier yang memisahkan presentation layer, application layer, dan data layer. Pemisahan ini bertujuan untuk meningkatkan maintainability, scalability, serta memudahkan proses pengujian setiap komponen secara independen. Selain itu, model machine learning untuk klasifikasi bahan makanan dipisahkan ke dalam service tersendiri agar tidak membebani backend utama dan dapat di-scale secara horizontal sesuai kebutuhan.

### 1.1 Diagram Arsitektur Tingkat Tinggi

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌─────────────────┐         ┌──────────────────────────┐   │
│  │  Mobile App     │         │   Admin Dashboard        │   │
│  │  (React Native) │         │   (React + Tailwind)     │   │
│  └────────┬────────┘         └──────────┬───────────────┘   │
└───────────┼──────────────────────────────┼──────────────────┘
            │       HTTPS / REST API       │
            ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Gateway (Node.js + Express / NestJS)            │   │
│  │  - Authentication (JWT)                              │   │
│  │  - Request validation                                │   │
│  │  - Rate limiting                                     │   │
│  └────┬─────────────┬─────────────┬─────────────────────┘   │
│       │             │             │                         │
│       ▼             ▼             ▼                         │
│  ┌─────────┐   ┌──────────┐  ┌───────────────┐              │
│  │ User    │   │ Recipe   │  │ ML Service    │              │
│  │ Service │   │ Service  │  │ (Python +     │              │
│  │         │   │          │  │  TF/PyTorch)  │              │
│  └─────────┘   └────┬─────┘  └───────────────┘              │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │ PostgreSQL   │  │ Redis Cache  │  │ Object Storage  │    │
│  │ (main DB)    │  │ (sessions,   │  │ (S3/Firebase    │    │
│  │              │  │  nutrition)  │  │  Storage)       │    │
│  └──────────────┘  └──────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
            ┌──────────────────────┐
            │ External Nutrition   │
            │ API (USDA / Edamam)  │
            └──────────────────────┘
```

---

## 2. Rekomendasi Teknologi (Tech Stack)

Pemilihan teknologi didasarkan pada empat kriteria utama: kematangan ekosistem, ketersediaan dokumentasi, performa, dan kemudahan rekrutmen developer di pasar kerja Indonesia.

### 2.1 Frontend Mobile

**Rekomendasi: React Native dengan TypeScript**

| Kriteria | Alasan |
|----------|--------|
| Cross-platform | Satu codebase untuk Android dan iOS, menghemat waktu pengembangan hingga 40% dibanding native development |
| Komunitas besar | Ekosistem library yang luas, termasuk untuk image picker, kamera, dan integrasi ML |
| Performa | Cukup baik untuk aplikasi yang tidak membutuhkan rendering grafis berat |
| Dukungan TypeScript | Memberikan type safety yang penting untuk aplikasi skala menengah |

**Library pendukung utama:**
- `react-navigation` untuk routing
- `react-native-image-picker` untuk akses kamera/galeri
- `axios` untuk HTTP client
- `zustand` atau `redux-toolkit` untuk state management
- `react-query` untuk data fetching dan caching

### 2.2 Backend

**Rekomendasi: Node.js dengan NestJS framework**

NestJS dipilih karena menyediakan struktur arsitektur yang opinionated dan modular, sangat cocok untuk tim yang ingin membangun aplikasi skalabel dengan disiplin yang konsisten. Framework ini menggunakan TypeScript secara native dan mendukung dependency injection yang memudahkan unit testing.

**Komponen pendukung:**
- `@nestjs/jwt` untuk autentikasi
- `bcrypt` untuk hashing password
- `class-validator` untuk validasi input
- `prisma` atau `typeorm` sebagai ORM
- `bull` untuk background job processing

### 2.3 Database

**Rekomendasi utama: PostgreSQL 14+**

PostgreSQL dipilih karena dukungan terhadap relasi kompleks yang dibutuhkan aplikasi ini (lihat ERD), kemampuan menangani JSON natively untuk data nutrisi yang struktur datanya bervariasi, serta dukungan terhadap full-text search untuk pencarian resep.

**Cache layer: Redis**
Redis digunakan untuk menyimpan session token, hasil query nutrisi yang sering diakses, serta rate limiting counter.

**Object storage: AWS S3 atau Firebase Storage**
Untuk menyimpan gambar yang diunggah pengguna saat proses pemindaian.

### 2.4 Machine Learning Service

**Rekomendasi: Python dengan TensorFlow atau PyTorch**

Untuk model klasifikasi bahan makanan, kami merekomendasikan pendekatan transfer learning menggunakan arsitektur pre-trained seperti **MobileNetV3** atau **EfficientNet-Lite**. Pendekatan ini dipilih karena beberapa alasan:

1. **Efisiensi inferensi**: MobileNetV3 dirancang khusus untuk perangkat dengan resource terbatas dan dapat dijalankan langsung di sisi klien menggunakan TensorFlow Lite jika diperlukan.
2. **Akurasi memadai**: Penelitian Howard et al. (2019) menunjukkan MobileNetV3 mencapai akurasi top-1 di atas 75% pada ImageNet dengan latency yang rendah.
3. **Transfer learning**: Mengurangi kebutuhan data training dari ratusan ribu menjadi puluhan ribu gambar.

**Dataset yang direkomendasikan:**
- **Food-101** (Bossard et al., 2014) sebagai dataset dasar
- Augmentasi dengan dataset lokal Indonesia untuk bahan-bahan tradisional
- Data tambahan dari Open Images Dataset untuk variasi visual

**Pipeline pelatihan:**
1. Data preprocessing (resize 224×224, normalisasi)
2. Data augmentation (rotation, flip, brightness adjustment)
3. Transfer learning dengan freezing 80% layer awal
4. Fine-tuning pada layer terakhir dengan learning rate kecil
5. Evaluasi menggunakan confusion matrix dan F1-score per kelas

### 2.5 API Nutrisi Eksternal

**Rekomendasi: USDA FoodData Central**

USDA dipilih sebagai pilihan utama karena gratis, data yang komprehensif, dan reliabilitas sebagai sumber data resmi pemerintah Amerika Serikat. Untuk fallback, **Edamam Nutrition API** dapat digunakan dengan tier gratis yang menyediakan 10.000 request per bulan.

**Strategi caching:**
Setiap respons API disimpan di Redis dengan TTL 30 hari, dan direplikasi ke PostgreSQL untuk penyimpanan permanen agar mengurangi dependensi terhadap layanan eksternal.

---

## 3. Komponen Sistem Detail

### 3.1 Mobile Application

Aplikasi mobile bertanggung jawab atas seluruh interaksi dengan pengguna akhir. Struktur folder mengikuti pendekatan feature-based agar setiap fitur mandiri dan mudah dimaintain:

```
src/
├── features/
│   ├── auth/
│   ├── scan/
│   ├── recipes/
│   ├── favorites/
│   └── profile/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── utils/
├── navigation/
└── App.tsx
```

### 3.2 API Gateway

API Gateway berfungsi sebagai pintu masuk tunggal untuk seluruh request dari klien. Tanggung jawab utamanya meliputi autentikasi token, validasi request, rate limiting, serta routing ke service yang sesuai. Pendekatan ini mengikuti pola Backend-for-Frontend (BFF) yang umum digunakan pada arsitektur microservices.

### 3.3 ML Service

Service machine learning dipisahkan dari backend utama dengan beberapa pertimbangan: bahasa pemrograman yang berbeda (Python vs TypeScript), kebutuhan resource yang lebih intensif (CPU/GPU), serta karakteristik scaling yang berbeda dari API biasa. Komunikasi antara API Gateway dan ML Service menggunakan REST atau gRPC, dengan REST sebagai pilihan default karena kesederhanaannya.

**Endpoint utama ML Service:**

```
POST /api/v1/predict
Request:
{
  "image": "<base64_string>",
  "max_results": 5
}

Response:
{
  "predictions": [
    {"label": "tomato", "confidence": 0.94, "bbox": [x1,y1,x2,y2]},
    {"label": "onion", "confidence": 0.87, "bbox": [x1,y1,x2,y2]}
  ],
  "processing_time_ms": 342
}
```

### 3.4 Recipe Recommendation Engine

Engine rekomendasi menggunakan pendekatan content-based filtering dengan algoritma sederhana namun efektif untuk MVP:

**Skor kecocokan (matching score)** dihitung dengan formula:

```
score = (jumlah_bahan_terdeteksi_yang_ada_di_resep / total_bahan_resep) × bobot_kecocokan
      + (1 - missing_ingredients / total_bahan_resep) × bobot_kelengkapan
```

Untuk pengembangan lanjutan, sistem dapat ditingkatkan menggunakan collaborative filtering atau hybrid recommendation system seperti yang dijelaskan dalam Ricci et al. (2015) pada Recommender Systems Handbook.

---

## 4. Strategi Deployment

### 4.1 Lingkungan Development

| Lingkungan | Tujuan | Infrastruktur |
|------------|--------|---------------|
| Development | Pengembangan harian | Lokal developer |
| Staging | Pengujian pre-production | VPS atau Docker Compose |
| Production | Lingkungan publik | Cloud (AWS/GCP/Railway) |

### 4.2 Containerization

Seluruh service di-containerize menggunakan Docker untuk memastikan konsistensi lingkungan. Orkestrasi menggunakan Docker Compose untuk staging dan Kubernetes untuk production jika skala sudah cukup besar.

### 4.3 CI/CD Pipeline

Pipeline CI/CD dibangun menggunakan GitHub Actions dengan tahapan:
1. Linting dan format checking
2. Unit testing (Jest untuk backend, Jest + React Native Testing Library untuk mobile)
3. Build artifact
4. Deploy ke staging otomatis pada merge ke `develop`
5. Deploy ke production dengan approval manual pada merge ke `main`

---

## 5. Keamanan

### 5.1 Autentikasi dan Otorisasi

Sistem menggunakan JWT dengan strategi access token dan refresh token. Access token memiliki masa berlaku pendek (15 menit) untuk meminimalkan risiko jika token bocor, sementara refresh token (7 hari) digunakan untuk mendapatkan access token baru tanpa perlu login ulang. Pendekatan ini mengikuti praktik yang dijelaskan dalam OAuth 2.0 Security Best Current Practice (RFC 8252).

### 5.2 Perlindungan Data

| Aspek | Implementasi |
|-------|--------------|
| Password storage | bcrypt dengan 12 salt rounds |
| Data in transit | HTTPS dengan TLS 1.3 |
| Data at rest | Database encryption pada level kolom untuk PII |
| API key management | Environment variables, tidak pernah di-commit ke repository |

### 5.3 Validasi Input

Seluruh input dari klien divalidasi di sisi server menggunakan `class-validator`. Pendekatan ini penting untuk mencegah serangan injection (SQL injection, XSS) yang sering kali menjadi celah utama pada aplikasi web.

---

## 6. Monitoring dan Logging

### 6.1 Application Monitoring

Penggunaan layanan monitoring seperti **Sentry** untuk error tracking dan **Grafana + Prometheus** untuk metrics aplikasi (CPU, memory, request latency).

### 6.2 Structured Logging

Seluruh log menggunakan format JSON terstruktur dengan field standar: `timestamp`, `level`, `service`, `request_id`, `user_id`, dan `message`. Log dikumpulkan menggunakan tools seperti ELK Stack (Elasticsearch, Logstash, Kibana) atau alternatif yang lebih ringan seperti Loki.

---

## 7. Roadmap Pengembangan

| Fase | Durasi | Deliverable |
|------|--------|-------------|
| Fase 1: MVP | Februari–Mei | Autentikasi, scan, rekomendasi resep dasar, info nutrisi |
| Fase 2: Beta Testing | Mei–Juni | Pengujian dengan 50–100 pengguna terpilih |
| Fase 3: Public Launch | Juni–Juli | Rilis publik dengan marketing dan onboarding |
| Fase 4: Iterasi | Juli ke depan | Penambahan fitur berdasarkan feedback (meal planning, social sharing, dll) |
