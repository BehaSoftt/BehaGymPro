const LicenseService = require('../../services/admin/LicenseService');
const { License, Company, Branch, User } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');
const { Op } = require('sequelize');

class LicenseController {
    /**
     * Yeni lisans üret (Admin Only)
     */
    static generateLicense = catchAsync(async (req, res) => {
        if (req.user.role !== 'SUPER_MASTER') throw new AppError('Yetkisiz erişim.', 403);

        const { companyId, branchId, branchIds, packageType, customStartDate, customEndDate, notes } = req.body;
        const { startDate, endDate } = LicenseService.calculateDates(packageType, customStartDate, customEndDate);

        let targetBranches = (Array.isArray(branchIds) && branchIds.length > 0) ? branchIds : [branchId || null];
        const created = [];

        for (const bId of targetBranches) {
            const finalBranchId = (bId === 'ALL' || bId === '') ? null : bId;
            const licenseKey = LicenseService.generateLicenseKey();
            const securityHash = LicenseService.generateHash(companyId, finalBranchId, endDate);

            const license = await License.create({
                companyId, branchId: finalBranchId, licenseKey, packageType,
                startDate, endDate, status: 'PENDING', securityHash, notes, isActive: true
            });
            created.push(license);
        }

        res.status(201).json({ success: true, message: 'Lisans(lar) üretildi.', data: created });
    });

    /**
     * Lisans aktive et
     */
    static activateLicense = catchAsync(async (req, res) => {
        const activated = await LicenseService.activate(req.body.licenseKey, req.user.companyId);
        
        // İlişkileriyle birlikte güncel halini çekelim
        const license = await License.findByPk(activated.id, {
            include: [
                { model: Company, as: 'Company', attributes: ['name'] },
                { model: Branch, as: 'Branch', attributes: ['name'] }
            ]
        });

        const now = new Date();
        const end = new Date(license.endDate);
        const daysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

        const responseData = {
            ...license.get({ plain: true }),
            companyName: license.Company?.name || 'Bilinmiyor',
            branchName: license.Branch?.name || 'Tüm Şubeler',
            daysRemaining: daysRemaining
        };

        res.json({ success: true, message: 'Lisans başarıyla aktif edildi.', data: responseData });
    });

    /**
     * Lisans durumunu kontrol et
     */
    static checkLicenseStatus = catchAsync(async (req, res) => {
        const status = await LicenseService.checkStatus(req.user.companyId, req.user.branchId);
        res.json({ success: true, ...status });
    });

    /**
     * Tüm lisansları listele (Admin Only)
     */
    static getAllLicenses = catchAsync(async (req, res) => {
        if (req.user.role !== 'SUPER_MASTER') throw new AppError('Yetkisiz erişim.', 403);

        const licenses = await License.findAll({
            include: [
                { model: Company, as: 'Company', attributes: ['name'] },
                { model: Branch, as: 'Branch', attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: licenses });
    });

    /**
     * Lisans güncelle (Admin Only)
     */
    static updateLicense = catchAsync(async (req, res) => {
        if (req.user.role !== 'SUPER_MASTER') throw new AppError('Yetkisiz erişim.', 403);

        const license = await License.findByPk(req.params.id);
        if (!license) throw new AppError('Lisans bulunamadı.', 404);

        const updates = { ...req.body };

        // Eğer bitiş tarihi değişmişse hash'i yeniden hesapla
        if (updates.endDate || updates.companyId || updates.branchId) {
            updates.securityHash = LicenseService.generateHash(
                updates.companyId || license.companyId,
                updates.branchId !== undefined ? updates.branchId : license.branchId,
                updates.endDate || license.endDate
            );
        }

        await license.update(updates);
        res.json({ success: true, message: 'Lisans güncellendi.', data: license });
    });

    /**
     * Lisans sil (Admin Only)
     */
    static deleteLicense = catchAsync(async (req, res) => {
        if (req.user.role !== 'SUPER_MASTER') throw new AppError('Yetkisiz erişim.', 403);

        const license = await License.findByPk(req.params.id);
        if (!license) throw new AppError('Lisans bulunamadı.', 404);

        await license.destroy();
        res.json({ success: true, message: 'Lisans silindi.' });
    });
}

module.exports = LicenseController;
