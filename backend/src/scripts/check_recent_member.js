const { Member, sequelize } = require('../models');

async function checkRecentMember() {
    try {
        const member = await Member.findOne({ order: [['createdAt', 'DESC']] });
        if (member) {
            console.log('--- LATEST MEMBER ---');
            console.log(JSON.stringify(member.toJSON(), null, 2));
        } else {
            console.log('No members found');
        }
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await sequelize.close();
    }
}

checkRecentMember();
