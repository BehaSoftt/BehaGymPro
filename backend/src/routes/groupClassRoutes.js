const express = require('express');
const router = express.Router();
const GroupClassController = require('../controllers/lesson/GroupClassController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, GroupClassController.create);
router.get('/', authMiddleware, GroupClassController.getAll);
router.put('/:id', authMiddleware, GroupClassController.update);
router.delete('/:id', authMiddleware, GroupClassController.delete);
router.post('/enroll', authMiddleware, GroupClassController.enrollMember);
router.post('/unenroll', authMiddleware, GroupClassController.unenrollMember);
router.post('/message/:id', authMiddleware, GroupClassController.sendMassMessage);

module.exports = router;
