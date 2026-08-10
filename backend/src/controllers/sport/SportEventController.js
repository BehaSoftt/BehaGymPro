const { SportEvent, SportGroup, SportSpecialty } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');

class SportEventController {
    /**
     * Tüm spor etkinliklerini listele
     */
    static getAll = catchAsync(async (req, res) => {
        const { groupId, specialtyId, type } = req.query;
        const where = {};
        if (specialtyId) where.specialtyId = specialtyId;
        if (groupId) where.groupId = groupId;
        if (type) where.type = type;

        const events = await SportEvent.findAll({
            where,
            include: [
                { model: SportGroup, as: 'group', attributes: ['name'] },
                { model: SportSpecialty, as: 'specialty', attributes: ['name'] }
            ],
            order: [['date', 'DESC']]
        });
        res.json(events);
    });

    /**
     * Yeni spor etkinliği oluştur
     */
    static create = catchAsync(async (req, res) => {
        const event = await SportEvent.create(req.body);
        res.status(201).json(event);
    });

    /**
     * Spor etkinliğini güncelle
     */
    static update = catchAsync(async (req, res) => {
        const event = await SportEvent.findByPk(req.params.id);
        if (!event) throw new AppError('Etkinlik bulunamadı.', 404);

        await event.update(req.body);
        res.json(event);
    });

    /**
     * Spor etkinliğini sil
     */
    static delete = catchAsync(async (req, res) => {
        const event = await SportEvent.findByPk(req.params.id);
        if (!event) throw new AppError('Etkinlik bulunamadı.', 404);

        await event.destroy();
        res.json({ message: 'Etkinlik silindi.' });
    });
}

module.exports = SportEventController;
