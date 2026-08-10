const { exec } = require('child_process');

exec('node /home/beha/Projeler/BehaNexus/backend/src/database/database-migrate.js', (err, stdout, stderr) => {
    if (err) {
        console.error('GOLDEN MIGRASYON HATASI:', err);
        return;
    }
    console.log('GOLDEN MIGRASYON CIKTISI:', stdout);
    if (stderr) console.error('GOLDEN MIGRASYON ERROR OUTPUT:', stderr);
});
