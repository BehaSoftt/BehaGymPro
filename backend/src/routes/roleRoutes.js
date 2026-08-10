const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/admin/RoleController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// Tüm rotalar korumalı
router.use(authMiddleware);

router.get('/', authorize(['SUPER_MASTER', 'BRANCH_MASTER', 'ADMIN', 'RECEPTIONIST', 'INSTRUCTOR', 'EĞİTMEN', 'TERMINAL', 'STAFF', 'PERSONNEL', 'MANAGER', 'USER', 'MUDUR']), RoleController.getAllRoles);
router.get('/permissions', authorize(['SUPER_MASTER', 'BRANCH_MASTER', 'ADMIN', 'MUDUR']), RoleController.getAllPermissions);
router.post('/', authorize(['SUPER_MASTER', 'BRANCH_MASTER', 'ADMIN', 'MUDUR']), RoleController.saveRole);
router.put('/:id', authorize(['SUPER_MASTER', 'BRANCH_MASTER', 'ADMIN', 'MUDUR']), RoleController.saveRole);
router.delete('/:id', authorize(['SUPER_MASTER', 'BRANCH_MASTER', 'ADMIN', 'MUDUR']), RoleController.deleteRole);

module.exports = router;
