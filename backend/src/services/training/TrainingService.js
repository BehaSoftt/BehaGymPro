const { TrainingPlan, TrainingPlanItem, TrainingPlanDay, Exercise, Member, MembershipPackage, SportSpecialty, ExerciseCategory, TrainingLog, LessonSchedule } = require('../../models');
const { Op } = require('sequelize');
const WhatsAppService = require('../../services/notifications/WhatsAppService');

class TrainingService {
    /**
     * Tüm planları filtreleyerek getirir
     */
    static async getAllPlans(filters, user) {
        const { branchId, companyId, role } = user;
        const { memberId, isTemplate, page = 1, limit = 50, search } = filters;
        const offset = (page - 1) * limit;

        const isSuperMaster = role === 'SUPER_MASTER';
        const where = {};
        if (!isSuperMaster) {
            if (companyId) where.companyId = companyId;
            if (filters.branchId) where.branchId = filters.branchId;
        } else {
            if (filters.branchId) where.branchId = filters.branchId;
        }

        if (memberId) where.memberId = memberId;
        if (isTemplate === 'true') where.memberId = null;
        if (search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { '$member.fullName$': { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows: plans } = await TrainingPlan.findAndCountAll({
            where,
            include: [
                { model: TrainingPlanDay, as: 'days', separate: true },
                {
                    model: TrainingPlanItem,
                    as: 'items',
                    separate: true,
                    include: [{
                        model: Exercise,
                        as: 'exercise',
                        include: [{ model: ExerciseCategory, as: 'category', attributes: ['name'] }]
                    }]
                },
                { model: Member, as: 'member' },
                { model: Member, as: 'instructor', attributes: ['id', 'fullName', 'photo'] },
                {
                    model: MembershipPackage,
                    as: 'package',
                    include: [{ model: SportSpecialty, as: 'specialty', attributes: ['name'] }]
                }
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
            plans
        };
    }

    /**
     * Haftanın 7 gününü eksiksiz hazırlar
     */
    static ensureAllSevenDays(days = [], items = []) {
        const result = [];
        for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
            const existing = days.find(d => Number(d.dayOfWeek) === dayIdx);
            const hasItems = items.some(i => Number(i.dayOfWeek) === dayIdx);

            if (existing) {
                result.push({
                    ...existing,
                    dayOfWeek: dayIdx,
                    startTime: existing.startTime || '09:00',
                    endTime: existing.endTime || '10:30',
                    isRestDay: existing.isRestDay !== undefined
                        ? (existing.isRestDay === true || existing.isRestDay === 'true')
                        : !hasItems
                });
            } else {
                result.push({
                    dayOfWeek: dayIdx,
                    startTime: '09:00',
                    endTime: '10:30',
                    isRestDay: !hasItems
                });
            }
        }
        return result;
    }

    /**
     * Yeni antrenman planı oluşturur
     */
    static async createPlan(planData, currentUser) {
        const { title, description, memberId, packageId, specialtyId, instructorId, startDate, endDate, items, days, level, isActive } = planData;
        const { branchId, companyId } = currentUser;

        let finalInstructorId = instructorId;
        if (!finalInstructorId && memberId) {
            const member = await Member.findByPk(memberId);
            if (member?.privateLessonInstructorId) {
                finalInstructorId = member.privateLessonInstructorId;
            }
        }
        if (!finalInstructorId) {
            const instructor = await Member.findOne({ where: { userId: currentUser.id, profileType: 'INSTRUCTOR' } });
            finalInstructorId = instructor?.id;
            if (!finalInstructorId && companyId) {
                const anyInstructor = await Member.findOne({ where: { companyId, profileType: 'INSTRUCTOR' } });
                finalInstructorId = anyInstructor?.id;
            }
        }
        
        const plan = await TrainingPlan.create({
            title, description, memberId: memberId || null, packageId: packageId || null,
            specialtyId: specialtyId || null, instructorId: finalInstructorId,
            branchId, companyId, startDate, endDate, level: level || 1,
            isActive: isActive !== undefined ? isActive : true
        });

        if (items && items.length > 0) {
            const planItems = items
                .filter(item => item.exerciseId)
                .map(item => ({ ...item, planId: plan.id, id: undefined }));
            await TrainingPlanItem.bulkCreate(planItems);
        }

        const fullDays = this.ensureAllSevenDays(days || [], items || []);
        const planDays = fullDays.map(day => ({
            ...day,
            planId: plan.id,
            id: undefined,
            isRestDay: day.isRestDay === true || day.isRestDay === 'true'
        }));
        await TrainingPlanDay.bulkCreate(planDays);

        // Otomasyonlar
        if (memberId) {
            this.syncSchedules(plan.id).catch(e => console.error('Sync Error:', e));
            this.sendWhatsAppNotification(memberId, plan).catch(e => console.error('WhatsApp Error:', e));
        }

        return plan;
    }

    /**
     * Var olan antrenman planını ve ilişkili öğeleri günceller
     */
    static async updatePlan(planId, planData, currentUser) {
        const { title, description, memberId, packageId, specialtyId, instructorId, startDate, endDate, items, days, level, isActive } = planData;

        const plan = await TrainingPlan.findByPk(planId);
        if (!plan) throw new Error('Plan bulunamadı.');

        await plan.update({
            title,
            description,
            memberId: memberId !== undefined ? memberId : plan.memberId,
            packageId: packageId !== undefined ? packageId : plan.packageId,
            specialtyId: specialtyId !== undefined ? specialtyId : plan.specialtyId,
            instructorId: instructorId !== undefined ? instructorId : plan.instructorId,
            startDate: startDate || plan.startDate,
            endDate: endDate || plan.endDate,
            level: level !== undefined ? level : plan.level,
            isActive: isActive !== undefined ? isActive : plan.isActive
        });

        if (items !== undefined) {
            await TrainingPlanItem.destroy({ where: { planId } });
            if (items && items.length > 0) {
                const planItems = items
                    .filter(item => item.exerciseId)
                    .map(item => ({ ...item, planId, id: undefined }));
                await TrainingPlanItem.bulkCreate(planItems);
            }
        }

        if (days !== undefined || items !== undefined) {
            await TrainingPlanDay.destroy({ where: { planId } });
            const fullDays = this.ensureAllSevenDays(days || [], items || []);
            const planDays = fullDays.map(day => ({
                ...day,
                planId,
                id: undefined,
                isRestDay: day.isRestDay === true || day.isRestDay === 'true'
            }));
            await TrainingPlanDay.bulkCreate(planDays);
        }

        if (plan.memberId) await this.syncSchedules(plan.id);

        return plan;
    }

    /**
     * Takvim senkronizasyonu
     */
    static async syncSchedules(planId) {
        const plan = await TrainingPlan.findByPk(planId, {
            include: [{ model: TrainingPlanDay, as: 'days' }, { model: TrainingPlanItem, as: 'items', include: [{ model: Exercise, as: 'exercise', include: [{ model: ExerciseCategory, as: 'category' }] }] }]
        });
        if (!plan || !plan.memberId) return;

        await LessonSchedule.destroy({
            where: { memberId: plan.memberId, lessonType: 'GENERAL', notes: { [Op.like]: `%PlanID:${planId}%` } }
        });

        const schedules = plan.days.filter(d => !d.isRestDay).map(day => {
            const categories = Array.from(new Set(plan.items.filter(i => i.dayOfWeek === day.dayOfWeek).map(i => i.exercise?.category?.name))).join(', ') || 'FİTNESS';
            return {
                memberId: plan.memberId, instructorId: plan.instructorId, specialtyId: plan.specialtyId,
                dayOfWeek: (day.dayOfWeek + 1) % 7, startTime: day.startTime || '09:00:00', endTime: day.endTime || '10:30:00',
                lessonType: 'GENERAL', branchId: plan.branchId, companyId: plan.companyId, isActive: true,
                notes: `[Sistem Otomatik] Program: ${categories} - PlanID:${planId}`
            };
        });

        if (schedules.length > 0) await LessonSchedule.bulkCreate(schedules);
    }

    static async sendWhatsAppNotification(memberId, plan) {
        const member = await Member.findByPk(memberId, { include: ['Branch', 'Company'] });
        if (member?.phone && member.Branch?.isWhatsAppEnabled) {
            const msg = WhatsAppService.getTrainingPlanMessage(member, plan.title, plan.description, member.Company?.name, member.Branch?.name, member.Branch?.phone);
            await WhatsAppService.sendAutoMessage(member.phone, msg);
        }
    }

    /**
     * Antrenman aktivitesi kaydeder (Log)
     */
    static async logActivity(logData, currentUserId) {
        const { planId, dayOfWeek, date, weekNumber } = logData;
        const memberId = logData.memberId || currentUserId;

        const existing = await TrainingLog.findOne({
            where: { planId, memberId, dayOfWeek, date, weekNumber: weekNumber || 1 }
        });

        if (existing) {
            await existing.destroy();
            return { action: 'removed' };
        }

        const log = await TrainingLog.create({
            ...logData,
            memberId,
            status: 'COMPLETED'
        });

        return { log, action: 'added' };
    }

    /**
     * Toplu aktivite kaydet
     */
    static async logBatchActivity(activities, currentUserId) {
        const results = [];
        for (const activity of activities) {
            const res = await this.logActivity(activity, currentUserId);
            results.push(res);
        }
        return results;
    }

    /**
     * Eğitim loglarını getir
     */
    static async getLogs(filters) {
        const { planId, memberId, startDate, endDate, page = 1, limit = 50 } = filters;
        const offset = (page - 1) * limit;
        const where = {};
        if (planId) where.planId = planId;
        if (memberId) where.memberId = memberId;
        if (startDate && endDate) {
            where.date = { [Op.between]: [startDate, endDate] };
        }

        const { count, rows: logs } = await TrainingLog.findAndCountAll({
            where,
            include: [
                { model: Member, attributes: ['id', 'fullName'] },
                { model: TrainingPlan, attributes: ['id', 'title'] }
            ],
            order: [['date', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true
        });

        return {
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            logs
        };
    }

    /**
     * Eğitmen paneli için aktif planları getir
     */
    static async getInstructorDashboardLogs(instructorId, branchId) {
        const where = { isActive: true, memberId: { [Op.ne]: null } };
        if (branchId) where.branchId = branchId;

        if (instructorId) {
            where[Op.or] = [
                { instructorId: instructorId },
                { '$member.privateLessonInstructorId$': instructorId }
            ];
        }

        return await TrainingPlan.findAll({
            where,
            include: [
                { 
                    model: Member, 
                    as: 'member', 
                    attributes: ['id', 'fullName', 'photo', 'startingWeight', 'targetWeight', 'fitnessGoals', 'privateLessonInstructorId'] 
                },
                { model: TrainingPlanDay, as: 'days' },
                {
                    model: TrainingPlanItem,
                    as: 'items',
                    include: [{
                        model: Exercise,
                        as: 'exercise',
                        include: [
                            { model: ExerciseCategory, as: 'category', attributes: ['name'] },
                            { model: SportSpecialty, as: 'specialty', attributes: ['name'] }
                        ]
                    }]
                },
                { model: MembershipPackage, as: 'package', attributes: ['id', 'name'] },
                { model: TrainingLog, as: 'logs' }
            ],
            order: [['createdAt', 'DESC']]
        });
    }
}

module.exports = TrainingService;
