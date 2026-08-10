const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SportGroupMember = sequelize.define('SportGroupMember', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    sportGroupId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'SportGroups',
            key: 'id'
        }
    },
    memberId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Members',
            key: 'id'
        }
    },
    joinedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

module.exports = SportGroupMember;
