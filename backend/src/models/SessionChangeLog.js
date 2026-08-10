const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SessionChangeLog = sequelize.define('SessionChangeLog', {
    id: { 
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true 
    },
    packageId: { 
        type: DataTypes.UUID, 
        allowNull: false,
        references: { model: 'PrivateLessonPackages', key: 'id' },
        onDelete: 'CASCADE'
    },
    changeType: { 
        type: DataTypes.STRING, 
        allowNull: false,
        validate: {
            isIn: {
                args: [['DECREMENT', 'INCREMENT', 'MANUAL_UPDATE']],
                msg: 'Geçersiz değişiklik tipi. Geçerli tipler: DECREMENT, INCREMENT, MANUAL_UPDATE'
            }
        }
    },
    previousValue: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'Önceki değer negatif olamaz'
            }
        }
    },
    newValue: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'Yeni değer negatif olamaz'
            }
        }
    },
    reason: { 
        type: DataTypes.TEXT,
        allowNull: true
    },
    userId: { 
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'Users', key: 'id' }
    },
    attendanceId: { 
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'Attendances', key: 'id' },
        onDelete: 'SET NULL'
    },
    timestamp: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
});

module.exports = SessionChangeLog;
