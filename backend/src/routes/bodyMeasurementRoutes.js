const express = require('express');
const router = express.Router();
const BodyMeasurementController = require('../controllers/member/BodyMeasurementController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, BodyMeasurementController.getAll);
router.post('/', authMiddleware, authorize(['ADMIN', 'STAFF', 'MUDUR', 'INSTRUCTOR']), BodyMeasurementController.create);
router.delete('/:id', authMiddleware, authorize(['ADMIN', 'STAFF', 'MUDUR', 'INSTRUCTOR']), BodyMeasurementController.delete);

module.exports = router;
