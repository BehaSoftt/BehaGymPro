'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('MembershipPackages', 'weeklySessionCount', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Haftada kaç gün ders var (otomatik seans hesaplama için)'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('MembershipPackages', 'weeklySessionCount');
  }
};
