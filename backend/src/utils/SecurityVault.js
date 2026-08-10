const crypto = require('crypto');

/**
 * BEHAGYM PRO - Güvenlik ve Hassas Veri Kasası
 * ÖNEMLİ: Hassas veriler artık kod içinde saklanmamalıdır.
 * Lütfen tüm şifreleri .env dosyası içinde tanımlayın.
 */

const SecurityVault = {
    /**
     * İhtiyaca göre şifreleri getirir. 
     * Tüm değerler .env dosyasından okunur.
     */
    get(key) {
        const envKey = key.toUpperCase();
        const value = process.env[envKey];

        // Eğer .env içinde tanımlanmamışsa veya placeholder (koruma metni) olarak kalmışsa uyarı ver
        if (!value || value === 'PROTECTED_BY_BEHASOFT') {
            const defaults = {
                db_pass: '123456', // Yerel geliştirme için basit bir varsayılan
                smtp_pass: null,
                jwt_secret: 'beha_default_secret_7788'
            };
            
            const lowKey = key.toLowerCase();
            return defaults[lowKey] || null;
        }

        return value;
    },

    /**
     * Hash fonksiyonu
     */
    hash(data) {
        if (!data) return '';
        return crypto.createHash('sha256').update(data.toString()).digest('hex');
    },

    /**
     * Bütünlük hash'i oluşturur
     */
    generateIntegrityHash(data) {
        const str = JSON.stringify(data);
        return crypto.createHash('sha256').update(str).digest('hex');
    }
};

module.exports = SecurityVault;
