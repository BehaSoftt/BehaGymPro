const { SportSpecialty, MembershipPackage, GroupClass, Member } = require('../../models');

class SportSpecialtyService {
    /**
     * Branşın kullanımda olup olmadığını kontrol eder
     */
    static async checkUsage(id) {
        const [pkgCount, groupCount, memberCount] = await Promise.all([
            MembershipPackage.count({ where: { specialtyId: id } }),
            GroupClass.count({ where: { specialtyId: id } }),
            Member.count({ where: { privateLessonSpecialtyId: id } })
        ]);
        return { 
            inUse: pkgCount > 0 || groupCount > 0 || memberCount > 0,
            counts: { pkgCount, groupCount, memberCount }
        };
    }

    /**
     * Branşı siler (Kullanım kontrolü ile)
     */
    static async deleteSpecialty(id) {
        const { inUse } = await this.checkUsage(id);
        if (inUse) throw new Error('Bu branş kullanımda olduğu için silinemez. Pasifize etmeyi deneyin.');

        const specialty = await SportSpecialty.findByPk(id);
        if (!specialty) throw new Error('Branş bulunamadı.');

        await specialty.destroy();
        return true;
    }

    /**
     * Branş durumunu değiştirir (Kapatırken kullanım kontrolü yapar)
     */
    static async toggleStatus(id) {
        const specialty = await SportSpecialty.findByPk(id);
        if (!specialty) throw new Error('Branş bulunamadı.');

        const newStatus = !specialty.isActive;
        if (!newStatus) { // Kapatılmak isteniyorsa
            const { inUse } = await this.checkUsage(id);
            if (inUse) throw new Error('Bu branş aktif kayıtlarda kullanıldığı için kapatılamaz.');
        }

        await specialty.update({ isActive: newStatus });
        return specialty;
    }
}

module.exports = SportSpecialtyService;
