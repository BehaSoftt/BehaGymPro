const MemberPackageService = require('../../services/lesson/MemberPackageService');
const { MemberPackage, MembershipPackage, Member } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');

class MemberPackageController {
    /**
     * Üyeye paket ata
     */
    static create = catchAsync(async (req, res, next) => {
        try {
            const memberPackage = await MemberPackageService.assignPackage(req.body, req.user);
            res.status(201).json(memberPackage);
        } catch (error) {
            // Mükerrer veya iş mantığı hatalarını 400 olarak dön
            if (error.message.includes('zaten bu pakete aktif') || error.message.includes('zorunludur')) {
                return res.status(400).json({ message: error.message });
            }
            next(error);
        }
    });

    /**
     * Üyenin paketlerini getir
     */
    static getByMember = catchAsync(async (req, res) => {
        const { memberId } = req.params;
        const { branchId, companyId } = req.user;

        const packages = await MemberPackage.findAll({
            where: { memberId, branchId, companyId },
            include: [
                { model: MembershipPackage, as: 'package' },
                { model: Member, as: 'instructor', attributes: ['id', 'fullName', 'photo'] }
            ]
        });
        res.json(packages);
    });

    /**
     * Seans kullan (Düş)
     */
    static useSession = catchAsync(async (req, res) => {
        const mpkg = await MemberPackage.findByPk(req.params.id);
        if (!mpkg) throw new AppError('Kayıt bulunamadı.', 404);
        if (mpkg.remainingSessions <= 0) throw new AppError('Kalan seans bulunmuyor.', 400);

        await mpkg.update({ remainingSessions: mpkg.remainingSessions - 1 });
        res.json({ message: 'Seans kullanıldı.', remainingSessions: mpkg.remainingSessions });
    });

    /**
     * Paket atamasını iptal et / sil
     */
    static delete = catchAsync(async (req, res) => {
        const mpkg = await MemberPackage.findByPk(req.params.id);
        if (!mpkg) throw new AppError('Kayıt bulunamadı.', 404);

        await mpkg.destroy();
        res.json({ message: 'Üye paketten başarıyla çıkarıldı.' });
    });
}

module.exports = MemberPackageController;
