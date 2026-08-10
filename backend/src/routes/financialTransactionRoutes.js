const express = require('express');
const router = express.Router();
const FinancialTransactionController = require('../controllers/finance/FinancialTransactionController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const ROLES = require('../constants/roles');

// Listele
router.get('/', authMiddleware, FinancialTransactionController.getAll);

// Oluştur
router.post('/', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), FinancialTransactionController.create);

// Sil
router.delete('/:id', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR]), FinancialTransactionController.delete);

module.exports = router;
