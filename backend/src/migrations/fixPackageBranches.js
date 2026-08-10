const { MembershipPackage, Company, Branch, sequelize } = require('../models');

const fixPackageBranches = async () => {
    try {
        console.log('🔧 Paket şube ataması başlatılıyor...');
        
        // İlk şirket ve şubeyi bul
        const company = await Company.findOne({ order: [['createdAt', 'ASC']] });
        const branch = await Branch.findOne({ 
            where: { companyId: company.id },
            order: [['createdAt', 'ASC']] 
        });
        
        if (!company || !branch) {
            console.error('❌ Şirket veya şube bulunamadı!');
            return;
        }

        console.log(`📍 Hedef Şirket: ${company.name}`);
        console.log(`📍 Hedef Şube: ${branch.name}`);

        // branchId NULL olan paketleri bul ve güncelle
        const [updateCount] = await MembershipPackage.update(
            { 
                branchId: branch.id,
                companyId: company.id 
            },
            { 
                where: { 
                    branchId: null 
                } 
            }
        );

        console.log(`✅ ${updateCount} paket güncellendi!`);
        console.log('✨ Migration tamamlandı!');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration hatası:', err.message);
        process.exit(1);
    }
};

// Veritabanı bağlantısı için bekle
setTimeout(fixPackageBranches, 2000);
