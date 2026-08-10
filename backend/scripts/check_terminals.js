const { User } = require('./src/models');
const sequelize = require('./src/config/database');

async function check() {
    try {
        const users = await User.findAll({
            where: { role: 'TERMINAL' }
        });
        console.log('TERMINAL USERS:');
        users.forEach(u => {
            console.log(`ID: ${u.id}, Username: ${u.username}, Role: ${u.role}, HasPasswordHash: ${!!u.passwordHash}`);
        });
    } catch (e) {
        console.error(e.message);
    } finally {
        await sequelize.close();
    }
}
check();
