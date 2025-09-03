const Blog = require('../models/blog');
const ErrorHandler = require('../utils/ErrorHandler');
const { catchAsyncErrors } = require('../middlewares/catchAsyncError');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// Get all active blogs
exports.getAllBlogs = catchAsyncErrors(async (req, res, next) => {
    const lang = req.query.lang || 'en'; // Get language from query parameter, default to 'en'
    const blogs = await Blog.getActiveBlogs();
    
    // Translate blogs to requested language
    const translatedBlogs = blogs.map(blog => blog.getContentInLanguage(lang));
    
    res.status(200).json({
        success: true,
        blogs: translatedBlogs
    });
});

// Get single blog by ID
exports.getBlogById = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const lang = req.query.lang || 'en'; // Get language from query parameter, default to 'en'
    
    const blog = await Blog.getBlogById(id);
    
    if (!blog) {
        return next(new ErrorHandler('Blog not found', 404));
    }
    
    if (!blog.isActive) {
        return next(new ErrorHandler('Blog is not active', 404));
    }
    
    // Translate blog to requested language
    const translatedBlog = blog.getContentInLanguage(lang);
    
    res.status(200).json({
        success: true,
        blog: translatedBlog
    });
});

// Create new blog
exports.createBlog = catchAsyncErrors(async (req, res, next) => {
    const { title, content } = req.body;
    
    // Validate input - now we expect title and content to be objects with en and ar properties
    if (!title || !content) {
        return next(new ErrorHandler('Please provide title and content', 400));
    }
    
    // Prepare blog data with multi-language support
    const blogData = {
        title: {
            en: title.en || title || '',
            ar: title.ar || ''
        },
        content: {
            en: content.en || content || '',
            ar: content.ar || ''
        },
        author: req.id // Assuming req.id contains the admin ID from auth middleware
    };
    
    // Handle image upload
    if (req.files && req.files.image) {
        try {
            const imageResult = await uploadToCloudinary(req.files.image, 'realestate/blogs');
            blogData.image = imageResult;
        } catch (error) {
            return next(new ErrorHandler(error.message, 400));
        }
    } else {
        blogData.image = { url: '', fileId: '' };
    }
    
    const blog = await Blog.create(blogData);
    
    res.status(201).json({
        success: true,
        message: 'Blog created successfully',
        blog
    });
});

// Update blog
exports.updateBlog = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { title, content, isActive } = req.body;
    
    let blog = await Blog.findById(id);
    
    if (!blog) {
        return next(new ErrorHandler('Blog not found', 404));
    }
    
    // Update text fields with multi-language support
    if (title !== undefined) {
        blog.title.en = title.en || title || blog.title.en;
        blog.title.ar = title.ar || blog.title.ar;
    }
    
    if (content !== undefined) {
        blog.content.en = content.en || content || blog.content.en;
        blog.content.ar = content.ar || blog.content.ar;
    }
    
    if (isActive !== undefined) blog.isActive = isActive;
    
    // Handle image update
    if (req.files && req.files.image) {
        try {
            // Delete old image if exists
            if (blog.image && blog.image.fileId) {
                await deleteFromCloudinary(blog.image.fileId);
            }
            
            // Upload new image
            const imageResult = await uploadToCloudinary(req.files.image, 'realestate/blogs');
            blog.image = imageResult;
        } catch (error) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
    
    await blog.save();
    
    res.status(200).json({
        success: true,
        message: 'Blog updated successfully',
        blog
    });
});

// Delete blog
exports.deleteBlog = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    
    const blog = await Blog.findById(id);
    
    if (!blog) {
        return next(new ErrorHandler('Blog not found', 404));
    }
    
    try {
        // Delete image from Cloudinary if exists
        if (blog.image && blog.image.fileId) {
            await deleteFromCloudinary(blog.image.fileId);
        }
        
        // Remove blog from database
        await blog.remove();
        
        res.status(200).json({
            success: true,
            message: 'Blog and associated files deleted successfully'
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});