const { Client } = require('pg');
require('dotenv').config();

const ensureDatabaseExists = async () => {
    const dbHost = process.env.DB_HOST || '127.0.0.1';
    const dbUser = process.env.DB_USER || 'postgres';
    const dbPass = process.env.DB_PASS || 'postgres';
    const dbName = process.env.DB_NAME || 'behagympro_db';
    const dbPort = parseInt(process.env.DB_PORT || '5432');

    const client = new Client({
        host: dbHost,
        user: dbUser,
        password: dbPass,
        port: dbPort,
        database: 'postgres', // Connect to default postgres DB
    });

    try {
        await client.connect();
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);

        if (res.rowCount === 0) {
            console.log(`[BOOT] ${dbName} veritabanı bulunamadı, oluşturuluyor...`);
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`[BOOT] ${dbName} veritabanı başarıyla oluşturuldu.`);
        } else {
            console.log(`[BOOT] ${dbName} veritabanı hazır.`);
        }
    } catch (err) {
        console.error('[BOOT] Veritabanı otomatik kontrol uyarısı:', err.message);
    } finally {
        try { await client.end(); } catch (e) {}
    }
};

module.exports = ensureDatabaseExists;
