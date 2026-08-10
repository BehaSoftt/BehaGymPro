const CompanyService = require('../../services/admin/CompanyService');
const { Company, Branch } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');
const { Op } = require('sequelize');

class CompanyController {
    /**
     * Tüm şirketleri listele
     */
    static getAll = catchAsync(async (req, res) => {
        const isSuperMaster = req.user?.role === 'SUPER_MASTER' || req.user?.username === 'super_master';
        const whereClause = isSuperMaster ? {} : { name: { [Op.not]: 'BehaSoft' } };

        const companies = await Company.findAll({
            where: whereClause,
            include: [{ model: Branch, as: 'branches' }],
            order: [['name', 'ASC']]
        });
        res.json(companies);
    });

    /**
     * Yeni şirket oluştur
     */
    static create = catchAsync(async (req, res) => {
        const { name } = req.body;
        const existing = await Company.findOne({ where: { name } });
        if (existing) throw new AppError('Bu isimde bir şirket zaten mevcut.', 400);

        const company = await Company.create(req.body);
        res.status(201).json(company);
    });

    /**
     * Şirket güncelle
     */
    static update = catchAsync(async (req, res) => {
        const { deleteFile } = require('../../utils/fileHelper');
        const company = await Company.findByPk(req.params.id);
        if (!company) throw new AppError('Şirket bulunamadı.', 404);

        // Logo değişmişse eskisini sil
        if (req.body.logo && company.logo && req.body.logo !== company.logo) {
            await deleteFile(company.logo);
        }

        await company.update(req.body);
        res.json(company);
    });

    /**
     * Şirket sil
     */
    static delete = catchAsync(async (req, res) => {
        await CompanyService.deleteCompany(req.params.id);
        res.json({ message: 'Şirket başarıyla silindi.' });
    });

    /**
     * Şirkete yeni şube ekle (Cari hesaplar dahil)
     */
    static createBranch = catchAsync(async (req, res) => {
        const branch = await CompanyService.createBranch(req.params.companyId, req.body);
        res.status(201).json(branch);
    });

    /**
     * Şubeyi sil
     */
    static deleteBranch = catchAsync(async (req, res) => {
        await CompanyService.deleteBranch(req.params.id);
        res.json({ message: 'Şube başarıyla silindi.' });
    });
}

module.exports = CompanyController;
