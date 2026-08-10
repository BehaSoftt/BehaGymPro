const { BeltExamParticipant } = require('./src/models');
const sequelize = require('./src/config/database');

async function check() {
    try {
        const tableInfo = await BeltExamParticipant.describe();
        console.log(JSON.stringify(tableInfo, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
