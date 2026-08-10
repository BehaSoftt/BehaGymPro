'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('NutritionPlans', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      memberId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'Members',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      mealCount: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      foodCategories: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      avoidFoods: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sleepDuration: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true
      },
      fluidIntake: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true
      },
      additionalNotes: {
        type: Sequelize.TEXT,
        allowNull: true
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
    });

    // Add index on memberId for performance
    await queryInterface.addIndex('NutritionPlans', ['memberId'], {
      name: 'idx_nutrition_plans_member'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('NutritionPlans');
  }
};
