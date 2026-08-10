const express = require('express');
const router = express.Router();
const SportGroupController = require('../controllers/sport/SportGroupController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, SportGroupController.getAll);
router.post('/', authMiddleware, SportGroupController.create);
router.put('/:id', authMiddleware, SportGroupController.update);
router.delete('/:id', authMiddleware, SportGroupController.delete);

router.get('/:id/members', authMiddleware, SportGroupController.getMembers);
router.post('/:id/members', authMiddleware, SportGroupController.addMember);
router.delete('/:id/members/:memberId', authMiddleware, SportGroupController.removeMember);

module.exports = router;
