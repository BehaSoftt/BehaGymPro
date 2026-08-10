const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth/AuthController');
const { loginLimiter, twoFALimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validation');

router.post('/login', loginLimiter, validate('login'), AuthController.login);
router.post('/member-login', loginLimiter, validate('memberLogin'), AuthController.memberLogin);
router.post('/card-login', loginLimiter, validate('cardLogin'), AuthController.cardLogin);
router.post('/verify-2fa', twoFALimiter, validate('verify2FA'), AuthController.verify2FA);
router.post('/register', AuthController.register);
router.post('/request-password-reset', loginLimiter, AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.resetPassword);

module.exports = router;
