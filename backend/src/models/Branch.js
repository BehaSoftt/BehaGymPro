const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Branch = sequelize.define('Branch', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    companyId: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    address: { type: DataTypes.TEXT },
    city: { type: DataTypes.STRING },
    district: { type: DataTypes.STRING },
    taxOffice: { type: DataTypes.STRING },
    taxNumber: { type: DataTypes.STRING },
    authorizedPerson: { type: DataTypes.STRING },
    logo: { type: DataTypes.STRING },
    isHeadquarters: { type: DataTypes.BOOLEAN, defaultValue: false },
    allowCrossBranchAccess: { type: DataTypes.BOOLEAN, defaultValue: true }, // Şirket içi şubeler arası erişim
    closedDay: { type: DataTypes.INTEGER }, // 0: Pazartesi, 1: Salı...
    openingTime: { type: DataTypes.TIME, defaultValue: '06:00' },
    closingTime: { type: DataTypes.TIME, defaultValue: '23:00' },
    notificationSystemMode: {
        type: DataTypes.STRING,
        defaultValue: 'BOTH'
    },
    isWhatsAppEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isEmailEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isBirthdayMessageEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    whatsappHeaderCompanyId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    whatsappHeaderBranchId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    birthdayMessageTemplate: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // SMTP Settings
    smtpHost: { type: DataTypes.STRING, allowNull: true },
    smtpPort: { type: DataTypes.INTEGER, allowNull: true },
    smtpUser: { type: DataTypes.STRING, allowNull: true },
    smtpPass: { type: DataTypes.STRING, allowNull: true },
    smtpSecure: { type: DataTypes.BOOLEAN, defaultValue: true },
    smtpFromEmail: { type: DataTypes.STRING, allowNull: true },
    // SMS Settings
    smsProvider: { type: DataTypes.STRING, defaultValue: 'NETGSM' },
    smsUser: { type: DataTypes.STRING, allowNull: true },
    smsPass: { type: DataTypes.STRING, allowNull: true },
    smsHeader: { type: DataTypes.STRING, allowNull: true },
    // Telegram Settings
    isTelegramEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    telegramBotToken: { type: DataTypes.STRING, allowNull: true },
    telegramChatId: { type: DataTypes.STRING, allowNull: true }
});

module.exports = Branch;
