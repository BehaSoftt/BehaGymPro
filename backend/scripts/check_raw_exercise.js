const { Exercise } = require('./src/models');

async function check() {
    try {
        const e = await Exercise.findOne();
        console.log('FIRST EXERCISE:', JSON.stringify(e, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
