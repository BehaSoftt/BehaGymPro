const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'beha',
  database: 'behanexus_db',
});

const cleanup = async () => {
    const client = await pool.connect();
    try {
        console.log('[Cleanup] Starting cross-project database purge...');
        await client.query(`
            TRUNCATE TABLE 
                shipments, 
                order_status_history, 
                orders, 
                departments, 
                branches, 
                companies, 
                customers, 
                mail_history, 
                whatsapp_history 
            RESTART IDENTITY CASCADE;
        `);
        console.log('[Cleanup] Database purged successfully. ✅');
    } catch (err) {
        console.error('[Cleanup] Error during purge:', err);
    } finally {
        client.release();
        process.exit(0);
    }
};

cleanup();
