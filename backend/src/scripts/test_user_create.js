const { User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function testUserCreate() {
    try {
        console.log('--- START USER CREATE TEST ---');

        const companyId = 'ffcbe048-aa84-4ad9-99a5-f8c6205cd8dd';
        const branchId = '353b964d-53aa-4878-8721-04a479c95250';
        const dummyMemberId = '00000000-0000-0000-0000-000000000000';

        const hashedPassword = await bcrypt.hash('member123', 10);

        console.log('Attempting User.create...');
        const user = await User.create({
            username: dummyMemberId.slice(0, 8),
            passwordHash: hashedPassword,
            role: 'MEMBER',
            companyId,
            branchId
        });

        console.log('User created successfully. ID:', user.id);

    } catch (err) {
        console.log('!!! ERROR !!!');
        console.log('Name:', err.name);
        console.log('Message:', err.message);
        if (err.parent) {
            console.log('Database Error:', err.parent.message);
        }
        if (err.errors) {
            err.errors.forEach(e => console.log('Validation Error:', e.message));
        }
    } finally {
        await sequelize.close();
        console.log('--- END USER CREATE TEST ---');
    }
}

testUserCreate();
