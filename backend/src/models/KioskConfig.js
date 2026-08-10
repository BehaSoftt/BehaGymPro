const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KioskConfig = sequelize.define('KioskConfig', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  kioskMode: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  serverIP: {
    type: DataTypes.STRING,
    allowNull: true
  },
  autoLogin: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  autoRestart: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  showVirtualKeyboard: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  terminalType: {
    type: DataTypes.ENUM('MEMBER_ENTRY', 'PROGRESS_TRACKING', 'TV_DISPLAY', 'ADMIN_KIOSK'),
    defaultValue: 'MEMBER_ENTRY'
  },
  refreshInterval: {
    type: DataTypes.INTEGER,
    defaultValue: 3600 // seconds
  },
  macAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deviceModel: {
    type: DataTypes.STRING,
    allowNull: true
  },
  appVersion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastSync: {
    type: DataTypes.DATE,
    allowNull: true
  },
  heartbeatAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  terminalUsername: {
    type: DataTypes.STRING,
    allowNull: true
  },
  terminalPassword: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'kiosk_configs',
  timestamps: true
});

module.exports = KioskConfig;
