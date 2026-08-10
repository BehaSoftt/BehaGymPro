const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LessonSchedule = sequelize.define('LessonSchedule', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    instructorId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    memberId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    dayOfWeek: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 6
        }
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    lessonType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['GENERAL', 'PRIVATE', 'GROUP']]
        }
    },
    specialtyId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    categoryId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    groupClassId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT
    },
    branchId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    companyId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    validate: {
        timeRangeValid() {
            if (this.startTime >= this.endTime) {
                throw new Error('startTime must be before endTime');
            }
        }
    }
});

module.exports = LessonSchedule;
