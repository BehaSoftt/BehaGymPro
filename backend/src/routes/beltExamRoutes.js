const express = require('express');
const router = express.Router();
const BeltExamController = require('../controllers/admin/BeltExamController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/', BeltExamController.getExams);
router.post('/', BeltExamController.createExam);
router.put('/:id', BeltExamController.updateExam);
router.put('/:id/complete', BeltExamController.completeExam);
router.delete('/:id', BeltExamController.deleteExam);

// Aday Öğrencileri Getir (Branş ve Bekleme Süresine Göre)
router.get('/candidates', BeltExamController.getCandidates);
router.get('/stats', BeltExamController.getStats);

// Katılımcı İşlemleri
router.get('/:examId/participants', BeltExamController.getParticipants);
router.post('/participants', BeltExamController.addParticipants);
router.put('/participants/:id', BeltExamController.updateParticipant);
router.put('/participants/:id/result', BeltExamController.updateParticipantResult);
router.put('/participants/:id/attendance', BeltExamController.updateParticipantAttendance);
router.post('/participants/mark-attendance', BeltExamController.markAttendance);
router.delete('/participants/:id', BeltExamController.deleteParticipant);

// WhatsApp Bildirimi
router.post('/notify', BeltExamController.sendNotification);

module.exports = router;
