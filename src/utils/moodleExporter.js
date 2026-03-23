const fs = require('fs');
const path = require('path');

const generateMoodleGIFT = (questions, filename) => {
    return new Promise((resolve, reject) => {
        let giftText = "";

        questions.forEach((q, i) => {
            // Clean up any weird NLP spacing
            const cleanQuestion = q.question.replace(/\s+/g, ' ').trim();
            const cleanAnswer = q.answer ? q.answer.replace(/\s+/g, ' ').trim() : '';

            // Start the GIFT format question
            giftText += `::Question ${i + 1}:: ${cleanQuestion} {\n`;

            if (q.type === 'Multiple Choice' && q.options) {
                // In GIFT: Correct answers start with '=', wrong answers with '~'
                q.options.forEach(opt => {
                    const cleanOpt = opt.replace(/\s+/g, ' ').trim();
                    if (cleanOpt === cleanAnswer) {
                        giftText += `\t=${cleanOpt}\n`;
                    } else {
                        giftText += `\t~${cleanOpt}\n`;
                    }
                });
            } else if (q.type === 'True/False') {
                // In GIFT: True/False is just {T} or {F}
                const isTrue = cleanAnswer.toLowerCase() === 'true';
                giftText += isTrue ? '\tT\n' : '\tF\n';
            } else {
                // Short Answer: Just exact match the correct answer
                giftText += `\t=${cleanAnswer}\n`;
            }
            
            // Close the question block with a blank line
            giftText += "}\n\n";
        });

        // Save the .txt file to the exact same exports folder as the PDFs
        const exportPath = path.join(__dirname, '../../public/exports', filename);
        fs.writeFile(exportPath, giftText, (err) => {
            if (err) reject(err);
            else resolve(`/exports/${filename}`);
        });
    });
};

module.exports = { generateMoodleGIFT };