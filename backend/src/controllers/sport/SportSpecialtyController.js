const SportSpecialtyService = require('../../services/sport/SportSpecialtyService');
const { SportSpecialty, ExerciseCategory, Exercise } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');
const { Op } = require('sequelize');

class SportSpecialtyController {
    /**
     * Tüm branşları listele
     */
    static getAll = catchAsync(async (req, res) => {
        const { search, isActive } = req.query;
        const where = {};

        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }
        if (isActive !== undefined) where.isActive = isActive === 'true';

        const specialties = await SportSpecialty.findAll({
            where,
            include: [{
                model: ExerciseCategory, as: 'categories',
                include: [{ model: Exercise, as: 'exercises' }]
            }],
            order: [['name', 'ASC']]
        });
        res.json(specialties);
    });

    /**
     * ID ile branş getir
     */
    static getById = catchAsync(async (req, res) => {
        const specialty = await SportSpecialty.findByPk(req.params.id, {
            include: [{
                model: ExerciseCategory, as: 'categories',
                include: [{ model: Exercise, as: 'exercises' }]
            }]
        });
        if (!specialty) throw new AppError('Branş bulunamadı.', 404);
        res.json(specialty);
    });

    /**
     * Yeni branş oluştur
     */
    static create = catchAsync(async (req, res) => {
        const { name } = req.body;
        const existing = await SportSpecialty.findOne({ where: { name: { [Op.iLike]: name } } });
        if (existing) throw new AppError('Bu isimde bir branş zaten mevcut.', 400);

        const specialty = await SportSpecialty.create({
            ...req.body,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true,
            hasBelts: req.body.hasBelts !== undefined ? req.body.hasBelts : (req.body.belts?.length > 0)
        });
        res.status(201).json(specialty);
    });

    /**
     * Branş güncelle
     */
    static update = catchAsync(async (req, res) => {
        const specialty = await SportSpecialty.findByPk(req.params.id);
        if (!specialty) throw new AppError('Branş bulunamadı.', 404);

        if (req.body.isActive === false && specialty.isActive === true) {
            const { inUse } = await SportSpecialtyService.checkUsage(req.params.id);
            if (inUse) throw new AppError('Kullanımda olan branş kapatılamaz.', 400);
        }

        await specialty.update(req.body);
        res.json(specialty);
    });

    /**
     * Branş aktif/pasif yap
     */
    static toggleStatus = catchAsync(async (req, res) => {
        const specialty = await SportSpecialtyService.toggleStatus(req.params.id);
        res.json(specialty);
    });

    /**
     * Branş sil
     */
    static delete = catchAsync(async (req, res) => {
        await SportSpecialtyService.deleteSpecialty(req.params.id);
        res.json({ message: 'Branş başarıyla silindi.' });
    });

    /**
     * Toplu branş sil
     */
    static batchDelete = catchAsync(async (req, res) => {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) throw new AppError('Silinecek branşlar seçilmedi.', 400);

        const results = { success: 0, failed: 0, errors: [] };
        
        for (const id of ids) {
            try {
                await SportSpecialtyService.deleteSpecialty(id);
                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push({ id, error: err.message });
            }
        }

        res.json({ message: 'Toplu silme işlemi tamamlandı.', results });
    });
}

module.exports = SportSpecialtyController;
