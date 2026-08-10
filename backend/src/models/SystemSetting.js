const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SystemSetting = sequelize.define('SystemSetting', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true  // Composite-key string yaklaşımında bu yeterli:
        // "ui_font_config", "ui_font_config_company_xxx", "ui_font_config_branch_yyy"
        // her biri benzersiz string olduğu için unique kısıtı bozulmaz.
    },
    value: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // İlişkisel referanslar (null = global)
    companyId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    branchId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    // Kapsam bilgisi ('global' | 'company' | 'branch')
    scope: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'global'
    },
    // Kullanıcı dostu etiket (opsiyonel: "Merkez Şubesi Fontu" gibi)
    label: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = SystemSetting;
