const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FinancialAccount = sequelize.define('FinancialAccount', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    // İlişkili kayıt bilgileri
    entityType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['MEMBER', 'USER', 'INSTRUCTOR', 'COMPANY', 'BRANCH', 'GUEST']]
        }
    },
    entityId: {
        type: DataTypes.UUID,
        allowNull: false
    },

    // Temel bilgiler
    accountName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    accountCode: {
        type: DataTypes.STRING
    },

    // Finansal bilgiler
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    totalDebit: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    totalCredit: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },

    // Ön Ödeme ve Limit
    prepaidBalance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    debtLimit: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },

    // Ayrıştırılmış Bakiyeler (Seçenek B)
    cashBalance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    posBalance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    bankBalance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },

    // Organizasyon bilgileri
    branchId: { type: DataTypes.UUID, allowNull: false },
    companyId: { type: DataTypes.UUID, allowNull: false },

    // Durum
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

    // Notlar
    notes: {
        type: DataTypes.TEXT
    },

    // Sistem hesabı mı? (Silinemeyen hesaplar için)
    isSystemAccount: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    indexes: [
        { fields: ['entityType', 'entityId'], unique: true },
        { fields: ['branchId'] },
        { fields: ['companyId'] },
        { fields: ['isActive'] }
    ]
});

module.exports = FinancialAccount;
