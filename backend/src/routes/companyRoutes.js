const express = require('express');
const router = express.Router();
const CompanyController = require('../controllers/admin/CompanyController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// Only Super Master can manage companies
router.get('/', authMiddleware, CompanyController.getAll);
router.post('/', authMiddleware, authorize(['SUPER_MASTER']), CompanyController.create);
router.put('/:id', authMiddleware, authorize(['SUPER_MASTER']), CompanyController.update);
router.delete('/:id', authMiddleware, authorize(['SUPER_MASTER']), CompanyController.delete);

// Branch management
router.post('/:companyId/branches', authMiddleware, authorize(['SUPER_MASTER']), CompanyController.createBranch);
router.delete('/branches/:id', authMiddleware, authorize(['SUPER_MASTER']), CompanyController.deleteBranch);

module.exports = router;
