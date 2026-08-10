const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AccessLog = sequelize.define('AccessLog', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    memberId: { type: DataTypes.UUID, allowNull: false },
    branchId: { type: DataTypes.UUID, allowNull: false },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'SUCCESS',
        validate: { isIn: [['SUCCESS', 'FAILED', 'DENIED']] }
    },
    actionType: {
        type: DataTypes.STRING,
        defaultValue: 'ENTRY',
        validate: { isIn: [['ENTRY', 'EXIT']] }
    },
    entryType: {
        type: DataTypes.STRING,
        defaultValue: 'QR',
        validate: { isIn: [['QR', 'CARD', 'MANUAL']] }
    },
    failureReason: { type: DataTypes.STRING },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = AccessLog;
