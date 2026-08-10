require('dotenv').config();
const sequelize = require('../config/database');
const migration = require('./18_create_licenses_table');

async function run() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');
        await migration.up(sequelize.getQueryInterface());
        console.log('Migration Complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
