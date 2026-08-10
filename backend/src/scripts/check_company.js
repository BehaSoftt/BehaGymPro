const { Company, sequelize } = require('../models');

async function checkCompany() {
    try {
        const companyId = 'ffcbe048-aa84-4ad9-99a5-f8c6205cd8dd';
        const company = await Company.findByPk(companyId);
        if (company) {
            console.log('Company FOUND:', company.name);
        } else {
            console.log('Company NOT FOUND');
        }
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await sequelize.close();
    }
}

checkCompany();
