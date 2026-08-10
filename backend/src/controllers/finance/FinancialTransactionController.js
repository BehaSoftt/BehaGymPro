const FinancialAccountService = require('../../services/finance/FinancialAccountService');
const { FinancialTransaction, FinancialAccount } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');

class FinancialTransactionController {
    /**
     * Tüm finansal işlemleri listele
     */
    static getAll = catchAsync(async (req, res) => {
        const { branchId, companyId } = req.user;
        const { page = 1, limit = 50, financialAccountId } = req.query;
        
        const where = { branchId, companyId };
        if (financialAccountId) where.financialAccountId = financialAccountId;

        const { count, rows } = await FinancialTransaction.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['createdAt', 'DESC']],
            include: [
                { model: FinancialAccount, as: 'account', attributes: ['accountName', 'accountCode'] }
            ]
        });

        res.json({
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            transactions: rows
        });
    });

    /**
     * Yeni finansal işlem ekle
     */
    static create = catchAsync(async (req, res) => {
        const { financialAccountId, amount, transactionType, description, category, paymentMethod } = req.body;
        
        if (!financialAccountId || !amount || !transactionType) {
            throw new AppError('Eksik bilgi: financialAccountId, amount ve transactionType zorunludur.', 400);
        }

        const transaction = await FinancialAccountService.addTransaction(
            financialAccountId,
            { amount, transactionType, description, category, paymentMethod },
            req.user.id
        );

        res.status(201).json(transaction);
    });

    /**
     * Finansal işlem sil (Bakiye düzeltmesi ile)
     */
    static delete = catchAsync(async (req, res) => {
        // FinancialAccountController'dakini kullanabiliriz ama buraya da ekleyelim
        const { id } = req.params;
        const { FinancialTransaction: FT, FinancialAccount: FA, sequelize } = require('../../models');
        
        await sequelize.transaction(async (t) => {
            const tx = await FT.findByPk(id, { transaction: t });
            if (!tx) throw new AppError('İşlem bulunamadı.', 404);

            const account = await FA.findByPk(tx.financialAccountId, { transaction: t });
            if (!account) throw new AppError('Cari hesap bulunamadı.', 404);
            
            const amount = parseFloat(tx.amount);
            if (tx.transactionType === 'CREDIT') {
                await account.update({
                    balance: sequelize.literal(`"balance" - ${amount}`),
                    totalCredit: sequelize.literal(`"totalCredit" - ${amount}`),
                    cashBalance: tx.paymentMethod === 'CASH' ? sequelize.literal(`"cashBalance" - ${amount}`) : undefined
                }, { transaction: t });
            } else {
                await account.update({
                    balance: sequelize.literal(`"balance" + ${amount}`),
                    totalDebit: sequelize.literal(`"totalDebit" - ${amount}`),
                    cashBalance: tx.paymentMethod === 'CASH' ? sequelize.literal(`"cashBalance" + ${amount}`) : undefined
                }, { transaction: t });
            }

            await tx.destroy({ transaction: t });
        });

        res.json({ message: 'İşlem silindi ve bakiye güncellendi.' });
    });
}

module.exports = FinancialTransactionController;
