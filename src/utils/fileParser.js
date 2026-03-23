const fs = require('fs');
const pdf = require('pdf-parse');

const extractText = async (filePath, mimeType) => {
    try {
        if (mimeType === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            
            // --- THE SILENCER ---
            // Temporarily mute console warnings so 'pdf-parse' doesn't spam us
            const originalWarn = console.warn;
            console.warn = function() {}; 
            
            // Read the PDF
            const data = await pdf(dataBuffer);
            
            // Restore console warnings immediately after
            console.warn = originalWarn;
            // --------------------

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