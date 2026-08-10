
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { FinancialTransaction } = require('./src/models');
const { Op } = require('sequelize');

async function cleanDescriptions() {
    try {
        const txs = await FinancialTransaction.findAll({
            where: {
                description: { [Op.iLike]: '%Satış ID:%' }
            }
        });

        console.log(`🔍 ${txs.length} adet açıklama düzeltilecek...`);

        for (const tx of txs) {
            const newDesc = tx.description.split(' - Satış ID:')[0];
            await tx.update({ description: newDesc });
            console.log(`   ✅ Düzeltildi: ${tx.description} -> ${newDesc}`);
        }

        console.log('🏁 Tüm açıklamalar temizlendi.');
    } catch (err) {
        console.error('❌ Hata:', err.message);
    } finally {
        process.exit();
    }
}

cleanDescriptions();
