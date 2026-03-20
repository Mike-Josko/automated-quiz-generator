const fs = require('fs');
const pdf = require('pdf-parse');

const extractText = async (filePath, mimeType) => {
    try {
        if (mimeType === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            // With version 1.1.1, this works perfectly every single time.
            const data = await pdf(dataBuffer);
            return data.text;
        } else {
            // Text file fallback
            return fs.readFileSync(filePath, 'utf8'); 
        }
    } catch (error) {
        console.error("PDF Parsing Error:", error);
        throw new Error("Failed to extract text from file.");
    }
};

module.exports = { extractText };