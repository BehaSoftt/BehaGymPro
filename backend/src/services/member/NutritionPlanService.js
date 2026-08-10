const { NutritionPlan, Member } = require('../../models');
const { Op } = require('sequelize');

class NutritionPlanService {
    /**
     * Beslenme planı verilerini doğrular
     */
    static validatePlanData(data) {
        const { mealCount, sleepDuration, fluidIntake, foodCategories } = data;

        if (mealCount !== undefined && mealCount !== null && (mealCount < 1 || mealCount > 10)) {
            throw new Error('Öğün sayısı 1-10 arasında olmalıdır.');
        }
        if (sleepDuration !== undefined && sleepDuration !== null && (sleepDuration < 0 || sleepDuration > 24)) {
            throw new Error('Uyku süresi 0-24 saat arasında olmalıdır.');
        }
        if (fluidIntake !== undefined && fluidIntake !== null && (fluidIntake < 0 || fluidIntake > 10)) {
            throw new Error('Sıvı tüketimi 0-10 litre arasında olmalıdır.');
        }

        if (foodCategories) {
            const valid = ['', 'high', 'medium', 'low', 'none'];
            ['redMeat', 'whiteMeat', 'vegetables', 'fruits'].forEach(key => {
                if (foodCategories[key] && !valid.includes(foodCategories[key])) {
                    throw new Error(`${key} seviyesi geçersiz.`);
                }
            });
        }
    }

    /**
     * Üye için beslenme planını getirir (Yetki kontrolü ile)
     */
    static async getPlanByMember(memberId, user) {
        let targetId = memberId;

        if (user.role === 'MEMBER') {
            const member = await Member.findOne({
                where: { [Op.or]: [{ id: user.id }, { userId: user.id }] }
            });
            if (!member) throw new Error('Üye profili bulunamadı.');
            targetId = member.id;
        }

        return await NutritionPlan.findOne({ where: { memberId: targetId } });
    }

    /**
     * Plan oluşturur veya günceller (Upsert)
     */
    static async upsertPlan(data) {
        this.validatePlanData(data);
        
        const member = await Member.findByPk(data.memberId);
        if (!member) throw new Error('Üye bulunamadı.');

        const [plan, created] = await NutritionPlan.upsert({
            ...data,
            avoidFoods: data.avoidFoods?.trim() || null,
            additionalNotes: data.additionalNotes?.trim() || null
        }, { returning: true });

        return { plan, created };
    }
}

module.exports = NutritionPlanService;
