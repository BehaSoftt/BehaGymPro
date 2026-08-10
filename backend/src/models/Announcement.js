const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Announcement = sequelize.define('Announcement', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    priority: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    targetType: {
        type: DataTypes.STRING(50),
        defaultValue: 'ALL',
        validate: {
            isIn: [['MEMBER', 'STAFF', 'ALL']]
        }
    },
    showOnLogin: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    branchId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    companyId: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    timestamps: true,
    tableName: 'Announcements'
});

module.exports = Announcement;
