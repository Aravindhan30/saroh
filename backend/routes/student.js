const express = require('express');
const { protect, restrictTo } = require('../middlewares/auth'); // Check this line again!
const Student = require('../models/Student');
const Fee = require('../models/Fee');
const router = express.Router();

// Middleware to ensure the user is a Student
const studentAuth = [protect, restrictTo(['Student'])];

// --- 1. Fetch ALL Student Dashboard Data (Page 2) ---
router.get('/dashboard', studentAuth, async (req, res) => {
    try {
        const studentProfile = await Student.findById(req.user.studentId).select('-notifications -upcomingEvents');
        
        if (!studentProfile) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }

        // Fetch Notifications and Events separately (mock data for now, will integrate later)
        const notifications = [
            { id: 1, message: "Your leave application has been approved.", time: "1 day ago" },
            { id: 2, message: "Fee receipt generated for Semester 4.", time: "1 day ago" },
            { id: 3, message: "New assignment posted in Database Systems.", time: "7 days ago" },
        ];
        
        const upcomingEvents = [
            { id: 1, title: "Mid-Term Examination", date: "October 10-13, 2024" },
            { id: 2, title: "Technical Symposium", date: "July 21, 2025" },
            { id: 3, title: "Project Submission", date: "September 12, 2025" },
        ];

        // Fetch Fees Status
        const feeStatus = await Fee.findOne({ student: req.user.studentId })
            .sort({ semester: -1 })
            .select('status');
        
        // Prepare summary data for the dashboard
        const summary = {
            name: studentProfile.name,
            studentID: studentProfile.studentID,
            department: studentProfile.department,
            batch: studentProfile.batch,
            semester: studentProfile.semester,
            cgpa: studentProfile.cgpa,
            attendancePercentage: studentProfile.attendancePercentage,
            feeStatus: feeStatus ? feeStatus.status : 'N/A',
            hostelRoom: studentProfile.hostel.isResident ? studentProfile.hostel.roomNumber : 'N/A',
            transportInfo: studentProfile.transport.isBusUser ? studentProfile.transport.route : 'N/A',
            notifications,
            upcomingEvents
        };

        res.status(200).json(summary);
    } catch (error) {
        console.error('Error fetching student dashboard data:', error);
        res.status(500).json({ error: 'Server error while fetching dashboard data.' });
    }
});

// --- 2. Fetch Student Profile Details (Page 3) ---
router.get('/profile', studentAuth, async (req, res) => {
    try {
        const profile = await Student.findById(req.user.studentId)
            .select('name studentID department email batch semester');

        if (!profile) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }
        res.status(200).json(profile);
    } catch (error) {
        console.error('Error fetching student profile:', error);
        res.status(500).json({ error: 'Server error while fetching profile data.' });
    }
});

// --- 3. Fetch Student Hostel Details (Page 4-5) ---
router.get('/hostel', studentAuth, async (req, res) => {
    try {
        const hostelDetails = await Student.findById(req.user.studentId).select('hostel');

        if (!hostelDetails) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }
        res.status(200).json(hostelDetails.hostel);
    } catch (error) {
        console.error('Error fetching student hostel data:', error);
        res.status(500).json({ error: 'Server error while fetching hostel data.' });
    }
});

// --- 4. Fetch Student Transport Details (Page 6-7) ---
router.get('/transport', studentAuth, async (req, res) => {
    try {
        const transportDetails = await Student.findById(req.user.studentId).select('transport');

        if (!transportDetails) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }
        res.status(200).json(transportDetails.transport);
    } catch (error) {
        console.error('Error fetching student transport data:', error);
        res.status(500).json({ error: 'Server error while fetching transport data.' });
    }
});

// --- 5. Fetch Student Fee Details (Page 8-10) ---
router.get('/fees', studentAuth, async (req, res) => {
    try {
        // Fetch the most recent fee record
        const feeDetails = await Fee.findOne({ student: req.user.studentId })
            .sort({ semester: -1 });

        if (!feeDetails) {
            // Return an empty structure if no fee record exists, not a 404
            return res.status(200).json({ 
                totalFee: 0, 
                status: 'N/A', 
                breakdown: [], 
                paymentHistory: [],
                dueDate: null,
                semester: 'N/A'
            });
        }
        res.status(200).json(feeDetails);
    } catch (error) {
        console.error('Error fetching student fees data:', error);
        res.status(500).json({ error: 'Server error while fetching fees data.' });
    }
});


module.exports = router;