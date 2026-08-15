#!/bin/bash

# ============================================================
# BehaGym Pro - Linux Tek Tık Otomatik Güncelleme Scripti
# ============================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

clear
echo "======================================================"
echo "          🚀 BEHAGYM PRO SİSTEM GÜNCELLEYİCİ          "
echo "======================================================"
echo ""

echo "📥 [1/3] En son kodlar Git'ten çekiliyor..."
git pull origin main

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ HATA: Git çekme işlemi başarısız oldu!"
  echo "Lütfen internet bağlantınızı kontrol edip tekrar deneyin."
  read -p "Kapatmak için Enter tuşuna basın..."
  exit 1
fi

echo ""
echo "⚙️ [2/3] Ön yüz (Frontend) derleniyor..."
if [ -d "frontend" ]; then
  cd frontend
  npm run build
  cd ..
fi

echo ""
echo "🔄 [3/3] Arka yüz servisi ve Veritabanı güncelleniyor..."
if command -v pm2 &> /dev/null && pm2 list | grep -q "behagym"; then
  pm2 restart behagym
elif systemctl is-active --quiet behagym; then
  sudo systemctl restart behagym
else
  pkill -f backend-server-linux || pkill -f "node src/app.js" || true
  sleep 1
  if [ -f "backend/backend-server-linux" ]; then
    chmod +x backend/backend-server-linux
    nohup ./backend/backend-server-linux > server-log.txt 2>&1 &
  else
    cd backend && nohup npm start > ../server-log.txt 2>&1 & cd ..
  fi
fi

echo ""
echo "======================================================"
echo "  ✅ BEHAGYM PRO BAŞARIYLA GÜNCELLENDİ VE BAŞLATILDI!  "
echo "======================================================"
echo ""
sleep 3
