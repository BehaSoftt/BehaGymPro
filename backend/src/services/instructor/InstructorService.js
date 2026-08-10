const { Member, User, Role, sequelize } = require('../../models');
const bcrypt = require('bcryptjs');
const FinancialAccountService = require('../finance/FinancialAccountService');

class InstructorService {
    /**
     * Yeni eğitmen ve bağlı kullanıcı hesabını oluşturur
     */
    static async createInstructor(data, reqUser) {
        return await sequelize.transaction(async (t) => {
            const { companyId, branchId: userBranchId } = reqUser;
            const { 
                username, fullName, password, email, isSystemUser,
                branchId: requestBranchId, ...instructorData 
            } = data;

            const finalBranchId = requestBranchId || userBranchId;
            let finalUsername = isSystemUser ? username : (fullName || username);
            let finalPassword = isSystemUser ? password : (Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8));

            const existing = await User.findOne({ where: { username: finalUsername }, transaction: t });
            if (existing) throw new Error('Bu kullanıcı adı zaten alınmış.');

            const instRole = await Role.findOne({ where: { name: 'EĞİTMEN' }, transaction: t });
            const hashedPassword = await bcrypt.hash(finalPassword, 10);

            const user = await User.create({
                username: finalUsername,
                email: isSystemUser ? email : null,
                passwordHash: hashedPassword,
                role: 'EĞİTMEN',
                roleId: instRole?.id,
                companyId,
                branchId: finalBranchId,
                isActive: true
            }, { transaction: t });

            const instructor = await Member.create({
                ...instructorData,
                userId: user.id,
                branchId: finalBranchId,
                companyId,
                fullName: fullName || finalUsername,
                profileType: 'INSTRUCTOR',
                isActive: true
            }, { transaction: t });

            await FinancialAccountService.createMemberAccount(instructor, t);

            return { user, instructor };
        });
    }

    /**
     * Eğitmen ve kullanıcı bilgilerini günceller
     */
    static async updateInstructor(id, data) {
        return await sequelize.transaction(async (t) => {
            const instructor = await Member.findByPk(id, { transaction: t });
            if (!instructor) throw new Error('Eğitmen bulunamadı.');

            const { 
                username, displayName, newPassword, isActive, user: userBody,
                ...rest 
            } = data;

            await instructor.update({
                ...rest,
                fullName: displayName || username || instructor.fullName,
                isActive: isActive !== undefined ? isActive : instructor.isActive
            }, { transaction: t });

            if (instructor.userId) {
                const user = await User.findByPk(instructor.userId, { transaction: t });
                if (user) {
                    const userUpdate = { isActive: instructor.isActive };
                    if (username && username !== user.username) {
                        const existing = await User.findOne({ where: { username }, transaction: t });
                        if (existing && existing.id !== user.id) throw new Error('Kullanıcı adı kullanımda.');
                        userUpdate.username = username;
                    }
                    if (newPassword) userUpdate.passwordHash = await bcrypt.hash(newPassword, 10);
                    if (userBody?.isTwoFactorEnabled !== undefined) userUpdate.isTwoFactorEnabled = userBody.isTwoFactorEnabled;
                    
                    await user.update(userUpdate, { transaction: t });
                }
            }
            return instructor;
        });
    }

    /**
     * Eğitmeni ve bağlı tüm verilerini siler
     */
    static async deleteInstructor(id) {
        return await sequelize.transaction(async (t) => {
            const instructor = await Member.findByPk(id, { transaction: t });
            if (!instructor) throw new Error('Eğitmen bulunamadı.');

            if (instructor.userId) await User.destroy({ where: { id: instructor.userId }, transaction: t });
            await instructor.destroy({ transaction: t });
            return true;
        });
    }
}

module.exports = InstructorService;
