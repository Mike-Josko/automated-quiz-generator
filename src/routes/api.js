const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { extractText } = require('../utils/fileParser');
const { processText } = require('../utils/nlpProcessor');
const { generateQuestions } = require('../utils/questionGenerator');
const { generateQuizPDF } = require('../utils/pdfExporter');
const { generateMoodleGIFT } = require('../utils/moodleExporter');

const upload = multer({ dest: 'uploads/' });

router.post('/generate', upload.any(), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        let combinedText = "";
        for (const file of req.files) {
            const text = await extractText(file.path, file.mimetype);
            combinedText += text + "\n\n";
            fs.unlinkSync(file.path); 
        }

        const nlpData = processText(combinedText);
     const questions = generateQuestions(nlpData);

     // Generate BOTH files simultaneously
     const timestamp = Date.now();
     const pdfFileName = `Quiz_${timestamp}.pdf`;
     const moodleFileName = `Quiz_${timestamp}_Moodle.txt`;

     const pdfDownloadUrl = await generateQuizPDF(questions, pdfFileName);
     const moodleDownloadUrl = await generateMoodleGIFT(questions, moodleFileName); // <-- NEW

     res.json({
         success: true,
         message: 'Quiz Generated Successfully!',
         downloadUrl: pdfDownloadUrl,
         moodleUrl: moodleDownloadUrl, // <-- Send the new URL to the frontend
         preview: questions
     });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate quiz.' });
    }
});

module.exports = router;