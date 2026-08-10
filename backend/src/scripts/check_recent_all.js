const { Member, User, sequelize } = require('../models');

async function checkRecent() {
    try {
        const members = await Member.findAll({ order: [['createdAt', 'DESC']], limit: 5 });
        console.log('--- LATEST 5 MEMBERS ---');
        members.forEach(m => console.log(`ID: ${m.id}, Code: ${m.memberCode}, Name: ${m.fullName}, Created: ${m.createdAt}`));

        const users = await User.findAll({ order: [['createdAt', 'DESC']], limit: 5 });
        console.log('--- LATEST 5 USERS ---');
        users.forEach(u => console.log(`ID: ${u.id}, Username: ${u.username}, Role: ${u.role}, Created: ${u.createdAt}`));

    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await sequelize.close();
    }
}

checkRecent();
