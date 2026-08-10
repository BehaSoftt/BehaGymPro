require('dotenv').config();
const { Member } = require('./src/models');
const { Op } = require('sequelize');

async function migrate() {
    try {
        const members = await Member.findAll({
            where: {
                startingWeight: null,
                weight: { [Op.ne]: null }
            }
        });

        console.log(`Migrating ${members.length} members...`);

        for (const member of members) {
            await member.update({ startingWeight: member.weight });
        }

        console.log('Migration complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
