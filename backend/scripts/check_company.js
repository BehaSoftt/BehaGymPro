const { Company } = require('./src/models');
const sequelize = require('./src/config/database');

async function check() {
    try {
        const companies = await Company.findAll();
        console.log(JSON.stringify(companies, null, 2));
    } catch (e) {
        console.error(e.message);
    } finally {
        await sequelize.close();
    }
}
check();
