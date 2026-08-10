const express = require('express');
const router = express.Router();
const MemberPackageController = require('../controllers/lesson/MemberPackageController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, MemberPackageController.create);
router.get('/member/:memberId', authMiddleware, MemberPackageController.getByMember);
router.post('/:id/use-session', authMiddleware, MemberPackageController.useSession);
router.delete('/:id', authMiddleware, MemberPackageController.delete);

module.exports = router;
