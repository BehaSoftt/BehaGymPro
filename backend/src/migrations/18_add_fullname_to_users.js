'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            // Create users table columns if it doesn't exist
            const tableDescription = await queryInterface.describeTable('Users');

            if (!tableDescription.fullName) {
                await queryInterface.addColumn('Users', 'fullName', {
                    type: Sequelize.STRING,
                    allowNull: true,
                });
                console.log('✅ fullName kolonu Users tablosuna eklendi');
            }
        } catch (err) {
            console.error('❌ fullName kolonu eklenirken hata oluştu:', err);
        }
    },

    down: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.removeColumn('Users', 'fullName');
        } catch (err) {
            console.log('Down failed but continuing', err.message);
        }
    }
};
