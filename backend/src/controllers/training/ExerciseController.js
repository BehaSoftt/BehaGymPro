const ExerciseService = require('../../services/training/ExerciseService');
const { Exercise } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');
const { Op } = require('sequelize');

class ExerciseController {
    /**
     * Tüm istasyonları listele
     */
    static getAll = catchAsync(async (req, res) => {
        const { specialtyId, categoryId, isActive, search, page = 1, limit = 2000 } = req.query;
        const offset = (page - 1) * limit;
        const where = {};

        if (specialtyId) where.specialtyId = specialtyId;
        if (categoryId) where.categoryId = categoryId;
        if (isActive !== undefined) where.isActive = isActive === 'true';
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows: exercises } = await Exercise.findAndCountAll({
            where,
            include: ['specialty', 'category'],
            order: [['specialtyId', 'ASC'], ['categoryId', 'ASC'], ['name', 'ASC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true
        });

        res.json({
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            exercises
        });
    });

    /**
     * ID ile istasyon getir
     */
    static getById = catchAsync(async (req, res) => {
        const exercise = await Exercise.findByPk(req.params.id, { include: ['specialty', 'category'] });
        if (!exercise) throw new AppError('İstasyon bulunamadı.', 404);
        res.json(exercise);
    });

    /**
     * Yeni istasyon oluştur
     */
    static create = catchAsync(async (req, res) => {
        const { name, specialtyId } = req.body;
        const existing = await Exercise.findOne({ where: { name: { [Op.iLike]: name }, specialtyId } });
        if (existing) throw new AppError('Bu branşta bu isimde bir istasyon zaten mevcut.', 400);

        const exercise = await Exercise.create({
            ...req.body,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true
        });
        res.status(201).json(exercise);
    });

    /**
     * İstasyon güncelle
     */
    static update = catchAsync(async (req, res) => {
        if (req.body.isActive === false) {
            const exercise = await Exercise.findByPk(req.params.id);
            if (exercise && exercise.isActive === true) {
                if (await ExerciseService.checkUsage(req.params.id)) throw new AppError('Kullanımda olan istasyon kapatılamaz.', 400);
            }
        }

        const exercise = await ExerciseService.updateExercise(req.params.id, req.body);
        res.json({ message: 'İstasyon güncellendi.', exercise });
    });

    /**
     * İstasyon aktif/pasif yap
     */
    static toggleStatus = catchAsync(async (req, res) => {
        const exercise = await ExerciseService.toggleStatus(req.params.id);
        res.json({ message: 'Durum güncellendi.', isActive: exercise.isActive });
    });

    /**
     * İstasyon sil
     */
    static delete = catchAsync(async (req, res) => {
        await ExerciseService.deleteExercise(req.params.id);
        res.json({ message: 'İstasyon başarıyla silindi.' });
    });

    /**
     * Toplu istasyon sil
     */
    static batchDelete = catchAsync(async (req, res) => {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) throw new AppError('Silinecek kayıtlar seçilmedi.', 400);

        const results = { success: 0, failed: 0, errors: [] };
        for (const id of ids) {
            try {
                await ExerciseService.deleteExercise(id);
                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push({ id, error: err.message });
            }
        }
        res.json({ message: 'Toplu silme tamamlandı.', results });
    });
}

module.exports = ExerciseController;
