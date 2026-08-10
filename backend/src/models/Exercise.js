const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exercise = sequelize.define('Exercise', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    specialtyId: { type: DataTypes.UUID }, // Link to Branş (Fitness, Zumba, etc.)
    categoryId: { type: DataTypes.UUID }, // Link to Alt Başlık (Chest, Back, etc.)
    // branchId ve companyId YOK - Global egzersizler
    criterionType: {
        type: DataTypes.STRING,
        defaultValue: 'SETS_REPS',
        validate: { isIn: [['SETS_REPS', 'DURATION', 'ROUNDS_DURATION', 'REPS_ONLY', 'HYBRID']] }
    },
    caloriesPerMinute: { type: DataTypes.FLOAT, defaultValue: 0 },
    description: { type: DataTypes.TEXT },
    level: { type: DataTypes.INTEGER, defaultValue: 1, validate: { min: 1, max: 20 } },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    videoUrl: { type: DataTypes.STRING },
    imageUrl: { type: DataTypes.STRING }
});

module.exports = Exercise;
