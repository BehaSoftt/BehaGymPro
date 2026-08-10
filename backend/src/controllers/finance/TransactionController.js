const { Transaction } = require('../../models');
const { catchAsync } = require('../../middleware/errorHandler');

class TransactionController {
    /**
     * Manuel işlem ekle
     */
    static addTransaction = catchAsync(async (req, res) => {
        const { branchId, companyId } = req.user;
        const transaction = await Transaction.create({
            ...req.body,
            branchId,
            companyId
        });
        res.status(201).json(transaction);
    });

    /**
     * Üye bakiyesini getir
     */
    static getMemberBalance = catchAsync(async (req, res) => {
        const { memberId } = req.params;
        const { branchId, companyId } = req.user;
        
        const transactions = await Transaction.findAll({ 
            where: { memberId, branchId, companyId } 
        });

        let balance = 0;
        transactions.forEach(t => {
            if (t.type === 'PAYMENT') balance += parseFloat(t.amount);
            else balance -= parseFloat(t.amount);
        });

        res.json({ memberId, balance, transactions });
    });
}

module.exports = TransactionController;
