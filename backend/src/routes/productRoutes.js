const express = require('express');
const router = express.Router();
const { ProductController, uploadProductImage } = require('../controllers/admin/ProductController');
const ROLES = require('../constants/roles');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// Product group routes (MUST be before /:id routes)
router.post('/groups', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), ProductController.createProductGroup);
router.get('/groups', authMiddleware, ProductController.getProductGroups);
router.put('/groups/:id', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), ProductController.updateProductGroup);
router.delete('/groups/:id', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR]), ProductController.deleteProductGroup);

// Product unit routes
router.post('/units', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), ProductController.createProductUnit);
router.get('/units', authMiddleware, ProductController.getProductUnits);
router.put('/units/:id', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), ProductController.updateProductUnit);
router.delete('/units/:id', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR]), ProductController.deleteProductUnit);

// Product routes
router.post('/', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), ProductController.createProduct);
router.get('/', authMiddleware, ProductController.getProducts);
router.get('/favorites', authMiddleware, ProductController.getFavoriteProducts);
router.get('/:id', authMiddleware, ProductController.getProductById);
router.put('/:id', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), ProductController.updateProduct);
router.delete('/:id', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR]), ProductController.deactivateProduct);
router.post('/bulk-update-stock', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), ProductController.bulkUpdateStock);
router.post('/:id/upload-image', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), uploadProductImage, ProductController.uploadProductImage);
router.put('/:id/toggle-favorite', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), ProductController.toggleFavorite);

module.exports = router;
