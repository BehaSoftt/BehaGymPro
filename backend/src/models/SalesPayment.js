const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SalesPayment = sequelize.define('SalesPayment', {
    id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
    },
    salesTransactionId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'COIN', 'TICKET']]
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 }
    },
    financialTransactionId: {
        type: DataTypes.UUID
    }
}, {
    indexes: [
        { fields: ['salesTransactionId'] },
        { fields: ['paymentMethod'] }
    ]
});

module.exports = SalesPayment;
