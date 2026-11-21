#!/usr/bin/env python3
"""Ekstrak data SPOI 2025 (Draft V13) dari source/*.docx ke src/data/spoi-2025/.

Jalankan ulang kapan saja (hanya pustaka standar Python):
    python3 scripts/extract_docx_2025.py

Sumber angka:
- Seri komoditas dan survei: nilai tersimpan di XML grafik Word (word/charts/chartN.xml),
  bukan dibaca dari gambar. Grafik di dokumen tertaut ke xlsx eksternal yang belum kita punya.
- Tabel 1-4 dan tabel teks: tabel Word.
Konvensi: angka tidak dibetulkan. Pembulatan hanya membuang noise floating point (6 desimal).
Masalah data tidak diperbaiki diam-diam: dicatat di docs/data-issues-2025.md dan ditautkan lewat `issues`.
"""
from __future__ import annotations

import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
MAPS_OUT = ROOT / "src" / "assets" / "spoi-2025" / "maps"
DOCX = next((ROOT / "source").glob("Statistik Pertanian Organik Indonesia Draft V13*.docx"))
OUT = ROOT / "src" / "data" / "spoi-2025"
EDITION = "SPOI 2025 (Draft V13)"  # nama internal (meta); tidak ditampilkan di UI
SRC = "SPOI 2025"  # nama sumber yang tampil di UI
YEARS = ["2019", "2020", "2021", "2022", "2023", "2024"]

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
C = "{http://schemas.openxmlformats.org/drawingml/2006/chart}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"

UNIT = {"luas": "ha", "produksi": "ton", "petani": "orang", "operator": "operator"}

NAMES = {
    "beras": "Beras", "kelapa": "Kelapa", "pisang": "Pisang", "kopi": "Kopi", "jeruk": "Jeruk",
    "teh": "Teh", "kakao": "Kakao", "aren": "Aren", "buah-tropis": "Buah tropis", "umbi": "Umbi",
    "rempah": "Rempah", "kacang": "Kacang", "sayur": "Sayur", "madu": "Madu", "ternak": "Ternak",
    "pupuk": "Pupuk",
}

# Grafik N -> (komoditas, metrik, bab). Urutan = urutan kemunculan di dokumen.
GRAFIK: dict[int, tuple[str, str, str]] = {
    1: ("beras", "produksi", "3.2.1"), 2: ("beras", "luas", "3.2.1"),
    3: ("kelapa", "produksi", "3.2.2"), 4: ("kelapa", "luas", "3.2.2"),
    5: ("pisang", "produksi", "3.2.3"), 6: ("pisang", "luas", "3.2.3"),
    7: ("kopi", "produksi", "3.2.4"), 8: ("kopi", "luas", "3.2.4"),
    9: ("jeruk", "produksi", "3.2.5"), 10: ("jeruk", "luas", "3.2.5"),
    11: ("teh", "produksi", "3.2.6"), 12: ("teh", "luas", "3.2.6"),
    13: ("kakao", "produksi", "3.2.7"), 14: ("kakao", "luas", "3.2.7"),
    15: ("aren", "produksi", "3.2.8"), 16: ("aren", "luas", "3.2.8"),
    17: ("buah-tropis", "produksi", "3.2.9"), 18: ("buah-tropis", "luas", "3.2.9"),
    19: ("umbi", "produksi", "3.2.10"), 20: ("rempah", "produksi", "3.2.11"),
    21: ("kacang", "produksi", "3.2.12"), 22: ("sayur", "produksi", "3.2.13"),
    23: ("madu", "produksi", "3.2.14"), 24: ("ternak", "produksi", "3.2.15"),
    25: ("pupuk", "produksi", "3.2.16"),
    26: ("beras", "petani", "5.1"), 27: ("kelapa", "petani", "5.2"), 28: ("pisang", "petani", "5.3"),
    29: ("kopi", "petani", "5.4"), 30: ("jeruk", "petani", "5.5"), 31: ("teh", "petani", "5.6"),
    32: ("kakao", "petani", "5.7"), 33: ("buah-tropis", "petani", "5.8"),
    34: ("ternak", "operator", "5.9"), 35: ("pupuk", "operator", "5.10"),
}

# Nomor butir di docs/data-issues-2025.md yang dikerjakan manual (bukan hasil deteksi otomatis).
MANUAL_ISSUES: dict[int, list[int]] = {
    1: [20], 4: [14], 6: [22], 9: [13, 22], 14: [22], 15: [19], 16: [19, 22], 18: [22],
    23: [7], 24: [6], 25: [5], 26: [18], 27: [15, 22], 29: [16], 30: [22], 32: [17, 22],
    33: [22], 34: [22],
}
MANUAL_NOTES: dict[int, str] = {
    6: "Data sedang diverifikasi.",
    9: "Produksi tercatat mulai 2022; data sedang diverifikasi.",
    23: "Data 2024 belum tersedia.",
    27: "Data sedang diverifikasi.",
}

# Judul dan penyebut grafik survei (Grafik 36-55), disalin dari dokumen.
SURVEY = {
    36: ("domisili", "Domisili responden pengonsumsi pangan organik", "single", 235),
    37: ("gender", "Responden berdasarkan gender", "single", 235),
    38: ("usia", "Responden berdasarkan kelompok usia", "single", 235),
    39: ("pekerjaan", "Responden berdasarkan pekerjaan", "single", 235),
    40: ("pendidikan", "Responden berdasarkan pendidikan terakhir", "single", 235),
    41: ("pendapatan", "Responden berdasarkan pendapatan per bulan", "single", 235),
    42: ("cara-memperoleh", "Cara memperoleh produk organik", "single", 235),
    43: ("platform-online", "Platform online untuk membeli produk organik", "multi", None),
    44: ("alasan-daring", "Alasan berbelanja secara daring", "multi", None),
    45: ("pengeluaran-daring", "Pengeluaran belanja daring per bulan", "single", None),
    46: ("alasan-luring", "Alasan berbelanja secara luring", "multi", None),
    47: ("cara-luring", "Cara berbelanja secara luring", "multi", None),
    48: ("pengeluaran-luring", "Pengeluaran belanja luring per bulan", "single", None),
    49: ("produk-segar", "Produk segar yang dikonsumsi", "multi", 235),
    50: ("produk-olahan", "Jenis produk olahan organik yang dikonsumsi", "multi", 235),
    51: ("faktor-kepercayaan", "Faktor yang menentukan kepercayaan", "scale", 235),
    52: ("pentingnya-sertifikasi", "Pentingnya sertifikasi organik", "single", 235),
    53: ("jenis-penjaminan", "Jenis penjaminan organik yang dipercaya", "multi", 235),
    54: ("kemudahan-akses", "Kemudahan akses produk organik (skala 1-4)", "single", 235),
    55: ("faktor-pembelian", "Tingkat kepentingan faktor pembelian", "scale", 235),
}

# Gambar N -> (komoditas, keterangan di dokumen, {tahun: file di word/media}).
# Tahun dibaca dari judul di dalam tiap gambar (dicek satu per satu), BUKAN dari urutan di dokumen:
# pada Gambar 11 (rempah) urutan dua peta tertukar. Semua peta berjudul "Produksi ... (Ton)".
MAPS: dict[int, tuple[str, str, dict[str, str]]] = {
    2: ("beras", "Luas Lahan Produksi Beras Organik Tahun 2023 dan 2024", {"2023": "image53.png", "2024": "image49.png"}),
    3: ("kelapa", "Lahan produksi kelapa organik tahun 2023 dan 2024", {"2023": "image58.png", "2024": "image48.png"}),
    4: ("pisang", "Luas lahan pisang organik tahun 2023 dan 2024", {"2023": "image55.png", "2024": "image52.png"}),
    5: ("kopi", "Luas lahan kopi organik", {"2023": "image36.png", "2024": "image51.png"}),
    6: ("jeruk", "Luasan produksi jeruk organik tahun 2023 dan 2024", {"2023": "image50.png", "2024": "image54.png"}),
    7: ("teh", "Luasan produksi teh organik", {"2023": "image82.png", "2024": "image81.png"}),
    8: ("aren", "Besaran produksi aren organik tahun 2023 dan 2024", {"2023": "image37.png", "2024": "image42.png"}),
    9: ("buah-tropis", "Besaran produksi buah-buahan tropis tahun 2023-2024", {"2023": "image78.png", "2024": "image80.png"}),
    10: ("umbi", "Sebaran produksi umbi-umbian organik tahun 2023-2024", {"2023": "image76.png", "2024": "image75.png"}),
    11: ("rempah", "Sebaran produksi rempah organik tahun 2023-2024", {"2023": "image46.png", "2024": "image45.png"}),
    12: ("kacang", "Sebaran produksi kacang organik tahun 2023-2024", {"2023": "image79.png", "2024": "image77.png"}),
    13: ("sayur", "Sebaran produksi sayuran organik tahun 2023-2024", {"2023": "image47.png", "2024": "image44.png"}),
    14: ("madu", "Sebaran produksi madu organik tahun 2023-2024", {"2023": "image29.png", "2024": "image30.png"}),
    15: ("ternak", "Sebaran produksi ternak organik tahun 2023-2024", {"2023": "image22.png", "2024": "image38.png"}),
    16: ("pupuk", "Sebaran produksi pupuk organik tahun 2023-2024", {"2023": "image57.png", "2024": "image31.png"}),
}

WARN: list[str] = []


def warn(msg: str) -> None:
    WARN.append(msg)
    print("PERINGATAN:", msg, file=sys.stderr)


def num(s: str | None) -> float | None:
    if s is None:
        return None
    v = round(float(s), 6)
    return int(v) if v == int(v) and abs(v) < 1e15 else v


def read_charts(z: zipfile.ZipFile) -> list[dict]:
    rels = ET.fromstring(z.read("word/_rels/document.xml.rels"))
    rmap = {r.get("Id"): r.get("Target") for r in rels}
    root = ET.fromstring(z.read("word/document.xml"))
    out: list[dict] = []
    for n in root.iter():
        if n.tag.endswith("}chart") and n.get(R + "id"):
            target = rmap[n.get(R + "id")]
            cx = ET.fromstring(z.read("word/" + target))
            series = []
            for s in cx.iter(C + "ser"):
                tx = s.find(C + "tx")
                name = "".join(t.text or "" for t in tx.iter(C + "v")) if tx is not None else ""

                def pts(tag: str) -> dict[int, str]:
                    e = s.find(C + tag)
                    return {int(p.get("idx")): p.find(C + "v").text for p in e.iter(C + "pt")} if e is not None else {}

                cat, val = pts("cat"), pts("val")
                size = max(list(cat) + list(val) + [-1]) + 1
                series.append({"name": name, "cat": [cat.get(i) for i in range(size)],
                               "val": [num(val.get(i)) for i in range(size)]})
            out.append({"file": target, "series": series})
    return out


def cell_text(tc: ET.Element) -> str:
    return " ".join("".join(t.text or "" for t in p.iter(W + "t")) for p in tc.iter(W + "p")).strip()


def read_tables(z: zipfile.ZipFile) -> list[list[list[str]]]:
    root = ET.fromstring(z.read("word/document.xml"))
    return [[[cell_text(tc) for tc in tr.findall(W + "tc")] for tr in t.iter(W + "tr")]
            for t in root.find(W + "body").findall(W + "tbl")]


def id_num(s: str) -> float | None:
    """Angka gaya Indonesia di tabel: koma = desimal. Kosong atau '-' -> None."""
    s = s.strip().replace(" ", "")
    if s in ("", "-", "`"):
        return None
    return num(s.replace(",", "."))


def build_national(charts: list[dict]) -> dict:
    by_commodity: dict[str, dict] = {}
    for n, (cid, metric, bab) in GRAFIK.items():
        ch = charts[n - 1]
        s = ch["series"][0]
        if s["cat"] != YEARS:
            warn(f"Grafik {n}: sumbu {s['cat']} bukan {YEARS}")
        values = {y: v for y, v in zip(s["cat"], s["val"])}
        issues = list(MANUAL_ISSUES.get(n, []))
        v22, v23 = values.get("2022"), values.get("2023")
        if v22 and v23 is not None and (v23 / v22 < 0.5 or v23 / v22 > 2) and 3 not in issues:
            issues.append(3)  # patahan 2022 ke 2023
        seq = [values[y] for y in YEARS]
        if any(a is not None and a != 0 and a == b for a, b in zip(seq, seq[1:])) and 4 not in issues:
            issues.append(4)  # nilai identik di tahun berurutan
        entry: dict = {
            "unit": UNIT[metric],
            "values": values,
            "source": f"{SRC}, Bab {bab}, Grafik {n}",
            "issues": sorted(issues),
        }
        if n in MANUAL_NOTES:
            entry["note"] = MANUAL_NOTES[n]
        if not entry["issues"]:
            del entry["issues"]
        c = by_commodity.setdefault(cid, {"id": cid, "name": NAMES[cid], "metrics": {}})
        c["metrics"][metric] = entry
    order = list(NAMES)
    return {"edition": EDITION, "years": [int(y) for y in YEARS],
            "commodities": [by_commodity[k] for k in order]}


def build_survey(charts: list[dict]) -> dict:
    items = []
    for n, (sid, title, kind, base) in SURVEY.items():
        ch = charts[n - 1]
        series = ch["series"]
        entry: dict = {"id": sid, "grafik": n, "title": title, "kind": kind, "unit": "proporsi responden",
                       "respondents": base, "source": f"{SRC}, Bab 8, Grafik {n}"}
        if kind == "scale":
            entry["levels"] = [s["name"] for s in series]
            entry["categories"] = series[0]["cat"]
            entry["values"] = {s["name"]: s["val"] for s in series}
        else:
            entry["categories"] = series[0]["cat"]
            entry["values"] = series[0]["val"]
        if kind == "single":
            total = sum(v for v in series[0]["val"] if v is not None)
            if abs(total - 1) > 0.005:
                warn(f"Grafik {n}: jumlah proporsi {total:.4f}, bukan 1")
        if base is None:
            entry["note"] = ("Penyebut tidak dinyatakan di dokumen (subset pengguna online/offline). "
                             "Perhitungan balik menunjukkan sekitar 31 (online) dan 115 (offline), belum dikonfirmasi.")
        items.append(entry)
    return {"edition": EDITION, "respondents": 235,
            "note": "Survei 235 responden, bukan sensus dan bukan representatif nasional (Bab 8).",
            "charts": items}


def build_coverage(tables: list[list[list[str]]]) -> dict:
    t1, t2 = tables[0], tables[1]
    assert t1[0][0] == "Wilayah" and t2[0][0] == "Lembaga", "urutan tabel berubah"
    regions = []
    for r in t1[2:-2]:
        regions.append({"name": r[0], "lengkap": int(r[1]), "tidakLengkap": int(r[2]), "tidakAda": int(r[3])})
    totals1 = {k: sum(x[k] for x in regions) for k in ("lengkap", "tidakLengkap", "tidakAda")}
    rep1 = t1[-2]
    if [totals1["lengkap"], totals1["tidakLengkap"], totals1["tidakAda"]] != [int(rep1[1]), int(rep1[2]), int(rep1[3])]:
        warn(f"Tabel 1: total terhitung {totals1} berbeda dengan total tertulis {rep1}")
    insts = []
    for r in t2[2:-2]:
        insts.append({"name": r[0], "lengkap": int(r[1]), "tidakLengkap": int(r[2]), "tidakAda": int(r[3])})
    totals2 = {k: sum(x[k] for x in insts) for k in ("lengkap", "tidakLengkap", "tidakAda")}
    rep2 = t2[-2]
    if [totals2["lengkap"], totals2["tidakLengkap"], totals2["tidakAda"]] != [int(rep2[1]), int(rep2[2]), int(rep2[3])]:
        warn(f"Tabel 2: total terhitung {totals2} berbeda dengan total tertulis {rep2}")
    return {
        "edition": EDITION,
        "kabupatenKota": {"unit": "kabupaten/kota", "source": f"{SRC}, Bab 2.2.5, Tabel 1",
                          "regions": regions, "total": totals1,
                          "reportedPercent": {"lengkap": float(t1[-1][1]), "tidakLengkap": float(t1[-1][2]),
                                              "tidakAda": float(t1[-1][3])}},
        "lembaga": {"unit": "lembaga/mitra", "source": f"{SRC}, Bab 2.2.5, Tabel 2",
                    "rows": insts, "total": totals2,
                    "reportedPercent": {"lengkap": float(t2[-1][1]), "tidakLengkap": float(t2[-1][2]),
                                        "tidakAda": float(t2[-1][3])}},
    }


def build_area_by_region(tables: list[list[list[str]]]) -> dict:
    t3 = tables[2]
    assert t3[0][0] == "Wilayah" and t3[0][-1].startswith("2024"), "Tabel 3 berubah"
    rows = [{"name": r[0], "luas2024": id_num(r[-1])} for r in t3[1:-1]]
    total = id_num(t3[-1][-1])
    summed = round(sum(r["luas2024"] or 0 for r in rows), 6)
    if abs(summed - (total or 0)) > 0.05:
        warn(f"Tabel 3: jumlah wilayah {summed} berbeda dengan total {total}")
    return {
        "edition": EDITION, "year": 2024, "unit": "ha",
        "source": f"{SRC}, Bab 3.1, Tabel 3",
        "note": "Kolom 2020, 2023, dan % perubahan kosong di dokumen sehingga tidak disertakan. "
                "Nilai 0 (Maluku, Papua) belum jelas artinya: nol atau tidak melapor.",
        "issues": [1, 2],
        "regions": rows, "totalReported": total, "totalSummed": summed,
    }


def build_research(tables: list[list[list[str]]]) -> dict:
    t4 = tables[4]
    assert t4[0][0] == "Topik Riset", "Tabel 4 berubah"
    snaps = t4[1][1:]
    topics = [r for r in t4[2:] if r[0] and not r[0].startswith(("Total", "%", "Jumlah total"))]
    rows = [{"topic": r[0], "values": {s: int(v) for s, v in zip(snaps, r[1:])}} for r in topics]
    summed = {s: sum(r["values"][s] for r in rows) for s in snaps}
    total_row = next(r for r in t4 if r[0] == "Total")
    reported = {s: int(v) for s, v in zip(snaps, total_row[1:])}
    for s in snaps:
        if summed[s] != reported[s]:
            warn(f"Tabel 4: jumlah topik {s} = {summed[s]}, tertulis {reported[s]}")
    garuda_row = next(r for r in t4 if r[0].startswith("Jumlah total artikel"))
    garuda = {s: int(re.sub(r"[^\d]", "", v)) for s, v in zip(snaps, garuda_row[1:])}
    pct_rows = [r for r in t4 if r[0].startswith("% pertumbuhan")]
    pct = lambda r: {s: (int(re.sub(r"[^\d]", "", v)) if re.search(r"\d", v) else None) for s, v in zip(snaps, r[1:])}
    return {
        "edition": EDITION, "title": "Jumlah publikasi riset pertanian organik di Indonesia",
        "unit": "publikasi", "snapshots": snaps,
        "note": "Empat potret waktu: 2015, 2020, 2023, dan 2024.",
        "issues": [8, 9, 10],
        "rows": rows, "totalReported": reported, "totalSummed": summed,
        "garudaTotalApprox": garuda,
        "reportedGrowthPct": {"organik": pct(pct_rows[0]), "garuda": pct(pct_rows[1])},
        "source": f"{SRC}, Bab 11, Tabel 4",
    }


def build_texts(tables: list[list[list[str]]]) -> tuple[dict, dict]:
    pol, com = tables[3], tables[5]
    assert pol[0][0] == "Periode", "tabel kebijakan berubah"
    policy = {"edition": EDITION, "source": f"{SRC}, Bab 10",
              "rows": [{"period": r[0], "stage": r[1], "instrument": r[2], "substance": r[3]} for r in pol[1:]]}
    communities = {"edition": EDITION, "source": f"{SRC}, Bab 12",
                   "rows": [{"name": r[0], "base": r[1], "role": r[2]} for r in com[1:]]}
    return policy, communities


def build_pgs() -> dict:
    s = f"{SRC}, Bab 9"
    return {
        "edition": EDITION, "source": s,
        "mergerNote": "Per 2024, PGS ROLES, PGS Lestari, dan PGS Madu melebur menjadi PGS Nasional Indonesia "
                      "\"Agroforestri dan Hasil Hutan Bukan Kayu\" (Bab 9, paragraf pembuka).",
        "systems": [
            {"id": "pamor", "name": "PAMOR Indonesia", "source": f"{s}.3", "issues": [26],
             "summary": "Sistem penjaminan partisipatif tertua di Indonesia, diinisiasi AOI pada November 2008 dan terdaftar di direktori internasional IFOAM.",
             "figures": [{"key": "petani", "label": "Petani terlibat", "value": 640, "unit": "orang"},
                         {"key": "luas", "label": "Luas lahan", "value": 124.38, "unit": "ha"},
                         {"key": "kabupaten", "label": "Kabupaten", "value": 12, "unit": "kabupaten"},
                         {"key": "unit", "label": "Unit PAMOR", "value": 20, "unit": "unit"},
                         {"key": "calon", "label": "Calon Unit PAMOR", "value": 5, "unit": "unit"}],
             "note": "Daftar calon unit mengacu pada SPOI 2023."},
            {"id": "roles", "name": "PGS Rotan Lestari (ROLES)", "source": f"{SRC}, Bab 9 (paragraf pembuka) dan 9.4", "issues": [25],
             "summary": "Dikembangkan organisasi masyarakat sipil pegiat hasil hutan bukan kayu untuk petani rotan. Pembeli membayar Rp200/kg lebih tinggi untuk rotan basah bersertifikat ROLES.",
             "figures": [{"key": "petani", "label": "Petani rotan", "value": 200, "unit": "orang"}],
             "note": "Jumlah petani rotan sedang diverifikasi."},
            {"id": "pgs-lestari", "name": "PGS Lestari", "source": f"{SRC}, Bab 9 (paragraf pembuka) dan 9.2", "issues": [],
             "summary": "Dijalankan Konsorsium Pangan Bijak, terkonsentrasi di tujuh provinsi dengan tujuh komoditas unggulan.",
             "figures": [{"key": "petani", "label": "Petani", "value": 500, "unit": "orang"}]},
            {"id": "wfl", "name": "White Flower Label (WFL)", "source": f"{s}.1", "issues": [23],
             "summary": "Dikembangkan Komunitas Organik Indonesia (KOI) dengan tiga tingkatan kode: Blank, Yellow, dan Green.",
             "figures": [{"key": "simpul", "label": "Simpul", "value": 10, "unit": "simpul"}],
             "note": "Data sedang diverifikasi."},
        ],
        "totalFarmersReported": {"value": 1340, "unit": "petani dan pelaku usaha", "sum": 640 + 200 + 500},
    }


def build_meta() -> dict:
    return {
        "edition": EDITION,
        "title": "Statistik Pertanian Organik Indonesia 2025",
        "status": "Draf V13, dalam verifikasi",
        "publisher": "Bappenas dan Aliansi Organis Indonesia",
        "published": "2025",
        "dataYears": {"from": 2019, "to": 2024},
        "collectionNote": "Metodologi: pengumpulan dibatasi pada data 2023 dan 2024 dan beberapa 2025. "
                          "Seri 2019-2022 di grafik kemungkinan berasal dari edisi sebelumnya.",
        "externalSource": "SPOI_Data_Analysis_August2026.xlsx (tertaut di grafik, belum tersedia)",
        "sourceFile": DOCX.name,
        "coverage": {"kabupatenKotaTotal": 514, "respondents": 235},
        "issuesDoc": "docs/data-issues-2025.md",
    }


def build_maps(z: zipfile.ZipFile) -> dict:
    """Salin gambar peta dokumen ke src/assets dan tulis maps.json. Hanya gambar, tidak ada angka yang dibaca darinya."""
    MAPS_OUT.mkdir(parents=True, exist_ok=True)
    items = []
    for n, (cid, caption, files) in MAPS.items():
        images = []
        for year, media in files.items():
            name = f"gambar-{n:02d}-{cid}-{year}.png"
            (MAPS_OUT / name).write_bytes(z.read(f"word/media/{media}"))
            images.append({"year": int(year), "file": name})
        items.append({"commodity": cid, "gambar": n, "caption": caption, "metricInImage": "produksi",
                      "unitInImage": "ton", "issues": [31], "images": images})
    national = "gambar-01-nasional-2024.png"
    (MAPS_OUT / national).write_bytes(z.read("word/media/image2.png"))
    return {
        "edition": EDITION,
        "source": f"{SRC}, Bab 3, Gambar 1-16",
        "note": "Gambar statis dari dokumen. Hanya skala warna, tanpa label nilai, jadi tidak dibaca sebagai angka.",
        "national": {"gambar": 1, "title": "Luas lahan pertanian organik di Indonesia tahun 2024", "year": 2024, "file": national},
        "items": items,
    }


def write(name: str, data: dict) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("ditulis", (OUT / name).relative_to(ROOT))


def main() -> None:
    z = zipfile.ZipFile(DOCX)
    charts = read_charts(z)
    if len(charts) != 55:
        sys.exit(f"Diharapkan 55 grafik, ditemukan {len(charts)}")
    tables = read_tables(z)
    if len(tables) != 6:
        sys.exit(f"Diharapkan 6 tabel, ditemukan {len(tables)}")
    write("meta.json", build_meta())
    write("national.json", build_national(charts))
    write("survey.json", build_survey(charts))
    write("coverage.json", build_coverage(tables))
    write("area-by-region.json", build_area_by_region(tables))
    write("research.json", build_research(tables))
    policy, communities = build_texts(tables)
    write("policy.json", policy)
    write("communities.json", communities)
    write("pgs.json", build_pgs())
    write("maps.json", build_maps(z))
    print(f"\nSelesai. {len(WARN)} peringatan validasi.")


if __name__ == "__main__":
    main()
