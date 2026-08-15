const rateLimit = require('express-rate-limit');

/**
 * BEHAGYM PRO: RATE LIMITING MIDDLEWARE
 * Brute-force ve DDoS saldırılarına karşı koruma
 */

// Genel API Rate Limiter (Tüm endpoint'ler için)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 1000, // IP başına maksimum 1000 istek (development için artırıldı)
    message: {
        status: 'ERROR',
        message: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Login Endpoint Rate Limiter (Terminal ve test süreçleri için artırıldı)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 50, // IP başına maksimum 50 giriş denemesi (Yerel terminal kurulumları için gevşetildi)
    skipSuccessfulRequests: true, // Başarılı girişler sayılmaz
    message: {
        status: 'ERROR',
        message: 'Çok fazla başarısız giriş denemesi. Hesabınız 15 dakika kilitlendi.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 2FA Verification Rate Limiter
const twoFALimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 dakika
    max: 3, // Maksimum 3 kod denemesi
    message: {
        status: 'ERROR',
        message: 'Çok fazla doğrulama kodu denemesi. Lütfen 10 dakika sonra tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Member Creation Rate Limiter (Spam kayıt önleme)
const memberCreationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 saat
    max: 1000, // Saatte maksimum 1000 üye kaydı (Salon kayıtları için genişletildi)
    message: {
        status: 'ERROR',
        message: 'Çok fazla üye kaydı yapıldı. Lütfen 1 saat sonra tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    loginLimiter,
    twoFALimiter,
    memberCreationLimiter
};
