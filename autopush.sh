#!/bin/bash
cd /var/www/html

# Tambah semua perubahan
git add .

# Cek apakah ada perubahan
if ! git diff --cached --quiet; then
    git commit -m "Auto commit $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin main
    echo "Auto-push berhasil pada $(date)" >> /var/www/html/autopush.log
else
    echo "Tidak ada perubahan pada $(date)" >> /var/www/html/autopush.log
fi
