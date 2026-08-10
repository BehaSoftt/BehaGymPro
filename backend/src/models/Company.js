const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
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
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    hooks: {
        afterCreate: async (company, options) => {
            // Her şirket için otomatik "Cari Kasa" hesabı oluştur
            try {
                // Şirketin ilk şubesini bul (headquarters)
                const Branch = require('./Branch');
                const branch = await Branch.findOne({ 
                    where: { companyId: company.id, isHeadquarters: true } 
                });

                if (branch) {
                    const FinancialAccountService = require('../services/finance/FinancialAccountService');
                    await FinancialAccountService.createCompanyCashAccount(company, branch.id);
                }
            } catch (err) {
                console.error('Cari Kasa oluşturma hatası:', err.message);
            }
        }
    }
});

module.exports = Company;
