const FinancialAccountService = require('../../services/finance/FinancialAccountService');
const { catchAsync, AppError } = require('../../middleware/errorHandler');

class FinancialAccountController {
    /**
     * Tüm cari hesapları listele
     */
    static getAll = catchAsync(async (req, res) => {
        const accounts = await FinancialAccountService.getAllAccounts(req.query, req.user);
        res.json(accounts);
    });

    /**
     * Tek hesap detayını getir
     */
    static getById = catchAsync(async (req, res) => {
        const result = await FinancialAccountService.getAccountDetail(req.params.id);
        if (!result) throw new AppError('Cari hesap bulunamadı.', 404);
        res.json(result);
    });

    /**
     * Cari hesap istatistiklerini getir
     */
    static getStats = catchAsync(async (req, res) => {
        const { branchId, companyId } = req.user;
        const [totalAccounts, totalBalance] = await Promise.all([
            (require('../../models').FinancialAccount).count({ where: { branchId, companyId } }),
            (require('../../models').FinancialAccount).sum('balance', { where: { branchId, companyId } })
        ]);
        res.json({ totalAccounts, totalBalance: totalBalance || 0 });
    });

    /**
     * Cari hesaba işlem ekle (Nakit Giriş/Çıkış vb)
     */
    static addTransaction = catchAsync(async (req, res) => {
        const transaction = await FinancialAccountService.addTransaction(
            req.params.id, 
            req.body, 
            req.user.id
        );
        res.json({ message: 'İşlem başarıyla eklendi.', transaction });
    });

    /**
     * İşlem sil (Bakiye düzeltmesi ile)
     */
    static deleteTransaction = catchAsync(async (req, res) => {
        const { transactionId } = req.params;
        const { FinancialTransaction, FinancialAccount, sequelize } = require('../../models');
        
        await sequelize.transaction(async (t) => {
            const tx = await FinancialTransaction.findByPk(transactionId, { transaction: t });
            if (!tx) throw new AppError('İşlem bulunamadı.', 404);

            const account = await FinancialAccount.findByPk(tx.financialAccountId, { transaction: t });
            
            // Bakiyeyi geri al
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

    /**
     * Hesaplar arası transfer (Virman)
     */
    static transfer = catchAsync(async (req, res) => {
        const { fromAccountId, toAccountId, amount, description } = req.body;
        if (!fromAccountId || !toAccountId || !amount) throw new AppError('Eksik bilgiler.', 400);

        // From account: DEBIT (Çıkış)
        await FinancialAccountService.addTransaction(fromAccountId, {
            amount, transactionType: 'DEBIT', description: `Transfer -> To: ${toAccountId} | ${description || ''}`, category: 'TRANSFER'
        }, req.user.id);

        // To account: CREDIT (Giriş)
        await FinancialAccountService.addTransaction(toAccountId, {
            amount, transactionType: 'CREDIT', description: `Transfer <- From: ${fromAccountId} | ${description || ''}`, category: 'TRANSFER'
        }, req.user.id);

        res.json({ message: 'Transfer başarıyla gerçekleşti.' });
    });

    /**
     * Cari hesap bakiyesini hareketlere göre yeniden hesapla
     */
    static syncAccount = catchAsync(async (req, res) => {
        const { id } = req.params;
        const { FinancialAccount, FinancialTransaction } = require('../../models');
        const account = await FinancialAccount.findByPk(id);
        if (!account) throw new AppError('Hesap bulunamadı.', 404);

        const transactions = await FinancialTransaction.findAll({ where: { financialAccountId: id } });
        
        let totalCredit = 0;
        let totalDebit = 0;
        let cashBalance = 0;

        transactions.forEach(tx => {
            const amount = parseFloat(tx.amount);
            if (tx.transactionType === 'CREDIT') {
                totalCredit += amount;
                if (tx.paymentMethod === 'CASH') cashBalance += amount;
            } else {
                totalDebit += amount;
                if (tx.paymentMethod === 'CASH') cashBalance -= amount;
            }
        });

        await account.update({
            totalCredit,
            totalDebit,
            balance: totalCredit - totalDebit,
            cashBalance
        });

        res.json({ message: 'Hesap bakiyesi senkronize edildi.', account });
    });

    /**
     * Şube kasasını kapat (Günlük)
     */
    static closeBranchCash = catchAsync(async (req, res) => {
        const result = await FinancialAccountService.closeDailyBranchCash(req.user.branchId, req.user.id);
        if (!result.success) throw new AppError(result.message, 400);
        res.json(result);
    });

    /**
     * Hesap bilgilerini güncelle
     */
    static update = catchAsync(async (req, res) => {
        const account = await (require('../../models').FinancialAccount).findByPk(req.params.id);
        if (!account) throw new AppError('Cari hesap bulunamadı.', 404);
        await account.update(req.body);
        res.json({ message: 'Hesap güncellendi.', account });
    });
}

module.exports = FinancialAccountController;
