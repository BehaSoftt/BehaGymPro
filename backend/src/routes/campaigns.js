const express = require('express');
const router = express.Router();
const CampaignController = require('../controllers/admin/CampaignController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, CampaignController.getAll);
router.post('/', authMiddleware, CampaignController.create);
router.put('/:id', authMiddleware, CampaignController.update);
router.delete('/:id', authMiddleware, CampaignController.delete);
router.get('/active', authMiddleware, CampaignController.getActiveCampaigns);

module.exports = router;
