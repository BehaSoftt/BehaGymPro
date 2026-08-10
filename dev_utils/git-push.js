#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 BehaGym Pro - Git Push Scripti\n');

// Git durumunu kontrol et
try {
  const status = execSync('git status --porcelain', { encoding: 'utf-8' });
  
  console.log('📝 Değişen dosyalar:');
  const lines = status.trim().split('\n');
  lines.forEach(line => console.log(`   ${line}`));
  if (lines.length === 1 && lines[0] === '') {
    console.log('✨ Değişiklik yok, doğrudan push ediliyor...');
  }

  // Otomatik akıllı mesaj oluştur
  const summary = { added: 0, modified: 0, deleted: 0, cats: new Set() };
  lines.forEach(line => {
    const code = line.slice(0, 2).trim();
    const file = line.slice(3);
    if (code === 'A' || code === '??') summary.added++;
    else if (code === 'M') summary.modified++;
    else if (code === 'D') summary.deleted++;

    if (file.includes('models')) summary.cats.add('Models');
    else if (file.includes('controllers')) summary.cats.add('Controllers');
    else if (file.includes('services')) summary.cats.add('Services');
    else if (file.includes('views')) summary.cats.add('Views');
    else if (file.includes('components')) summary.cats.add('Components');
  });

  const catStr = summary.cats.size > 0 ? ` [${Array.from(summary.cats).join(', ')}]` : '';
  const commitMessage = `Auto: +${summary.added} ~${summary.modified} -${summary.deleted}${catStr}`;
  
  console.log(`\n💬 Otomatik Mesaj: ${commitMessage}`);
  
  try {
    console.log('\n📦 Dosyalar ekleniyor...');
    execSync('git add .', { stdio: 'pipe' });
    
    if (lines.length === 1 && lines[0] === '') {
       // Değişiklik yok, commit atla
    } else {
       console.log('💾 Commit yapılıyor...');
       execSync(`git commit -m "${commitMessage}"`, { stdio: 'pipe' });
    }
    
    console.log('🌐 GitHub\'a push ediliyor...');
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('\n✅ Başarıyla GitHub\'a yüklendi!');
    console.log(`📍 https://github.com/BehaSoftt/Gym-Platform\n`);
    
  } catch (error) {
    console.error('\n❌ Hata:', error.message);
    process.exit(1);
  }
  
  rl.close();

} catch (error) {
  console.error('❌ Git hatası:', error.message);
  process.exit(1);
}
