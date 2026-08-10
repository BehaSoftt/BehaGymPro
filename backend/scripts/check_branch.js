const { Branch } = require('./src/models');
const sequelize = require('./src/config/database');

async function check() {
    try {
        const branches = await Branch.findAll();
        console.log(JSON.stringify(branches, null, 2));
    } catch (e) {
        console.error(e.message);
    } finally {
        await sequelize.close();
    }
}
check();
