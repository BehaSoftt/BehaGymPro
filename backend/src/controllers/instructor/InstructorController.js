const InstructorService = require('../../services/instructor/InstructorService');
const { Member } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');
const { Op } = require('sequelize');

class InstructorController {
    /**
     * Tüm eğitmenleri listele
     */
    static getAll = catchAsync(async (req, res) => {
        const { branchId, companyId, role } = req.user;
        const { page = 1, limit = 50, search } = req.query;
        const offset = (page - 1) * limit;
        const isSuperMaster = role === 'SUPER_MASTER';

        const where = { profileType: 'INSTRUCTOR' };
        if (!isSuperMaster) {
            where.branchId = branchId;
            where.companyId = companyId;
        }

        if (search) {
            where.fullName = { [Op.iLike]: `%${search}%` };
        }

        const { count, rows: instructors } = await Member.findAndCountAll({
            where,
            include: ['user'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fullName', 'ASC']],
            distinct: true
        });

        res.json({
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            instructors
        });
    });

    /**
     * Yeni eğitmen oluştur
     */
    static create = catchAsync(async (req, res) => {
        const result = await InstructorService.createInstructor(req.body, req.user);
        res.status(201).json({ message: 'Eğitmen başarıyla oluşturuldu.', ...result });
    });

    /**
     * Eğitmen bilgilerini güncelle
     */
    static update = catchAsync(async (req, res) => {
        const instructor = await InstructorService.updateInstructor(req.params.id, req.body);
        res.json({ message: 'Profil ve kullanıcı ayarları güncellendi.', profile: instructor });
    });

    /**
     * Eğitmeni sil
     */
    static delete = catchAsync(async (req, res) => {
        await InstructorService.deleteInstructor(req.params.id);
        res.json({ message: 'Eğitmen başarıyla silindi.' });
    });
}

module.exports = InstructorController;
