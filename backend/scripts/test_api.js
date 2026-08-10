const axios = require('axios');

async function check() {
    try {
        const res = await axios.get('http://localhost:5000/api/exercises');
        console.log('Total Exercises:', res.data.length);
        if (res.data.length > 0) {
            console.log('Sample Exercise:', JSON.stringify(res.data[0], null, 2));
        }

        const res2 = await axios.get('http://localhost:5000/api/specialties');
        console.log('Total Specialties:', res2.data.length);
        if (res2.data.length > 0) {
            console.log('Sample Specialty:', JSON.stringify(res2.data[0], null, 2));
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

check();
