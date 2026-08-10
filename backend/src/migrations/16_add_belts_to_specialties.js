const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface) => {
        const tableInfo = await queryInterface.describeTable('SportSpecialties');
        if (!tableInfo.belts) {
            await queryInterface.addColumn('SportSpecialties', 'belts', {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: []
            });
        }
    },
    down: async (queryInterface) => {
        await queryInterface.removeColumn('SportSpecialties', 'belts');
    }
};
