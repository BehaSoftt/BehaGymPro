const sequelize = require('../../config/database');
const {
    Member,
    TrainingPlan,
    TrainingPlanDay,
    TrainingPlanItem,
    Exercise,
    ExerciseCategory,
    FinancialTransaction,
    GroupClass,
    SportSpecialty,
    User,
    Branch,
    Company
} = require('../../models');
const WhatsAppService = require('./WhatsAppService');
const { Op } = require('sequelize');

class SchedulerService {
    /**
     * Günlük tüm hatırlatıcıları (Antrenman, Grup Dersi, Özel Ders ve Eğitmen Programı) kontrol eder.
     */
    static async checkAndSendDailyReminders() {
        console.log(`[Scheduler] Kapsamlı günlük hatırlatıcı kontrolü başlatıldı: ${new Date().toLocaleString()}`);

        try {
            const now = new Date();
            const dayOfWeekMap = [6, 0, 1, 2, 3, 4, 5];
            const dayOfWeek = dayOfWeekMap[now.getDay()];
            const dayNames = ['PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ', 'PAZAR'];
            const todayName = dayNames[dayOfWeek];

            const instructorSchedules = {};

            await this.sendTrainingPlanReminders(dayOfWeek);
            await this.sendGroupClassReminders(dayOfWeek, todayName, instructorSchedules);
            await this.sendPrivateLessonReminders(dayOfWeek, instructorSchedules);
            await this.notifyInstructors(instructorSchedules);
            await this.sendBirthdayMessages();

        } catch (err) {
            console.error('[Scheduler ERROR]:', err);
        }
    }

    /**
     * Standart Antrenman Planı Hatırlatmaları
     */
    static async sendTrainingPlanReminders(dayOfWeek) {
        const plans = await TrainingPlanDay.findAll({
            where: { dayOfWeek, isRestDay: false },
            include: [{
                model: TrainingPlan,
                include: [
                    {
                        model: Member,
                        as: 'member',
                        include: [
                            { model: Branch, as: 'Branch' },
                            { model: Company, as: 'Company' }
                        ]
                    },
                    {
                        model: TrainingPlanItem,
                        as: 'items',
                        where: { dayOfWeek },
                        include: [{ model: Exercise, as: 'exercise' }]
                    }
                ]
            }]
        });

        for (const dayInfo of plans) {
            const plan = dayInfo.TrainingPlan;
            if (plan?.member?.phone && plan.member.Branch?.isWhatsAppEnabled) {
                const exercises = plan.items.map(i => `• ${i.exercise?.name || 'Egzersiz'} (${i.sets}x${i.reps})`).join('\n');
                const companyName = plan.member.Company?.name;
                const branchName = plan.member.Branch?.name;
                const branchPhone = plan.member.Branch?.phone;
                const msg = WhatsAppService.getDailyTrainingReminder(plan.member, exercises, companyName, branchName, branchPhone);
                await WhatsAppService.sendAutoMessage(plan.member.phone, msg);
            }
        }
    }

    /**
     * Grup Dersi Hatırlatmaları
     */
    static async sendGroupClassReminders(dayOfWeek, todayName, schedules) {
        const classes = await GroupClass.findAll({
            where: {
                status: 'ACTIVE',
                days: { [Op.contains]: [dayOfWeek] } // JSON array contains
            },
            include: [
                {
                    model: Member,
                    as: 'enrolledMembers',
                    include: [
                        { model: Branch, as: 'Branch' },
                        { model: Company, as: 'Company' }
                    ]
                },
                {
                    model: Member,
                    as: 'instructor',
                    include: [
                        { model: Branch, as: 'Branch' },
                        { model: Company, as: 'Company' }
                    ]
                }
            ]
        });

        for (const gClass of classes) {
            const instructor = gClass.instructor;
            if (instructor) {
                if (!schedules[instructor.id]) schedules[instructor.id] = { info: instructor, items: [] };
                schedules[instructor.id].items.push(`📍 *Grup Dersi:* ${gClass.name} (${gClass.startTime}) - ${gClass.enrolledMembers?.length || 0} Üye`);
            }

            const instructorName = instructor?.fullName || 'Eğitmen';
            const companyName = instructor?.Company?.name;
            const branchName = instructor?.Branch?.name;
            const branchPhone = instructor?.Branch?.phone;

            for (const member of (gClass.enrolledMembers || [])) {
                if (member.phone && member.Branch?.isWhatsAppEnabled) {
                    const msg = WhatsAppService.getGroupClassReminder(member, gClass.name, gClass.startTime, instructorName, companyName, branchName, branchPhone);
                    await WhatsAppService.sendAutoMessage(member.phone, msg);
                }
            }
        }
    }

    /**
     * Özel Ders (PT) Hatırlatmaları
     */
    static async sendPrivateLessonReminders(dayOfWeek, schedules) {

        const actualMembers = await Member.findAll({
            where: {
                lessonType: 'PRIVATE',
                isActive: true,
                privateLessonDays: { [Op.contains]: [dayOfWeek] }
            },
            include: [
                { model: SportSpecialty, as: 'lessonSpecialty' },
                { model: Branch, as: 'Branch' },
                { model: Company, as: 'Company' },
                {
                    model: Member,
                    as: 'lessonInstructor',
                    include: [
                        { model: Branch, as: 'Branch' },
                        { model: Company, as: 'Company' }
                    ]
                }
            ]
        });

        for (const member of actualMembers) {
            const instructor = member.lessonInstructor;
            if (instructor) {
                if (!schedules[instructor.id]) schedules[instructor.id] = { info: instructor, items: [] };
                schedules[instructor.id].items.push(`👑 *Özel Ders:* ${member.fullName} (${member.lessonSpecialty?.name || 'PT'})`);
            }

            if (member.phone && member.Branch?.isWhatsAppEnabled) {
                const instructorName = instructor?.fullName || 'Hocanız';
                const specialty = member.lessonSpecialty?.name || 'Özel Ders';
                const companyName = member.Company?.name;
                const branchName = member.Branch?.name;
                const branchPhone = member.Branch?.phone;
                const msg = WhatsAppService.getPrivateLessonReminder(member, specialty, null, instructorName, companyName, branchName, branchPhone);
                await WhatsAppService.sendAutoMessage(member.phone, msg);
            }
        }
    }

    /**
     * Eğitmenlere Günlük Özet Gönderimi
     */
    static async notifyInstructors(schedules) {
        for (const instructorId in schedules) {
            const { info, items } = schedules[instructorId];
            if (info.phone && items.length > 0 && info.Branch?.isWhatsAppEnabled) {
                const instructorName = info.fullName || 'Hocam';
                const summary = items.join('\n');
                const companyName = info.Company?.name;
                const branchName = info.Branch?.name;
                const branchPhone = info.Branch?.phone;
                const msg = WhatsAppService.getInstructorDailySchedule(instructorName, summary, companyName, branchName, branchPhone);
                await WhatsAppService.sendAutoMessage(info.phone, msg);
            }
        }
    }

    /**
     * Doğum günü olan üye ve eğitmenlere kutlama mesajı gönderir.
     */
    static async sendBirthdayMessages() {
        console.log('[Scheduler] Doğum günü kontrolleri başlatılıyor...');
        try {
            const today = new Date();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            const md = `${month}-${day}`; // Format: MM-DD

            // 1. ÜYELER
            const members = await Member.findAll({
                where: {
                    profileType: 'MEMBER',
                    [Op.and]: [
                        sequelize.where(
                            sequelize.fn('TO_CHAR', sequelize.col('birthDate'), 'MM-DD'),
                            md
                        )
                    ]
                },
                include: [
                    {
                        model: Branch,
                        as: 'Branch',
                        include: [
                            { model: Company, as: 'HeaderCompany' },
                            { model: Branch, as: 'HeaderBranch' }
                        ]
                    },
                    { model: Company, as: 'Company' }
                ]
            });

            for (const member of members) {
                if (member.phone && member.Branch?.isWhatsAppEnabled && member.Branch?.isBirthdayMessageEnabled) {
                    const identity = WhatsAppService.resolveIdentity(member.Branch, member.Company);
                    const msg = WhatsAppService.getBirthdayMessage(
                        member.fullName,
                        identity.companyName,
                        identity.branchName,
                        identity.phone,
                        member.Branch.birthdayMessageTemplate
                    );
                    await WhatsAppService.sendAutoMessage(member.phone, msg);
                }
            }

            // 2. EĞİTMENLER
            const instructors = await Member.findAll({
                where: {
                    profileType: 'INSTRUCTOR',
                    [Op.and]: [
                        sequelize.where(
                            sequelize.fn('TO_CHAR', sequelize.col('birthDate'), 'MM-DD'),
                            md
                        )
                    ]
                },
                include: [
                    {
                        model: Branch,
                        as: 'Branch',
                        include: [
                            { model: Company, as: 'HeaderCompany' },
                            { model: Branch, as: 'HeaderBranch' }
                        ]
                    },
                    { model: Company, as: 'Company' }
                ]
            });

            for (const instructor of instructors) {
                if (instructor.phone && instructor.Branch?.isWhatsAppEnabled && instructor.Branch?.isBirthdayMessageEnabled) {
                    const identity = WhatsAppService.resolveIdentity(instructor.Branch, instructor.Company);
                    const msg = WhatsAppService.getBirthdayMessage(
                        instructor.fullName,
                        identity.companyName,
                        identity.branchName,
                        identity.phone,
                        instructor.Branch.birthdayMessageTemplate
                    );
                    await WhatsAppService.sendAutoMessage(instructor.phone, msg);
                }
            }

            // 3. PERSONELLER
            const staff = await Member.findAll({
                where: {
                    profileType: 'PERSONNEL',
                    [Op.and]: [
                        sequelize.where(
                            sequelize.fn('TO_CHAR', sequelize.col('birthDate'), 'MM-DD'),
                            md
                        )
                    ]
                },
                include: [
                    {
                        model: Branch,
                        as: 'Branch',
                        include: [
                            { model: Company, as: 'HeaderCompany' },
                            { model: Branch, as: 'HeaderBranch' }
                        ]
                    },
                    { model: Company, as: 'Company' }
                ]
            });

            for (const person of staff) {
                if (person.phone && person.Branch?.isWhatsAppEnabled && person.Branch?.isBirthdayMessageEnabled) {
                    const identity = WhatsAppService.resolveIdentity(person.Branch, person.Company);
                    const msg = WhatsAppService.getBirthdayMessage(
                        person.fullName,
                        identity.companyName,
                        identity.branchName,
                        identity.phone,
                        person.Branch.birthdayMessageTemplate
                    );
                    await WhatsAppService.sendAutoMessage(person.phone, msg);
                }
            }
        } catch (err) {
            console.error('[Scheduler Birthday ERROR]:', err);
        }
    }

    /**
     * Tüm şubelerin kasalarını kapatıp ana kasaya aktarır (00:00 Otomasyonu)
     */
    static async closeAllBranchesFinancialAccounts() {
        console.log(`[Scheduler] Otomatik şube kasa kapanışları başlatıldı: ${new Date().toLocaleString()}`);
        const FinancialAccountService = require('../finance/FinancialAccountService');

        try {
            const branches = await Branch.findAll({ where: { isActive: true } });
            for (const branch of branches) {
                await FinancialAccountService.closeDailyBranchCash(branch.id);
            }
        } catch (err) {
            console.error('[Scheduler Financial ERROR]:', err);
        }
    }

    static start() {
        console.log('--- BehaGym Pro: Akıllı Zamanlayıcı Servisi Başlatıldı ---');

        // İlk açılışta hatırlatıcıları bir kez gönder
        this.checkAndSendDailyReminders();

        // Her dakika kontrol et (00:00'da tetiklenecek işlemler için)
        setInterval(() => {
            const now = new Date();
            // Tam gece yarısı (00:00)
            if (now.getHours() === 0 && now.getMinutes() === 0) {
                console.log('[Scheduler] Gece yarısı işlemleri tetiklendi...');
                this.closeAllBranchesFinancialAccounts();
                this.checkAndSendDailyReminders();
            }
        }, 60000);
    }
}

module.exports = SchedulerService;
