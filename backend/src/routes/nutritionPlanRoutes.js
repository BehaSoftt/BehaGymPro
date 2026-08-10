const express = require('express');
const router = express.Router();
const NutritionPlanController = require('../controllers/member/NutritionPlanController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// All routes require authentication and ADMIN/STAFF role
router.get(
  '/:memberId',
  authMiddleware,
  NutritionPlanController.getByMemberId
);

router.post(
  '/',
  authMiddleware,
  authorize(['ADMIN', 'STAFF']),
  NutritionPlanController.create
);

router.put(
  '/:memberId',
  authMiddleware,
  authorize(['ADMIN', 'STAFF']),
  NutritionPlanController.update
);

module.exports = router;
