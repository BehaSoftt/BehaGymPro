const express = require('express');
const router = express.Router();
const InstructorController = require('../controllers/instructor/InstructorController');
const ROLES = require('../constants/roles');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, InstructorController.getAll);
router.post('/', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), InstructorController.create);
router.put('/:id', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST]), InstructorController.update);

module.exports = router;
