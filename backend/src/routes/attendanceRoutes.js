const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/lesson/AttendanceController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/mark', authMiddleware, AttendanceController.markAttendance);
router.post('/private', authMiddleware, AttendanceController.createPrivateAttendance);
router.get('/group/:groupClassId', authMiddleware, AttendanceController.getGroupAttendance);
router.get('/private/:packageId', authMiddleware, AttendanceController.getPrivateAttendance);
router.delete('/:id', authMiddleware, AttendanceController.deleteAttendance);

module.exports = router;
