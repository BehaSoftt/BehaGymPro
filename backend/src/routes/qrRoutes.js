const express = require('express');
const router = express.Router();
const QRController = require('../controllers/member/QRController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// QR kodunu alır (Üye veya Personel)
router.get('/generate', authMiddleware, QRController.generateQR);

// Turnike/Okuyucu QR kodunu veya Barkodu doğrular
router.post('/verify', authMiddleware, QRController.verifyEntry);

// Geçiş istatistiklerini getir
router.get('/stats', authMiddleware, QRController.getGateStats);

module.exports = router;
