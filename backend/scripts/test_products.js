const { Product, ProductGroup, ProductUnit, ProductRecipe } = require('./src/models');

async function testProducts() {
    try {
        console.log('Fetching products...');
        const products = await Product.findAll({
            include: [
                { model: ProductGroup, as: 'group' },
                { model: ProductUnit, as: 'productUnit' },
                { model: ProductRecipe, as: 'recipe' }
            ]
        });
        console.log(`Success! Found ${products.length} products.`);
        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

testProducts();
