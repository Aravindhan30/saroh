const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import all required models
const User = require('./models/User');
const Student = require('./models/Student');
const Fee = require('./models/Fee');

// Use your specific MongoDB URI as fallback
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://aravindpriyashanmugam_db_user:PvWFXfIokIiceX2V@arav28.oy28mlw.mongodb.net/?retryWrites=true&w=majority&appName=ARAV28";

const seedData = async () => {
    console.log("--- Starting Data Seeder ---");
    
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,
        });
        console.log("✅ MongoDB connected for seeding.");

        // --- 1. Clean up existing data ---
        await User.deleteMany({});
        await Student.deleteMany({});
        await Fee.deleteMany({});
        console.log("🧹 Previous data cleared successfully.");

        // --- 2. Setup reusable variables ---
        const DEMO_EMAIL = 'demo@example.com';
        const DEMO_PASSWORD = 'password';
        const DEMO_STUDENT_ID = 'CS2023001';
        const ADMIN_EMAIL = 'admin@example.com';
        const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10); 
        
        // --- 3. Create Student User ---
        const tempStudentUser = await User.create({
            username: 'Student User',
            email: DEMO_EMAIL,
            password: passwordHash, 
            role: 'Student',
            // studentId is temporarily null here, will be updated after profile creation
            studentId: new mongoose.Types.ObjectId() 
        });
        
        // --- 4. Create the linked Student Profile Data ---
        const studentProfile = await Student.create({
            // REQUIRED FIELDS (Fixing the previous validation issue)
            userId: tempStudentUser._id, // Link to the User ID
            email: DEMO_EMAIL,           // Required by Student model
            studentID: DEMO_STUDENT_ID,  // Required by Student model
            
            // Other Profile Data
            name: tempStudentUser.username,
            department: 'Computer Science',
            batch: '2021-2025',
            semester: '4th Semester',
            cgpa: 8.7,
            attendancePercentage: 92,
            hostel: {
                isResident: true,
                block: 'Block C',
                roomNumber: '204',
                roomType: '2-Seater',
                warden: 'Dr. Riya Sharma'
            },
            transport: {
                isBusUser: true,
                route: 'Route 3 South Area',
                busNumber: 'MH-05-8-9012',
                pickupPoint: 'Hospital Road', 
                morningPickup: '07:15 AM',
                driverName: 'Mahesh Patil',
            },
        });
        console.log("👤 Demo Student Profile created successfully.");

        // --- 5. Finalize the User: Update the studentId field in the User document ---
        tempStudentUser.studentId = studentProfile._id;
        await tempStudentUser.save();
        console.log(`✅ Student User (ID: ${tempStudentUser._id}) finalized and linked.`);
        
        // --- 6. Create Fee Data for the Student ---
        const feeRecord = await Fee.create({
            student: studentProfile._id,
            semester: 4,
            totalFee: 115000,
            dueDate: new Date('2023-07-15'),
            status: 'Paid',
            breakdown: [
                { component: 'Tuition Fee', amount: 85000 },
                { component: 'Development Fee', amount: 15000 },
                { component: 'Examination Fee', amount: 5000 },
                { component: 'Library & Lab Fee', amount: 10000 },
            ],
            paymentHistory: [
                {
                    receiptId: 'FEE-123456',
                    date: new Date('2023-07-10'),
                    amount: 115000,
                    paymentMethod: 'Online Banking',
                    status: 'Success',
                },
            ],
        });
        console.log(`💰 Fee Record (ID: ${feeRecord._id}) created for student.`);

        // --- 7. Create Administrator User Data ---
        const adminUser = await User.create({
            username: 'Admin User',
            email: ADMIN_EMAIL,
            password: passwordHash,
            role: 'Administrator',
            studentId: null, 
        });
        console.log(`👑 Administrator User (ID: ${adminUser._id}) created.`);


        console.log("--- Seeding Complete Successfully! ---");
    } catch (error) {
        console.error("❌ ERROR during data seeding:", error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 MongoDB connection closed.");
    }
};

seedData();