require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session'); // The Session Bouncer
const sequelize = require('./config/db'); 
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth'); // Our new Auth routes!

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Set up the Session (This creates the secure cookie)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 24-hour session
}));

// Use our routes
app.use('/api', apiRoutes);
app.use('/auth', authRoutes); // Tell the server about the login routes

// Sync the database and start the server
sequelize.sync().then(() => {
    console.log('✅ SQLite Database Connected and Synced!');
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('❌ Database connection failed:', err);
});