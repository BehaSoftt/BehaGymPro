const PackageService = require('../../services/lesson/PackageService');
const { MembershipPackage } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');

class PackageController {
    /**
     * Tüm paketleri listele
     */
    static getAll = catchAsync(async (req, res) => {
        try {
            const result = await PackageService.getAllPackages(req.user, req.query);
            res.json(result);
        } catch (err) {
            console.error('[PackageController] 500 ERROR in getAll:', err.message);
            console.error('[PackageController] Request context:', {
                userId: req.user?.id,
                role: req.user?.role,
                query: req.query
            });
            throw err;
        }
    });

    /**
     * Yeni paket tanımla
     */
    static create = catchAsync(async (req, res) => {
        try {
            const { branchId, companyId } = req.user;
            
            // Veriyi temizle ve id varsa çıkart (Yeni kayıt olduğu için)
            const packageData = { ...req.body };
            if (packageData.id === null || packageData.id === undefined || packageData.id === '') {
                delete packageData.id;
            }

            const { name } = packageData;
            const finalBranchId = packageData.branchId || branchId;
            const { Branch } = require('../../models');
            const branchObj = finalBranchId ? await Branch.findByPk(finalBranchId) : null;
            const finalCompanyId = packageData.companyId || branchObj?.companyId || companyId;

            console.log('[PackageController] Creating package with data:', { ...packageData, branchId: finalBranchId, companyId: finalCompanyId });

            const existing = await MembershipPackage.findOne({ 
                where: { name, branchId: finalBranchId, companyId: finalCompanyId } 
            });
            if (existing) throw new AppError('Bu isimde bir paket zaten tanımlı.', 400);

            const newPackage = await MembershipPackage.create({
                ...packageData,
                branchId: finalBranchId,
                companyId: finalCompanyId,
                isActive: packageData.isActive !== undefined ? packageData.isActive : true,
                // Sayısal alanların doğru tipte olduğundan emin ol
                price: parseFloat(packageData.price) || 0,
                durationMonths: parseInt(packageData.durationMonths) || 1,
                sessionCount: parseInt(packageData.sessionCount) || 0,
                weeklySessionCount: parseInt(packageData.weeklySessionCount) || 0
            });

            console.log('[PackageController] Success: Package created:', newPackage.id);
            res.status(201).json(newPackage);
        } catch (err) {
            console.error('[PackageController] Create Error:', err);
            throw err;
        }
    });

    /**
     * Paket bilgilerini güncelle
     */
    static update = catchAsync(async (req, res) => {
        const pkg = await MembershipPackage.findByPk(req.params.id);
        if (!pkg) throw new AppError('Paket bulunamadı.', 404);

        await pkg.update(req.body);
        res.json(pkg);
    });

    /**
     * Paket sil
     */
    static delete = catchAsync(async (req, res) => {
        await PackageService.deletePackage(req.params.id);
        res.json({ message: 'Paket başarıyla silindi.' });
    });

    /**
     * Toplu paket sil
     */
    static bulkDelete = catchAsync(async (req, res) => {
        const { ids } = req.body;
        if (!ids?.length) throw new AppError('Silinecek paket seçilmedi.', 400);
        
        await MembershipPackage.destroy({ where: { id: ids } });
        res.json({ message: 'Paketler başarıyla silindi.' });
    });
}

module.exports = PackageController;
