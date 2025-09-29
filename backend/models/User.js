const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false // DO NOT send password back in standard queries
    },
    role: {
        type: String,
        enum: ['Student', 'Administrator'], // Defines roles for EduERP system
        required: true,
        default: 'Student'
    },
    // Links to the detailed Student document (only if role is 'Student')
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: function() { return this.role === 'Student'; } 
    }
}, { timestamps: true });

// --- Mongoose Pre-Save Hook for Password Hashing ---
// This runs before the user document is saved to the database.
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// --- Instance Method for Password Comparison ---
// This method is called by the auth route to verify the user's input password.
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        // Explicitly fetch password since 'select: false' is used in the schema
        const userWithPassword = await this.model('User')
                                         .findOne({ _id: this._id })
                                         .select('+password');
                                         
        if (!userWithPassword) return false;
        
        // Use bcrypt to compare the candidate password with the hashed password
        return bcrypt.compare(candidatePassword, userWithPassword.password);
    } catch (error) {
        console.error("Error during password comparison:", error);
        return false;
    }
};

module.exports = mongoose.model('User', userSchema);
