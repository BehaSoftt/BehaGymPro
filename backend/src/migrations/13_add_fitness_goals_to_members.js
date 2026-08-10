const { Sequelize } = require('sequelize');

module.exports = {
    up: async (queryInterface) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            console.log('Starting migration: Add fitnessGoals column to Members table');

            const [results] = await queryInterface.sequelize.query(
                `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'Members' AND column_name = 'fitnessGoals'`,
                { transaction }
            );

            if (results.length > 0) {
                console.log('⚠ fitnessGoals column already exists, skipping...');
                await transaction.commit();
                return;
            }

            await queryInterface.addColumn(
                'Members',
                'fitnessGoals',
                {
                    type: Sequelize.JSONB,
                    defaultValue: [],
                    allowNull: false
                },
                { transaction }
            );

            console.log('✓ Added fitnessGoals column');
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
            await queryInterface.removeColumn('Members', 'fitnessGoals', { transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
