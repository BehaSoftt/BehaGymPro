const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryMovement = sequelize.define('InventoryMovement', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    productId: { type: DataTypes.UUID, allowNull: false },
    branchId: { type: DataTypes.UUID, allowNull: false },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [['IN', 'OUT', 'SALE', 'WASTAGE']] }
    },
    quantity: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    note: { type: DataTypes.STRING },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = InventoryMovement;
