const { User, sequelize } = require('../models');

async function checkUser() {
    try {
        const user = await User.findOne({ where: { role: 'SUPER_MASTER' } });
        if (user) {
            console.log('--- SUPER MASTER User Info ---');
            console.log(JSON.stringify(user.toJSON(), null, 2));
        } else {
            console.log('SUPER_MASTER not found');
        }
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await sequelize.close();
    }
}

checkUser();
