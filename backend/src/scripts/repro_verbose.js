const { Member, User, MembershipPackage, MemberPackage, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

async function testCreate() {
    try {
        console.log('--- START VERBOSE TEST ---');

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

        const branchId = 'e2e92c4e-4861-4c12-9c1a-28318182f7cc'; // A more realistic UUID
        const companyId = 'e2e92c4e-4861-4c12-9c1a-28318182f7cc'; // A more realistic UUID

        console.log('Attempting Member.create...');
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

        console.log('Member created successfully. ID:', member.id);

        console.log('Attempting User.create...');
        const hashedPassword = await bcrypt.hash('member123', 10);
        const user = await User.create({
            username: member.id.slice(0, 8),
            passwordHash: hashedPassword,
            role: 'MEMBER',
            companyId,
            branchId
        });

        console.log('User created successfully. ID:', user.id);

    } catch (err) {
        console.log('!!! ERROR DETECTED !!!');
        console.log('Name:', err.name);
        console.log('Message:', err.message);
        if (err.parent) {
            console.log('Parent Error:', err.parent.message);
        }
        if (err.errors) {
            err.errors.forEach((e, i) => {
                console.log(`Error ${i}:`, e.message, 'Path:', e.path, 'Value:', e.value);
            });
        }
        console.log('Stack:', err.stack);
    } finally {
        await sequelize.close();
        console.log('--- END VERBOSE TEST ---');
    }
}

testCreate();
