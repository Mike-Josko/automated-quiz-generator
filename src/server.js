const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); 
require('dotenv').config(); 

const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db'); // Connects to MongoDB Atlas

// Fire up the MongoDB connection
connectDB();

const app = express();

// --- MIDDLEWARE ---
app.use(express.json()); // Allows Express to understand JSON data from React
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Allows Express to read your secure login cookies


app.use(express.static(path.join(__dirname, '../public'))); 

app.use('/auth', require('./routes/auth')); 

app.use('/api', require('./routes/generate'));

app.use('/api', require('./routes/history'));

// --- SERVER START ---
// Local Development vs Vercel Serverless Export
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running locally on http://localhost:${PORT}`);
    });
}

// CRITICAL: Vercel requires the app to be exported!
module.exports = app;