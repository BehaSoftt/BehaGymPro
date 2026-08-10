/**
 * BEHAGYM PRO: MERKEZI HATA YÖNETİMİ
 * Tüm hataları tek noktadan yönetir
 */

// Custom Error Class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'FAIL' : 'ERROR';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'ERROR';

    // Sequelize Hatalarını Yakala
    if (err.name === 'SequelizeUniqueConstraintError') {
        err.statusCode = 400;
        err.message = 'Bu kayıt (e-posta, telefon veya kod) zaten sistemde mevcut.';
        err.isOperational = true;
    }

    // Development Mode: Detaylı hata mesajı
    if (process.env.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            error: err,
            stack: err.stack
        });
    }

    // Production Mode: Kullanıcı dostu mesaj
    if (err.isOperational) {
        console.log(`[WARN] SİSTEM: ${err.message} (Status: ${err.statusCode})`);
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }

    // Beklenmeyen hatalar (Programming errors)
    console.error('💥 ERROR:', err.message);
    console.error('📌 STACK:', err.stack);
    return res.status(500).json({
        status: 'ERROR',
        message: err.message || 'Bir şeyler yanlış gitti.'
    });
};

// 404 Not Found Handler
const notFoundHandler = (req, res, next) => {
    const err = new AppError(`${req.originalUrl} endpoint'i bulunamadı.`, 404);
    next(err);
};

// Async Error Wrapper (Try-catch yazmamak için)
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = {
    AppError,
    errorHandler,
    notFoundHandler,
    catchAsync
};
