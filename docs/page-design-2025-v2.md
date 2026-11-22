# Rancangan Halaman v2: SPOI 2025 (data Excel AOI)

Status: **rancangan untuk direview Feri, belum ada kode.** Menggantikan [page-design-2025.md](page-design-2025.md) untuk halaman yang datanya berubah. Data: `src/data/spoi-2025/provinces-2025.json` dan `commodity-provinces.json`, dibuat oleh `scripts/extract_xlsx_2025.py`.

## Perubahan dari rancangan sebelumnya

1. **Hanya edisi 2025.** Edisi 2023, rute lama (`/2023`, `/komoditas`, `/wilayah`, dst.), dan pemilih edisi dihapus. Riwayatnya ada di git. Rute utama jadi `/`.
2. **Sumber angka komoditas = Excel AOI**, bukan docx V13 (angka 2023-2024 V13 sering bertentangan dengan Excel, lihat catatan data).
3. **Halaman Wilayah kembali** (peta choropleth), karena sekarang ada data per provinsi.
4. **Gender produsen** menjadi bagian baru.
5. Jeruk tidak ada. Seri 2019-2022-nya muncul sebagai **Minyak Atsiri** (dengan catatan).
6. Angka `null` = tidak ada yang melapor. Ditampilkan "Belum ada laporan", bukan 0.

## Navigasi

| Menu | Rute | Isi |
|---|---|---|
| Beranda | `/` | Angka utama, gender, tren, peringkat komoditas |
| Komoditas | `/komoditas`, `/komoditas/:id` | 11 komoditas, tren 2019-2024, provinsi penghasil |
| Wilayah | `/wilayah` | Peta choropleth provinsi, ranking, gender per provinsi |
| Konsumen, Ekosistem, Riset | tetap | Sumber V13, tidak berubah |
| Tentang Data | `/tentang-data` | Sumber, definisi, catatan data |

## Halaman yang berubah

**Beranda**
- KPI: luas 91.765,65 ha (+1,1% dari 2023), produsen 124.418 (+0,8%), perempuan 22,0% (27.433 orang). Semua dihitung dari provinsi, bukan diketik.
- Grafik gender: batang laki-laki vs perempuan 2023-2024; teks "1 dari 5 produsen organik adalah perempuan".
- Tren komoditas dipilih lewat ChoiceGroup, garis patahan antara 2022 dan 2023 (cakupan pendataan berubah).
- Peringkat luas komoditas 2024.

**Komoditas (daftar dan detail)**
- Tabel 11 komoditas: luas, produksi, produsen 2024, perubahan 2023-2024, jumlah provinsi yang melapor.
- Detail: tren 2019-2024 (3 metrik), ranking provinsi, mini-peta, catatan †. Kelapa Gula dan Kelapa Dehusked dua entri terpisah; Minyak Atsiri membawa catatan jeruk.

**Wilayah (baru)**
- Peta luas organik per provinsi (2023 atau 2024), pilihan komoditas (Semua / per komoditas). Provinsi `null` diberi pola arsir dan legenda "Belum ada laporan".
- Ranking provinsi (bar) dan tabel + CSV. Panel provinsi: luas, produsen, porsi perempuan, sertifikasi (konversi, PGS, self declare), komoditas yang dilaporkan.
- Papua mengikuti 6 provinsi hasil pemekaran (GeoJSON 38 provinsi, sudah ada).

**Tentang Data**
- Definisi dan batasan: 0 = belum ada laporan; sertifikasi hanya mencakup sekitar 3,7% luas; total beras di Excel tidak cocok dengan jumlah provinsi (dipakai jumlah provinsi); kelapa dipecah dua; seri 2019-2022 berasal dari edisi sebelumnya (identik) dan 2023-2024 adalah pendataan baru.

## Komponen

Dipakai ulang: `ProvinceMap`, `ProvincePanel`, `MapLegend`, `BarChart`, `GroupedBarChart`, `TrendChart`, `DataTable`, `KpiStrip`, `StatusBanner`. Baru: `GenderSplit` (batang proporsi). Dihapus: `EditionSwitch`, halaman dan komponen khusus 2023.

## Lapisan teknis

- `api.ts` tetap satu pintu: `getProvinces2025()`, `getCommodityProvinces2025()`, plus fungsi turunan (total nasional, ranking, perubahan 2023-2024) di `api.ts`/composable, bukan di komponen.
- Teks UI di `src/content/id-2025.ts`. Tidak ada angka di template.

## Urutan kerja

| Tahap | Isi |
|---|---|
| 1 | Tipe + `api.ts`, hapus 2023, Beranda baru (KPI, gender) |
| 2 | Komoditas dari Excel |
| 3 | Wilayah (peta) |
| 4 | Tentang Data + catatan data, uji 360 px, build bersih |

## Keputusan yang dibutuhkan

1. **Komoditas yang tidak ada di Excel** (umbi, sayur, kacang, madu, ternak, pupuk): rekomendasi saya **dikeluarkan dari halaman Komoditas** dulu, karena angka V13-nya bertentangan dengan Excel untuk komoditas lain dan tidak bisa diverifikasi. Alternatif: tetap tampil dari V13 dengan label "Draf V13".
2. Konsumen, Ekosistem, Riset tetap dari V13 (tidak ada di Excel dan tidak bertentangan). Setuju?
