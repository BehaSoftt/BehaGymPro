const { Sequelize } = require('sequelize');

module.exports = {
    up: async (queryInterface) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            console.log('Starting migration: Add tracking fields to BodyMeasurements and Members');

            const memberTable = await queryInterface.describeTable('Members');
            const bodyMeasurementTable = await queryInterface.describeTable('BodyMeasurements');

            // Add targetWeight to Members
            if (!memberTable.targetWeight) {
                await queryInterface.addColumn(
                    'Members',
                    'targetWeight',
                    {
                        type: Sequelize.DECIMAL(5, 2),
                        allowNull: true
                    },
                    { transaction }
                );
            }

            // Add fields to BodyMeasurements
            if (!bodyMeasurementTable.bmi) {
                await queryInterface.addColumn('BodyMeasurements', 'bmi', { type: Sequelize.DECIMAL(5, 2), allowNull: true }, { transaction });
            }

            if (!bodyMeasurementTable.bmr) {
                await queryInterface.addColumn('BodyMeasurements', 'bmr', { type: Sequelize.DECIMAL(7, 2), allowNull: true }, { transaction });
            }

            if (!bodyMeasurementTable.bmiCategory) {
                await queryInterface.addColumn('BodyMeasurements', 'bmiCategory', { type: Sequelize.STRING, allowNull: true }, { transaction });
            }

            if (!bodyMeasurementTable.targetWeight) {
                await queryInterface.addColumn('BodyMeasurements', 'targetWeight', { type: Sequelize.DECIMAL(5, 2), allowNull: true }, { transaction });
            }

            console.log('✓ Added tracking fields');
            await transaction.commit();

        } catch (error) {
            await transaction.rollback();
            console.error('✗ Migration failed:', error.message);
            throw error;
        }
    },

    down: async (queryInterface) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.removeColumn('Members', 'targetWeight', { transaction });
            await queryInterface.removeColumn('BodyMeasurements', 'bmi', { transaction });
            await queryInterface.removeColumn('BodyMeasurements', 'bmr', { transaction });
            await queryInterface.removeColumn('BodyMeasurements', 'bmiCategory', { transaction });
            await queryInterface.removeColumn('BodyMeasurements', 'targetWeight', { transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
