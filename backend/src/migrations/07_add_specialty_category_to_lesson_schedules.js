/**
 * Migration: Add specialty, category and capacity to LessonSchedules
 * 
 * Adds specialtyId, categoryId and capacity columns to support branch-based lessons
 */

const { Sequelize } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('Starting migration: Add specialty, category and capacity to LessonSchedules');
      
      // Check if columns already exist
      const [columns] = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'LessonSchedules' AND column_name IN ('specialtyId', 'categoryId', 'capacity')`,
        { transaction }
      );
      
      const existingColumns = columns.map(c => c.column_name);
      
      // Add specialtyId if not exists
      if (!existingColumns.includes('specialtyId')) {
        await queryInterface.addColumn('LessonSchedules', 'specialtyId', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'SportSpecialties',
            key: 'id'
          },
          onDelete: 'SET NULL'
        }, { transaction });
        console.log('✓ Added specialtyId column');
      } else {
        console.log('⚠ specialtyId column already exists, skipping...');
      }
      
      // Add categoryId if not exists
      if (!existingColumns.includes('categoryId')) {
        await queryInterface.addColumn('LessonSchedules', 'categoryId', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'ExerciseCategories',
            key: 'id'
          },
          onDelete: 'SET NULL'
        }, { transaction });
        console.log('✓ Added categoryId column');
      } else {
        console.log('⚠ categoryId column already exists, skipping...');
      }
      
      // Add capacity if not exists
      if (!existingColumns.includes('capacity')) {
        await queryInterface.addColumn('LessonSchedules', 'capacity', {
          type: Sequelize.INTEGER,
          allowNull: true
        }, { transaction });
        console.log('✓ Added capacity column');
      } else {
        console.log('⚠ capacity column already exists, skipping...');
      }
      
      // Create indexes
      if (!existingColumns.includes('specialtyId')) {
        await queryInterface.addIndex('LessonSchedules', ['specialtyId'], {
          name: 'idx_lesson_schedule_specialty',
          transaction
        });
        console.log('✓ Created specialtyId index');
      }
      
      if (!existingColumns.includes('categoryId')) {
        await queryInterface.addIndex('LessonSchedules', ['categoryId'], {
          name: 'idx_lesson_schedule_category',
          transaction
        });
        console.log('✓ Created categoryId index');
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
      console.log('Rolling back: Remove specialty, category and capacity from LessonSchedules');
      
      await queryInterface.removeColumn('LessonSchedules', 'specialtyId', { transaction });
      await queryInterface.removeColumn('LessonSchedules', 'categoryId', { transaction });
      await queryInterface.removeColumn('LessonSchedules', 'capacity', { transaction });
      
      await transaction.commit();
      console.log('✓ Rollback completed successfully');
      
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Rollback failed:', error.message);
      throw error;
    }
  }
};
