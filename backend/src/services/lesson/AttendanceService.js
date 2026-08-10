const { Attendance, PrivateLessonPackage, SessionChangeLog, Member, MemberPackage, MembershipPackage } = require('../../models');
const { Op } = require('sequelize');
const sequelize = require('../../config/database');

class AttendanceService {
    /**
     * Create private lesson attendance with automatic package selection and session decrement
     * @param {Object} data - Attendance data
     * @param {UUID} data.memberId - Member ID
     * @param {UUID} data.instructorId - Instructor ID
     * @param {UUID} data.specialtyId - Sport specialty ID
     * @param {Date} data.date - Attendance date
     * @param {UUID} data.branchId - Branch ID
     * @param {UUID} data.companyId - Company ID
     * @param {UUID} data.userId - User creating the attendance
     * @returns {Promise<Attendance>} Created attendance record
     * @throws {Error} If no valid package found or validation fails
     */
    static async createPrivateAttendance(data) {
        const { memberId, instructorId, specialtyId, date, branchId, companyId, userId, status = 'PRESENT', excuse = null } = data;

        // Get day of week from date (0=Sunday, 6=Saturday)
        const dayOfWeek = new Date(date).getDay();

        // Find active package matching criteria
        const activePackage = await PrivateLessonPackage.findOne({
            where: {
                memberId,
                instructorId,
                specialtyId,
                status: 'ACTIVE',
                isArchived: false,
                remainingSessions: { [Op.gt]: 0 },
                days: { [Op.contains]: [dayOfWeek] }, // JSONB contains operator
                [Op.or]: [
                    { expiryDate: null },
                    { expiryDate: { [Op.gte]: date } }
                ]
            },
            order: [['startDate', 'ASC']] // Use oldest package first
        });

        if (!activePackage) {
            // Check if it's the day of week mismatch
            const packageAnyDay = await PrivateLessonPackage.findOne({
                where: {
                    memberId,
                    instructorId,
                    specialtyId,
                    status: 'ACTIVE',
                    isArchived: false,
                    remainingSessions: { [Op.gt]: 0 }
                }
            });

            if (packageAnyDay) {
                const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
                throw new Error(`Bu üyenin paketi bugün (${dayNames[dayOfWeek]}) için tanımlı değil. Pakete dahil günler: ${packageAnyDay.days.map(d => dayNames[d]).join(', ')}`);
            }

            throw new Error('Bu üye için uygun aktif paket bulunamadı veya kalan seans bulunmamaktadır');
        }

        if (activePackage.remainingSessions === 0) {
            throw new Error('Bu paket için kalan seans bulunmamaktadır');
        }

        // Use transaction for atomicity
        const transaction = await sequelize.transaction();

        try {
            // Create attendance record
            const attendance = await Attendance.create({
                memberId,
                instructorId,
                lessonType: 'PRIVATE',
                packageId: activePackage.id,
                date,
                status,
                excuse,
                branchId,
                companyId
            }, { transaction });

            if (status === 'PRESENT' || status === 'ABSENT') {
                // Store previous value for logging
                const previousSessions = activePackage.remainingSessions;

                // Decrement remaining sessions
                activePackage.remainingSessions -= 1;
                const newSessions = activePackage.remainingSessions;

                // Update package status if completed
                if (newSessions === 0) {
                    activePackage.status = 'COMPLETED';
                }

                await activePackage.save({ transaction });

                // Create session change log
                await SessionChangeLog.create({
                    packageId: activePackage.id,
                    changeType: 'DECREMENT',
                    previousValue: previousSessions,
                    newValue: newSessions,
                    reason: status === 'PRESENT' ? 'Yoklama alındı' : 'Derse gelmedi (Seans düşüldü)',
                    userId,
                    attendanceId: attendance.id,
                    timestamp: new Date()
                }, { transaction });
            }

            await transaction.commit();

            return attendance;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Delete private lesson attendance and increment sessions back
     * @param {UUID} attendanceId - Attendance ID to delete
     * @param {UUID} userId - User deleting the attendance
     * @returns {Promise<void>}
     * @throws {Error} If attendance not found or not a private lesson
     */
    static async deletePrivateAttendance(attendanceId, userId) {
        const attendance = await Attendance.findByPk(attendanceId);

        if (!attendance) {
            throw new Error('Yoklama kaydı bulunamadı');
        }

        if (attendance.lessonType !== 'PRIVATE' || !attendance.packageId) {
            throw new Error('Bu yoklama kaydı özel ders paketi ile ilişkili değil');
        }

        const transaction = await sequelize.transaction();

        try {
            // Get the package
            const packageRecord = await PrivateLessonPackage.findByPk(attendance.packageId, { transaction });

            if (!packageRecord) {
                throw new Error('İlişkili paket bulunamadı');
            }

            const previousSessions = packageRecord.remainingSessions;

            // Increment sessions back
            packageRecord.remainingSessions += 1;
            const newSessions = packageRecord.remainingSessions;

            // Reactivate package if it was completed
            if (packageRecord.status === 'COMPLETED') {
                packageRecord.status = 'ACTIVE';
            }

            await packageRecord.save({ transaction });

            // Create session change log
            await SessionChangeLog.create({
                packageId: packageRecord.id,
                changeType: 'INCREMENT',
                previousValue: previousSessions,
                newValue: newSessions,
                reason: 'Yoklama silindi',
                userId,
                attendanceId: attendance.id,
                timestamp: new Date()
            }, { transaction });

            // Delete the attendance record
            await attendance.destroy({ transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Create group class attendance with automatic session decrement
     * @param {Object} data - Attendance data
     * @param {UUID} data.memberId - Member ID
     * @param {UUID} data.groupClassId - Group class ID
     * @param {UUID} data.instructorId - Instructor ID
     * @param {Date} data.date - Attendance date
     * @param {UUID} data.branchId - Branch ID
     * @param {UUID} data.companyId - Company ID
     * @param {UUID} data.userId - User creating the attendance
     * @returns {Promise<Attendance>} Created attendance record
     * @throws {Error} If no valid package found or validation fails
     */
    static async createGroupAttendance(data) {
        const { memberId, groupClassId, instructorId, date, branchId, companyId, userId, status = 'PRESENT' } = data;

        const activeMemberPackage = await MemberPackage.findOne({
            where: {
                memberId,
                status: 'ACTIVE',
                [Op.or]: [
                    { expiryDate: null },
                    { expiryDate: { [Op.gte]: date } }
                ]
            },
            include: [{
                model: MembershipPackage,
                as: 'package',
                where: { type: 'GROUP', isActive: true }
            }],
            order: [['startDate', 'ASC']]
        });

        if (!activeMemberPackage) {
            throw new Error('Bu üye için uygun aktif grup dersi paketi bulunamadı');
        }

        if (activeMemberPackage.remainingSessions <= 0) {
            throw new Error('Bu paket için kalan seans bulunmamaktadır');
        }

        const transaction = await sequelize.transaction();

        try {
            const attendance = await Attendance.create({
                memberId,
                groupClassId,
                instructorId,
                lessonType: 'GROUP',
                date,
                status, // 'PENDING' veya 'PRESENT'
                branchId,
                companyId
            }, { transaction });

            // SADECE 'PRESENT' ise seans düş
            if (status === 'PRESENT') {
                const previousSessions = activeMemberPackage.remainingSessions;
                activeMemberPackage.remainingSessions -= 1;
                const newSessions = activeMemberPackage.remainingSessions;

                if (newSessions === 0) {
                    activeMemberPackage.status = 'COMPLETED';
                }

                await activeMemberPackage.save({ transaction });

                await SessionChangeLog.create({
                    packageId: activeMemberPackage.packageId,
                    changeType: 'DECREMENT',
                    previousValue: previousSessions,
                    newValue: newSessions,
                    reason: 'Grup dersi yoklaması alındı',
                    userId,
                    attendanceId: attendance.id,
                    timestamp: new Date()
                }, { transaction });
            }

            await transaction.commit();
            return attendance;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Delete group class attendance and increment sessions back
     * @param {UUID} attendanceId - Attendance ID to delete
     * @param {UUID} userId - User deleting the attendance
     * @returns {Promise<void>}
     * @throws {Error} If attendance not found or not a group lesson
     */
    static async deleteGroupAttendance(attendanceId, userId) {
        const attendance = await Attendance.findByPk(attendanceId);

        if (!attendance) {
            throw new Error('Yoklama kaydı bulunamadı');
        }

        if (attendance.lessonType !== 'GROUP' || !attendance.groupClassId) {
            throw new Error('Bu yoklama kaydı grup dersi ile ilişkili değil');
        }

        const transaction = await sequelize.transaction();

        try {
            // Find the member package
            const memberPackage = await MemberPackage.findOne({
                where: {
                    memberId: attendance.memberId,
                    [Op.or]: [
                        { status: 'ACTIVE' },
                        { status: 'COMPLETED' }
                    ]
                },
                include: [
                    {
                        model: MembershipPackage,
                        as: 'package',
                        where: { type: 'GROUP' }
                    }
                ],
                order: [['startDate', 'DESC']],
                transaction
            });

            if (!memberPackage) {
                throw new Error('İlişkili paket bulunamadı');
            }

            const previousSessions = memberPackage.remainingSessions;

            // Increment sessions back
            memberPackage.remainingSessions += 1;
            const newSessions = memberPackage.remainingSessions;

            // Reactivate package if it was completed
            if (memberPackage.status === 'COMPLETED') {
                memberPackage.status = 'ACTIVE';
            }

            await memberPackage.save({ transaction });

            // Create session change log
            await SessionChangeLog.create({
                packageId: memberPackage.packageId,
                changeType: 'INCREMENT',
                previousValue: previousSessions,
                newValue: newSessions,
                reason: 'Grup dersi yoklaması silindi',
                userId,
                attendanceId: attendance.id,
                timestamp: new Date()
            }, { transaction });

            // Delete the attendance record
            await attendance.destroy({ transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Calculate total sessions for a membership package
     * @param {number} durationMonths - Package duration in months
     * @param {number} weeklySessionCount - Number of sessions per week
     * @returns {number} Total sessions
     */
    static calculateTotalSessions(durationMonths, weeklySessionCount) {
        const weeksPerMonth = 4;
        return durationMonths * weeksPerMonth * weeklySessionCount;
    }

    /**
     * Otomatik Yoklama Sistemi: Üye şubeye giriş yaptığında bekleyen sınav veya grup dersi yoklamalarını onaylar.
     * @param {Object} member - Giriş yapan üye
     * @param {UUID} branchId - Giriş yaptığı şube
     * @returns {Promise<Object>} İşlem sonuç özeti
     */
    static async processAutomatedAttendanceOnEntry(member, branchId) {
        // Dinamik importlar (dairesel bağımlılığı önlemek için)
        const { BeltExam, BeltExamParticipant, GroupClass, Attendance, Member } = require('../../models');
        const todayStr = new Date().toISOString().split('T')[0];

        const results = {
            beltExams: [],
            groupClasses: [],
            privateLessons: [],
            generalTraining: false
        };

        try {
            // 1. KUŞAK SINAVLARI: Bugün bu şubede sınavı olan ve katılımı 'PENDING' olan kayıtları 'PRESENT' yap
            const pendingExams = await BeltExam.findAll({
                where: {
                    examDate: todayStr,
                    gymBranchId: branchId,
                    status: { [Op.ne]: 'COMPLETED' }
                },
                include: [{
                    model: BeltExamParticipant,
                    as: 'participants',
                    where: {
                        memberId: member.id,
                        attendance: 'PENDING'
                    }
                }]
            });

            for (const exam of pendingExams) {
                for (const participant of exam.participants) {
                    await participant.update({ attendance: 'PRESENT' });
                    results.beltExams.push(exam.examName);
                }
            }

            // 2. GRUP DERSLERİ: Bugün dersi olan üyelerin yoklamasını al
            const todayDayIndex = new Date().getDay(); // 0=Sunday, 1=Monday

            const activeGroups = await GroupClass.findAll({
                where: {
                    branchId,
                    status: 'ACTIVE',
                    days: { [Op.contains]: [todayDayIndex] },
                    startDate: { [Op.lte]: todayStr },
                    endDate: { [Op.gte]: todayStr }
                },
                include: [{
                    model: Member,
                    as: 'enrolledMembers',
                    where: { id: member.id }
                }]
            });

            for (const gc of activeGroups) {
                const existing = await Attendance.findOne({
                    where: { memberId: member.id, groupClassId: gc.id, date: todayStr }
                });

                if (!existing) {
                    try {
                        await this.createGroupAttendance({
                            memberId: member.id,
                            groupClassId: gc.id,
                            instructorId: gc.instructorId,
                            date: todayStr,
                            branchId: gc.branchId,
                            companyId: gc.companyId,
                            userId: null,
                            status: 'PENDING' // Başlangıçta beklemede
                        });
                        results.groupClasses.push(`${gc.name} (Beklemede)`);
                    } catch (err) {
                        console.warn(`[Automation] ${gc.name} için yoklama alınamadı:`, err.message);
                    }
                }
            }

            // 3. ÖZEL DERSLER: Eğer bugün bu üyenin programında bir özel ders varsa yoklamasını al
            const privateSchedules = await require('../../models/LessonSchedule').findAll({
                where: {
                    memberId: member.id,
                    lessonType: 'PRIVATE',
                    dayOfWeek: todayDayIndex,
                    isActive: true,
                    branchId
                }
            });

            for (const schedule of privateSchedules) {
                const existing = await Attendance.findOne({
                    where: {
                        memberId: member.id,
                        lessonType: 'PRIVATE',
                        date: todayStr,
                        instructorId: schedule.instructorId
                    }
                });

                if (!existing) {
                    try {
                        await this.createPrivateAttendance({
                            memberId: member.id,
                            instructorId: schedule.instructorId,
                            specialtyId: schedule.specialtyId,
                            date: todayStr,
                            branchId: branchId,
                            companyId: member.companyId,
                            userId: null,
                            status: 'PENDING' // Added missing status
                        });
                        results.privateLessons.push(`Özel Ders (${schedule.startTime})`);
                    } catch (err) {
                        console.warn(`[Automation] Özel ders için yoklama alınamadı:`, err.message);
                    }
                }
            }

            // 4. GENEL FİTNESS / SALON KULLANIMI: Eğer hiç yoklaması alınmadıysa ve bugün ilk girişi ise genel yoklama yaz
            // (Bu sayede üyenin ayda kaç gün spor yaptığını takip edebiliriz)
            const todayAttendances = await Attendance.count({
                where: { memberId: member.id, date: todayStr }
            });

            if (todayAttendances === 0) {
                const activePkg = await MemberPackage.findOne({
                    where: {
                        memberId: member.id,
                        status: 'ACTIVE',
                        [Op.or]: [
                            { expiryDate: null },
                            { expiryDate: { [Op.gte]: todayStr } }
                        ]
                    },
                    include: [{
                        model: MembershipPackage,
                        as: 'package',
                        where: { type: { [Op.ne]: 'GROUP' } }
                    }]
                });

                if (activePkg) {
                    await Attendance.create({
                        memberId: member.id,
                        lessonType: 'GENERAL',
                        date: todayStr,
                        status: 'PENDING', // 30 dakika dolunca PRESENT olacak
                        branchId: activePkg.branchId || branchId,
                        companyId: activePkg.companyId
                    });
                    results.generalTraining = true;
                }
            }

            // 5. ERKEN ÇIKIŞ İPTALİ: Erken çıkıp (EARLY_EXIT) aynı gün TEKRAR girenin yoklamasını PENDING'e döndür ki seansını tamamlayabilsin!
            const earlyExits = await Attendance.findAll({
                where: {
                    memberId: member.id,
                    date: todayStr,
                    status: 'EARLY_EXIT'
                }
            });

            if (earlyExits.length > 0) {
                for (const att of earlyExits) {
                    await att.update({ status: 'PENDING' });
                }
                results.generalTraining = true; // Just to signal something happened
            }

            return results;
        } catch (error) {
            console.error('[Automation] Otomatik yoklama hatası:', error);
            return results;
        }
    }

    /**
     * 30 Dakika dolduğunda 'PENDING' olan yoklamaları 'PRESENT' yapar ve seansları düşer.
     */
    static async completePendingAttendance(memberId) {
        const todayStr = new Date().toISOString().split('T')[0];
        console.log(`--- [ATTENDANCE] Otomatik Onaylama Başladı: MB:${memberId} Tarih:${todayStr} ---`);
        const pendingAttendances = await Attendance.findAll({
            where: { memberId, date: todayStr, status: 'PENDING' }
        });

        console.log(`--- [ATTENDANCE] Bulunan Kayıt Sayısı: ${pendingAttendances.length} ---`);
        for (const att of pendingAttendances) {
            const transaction = await sequelize.transaction();
            try {
                att.status = 'PRESENT';
                await att.save({ transaction });
                console.log(`--- [ATTENDANCE] Kayıt PRESENT Yapıldı: ID:${att.id} ---`);

                // Seans düşme mantığı (Hem GENERAL Hem GROUP için)
                if (att.lessonType === 'GENERAL' || att.lessonType === 'GROUP') {
                    const activePkg = await MemberPackage.findOne({
                        where: { memberId, status: 'ACTIVE' },
                        include: [{
                            model: MembershipPackage,
                            as: 'package',
                            where: { [Op.or]: [{ type: 'SESSION' }, { type: 'GROUP' }] }
                        }],
                        transaction
                    });

                    if (activePkg && activePkg.remainingSessions > 0) {
                        const previousValue = activePkg.remainingSessions;
                        await activePkg.decrement('remainingSessions', { transaction });

                        const newValue = previousValue - 1;
                        console.log(`--- [ATTENDANCE] Seans Düşüldü: Pkg:${activePkg.id} ${previousValue} -> ${newValue} ---`);
                        if (newValue <= 0) {
                            await activePkg.update({ status: 'COMPLETED' }, { transaction });
                        }

                        // Log tut
                        await SessionChangeLog.create({
                            packageId: activePkg.id,
                            changeType: 'DECREMENT',
                            previousValue,
                            newValue,
                            reason: '30 Dakika barajı geçildi, yoklama onaylandı',
                            attendanceId: att.id,
                            timestamp: new Date()
                        }, { transaction });
                    } else {
                        console.log(`--- [ATTENDANCE] Uygun Paket Bulunamadı veya Seans Yok: MB:${memberId} ---`);
                    }
                }

                await transaction.commit();
            } catch (err) {
                await transaction.rollback();
                console.error('[Automation] Yoklama tamamlama hatası:', err.message);
            }
        }
    }

    /**
     * 30 Dakika dolmadan çıkış yapıldığında 'PENDING' olan yoklamaları 'EARLY_EXIT' yapar.
     * Bu yoklamalar seans düşmez.
     */
    static async cancelPendingAttendance(memberId) {
        const todayStr = new Date().toISOString().split('T')[0];
        console.log(`--- [ATTENDANCE] Erken Çıkış İptali Başladı: MB:${memberId} Tarih:${todayStr} ---`);
        const pendingAttendances = await Attendance.findAll({
            where: { memberId, date: todayStr, status: 'PENDING' }
        });

        console.log(`--- [ATTENDANCE] Bulunan Kayıt Sayısı: ${pendingAttendances.length} ---`);
        for (const att of pendingAttendances) {
            att.status = 'EARLY_EXIT';
            await att.save();
            console.log(`--- [ATTENDANCE] Kayıt EARLY_EXIT Yapıldı: ID:${att.id} ---`);
        }
    }
    /**
     * Toplu grup dersi yoklaması alır ve durum değişikliğinde bildirim gönderir
     */
    static async bulkMarkGroupAttendance(groupClassId, records, user) {
        const { Attendance: AttendanceModel, Branch, GroupClass, Member } = require('../../models');
        const WhatsAppService = require('../notifications/WhatsAppService');
        const today = new Date().toISOString().split('T')[0];
        const { branchId, companyId } = user;

        const branch = await Branch.findByPk(branchId, { include: ['Company'] });
        const groupClass = await GroupClass.findByPk(groupClassId);
        if (!groupClass) throw new Error('Grup dersi bulunamadı.');

        return await Promise.all(records.map(async (record) => {
            const [attendance, created] = await AttendanceModel.findOrCreate({
                where: { groupClassId, memberId: record.memberId, date: today },
                defaults: { status: record.status, excuse: record.excuse, branchId, companyId }
            });

            const oldStatus = attendance.status;
            if (!created) await attendance.update({ status: record.status, excuse: record.excuse });

            // Bildirim Gönderimi (Durum değiştiyse)
            if (created || oldStatus !== record.status) {
                const member = await Member.findByPk(record.memberId);
                if (member?.phone && branch?.isWhatsAppEnabled) {
                    const pref = member.notificationPreference || 'BOTH';
                    if (pref === 'BOTH' || pref === 'WHATSAPP') {
                        let msg = '';
                        if (record.status === 'PRESENT') msg = WhatsAppService.getAttendancePresentMessage(member, groupClass.name, branch.Company?.name, branch.name, branch.phone);
                        else if (record.status === 'ABSENT') msg = WhatsAppService.getAttendanceAbsentMessage(member, groupClass.name, branch.Company?.name, branch.name, branch.phone);
                        
                        if (msg) WhatsAppService.sendAutoMessage(member.phone, msg).catch(e => console.error(e));
                    }
                }
            }
            return attendance;
        }));
    }
}

module.exports = AttendanceService;
