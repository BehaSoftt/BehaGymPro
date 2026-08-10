require('dotenv').config();
const { MembershipPackage } = require('./src/models');

async function seedGroupPackages() {
    try {
        console.log('🌱 Grup dersi paketleri oluşturuluyor...');

        const groupPackages = [
            {
                name: '3 AYLIK GRUP DERSİ',
                price: 1500,
                durationMonths: 3,
                type: 'GROUP',
                weeklySessionCount: 3,
                sessionCount: 36, // 3 ay × 4 hafta × 3 gün
                isActive: true
            },
            {
                name: '6 AYLIK GRUP DERSİ',
                price: 2800,
                durationMonths: 6,
                type: 'GROUP',
                weeklySessionCount: 3,
                sessionCount: 72, // 6 ay × 4 hafta × 3 gün
                isActive: true
            },
            {
                name: '1 YILLIK GRUP DERSİ',
                price: 5000,
                durationMonths: 12,
                type: 'GROUP',
                weeklySessionCount: 5,
                sessionCount: 240, // 12 ay × 4 hafta × 5 gün
                isActive: true
            }
        ];

        for (const pkg of groupPackages) {
            const [created, isNew] = await MembershipPackage.findOrCreate({
                where: { name: pkg.name, type: 'GROUP' },
                defaults: pkg
            });

            if (isNew) {
                console.log(`✅ ${pkg.name} oluşturuldu`);
            } else {
                console.log(`⏭️  ${pkg.name} zaten mevcut`);
            }
        }

        console.log('✅ Grup dersi paketleri hazır!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Hata:', error);
        process.exit(1);
    }
}

seedGroupPackages();
