const { License, Company, Branch, User } = require('../../models');
const crypto = require('crypto');
const { Op } = require('sequelize');

const LICENSE_SECRET = process.env.LICENSE_SECRET || 'behasoft_super_secret_key_2026';

class LicenseService {
    /**
     * Rastgele güvenli lisans anahtarı üretir
     */
    static generateLicenseKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const segment = () => {
            const randomBytes = crypto.randomBytes(6);
            let result = '';
            for (let i = 0; i < 6; i++) result += chars[randomBytes[i] % chars.length];
            return result;
        };
        return `BEHA-${segment()}-${segment()}-${segment()}-${segment()}-${segment()}-${segment()}`;
    }

    /**
     * Lisans verileri için SHA-256 hash üretir (Tampering koruması)
     */
    static generateHash(companyId, branchId, endDate) {
        const dateStr = endDate instanceof Date ? endDate.toISOString() : endDate;
        return crypto.createHash('sha256')
            .update(`${companyId}_${branchId || 'ALL'}_${dateStr}_${LICENSE_SECRET}`)
            .digest('hex');
    }

    /**
     * Paket tipine göre bitiş tarihi hesaplar
     */
    static calculateDates(packageType, customStart, customEnd) {
        const start = customStart ? new Date(customStart) : new Date();
        const end = new Date(start);

        switch (packageType) {
            case 'DEMO_15': end.setDate(end.getDate() + 15); break;
            case '1_MONTH': end.setMonth(end.getMonth() + 1); break;
            case '3_MONTHS': end.setMonth(end.getMonth() + 3); break;
            case '6_MONTHS': end.setMonth(end.getMonth() + 6); break;
            case '1_YEAR': end.setFullYear(end.getFullYear() + 1); break;
            case 'CUSTOM': return { startDate: start, endDate: new Date(customEnd) };
        }
        return { startDate: start, endDate: end };
    }

    /**
     * Lisans aktive eder (Mevcut lisans varsa üzerine ekler)
     */
    static async activate(licenseKey, companyId) {
        const license = await License.findOne({ where: { licenseKey, companyId } });
        if (!license) throw new Error('Lisans bulunamadı veya firmanıza ait değil.');
        
        if (license.status !== 'PENDING') throw new Error('Bu lisans zaten kullanılmış veya geçersiz.');
        if (new Date(license.endDate) < new Date()) throw new Error('Lisans süresi dolmuş.');

        // Hash Doğrulama
        const expected = this.generateHash(license.companyId, license.branchId, license.endDate);
        if (license.securityHash !== expected) throw new Error('Güvenlik doğrulaması başarısız.');

        // Üzerine ekleme (Additive) mantığı
        const currentActive = await License.findOne({
            where: { companyId, branchId: license.branchId, status: 'ACTIVE', isActive: true, endDate: { [Op.gt]: new Date() } },
            order: [['endDate', 'DESC']]
        });

        if (currentActive) {
            const duration = new Date(license.endDate) - new Date(license.startDate);
            license.startDate = currentActive.endDate;
            license.endDate = new Date(new Date(currentActive.endDate).getTime() + duration);
            license.securityHash = this.generateHash(license.companyId, license.branchId, license.endDate);
        }

        license.status = 'ACTIVE';
        license.usedAt = new Date();
        await license.save();

        return license;
    }

    /**
     * Şirket/Şube lisans durumunu kontrol eder
     */
    static async checkStatus(companyId, branchId) {
        const active = await License.findOne({
            where: {
                companyId,
                [Op.or]: [{ branchId: null }, { branchId }],
                status: 'ACTIVE',
                isActive: true,
                [Op.or]: [{ endDate: null }, { endDate: { [Op.gt]: new Date() } }]
            },
            order: [['endDate', 'DESC']]
        });

        if (!active) return { valid: false };

        const daysRemaining = active.endDate 
            ? Math.ceil((new Date(active.endDate) - new Date()) / (1000 * 60 * 60 * 24))
            : 9999;

        return { valid: true, daysRemaining, license: active };
    }
}

module.exports = LicenseService;
