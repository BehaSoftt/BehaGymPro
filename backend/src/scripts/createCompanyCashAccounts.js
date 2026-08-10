/**
 * Mevcut şirketler için Cari Kasa hesapları oluştur
 */

require('dotenv').config();
const { Company, Branch } = require('../models');
const FinancialAccountService = require('../services/finance/FinancialAccountService');

async function createCompanyCashAccounts() {
    try {
        console.log('🏢 Şirket Cari Kasa Hesapları Oluşturuluyor...');
        console.log('='.repeat(70));

        const companies = await Company.findAll({
            include: [{ 
                model: Branch, 
                as: 'branches',
                where: { isHeadquarters: true },
                required: false
            }]
        });

        for (const company of companies) {
            const branch = company.branches && company.branches[0];
            
            if (!branch) {
                console.log(`⚠️  ${company.name}: Merkez şube bulunamadı, atlanıyor`);
                continue;
            }

            try {
                await FinancialAccountService.createCompanyCashAccount(company, branch.id);
                console.log(`✅ ${company.name}: Cari Kasa hesabı oluşturuldu`);
            } catch (err) {
                console.log(`❌ ${company.name}: ${err.message}`);
            }
        }

        console.log('='.repeat(70));
        console.log('✅ İşlem tamamlandı');
        process.exit(0);
    } catch (err) {
        console.error('❌ Hata:', err);
        process.exit(1);
    }
}

createCompanyCashAccounts();
