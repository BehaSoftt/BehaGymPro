const { SportSpecialty } = require('./src/models');
const sequelize = require('./src/config/database');

async function checkSpecialties() {
    try {
        const specs = await SportSpecialty.findAll();
        console.log(JSON.stringify(specs.map(s => ({
            id: s.id,
            name: s.name,
            hasBelts: s.hasBelts,
            belts: s.belts
        })), null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await sequelize.close();
    }
}

checkSpecialties();
