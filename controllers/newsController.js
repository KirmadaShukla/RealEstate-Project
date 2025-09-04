const News = require('../models/news');
const ErrorHandler = require('../utils/ErrorHandler');
const { catchAsyncErrors } = require('../middlewares/catchAsyncError');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// Get all active news
exports.getAllNews = catchAsyncErrors(async (req, res, next) => {
    const lang = req.query.lang || 'en'; // Get language from query parameter, default to 'en'
    const news = await News.getActiveNews();
    
    // Translate news to requested language
    const translatedNews = news.map(item => item.getContentInLanguage(lang));
    
    res.status(200).json({
        success: true,
        news: translatedNews
    });
});

// Get single news by ID
exports.getNewsById = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const lang = req.query.lang || 'en'; // Get language from query parameter, default to 'en'
    
    const newsItem = await News.getNewsById(id);
    
    if (!newsItem) {
        return next(new ErrorHandler('News not found', 404));
    }
    
    if (!newsItem.isActive) {
        return next(new ErrorHandler('News is not active', 404));
    }
    
    // Translate news to requested language
    const translatedNews = newsItem.getContentInLanguage(lang);
    
    res.status(200).json({
        success: true,
        news: translatedNews
    });
});

// Create new news
exports.addNews = catchAsyncErrors(async (req, res, next) => {
    const { title, content } = req.body;
    
    // Validate input - now we expect title and content to be objects with en and ar properties
    if (!title || !content) {
        return next(new ErrorHandler('Please provide title and content', 400));
    }
    
    // Prepare news data with multi-language support
    const newsData = {
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
            const imageResult = await uploadToCloudinary(req.files.image, 'realestate/news');
            newsData.image = imageResult;
        } catch (error) {
            return next(new ErrorHandler(error.message, 400));
        }
    } else {
        newsData.image = { url: '', fileId: '' };
    }
    
    const news = await News.create(newsData);
    
    res.status(201).json({
        success: true,
        message: 'News created successfully',
        news
    });
});

// Update news
exports.updateNews = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { title, content, isActive } = req.body;
    
    let news = await News.findById(id);
    
    if (!news) {
        return next(new ErrorHandler('News not found', 404));
    }
    
    // Update text fields with multi-language support
    if (title !== undefined) {
        news.title.en = title.en || title || news.title.en;
        news.title.ar = title.ar || news.title.ar;
    }
    
    if (content !== undefined) {
        news.content.en = content.en || content || news.content.en;
        news.content.ar = content.ar || news.content.ar;
    }
    
    if (isActive !== undefined) news.isActive = isActive;
    
    // Handle image update
    if (req.files && req.files.image) {
        try {
            // Delete old image if exists
            if (news.image && news.image.fileId) {
                await deleteFromCloudinary(news.image.fileId);
            }
            
            // Upload new image
            const imageResult = await uploadToCloudinary(req.files.image, 'realestate/news');
            news.image = imageResult;
        } catch (error) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
    
    await news.save();
    
    res.status(200).json({
        success: true,
        message: 'News updated successfully',
        news
    });
});

// Delete news
exports.deleteNews = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    
    const news = await News.findById(id);
    
    if (!news) {
        return next(new ErrorHandler('News not found', 404));
    }
    
    try {
        // Delete image from Cloudinary if exists
        if (news.image && news.image.fileId) {
            await deleteFromCloudinary(news.image.fileId);
        }
        
        // Remove news from database
        await news.remove();
        
        res.status(200).json({
            success: true,
            message: 'News and associated files deleted successfully'
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});