'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SessionChangeLogs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      packageId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'PrivateLessonPackages', key: 'id' },
        onDelete: 'CASCADE'
      },
      changeType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      previousValue: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      newValue: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Users', key: 'id' }
      },
      attendanceId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Attendances', key: 'id' },
        onDelete: 'SET NULL'
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
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
    await queryInterface.addIndex('SessionChangeLogs', ['packageId'], {
      name: 'idx_logs_package'
    });
    
    await queryInterface.addIndex('SessionChangeLogs', ['timestamp'], {
      name: 'idx_logs_timestamp'
    });
    
    await queryInterface.addIndex('SessionChangeLogs', ['userId'], {
      name: 'idx_logs_user'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SessionChangeLogs');
  }
};
