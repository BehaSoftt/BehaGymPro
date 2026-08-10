#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const chokidar = require('chokidar');
const path = require('path');

console.log('🔄 BehaGym Pro - Otomatik Git Push Başlatıldı\n');
console.log('📁 İzlenen klasörler: frontend/src, backend/src');
console.log('⏱️  Değişiklik algılandığında 10 saniye bekleyip push yapılacak\n');
console.log('🛑 Durdurmak için: CTRL+C\n');

let timeout = null;
let isProcessing = false;

const pushChanges = () => {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    
    if (!status.trim()) {
      console.log('✅ Değişiklik yok');
      isProcessing = false;
      return;
    }

    const timestamp = new Date().toLocaleString('tr-TR');
    console.log(`\n⏰ ${timestamp}`);
    console.log('📦 Değişiklikler push ediliyor...\n');

    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "Auto-update: ${timestamp}"`, { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });

    console.log('\n✅ Başarıyla GitHub\'a yüklendi!\n');

  } catch (error) {
    console.error('\n❌ Hata:', error.message, '\n');
  }

  isProcessing = false;
};

// Dosya değişikliklerini izle
const watcher = chokidar.watch([
  'frontend/src/**/*',
  'backend/src/**/*',
  'backend/package.json',
  'frontend/package.json'
], {
  ignored: [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/*.log'
  ],
  persistent: true,
  ignoreInitial: true
});

watcher.on('all', (event, filePath) => {
  console.log(`📝 ${event}: ${path.relative(process.cwd(), filePath)}`);
  
  // 10 saniye bekle, yeni değişiklik gelirse timer'ı sıfırla
  if (timeout) clearTimeout(timeout);
  
  timeout = setTimeout(() => {
    pushChanges();
  }, 10000);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Otomatik push durduruluyor...');
  watcher.close();
  process.exit(0);
});
