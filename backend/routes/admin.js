// backend/routes/admin.js
const express = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const router = express.Router();
const Student = require('../models/Student');
const Fee = require('../models/Fee');
const adminAuth = require('../middlewares/adminAuth'); // NEW admin-specific auth

router.use(adminAuth); // Apply admin auth to all admin routes

// GET /api/admin/dashboard (Page 11)
router.get('/dashboard', async (req, res) => {
    // Placeholder data matching Page 11 tiles
    try {
        const totalStudents = await Student.countDocuments();
        // Calculate other metrics (Avg Attendance, etc.)
        res.json({
            totalStudents: totalStudents, // Matches 1,248
            avgAttendance: 87, // Matches 87%
            hostelCapacity: 16,
            pendingFees: 24.8, // In Lakhs
            // ... other admin data
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching admin dashboard data' });
    }
});

// GET /api/admin/fees (Page 13)
router.get('/fees', async (req, res) => {
    try {
        // Fetch fee records and populate student names for the table
        const feeRecords = await Fee.find().populate('student', 'studentID name'); 
        res.json(feeRecords);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching fee management data' });
    }
});

module.exports = router;
