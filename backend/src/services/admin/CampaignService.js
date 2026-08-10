const { Campaign, Branch, Company } = require('../../models');
const { Op } = require('sequelize');

class CampaignService {
    /**
     * Aktif ve filtrelenmiş kampanyaları getirir
     */
    static async getCampaigns(filters) {
        const { companyId, branchId, activeOnly } = filters;
        const where = {};
        const now = new Date();

        if (companyId) where.companyId = companyId;
        if (branchId) where[Op.or] = [{ branchId }, { branchId: null }];
        
        if (activeOnly === 'true' || activeOnly === true) {
            where.isActive = true;
            where.startDate = { [Op.lte]: now };
            where.endDate = { [Op.gte]: now };
        }

        return await Campaign.findAll({
            where,
            include: [
                { model: Branch, as: 'Branch', attributes: ['name'] },
                { model: Company, as: 'Company', attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']]
        });
    }
}

module.exports = CampaignService;
