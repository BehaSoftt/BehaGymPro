const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BeltExamParticipant = sequelize.define('BeltExamParticipant', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    examId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    memberId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    fromBelt: {
        type: DataTypes.STRING,
        allowNull: true
    },
    toBelt: {
        type: DataTypes.STRING,
        allowNull: true
    },
    attemptNumber: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'PENDING' // PENDING, PASSED, FAILED
    },
    feePaid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    attendance: {
        type: DataTypes.STRING,
        defaultValue: 'PENDING' // PENDING, PRESENT, ABSENT, EXCUSED
    },
    excuse: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'BeltExamParticipants'
});

module.exports = BeltExamParticipant;
