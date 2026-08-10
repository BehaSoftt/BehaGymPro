const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GroupClass = sequelize.define('GroupClass', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    specialtyId: { type: DataTypes.UUID, allowNull: false },
    instructorId: { type: DataTypes.UUID }, // FK to Member (profileType: INSTRUCTOR)
    packageId: { type: DataTypes.UUID, allowNull: true }, // FK to MembershipPackage (GROUP type)

    maxCapacity: { type: DataTypes.INTEGER, defaultValue: 20 },
    minCapacity: { type: DataTypes.INTEGER, defaultValue: 1 },

    startDate: { type: DataTypes.DATEONLY },
    endDate: { type: DataTypes.DATEONLY },
    startTime: { type: DataTypes.TIME },
    endTime: { type: DataTypes.TIME },
    days: { type: DataTypes.JSONB }, // e.g. [1, 3, 5] for Mon, Wed, Fri

    status: {
        type: DataTypes.STRING,
        defaultValue: 'ACTIVE'
    },
    branchId: { type: DataTypes.UUID },
    companyId: { type: DataTypes.UUID }
});

module.exports = GroupClass;
