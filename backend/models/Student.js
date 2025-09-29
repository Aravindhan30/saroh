const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    // Link to the User for authentication
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    
    // Core Identity Fields
    studentID: { type: String, required: true, unique: true }, // e.g., CS2023001
    name: { type: String, required: true, default: 'Student User' },
    email: { type: String, required: true, unique: true }, // Should match User.email
    
    // Academic Details (Page 2)
    department: { type: String, default: 'Computer Science' },
    batch: { type: String, default: '2021-2025' }, 
    semester: { type: String, default: '4th Semester' },
    
    // Dashboard Metrics (Page 2)
    cgpa: { type: Number, default: 0.0, min: 0, max: 10 }, 
    attendancePercentage: { type: Number, default: 0, min: 0, max: 100 }, 
    
    // Hostel Information (Page 4-5) - Simplified Structure for Seeder compatibility
    hostel: {
        isResident: { type: Boolean, default: true },
        block: { type: String, default: 'Block C' },
        roomNumber: { type: String, default: '204' },
        roomType: { type: String, default: '2-Seater' },
        warden: { type: String, default: 'Dr. Riya Sharma' }
    },
    
    // Transport Information (Page 6-7) - Simplified Structure for Seeder compatibility
    transport: {
        isBusUser: { type: Boolean, default: true },
        route: { type: String, default: 'Route 3 South Area' },
        busNumber: { type: String, default: 'MH-05-8-9012' },
        pickupPoint: { type: String, default: 'Hospital Road' }, 
        morningPickup: { type: String, default: '07:15 AM' },
        driverName: { type: String, default: 'Mahesh Patil' },
    },

    // Placeholder for Notifications/Events
    notifications: [{
        message: String,
        time: { type: Date, default: Date.now }
    }],
    upcomingEvents: [{
        title: String,
        date: Date
    }]

}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);