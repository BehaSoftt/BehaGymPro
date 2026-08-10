const express = require('express');
const router = express.Router();
const TrainingPlanController = require('../controllers/training/TrainingPlanController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// Instructor Progress Tracking & Overrides (Higher Priority than /:id)
router.get('/instructor/dashboard', authMiddleware, authorize(['ADMIN', 'STAFF', 'INSTRUCTOR', 'EĞİTMEN', 'MASTER', 'MUDUR', 'RECEPTIONIST', 'SUPER_MASTER']), TrainingPlanController.getInstructorDashboardLogs);
router.post('/instructor/override', authMiddleware, authorize(['ADMIN', 'STAFF', 'INSTRUCTOR', 'EĞİTMEN', 'MASTER', 'MUDUR', 'RECEPTIONIST', 'SUPER_MASTER']), TrainingPlanController.overrideLogActivity);

// Logging Routes
router.get('/logs/all', authMiddleware, authorize(['ADMIN', 'STAFF', 'INSTRUCTOR', 'EĞİTMEN', 'MASTER', 'MUDUR', 'RECEPTIONIST', 'SUPER_MASTER']), TrainingPlanController.getLogs);
router.post('/log/activity', authMiddleware, TrainingPlanController.logActivity);
router.post('/log/batch-activity', authMiddleware, TrainingPlanController.logBatchActivity);

router.get('/', authMiddleware, TrainingPlanController.getAll);
router.get('/active', authMiddleware, TrainingPlanController.getActivePlan);
router.post('/', authMiddleware, authorize(['ADMIN', 'STAFF', 'INSTRUCTOR', 'EĞİTMEN', 'MUDUR', 'RECEPTIONIST', 'SUPER_MASTER', 'USER']), TrainingPlanController.create);
router.post('/bulk-delete', authMiddleware, authorize(['ADMIN', 'INSTRUCTOR', 'EĞİTMEN', 'MUDUR', 'RECEPTIONIST', 'SUPER_MASTER', 'USER']), TrainingPlanController.bulkDelete);
router.get('/:id', authMiddleware, TrainingPlanController.getById);
router.put('/:id', authMiddleware, authorize(['ADMIN', 'STAFF', 'INSTRUCTOR', 'EĞİTMEN', 'MUDUR', 'RECEPTIONIST', 'SUPER_MASTER', 'USER']), TrainingPlanController.update);
router.delete('/:id', authMiddleware, authorize(['ADMIN', 'INSTRUCTOR', 'EĞİTMEN', 'MUDUR', 'RECEPTIONIST', 'SUPER_MASTER', 'USER']), TrainingPlanController.delete);

module.exports = router;
