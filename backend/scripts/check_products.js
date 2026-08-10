const { Product } = require('./src/models');
Product.findAll().then(res => {
    console.log(JSON.stringify(res.map(r => ({ id: r.id, name: r.name, branchId: r.branchId, isFavorite: r.isFavorite, isActive: r.isActive })), null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
