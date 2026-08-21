const { GroupClass, GroupClassMember, Member, User, SportSpecialty, Attendance, Branch, Company } = require('../../models');
const WhatsAppService = require('../notifications/WhatsAppService');

class GroupClassService {
    /**
     * Tüm grup derslerini filtreleyerek getirir
     */
    static async getAllGroups(user, filters = {}) {
        const { branchId, companyId, role } = user;
        const { page = 1, limit = 50, search } = filters;
        const { Op } = require('sequelize');
        const offset = (page - 1) * limit;
        const isSuperMaster = role === 'SUPER_MASTER';
        const where = isSuperMaster ? { companyId } : { branchId, companyId };

        if (search) {
            where.name = { [Op.iLike]: `%${search}%` };
        }

        const today = new Date().toISOString().split('T')[0];
        
        const { count, rows: groups } = await GroupClass.findAndCountAll({
            where,
            include: [
                { model: SportSpecialty, as: 'specialty', attributes: ['name'] },
                { model: Member, as: 'instructor', attributes: ['id', 'fullName', 'photo'], include: [{ model: User, as: 'user', attributes: ['username'] }] },
                { model: Member, as: 'enrolledMembers', attributes: ['id', 'fullName', 'photo'], through: { attributes: [] } },
                { model: Attendance, as: 'attendanceRecords', where: { date: today }, required: false }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true,
            order: [['createdAt', 'DESC']]
        });

        return {
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            groups
        };
    }

    /**
     * Gruba toplu üye kaydı yapar
     */
    static async enrollMembers(groupClassId, memberIds) {
        const { Op } = require('sequelize');
        const { LessonSchedule, GroupClass, GroupClassMember, Member, SportSpecialty } = require('../../models');
        const { AppError } = require('../../middleware/errorHandler');

        if (!groupClassId) throw new AppError('Grup seçilmedi.', 400);
        const targetIds = Array.isArray(memberIds) ? memberIds : [memberIds];
        const validMemberIds = targetIds.filter(id => id && typeof id === 'string');
        if (validMemberIds.length === 0) throw new AppError('En az bir geçerli üye seçilmelidir.', 400);

        const group = await GroupClass.findByPk(groupClassId);
        if (!group) throw new AppError('Grup bulunamadı.', 404);

        const groupSlots = Array.isArray(group.groupSchedules) && group.groupSchedules.length > 0
            ? group.groupSchedules
            : (Array.isArray(group.days) ? group.days : []).map(day => ({ day, startTime: group.startTime, endTime: group.endTime }));

        for (const memberId of validMemberIds) {
            const member = await Member.findByPk(memberId);
            if (!member) continue;

            for (const slot of groupSlots) {
                if (!slot || !slot.startTime || !slot.endTime) continue;

                // 1. Üyenin bu saatte başka bir BİREYSEL dersi var mı?
                if (slot.day !== undefined && slot.day !== null) {
                    const lessonOver = await LessonSchedule.findOne({
                        where: {
                            memberId,
                            isActive: true,
                            dayOfWeek: slot.day,
                            startTime: { [Op.lt]: slot.endTime },
                            endTime: { [Op.gt]: slot.startTime }
                        },
                        include: [{ model: SportSpecialty, as: 'specialty', attributes: ['name'] }]
                    }).catch(() => null);

                    if (lessonOver) {
                        throw new AppError(`ÇAKIŞMA: ${member.fullName} isimli üyenin bu saatte "${lessonOver.specialty?.name || 'Başka Bir'}" dersi var.`, 400);
                    }
                }

                // 2. Üyenin bu saatte başka bir GRUP dersi var mı?
                const existingGroupEnrollments = await GroupClassMember.findAll({
                    where: { memberId, groupClassId: { [Op.ne]: groupClassId } },
                    include: [{
                        model: GroupClass,
                        as: 'groupClass',
                        where: { status: 'ACTIVE' }
                    }]
                }).catch(() => []);

                for (const enroll of existingGroupEnrollments) {
                    const otherGroup = enroll.groupClass;
                    if (!otherGroup) continue;
                    const otherSlots = Array.isArray(otherGroup.groupSchedules) && otherGroup.groupSchedules.length > 0
                        ? otherGroup.groupSchedules
                        : (Array.isArray(otherGroup.days) ? otherGroup.days : []).map(d => ({ day: d, startTime: otherGroup.startTime, endTime: otherGroup.endTime }));

                    const overlapSlot = otherSlots.find(os => 
                        String(os.day) === String(slot.day) && 
                        (os.startTime < slot.endTime && os.endTime > slot.startTime)
                    );

                    if (overlapSlot) {
                        throw new AppError(`ÇAKIŞMA: ${member.fullName} zaten bu saatte "${otherGroup.name}" grubuna kayıtlı.`, 400);
                    }
                }
            }
        }

        const enrollments = validMemberIds.map(memberId => ({
            groupClassId,
            memberId,
            status: 'ENROLLED'
        }));
        return await GroupClassMember.bulkCreate(enrollments, { ignoreDuplicates: true });
    }

    /**
     * Grup üyelerine toplu mesaj gönderir
     */
    static async sendMassMessage(groupClassId, message) {
        const group = await GroupClass.findByPk(groupClassId, {
            include: [{ model: Member, as: 'enrolledMembers' }, { model: Branch, as: 'Branch', include: ['Company'] }]
        });

        if (!group) throw new Error('Grup bulunamadı.');
        const branch = group.Branch;
        if (!branch?.isWhatsAppEnabled) throw new Error('Bu şubede WhatsApp servisi aktif değil.');

        const identity = WhatsAppService.resolveIdentity(branch, branch.Company);
        let sentCount = 0;

        for (const member of group.enrolledMembers) {
            if (member.phone) {
                const finalMsg = WhatsAppService.getCustomGroupMessage(message, identity.companyName, identity.branchName, identity.phone);
                await WhatsAppService.sendAutoMessage(member.phone, finalMsg).catch(e => console.error(e));
                sentCount++;
            }
        }
        return sentCount;
    }
}

module.exports = GroupClassService;
