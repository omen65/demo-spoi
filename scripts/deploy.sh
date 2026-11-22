#!/usr/bin/env bash
# Build lalu kirim hasilnya (dist/) ke server dengan rsync.
#
# Pemakaian:
#   scripts/deploy.sh             build, lalu upload
#   scripts/deploy.sh --dry-run   build, lalu tampilkan apa yang AKAN berubah di server (tanpa mengunggah)
#   scripts/deploy.sh --no-build  upload dist/ yang sudah ada tanpa build ulang
#
# Tujuan server dibaca dari berkas .deploy.local di root project (tidak ikut Git), contoh isinya:
#   DEPLOY_TARGET="user@1.2.3.4:/var/www/spoi/"
# atau dari variabel lingkungan DEPLOY_TARGET. Lihat scripts/deploy.example.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DRY_RUN=""
BUILD=1
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN="--dry-run" ;;
    --no-build) BUILD=0 ;;
    -h|--help) sed -n '2,12p' "$0"; exit 0 ;;
    *) echo "Opsi tidak dikenal: $arg" >&2; exit 1 ;;
  esac
done

if [[ -z "${DEPLOY_TARGET:-}" && -f .deploy.local ]]; then
  # shellcheck disable=SC1091
  source .deploy.local
fi
if [[ -z "${DEPLOY_TARGET:-}" ]]; then
  echo "DEPLOY_TARGET belum diatur. Buat .deploy.local (lihat scripts/deploy.example)." >&2
  exit 1
fi
# Tujuan harus berakhir dengan "/" supaya yang disalin isi dist/, bukan foldernya
[[ "$DEPLOY_TARGET" == */ ]] || DEPLOY_TARGET="$DEPLOY_TARGET/"

if [[ "$BUILD" -eq 1 ]]; then
  echo "==> Build (type-check + vite build)"
  npm run build
fi

if [[ ! -f dist/index.html ]]; then
  echo "dist/index.html tidak ada. Jalankan build dulu." >&2
  exit 1
fi

echo "==> Upload dist/ ke $DEPLOY_TARGET ${DRY_RUN:+(dry-run)}"
# --delete menghapus file lama di server yang sudah tidak ada di dist/ (nama file di assets/ berubah tiap build)
rsync -avz --delete $DRY_RUN dist/ "$DEPLOY_TARGET"

if [[ -n "$DRY_RUN" ]]; then
  echo "==> Dry-run selesai. Tidak ada yang diunggah."
else
  echo "==> Selesai. Buka situsnya lalu tekan Cmd+Shift+R supaya versi baru yang tampil."
fi
