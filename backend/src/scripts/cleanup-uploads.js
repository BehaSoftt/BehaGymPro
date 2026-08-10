const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { Member, Exercise, Product, Company, Branch } = require('../models');

async function cleanup() {
    console.log('--- 🛡️ UPLOADS TEMİZLİK ARACI BAŞLATILDI ---');

    try {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            console.warn('⚠️ Uploads klasörü bulunamadı!');
            return;
        }

        // 1. Veritabanındaki tüm kullanılan dosya yollarını topla
        const [members, exercises, products, companies, branches] = await Promise.all([
            Member.findAll({ attributes: ['photo'], where: { photo: { [require('sequelize').Op.ne]: null } } }),
            Exercise.findAll({ attributes: ['imageUrl'], where: { imageUrl: { [require('sequelize').Op.ne]: null } } }),
            Product.findAll({ attributes: ['imageUrl'], where: { imageUrl: { [require('sequelize').Op.ne]: null } } }),
            Company.findAll({ attributes: ['logo'], where: { logo: { [require('sequelize').Op.ne]: null } } }),
            Branch.findAll({ attributes: ['logo'], where: { logo: { [require('sequelize').Op.ne]: null } } })
        ]);

        const usedFiles = new Set();
        const addFile = (p) => {
            if (!p) return;
            // Veritabanında genelde /uploads/dosya.jpg şeklinde tutuluyor
            const filename = path.basename(p);
            usedFiles.add(filename);
        };

        members.forEach(m => addFile(m.photo));
        exercises.forEach(e => addFile(e.imageUrl));
        products.forEach(p => addFile(p.imageUrl));
        companies.forEach(c => addFile(c.logo));
        branches.forEach(b => addFile(b.logo));

        console.log(`📊 Veritabanında kayıtlı benzersiz dosya sayısı: ${usedFiles.size}`);

        // 2. Fiziksel dosyaları tara
        const scanDir = (dir, prefix = '') => {
            const files = fs.readdirSync(dir);
            let deletedCount = 0;
            let deletedSize = 0;

            files.forEach(file => {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    // Alt klasörleri de tara (örneğin products/)
                    const result = scanDir(fullPath, path.join(prefix, file));
                    deletedCount += result.count;
                    deletedSize += result.size;
                } else {
                    // Eğer dosya veritabanında yoksa sil
                    if (!usedFiles.has(file)) {
                        console.log(`🗑️ Siliniyor: ${path.join(prefix, file)} (${(stat.size / 1024).toFixed(2)} KB)`);
                        deletedSize += stat.size;
                        fs.unlinkSync(fullPath);
                        deletedCount++;
                    }
                }
            });
            return { count: deletedCount, size: deletedSize };
        };

        const results = scanDir(uploadDir);

        console.log('-------------------------------------------');
        console.log(`✅ TEMİZLİK TAMAMLANDI!`);
        console.log(`🗑️ Toplam silinen dosya: ${results.count}`);
        console.log(`💾 Geri kazanılan alan: ${(results.size / (1024 * 1024)).toFixed(2)} MB`);
        console.log('-------------------------------------------');

    } catch (err) {
        console.error('❌ Temizlik sırasında hata oluştu:', err);
    } finally {
        process.exit(0);
    }
}

cleanup();
