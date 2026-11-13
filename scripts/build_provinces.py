#!/usr/bin/env python3
"""Bangun src/data/spoi-2023/provinces.json dari transkripsi manual scripts/manual/provinsi-tabel*.txt
dan validasi terhadap angka nasional (national.json).

Tabel provinsi di PDF berupa gambar beresolusi rendah; OCR otomatis gagal (lihat docs/data-issues.md),
jadi nilai dibaca manual dari render halaman. Kebenaran dijaga lewat tiga pemeriksaan:
  1. 38 provinsi dalam urutan baku, tiap sel terisi atau "." (kosong),
  2. jumlah provinsi vs angka nasional per tahun (selisih dilaporkan, TIDAK dibetulkan),
  3. maks 2022 vs legenda peta (bila ada).

Jalankan: .venv/bin/python scripts/build_provinces.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANUAL = ROOT / "scripts" / "manual"
OUT = ROOT / "src" / "data" / "spoi-2023"
YEARS = ["2019", "2020", "2021", "2022"]
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
UNIT = {"luas": "ha", "produksi": "ton", "produsen": "orang"}
NATIONAL_KEY = {"produsen": "petani"}
NUM = re.compile(r"^\d+(,\d+)?$")
# tabel -> (halaman cetak, nomor tabel)
TABLE_PAGES = {"beras": (68, 2), "kelapa": (69, 3), "pisang": (70, 4), "kopi": (71, 5),
               "jeruk": (72, 6), "teh": (73, 7), "kakao": (74, 8), "aren": (75, 9),
               "rempah": (76, 10), "buah-tropis": (77, 11), "kacang": (78, 12),
               "umbi": (79, 13), "sayuran": (80, 14)}
# legenda maks pada peta sentra 2022 (Gambar 2-14) yang terbaca jelas: komoditas -> (metrik, nilai)
# Selisih jumlah-provinsi vs angka nasional yang sudah dicek ke gambar dan memang begitu di buku
# (bukan salah baca): (komoditas, metrik, tahun) -> nomor butir di docs/data-issues.md
KNOWN_MISMATCH = {("teh", "luas", "2021"): 23, ("teh", "luas", "2022"): 23,
                  ("teh", "produsen", "2021"): 23}
MAP_MAX = {"beras": ("produksi", 25662.631), "kelapa": ("produksi", 5582.978)}


def num(tok: str) -> float | int | None:
    tok = tok.strip()
    if tok == ".":
        return None
    if not NUM.match(tok):
        raise ValueError(f"angka tidak valid: {tok!r}")
    v = float(tok.replace(",", "."))
    return int(v) if v.is_integer() and "," not in tok else v


def parse(path: Path) -> tuple[str, list[str], dict[str, dict[str, list]]]:
    cid, cols = "", []
    rows: dict[str, dict[str, list]] = {}
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if line.startswith("# komoditas:"):
            cid = line.split(":", 1)[1].strip()
        elif line.startswith("# kolom:"):
            cols = [c.strip() for c in line.split(":", 1)[1].split(";")]
        if not line or line.startswith("#"):
            continue
        parts = [p.strip() for p in line.split("|")]
        if len(parts) != 5:
            raise ValueError(f"{path.name}: baris harus 5 bagian: {line}")
        name, per_year = parts[0], parts[1:]
        if name in rows:
            raise ValueError(f"{path.name}: provinsi ganda {name}")
        rows[name] = {}
        for y, cell in zip(YEARS, per_year):
            if cell == "0":
                vals: list = [0] * len(cols)
            elif cell == ".":
                vals = [None] * len(cols)
            else:
                vals = [num(t) for t in cell.split(";")]
            if len(vals) != len(cols):
                raise ValueError(f"{path.name}: {name} {y}: {len(vals)} nilai, seharusnya {len(cols)}")
            rows[name][y] = vals
    return cid, cols, rows


def main() -> int:
    national = json.loads((OUT / "national.json").read_text(encoding="utf-8"))
    nat = {c["id"]: c["metrics"] for c in national["commodities"]}
    tables, problems, known_hits = [], [], []
    for path in sorted(MANUAL.glob("provinsi-tabel*.txt")):
        cid, cols, rows = parse(path)
        if list(rows) != PROVINCES:
            missing = [p for p in PROVINCES if p not in rows]
            raise ValueError(f"{path.name}: urutan/daftar provinsi tidak sesuai; hilang: {missing}")
        hlm, tno = TABLE_PAGES[cid]
        metrics, checks = {}, []
        for ci, metric in enumerate(cols):
            values = {y: {p: rows[p][y][ci] for p in PROVINCES} for y in YEARS}
            metrics[metric] = {"unit": UNIT[metric], "values": values}
            nm = nat.get(cid, {}).get(NATIONAL_KEY.get(metric, metric))
            for y in YEARS:
                total = round(sum(v for v in values[y].values() if v is not None), 3)
                nval = nm["values"][y] if nm else None
                diff = None if nval is None else round(total - nval, 3)
                checks.append({"metrik": metric, "tahun": y, "jumlahProvinsi": total,
                               "nasional": nval, "selisih": diff})
                tol = 0.5 if float(nval or 0).is_integer() else 0.01  # angka nasional bulat = dibulatkan di buku
                known = KNOWN_MISMATCH.get((cid, metric, y))
                if diff is not None and abs(diff) > tol and known:
                    checks[-1]["issues"] = [known]
                    known_hits.append(f"{cid}/{metric}/{y}: jumlah provinsi {total} vs nasional {nval} "
                                      f"(butir {known})")
                elif diff is not None and abs(diff) > tol:
                    problems.append(f"{cid}/{metric}/{y}: jumlah provinsi {total} vs nasional {nval} "
                                    f"(selisih {diff})")
        if cid in MAP_MAX:
            m, expected = MAP_MAX[cid]
            got = max(v for v in metrics[m]["values"]["2022"].values() if v is not None)
            if abs(got - expected) > 0.001:
                problems.append(f"{cid}: maks {m} 2022 = {got}, legenda peta = {expected}")
        tables.append({"id": cid, "tabel": tno,
                       "source": f"SPOI 2023, hlm. {hlm}, Tabel {tno} (transkripsi manual dari gambar)",
                       "metrics": metrics, "checks": checks})
        print(f"{cid}: Tabel {tno}, {len(cols)} metrik, {len(PROVINCES)} provinsi")
    (OUT / "provinces.json").write_text(json.dumps(
        {"edition": "SPOI 2023", "years": [int(y) for y in YEARS], "provinces": PROVINCES,
         "numberConvention": "Koma desimal di sumber; di JSON sudah angka biasa. null = sel kosong di tabel asli.",
         "tables": tables}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    if problems:
        print("\nSELISIH / TEMUAN (belum dibetulkan, perlu dicek ke gambar):")
        for p in problems:
            print(" -", p)
        return 1
    n = sum(len(t["checks"]) for t in tables)
    print(f"validasi: {n - len(known_hits)} dari {n} jumlah provinsi cocok dengan angka nasional")
    for k in known_hits:
        print(" - selisih diketahui:", k)
    return 0


if __name__ == "__main__":
    sys.exit(main())
