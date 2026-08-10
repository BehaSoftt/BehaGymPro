const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TrainingPlanDay = sequelize.define('TrainingPlanDay', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    planId: { type: DataTypes.UUID, allowNull: false },
    dayOfWeek: { type: DataTypes.INTEGER, allowNull: false }, // 0: Pazartesi, 1: Salı... (UI mapping: 0 -> Pazartesi)
    startTime: { type: DataTypes.STRING }, // "10:00"
    endTime: { type: DataTypes.STRING }, // "11:30"
    isRestDay: { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = TrainingPlanDay;
