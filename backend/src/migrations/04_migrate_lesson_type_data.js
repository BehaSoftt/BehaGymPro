/**
 * Migration: Convert lessonType to lessonTypes array
 * Task: 1.4 - Create data migration script for lessonType to lessonTypes conversion
 * 
 * This migration:
 * - Converts 'GENERAL' → ['GENERAL']
 * - Converts 'PRIVATE' → ['PRIVATE']
 * - Converts 'GROUP' → ['GROUP']
 * - Converts 'MIXED' → ['GENERAL', 'PRIVATE', 'GROUP']
 * - Implements transaction with rollback on failure
 * - Adds comprehensive logging for audit trail
 */

const { Sequelize } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('Starting data migration: Convert lessonType to lessonTypes array');
      console.log('='.repeat(70));
      
      // Get all members with their current lessonType
      const [members] = await queryInterface.sequelize.query(
        'SELECT id, "lessonType", "fullName" FROM "Members" WHERE "lessonType" IS NOT NULL',
        { transaction }
      );
      
      console.log(`Found ${members.length} members to migrate`);
      
      if (members.length === 0) {
        console.log('No members to migrate');
        await transaction.commit();
        return;
      }
      
      // Count by lesson type for reporting
      const typeCounts = {
        GENERAL: 0,
        PRIVATE: 0,
        GROUP: 0,
        MIXED: 0,
        OTHER: 0
      };
      
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      
      // Process each member
      for (const member of members) {
        try {
          let lessonTypesArray;
          
          switch (member.lessonType) {
            case 'GENERAL':
              lessonTypesArray = ['GENERAL'];
              typeCounts.GENERAL++;
              break;
            case 'PRIVATE':
              lessonTypesArray = ['PRIVATE'];
              typeCounts.PRIVATE++;
              break;
            case 'GROUP':
              lessonTypesArray = ['GROUP'];
              typeCounts.GROUP++;
              break;
            case 'MIXED':
              lessonTypesArray = ['GENERAL', 'PRIVATE', 'GROUP'];
              typeCounts.MIXED++;
              break;
            default:
              // Handle unexpected values - default to GENERAL
              console.warn(`⚠ Unexpected lessonType '${member.lessonType}' for member ${member.id} (${member.fullName}), defaulting to GENERAL`);
              lessonTypesArray = ['GENERAL'];
              typeCounts.OTHER++;
          }
          
          // Update the member with lessonTypes array
          await queryInterface.sequelize.query(
            'UPDATE "Members" SET "lessonTypes" = :lessonTypes WHERE id = :id',
            {
              replacements: {
                lessonTypes: JSON.stringify(lessonTypesArray),
                id: member.id
              },
              transaction
            }
          );
          
          successCount++;
          
          // Log every 100 records
          if (successCount % 100 === 0) {
            console.log(`  Processed ${successCount}/${members.length} members...`);
          }
          
        } catch (error) {
          errorCount++;
          const errorDetail = {
            memberId: member.id,
            memberName: member.fullName,
            lessonType: member.lessonType,
            error: error.message
          };
          errors.push(errorDetail);
          console.error(`✗ Error migrating member ${member.id} (${member.fullName}):`, error.message);
        }
      }
      
      console.log('='.repeat(70));
      console.log('Migration Summary:');
      console.log(`  Total members: ${members.length}`);
      console.log(`  Successfully migrated: ${successCount}`);
      console.log(`  Errors: ${errorCount}`);
      console.log('');
      console.log('Conversion breakdown:');
      console.log(`  GENERAL → ['GENERAL']: ${typeCounts.GENERAL}`);
      console.log(`  PRIVATE → ['PRIVATE']: ${typeCounts.PRIVATE}`);
      console.log(`  GROUP → ['GROUP']: ${typeCounts.GROUP}`);
      console.log(`  MIXED → ['GENERAL', 'PRIVATE', 'GROUP']: ${typeCounts.MIXED}`);
      if (typeCounts.OTHER > 0) {
        console.log(`  OTHER → ['GENERAL'] (default): ${typeCounts.OTHER}`);
      }
      console.log('='.repeat(70));
      
      if (errorCount > 0) {
        console.error('Migration completed with errors. Details:');
        errors.forEach((err, idx) => {
          console.error(`  ${idx + 1}. Member ${err.memberId} (${err.memberName}): ${err.error}`);
        });
        throw new Error(`Migration failed for ${errorCount} members. Rolling back...`);
      }
      
      await transaction.commit();
      console.log('✓ Data migration completed successfully');
      
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Data migration failed:', error.message);
      console.error('All changes have been rolled back');
      throw error;
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('Rolling back: Restore lessonType from lessonTypes array');
      console.log('='.repeat(70));
      
      // Get all members with lessonTypes
      const [members] = await queryInterface.sequelize.query(
        'SELECT id, "lessonTypes", "fullName" FROM "Members" WHERE "lessonTypes" IS NOT NULL',
        { transaction }
      );
      
      console.log(`Found ${members.length} members to rollback`);
      
      let successCount = 0;
      
      for (const member of members) {
        try {
          let lessonTypesArray;
          
          // Parse JSON if it's a string
          if (typeof member.lessonTypes === 'string') {
            lessonTypesArray = JSON.parse(member.lessonTypes);
          } else {
            lessonTypesArray = member.lessonTypes;
          }
          
          let lessonType;
          
          // Convert back to single lessonType
          if (lessonTypesArray.length === 3 && 
              lessonTypesArray.includes('GENERAL') && 
              lessonTypesArray.includes('PRIVATE') && 
              lessonTypesArray.includes('GROUP')) {
            lessonType = 'MIXED';
          } else if (lessonTypesArray.length > 0) {
            lessonType = lessonTypesArray[0]; // Take first element
          } else {
            lessonType = 'GENERAL'; // Default
          }
          
          // Update the member
          await queryInterface.sequelize.query(
            'UPDATE "Members" SET "lessonType" = :lessonType WHERE id = :id',
            {
              replacements: {
                lessonType: lessonType,
                id: member.id
              },
              transaction
            }
          );
          
          successCount++;
          
        } catch (error) {
          console.error(`✗ Error rolling back member ${member.id}:`, error.message);
        }
      }
      
      console.log(`✓ Rolled back ${successCount}/${members.length} members`);
      console.log('='.repeat(70));
      
      await transaction.commit();
      console.log('✓ Rollback completed successfully');
      
    } catch (error) {
      await transaction.rollback();
      console.error('✗ Rollback failed:', error.message);
      throw error;
    }
  }
};
