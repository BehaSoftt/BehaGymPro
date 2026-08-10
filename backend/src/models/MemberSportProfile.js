const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MemberSportProfile = sequelize.define('MemberSportProfile', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    memberId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Members',
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
    // Seviye: Amatör, Lisanslı, Profesyonel, Yıldız vb.
    level: {
        type: DataTypes.STRING,
        defaultValue: 'AMATÖR'
    },
    // Esnek Veri Alanı: Mevki, Güçlü Ayak, Lisans No vb. branşa özel her şey burada JSON olarak tutulur.
    extraData: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

module.exports = MemberSportProfile;
