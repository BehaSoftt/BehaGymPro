const { PaymentPlan, PaymentSchedule, FinancialAccount, FinancialTransaction, sequelize, Member, Branch, Company } = require('../../models');
const { Op } = require('sequelize');
const WhatsAppService = require('../notifications/WhatsAppService');

class PaymentService {
    /**
     * Taksit planı ve takvimini oluşturur
     */
    static async createPaymentPlan(data, user) {
        const { financialAccountId, relatedTransactionId, planName, totalAmount, installmentCount, installmentFrequency, startDate } = data;
        const { branchId, companyId, role } = user;

        const account = await FinancialAccount.findOne({
            where: role === 'SUPER_MASTER' ? { id: financialAccountId, companyId } : { id: financialAccountId, branchId, companyId }
        });
        if (!account) throw new Error('Cari hesap bulunamadı.');

        const total = parseFloat(totalAmount);
        const count = parseInt(installmentCount);
        const installmentAmount = Math.floor((total / count) * 100) / 100;
        const remainder = parseFloat((total - (installmentAmount * count)).toFixed(2));

        const plan = await PaymentPlan.create({
            financialAccountId, relatedTransactionId, planName: planName || `${installmentCount} Taksit Planı`,
            totalAmount: total, paidAmount: 0, remainingAmount: total, installmentCount: count, installmentAmount,
            installmentFrequency: installmentFrequency || 'MONTHLY', startDate: start, status: 'ACTIVE',
            branchId: account.branchId, companyId: account.companyId
        });

        const schedules = [];
        for (let i = 1; i <= count; i++) {
            let dueDate = new Date(start);
            if (installmentFrequency === 'WEEKLY') dueDate.setDate(start.getDate() + (i - 1) * 7);
            else dueDate.setMonth(start.getMonth() + (i - 1));

            // Son taksite varsa kalan kuruş farkını ekle
            const currentAmount = i === count ? (installmentAmount + remainder).toFixed(2) : installmentAmount.toFixed(2);

            schedules.push({
                paymentPlanId: plan.id, installmentNumber: i, dueDate, amount: currentAmount,
                paidAmount: 0, status: 'PENDING', branchId: account.branchId, companyId: account.companyId
            });
        }

        await PaymentSchedule.bulkCreate(schedules);
        plan.endDate = schedules[schedules.length - 1].dueDate;
        await plan.save();

        // WhatsApp Bildirimi
        if (account.entityType === 'MEMBER') {
            this.sendPlanNotification(account.entityId, plan, schedules).catch(e => console.error(e));
        }

        return { plan, schedules };
    }

    /**
     * Tek bir taksit ödemesi alır
     */
    static async payInstallment(scheduleId, paymentData, user) {
        const { amount, paymentMethod, paidDate } = paymentData;
        
        return await sequelize.transaction(async (t) => {
            const schedule = await PaymentSchedule.findByPk(scheduleId, {
                include: [{ model: PaymentPlan, as: 'plan' }],
                transaction: t
            });

            if (!schedule || schedule.status === 'PAID') throw new Error('Geçersiz veya zaten ödenmiş taksit.');

            const paymentAmount = parseFloat(amount);
            const transaction = await FinancialTransaction.create({
                financialAccountId: schedule.plan.financialAccountId, transactionType: 'CREDIT',
                amount: paymentAmount, description: `${schedule.plan.planName} - ${schedule.installmentNumber}. Taksit Ödemesi`,
                category: 'MEMBERSHIP', paymentMethod: paymentMethod || 'CASH', transactionDate: paidDate || new Date(),
                branchId: schedule.branchId, companyId: schedule.companyId, createdBy: user.id
            }, { transaction: t });

            schedule.paidAmount = parseFloat(schedule.paidAmount) + paymentAmount;
            schedule.status = schedule.paidAmount >= parseFloat(schedule.amount) ? 'PAID' : 'PARTIAL';
            schedule.transactionId = transaction.id;
            await schedule.save({ transaction: t });

            const plan = schedule.plan;
            plan.paidAmount = parseFloat(plan.paidAmount) + paymentAmount;
            plan.remainingAmount = parseFloat(plan.totalAmount) - parseFloat(plan.paidAmount);
            
            const remainingSchedules = await PaymentSchedule.count({
                where: { paymentPlanId: plan.id, status: { [Op.ne]: 'PAID' } },
                transaction: t
            });
            if (remainingSchedules === 0) plan.status = 'COMPLETED';
            await plan.save({ transaction: t });

            const account = await FinancialAccount.findByPk(plan.financialAccountId, { transaction: t });
            await account.update({
                balance: sequelize.literal(`"balance" + ${paymentAmount}`),
                totalCredit: sequelize.literal(`"totalCredit" + ${paymentAmount}`)
            }, { transaction: t });

            return { schedule, plan, transaction };
        });
    }

    /**
     * Tüm planı kapatır
     */
    static async payAllInstallments(planId, paymentData, user) {
        const { paymentMethod, paidDate } = paymentData;
        
        return await sequelize.transaction(async (t) => {
            const plan = await PaymentPlan.findByPk(planId, { transaction: t });
            if (!plan || plan.status === 'COMPLETED') throw new Error('Plan bulunamadı veya zaten kapalı.');

            const remaining = parseFloat(plan.remainingAmount);
            const transaction = await FinancialTransaction.create({
                financialAccountId: plan.financialAccountId, transactionType: 'CREDIT', amount: remaining,
                description: `${plan.planName} - TOPLU KAPATMA`, category: 'MEMBERSHIP',
                paymentMethod: paymentMethod || 'CASH', transactionDate: paidDate || new Date(),
                branchId: plan.branchId, companyId: plan.companyId, createdBy: user.id
            }, { transaction: t });

            await PaymentSchedule.update({
                paidAmount: sequelize.literal('amount'), status: 'PAID', transactionId: transaction.id,
                paidDate: paidDate || new Date()
            }, { where: { paymentPlanId: plan.id, status: { [Op.ne]: 'PAID' } }, transaction: t });

            await plan.update({ paidAmount: plan.totalAmount, remainingAmount: 0, status: 'COMPLETED' }, { transaction: t });
            
            const account = await FinancialAccount.findByPk(plan.financialAccountId, { transaction: t });
            await account.update({
                balance: sequelize.literal(`"balance" + ${remaining}`),
                totalCredit: sequelize.literal(`"totalCredit" + ${remaining}`)
            }, { transaction: t });

            return { plan, transaction };
        });
    }

    static async sendPlanNotification(memberId, plan, schedules) {
        const member = await Member.findByPk(memberId, { include: ['Branch'] });
        const branch = await Branch.findByPk(member.branchId, { include: ['Company'] });
        if (member?.phone && branch?.isWhatsAppEnabled) {
            const msg = WhatsAppService.getPaymentPlanMessage(member, plan, schedules, branch.Company?.name, branch.name, branch.phone);
            await WhatsAppService.sendAutoMessage(member.phone, msg);
        }
    }
}

module.exports = PaymentService;
