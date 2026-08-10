const { Sequelize } = require('sequelize');

module.exports = {
    up: async (queryInterface) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            console.log('Starting migration: Add Belt Exam System');

            // 1. Add fields to Members table
            const memberTableInfo = await queryInterface.describeTable('Members');

            if (!memberTableInfo.currentBelt) {
                await queryInterface.addColumn('Members', 'currentBelt', {
                    type: Sequelize.STRING,
                    allowNull: true
                }, { transaction });
            }

            if (!memberTableInfo.beltBranchId) {
                await queryInterface.addColumn('Members', 'beltBranchId', {
                    type: Sequelize.UUID,
                    allowNull: true,
                    references: {
                        model: 'SportSpecialties',
                        key: 'id'
                    }
                }, { transaction });
            }

            if (!memberTableInfo.lastBeltDate) {
                await queryInterface.addColumn('Members', 'lastBeltDate', {
                    type: Sequelize.DATEONLY,
                    allowNull: true
                }, { transaction });
            }

            // 2. Create BeltExams table
            const tables = await queryInterface.showAllTables();
            if (!tables.includes('BeltExams')) {
                await queryInterface.createTable('BeltExams', {
                    id: {
                        type: Sequelize.UUID,
                        defaultValue: Sequelize.UUIDV4,
                        primaryKey: true
                    },
                    branchId: {
                        type: Sequelize.UUID,
                        allowNull: false,
                        references: {
                            model: 'SportSpecialties',
                            key: 'id'
                        }
                    },
                    examDate: {
                        type: Sequelize.DATEONLY,
                        allowNull: false
                    },
                    examTime: {
                        type: Sequelize.STRING,
                        allowNull: true
                    },
                    locationName: {
                        type: Sequelize.STRING,
                        allowNull: true
                    },
                    locationAddress: {
                        type: Sequelize.TEXT,
                        allowNull: true
                    },
                    fee: {
                        type: Sequelize.DECIMAL(10, 2),
                        defaultValue: 0
                    },
                    instructorId: {
                        type: Sequelize.UUID,
                        allowNull: true,
                        references: {
                            model: 'InstructorProfiles',
                            key: 'id'
                        }
                    },
                    companyId: {
                        type: Sequelize.UUID,
                        allowNull: true
                    },
                    branchId_ref: {
                        type: Sequelize.UUID,
                        allowNull: true,
                        field: 'gymBranchId'
                    },
                    status: {
                        type: Sequelize.STRING,
                        defaultValue: 'PENDING'
                    },
                    createdAt: {
                        type: Sequelize.DATE,
                        allowNull: false
                    },
                    updatedAt: {
                        type: Sequelize.DATE,
                        allowNull: false
                    }
                }, { transaction });
            }

            // 3. Create BeltExamParticipants table
            if (!tables.includes('BeltExamParticipants')) {
                await queryInterface.createTable('BeltExamParticipants', {
                    id: {
                        type: Sequelize.UUID,
                        defaultValue: Sequelize.UUIDV4,
                        primaryKey: true
                    },
                    examId: {
                        type: Sequelize.UUID,
                        allowNull: false,
                        references: {
                            model: 'BeltExams',
                            key: 'id'
                        },
                        onDelete: 'CASCADE'
                    },
                    memberId: {
                        type: Sequelize.UUID,
                        allowNull: false,
                        references: {
                            model: 'Members',
                            key: 'id'
                        },
                        onDelete: 'CASCADE'
                    },
                    fromBelt: {
                        type: Sequelize.STRING,
                        allowNull: true
                    },
                    toBelt: {
                        type: Sequelize.STRING,
                        allowNull: true
                    },
                    attemptNumber: {
                        type: Sequelize.INTEGER,
                        defaultValue: 1
                    },
                    status: {
                        type: Sequelize.STRING,
                        defaultValue: 'PENDING'
                    },
                    feePaid: {
                        type: Sequelize.BOOLEAN,
                        defaultValue: false
                    },
                    createdAt: {
                        type: Sequelize.DATE,
                        allowNull: false
                    },
                    updatedAt: {
                        type: Sequelize.DATE,
                        allowNull: false
                    }
                }, { transaction });
            }

            console.log('✓ Belt Exam System tables and fields created');
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
            await queryInterface.dropTable('BeltExamParticipants', { transaction });
            await queryInterface.dropTable('BeltExams', { transaction });
            await queryInterface.removeColumn('Members', 'currentBelt', { transaction });
            await queryInterface.removeColumn('Members', 'beltBranchId', { transaction });
            await queryInterface.removeColumn('Members', 'lastBeltDate', { transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
