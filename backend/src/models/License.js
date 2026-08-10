const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const License = sequelize.define('License', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    companyId: { type: DataTypes.UUID, allowNull: false },
    branchId: { type: DataTypes.UUID, allowNull: true },
    licenseKey: { type: DataTypes.STRING, allowNull: false, unique: true },
    packageType: {
        type: DataTypes.ENUM('DEMO_15', '1_MONTH', '3_MONTHS', '6_MONTHS', '1_YEAR', 'CUSTOM'),
        defaultValue: 'CUSTOM'
    },
    startDate: { type: DataTypes.DATE },
    endDate: { type: DataTypes.DATE },
    usedAt: { type: DataTypes.DATE, allowNull: true },
    status: {
        type: DataTypes.ENUM('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED'),
        defaultValue: 'PENDING'
    },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }, // easy toggling
    securityHash: { type: DataTypes.STRING }, // hash: sha256(companyId + branchId + endDate + SECRET)
    maxBranches: { type: DataTypes.INTEGER, defaultValue: 1 },
    type: { type: DataTypes.STRING, defaultValue: 'REGULAR' },
    notes: { type: DataTypes.TEXT, comment: 'Lisans için özel yöneticinin notu' }
});

module.exports = License;
