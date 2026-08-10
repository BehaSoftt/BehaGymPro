const { Client } = require('pg');
require('dotenv').config();

const ensureDatabaseExists = async () => {
    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: 'postgres', // Connect to default postgres DB
    });

    try {
        await client.connect();
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`);

        if (res.rowCount === 0) {
            console.log(`${process.env.DB_NAME} veritabanı bulunamadı, oluşturuluyor...`);
            await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
            console.log(`${process.env.DB_NAME} veritabanı başarıyla oluşturuldu.`);
        } else {
            console.log(`${process.env.DB_NAME} veritabanı zaten mevcut.`);
        }
    } catch (err) {
        console.error('Veritabanı kontrol hatası:', err);
    } finally {
        await client.end();
    }
};

module.exports = ensureDatabaseExists;
