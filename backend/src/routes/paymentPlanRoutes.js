const express = require('express');
const router = express.Router();
const PaymentPlanController = require('../controllers/finance/PaymentPlanController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Tüm rotalar authentication gerektirir (her route'a ayrı ayrı eklendi)
// router.use(authMiddleware); // Bu satır kaldırıldı, her route'a ayrı ayrı eklendi

// Taksit planı oluştur
router.post('/', authMiddleware, PaymentPlanController.create);

// Cari hesaba ait planları listele
router.get('/account/:accountId', authMiddleware, PaymentPlanController.getByAccount);

// Tüm planları listele
router.get('/', authMiddleware, PaymentPlanController.getAll);

// Vadesi geçmiş taksitler
router.get('/overdue', authMiddleware, PaymentPlanController.getOverdue);

// Taksit öde
router.post('/schedule/:scheduleId/pay', authMiddleware, PaymentPlanController.payInstallment);

// Taksit iptal et
router.post('/schedule/:scheduleId/cancel', authMiddleware, PaymentPlanController.cancelInstallment);

// Tüm planı öde
router.post('/:id/pay-all', authMiddleware, PaymentPlanController.payAll);

// Planı iptal et
router.post('/:id/cancel', authMiddleware, PaymentPlanController.cancel);

// Planı kalıcı olarak sil
router.delete('/:id', authMiddleware, PaymentPlanController.destroy);

module.exports = router;
