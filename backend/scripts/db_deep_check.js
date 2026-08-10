const axios = require('axios');
const fs = require('fs');

// We need a token. I'll search for a token in the logs or try to look at an existing test or something.
// Alternatively, I can just check the DB again to see if companyId/branchId are matching.
// I'll check DB one more time, but this time I'll use a better approach.

const { Product, ProductGroup, ProductUnit } = require('./src/models');
Product.findAll({
    include: ['group', 'productUnit']
}).then(res => {
    console.log(JSON.stringify(res.map(r => ({
        id: r.id,
        name: r.name,
        branchId: r.branchId,
        companyId: r.companyId,
        isActive: r.isActive,
        group: r.group ? r.group.name : null,
        unit: r.productUnit ? r.productUnit.name : null
    })), null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
