const express = require('express');
const router = express.Router();
const SettingController = require('../controllers/admin/SettingController');
const { authMiddleware } = require('../middleware/authMiddleware');

// ── Sabit prefix rotalar ÖNCE tanımlanmalı (Express sıralı eşleşir) ──────────

// GET /api/settings/scope/ui_font_config?companyId=xxx&branchId=yyy
// Kapsam önceliği: branch > company > global
router.get('/scope/:baseKey', authMiddleware, SettingController.getScopedSetting);

// GET /api/settings/list/ui_font_config — tüm kapsam varyantlarını listeler
router.get('/list/:baseKey', authMiddleware, SettingController.listScopedSettings);

// ── Dinamik :key rotaları ─────────────────────────────────────────────────────

// GET /api/settings/:key — tek ayarı getirir
router.get('/:key', authMiddleware, SettingController.getSetting);

// POST /api/settings/:key — upsert (oluştur veya güncelle)
router.post('/:key', authMiddleware, SettingController.updateSetting);

// DELETE /api/settings/:key — sil
router.delete('/:key', authMiddleware, SettingController.deleteSetting);

module.exports = router;
