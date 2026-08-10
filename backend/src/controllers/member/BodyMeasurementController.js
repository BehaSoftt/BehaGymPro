const BodyMeasurementService = require('../../services/member/BodyMeasurementService');
const { BodyMeasurement, Member } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');
const { Op } = require('sequelize');

class BodyMeasurementController {
    /**
     * Tüm ölçümleri listele
     */
    static getAll = catchAsync(async (req, res) => {
        const { memberId, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        const where = {};

        if (req.user.role === 'MEMBER') {
            const member = await Member.findOne({ where: { [Op.or]: [{ id: req.user.id }, { userId: req.user.id }] } });
            if (!member) throw new AppError('Üye bulunamadı.', 404);
            where.memberId = member.id;
        } else if (memberId) {
            where.memberId = memberId;
        }

        const { count, rows: measurements } = await BodyMeasurement.findAndCountAll({
            where,
            order: [['measurementDate', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            measurements
        });
    });

    /**
     * Yeni ölçüm kaydet
     */
    static create = catchAsync(async (req, res) => {
        const measurement = await BodyMeasurementService.createMeasurement(req.body);
        res.status(201).json({ status: 'SUCCESS', measurement });
    });

    /**
     * Ölçüm sil
     */
    static delete = catchAsync(async (req, res) => {
        await BodyMeasurement.destroy({ where: { id: req.params.id } });
        res.json({ status: 'SUCCESS' });
    });
}

module.exports = BodyMeasurementController;
