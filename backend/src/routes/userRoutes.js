const express = require('express');
const router = express.Router();
const UserController = require('../controllers/admin/UserController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, UserController.getAllUsers);
router.post('/', authMiddleware, UserController.createUser);
router.put('/:id/settings', authMiddleware, UserController.updateSettings);
router.delete('/:id', authMiddleware, UserController.deleteUser);

// Kiosk Config Routes
router.post('/kiosk-config', authMiddleware, UserController.saveKioskConfig);
router.get('/kiosk-config/:userId', authMiddleware, UserController.getKioskConfig);
router.get('/system/info', authMiddleware, UserController.getSystemInfo);
router.post('/heartbeat', authMiddleware, UserController.heartbeat);

module.exports = router;
