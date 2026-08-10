const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BeltExam = sequelize.define('BeltExam', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    examName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    branchId: { // SportBranch / Specialty
        type: DataTypes.UUID,
        allowNull: false
    },
    examDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    examTime: {
        type: DataTypes.STRING,
        allowNull: true
    },
    locationName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    locationAddress: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    meetingPointName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    meetingPointAddress: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    meetingTime: {
        type: DataTypes.STRING,
        allowNull: true
    },
    meetingDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    targetBelt: {
        type: DataTypes.STRING,
        allowNull: true
    },
    examPeriod: {
        type: DataTypes.STRING,
        allowNull: true
    },
    instructorId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    companyId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    gymBranchId: { // Branch of the gym
        type: DataTypes.UUID,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'PENDING' // PENDING, COMPLETED, CANCELLED
    }
}, {
    tableName: 'BeltExams'
});

module.exports = BeltExam;
