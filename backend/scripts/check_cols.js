const { sequelize } = require('./src/models');

async function checkCols() {
    try {
        const [results] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Products'");
        console.log('Columns in Products table:');
        results.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));

        const [recipes] = await sequelize.query("SELECT count(*) FROM information_schema.tables WHERE table_name = 'ProductRecipes'");
        console.log(`ProductRecipes table exists count: ${recipes[0].count}`);

        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err);
        process.exit(1);
    }
}

checkCols();
