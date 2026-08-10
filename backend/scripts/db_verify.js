const { Product, ProductGroup, ProductUnit } = require('./src/models');
const { Op } = require('sequelize');

async function check() {
    try {
        const products = await Product.findAll({
            include: [
                { model: ProductGroup, as: 'group' },
                { model: ProductUnit, as: 'productUnit' }
            ]
        });

        console.log('--- ÜRÜN LİSTESİ ---');
        products.forEach(p => {
            console.log(`Ürün: ${p.name}`);
            console.log(`- ID: ${p.id}`);
            console.log(`- Şube ID: ${p.branchId || 'GLOBAL'}`);
            console.log(`- Aktif mi: ${p.isActive}`);
            console.log(`- Grup: ${p.group ? p.group.name : 'Yok'}`);
            console.log(`- Birim: ${p.productUnit ? p.productUnit.name : 'Yok'}`);
            console.log('-------------------');
        });

        process.exit(0);
    } catch (err) {
        console.error('Hata:', err);
        process.exit(1);
    }
}

check();
