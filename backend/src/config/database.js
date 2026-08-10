const { Sequelize } = require('sequelize');
const SecurityVault = require('../utils/SecurityVault');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  SecurityVault.get('db_pass'),
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
