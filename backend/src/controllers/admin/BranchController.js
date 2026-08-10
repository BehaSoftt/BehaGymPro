const { Branch, Company } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');

class BranchController {
    /**
     * Tüm şubeleri listele
     */
    static getAll = catchAsync(async (req, res) => {
        const { role, companyId, username } = req.user;
        const isSuperMaster = role?.toUpperCase() === 'SUPER_MASTER' || username?.toLowerCase() === 'super_master';

        const whereClause = isSuperMaster ? {} : { companyId };

        const branches = await Branch.findAll({
            where: whereClause,
            include: [
                { model: Company, as: 'Company', attributes: ['id', 'name'] },
                { model: Company, as: 'HeaderCompany', attributes: ['id', 'name'] },
                { model: Branch, as: 'HeaderBranch', attributes: ['id', 'name'] }
            ],
            order: [['name', 'ASC']]
        });

        res.json(branches);
    });

    /**
     * ID ile şube getir
     */
    static getById = catchAsync(async (req, res) => {
        const branch = await Branch.findByPk(req.params.id, {
            include: [
                { model: Company, as: 'Company', attributes: ['id', 'name'] },
                { model: Company, as: 'HeaderCompany', attributes: ['id', 'name'] },
                { model: Branch, as: 'HeaderBranch', attributes: ['id', 'name'] }
            ]
        });
        if (!branch) throw new AppError('Şube bulunamadı.', 404);
        res.json(branch);
    });

    /**
     * Şube güncelle
     */
    static update = catchAsync(async (req, res) => {
        const { deleteFile } = require('../../utils/fileHelper');
        const branch = await Branch.findByPk(req.params.id);
        if (!branch) throw new AppError('Şube bulunamadı.', 404);

        // Logo değişmişse eskisini sil
        if (req.body.logo && branch.logo && req.body.logo !== branch.logo) {
            await deleteFile(branch.logo);
        }

        await branch.update(req.body);
        res.json({ message: 'Şube bilgileri güncellendi.', branch });
    });
}

module.exports = BranchController;
