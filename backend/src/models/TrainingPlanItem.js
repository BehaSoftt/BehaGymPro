const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TrainingPlanItem = sequelize.define('TrainingPlanItem', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    planId: { type: DataTypes.UUID, allowNull: false },
    exerciseId: { type: DataTypes.UUID, allowNull: false },
    dayOfWeek: { type: DataTypes.INTEGER, allowNull: false }, // 0: Sunday, 1: Monday, ...
    durationMinutes: { type: DataTypes.INTEGER, defaultValue: 0 },
    sets: { type: DataTypes.INTEGER },
    reps: { type: DataTypes.INTEGER },
    rounds: { type: DataTypes.INTEGER },
    weight: { type: DataTypes.FLOAT },
    notes: { type: DataTypes.TEXT }
});

module.exports = TrainingPlanItem;
