const express = require('express');
const router = express.Router();
const FinancialAccountController = require('../controllers/finance/FinancialAccountController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Tüm rotalar authentication gerektirir (her route'a ayrı ayrı eklendi)
// router.use(authMiddleware); // Bu satır kaldırıldı, her route'a ayrı ayrı eklendi

// Cari hesap listesi
router.get('/', authMiddleware, FinancialAccountController.getAll);

// İstatistikler
router.get('/stats', authMiddleware, FinancialAccountController.getStats);

// Tek cari hesap detayı
router.get('/:id', authMiddleware, FinancialAccountController.getById);

// Cari hesap güncelle
router.put('/:id', authMiddleware, FinancialAccountController.update);

// Cari hesap bakiyesini hareketlere göre yeniden hesapla/senkronize et
router.post('/:id/sync', authMiddleware, FinancialAccountController.syncAccount);

// Yeni işlem ekle
router.post('/:id/transactions', authMiddleware, FinancialAccountController.addTransaction);

// İşlem sil
router.delete('/transactions/:transactionId', authMiddleware, FinancialAccountController.deleteTransaction);

// Günlük kasa kapatma
router.post('/close-daily', authMiddleware, FinancialAccountController.closeBranchCash);
router.post('/close-branch-cash', authMiddleware, FinancialAccountController.closeBranchCash);

// Hesaplar Arası Transfer (Virman)
router.post('/transfer', authMiddleware, FinancialAccountController.transfer);

module.exports = router;
