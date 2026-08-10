
require('dotenv').config();
const { Member, SportSpecialty } = require('./src/models');
const { Op } = require('sequelize');

async function debugData() {
    try {
        const specs = await SportSpecialty.findAll();
        console.log('--- BRANŞLAR (SPECIALTIES) ---');
        specs.forEach(s => console.log(`ID: ${s.id} | NAME: ${s.name}`));

        const members = await Member.findAll({
            attributes: ['id', 'fullName', 'specialtyId', 'beltBranchId', 'isActive', 'profileType', 'lastBeltDate', 'currentBelt']
        });
        console.log('\n--- ÜYELER (MEMBERS) ---');
        members.forEach(m => {
            console.log(`ID: ${m.id} | NAME: ${m.fullName} | Active: ${m.isActive} | Type: ${m.profileType} | SpecId: ${m.specialtyId} | BeltSpecId: ${m.beltBranchId} | Belt: ${m.currentBelt}`);
        });

        const { BeltExam, BeltExamParticipant } = require('./src/models');
        const exams = await BeltExam.findAll({
            include: [{ model: BeltExamParticipant, as: 'participants' }]
        });
        console.log('\n--- SINAVLAR VE KATILIMCILAR ---');
        exams.forEach(e => {
            console.log(`EXAM: ${e.examName} | ID: ${e.id} | Participants: ${e.participants.length}`);
            e.participants.forEach(p => console.log(`  - MemberID: ${p.memberId}`));
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

debugData();
