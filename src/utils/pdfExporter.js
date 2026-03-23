const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateQuizPDF = (questions, filename) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const exportPath = path.join(__dirname, '../../public/exports', filename);
        const writeStream = fs.createWriteStream(exportPath);

        doc.pipe(writeStream);

        // ==========================================
        //         MUST OFFICIAL EXAM HEADER
        // ==========================================
        doc.font('Helvetica-Bold').fontSize(14)
           .text('MERU UNIVERSITY OF SCIENCE AND TECHNOLOGY', { align: 'center' });
        
        doc.font('Helvetica').fontSize(10).moveDown(0.2)
           .text('P.O. Box 972-60200 - Meru-Kenya.', { align: 'center' })
           .text('Tel: +254(0) 799 529 958, +254(0) 799 529 959, +254 (0) 712 524 293', { align: 'center' })
           .text('Website: www.must.ac.ke  Email: info@must.ac.ke', { align: 'center' });
        
        doc.moveDown(1);
        
        doc.font('Helvetica-Oblique').fontSize(11)
           .text('University Examinations 2023/2024', { align: 'center' });
        doc.moveDown(0.5);
        
        doc.font('Helvetica-Bold').fontSize(11)
           .text('EXAMINATION FOR THE DEGREE OF BACHELOR OF SCIENCE IN COMPUTER SCIENCE', { align: 'center' });
        doc.moveDown(1);

        // Cleaned up the "Auto-Generated" tag to make it look more official
        doc.fontSize(12).text('CCS 3351: DISTRIBUTED SYSTEMS', { align: 'center' });
        doc.moveDown(1);

        const dateY = doc.y;
        doc.fontSize(11).font('Helvetica-Bold')
           .text('DATE: APRIL 2024', 50, dateY)
           .text('TIME: 2 HOURS', 50, dateY, { align: 'right' });
        
        doc.moveDown(1);

        doc.font('Helvetica-Oblique').fontSize(11)
           .text('INSTRUCTIONS: Answer question one and any other two questions', 50, doc.y);
        doc.moveDown(2);

        // ==========================================
        //           QUESTIONS SECTION
        // ==========================================
        doc.font('Helvetica-Bold').fontSize(12).text('QUESTION ONE (30 MARKS)', 50, doc.y);
        doc.moveDown(1);

        doc.font('Helvetica').fontSize(11);
        
        questions.forEach((q, i) => {
            const letter = String.fromCharCode(97 + i);
            
            // THE SANITIZER: This strips out all the weird line breaks and junk spaces from the NLP output
            const cleanQuestion = q.question.replace(/\s+/g, ' ').trim();
            
            // Width 450 and 'justify' forces the text to wrap beautifully like a real paragraph
            doc.text(`${letter})  ${cleanQuestion}`, 50, doc.y, { width: 450, align: 'justify' });
            
            doc.moveDown(0.5); // Add a small space before options
            
            // Format Options cleanly with spacing
            if ((q.type === 'Multiple Choice' || q.type === 'True/False') && q.options) {
                const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v'];
                q.options.forEach((opt, j) => {
                    const cleanOpt = opt.replace(/\s+/g, ' ').trim();
                    doc.text(`    ${romanNumerals[j]}) ${cleanOpt}`, 70, doc.y, { width: 430 });
                    doc.moveDown(0.2);
                });
            }
            
            // Add a large, clear space before the next main question starts
            doc.moveDown(1.5); 
        });

        // ==========================================
        //        ISO FOOTER
        // ==========================================
        const bottomY = doc.page.height - 70;
        doc.font('Helvetica-Bold').fontSize(9)
           .text('MUST is ISO 9001:2015 and ISO/IEC 27001:2013 CERTIFIED', 50, bottomY, { align: 'center' });


        // ==========================================
        //       PAGE 2: LECTURER ANSWER KEY
        // ==========================================
        doc.addPage(); 
        doc.font('Helvetica-Bold').fontSize(16).text('PRIVATE ANSWER KEY', { align: 'center' }).moveDown(2);
        
        doc.font('Helvetica').fontSize(11);
        questions.forEach((q, i) => {
            const letter = String.fromCharCode(97 + i);
            const cleanAnswer = q.answer ? q.answer.replace(/\s+/g, ' ').trim() : 'N/A';
            
            doc.font('Helvetica-Bold').text(`${letter}) Correct Answer: `);
            doc.font('Helvetica').text(`    ${cleanAnswer}`);
            
            // Completely removed the Difficulty Rating!
            doc.fontSize(9).fillColor('gray').text(`    (Concept Type: ${q.type})`).fillColor('black');
            doc.moveDown(1);
        });

        doc.end();
        writeStream.on('finish', () => resolve(`/exports/${filename}`));
        writeStream.on('error', reject);
    });
};

module.exports = { generateQuizPDF };