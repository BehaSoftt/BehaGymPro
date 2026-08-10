const express = require('express');
const router = express.Router();
const PackageController = require('../controllers/lesson/PackageController');
const ROLES = require('../constants/roles');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, PackageController.getAll);
router.post('/', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), PackageController.create);
router.post('/bulk-delete', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR]), PackageController.bulkDelete);
router.put('/:id', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), PackageController.update);
router.delete('/:id', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR]), PackageController.delete);

module.exports = router;
