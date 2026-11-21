# Rancangan Halaman SPOI 2025 (Draft V13)

Status: **rancangan untuk direview Feri. Belum ada kode.** Data sudah siap di `src/data/spoi-2025/` (lihat [data-inventory-2025.md](data-inventory-2025.md) dan [data-issues-2025.md](data-issues-2025.md)).
Dasar rancangan: hanya data yang benar-benar ada (aturan 3). Tidak ada halaman yang diisi data contoh.

## 1. Prinsip

1. **Edisi berdiri sendiri.** 2023 dan 2025 punya halaman dan data sendiri. Tidak ada grafik, persentase, atau tabel yang menggabungkan atau membandingkan keduanya (aturan 5).
2. **Draf selalu terlihat.** Setiap halaman 2025 menampilkan penanda "Draf V13, angka belum final". Ini demo untuk AOI, dan dokumennya sendiri belum final.
3. **Patahan 2022 ke 2023 tidak disembunyikan.** Di grafik tren, 2019-2022 dan 2023-2024 dibedakan secara visual dan diberi keterangan.
4. **Perubahan persen hanya dihitung 2023 ke 2024** (periode yang sama sumbernya). 2019 ke 2024 tidak dihitung karena melewati patahan.
5. **Yang tidak ada ditulis tidak ada.** Peta dan ranking provinsi, retail, ekspor-impor, wild collection tidak punya halaman. Statusnya terlihat jelas di matriks indikator (bagian 3.6).
6. Semua konvensi lama tetap: judul grafik berbentuk temuan, satuan, sumber, tabel dan CSV, format `id-ID`, mobile 360 px, teks di `src/content`, data lewat `api.ts`.

## 2. Navigasi dan struktur

Pemilih edisi di navbar: **2023 | 2025 (draf)**. Rute edisi 2025 diberi awalan `/2025` agar tautan 2023 yang sudah dibagikan tidak berubah.

| Menu | Rute | Isi | Indikator Feri |
|---|---|---|---|
| Beranda | `/2025` | Angka utama, tren, peringkat, matriks kelengkapan | 1, 4, 5, 7 |
| Komoditas | `/2025/komoditas`, `/2025/komoditas/:id` | 16 komoditas, tabel dan halaman detail | 1, 4, 5, 7 |
| Konsumen | `/2025/konsumen` | Survei 235 responden, 20 grafik | 8 |
| Ekosistem | `/2025/ekosistem` | PGS, komunitas konsumen, linimasa kebijakan | 9, 10, 12 |
| Riset | `/2025/riset` | Publikasi riset per topik | 11 |
| Tentang Data | `/2025/tentang-data` | Sumber, metodologi, keterbatasan, catatan data | semua |

Mobile: bottom tabbar 5 tab (Beranda, Komoditas, Konsumen, Ekosistem, Tentang Data). Riset lewat menu seperti di 2023.
Indikator 13 (pertanian berkelanjutan, narasi konsep) tidak jadi halaman sendiri. Usul: dimuat nanti sebagai bagian ringkas di Ekosistem setelah Feri setuju (lihat keputusan 5).

## 3. Halaman

### 3.1 Beranda

```
[Draf V13 · Data 2019-2024]                     <- banner status
Pertanian organik Indonesia 2025
[ Luas | Produksi | Petani ]                     <- pilih metrik (ChoiceGroup)

[KPI: komoditas terbesar per metrik, 2024]       <- 3 kartu, sparkline, perubahan 2023->2024
 Luas   Beras 4.527,4 ha   -4,1%
 Prod.  Beras 37.948 ton   +8,4%
 Petani Beras 12.274       -9,2%

[Tren komoditas (pilih)]  | [Peringkat 2024]    <- bar 2019..2024, patahan ditandai
                          |  per kelompok

Wawasan
 [Kelengkapan data kab/kota]  [Peringkat tanaman]  [Produk lain]

[Matriks indikator: tersedia / sebagian / belum ada]
```

- KPI memakai nilai tunggal komoditas, **bukan jumlah lintas komoditas**. Alasan: luas hanya ada untuk 9 dari 16 komoditas, dan jumlah 9 komoditas (sekitar 10.108 ha) bertentangan dengan total Tabel 3 (2.747 ha), jadi total nasional tidak bisa dibuat dengan jujur (butir 1).
- Perubahan 2023 ke 2024 dihitung (derived, diberi label). Angka 2019-2022 tidak dihitung persennya.
- Peringkat dipisah dua kelompok sesuai kategori unit analisis dokumen (Bab 2.2.1): **Tanaman** (13 komoditas) dan **Produk lain** (madu, ternak, pupuk). Alasan: pupuk 8 juta ton akan menenggelamkan semuanya bila satu grafik. Pengelompokan ini pengelompokan tampilan, bukan dari dokumen.
- Kartu kelengkapan data: batang bertumpuk 15 lengkap / 16 tidak lengkap / 483 tidak ada dari 514 kab/kota (Tabel 1), judul berbentuk temuan: "Hanya 2,9% kabupaten/kota yang melapor lengkap".
- Matriks indikator: 13 baris, status per baris, lihat 3.6. Ini sekaligus alasan kenapa sistem input diperlukan.

### 3.2 Komoditas (daftar)

- Tabel yang bisa diurutkan, pilih tahun (default 2024), pilih metrik.
- Kolom: komoditas, luas, produksi, petani/operator, perubahan 2023-2024, mini-tren (sparkline dengan garis patahan), penanda † bila ada catatan.
- "–" (bukan 0) bila komoditas tidak punya seri itu (misalnya luas umbi). Dua tabel (Tanaman, Produk lain) seperti pola 2023.
- Bar chart peringkat di atas tabel mengikuti metrik terpilih.

### 3.3 Komoditas (detail)

- Kartu ringkasan 2024 per metrik yang ada, dengan † bila ada catatan.
- Blok "Catatan data †": daftar butir dari `issues` seri itu, dalam bahasa sederhana (patahan 2023, nilai identik, label grafik tidak cocok, teks bertentangan).
- Grafik tren per metrik (maks 3, pola 2023), bar 2019-2024 dengan patahan. Tabel dan CSV.
- **Tidak ada grafik provinsi.** Diganti satu kartu informasi: "Sebaran provinsi tersedia hanya sebagai gambar peta di dokumen" (lihat keputusan 2).
- Navigasi komoditas sebelum/berikutnya.

### 3.4 Konsumen (halaman baru)

Header: "235 responden. Hasil survei ini bukan sensus dan tidak mewakili seluruh konsumen Indonesia." Empat bagian:

| Bagian | Grafik dokumen | Bentuk |
|---|---|---|
| Profil responden | 36-41 (domisili, gender, usia, pekerjaan, pendidikan, pendapatan) | Bar horizontal. Urutan alami untuk usia, pendidikan, pendapatan. Urut menurun untuk domisili, pekerjaan |
| Cara belanja | 42-48 (cara memperoleh, platform, alasan daring/luring, pengeluaran) | Bar horizontal, pilihan ganda diberi tulisan "boleh pilih lebih dari satu" |
| Produk | 49-50 (segar, olahan) | Bar horizontal urut menurun |
| Kepercayaan dan sertifikasi | 51-55 (faktor kepercayaan, pentingnya sertifikasi, jenis penjaminan, kemudahan akses, faktor pembelian) | Bar bertumpuk 4 tingkat (51, 55), bar sederhana lainnya |

- Judul tiap grafik berbentuk temuan, mis. "93% responden menyatakan sertifikasi organik penting".
- Grafik 43-48 menampilkan catatan penyebut: "Dasar persentase tidak dinyatakan di dokumen" (sub-kelompok pengguna online/offline).
- Teks dokumen yang bertentangan dengan grafik (butir 11 dan 12) **tidak dipakai**. Judul diambil dari angka di grafik.
- Tidak menampilkan perbandingan dengan SPOI 2019/2023 yang disebut di narasi dokumen (butir 30).

### 3.5 Ekosistem

Satu halaman, tiga bagian bernavigasi anchor:
1. **PGS:** kartu per sistem (PAMOR, ROLES, PGS Lestari, WFL) dengan angka kunci (640 petani, 124,38 ha, 12 kabupaten, 20 unit, 5 calon unit untuk PAMOR) dan satu kalimat konteks. Total 1.340 petani sebagai ringkasan. Catatan † untuk ROLES (200 vs 1000).
2. **Komunitas konsumen:** 6 kartu dari tabel komunitas (KOI, Lingkar Organik, 1000 Kebun, Milas, AOI, jaringan PGS).
3. **Kebijakan:** linimasa vertikal 11 periode (Pra-1970-an sampai 2025-2045). Di mobile jadi daftar.

### 3.6 Riset

- Bar berkelompok per topik untuk 4 titik (2015, 2020, 2023, 2024). Judul temuan: "Publikasi riset organik naik dari 97 (2015) menjadi 1.028 (2024)". Angka yang dipakai adalah jumlah topik (1.028), karena total tertulis (1.030) tidak cocok, dan ada catatan † untuk itu.
- Kartu total per tahun. Persentase pertumbuhan dokumen **tidak ditampilkan** (butir 9, rumus tidak konsisten dan interval tidak seragam). Yang ditampilkan: kenaikan 2023 ke 2024 yang dihitung, diberi label derived.
- Garuda (jumlah artikel portal) dimuat sebagai catatan konteks dengan tanda "kurang lebih".

### 3.7 Tentang Data

- Sumber dan status: draf V13, penyusun, tanggal terbit belum jelas, file Excel sumber belum tersedia.
- Metodologi ringkas: sumber data (AOI, LSO, PGS, pendukung), pengumpulan (survei, FGD, studi literatur), pengolahan.
- **Keterbatasan:** Tabel 1 dan 2 sebagai grafik, plus penjelasan bahwa ini bukan sensus.
- **Definisi:** "luas lahan" **tidak didefinisikan** di dokumen. Ditulis apa adanya, ini poin untuk AOI.
- **Matriks indikator** (13 baris): Tersedia (8 survei konsumen, 9, 10, 11, 12, 13 narasi) / Sebagian (1, 4, 5, 7) / Belum ada data (2, 3, 6). Tiap baris menjelaskan apa yang ada dan apa yang kurang, tanpa kata "gagal".
- **Catatan data:** daftar butir masalah versi bahasa pengguna dan ajakan "konfirmasi ke AOI".
- Kredit ke AOI dan Bappenas.

## 4. Komponen

| Komponen | Status |
|---|---|
| KpiCards, ChartCard, DataTable, CommodityTable, RankingList, DeltaPill, PageHeader, ChoiceGroup, BarChart, GroupedBarChart, Sparkline, NavIcon | Dipakai ulang |
| TrendChart | Ditambah `breakAfter` (garis patahan, bar 2019-2022 berpola arsir) |
| EditionSwitch | Baru, di AppNav |
| StatusBanner | Baru, penanda draf |
| StackedScaleChart | Baru, bar bertumpuk 4 tingkat untuk Grafik 51 dan 55 |
| Timeline | Baru, linimasa kebijakan |
| IndicatorMatrix | Baru, tabel status 13 indikator |
| CoverageBar | Baru, batang bertumpuk 3 segmen |

## 5. Lapisan teknis

- `types.ts`: tambah tipe untuk 2025 (`YearKey2025`, `NationalData2025`, `SurveyChart`, `Coverage`, dll). Tipe 2023 tidak diubah.
- `api.ts`: tetap satu-satunya pintu. Tambah fungsi berakhiran edisi (`getNational2025()`, `getSurvey2025()`, `getCoverage2025()`, `getResearch2025()`, `getPolicy2025()`, `getPgs2025()`, `getMeta2025()`, `YEARS_2025`). Tidak ada fungsi yang mengambil dua edisi sekaligus.
- Teks UI: file baru `src/content/id-2025.ts` dan `flags-2025.ts` (peta nomor butir ke kalimat penanda †). Tidak ada angka dan teks di template.
- Router: grup rute `/2025/*` dengan layout yang sama. Halaman 2023 tidak berubah.
- Peta provinsi, `provinceMap.ts`, dan GeoJSON tidak dipakai untuk 2025.

## 6. Urutan kerja

| Tahap | Isi | Hasil yang bisa dilihat |
|---|---|---|
| 1 | Tipe, `api.ts`, rute `/2025`, EditionSwitch, StatusBanner, Beranda | Beranda 2025 |
| 2 | Daftar dan detail Komoditas, TrendChart dengan patahan | Komoditas |
| 3 | Konsumen, StackedScaleChart | Konsumen |
| 4 | Ekosistem dan Riset | Ekosistem, Riset |
| 5 | Tentang Data dan IndicatorMatrix | Tentang Data |

Tiap tahap diuji di 360 px, `npm run build` dan `type-check` bersih, lalu ditunjukkan ke Feri sebelum lanjut.

## 7. Keputusan yang dibutuhkan dari Feri

1. **Pemilih edisi di satu aplikasi** (rekomendasi) atau 2025 sebagai situs terpisah.
2. **Gambar peta dokumen** (Gambar 1-16, 32 file, sekitar 2 MB) di halaman detail komoditas? Rekomendasi: ya, sebagai gambar statis dengan keterangan "Gambar dari SPOI 2025 draf, tidak interaktif". Risiko: nilai di peta belum final.
3. **Pengelompokan Tanaman / Produk lain** untuk peringkat, seperti di 3.1.
4. **Seri 2019-2022:** (a) tampil dengan penanda patahan (rekomendasi) atau (b) hanya 2023-2024, karena metodologi menyebut pengumpulan dibatasi pada dua tahun itu dan 2019-2022 kemungkinan dari edisi sebelumnya. Pilihan (b) lebih aman terhadap aturan 5, tapi grafik tren hanya punya dua batang.
5. **Pertanian berkelanjutan (indikator 13):** ditunda, dimuat ringkas di Ekosistem, atau dikeluarkan.
