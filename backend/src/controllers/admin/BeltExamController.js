const BeltExamService = require('../../services/admin/BeltExamService');
const { BeltExam, BeltExamParticipant } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');

class BeltExamController {
    /**
     * Tüm sınavları listele
     */
    static getExams = catchAsync(async (req, res) => {
        const exams = await BeltExamService.getAllExams(req.query);
        res.json(exams);
    });

    /**
     * Yeni sınav oluştur
     */
    static createExam = catchAsync(async (req, res) => {
        const exam = await BeltExam.create({
            ...req.body,
            companyId: req.user.companyId,
            gymBranchId: req.user.branchId
        });
        res.status(201).json(exam);
    });

    /**
     * Sınav güncelle
     */
    static updateExam = catchAsync(async (req, res) => {
        const { id } = req.params;
        await BeltExam.update(req.body, { where: { id } });
        res.json({ message: 'Sınav başarıyla güncellendi.' });
    });

    /**
     * Sınav sil
     */
    static deleteExam = catchAsync(async (req, res) => {
        await BeltExam.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Sınav başarıyla silindi.' });
    });

    /**
     * Sınava aday öğrencileri getir
     */
    static getCandidates = catchAsync(async (req, res) => {
        const candidates = await BeltExamService.getCandidates(req.query);
        res.json(candidates);
    });

    /**
     * Sınava toplu katılımcı ekle (Borçlandırma dahil)
     */
    static addParticipants = catchAsync(async (req, res) => {
        const { examId, participants } = req.body;
        const result = await BeltExamService.addParticipants(examId, participants, req.user);
        res.json({ message: 'Katılımcılar eklendi ve ücretler carilere yansıtıldı.', ...result });
    });

    /**
     * Sınavın katılımcılarını getir
     */
    static getParticipants = catchAsync(async (req, res) => {
        const participants = await BeltExamParticipant.findAll({
            where: { examId: req.params.examId },
            include: ['member']
        });
        res.json(participants);
    });

    /**
     * Sınav sonucunu güncelle (Geçti/Kaldı)
     */
    static updateParticipantResult = catchAsync(async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        await BeltExamService.updateResult(id, status);
        res.json({ message: 'Sınav sonucu kaydedildi ve üye profili güncellendi.' });
    });

    /**
     * Katılımcıyı sınavdan çıkar (İade dahil)
     */
    static deleteParticipant = catchAsync(async (req, res) => {
        await BeltExamService.removeParticipant(req.params.id);
        res.json({ message: 'Katılımcı sınavdan çıkarıldı ve yansıtılan ücret iade edildi.' });
    });

    /**
     * WhatsApp Duyurusu Gönder
     */
    static sendNotification = catchAsync(async (req, res) => {
        await BeltExamService.sendNotification(req.body.participantId);
        res.json({ message: 'Duyuru başarıyla gönderildi.' });
    });

    /**
     * Sınavı tamamlanmış olarak işaretle
     */
    static completeExam = catchAsync(async (req, res) => {
        const { id } = req.params;
        await BeltExam.update({ status: 'COMPLETED' }, { where: { id } });
        res.json({ message: 'Sınav tamamlandı olarak işaretlendi.' });
    });

    /**
     * Katılımcı bilgilerini güncelle (Toplu olmayan)
     */
    static updateParticipant = catchAsync(async (req, res) => {
        const { id } = req.params;
        await BeltExamParticipant.update(req.body, { where: { id } });
        res.json({ message: 'Katılımcı güncellendi.' });
    });

    /**
     * Tek bir katılımcının yoklamasını güncelle
     */
    static updateParticipantAttendance = catchAsync(async (req, res) => {
        const { id } = req.params;
        const { attendance } = req.body;
        await BeltExamParticipant.update({ attendance }, { where: { id } });
        res.json({ message: 'Katılımcı yoklaması güncellendi.' });
    });

    /**
     * Toplu yoklama al
     */
    static markAttendance = catchAsync(async (req, res) => {
        const { examId, attendanceRecords } = req.body; // { memberId: status } şeklinde gelebilir veya array
        if (Array.isArray(attendanceRecords)) {
            for (const record of attendanceRecords) {
                await BeltExamParticipant.update(
                    { attendance: record.status },
                    { where: { examId, memberId: record.memberId } }
                );
            }
        }
        res.json({ message: 'Yoklamalar kaydedildi.' });
    });

    /**
     * Genel Kuşak İstatistikleri
     */
    static getStats = catchAsync(async (req, res) => {
        const stats = await BeltExamService.getCandidates({ minMonths: 3 }); // Basit aday sayısı
        const result = {
            candidateCount: stats.length,
            beltStats: [] // Detaylı istatistik istenirle genişletilebilir
        };
        res.json(result);
    });
}

module.exports = BeltExamController;
