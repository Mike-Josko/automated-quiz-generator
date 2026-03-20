const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateQuizPDF = (questions, filename) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const exportPath = path.join(__dirname, '../../public/exports', filename);
        const writeStream = fs.createWriteStream(exportPath);

        doc.pipe(writeStream);

        // --- QUIZ SECTION ---
        doc.fontSize(20).text('Automated Quiz', { align: 'center' }).moveDown();
        questions.forEach((q, i) => {
            // FIXED: No difficulty level shown here!
            doc.fontSize(12).text(`${i + 1}. ${q.question}`);
            if (q.type === 'Multiple Choice' || q.type === 'True/False') {
                q.options.forEach((opt, j) => {
                    doc.text(`   ${String.fromCharCode(65 + j)}) ${opt}`);
                });
            }
            doc.moveDown();
        });

        doc.addPage(); 

        // --- ANSWER KEY SECTION ---
        doc.fontSize(20).text('Answer Key', { align: 'center' }).moveDown();
        questions.forEach((q, i) => {
            doc.fontSize(12).text(`${i + 1}. Correct Answer: ${q.answer}`);
            doc.fontSize(10).fillColor('gray').text(`   (Type: ${q.type} | Level: ${q.difficulty})`).fillColor('black');
            doc.moveDown();
        });

        doc.end();
        writeStream.on('finish', () => resolve(`/exports/${filename}`));
        writeStream.on('error', reject);
    });
};

module.exports = { generateQuizPDF };