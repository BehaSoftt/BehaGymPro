const express = require('express');
const router = express.Router();
const SportEventController = require('../controllers/sport/SportEventController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, SportEventController.getAll);
router.post('/', authMiddleware, SportEventController.create);
router.put('/:id', authMiddleware, SportEventController.update);
router.delete('/:id', authMiddleware, SportEventController.delete);

module.exports = router;
