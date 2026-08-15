#!/bin/bash

# ============================================================
# BehaGym Pro - Linux Derlenmiş (Binary Korumalı) Güncelleyici
# ============================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

clear
echo "======================================================"
echo "          🚀 BEHAGYM PRO SİSTEM GÜNCELLEYİCİ          "
echo "======================================================"
echo ""

echo "📥 [1/2] Güncellenmiş derlenmiş paket indiriliyor..."
git pull origin main

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ HATA: Paket çekme işlemi başarısız oldu!"
  read -p "Kapatmak için Enter tuşuna basın..."
  exit 1
fi

echo ""
echo "🔄 [2/2] Korumalı Arka Yüz Servisi Başlatılıyor..."

# Çalışan eski binary süreci durdur
pkill -f backend-server-linux || true
sleep 1

# Korumalı Derlenmiş Binary dosyasını çalıştır (Kaynak kod içermez)
if [ -f "backend/backend-server-linux" ]; then
  chmod +x backend/backend-server-linux
  nohup ./backend/backend-server-linux > server-log.txt 2>&1 &
elif [ -f "backend-server-linux" ]; then
  chmod +x backend-server-linux
  nohup ./backend-server-linux > server-log.txt 2>&1 &
elif [ -f "backend/src/app.js" ] && command -v node &> /dev/null; then
  cd backend && nohup npm start > ../server-log.txt 2>&1 & cd ..
fi

echo ""
echo "======================================================"
echo "  ✅ BEHAGYM PRO BAŞARIYLA GÜNCELLENDİ VE BAŞLATILDI!  "
echo "======================================================"
echo ""
sleep 3
