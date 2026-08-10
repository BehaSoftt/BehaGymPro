require('dotenv').config();
const { Member } = require('./src/models');

async function testUpdate() {
    try {
        const member = await Member.findOne();
        if (!member) {
            console.log('No member found');
            process.exit(0);
        }
        console.log('Updating member:', member.fullName);
        member.fitnessGoals = ['Zayıflamak', 'Kas Yapmak'];
        await member.save();
        console.log('Update saved.');

        const updated = await Member.findByPk(member.id);
        console.log('Updated Goals:', JSON.stringify(updated.fitnessGoals));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

testUpdate();
