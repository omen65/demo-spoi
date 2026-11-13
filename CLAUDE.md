# Demo Dashboard Publik SPOI

Demo visual dashboard publik untuk **Statistik Pertanian Organik Indonesia (SPOI)** milik Aliansi Organis Indonesia (AOI). Tujuannya menggantikan grafik statis di buku PDF dengan visualisasi interaktif, sebagai gambaran produk sebelum platform pengumpulan data online dibangun.

Pemilik project: Feri. Bahasa kerja: Indonesia. Tampilan dashboard: Bahasa Indonesia.

## Ruang lingkup

Masuk:
- Dashboard publik, read-only, data dari SPOI 2023 (terbit Desember 2023, tahun data 2019-2022).
- Responsive, mobile-first (pengguna buka dari HP).

Tidak masuk (jangan dibuat, jangan disiapkan "sekalian"):
- Admin, login, form input data, manajemen user.
- Backend, database, API sungguhan. Semua data statis dari file JSON.
- Aplikasi mobile native.

## Stack

- Vue 3 + Vite + TypeScript, `<script setup>`
- Vue Router
- Chart: ECharts lewat `vue-echarts`
- Peta: Leaflet (peta choropleth per provinsi dari GeoJSON)
- Styling: Tailwind CSS
- State: cukup `ref`/`computed` dan composable. Jangan tambah Pinia kecuali benar-benar perlu.
- Hasil build harus berupa situs statis (`npm run build`), bisa di-host di mana saja.

Konfirmasi ke Feri sebelum menambah dependency di luar daftar ini.

## Aturan data (paling penting)

1. **Jangan mengarang angka.** Setiap angka di dashboard harus bisa ditelusuri ke halaman atau tabel di PDF. Simpan rujukannya di JSON (`source: "SPOI 2023, hlm. X, Tabel Y"`).
2. Kalau angka di PDF janggal atau tidak konsisten (total tidak sama dengan jumlah bagian, satuan beda), **catat di `docs/data-issues.md`** dan tanya Feri. Jangan diam-diam dibetulkan.
3. Kalau data tidak ada di PDF, halamannya tidak dibuat. Jangan diisi data contoh.
4. Pakai definisi persis seperti di PDF (misalnya "luas lahan" itu tersertifikasi, total, atau termasuk masa konversi). Tampilkan definisi itu di halaman "Tentang Data".
5. Angka SPOI antar edisi **tidak bisa langsung dibandingkan**. Contoh: SPOI 2018 mencatat 251.630 ha, sedangkan SPOI 2025 mencatat 65.100 ha (2024). Cakupannya kemungkinan berbeda. Dashboard ini hanya memakai SPOI 2023, jangan digabung dengan edisi lain.
6. Hanya data agregat (per komoditas, provinsi, tahun). Tidak ada titik koordinat lahan atau data individu petani.

## Urutan kerja

Jangan langsung ngoding. Urutannya:

1. **Inventaris data.** Baca PDF di `source/`. Tulis `docs/data-inventory.md`: semua tabel dan grafik yang ada (halaman, judul, dimensi, tahun, satuan), mana yang bisa diekstrak jadi data terstruktur, mana yang hanya gambar. **Berhenti dan tunjukkan ke Feri.**
2. **Ekstraksi data.** Ubah tabel jadi JSON di `src/data/spoi-2023/`. Skrip ekstraksi taruh di `scripts/` dan bisa dijalankan ulang. Validasi: total vs jumlah bagian, tidak ada nilai kosong tersembunyi.
3. **Rancang halaman** berdasarkan data yang benar-benar ada, bukan daftar di bawah. Tunjukkan rancangan ke Feri.
4. **Bangun** halaman satu per satu, mulai dari Beranda.

## Halaman (usulan, sesuaikan dengan isi PDF)

- **Beranda**: angka utama (luas lahan, jumlah produsen, jumlah komoditas), tren 2019-2022, tautan ke halaman lain.
- **Komoditas**: perbandingan 17 komoditas (luas, produsen, produktivitas), bisa diurutkan dan difilter.
- **Wilayah**: peta choropleth per provinsi, ranking provinsi, klik provinsi untuk melihat komoditas utamanya.
- **Riset**: tren riset pertanian organik per tahun (kalau ada di PDF).
- **Tentang Data**: sumber, metodologi, definisi, tanggal terbit, kredit ke AOI.

## Desain dan UX

- Mobile-first. Uji di lebar 360px sebelum desktop.
- Tema pertanian organik, tapi jangan klise (hindari hijau daun generik dan ikon daun di mana-mana). Pilih palet bumi yang konsisten, satu font display dan satu font isi.
- Palet chart harus aman untuk buta warna. Jangan membedakan seri hanya dengan warna.
- Setiap chart punya judul yang menyatakan temuannya, satuan yang jelas, dan keterangan sumber di bawahnya.
- Tooltip menampilkan angka lengkap. Format angka pakai `Intl.NumberFormat('id-ID')` (titik ribuan, koma desimal).
- Tiap chart punya tombol "Lihat sebagai tabel" supaya data bisa dibaca dan di-unduh (CSV).
- Dark mode opsional, tapi kalau dibuat harus konsisten di semua halaman.
- Aksesibilitas: kontras teks cukup, bisa dinavigasi dengan keyboard, ada `aria-label` pada chart.

## Struktur folder

```
demo/
  CLAUDE.md
  source/              PDF SPOI 2023 (jangan diubah, jangan di-commit kalau besar)
  docs/                data-inventory.md, data-issues.md, catatan rancangan
  scripts/             skrip ekstraksi data dari PDF
  src/
    data/spoi-2023/    JSON hasil ekstraksi
    data/api.ts        satu-satunya pintu akses data
    components/
    views/
    composables/
    assets/geo/        GeoJSON provinsi
```

`src/data/api.ts` adalah lapisan akses data. Semua komponen mengambil data lewat situ, tidak membaca JSON langsung. Tujuannya supaya nanti sumber data bisa diganti dari JSON ke API platform asli tanpa menulis ulang halaman, dan supaya edisi SPOI berikutnya bisa ditambah sebagai folder data baru.

## Peta

- GeoJSON batas provinsi harus dari sumber terbuka yang jelas lisensinya. Catat sumber dan lisensinya di `docs/`.
- Sederhanakan geometri (mapshaper atau topojson) supaya file di bawah sekitar 500 KB.
- Nama provinsi di GeoJSON dan di data SPOI dicocokkan lewat tabel pemetaan eksplisit, bukan pencocokan string longgar. Perhatikan pemekaran provinsi baru di Papua.
- Gambar peta dasar pakai OpenStreetMap atau tile polos. Tidak perlu API berbayar untuk demo ini.

## Konvensi kode

- TypeScript strict. Hindari `any`.
- Komponen kecil dan satu tujuan. Chart dibungkus komponen sendiri (`BarChart.vue`, `TrendChart.vue`, `ProvinceMap.vue`) yang menerima data lewat props.
- Teks antarmuka (label, judul) dikumpulkan di satu tempat, jangan tersebar di template.
- Commit kecil dan sering, pesan commit dalam bahasa Inggris.

## Perintah

```
npm install
npm run dev        # development
npm run build      # build statis
npm run type-check
```

## Definisi selesai (demo v1)

- Semua halaman membaca data dari `src/data/spoi-2023/`, tidak ada angka hardcode di komponen.
- Setiap angka bisa ditelusuri ke PDF.
- Jalan baik di HP 360px maupun desktop.
- `npm run build` sukses tanpa error dan peringatan TypeScript.
- Halaman "Tentang Data" memuat definisi, sumber, dan batasan data.
- Feri sudah mereview daftar `docs/data-issues.md`.
