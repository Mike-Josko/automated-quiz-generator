const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Quiz = sequelize.define('Quiz', {
    title: { type: DataTypes.STRING, defaultValue: 'Automated Quiz' },
    questions: { type: DataTypes.JSON, allowNull: false }, // SQLite can save our JSON arrays directly!
    pdfUrl: { type: DataTypes.STRING }
});

// This links a Quiz to a specific Lecturer (User)
User.hasMany(Quiz, { foreignKey: 'lecturerId' });
Quiz.belongsTo(User, { foreignKey: 'lecturerId' });

module.exports = Quiz;