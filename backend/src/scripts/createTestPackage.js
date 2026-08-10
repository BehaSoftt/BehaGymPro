const { MembershipPackage, SportSpecialty, Company, Branch } = require('../models');

const createTestPackage = async () => {
    try {
        // İlk şirket ve şubeyi bul
        const company = await Company.findOne();
        const branch = await Branch.findOne();
        
        if (!company || !branch) {
            console.error('Şirket veya şube bulunamadı!');
            return;
        }

        // İlk branşı bul
        const specialty = await SportSpecialty.findOne();
        
        if (!specialty) {
            console.error('Branş bulunamadı!');
            return;
        }

        // Test paketi oluştur
        const testPackage = await MembershipPackage.create({
            name: '1 Aylık Fitness Paketi',
            price: 500,
            durationMonths: 1,
            type: 'PERIODICAL',
            specialtyId: specialty.id,
            branchId: branch.id,
            companyId: company.id,
            isActive: true
        });

        console.log('✅ Test paketi oluşturuldu:', testPackage.name);
        console.log('   Branch:', branch.name);
        console.log('   Company:', company.name);
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Hata:', err.message);
        process.exit(1);
    }
};

// Veritabanı bağlantısı için bekle
setTimeout(createTestPackage, 2000);
