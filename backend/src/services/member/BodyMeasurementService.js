const { BodyMeasurement, Member } = require('../../models');
const { Op } = require('sequelize');

class BodyMeasurementService {
    /**
     * BMI ve BMR/TDEE hesaplamalarını yapar, ölçümü kaydeder ve üyeyi günceller
     */
    static async createMeasurement(data) {
        const { memberId, weight, height, ...others } = data;
        const member = await Member.findByPk(memberId);
        if (!member) throw new Error('Üye bulunamadı.');

        // 1. BMI Hesaplama
        const heightM = height / 100;
        const bmi = weight / (heightM * heightM);
        let bmiCategory = 'NORMAL';
        if (bmi < 18.5) bmiCategory = 'ZAYIF';
        else if (bmi < 25) bmiCategory = 'NORMAL';
        else if (bmi < 30) bmiCategory = 'FAZLA KİLOLU';
        else bmiCategory = 'OBEZ';

        // 2. BMR (Mifflin-St Jeor) ve TDEE
        const age = member.birthDate ? (new Date().getFullYear() - new Date(member.birthDate).getFullYear()) : 25;
        let bmr = (member.gender === 'Erkek') 
            ? (10 * weight) + (6.25 * height) - (5 * age) + 5
            : (10 * weight) + (6.25 * height) - (5 * age) - 161;

        const multipliers = { 'SEDENTARY': 1.2, 'LIGHT': 1.375, 'MODERATE': 1.55, 'ACTIVE': 1.725, 'EXTRA_ACTIVE': 1.9 };
        const tdee = bmr * (multipliers[member.activityLevel] || 1.2);

        // 3. Ölçüm Kaydı
        const measurement = await BodyMeasurement.create({
            memberId, weight, height, bmi: bmi.toFixed(2), bmr: tdee.toFixed(2),
            bmiCategory, targetWeight: member.targetWeight, ...others
        });

        // 4. Üye Profil Güncelleme
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 7);
        await member.update({ weight, height, nextMeasurementDate: nextDate.toISOString().split('T')[0] });

        return measurement;
    }
}

module.exports = BodyMeasurementService;
