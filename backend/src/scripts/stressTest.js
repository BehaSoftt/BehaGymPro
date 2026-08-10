require('dotenv').config();
const { Member, FinancialAccount, FinancialTransaction, Branch, Company, sequelize } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

async function stressTest(mode = 'generate') {
    try {
        await sequelize.authenticate();
        
        // Şirket ve Şube bilgilerini otomatik bul
        const company = await Company.findOne({ where: { name: { [Op.iLike]: '%Ayaz Spor%' } } });
        const branch = await Branch.findOne({ where: { name: { [Op.iLike]: '%Kuşcağız%' } } });

        if (!company || !branch) {
            console.error('Hata: Ayaz Spor veya Kuşcağız Şubesi bulunamadı. Lütfen önce bunları oluşturun.');
            return;
        }

        if (mode === 'cleanup') {
            console.log('--- KAPSAMLI TEMİZLİK BAŞLATILDI ---');
            
            // 1. Önce [TEST] üyelerini bul
            const [testMembers] = await sequelize.query(`SELECT id FROM "Members" WHERE "fullName" LIKE '[TEST]%'`);
            const memberIds = testMembers.map(m => m.id);

            if (memberIds.length === 0) {
                console.log('Silinecek test verisi bulunamadı.');
                return;
            }

            // 2. Bu üyelere ait Cari Hesapları (FinancialAccounts) bul
            const [testAccounts] = await sequelize.query(`SELECT id FROM "FinancialAccounts" WHERE "entityId" IN ('${memberIds.join("','")}')`);
            const accountIds = testAccounts.map(a => a.id);

            // 3. Sırayla sil (Bağımlılık sırasına göre)
            if (accountIds.length > 0) {
                console.log(`[!] ${accountIds.length} cari hesaba bağlı işlemler siliniyor...`);
                await sequelize.query(`DELETE FROM "FinancialTransactions" WHERE "financialAccountId" IN ('${accountIds.join("','")}')`);
                
                console.log(`[!] ${accountIds.length} cari hesap siliniyor...`);
                await sequelize.query(`DELETE FROM "FinancialAccounts" WHERE "id" IN ('${accountIds.join("','")}')`);
            }

            console.log(`[!] ${memberIds.length} üye siliniyor...`);
            await sequelize.query(`DELETE FROM "Members" WHERE "id" IN ('${memberIds.join("','")}')`);

            console.log('>>> TEMİZLİK TAMAMLANDI. Sistem eski haline döndü.');
            return;
        }

        if (mode === 'transactions') {
            const [testMembers] = await sequelize.query(`SELECT id, "fullName" FROM "Members" WHERE "fullName" LIKE '[TEST]%'`);
            
            if (testMembers.length === 0) {
                console.error('Hata: Önce üyeleri oluşturmalısınız (node stressTest.js generate)');
                return;
            }

            console.log(`--- [CARI TEST] ${testMembers.length} üyeye 100er işlem (Toplam 500.000) ekleniyor... ---`);
            
            for (let member of testMembers) {
                // 1. Üye için Cari Hesap var mı bak, yoksa aç
                let [account] = await FinancialAccount.findOrCreate({
                    where: { entityId: member.id, entityType: 'MEMBER' },
                    defaults: {
                        id: uuidv4(),
                        accountName: member.fullName,
                        branchId: branch.id,
                        companyId: company.id,
                        balance: 0,
                        totalDebit: 0,
                        totalCredit: 0
                    }
                });

                // 2. 100 işlem üret (Batch ile)
                const txs = [];
                for (let k = 0; k < 100; k++) {
                    const isDebit = k % 2 === 0;
                    txs.push({
                        id: uuidv4(),
                        financialAccountId: account.id,
                        transactionType: isDebit ? 'DEBIT' : 'CREDIT',
                        amount: (Math.random() * 100 + 10).toFixed(2),
                        description: `[TEST] Otomatik Cari İşlem #${k+1}`,
                        category: 'OTHER',
                        paymentMethod: 'CASH',
                        transactionDate: new Date(Date.now() - k * 3600000), // Geriye dönük saatlik işlemler
                        branchId: branch.id,
                        companyId: company.id
                    });
                }
                await FinancialTransaction.bulkCreate(txs);
                
                // İlerleme logu (Her 100 üyede bir)
                if (testMembers.indexOf(member) % 100 === 0) {
                    console.log(`[+] ${testMembers.indexOf(member)} üyenin cari işlemleri yüklendi...`);
                }
            }
            console.log('--- CARI İŞLEMLER BAŞARIYLA EKLENDİ ---');
            return;
        }

        // VARSAYILAN: Üyeleri Oluştur
        console.log(`--- STRES TESTİ: 5.000 ÜYE OLUŞTURULUYOR (${branch.name}) ---`);
        const batchSize = 500;
        for (let i = 0; i < 10; i++) {
            const members = [];
            const accounts = [];
            for (let j = 0; j < batchSize; j++) {
                const memberId = uuidv4();
                const fullName = `[TEST] Üye ${i * batchSize + j}`;
                
                members.push({
                    id: memberId,
                    fullName,
                    memberCode: `ST-${10000 + i * batchSize + j}`,
                    phone: '5550000000',
                    isActive: true,
                    branchId: branch.id,
                    companyId: company.id,
                    profileType: 'MEMBER',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                // Her üyeye otomatik bir boş cari hesap da açalım
                accounts.push({
                    id: uuidv4(),
                    entityType: 'MEMBER',
                    entityId: memberId,
                    accountName: fullName,
                    branchId: branch.id,
                    companyId: company.id,
                    balance: 0
                });
            }
            await Member.bulkCreate(members);
            await FinancialAccount.bulkCreate(accounts);
            console.log(`[+] ${ (i+1) * batchSize } üye ve cari hesap oluşturuldu...`);
        }

        console.log('--- ÜYELER OLUŞTURULDU ---');
        console.log('Şimdi cari işlemleri eklemek için: node src/scripts/stressTest.js transactions');
        
    } catch (error) {
        console.error('Hata:', error.message);
    } finally {
        process.exit();
    }
}

const mode = process.argv[2] || 'generate';
stressTest(mode);
