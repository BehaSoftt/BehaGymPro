const { Branch, sequelize } = require('./src/models');

async function check() {
    try {
        const branches = await Branch.findAll();
        console.log('--- ALL BRANCHES ---');
        branches.forEach(b => {
            console.log(`ID: ${b.id}, Name: ${b.name}, CompanyId: ${b.companyId}`);
        });

        const [logs] = await sequelize.query('SELECT DISTINCT "branchId" FROM "AccessLogs"');
        console.log('--- LOG BRANCH IDS ---');
        logs.forEach(l => console.log(l.branchId));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
