const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
// PKG (EXE) ortamında __dirname sanal bir snapshot içindedir ve yazma yapılamaz.
// Bu yüzden gerçek çalışma dizini olan process.cwd() kullanıyoruz.
const isPkg = typeof process.pkg !== 'undefined';
const uploadDir = isPkg
    ? path.join(path.dirname(process.execPath), 'uploads')
    : path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only (case-insensitive)
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

module.exports = upload;
