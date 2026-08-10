const express = require('express');
const router = express.Router();
const SportSpecialtyController = require('../controllers/sport/SportSpecialtyController');
const ROLES = require('../constants/roles');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, SportSpecialtyController.getAll);
router.get('/:id', authMiddleware, SportSpecialtyController.getById);
router.post('/batch-delete', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR]), SportSpecialtyController.batchDelete);
router.post('/', authMiddleware, authorize([ROLES.ADMIN, ROLES.BRANCH_MASTER, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), SportSpecialtyController.create);
router.put('/:id/toggle-status', authMiddleware, authorize([ROLES.ADMIN, ROLES.BRANCH_MASTER, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), SportSpecialtyController.toggleStatus);
router.put('/:id', authMiddleware, authorize([ROLES.ADMIN, ROLES.BRANCH_MASTER, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), SportSpecialtyController.update);
router.delete('/:id', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR]), SportSpecialtyController.delete);

module.exports = router;
