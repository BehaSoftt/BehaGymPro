const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MembershipPackage = sequelize.define('MembershipPackage', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    branchId: { type: DataTypes.UUID },
    companyId: { type: DataTypes.UUID },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    durationMonths: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING, defaultValue: 'PERIODICAL' },
    sessionCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    weeklySessionCount: { 
        type: DataTypes.INTEGER, 
        defaultValue: 0,
        allowNull: false,
        comment: 'Haftada kaç gün ders var (otomatik seans hesaplama için)'
    },
    specialtyId: { type: DataTypes.UUID },
    startDate: { type: DataTypes.DATEONLY, allowNull: true },
    endDate: { type: DataTypes.DATEONLY, allowNull: true },
    membershipType: {
        type: DataTypes.STRING,
        defaultValue: 'STANDART'
    },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

module.exports = MembershipPackage;
