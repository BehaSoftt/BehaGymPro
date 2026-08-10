const { BeltExam, BeltExamParticipant, Member, SportSpecialty, FinancialAccount, FinancialTransaction, sequelize } = require('../../models');
const { Op } = require('sequelize');
const FinancialAccountService = require('../finance/FinancialAccountService');
const WhatsAppService = require('../notifications/WhatsAppService');

class BeltExamService {
    /**
     * Tüm sınavları listeler
     */
    static async getAllExams(filters) {
        const { branchId_ref, search, status, page = 1, limit = 50 } = filters;
        const offset = (page - 1) * limit;
        const where = {};
        
        if (branchId_ref) where.gymBranchId = branchId_ref;
        if (search) {
            where.examName = { [Op.iLike]: `%${search}%` };
        }
        if (status && status !== 'ALL') {
            if (status === 'ONGOING') where.status = { [Op.ne]: 'COMPLETED' };
            else where.status = status;
        }

        const startTime = Date.now();
        const { count, rows: exams } = await BeltExam.findAndCountAll({
            where,
            include: [
                { model: SportSpecialty, as: 'specialty', attributes: ['name'] },
                { model: Member, as: 'instructor', attributes: ['fullName'] },
                {
                    model: BeltExamParticipant,
                    as: 'participants',
                    separate: true, // separate: true is better here to avoid JOIN count duplicates and for performance
                    include: [{ model: Member, as: 'member', attributes: ['fullName', 'birthDate', 'photo', 'bloodGroup', 'gender'] }]
                }
            ],
            order: [['examDate', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true
        });

        const duration = Date.now() - startTime;
        console.log(`🚀 DATABASE_FETCH_TIME: ${duration}ms`);

        return {
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            exams
        };
    }

    /**
     * Sınava aday öğrencileri getirir
     */
    static async getCandidates(filters) {
        try {
            const { specialtyId, minMonths = 3 } = filters;
            const waitingDate = new Date();
            waitingDate.setMonth(waitingDate.getMonth() - parseInt(minMonths));

            const conditions = [
                { isActive: true }
            ];

            // 1. Profile Type Filter: Priority to MEMBER profileType, also allowing null
            conditions.push({
                [Op.or]: [
                    { profileType: 'MEMBER' },
                    { profileType: null }
                ]
            });

            // 2. Waiting Time/Date Filter: Priority to those who haven't had a belt in X months or at all
            conditions.push({
                [Op.or]: [
                    { lastBeltDate: { [Op.lte]: waitingDate } },
                    { lastBeltDate: null }
                ]
            });

            // 3. Specialty Filter:
            // This is the most important one. If we are in a Karate exam, we want:
            // - Members who have specialtyId = Karate
            // - Members who have beltBranchId = Karate
            // - Members who HAVE NO specialty assigned (to catch users who haven't completed their profile)
            if (specialtyId && specialtyId.length > 5) {
                conditions.push({
                    [Op.or]: [
                        { beltBranchId: specialtyId },
                        { specialtyId: specialtyId },
                        { beltBranchId: null },
                        { specialtyId: null }
                    ]
                });
            }

            console.log(`[BeltExamService] Fetching candidates for specialtyId: ${specialtyId}, minMonths: ${minMonths}`);

            return await Member.findAll({
                where: {
                    [Op.and]: conditions
                },
                attributes: ['id', 'fullName', 'currentBelt', 'lastBeltDate', 'photo', 'phone', 'memberCode', 'gender', 'bloodGroup', 'birthDate', 'isActive', 'profileType', 'specialtyId', 'beltBranchId'],
                order: [['fullName', 'ASC']]
            });
        } catch (error) {
            console.error('[BeltExamService.getCandidates] CRITICAL ERROR:', error.message);
            throw error;
        }
    }

    /**
     * Sınava toplu katılımcı ekler ve finansal borçları yansıtır
     */
    static async addParticipants(examId, participants, user) {
        return await sequelize.transaction(async (t) => {
            const exam = await BeltExam.findByPk(examId, { transaction: t });
            if (!exam) throw new Error('Sınav bulunamadı.');

            const existingParticipants = await BeltExamParticipant.findAll({
                where: { examId },
                attributes: ['memberId'],
                transaction: t
            });
            const existingMemberIds = existingParticipants.map(ep => ep.memberId);

            const newData = participants.filter(p => !existingMemberIds.includes(p.memberId));
            if (newData.length === 0) return { addedCount: 0 };

            const dbParticipants = newData.map(p => ({
                examId,
                memberId: p.memberId,
                fromBelt: p.fromBelt,
                toBelt: p.toBelt,
                status: 'PENDING'
            }));
            await BeltExamParticipant.bulkCreate(dbParticipants, { transaction: t });

            // Finansal Borçlandırma
            if (exam.fee && parseFloat(exam.fee) > 0) {
                for (const participant of newData) {
                    const member = await Member.findByPk(participant.memberId, { transaction: t });
                    if (!member) continue;

                    const account = await FinancialAccountService.createMemberAccount(member, t);
                    
                    await FinancialTransaction.create({
                        financialAccountId: account.id,
                        transactionType: 'DEBIT',
                        amount: exam.fee,
                        description: `SINAV ÜCRETİ: ${exam.examName || ''}`,
                        category: 'EXAM_FEE',
                        paymentMethod: 'OTHER',
                        branchId: exam.gymBranchId || member.branchId,
                        companyId: exam.companyId || member.companyId,
                        createdBy: user.id
                    }, { transaction: t });

                    await account.update({
                        balance: sequelize.literal(`"balance" - ${exam.fee}`),
                        totalDebit: sequelize.literal(`"totalDebit" + ${exam.fee}`)
                    }, { transaction: t });
                }
            }

            return { addedCount: newData.length };
        });
    }

    /**
     * Sınav sonucunu günceller ve geçildiyse üyeyi terfi ettirir
     */
    static async updateResult(participantId, status) {
        return await sequelize.transaction(async (t) => {
            const participant = await BeltExamParticipant.findByPk(participantId, {
                include: [{ model: BeltExam, as: 'exam' }],
                transaction: t
            });

            if (!participant) throw new Error('Katılımcı bulunamadı.');

            participant.status = status;
            await participant.save({ transaction: t });

            if (status === 'PASSED') {
                const member = await Member.findByPk(participant.memberId, { transaction: t });
                if (member) {
                    await member.update({
                        currentBelt: participant.toBelt,
                        lastBeltDate: participant.exam.examDate
                    }, { transaction: t });
                }
            }
            return participant;
        });
    }

    /**
     * Katılımcıyı siler ve yansıtılan ücretleri geri alır
     */
    static async removeParticipant(participantId) {
        return await sequelize.transaction(async (t) => {
            const participant = await BeltExamParticipant.findByPk(participantId, {
                include: [{ model: BeltExam, as: 'exam' }],
                transaction: t
            });

            if (!participant) throw new Error('Katılımcı bulunamadı.');

            const account = await FinancialAccount.findOne({
                where: { entityType: 'MEMBER', entityId: participant.memberId },
                transaction: t
            });

            if (account) {
                const transactions = await FinancialTransaction.findAll({
                    where: {
                        financialAccountId: account.id,
                        description: { [Op.like]: `%${participant.exam?.examName}%` }
                    },
                    transaction: t
                });

                for (const tx of transactions) {
                    const amount = parseFloat(tx.amount);
                    if (tx.transactionType === 'DEBIT') {
                        await account.update({
                            balance: sequelize.literal(`"balance" + ${amount}`),
                            totalDebit: sequelize.literal(`"totalDebit" - ${amount}`)
                        }, { transaction: t });
                    } else if (tx.transactionType === 'CREDIT') {
                        await account.update({
                            balance: sequelize.literal(`"balance" - ${amount}`),
                            totalCredit: sequelize.literal(`"totalCredit" - ${amount}`)
                        }, { transaction: t });
                    }
                    await tx.destroy({ transaction: t });
                }
            }

            await participant.destroy({ transaction: t });
            return true;
        });
    }

    /**
     * WhatsApp Duyurusu Gönderir
     */
    static async sendNotification(participantId) {
        const participant = await BeltExamParticipant.findByPk(participantId, {
            include: [
                { model: Member, as: 'member' },
                {
                    model: BeltExam,
                    as: 'exam',
                    include: [
                        { model: SportSpecialty, as: 'specialty' },
                        { model: Member, as: 'instructor', attributes: ['fullName'] }
                    ]
                }
            ]
        });

        if (!participant || !participant.member?.phone) throw new Error('Üye telefonu veya kayıt bulunamadı.');

        const member = participant.member;
        const exam = participant.exam;
        const date = new Date(exam.examDate).toLocaleDateString('tr-TR');

        const message = `🥋 *${exam.specialty.name.toUpperCase()} KUŞAK SINAVI* 🥋\n\n` +
            `Sayın *${member.fullName}*,\n\n` +
            `Sınav Bilgileri:\n📅 Tarih: ${date}\n⏰ Saat: ${exam.examTime || '--:--'}\n` +
            `📍 Yer: ${exam.locationName || 'Salonumuz'}\n💰 Ücret: ₺${parseFloat(exam.fee).toFixed(2)}\n\n` +
            `Başarılar dileriz! 💪`;

        return await WhatsAppService.sendAutoMessage(member.phone, message);
    }
}

module.exports = BeltExamService;
