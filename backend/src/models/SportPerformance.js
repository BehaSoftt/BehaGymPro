const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SportPerformance = sequelize.define('SportPerformance', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    eventId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'SportEvents',
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
    // Performans Bilgileri JSON olarak tutulur (Mevkiye göre değişir)
    // Örn Futbol için: { goals: 2, assists: 1, yellowCard: false, minutesPlayed: 90 }
    stats: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    coachRating: {
        type: DataTypes.DECIMAL(3, 1), // 1.0 - 10.0 arası puan
        allowNull: true
    },
    coachNotes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = SportPerformance;
