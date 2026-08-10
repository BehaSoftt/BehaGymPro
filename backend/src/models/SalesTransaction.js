const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SalesTransaction = sequelize.define('SalesTransaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    transactionDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 }
    },
    entityType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['MEMBER', 'USER', 'INSTRUCTOR', 'GUEST']]
        }
    },
    entityId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    financialAccountId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    isPaid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'True if fully paid, false if on credit'
    },
    paidAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'COMPLETED',
        validate: {
            isIn: [['COMPLETED', 'CANCELLED', 'REFUNDED']]
        }
    },
    branchId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    companyId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'User who performed the sale'
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    indexes: [
        { fields: ['financialAccountId'] },
        { fields: ['entityType', 'entityId'] },
        { fields: ['transactionDate'] },
        { fields: ['branchId'] },
        { fields: ['status'] },
        { fields: ['createdBy'] }
    ]
});

module.exports = SalesTransaction;
