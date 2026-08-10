const express = require('express');
const router = express.Router();
const SportFormationController = require('../controllers/sport/SportFormationController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, SportFormationController.getAll);
router.post('/', authMiddleware, SportFormationController.create);
router.put('/:id', authMiddleware, SportFormationController.update);
router.delete('/:id', authMiddleware, SportFormationController.delete);

module.exports = router;
