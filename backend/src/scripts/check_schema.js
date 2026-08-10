const { sequelize } = require('../models');

async function checkSchema() {
    try {
        const [results] = await sequelize.query("SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name = 'Members'");
        console.log('--- Members Table Schema ---');
        console.table(results);

        const [constraints] = await sequelize.query("SELECT conname, pg_get_constraintdef(c.oid) FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace WHERE n.nspname = 'public' AND conrelid = 'Members'::regclass");
        console.log('--- Members Table Constraints ---');
        console.table(constraints);

    } catch (err) {
        console.error(err);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
