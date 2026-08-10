const { Sequelize } = require('sequelize');

module.exports = {
    up: async (queryInterface) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            console.log('Starting migration: Add detailed fields to BeltExams');

            const tableInfo = await queryInterface.describeTable('BeltExams');

            if (!tableInfo.examName) {
                await queryInterface.addColumn('BeltExams', 'examName', {
                    type: Sequelize.STRING,
                    allowNull: true
                }, { transaction });
            }

            if (!tableInfo.meetingPointName) {
                await queryInterface.addColumn('BeltExams', 'meetingPointName', {
                    type: Sequelize.STRING,
                    allowNull: true
                }, { transaction });
            }

            if (!tableInfo.meetingPointAddress) {
                await queryInterface.addColumn('BeltExams', 'meetingPointAddress', {
                    type: Sequelize.TEXT,
                    allowNull: true
                }, { transaction });
            }

            if (!tableInfo.meetingTime) {
                await queryInterface.addColumn('BeltExams', 'meetingTime', {
                    type: Sequelize.STRING,
                    allowNull: true
                }, { transaction });
            }

            if (!tableInfo.meetingDate) {
                await queryInterface.addColumn('BeltExams', 'meetingDate', {
                    type: Sequelize.DATEONLY,
                    allowNull: true
                }, { transaction });
            }

            if (!tableInfo.description) {
                await queryInterface.addColumn('BeltExams', 'description', {
                    type: Sequelize.TEXT,
                    allowNull: true
                }, { transaction });
            }

            await transaction.commit();
            console.log('✓ BeltExams detailed fields added');
        } catch (error) {
            await transaction.rollback();
            console.error('✗ Migration failed:', error.message);
            throw error;
        }
    },

    down: async (queryInterface) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.removeColumn('BeltExams', 'examName', { transaction });
            await queryInterface.removeColumn('BeltExams', 'meetingPointName', { transaction });
            await queryInterface.removeColumn('BeltExams', 'meetingPointAddress', { transaction });
            await queryInterface.removeColumn('BeltExams', 'meetingTime', { transaction });
            await queryInterface.removeColumn('BeltExams', 'meetingDate', { transaction });
            await queryInterface.removeColumn('BeltExams', 'description', { transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
