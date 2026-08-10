/**
 * Migration: Add privateLessonRemainingSessions to Members table
 * 
 * This migration adds a column to track remaining private lesson sessions
 */

const { Sequelize } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('Starting migration: Add privateLessonRemainingSessions column');
      
      // Check if column already exists
      const [results] = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'Members' AND column_name = 'privateLessonRemainingSessions'`,
        { transaction }
      );
      
      if (results.length > 0) {
        console.log('⚠ privateLessonRemainingSessions column already exists, skipping...');
        await transaction.commit();
        return;
      }
      
      // Add privateLessonRemainingSessions column
      await queryInterface.addColumn(
        'Members',
        'privateLessonRemainingSessions',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false
        },
        { transaction }
      );
      
      console.log('✓ Added privateLessonRemainingSessions column');
      
      // Initialize remaining sessions from privateLessonHours for existing members
      await queryInterface.sequelize.query(
        'UPDATE "Members" SET "privateLessonRemainingSessions" = "privateLessonHours" WHERE "privateLessonHours" > 0',
        { transaction }
      );
      
      console.log('✓ Initialized remaining sessions from privateLessonHours');
      
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
      console.log('Rolling back: Remove privateLessonRemainingSessions column');
      
      await queryInterface.removeColumn('Members', 'privateLessonRemainingSessions', { transaction });
      
      await transaction.commit();
      console.log('✓ Rollback completed successfully');
      
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Rollback failed:', error.message);
      throw error;
    }
  }
};
