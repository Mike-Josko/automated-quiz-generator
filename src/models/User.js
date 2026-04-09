const mongoose = require('mongoose');

// This is the blueprint for how a Lecturer is saved in the database
const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true // MongoDB will ensure no two lecturers use the same email
    },
    staffId: { 
        type: String, 
        required: true, 
        unique: true // Ensures no duplicate Staff IDs
    },
    school: { 
        type: String, 
        required: true 
    },
    department: { 
        type: String, 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    }
}, { 
    timestamps: true // Automatically adds 'createdAt' and 'updatedAt' dates!
});

module.exports = mongoose.model('User', userSchema);