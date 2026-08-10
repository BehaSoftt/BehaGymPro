const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    message: 'Dosya boyutu çok büyük. Maksimum 10MB yükleyebilirsiniz.',
                    error: 'FILE_TOO_LARGE',
                    maxSize: '10MB'
                });
            }
            if (err.message === 'Only image files are allowed!') {
                return res.status(400).json({
                    message: 'Sadece resim dosyaları yüklenebilir (jpg, jpeg, png, gif).',
                    error: 'INVALID_FILE_TYPE'
                });
            }
            return res.status(500).json({
                message: 'Dosya yüklenirken bir hata oluştu.',
                error: err.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: 'Dosya seçilmedi.',
                error: 'NO_FILE'
            });
        }

        const filePath = `/uploads/${req.file.filename}`;
        res.json({ filePath });
    });
});

module.exports = router;
