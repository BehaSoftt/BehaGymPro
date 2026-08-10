const { Branch } = require('../models');
const sequelize = require('../config/database');

async function check() {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connection established');

        const columns = await sequelize.getQueryInterface().describeTable('Branches');
        console.log('Columns in Branches table:');
        console.log(Object.keys(columns));

        const branches = await Branch.findAll();
        console.log('\nBranches data:');
        branches.forEach(b => {
            console.log(`- ${b.name}: isWhatsAppEnabled=${b.isWhatsAppEnabled}, isEmailEnabled=${b.isEmailEnabled}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

check();
