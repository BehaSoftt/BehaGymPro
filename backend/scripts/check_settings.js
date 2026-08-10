const { SystemSetting } = require('./src/models');
const sequelize = require('./src/config/database');

async function check() {
    try {
        const settings = await SystemSetting.findAll();
        console.log(JSON.stringify(settings, null, 2));
    } catch (e) {
        console.error(e.message);
    } finally {
        await sequelize.close();
    }
}
check();
