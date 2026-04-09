const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    topic: { type: String, required: true },
    date: { type: String, required: true },
    count: { type: Number, required: true }, // Total marks
    type: { type: String, required: true },  // Final Exam or CAT
    quizData: { type: Object, required: true }, // The massive JSON payload
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Exam', examSchema);