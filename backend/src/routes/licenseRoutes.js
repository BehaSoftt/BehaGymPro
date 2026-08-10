const express = require('express');
const router = express.Router();
const licenseController = require('../controllers/admin/LicenseController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/generate', authMiddleware, licenseController.generateLicense);
router.post('/activate', authMiddleware, licenseController.activateLicense);
router.get('/status', authMiddleware, licenseController.checkLicenseStatus);
router.get('/all', authMiddleware, licenseController.getAllLicenses);
router.put('/:id', authMiddleware, licenseController.updateLicense);
router.delete('/:id', authMiddleware, licenseController.deleteLicense);

module.exports = router;
