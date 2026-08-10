const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SportEvent = sequelize.define('SportEvent', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    groupId: {
        type: DataTypes.UUID,
        allowNull: true, // Her maç bir gruba bağlı olmayabilir (Örn: Seçmeler)
        references: {
            model: 'SportGroups',
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
    title: {
        type: DataTypes.STRING,
        allowNull: false // Örn: X Kulübü vs BehaGym Futbol Maçı
    },
    type: {
        type: DataTypes.ENUM('MATCH', 'TOURNAMENT', 'EXAM', 'SOCIAL', 'OTHER'),
        defaultValue: 'MATCH'
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING, // Örn: Merkez Saha, Deplasman vb.
        allowNull: true
    },
    opponent: {
        type: DataTypes.STRING,
        allowNull: true
    },
    result: {
        type: DataTypes.STRING, // Örn: 3-2
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('PLANNED', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'PLANNED'
    }
}, {
    timestamps: true
});

module.exports = SportEvent;
