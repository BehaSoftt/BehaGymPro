require('dotenv').config();
const { Member, Branch, Company, sequelize } = require('../models');
const { Op } = require('sequelize');

async function fixBranches() {
    try {
        await sequelize.authenticate();
        
        // Önce Ayaz Spor ismini içeren şirketi bul
        const company = await Company.findOne({ 
            where: { name: { [Op.iLike]: '%Ayaz Spor%' } } 
        });

        // Şubeyi bul (Kuşcağız veya Ayaz ismini içeren)
        const branch = await Branch.findOne({ 
            where: { 
                [Op.or]: [
                    { name: { [Op.iLike]: '%Kuşcağız%' } },
                    { name: { [Op.iLike]: '%Ayaz%' } }
                ]
            } 
        });

        if (!company || !branch) {
            console.error('Hata: Şirket veya Şube tam olarak tespit edilemedi.');
            console.log('Şirket:', company ? company.name : 'BULUNAMADI');
            console.log('Şube:', branch ? branch.name : 'BULUNAMADI');
            return;
        }

        console.log(`--- [TEST] Üyeleri Şirket: "${company.name}", Şube: "${branch.name}" olarak güncelleniyor... ---`);
        
        const [updatedCount] = await Member.update(
            { 
                branchId: branch.id,
                companyId: company.id
            },
            { 
                where: { 
                    fullName: { [Op.like]: '[TEST]%' }
                } 
            }
        );

        console.log(`>>> BAŞARILI: ${updatedCount} test üyesi başarıyla atandı. Şimdi sayfayı yenileyebilirsin.`);
        
    } catch (error) {
        console.error('Hata:', error.message);
    } finally {
        process.exit();
    }
}

fixBranches();
