const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    // Link to the Student Profile
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },

    // Academic Details
    semester: { type: Number, required: true, default: 4 }, // Changed to Number
    academicYear: { type: String, default: '2023-2024' },
    
    // Status and Amounts
    totalFee: { type: Number, required: true, default: 0 },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['Paid', 'Pending', 'Overdue', 'Waived'], default: 'Pending' },
    
    // Fee Breakdown structure (Matches Page 9)
    breakdown: [{
        component: { type: String, required: true }, // e.g., 'Tuition Fee', 'Development Fee'
        amount: { type: Number, required: true }
    }],
    
    // Payment History (Matches Page 10)
    paymentHistory: [{
        receiptId: { type: String, required: true, unique: true, index: true }, // Ensure this is unique
        date: { type: Date, required: true },
        amount: { type: Number, required: true },
        paymentMethod: { type: String }, // e.g., 'Online Banking', 'Credit Card'
        status: { type: String, default: 'Success' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);