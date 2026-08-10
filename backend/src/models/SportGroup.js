const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SportGroup = sequelize.define('SportGroup', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    branchId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Branches',
            key: 'id'
        }
    },
    companyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Companies',
            key: 'id'
        }
    },
    specialtyId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'SportSpecialties',
            key: 'id'
        }
    },
    instructorId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Members',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false // Örn: U12 A Takımı, Tenis Başlangıç-A
    },
    category: {
        type: DataTypes.STRING, // Örn: U10, U12, YETİŞKİN
        allowNull: true
    },
    minAge: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    maxAge: {
        type: DataTypes.INTEGER,
        defaultValue: 99,
        allowNull: false
    },
    maxCapacity: {
        type: DataTypes.INTEGER,
        defaultValue: 30
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

module.exports = SportGroup;
