const express = require('express');
const router = express.Router();
const LessonScheduleController = require('../controllers/lesson/LessonScheduleController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validation');

/**
 * Lesson Schedule Routes
 * All routes require authentication
 */

// Create lesson schedule
router.post('/', 
    authMiddleware, 
    validate('createLessonSchedule'), 
    LessonScheduleController.create
);

// Get all lesson schedules with filters
router.get('/', 
    authMiddleware, 
    LessonScheduleController.getAll
);

// Get calendar view
router.get('/calendar', 
    authMiddleware, 
    LessonScheduleController.getCalendar
);

// Update lesson schedule
router.put('/:id', 
    authMiddleware, 
    validate('updateLessonSchedule'), 
    LessonScheduleController.update
);

// Delete lesson schedule (soft delete)
router.delete('/:id', 
    authMiddleware, 
    LessonScheduleController.delete
);

module.exports = router;
