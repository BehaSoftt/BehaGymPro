const { Exercise, SportSpecialty } = require('./src/models');

async function check() {
    try {
        const specialties = await SportSpecialty.findAll();
        const exercises = await Exercise.findAll();

        console.log('--- SPECIALTIES ---');
        specialties.forEach(s => {
            const count = exercises.filter(e => e.specialtyId === s.id).length;
            console.log(`${s.name} (ID: ${s.id}): ${count} exercises`);
        });

        const nullCount = exercises.filter(e => !e.specialtyId).length;
        console.log(`NO SPECIALTY: ${nullCount} exercises`);

        console.log('--- EXERCISE DATA (First 5) ---');
        exercises.slice(0, 5).forEach(e => {
            console.log(`- ${e.name} | SpecialtyID: ${e.specialtyId}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
