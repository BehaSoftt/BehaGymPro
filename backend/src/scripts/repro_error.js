const { Member, User, MembershipPackage, MemberPackage, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function testCreate() {
    try {
        console.log('Starting member creation test...');

        const payload = {
            fullName: 'Bekir Yasak',
            memberCode: '11111111',
            gender: 'Erkek',
            phone: '1 (111) 11',
            emergencyPhone: '2 (222) 22',
            height: 168,
            weight: 85,
            membershipType: 'STANDART',
            registrationDate: '2026-02-18',
            expiryDate: null,
            packageId: null
        };

        const branchId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID
        const companyId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID

        const member = await Member.create({
            fullName: payload.fullName,
            memberCode: payload.memberCode,
            gender: payload.gender,
            registrationDate: payload.registrationDate,
            expiryDate: payload.expiryDate,
            packageId: payload.packageId,
            branchId,
            companyId,
            membershipType: payload.membershipType,
            height: payload.height,
            weight: payload.weight,
            emergencyPhone: payload.emergencyPhone,
            phone: payload.phone
        });

        console.log('Member created successfully:', member.id);

        const hashedPassword = await bcrypt.hash('member123', 10);
        const user = await User.create({
            username: member.id.slice(0, 8),
            passwordHash: hashedPassword,
            role: 'MEMBER',
            companyId,
            branchId
        });

        console.log('User created successfully:', user.id);

    } catch (err) {
        console.error('TEST FAILED WITH ERROR:');
        console.error(err);
        if (err.errors) {
            console.error('Sequelize Validation Errors:', err.errors.map(e => e.message));
        }
    } finally {
        await sequelize.close();
    }
}

testCreate();
