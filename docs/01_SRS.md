# Software Requirements Specification (SRS)
## Waste2Taste — AI-Based Food Waste Reduction Application

**Version:** 1.0
**Tanggal:** Mei 2026
**Disusun oleh:** Willson, Vania, Albert, Haikal, Kevin
**Departemen:** Computer Science

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Dokumen ini disusun untuk memberikan gambaran lengkap mengenai kebutuhan perangkat lunak aplikasi Waste2Taste, baik dari sisi fungsional maupun non-fungsional. Tujuannya adalah agar tim pengembang, penguji, serta pemangku kepentingan memiliki pemahaman yang sama terhadap apa yang akan dibangun, bagaimana cara kerjanya, serta batasan-batasan yang berlaku selama proses pengembangan.

### 1.2 Ruang Lingkup

Waste2Taste merupakan aplikasi mobile berbasis kecerdasan buatan yang membantu pengguna mengurangi limbah makanan rumah tangga melalui pemindaian foto bahan makanan sisa. Setelah bahan terdeteksi, sistem akan memberikan rekomendasi resep yang relevan beserta informasi nutrisi seperti kalori, karbohidrat, protein, lemak, dan serat. Aplikasi ini menyasar mahasiswa yang mencari opsi makanan ekonomis serta keluarga yang ingin mengelola bahan belanja secara lebih efisien.

### 1.3 Definisi dan Akronim

| Istilah | Definisi |
|---------|----------|
| SRS | Software Requirements Specification |
| ERD | Entity Relationship Diagram |
| API | Application Programming Interface |
| ML | Machine Learning |
| CNN | Convolutional Neural Network |
| CRUD | Create, Read, Update, Delete |
| USDA | United States Department of Agriculture |
| JWT | JSON Web Token |
| REST | Representational State Transfer |
| MVP | Minimum Viable Product |

### 1.4 Referensi

Dokumen ini mengacu pada standar IEEE 830-1998 mengenai Recommended Practice for Software Requirements Specifications. Untuk pengembangan komponen pengolahan citra, referensi teknis diambil dari penelitian Bossard et al. (2014) tentang Food-101 dataset dan studi Min et al. (2019) yang membahas penggunaan deep learning untuk pengenalan makanan.

---

## 2. Deskripsi Umum Sistem

### 2.1 Perspektif Produk

Waste2Taste adalah aplikasi mobile cross-platform yang berdiri sebagai produk independen, namun memanfaatkan beberapa layanan eksternal untuk fungsionalitasnya. Sistem terdiri dari tiga komponen utama: aplikasi mobile sebagai antarmuka pengguna, backend server yang menangani logika bisnis dan autentikasi, serta model machine learning yang dilatih khusus untuk mengenali bahan makanan dari gambar.

### 2.2 Fungsi Utama Sistem

Aplikasi ini menyediakan beberapa fungsi inti, yaitu pemindaian bahan makanan melalui kamera atau galeri, rekomendasi resep berdasarkan bahan yang terdeteksi, tampilan komposisi nutrisi per resep, manajemen akun pengguna, penyimpanan resep favorit, riwayat pemindaian, sistem rating dan review, serta panel administrator untuk pengelolaan konten.

### 2.3 Karakteristik Pengguna

| Tipe Pengguna | Karakteristik | Frekuensi Penggunaan |
|---------------|---------------|----------------------|
| Mahasiswa | Usia 18–25 tahun, butuh resep ekonomis dan praktis | Harian hingga mingguan |
| Keluarga | Usia 25–50 tahun, mengelola belanja rumah tangga | Mingguan |
| Administrator | Tim internal, mengelola data resep dan pengguna | Harian |

### 2.4 Batasan

Aplikasi membutuhkan koneksi internet aktif untuk fitur pemindaian dan pengambilan data nutrisi. Akurasi deteksi bahan bergantung pada kualitas gambar yang diunggah serta cakupan dataset pelatihan model. Versi awal aplikasi mendukung deteksi bahan-bahan umum di Indonesia dengan rencana perluasan dataset secara bertahap.

### 2.5 Asumsi dan Ketergantungan

Pengembangan aplikasi mengasumsikan bahwa pengguna memiliki perangkat smartphone dengan kamera minimal 8 megapiksel, sistem operasi Android 8.0 atau iOS 13 ke atas, serta akses internet yang stabil. Sistem juga bergantung pada ketersediaan API gizi eksternal seperti USDA FoodData Central atau Edamam Nutrition API.

---

## 3. Kebutuhan Fungsional

Berikut adalah daftar kebutuhan fungsional yang harus dipenuhi oleh sistem. Setiap kebutuhan diberi kode unik untuk memudahkan referensi pada dokumen pengujian.

### 3.1 Modul Autentikasi (FR-AUTH)

| ID | Deskripsi | Prioritas |
|----|-----------|-----------|
| FR-AUTH-01 | Sistem harus menyediakan fitur registrasi akun menggunakan email dan password | Wajib |
| FR-AUTH-02 | Sistem harus melakukan validasi format email saat registrasi | Wajib |
| FR-AUTH-03 | Sistem harus menyimpan password dalam bentuk hash menggunakan algoritma bcrypt | Wajib |
| FR-AUTH-04 | Sistem harus menyediakan fitur login dengan email dan password | Wajib |
| FR-AUTH-05 | Sistem harus menerbitkan JWT setelah login berhasil dengan masa berlaku 24 jam | Wajib |
| FR-AUTH-06 | Sistem harus menyediakan fitur logout yang mencabut token aktif | Wajib |
| FR-AUTH-07 | Sistem harus menyediakan fitur lupa password melalui verifikasi email | Sebaiknya |

### 3.2 Modul Pemindaian Bahan (FR-SCAN)

| ID | Deskripsi | Prioritas |
|----|-----------|-----------|
| FR-SCAN-01 | Pengguna dapat mengambil foto bahan makanan melalui kamera perangkat | Wajib |
| FR-SCAN-02 | Pengguna dapat memilih foto dari galeri perangkat | Wajib |
| FR-SCAN-03 | Sistem harus mengirim gambar ke endpoint klasifikasi ML untuk diproses | Wajib |
| FR-SCAN-04 | Sistem harus menampilkan daftar bahan yang berhasil terdeteksi beserta tingkat kepercayaan (confidence score) | Wajib |
| FR-SCAN-05 | Pengguna dapat mengoreksi atau menambahkan bahan secara manual jika hasil deteksi kurang tepat | Wajib |
| FR-SCAN-06 | Sistem harus menyimpan riwayat setiap pemindaian beserta hasilnya | Wajib |

### 3.3 Modul Rekomendasi Resep (FR-RECO)

| ID | Deskripsi | Prioritas |
|----|-----------|-----------|
| FR-RECO-01 | Sistem harus menampilkan daftar resep yang dapat dibuat dari bahan terdeteksi | Wajib |
| FR-RECO-02 | Setiap rekomendasi harus disertai skor kecocokan berdasarkan jumlah bahan yang sesuai | Wajib |
| FR-RECO-03 | Pengguna dapat melihat detail resep berupa bahan lengkap, langkah memasak, waktu persiapan, dan tingkat kesulitan | Wajib |
| FR-RECO-04 | Sistem harus menampilkan informasi nutrisi per porsi untuk setiap resep | Wajib |
| FR-RECO-05 | Pengguna dapat memfilter resep berdasarkan waktu memasak atau tingkat kesulitan | Sebaiknya |

### 3.4 Modul Informasi Nutrisi (FR-NUTRI)

| ID | Deskripsi | Prioritas |
|----|-----------|-----------|
| FR-NUTRI-01 | Sistem harus mengambil data nutrisi dari API eksternal (USDA atau Edamam) | Wajib |
| FR-NUTRI-02 | Data nutrisi yang ditampilkan minimal mencakup kalori, karbohidrat, protein, lemak, serat, dan gula | Wajib |
| FR-NUTRI-03 | Sistem harus melakukan caching data nutrisi untuk mengurangi beban API | Wajib |
| FR-NUTRI-04 | Data nutrisi harus dapat di-refresh secara berkala oleh administrator | Sebaiknya |

### 3.5 Modul Manajemen Pengguna (FR-USER)

| ID | Deskripsi | Prioritas |
|----|-----------|-----------|
| FR-USER-01 | Pengguna dapat menyimpan resep ke dalam daftar favorit | Wajib |
| FR-USER-02 | Pengguna dapat melihat riwayat resep yang pernah dimasak | Wajib |
| FR-USER-03 | Pengguna dapat memberikan rating (1–5 bintang) dan review tertulis pada resep | Wajib |
| FR-USER-04 | Pengguna dapat mengedit profil pribadi (nama, foto, password) | Wajib |
| FR-USER-05 | Pengguna dapat menghapus akun secara permanen | Sebaiknya |

### 3.6 Modul Administrator (FR-ADMIN)

| ID | Deskripsi | Prioritas |
|----|-----------|-----------|
| FR-ADMIN-01 | Admin dapat melakukan operasi CRUD pada data resep | Wajib |
| FR-ADMIN-02 | Admin dapat melakukan operasi CRUD pada database bahan makanan | Wajib |
| FR-ADMIN-03 | Admin dapat melihat daftar seluruh pengguna terdaftar | Wajib |
| FR-ADMIN-04 | Admin dapat melakukan banned atau menghapus akun pengguna yang melanggar ketentuan | Wajib |
| FR-ADMIN-05 | Admin dapat melihat statistik penggunaan aplikasi (jumlah scan, resep populer, pengguna aktif) | Wajib |
| FR-ADMIN-06 | Admin dapat mengakses laporan dalam bentuk dashboard visual | Wajib |

---

## 4. Kebutuhan Non-Fungsional

### 4.1 Performa (NFR-PERF)

| ID | Deskripsi |
|----|-----------|
| NFR-PERF-01 | Proses klasifikasi gambar harus selesai dalam waktu maksimal 5 detik pada koneksi 4G |
| NFR-PERF-02 | Halaman daftar resep harus dimuat dalam waktu kurang dari 3 detik |
| NFR-PERF-03 | Sistem harus mampu menangani minimal 1.000 pengguna aktif secara bersamaan |
| NFR-PERF-04 | Response time API rata-rata tidak melebihi 500 milidetik |

### 4.2 Keamanan (NFR-SEC)

| ID | Deskripsi |
|----|-----------|
| NFR-SEC-01 | Seluruh komunikasi antara klien dan server harus menggunakan HTTPS dengan TLS 1.2 ke atas |
| NFR-SEC-02 | Password disimpan dalam bentuk hash menggunakan bcrypt dengan minimum 10 salt rounds |
| NFR-SEC-03 | Endpoint admin harus dilindungi dengan role-based access control |
| NFR-SEC-04 | Sistem harus menerapkan rate limiting untuk mencegah serangan brute force |

### 4.3 Usability (NFR-USE)

| ID | Deskripsi |
|----|-----------|
| NFR-USE-01 | Antarmuka harus mengikuti prinsip minimalis dengan navigasi maksimal 3 ketukan menuju fitur utama |
| NFR-USE-02 | Aplikasi harus tersedia dalam Bahasa Indonesia dan Bahasa Inggris |
| NFR-USE-03 | Tampilan harus responsif untuk berbagai ukuran layar smartphone |

### 4.4 Reliabilitas (NFR-REL)

| ID | Deskripsi |
|----|-----------|
| NFR-REL-01 | Sistem harus memiliki uptime minimal 99% per bulan |
| NFR-REL-02 | Backup database dilakukan secara otomatis setiap 24 jam |
| NFR-REL-03 | Sistem harus memiliki mekanisme fallback jika API nutrisi eksternal tidak tersedia |

### 4.5 Maintainability (NFR-MAINT)

| ID | Deskripsi |
|----|-----------|
| NFR-MAINT-01 | Kode sumber harus mengikuti standar penulisan yang konsisten dan terdokumentasi |
| NFR-MAINT-02 | Sistem harus modular dengan pemisahan jelas antara presentation, business logic, dan data layer |
| NFR-MAINT-03 | Setiap modul harus disertai unit test dengan coverage minimal 70% |

---

## 5. Use Case Utama

### 5.1 Use Case Diagram (Aktor dan Interaksi)

**Aktor:**
- **Pengguna Umum** (mahasiswa, keluarga)
- **Administrator**
- **Sistem ML** (aktor sistem internal)
- **API Gizi Eksternal** (aktor sistem eksternal)

### 5.2 Skenario Use Case Inti

#### UC-01: Memindai Bahan Makanan

| Komponen | Deskripsi |
|----------|-----------|
| Aktor | Pengguna |
| Prasyarat | Pengguna sudah login |
| Alur Utama | 1. Pengguna membuka halaman Scan. 2. Pengguna memilih sumber gambar (kamera/galeri). 3. Sistem mengirim gambar ke ML service. 4. Sistem menampilkan daftar bahan terdeteksi. 5. Pengguna mengonfirmasi atau mengoreksi hasil. |
| Alur Alternatif | Jika deteksi gagal, sistem menampilkan pesan error dan opsi input manual |
| Postcondition | Daftar bahan tersimpan dan siap digunakan untuk rekomendasi resep |

#### UC-02: Mendapatkan Rekomendasi Resep

| Komponen | Deskripsi |
|----------|-----------|
| Aktor | Pengguna |
| Prasyarat | Bahan sudah terdeteksi atau diinput manual |
| Alur Utama | 1. Sistem menerima daftar bahan. 2. Sistem menghitung skor kecocokan untuk setiap resep. 3. Sistem menampilkan top 10 resep dengan skor tertinggi. 4. Pengguna memilih resep untuk melihat detail. |
| Postcondition | Pengguna dapat melihat detail resep beserta nutrisi |

#### UC-03: Mengelola Resep (Admin)

| Komponen | Deskripsi |
|----------|-----------|
| Aktor | Administrator |
| Prasyarat | Admin sudah login dengan role admin |
| Alur Utama | 1. Admin membuka panel manajemen resep. 2. Admin melakukan operasi CRUD. 3. Sistem memvalidasi input. 4. Sistem menyimpan perubahan ke database. |
| Postcondition | Data resep diperbarui dan dapat diakses pengguna |

---

## 6. Persyaratan Antarmuka

### 6.1 Antarmuka Pengguna

Antarmuka mengikuti desain minimalis dengan palet warna hijau dan krem yang mencerminkan tema sustainability. Navigasi utama menggunakan bottom navigation bar dengan lima tab: Home, Scan, Recipes, Favorites, dan Profile.

### 6.2 Antarmuka Perangkat Keras

Aplikasi membutuhkan akses ke kamera perangkat, penyimpanan lokal untuk caching, serta koneksi internet (Wi-Fi atau seluler).

### 6.3 Antarmuka Perangkat Lunak

| Komponen | Spesifikasi |
|----------|-------------|
| Sistem Operasi | Android 8.0+ atau iOS 13+ |
| Database | PostgreSQL 14+ |
| Web Server | Node.js dengan Express atau NestJS |
| ML Framework | TensorFlow Lite untuk inferensi mobile, TensorFlow/PyTorch untuk pelatihan |
| API Gizi | USDA FoodData Central atau Edamam Nutrition API |

### 6.4 Antarmuka Komunikasi

Komunikasi antara klien dan server menggunakan protokol HTTPS dengan format pertukaran data JSON. API mengikuti prinsip REST dengan endpoint yang terstruktur.
