const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('Role', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true }, // SUPER_MASTER, ADMIN, ÜYE vb.
    description: { type: DataTypes.STRING },
    isSystemRole: { type: DataTypes.BOOLEAN, defaultValue: false } // Sistem rollerinin silinmesini önlemek için
});

module.exports = Role;
