const { SportPerformance, Member, SportEvent } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');

class SportPerformanceController {
    /**
     * Etkinliğe göre performans verilerini getir
     */
    static getByEvent = catchAsync(async (req, res) => {
        const performances = await SportPerformance.findAll({
            where: { eventId: req.params.eventId },
            include: [{ model: Member, as: 'member', attributes: ['id', 'fullName', 'photo'] }]
        });
        res.json(performances);
    });

    /**
     * Üyeye göre performans verilerini getir
     */
    static getByMember = catchAsync(async (req, res) => {
        const performances = await SportPerformance.findAll({
            where: { memberId: req.params.memberId },
            include: [{ model: SportEvent, as: 'event', attributes: ['title', 'date', 'type'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(performances);
    });

    /**
     * Performans verisi kaydet veya güncelle (Upsert)
     */
    static upsert = catchAsync(async (req, res) => {
        const { eventId, memberId, stats, coachRating, coachNotes } = req.body;
        
        const [performance, created] = await SportPerformance.findOrCreate({
            where: { eventId, memberId },
            defaults: { stats, coachRating, coachNotes }
        });

        if (!created) {
            await performance.update({ stats, coachRating, coachNotes });
        }

        res.json(performance);
    });
}

module.exports = SportPerformanceController;
