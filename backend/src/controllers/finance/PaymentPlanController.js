const PaymentService = require('../../services/finance/PaymentService');
const { PaymentPlan, PaymentSchedule, FinancialAccount } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');
const { Op } = require('sequelize');

class PaymentPlanController {
    /**
     * Taksit planı oluştur
     */
    static create = catchAsync(async (req, res) => {
        const result = await PaymentService.createPaymentPlan(req.body, req.user);
        res.status(201).json({ message: 'Taksit planı oluşturuldu.', ...result });
    });

    /**
     * Taksit öde
     */
    static payInstallment = catchAsync(async (req, res) => {
        const result = await PaymentService.payInstallment(req.params.scheduleId, req.body, req.user);
        res.json({ message: 'Taksit ödemesi alındı.', ...result });
    });

    /**
     * Tüm planı kapat
     */
    static payAll = catchAsync(async (req, res) => {
        const result = await PaymentService.payAllInstallments(req.params.id, req.body, req.user);
        res.json({ message: 'Tüm taksitler tahsil edildi ve plan kapatıldı.', ...result });
    });

    /**
     * Cari hesaba ait planları listele
     */
    static getByAccount = catchAsync(async (req, res) => {
        const { accountId } = req.params;
        const { branchId, companyId, role } = req.user;

        const where = role === 'SUPER_MASTER' ? { financialAccountId: accountId, companyId } : { financialAccountId: accountId, branchId, companyId };
        const plans = await PaymentPlan.findAll({
            where,
            include: [{ model: PaymentSchedule, as: 'schedules' }],
            order: [['createdAt', 'DESC']]
        });
        res.json(plans);
    });

    /**
     * Tüm planları listele
     */
    static getAll = catchAsync(async (req, res) => {
        const { branchId, companyId, role } = req.user;
        const { status, search, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        const where = role === 'SUPER_MASTER' ? { companyId } : { branchId, companyId };
        if (status) where.status = status;

        const { count, rows: plans } = await PaymentPlan.findAndCountAll({
            where,
            include: [
                { 
                    model: FinancialAccount, 
                    as: 'account', 
                    where: search ? { accountName: { [Op.iLike]: `%${search}%` } } : {},
                    required: !!search 
                },
                { model: PaymentSchedule, as: 'schedules' }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true
        });

        res.json({
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            plans
        });
    });

    /**
     * Vadesi geçmiş taksitleri listele
     */
    static getOverdue = catchAsync(async (req, res) => {
        const { branchId, companyId, role } = req.user;
        const where = role === 'SUPER_MASTER' ? { companyId } : { branchId, companyId };

        const overdue = await PaymentSchedule.findAll({
            where: {
                ...where,
                status: { [Op.in]: ['PENDING', 'PARTIAL'] },
                dueDate: { [Op.lt]: new Date() }
            },
            include: [{ model: PaymentPlan, as: 'plan', include: ['account'] }],
            order: [['dueDate', 'ASC']]
        });
        res.json(overdue);
    });

    /**
     * Taksit iptal et
     */
    static cancelInstallment = catchAsync(async (req, res) => {
        const schedule = await PaymentSchedule.findByPk(req.params.scheduleId);
        if (!schedule) throw new AppError('Taksit bulunamadı.', 404);
        if (schedule.status === 'PAID') throw new AppError('Ödenmiş taksit iptal edilemez.', 400);

        await schedule.update({ status: 'CANCELLED' });
        res.json({ message: 'Taksit iptal edildi.' });
    });

    /**
     * Planı iptal et
     */
    static cancel = catchAsync(async (req, res) => {
        const plan = await PaymentPlan.findByPk(req.params.id);
        if (!plan) throw new AppError('Plan bulunamadı.', 404);
        
        await plan.update({ status: 'CANCELLED' });
        await PaymentSchedule.update({ status: 'CANCELLED' }, { where: { paymentPlanId: plan.id, status: { [Op.ne]: 'PAID' } } });
        
        res.json({ message: 'Ödeme planı ve bekleyen taksitler iptal edildi.' });
    });

    /**
     * Planı kalıcı olarak sil
     */
    static destroy = catchAsync(async (req, res) => {
        const { id } = req.params;
        const plan = await PaymentPlan.findByPk(id);
        if (!plan) throw new AppError('Plan bulunamadı.', 404);
        
        await plan.destroy(); // Cascade logic modelde tanımlı mı kontrol edilmeli ama genelde destroy yeteli
        res.json({ message: 'Ödeme planı kalıcı olarak silindi.' });
    });
}

module.exports = PaymentPlanController;
