/**
 * Migration Runner Script
 * 
 * This script runs all migrations in order for the lesson system improvement
 */

require('dotenv').config();
const sequelize = require('../config/database');
const path = require('path');

const migrations = [
  '01_add_lesson_types_to_members',
  '02_create_lesson_schedules_table',
  '03_enhance_attendance_table',
  '04_migrate_lesson_type_data',
  '05_add_remaining_sessions_to_members',
  '06_add_displayname_to_instructors',
  '07_add_specialty_category_to_lesson_schedules',
  '08_create_financial_accounts',
  '09_add_prepaid_and_debt_limit',
  '10_create_payment_plans',
  '11_add_system_account_flag',
  '12_add_comm_flags_to_branches',
  '13_add_fitness_goals_to_members',
  '14_add_tracking_fields',
  '15_add_belt_system',
  '16_add_belts_to_specialties',
  '17_add_detailed_fields_to_belt_exams'
];

async function runMigrations() {
  try {
    console.log('BehaGym Pro - Lesson System Improvement Migrations');
    console.log('='.repeat(70));
    console.log('');

    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    console.log('');

    // Run each migration
    for (const migrationName of migrations) {
      console.log(`Running migration: ${migrationName}`);
      console.log('-'.repeat(70));

      const migration = require(`./${migrationName}`);
      await migration.up(sequelize.getQueryInterface());

      console.log('');
    }

    console.log('='.repeat(70));
    console.log('✓ All migrations completed successfully');
    console.log('');

    process.exit(0);

  } catch (error) {
    console.error('');
    console.error('='.repeat(70));
    console.error('✗ Migration failed:', error.message);
    console.error('');
    console.error('Stack trace:');
    console.error(error.stack);
    console.error('='.repeat(70));

    process.exit(1);
  }
}

async function rollbackMigrations() {
  try {
    console.log('BehaGym Pro - Rollback Lesson System Migrations');
    console.log('='.repeat(70));
    console.log('');

    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    console.log('');

    // Rollback each migration in reverse order
    for (const migrationName of migrations.reverse()) {
      console.log(`Rolling back migration: ${migrationName}`);
      console.log('-'.repeat(70));

      const migration = require(`./${migrationName}`);
      await migration.down(sequelize.getQueryInterface());

      console.log('');
    }

    console.log('='.repeat(70));
    console.log('✓ All migrations rolled back successfully');
    console.log('');

    process.exit(0);

  } catch (error) {
    console.error('');
    console.error('='.repeat(70));
    console.error('✗ Rollback failed:', error.message);
    console.error('');
    console.error('Stack trace:');
    console.error(error.stack);
    console.error('='.repeat(70));

    process.exit(1);
  }
}

// Check command line argument
const command = process.argv[2];

if (command === 'up') {
  runMigrations();
} else if (command === 'down') {
  rollbackMigrations();
} else {
  console.log('Usage:');
  console.log('  node runMigrations.js up    - Run all migrations');
  console.log('  node runMigrations.js down  - Rollback all migrations');
  process.exit(1);
}
