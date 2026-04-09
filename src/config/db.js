const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // This attempts to connect to the URI hidden in your .env file
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1); // Stop the server if the database fails to connect
    }
};

module.exports = connectDB;