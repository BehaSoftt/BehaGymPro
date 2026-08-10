const { SportFormation, SportSpecialty } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');

class SportFormationController {
    /**
     * Tüm spor dizilimlerini listele
     */
    static getAll = catchAsync(async (req, res) => {
        const { specialtyId } = req.query;
        const where = { branchId: req.user.branchId };
        if (specialtyId) where.sportSpecialtyId = specialtyId;

        const formations = await SportFormation.findAll({
            where,
            include: [{ model: SportSpecialty, as: 'specialty', attributes: ['name'] }],
            order: [['name', 'ASC']]
        });
        res.json(formations);
    });

    /**
     * Yeni spor dizilimi oluştur
     */
    static create = catchAsync(async (req, res) => {
        const formation = await SportFormation.create({
            ...req.body,
            branchId: req.user.branchId,
            companyId: req.user.companyId
        });
        res.status(201).json(formation);
    });

    /**
     * Spor dizilimini güncelle
     */
    static update = catchAsync(async (req, res) => {
        const formation = await SportFormation.findByPk(req.params.id);
        if (!formation) throw new AppError('Dizilim bulunamadı.', 404);

        await formation.update(req.body);
        res.json(formation);
    });

    /**
     * Spor dizilimini sil
     */
    static delete = catchAsync(async (req, res) => {
        const formation = await SportFormation.findByPk(req.params.id);
        if (!formation) throw new AppError('Dizilim bulunamadı.', 404);

        await formation.destroy();
        res.json({ message: 'Dizilim silindi.' });
    });
}

module.exports = SportFormationController;
