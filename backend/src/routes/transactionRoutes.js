const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/finance/TransactionController');
const ROLES = require('../constants/roles');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), TransactionController.addTransaction);
router.get('/member/:memberId', authMiddleware, TransactionController.getMemberBalance);

module.exports = router;
