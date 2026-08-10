const { sequelize } = require('../models');

async function checkConstraints() {
    try {
        const [constraints] = await sequelize.query("SELECT conname, pg_get_constraintdef(c.oid) FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace WHERE n.nspname = 'public' AND conrelid = 'Users'::regclass");
        console.log('--- Users Table Constraints ---');
        console.table(constraints);

    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await sequelize.close();
    }
}

checkConstraints();
