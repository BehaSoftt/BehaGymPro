const express = require('express');
const router = express.Router();
const BranchController = require('../controllers/admin/BranchController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, BranchController.getAll);
router.get('/:id', authMiddleware, BranchController.getById);
router.put('/:id', authMiddleware, BranchController.update);

module.exports = router;
