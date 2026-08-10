const { Role, User, sequelize } = require('./src/models');

async function cleanInstructorRole() {
    try {
        console.log('--- Rol Temizliği Başlatıldı ---');

        const oldRole = await Role.findOne({ where: { name: 'INSTRUCTOR' } });
        const newRole = await Role.findOne({ where: { name: 'EĞİTMEN' } });

        if (!oldRole) {
            console.log('Zaten "INSTRUCTOR" rolü yok, işlem gerekmiyor.');
            return;
        }

        if (newRole) {
            console.log('"INSTRUCTOR" rolündeki kullanıcılar "EĞİTMEN" rolüne taşınıyor...');
            await User.update(
                { roleId: newRole.id, role: 'EĞİTMEN' },
                { where: { roleId: oldRole.id } }
            );

            console.log('"INSTRUCTOR" rolü siliniyor...');
            await oldRole.destroy();
        } else {
            console.log('"EĞİTMEN" rolü bulunamadı, "INSTRUCTOR" ismi güncelleniyor...');
            await oldRole.update({ name: 'EĞİTMEN' });
            await User.update(
                { role: 'EĞİTMEN' },
                { where: { roleId: oldRole.id } }
            );
        }

        console.log('TEMİZLİK TAMAMLANDI.');
        process.exit(0);
    } catch (err) {
        console.error('Hata:', err);
        process.exit(1);
    }
}

cleanInstructorRole();
