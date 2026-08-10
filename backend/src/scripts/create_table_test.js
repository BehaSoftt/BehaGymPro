const { sequelize } = require('../models');
const { Op } = require('sequelize');

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        await sequelize.query('CREATE TABLE IF NOT EXISTS "AccessLogs" ("id" UUID PRIMARY KEY, "memberId" UUID NOT NULL, "branchId" UUID NOT NULL, "status" VARCHAR(50) DEFAULT \'SUCCESS\', "actionType" VARCHAR(50) DEFAULT \'ENTRY\', "entryType" VARCHAR(50) DEFAULT \'QR\', "failureReason" TEXT, "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(), "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW())');
        console.log('Table AccessLogs created or already exists.');

        const [results] = await sequelize.query('SELECT table_name FROM information_schema.tables WHERE table_schema=\'public\' AND table_name=\'AccessLogs\'');
        console.log('Check result:', results);

        process.exit(0);
    } catch (error) {
        console.error('Unable to execute:', error);
        process.exit(1);
    }
}

test();
