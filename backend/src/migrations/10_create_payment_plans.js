const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface) => {
        const tables = await queryInterface.showAllTables();
        
        if (!tables.includes('PaymentPlans')) {
            console.log('📦 PaymentPlans tablosu oluşturuluyor...');
            // PaymentPlans tablosu
            await queryInterface.createTable('PaymentPlans', {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            financialAccountId: { type: DataTypes.UUID, allowNull: false },
            relatedTransactionId: { type: DataTypes.UUID },
            planName: { type: DataTypes.STRING },
            totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
            paidAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
            remainingAmount: { type: DataTypes.DECIMAL(10, 2) },
            installmentCount: { type: DataTypes.INTEGER, allowNull: false },
            installmentAmount: { type: DataTypes.DECIMAL(10, 2) },
            installmentFrequency: { 
                type: DataTypes.ENUM('WEEKLY', 'MONTHLY', 'CUSTOM'), 
                defaultValue: 'MONTHLY' 
            },
            startDate: { type: DataTypes.DATE },
            endDate: { type: DataTypes.DATE },
            status: { 
                type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'CANCELLED', 'OVERDUE'), 
                defaultValue: 'ACTIVE' 
            },
            branchId: { type: DataTypes.UUID, allowNull: false },
            companyId: { type: DataTypes.UUID, allowNull: false },
            notes: { type: DataTypes.TEXT },
            createdAt: { type: DataTypes.DATE, allowNull: false },
            updatedAt: { type: DataTypes.DATE, allowNull: false }
        });

        // Index'ler
        await queryInterface.addIndex('PaymentPlans', ['financialAccountId']);
        await queryInterface.addIndex('PaymentPlans', ['status']);
        await queryInterface.addIndex('PaymentPlans', ['branchId']);
        await queryInterface.addIndex('PaymentPlans', ['companyId']);
        
        console.log('✅ PaymentPlans tablosu oluşturuldu');
        } else {
            console.log('⏭️  PaymentPlans tablosu zaten mevcut');
        }

        if (!tables.includes('PaymentSchedules')) {
            console.log('📦 PaymentSchedules tablosu oluşturuluyor...');
            // PaymentSchedules tablosu
            await queryInterface.createTable('PaymentSchedules', {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            paymentPlanId: { type: DataTypes.UUID, allowNull: false },
            installmentNumber: { type: DataTypes.INTEGER, allowNull: false },
            dueDate: { type: DataTypes.DATE, allowNull: false },
            amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
            paidAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
            paidDate: { type: DataTypes.DATE },
            paymentMethod: { 
                type: DataTypes.ENUM('CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'COIN', 'TICKET', 'OTHER')
            },
            status: { 
                type: DataTypes.ENUM('PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED'), 
                defaultValue: 'PENDING' 
            },
            transactionId: { type: DataTypes.UUID },
            branchId: { type: DataTypes.UUID, allowNull: false },
            companyId: { type: DataTypes.UUID, allowNull: false },
            notes: { type: DataTypes.TEXT },
            createdAt: { type: DataTypes.DATE, allowNull: false },
            updatedAt: { type: DataTypes.DATE, allowNull: false }
        });

        // Index'ler
        await queryInterface.addIndex('PaymentSchedules', ['paymentPlanId']);
        await queryInterface.addIndex('PaymentSchedules', ['status']);
        await queryInterface.addIndex('PaymentSchedules', ['dueDate']);
        await queryInterface.addIndex('PaymentSchedules', ['branchId']);
        await queryInterface.addIndex('PaymentSchedules', ['companyId']);
        
        console.log('✅ PaymentSchedules tablosu oluşturuldu');
        } else {
            console.log('⏭️  PaymentSchedules tablosu zaten mevcut');
        }

        // FinancialTransactions'a COIN ve TICKET ödeme tipi ekle (migration 09'da da var ama tekrar kontrol)
        try {
            await queryInterface.sequelize.query(`
                ALTER TYPE "enum_FinancialTransactions_paymentMethod" 
                ADD VALUE IF NOT EXISTS 'COIN';
            `);
            await queryInterface.sequelize.query(`
                ALTER TYPE "enum_FinancialTransactions_paymentMethod" 
                ADD VALUE IF NOT EXISTS 'TICKET';
            `);
            console.log('✅ PaymentMethod enum değerleri (COIN, TICKET) kontrol edildi');
        } catch (err) {
            console.log('⚠️  PaymentMethod enum zaten güncel:', err.message);
        }

        console.log('✅ Migration 10 tamamlandı: Taksit planları sistemi');
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('PaymentSchedules');
        await queryInterface.dropTable('PaymentPlans');
        console.log('✅ PaymentPlans ve PaymentSchedules tabloları silindi');
    }
};
