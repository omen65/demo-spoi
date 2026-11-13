#!/usr/bin/env python3
"""Ekstrak tren nasional 2019-2022 dan tabel riset dari source/Buku-SPOI-2023.pdf.

Jalankan ulang kapan saja:
    python3 -m venv .venv && .venv/bin/pip install -r scripts/requirements.txt
    .venv/bin/python scripts/extract_national.py

Keluaran: src/data/spoi-2023/national.json dan research.json
Konvensi angka buku: koma = desimal ("3350,415" -> 3350.415). Tidak ada pembetulan angka.
Nilai dari gambar (bukan teks) dibaca dari scripts/manual/*.json (transkripsi manual).
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "source" / "Buku-SPOI-2023.pdf"
OUT = ROOT / "src" / "data" / "spoi-2023"
MANUAL = ROOT / "scripts" / "manual"
YEARS = ["2019", "2020", "2021", "2022"]
PAGE_OFFSET = 16  # halaman PDF = halaman cetak + 16

NUM = re.compile(r"^-?\d+(,\d+)?$")
UNIT_METRIC = {"Ha": "luas", "Ton": "produksi", "Petani": "petani",
               "Operator": "operator", "Jumlah Operator": "operator"}
METRIC_UNIT = {"luas": "ha", "produksi": "ton", "petani": "orang", "operator": "operator"}

# (id, nama, kelompok, halaman PDF yang memuat grafiknya)
COMMODITIES = [
    ("beras", "Beras", "utama", [35, 36]),
    ("kelapa", "Kelapa", "utama", [37, 38]),
    ("pisang", "Pisang", "utama", [39, 40]),
    ("kopi", "Kopi", "utama", [41, 42]),
    ("jeruk", "Jeruk", "utama", [43, 44]),
    ("teh", "Teh", "utama", [45, 46]),
    ("kakao", "Kakao", "utama", [47, 48]),
    ("aren", "Aren", "utama", [49, 50]),
    ("rempah", "Rempah-rempah", "utama", [51, 52]),
    ("buah-tropis", "Buah tropis", "utama", [53, 54]),
    ("madu", "Madu (panen liar)", "lainnya", [59]),
    ("sarang-lebah", "Sarang lebah", "lainnya", [60]),
    ("ternak", "Produk hasil ternak", "lainnya", [61]),
    ("pupuk", "Pupuk/input organik", "lainnya", [62, 63]),
    ("pasar", "Operator pemasaran", "pasar", [64, 65]),
    ("olahan", "Produk olahan", "pasar", [66]),
]

# Gambar yang berupa gambar (bukan teks): diisi dari scripts/manual/gambar-image.json
IMAGE_ONLY = {
    "jamur": ("Jamur", "lainnya"),
    "kacang": ("Kacang-kacangan", "lainnya"),
    "umbi": ("Umbi-umbian", "lainnya"),
    "sayuran": ("Sayuran", "lainnya"),
}

# Rujukan caption per (komoditas, metrik): dipakai di `source`.
CAPTIONS = {
    ("beras", "luas"): (19, "Gambar 15"), ("beras", "petani"): (20, "Gambar 16"),
    ("beras", "produksi"): (20, "Gambar 17"),
    ("kelapa", "luas"): (21, "Gambar 18"), ("kelapa", "produksi"): (22, "Gambar 19"),
    ("kelapa", "petani"): (22, "Gambar 20"),
    ("pisang", "luas"): (23, "Gambar 21"), ("pisang", "produksi"): (24, "Gambar 22"),
    ("pisang", "petani"): (24, "Gambar 23"),
    ("kopi", "luas"): (25, "Gambar 24"), ("kopi", "produksi"): (26, "Gambar 25"),
    ("kopi", "petani"): (26, "Gambar 26"),
    ("jeruk", "luas"): (27, "Gambar 27"), ("jeruk", "produksi"): (28, "Gambar 28"),
    ("jeruk", "petani"): (28, "Gambar 29"),
    ("teh", "luas"): (29, "Gambar 30"), ("teh", "produksi"): (30, "Gambar 31"),
    ("teh", "petani"): (30, "Gambar 32"),
    ("kakao", "luas"): (31, "Gambar 33"), ("kakao", "produksi"): (32, "Gambar 34"),
    ("kakao", "petani"): (32, "Gambar 35"),
    ("aren", "luas"): (33, "Gambar 36"), ("aren", "produksi"): (34, "Gambar 37"),
    ("aren", "petani"): (34, "Gambar 38"),
    ("rempah", "luas"): (35, "Gambar 39"), ("rempah", "produksi"): (36, "Gambar 40"),
    ("rempah", "petani"): (36, "Gambar 41"),
    ("buah-tropis", "luas"): (37, "Gambar 42"), ("buah-tropis", "produksi"): (38, "Gambar 43"),
    ("buah-tropis", "petani"): (38, "Gambar 44"),
    ("madu", "produksi"): (43, "Gambar 49"), ("sarang-lebah", "produksi"): (44, "Gambar 50"),
    ("ternak", "operator"): (45, "Gambar 51"), ("ternak", "produksi"): (45, "Gambar 52"),
    ("pupuk", "operator"): (46, "Gambar 53"), ("pupuk", "produksi"): (47, "Gambar 54"),
    ("pasar", "operator"): (48, "Gambar 55"), ("pasar", "produksi"): (49, "Gambar 56"),
    ("olahan", "operator"): (50, "Gambar 57"), ("olahan", "produksi"): (50, "Gambar 58"),
}

# Nomor butir di docs/data-issues.md untuk data yang janggal
ISSUES = {
    ("pisang", "produksi"): [5], ("jeruk", "produksi"): [6], ("jeruk", "luas"): [6],
    ("kopi", "luas"): [7], ("kopi", "petani"): [7], ("teh", "produksi"): [8],
    ("kakao", "produksi"): [9], ("aren", "luas"): [10], ("aren", "petani"): [10],
    ("aren", "produksi"): [10], ("ternak", "produksi"): [11], ("pupuk", "operator"): [12],
    ("pupuk", "produksi"): [12], ("beras", "petani"): [13], ("beras", "produksi"): [13],
    ("kelapa", "luas"): [14], ("pasar", "produksi"): [16], ("olahan", "produksi"): [15],
}

# Angka yang disebut di teks narasi buku -> harus cocok dengan grafik (toleransi pembulatan)
# (komoditas, metrik, tahun, nilai di teks, toleransi, halaman cetak teks)
ANCHORS = [
    ("beras", "petani", "2019", 7398, 0, 18), ("beras", "petani", "2022", 12752, 0, 18),
    ("kelapa", "luas", "2019", 20993, 0, 21), ("kelapa", "luas", "2022", 21542, 0, 21),
    ("kelapa", "produksi", "2019", 21077, 0, 21), ("kelapa", "produksi", "2022", 23296, 0, 21),
    ("kelapa", "petani", "2019", 8432, 0, 21), ("kelapa", "petani", "2022", 10239, 0, 21),
    ("pisang", "produksi", "2022", 265.25, 0.005, 23),
    ("jeruk", "luas", "2022", 7.2, 0.005, 27),
    ("teh", "produksi", "2022", 104.6, 0.1, 29),
    ("aren", "luas", "2022", 507, 0.5, 33), ("aren", "petani", "2022", 910, 0, 33),
    ("rempah", "luas", "2019", 4948.16, 0.005, 35), ("rempah", "luas", "2022", 4860.397, 0.005, 35),
    ("rempah", "produksi", "2019", 7661, 0.5, 35), ("rempah", "produksi", "2022", 8002, 0.5, 35),
    ("madu", "produksi", "2021", 20.1, 0.005, 43), ("madu", "produksi", "2022", 23.4, 0.005, 43),
    ("sarang-lebah", "produksi", "2022", 0.057, 0.0005, 43),
    ("ternak", "operator", "2022", 16, 0, 44), ("ternak", "produksi", "2022", 41898, 0.5, 44),
    ("pupuk", "operator", "2022", 124, 0, 46),
    ("pasar", "operator", "2019", 9, 0, 48), ("pasar", "operator", "2022", 48, 0, 48),
    ("pasar", "produksi", "2019", 491.4, 0.1, 48), ("pasar", "produksi", "2022", 7795.9, 0.1, 48),
    ("olahan", "operator", "2019", 50, 0, 49), ("olahan", "operator", "2022", 99, 0, 49),
    ("olahan", "produksi", "2019", 1455.4, 0.1, 49), ("olahan", "produksi", "2022", 4795.28, 0.01, 49),
]


def parse_num(s: str) -> float:
    v = float(s.replace(",", "."))
    return int(v) if v.is_integer() and "," not in s else v


def chart_series(page: pymupdf.Page) -> list[tuple[str, list[float]]]:
    """Kembalikan [(metrik, [v2019..v2022])] sesuai urutan grafik di halaman.

    Pola teks per grafik: 4 label data, label sumbu, 2019-2022, satuan, "Tahun".
    Metrik ditentukan dari satuan sumbu, bukan caption (caption beras tertukar).
    """
    lines = [ln.strip() for ln in page.get_text().splitlines()]
    lines = [ln for ln in lines if ln]
    lines = lines[1:]  # baris pertama = nomor halaman cetak
    acc: list[str] = []
    out: list[tuple[str, list[float]]] = []
    for i, ln in enumerate(lines):
        if ln in UNIT_METRIC:
            nums = [t for t in acc if NUM.match(t)]
            if len(nums) < 4:
                raise ValueError(f"grafik {ln}: hanya {len(nums)} angka")
            tail = [t for t in acc[-4:]]
            if tail != YEARS:
                raise ValueError(f"grafik {ln}: urutan tahun tidak ditemukan ({tail})")
            data = nums[:4]
            out.append((UNIT_METRIC[ln], [parse_num(t) for t in data]))
            acc = []
        else:
            toks = ln.split()
            # hanya baris yang seluruhnya angka (label data, tick sumbu); baris prosa dilewati
            if toks and all(NUM.match(t) for t in toks):
                acc.extend(toks)
    return out


def build_national(doc: pymupdf.Document) -> dict:
    commodities = []
    for cid, name, group, pdf_pages in COMMODITIES:
        metrics: dict[str, dict] = {}
        for pno in pdf_pages:
            for metric, vals in chart_series(doc[pno - 1]):
                if metric in metrics:
                    raise ValueError(f"{cid}: metrik {metric} ganda")
                hlm, gambar = CAPTIONS[(cid, metric)]
                m = {
                    "unit": METRIC_UNIT[metric],
                    "values": dict(zip(YEARS, vals)),
                    "source": f"SPOI 2023, hlm. {hlm}, {gambar}",
                }
                if (cid, metric) in ISSUES:
                    m["issues"] = ISSUES[(cid, metric)]
                metrics[metric] = m
        commodities.append({"id": cid, "name": name, "group": group, "metrics": metrics})

    # Komoditas yang hanya berupa gambar: transkripsi manual
    manual_file = MANUAL / "gambar-image.json"
    if manual_file.exists():
        manual = json.loads(manual_file.read_text(encoding="utf-8"))
        for cid, (name, group) in IMAGE_ONLY.items():
            if cid in manual:
                commodities.append({"id": cid, "name": name, "group": group,
                                    "metrics": manual[cid]})
    return {
        "edition": "SPOI 2023",
        "years": [int(y) for y in YEARS],
        "numberConvention": "Angka di buku memakai koma desimal; di JSON sudah jadi angka biasa.",
        "commodities": commodities,
    }


def validate_national(data: dict) -> list[str]:
    problems = []
    index = {c["id"]: c for c in data["commodities"]}
    for cid, metric, year, expected, tol, hlm in ANCHORS:
        got = index[cid]["metrics"][metric]["values"][year]
        if abs(got - expected) > tol:
            problems.append(f"{cid}/{metric}/{year}: grafik={got}, teks hlm. {hlm}={expected}")
    for c in data["commodities"]:
        for metric, m in c["metrics"].items():
            vals = list(m["values"].values())
            if len(vals) != 4 or any(v is None for v in vals):
                problems.append(f"{c['id']}/{metric}: nilai tidak lengkap")
            if any(v < 0 for v in vals):
                problems.append(f"{c['id']}/{metric}: nilai negatif")
    return problems


def build_research(doc: pymupdf.Document) -> dict:
    topics = ["Pertanian organik secara umum", "Air, tanah, dan lingkungan", "Sosial ekonomi",
              "Transformasi, regulasi, dan konversi", "Konsumen dan konsumsi",
              "Perlindungan tanaman", "Benih", "Budidaya"]
    lines = [ln.strip() for ln in doc[81].get_text().splitlines()]  # PDF hlm. 82 = cetak 66
    ints = [int(ln) for ln in lines if re.fullmatch(r"\d+", ln)][1:]  # buang nomor halaman "66"
    needed = len(topics) * 3 + 3
    if len(ints) < needed:
        raise ValueError(f"Tabel 1: hanya {len(ints)} angka")
    cells, totals = ints[: len(topics) * 3], ints[len(topics) * 3: needed]
    snap = ["2015", "2020", "2023"]
    rows = []
    for i, t in enumerate(topics):
        rows.append({"topic": t, "values": dict(zip(snap, cells[i * 3: i * 3 + 3]))})
    for j, y in enumerate(snap):
        s = sum(r["values"][y] for r in rows)
        if s != totals[j]:
            raise ValueError(f"Tabel 1 kolom {y}: jumlah {s} != total di buku {totals[j]}")
    return {
        "title": "Tren perkembangan riset organik",
        "unit": "publikasi",
        "note": ("Tiga potret waktu, bukan deret tahunan. Kata kunci 'Pertanian Organik' dan "
                 "'Pangan Organik'; sumber IPI/Portal Garuda. Rentang data: 2015 = 2001-2015, "
                 "2020 = 2001-2020, 2023 = 2001-2023 (kumulatif)."),
        "snapshots": snap,
        "rows": rows,
        "totalArticles": dict(zip(snap, totals)),
        "garudaTotalApprox": {"2015": 280000, "2020": 1134556, "2023": 2482592},
        "source": "SPOI 2023, hlm. 66, Tabel 1; hlm. 67, Gambar 68",
    }


def main() -> int:
    doc = pymupdf.open(PDF)
    OUT.mkdir(parents=True, exist_ok=True)
    national = build_national(doc)
    problems = validate_national(national)
    research = build_research(doc)
    (OUT / "national.json").write_text(
        json.dumps(national, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "research.json").write_text(
        json.dumps(research, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    n_series = sum(len(c["metrics"]) for c in national["commodities"])
    print(f"national.json: {len(national['commodities'])} komoditas, {n_series} deret")
    print(f"research.json: {len(research['rows'])} topik, total {research['totalArticles']}")
    if problems:
        print("\nVALIDASI GAGAL:")
        for p in problems:
            print(" -", p)
        return 1
    print(f"validasi: {len(ANCHORS)} angka teks narasi cocok dengan grafik")
    return 0


if __name__ == "__main__":
    sys.exit(main())
