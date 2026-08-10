const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MemberPackage = sequelize.define('MemberPackage', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    memberId: { type: DataTypes.UUID, allowNull: false },
    packageId: { type: DataTypes.UUID, allowNull: false },
    instructorId: { type: DataTypes.UUID }, // Assigned Instructor
    branchId: { type: DataTypes.UUID },
    companyId: { type: DataTypes.UUID },

    startDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    expiryDate: { type: DataTypes.DATEONLY },
    campaignId: { type: DataTypes.UUID }, // Track campaign used

    totalSessions: { type: DataTypes.INTEGER, defaultValue: 0 },
    remainingSessions: { type: DataTypes.INTEGER, defaultValue: 0 },

    status: {
        type: DataTypes.STRING,
        defaultValue: 'ACTIVE',
        validate: {
            isIn: [['ACTIVE', 'EXPIRED', 'CANCELLED', 'FROZEN']]
        }
    },
    paymentStatus: {
        type: DataTypes.STRING,
        defaultValue: 'PAID',
        validate: {
            isIn: [['PAID', 'PARTIAL', 'UNPAID']]
        }
    }
});

module.exports = MemberPackage;
