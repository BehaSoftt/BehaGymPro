const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SalesItem = sequelize.define('SalesItem', {
    id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
    },
    salesTransactionId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    productId: {
        type: DataTypes.UUID
    },
    productName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 }
    },
    unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    lineTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'quantity * unitPrice'
    }
}, {
    indexes: [
        { fields: ['salesTransactionId'] },
        { fields: ['productId'] }
    ]
});

module.exports = SalesItem;
