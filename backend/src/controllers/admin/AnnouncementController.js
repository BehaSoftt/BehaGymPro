const AnnouncementService = require('../../services/admin/AnnouncementService');
const { Announcement } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');

class AnnouncementController {
    /**
     * Tüm duyuruları getir
     */
    static getAllAnnouncements = catchAsync(async (req, res) => {
        const announcements = await AnnouncementService.getAnnouncements(req.query);
        res.json(announcements);
    });

    /**
     * Yeni duyuru oluştur
     */
    static createAnnouncement = catchAsync(async (req, res) => {
        const announcement = await Announcement.create({
            ...req.body,
            companyId: req.body.companyId || req.user.companyId
        });
        res.status(201).json({ message: 'Duyuru oluşturuldu.', announcement });
    });

    /**
     * Duyuru güncelle
     */
    static updateAnnouncement = catchAsync(async (req, res) => {
        const announcement = await Announcement.findByPk(req.params.id);
        if (!announcement) throw new AppError('Duyuru bulunamadı.', 404);

        await announcement.update(req.body);
        res.json({ message: 'Duyuru güncellendi.', announcement });
    });

    /**
     * Duyuru sil
     */
    static deleteAnnouncement = catchAsync(async (req, res) => {
        const announcement = await Announcement.findByPk(req.params.id);
        if (!announcement) throw new AppError('Duyuru bulunamadı.', 404);

        await announcement.destroy();
        res.json({ message: 'Duyuru silindi.' });
    });

    /**
     * Aktif duyuruları getir
     */
    static getActiveAnnouncements = catchAsync(async (req, res) => {
        const announcements = await AnnouncementService.getAnnouncements({ ...req.query, activeOnly: true });
        res.json(announcements);
    });
}

module.exports = AnnouncementController;
