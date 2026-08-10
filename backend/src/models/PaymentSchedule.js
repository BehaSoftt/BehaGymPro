const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentSchedule = sequelize.define('PaymentSchedule', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    // İlişkili plan
    paymentPlanId: {
        type: DataTypes.UUID,
        allowNull: false
    },

    // Taksit bilgileri
    installmentNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    // Ödeme bilgileri
    paidAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    paidDate: {
        type: DataTypes.DATE
    },
    paymentMethod: {
        type: DataTypes.STRING,
        validate: {
            isIn: [['CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'COIN', 'TICKET', 'OTHER']]
        }
    },

    // Durum
    status: {
        type: DataTypes.STRING,
        defaultValue: 'PENDING',
        validate: {
            isIn: [['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED']]
        }
    },

    // İlişkili işlem
    transactionId: {
        type: DataTypes.UUID
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
        { fields: ['paymentPlanId'] },
        { fields: ['status'] },
        { fields: ['dueDate'] },
        { fields: ['branchId'] },
        { fields: ['companyId'] }
    ]
});

module.exports = PaymentSchedule;
