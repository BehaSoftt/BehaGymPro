const { Permission } = require('./src/models');
const { sequelize } = require('./src/models');

async function debug() {
    try {
        await sequelize.authenticate();
        const perms = await Permission.findAll();
        console.log('--- ALL PERMISSIONS IN DB ---');
        perms.forEach(p => {
            if (p.key.includes('FIN') || p.key.includes('PAY')) {
                console.log(`Key: ${p.key}, Module: [${p.module}], Name: ${p.name}`);
            }
        });
        console.log('--- END ---');
        process.exit(0);
    } catch (error) {
        console.error('Debug failed:', error);
        process.exit(1);
    }
}

debug();
