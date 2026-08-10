const { Announcement, Branch } = require('../../models');
const { Op } = require('sequelize');

class AnnouncementService {
    /**
     * Filtrelerle duyuruları listeler
     */
    static async getAnnouncements(filters) {
        const { branchId, companyId, activeOnly, targetType } = filters;
        const where = {};
        const andConditions = [];

        if (companyId) where.companyId = companyId;
        if (branchId) andConditions.push({ [Op.or]: [{ branchId }, { branchId: null }] });
        if (targetType) where.targetType = { [Op.in]: [targetType, 'ALL'] };

        if (activeOnly === 'true' || activeOnly === true) {
            const now = new Date();
            where.isActive = true;
            andConditions.push({ [Op.or]: [{ startDate: { [Op.lte]: now } }, { startDate: null }] });
            andConditions.push({ [Op.or]: [{ endDate: { [Op.gte]: now } }, { endDate: null }] });
        }

        if (andConditions.length > 0) where[Op.and] = andConditions;

        return await Announcement.findAll({
            where,
            include: [{ model: Branch, attributes: ['name'] }],
            order: [['priority', 'DESC'], ['createdAt', 'DESC']]
        });
    }
}

module.exports = AnnouncementService;
