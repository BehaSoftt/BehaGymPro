const { sequelize } = require('./src/models');

async function fixDatabase() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('Products');

        if (!tableInfo.type) {
            console.log('Adding "type" column to Products table...');
            await queryInterface.addColumn('Products', 'type', {
                type: require('sequelize').DataTypes.ENUM('STANDART', 'HAMMADDE', 'KARMA'),
                defaultValue: 'STANDART',
                allowNull: false
            });
            console.log('Column "type" added successfully.');
        } else {
            console.log('Column "type" already exists.');
        }

        // Check for ProductRecipes table
        try {
            await queryInterface.describeTable('ProductRecipes');
            console.log('Table "ProductRecipes" already exists.');
        } catch (e) {
            console.log('Creating "ProductRecipes" table...');
            await sequelize.model('ProductRecipe').sync();
            console.log('Table "ProductRecipes" created successfully.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Migration error:', err);
        process.exit(1);
    }
}

fixDatabase();
