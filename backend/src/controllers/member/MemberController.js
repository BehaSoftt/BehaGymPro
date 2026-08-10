const MemberService = require('../../services/member/MemberService');
const { TrainingPlan, Member } = require('../../models');
const { catchAsync, AppError } = require('../../middleware/errorHandler');
const { Op } = require('sequelize');

class MemberController {
    /**
     * Üye Dashboard (Portal) verilerini getir
     */
    static getDashboardData = catchAsync(async (req, res) => {
        console.log('[DEBUG] getDashboardData called for user:', req.user.id);
        const data = await MemberService.getMemberDashboardData(req.user.id);
        if (!data) {
            console.log('[DEBUG] Member not found for user:', req.user.id);
            throw new AppError('Üye bulunamadı.', 404);
        }

        const trainingPlans = await TrainingPlan.findAll({
            where: {
                isActive: true,
                [Op.or]: [{ memberId: data.member.id }, { packageId: data.member.packageId }]
            },
            include: [{ model: Member, as: 'instructor', attributes: ['id', 'fullName', 'photo', 'instructorCode'] }]
        });

        res.json({ ...data, trainingPlans });
    });

    /**
     * Tüm üyeleri listele
     */
    static getAll = catchAsync(async (req, res) => {
        const members = await MemberService.getAllMembers(req.query, req.user);
        res.json(members);
    });

    /**
     * Yeni üye oluştur
     */
    static create = catchAsync(async (req, res) => {
        console.log('🚀 [MEMBER_CREATE] Incoming payload:', JSON.stringify(req.body, null, 2));
        const member = await MemberService.createMember(req.body, req.user);
        console.log('✅ [MEMBER_CREATE_SUCCESS] Created member ID:', member.id);
        res.status(201).json({ message: 'Üye başarıyla oluşturuldu.', member });
    });

    /**
     * Üye bilgilerini güncelle
     */
    static update = catchAsync(async (req, res) => {
        console.log('🔄 [MEMBER_UPDATE] Incoming payload for ID:', req.params.id, JSON.stringify(req.body, null, 2));
        const member = await MemberService.updateMember(req.params.id, req.body);
        console.log('✅ [MEMBER_UPDATE_SUCCESS] Updated member ID:', req.params.id);
        res.json({ message: 'Üye bilgileri güncellendi.', member });
    });

    /**
     * Üye sil
     */
    static delete = catchAsync(async (req, res) => {
        await MemberService.deleteMember(req.params.id);
        res.json({ message: 'Üye başarıyla silindi.' });
    });

    /**
     * Tek bir üye detayını getir
     */
    static getById = catchAsync(async (req, res) => {
        const member = await Member.findByPk(req.params.id, {
            include: [
                { model: User, as: 'user', attributes: ['email', 'username'] },
                { model: MembershipPackage, as: 'package' },
                { model: Branch, as: 'Branch' }
            ]
        });
        if (!member) throw new AppError('Üye bulunamadı.', 404);
        res.json(member);
    });

    /**
     * Toplu üye sil
     */
    static bulkDelete = catchAsync(async (req, res) => {
        const { ids } = req.body;
        if (!ids?.length) throw new AppError('Silinecek kayıt seçilmedi.', 400);

        const count = await MemberService.bulkDeleteMembers(ids);
        res.json({ message: `${count} kayıt başarıyla silindi.` });
    });

    /**
     * Onboarding verilerini güncelle
     */
    static updateOnboarding = catchAsync(async (req, res) => {
        const member = await MemberService.updateMember(req.params.id, req.body);
        res.json({ message: 'Onboarding verileri güncellendi.', member });
    });
}

module.exports = MemberController;
