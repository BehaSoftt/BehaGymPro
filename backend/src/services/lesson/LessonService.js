const { LessonSchedule, Member, GroupClass, GroupClassMember, Attendance, Branch, Company, SportSpecialty, ExerciseCategory } = require('../../models');
const { Op } = require('sequelize');
const WhatsAppService = require('../notifications/WhatsAppService');

class LessonService {
    /**
     * Tüm ders programlarını filtreleyerek getirir
     */
    static async getAllLessons(filters, user) {
        const { instructorId, dayOfWeek, memberId, lessonType, branchId: queryBranchId } = filters;
        const { branchId: userBranchId, companyId, role } = user;

        const where = { isActive: true, companyId };
        if (role !== 'SUPER_MASTER') where.branchId = queryBranchId || userBranchId;
        else if (queryBranchId) where.branchId = queryBranchId;

        if (instructorId) where.instructorId = instructorId;
        if (dayOfWeek !== undefined) where.dayOfWeek = parseInt(dayOfWeek);
        if (memberId) where.memberId = memberId;
        if (lessonType) where.lessonType = lessonType;

        return await LessonSchedule.findAll({
            where,
            include: [
                { model: Member, as: 'instructor', attributes: ['id', 'fullName', 'photo'] },
                { model: Member, as: 'member', attributes: ['id', 'fullName', 'phone'] },
                { model: GroupClass, as: 'groupClass', attributes: ['id', 'name'] }
            ],
            order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
        });
    }

    /**
     * Yeni ders programı oluşturur
     */
    static async createLesson(data, user) {
        const { instructorId, memberId, specialtyId, categoryId, dayOfWeek, startTime, endTime, lessonType, groupClassId, notes } = data;
        const { branchId, companyId } = user;

        // Çakışma Kontrolü
        await this.checkOverlaps({
            instructorId,
            memberId,
            dayOfWeek,
            startTime,
            endTime,
            companyId,
            excludeScheduleId: null
        });

        const schedule = await LessonSchedule.create({
            instructorId, memberId: memberId || null, specialtyId: specialtyId || null,
            categoryId: categoryId || null,
            dayOfWeek, startTime, endTime, lessonType, groupClassId: groupClassId || null,
            notes, branchId, companyId
        });

        const fullSchedule = await LessonSchedule.findByPk(schedule.id, {
            include: [
                { model: Member, as: 'instructor', attributes: ['id', 'fullName', 'instructorCode'] },
                { model: Member, as: 'member', attributes: ['id', 'fullName', 'phone'] }
            ]
        });

        // WhatsApp Bildirimi
        if (memberId && fullSchedule.member?.phone) {
            this.sendLessonNotification(fullSchedule, false).catch(e => console.error(e));
        }

        return fullSchedule;
    }

    /**
     * Takvim verilerini (Özel ve Grup Dersleri) getirir
     */
    static async getCalendarData(filters, user) {
        try {
            const { instructorId, lessonType, branchId: queryBranchId } = filters;
            const { branchId: userBranchId, companyId, role } = user;

            const baseWhere = { companyId };
            if (role !== 'SUPER_MASTER') baseWhere.branchId = queryBranchId || userBranchId;
            else if (queryBranchId) baseWhere.branchId = queryBranchId;

            console.log('[LessonService] [DEBUG] Starting getCalendarData');
            console.log('[LessonService] [DEBUG] Filters:', JSON.stringify(filters));

            // Özel Dersler
            console.log('[LessonService] [DEBUG] Fetching private lessons...');
            const privateLessons = await LessonSchedule.findAll({
                where: { ...baseWhere, isActive: true, lessonType: { [Op.ne]: 'GROUP' } },
                include: [
                    { model: Member, as: 'instructor', attributes: ['id', 'fullName', 'photo'] },
                    { model: Member, as: 'member', attributes: ['id', 'fullName', 'photo'] },
                    { model: SportSpecialty, as: 'specialty', attributes: ['id', 'name'] },
                    { model: ExerciseCategory, as: 'category', attributes: ['id', 'name'] }
                ]
            });
            console.log(`[LessonService] [DEBUG] Found ${privateLessons.length} private lessons.`);

            // Grup Dersleri
            console.log('[LessonService] [DEBUG] Fetching group classes...');
            const groupClasses = await GroupClass.findAll({
                where: { ...baseWhere, status: 'ACTIVE', ...(instructorId ? { instructorId } : {}) },
                include: [
                    { model: Member, as: 'instructor', attributes: ['id', 'fullName'] }, 
                    { model: SportSpecialty, as: 'specialty', attributes: ['id', 'name'] }
                ]
            });
            console.log(`[LessonService] [DEBUG] Found ${groupClasses.length} group classes.`);

            console.log('[LessonService] [DEBUG] Fetching attendances...');
            const today = new Date().toISOString().split('T')[0];
            const attendances = await Attendance.findAll({ where: { date: today, companyId } });
            console.log(`[LessonService] [DEBUG] Found ${attendances.length} attendances for today.`);

            const mappedGroupLessons = [];
            groupClasses.forEach(gc => {
                let days = [];
                try {
                    if (Array.isArray(gc.days)) {
                        days = gc.days;
                    } else if (typeof gc.days === 'string') {
                        if (gc.days.startsWith('[') || gc.days.startsWith('{')) {
                            days = JSON.parse(gc.days);
                        } else if (gc.days.includes(',')) {
                            days = gc.days.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
                        } else if (gc.days.trim() !== '') {
                            days = [parseInt(gc.days.trim())];
                        }
                    }
                } catch (e) {
                    console.error(`[LessonService] [DEBUG] Error parsing days for GroupClass ${gc.id}:`, e.message);
                }

                if (!Array.isArray(days)) days = [];
                
                days.forEach(day => {
                    mappedGroupLessons.push({
                        id: `group-${gc.id}-${day}`, 
                        groupClassId: gc.id, 
                        dayOfWeek: parseInt(day),
                        startTime: gc.startTime, 
                        endTime: gc.endTime, 
                        lessonType: 'GROUP',
                        name: gc.name, 
                        instructor: gc.instructor ? gc.instructor.toJSON() : null, 
                        specialty: gc.specialty ? gc.specialty.toJSON() : null,
                        categoryId: gc.categoryId,
                        isGroupClass: true
                    });
                });
            });
            console.log(`[LessonService] [DEBUG] Mapped ${mappedGroupLessons.length} group lessons.`);

            const result = [...privateLessons.map(l => {
                const data = l.toJSON();
                if (l.memberId) {
                    const att = attendances.find(a => a.memberId === l.memberId);
                    if (att) data.attendanceStatus = att.status === 'PENDING' ? 'INSIDE' : att.status;
                }
                return data;
            }), ...mappedGroupLessons];

            console.log('[LessonService] [DEBUG] Returning total result count:', result.length);
            return result;
        } catch (error) {
            console.error('[LessonService] getCalendarData FATAL ERROR:', error);
            throw error;
        }
    }

    /**
     * Ders programı günceller
     */
    static async updateLesson(id, data, user) {
        const schedule = await LessonSchedule.findByPk(id);
        if (!schedule) throw new Error('Ders programı bulunamadı.');

        const { instructorId, memberId, dayOfWeek, startTime, endTime } = { ...schedule.toJSON(), ...data };
        const { companyId } = user;

        // Çakışma Kontrolü
        await this.checkOverlaps({
            instructorId,
            memberId,
            dayOfWeek: parseInt(dayOfWeek),
            startTime,
            endTime,
            companyId,
            excludeScheduleId: id
        });

        await schedule.update(data);
        
        // Güncelleme sonrası bildirim
        if (schedule.memberId) {
            const updated = await LessonSchedule.findByPk(id, { include: [
                { model: Member, as: 'instructor', attributes: ['id', 'fullName', 'instructorCode'] },
                { model: Member, as: 'member', attributes: ['id', 'fullName', 'phone'] }
            ] });
            await this.sendLessonNotification(updated, true);
        }

        return schedule;
    }

    /**
     * Genel çakışma kontrolü (Eğitmen ve Üye için)
     */
    static async checkOverlaps({ instructorId, memberId, dayOfWeek, startTime, endTime, companyId, excludeScheduleId, excludeGroupClassId }) {
        const timeOverlap = {
            [Op.or]: [
                { startTime: { [Op.lt]: endTime }, endTime: { [Op.gt]: startTime } }
            ]
        };

        // 1. Eğitmen Çakışması (LessonSchedule)
        if (instructorId) {
            const instOver = await LessonSchedule.findOne({
                where: {
                    instructorId, dayOfWeek, companyId, isActive: true,
                    ...(excludeScheduleId ? { id: { [Op.ne]: excludeScheduleId } } : {}),
                    ...timeOverlap
                }
            });
            if (instOver) throw new Error(`EĞİTMEN ÇAKIŞMASI: Bu eğitmenin bu saatler arasında (${instOver.startTime}-${instOver.endTime}) zaten bir dersi var.`);
            
            // 1b. Eğitmenin Grup Dersi Çakışması
            const instGroupOver = await GroupClass.findOne({
                where: {
                    instructorId, companyId, status: 'ACTIVE',
                    ...(excludeGroupClassId ? { id: { [Op.ne]: excludeGroupClassId } } : {}),
                    days: { [Op.contains]: [dayOfWeek] },
                    ...timeOverlap
                }
            });
            if (instGroupOver) throw new Error(`EĞİTMEN ÇAKIŞMASI: Bu eğitmenin bu saatte "${instGroupOver.name}" grup dersi var.`);
        }

        // 2. Üye Çakışması (LessonSchedule)
        if (memberId) {
            const memOver = await LessonSchedule.findOne({
                where: {
                    memberId, dayOfWeek, companyId, isActive: true,
                    ...(excludeScheduleId ? { id: { [Op.ne]: excludeScheduleId } } : {}),
                    ...timeOverlap
                }
            });
            if (memOver) throw new Error(`ÜYE ÇAKIŞMASI: Bu üyenin bu saatte (${memOver.startTime}-${memOver.endTime}) başka bir dersi var.`);

            // 2b. Üyenin Kayıtlı Olduğu Grup Dersi Çakışması
            const memGroupEnrollments = await GroupClassMember.findAll({
                where: { memberId },
                include: [{
                    model: GroupClass,
                    as: 'groupClass',
                    where: {
                        companyId, status: 'ACTIVE',
                        ...(excludeGroupClassId ? { id: { [Op.ne]: excludeGroupClassId } } : {}),
                        days: { [Op.contains]: [dayOfWeek] },
                        ...timeOverlap
                    }
                }]
            });
            if (memGroupEnrollments.length > 0) {
                const gc = memGroupEnrollments[0].groupClass;
                throw new Error(`ÜYE ÇAKIŞMASI: Bu üyenin bu saatte "${gc.name}" grup dersi var.`);
            }
        }
    }

    static async sendLessonNotification(schedule, isUpdate) {
        const branch = await Branch.findByPk(schedule.branchId, { include: ['Company'] });
        if (branch?.isWhatsAppEnabled) {
            const msg = WhatsAppService.getLessonScheduleNotification(schedule.member, schedule, isUpdate, branch.Company?.name, branch.name, branch.phone);
            await WhatsAppService.sendAutoMessage(schedule.member.phone, msg).catch(e => console.error(e));
        }
    }
}

module.exports = LessonService;
