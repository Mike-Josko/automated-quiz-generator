const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// ================= REGISTER ROUTE =================
router.post('/register', async (req, res) => {
    try {
        const { name, username, password } = req.body;
        
        // 1. Check if the username is already taken
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username already taken.' });
        }

        // 2. Encrypt the password (never save raw passwords!)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Save the new Lecturer to our SQLite database
        await User.create({
            name,
            username,
            password: hashedPassword
        });

        res.json({ success: true, message: 'Registration successful! You can now log in.' });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
});

// ================= LOGIN ROUTE =================
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Find the user in the database
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials.' });
        }

        // 2. Compare the typed password with the encrypted one in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials.' });
        }

        // 3. Give them a "Session VIP Wristband"
        req.session.userId = user.id;
        req.session.name = user.name;

        res.json({ success: true, message: 'Login successful!', user: { name: user.name } });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});

// ================= LOGOUT ROUTE =================
router.post('/logout', (req, res) => {
    // Rip up the VIP wristband
    req.session.destroy();
    res.json({ success: true, message: 'Logged out successfully.' });
});

// ================= CHECK SESSION (For page refreshes) =================
router.get('/me', (req, res) => {
    if (req.session.userId) {
        res.json({ success: true, user: { name: req.session.name } });
    } else {
        res.status(401).json({ success: false, message: 'Not logged in.' });
    }
});

module.exports = router;