const { Sequelize } = require('sequelize');

// This tells it to save the database locally in a file called database.sqlite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false // Keeps your terminal clean
});

module.exports = sequelize;