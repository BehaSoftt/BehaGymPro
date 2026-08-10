const { Member, User, Role } = require('./src/models');

async function fixInstructorRoles() {
    try {
        console.log('--- Eğitmen Rolleri Eşitleniyor (EĞİTMEN)... ---');

        // 1. EĞİTMEN rolünü bul
        const instructorRole = await Role.findOne({ where: { name: 'EĞİTMEN' } });
        if (!instructorRole) {
            console.error('HATA: EĞİTMEN rolü veritabanında bulunamadı! Lütfen önce backend seed işlemini kontrol edin.');
            return;
        }

        // 2. ProfileType'ı INSTRUCTOR olan tüm Member'ları ve User'larını bul
        const instructors = await Member.findAll({
            where: { profileType: 'INSTRUCTOR' },
            include: [{ model: User, as: 'user' }]
        });

        console.log(`${instructors.length} adet eğitmen kaydı inceleniyor...`);

        let updatedCount = 0;
        for (const inst of instructors) {
            if (inst.user) {
                // Sadece eksik veya yanlışsa güncelle
                if (inst.user.roleId !== instructorRole.id || inst.user.role !== 'INSTRUCTOR') {
                    await inst.user.update({
                        role: 'INSTRUCTOR', // Dashboard yönlendirmesi için string bazlı role 'INSTRUCTOR' kalmalı
                        roleId: instructorRole.id
                    });
                    updatedCount++;
                    console.log(`Profil Güncellendi: ${inst.fullName}`);
                }
            } else {
                console.warn(`UYARI: ${inst.fullName} için User kaydı bulunamadı.`);
            }
        }

        console.log(`BİTTİ: ${updatedCount} eğitmen başarıyla 'EĞİTMEN' yetki grubuna bağlandı.`);
        process.exit(0);
    } catch (err) {
        console.error('Kritik Hata:', err);
        process.exit(1);
    }
}

fixInstructorRoles();
