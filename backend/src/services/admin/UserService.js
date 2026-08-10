const { User, Member, Role, KioskConfig, sequelize } = require('../../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const FinancialAccountService = require('../finance/FinancialAccountService');

class UserService {
    /**
     * Tüm kullanıcıları filtreleyerek getirir
     */
    static async getAllUsers(filters = {}, currentUser = {}) {
        const { branchId: userBranchId, role: userRole, username } = currentUser || {};
        const { branchId, companyId, page = 1, limit = 50 } = filters || {};
        const offset = (page - 1) * limit;

        const isSuperMaster = (userRole || '').toUpperCase() === 'SUPER_MASTER' || username === 'super_master';

        const where = {};
        if (!isSuperMaster) {
            if (userBranchId) where.branchId = userBranchId;
            where.role = { [Op.ne]: 'SUPER_MASTER' };
        } else {
            if (branchId) where.branchId = branchId;
            if (companyId) where.companyId = companyId;
        }

        const { count, rows: users } = await User.findAndCountAll({
            where,
            attributes: { exclude: ['passwordHash'] },
            include: [
                { model: Member, as: 'instructorProfile', attributes: ['id', 'fullName', 'photo', 'instructorCode'] },
                { model: Member, as: 'personnelProfile', attributes: ['id', 'fullName', 'photo', 'personnelCode'] },
                { model: Role, attributes: ['id', 'name'] }
            ],
            order: [['username', 'ASC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true
        });

        return {
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            users
        };
    }

    /**
     * Yeni kullanıcı ve profil oluşturur
     */
    static async createUser(userData, currentUser = {}) {
        let { username, password, role, roleId, email, branchId, companyId, fullName, phone, birthDate, personnelCode } = userData;

        companyId = companyId || currentUser?.companyId || null;
        branchId = branchId || currentUser?.branchId || null;

        const existing = await User.findOne({ where: { username } });
        if (existing) throw new Error('Bu kullanıcı adı zaten alınmış.');

        const passwordHash = await bcrypt.hash(password, 10);
        
        // Yetki Kontrolü: Sadece SUPER_MASTER yeni bir SUPER_MASTER oluşturabilir
        const finalRole = (role === 'SUPER_MASTER' && (currentUser?.role || '').toUpperCase() !== 'SUPER_MASTER') ? 'RECEPTIONIST' : (role || 'RECEPTIONIST');
        
        return await sequelize.transaction(async (t) => {
            const user = await User.create({
                username, passwordHash, role: finalRole, roleId: roleId || null,
                email: email || null, branchId: branchId || null, companyId: companyId || null,
                personnelCode: personnelCode || null, isActive: true
            }, { transaction: t });

            const humanRoles = ['INSTRUCTOR', 'MEMBER', 'RECEPTIONIST', 'ADMIN', 'BRANCH_MASTER', 'TERMINAL', 'USER'];
            if (humanRoles.includes(user.role)) {
                const profile = await Member.create({
                    userId: user.id, fullName: fullName || username, phone, birthDate: birthDate || null,
                    profileType: user.role === 'INSTRUCTOR' ? 'INSTRUCTOR' : (user.role === 'MEMBER' ? 'MEMBER' : (user.role === 'USER' ? 'USER' : 'PERSONNEL')),
                    branchId: user.branchId, companyId: user.companyId, isActive: true,
                    instructorCode: user.role === 'INSTRUCTOR' ? personnelCode : null,
                    memberCode: user.role === 'MEMBER' ? personnelCode : null,
                    personnelCode: !['INSTRUCTOR', 'MEMBER'].includes(user.role) ? personnelCode : null
                }, { transaction: t });

                await FinancialAccountService.createMemberAccount(profile, t);
            }

            return user;
        });
    }

    /**
     * Kullanıcı ayarlarını günceler
     */
    static async updateSettings(id, updateData, currentUser = {}) {
        const user = await User.findByPk(id);
        if (!user) throw new Error('Kullanıcı bulunamadı.');

        // Değiştirilebilir alanları sınırla (Güvenlik için whitelist)
        const allowedUpdates = { ...updateData };
        
        // Eğer güncellemeyi yapan kişi SUPER_MASTER değilse, kritik alanları koru
        if ((currentUser?.role || '').toUpperCase() !== 'SUPER_MASTER') {
            delete allowedUpdates.role;
            delete allowedUpdates.roleId;
            delete allowedUpdates.companyId;
            delete allowedUpdates.branchId;
        }

        if (allowedUpdates.password) {
            allowedUpdates.passwordHash = await bcrypt.hash(allowedUpdates.password, 10);
            delete allowedUpdates.password;
        }

        await user.update(allowedUpdates);

        // Profil senkronizasyonu
        const humanRoles = ['INSTRUCTOR', 'MEMBER', 'RECEPTIONIST', 'ADMIN', 'BRANCH_MASTER', 'TERMINAL', 'USER'];
        if (humanRoles.includes(user.role)) {
            const profile = await Member.findOne({ where: { userId: user.id } });
            if (profile) {
                await profile.update({
                    fullName: updateData.fullName || profile.fullName,
                    phone: updateData.phone || profile.phone,
                    branchId: updateData.branchId !== undefined ? updateData.branchId : profile.branchId,
                    profileType: user.role === 'INSTRUCTOR' ? 'INSTRUCTOR' : (user.role === 'MEMBER' ? 'MEMBER' : (user.role === 'USER' ? 'USER' : 'PERSONNEL')),
                    isActive: user.isActive
                });
            }
        }

        return user;
    }

    /**
     * Kullanıcıyı ve ilişkili profilini siler
     */
    static async deleteUser(id) {
        return await sequelize.transaction(async (t) => {
            const user = await User.findByPk(id);
            if (!user) throw new Error('Kullanıcı bulunamadı.');

            // İlişkili profili sil
            await Member.destroy({ 
                where: { userId: id },
                transaction: t 
            });

            // Kullanıcıyı sil
            await user.destroy({ transaction: t });
            return true;
        });
    }
}

module.exports = UserService;
