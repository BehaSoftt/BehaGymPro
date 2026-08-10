const jwt = require('jsonwebtoken');
const SecurityVault = require('../utils/SecurityVault');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Yetkisiz erişim. Token bulunamadı.' });
    }

    try {
        const decoded = jwt.verify(token, SecurityVault.get('jwt_secret'));
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Geçersiz veya süresi dolmuş token.' });
    }
};

const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    // Karşılaştırma için rolleri büyük harfe çevir (Hata payını temizleyerek)
    const authorizedRoles = roles.filter(r => r && typeof r === 'string').map(r => r.toUpperCase());

    return (req, res, next) => {
        // req.user yoksa 401
        if (!req.user) {
            return res.status(401).json({ message: 'Yetkisiz erişim. Kullanıcı bilgisi bulunamadı.' });
        }

        const userRole = (req.user.role || '').trim().toUpperCase();

        // SUPER_MASTER veya behasoftt@gmail.com her şeye yetkilidir
        if (userRole === 'SUPER_MASTER' || req.user.email === 'behasoftt@gmail.com') {
            return next();
        }

        if (authorizedRoles.length && !authorizedRoles.includes(userRole)) {
            console.warn(`[AUTH] Access denied for user ${req.user.username} with role ${userRole}. Needed: ${authorizedRoles.join(', ')}`);
            return res.status(403).json({ message: 'Bu işlem için yetkiniz bulunmuyor.' });
        }
        next();
    };
};

module.exports = { authMiddleware, authorize };
