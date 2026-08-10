const { Member, sequelize } = require('../models');

async function checkContext() {
    try {
        const id = 'f5c843b3-687f-43d8-89ef-ea3dc4b585c0';
        const member = await Member.findByPk(id);
        if (member) {
            console.log('--- MEMBER CONTEXT ---');
            console.log('Branch ID:', member.branchId);
            console.log('Company ID:', member.companyId);
        } else {
            console.log('Member not found');
        }
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await sequelize.close();
    }
}

checkContext();
