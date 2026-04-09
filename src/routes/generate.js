const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const pdfParse = require('pdf-parse');

// --- 1. SETUP TOOLS ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// We tell Multer to hold the uploaded file in RAM (Memory) instead of saving it to your hard drive. 
// We only need to read it once, so this keeps your server fast and clean!
const upload = multer({ storage: multer.memoryStorage() }); 

// CRITICAL FIX: upload.array MUST say 'document' to match your frontend!
router.post('/generate-quiz', upload.array('document', 15), async (req, res) => {
    try {
        // 1. Check if files were actually uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No documents uploaded!' });
        }

        console.log(`📄 Received ${req.files.length} file(s) for processing.`);

        let combinedText = "";

        // 2. Loop through every uploaded file and extract the text
        for (const file of req.files) {
            if (file.mimetype === 'application/pdf') {
                const pdfData = await pdfParse(file.buffer);
                combinedText += pdfData.text + "\n\n";
            } else if (file.mimetype === 'text/plain') {
                combinedText += file.buffer.toString('utf-8') + "\n\n";
            }
        }

        console.log(`🔍 Extracted a total of ${combinedText.length} characters. Sending to Gemini...`);

        // 3. Configure Gemini Engine
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.1-flash-lite-preview", 
            generationConfig: {
                temperature: 0.2, 
                responseMimeType: "application/json", 
            }
        });
        
        // Grab the configuration from your frontend UI
        const marksTarget = req.body.numQuestions || 30;
        
        // NEW: Grab the Assessment Type (Defaults to Final Exam if missing)
        const assessmentType = req.body.assessmentType || 'Final Exam'; 

        let prompt = "";

        // ==========================================
        // LOGIC BRANCH 1: FINAL EXAM (SECTIONS A-D)
        // ==========================================
        if (assessmentType === 'Final Exam') {
            prompt = `
            You are an expert university examiner. Based ONLY on the provided text, generate a highly structured university examination.
            
            Source Text:
            ${combinedText}

            Instructions:
            1. Analyze the text and dynamically determine the "examTitle" and "courseCode".
            2. Divide the exam into four strict sections (Section A, B, C, D).
            3. EXAM STRUCTURE & MARK ALLOCATION:
               - The total marks for the entire exam should roughly add up to ${marksTarget}.
               - SECTION A (COMPULSORY): Must total exactly 30 marks. Every single sub-question MUST be strictly worth 2, 3, or a maximum of 4 marks. Generate enough short questions (a, b, c, d...) to sum exactly to 30.
               - SECTIONS B, C, D (OPTIONAL): Each of these sections MUST total exactly 20 marks.
               - SUB-DIVISIONS: NEVER create a single question worth 20 marks. You must break them down into sub-parts (e.g., a, b, c, and roman numerals i, ii, iii).
               - MIXED WEIGHTS: In Sections B, C, and D, mix short questions (2 or 3 marks for definitions) with heavier analytical questions. The absolute maximum marks for any single sub-question is 12 marks.
               - THE CODING RULE: Scan the source text. IF the text contains programming, syntax, or coding concepts, you MUST include a coding or algorithm-based sub-question in Section B. This coding question should be weighted between 5 and 12 marks depending on complexity. If the text does not contain coding, ignore this rule.

            You MUST respond with a valid JSON object using this exact schema:
            {
                "examTitle": "String (Extracted or deduced from the text)",
                "courseCode": "String (Extracted from text, or 'UNKNOWN')",
                "instructions": "Answer Question One (Section A) and any other two questions.",
                "sections": [
                    {
                        "sectionName": "Section A",
                        "compulsory": true,
                        "totalMarks": 30,
                        "questions": [
                            {
                                "questionNumber": "1a",
                                "questionText": "String",
                                "marks": 4,
                                "markingGuide": "String (Brief explanation for the lecturer)"
                            }
                        ]
                    },
                    {
                        "sectionName": "Section B",
                        "compulsory": false,
                        "totalMarks": 20,
                        "questions": [
                            {
                                "questionNumber": "2a(i)",
                                "questionText": "String",
                                "marks": 5,
                                "markingGuide": "String"
                            }
                        ]
                    }
                ]
            }
            `;
        } 
        // ==========================================
        // LOGIC BRANCH 2: CAT / RAT (FLAT LIST)
        // ==========================================
        else {
            prompt = `
            You are an expert university examiner. Based ONLY on the provided text, generate a Continuous Assessment Test (CAT) or Rapid Assessment Test (RAT).
            
            Source Text:
            ${combinedText}

            Instructions:
            1. Analyze the text and dynamically determine the "examTitle" and "courseCode".
            2. DO NOT use sections (No Section A, B, etc.). Generate a single, continuous list of questions numbered 1, 2, 3, 4, etc.
            3. The total marks for the entire CAT must sum perfectly to ${marksTarget}.
            4. Mix short answer questions (2-3 marks) with medium analytical questions (4-8 marks) based on the text complexity.
            5. If there is coding in the text, you may include one coding question.

            You MUST respond with a valid JSON object using this exact schema:
            {
                "examTitle": "String (Extracted or deduced from the text)",
                "courseCode": "String (Extracted from text, or 'UNKNOWN')",
                "instructions": "Answer all questions.",
                "questions": [
                    {
                        "questionNumber": "1",
                        "questionText": "String",
                        "marks": 5,
                        "markingGuide": "String (Brief explanation for the lecturer)"
                    },
                    {
                        "questionNumber": "2",
                        "questionText": "String",
                        "marks": 3,
                        "markingGuide": "String"
                    }
                ]
            }
            `;
        }
        
        // 5. Generate and Parse
        const result = await model.generateContent(prompt);
        const quizData = JSON.parse(result.response.text()); 
        
        console.log(`✅ ${assessmentType} Generated Successfully!`);
        
        res.json({ 
            success: true, 
            quiz: quizData 
        });

    } catch (error) {
        console.error('❌ Generator Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to process documents and generate exam.' });
    }
});

module.exports = router;