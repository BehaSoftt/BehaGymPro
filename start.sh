#!/bin/bash

# ============================================================
# BehaGym Pro - Linux Başlatıcı Scripti
# ============================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

clear
echo "======================================================"
echo "          🚀 BEHAGYM PRO SİSTEM BAŞLATICI           "
echo "======================================================"
echo ""

if [ -f "backend/backend-server-linux" ]; then
  chmod +x backend/backend-server-linux
  ./backend/backend-server-linux
elif [ -f "backend/src/app.js" ] && command -v node &> /dev/null; then
  echo "🚀 Canlı kaynak kod üzerinden başlatılıyor..."
  cd backend && npm start
else
  echo "❌ Başlatılacak backend servisi bulunamadı."
fi
