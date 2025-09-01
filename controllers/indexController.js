const Admin = require('../models/admin');
const ErrorHandler = require('../utils/ErrorHandler');
const { catchAsyncErrors } = require('../middlewares/catchAsyncError');
const { sendToken } = require('../utils/sendToken');
const jwt = require('jsonwebtoken');

// @desc    Check authentication status
// @route   GET /api/v1/admin/auth-status
// @access  Public
exports.checkAuthStatus = catchAsyncErrors(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.adminToken;
    
    let token;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (cookieToken) {
        token = cookieToken;
    }
    
    if (!token) {
        return res.status(401).json({
            success: false,
            authenticated: false,
            message: 'No token found'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        const admin = await Admin.findById(decoded.id);
        
        if (!admin || !admin.isActive) {
            // Clear invalid cookie
            res.clearCookie('adminToken');
            return res.status(401).json({
                success: false,
                authenticated: false,
                message: 'Invalid or inactive admin'
            });
        }
        
        res.status(200).json({
            success: true,
            authenticated: true,
            admin: {
                id: admin._id,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        // Clear invalid cookie
        res.clearCookie('adminToken');
        return res.status(401).json({
            success: false,
            authenticated: false,
            message: 'Invalid or expired token'
        });
    }
});

exports.registerAdmin = catchAsyncErrors(async (req, res, next) => {
    const { email, password, adminKey } = req.body;

    // Check if admin key is provided (optional security measure)
    const requiredAdminKey = process.env.ADMIN_REGISTRATION_KEY;
    if (requiredAdminKey && adminKey !== requiredAdminKey) {
        return next(new ErrorHandler('Invalid admin registration key', 403));
    }

    // Check if email and password are provided
    if (!email || !password) {
        return next(new ErrorHandler('Please provide email and password', 400));
    }

    if (password.length < 6) {
        return next(new ErrorHandler('Password must be at least 6 characters', 400));
    }

    // Check if admin with email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
        return next(new ErrorHandler('Admin with this email already exists', 400));
    }

    // Create new admin
    const admin = await Admin.create({
        email,
        password
    });

    // Send token response
    sendToken(admin, 201, res);
});

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public

exports.loginAdmin = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return next(new ErrorHandler('Please provide both email and password', 400));
    }

    // Find admin and include password in selection
    const admin = await Admin.findOne({ email }).select('+password');

    // Check if admin exists
    if (!admin) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    // Check if admin is active
    if (!admin.isActive) {
        return next(new ErrorHandler('Admin account is deactivated', 401));
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    // Send token response
    sendToken(admin, 200, res);
});

exports.logoutAdmin = catchAsyncErrors(async (req, res, next) => {
    // Clear cookie with multiple methods to ensure removal
    res.clearCookie('adminToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });
    
    // Also set an expired cookie as backup
    res.cookie('adminToken', '', {
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });

    res.status(200).json({
        success: true,
        message: 'Admin logged out successfully',
    });
});

exports.getAdminProfile = catchAsyncErrors(async (req, res, next) => {
    const admin = await Admin.findById(req.id);
    
    if (!admin) {
        return next(new ErrorHandler('Admin not found', 404));
    }

    res.status(200).json({
        success: true,
        admin: {
            id: admin._id,
            email: admin.email,
            role: admin.role,
            isActive: admin.isActive,
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt
        }
    });
});

exports.updateAdminPassword = catchAsyncErrors(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return next(new ErrorHandler('Please provide both current and new password', 400));
    }

    if (newPassword.length < 6) {
        return next(new ErrorHandler('New password must be at least 6 characters', 400));
    }

    // Get admin with password
    const admin = await Admin.findById(req.id).select('+password');
    
    if (!admin) {
        return next(new ErrorHandler('Admin not found', 404));
    }

    // Check current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
        return next(new ErrorHandler('Current password is incorrect', 400));
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
        success: true,
        message: 'Password updated successfully'
    });
});

// @desc    Create first admin (for setup)
// @route   POST /api/admin/setup
// @access  Public (only if no admin exists)
exports.setupFirstAdmin = catchAsyncErrors(async (req, res, next) => {
    // Check if any admin already exists
    const existingAdmin = await Admin.countDocuments();
    
    if (existingAdmin > 0) {
        return next(new ErrorHandler('Admin setup already completed', 400));
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Please provide email and password', 400));
    }

    if (password.length < 6) {
        return next(new ErrorHandler('Password must be at least 6 characters', 400));
    }

    // Create first admin
    const admin = await Admin.create({
        email,
        password
    });

    sendToken(admin, 201, res);
});