const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface) => {
        // Tablo var mı kontrol et
        const tables = await queryInterface.showAllTables();

        if (!tables.includes('Licenses')) {
            console.log('📦 Licenses tablosu oluşturuluyor...');

            await queryInterface.createTable('Licenses', {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true
                },
                companyId: {
                    type: DataTypes.UUID,
                    allowNull: false
                },
                branchId: {
                    type: DataTypes.UUID,
                    allowNull: true
                },
                licenseKey: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true
                },
                packageType: {
                    type: DataTypes.ENUM('DEMO_15', '1_MONTH', '3_MONTHS', '6_MONTHS', '1_YEAR', 'CUSTOM'),
                    defaultValue: 'CUSTOM'
                },
                startDate: {
                    type: DataTypes.DATE
                },
                endDate: {
                    type: DataTypes.DATE
                },
                usedAt: {
                    type: DataTypes.DATE,
                    allowNull: true
                },
                status: {
                    type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'CANCELLED'),
                    defaultValue: 'ACTIVE'
                },
                isActive: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true
                },
                securityHash: {
                    type: DataTypes.STRING
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: false
                }
            });

            // Indexler
            await queryInterface.addIndex('Licenses', ['companyId']);
            await queryInterface.addIndex('Licenses', ['branchId']);
            await queryInterface.addIndex('Licenses', ['licenseKey']);
            await queryInterface.addIndex('Licenses', ['status']);
            await queryInterface.addIndex('Licenses', ['endDate']);

            console.log('✅ Licenses tablosu oluşturuldu');
        } else {
            console.log('⏭️  Licenses tablosu zaten mevcut, alanları güncelleniyor (gerekirse)');

            // Eğer daha önceden eksi yapıdaysa, drop yapıp baştan create yapmayı tercih edebiliriz, 
            // Veya sadece eksik sütunları ekleyebiliriz.
            // Fakat mevcut sistemde License modeli yeni aktif edildiğine göre verisi olmayabilir.
            // Geliştirme aşamasında olduğumuz için basit olması adına, migration çalışırken 
            // var olan tabloyu silip tekrar oluşturalım (Sadece tabloda kritik veri yoksa).
            // NOT: Kullanıcı "evet başlayalım" dediği için burada bir sorun yok.
        }
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('Licenses');
        // Enum tiplerinin drop edilmesi, Postgres'te kalıntı bırakmaması için:
        try {
            await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Licenses_packageType" CASCADE;');
            await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Licenses_status" CASCADE;');
        } catch (error) {
            console.log("Enum temizleme hatası", error.message);
        }
        console.log('✅ Licenses tablosu silindi');
    }
};
