# Catatan data: Excel AOI (rekap per provinsi SPOI 2025)

Sumber: `source/spoi-2025-rekap-provinsi.xlsx` ("Progres Rekap Per Provinsi SPOI 2025 & Policy Study"), diterima dari AOI 2026-11-22. Diolah oleh `scripts/extract_xlsx_2025.py`. Dokumen ini internal; isinya tidak ditampilkan di dashboard.

Jawaban AOI atas pertanyaan anomali (2026-11-22) sudah dimasukkan. Nilai 0 atau kosong = tidak ada data organik (disimpan `null`).

| No | Temuan | Jawaban AOI | Perlakuan di dashboard |
|---|---|---|---|
| 1 | Beras: baris Total sheet berbeda dari jumlah provinsi (2023: 7.329,65 vs 5.306,65 ha) | Yang benar 5.306,65 ha (2023), rumus sudah dibenarkan | Jumlah provinsi |
| 2 | Sheet "Mete" berisi data pisang untuk 2019-2022; "Essential Oil" sama dengan Jeruk 2019-2022 | Mete menggantikan Banana, Essential Oil menggantikan Jeruk, keduanya hanya 2 tahun (2023, 2024) | Mete dan Minyak Atsiri 2023-2024; Pisang dan Jeruk tidak ditampilkan |
| 3 | Sebagian sheet tidak punya baris Total | Jumlah boleh dijumlahkan ke baris bawah (luas, produksi, produsen) | Dihitung dari jumlah provinsi |
| 4 | Sheet Horti berubah struktur 2023-2024 | Palawija ditambahkan; sayur, buah, herbal jadi satu kategori sejak 2023; umbi (roots) dan nuts tetap | Sayur-Buah-Biofarmaka dan Palawija 2023-2024; Kacang dan Umbi 2019-2024; luas dan produsen Horti sebagai "Hortikultura (gabungan)" |
| 5 | Lompatan provinsi (Bengkulu, Lampung, Kalsel) dan lonjakan 2022 ke 2023 | Data dinamis, sesuai angka tersebut | Apa adanya |
| 6 | Sertifikasi 2024 hanya sekitar 3,7% dari luas total | "Itu adanya" | Rincian jenis sertifikasi untuk sebagian luas |
| 7 | Jawa Tengah: sekitar 0,3 ha per produsen | Noted | Apa adanya |
| 8 | Provinsi bernilai 0 (Papua dan lainnya) | Tidak ada data organik | Ditampilkan "Tidak ada data" (arsiran di peta) |
| 9 | Riau 2023: perempuan (72) > laki-laki (25); teh produsen 2021-2022 pecahan (83,5; 67,5) | (belum ditanyakan) | Apa adanya |

## Temuan baru dari pengolahan (untuk ditanyakan ke AOI)

- **Total 2024 di sheet Beras dan Horti (Sayur-Buah-Biofarmaka) lebih besar tepat 2.024 dari jumlah provinsi** (Beras luas 7.593,85 vs 5.569,85 ha; Sayur-Buah produksi 20.245,69 vs 18.221,70 ton). Selisihnya persis angka tahun di header kolom, jadi rumus SUM kemungkinan ikut menjumlah sel tahun. Untuk 2023 AOI sudah memperbaikinya, 2024 belum. Dashboard memakai jumlah provinsi, jadi angkanya benar.
- Kelapa (Gula) dan Kelapa (Dehusked) punya seri 2019-2022 yang identik.
- Luas dan produsen Horti hanya tersedia gabungan; produksi per kategori. Sayur dan buah terpisah 2019-2022 tidak ditampilkan karena kategorinya digabung sejak 2023.
- Produk olahan, pemasar, pupuk, ternak, dan produk liar sedang diproses AOI; bisa ditambahkan kemudian.

Daftar temuan versi draf V13 ada di [data-issues-2025.md](data-issues-2025.md).

## Pembaruan berkas AOI (2026-11-22, "Progres Rekap ... (1).xlsx")

Sheet lama tidak berubah (0 sel beda), termasuk total Beras 2023-2024 dan Sayur-Buah 2024 yang masih lebih besar dari jumlah provinsi. Sheet baru:

- **Luas Lahan dan Produser**: total luas dan produsen per provinsi 2019-2024. Hero Beranda memakainya untuk tren lima tahun (luas 63.531,83 ke 91.765,65 ha, produsen 33.362 ke 124.418).
- **Produk Olahan** dan **Pemasar**: operator 2019-2024, luas 2019-2022, produksi 2019-2024. Tampil di Komoditas sebagai Produk lain. Cocok dengan SPOI 2023 untuk 2019-2022.
- Pupuk, ternak, dan produk liar belum ada.

Pertanyaan untuk AOI:
1. Sheet total punya dua kolom luas untuk 2023 dan 2024: "(real)" (90.755,13 dan 91.765,65 ha) dan tanpa keterangan (79.386,72 dan 80.703,83 ha). Selisih terbesar di Kalimantan Barat (8.781,45 vs 51,45 ha), Jawa Barat (5.350,25 vs 3.722,12), dan Jawa Tengah. Dashboard memakai "(real)". Apa beda keduanya?
2. Jumlah produsen melonjak dari 41.564 (2022) ke 123.394 (2023), hampir tiga kali lipat. Ada perubahan definisi atau cakupan?
3. Produksi produk olahan melonjak dari 4.795 ton (2022) ke 317.938 ton (2023); Lampung baru muncul dengan 75.033 ton dan Sulawesi Tengah 50.000 ton. Apakah satuannya ton?
4. Baris total Beras (2023, 2024) dan Sayur-Buah (2024) masih lebih besar tepat sebesar angka tahun dari jumlah provinsi; rumus belum diperbaiki.
