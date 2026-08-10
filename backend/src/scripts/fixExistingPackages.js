const { MembershipPackage, Company, Branch } = require('../models');

const fixExistingPackages = async () => {
    try {
        // İlk şirket ve şubeyi bul
        const company = await Company.findOne();
        const branch = await Branch.findOne();
        
        if (!company || !branch) {
            console.error('❌ Şirket veya şube bulunamadı!');
            return;
        }

        // branchId veya companyId NULL olan paketleri bul
        const packagesWithoutBranch = await MembershipPackage.findAll({
            where: {
                branchId: null
            }
        });

        console.log(`📦 ${packagesWithoutBranch.length} paket bulundu (branchId NULL)`);

        // Hepsini güncelle
        for (const pkg of packagesWithoutBranch) {
            await pkg.update({
                branchId: branch.id,
                companyId: company.id
            });
            console.log(`✅ Güncellendi: ${pkg.name}`);
        }

        console.log('\n✨ Tüm paketler güncellendi!');
        console.log(`   Branch: ${branch.name}`);
        console.log(`   Company: ${company.name}`);
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Hata:', err.message);
        process.exit(1);
    }
};

// Veritabanı bağlantısı için bekle
setTimeout(fixExistingPackages, 2000);
