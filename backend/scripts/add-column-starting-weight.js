require('dotenv').config();
const { Member } = require('./src/models');
const sequelize = require('./src/config/database');

async function addColumn() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        await queryInterface.addColumn('Members', 'startingWeight', {
            type: require('sequelize').DataTypes.FLOAT,
            allowNull: true
        });
        console.log('Column startingWeight added successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error adding column:', err);
        process.exit(1);
    }
}

addColumn();
