const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TrainingLog = sequelize.define('TrainingLog', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    memberId: { type: DataTypes.UUID, allowNull: false },
    planId: { type: DataTypes.UUID, allowNull: false },
    dayOfWeek: { type: DataTypes.INTEGER, allowNull: false },
    weekNumber: { type: DataTypes.INTEGER, defaultValue: 1 },
    date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    status: {
        type: DataTypes.ENUM('PENDING', 'COMPLETED', 'SKIPPED', 'TRANSFERRED'),
        defaultValue: 'PENDING'
    },
    instructorId: { type: DataTypes.UUID, allowNull: true }, // Who approved or oversaw the log
    notes: { type: DataTypes.TEXT, allowNull: true }, // Instructor's notes
    transferredToDate: { type: DataTypes.DATEONLY, allowNull: true }, // If transferred, to which date
    transferredToLogId: { type: DataTypes.UUID, allowNull: true }, // Links to the new combined log
    extraWorkouts: { type: DataTypes.JSONB, allowNull: true } // Stores details of transferred workout

});

module.exports = TrainingLog;
