const { MembershipPackage, SportSpecialty, MemberPackage } = require('../../models');
const { Op } = require('sequelize');

class PackageService {
    /**
     * Tüm tanımlı paketleri getirir ve aktif üye sayılarını hesaplar
     */
    static async getAllPackages(user, filters = {}) {
        try {
            // Kullanıcı bilgilerini güvenli bir şekilde al
            const role = user?.role || 'GUEST';
            const branchId = user?.branchId || null;
            const companyId = user?.companyId || null;
            
            const { type, isActive, page = 1, limit = 50 } = filters;
            console.log(`[PackageService] Fetching packages for role: ${role}, branch: ${branchId}, company: ${companyId}`);
            
            const limitNum = parseInt(limit) || 50;
            const pageNum = parseInt(page) || 1;
            const offset = (pageNum - 1) * limitNum;
            
            const isSuperMaster = role.toUpperCase() === 'SUPER_MASTER';

            let where = {};
            if (!isSuperMaster) {
                if (companyId) {
                    where = {
                        [Op.or]: [
                            { companyId },
                            { companyId: null, branchId: null }
                        ]
                    };
                } else if (branchId) {
                    where = {
                        [Op.or]: [
                            { branchId },
                            { companyId: null, branchId: null }
                        ]
                    };
                } else {
                    where = { branchId: null, companyId: null };
                }
            }

            if (type) where.type = type;
            if (isActive !== undefined) where.isActive = isActive === 'true';

            const { count, rows: packages } = await MembershipPackage.findAndCountAll({
                attributes: {
                    include: [
                        [
                            MembershipPackage.sequelize.literal(`(
                                SELECT COUNT(*)::int
                                FROM "MemberPackages" AS mp
                                WHERE mp."packageId" = "MembershipPackage"."id"
                                AND mp.status = 'ACTIVE'
                                AND mp."expiryDate" >= CURRENT_DATE
                            )`),
                            'memberCount'
                        ]
                    ]
                },
                where,
                include: [
                    { model: SportSpecialty, as: 'specialty', attributes: ['name'] }
                ],
                order: [['createdAt', 'DESC']],
                limit: limitNum,
                offset: offset
            });

            console.log(`[PackageService] Found ${count} packages in total`);

            const items = packages.map(pkg => {
                const p = pkg.toJSON();
                p.memberCount = parseInt(p.memberCount || 0);
                return p;
            });

            return {
                total: count,
                pages: Math.ceil(count / limitNum),
                currentPage: pageNum,
                packages: items
            };
        } catch (error) {
            console.error('[PackageService] Error in getAllPackages:', error);
            throw error;
        }
    }

    /**
     * Paket silme kontrolü (Gerekirse genişletilebilir)
     */
    static async deletePackage(id) {
        const pkg = await MembershipPackage.findByPk(id);
        if (!pkg) throw new Error('Paket bulunamadı.');
        
        // Opsiyonel: Aktif üyeleri olan paket silinemez kuralı eklenebilir
        await pkg.destroy();
        return true;
    }
}

module.exports = PackageService;
