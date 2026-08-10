const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TrainingPlan = sequelize.define('TrainingPlan', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    memberId: { type: DataTypes.UUID, allowNull: true },
    packageId: { type: DataTypes.UUID, allowNull: true },
    specialtyId: { type: DataTypes.UUID, allowNull: true }, // Branş seçimi için
    instructorId: { type: DataTypes.UUID },
    branchId: { type: DataTypes.UUID },
    companyId: { type: DataTypes.UUID },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    schedule: { type: DataTypes.JSONB }, // JSON structure for weekly/daily hours
    startDate: { type: DataTypes.DATEONLY },
    endDate: { type: DataTypes.DATEONLY },
    level: { type: DataTypes.INTEGER, defaultValue: 1, validate: { min: 1, max: 20 } },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

module.exports = TrainingPlan;
