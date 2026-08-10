const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface) => {
        // Tablo var mı kontrol et
        const tables = await queryInterface.showAllTables();
        
        if (!tables.includes('FinancialAccounts')) {
            console.log('📦 FinancialAccounts tablosu oluşturuluyor...');
            // FinancialAccount tablosu oluştur
            await queryInterface.createTable('FinancialAccounts', {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            entityType: { 
                type: DataTypes.ENUM('MEMBER', 'USER', 'INSTRUCTOR'), 
                allowNull: false,
                comment: 'Cari hesabın bağlı olduğu varlık tipi'
            },
            entityId: { 
                type: DataTypes.UUID, 
                allowNull: false,
                comment: 'Member, User veya InstructorProfile ID'
            },
            accountName: { 
                type: DataTypes.STRING, 
                allowNull: false,
                comment: 'Cari hesap adı'
            },
            accountCode: { 
                type: DataTypes.STRING, 
                unique: true,
                comment: 'Benzersiz cari hesap kodu'
            },
            balance: { 
                type: DataTypes.DECIMAL(10, 2), 
                defaultValue: 0,
                comment: 'Güncel bakiye'
            },
            totalDebit: { 
                type: DataTypes.DECIMAL(10, 2), 
                defaultValue: 0,
                comment: 'Toplam borç'
            },
            totalCredit: { 
                type: DataTypes.DECIMAL(10, 2), 
                defaultValue: 0,
                comment: 'Toplam alacak'
            },
            branchId: { type: DataTypes.UUID, allowNull: false },
            companyId: { type: DataTypes.UUID, allowNull: false },
            isActive: { 
                type: DataTypes.BOOLEAN, 
                defaultValue: true,
                comment: 'Cari hesap aktif mi?'
            },
            notes: { 
                type: DataTypes.TEXT,
                comment: 'Cari hesap notları'
            },
            createdAt: { type: DataTypes.DATE, allowNull: false },
            updatedAt: { type: DataTypes.DATE, allowNull: false }
        });

            // Index'ler
            await queryInterface.addIndex('FinancialAccounts', ['entityType', 'entityId'], {
                unique: true,
                name: 'financial_accounts_entity_unique'
            });
            await queryInterface.addIndex('FinancialAccounts', ['accountCode'], {
                unique: true,
                name: 'financial_accounts_code_unique'
            });
            await queryInterface.addIndex('FinancialAccounts', ['branchId']);
            await queryInterface.addIndex('FinancialAccounts', ['companyId']);
            await queryInterface.addIndex('FinancialAccounts', ['isActive']);
            
            console.log('✅ FinancialAccounts tablosu oluşturuldu');
        } else {
            console.log('⏭️  FinancialAccounts tablosu zaten mevcut');
        }

        if (!tables.includes('FinancialTransactions')) {
            console.log('📦 FinancialTransactions tablosu oluşturuluyor...');
            // FinancialTransaction tablosu oluştur
            await queryInterface.createTable('FinancialTransactions', {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            financialAccountId: { 
                type: DataTypes.UUID, 
                allowNull: false,
                comment: 'İlişkili cari hesap ID'
            },
            transactionType: { 
                type: DataTypes.ENUM('DEBIT', 'CREDIT'), 
                allowNull: false,
                comment: 'DEBIT: Borç, CREDIT: Alacak'
            },
            amount: { 
                type: DataTypes.DECIMAL(10, 2), 
                allowNull: false,
                comment: 'İşlem tutarı'
            },
            description: { 
                type: DataTypes.TEXT,
                comment: 'İşlem açıklaması'
            },
            category: { 
                type: DataTypes.STRING,
                comment: 'İşlem kategorisi'
            },
            paymentMethod: { 
                type: DataTypes.ENUM('CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'OTHER'), 
                defaultValue: 'CASH',
                comment: 'Ödeme yöntemi'
            },
            transactionDate: { 
                type: DataTypes.DATE, 
                defaultValue: DataTypes.NOW,
                comment: 'İşlem tarihi'
            },
            branchId: { type: DataTypes.UUID, allowNull: false },
            companyId: { type: DataTypes.UUID, allowNull: false },
            createdBy: { 
                type: DataTypes.UUID,
                comment: 'İşlemi oluşturan kullanıcı ID'
            },
            createdAt: { type: DataTypes.DATE, allowNull: false },
            updatedAt: { type: DataTypes.DATE, allowNull: false }
        });

            // Index'ler
            await queryInterface.addIndex('FinancialTransactions', ['financialAccountId']);
            await queryInterface.addIndex('FinancialTransactions', ['transactionType']);
            await queryInterface.addIndex('FinancialTransactions', ['transactionDate']);
            await queryInterface.addIndex('FinancialTransactions', ['branchId']);
            await queryInterface.addIndex('FinancialTransactions', ['companyId']);
            
            console.log('✅ FinancialTransactions tablosu oluşturuldu');
        } else {
            console.log('⏭️  FinancialTransactions tablosu zaten mevcut');
        }
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('FinancialTransactions');
        await queryInterface.dropTable('FinancialAccounts');
        console.log('✅ FinancialAccounts ve FinancialTransactions tabloları silindi');
    }
};
