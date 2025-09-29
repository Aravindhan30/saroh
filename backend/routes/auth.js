const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student"); // Needed to link student ID to JWT

const router = express.Router();

// POST /login
// Handles user login by verifying credentials and issuing a JWT with role information.
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find User by email
        // We do not select password here, but the comparePassword method handles fetching it.
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // 2. Compare Password using the custom method from User model
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // 3. Determine the studentId if the user is a Student
        let studentId = null;
        if (user.role === 'Student') {
            // Find the linked Student document to get its ObjectId
            const student = await Student.findOne({ userId: user._id }).select('_id');
            if (!student) {
                 // Student user found, but no student profile exists - security check
                 return res.status(404).json({ error: "Student profile not found. Contact administrator." });
            }
            studentId = student._id;
        }

        // 4. Generate JWT with role and IDs for client-side storage
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email,
                role: user.role, // CRUCIAL for client-side routing
                studentId: studentId // CRUCIAL for student-specific data fetching
            },
            process.env.JWT_SECRET || "A_VERY_STRONG_DEFAULT_SECRET", // Use .env variable
            { expiresIn: "1d" } // Token expires in 1 day
        );

        // 5. Send token and user details to the client
        res.json({ 
            message: "Login successful", 
            token,
            role: user.role,
            username: user.username,
            email: user.email
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error during login" });
    }
});

// GET /me 
// A utility route (often used in frontend context/hooks) to verify the current token 
// and fetch non-sensitive user details.
router.get("/me", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ error: "No token provided" });

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "A_VERY_STRONG_DEFAULT_SECRET");

        // Fetch user details, excluding password
        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json(user);
    } catch (err) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
});

module.exports = router;
