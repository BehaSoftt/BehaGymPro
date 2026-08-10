const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GroupClassMember = sequelize.define('GroupClassMember', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    groupClassId: { type: DataTypes.UUID, allowNull: false },
    memberId: { type: DataTypes.UUID, allowNull: false },

    registrationDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'ENROLLED'
    }
});

module.exports = GroupClassMember;
