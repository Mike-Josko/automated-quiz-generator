const natural = require('natural');
const tokenizer = new natural.SentenceTokenizer();

const processText = (text) => {
    const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    const sentences = tokenizer.tokenize(cleanText).filter(s => s.length > 20);

    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();
    tfidf.addDocument(cleanText);

    const keywords = [];
    tfidf.listTerms(0).forEach(item => {
        if (item.term.length > 4 && /^[a-zA-Z]+$/.test(item.term) && item.tfidf > 2) {
            keywords.push(item.term);
        }
    });

    return { sentences, topKeywords: keywords.slice(0, 25) };
};

module.exports = { processText };