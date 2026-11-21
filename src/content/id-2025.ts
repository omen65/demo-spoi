/**
 * Teks antarmuka edisi SPOI 2025. Suaranya suara AOI sebagai pemilik data: tidak merujuk ke "dokumen", "draf V13",
 * nomor tabel atau grafik, dan tidak berisi audit. Temuan audit ada di docs/data-issues-2025.md dan docs/ringkasan-untuk-pimpinan.md.
 */

export type IndicatorStatus = 'ada' | 'sebagian' | 'belum'

export interface IndicatorRow {
  no: number
  name: string
  status: IndicatorStatus
  note: string
}

export const ui2025 = {
  logoAlt: 'Aliansi Organis Indonesia (AOI)',
  brand: 'SPOI 2025',
  badge: 'Draf',
  edition: {
    aria: 'Pilih edisi SPOI',
    e2023: '2023 (arsip)',
    e2023Short: '2023',
    e2025Short: '2025',
    e2025: '2025 (draf)',
  },
  banner: {
    title: 'Data dalam verifikasi',
    body: 'Angka SPOI 2025 masih diverifikasi dan dapat berubah.',
    link: 'Lihat catatan data',
  },
  nav: {
    home: 'Beranda',
    commodities: 'Komoditas',
    consumers: 'Konsumen',
    ecosystem: 'Ekosistem',
    research: 'Riset',
    about: 'Tentang Data',
    aboutShort: 'Tentang',
  },
  topbar: {
    context: (from: number, to: number) => `Data ${from}-${to}`,
    status: 'Dalam verifikasi',
  },
  footer: {
    credit: (publisher: string, edition: string) => `Data: ${edition}, ${publisher}. Dashboard: Aliansi Organis Indonesia (AOI).`,
    demoNote:
      'SPOI 2025 masih dalam verifikasi. Tanda † berarti angkanya sedang diverifikasi.',
    aboutLink: 'Tentang data',
  },
  comingSoon: {
    title: 'Halaman ini sedang disiapkan',
    body: 'Halaman ini belum tersedia.',
    back: 'Kembali ke Beranda 2025',
  },
  chart: {
    sourcePrefix: 'Sumber:',
    flagLegend: '† Dalam verifikasi',
    breakLabel: 'Patahan data',
    breakNote: 'Garis putus-putus menandai perubahan tajam antara 2022 dan 2023; kedua periode tidak dibandingkan langsung.',
  },
  home: {
    title: 'Pertanian organik Indonesia 2025',
    intro: (from: number, to: number) =>
      `Statistik pertanian organik Indonesia ${from}-${to}: data nasional per komoditas, survei konsumen, kelengkapan pelaporan, dan ekosistem organik.`,
    controls: { metric: 'Metrik', commodity: 'Komoditas' },
    metricNames: { luas: 'Luas lahan', produksi: 'Produksi', petani: 'Petani' },
    metricUnits: { luas: 'ha', produksi: 'ton', petani: 'orang' },
    headline: {
      aria: (year: string) => `Komoditas tanaman terbesar menurut luas, produksi, dan petani, ${year}`,
      label: (metric: string) => `${metric} terbesar`,
      since: (year: string) => `sejak ${year}`,
      sparkAria: (metric: string, name: string, from: string, to: string, a: string, b: string) =>
        `Tren ${metric.toLowerCase()} ${name} dari ${from} (${a}) ke ${to} (${b}), dengan perubahan tajam antara 2022 dan 2023`,
    },
    trend: {
      title: (noun: string, name: string, dir: 'naik' | 'turun' | 'tetap', pct: string, from: string, to: string) =>
        dir === 'tetap'
          ? `${noun} ${name} organik relatif tetap dari ${from} ke ${to}`
          : `${noun} ${name} organik ${dir} ${pct} dari ${from} ke ${to}`,
      titleNoPct: (noun: string, name: string, year: string, value: string) => `${noun} ${name} organik pada ${year}: ${value}`,
      aria: (noun: string, name: string) => `Grafik garis ${noun.toLowerCase()} ${name} organik per tahun, 2019 sampai 2024`,
      columns: { year: 'Tahun', value: 'Nilai' },
      nouns: { luas: 'Luas lahan', produksi: 'Produksi', petani: 'Jumlah petani', operator: 'Jumlah operator' },
    },
    ranking: {
      title: (metric: string, year: string) => `Peringkat komoditas menurut ${metric.toLowerCase()}, ${year}`,
      hint: 'Pilih komoditas untuk menampilkannya di grafik tren.',
      aria: (name: string) => `Tampilkan tren ${name}`,
      groups: { tanaman: 'Tanaman', produkLain: 'Produk lain' },
      groupNote: 'Produk lain dipisah karena satuannya sangat berbeda dari tanaman.',
      columns: { rank: 'Peringkat', group: 'Kelompok', name: 'Komoditas', value: 'Nilai', change: 'Perubahan 2023-2024 (%)' },
      noValue: 'Tidak ada data',
    },
    change: {
      title: (name: string, dir: 'naik' | 'turun', pct: string, metric: string, from: string, to: string) =>
        `${name} ${dir} paling tajam: ${metric.toLowerCase()} ${dir} ${pct} dari ${from} ke ${to}`,
      titleNone: 'Perubahan 2023 ke 2024 per komoditas',
      note: 'Hanya kelompok tanaman. Perubahan dihitung dari 2023 ke 2024; periode sebelumnya tidak dihitung karena ada perubahan tajam antara 2022 dan 2023.',
      columns: { name: 'Komoditas', pct: 'Perubahan (%)' },
    },
    coverage: {
      title: (pct: string, lengkap: number, total: number) =>
        `Hanya ${pct} kabupaten/kota yang melapor lengkap (${lengkap} dari ${total})`,
      unit: 'kabupaten/kota',
      note: 'SPOI bukan sensus. Wilayah yang belum melapor bukan berarti tidak punya pertanian organik. Pelaporan yang belum lengkap menunjukkan perlunya pengumpulan data yang lebih terstruktur.',
      aria: (pct: string) => `Kelengkapan pelaporan kabupaten/kota per wilayah. ${pct} melapor lengkap.`,
      legend: { lengkap: 'Lengkap', tidakLengkap: 'Ada, tidak lengkap', tidakAda: 'Tidak ada data' },
      columns: { region: 'Wilayah', lengkap: 'Lengkap', tidakLengkap: 'Ada, tidak lengkap', tidakAda: 'Tidak ada data' },
    },
    matrix: {
      title: (belum: number, sebagian: number, total: number) =>
        `${belum} dari ${total} indikator utama belum ada datanya, ${sebagian} baru sebagian`,
      unit: 'indikator',
      note: 'Indikator yang belum lengkap menunjukkan data yang perlu dikumpulkan secara lebih terstruktur dan berkelanjutan.',
      aria: 'Daftar 13 indikator utama SPOI 2025 beserta ketersediaan datanya',
      status: { ada: 'Ada', sebagian: 'Sebagian', belum: 'Belum tersedia' } satisfies Record<IndicatorStatus, string>,
      columns: { no: 'No', name: 'Indikator', status: 'Status', note: 'Keterangan' },
      source: 'SPOI 2025',
      rows: [
        { no: 1, name: 'Luas lahan organik', status: 'sebagian', note: 'Seri nasional untuk 9 komoditas dan luas per wilayah pulau 2024. Sebaran provinsi tersedia sebagai peta.' },
        { no: 2, name: 'Persentase luas lahan dan produktivitas', status: 'belum', note: 'Belum tersedia.' },
        { no: 3, name: 'Penjualan retail organik', status: 'belum', note: 'Belum tersedia. Data retail masih ditunggu.' },
        { no: 4, name: 'Produsen organik', status: 'sebagian', note: 'Jumlah petani untuk 8 komoditas serta operator ternak dan pupuk, tingkat nasional. Total produsen dan data provinsi belum tersedia.' },
        { no: 5, name: 'Penggunaan lahan per komoditas', status: 'sebagian', note: 'Luas dan produksi nasional. Luas tersedia untuk 9 dari 16 komoditas.' },
        { no: 6, name: 'Ekspor dan impor produk organik', status: 'belum', note: 'Belum tersedia.' },
        { no: 7, name: 'Produktivitas produk', status: 'sebagian', note: 'Tersedia untuk ternak, madu, dan input produksi (pupuk). Koleksi liar, produk olahan, dan jamur belum tersedia.' },
        { no: 8, name: 'Tren pasar dan persepsi konsumen', status: 'ada', note: 'Survei 235 responden, 20 grafik.' },
        { no: 9, name: 'Gerakan pertanian organik dan PGS', status: 'ada', note: 'Profil dan angka kunci empat sistem penjaminan.' },
        { no: 10, name: 'Regulasi dan kebijakan', status: 'ada', note: 'Linimasa kebijakan nasional.' },
        { no: 11, name: 'Publikasi riset organik', status: 'ada', note: 'Tingkat nasional, per topik.' },
        { no: 12, name: 'Gerakan konsumsi organik', status: 'ada', note: 'Komunitas konsumen organik.' },
        { no: 13, name: 'Pertanian berkelanjutan', status: 'ada', note: 'Uraian konsep, tanpa angka.' },
      ] satisfies IndicatorRow[],
    },
    regions: {
      title: (name: string, value: string) => `${name} memiliki luas lahan organik terbesar pada 2024: ${value} ha`,
      columns: { name: 'Wilayah', value: 'Luas lahan 2024 (ha)' },
      note: 'Luas per wilayah pulau tersedia untuk 2024. Data sedang diverifikasi.',
      aria: 'Diagram batang luas lahan organik per wilayah, 2024',
    },
    map: {
      title: 'Sebaran luas lahan organik per provinsi, 2024',
      alt: 'Peta Indonesia berwarna menurut luas lahan pertanian organik per provinsi pada 2024',
      caption: 'Makin gelap warna, makin luas lahan organik di provinsi itu. Data sedang diverifikasi.',
      open: 'Buka gambar ukuran penuh',
    },
    scopeNote: 'Angka antarkomoditas tidak dijumlahkan. Luas lahan hanya tersedia untuk sebagian komoditas.',
  },
  commodities: {
    title: 'Komoditas',
    lead: (n: number) => `Bandingkan ${n} komoditas menurut luas lahan, produksi, dan jumlah petani atau operator. Pilih tahun dan metrik.`,
    controls: { year: 'Tahun', metric: 'Metrik pada grafik' },
    periodNote: 'Ada perubahan tajam antara 2022 dan 2023; angka dari kedua periode tidak dibandingkan langsung.',
    metricNames: { luas: 'Luas lahan', produksi: 'Produksi', petani: 'Petani' },
    units: { luas: 'ha', produksi: 'ton', petani: 'orang' },
    chartPhrase: {
      luas: 'lahan organik terluas',
      produksi: 'produksi organik terbesar',
      petani: 'petani organik terbanyak',
    },
    chartTitle: (name: string, phrase: string, year: string) => `${name} memiliki ${phrase} di antara tanaman pada ${year}`,
    chartAria: (metric: string, year: string) => `Diagram batang ${metric} per komoditas tanaman, ${year}`,
    chartNote:
      'Kelompok tanaman. Produk lain ada di tabel di bawah karena satuannya sangat berbeda. Angka antarkomoditas tidak dijumlahkan.',
    listTitle: 'Tanaman',
    otherTitle: 'Produk lain',
    otherLead: 'Madu, ternak, dan pupuk organik.',
    noValue: 'Tidak ada data',
    flagTitle: 'Dalam verifikasi',
    operatorSuffix: 'operator',
    sortBy: 'Urutkan menurut',
    table: {
      name: 'Komoditas',
      area: 'Luas lahan (ha)',
      prod: 'Produksi (ton)',
      people: 'Petani (orang)',
      change: (metric: string) => `Perubahan ${metric.toLowerCase()} 2023-2024 (%)`,
      trend: (metric: string) => `Tren ${metric.toLowerCase()}`,
    },
    sparkAria: (metric: string, name: string) => `Tren ${metric.toLowerCase()} ${name}, 2019 sampai 2024, dengan perubahan tajam antara 2022 dan 2023`,
  },
  detail: {
    back: 'Komoditas',
    notFoundTitle: 'Komoditas tidak ditemukan',
    lead: (year: string) => `Ringkasan ${year} dan tren 2019-2024`,
    summary: (year: string) => `Ringkasan ${year}`,
    summaryNames: { luas: 'Luas lahan', produksi: 'Produksi', petani: 'Petani', operator: 'Operator' },
    units: { luas: 'ha', produksi: 'ton', petani: 'orang', operator: 'operator' },
    since: (year: string) => `sejak ${year}`,
    notesTitle: 'Catatan data',
    notesLead: 'Angka berikut sedang diverifikasi.',
    notesLabel: (noun: string) => noun,
    trendColumns: { year: 'Tahun', value: 'Nilai' },
    maps: {
      title: (name: string) => `Sebaran produksi ${name.toLowerCase()} organik per provinsi`,
      intro: 'Warna menunjukkan produksi (ton) per provinsi pada 2023 dan 2024.',
      none: 'Peta sebaran provinsi belum tersedia untuk komoditas ini.',
      year: (y: number) => `Produksi ${y}`,
      alt: (name: string, y: number) => `Peta sebaran produksi ${name.toLowerCase()} organik per provinsi, ${y}`,
      open: 'Buka gambar ukuran penuh',
    },
    prev: 'Sebelumnya',
    next: 'Berikutnya',
  },
  consumers: {
    title: 'Konsumen',
    lead: (n: number) =>
      `Survei konsumen pangan organik dengan ${n} responden. Hasilnya bukan sensus dan tidak mewakili seluruh konsumen Indonesia.`,
    unit: 'persen responden',
    unitUnknown: 'persen',
    basis: (n: number) => `Dasar persentase: ${n} responden.`,
    basisOnline:
      'Persentase dari responden yang berbelanja secara daring.',
    basisOffline:
      'Persentase dari responden yang berbelanja secara luring.',
    multi: 'Boleh memilih lebih dari satu jawaban, jadi jumlahnya bisa lebih dari 100%.',
    scaleNote: 'Setiap baris berjumlah 100% responden.',
    columns: { category: 'Kategori', value: 'Persentase (%)' },
    scaleAria: (title: string) => `Diagram batang bertumpuk: ${title}`,
    barAria: (title: string) => `Diagram batang: ${title}`,
    sections: [
      {
        id: 'profil',
        title: 'Profil responden',
        lead: 'Siapa yang menjawab survei.',
        charts: ['domisili', 'gender', 'usia', 'pekerjaan', 'pendidikan', 'pendapatan'],
      },
      {
        id: 'belanja',
        title: 'Cara memperoleh dan berbelanja',
        lead: 'Dari mana produk organik didapat, dan bagaimana responden membelinya.',
        charts: ['cara-memperoleh', 'platform-online', 'alasan-daring', 'pengeluaran-daring', 'alasan-luring', 'cara-luring', 'pengeluaran-luring'],
      },
      {
        id: 'produk',
        title: 'Produk yang dikonsumsi',
        lead: 'Produk segar dan olahan yang dikonsumsi responden.',
        charts: ['produk-segar', 'produk-olahan'],
      },
      {
        id: 'kepercayaan',
        title: 'Kepercayaan dan sertifikasi',
        lead: 'Apa yang membuat responden percaya pada produk organik.',
        charts: ['pentingnya-sertifikasi', 'jenis-penjaminan', 'faktor-kepercayaan', 'kemudahan-akses', 'faktor-pembelian'],
      },
    ],
    /** Judul grafik berbentuk temuan. Argumen: kategori terbesar, persentasenya, lalu kategori kedua dan persentasenya. */
    titles: {
      domisili: (a: string, p: string, b: string, q: string) => `Responden terbanyak berdomisili di ${a} (${p}), diikuti ${b} (${q})`,
      gender: (a: string, p: string, b: string, q: string) => `${a} ${p} dan ${b} ${q} dari responden`,
      usia: (a: string, p: string) => `Kelompok usia ${a} paling banyak (${p} responden)`,
      pekerjaan: (a: string, p: string) => `${a} adalah pekerjaan responden terbanyak (${p})`,
      pendidikan: (a: string, p: string) => `Pendidikan terakhir responden terbanyak: ${a}, ${p}`,
      pendapatan: (a: string, p: string) => `Kelompok pendapatan ${a} per bulan paling banyak (${p})`,
      caraMemperoleh: (a: string, p: string, b: string, q: string) => `Cara memperoleh produk terbanyak: ${a} (${p}), lalu ${b} (${q})`,
      platformOnline: (a: string, p: string, b: string, q: string) => `${a} paling banyak dipakai belanja daring (${p}), diikuti ${b} (${q})`,
      alasanDaring: (a: string, p: string) => `Alasan utama belanja daring: ${a} (${p})`,
      pengeluaranDaring: (a: string, p: string) => `${p} responden berbelanja daring dengan pengeluaran ${a} per bulan`,
      alasanLuring: (a: string, p: string) => `Alasan utama belanja luring: ${a} (${p})`,
      caraLuring: (a: string, p: string) => `Cara belanja luring terbanyak: ${a} (${p})`,
      pengeluaranLuring: (a: string, p: string) => `${p} responden berbelanja luring dengan pengeluaran ${a} per bulan`,
      produkSegar: (a: string, p: string) => `${a} adalah produk segar yang paling banyak dikonsumsi (${p})`,
      produkOlahan: (a: string, p: string) => `${a} adalah produk olahan yang paling banyak dikonsumsi (${p})`,
      sertifikasi: (p: string) => `${p} responden menyatakan sertifikasi organik penting`,
      jenisPenjaminan: (a: string, p: string, b: string, q: string) => `${a} paling dipercaya (${p}), diikuti ${b} (${q})`,
      kemudahanAkses: (p: string) => `${p} responden memilih tingkat 3 atau 4 untuk kemudahan akses (skala 1-4)`,
      faktorKepercayaan: (a: string, p: string) => `${a} paling banyak disetujui sebagai dasar kepercayaan (${p} setuju atau sangat setuju)`,
      faktorPembelian: (count: number, total: number) =>
        `${count} dari ${total} faktor pembelian dinilai penting atau sangat penting oleh lebih dari 95% responden`,
    },
  },
  research: {
    title: 'Riset',
    lead: 'Jumlah publikasi riset pertanian organik di Indonesia menurut topik, pada empat potret waktu.',
    chartTitle: (dir: 'naik' | 'turun', a: number, y1: string, b: number, y2: string) =>
      `Publikasi riset pertanian organik ${dir} dari ${new Intl.NumberFormat('id-ID').format(a)} pada ${y1} menjadi ${new Intl.NumberFormat('id-ID').format(b)} pada ${y2}`,
    aria: 'Diagram batang berkelompok jumlah publikasi riset pertanian organik menurut topik pada 2015, 2020, 2023, dan 2024',
    columns: { topic: 'Topik riset', total: 'Total (jumlah topik)' },
    totalsTitle: 'Total publikasi per potret',
    totalsNote:
      'Jumlah delapan topik. Perubahan 2023 ke 2024 dihitung; potret sebelumnya tidak dibandingkan karena jaraknya tidak sama.',
    sinceLabel: (y: string) => `dari ${y}`,
    noteTitle: 'Cara membaca',
    noteSnapshots: 'Data berupa empat potret waktu (2015, 2020, 2023, 2024), bukan deret tahunan.',
    garudaTitle: 'Konteks: artikel di portal Garuda',
    garudaNote: 'Jumlah total artikel di portal Garuda untuk semua bidang, kurang lebih, bukan hanya pertanian organik.',
  },
  ecosystem: {
    title: 'Ekosistem organik',
    lead: 'Sistem penjaminan partisipatif, komunitas konsumen, dan perjalanan kebijakan pertanian organik di Indonesia.',
    navAria: 'Bagian halaman',
    sections: {
      pgs: { id: 'pgs', title: 'Penjaminan partisipatif (PGS)', lead: 'Penjaminan berbasis komunitas sebagai alternatif sertifikasi pihak ketiga.' },
      communities: { id: 'komunitas', title: 'Komunitas konsumen organik', lead: 'Jaringan yang menghubungkan konsumen dengan produsen.' },
      policy: { id: 'kebijakan', title: 'Perjalanan kebijakan', lead: 'Dari praktik tradisional sampai peta jalan hingga 2045.' },
    },
    pgs: {
      total: (n: string) => `Empat inisiatif PGS menjangkau lebih dari ${n} petani dan pelaku usaha.`,
      shortNames: { pamor: 'PAMOR', roles: 'ROLES', 'pgs-lestari': 'PGS Lestari' } as Record<string, string>,
      flag: '† Dalam verifikasi',
      figuresAria: (name: string) => `Angka kunci ${name}`,
    },
    communities: {
      columns: { name: 'Komunitas', base: 'Basis', role: 'Peran terkait konsumen' },
      note: 'AOI adalah organisasi masyarakat sipil yang bergerak pada pemberdayaan petani, sistem penjaminan, dan pangan lokal, bukan komunitas konsumen murni.',
    },
    policy: {
      aria: 'Linimasa kebijakan pertanian organik nasional, dari praktik tradisional sampai 2045',
      note: 'Linimasa kebijakan tingkat nasional.',
    },
    sourcePrefix: 'Sumber:',
  },
  about: {
    title: 'Tentang Data',
    lead: 'Sumber, metodologi, definisi, dan batasan data SPOI 2025.',
    toc: 'Isi halaman',
    sections: {
      source: { id: 'sumber', title: 'Sumber dan status' },
      method: { id: 'metodologi', title: 'Metodologi' },
      definitions: { id: 'definisi', title: 'Definisi' },
      limits: { id: 'batasan', title: 'Keterbatasan' },
      matrix: { id: 'indikator', title: 'Indikator' },
      notes: { id: 'catatan', title: 'Catatan data' },
      demo: { id: 'demo', title: 'Tentang dashboard' },
    },
    source: {
      lead: (title: string, publisher: string, status: string, from: number, to: number) =>
        `${title}, disusun ${publisher}. Data tahun ${from}-${to}. Status: ${status}.`,
      published: (p: string) => `Terbit: ${p}.`,
    },
    method: {
      sources:
        'Sumber data: survei dan kompilasi AOI (produsen, komoditas, luas lahan, kelembagaan), data lembaga sertifikasi organik yang diberikan secara sukarela, data sistem penjaminan berbasis komunitas (PGS), dan sumber pendukung seperti laporan program dan publikasi riset.',
      collection:
        'Pengumpulan memakai survei daring dan luring, wawancara, Focus Group Discussion, dan studi literatur, difokuskan pada data 2023 dan 2024 serta sebagian data 2025.',
      processing:
        'Pengolahan: verifikasi dan validasi internal untuk mengurangi duplikasi, pengelompokan menurut wilayah, komoditas, dan jenis pelaku, lalu tabulasi dan agregasi. Analisisnya deskriptif, tanpa inferensi statistik.',
      dashboard:
        'Dashboard menampilkan data agregat tingkat nasional. Angka yang dihitung hanya perubahan persen 2023 ke 2024 serta persentase dari jumlah responden atau wilayah. Tanda † menunjukkan angka yang sedang diverifikasi.',
    },
    definitions: {
      items: [
        { term: 'Luas lahan', text: 'Luas lahan pertanian organik dalam hektare (ha), per komoditas.' },
        { term: 'Produksi', text: 'Volume produksi dalam ton, per komoditas.' },
        { term: 'Petani dan operator', text: 'Jumlah petani untuk komoditas, jumlah operator untuk ternak dan pupuk.' },
        { term: 'Kelengkapan data', text: 'Status pelaporan kabupaten/kota dan lembaga: lengkap, ada tetapi tidak lengkap, atau tidak ada data.' },
        { term: 'Responden survei', text: '235 responden konsumen pangan organik. Hasilnya bukan sensus dan tidak mewakili seluruh konsumen Indonesia.' },
        { term: 'Perubahan tajam 2022-2023', text: 'Hampir semua seri komoditas berubah tajam di antara dua tahun itu. Perubahan persen tidak dihitung melewatinya.' },
      ],
    },
    limits: {
      lead: 'SPOI bukan sensus pertanian organik, melainkan gambaran perkembangan dan arah.',
      items: [
        'Data pertanian organik di Indonesia belum terintegrasi dalam satu sistem nasional.',
        'Data lembaga sertifikasi dan PGS bersifat sukarela.',
        'Definisi dan kategori berbeda antarsumber data.',
        'Dari 514 kabupaten/kota, 15 melapor lengkap, 16 melapor tidak lengkap, dan 483 belum ada data.',
      ],
      coverageTitle: (pct: string, lengkap: number, total: number) => `Hanya ${pct} lembaga dan mitra yang melapor lengkap (${lengkap} dari ${total})`,
      coverageUnit: 'lembaga/mitra',
      coverageNote: 'Termasuk lembaga sertifikasi nasional dan internasional, Kementerian Pertanian, anggota dan jaringan AOI.',
      coverageAria: (pct: string) => `Kelengkapan pelaporan lembaga dan mitra AOI. ${pct} melapor lengkap.`,
      coverageColumns: { name: 'Lembaga', lengkap: 'Lengkap', tidakLengkap: 'Ada, tidak lengkap', tidakAda: 'Tidak ada data' },
    },
    notes: {
      lead: 'Hal yang perlu diperhatikan saat membaca angka SPOI 2025.',
      breakTitle: 'Perubahan tajam antara 2022 dan 2023',
      breakText:
        'Hampir semua seri berubah tajam di antara dua tahun itu, misalnya luas kopi dari 31.772,96 ke 1.184,62 ha. Kedua periode tidak dibandingkan langsung.',
      flagTitle: 'Tanda †',
      flagText: 'Angka dengan tanda † sedang diverifikasi dan dapat berubah.',
    },
    demo: {
      text: 'Dashboard ini menampilkan statistik pertanian organik Indonesia dari SPOI 2025 secara interaktif. SPOI 2025 ditampilkan terpisah dari edisi lain dan tidak dibandingkan langsung, karena cakupan tiap edisi berbeda. Data per provinsi dan data pasar belum tersedia dalam bentuk angka.',
    },
    credit: {
      title: 'Kredit',
      text: 'Statistik Pertanian Organik Indonesia 2025 disusun oleh Kementerian PPN/Bappenas bersama Aliansi Organis Indonesia (AOI). Dashboard dibuat oleh AOI.',
    },
  },
} as const
