'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Attendances', 'packageId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'PrivateLessonPackages', key: 'id' },
      onDelete: 'SET NULL'
    });
    
    await queryInterface.addIndex('Attendances', ['packageId'], {
      name: 'idx_attendance_package'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Attendances', 'idx_attendance_package');
    await queryInterface.removeColumn('Attendances', 'packageId');
  }
};
