const { FinancialAccount, FinancialTransaction } = require('./src/models');

const deleteBehaSoftAccounts = async () => {
    try {
        const behaSoftCompanyId = 'eb444307-136d-4aca-bf54-1788970f030f';
        const accounts = await FinancialAccount.findAll({
            where: { companyId: behaSoftCompanyId }
        });

        console.log(`BehaSoft için ${accounts.length} cari hesap bulundu.`);

        for (const acc of accounts) {
            // Önce bağlı işlemleri sil (Eğer varsa)
            const txDeleted = await FinancialTransaction.destroy({
                where: { financialAccountId: acc.id }
            });

            if (txDeleted > 0) {
                console.log(`${acc.accountName} hesabına ait ${txDeleted} işlem silindi.`);
            }

            await acc.destroy();
            console.log(`✅ ${acc.accountName} hesabı başarıyla silindi.`);
        }

        console.log('--- İşlem Tamamlandı ---');
        process.exit(0);
    } catch (err) {
        console.error('Hata:', err);
        process.exit(1);
    }
};

deleteBehaSoftAccounts();
