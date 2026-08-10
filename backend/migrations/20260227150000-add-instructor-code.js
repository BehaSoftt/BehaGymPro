'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('InstructorProfiles', 'instructorCode', {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('InstructorProfiles', 'instructorCode');
  }
};
