const { Role, Permission, RolePermission, User, sequelize } = require('../../models');

class RoleService {
    /**
     * Rolü ve yetkilerini kaydeder (Add or Update)
     */
    static async saveRole(data) {
        return await sequelize.transaction(async (t) => {
            const { id, name, description, permissionIds } = data;
            let role;

            if (id) {
                role = await Role.findByPk(id, { transaction: t });
                if (!role) throw new Error('Rol bulunamadı.');
                await role.update({ name, description }, { transaction: t });
            } else {
                role = await Role.create({ name, description }, { transaction: t });
            }

            if (permissionIds && Array.isArray(permissionIds)) {
                await RolePermission.destroy({ where: { roleId: role.id }, transaction: t });
                const entries = permissionIds.map(pId => ({ roleId: role.id, permissionId: pId }));
                await RolePermission.bulkCreate(entries, { transaction: t });
            }

            return await Role.findByPk(role.id, {
                include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
                transaction: t
            });
        });
    }

    /**
     * Rolü güvenli bir şekilde siler
     */
    static async deleteRole(id) {
        return await sequelize.transaction(async (t) => {
            const role = await Role.findByPk(id, { transaction: t });
            if (!role) throw new Error('Rol bulunamadı.');
            if (role.isSystemRole) throw new Error('Sistem rolleri silinemez.');

            const userCount = await User.count({ where: { roleId: id }, transaction: t });
            if (userCount > 0) throw new Error('Bu role atanmış kullanıcılar var. Önce kullanıcıların rolünü değiştirin.');

            await RolePermission.destroy({ where: { roleId: id }, transaction: t });
            await role.destroy({ transaction: t });
            return true;
        });
    }
}

module.exports = RoleService;
