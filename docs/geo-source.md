# Sumber GeoJSON Batas Provinsi

- **Berkas:** `src/assets/geo/indonesia-38-provinces.geojson` (254 KB, 38 fitur, WGS84), **tidak diubah** dari sumbernya.
- **Sumber:** "Indonesia GeoJSON & TopoJSON Maps (38 Provinces)", Deny Herianto, https://github.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces (versi 1.0.0, Desember 2025).
- **Lisensi data:** Creative Commons Attribution 4.0 (CC BY 4.0), lihat `DATA_LICENSE.md` di repositori sumber. Kode di repositori itu berlisensi MIT.
- **Atribusi di aplikasi:** kontrol atribusi peta memuat nama dataset dan lisensinya.
- **Catatan asal-usul:** repositori sumber menyebut data "dapat diturunkan dari sumber pihak ketiga" dan merujuk `SOURCE.md` yang tidak ada di repositori. Artikel pengantarnya hanya mengatakan sumber-sumber lain baru memuat 34 provinsi dan geometrinya sudah disederhanakan. Jadi lisensi CC BY 4.0 dinyatakan oleh pemilik repositori, tetapi asal batas aslinya tidak terdokumentasi. Untuk demo ke AOI ini cukup; **untuk rilis publik sebaiknya diganti dengan batas resmi (BIG/BPS) atau sumber yang asal-usulnya jelas.**
- **Ketelitian:** geometri sangat disederhanakan (sekitar 2.700 titik), cocok untuk peta tematik tingkat provinsi, bukan untuk batas yang presisi.
- **Pemetaan nama:** `src/data/provinceMap.ts`, tabel eksplisit (bukan pencocokan string). Hanya dua nama berbeda: "Daerah Istimewa Yogyakarta" menjadi "DI Yogyakarta", "Kepulauan Bangka Belitung" menjadi "Bangka Belitung". Kecocokan 38 nama di kedua arah sudah diperiksa.
