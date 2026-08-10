const { FinancialAccount, FinancialTransaction, sequelize, Branch, Member, User } = require('../../models');

class FinancialAccountService {
    /**
     * Yeni kayıt için otomatik cari hesap oluştur
     */
    static async createFinancialAccount(entityType, entityId, accountName, branchId, companyId, notes = null, isSystemAccount = false, transaction = null) {
        try {
            if (!companyId || !branchId) {
                console.log(`[FinancialAccount] Cari hesap oluşturma atlandı (companyId/branchId eksik): ${accountName}`);
                return null;
            }

            const existing = await FinancialAccount.findOne({
                where: { entityType, entityId },
                transaction
            });

            if (existing) return existing;

            const year = new Date().getFullYear();

            // Unique accountCode oluştur (retry mekanizması ile)
            let accountCode;
            let attempts = 0;
            const maxAttempts = 10;

            while (attempts < maxAttempts) {
                const count = await FinancialAccount.count({ where: { companyId }, transaction });
                const randomSuffix = Math.floor(Math.random() * 1000);
                accountCode = `CRI-${year}-${String(count + 1 + randomSuffix).padStart(4, '0')}`;

                // Bu kod zaten kullanılıyor mu kontrol et
                const codeExists = await FinancialAccount.findOne({
                    where: { accountCode },
                    transaction
                });

                if (!codeExists) break;
                attempts++;
            }

            return await FinancialAccount.create({
                entityType, entityId, accountName, accountCode,
                balance: 0, totalDebit: 0, totalCredit: 0,
                branchId, companyId, notes, isSystemAccount, isActive: true
            }, { transaction });
        } catch (err) {
            console.error('❌ Cari hesap oluşturulamadı:', err.message);
            throw err; // Transaction'ı rollback etmek için hatayı fırlat
        }
    }

    static async createMemberAccount(member, transaction = null) {
        let entityType = 'MEMBER';
        if (member.profileType === 'INSTRUCTOR') entityType = 'INSTRUCTOR';
        else if (member.profileType === 'PERSONNEL' || member.profileType === 'STAFF' || member.profileType === 'USER') entityType = 'USER';
        
        return this.createFinancialAccount(entityType, member.id, member.fullName, member.branchId, member.companyId, null, false, transaction);
    }

    static async createUserAccount(user, branchId, companyId, transaction = null) {
        return this.createFinancialAccount('USER', user.id, user.username, branchId, companyId, null, false, transaction);
    }

    static async createInstructorAccount(member, transaction = null) {
        return this.createMemberAccount(member, transaction);
    }

    static async createCompanyCashAccount(company, branchId) {
        return this.createFinancialAccount(
            'COMPANY', company.id, `${company.name} - GENEL KASA`,
            branchId, company.id, 'Şirket merkezi ana kasası (SİLİNEMEZ)', true
        );
    }

    static async createBranchCashAccount(branch) {
        return this.createFinancialAccount(
            'BRANCH', branch.id, `${branch.name} - ŞUBE KASASI`,
            branch.id, branch.companyId, 'Şube günlük işletme kasası (SİLİNEMEZ)', true
        );
    }

    /**
     * Şube kasasını kapatıp bakiyeyi şirket ana kasasına transfer eder
     */
    static async closeDailyBranchCash(branchId, userId = null) {
        const transaction = await sequelize.transaction();
        try {
            const { Op } = require('sequelize');

            // 1. Şubeye ait tüm register (kasa) hesaplarını bul (Şube kasası ve Misafir/Serbest Satış kasası)
            const registerAccounts = await FinancialAccount.findAll({
                where: {
                    entityId: branchId,
                    entityType: { [Op.in]: ['BRANCH', 'GUEST'] },
                    isActive: true
                },
                transaction
            });

            // Aktarılacak toplam nakit bakiyeyi hesapla
            const totalTransferAmount = registerAccounts.reduce((sum, acc) => sum + parseFloat(acc.cashBalance || 0), 0);

            if (totalTransferAmount <= 0) {
                await transaction.rollback();
                return { success: false, message: 'Şube kasalarında (Şube/Misafir) aktarılacak nakit bakiye bulunamadı.' };
            }

            // 2. Şirket ana kasasını bul (Transferin yapılacağı yer)
            const companyAccount = await FinancialAccount.findOne({
                where: {
                    entityType: 'COMPANY',
                    companyId: registerAccounts[0].companyId,
                    isSystemAccount: true
                },
                transaction
            });

            if (!companyAccount) {
                await transaction.rollback();
                return { success: false, message: 'Şirket ana kasası bulunamadı.' };
            }

            const today = new Date().toLocaleDateString('tr-TR');
            const description = `${today} Tarihli Şube Kasa Kapanışı (Hızlı Satış + Şube Kasası)`;

            // 3. Her bir kaynak kasadan çıkış yap ve bakiyeleri sıfırla
            for (const branchAccount of registerAccounts) {
                const amount = parseFloat(branchAccount.cashBalance || 0);
                if (amount <= 0) continue;

                // Kaynak Kasadan Çıkış (DEBIT)
                await FinancialTransaction.create({
                    financialAccountId: branchAccount.id,
                    transactionType: 'DEBIT',
                    amount: amount,
                    description,
                    category: 'CASH_TRANSFER',
                    branchId: branchAccount.branchId,
                    companyId: branchAccount.companyId,
                    createdBy: userId
                }, { transaction });

                // Kaynak Kasa Bakiyesi Güncelle (Sıfırla)
                await branchAccount.update({
                    balance: sequelize.literal(`"balance" - ${amount}`),
                    cashBalance: 0,
                    totalDebit: sequelize.literal(`"totalDebit" + ${amount}`)
                }, { transaction });
            }

            // 4. Şirket Kasasına Toplam Giriş Yap (CREDIT)
            await FinancialTransaction.create({
                financialAccountId: companyAccount.id,
                transactionType: 'CREDIT',
                amount: totalTransferAmount,
                description: `Şube Kapanışı: ${description}`,
                category: 'CASH_TRANSFER',
                branchId: companyAccount.branchId,
                companyId: companyAccount.companyId,
                createdBy: userId
            }, { transaction });

            // Şirket Kasası Bakiyesi Güncelle
            await companyAccount.update({
                balance: sequelize.literal(`"balance" + ${totalTransferAmount}`),
                cashBalance: sequelize.literal(`"cashBalance" + ${totalTransferAmount}`),
                totalCredit: sequelize.literal(`"totalCredit" + ${totalTransferAmount}`)
            }, { transaction });

            await transaction.commit();
            console.log(`✅ Şube kasaları kapatıldı. Toplam: ${totalTransferAmount} TL transfer edildi.`);
            return { success: true, amount: totalTransferAmount };
        } catch (err) {
            if (transaction) await transaction.rollback();
            console.error('❌ Kasa kapatma hatası:', err);
            return { success: false, message: err.message };
        }
    }

    /**
     * Cari hesapları filtreleyerek listeler
     */
    static async getAllAccounts(filters, user) {
        const startTime = Date.now();
        const { branchId, companyId, role } = user;
        const { entityType, isActive, search, category, paymentMethod, page = 1, limit = 50, branchId: filterBranchId } = filters;
        const { Op } = require('sequelize');

        const whereClause = {};
        if (role !== 'SUPER_MASTER') {
            if (companyId) whereClause.companyId = companyId;
            if (filterBranchId) whereClause.branchId = filterBranchId;
        } else {
            if (filterBranchId) whereClause.branchId = filterBranchId;
        }

        if (entityType) whereClause.entityType = entityType;
        if (isActive !== undefined) whereClause.isActive = isActive === 'true';

        if (search) {
            const memberIds = (await Member.findAll({
                where: {
                    [Op.or]: [
                        { fullName: { [Op.iLike]: `%${search}%` } },
                        { phone: { [Op.iLike]: `%${search}%` } },
                        { memberCode: { [Op.iLike]: `%${search}%` } }
                    ]
                },
                attributes: ['id']
            })).map(m => m.id);

            const userIds = (await User.findAll({
                where: {
                    [Op.or]: [{ username: { [Op.iLike]: `%${search}%` } }, { email: { [Op.iLike]: `%${search}%` } }]
                },
                attributes: ['id']
            })).map(u => u.id);

            whereClause[Op.or] = [
                { accountName: { [Op.iLike]: `%${search}%` } },
                { accountCode: { [Op.iLike]: `%${search}%` } }
            ];

            if (memberIds.length > 0) {
                whereClause[Op.or].push({ entityType: { [Op.in]: ['MEMBER', 'INSTRUCTOR'] }, entityId: { [Op.in]: memberIds } });
            }
            if (userIds.length > 0) {
                whereClause[Op.or].push({ entityType: 'USER', entityId: { [Op.in]: userIds } });
            }
        }

        const include = [
            { model: Branch, as: 'Branch', attributes: ['name'] },
            { model: require('../../models').Company, as: 'Company', attributes: ['name'] }
        ];

        if (category || paymentMethod) {
            const txWhere = {};
            if (category) txWhere.category = category;
            if (paymentMethod) txWhere.paymentMethod = paymentMethod;

            include.push({
                model: FinancialTransaction,
                as: 'transactions',
                where: txWhere,
                required: true,
                attributes: []
            });
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await FinancialAccount.findAndCountAll({
            where: whereClause,
            include,
            limit: parseInt(limit),
            offset: offset,
            order: [['createdAt', 'DESC']],
            distinct: true
        });

        const duration = Date.now() - startTime;
        console.log(`🚀 DATABASE_FETCH_TIME: ${duration}ms`);

        return {
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            accounts: rows
        };
    }

    /**
     * Cari hesap detayını ve son işlemlerini getirir
     */
    static async getAccountDetail(id) {
        const startTime = Date.now();
        const account = await FinancialAccount.findByPk(id, {
            include: [
                { model: Branch, as: 'Branch', attributes: ['name'] },
                {
                    model: FinancialTransaction,
                    as: 'transactions',
                    limit: 20,
                    order: [['transactionDate', 'DESC']],
                    include: [{ model: User, as: 'creator', attributes: ['username'] }]
                }
            ]
        });

        if (!account) return null;

        // İlişkili varlığı (Member/User/Branch) getir
        let relatedEntity = null;
        if (['MEMBER', 'INSTRUCTOR'].includes(account.entityType)) {
            relatedEntity = await Member.findByPk(account.entityId);
        } else if (account.entityType === 'USER') {
            relatedEntity = await User.findByPk(account.entityId);
        } else if (account.entityType === 'BRANCH') {
            relatedEntity = await Branch.findByPk(account.entityId);
        }

        const duration = Date.now() - startTime;
        console.log(`🚀 DATABASE_FETCH_TIME: ${duration}ms`);
        return { account, relatedEntity };
    }
    /**
     * Cari hesaba işlem ekler ve bakiyeyi günceller
     */
    static async addTransaction(accountId, transactionData, creatorId) {
        return await sequelize.transaction(async (t) => {
            const account = await FinancialAccount.findByPk(accountId, { transaction: t });
            if (!account) throw new Error('Cari hesap bulunamadı.');

            const { amount, transactionType, description, category, paymentMethod = 'CASH' } = transactionData;
            const cleanAmount = parseFloat(amount);

            // 1. İşlemi Kaydet
            const tx = await FinancialTransaction.create({
                financialAccountId: accountId,
                amount: cleanAmount,
                transactionType,
                description,
                category,
                paymentMethod,
                branchId: account.branchId,
                companyId: account.companyId,
                createdBy: creatorId
            }, { transaction: t });

            // 2. Bakiye Güncelle
            if (transactionType === 'CREDIT') {
                await account.update({
                    balance: sequelize.literal(`"balance" + ${cleanAmount}`),
                    totalCredit: sequelize.literal(`"totalCredit" + ${cleanAmount}`),
                    cashBalance: paymentMethod === 'CASH' ? sequelize.literal(`"cashBalance" + ${cleanAmount}`) : undefined
                }, { transaction: t });
            } else {
                await account.update({
                    balance: sequelize.literal(`"balance" - ${cleanAmount}`),
                    totalDebit: sequelize.literal(`"totalDebit" + ${cleanAmount}`),
                    cashBalance: paymentMethod === 'CASH' ? sequelize.literal(`"cashBalance" - ${cleanAmount}`) : undefined
                }, { transaction: t });
            }

            return tx;
        });
    }
}

module.exports = FinancialAccountService;
