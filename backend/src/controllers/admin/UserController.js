const UserService = require('../../services/admin/UserService');
const { User, KioskConfig } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');
const os = require('os');

class UserController {
    /**
     * Tüm kullanıcıları listele
     */
    static getAllUsers = catchAsync(async (req, res) => {
        const users = await UserService.getAllUsers(req.query, req.user);
        res.json(users);
    });

    /**
     * Yeni kullanıcı oluştur
     */
    static createUser = catchAsync(async (req, res) => {
        const user = await UserService.createUser(req.body, req.user);
        res.status(201).json({ message: 'Kullanıcı ve profil başarıyla oluşturuldu.', user: { id: user.id, username: user.username } });
    });

    /**
     * Ayarları güncelle
     */
    static updateSettings = catchAsync(async (req, res) => {
        const user = await UserService.updateSettings(req.params.id, req.body, req.user);
        res.json({ message: 'Ayarlar güncellendi.', userId: user.id });
    });

    /**
     * Kullanıcı sil
     */
    static deleteUser = catchAsync(async (req, res) => {
        const user = await User.findByPk(req.params.id);
        if (!user) throw new AppError('Kullanıcı bulunamadı.', 404);
        if (user.role === 'SUPER_MASTER') throw new AppError('Süper Yönetici silinemez!', 403);

        await UserService.deleteUser(req.params.id);
        res.json({ message: 'Kullanıcı ve ilişkili profil başarıyla silindi.' });
    });

    /**
     * Kiosk ayarlarını kaydet
     */
    static saveKioskConfig = catchAsync(async (req, res) => {
        const { userId } = req.body;
        let config = await KioskConfig.findOne({ where: { userId } });
        
        if (config) await config.update(req.body);
        else config = await KioskConfig.create(req.body);

        res.json({ message: 'Kiosk ayarları kaydedildi.', config });
    });

    /**
     * Kiosk ayarlarını getir
     */
    static getKioskConfig = catchAsync(async (req, res) => {
        const config = await KioskConfig.findOne({ where: { userId: req.params.userId } });
        res.json(config || {});
    });

    /**
     * Sistem bilgisini getir
     */
    static getSystemInfo = catchAsync(async (req, res) => {
        res.json({
            hostname: os.hostname(),
            ips: Object.values(os.networkInterfaces()).flat().filter(i => i.family === 'IPv4' && !i.internal).map(i => i.address)
        });
    });

    /**
     * Kiosk kalp atışı (heartbeat)
     */
    static heartbeat = catchAsync(async (req, res) => {
        res.json({ status: 'ALIVE', timestamp: new Date() });
    });
}

module.exports = UserController;
