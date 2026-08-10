const { sequelize, User, Member, InstructorProfile } = require('../models');

async function migrate() {
    try {
        console.log('--- Profil Göçü Başlatılıyor ---');

        // 1. InstructorProfile verilerini Member'a taşı
        const instructors = await InstructorProfile.findAll();
        console.log(`${instructors.length} eğitmen profili bulundu.`);

        for (const inst of instructors) {
            // Member zaten var mı kontrol et (userId ile)
            let member = await Member.findOne({ where: { userId: inst.userId } });

            const data = {
                userId: inst.userId,
                fullName: inst.displayName,
                phone: inst.phone,
                photo: inst.profilePicture,
                gender: inst.gender,
                birthDate: inst.birthDate,
                bloodGroup: inst.bloodGroup,
                isActive: inst.isActive,
                branchId: inst.branchId,
                companyId: inst.companyId,
                profileType: 'INSTRUCTOR',
                instructorCode: inst.instructorCode,
                specialties: inst.specialties,
                bio: inst.bio,
                basePrice: inst.basePrice,
                commissionRate: inst.commissionRate,
                level: inst.level
            };

            if (member) {
                console.log(`Eğitmen güncelleniyor: ${inst.displayName}`);
                await member.update(data);
            } else {
                console.log(`Yeni eğitmen profili oluşturuluyor: ${inst.displayName}`);
                member = await Member.create(data);
            }

            // İlişkili tabloları güncelle (id değişirse patlar, o yüzden instructorId'yi member.id yapmalıyız)
            // Ama biz zaten Member ID'sini her yerde instructorId olarak kullanacağız.
            // Bu yüzden eski tablodaki 'inst.id' değerine sahip olan tüm kayıtları 'member.id' ile güncellemeliyiz.

            const updateOptions = { where: { instructorId: inst.id } };
            const newId = { instructorId: member.id };

            // BeltExam, Attendance, PrivateLessonPackage, TrainingPlan, LessonSchedule, MemberPackage
            await sequelize.models.BeltExam.update(newId, updateOptions);
            await sequelize.models.Attendance.update(newId, updateOptions);
            await sequelize.models.PrivateLessonPackage.update(newId, updateOptions);
            await sequelize.models.TrainingPlan.update(newId, updateOptions);
            await sequelize.models.LessonSchedule.update(newId, updateOptions);
            await sequelize.models.MemberPackage.update(newId, updateOptions);
            await sequelize.models.GroupClass.update(newId, updateOptions);

            // FinancialAccount
            await sequelize.models.FinancialAccount.update(
                { entityId: member.id, entityType: 'INSTRUCTOR' },
                { where: { entityId: inst.id, entityType: 'INSTRUCTOR' } }
            );
        }

        // 2. Personel (Eğitmen ve Üye olmayan kullanıcılar) için profil oluştur
        const staffUsers = await User.findAll({
            where: {
                role: { [require('sequelize').Op.notIn]: ['MEMBER', 'INSTRUCTOR', 'SUPER_MASTER'] }
            }
        });

        console.log(`${staffUsers.length} personel kullanıcısı bulundu.`);

        for (const user of staffUsers) {
            let member = await Member.findOne({ where: { userId: user.id } });

            if (!member) {
                console.log(`Personel profili oluşturuluyor: ${user.username}`);
                await Member.create({
                    userId: user.id,
                    fullName: user.username, // User'da fullName sildik ama objede olabilir hala (bellekte)
                    profileType: 'PERSONNEL',
                    personnelCode: user.personnelCode,
                    branchId: user.branchId,
                    companyId: user.companyId,
                    isActive: user.isActive
                });
            } else {
                await member.update({ profileType: 'PERSONNEL', personnelCode: user.personnelCode });
            }
        }

        console.log('--- Göç Başarıyla Tamamlandı ---');
        process.exit(0);
    } catch (err) {
        console.error('Göç hatası:', err);
        process.exit(1);
    }
}

migrate();
