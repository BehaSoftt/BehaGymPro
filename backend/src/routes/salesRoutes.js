const express = require('express');
const router = express.Router();
const SalesController = require('../controllers/finance/SalesController');
const ROLES = require('../constants/roles');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// Entity search routes (MUST be before /:id routes)
router.get('/entities/search', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), SalesController.searchEntities);
router.get('/entities/:id/account', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), SalesController.getEntityAccount);

// Sales history and quick products routes (MUST be before /:id routes)
router.get('/history/:entityId', authMiddleware, SalesController.getSalesHistory);
router.get('/quick-products', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), SalesController.getQuickProducts);

// Sales operation routes
router.post('/initiate', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), SalesController.initiateSale);
router.post('/validate-cart', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), SalesController.validateCart);
router.post('/complete', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), SalesController.completeSale);
router.post('/:id/cancel', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR]), SalesController.cancelSale);
router.get('/:id', authMiddleware, SalesController.getSaleDetails);

module.exports = router;
