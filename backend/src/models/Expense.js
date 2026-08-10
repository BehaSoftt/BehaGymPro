const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    branchId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'OTHER',
        validate: { isIn: [['RENT', 'ELECTRICITY', 'WATER', 'SALARY', 'MAINTENANCE', 'OTHER']] }
    },
    amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    expenseDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    description: { type: DataTypes.TEXT },
    isPaid: { type: DataTypes.BOOLEAN, defaultValue: true }
});

module.exports = Expense;
