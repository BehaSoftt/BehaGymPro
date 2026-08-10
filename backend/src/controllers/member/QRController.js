const QRCode = require('qrcode');
const CryptoJS = require('crypto-js');
const { Member, User, sequelize } = require('../../models');
const SecurityVault = require('../../utils/SecurityVault');
const GateService = require('../../services/training/GateService');
const { catchAsync, AppError } = require('../../middleware/errorHandler');

class QRController {
    /**
     * Dinamik QR Üret
     */
    static generateQR = catchAsync(async (req, res) => {
        const { id, role } = req.user;
        const rawData = JSON.stringify({ userId: id, type: role === 'MEMBER' ? 'MEMBER' : 'PERSONNEL', timestamp: Date.now() });
        const encrypted = CryptoJS.AES.encrypt(rawData, SecurityVault.get('jwt_secret')).toString();
        const qrImage = await QRCode.toDataURL(encrypted);

        res.json({ qrCode: encrypted, qrImage: qrImage, expiresIn: '60s' });
    });

    /**
     * Giriş Doğrula (Ana Kapı/Turnike)
     */
    static verifyEntry = catchAsync(async (req, res) => {
        const { qrData, manualCode, branchId, actionType } = req.body;
        let searchId = null;
        let type = null;

        // 1. Veriyi Çöz (QR veya Manuel)
        if (qrData) {
            try {
                const bytes = CryptoJS.AES.decrypt(qrData, SecurityVault.get('jwt_secret'));
                const decoded = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                searchId = decoded.userId;
                type = decoded.type;
            } catch (e) {
                // Şifreli değilse düz kod olarak dene
                const member = await Member.findOne({ where: { memberCode: qrData } });
                if (member) { searchId = member.id; type = 'MEMBER'; }
            }
        } else if (manualCode) {
            const member = await Member.findOne({ where: { memberCode: manualCode } });
            if (member) { searchId = member.id; type = 'MEMBER'; }
            else {
                const user = await User.findOne({ where: { personnelCode: manualCode } });
                if (user) { searchId = user.id; type = 'PERSONNEL'; }
            }
        }

        if (!searchId) throw new AppError('Geçersiz giriş verisi.', 400);

        // 2. Servis Üzerinden İşlemi Yap
        const result = await GateService.verifyEntry({ searchId, type, branchId, actionType }, req.user);

        // 3. Yanıtı Formatla
        const isMember = type === 'MEMBER';
        const entity = isMember ? result.member : result.user;

        res.json({
            status: 'GRANTED',
            triggerGate: true,
            name: isMember ? entity.fullName : entity.username,
            photo: isMember && entity.photo ? (entity.photo.startsWith('http') ? entity.photo : `http://${req.get('host')}${entity.photo}`) : null,
            message: result.currentAction === 'ENTRY' ? 'HOŞ GELDİNİZ!' : 'İYİ GÜNLER!',
            actionType: result.currentAction,
            isEarlyExit: result.isEarlyExit
        });
    });

    /**
     * Kapı İstatistikleri
     */
    static getGateStats = catchAsync(async (req, res) => {
        const { branchId } = req.query;
        const { companyId } = req.user;

        const entries = await sequelize.query(`
            SELECT COUNT(DISTINCT "memberId") as count FROM "AccessLogs" 
            WHERE "companyId" = :companyId AND "createdAt" >= CURRENT_DATE AND "actionType" = 'ENTRY'
        `, { replacements: { companyId }, type: sequelize.QueryTypes.SELECT });

        const inside = await Member.count({ where: { companyId, isInside: true, profileType: 'MEMBER' } });

        res.json({ entries: parseInt(entries[0].count || 0), inside });
    });
}

module.exports = QRController;
