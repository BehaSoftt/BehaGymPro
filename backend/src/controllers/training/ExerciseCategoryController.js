const { ExerciseCategory, Exercise } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');
const { Op } = require('sequelize');

class ExerciseCategoryController {
    /**
     * Tüm alt başlıkları listele
     */
    static getAll = catchAsync(async (req, res) => {
        const { specialtyId, search } = req.query;
        const where = {};
        if (specialtyId) where.specialtyId = specialtyId;
        if (search) where.name = { [Op.iLike]: `%${search}%` };

        const categories = await ExerciseCategory.findAll({
            where,
            include: [{ model: Exercise, as: 'exercises', attributes: ['id', 'name'] }],
            order: [['name', 'ASC']]
        });
        res.json(categories);
    });

    /**
     * ID ile alt başlık getir
     */
    static getById = catchAsync(async (req, res) => {
        const category = await ExerciseCategory.findByPk(req.params.id, {
            include: [{ model: Exercise, as: 'exercises' }]
        });
        if (!category) throw new AppError('Alt başlık bulunamadı.', 404);
        res.json(category);
    });

    /**
     * Yeni alt başlık oluştur
     */
    static create = catchAsync(async (req, res) => {
        const { name, specialtyId } = req.body;
        const existing = await ExerciseCategory.findOne({ where: { name: { [Op.iLike]: name }, specialtyId } });
        if (existing) throw new AppError('Bu isimde bir alt başlık zaten mevcut.', 400);

        const category = await ExerciseCategory.create(req.body);
        res.status(201).json(category);
    });

    /**
     * Alt başlık güncelle
     */
    static update = catchAsync(async (req, res) => {
        const category = await ExerciseCategory.findByPk(req.params.id);
        if (!category) throw new AppError('Alt başlık bulunamadı.', 404);

        await category.update(req.body);
        res.json(category);
    });

    /**
     * Alt başlık sil
     */
    static delete = catchAsync(async (req, res) => {
        const exerciseCount = await Exercise.count({ where: { categoryId: req.params.id } });
        if (exerciseCount > 0) throw new AppError('Alt başlık altında egzersizler bulunduğu için silinemez.', 400);

        const category = await ExerciseCategory.findByPk(req.params.id);
        if (!category) throw new AppError('Alt başlık bulunamadı.', 404);

        await category.destroy();
        res.json({ message: 'Alt başlık başarıyla silindi.' });
    });

    /**
     * Toplu alt başlık sil
     */
    static batchDelete = catchAsync(async (req, res) => {
        const { ids } = req.body;
        if (!ids?.length) throw new AppError('Silinecek alt başlık seçilmedi.', 400);

        const inUseCount = await Exercise.count({ where: { categoryId: ids } });
        if (inUseCount > 0) throw new AppError('Bazı alt başlıklarda egzersizler bulunduğu için silme engellendi.', 400);

        await ExerciseCategory.destroy({ where: { id: ids } });
        res.json({ message: 'Seçili alt başlıklar başarıyla silindi.' });
    });
}

module.exports = ExerciseCategoryController;
