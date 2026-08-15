const { Sequelize } = require('sequelize');
const SecurityVault = require('../utils/SecurityVault');

const dbName = process.env.DB_NAME || 'behagympro_db';
const dbUser = process.env.DB_USER || 'postgres';
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = parseInt(process.env.DB_PORT || '5432');
const dbPass = process.env.DB_PASS || SecurityVault.get('db_pass') || 'postgres';

const sequelize = new Sequelize(
  dbName,
  dbUser,
  dbPass,
  {
    host: dbHost,
    port: dbPort,
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
