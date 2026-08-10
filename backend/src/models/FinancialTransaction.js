const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FinancialTransaction = sequelize.define('FinancialTransaction', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    // Cari hesap ilişkisi
    financialAccountId: {
        type: DataTypes.UUID,
        allowNull: false
    },

    // İşlem bilgileri
    transactionType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['DEBIT', 'CREDIT']]
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    // Açıklama
    description: {
        type: DataTypes.TEXT
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'OTHER',
        validate: {
            isIn: [['MEMBERSHIP', 'PRODUCT_SALE', 'PRODUCT_RENTAL', 'PREPAID_LOAD', 'DEBT_COLLECTION', 'SALARY', 'COMMISSION', 'CASH_TRANSFER', 'EXAM_FEE', 'EXPENSE', 'OTHER']]
        }
    },
    productName: {
        type: DataTypes.STRING
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    unitPrice: {
        type: DataTypes.DECIMAL(10, 2)
    },
    prepaidUsed: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },

    // Ödeme bilgileri
    paymentMethod: {
        type: DataTypes.STRING,
        defaultValue: 'CASH',
        validate: {
            isIn: [['CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'COIN', 'TICKET', 'CARİ', 'OTHER']]
        }
    },

    // Tarih
    transactionDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    // Link to Sales (if any)
    salesTransactionId: {
        type: DataTypes.UUID,
        allowNull: true
    },

    // Organizasyon
    branchId: { type: DataTypes.UUID, allowNull: false },
    companyId: { type: DataTypes.UUID, allowNull: false },

    // İşlemi yapan kullanıcı
    createdBy: {
        type: DataTypes.UUID
    }
}, {
    indexes: [
        { fields: ['financialAccountId'] },
        { fields: ['transactionType'] },
        { fields: ['transactionDate'] },
        { fields: ['branchId'] },
        { fields: ['companyId'] }
    ]
});

module.exports = FinancialTransaction;
