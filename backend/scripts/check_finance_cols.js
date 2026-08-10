const { FinancialAccount } = require('./src/models');
const sequelize = require('./src/config/database');

async function checkColumns() {
    try {
        const tableInfo = await sequelize.getQueryInterface().describeTable('FinancialAccounts');
        console.log('Columns in FinancialAccounts:', Object.keys(tableInfo));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkColumns();
