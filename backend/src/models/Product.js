const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductUnit = sequelize.define('ProductUnit', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false }, // ADET, KG, LT, PAKET, vs.
    shortName: { type: DataTypes.STRING }, // Ad., Kg, Lt.
    branchId: { type: DataTypes.UUID },
    companyId: { type: DataTypes.UUID },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const ProductGroup = sequelize.define('ProductGroup', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    branchId: { type: DataTypes.UUID },
    companyId: { type: DataTypes.UUID },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const Product = sequelize.define('Product', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    groupId: { type: DataTypes.UUID },
    unitId: { type: DataTypes.UUID },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: { min: 0 }
    },
    unit: {
        type: DataTypes.STRING,
        defaultValue: 'ADET',
        comment: 'Legacy support for string units'
    },
    type: {
        type: DataTypes.ENUM('STANDART', 'HAMMADDE', 'KARMA'),
        defaultValue: 'STANDART',
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: { min: 0 }
    },
    imageUrl: {
        type: DataTypes.STRING,
        comment: 'Product image path'
    },
    isFavorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Quick sale favorite flag'
    },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    branchId: { type: DataTypes.UUID },
    companyId: { type: DataTypes.UUID }
});

module.exports = { ProductUnit, ProductGroup, Product };
