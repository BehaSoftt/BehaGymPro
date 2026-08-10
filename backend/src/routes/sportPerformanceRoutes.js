const express = require('express');
const router = express.Router();
const SportPerformanceController = require('../controllers/member/SportPerformanceController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/event/:eventId', authMiddleware, SportPerformanceController.getByEvent);
router.get('/member/:memberId', authMiddleware, SportPerformanceController.getByMember);
router.post('/upsert', authMiddleware, SportPerformanceController.upsert);

module.exports = router;
