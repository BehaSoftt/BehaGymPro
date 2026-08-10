/**
 * Migration: Enhance Attendance table with instructor and lesson type tracking
 * Task: 1.3 - Enhance Attendance table with instructor and lesson type tracking
 * 
 * This migration:
 * - Adds instructorId column with foreign key to InstructorProfiles
 * - Adds lessonType column with CHECK constraint
 * - Makes groupClassId nullable
 * - Creates indexes on instructorId and lessonType
 */

const { Sequelize } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('Starting migration: Enhance Attendance table');
      
      // Check if instructorId column already exists
      const [instructorIdResults] = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'Attendances' AND column_name = 'instructorId'`,
        { transaction }
      );
      
      if (instructorIdResults.length === 0) {
        // Add instructorId column
        await queryInterface.addColumn(
          'Attendances',
          'instructorId',
          {
            type: Sequelize.UUID,
            allowNull: true, // Initially nullable for existing records
            references: {
              model: 'InstructorProfiles',
              key: 'id'
            },
            onDelete: 'SET NULL'
          },
          { transaction }
        );
        
        console.log('✓ Added instructorId column');
      } else {
        console.log('⚠ instructorId column already exists, skipping...');
      }
      
      // Check if lessonType column already exists
      const [lessonTypeResults] = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'Attendances' AND column_name = 'lessonType'`,
        { transaction }
      );
      
      if (lessonTypeResults.length === 0) {
        // Add lessonType column
        await queryInterface.addColumn(
          'Attendances',
          'lessonType',
          {
            type: Sequelize.STRING(50),
            allowNull: true // Initially nullable for existing records
          },
          { transaction }
        );
        
        console.log('✓ Added lessonType column');
      } else {
        console.log('⚠ lessonType column already exists, skipping...');
      }
      
      // Make groupClassId nullable (change existing constraint)
      await queryInterface.changeColumn(
        'Attendances',
        'groupClassId',
        {
          type: Sequelize.UUID,
          allowNull: true
        },
        { transaction }
      );
      
      console.log('✓ Made groupClassId nullable');
      
      // Check if constraint already exists before adding
      const [constraintResults] = await queryInterface.sequelize.query(
        `SELECT constraint_name FROM information_schema.table_constraints 
         WHERE table_name = 'Attendances' AND constraint_name = 'check_attendance_lesson_type'`,
        { transaction }
      );
      
      if (constraintResults.length === 0) {
        // Add CHECK constraint for lessonType
        await queryInterface.sequelize.query(
          'ALTER TABLE "Attendances" ADD CONSTRAINT "check_attendance_lesson_type" CHECK ("lessonType" IN (\'GENERAL\', \'PRIVATE\', \'GROUP\') OR "lessonType" IS NULL)',
          { transaction }
        );
        
        console.log('✓ Added lessonType constraint');
      } else {
        console.log('⚠ lessonType constraint already exists, skipping...');
      }
      
      // Check if indexes already exist before creating
      const [instructorIndexResults] = await queryInterface.sequelize.query(
        `SELECT indexname FROM pg_indexes 
         WHERE tablename = 'Attendances' AND indexname = 'idx_attendance_instructor'`,
        { transaction }
      );
      
      if (instructorIndexResults.length === 0) {
        await queryInterface.addIndex('Attendances', ['instructorId'], {
          name: 'idx_attendance_instructor',
          transaction
        });
        console.log('✓ Created instructorId index');
      } else {
        console.log('⚠ instructorId index already exists, skipping...');
      }
      
      const [lessonTypeIndexResults] = await queryInterface.sequelize.query(
        `SELECT indexname FROM pg_indexes 
         WHERE tablename = 'Attendances' AND indexname = 'idx_attendance_lesson_type'`,
        { transaction }
      );
      
      if (lessonTypeIndexResults.length === 0) {
        await queryInterface.addIndex('Attendances', ['lessonType'], {
          name: 'idx_attendance_lesson_type',
          transaction
        });
        console.log('✓ Created lessonType index');
      } else {
        console.log('⚠ lessonType index already exists, skipping...');
      }
      
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
      console.log('Rolling back: Remove instructor and lesson type columns from Attendance table');
      
      // Remove indexes
      await queryInterface.removeIndex('Attendances', 'idx_attendance_instructor', { transaction });
      await queryInterface.removeIndex('Attendances', 'idx_attendance_lesson_type', { transaction });
      
      // Remove CHECK constraint
      await queryInterface.sequelize.query(
        'ALTER TABLE "Attendances" DROP CONSTRAINT IF EXISTS "check_attendance_lesson_type"',
        { transaction }
      );
      
      // Remove columns
      await queryInterface.removeColumn('Attendances', 'lessonType', { transaction });
      await queryInterface.removeColumn('Attendances', 'instructorId', { transaction });
      
      // Restore groupClassId to NOT NULL
      await queryInterface.changeColumn(
        'Attendances',
        'groupClassId',
        {
          type: Sequelize.UUID,
          allowNull: false
        },
        { transaction }
      );
      
      await transaction.commit();
      console.log('✓ Rollback completed successfully');
      
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Rollback failed:', error.message);
      throw error;
    }
  }
};
