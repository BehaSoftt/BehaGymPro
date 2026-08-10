const { Product, ProductUnit, ProductGroup } = require('../models');
async function test() {
    try {
        const products = await Product.findAll({
            include: [
                { model: ProductUnit, as: 'productUnit' },
                { model: ProductGroup, as: 'group' }
            ]
        });
        console.log(JSON.stringify(products, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
test();
