require('dotenv').config(); // MUST BE AT THE VERY TOP
const express = require('express');
const path = require('path');
const connectDB = require('./config/db'); // Import our DB connection
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('Automated Quiz Generator is READY!');
});