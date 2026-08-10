const express = require('express');
const router = express.Router();
const ExerciseCategoryController = require('../controllers/training/ExerciseCategoryController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, ExerciseCategoryController.getAll);
router.get('/:id', authMiddleware, ExerciseCategoryController.getById);
router.post('/batch-delete', authMiddleware, authorize(['ADMIN', 'BRANCH_MASTER', 'SUPER_MASTER']), ExerciseCategoryController.batchDelete);
router.post('/', authMiddleware, authorize(['ADMIN', 'BRANCH_MASTER', 'SUPER_MASTER']), ExerciseCategoryController.create);
router.put('/:id', authMiddleware, authorize(['ADMIN', 'BRANCH_MASTER', 'SUPER_MASTER']), ExerciseCategoryController.update);
router.delete('/:id', authMiddleware, authorize(['ADMIN', 'BRANCH_MASTER', 'SUPER_MASTER']), ExerciseCategoryController.delete);

module.exports = router;
