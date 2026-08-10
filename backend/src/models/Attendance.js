const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    groupClassId: { type: DataTypes.UUID, allowNull: true }, // Nullable for PRIVATE/GENERAL lessons
    memberId: { type: DataTypes.UUID, allowNull: false },
    instructorId: { 
        type: DataTypes.UUID, 
        allowNull: true // Initially nullable for backward compatibility
    },
    lessonType: { 
        type: DataTypes.STRING, 
        allowNull: true, // Initially nullable for backward compatibility
        validate: {
            isIn: [['GENERAL', 'PRIVATE', 'GROUP']]
        }
    },
    packageId: { 
        type: DataTypes.UUID, 
        allowNull: true,
        references: { model: 'PrivateLessonPackages', key: 'id' },
        onDelete: 'SET NULL',
        comment: 'Reference to PrivateLessonPackage for PRIVATE lessons'
    },
    date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },

    status: {
        type: DataTypes.STRING,
        defaultValue: 'PRESENT'
    },
    excuse: { type: DataTypes.TEXT, allowNull: true },
    branchId: { type: DataTypes.UUID },
    companyId: { type: DataTypes.UUID }
});

module.exports = Attendance;
