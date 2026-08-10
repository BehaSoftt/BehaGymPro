const RoleService = require('../../services/admin/RoleService');
const { Role, Permission } = require('../../models');
const { catchAsync } = require('../../middleware/errorHandler');

class RoleController {
    /**
     * Tüm rolleri yetkileriyle listele
     */
    static getAllRoles = catchAsync(async (req, res) => {
        const roles = await Role.findAll({
            include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }]
        });
        res.json(roles);
    });

    /**
     * Tüm yetki tanımlarını getir
     */
    static getAllPermissions = catchAsync(async (req, res) => {
        const permissions = await Permission.findAll({ order: [['name', 'ASC']] });
        res.json(permissions);
    });

    /**
     * Rol kaydet veya güncelle
     */
    static saveRole = catchAsync(async (req, res) => {
        const role = await RoleService.saveRole(req.body);
        res.json({ message: 'Rol başarıyla kaydedildi.', role });
    });

    /**
     * Rolü sil
     */
    static deleteRole = catchAsync(async (req, res) => {
        await RoleService.deleteRole(req.params.id);
        res.json({ message: 'Rol başarıyla silindi.' });
    });
}

module.exports = RoleController;
