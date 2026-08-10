const { Member, AccessLog, User, TrainingPlan, Transaction, Branch, Company, sequelize } = require('../../models');
const { Op } = require('sequelize');
const AttendanceService = require('../../services/lesson/AttendanceService');

class GateService {
    /**
     * QR veya Manuel Kod ile girişi doğrular ve süreci yönetir
     */
    static async verifyEntry(data, currentUser) {
        const { searchId, type, branchId, actionType = 'ENTRY' } = data;
        
        if (type === 'MEMBER') {
            return await this.processMemberEntry(searchId, branchId, actionType);
        } else {
            return await this.processPersonnelEntry(searchId, branchId, actionType);
        }
    }

    static async processMemberEntry(memberId, branchId, actionType) {
        const member = await Member.findByPk(memberId, {
            include: ['Company', 'Branch']
        }) || await Member.findOne({ where: { userId: memberId }, include: ['Company', 'Branch'] });

        if (!member) throw new Error('Üye kaydı bulunamadı.');
        if (!member.isActive) throw new Error('Üyelik aktif değil.');

        const isSimulator = branchId === '00000000-0000-0000-0000-000000000000';
        const requestBranch = await Branch.findByPk(branchId) || (isSimulator ? null : await Branch.findByPk(member.branchId));

        // Paket ve Erişim Kontrolü
        const hasAccess = await this.checkMemberAccess(member);
        if (!hasAccess) throw new Error('Aktif bir üyelik veya paketiniz bulunmuyor.');

        // Giriş/Çıkış State Yönetimi
        const isInfoOnly = actionType === 'INFO';
        let currentAction = isInfoOnly ? 'INFO' : (member.isInside ? 'EXIT' : 'ENTRY');
        let isEarlyExit = false;

        if (!isInfoOnly) {
            if (currentAction === 'EXIT') {
                const lastEntry = await AccessLog.findOne({
                    where: { memberId: member.id, actionType: 'ENTRY', status: 'SUCCESS' },
                    order: [['createdAt', 'DESC']]
                });
                if (lastEntry) {
                    const duration = (new Date() - new Date(lastEntry.createdAt)) / (1000 * 60);
                    if (duration < 30) {
                        isEarlyExit = true;
                        await AttendanceService.cancelPendingAttendance(member.id);
                    } else {
                        await AttendanceService.completePendingAttendance(member.id);
                    }
                }
            }

            member.isInside = !member.isInside;
            await member.save();
            if (member.userId) await User.update({ isInside: member.isInside }, { where: { id: member.userId } });

            await AccessLog.create({
                memberId: member.id,
                branchId: branchId || member.branchId,
                status: 'SUCCESS',
                actionType: currentAction
            });

            if (currentAction === 'ENTRY') {
                await AttendanceService.processAutomatedAttendanceOnEntry(member, branchId || member.branchId).catch(e => console.error(e));
            }
        }

        return { member, currentAction, isEarlyExit, requestBranch };
    }

    static async checkMemberAccess(member) {
        // Personel/Eğitmen her türlü girebilir
        if (['INSTRUCTOR', 'PERSONNEL'].includes(member.profileType)) return true;

        const { MemberPackage, PrivateLessonPackage } = require('../../models');
        const [activePkgs, privatePkgs] = await Promise.all([
            MemberPackage.findAll({ where: { memberId: member.id, status: 'ACTIVE' } }),
            PrivateLessonPackage.findAll({ where: { memberId: member.id, status: 'ACTIVE', isArchived: false } })
        ]);

        const now = new Date();
        const hasActiveStd = activePkgs.some(p => !p.expiryDate || new Date(p.expiryDate) >= now);
        const hasActivePriv = privatePkgs.some(p => (!p.expiryDate || new Date(p.expiryDate) >= now) && p.remainingSessions > 0);
        
        return hasActiveStd || hasActivePriv || (member.expiryDate && new Date(member.expiryDate) >= now);
    }

    static async processPersonnelEntry(userId, branchId, actionType) {
        const user = await User.findByPk(userId);
        if (!user || (!user.isActive && user.role !== 'SUPER_MASTER')) throw new Error('Personel hesabı pasif.');

        user.isInside = !user.isInside;
        await user.save();

        const profile = await Member.findOne({ where: { userId: user.id } });
        if (profile) {
            profile.isInside = user.isInside;
            await profile.save();
        }

        return { user, currentAction: user.isInside ? 'ENTRY' : 'EXIT' };
    }
}

module.exports = GateService;
