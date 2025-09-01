const jwt = require('jsonwebtoken');
const ErrorHandler = require('../utils/ErrorHandler');
const { catchAsyncErrors } = require('./catchAsyncError');
const Admin = require('../models/admin');

// General authentication middleware
exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const authHeader = req.headers.authorization;
// console.log(authHeader)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ErrorHandler("Login first to access this resource", 401));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        req.id = decoded.id;
        req.userRole = decoded.role;
        // console.log("Authenticated user ID:", req.id);
        next();
    } catch (error) {
        return next(new ErrorHandler("Invalid token. Please log in again.", 401));
    }
});

// Admin-specific authentication middleware
exports.isAdminAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.adminToken;
    
    let token;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (cookieToken) {
        token = cookieToken;
    }
    
    if (!token) {
        return next(new ErrorHandler("Admin access required. Please login as admin.", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        
        // Verify the user is an admin
        const admin = await Admin.findById(decoded.id);
        
        if (!admin) {
            return next(new ErrorHandler("Admin not found. Please login again.", 401));
        }
        
        if (!admin.isActive) {
            return next(new ErrorHandler("Admin account is deactivated.", 401));
        }
        
        if (admin.role !== 'admin') {
            return next(new ErrorHandler("Admin access required.", 403));
        }
        
        req.id = admin._id;
        req.admin = admin;
        req.userRole = admin.role;
        
        next();
    } catch (error) {
        // Clear cookie if token is invalid or expired
        if (cookieToken) {
            res.clearCookie('adminToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return next(new ErrorHandler("Invalid token. Please log in again.", 401));
        } else if (error.name === 'TokenExpiredError') {
            return next(new ErrorHandler("Token has expired. Please log in again.", 401));
        }
        return next(new ErrorHandler("Authentication failed. Please log in again.", 401));
    }
});

// Middleware to check if user has admin role (can be used after general authentication)
exports.requireAdminRole = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return next(new ErrorHandler("Admin access required.", 403));
    }
    next();
};