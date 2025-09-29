const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to ensure the user is logged in AND has the 'Administrator' role
const adminAuth = (req, res, next) => {
    // Token is usually passed via the Authorization header: Bearer <token>
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: 'Authorization required (Missing or malformed token)' });
    }
    
    const token = authHeader.split(" ")[1];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "A_VERY_STRONG_DEFAULT_SECRET");
        
        // CRITICAL CHECK: Does the user have the Admin role?
        if (decoded.role !== 'Administrator') {
            return res.status(403).json({ message: 'Access denied: Requires Administrator privileges' });
        }
        
        req.user = decoded; // Attach decoded payload (id, role, etc.) to the request
        next();
    } catch (e) {
        // Handle expired, malformed, or invalid tokens
        res.status(401).json({ message: 'Invalid or expired token. Authentication failed.' });
    }
};

module.exports = adminAuth;
