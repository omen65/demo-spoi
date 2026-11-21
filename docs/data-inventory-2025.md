# Inventaris Data SPOI 2025 (Draft V13)

Sumber: `source/Statistik Pertanian Organik Indonesia Draft V13 (1).docx` (Bappenas + AOI, bertanggal "Jakarta, 2025").
Dibaca: seluruh teks, 6 tabel, 55 grafik (nilai diambil dari data tersimpan di dalam file Word, bukan dibaca dari gambar), dan 32 gambar peta.
Status: **inventaris saja. Belum ada data yang diekstrak ke `src/data/`.** Masalah data ada di [data-issues-2025.md](data-issues-2025.md).

Aturan CLAUDE.md nomor 5 tetap berlaku: edisi 2025 tidak digabung atau dibandingkan dengan 2023.

## 1. Temuan utama (baca ini dulu)

1. **Ini draf, belum final.** Ada catatan kerja yang tertinggal di teks: "(Data retail di menunggu)", "(rujuk data FibL) kalau import data yang kita", "(Anggota AOI)", sel kosong di Tabel 3, sel berisi tanda ` di Tabel 4. Beberapa teks narasi bertentangan dengan grafiknya (lihat data-issues-2025.md).
2. **Grafik bersumber dari file Excel di luar dokumen:** `SPOI_Data_Analysis_August2026.xlsx` (tertaut ke `E:\SEF Internship_AOI\A_Updated Data for SPOI\`). Angka yang bisa kita baca adalah salinan tersimpan di grafik. **Sumber aslinya adalah xlsx itu, dan kita belum punya.** Ini penting untuk demo dan terutama untuk sistem input nanti.
3. **Data per provinsi hanya ada sebagai gambar peta** (32 gambar PNG, nilai dibaca dari skala warna). Tidak ada tabel angka per provinsi. Peta choropleth seperti di dashboard 2023 tidak bisa dibuat dari dokumen ini tanpa xlsx sumber.
4. **Seri 2019-2022 kemungkinan salinan dari edisi sebelumnya, 2023-2024 data baru.** Metodologi menyebut pengumpulan "dibatasi hanya pada data tahun 2023 dan 2024 dan beberapa 2025". Di semua grafik komoditas ada patahan tajam di 2022 ke 2023 (kopi 31.773 ke 1.185 ha, kelapa 21.542 ke 2.807 ha, rempah 8.002 ke 453 ton). Ini hampir pasti perubahan cakupan, bukan perubahan di lapangan. Menyambung dua periode ini dalam satu grafik tren menyesatkan.
5. **Cakupan wilayah sangat rendah.** Tabel 1: dari 514 kabupaten/kota hanya 15 (2,92%) yang melapor lengkap, 16 tidak lengkap, 483 (93,97%) tidak ada data. Dokumen sendiri bilang ini "bukan sensus".
6. **Indikator 8 (tren pasar dan persepsi konsumen) ternyata kuantitatif.** Bab 8 berisi survei 235 responden dengan 20 grafik persentase. Ini bukan narasi. Lihat bagian 3.

## 2. Pemetaan ke 13 indikator utama

| # | Indikator | Jenis | Ada di dokumen? | Bentuk data | Catatan |
|---|---|---|---|---|---|
| 1 | Luas lahan organik (ha), provinsi dan nasional | Kuantitatif | **Sebagian** | Nasional: seri tahunan per komoditas (9 komoditas). Per wilayah pulau: Tabel 3 (2024 saja). Per provinsi: hanya gambar peta | Tabel 3 kolom 2020 dan 2023 kosong. Total 2.747 ha tidak konsisten dengan grafik (lihat issues) |
| 2 | Persentase luas lahan dan produktivitas (share), provinsi dan nasional | Kuantitatif | **Tidak ada** | - | Tidak ditemukan tabel atau grafik. Bisa dihitung sendiri (derived) kalau datanya ada, tapi pembaginya belum jelas |
| 3 | Penjualan retail organik (share), nasional | Kuantitatif | **Tidak ada** | - | Bab 4 hanya narasi, ada catatan "(Data retail di menunggu)" |
| 4 | Produsen organik (orang), provinsi dan nasional | Kuantitatif | **Sebagian** | Nasional: seri petani 8 komoditas + operator ternak dan pupuk (Grafik 26-35). Provinsi: tidak ada | Tidak ada total produsen nasional lintas komoditas |
| 5 | Penggunaan lahan per komoditas (ha dan ton), provinsi dan nasional | Kuantitatif | **Sebagian** | Nasional: Grafik 1-25 (luas dan produksi). Provinsi: gambar peta | Luas hanya ada untuk 9 dari 16 komoditas |
| 6 | Ekspor dan impor produk organik (ton), nasional | Kuantitatif | **Tidak ada** | - | Bab 6 hanya narasi, ada catatan "(rujuk data FibL)" |
| 7 | Produktivitas produk (ton): koleksi liar, peternakan, produk olahan, ternak lebah, input produksi, jamur | Kuantitatif | **Sebagian** | Ada: ternak (Grafik 24), madu/lebah (23), pupuk/input (25). Tidak ada: koleksi liar (Bab 7 narasi), produk olahan, jamur | "Produktivitas" di dokumen berarti volume produksi (ton), bukan ton per ha |
| 8 | Tren pasar dan persepsi konsumen | Kualitatif menurut Feri, **tapi datanya kuantitatif** | **Ya** | Survei 235 responden, 20 grafik persentase (Grafik 36-55) | Lihat bagian 3 |
| 9 | Gerakan pertanian organik dan PGS | Kualitatif | Ya | Narasi, ditambah angka lepas (640 petani, 124,38 ha, 12 kabupaten, 20 Unit PAMOR, 10 simpul WFL) | Angka PGS tidak dalam bentuk tabel |
| 10 | Regulasi dan kebijakan, provinsi/kab/kota dan nasional | Kualitatif | Ya, nasional saja | 1 tabel linimasa (11 baris, 1970-an sampai 2045) | Tidak ada regulasi daerah |
| 11 | Publikasi riset organik, provinsi | Kualitatif | Ya, nasional | Tabel 4 (8 topik, 4 tahun) | Tidak ada pemecahan provinsi |
| 12 | Gerakan konsumsi organik, provinsi | Kualitatif | Ya | 1 tabel komunitas (6 baris) dan narasi KOI, Lingkar Organik, 1000 Kebun, Milas, AOI | Angka lepas: OGH Expo 217 produsen, Lingkar Organik 750+ petani |
| 13 | Pertanian berkelanjutan (di luar organik) | Kualitatif | Ya | Narasi konsep (Bab 13: 11 pendekatan) | Tidak ada angka |

## 3. Daftar lengkap tabel dan grafik

### 3.1 Tabel (6)

| Tabel | Isi | Dimensi | Bisa diekstrak? |
|---|---|---|---|
| 1 | Kelengkapan data kabupaten/kota | 7 wilayah x 3 status (lengkap, tidak lengkap, tidak ada). Total dan persen | Ya. Jumlah baris dan total konsisten (dicek) |
| 2 | Kelengkapan data lembaga dan mitra AOI | 5 jenis lembaga x 3 status | Ya. Total dan persen konsisten (dicek) |
| 3 | Luas lahan organik per wilayah | 7 wilayah, kolom 2020, 2023, 2024 | **Hanya 2024.** Kolom 2020, 2023, dan persen perubahan kosong |
| 4 | Publikasi riset organik | 8 topik x 2015, 2020, 2023, 2024 + total artikel portal Garuda | Ya, tapi total 2024 salah hitung dan persen pertumbuhan tidak konsisten |
| (tanpa nomor) | Linimasa kebijakan | 11 periode x 3 kolom teks | Ya, teks |
| (tanpa nomor) | Komunitas konsumen organik | 6 komunitas x 2 kolom teks | Ya, teks |

### 3.2 Grafik komoditas (Grafik 1-35), semuanya nasional, tahun 2019-2024

Tiap grafik berisi 6 titik tahunan. Nilai ada di `scratchpad` hasil ekstraksi dan siap dipindah ke JSON di langkah 2.

| Komoditas | Luas (ha) | Produksi (ton) | Petani | Operator |
|---|---|---|---|---|
| Beras | G2 | G1 | G26 | - |
| Kelapa | G4 | G3 | G27 (judul tidak menyebut kelapa, dugaan dari posisi bab 5.2) | - |
| Pisang | G6 | G5 | G28 | - |
| Kopi | G8 | G7 | G29 | - |
| Jeruk | G10 | G9 | G30 | - |
| Teh | G12 | G11 | G31 | - |
| Kakao | G14 | G13 | G32 | - |
| Aren | G16 | G15 | - | - |
| Buah tropis | G18 | G17 | G33 | - |
| Umbi | - | G19 | - | - |
| Rempah | - | G20 | - | - |
| Kacang | - | G21 | - | - |
| Sayur | - | G22 | - | - |
| Madu | - | G23 (2024 kosong) | - | - |
| Ternak | - | G24 | - | G34 |
| Pupuk | - | G25 | - | G35 |

16 komoditas. Luas ada untuk 9, produksi untuk 16, petani untuk 8, operator untuk 2.
Satuan produksi ton, luas hektare. Tidak ada pernyataan definisi "luas" (tersertifikasi, total, atau masa konversi), padahal CLAUDE.md aturan 4 mewajibkan definisi persis.

### 3.3 Grafik survei konsumen (Grafik 36-55), n = 235 responden

Semua persentase. Beberapa berpilihan ganda (jumlah lebih dari 100%).

| Grafik | Isi | Jenis |
|---|---|---|
| 36 | Domisili responden (17 provinsi/kota) | Bar |
| 37 | Gender | Pie |
| 38 | Kelompok usia (7) | Bar |
| 39 | Pekerjaan (8) | Bar |
| 40 | Pendidikan (7) | Bar |
| 41 | Pendapatan per bulan (6) | Bar |
| 42 | Cara memperoleh produk (offline, menanam sendiri, online) | Pie |
| 43 | Platform online (11) | Bar, n sekitar 31 pengguna online |
| 44 | Alasan belanja daring (9) | Bar, pilihan ganda |
| 45 | Pengeluaran daring per bulan (5) | Bar |
| 46 | Alasan belanja luring (11) | Bar, n sekitar 115 |
| 47 | Cara belanja luring (11) | Bar |
| 48 | Pengeluaran luring per bulan (6) | Bar |
| 49 | Produk segar yang dikonsumsi (8) | Bar |
| 50 | Produk olahan yang dikonsumsi (12) | Bar |
| 51 | Faktor kepercayaan, skala 4 tingkat (6 faktor) | Bar bertumpuk |
| 52 | Pentingnya sertifikasi | Pie |
| 53 | Jenis penjaminan yang dipercaya (4) | Bar |
| 54 | Kemudahan akses, skala 1-4 | Bar |
| 55 | Tingkat kepentingan faktor pembelian, skala 4 tingkat (6 faktor) | Bar bertumpuk |

Penyebut tiap grafik berbeda (semua 235, pengguna online saja, pengguna offline saja) dan tidak dinyatakan di dokumen. Hasil perhitungan balik dari persentase: online 31, offline 115, menanam sendiri 89.

### 3.4 Gambar peta (Gambar 1-16, 32 file PNG)

Peta choropleth per provinsi, buatan matplotlib dengan skala warna di bawah. Umumnya dua peta (2023 dan 2024) per komoditas. Gambar 1 menampilkan luas total 2024 per provinsi (skala 0-1.400 ha, Jawa gelap, Sumatera sedang, Sulawesi pucat, Maluku dan Papua abu-abu).

**Tidak bisa diekstrak jadi angka.** Hanya skala warna, tanpa label nilai. Mengira-ngira angka dari warna melanggar aturan "jangan mengarang angka". Untuk dashboard kita butuh xlsx sumbernya.

### 3.5 Narasi dan angka lepas yang bisa dirujuk

| Bab | Isi | Angka berdiri sendiri |
|---|---|---|
| 1 Pendahuluan, 2 Metodologi | Latar, sumber data, indikator, keterbatasan | 514 kabupaten/kota, 235 responden |
| 9 PGS | White Flower Label, PGS Lestari, PAMOR, ROLES | 640 petani PAMOR, 124,38 ha, 12 kabupaten, 20 Unit PAMOR + 5 calon, 1.340 petani total (ada versi teks yang bertentangan: 200 vs 1000 petani rotan), harga insentif Rp200/kg |
| 10 Regulasi | Linimasa SNI dan Permentan | SNI 6729:2002, 2010, 2013, 2016, 2025. Permentan 64/2013 |
| 11 Riset | Tabel 4 | Lihat di atas |
| 12 Konsumen | 5 komunitas | KOI sejak 2008, OGH Expo ke-7 (2017) 217 produsen, Lingkar Organik 30+ kelompok, 750+ petani, 250+ ha |
| 13 Pertanian berkelanjutan | 11 pendekatan | Tidak ada |

Bab 4 (Penjualan), 6 (Ekspor-Impor), dan 7 (Wild Collection) hanya paragraf pengantar. **Tidak ada data.** Sesuai aturan 3, halamannya tidak dibuat.

## 4. Perbedaan struktur dibanding SPOI 2023

(Perbandingan struktur, bukan angka.)

- Baru di 2025: survei konsumen kuantitatif (20 grafik), peta per provinsi per komoditas (2023 dan 2024), Tabel kelengkapan data, tren riset diperluas jadi 8 topik, bab sustainable agriculture, dua bab kosong yang disiapkan (retail, ekspor-impor).
- Tidak ada di 2025 draf ini: tabel angka per provinsi (2023 punya), total produsen nasional, data pasar dan produk lain.
- Periode data: 2019-2024 (2023 punya 2019-2022).

## 5. Dampak ke rancangan sistem (untuk diskusi, belum diputuskan)

Karena Feri akan lanjut ke sistem input sampai output, ini yang terlihat dari dokumen:

1. **Satuan data dasar** yang berulang di semua grafik: `komoditas x metrik (luas/produksi/petani/operator) x tahun x wilayah x sumber`. Dokumen sekarang hanya menyimpan tingkat nasional. Sistem input perlu tingkat provinsi (dan kabupaten/kota, karena pelaporan dikumpulkan per kabupaten).
2. **Perlu status kualitas per angka**: terverifikasi, perlu konfirmasi, estimasi, belum melapor. Draf ini penuh angka yang janggal. Dashboard 2023 sudah punya mekanisme penanda ini (†).
3. **Perlu catatan sumber per angka**: LSO, PGS, survei AOI, dinas. Sekarang hanya satu kalimat umum di Bab 2.
4. **Perlu pembeda data "tidak melapor" dan "nol".** Peta 2025 sudah membedakan abu-abu (tidak ada data) dari nilai. Madu 2024 kosong, Maluku dan Papua 0 di Tabel 3: nol atau tidak melapor?
5. **Survei konsumen butuh model sendiri** (respons per responden, pertanyaan pilihan ganda dan skala), bukan sekadar tabel agregat.
6. **Pelaporan per kabupaten/kota** (Tabel 1) menunjukkan alur input yang realistis: kabupaten, lembaga sertifikasi, PGS, dan anggota AOI mengirim data. Tabel 1 dan 2 menunjukkan kelengkapan pelaporan sebagai metrik tersendiri, cocok jadi indikator kualitas data di dashboard.
7. **Versi dan edisi** harus eksplisit di model data (edisi, tahun data, tanggal rilis), karena draf ini sendiri menyambung dua periode dari proses pengumpulan berbeda.

## 6. Yang dibutuhkan dari Feri / AOI sebelum ekstraksi

1. `SPOI_Data_Analysis_August2026.xlsx` (sumber grafik). Tanpa ini tidak ada data provinsi.
2. Konfirmasi apakah draf V13 sudah final atau masih berubah.
3. Keputusan cara menampilkan 2025 (edisi terpisah, ganti, atau lainnya).
4. Penjelasan patahan 2022 ke 2023 dan definisi "luas lahan" yang dipakai.
