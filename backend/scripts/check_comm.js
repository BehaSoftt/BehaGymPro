const { Branch } = require('./src/models');
const sequelize = require('./src/config/database');

async function check() {
    try {
        await sequelize.authenticate();
        const branches = await Branch.findAll();
        console.log('Branches Status:');
        branches.forEach(b => {
            console.log(`- ${b.name}: WA=${b.isWhatsAppEnabled}, EM=${b.isEmailEnabled}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
