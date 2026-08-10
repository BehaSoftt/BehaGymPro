const AuthService = require('../../services/auth/AuthService');
const { catchAsync } = require('../../middleware/errorHandler');

class AuthController {
    /**
     * Standart Giriş (Username/Email + Password)
     */
    static login = catchAsync(async (req, res) => {
        const { username, identifier, password } = req.body;
        const result = await AuthService.login(identifier || username, password);
        
        if (result.status === 'REQUIRE_2FA') {
            return res.json({ status: 'REQUIRE_2FA', userId: result.userId, message: 'Onay kodu gönderildi.' });
        }

        res.json({ message: 'Giriş başarılı.', ...result });
    });

    /**
     * 2FA Doğrulama
     */
    static verify2FA = catchAsync(async (req, res) => {
        const { userId, code } = req.body;
        const result = await AuthService.verify2FA(userId, code);
        res.json({ message: 'Doğrulama başarılı.', ...result });
    });

    /**
     * Kart veya QR ile Giriş
     */
    static cardLogin = catchAsync(async (req, res) => {
        const result = await AuthService.cardLogin(req.body.qrData);
        res.json({ message: 'Giriş başarılı.', ...result });
    });

    /**
     * Üye Girişi (Hızlı Portal)
     */
    static memberLogin = catchAsync(async (req, res) => {
        const { memberCode, phone } = req.body;
        const result = await AuthService.memberLogin(memberCode, phone);
        res.json({ message: 'Giriş başarılı.', ...result });
    });

    /**
     * Şifre Sıfırlama İsteği
     */
    static requestPasswordReset = catchAsync(async (req, res) => {
        res.json({ message: 'Şifre sıfırlama linki gönderildi.' });
    });

    /**
     * Kullanıcı Kaydı
     */
    static register = catchAsync(async (req, res) => {
        res.status(501).json({ message: 'Kayıt özelliği henüz aktif değil.' });
    });

    /**
     * Şifre Sıfırlama
     */
    static resetPassword = catchAsync(async (req, res) => {
        res.status(501).json({ message: 'Şifre sıfırlama özelliği henüz aktif değil.' });
    });
}

module.exports = AuthController;
