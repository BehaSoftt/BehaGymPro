const { Attendance } = require('../../models');
const AttendanceService = require('../../services/lesson/AttendanceService');
const { catchAsync, AppError } = require('../../middleware/errorHandler');

class AttendanceController {
    /**
     * Yoklama al (Özel veya Grup)
     */
    static markAttendance = catchAsync(async (req, res) => {
        const { groupClassId, records, lessonType, instructorId, specialtyId } = req.body;
        const { branchId, companyId, id: userId } = req.user;
        const date = new Date().toISOString().split('T')[0];

        // ÖZEL DERS YOKLAMASI
        if (lessonType === 'PRIVATE') {
            if (!instructorId || !specialtyId) throw new AppError('Instructor ve Branş gereklidir.', 400);
            const { memberId, status, excuse } = records[0];
            const attendance = await AttendanceService.createPrivateAttendance({
                memberId, instructorId, specialtyId, date, status, excuse, branchId, companyId, userId
            });
            return res.status(201).json([attendance]);
        }

        // GRUP DERS YOKLAMASI (Toplu)
        if (lessonType === 'GROUP' || groupClassId) {
            if (!groupClassId) throw new AppError('Grup dersi ID gereklidir.', 400);
            const attendanceRecords = await AttendanceService.bulkMarkGroupAttendance(groupClassId, records, req.user);
            return res.json(attendanceRecords);
        }

        throw new AppError('Geçersiz yoklama tipi.', 400);
    });

    /**
     * Grup dersi yoklamalarını listele
     */
    static getGroupAttendance = catchAsync(async (req, res) => {
        const { groupClassId } = req.params;
        const { date } = req.query;
        const where = { groupClassId, ...(date && { date }) };

        const records = await Attendance.findAll({
            where,
            include: [{ model: Member, as: 'member', attributes: ['fullName', 'phone'] }],
            order: [['date', 'DESC']]
        });
        res.json(records);
    });

    /**
     * Özel ders yoklamalarını listele
     */
    static getPrivateAttendance = catchAsync(async (req, res) => {
        const { packageId } = req.params;
        const records = await Attendance.findAll({
            where: { packageId, lessonType: 'PRIVATE' },
            include: [{ model: Member, as: 'member', attributes: ['fullName', 'phone'] }],
            order: [['date', 'DESC']]
        });
        res.json(records);
    });

    /**
     * Özel ders yoklaması oluştur (Manuel)
     */
    static createPrivateAttendance = catchAsync(async (req, res) => {
        const { memberId, instructorId, specialtyId, date, status, excuse } = req.body;
        const { branchId, companyId, id: userId } = req.user;

        const attendance = await AttendanceService.createPrivateAttendance({
            memberId, instructorId, specialtyId, date: date || new Date(),
            status: status || 'PRESENT', excuse, branchId, companyId, userId
        });

        res.status(201).json(attendance);
    });

    /**
     * Yoklama kaydını sil (Seans iadesi dahil)
     */
    static deleteAttendance = catchAsync(async (req, res) => {
        const { id } = req.params;
        const { id: userId } = req.user;
        const attendance = await Attendance.findByPk(id);

        if (!attendance) throw new AppError('Yoklama kaydı bulunamadı.', 404);

        if (attendance.lessonType === 'PRIVATE' && attendance.packageId) {
            await AttendanceService.deletePrivateAttendance(id, userId);
        } else if (attendance.lessonType === 'GROUP' && attendance.groupClassId) {
            await AttendanceService.deleteGroupAttendance(id, userId);
        } else {
            await attendance.destroy();
        }

        res.json({ message: 'Yoklama kaydı silindi ve seanslar iade edildi.' });
    });
}

module.exports = AttendanceController;
