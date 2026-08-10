const NutritionPlanService = require('../../services/member/NutritionPlanService');
const { catchAsync } = require('../../middleware/errorHandler');

class NutritionPlanController {
    /**
     * Üye ID'sine göre beslenme planı getir
     */
    static getByMemberId = catchAsync(async (req, res) => {
        const plan = await NutritionPlanService.getPlanByMember(req.params.memberId, req.user);
        res.json(plan);
    });

    /**
     * Beslenme planı oluştur veya güncelle (Upsert)
     */
    static create = catchAsync(async (req, res) => {
        const result = await NutritionPlanService.upsertPlan(req.body);
        res.status(result.created ? 201 : 200).json(result);
    });

    /**
     * Beslenme planı güncelle
     */
    static update = catchAsync(async (req, res) => {
        const result = await NutritionPlanService.upsertPlan({ ...req.body, memberId: req.params.memberId });
        res.json(result);
    });
}

module.exports = NutritionPlanController;
