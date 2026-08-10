require('dotenv').config();
const { InstructorProfile } = require('./src/models');
const sequelize = require('./src/config/database');

// Mevcut eğitmenlere otomatik kod ataması yapan yardımcı script
async function updateInstructorCodes() {
    try {
        await sequelize.authenticate();
        console.log('Veritabanı bağlantısı başarılı.');

        // Kodu olmayan eğitmenleri bul
        const instructors = await InstructorProfile.findAll({
            where: {
                instructorCode: null
            }
        });

        console.log(`${instructors.length} adet kodsuz eğitmen bulundu.`);

        // Her birine kod ata
        for (const instructor of instructors) {
            const year = new Date().getFullYear();
            const count = await InstructorProfile.count() + 1;
            const code = `EGT-${year}-${String(count).padStart(4, '0')}`;
            
            await instructor.update({ instructorCode: code });
            console.log(`Eğitmen ${instructor.id} güncellendi, kod: ${code}`);
        }

        console.log('Tüm eğitmen kodları başarıyla güncellendi.');
        process.exit(0);
    } catch (error) {
        console.error('Eğitmen kodları güncellenirken hata:', error);
        process.exit(1);
    }
}

updateInstructorCodes();
