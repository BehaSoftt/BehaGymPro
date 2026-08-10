/**
 * SYNC USER FULLNAMES FROM MEMBER AND INSTRUCTOR PROFILES
 * Bu script mevcut User kayıtlarının fullName alanlarını günceller
 */

require('dotenv').config();
const { sequelize, User, Member, InstructorProfile } = require('./src/models');

async function syncUserFullNames() {
    try {
        console.log('🔄 User fullName senkronizasyonu başlatılıyor...\n');

        // 1. Member -> User sync
        const members = await Member.findAll({
            where: { userId: { $ne: null } },
            attributes: ['id', 'userId', 'fullName', 'phone']
        });

        console.log(`📋 ${members.length} üye bulundu`);
        let memberSyncCount = 0;

        for (const member of members) {
            if (member.userId && member.fullName) {
                await User.update(
                    { 
                        fullName: member.fullName,
                        phone: member.phone || undefined
                    },
                    { where: { id: member.userId } }
                );
                memberSyncCount++;
            }
        }

        console.log(`✅ ${memberSyncCount} üye User kaydı güncellendi\n`);

        // 2. InstructorProfile -> User sync
        const instructors = await InstructorProfile.findAll({
            attributes: ['id', 'userId', 'displayName', 'phone']
        });

        console.log(`📋 ${instructors.length} eğitmen bulundu`);
        let instructorSyncCount = 0;

        for (const instructor of instructors) {
            if (instructor.userId && instructor.displayName) {
                await User.update(
                    { 
                        fullName: instructor.displayName,
                        phone: instructor.phone || undefined
                    },
                    { where: { id: instructor.userId } }
                );
                instructorSyncCount++;
            }
        }

        console.log(`✅ ${instructorSyncCount} eğitmen User kaydı güncellendi\n`);

        // 3. Sonuçları göster
        const updatedUsers = await User.findAll({
            where: { fullName: { $ne: null } },
            attributes: ['id', 'username', 'fullName', 'phone']
        });

        console.log(`\n📊 SONUÇ: ${updatedUsers.length} User kaydının fullName alanı dolu\n`);
        console.log('✅ Senkronizasyon tamamlandı!');

        process.exit(0);
    } catch (err) {
        console.error('❌ Hata:', err.message);
        process.exit(1);
    }
}

syncUserFullNames();
