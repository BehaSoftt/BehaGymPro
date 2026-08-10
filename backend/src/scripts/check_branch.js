const { Branch, sequelize } = require('../models');

async function checkBranch() {
    try {
        const branchId = '353b964d-53aa-4878-8721-04a479c95250';
        const branch = await Branch.findByPk(branchId);
        if (branch) {
            console.log('Branch FOUND:', branch.name);
        } else {
            console.log('Branch NOT FOUND');
        }
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await sequelize.close();
    }
}

checkBranch();
