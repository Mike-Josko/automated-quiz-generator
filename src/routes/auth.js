const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Bringing in your new Mongoose Blueprint!

// --- 1. REGISTER A NEW LECTURER ---
router.post('/register', async (req, res) => {
    try {
        const { name, email, staffId, school, department, password } = req.body;

        // NEW: Strict Staff ID Validation
        // Matches: MUST-SCI-1234, MUST-SBE-0042, etc.
        const staffIdRegex = /^MUST-(SFAS|SBE|SCI|SEA|SED|SHS|SoN|SPAS)-\d{4}$/;
        if (!staffIdRegex.test(staffId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid Staff ID format.' 
            });
        }

        // Check if a user with this email or Staff ID already exists in MongoDB
        const userExists = await User.findOne({ $or: [{ email }, { staffId }] });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'A lecturer with this Email or Staff ID is already registered.' });
        }

        // Securely hash the password (scramble it 10 times)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the new user using our Mongoose schema
        const newUser = new User({
            name,
            email,
            staffId,
            school,
            department,
            password: hashedPassword
        });

        // Save them to MongoDB Atlas!
        await newUser.save();
        res.json({ success: true, message: 'Registration successful! You can now log in.' });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
});

// --- 2. LOGIN AN EXISTING LECTURER ---
router.post('/login', async (req, res) => {
    // 1. THE BREADCRUMB: Put this right at the top so we know the phone reached the server
    console.log("🚦 Login attempt received for username:", req.body.username);
    try {
        const { username, password } = req.body; // Frontend sends 'username' for either email or staffId

        // Search MongoDB for the email OR the staff ID
        const user = await User.findOne({ 
            $or: [{ email: username }, { staffId: username }] 
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials. User not found.' });
        }

        // Compare the typed password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
        }

        // Create a secure "Ticket" (JWT) so the system remembers them
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Give the ticket to the browser as an invisible Cookie
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // Lasts for 1 day
        });

        // Send the user data to the React frontend to load the Dashboard
        res.json({ 
            success: true, 
            user: { id: user._id, name: user.name, email: user.email, staffId: user.staffId } 
        });

    } catch (error) {
        // WE MUST FORCE VERCEL TO PRINT THIS:
        console.error("❌ FATAL LOGIN ERROR DETAILS:", error);
        
        res.status(500).json({ message: "Server error during login" });
    }
});

// --- 3. CHECK SESSION (Keeps user logged in if they refresh) ---
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.json({ success: false });

        // Verify the ticket is real
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find the user in MongoDB, but DO NOT send their password back to the frontend
        const user = await User.findById(decoded.id).select('-password'); 
        
        if (!user) return res.json({ success: false });

        res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, staffId: user.staffId } });
    } catch (error) {
        res.json({ success: false });
    }
});

// --- 4. LOGOUT ---
router.post('/logout', (req, res) => {
    res.clearCookie('token'); // Destroy the secure ticket
    res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;