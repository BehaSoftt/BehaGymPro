const { User, Branch } = require('./src/models');

async function check() {
    try {
        const users = await User.findAll({
            where: { role: 'TERMINAL' },
            include: [{ model: Branch, as: 'branch' }]
        });
        console.log('--- TERMINAL USERS ---');
        users.forEach(u => {
            console.log(`ID: ${u.id}, Username: ${u.username}, CompanyId: ${u.companyId}, BranchId: ${u.branchId}`);
            if (u.branch) console.log(`  Branch CompanyId: ${u.branch.companyId}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
