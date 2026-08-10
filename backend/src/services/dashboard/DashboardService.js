const {
    Member, MembershipPackage, Branch, FinancialAccount, 
    FinancialTransaction, SalesTransaction, SalesItem, 
    Product, AccessLog, sequelize
} = require('../../models');
const { Op } = require('sequelize');

class DashboardService {
    /**
     * Dashboard için tüm ana istatistikleri toplar
     */
    static async getDashboardStats(user) {
        const { branchId, companyId, role, id: userId } = user;
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const next10Days = new Date();
        next10Days.setDate(today.getDate() + 10);
        const next10DaysStr = next10Days.toISOString().split('T')[0];

        const where = role === 'SUPER_MASTER' ? { companyId } : { branchId, companyId };

        // 1. Üye Sayıları ve Girişler
        const totalMembers = await Member.count({ where: { ...where, profileType: 'MEMBER' } });
        const activeMembers = await Member.count({ 
            where: { ...where, profileType: 'MEMBER', isActive: true, expiryDate: { [Op.gte]: todayStr } } 
        });
        const insideCount = await Member.count({ where: { ...where, profileType: 'MEMBER', isInside: true } });
        
        // AccessLog does not have companyId, we need to filter by branchIds
        const companyBranches = await Branch.findAll({ where: { companyId }, attributes: ['id'] });
        const branchIds = companyBranches.map(b => b.id);
        const logWhere = role === 'SUPER_MASTER' ? { branchId: { [Op.in]: branchIds } } : { branchId };

        const todayEntries = await AccessLog.count({ 
            where: { 
                ...logWhere, 
                actionType: 'ENTRY', 
                status: 'SUCCESS',
                timestamp: { [Op.gte]: todayStr }
            } 
        });

        // 2. Finansal Özet (Cari Bakiyeler ve Bugünün Satışları)
        // Personel hesabı için üye profilini bulun
        const userProfile = await Member.findOne({ where: { userId, companyId } });
        const personnelAccount = await FinancialAccount.findOne({ where: { entityType: 'USER', entityId: userProfile?.id || userId, companyId } });
        const branchAccount = await FinancialAccount.findOne({ where: { entityType: 'BRANCH', entityId: branchId, companyId } });
        
        const allBranchAccounts = await FinancialAccount.findAll({ where: { entityType: 'BRANCH', companyId } });
        const totalCompanyBalance = allBranchAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

        const todaySales = await SalesTransaction.findAll({
            where: { 
                ...where, 
                status: 'COMPLETED',
                createdAt: { [Op.gte]: todayStr }
            }
        });
        const todaySalesTotal = todaySales.reduce((sum, s) => sum + parseFloat(s.totalAmount || 0), 0);

        // 3. Son Hareketler
        const recentTransactions = await FinancialTransaction.findAll({
            where, include: [{ model: FinancialAccount, as: 'account', attributes: ['accountName'] }],
            order: [['createdAt', 'DESC']], limit: 50
        });

        const recentSales = await SalesTransaction.findAll({
            where: { ...where, status: 'COMPLETED' },
            include: [{ model: SalesItem, as: 'items', include: ['product'] }, { model: FinancialAccount, as: 'account', attributes: ['accountName'] }],
            order: [['createdAt', 'DESC']], limit: 50
        });

        // 4. Hatırlatıcılar & Yaklaşanlar
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const birthdays = await Member.findAll({
            where: {
                ...where, profileType: 'MEMBER',
                [Op.and]: [
                    sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "birthDate"')), month),
                    sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('DAY FROM "birthDate"')), day)
                ]
            }, limit: 10
        });

        const expiringSoonResult = await Member.findAll({
            where: { ...where, profileType: 'MEMBER', isActive: true, expiryDate: { [Op.between]: [todayStr, next10DaysStr] } },
            include: [{ model: MembershipPackage, as: 'package', attributes: ['name'] }],
            order: [['expiryDate', 'ASC']], limit: 50
        });

        return {
            counts: { 
                totalMembers, 
                activeMembers, 
                insideCount,
                todayEntries,
                todaySalesTotal
            },
            cashInfo: {
                personnelBalance: personnelAccount?.balance || 0,
                branchBalance: branchAccount?.balance || 0,
                companyBalance: totalCompanyBalance.toFixed(2)
            },
            recentTransactions,
            recentSales,
            birthdays: birthdays.map(b => ({ name: b.fullName, phone: b.phone, age: b.age })),
            expiringSoon: expiringSoonResult.map(m => ({
                name: m.fullName, packageName: m.package?.name, expiryDate: m.expiryDate,
                daysLeft: Math.ceil((new Date(m.expiryDate) - today) / (1000 * 60 * 60 * 24))
            })),
            expiredMembers: (await Member.findAll({
                where: { ...where, profileType: 'MEMBER', expiryDate: { [Op.lt]: todayStr } },
                include: [{ model: MembershipPackage, as: 'package', attributes: ['name'] }],
                order: [['expiryDate', 'DESC']], limit: 50
            })).map(m => ({
                name: m.fullName, packageName: m.package?.name || 'Paket Yok', expiryDate: m.expiryDate
            })),
            newestMembers: (await Member.findAll({
                where: { ...where, profileType: 'MEMBER' },
                include: [{ model: MembershipPackage, as: 'package', attributes: ['name'] }],
                order: [['createdAt', 'DESC']], limit: 40
            })).map(m => ({
                name: m.fullName, package: m.package?.name || 'Paket Yok', date: m.createdAt
            }))
        };
    }
}

module.exports = DashboardService;
