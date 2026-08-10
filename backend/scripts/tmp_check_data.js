const { Product, Company, Branch } = require('./src/models');
(async () => {
    try {
        const products = await Product.findAll({
            include: [
                { model: Company, as: 'company' },
                { model: Branch, as: 'branch' }
            ]
        });
        console.log(JSON.stringify(products.map(p => ({
            id: p.id,
            name: p.name,
            companyId: p.companyId,
            companyName: p.company?.name,
            branchId: p.branchId,
            branchName: p.branch?.name
        })), null, 2));

        const companies = await Company.findAll();
        console.log('--- COMPANIES ---');
        console.log(JSON.stringify(companies.map(c => ({ id: c.id, name: c.name })), null, 2));

        const branches = await Branch.findAll();
        console.log('--- BRANCHES ---');
        console.log(JSON.stringify(branches.map(b => ({ id: b.id, name: b.name, companyId: b.companyId })), null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
