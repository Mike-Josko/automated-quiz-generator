const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    lecturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'Automated Quiz' },
    questions: { type: Array, required: true },
    pdfUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);