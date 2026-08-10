const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentPlan = sequelize.define('PaymentPlan', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    // İlişkili kayıtlar
    financialAccountId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    relatedTransactionId: {
        type: DataTypes.UUID
    },

    // Plan bilgileri
    planName: {
        type: DataTypes.STRING
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    paidAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    remainingAmount: {
        type: DataTypes.DECIMAL(10, 2)
    },

    // Taksit ayarları
    installmentCount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    installmentAmount: {
        type: DataTypes.DECIMAL(10, 2)
    },
    installmentFrequency: {
        type: DataTypes.STRING,
        defaultValue: 'MONTHLY',
        validate: {
            isIn: [['WEEKLY', 'MONTHLY', 'CUSTOM']]
        }
    },

    // Tarihler
    startDate: {
        type: DataTypes.DATE
    },
    endDate: {
        type: DataTypes.DATE
    },

    // Durum
    status: {
        type: DataTypes.STRING,
        defaultValue: 'ACTIVE',
        validate: {
            isIn: [['ACTIVE', 'COMPLETED', 'CANCELLED', 'OVERDUE']]
        }
    },

    // Organizasyon
    branchId: { type: DataTypes.UUID, allowNull: false },
    companyId: { type: DataTypes.UUID, allowNull: false },

    // Notlar
    notes: {
        type: DataTypes.TEXT
    }
}, {
    indexes: [
        { fields: ['financialAccountId'] },
        { fields: ['status'] },
        { fields: ['branchId'] },
        { fields: ['companyId'] }
    ]
});

module.exports = PaymentPlan;
