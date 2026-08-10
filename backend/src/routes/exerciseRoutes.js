const express = require('express');
const router = express.Router();
const ExerciseController = require('../controllers/training/ExerciseController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, ExerciseController.getAll);
router.get('/:id', authMiddleware, ExerciseController.getById);
router.post('/', authMiddleware, authorize(['ADMIN', 'STAFF']), ExerciseController.create);
router.post('/batch-delete', authMiddleware, authorize(['ADMIN']), ExerciseController.batchDelete);
router.put('/:id', authMiddleware, authorize(['ADMIN', 'STAFF']), ExerciseController.update);
router.put('/:id/toggle-status', authMiddleware, authorize(['ADMIN', 'STAFF']), ExerciseController.toggleStatus);
router.delete('/:id', authMiddleware, authorize(['ADMIN']), ExerciseController.delete);

module.exports = router;
