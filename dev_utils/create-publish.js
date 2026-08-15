#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

// Tarih formatı: BehaGymPro-2025-02-25-14-30
const now = new Date();
const dateStr = now.toISOString().slice(0, 10); // 2025-02-25
const timeStr = now.toTimeString().slice(0, 5).replace(':', '-'); // 14-30
const buildName = `BehaGymPro-${dateStr}-${timeStr}`;
const publishDir = path.join(rootDir, 'publish', buildName);

console.log(`📦 Build Adı: ${buildName}\n`);

// Publish klasörünü temizle ve oluştur
if (fs.existsSync(publishDir)) {
  console.log('🗑️  Eski build temizleniyor...');
  fs.removeSync(publishDir);
}
fs.ensureDirSync(publishDir);

// 1. Frontend Build
console.log('⚙️  Frontend build ediliyor...');
try {
  execSync(`${npmCmd} run build`, {
    cwd: path.join(rootDir, 'frontend'),
    stdio: 'inherit',
    shell: true
  });
  console.log('✅ Frontend build tamamlandı\n');
} catch (error) {
  console.error('❌ Frontend build hatası:', error.message);
  process.exit(1);
}

// 2. Backend'i EXE'ye Dönüştür (PKG)
console.log('🏗️  Backend EXE dosyasına dönüştürülüyor (Kaynak kodlar gizleniyor)...');
const backendDest = path.join(publishDir, 'backend');
fs.ensureDirSync(backendDest);

try {
  // PKG ile backend'i paketle
  // -t (target): node18-win-x64 ve node18-linux-x64
  // --out-path: Çıktı klasörü
  console.log('🖥️  Windows sürümü oluşturuluyor...');
  execSync(`${npxCmd} pkg backend/src/app.js --targets node18-win-x64 --output "` + path.join(backendDest, 'backend-server.exe') + `"`, {
    stdio: 'inherit',
    shell: true
  });

  console.log('🐧 Linux sürümü oluşturuluyor...');
  execSync(`${npxCmd} pkg backend/src/app.js --targets node18-linux-x64 --output "` + path.join(backendDest, 'backend-server-linux') + `"`, {
    stdio: 'inherit',
    shell: true
  });

  console.log('✅ Backend EXE ve Linux Binary başarıyla oluşturuldu\n');
} catch (error) {
  console.error('❌ Backend paketleme hatası:', error.message);
  process.exit(1);
}

// Backend için sadece gerekli config dosyalarını kopyala (.env vb.)
const backendFiles = [
  '.env',
  'package.json',
  'uploads' // Resimlerin ve yüklenen dosyaların taşınması için
];

// Backend için dosyaları kopyala ve .env dosyasını temizle
backendFiles.forEach(file => {
  const src = path.join(rootDir, 'backend', file);
  const dest = path.join(backendDest, file);

  if (fs.existsSync(src)) {
    if (file === '.env') {
      const content = fs.readFileSync(src, 'utf8');
      fs.writeFileSync(dest, content);
      console.log('✅ .env dosyası hazırlandı.');
    } else {
      fs.copySync(src, dest);
    }
  }
});

// Göç (Migration) dosyaları için özel durum: 
// Veritabanı tablolarını oluşturmak için gereken scriptleri de EXE içine dahil ettik
// Ancak manuel çalıştırmak isterseniz diye migration klasörünü kopyalayabiliriz 
// veya ana uygulama açılırken bunu otomatik yapabilir.

console.log('✅ Gerekli konfigürasyonlar kopyalandı\n');

// 3. Frontend dist'i kopyala
console.log('📁 Frontend build kopyalanıyor...');
fs.copySync(
  path.join(rootDir, 'frontend', 'dist'),
  path.join(publishDir, 'frontend', 'dist')
);
console.log('✅ Frontend build kopyalandı\n');

// 4. Root dosyaları kopyala
console.log('📁 Dokümantasyon kopyalanıyor...');
const rootFiles = [
  'KIOSK_MODE_KULLANIM.md',
  'EMAIL_BRANCH_FIX.md',
  'CROSS_BRANCH_ACCESS.md',
  'MULTI_BRANCH_CHECKLIST.md',
  'SEED_STRATEGY.md',
  'SUPER_MASTER_FIX.md'
];

rootFiles.forEach(file => {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copySync(src, path.join(publishDir, file));
  }
});

// 5. Otomatik kurulum scriptleri oluştur
// PKG kullanıldığında npm install gerekmez (node_modules gömülüdür)
const installScript = `@echo off
net session >nul 2>&1
if %errorLevel% == 0 ( goto :admin ) else ( powershell -Command "Start-Process '%~f0' -Verb RunAs" & exit /b )

:admin
echo ========================================
echo BehaGym Pro - Hizli Kurulum
echo ========================================
echo.
echo [1/1] Guvenlik Duvari kurallari ekleniyor...
netsh advfirewall firewall delete rule name="BehaGym Pro" >nul 2>&1
netsh advfirewall firewall add rule name="BehaGym Pro" dir=in action=allow protocol=TCP localport=5000 >nul 2>&1
echo.
echo [2/2] .env dosyasi kontrol ediliyor...
if not exist "%~dp0backend\\.env" (
    echo UYARI: .env dosyasi eksik! Varsayilan olusturuluyor...
    echo PORT=5000 > "%~dp0backend\\.env"
    echo NODE_ENV=production >> "%~dp0backend\\.env"
)
echo.
echo ========================================
echo Kurulum tamamlandi!
echo ========================================
pause
`;

const startScript = `@echo off
cd /d "%~dp0"
echo ========================================
echo BehaGym Pro - Sistem Baslatma
echo ========================================
echo.
echo [1/1] Uygulama arka planda baslatiliyor...
wscript.exe "%~dp0hidden_launcher.vbs"
timeout /t 3 >nul

echo.
echo [BASARILI] Sistem aktif!
echo Adres: http://localhost:5000
echo Loglar: server-log.txt
echo.
timeout /t 5 >nul
exit
`;

const stopScript = `@echo off
setlocal
echo ========================================
echo BehaGym Pro - Sistem Tamamen Durduruluyor
echo ========================================
echo.

echo 1. BehaGymPro ile ilgili tum surecler tespit ediliyor...
:: Pattern matching for anything containing BehaGym or backend-server
powershell -Command "Get-CimInstance Win32_Process | Where-Object { ($_.CommandLine -like '*BehaGym*' -or $_.Name -eq 'backend-server.exe') -and $_.Name -ne 'powershell.exe' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }" >nul 2>&1

echo 2. Port 5000 uzerindeki kalintilar temizleniyor...
powershell -Command "Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

echo 3. Standart servisler ve pencereler temizleniyor...
taskkill /IM backend-server.exe /F >nul 2>&1
:: Kill any cmd.exe that might be hosting the QR or build process
taskkill /FI "WINDOWTITLE eq BehaGym Pro*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Select BehaGym Pro*" /F >nul 2>&1

echo.
echo [BAŞARILI] Tüm BehaGym pencereleri ve servisleri kapatildi.
echo.
timeout /t 2 >nul
exit
`;

fs.writeFileSync(path.join(publishDir, 'install.bat'), installScript);
fs.writeFileSync(path.join(publishDir, 'start.bat'), startScript);
fs.writeFileSync(path.join(publishDir, 'stop.bat'), stopScript);

// Hidden Launcher VBS (Penceresiz arka plan çalısma için)
const hiddenLauncherVbs = `CreateObject("Wscript.Shell").Run "back-start.bat", 0, False`;
const backStartBat = `@echo off
cd /d "%~dp0"
echo --- BASLATMA: %date% %time% --- >> server-log.txt
backend\\backend-server.exe >> server-log.txt 2>&1`;

fs.writeFileSync(path.join(publishDir, 'hidden_launcher.vbs'), hiddenLauncherVbs);
fs.writeFileSync(path.join(publishDir, 'back-start.bat'), backStartBat);

// Silent start script (arka planda çalışır) - VBS üzerinden tetiklenir
const startSilentScriptImproved = `@echo off
cd /d "%~dp0"
echo BehaGym Pro arka planda baslatiliyor...
wscript.exe "%~dp0hidden_launcher.vbs"
timeout /t 2 >nul
echo [BASARILI] Sistem arka planda calisiyor.
echo Durdurmak icin stop.bat kullanin.
timeout /t 3 >nul
exit
`;

fs.writeFileSync(path.join(publishDir, 'start-silent.bat'), startSilentScriptImproved);

// Linux için Start Scripti (Konsol)
const startLinuxScript = `#!/bin/bash
DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"
echo "========================================"
echo "BehaGym Pro - Linux Başlatıcı"
echo "========================================"
chmod +x backend/backend-server-linux
./backend/backend-server-linux
`;

fs.writeFileSync(path.join(publishDir, 'start.sh'), startLinuxScript);
execSync(`chmod +x "` + path.join(publishDir, 'start.sh') + `"`, { stdio: 'ignore' });

// Linux için Arka Plan Start Scripti (Daemon / Background)
const startBgLinuxScript = `#!/bin/bash
DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"
echo "========================================"
echo "BehaGym Pro - Linux Arka Plan Başlatıcı"
echo "========================================"
chmod +x backend/backend-server-linux
nohup ./backend/backend-server-linux > server-log.txt 2>&1 &
echo "[BAŞARILI] BehaGym Pro arka planda başlatıldı."
echo "Erişim Adresi: http://localhost:5000"
echo "Log takibi: tail -f server-log.txt"
echo "Durdurmak için: ./stop.sh"
`;

fs.writeFileSync(path.join(publishDir, 'start-bg.sh'), startBgLinuxScript);
execSync(`chmod +x "` + path.join(publishDir, 'start-bg.sh') + `"`, { stdio: 'ignore' });

// Linux için Stop Scripti
const stopLinuxScript = `#!/bin/bash
echo "========================================"
echo "BehaGym Pro - Sistem Durduruluyor"
echo "========================================"
pkill -f backend-server-linux
echo "[BAŞARILI] Tüm BehaGym servisleri kapatıldı."
`;

fs.writeFileSync(path.join(publishDir, 'stop.sh'), stopLinuxScript);
execSync(`chmod +x "` + path.join(publishDir, 'stop.sh') + `"`, { stdio: 'ignore' });

// Linux için Tek Tık Güncelleme Scripti (Target makinadaki .env ve uploads'ı korur)
const updateLinuxScript = `#!/bin/bash
DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "========================================"
echo "BehaGym Pro - Linux Akıllı Güncelleyici"
echo "========================================"

TARGET_DIR="\${1:-\$PWD}"

echo "[1/4] Çalışan backend servisleri durduruluyor..."
pkill -f backend-server-linux >/dev/null 2>&1 || true
sleep 1

echo "[2/4] İzinler ayarlanıyor..."
chmod +x backend/backend-server-linux start.sh start-bg.sh stop.sh 2>/dev/null || true

echo "[3/4] Konfigürasyon kontrolü..."
if [ ! -f "backend/.env" ] && [ -f "backend/.env.example" ]; then
    cp backend/.env.example backend/.env
    echo "[BİLGİ] Yeni .env dosyası .env.example'dan oluşturuldu."
fi

echo "[4/4] Sistem başlatılıyor..."
nohup ./backend/backend-server-linux > server-log.txt 2>&1 &

echo "========================================"
echo "[BAŞARILI] Güncelleme uygulandı ve sistem başlatıldı!"
echo "Erişim: http://localhost:5000"
echo "Log takibi: tail -f server-log.txt"
echo "========================================"
`;

fs.writeFileSync(path.join(publishDir, 'update-linux.sh'), updateLinuxScript);
execSync(`chmod +x "` + path.join(publishDir, 'update-linux.sh') + `"`, { stdio: 'ignore' });

// Linux Masaüstü Kısayolu (.desktop)
const desktopContent = `[Desktop Entry]
Type=Application
Terminal=true
Name=BehaGym Pro
Icon=utilities-terminal
Exec="${path.join(publishDir, 'start.sh')}"
Categories=Development;
`;

const desktopPath = path.join(process.env.HOME, 'Masaüstü', 'BehaGymPro.desktop');
if (fs.existsSync(path.join(process.env.HOME, 'Masaüstü'))) {
    fs.writeFileSync(desktopPath, desktopContent);
    execSync(`chmod +x "${desktopPath}"`, { stdio: 'ignore' });
}

// Startup Scripts (Windows Görev Zamanlayıcı kullanır)
const enableStartupScript = `@echo off
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Bu islemi baslatmak icin Yonetici yetkisi gerekiyor.
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ========================================
echo BehaGym Pro - Otomatik Baslatma (Aktivasyon)
echo ========================================
echo.

set TASK_NAME="BehaGymPro_Startup"
set EXE_PATH="%~dp0backend\\backend-server.exe"

echo Goruntu ve yol kontrol ediliyor...
echo %EXE_PATH%

:: Gorev zaten varsa once sil
schtasks /delete /tn %TASK_NAME% /f >nul 2>&1

:: Yeni gorev ekle: Oturum acildiginda calistir (VBS üzerinden sessizce)
set VBS_PATH="%~dp0hidden_launcher.vbs"
schtasks /create /tn %TASK_NAME% /tr "wscript.exe %VBS_PATH%" /sc onlogon /rl highest /f

if %errorLevel% == 0 (
    echo.
    echo [BASARILI] Bilgisayar her acildiginda BehaGym Pro otomatik baslayacak.
) else (
    echo.
    echo [HATA] Gorev olusturulamadi. Lutfen Yonetici olarak tekrar deneyin.
)

echo.
pause
`;

const disableStartupScript = `@echo off
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Bu islemi baslatmak icin Yonetici yetkisi gerekiyor.
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ========================================
echo BehaGym Pro - Otomatik Baslatma (Iptal)
echo ========================================
echo.

set TASK_NAME="BehaGymPro_Startup"

schtasks /delete /tn %TASK_NAME% /f

if %errorLevel% == 0 (
    echo.
    echo [BASARILI] Otomatik baslatma iptal edildi.
) else (
    echo.
    echo [BILGI] Zaten aktif bir otomatik baslatma gorevi bulunmadi.
)

echo.
pause
`;

fs.writeFileSync(path.join(publishDir, 'enable-startup.bat'), enableStartupScript);
fs.writeFileSync(path.join(publishDir, 'disable-startup.bat'), disableStartupScript);

// 6. Kurulum talimatları oluştur
const setupInstructions = `# BehaGym Pro - Kurulum Talimatları

Build Tarihi: ${now.toLocaleString('tr-TR')}

## HIZLI BAŞLANGIÇ (Önerilen)

### Windows Kullanıcıları İçin:
1. **install.bat** dosyasına çift tıklayın
   - Otomatik olarak yönetici yetkisi isteyecek (UAC onayı)
   - Güvenlik duvarı kurallarını otomatik ekler
   - Backend paketlerini yükler
2. **start.bat** veya **start-silent.bat** dosyasına çift tıklayın
   - start.bat: Pencereler açık kalır (log'ları görebilirsiniz)
   - start-silent.bat: Arka planda sessiz çalışır
3. **Otomatik Başlatma İstiyorsanız:**
   - **enable-startup.bat** dosyasına çift tıklayın
   - Bu işlemden sonra bilgisayar her açıldığında (veya oturum açıldığında) sistem arka planda otomatik olarak başlar.
4. Tarayıcıda **http://localhost:5000** adresine gidin (Artık varsayılan port budur)

### Durdurmak Veya Devre Dışı Bırakmak İçin:
- **stop.bat**: Çalışan sistemi hemen durdurur.
- **disable-startup.bat**: Otomatik başlatma özelliğini iptal eder.

### Önemli Not:
- Tüm .bat dosyaları ilk çalıştırmada UAC (Kullanıcı Hesabı Denetimi) onayı isteyebilir - "Evet" seçin.
- Otomatik başlatma Windows Görev Zamanlayıcı'ya bir girdi ekleyerek çalışır.

---

## MANUEL KURULUM (İleri Seviye)

## Gereksinimler
- Node.js 18+
- MySQL 8.0+
- npm veya yarn

## Kurulum Adımları

### 1. Backend Kurulumu
\`\`\`bash
cd backend
npm install
\`\`\`

### 2. Veritabanı Ayarları
- \`.env.example\` dosyasını \`.env\` olarak kopyalayın
- MySQL bağlantı bilgilerini düzenleyin:
  - DB_HOST
  - DB_USER
  - DB_PASSWORD
  - DB_NAME

### 3. Migration'ları Çalıştırın
\`\`\`bash
node src/migrations/runMigrations.js
\`\`\`

### 4. Backend'i Başlatın
\`\`\`bash
npm start
\`\`\`

### 5. Frontend Ayarları
- \`frontend/dist\` klasörünü bir web sunucusuna deploy edin
- Nginx, Apache veya Node.js static server kullanabilirsiniz

#### Nginx Örnek Konfigürasyon:
\`\`\`nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /path/to/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

#### Node.js Static Server:
\`\`\`bash
npm install -g serve
cd frontend/dist
serve -s . -p 3000
\`\`\`

## Önemli Notlar
- Backend varsayılan olarak 5000 portunda çalışır
- Frontend API isteklerini backend'e yönlendirir
- CORS ayarları backend \`.env\` dosyasında yapılır
- Dokümantasyon dosyalarını mutlaka okuyun

## Destek
Sorun yaşarsanız dokümantasyon dosyalarına bakın:
- KIOSK_MODE_KULLANIM.md
- EMAIL_BRANCH_FIX.md
- CROSS_BRANCH_ACCESS.md
`;

fs.writeFileSync(path.join(publishDir, 'KURULUM.md'), setupInstructions);
console.log('✅ Kurulum dosyaları oluşturuldu\n');

// 7. Özet
console.log('═══════════════════════════════════════════════════');
console.log('✅ Production Build Tamamlandı!');
console.log('═══════════════════════════════════════════════════');
console.log(`📦 Build Konumu: publish/${buildName}`);
console.log(`📄 Kurulum: publish/${buildName}/KURULUM.md\n`);

// Dosya boyutlarını göster
const getSize = (dir) => {
  let size = 0;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      size += getSize(filePath);
    } else {
      size += stat.size;
    }
  });
  return size;
};

const totalSize = getSize(publishDir);
const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
console.log(`📊 Toplam Boyut: ${sizeMB} MB\n`);
