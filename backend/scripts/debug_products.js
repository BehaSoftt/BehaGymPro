const { Product, ProductGroup, ProductUnit, ProductRecipe } = require('./src/models');

async function test() {
    try {
        console.log('--- PRODUCT GET TEST ---');
        const products = await Product.findAll({ limit: 5 });
        if (products.length === 0) {
            console.log('No products found in DB.');
            return;
        }

        const testId = products[0].id;
        console.log(`Testing with product ID: ${testId} (${products[0].name})`);

        const fullProduct = await Product.findByPk(testId, {
            include: [
                { model: ProductGroup, as: 'group' },
                { model: ProductUnit, as: 'productUnit' },
                { model: ProductRecipe, as: 'recipe' }
            ]
        });

        console.log('✅ Success! Product fetched with all associations.');
        console.log('Recipe count:', fullProduct.recipe ? fullProduct.recipe.length : 0);
    } catch (err) {
        console.error('❌ FAIL!');
        console.error(err);
    } finally {
        process.exit();
    }
}

test();
