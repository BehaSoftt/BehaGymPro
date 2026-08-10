const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

async function up() {
    const queryInterface = sequelize.getQueryInterface();
    const transaction = await sequelize.transaction();
    
    try {
        console.log('Starting migration: Add displayName to InstructorProfiles');
        
        // Check if column already exists
        const [results] = await sequelize.query(
            `SELECT column_name FROM information_schema.columns 
             WHERE table_name = 'InstructorProfiles' AND column_name = 'displayName'`,
            { transaction }
        );
        
        if (results.length > 0) {
            console.log('⚠ displayName column already exists, skipping...');
            await transaction.commit();
            return;
        }
        
        // Add displayName column to InstructorProfiles
        await queryInterface.addColumn('InstructorProfiles', 'displayName', {
            type: DataTypes.STRING,
            allowNull: true
        }, { transaction });
        
        console.log('✓ displayName column added to InstructorProfiles');
        
        // Populate displayName from User.username for existing instructors
        await sequelize.query(`
            UPDATE "InstructorProfiles" ip
            SET "displayName" = u.username
            FROM "Users" u
            WHERE ip."userId" = u.id
            AND ip."displayName" IS NULL
        `, { transaction });
        
        console.log('✓ Existing instructors displayName populated from username');
        
        await transaction.commit();
        console.log('✓ Migration completed successfully');
        
    } catch (err) {
        await transaction.rollback();
        console.error('❌ Migration failed:', err.message);
        throw err;
    }
}

async function down() {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.removeColumn('InstructorProfiles', 'displayName');
    console.log('✅ displayName column removed from InstructorProfiles');
}

module.exports = { up, down };
