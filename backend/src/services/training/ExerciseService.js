const { Exercise, TrainingPlanItem } = require('../../models');

class ExerciseService {
    /**
     * İstasyonun kullanımda olup olmadığını kontrol eder
     */
    static async checkUsage(id) {
        const count = await TrainingPlanItem.count({ where: { exerciseId: id } });
        return count > 0;
    }

    /**
     * İstasyon bilgilerini günceller
     */
    static async updateExercise(id, updateData) {
        const { deleteFile } = require('../../utils/fileHelper');
        const exercise = await Exercise.findByPk(id);
        if (!exercise) throw new Error('İstasyon bulunamadı.');

        // Göresel değişmişse eskisini sil
        if (updateData.imageUrl && exercise.imageUrl && updateData.imageUrl !== exercise.imageUrl) {
            await deleteFile(exercise.imageUrl);
        }

        await exercise.update(updateData);
        return exercise;
    }

    /**
     * İstasyonu güvenli bir şekilde siler
     */
    static async deleteExercise(id) {
        const { deleteFile } = require('../../utils/fileHelper');
        if (await this.checkUsage(id)) throw new Error('Bu istasyon antrenman programlarında kayıtlı olduğu için silinemez.');
        
        const exercise = await Exercise.findByPk(id);
        if (!exercise) throw new Error('İstasyon bulunamadı.');
        
        // Görseli sil
        if (exercise.imageUrl) await deleteFile(exercise.imageUrl);

        await exercise.destroy();
        return true;
    }

    /**
     * İstasyon durumunu değiştirir
     */
    static async toggleStatus(id) {
        const exercise = await Exercise.findByPk(id);
        if (!exercise) throw new Error('İstasyon bulunamadı.');

        const newStatus = !exercise.isActive;
        if (!newStatus && await this.checkUsage(id)) throw new Error('Kullanımda olan istasyon pasifize edilemez.');

        exercise.isActive = newStatus;
        await exercise.save();
        return exercise;
    }
}

module.exports = ExerciseService;
