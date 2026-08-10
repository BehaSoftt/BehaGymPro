const { sequelize } = require('./src/models');

async function verifyTable() {
    try {
        await sequelize.authenticate();
        console.log('✅ Veritabanı bağlantısı kuruldu.');
        console.log('Bağlanılan DB:', sequelize.config.database);
        console.log('Kullanıcı:', sequelize.config.username);

        // 1. Tablo listesini çek
        const [tables] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);

        console.log('\n--- MEVCUT TABLOLAR ---');
        const tableList = tables.map(t => t.table_name);
        console.log(tableList.join(', '));

        if (tableList.includes('AccessLogs')) {
            console.log('\n🚀 SONUÇ: AccessLogs tablosu veritabanında VAR.');
        } else {
            console.log('\n❌ SONUÇ: AccessLogs tablosu veritabanında YOK.');

            console.log('Zorla oluşturma deneniyor...');
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS "AccessLogs" (
                    "id" UUID PRIMARY KEY,
                    "memberId" UUID NOT NULL,
                    "branchId" UUID NOT NULL,
                    "status" VARCHAR(50),
                    "actionType" VARCHAR(50),
                    "entryType" VARCHAR(50),
                    "failureReason" TEXT,
                    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `);
            console.log('Tablo oluşturma komutu gönderildi.');
        }

        process.exit(0);
    } catch (error) {
        console.error('🔴 HATA:', error);
        process.exit(1);
    }
}

verifyTable();
