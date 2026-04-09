const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');

// 1. SAVE AN EXAM
router.post('/history', async (req, res) => {
    try {
        const { topic, count, type, quizData } = req.body;
        
        const newExam = new Exam({
            topic,
            count,
            type,
            quizData,
            date: new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
        });

        const savedExam = await newExam.save();
        res.json({ success: true, savedExam });
    } catch (error) {
        console.error('Save Error:', error);
        res.status(500).json({ success: false, message: 'Failed to save exam.' });
    }
});

// 2. FETCH THE VAULT
router.get('/history', async (req, res) => {
    try {
        // Find all exams and sort them by newest first
        const exams = await Exam.find().sort({ createdAt: -1 });
        
        // Map them so they match the frontend's expected format
        const formattedHistory = exams.map(exam => ({
            id: exam._id,
            date: exam.date,
            topic: exam.topic,
            count: exam.count,
            type: exam.type,
            quizData: exam.quizData
        }));

        res.json({ success: true, history: formattedHistory });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch history.' });
    }
});

module.exports = router;