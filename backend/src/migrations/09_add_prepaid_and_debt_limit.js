const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface) => {
        const tables = await queryInterface.showAllTables();
        
        if (!tables.includes('FinancialAccounts') || !tables.includes('FinancialTransactions')) {
            console.log('⏭️  FinancialAccounts veya FinancialTransactions tablosu bulunamadı, migration atlanıyor');
            return;
        }

        // Kolonları kontrol et ve yoksa ekle
        const accountColumns = await queryInterface.describeTable('FinancialAccounts');
        const transactionColumns = await queryInterface.describeTable('FinancialTransactions');

        // FinancialAccounts tablosuna yeni kolonlar ekle
        if (!accountColumns.prepaidBalance) {
            await queryInterface.addColumn('FinancialAccounts', 'prepaidBalance', {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
                comment: 'Ön ödeme bakiyesi'
            });
            console.log('✅ prepaidBalance kolonu eklendi');
        }

        if (!accountColumns.debtLimit) {
            await queryInterface.addColumn('FinancialAccounts', 'debtLimit', {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
                comment: 'Borçlanma limiti'
            });
            console.log('✅ debtLimit kolonu eklendi');
        }

        // FinancialTransactions tablosuna ürün bilgileri ekle
        if (!transactionColumns.productName) {
            await queryInterface.addColumn('FinancialTransactions', 'productName', {
                type: DataTypes.STRING,
                comment: 'Ürün adı'
            });
            console.log('✅ productName kolonu eklendi');
        }

        if (!transactionColumns.quantity) {
            await queryInterface.addColumn('FinancialTransactions', 'quantity', {
                type: DataTypes.INTEGER,
                defaultValue: 1,
                comment: 'Ürün adedi'
            });
            console.log('✅ quantity kolonu eklendi');
        }

        if (!transactionColumns.unitPrice) {
            await queryInterface.addColumn('FinancialTransactions', 'unitPrice', {
                type: DataTypes.DECIMAL(10, 2),
                comment: 'Birim fiyat'
            });
            console.log('✅ unitPrice kolonu eklendi');
        }

        // Category enum'ını güncelle (PostgreSQL için)
        try {
            await queryInterface.sequelize.query(`
                ALTER TYPE "enum_FinancialTransactions_category" 
                ADD VALUE IF NOT EXISTS 'MEMBERSHIP';
            `);
            await queryInterface.sequelize.query(`
                ALTER TYPE "enum_FinancialTransactions_category" 
                ADD VALUE IF NOT EXISTS 'PRODUCT_SALE';
            `);
            await queryInterface.sequelize.query(`
                ALTER TYPE "enum_FinancialTransactions_category" 
                ADD VALUE IF NOT EXISTS 'PRODUCT_RENTAL';
            `);
            await queryInterface.sequelize.query(`
                ALTER TYPE "enum_FinancialTransactions_category" 
                ADD VALUE IF NOT EXISTS 'PREPAID_LOAD';
            `);
            await queryInterface.sequelize.query(`
                ALTER TYPE "enum_FinancialTransactions_category" 
                ADD VALUE IF NOT EXISTS 'SALARY';
            `);
            await queryInterface.sequelize.query(`
                ALTER TYPE "enum_FinancialTransactions_category" 
                ADD VALUE IF NOT EXISTS 'COMMISSION';
            `);
            console.log('✅ Category enum değerleri eklendi');
        } catch (err) {
            console.log('⚠️  Category enum zaten güncel veya tablo henüz oluşmamış:', err.message);
        }

        // PaymentMethod enum'ına COIN ve TICKET ekle
        try {
            await queryInterface.sequelize.query(`
                ALTER TYPE "enum_FinancialTransactions_paymentMethod" 
                ADD VALUE IF NOT EXISTS 'COIN';
            `);
            await queryInterface.sequelize.query(`
                ALTER TYPE "enum_FinancialTransactions_paymentMethod" 
                ADD VALUE IF NOT EXISTS 'TICKET';
            `);
            console.log('✅ PaymentMethod enum değerleri (COIN, TICKET) eklendi');
        } catch (err) {
            console.log('⚠️  PaymentMethod enum zaten güncel:', err.message);
        }

        console.log('✅ Migration 09 tamamlandı: Ön ödeme, borç limiti ve ürün bilgileri');
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('FinancialAccounts', 'prepaidBalance');
        await queryInterface.removeColumn('FinancialAccounts', 'debtLimit');
        await queryInterface.removeColumn('FinancialTransactions', 'productName');
        await queryInterface.removeColumn('FinancialTransactions', 'quantity');
        await queryInterface.removeColumn('FinancialTransactions', 'unitPrice');
        console.log('✅ Ön ödeme ve borç limiti kolonları silindi');
    }
};
