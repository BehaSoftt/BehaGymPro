const seedSuperMaster = require('./src/seed');
const { sequelize } = require('./src/models');

async function run() {
    try {
        await seedSuperMaster();
        console.log('--- SEED COMPLETED SUCCESSFULLY ---');
        process.exit(0);
    } catch (error) {
        console.error('--- SEED FAILED ---', error);
        process.exit(1);
    }
}

run();
