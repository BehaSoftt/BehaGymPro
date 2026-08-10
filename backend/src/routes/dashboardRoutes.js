const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboard/DashboardController');
const ROLES = require('../constants/roles');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, authorize([ROLES.ADMIN, ROLES.SUPER_MASTER, ROLES.MUDUR, ROLES.RECEPTIONIST, ROLES.USER, ROLES.STAFF]), DashboardController.getStats);

module.exports = router;
