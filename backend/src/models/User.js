const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    passwordHash: { type: DataTypes.TEXT, allowNull: false },
    email: { type: DataTypes.STRING, unique: true },
    role: { type: DataTypes.STRING, defaultValue: 'MEMBER' },
    roleId: { type: DataTypes.UUID },
    companyId: { type: DataTypes.UUID },
    branchId: { type: DataTypes.UUID },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    isTwoFactorEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    isInside: { type: DataTypes.BOOLEAN, defaultValue: false },
    personnelCode: { type: DataTypes.STRING, unique: true }, // Sync with Member.personnelCode or Member.instructorCode
    twoFactorCode: { type: DataTypes.STRING },
    twoFactorExpiry: { type: DataTypes.DATE }
});

module.exports = User;
