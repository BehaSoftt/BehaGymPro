const sequelize = require('./src/config/database');
const { Attendance } = require('./src/models');

async function test() {
    try {
        const results = await Attendance.findAll({
            order: [['updatedAt', 'DESC']],
            limit: 10
        });
        console.log(JSON.stringify(results, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
test();
