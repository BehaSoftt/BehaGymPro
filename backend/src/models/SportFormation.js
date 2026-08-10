const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SportFormation = sequelize.define('SportFormation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    layout: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
    },
    sportSpecialtyId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    branchId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    companyId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = SportFormation;
