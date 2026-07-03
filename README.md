# StrukIn

StrukIn adalah aplikasi pencatat keuangan pribadi berbasis web yang membantu pengguna (khususnya pelajar/mahasiswa) memantau uang jajan bulanan mereka dengan bantuan Asisten AI yang memberikan evaluasi dan "roasting" atas kebiasaan belanja penggunanya. Aplikasi ini dibangun sebagai proyek pembelajaran React dengan integrasi Supabase (database & autentikasi) dan Google Gemini AI (analisis struk dan chat).

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Struktur Folder](#struktur-folder)
- [Instalasi dan Menjalankan Secara Lokal](#instalasi-dan-menjalankan-secara-lokal)
- [Konfigurasi Environment Variables](#konfigurasi-environment-variables)
- [Mode Demo](#mode-demo)
- [Skema Database](#skema-database)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

## Tentang Proyek

Banyak pelajar dan mahasiswa kesulitan mengontrol pengeluaran bulanan karena pencatatan keuangan konvensional terasa membosankan dan tidak memberikan umpan balik yang berarti. StrukIn hadir dengan pendekatan berbeda: mencatat pengeluaran tetap mudah (manual, scan struk dengan AI, atau lewat chat), tetapi evaluasinya disampaikan oleh Asisten AI dengan karakter dan gaya bahasa yang dipilih sendiri oleh pengguna, sehingga proses mengontrol keuangan terasa lebih personal dan tidak menggurui secara kaku.

## Fitur Utama

- Autentikasi pengguna (login, daftar, serta mode demo tanpa perlu akun)
- Onboarding interaktif berupa kuis lima pertanyaan yang menentukan karakter Asisten AI paling sesuai dengan gaya pengguna
- Dashboard utama menampilkan sisa uang jajan, Survival Score, total pengeluaran, dan input pengeluaran cepat
- Fitur Tambah Saldo untuk menambah limit budget bulanan langsung dari halaman profil
- Evaluasi AI (roasting) dengan tiga pilihan karakter (Dosen Killer, Emak Bawel, Teman Santai) dan tiga level kepedasan (Manis, Sedang, Pedas Mampus)
- Scan struk belanja menggunakan Google Gemini AI untuk mengekstrak daftar item dan nominal secara otomatis
- Riwayat transaksi dengan pencarian, filter kategori dan bulan, serta ekspor ke CSV dan PDF
- Chat dengan Asisten AI seputar kondisi keuangan pengguna
- Grafik sebaran pengeluaran per kategori
- Halaman profil dan pengaturan untuk mengubah karakter AI, level kepedasan, dan budget
- Tampilan responsif dengan navigasi atas untuk desktop dan bottom navigation bar mengambang (glassmorphism) khusus tampilan mobile

## Teknologi yang Digunakan

- React 19 sebagai library utama antarmuka pengguna
- Vite sebagai build tool dan dev server
- Supabase untuk autentikasi dan database (PostgreSQL)
- Google Generative AI (Gemini) untuk analisis struk dan chat AI
- Chart.js dan react-chartjs-2 untuk visualisasi data
- lucide-react untuk kumpulan ikon SVG
- CSS murni dengan custom properties (CSS variables) untuk theming, tanpa framework CSS tambahan
- Oxlint untuk linting kode

## Struktur Folder

```
StrukIn-App-master/
├── api/                     Fungsi backend untuk memanggil Gemini API
├── docs/screenshots/        Kumpulan tangkapan layar aplikasi
├── public/                  Aset statis
├── src/
│   ├── assets/              Gambar dan aset lain
│   ├── components/          Seluruh komponen halaman (Auth, Dashboard, Scan, dll)
│   ├── lib/                 Konfigurasi klien Supabase dan Gemini
│   ├── App.jsx              Komponen utama dan routing antar tab
│   ├── index.css            Style global dan design token
│   └── main.jsx             Entry point aplikasi
├── supabase_schema.sql      Skema database yang perlu dijalankan di Supabase
├── .env.example             Contoh konfigurasi environment variables
└── package.json
```

## Instalasi dan Menjalankan Secara Lokal

Pastikan Node.js (versi 18 ke atas disarankan) dan npm sudah terpasang di komputer.

1. Clone repository ini

   ```bash
   git clone https://github.com/username/strukin-app.git
   cd strukin-app
   ```

2. Install seluruh dependency

   ```bash
   npm install
   ```

3. Salin file `.env.example` menjadi `.env` dan isi dengan kredensial masing-masing

   ```bash
   cp .env.example .env
   ```

4. Jalankan development server

   ```bash
   npm run dev
   ```

5. Buka `http://localhost:5173` di browser

Perintah lain yang tersedia:

| Perintah | Keterangan |
|---|---|
| `npm run dev` | Menjalankan aplikasi dalam mode pengembangan |
| `npm run build` | Membuat build produksi ke folder `dist` |
| `npm run preview` | Menjalankan hasil build produksi secara lokal |
| `npm run lint` | Memeriksa kode dengan Oxlint |

## Konfigurasi Environment Variables

Buat file `.env` di root proyek dengan variabel berikut:

```
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

- `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` didapatkan dari dashboard proyek Supabase, pada menu Project Settings > API
- `VITE_GEMINI_API_KEY` didapatkan dari Google AI Studio

## Mode Demo

Apabila `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` belum dikonfigurasi, aplikasi akan otomatis berjalan dalam Mode Demo. Pada mode ini:

- Data disimpan pada `localStorage` browser, bukan ke database
- Pengguna dapat langsung masuk tanpa perlu membuat akun melalui tombol Bypass & Gunakan Mode Demo pada halaman login
- Seluruh fitur utama tetap dapat dicoba tanpa memerlukan konfigurasi Supabase

Mode ini berguna untuk keperluan demonstrasi maupun pengembangan tampilan tanpa harus menyiapkan backend terlebih dahulu.

## Skema Database

Struktur tabel yang dibutuhkan aplikasi ini tersedia pada file `supabase_schema.sql`. Jalankan seluruh isi file tersebut pada SQL Editor di dashboard Supabase untuk membuat tabel `profiles` dan `transactions` beserta kebijakan Row Level Security (RLS) yang diperlukan.

## Kontribusi

Proyek ini dibuat untuk keperluan pembelajaran. Saran, masukan, dan perbaikan sangat terbuka melalui Issues maupun Pull Request.

## Lisensi

Proyek ini dibuat untuk keperluan pembelajaran dan tugas kuliah. Silakan gunakan dan modifikasi sesuai kebutuhan.
