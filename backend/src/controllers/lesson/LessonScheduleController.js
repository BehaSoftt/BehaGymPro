const LessonService = require('../../services/lesson/LessonService');
const { LessonSchedule } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');

class LessonScheduleController {
    /**
     * Yeni ders programı oluştur
     */
    static create = catchAsync(async (req, res) => {
        const schedule = await LessonService.createLesson(req.body, req.user);
        res.status(201).json({ message: 'Ders programı oluşturuldu.', schedule });
    });

    /**
     * Tüm dersleri listele
     */
    static getAll = catchAsync(async (req, res) => {
        const schedules = await LessonService.getAllLessons(req.query, req.user);
        res.json({ schedules });
    });

    /**
     * Takvim verilerini getir
     */
    static getCalendar = catchAsync(async (req, res) => {
        const schedules = await LessonService.getCalendarData(req.query, req.user);
        res.json({ schedules });
    });

    /**
     * Ders programı güncelle
     */
    static update = catchAsync(async (req, res) => {
        const schedule = await LessonService.updateLesson(req.params.id, req.body, req.user);
        res.json({ message: 'Ders programı güncellendi.', schedule });
    });

    /**
     * Ders programı sil (Soft delete)
     */
    static delete = catchAsync(async (req, res) => {
        const schedule = await LessonSchedule.findByPk(req.params.id);
        if (!schedule) throw new AppError('Ders programı bulunamadı.', 404);

        await schedule.update({ isActive: false });
        res.json({ message: 'Ders programı silindi.' });
    });
}

module.exports = LessonScheduleController;
