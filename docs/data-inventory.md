# Inventaris Data SPOI 2023

Sumber: `source/Buku-SPOI-2023.pdf` (100 halaman PDF). Status: **langkah 1 dan 2 selesai.** Data ada di `src/data/spoi-2023/` (national.json, provinces.json, research.json). Tabel provinsi ditranskripsi manual (OCR gagal), lihat `docs/data-issues.md`.

## Cara membaca rujukan halaman

Nomor halaman cetak = nomor halaman PDF − 16 (halaman romawi i–xv ada di depan; halaman cetak 1 = PDF hlm. 17). Rujukan `source` di JSON nanti memakai **halaman cetak** (seperti tertulis di buku), mis. `"SPOI 2023, hlm. 19, Gambar 15"`. Halaman PDF dicatat di kolom terpisah supaya mudah dicari.

## Ringkasan

| Jenis | Jumlah | Bisa diekstrak? |
|---|---|---|
| Grafik tahunan 2019-2022 dengan angka tertanam sebagai teks (Gambar 15-44, 49-58) | 38 grafik | **Ya**, angka terbaca langsung dari PDF (akurat) |
| Grafik tahunan yang berupa gambar (Gambar 45-48) | 4 grafik | Label angka terlihat di gambar, perlu transkripsi manual + verifikasi (Gambar 45 sudah dilihat: 4, 4, 1, 1) |
| Tabel per provinsi (Tabel 2-14) | 13 tabel | Hanya **gambar**. Perlu OCR (tesseract tersedia) + verifikasi manual |
| Tabel riset (Tabel 1) | 1 tabel | **Ya**, teks. Jumlah per kolom sudah dicek: 97, 273, 456 cocok |
| Grafik survei konsumen (Gambar 59-67) | 9 gambar | Gambar. Label angka terlihat di Gambar 59; sisanya belum dibuka satu per satu |
| Peta sentra (Gambar 2-14) | 13 gambar | Gambar saja, **tidak perlu diekstrak**: dashboard membuat peta sendiri dari Tabel 2-14 |
| Gambar 68 (riset) | 1 | Gambar, isinya sama dengan Tabel 1 (sudah dicek, angka cocok) |
| Angka di teks narasi (PAMOR, ROLEs, AOI, dll.) | beberapa | Ya, manual, dengan rujukan halaman |

## A. Tren nasional per komoditas, 2019-2022

Dimensi: tahun (2019, 2020, 2021, 2022) × metrik. Satuan: luas = ha, produksi = ton, petani/operator = orang. Semua "Ya (teks)" artinya angka ada di lapisan teks PDF.

| Komoditas | Bagian (hlm.) | Luas | Produksi | Petani/operator | Ekstraksi |
|---|---|---|---|---|---|
| Beras | 4.1 (18-20) | G15 hlm. 19 | G17 hlm. 20 | G16 hlm. 20 | Ya (teks) |
| Kelapa | 4.2 (21-22) | G18 hlm. 21 | G19 hlm. 22 | G20 hlm. 22 | Ya (teks) |
| Pisang | 4.3 (23-24) | G21 hlm. 23 | G22 hlm. 24 | G23 hlm. 24 | Ya (teks) |
| Kopi | 4.4 (25-26) | G24 hlm. 25 | G25 hlm. 26 | G26 hlm. 26 | Ya (teks) |
| Jeruk | 4.5 (27-28) | G27 hlm. 27 | G28 hlm. 28 | G29 hlm. 28 | Ya (teks) |
| Teh | 4.6 (29-30) | G30 hlm. 29 | G31 hlm. 30 | G32 hlm. 30 | Ya (teks) |
| Kakao | 4.7 (31-32) | G33 hlm. 31 | G34 hlm. 32 | G35 hlm. 32 | Ya (teks) |
| Aren | 4.8 (33-34) | G36 hlm. 33 | G37 hlm. 34 | G38 hlm. 34 | Ya (teks) |
| Rempah-rempah | 4.9 (35-36) | G39 hlm. 35 | G40 hlm. 36 | G41 hlm. 36 | Ya (teks) |
| Buah tropis | 4.10 (37-38) | G42 hlm. 37 | G43 hlm. 38 | G44 hlm. 38 | Ya (teks) |
| Jamur | 4.11 (39) | tidak ada | tidak ada | G45 hlm. 39 (operator) | Gambar |
| Kacang-kacangan | 4.12 (40) | tidak ada | G46 hlm. 40 | tidak ada | Gambar |
| Umbi-umbian | 4.13 (41) | tidak ada | G47 hlm. 41 | tidak ada | Gambar |
| Sayuran | 4.14 (42) | tidak ada | G48 hlm. 42 | tidak ada | Gambar |
| Madu (panen liar) | 4.15 (43) | tidak ada | G49 hlm. 43 | tidak ada | Ya (teks) |
| Sarang lebah | 4.15 (44) | tidak ada | G50 hlm. 44 | tidak ada | Ya (teks) |
| Produk ternak | 4.16 (44-45) | tidak ada | G52 hlm. 45 | G51 hlm. 45 (operator) | Ya (teks) |
| Pupuk/input organik | 4.17 (46-47) | tidak ada | G54 hlm. 47 | G53 hlm. 46 (operator) | Ya (teks) |

Catatan penting untuk rancangan halaman:
- Hanya **10 komoditas** punya lengkap luas + produksi + petani (beras sampai buah tropis). Sisanya hanya sebagian metrik. Judul "17 komoditas" di CLAUDE.md perlu disesuaikan: ada 17 subbab, tetapi jamur, madu, ternak, dan pupuk bukan komoditas dengan tiga metrik yang sama.
- Tidak ada total nasional lintas komoditas di PDF. Menjumlahkan sendiri tidak boleh (satuan sama, tapi satu hamparan bisa ditanami beberapa komoditas, lihat hlm. 81). Jadi "luas lahan total" untuk Beranda **tidak tersedia**; yang ada hanya angka per komoditas.

## B. Pasar organik (2019-2022)

| Data | Hlm. | Satuan | Ekstraksi |
|---|---|---|---|
| Jumlah operator pemasaran (G55) | 48 | operator | Ya (teks) |
| Jumlah produksi/perdagangan pasar (G56) | 49 | ton | Ya (teks) |
| Jumlah operator produk olahan (G57) | 50 | operator | Ya (teks) |
| Jumlah produksi produk olahan (G58) | 50 | ton | Ya (teks) |

## C. Survei konsumen (gambar)

| Gambar | Hlm. | Isi | Catatan |
|---|---|---|---|
| G59 | 51 | Pilihan lokapasar daring (%), n=102, survei 2021 | Label angka terlihat (59, 41, 39, 23, ...). Pilihan ganda, total > 100% |
| G60 | 52 | Alasan memilih lokapasar, n=102 | Gambar |
| G61 | 53 | Pangan segar yang dibeli, n=102 | Teks menyebut 55% / 47% / 33% |
| G62 | 54 | Pangan olahan yang dipilih, n=102 | Gambar |
| G63 | 55 | Sebaran usia responden 2019 vs 2022 | Gambar |
| G64 | 56 | Sebaran pekerjaan responden 2019 vs 2022 | Gambar |
| G65 | 57 | Anggaran belanja organik per bulan 2019 vs 2022 | Gambar; sebagian angka ada di teks |
| G66 | 58 | Cara membeli produk organik | Gambar |
| G67 | 60 | Penjaminan produk organik 2019 vs 2022 | Gambar; sebagian angka ada di teks hlm. 58-59 |

Tidak ada tahun-tahun beruntun di sini, hanya potret 2019, 2021, dan 2022, dengan sampel kecil (n=102 dan n=1.002). Layak untuk halaman kecil "Pasar dan Konsumen" dengan catatan metodologi, bukan untuk tren.

## D. Per provinsi (hlm. 68-80, gambar)

Tabel 2-14, masing-masing 38 provinsi (termasuk 4 provinsi baru Papua: Selatan, Tengah, Pegunungan, Barat Daya) × 4 tahun.

| Tabel | Komoditas | Hlm. (PDF) | Kolom per tahun |
|---|---|---|---|
| 2 | Beras | 68 (84) | Luas (ha), Produksi (ton), Produsen |
| 3 | Kelapa | 69 (85) | idem (diduga, belum diperiksa) |
| 4-11 | Pisang, Kopi, Jeruk, Teh, Kakao, Aren, Rempah, Buah tropis | 70-77 (86-93) | idem (diduga, belum diperiksa) |
| 12 | Kacang-kacangan | 78 (94) | diduga produksi saja |
| 13 | Umbi-umbian | 79 (95) | diduga produksi saja |
| 14 | Sayuran | 80 (96) | produksi saja (sudah dilihat) |

Hanya Tabel 2 dan 14 yang sudah dibuka. Tabel 3-13 belum dibuka satu per satu.

Tabel berupa gambar, jadi harus di-OCR lalu diverifikasi. Cara verifikasi yang tersedia: (a) jumlah semua provinsi vs angka nasional di Bagian A, (b) legenda maks pada peta (mis. Beras 2022 maks 25.662,631 ton = Jawa Tengah di Tabel 2, cocok).

Wilayah tidak bisa dibuat untuk jamur, madu, ternak, pupuk (tidak ada tabel provinsi). Peta tersedia untuk 13 komoditas saja.

## E. Riset (hlm. 65-67)

Tabel 1: 8 topik × 3 titik waktu (2015, 2020, 2023), jumlah publikasi di Portal Garuda/IPI, total 97 / 273 / 456. Ini **bukan deret tahunan 2019-2022**, hanya tiga potret dengan kata kunci dan rentang data berbeda (lihat catatan kaki). Bisa dibuat grafik batang berkelompok, bukan grafik tren.

## F. Angka di teks (butuh rujukan manual)

- PAMOR Indonesia (hlm. 63): 17 unit, 62 operator, 418 produsen, 100,819 ha.
- PGS ROLEs (hlm. 64): 3 unit, 201 petani, 879,7 ha, 6.222,78 ton rotan basah.
- AOI (hlm. 1): 122 anggota (85 lembaga + 37 individu), 19 provinsi, berdiri 2002.
- Metodologi (hlm. 5-9): 9 LSO + 2 PGS responden, pengumpulan 21 Feb-21 Mar 2023, survei konsumen n=102 dan n=1.002.
- Bahan untuk halaman "Tentang Data": hlm. 3-9 (pendahuluan, metodologi, catatan keterbatasan), hlm. 81 (penutup).

## G. Yang tidak ada di PDF (halaman tidak dibuat)

- Total luas/produsen nasional lintas komoditas.
- Data per kabupaten, koordinat lahan, data petani individu.
- Tren konsumen tahunan.
- Wilayah untuk jamur, madu, ternak, pupuk, pasar, olahan.

## H. Usulan urutan langkah berikutnya

1. Feri jawab pertanyaan di `docs/data-issues.md` (terutama soal izin AOI dan tanggal terbit).
2. Ekstraksi bagian A, B, E dari teks PDF (otomatis, bisa diulang lewat skrip).
3. OCR + verifikasi Tabel 2-14.
4. Transkripsi manual Gambar 45-48 dan, bila diputuskan perlu, Gambar 59-67.
