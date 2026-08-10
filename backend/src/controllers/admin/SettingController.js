const { SystemSetting } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');

class SettingController {
    /**
     * Kapsam önceliğine göre ayarı getirir
     * branch > company > global
     */
    static getScopedSetting = catchAsync(async (req, res) => {
        const { baseKey } = req.params;
        const { companyId, branchId } = req.query;

        // Öncelik sırasına göre anahtarları hazırla
        const keys = [];
        if (branchId) keys.push(`${baseKey}_branch_${branchId}`);
        if (companyId) keys.push(`${baseKey}_company_${companyId}`);
        keys.push(baseKey); // global

        for (const key of keys) {
            const setting = await SystemSetting.findOne({ where: { key } });
            if (setting) return res.json(setting.value);
        }

        res.json(null);
    });

    /**
     * Belirli bir anahtarın tüm kapsam varyantlarını listeler
     */
    static listScopedSettings = catchAsync(async (req, res) => {
        const { baseKey } = req.params;
        const settings = await SystemSetting.findAll({
            where: {
                key: {
                    [require('sequelize').Op.like]: `${baseKey}%`
                }
            }
        });
        res.json(settings);
    });

    /**
     * Tek bir ayarı anahtarı ile getirir
     */
    static getSetting = catchAsync(async (req, res) => {
        const { key } = req.params;
        const setting = await SystemSetting.findOne({ where: { key } });
        res.json(setting ? setting.value : null);
    });

    /**
     * Ayarı oluştur veya güncelle (Upsert)
     */
    static updateSetting = catchAsync(async (req, res) => {
        const { key } = req.params;
        const { value, description, scope, companyId, branchId, label } = req.body;

        const [setting, created] = await SystemSetting.findOrCreate({
            where: { key },
            defaults: { value, description, scope, companyId, branchId, label }
        });

        if (!created) {
            await setting.update({ value, description, scope, companyId, branchId, label });
        }

        res.json({ message: created ? 'Ayar oluşturuldu.' : 'Ayar güncellendi.', setting });
    });

    /**
     * Ayarı sil
     */
    static deleteSetting = catchAsync(async (req, res) => {
        const { key } = req.params;
        const deleted = await SystemSetting.destroy({ where: { key } });
        if (!deleted) throw new AppError('Ayar bulunamadı.', 404);
        res.json({ message: 'Ayar silindi.' });
    });
}

module.exports = SettingController;
