'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PrivateLessonPackages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      memberId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Members', key: 'id' },
        onDelete: 'CASCADE'
      },
      specialtyId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'SportSpecialties', key: 'id' }
      },
      instructorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'InstructorProfiles', key: 'id' }
      },
      sessionCount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      remainingSessions: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      expiryDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      days: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'ACTIVE'
      },
      isArchived: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      branchId: {
        type: Sequelize.UUID,
        references: { model: 'Branches', key: 'id' }
      },
      companyId: {
        type: Sequelize.UUID,
        references: { model: 'Companies', key: 'id' }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('PrivateLessonPackages', ['memberId'], {
      name: 'idx_packages_member'
    });
    
    await queryInterface.addIndex('PrivateLessonPackages', ['instructorId'], {
      name: 'idx_packages_instructor'
    });
    
    await queryInterface.addIndex('PrivateLessonPackages', ['specialtyId'], {
      name: 'idx_packages_specialty'
    });
    
    await queryInterface.addIndex('PrivateLessonPackages', ['status'], {
      name: 'idx_packages_status'
    });
    
    await queryInterface.addIndex('PrivateLessonPackages', ['isArchived'], {
      name: 'idx_packages_archived'
    });
    
    await queryInterface.addIndex('PrivateLessonPackages', ['startDate', 'expiryDate'], {
      name: 'idx_packages_dates'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PrivateLessonPackages');
  }
};
