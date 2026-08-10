require('dotenv').config();
const { sequelize } = require('../models');

async function fix() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');
        await sequelize.query('ALTER TABLE "BeltExamParticipants" ADD COLUMN IF NOT EXISTS "attendance" BOOLEAN DEFAULT false');
        await sequelize.query('ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "bloodGroup" VARCHAR(255)');
        await sequelize.query('ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "gender" VARCHAR(255)');
        console.log('Columns added successfully');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
