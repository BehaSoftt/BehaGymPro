require('dotenv').config({ path: '../../.env' });
const fixExistingCashAccounts = require('./fixCashAccounts');

fixExistingCashAccounts().then(() => {
    console.log('Done!');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
