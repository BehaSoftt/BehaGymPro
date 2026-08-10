const { Member, User, sequelize } = require('../models');

async function testFullContext() {
    try {
        console.log('--- START FULL CONTEXT TEST ---');

        // Exact IDs from sm_info.log
        const companyId = 'ffcbe048-aa84-4ad9-99a5-f8c6205cd8dd';
        const branchId = '353b964d-53aa-4878-8721-04a479c95250';

        console.log('Using Company ID:', companyId);
        console.log('Using Branch ID:', branchId);

        const payload = {
            fullName: 'Bekir Yasak',
            memberCode: '11111111',
            gender: 'Erkek',
            phone: '1 (111) 11',
            membershipType: 'STANDART',
            registrationDate: '2026-02-18',
            expiryDate: null,
            packageId: null
        };

        const member = await Member.create({
            ...payload,
            branchId,
            companyId
        });

        console.log('Member created successfully. ID:', member.id);

    } catch (err) {
        console.error('!!! ERROR !!!');
        console.error(err.name);
        console.error(err.message);
        if (err.parent) {
            console.error('Database Error Details:', err.parent.detail);
        }
    } finally {
        await sequelize.close();
        console.log('--- END FULL CONTEXT TEST ---');
    }
}

testFullContext();
