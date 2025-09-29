const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes and attach user info to the request object
const protect = async (req, res, next) => {
    let token;

    // Check for 'Bearer' token in the headers
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header (Format: Bearer <token>)
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "A_VERY_STRONG_DEFAULT_SECRET");

            // Attach user data from token payload to request object
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                studentId: decoded.studentId // Crucial for fetching student-specific data
            };
            
            next();

        } catch (error) {
            console.error('Token verification failed:', error.message);
            return res.status(401).json({ error: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }
};

// Middleware to restrict access based on role
const restrictTo = (allowedRoles) => (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to access this resource.' });
    }
    next();
};

module.exports = { protect, restrictTo };