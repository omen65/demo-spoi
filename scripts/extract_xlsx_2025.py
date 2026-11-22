#!/usr/bin/env python3
"""Normalisasi Excel AOI (rekap per provinsi SPOI 2025) ke JSON di src/data/spoi-2025/.

Keluaran:
  provinces-2025.json          luas, produsen (laki-laki/perempuan/total), sertifikasi per provinsi, 2023-2024
  commodity-provinces.json     luas, produksi, produsen per komoditas x provinsi x tahun, 2019-2024

Aturan (keputusan Feri dan jawaban AOI, 2026-11-22):
  - Nilai 0 atau sel kosong = tidak ada data organik -> disimpan null, bukan 0.
  - Angka tidak dibetulkan. Selisih dicetak sebagai laporan validasi.
  - Mete dan Minyak Atsiri hanya 2023-2024 (menggantikan Pisang dan Jeruk). 2019-2022 di sheetnya tidak dipakai.
  - Kelapa dua komoditas (Gula, Dehusked).
  - Produk Olahan dan Pemasar: operator 2019-2024, luas 2019-2022, produksi 2019-2024.
  - Luas Lahan dan Produser: total luas dan produsen per provinsi 2019-2024 (luas 2023-2024 memakai kolom "(real)").
  - Sheet Horti: luas dan produsen berupa total gabungan; produksi per kategori. Sayur+buah+biofarmaka dan Palawija
    hanya ada 2023-2024; Kacang (Nuts) dan Umbi (Roots) 2019-2024.

Catatan: 2019 dibaca dan divalidasi tetapi tidak ditulis ke keluaran (arahan AOI: tren mulai 2020).

Jalankan: .venv/bin/python scripts/extract_xlsx_2025.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
XLSX = ROOT / "source" / "spoi-2025-rekap-provinsi.xlsx"
OUT = ROOT / "src" / "data" / "spoi-2025"
N23 = ROOT / "src" / "data" / "spoi-2023" / "national.json"
EDITION = "SPOI 2025 (data AOI, progres)"
FILE_LABEL = "Rekap Per Provinsi SPOI 2025 (Excel AOI)"
YEARS = [2019, 2020, 2021, 2022, 2023, 2024]
PROVINCES = [
    "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Jambi", "Sumatera Selatan",
    "Bengkulu", "Lampung", "Bangka Belitung", "Kepulauan Riau", "DKI Jakarta",
    "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Banten", "Bali",
    "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Barat", "Kalimantan Tengah",
    "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara", "Sulawesi Utara",
    "Sulawesi Tengah", "Sulawesi Selatan", "Sulawesi Tenggara", "Gorontalo",
    "Sulawesi Barat", "Maluku", "Maluku Utara", "Papua", "Papua Barat", "Papua Selatan",
    "Papua Tengah", "Papua Pegunungan", "Papua Barat Daya",
]
ALIAS = {"Daerah Istimewa Yogyakarta": "DI Yogyakarta"}
# id, nama tampilan, sheet, id di SPOI 2023 untuk cek silang 2019-2022, tahun pertama yang dipakai
COMMODITIES = [
    ("beras", "Beras", "Beras", "beras", 2019),
    ("kelapa-gula", "Kelapa (Gula)", "Coconut (Gula)", None, 2019),
    ("kelapa-dehusked", "Kelapa (Dehusked)", "Coconut (Dehusked)", "kelapa", 2019),
    ("aren", "Aren", "Arenga", "aren", 2019),
    ("kopi", "Kopi", "Coffee", "kopi", 2019),
    ("minyak-atsiri", "Minyak Atsiri", "Essential Oil", None, 2023),
    ("teh", "Teh", "Tea", "teh", 2019),
    ("kakao", "Kakao", "Cacao", "kakao", 2019),
    ("rempah", "Rempah", "Spices", "rempah", 2019),
    ("buah-tropis", "Buah Tropis", "Tropical Fruits", "buah-tropis", 2019),
    ("mete", "Mete", "Mete", None, 2023),
]
# Sheet Horti: kolom per tahun. Luas dan produsen satu kolom gabungan; produksi per kategori.
# Sheet produk olahan dan pemasar: operator (2019-2024), luas (2019-2022), produksi (2019-2024); baris jumlah tanpa label di baris 43
PROCESSED = [
    ("produk-olahan", "Produk Olahan", "Produk Olahan", "olahan"),
    ("pemasar", "Pemasar", "Pemasar", "pasar"),
]
PROC_OPERATOR = {y: c for y, c in zip(range(2019, 2025), "CDEFGH")}
PROC_LUAS = {y: c for y, c in zip(range(2019, 2023), "IJKL")}
PROC_PRODUKSI = {y: c for y, c in zip(range(2019, 2025), "MNOPQR")}
# Sheet total nasional per provinsi 2019-2024 (luas dan produsen)
TOTALS_SHEET = "Luas Lahan dan Produser"
HORTI_SHEET = "Horti"
HORTI_LUAS = {2019: "C", 2020: "I", 2021: "O", 2022: "U", 2023: "AA", 2024: "AG"}
HORTI_PRODUSEN = {2019: "H", 2020: "N", 2021: "T", 2022: "Z", 2023: "AF", 2024: "AL"}
HORTI_PRODUKSI = {
    "sayur-buah-biofarmaka": ("Sayur, Buah, dan Biofarmaka", {2023: "AB", 2024: "AH"}, None),
    "palawija": ("Palawija", {2023: "AC", 2024: "AI"}, None),
    "kacang": ("Kacang", {2019: "D", 2020: "J", 2021: "P", 2022: "V", 2023: "AD", 2024: "AJ"}, "kacang"),
    "umbi": ("Umbi", {2019: "E", 2020: "K", 2021: "Q", 2022: "W", 2023: "AE", 2024: "AK"}, "umbi"),
}
METRICS = [("luas", "ha", "Luas (ha)"), ("produksi", "ton", "Production (Ton)"), ("produsen", "orang", "Producers")]
report: list[str] = []


def province(raw: object) -> str | None:
    if not isinstance(raw, str):
        return None
    name = ALIAS.get(raw.strip(), raw.strip())
    return name if name in PROVINCES else None


def val(x: object) -> float | None:
    """0, kosong, atau bukan angka -> None (tidak ada yang melapor)."""
    if isinstance(x, (int, float)) and not isinstance(x, bool) and x != 0:
        return round(float(x), 4)
    return None


def clean(v: float | None) -> float | int | None:
    return None if v is None else (int(v) if float(v).is_integer() else v)


def sum_(vals: list[float | None]) -> float | None:
    got = [v for v in vals if v is not None]
    return round(sum(got), 4) if got else None


def build_commodities(wb: openpyxl.Workbook) -> list[dict]:
    n23 = {c["id"]: c for c in json.loads(N23.read_text())["commodities"]}
    out = []
    for cid, name, sheet, id23, first in COMMODITIES:
        ws = wb[sheet]
        rows: dict[str, tuple] = {}
        total_row = None
        for r in ws.iter_rows(min_row=4):
            label = r[1].value
            if isinstance(label, str) and label.strip().lower() == "total":
                total_row = r
            elif (p := province(label)):
                if p in rows:
                    report.append(f"[{cid}] baris ganda untuk {p}")
                rows[p] = r
        missing = set(PROVINCES) - set(rows)
        if missing:
            report.append(f"[{cid}] provinsi tidak ada di sheet: {sorted(missing)}")
        series: dict[str, dict[str, dict[str, float | int | None]]] = {m: {} for m, _, _ in METRICS}
        for p in PROVINCES:
            for mi, (m, _, _) in enumerate(METRICS):
                series[m][p] = {
                    str(y): clean(val(rows[p][2 + 3 * yi + mi].value)) if p in rows and y >= first else None
                    for yi, y in enumerate(YEARS)
                }
        metrics = {}
        for mi, (m, unit, _) in enumerate(METRICS):
            national = {}
            for yi, y in enumerate(YEARS):
                total = clean(sum_([series[m][p][str(y)] for p in PROVINCES]))
                national[str(y)] = total
                if total_row is not None and y >= first:
                    sheet_total = val(total_row[2 + 3 * yi + mi].value)
                    if sheet_total is not None and total is not None and abs(sheet_total - total) > 0.5:
                        report.append(f"[{cid}] {m} {y}: baris Total sheet {sheet_total:g} != jumlah provinsi {total:g}")
                if id23 and y <= 2022:
                    key = {"produsen": "petani"}.get(m, m)
                    old = n23.get(id23, {}).get("metrics", {}).get(key, {}).get("values", {}).get(str(y))
                    if old is not None and total is not None and abs(old - total) > 0.5:
                        report.append(f"[{cid}] {m} {y}: SPOI 2023 = {old:g}, Excel = {total:g}")
            metrics[m] = {
                "unit": unit,
                "national": national,
                "byProvince": series[m],
                "source": f"{FILE_LABEL}, sheet '{sheet}', kolom {METRICS[mi][2]}",
            }
        out.append({"id": cid, "name": name, "sheet": sheet, "hasSheetTotal": total_row is not None, "metrics": metrics})
    return out


def build_horti(wb: openpyxl.Workbook) -> list[dict]:
    from openpyxl.utils import column_index_from_string as ci

    n23 = {c["id"]: c for c in json.loads(N23.read_text())["commodities"]}
    ws = wb[HORTI_SHEET]
    rows: dict[str, tuple] = {}
    total_row = None
    for r in ws.iter_rows(min_row=6):
        p = province(r[1].value)
        if p:
            rows[p] = r
        elif r[1].value is None and isinstance(r[2].value, (int, float)):
            total_row = r  # baris jumlah tanpa label
    missing = set(PROVINCES) - set(rows)
    if missing:
        report.append(f"[horti] provinsi tidak ada di sheet: {sorted(missing)}")

    def package(cid: str, name: str, cols: dict[str, dict[int, str]], id23: str | None) -> dict:
        metrics = {}
        for m, unit, _ in METRICS:
            byprov: dict[str, dict[str, float | int | None]] = {p: {} for p in PROVINCES}
            national: dict[str, float | int | None] = {}
            for y in YEARS:
                col = cols.get(m, {}).get(y)
                for p in PROVINCES:
                    byprov[p][str(y)] = clean(val(rows[p][ci(col) - 1].value)) if col and p in rows else None
                total = clean(sum_([byprov[p][str(y)] for p in PROVINCES]))
                national[str(y)] = total
                if col and total_row is not None:
                    t = val(total_row[ci(col) - 1].value)
                    if t is not None and total is not None and abs(t - total) > 0.5:
                        report.append(f"[{cid}] {m} {y}: baris jumlah sheet {t:g} != jumlah provinsi {total:g}")
                if id23 and col and y <= 2022:
                    key = {"produsen": "petani"}.get(m, m)
                    old = n23.get(id23, {}).get("metrics", {}).get(key, {}).get("values", {}).get(str(y))
                    if old is not None and total is not None and abs(old - total) > 0.5:
                        report.append(f"[{cid}] {m} {y}: SPOI 2023 = {old:g}, Excel = {total:g}")
            metrics[m] = {"unit": unit, "national": national, "byProvince": byprov,
                          "source": f"{FILE_LABEL}, sheet '{HORTI_SHEET}', kolom {METRICS[[k for k, _, _ in METRICS].index(m)][2]}"}
        return {"id": cid, "name": name, "sheet": HORTI_SHEET, "hasSheetTotal": total_row is not None, "metrics": metrics}

    out = []
    for cid, (name, produksi_cols, id23) in HORTI_PRODUKSI.items():
        out.append(package(cid, name, {"produksi": produksi_cols}, id23))
    out.append(package("hortikultura", "Hortikultura (gabungan)", {"luas": HORTI_LUAS, "produsen": HORTI_PRODUSEN}, None))
    return out


def build_processed(wb: openpyxl.Workbook) -> list[dict]:
    from openpyxl.utils import column_index_from_string as ci

    n23 = {c["id"]: c for c in json.loads(N23.read_text())["commodities"]}
    out = []
    for cid, name, sheet, id23 in PROCESSED:
        ws = wb[sheet]
        rows: dict[str, tuple] = {}
        total_row = None
        for r in ws.iter_rows(min_row=5):
            p = province(r[1].value)
            if p:
                rows[p] = r
            elif r[1].value is None and isinstance(r[2].value, (int, float)):
                total_row = r
        missing = set(PROVINCES) - set(rows)
        if missing:
            report.append(f"[{cid}] provinsi tidak ada di sheet: {sorted(missing)}")
        cols = {"luas": PROC_LUAS, "produksi": PROC_PRODUKSI, "produsen": PROC_OPERATOR}
        metrics = {}
        for m, unit, header in METRICS:
            unit = "operator" if m == "produsen" else unit
            byprov: dict[str, dict[str, float | int | None]] = {p: {} for p in PROVINCES}
            national: dict[str, float | int | None] = {}
            for y in YEARS:
                col = cols[m].get(y)
                for p in PROVINCES:
                    byprov[p][str(y)] = clean(val(rows[p][ci(col) - 1].value)) if col and p in rows else None
                total = clean(sum_([byprov[p][str(y)] for p in PROVINCES]))
                national[str(y)] = total
                if col and total_row is not None:
                    t = val(total_row[ci(col) - 1].value)
                    if t is not None and total is not None and abs(t - total) > 0.5:
                        report.append(f"[{cid}] {m} {y}: baris jumlah sheet {t:g} != jumlah provinsi {total:g}")
                if col and y <= 2022:
                    key = {"produsen": "operator"}.get(m, m)
                    old = n23.get(id23, {}).get("metrics", {}).get(key, {}).get("values", {}).get(str(y))
                    if old is not None and total is not None and abs(old - total) > 0.5:
                        report.append(f"[{cid}] {m} {y}: SPOI 2023 = {old:g}, Excel = {total:g}")
            metrics[m] = {"unit": unit, "national": national, "byProvince": byprov,
                          "source": f"{FILE_LABEL}, sheet '{sheet}', kolom {header if m != 'produsen' else 'Operator'}"}
        out.append({"id": cid, "name": name, "sheet": sheet, "hasSheetTotal": total_row is not None, "metrics": metrics})
    return out


def build_totals_series(wb: openpyxl.Workbook, rows: list[dict], nat: dict) -> dict:
    """Deret luas dan produsen 2019-2024 per provinsi dari sheet "Luas Lahan dan Produser".

    Luas 2023 dan 2024 punya dua kolom di sheet: "(real)" dan tanpa keterangan. Yang dipakai adalah "(real)"
    karena sama dengan sheet total 2023-2024 (90.755,13 dan 91.765,65 ha). Kolom lain disimpan sebagai
    `luasAlt` untuk dikonfirmasi ke AOI. Produsen 2023-2024 memakai kolom Total.
    """
    ws = wb[TOTALS_SHEET]
    luas_cols = {2019: "C", 2020: "D", 2021: "E", 2022: "F", 2023: "G", 2024: "I"}
    alt_cols = {2019: "C", 2020: "D", 2021: "E", 2022: "F", 2023: "H", 2024: "J"}
    prod_cols = {2019: "K", 2020: "L", 2021: "M", 2022: "N", 2023: "Q", 2024: "T"}
    from openpyxl.utils import column_index_from_string as ci

    data: dict[str, tuple] = {}
    total_row = None
    for r in ws.iter_rows(min_row=5):
        p = province(r[1].value)
        if p:
            data[p] = r
        elif r[1].value is None and isinstance(r[2].value, (int, float)):
            total_row = r
    missing = set(PROVINCES) - set(data)
    if missing:
        report.append(f"[total] provinsi tidak ada di sheet: {sorted(missing)}")

    def cell(p: str, cols: dict[int, str], y: int) -> float | int | None:
        return clean(val(data[p][ci(cols[y]) - 1].value)) if p in data else None

    by_prov: dict[str, dict] = {}
    for p in PROVINCES:
        by_prov[p] = {
            "luas": {str(y): cell(p, luas_cols, y) for y in YEARS},
            "luasAlt": {str(y): cell(p, alt_cols, y) for y in YEARS},
            "produsen": {str(y): cell(p, prod_cols, y) for y in YEARS},
        }
    national = {"luas": {}, "luasAlt": {}, "produsen": {}}
    for key, cols in (("luas", luas_cols), ("luasAlt", alt_cols), ("produsen", prod_cols)):
        for y in YEARS:
            tot = clean(sum_([by_prov[p][key][str(y)] for p in PROVINCES]))
            national[key][str(y)] = tot
            if total_row is not None:
                t = val(total_row[ci(cols[y]) - 1].value)
                if t is not None and tot is not None and abs(t - tot) > 0.5:
                    report.append(f"[total] {key} {y}: baris Total sheet {t:g} != jumlah provinsi {tot:g}")
    # cek silang dengan sheet total 2023-2024 dan gender
    for y in ("2023", "2024"):
        if national["luas"][y] != nat[y]["luas"]:
            report.append(f"[total] luas {y} (real) {national['luas'][y]} != sheet 'Luas Lahan dan Jumlah Producer' {nat[y]['luas']}")
        if national["produsen"][y] != nat[y]["total"]:
            report.append(f"[total] produsen {y} {national['produsen'][y]} != sheet 'Luas Lahan dan Jumlah Producer' {nat[y]['total']}")
    return {"byProvince": by_prov, "national": national}


def build_provinces(wb: openpyxl.Workbook) -> dict:
    a = wb["Luas Lahan dan Jumlah Producer"]
    b = wb["Luas lahan organic berdasarkan "]
    rows = []
    for r in range(2, 40):
        p = province(a.cell(r, 1).value)
        assert p == province(b.cell(r, 1).value), f"urutan beda di baris {r}"
        g = lambda ws, c: val(ws.cell(r, c).value)
        m23, f23, t23 = g(a, 4), g(a, 5), g(a, 6)
        m24, f24, t24 = g(a, 7), g(a, 8), g(a, 9)
        for yr, m, f, t in (("2023", m23, f23, t23), ("2024", m24, f24, t24)):
            if (t or 0) != ((m or 0) + (f or 0)):
                report.append(f"[provinsi] {p} {yr}: laki-laki + perempuan != total")
        rows.append({
            "name": p,
            "luas": {"2023": clean(g(a, 2)), "2024": clean(g(a, 3))},
            "produsen": {
                "2023": {"lakiLaki": clean(m23), "perempuan": clean(f23), "total": clean(t23)},
                "2024": {"lakiLaki": clean(m24), "perempuan": clean(f24), "total": clean(t24)},
            },
            "sertifikasi2024": {"konversi": clean(g(b, 5)), "pgs": clean(g(b, 6)), "selfDeclare": clean(g(b, 7))},
        })
    assert [r["name"] for r in rows] == PROVINCES, "urutan provinsi tidak sesuai"
    nat = {}
    for yr in ("2023", "2024"):
        nat[yr] = {
            "luas": clean(sum_([r["luas"][yr] for r in rows])),
            "lakiLaki": clean(sum_([r["produsen"][yr]["lakiLaki"] for r in rows])),
            "perempuan": clean(sum_([r["produsen"][yr]["perempuan"] for r in rows])),
            "total": clean(sum_([r["produsen"][yr]["total"] for r in rows])),
        }
    # cek silang dengan baris Total sheet
    for yr, col in (("2023", 2), ("2024", 3)):
        t = val(a.cell(40, col).value)
        if t is not None and abs(t - nat[yr]["luas"]) > 0.5:
            report.append(f"[provinsi] luas {yr}: baris Total {t:g} != jumlah provinsi {nat[yr]['luas']:g}")
    for r in rows:
        if r["produsen"]["2023"]["perempuan"] and r["produsen"]["2023"]["lakiLaki"] and \
                r["produsen"]["2023"]["perempuan"] > r["produsen"]["2023"]["lakiLaki"]:
            report.append(f"[provinsi] {r['name']} 2023: perempuan ({r['produsen']['2023']['perempuan']}) > laki-laki ({r['produsen']['2023']['lakiLaki']})")
    series = build_totals_series(wb, rows, nat)
    for r in rows:
        r["luasSeries"] = series["byProvince"][r["name"]]["luas"]
        r["produsenSeries"] = series["byProvince"][r["name"]]["produsen"]
    return {
        "edition": EDITION,
        "years": [2023, 2024],
        "note": "Nilai null = tidak ada yang melapor (0 atau kosong di Excel). Sertifikasi hanya mencakup sebagian luas; sisanya tanpa keterangan jenis.",
        "sources": {
            "luas": f"{FILE_LABEL}, sheet 'Luas Lahan dan Jumlah Producer'",
            "produsen": f"{FILE_LABEL}, sheet 'Luas Lahan dan Jumlah Producer'",
            "sertifikasi2024": f"{FILE_LABEL}, sheet 'Luas lahan organic berdasarkan'",
        },
        "national": nat,
        "nationalSeries": series["national"],
        "provinces": rows,
    }


def strip_year(node: object, year: str = "2019") -> object:
    """Buang tahun yang tidak dipakai dashboard (AOI: data 2019 tidak dimasukkan) dari seluruh keluaran."""
    if isinstance(node, dict):
        return {k: strip_year(v, year) for k, v in node.items() if k != year}
    if isinstance(node, list):
        return [strip_year(v, year) for v in node]
    return node


def main() -> int:
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    prov = build_provinces(wb)
    com = build_commodities(wb) + build_horti(wb) + build_processed(wb)
    OUT.mkdir(parents=True, exist_ok=True)
    prov = strip_year(prov)  # type: ignore[assignment]
    (OUT / "provinces-2025.json").write_text(json.dumps(prov, ensure_ascii=False, indent=1) + "\n")
    (OUT / "commodity-provinces.json").write_text(json.dumps({
        "edition": EDITION, "years": [y for y in YEARS if y != 2019],
        "note": "Nilai null = tidak ada yang melapor. 2019-2022 identik dengan SPOI 2023 kecuali yang tercantum di laporan validasi.",
        "commodities": strip_year(com)}, ensure_ascii=False, indent=1) + "\n")
    print(f"Ditulis: {OUT/'provinces-2025.json'}, {OUT/'commodity-provinces.json'}")
    print(f"Laporan validasi ({len(report)}):")
    for line in report:
        print(" -", line)
    return 0


if __name__ == "__main__":
    sys.exit(main())
