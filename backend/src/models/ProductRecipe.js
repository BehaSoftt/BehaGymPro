const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductRecipe = sequelize.define('ProductRecipe', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'The karma product ID'
    },
    componentProductId: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'The ingredient product ID'
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 1,
        comment: 'Quantity of ingredient needed'
    },
    branchId: { type: DataTypes.UUID },
    companyId: { type: DataTypes.UUID }
});

module.exports = ProductRecipe;
