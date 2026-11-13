# Catatan Janggal Data SPOI 2023

Temuan awal saat inventaris (belum ada yang dibetulkan). Setiap butir butuh keputusan Feri sebelum dipakai. Rujukan = halaman cetak buku.

## Keputusan Feri (butir 1-4 terjawab)

1. **Izin AOI:** demo ini untuk ditunjukkan ke AOI dalam rangka kerja sama. Belum dipublikasikan ke publik. Beri label "Demo" dan kredit AOI/SPOI 2023 yang jelas.
2. **Tanggal terbit:** tulis "September 2023" saja, tanpa tanggal spesifik.
3. **Komoditas:** halaman Komoditas memakai 10 komoditas yang lengkap (beras, kelapa, pisang, kopi, jeruk, teh, kakao, aren, rempah, buah tropis). Sisanya (jamur, kacang, umbi, sayuran, madu, ternak, pupuk, dll.) masuk bagian terpisah "Lainnya" dengan metrik yang tersedia.
4. **Angka utama Beranda:** angka per komoditas, tanpa total lintas komoditas.

Butir 5-23 diputuskan Feri (lihat bagian berikut).

## Keputusan Feri untuk butir 5-23

1. **Angka janggal yang memang begitu di buku** (butir 5, 6, 10, 11, 16, 21, 23): tampil **apa adanya + penanda**. Angka tidak diubah; titik/baris diberi tanda kecil dan catatan "perlu konfirmasi AOI" di tooltip dan di halaman Tentang Data. Data JSON sudah membawa tanda `issues` per deret dan `checks[].issues` per tabel provinsi.
2. **Kosong vs 0** (butir 22): kosong = "Tidak ada data" (`null`; peta abu berpola, legenda menjelaskan), 0 = 0 (warna terendah).
3. **PAMOR dan ROLEs** (butir 18, 19): tampilkan tanpa luas PAMOR dan tanpa lokasi ROLEs. Dipakai: PAMOR 17 unit, 62 operator, 418 produsen (hlm. 63); ROLEs 3 unit, 201 petani, 879,7 ha, 6.222,78 ton rotan basah (hlm. 64). Luas PAMOR dan lokasi ROLEs menunggu konfirmasi AOI.
4. **Sisanya** (butir 7, 8, 9, 12, 13, 14, 15, 17, 20): dashboard memakai angka grafik dan tabel, bukan angka di teks narasi. Beras memakai satuan sumbu. Pupuk hanya 2019-2022. Survei online ditulis "tahun 2021" tanpa bulan. Semua dicatat di Tentang Data.

## Daftar pertanyaan untuk AOI (bahan pertemuan)

1. Izin menampilkan data SPOI 2023 di dashboard, dan format kredit yang diinginkan.
2. File Excel asli tabel provinsi (Tabel 2-14), untuk menggantikan transkripsi manual.
3. Pisang produksi 2020 turun ke 32,2 ton (Jawa Barat 157,4 → 10,6 ton): data parsial atau memang turun? (butir 5)
4. Jeruk: produksi 0 pada 2019-2021 padahal ada lahan dan petani: tidak dilaporkan? (butir 6)
5. Aren 2022: lonjakan luas dan petani karena Banten baru masuk? Produksi 12.885 ton dari 248 ha di 2019 wajar? (butir 10)
6. Ternak 2022 = 41.898 ton (sebelumnya sekitar 10 ton) dan pasar 2021 = 18.354 ton: cakupan berubah? (butir 11, 16)
7. Kelapa: angka identik antartahun dan luas = produksi di banyak provinsi: salin-tempel atau data sama? (butir 21)
8. Teh: jumlah provinsi tidak sama dengan angka nasional (luas 2021, 2022; produsen 2021). Mana yang benar? (butir 23)
9. PAMOR: "100,819 ha" itu 100,8 ha atau 100.819 ha? ROLEs: lokasi unit yang benar? (butir 18, 19)
10. Arti sel kosong vs 0 di tabel provinsi Tabel 3-11. (butir 22)

## Pertanyaan awal (arsip)

1. **Izin penggunaan (hlm. iv).** Buku menyatakan isi milik AOI, boleh dipakai untuk karya ilmiah dengan sumber, dan *"dilarang mengcopy atau memperbanyak ... tanpa izin"* AOI. Dashboard publik yang menampilkan ulang angka dan grafik kemungkinan perlu izin tertulis AOI. Apakah izinnya sudah ada?
2. **Tanggal terbit.** CLAUDE.md menulis Desember 2023. Di buku: "Cetakan pertama September 2023" (hlm. iv), kata pengantar bertanggal 2 Agustus 2023 (hlm. vi), metadata file PDF dibuat 6 Desember 2023. Mana yang dipakai di halaman "Tentang Data"?
3. **Jumlah komoditas.** Hanya 10 komoditas punya luas + produksi + petani; ada 17 subbab tetapi sebagian bukan komoditas dengan tiga metrik itu. Halaman Komoditas dirancang dari 10 itu atau semua dengan metrik seadanya?
4. **Tidak ada total nasional.** Angka utama Beranda "luas lahan total" tidak bisa dibuat tanpa menjumlahkan sendiri lintas komoditas. Pakai angka per komoditas saja?

## Tabel provinsi (Tabel 2-14, hlm. 68-80): cara ekstraksi dan hasil verifikasi

Tabel berupa gambar beresolusi rendah. OCR otomatis gagal (koma desimal hilang, digit tertukar, jumlah provinsi meleset jauh dari angka nasional), jadi **hasil OCR dibuang**. Keputusan Feri: transkripsi manual. Semua 13 tabel sudah dibaca dari render halaman dengan zoom dan disimpan di `scripts/manual/provinsi-tabel*.txt`; `scripts/build_provinces.py` membangun `provinces.json` dan memverifikasinya.

Verifikasi: jumlah semua provinsi dibandingkan dengan angka nasional (Bagian A) untuk setiap metrik dan tahun. **129 dari 132 cocok** (dalam pembulatan; angka nasional yang bulat diberi toleransi 0,5). Legenda maks peta Beras 2022 (25.662,631 ton) dan Kelapa 2022 (5.582,978 ton) cocok dengan Jawa Tengah di Tabel 2 dan 3. Salah baca satu sel akan langsung tampak sebagai selisih; yang lolos hanya dua salah baca yang kebetulan saling meniadakan, yang sangat kecil kemungkinannya. Sel pada metrik tanpa pembanding nasional tidak ada (semua metrik tabel punya pembandingnya).

Catatan: gambar mentah yang tertanam di PDF kehilangan baris saat diekstrak (pita hitam); render halaman utuh (38 provinsi). Pembacaan memakai render halaman.

| # | Lokasi | Temuan |
|---|---|---|
| 21 | Tabel 3 Kelapa (hlm. 69) | Banyak provinsi memuat angka **identik di keempat tahun** dan **luas = produksi** (Aceh 2.633,74 ha dan 2.633,74 ton di semua tahun; Jawa Timur 3.260/3.260 di 2019-2020; Sulawesi Utara 2.567/2.567). Tampak seperti salin-tempel antartahun/antarkolom. Jumlah tetap cocok dengan angka nasional, jadi angka nasional kemungkinan dihitung dari tabel yang sama. Kepulauan Riau 753 ha kelapa juga mencolok. |
| 22 | Tabel 3-11 | Banyak sel **kosong** (bukan 0), sedangkan Tabel 2 dan 12-14 memakai 0. Di JSON kosong = `null`. Aturan tampilan "tidak ada data" vs "0" perlu diputuskan. |
| 23 | Tabel 7 Teh (hlm. 73) | Jumlah provinsi tidak sama dengan angka nasional: luas 2021 = 176,95 vs 179,45 ha; luas 2022 = 175,91 vs 178,51 ha; produsen 2021 = 86 vs 62 (Bali 37, Jawa Barat 15, Sumbar 4, Jateng 30). Sel sudah dicek zoom, bukan salah baca. |

Penjelasan dari tabel provinsi untuk angka janggal di bagian A:
- **Pisang produksi 2020 (butir 5):** turun dari 178,984 ke 32,2 ton karena Jawa Barat berubah dari 157,384 (2019) menjadi 10,6 (2020).
- **Aren 2022 (butir 10):** lonjakan luas, produksi, dan petani berasal dari Banten (265,13 ha, 3.561,92 ton, 738 petani) yang baru muncul di 2022. Gorontalo dan Sulawesi Utara membawa sebagian besar produksi di tahun-tahun sebelumnya.

## Angka yang tidak konsisten di dalam buku

| # | Lokasi | Masalah |
|---|---|---|
| 5 | Pisang, G22 (hlm. 24) | Produksi 2019 = 178,984; **2020 = 32,2**; 2021 = 186,65; 2022 = 265,25 ton. Angka 2020 jauh di luar pola. Salah ketik atau data parsial? |
| 6 | Jeruk, G28-G29 (hlm. 28) | Produksi 0 ton di 2019-2021, padahal ada 18, 22, 4 petani dan 15-17 ha lahan. Nol = tidak dilaporkan? (buku hlm. 8 bilang kosong/0 = tidak terkonfirmasi) |
| 7 | Kopi, teks (hlm. 25) | Teks: lahan naik "dari 500 ha". Grafik: 31.393,84 → 31.772,96 = naik sekitar 379 ha. Petani naik "hampir 1.100"; grafik 12.676 → 13.666 = 990. |
| 8 | Teh, teks (hlm. 31) | "0,001% dari total luasan": 178,51 / 127.357 ha = sekitar 0,14%. Produktivitas 2022 ditulis 1,4 ton/petani; hitungan grafik 104,664 / 70 = 1,5. |
| 9 | Kakao, teks (hlm. 31) | Produktivitas 2022 ditulis 4,77 ton/petani; hitungan grafik 2.141,754 / 429 = 4,99. (2019: 5,75 cocok.) |
| 10 | Aren, G36-G38 (hlm. 33-34) | Luas 2021 → 2022 melonjak 235,56 → 507,03 ha, petani 199 → 910. Produksi 12.885 ton dari 248 ha di 2019 (sekitar 52 ton/ha) tampak terlalu besar untuk gula aren. Satuan/cakupan sama sepanjang tahun? |
| 11 | Ternak, G52 (hlm. 45) | Produksi 1.807,574 → 10,124 → 10,842 → **41.898,042** ton. Lonjakan 4.000x di 2022 (teks: "paling besar daging ayam"). Judul grafik "Jumlah Ternak" tapi satuan ton. |
| 12 | Pupuk (hlm. 46) | Teks: operator "42 ... hingga 124 di 2022", tetapi grafik 2019 = 88 (42 dari survei 2017, bukan 2019). Produksi turun 1.537.812 → 757.131 ton di 2022 tanpa penjelasan. |
| 13 | Beras, G16/G17 (hlm. 20) | Caption tertukar: "Gambar 17 Jumlah Produksi" ada di atas grafik Petani, "Gambar 16 Jumlah Petani" di atas grafik Ton. Satuan sumbu dipakai sebagai patokan (Petani 7.398 / Ton 32.550,938 untuk 2019). Daftar Gambar juga memuat urutan 17 sebelum 16. |
| 14 | Kelapa (hlm. 21) | Teks menulis "data penurunan luasan dan produktivitas" padahal luas naik 20.993 → 21.542. Rasio "ha/petani" turun 2,48 → 2,1 benar secara hitungan (20.993/8.432 = 2,49), tapi labelnya membingungkan; "ton/petani" 2,49 vs hitungan 2,50. |
| 15 | Olahan (hlm. 49) | Teks 1.455,4 dan 4.795,28 ton; grafik 1.455,499 dan 4.795,287. Pembulatan, kecil. |
| 16 | Pasar, G56 (hlm. 49) | 2021 = 18.354,523 ton lalu 2022 = 7.795,984. Lonjakan satu tahun tanpa penjelasan. |
| 17 | Survei online (hlm. 6 vs hlm. 8) | Waktu survei persepsi online n=102: "Juli-September 2021" (hlm. 6) vs "Mei-Juni 2021" (hlm. 8). |
| 18 | PGS ROLEs (hlm. 64) | "3 Unit di Kutai Barat, yakni Sigi, Barito Timur, Katingan": ketiganya bukan kecamatan Kutai Barat (Sigi di Sulteng, Barito Timur dan Katingan di Kalteng). |
| 19 | PAMOR (hlm. 63) | "100,819 ha" untuk 418 produsen. Ambigu: 100,8 ha (koma desimal, rata-rata 0,24 ha/produsen) atau 100.819 ha. Pola buku lain memakai koma desimal, tapi perlu dikonfirmasi. |
| 20 | Format angka | Buku memakai koma desimal pada grafik/tabel ("3350,415") tetapi titik ribuan di teks ("12.752"), dan sesekali titik desimal ("7.2 ha", "21. 542"). Grafik berupa gambar (Gambar 46-48) memakai titik desimal ("110.682", "3043.58") dan label terpotong dua baris. Skrip memakai aturan: koma = desimal; label gambar dibaca manual dan dicocokkan dengan teks narasi. |

## Keterbatasan yang harus tampil di "Tentang Data"

- Data hanya dari LSO nasional (9 LSO + 2 PGS); tidak mencakup LSO internasional, jadi bisa beda dengan FiBL (hlm. 8).
- Angka kosong atau 0 bisa berarti "tidak terkonfirmasi" (hlm. 8); jangan ditampilkan sebagai nol sungguhan tanpa catatan.
- Data "cross sectional", tidak menyeluruh (hlm. 8). Satu hamparan bisa ditanami beberapa komoditas (hlm. 81), jadi luas antar komoditas tidak boleh dijumlah.
- Beberapa perubahan angka dari SPOI 2019 akibat pemutakhiran (hlm. 8); jangan bandingkan lintas edisi.
- Survei konsumen: sampel kecil dan tidak mewakili populasi (hlm. 3), pertanyaan saringan hanya yang membeli minimal sekali sebulan.
- Riset: bukan deret tahunan; hanya 2015, 2020, 2023 dengan rentang data berbeda; pertumbuhannya sejalan dengan pertumbuhan total artikel Garuda (hlm. 67).
