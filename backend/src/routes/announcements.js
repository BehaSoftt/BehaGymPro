const express = require('express');
const router = express.Router();
const AnnouncementController = require('../controllers/admin/AnnouncementController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Public endpoints can be added for member login check if needed, 
// for now keeping them all with auth for security.
router.get('/', authMiddleware, AnnouncementController.getAllAnnouncements);
router.post('/', authMiddleware, AnnouncementController.createAnnouncement);
router.put('/:id', authMiddleware, AnnouncementController.updateAnnouncement);
router.delete('/:id', authMiddleware, AnnouncementController.deleteAnnouncement);
router.get('/active', AnnouncementController.getActiveAnnouncements);

module.exports = router;
