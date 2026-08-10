const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExerciseCategory = sequelize.define('ExerciseCategory', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    specialtyId: { type: DataTypes.UUID, allowNull: false },
    photo: { type: DataTypes.TEXT } // TEXT because Base64 is long!
});

module.exports = ExerciseCategory;
