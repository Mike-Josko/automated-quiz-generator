const shuffle = (array) => array.sort(() => Math.random() - 0.5);

const generateQuestions = (processedData) => {
    const { sentences, topKeywords } = processedData;
    let questions = [];

    topKeywords.forEach((keyword, index) => {
        const sentence = sentences.find(s => s.toLowerCase().includes(keyword.toLowerCase()));
        if (!sentence) return;

        const blankedSentence = sentence.replace(new RegExp(`\\b${keyword}\\b`, 'gi'), '_______');

        if (index % 3 === 0) {
            questions.push({
                type: 'Short Answer', difficulty: 'Hard',
                question: `Fill in the blank: ${blankedSentence}`,
                answer: keyword, options: []
            });
        } else if (index % 3 === 1) {
            const distractors = shuffle(topKeywords.filter(k => k !== keyword)).slice(0, 3);
            questions.push({
                type: 'Multiple Choice', difficulty: 'Medium',
                question: `Select the missing word: ${blankedSentence}`,
                answer: keyword, options: shuffle([keyword, ...distractors])
            });
        } else {
            questions.push({
                type: 'True/False', difficulty: 'Easy',
                question: `True or False: ${sentence}`,
                answer: 'True', options: ['True', 'False']
            });
        }
    });

    return shuffle(questions).slice(0, 15);
};

module.exports = { generateQuestions };