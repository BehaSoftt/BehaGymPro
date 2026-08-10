const { User } = require('./src/models');
const sequelize = require('./src/config/database');

async function check() {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'role']
        });
        console.log(JSON.stringify(users, null, 2));
    } catch (e) {
        console.error(e.message);
    } finally {
        await sequelize.close();
    }
}
check();
