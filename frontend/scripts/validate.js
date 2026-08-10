const fs = require('fs');
const compiler = require('@vue/compiler-sfc');

const content = fs.readFileSync('d:\\BehaGymPro\\frontend\\src\\components\\settings\\SettingsLicenses.vue', 'utf-8');
const { descriptor, errors } = compiler.parse(content);

if (errors.length) {
    errors.forEach(e => {
        console.error(`Error: ${e.message}`);
    });
} else {
    console.log("No SFC parsing errors.");
}
