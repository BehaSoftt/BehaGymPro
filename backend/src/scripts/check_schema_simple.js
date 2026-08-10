const { sequelize } = require('../models');

async function checkSchema() {
    try {
        console.log('--- Describing Users Table ---');
        const schema = await sequelize.getQueryInterface().describeTable('Users');
        console.log(JSON.stringify(schema, null, 2));

    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
