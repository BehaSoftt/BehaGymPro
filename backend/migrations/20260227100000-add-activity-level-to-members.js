'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Members', 'activityLevel', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'sedentary',
      comment: 'Physical activity level: sedentary, light, moderate, very_active, extra_active'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Members', 'activityLevel');
  }
};
