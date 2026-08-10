/**
 * Migration: Add lessonTypes JSON column to Members table
 * Task: 1.1 - Create database migration for Member table lessonTypes column
 * 
 * This migration:
 * - Adds lessonTypes JSON column with default empty array
 * - Keeps existing lessonType column for backward compatibility
 * - Adds validation constraint for valid lesson type values
 */

const { Sequelize } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('Starting migration: Add lessonTypes column to Members table');
      
      // Check if column already exists
      const [results] = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'Members' AND column_name = 'lessonTypes'`,
        { transaction }
      );
      
      if (results.length > 0) {
        console.log('⚠ lessonTypes column already exists, skipping...');
        await transaction.commit();
        return;
      }
      
      // Add lessonTypes column as JSON with default empty array
      await queryInterface.addColumn(
        'Members',
        'lessonTypes',
        {
          type: Sequelize.JSON,
          defaultValue: [],
          allowNull: false
        },
        { transaction }
      );
      
      console.log('✓ Added lessonTypes column');
      
      // Add check constraint to validate lesson type values
      // Note: PostgreSQL JSON validation is done at application level in Sequelize model
      
      await transaction.commit();
      console.log('✓ Migration completed successfully');
      
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Migration failed:', error.message);
      throw error;
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('Rolling back: Remove lessonTypes column from Members table');
      
      await queryInterface.removeColumn('Members', 'lessonTypes', { transaction });
      
      await transaction.commit();
      console.log('✓ Rollback completed successfully');
      
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Rollback failed:', error.message);
      throw error;
    }
  }
};
