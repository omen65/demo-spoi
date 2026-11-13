# Rancangan Halaman Demo SPOI 2023

Status: **disetujui Feri (ikut usulan).** Beranda sudah dibangun; halaman lain menyusul. Rancangan ini hanya memakai data yang sudah ada di `src/data/spoi-2023/` (lihat `docs/data-inventory.md`), dan mengikuti keputusan di `docs/data-issues.md`.

## 1. Peta situs

| Rute | Halaman | Sumber data | Catatan |
|---|---|---|---|
| `/` | Beranda | national.json | 10 komoditas utama, tanpa total lintas komoditas |
| `/komoditas` | Komoditas (daftar) | national.json | urut dan filter; 10 utama + "Lainnya" |
| `/komoditas/:id` | Detail komoditas | national.json, provinces.json | tren 3 metrik + 5 provinsi teratas |
| `/wilayah` | Wilayah | provinces.json + GeoJSON | peta, peringkat, panel provinsi |
| `/pasar-lainnya` | Pasar dan produk lain | national.json | pasar, olahan, madu, ternak, pupuk, jamur, jaminan komunitas |
| `/riset` | Riset | research.json | batang berkelompok 3 titik waktu (bukan tren tahunan) |
| `/tentang-data` | Tentang Data | docs + JSON | definisi, sumber, keterbatasan, daftar catatan data |

Navigasi di HP: tab bawah dengan lima tujuan (Beranda, Komoditas, Wilayah, Lainnya, Tentang). "Lainnya" membuka Pasar dan produk lain; Riset dijangkau dari Beranda dan halaman Lainnya. Di desktop: bar atas biasa. Label **"Demo"** dan kredit "Data: SPOI 2023, Aliansi Organis Indonesia (terbit September 2023)" tampil di header dan footer setiap halaman.

Yang **tidak dibuat** karena tidak ada di PDF: total nasional, tren konsumen tahunan, wilayah untuk jamur/madu/ternak/pupuk/pasar.

## 2. Aturan yang berlaku di semua chart

- Komponen pembungkus `ChartCard`: judul, satuan, sumber (halaman dan tabel dari `source` di JSON), tombol **"Lihat sebagai tabel"** (dengan unduh CSV), dan `aria-label` ringkas.
- **Judul menyatakan temuan dan dihitung dari data**, bukan ditulis tangan. Contoh: "Luas lahan kopi organik naik 1,2% dari 2019 ke 2022". Templat kalimat ada di file teks UI, angkanya diisi komposable. Dengan begitu tidak ada angka hardcode di komponen.
- **Penanda untuk angka janggal** (keputusan Feri): titik/batang berpenanda khusus (segitiga kecil), tooltip memuat "Perlu konfirmasi AOI (butir N)", dan penjelasan lengkap di Tentang Data. Angka tidak diubah.
- **Kosong vs 0:** `null` = "Tidak ada data" (di peta abu berpola, di tabel tanda "-"), 0 = 0.
- Seri tidak dibedakan hanya dengan warna: kombinasi warna, bentuk penanda, dan gaya garis. Palet aman untuk buta warna (kontras luminans berbeda).
- Angka: `Intl.NumberFormat('id-ID')`, tooltip menampilkan angka lengkap (tidak dibulatkan).
- Tidak ada yang dihitung sendiri selain rasio sederhana yang diberi label "dihitung dari ...": perubahan persen 2019-2022 dan produktivitas (ton per petani). Produktivitas tidak ditampilkan bila produksi atau petani = 0 atau `null` (jeruk 2019-2021).

## 3. Halaman per halaman

### Beranda (`/`)
Tujuan: dalam satu layar HP, pembaca paham apa itu SPOI dan melihat "denyut" tiap komoditas.
1. **Pembuka:** satu kalimat tentang SPOI 2023 (data 2019-2022, sumber 9 LSO dan 2 PGS), label Demo.
2. **Kartu 10 komoditas utama** (grid 2 kolom di HP, 5 di desktop). Tiap kartu: nama, angka utama luas 2022 (ha), perubahan 2019-2022 dalam persen, dan sparkline luas 4 titik. Klik ke detail komoditas. Tidak ada kartu "total".
3. **Satu chart temuan:** luas 2022 per komoditas (batang horizontal urut), dengan catatan bahwa satu hamparan bisa multi-komoditas sehingga tidak dijumlahkan.
4. **Tautan ke halaman lain:** Wilayah, Pasar dan lainnya, Riset, Tentang Data.

### Komoditas (`/komoditas`)
- Daftar 10 komoditas utama sebagai tabel/kartu yang bisa diurutkan: luas, produksi, petani (2022), perubahan 2019-2022, produktivitas.
- Filter: tahun (default 2022), "tampilkan angka janggal" (penanda).
- Bagian "Lainnya": jamur, kacang-kacangan, umbi-umbian, sayuran (bisa di-klik ke detail), dengan metrik yang ada saja.
- Chart: batang berkelompok perbandingan luas atau produksi antar komoditas (mengikuti pengurutan).

### Detail komoditas (`/komoditas/:id`)
- Tiga chart garis kecil berdampingan (luas, produksi, petani), tiap titik 2019-2022 dengan penanda dan tooltip; jumlah metrik mengikuti data yang ada (kacang hanya produksi).
- Ringkasan: 3 angka 2022 + perubahan persen + produktivitas.
- "Provinsi teratas 2022": 5 provinsi dengan produksi terbesar (dari `provinces.json`), tautan ke Wilayah dengan komoditas ini terpilih.
- Catatan data bila ada `issues` (teks jelas, bahasa awam).
- Setiap chart punya "Lihat sebagai tabel".

### Wilayah (`/wilayah`)
- Pilih **komoditas** (13), **metrik** (luas/produksi/produsen sesuai ada), **tahun** (2019-2022, default 2022).
- **Peta choropleth** Leaflet per provinsi, skala sekuensial satu warna (pasir ke umber), legenda berundak (bukan gradasi halus) agar terbaca, abu berpola untuk "Tidak ada data". Peta dasar polos.
- **Peringkat:** daftar batang horizontal provinsi (hanya yang punya nilai). Ini juga jalur akses keyboard dan pembaca layar untuk peta.
- **Klik provinsi** (atau pilih dari peringkat): panel/bottom sheet menampilkan seluruh komoditas di provinsi itu pada tahun terpilih, diurutkan menurut luas (ha), dengan nilai lengkap. Ini jawaban atas "komoditas utama provinsi", tanpa membandingkan satuan berbeda.
- **Batas data:** hanya 13 komoditas. Teh menampilkan catatan bahwa jumlah provinsi tidak sama dengan angka nasional (butir 23). Kelapa menampilkan catatan salin-tempel (butir 21).
- HP: peta di atas (sekitar 55% tinggi layar), kontrol di atasnya, panel provinsi naik dari bawah.

### Pasar dan lainnya (`/pasar-lainnya`)
Tiga bagian dengan anchor:
1. **Pasar dan olahan:** operator pemasaran, produksi pasar, operator olahan, produksi olahan (2019-2022). Penanda untuk lonjakan 2021 (butir 16).
2. **Produk lain:** madu (panen liar), sarang lebah, ternak (operator dan produksi), pupuk/input (operator dan produksi), jamur (operator). Penanda untuk ternak 2022 (butir 11) dan pupuk (butir 12).
3. **Penjaminan komunitas:** dua kartu angka. PAMOR: 17 unit, 62 operator, 418 produsen. ROLEs: 3 unit, 201 petani, 879,7 ha, 6.222,78 ton rotan basah. Tanpa luas PAMOR dan tanpa lokasi ROLEs (keputusan Feri).

### Riset (`/riset`)
- Satu chart batang horizontal berkelompok: 8 topik × (2015, 2020, 2023). Judul dihitung: topik terbesar 2023 dan total 97 → 273 → 456.
- Catatan jelas: tiga potret, bukan tren tahunan; rentang data kumulatif berbeda; pertumbuhan sejalan dengan pertumbuhan artikel Portal Garuda (buku hlm. 67).

### Tentang Data (`/tentang-data`)
- Tentang SPOI dan AOI, terbit **September 2023**, tahun data 2019-2022, penyusun dan kredit.
- Metodologi singkat: 9 LSO dan 2 PGS, pengumpulan 21 Februari-21 Maret 2023, data kosong/0 = belum terkonfirmasi.
- Definisi dan satuan: luas (ha), produksi (ton), petani/produsen/operator (orang), cara membaca "tidak ada data" vs 0.
- **Batasan:** hanya LSO nasional, cross sectional, satu hamparan multi-komoditas, tidak bisa dibandingkan dengan edisi SPOI lain (SPOI 2018 vs 2025 cakupannya beda), tabel provinsi diekstrak dari gambar (ditranskripsi manual, diverifikasi terhadap angka nasional).
- **Catatan data:** daftar angka berpenanda (butir 5, 6, 10, 11, 16, 21, 23) dalam bahasa awam.
- Label demo dan keterangan bahwa ini bukan produk resmi AOI.

## 4. Gaya visual

- **Palet bumi:** latar krem pasir hangat, teks umber gelap, aksen terakota dan ocher; seri chart memakai kombinasi coklat tua, ocher, terakota, biru-kehijauan tua (bukan hijau daun) dengan luminans berbeda. Warna final dicek untuk kontras (WCAG AA) dan simulasi buta warna.
- **Tipografi:** satu font display (serif berkarakter untuk judul dan angka besar) dan satu font isi (sans yang bersih dan terbaca di 360 px).
- **Tanpa ikon daun.** Ilustrasi hanya pola tekstur halus (garis kontur/tanah) sebagai pengisi.
- Mobile-first, diuji di 360 px dulu.

## 5. Struktur kode (menurut CLAUDE.md)

- `src/data/api.ts`: satu-satunya akses data (`getCommodities()`, `getCommodity(id)`, `getProvinceTable(id)`, `getResearch()`, `getMeta()`), dengan tipe TypeScript untuk JSON.
- `src/content/id.ts`: seluruh teks antarmuka, termasuk templat judul chart.
- `src/composables/`: `useFormat` (Intl id-ID), `useDerived` (perubahan persen, produktivitas), `useCsv`.
- `src/components/`: `ChartCard`, `TrendChart`, `BarChart`, `GroupedBarChart`, `ProvinceMap`, `DataTable`, `FlagBadge`, `AppNav`.
- `src/views/`: satu file per rute di atas.
- Urutan bangun: kerangka + tema + `api.ts` → Beranda → Komoditas dan detail → Wilayah → Pasar dan lainnya → Riset → Tentang Data.

## 6. Keputusan terbuka untuk Feri

1. **Survei konsumen (Gambar 59-67).** Di PDF berupa gambar dengan sampel kecil. Usulan: **tidak masuk v1.** Kalau ingin masuk, perlu transkripsi manual dulu.
2. **Font.** Menanam font lewat paket `@fontsource` (dependency baru di luar daftar CLAUDE.md, berjalan offline) atau Google Fonts lewat tag link (tanpa dependency, butuh internet). Usulan: `@fontsource`, perlu izin Feri.
3. **Dark mode.** Usulan: **tidak dibuat di v1** (opsional di CLAUDE.md, lebih baik konsisten daripada setengah jadi).
4. **Produktivitas** (ton per petani) sebagai metrik turunan di Komoditas dan detail, dengan label "dihitung dari ...". Buku sendiri memakai rasio ini di teks. Setuju?
5. **GeoJSON batas provinsi.** Belum dipilih. Syaratnya: lisensi terbuka yang jelas, ada 38 provinsi termasuk 4 provinsi baru Papua, ukuran di bawah sekitar 500 KB. Kandidat sumber akan gue cek dan lisensinya gue laporkan sebelum dipakai. Bila hanya ada 34 provinsi, tabel pemetaan eksplisit akan menangani provinsi baru (nilainya semua kosong/0 di data SPOI).
