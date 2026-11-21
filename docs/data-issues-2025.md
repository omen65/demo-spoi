# Masalah data SPOI 2025 (Draft V13)

Dicatat dari pembacaan dokumen, belum ada yang dibetulkan. Setiap butir perlu keputusan Feri atau AOI.
Rujukan "Gambar/Grafik/Tabel" mengikuti penomoran di dokumen.

Tingkat: **A** = memengaruhi angka utama, **B** = narasi bertentangan dengan grafik, **C** = salah ketik atau pelabelan.

## A. Angka utama

1. **Total luas lahan 2.747 ha (Tabel 3 dan teks Bab 3) lebih kecil dari luas satu komoditas.** Luas beras saja 2024 = 4.527,4 ha (Grafik 2), kopi 1.375,9, kelapa 2.030,8, buah tropis 887,6. Jumlah 9 komoditas yang punya data luas 2024 jauh di atas 2.747. Sebaliknya jumlah 7 wilayah di Tabel 3 memang 2.746,96 ha, jadi tabelnya konsisten internal tapi tidak dengan grafik. Kemungkinan cakupan berbeda (misalnya hanya yang tersertifikasi). Perlu definisi.
2. **Tabel 3 kolom 2020, 2023, dan "% Perubahan" kosong.** Judul tabel bilang "2019-2024". Hanya 2024 terisi.
3. **Patahan 2022 ke 2023 di hampir semua seri.** Luas: kopi 31.772,96 ke 1.184,62; kelapa 21.542 ke 2.807,5; kakao 563,9 ke 105,9. Produksi: kopi 33.302,8 ke 2.232,8; rempah 8.002,1 ke 453,0; aren 16.451,5 ke 2.159,7; kakao 2.141,8 ke 121,4. Petani: kopi 13.666 ke 1.763; kelapa 10.239 ke 6.340; kakao 429 ke 126. Operator naik di arah sebaliknya: pupuk 124 ke 604, ternak 16 ke 63. Pola ini sesuai dengan sumber data yang berganti, bukan perubahan di lapangan. Metodologi menyatakan pengumpulan "dibatasi hanya pada data tahun 2023 dan 2024". Perlu dipastikan sumber 2019-2022.
4. **Nilai berulang persis di tahun berbeda** (kemungkinan diteruskan dari tahun sebelumnya, bukan data baru): produksi kakao 2.129,114 pada 2019, 2020, dan 2021; luas kakao 559,93 pada 2020 dan 2021; produksi aren 12.889,59 pada 2020 dan 2021; luas aren 235,56 pada 2020 dan 2021; petani pisang 49 pada 2019 dan 2020; petani teh 31 pada 2019 dan 2020; petani kakao 426 pada 2020 dan 2021; operator ternak 63 dan operator pupuk 604 pada 2023 dan 2024. Penandaan butir ini dihasilkan otomatis oleh skrip ekstraksi (nilai identik di tahun berurutan, bukan nol).
5. **Produksi pupuk 2024 = 8.002.916,9 ton** (naik 12,7 kali dari 632.607,9 pada 2023). Produksi 2020: 1.712.103; 2022: 757.131. Fluktuasi ekstrem, teks sendiri menyebut "lonjakan drastis" tanpa penjelasan sumbernya.
6. **Produksi ternak:** 10.807,6 ton (2019), 10,1 (2020), 10,8 (2021), 41.898,0 (2022), 5.582,4 (2023). Teks menyebut "masalah pencatatan atau perbedaan definisi", jadi sudah diakui dokumen. Jangan ditampilkan sebagai tren tanpa penanda.
7. **Madu 2024 kosong** di Grafik 23, tetapi teks menyatakan "stabil sekitar 21 ton pada 2023-2024".
8. **Tabel 4, total 2024 salah hitung.** Jumlah 8 topik pada 2024: 207+254+257+80+105+67+10+48 = **1.028**, tertulis **1.030**. Total 2015, 2020, 2023 benar (97, 273, 456).
9. **Tabel 4, % pertumbuhan tidak konsisten.** 97 ke 273 adalah naik 181%, tertulis 281%. 273 ke 456 naik 67% (benar). 456 ke 1.030 naik 125,9% (tertulis 125%). Baris Garuda memakai rumus berbeda: 280.000 ke 1.134.556 = naik 305% (benar sebagai kenaikan). Jadi baris riset organik memakai rumus yang berbeda dari baris Garuda. Sel pertumbuhan Garuda 2024 berisi karakter "`" tanpa angka.
10. **Interval tahun Tabel 4 tidak seragam** (2015, 2020, 2023, 2024), jadi persentase antar kolom tidak setara jangka waktunya.

## B. Teks bertentangan dengan grafik

| # | Lokasi | Teks | Grafik |
|---|---|---|---|
| 11 | 8.1 Domisili | Bali 26,0%, Sumatera Utara 16,2% | Jawa Barat 26,0%, Jawa Tengah 16,2%, Bali 13,2%, Sumut 3,4% |
| 12 | 8.12 Cara belanja luring | langsung dari petani 53,9%, pasar komunitas 36,5%, toko khusus 26,1%, dinas pertanian 20,0%, hubungan personal 17,4%, lainnya 13,9% | Pesan langsung 53,9%, Supermarket 36,5%, Pasar komunitas 26,1%, Pameran/event 20,0%, Toko khusus 17,4%, Toko dan resto organik 13,9%, Dinas pertanian 0,9%. Label di teks bergeser |
| 13 | 3.2.5 Jeruk, produksi | "Produksi mulai tercatat 2022, lalu penurunan tajam 2023 dan turun lagi 2024" | 25 (2022), 221,4 (2023), 218,9 (2024). Naik, bukan turun |
| 14 | 3.2.2 Kelapa, luas | "luas kembali meningkat tahun 2024" | 2.807,5 (2023) turun ke 2.030,8 (2024) |
| 15 | 5.2 Kelapa, petani | "jumlah petani relatif stabil" | 10.239 (2022), 6.340 (2023), 5.549 (2024) |
| 16 | 5.4 Kopi, petani | "relatif stabil, cenderung meningkat" | 13.666 (2022) turun ke 1.763 (2023) lalu 2.238 (2024) |
| 17 | 5.7 Kakao, petani | "stabil hingga 2023, turun sangat drastis pada 2024" | 429 (2022), 126 (2023), 164 (2024). Penurunan terjadi di 2023, 2024 naik |
| 18 | 5.1 Beras, petani | "peningkatan partisipasi" | 13.519 (2023) turun ke 12.274 (2024). Naik hanya 2019-2023 |
| 19 | 3.2.8 Aren | luas "tidak relevan dengan produksi" | Produksi turun 87% (2022-2023) sementara luas hanya 507 ke 319. Dokumen mengakui ketidaksesuaian |
| 20 | 3.2.1 Beras | "tren relatif stabil" | Produksi 44.478 ton (2020) lalu 35.422, 40.377, 35.022, 37.948. Bergelombang, bukan stabil |
| 21 | 3.2.1 | "Produksi beras 2023 dan 2025 tidak berubah signifikan" | Dokumen berisi data 2023-2024, tidak ada 2025 |

## C. Pelabelan dan salah ketik

22. **Judul/legenda grafik tidak cocok dengan isi:**
    - Grafik 6 berjudul "luas lahan pisang" tetapi seri bernama "Jumlah Petani Pisang Organik" (nilai 56 sampai 257, tampaknya luas).
    - Grafik 9 berjudul "tahun 2022-2024" tetapi sumbu berisi 2019-2024 (2019-2021 bernilai 0).
    - Grafik 14, 16, 18, 30, 32, 33, 34 bernama seri "Produksi(Ton)" padahal isinya luas, petani, atau operator.
    - Grafik 27 "Jumlah petani organik" tanpa menyebut komoditas, ditempatkan di bab Kelapa.
    - Grafik 40 dan Grafik 41: nomor ganda di dalam teks, caption pendapatan menempel di judul bagian 8.6.
    - Grafik 44 berjudul "Sebaran alasan pembelian daring" tetapi dipasang di bagian "Pengeluaran Daring Per Bulan" (8.10), dan Grafik 45 yang berisi pengeluaran.
23. **Salah ketik:** "hektaree" (daftar singkatan, 9.3, 12.2), "Lingkas Organik", "KAU telah membentuk 10 simpul" (di bagian White Flower Label, kemungkinan maksudnya KOI/WFL), "Kementrian".
24. **Bagian 3.2.15 dan 3.2.16:** judul bagian bercampur dengan caption gambar sehingga tampil sebagai satu baris.
25. **Bagian 9 (PGS) berisi dua paragraf yang hampir kembar** dengan angka berbeda: petani rotan ROLES 200 vs 1000. Jumlah "1.340 petani" cocok dengan 640+200+500.
26. **Bab 9.3 mengutip "(SPOI, 2023)"** untuk Calon Unit PAMOR, jadi sebagian isi bab PGS diambil dari edisi 2023.
27. **Dokumen bertanggal "Jakarta, 2025"** tetapi menyebut "sampai saat ini, 2026" (Bab 11), "Pertemuan Nasional ... April 2026" (9.4), dan file sumber bernama "August2026". Tahun terbit belum jelas.
28. **Penomoran judul:** "3.2.10 Produksi Umbi Organik", "3.2.11 Rempah Organik" memakai format campur. Bagian 13.2 berjudul "Pertanian Konversi" tetapi isinya pertanian konservasi.
29. **Satuan petani vs operator:** Bab 5 memakai "petani" untuk komoditas dan "operator" untuk ternak dan pupuk, tanpa definisi operator.
30. **Angka lepas dari edisi lain** muncul di Bab 8 (SPOI 2019: 274 responden, DKI Jakarta 32%; SPOI 2023: 23% belum mengonsumsi). Itu perbandingan lintas edisi di dalam dokumen. Kalau dipakai, harus dengan penanda jelas, mengingat dokumen sendiri menyatakan tidak bisa dibandingkan langsung.

31. **Peta Gambar 2-7: keterangan dan isi tidak cocok.** Keterangan di dokumen menyebut "Luas Lahan"/"Luasan" (Gambar 2, 4, 5, 6, 7) atau "Lahan produksi" (Gambar 3), tetapi judul di dalam gambar dan skala warnanya adalah "Produksi (Ton)" untuk semua peta, termasuk Gambar 2. Dashboard memakai isi gambar (produksi) dan menampilkan peringatan ini. Pada Gambar 11 (rempah) urutan dua peta tertukar (2024 lebih dulu); tahun dibaca dari judul gambar, bukan urutan. Kakao tidak punya peta.

32. **Peta Gambar 1 tidak mewarnai Kalimantan dan Bali-NTB-NTT**, padahal Tabel 3 mencatat 44,6 ha (Kalimantan) dan 651,36 ha (Bali, NTB, dan NTT) untuk 2024. Wilayah itu tampil tanpa warna (seperti Maluku dan Papua yang bernilai 0).

## D. Catatan penggunaan data

- Penyebut survei konsumen (235, sekitar 31 pengguna online, sekitar 115 pengguna offline) tidak ditulis di dokumen. Persentase seperti 64,5% adalah 20 dari 31 orang. Sampel kecil, bukan representatif nasional (dokumen mengakui).
- Responden survei dari 17 provinsi/kota saja, terkonsentrasi di Jawa Barat, Jawa Tengah, Bali, Sulawesi Selatan, NTT.
- Data per provinsi hanya berupa gambar peta. Tidak boleh ditebak dari warna.
