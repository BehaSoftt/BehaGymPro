const express = require('express');
const router = express.Router();
const MemberController = require('../controllers/member/MemberController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const { memberCreationLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validation');

const ROLES = require('../constants/roles');

router.get('/me/dashboard', authMiddleware, authorize([ROLES.MEMBER]), MemberController.getDashboardData);
router.get('/', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST, ROLES.USER]), MemberController.getAll);
router.get('/:id', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST, ROLES.USER]), MemberController.getById);
router.post('/', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST, ROLES.USER]), memberCreationLimiter, validate('createMember'), MemberController.create);
router.post('/bulk-delete', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR]), MemberController.bulkDelete);
router.put('/:id', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST, ROLES.USER]), validate('updateMember'), MemberController.update);
router.delete('/:id', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR]), MemberController.delete);
router.put('/:id/onboarding', authMiddleware, MemberController.updateOnboarding);

module.exports = router;
