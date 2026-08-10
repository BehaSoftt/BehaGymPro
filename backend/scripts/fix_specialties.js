const { SportSpecialty } = require('./src/models');
const sequelize = require('./src/config/database');

async function fixSpecialties() {
    try {
        const specs = await SportSpecialty.findAll();
        for (const spec of specs) {
            const hasBeltsNow = spec.belts && spec.belts.length > 0;
            if (hasBeltsNow && !spec.hasBelts) {
                console.log(`Fixing specialty: ${spec.name} -> hasBelts: true`);
                await spec.update({ hasBelts: true });
            } else if (!hasBeltsNow && spec.hasBelts) {
                // Sadece eğer hasBelts manuel set edilmişse dokunma?
                // Neyse kalsın şimdilik
            }
        }
        console.log('Specialties fixed.');
    } catch (err) {
        console.error(err);
    } finally {
        await sequelize.close();
    }
}

fixSpecialties();
