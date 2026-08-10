const fs = require('fs');
const content = fs.readFileSync('d:/BehaGymPro/frontend/src/views/instructor/InstructorTracker.vue', 'utf8');
const lines = content.split('\n');
for (let i = 275; i < 290; i++) {
    const line = lines[i];
    if (line) {
        console.log(`${i+1}: ${line.replace(/\s/g, (m) => '[' + m.charCodeAt(0).toString(16) + ']')}`);
    }
}
