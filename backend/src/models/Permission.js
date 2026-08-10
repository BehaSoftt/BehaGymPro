const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('Permission', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    key: { type: DataTypes.STRING, allowNull: false, unique: true }, // örn: MEMBER_CREATE, FINANCIAL_VIEW
    name: { type: DataTypes.STRING, allowNull: false },
    module: { type: DataTypes.STRING } // Üyeler, Muhasebe vb.
});

module.exports = Permission;
