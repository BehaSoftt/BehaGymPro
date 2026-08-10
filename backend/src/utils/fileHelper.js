const fs = require('fs').promises;
const path = require('path');

const uploadDir = path.join(__dirname, '../../uploads');

/**
 * Dosyayı diskten güvenli bir şekilde siler
 * @param {string} filePath - Veritabanında kayıtlı olan dosya yolu (örn: /uploads/abc.jpg veya /products/abc.jpg)
 */
async function deleteFile(filePath) {
    if (!filePath) return;

    try {
        // Eğer yol /uploads/ ile başlıyorsa, bu kısmı temizle çünkü zaten uploads klasöründeyiz
        let relativePath = filePath;
        if (filePath.startsWith('/uploads/')) {
            relativePath = filePath.replace('/uploads/', '');
        } else if (filePath.startsWith('/')) {
            relativePath = filePath.substring(1);
        }

        const fullPath = path.join(uploadDir, relativePath);
        
        // Klasör dışına çıkıp çıkmadığını kontrol et (Güvenlik)
        if (!fullPath.startsWith(uploadDir)) {
            console.warn(`⚠️ Güvenlik uyarısı: ${fullPath} uploads dışında bir konuma işaret ediyor!`);
            return;
        }

        // Dosyanın varlığını kontrol et ve sil
        await fs.access(fullPath);
        await fs.unlink(fullPath);
        console.log(`🗑️ Dosya silindi: ${fullPath}`);
    } catch (err) {
        // Dosya bulunamadıysa hata verme (zaten yok)
        if (err.code !== 'ENOENT') {
            console.error(`❌ Dosya silme hatası (${filePath}):`, err.message);
        }
    }
}

module.exports = {
    deleteFile
};
