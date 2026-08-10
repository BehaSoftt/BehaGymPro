const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SportSpecialty = sequelize.define('SportSpecialty', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    belts: { type: DataTypes.JSONB, defaultValue: [] },
    // branchId ve companyId YOK - Global branşlar
    hasBelts: { type: DataTypes.BOOLEAN, defaultValue: false },
    facilityType: { type: DataTypes.ENUM('SALON', 'SAHA', 'HAVUZ', 'DIGER'), defaultValue: 'SALON' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

module.exports = SportSpecialty;
