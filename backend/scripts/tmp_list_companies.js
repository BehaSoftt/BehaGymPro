const { Company } = require('./src/models');
const sequelize = require('./src/config/database');

async function list() {
    try {
        const companies = await Company.findAll();
        console.log('COMPANIES_BEGIN');
        companies.forEach(c => {
            console.log(`- ${c.name} (ID: ${c.id})`);
        });
        console.log('COMPANIES_END');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
list();
