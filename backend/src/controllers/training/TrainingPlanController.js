const { TrainingPlan, TrainingPlanItem, TrainingPlanDay, Member, MembershipPackage, Exercise, ExerciseCategory, SportSpecialty, TrainingLog } = require('../../models');
const TrainingService = require('../../services/training/TrainingService');
const { catchAsync, AppError } = require('../../middleware/errorHandler');

class TrainingPlanController {
    /**
     * Tüm antrenman planlarını listele
     */
    static getAll = catchAsync(async (req, res) => {
        const plans = await TrainingService.getAllPlans(req.query, req.user);
        res.json(plans);
    });

    /**
     * Üyenin aktif antrenman planını getir
     */
    static getActivePlan = catchAsync(async (req, res) => {
        try {
            const { memberId } = req.query;
            if (!memberId) throw new AppError('Üye ID gerekli.', 400);

            const plan = await TrainingPlan.findOne({
                where: { memberId, isActive: true },
                order: [['createdAt', 'DESC']]
            });
            
            res.json(plan);
        } catch (err) {
            console.error('[TrainingPlanController] 500 ERROR in getActivePlan:', err.message);
            console.error('[TrainingPlanController] Context:', {
                query: req.query,
                user: req.user?.id
            });
            throw err;
        }
    });

    /**
     * Yeni antrenman planı oluştur
     */
    static create = catchAsync(async (req, res) => {
        const plan = await TrainingService.createPlan(req.body, req.user);
        res.status(201).json(plan);
    });

    /**
     * Plan detayı getir
     */
    static getById = catchAsync(async (req, res) => {
        const plan = await TrainingPlan.findByPk(req.params.id, {
            include: [
                { model: TrainingPlanDay, as: 'days' },
                {
                    model: TrainingPlanItem,
                    as: 'items',
                    include: [{
                        model: Exercise,
                        as: 'exercise',
                        include: [
                            { model: ExerciseCategory, as: 'category', attributes: ['name'] },
                            { model: SportSpecialty, as: 'specialty', attributes: ['name'] }
                        ]
                    }]
                },
                { model: Member, as: 'member', include: ['measurements'] },
                { model: Member, as: 'instructor', attributes: ['id', 'fullName', 'photo'] },
                { model: MembershipPackage, as: 'package' },
                { model: TrainingLog, as: 'logs' }
            ]
        });
        if (!plan) throw new AppError('Plan bulunamadı.', 404);
        res.json(plan);
    });

    /**
     * Plan güncelle
     */
    static update = catchAsync(async (req, res) => {
        const plan = await TrainingService.updatePlan(req.params.id, req.body, req.user);
        res.json({ message: 'Plan güncellendi.', plan });
    });

    /**
     * Plan sil
     */
    static delete = catchAsync(async (req, res) => {
        const plan = await TrainingPlan.findByPk(req.params.id);
        if (!plan) throw new AppError('Plan bulunamadı.', 404);
        await plan.destroy();
        res.json({ message: 'Plan başarıyla silindi.' });
    });

    /**
     * Antrenman aktivitesi kaydet (Tamamlandı/İptal)
     */
    static logActivity = catchAsync(async (req, res) => {
        const result = await TrainingService.logActivity(req.body, req.user.id);
        const message = result.action === 'added' ? 'Kayıt oluşturuldu.' : 'Kayıt silindi.';
        res.status(result.action === 'added' ? 201 : 200).json({ message, ...result });
    });

    /**
     * Toplu aktivite kaydet
     */
    static logBatchActivity = catchAsync(async (req, res) => {
        const results = await TrainingService.logBatchActivity(req.body.activities, req.user.id);
        res.json({ message: 'Toplu kayıtlar işlendi.', results });
    });

    /**
     * Eğitim loglarını getir
     */
    static getLogs = catchAsync(async (req, res) => {
        const logs = await TrainingService.getLogs(req.query);
        res.json(logs);
    });

    /**
     * Toplu plan sil
     */
    static bulkDelete = catchAsync(async (req, res) => {
        const { ids } = req.body;
        if (!ids?.length) throw new AppError('Silinecek kayıt seçilmedi.', 400);

        const count = await TrainingPlan.destroy({ where: { id: ids } });
        res.json({ message: `${count} plan başarıyla silindi.` });
    });

    /**
     * Eğitmen paneli loglarını getir
     */
    static getInstructorDashboardLogs = catchAsync(async (req, res) => {
        const { id: userId, role, branchId } = req.user;
        console.log(`[TRAINING_CONTROLLER] Dashboard Fetch -> User: ${userId}, Role: ${role}, Branch: ${branchId}`);
        
        // Bu rollere sahip olanlar tüm planları görebilmeli
        const adminRoles = ['ADMIN', 'SUPER_MASTER', 'MASTER', 'MUDUR', 'RECEPTIONIST'];
        
        if (adminRoles.includes(role)) {
            const logs = await TrainingService.getInstructorDashboardLogs(null, null, null);
            console.log(`[TRAINING_CONTROLLER] Privileged role (${role}) found ${logs?.length || 0} plans`);
            return res.json(logs);
        }

        let instructor = await Member.findOne({ where: { userId, profileType: 'INSTRUCTOR' } });
        if (!instructor) {
            instructor = await Member.findOne({ where: { userId } });
        }

        const instId = instructor ? instructor.id : null;
        const logs = await TrainingService.getInstructorDashboardLogs(instId, null, userId);
        res.json(logs);
    });

    /**
     * Eğitmen tarafından log müdahalesi
     */
    static overrideLogActivity = catchAsync(async (req, res) => {
        // Eğitmen başka bir üyenin logunu ekleyebilir/silebilir
        const result = await TrainingService.logActivity(req.body, req.body.memberId);
        res.json({ message: 'Log müdahalesi başarılı.', ...result });
    });
}

module.exports = TrainingPlanController;
