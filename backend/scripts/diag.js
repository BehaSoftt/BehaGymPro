const { sequelize } = require('./src/models');

async function check() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');
        const [tables] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
        console.log('Tables:', tables.map(t => t.table_name).join(', '));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
