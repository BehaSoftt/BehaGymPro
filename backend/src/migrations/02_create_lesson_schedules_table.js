/**
 * Migration: Create LessonSchedules table
 * Task: 1.2 - Create LessonSchedule table migration
 * 
 * This migration creates the LessonSchedules table for instructor weekly planning
 */

const { Sequelize } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('Starting migration: Create LessonSchedules table');
      
      // Check if table already exists
      const [results] = await queryInterface.sequelize.query(
        `SELECT table_name FROM information_schema.tables 
         WHERE table_name = 'LessonSchedules'`,
        { transaction }
      );
      
      if (results.length > 0) {
        console.log('⚠ LessonSchedules table already exists, skipping...');
        await transaction.commit();
        return;
      }
      
      await queryInterface.createTable('LessonSchedules', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        instructorId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'InstructorProfiles',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        memberId: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'Members',
            key: 'id'
          },
          onDelete: 'SET NULL'
        },
        dayOfWeek: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            min: 0,
            max: 6
          }
        },
        startTime: {
          type: Sequelize.TIME,
          allowNull: false
        },
        endTime: {
          type: Sequelize.TIME,
          allowNull: false
        },
        lessonType: {
          type: Sequelize.STRING(50),
          allowNull: false
        },
        groupClassId: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'GroupClasses',
            key: 'id'
          },
          onDelete: 'SET NULL'
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        branchId: {
          type: Sequelize.UUID,
          allowNull: false
        },
        companyId: {
          type: Sequelize.UUID,
          allowNull: false
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });
      
      console.log('✓ Created LessonSchedules table');
      
      // Add CHECK constraint for dayOfWeek
      await queryInterface.sequelize.query(
        'ALTER TABLE "LessonSchedules" ADD CONSTRAINT "check_day_of_week" CHECK ("dayOfWeek" >= 0 AND "dayOfWeek" <= 6)',
        { transaction }
      );
      
      console.log('✓ Added dayOfWeek constraint');
      
      // Add CHECK constraint for lessonType
      await queryInterface.sequelize.query(
        'ALTER TABLE "LessonSchedules" ADD CONSTRAINT "check_lesson_type" CHECK ("lessonType" IN (\'GENERAL\', \'PRIVATE\', \'GROUP\'))',
        { transaction }
      );
      
      console.log('✓ Added lessonType constraint');
      
      // Add CHECK constraint for time range
      await queryInterface.sequelize.query(
        'ALTER TABLE "LessonSchedules" ADD CONSTRAINT "check_time_range" CHECK ("startTime" < "endTime")',
        { transaction }
      );
      
      console.log('✓ Added time range constraint');
      
      // Create indexes
      await queryInterface.addIndex('LessonSchedules', ['instructorId'], {
        name: 'idx_lesson_schedule_instructor',
        transaction
      });
      
      await queryInterface.addIndex('LessonSchedules', ['memberId'], {
        name: 'idx_lesson_schedule_member',
        transaction
      });
      
      await queryInterface.addIndex('LessonSchedules', ['dayOfWeek'], {
        name: 'idx_lesson_schedule_day',
        transaction
      });
      
      await queryInterface.addIndex('LessonSchedules', ['branchId'], {
        name: 'idx_lesson_schedule_branch',
        transaction
      });
      
      console.log('✓ Created indexes');
      
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
      console.log('Rolling back: Drop LessonSchedules table');
      
      await queryInterface.dropTable('LessonSchedules', { transaction });
      
      await transaction.commit();
      console.log('✓ Rollback completed successfully');
      
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Rollback failed:', error.message);
      throw error;
    }
  }
};
