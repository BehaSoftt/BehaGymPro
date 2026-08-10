const { SportGroup, Member, SportSpecialty } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');

class SportGroupController {
    /**
     * Tüm spor gruplarını listele
     */
    static getAll = catchAsync(async (req, res) => {
        const { branchId, companyId } = req.user;
        const { specialtyId } = req.query;

        const where = { branchId, companyId };
        if (specialtyId) where.specialtyId = specialtyId;

        const groups = await SportGroup.findAll({
            attributes: {
                include: [
                    [
                        SportGroup.sequelize.literal(`(
                            SELECT COUNT(*)::int
                            FROM "SportGroupMembers" AS sgm
                            WHERE sgm."sportGroupId" = "SportGroup"."id"
                            AND sgm."isActive" = true
                        )`),
                        'memberCount'
                    ]
                ]
            },
            where,
            include: [
                { model: SportSpecialty, as: 'specialty', attributes: ['name'] },
                { model: Member, as: 'instructor', attributes: ['fullName', 'photo'] }
            ],
            order: [['name', 'ASC']]
        });
        
        const result = groups.map(g => {
            const group = g.toJSON();
            group.memberCount = parseInt(group.memberCount || 0);
            return group;
        });

        res.json(result);
    });

    /**
     * Yeni spor grubu oluştur
     */
    static create = catchAsync(async (req, res) => {
        const { branchId, companyId } = req.user;
        const group = await SportGroup.create({ ...req.body, branchId, companyId });
        res.status(201).json(group);
    });

    /**
     * Spor grubu bilgilerini güncelle
     */
    static update = catchAsync(async (req, res) => {
        const group = await SportGroup.findByPk(req.params.id);
        if (!group) throw new AppError('Grup bulunamadı.', 404);

        await group.update(req.body);
        res.json(group);
    });

    /**
     * Spor grubunu sil
     */
    static delete = catchAsync(async (req, res) => {
        const group = await SportGroup.findByPk(req.params.id);
        if (!group) throw new AppError('Grup bulunamadı.', 404);

        await group.destroy();
        res.json({ message: 'Grup silindi.' });
    });

    /**
     * Gruptaki üyeleri (oyuncuları) listele
     */
    static getMembers = catchAsync(async (req, res) => {
        const group = await SportGroup.findByPk(req.params.id, {
            include: [{ 
                model: Member, as: 'players', 
                attributes: ['id', 'fullName', 'photo'],
                include: ['sportProfiles']
            }]
        });

        if (!group) throw new AppError('Grup bulunamadı.', 404);
        res.json(group.players);
    });
    /**
     * Gruba üye ekle
     */
    static addMember = catchAsync(async (req, res) => {
        const { memberId } = req.body;
        const { id: sportGroupId } = req.params;

        const { SportGroupMember } = require('../../models');

        // Üye zaten grupta mı kontrol et
        const existing = await SportGroupMember.findOne({ where: { sportGroupId, memberId } });
        if (existing) throw new AppError('Üye zaten bu grupta kayıtlı.', 400);

        const memberRecord = await SportGroupMember.create({ sportGroupId, memberId });
        
        // SYNC: Update the Member model's legacy field
        await Member.update(
            { sportGroupId },
            { where: { id: memberId } }
        );

        res.status(201).json(memberRecord);
    });

    /**
     * Gruptan üye çıkar
     */
    static removeMember = catchAsync(async (req, res) => {
        const { memberId } = req.params;
        const { id: sportGroupId } = req.params;

        const { SportGroupMember } = require('../../models');
        await SportGroupMember.destroy({ where: { sportGroupId, memberId } });

        // SYNC: Clear the Member model's legacy field if it was set to this group
        await Member.update(
            { sportGroupId: null },
            { where: { id: memberId, sportGroupId } }
        );

        res.json({ message: 'Üye gruptan çıkarıldı.' });
    });
}

module.exports = SportGroupController;
