const sequelize = require('./src/config/database');
const models = require('./src/models');

async function syncDb() {
    try {
        console.log('Syncing TrainingLog table...');
        await models.TrainingLog.sync({ alter: true });
        console.log('Sync complete');
    } catch (e) {
        console.error('Error syncing:', e);
    } finally {
        process.exit();
    }
}

syncDb();
