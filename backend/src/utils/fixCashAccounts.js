const { Company, Branch, FinancialAccount, FinancialTransaction } = require('../models');
const FinancialAccountService = require('../services/finance/FinancialAccountService');

const fixExistingCashAccounts = async () => {
    try {
        console.log('--- Mevcut Şirket ve Şubeler için Kasa Kontrolü Başlatıldı ---');

        // Tüm şirketleri ve şubeleri bul (BehaSoft dahil, çünkü Super Master test yapıyor olabilir)
        const companies = await Company.findAll({
            include: [{ model: Branch, as: 'branches' }]
        });

        for (const company of companies) {
            if (company.branches && company.branches.length > 0) {
                // Şirket kasasını oluştur
                const firstBranch = company.branches[0];
                await FinancialAccountService.createCompanyCashAccount(company, firstBranch.id);

                // Her şube için şube kasasını oluştur
                for (const branch of company.branches) {
                    await FinancialAccountService.createBranchCashAccount(branch);
                }
            }
        }

        console.log('--- Kasa Kontrolü Tamamlandı ---');
    } catch (err) {
        console.error('Kasa düzeltme hatası:', err);
    }
};

module.exports = fixExistingCashAccounts;
