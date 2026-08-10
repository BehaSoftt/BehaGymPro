const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface) => {
        const tables = await queryInterface.showAllTables();
        
        if (!tables.includes('FinancialAccounts')) {
            console.log('⏭️  FinancialAccounts tablosu bulunamadı, migration atlanıyor');
            return;
        }

        const columns = await queryInterface.describeTable('FinancialAccounts');

        if (!columns.isSystemAccount) {
            await queryInterface.addColumn('FinancialAccounts', 'isSystemAccount', {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                comment: 'Sistem tarafından oluşturulan silinemeyen hesap'
            });
            console.log('✅ isSystemAccount kolonu eklendi');
        } else {
            console.log('⏭️  isSystemAccount kolonu zaten mevcut');
        }

        // entityType enum'ına COMPANY ekle
        try {
            await queryInterface.sequelize.query(`
                ALTER TYPE "enum_FinancialAccounts_entityType" 
                ADD VALUE IF NOT EXISTS 'COMPANY';
            `);
            console.log('✅ EntityType enum değeri (COMPANY) eklendi');
        } catch (err) {
            console.log('⚠️  EntityType enum zaten güncel:', err.message);
        }

        console.log('✅ Migration 11 tamamlandı: Sistem hesabı işareti');
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('FinancialAccounts', 'isSystemAccount');
        console.log('✅ isSystemAccount kolonu silindi');
    }
};
