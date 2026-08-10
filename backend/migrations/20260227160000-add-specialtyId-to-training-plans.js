'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('TrainingPlans', 'specialtyId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'SportSpecialties',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('TrainingPlans', 'specialtyId');
  }
};
