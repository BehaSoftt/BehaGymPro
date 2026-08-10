const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    memberId: { type: DataTypes.UUID, allowNull: false },
    branchId: { type: DataTypes.UUID },
    companyId: { type: DataTypes.UUID },
    type: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    paymentMethod: { type: DataTypes.STRING }, // Cash, Credit Card, etc.
    description: { type: DataTypes.TEXT },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = Transaction;
