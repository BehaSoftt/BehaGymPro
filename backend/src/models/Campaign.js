const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Campaign = sequelize.define('Campaign', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    discountType: {
        type: DataTypes.STRING(50),
        defaultValue: 'AMOUNT',
        validate: {
            isIn: [['PERCENTAGE', 'AMOUNT']]
        }
    },
    discountValue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    durationBonusDays: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    durationBonusMonths: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    branchId: {
        type: DataTypes.UUID,
        allowNull: true // Null if applies to all branches of a company
    },
    companyId: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    timestamps: true,
    tableName: 'Campaigns'
});

module.exports = Campaign;
