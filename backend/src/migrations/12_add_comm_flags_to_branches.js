module.exports = {
    up: async (queryInterface, Sequelize) => {
        const tableInfo = await queryInterface.describeTable('Branches');

        if (!tableInfo.isWhatsAppEnabled) {
            await queryInterface.addColumn('Branches', 'isWhatsAppEnabled', {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            });
        }

        if (!tableInfo.isEmailEnabled) {
            await queryInterface.addColumn('Branches', 'isEmailEnabled', {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            });
        }
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Branches', 'isWhatsAppEnabled');
        await queryInterface.removeColumn('Branches', 'isEmailEnabled');
    }
};
