const SiteSettings = require('../models/siteSettings');
const ErrorHandler = require('../utils/ErrorHandler');
const { catchAsyncErrors } = require('../middlewares/catchAsyncError');
const { uploadToCloudinary, uploadVideoToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// Get all site settings
exports.getSiteSettings = catchAsyncErrors(async (req, res, next) => {
    let siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        siteSettings = await SiteSettings.create({
            heroSection: { heroTitle: { en: 'Welcome to Real Estate', ar: 'مرحبا بكم في العقارات' } },
            aboutUsSection: { 
                title: { en: 'About Us', ar: 'عنّا' },
                ourVision: { 
                    title: { en: 'Our Vision', ar: 'رؤيتنا' },
                    content: { en: 'To be the leading real estate company', ar: 'أن نكون الشركة الرائدة في مجال العقارات' }
                }
            },
            socialMediaLinks: {
                facebook: '#',
                twitter: '#',
                linkedin: '#',
                instagram: '#',
                youtube: '#'
            },
            languageSettings: {
                defaultLanguage: 'en',
                supportedLanguages: [
                    { code: 'en', name: 'English', direction: 'ltr' },
                    { code: 'ar', name: 'Arabic', direction: 'rtl' }
                ]
            }
        });
    }
    
    // Get language from query parameter or default to 'en'
    const language = req.query.lang || 'en';
    
    // Get content in the requested language
    const translatedSettings = siteSettings.getContentInLanguage(language);
    
    res.status(200).json({
        success: true,
        siteSettings: {
            ...translatedSettings,
            languageSettings: siteSettings.getLanguageSettings(),
            socialMediaLinks: siteSettings.socialMediaLinks
        }
    });
});

// Update hero section
exports.updateHeroSection = catchAsyncErrors(async (req, res, next) => {
    const { heroTitle } = req.body;
    
    let siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    // Handle hero title update (multi-language)
    if (heroTitle) {
        if (typeof heroTitle === 'string') {
            // If it's a string, update the default language (en)
            siteSettings.heroSection.heroTitle.en = heroTitle;
        } else if (typeof heroTitle === 'object') {
            // If it's an object, update all provided languages
            Object.keys(heroTitle).forEach(lang => {
                if (['en', 'ar'].includes(lang)) {
                    siteSettings.heroSection.heroTitle[lang] = heroTitle[lang];
                }
            });
        }
    }
    
    // Handle hero video upload
    if (req.files && req.files.heroVideo) {
        try {
            // Delete old video if exists
            if (siteSettings.heroSection.heroVideo && siteSettings.heroSection.heroVideo.fileId) {
                await deleteFromCloudinary(siteSettings.heroSection.heroVideo.fileId);
            }
            
            // Upload new video
            const videoResult = await uploadVideoToCloudinary(req.files.heroVideo, 'realestate/hero');
            siteSettings.heroSection.heroVideo = videoResult;
        } catch (error) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
    
    siteSettings.lastUpdatedBy = req.id;
    await siteSettings.save();
    
    res.status(200).json({
        success: true,
        message: 'Hero section updated successfully',
        heroSection: siteSettings.heroSection
    });
});

// Update about us section
exports.updateAboutUsSection = catchAsyncErrors(async (req, res, next) => {
    const { title, vision } = req.body;
    
    let siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    // Handle title update (multi-language)
    if (title) {
        if (typeof title === 'string') {
            // If it's a string, update the default language (en)
            siteSettings.aboutUsSection.title.en = title;
        } else if (typeof title === 'object') {
            // If it's an object, update all provided languages
            Object.keys(title).forEach(lang => {
                if (['en', 'ar'].includes(lang)) {
                    siteSettings.aboutUsSection.title[lang] = title[lang];
                }
            });
        }
    }
    
    // Handle main about us image upload
    if (req.files && req.files.aboutImage) {
        try {
            // Delete old image if exists
            if (siteSettings.aboutUsSection.image && siteSettings.aboutUsSection.image.fileId) {
                await deleteFromCloudinary(siteSettings.aboutUsSection.image.fileId);
            }
            
            // Upload new image
            const imageResult = await uploadToCloudinary(req.files.aboutImage, 'realestate/about');
            siteSettings.aboutUsSection.image = imageResult;
        } catch (error) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
    
    // Handle vision section updates
    if (vision) {
        if (vision.title) {
            if (typeof vision.title === 'string') {
                siteSettings.aboutUsSection.ourVision.title.en = vision.title;
            } else if (typeof vision.title === 'object') {
                Object.keys(vision.title).forEach(lang => {
                    if (['en', 'ar'].includes(lang)) {
                        siteSettings.aboutUsSection.ourVision.title[lang] = vision.title[lang];
                    }
                });
            }
        }
        if (vision.content) {
            if (typeof vision.content === 'string') {
                siteSettings.aboutUsSection.ourVision.content.en = vision.content;
            } else if (typeof vision.content === 'object') {
                Object.keys(vision.content).forEach(lang => {
                    if (['en', 'ar'].includes(lang)) {
                        siteSettings.aboutUsSection.ourVision.content[lang] = vision.content[lang];
                    }
                });
            }
        }
    }
    
    // Handle vision image upload
    if (req.files && req.files.visionImage) {
        try {
            // Delete old vision image if exists
            if (siteSettings.aboutUsSection.ourVision.image && siteSettings.aboutUsSection.ourVision.image.fileId) {
                await deleteFromCloudinary(siteSettings.aboutUsSection.ourVision.image.fileId);
            }
            
            // Upload new vision image
            const visionImageResult = await uploadToCloudinary(req.files.visionImage, 'realestate/vision');
            siteSettings.aboutUsSection.ourVision.image = visionImageResult;
        } catch (error) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
    
    siteSettings.lastUpdatedBy = req.id;
    await siteSettings.save();
    
    res.status(200).json({
        success: true,
        message: 'About Us section updated successfully',
        aboutUsSection: siteSettings.aboutUsSection
    });
});

// Get all projects
exports.getAllProjects = catchAsyncErrors(async (req, res, next) => {
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    // Get language from query parameter or default to 'en'
    const language = req.query.lang || 'en';
    
    // Get active projects and translate content
    const projects = siteSettings.getActiveProjects();
    const translatedProjects = projects.map(project => ({
        ...project.toObject(),
        title: project.title[language] || project.title.en || '',
        description: project.description[language] || project.description.en || '',
        location: project.location[language] || project.location.en || '',
        gallery: project.gallery.map(image => ({
            ...image,
            caption: image.caption[language] || image.caption.en || ''
        }))
    }));
    
    res.status(200).json({
        success: true,
        projects: translatedProjects
    });
});

// Add new project
exports.addProject = catchAsyncErrors(async (req, res, next) => {
    let { projectType, title, description, location } = req.body;
    
    if (!projectType) {
        return next(new ErrorHandler('Project type is required', 400));
    }
    
    if (!title) {
        return next(new ErrorHandler('Project title is required', 400));
    }
    
    // Parse JSON strings if they're sent as strings (from form-data)
    if (typeof title === 'string') {
        try {
            title = JSON.parse(title);
        } catch (e) {
            // If parsing fails, treat as single language value
            title = { en: title, ar: '' };
        }
    }
    
    if (typeof description === 'string') {
        try {
            description = JSON.parse(description);
        } catch (e) {
            // If parsing fails, treat as single language value
            description = { en: description || '', ar: '' };
        }
    }
    
    if (typeof location === 'string') {
        try {
            location = JSON.parse(location);
        } catch (e) {
            // If parsing fails, treat as single language value
            location = { en: location || '', ar: '' };
        }
    }
    
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    // Prepare project data with multi-language support
    const projectData = {
        projectType,
        title: typeof title === 'object' ? title : { en: title, ar: title },
        description: typeof description === 'object' ? description : { en: description || '', ar: description || '' },
        location: typeof location === 'object' ? location : { en: location || '', ar: location || '' },
        isActive: true,
        gallery: []
    };
    
    // Handle hero image upload
    if (req.files && req.files.heroImage) {
        try {
            const heroImageResult = await uploadToCloudinary(req.files.heroImage, `realestate/projects/${projectType}`);
            projectData.heroImage = heroImageResult;
        } catch (error) {
            return next(new ErrorHandler(error.message, 400));
        }
    } else {
        projectData.heroImage = { url: '', fileId: '' };
    }
    
    try {
        await siteSettings.addProject(projectData);
        
        res.status(201).json({
            success: true,
            message: 'Project added successfully',
            project: projectData
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Update project
exports.updateProject = catchAsyncErrors(async (req, res, next) => {
    const { projectId } = req.params;
    let { projectType, title, description, location, status, isActive } = req.body;
    
    // Parse JSON strings if they're sent as strings (from form-data)
    if (title && typeof title === 'string') {
        try {
            title = JSON.parse(title);
        } catch (e) {
            // If parsing fails, treat as single language value
            title = { en: title, ar: '' };
        }
    }
    
    if (description && typeof description === 'string') {
        try {
            description = JSON.parse(description);
        } catch (e) {
            // If parsing fails, treat as single language value
            description = { en: description || '', ar: '' };
        }
    }
    
    if (location && typeof location === 'string') {
        try {
            location = JSON.parse(location);
        } catch (e) {
            // If parsing fails, treat as single language value
            location = { en: location || '', ar: '' };
        }
    }
    
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    const project = siteSettings.getProjectById(projectId);
    
    if (!project) {
        return next(new ErrorHandler('Project not found', 404));
    }
    
    // Update text fields with multi-language support
    if (projectType !== undefined) project.projectType = projectType;
    
    if (title !== undefined) {
        if (typeof title === 'string') {
            project.title.en = title;
        } else if (typeof title === 'object') {
            Object.keys(title).forEach(lang => {
                if (['en', 'ar'].includes(lang)) {
                    project.title[lang] = title[lang];
                }
            });
        }
    }
    
    if (description !== undefined) {
        if (typeof description === 'string') {
            project.description.en = description;
        } else if (typeof description === 'object') {
            Object.keys(description).forEach(lang => {
                if (['en', 'ar'].includes(lang)) {
                    project.description[lang] = description[lang];
                }
            });
        }
    }
    
    if (location !== undefined) {
        if (typeof location === 'string') {
            project.location.en = location;
        } else if (typeof location === 'object') {
            Object.keys(location).forEach(lang => {
                if (['en', 'ar'].includes(lang)) {
                    project.location[lang] = location[lang];
                }
            });
        }
    }
    
    if (status !== undefined) project.status = status;
    if (isActive !== undefined) project.isActive = isActive;
    
    // Handle hero image update
    if (req.files && req.files.heroImage) {
        try {
            // Delete old hero image if exists
            if (project.heroImage && project.heroImage.fileId) {
                await deleteFromCloudinary(project.heroImage.fileId);
            }
            
            // Upload new hero image
            const heroImageResult = await uploadToCloudinary(req.files.heroImage, `realestate/projects/${project.projectType || 'general'}`);
            project.heroImage = heroImageResult;
        } catch (error) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
    
    siteSettings.lastUpdatedBy = req.id;
    await siteSettings.save();
    
    res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        project
    });
});

// Delete project
exports.deleteProject = catchAsyncErrors(async (req, res, next) => {
    const { projectId } = req.params;
    
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    try {
        // Get the project to delete associated Cloudinary files
        const project = siteSettings.getProjectById(projectId);
        if (!project) {
            return next(new ErrorHandler('Project not found', 404));
        }
        
        // Delete hero image from Cloudinary if exists
        if (project.heroImage && project.heroImage.fileId) {
            await deleteFromCloudinary(project.heroImage.fileId);
        }
        
        // Delete all gallery images from Cloudinary
        if (project.gallery && project.gallery.length > 0) {
            for (const galleryItem of project.gallery) {
                if (galleryItem.image && galleryItem.image.fileId) {
                    await deleteFromCloudinary(galleryItem.image.fileId);
                }
            }
        }
        
        // Remove project from database
        await siteSettings.removeProject(projectId);
        
        res.status(200).json({
            success: true,
            message: 'Project and associated files deleted successfully'
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Add image to gallery
exports.addImageToGallery = catchAsyncErrors(async (req, res, next) => {
    const { projectId } = req.params;
    let { caption } = req.body;
    
    if (!req.files || !req.files.image) {
        return next(new ErrorHandler('Image file is required', 400));
    }
    
    // Parse JSON strings if they're sent as strings (from form-data)
    if (typeof caption === 'string') {
        try {
            caption = JSON.parse(caption);
        } catch (e) {
            // If parsing fails, treat as single language value
            caption = { en: caption || '', ar: '' };
        }
    }
    
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    try {
        // Upload image to cloudinary
        const imageResult = await uploadToCloudinary(req.files.image, `realestate/projects/gallery`);
        
        // Prepare image data with multi-language caption support
        const imageData = { 
            image: imageResult, 
            caption: typeof caption === 'object' ? caption : { en: caption || '', ar: caption || '' }
        };
        
        await siteSettings.addToProjectGallery(projectId, imageData);
        
        res.status(201).json({
            success: true,
            message: 'Image added to gallery successfully',
            imageData
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Remove image from gallery
exports.removeImageFromGallery = catchAsyncErrors(async (req, res, next) => {
    const { projectId, imageId } = req.params;
    
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    try {
        // Get the image to delete from cloudinary
        const project = siteSettings.getProjectById(projectId);
        if (project) {
            const imageToDelete = project.gallery.id(imageId);
            if (imageToDelete && imageToDelete.image.fileId) {
                await deleteFromCloudinary(imageToDelete.image.fileId);
            }
        }
        
        await siteSettings.removeFromProjectGallery(projectId, imageId);
        
        res.status(200).json({
            success: true,
            message: 'Image removed from gallery successfully'
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Update projects section title
exports.updateProjectsSectionTitle = catchAsyncErrors(async (req, res, next) => {
    const { sectionTitle } = req.body;
    
    if (!sectionTitle) {
        return next(new ErrorHandler('Section title is required', 400));
    }
    
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    // Handle section title update (multi-language)
    if (typeof sectionTitle === 'string') {
        // If it's a string, update the default language (en)
        siteSettings.projectsSection.sectionTitle.en = sectionTitle;
    } else if (typeof sectionTitle === 'object') {
        // If it's an object, update all provided languages
        Object.keys(sectionTitle).forEach(lang => {
            if (['en', 'ar'].includes(lang)) {
                siteSettings.projectsSection.sectionTitle[lang] = sectionTitle[lang];
            }
        });
    }
    
    siteSettings.lastUpdatedBy = req.id;
    await siteSettings.save();
    
    res.status(200).json({
        success: true,
        message: 'Projects section title updated successfully',
        sectionTitle: siteSettings.projectsSection.sectionTitle
    });
});

// Get all project types with count
exports.getAllProjectTypes = catchAsyncErrors(async (req, res, next) => {
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    // Get language from query parameter or default to 'en'
    const language = req.query.lang || 'en';
    
    // Get all unique project types
    const allProjects = siteSettings.getActiveProjects();
    const projectTypes = {};
    
    allProjects.forEach(project => {
        const projectTypeName = project.projectType[language] || project.projectType.en || project.projectType;
        if (projectTypes[projectTypeName]) {
            projectTypes[projectTypeName].count++;
        } else {
            projectTypes[projectTypeName] = {
                sectionTitle: projectTypeName,
                count: 1
            };
        }
    });
    
    res.status(200).json({
        success: true,
        projectTypes
    });
});

// Get project by ID
exports.getProjectById = catchAsyncErrors(async (req, res, next) => {
    const { projectId } = req.params;
    
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    const project = siteSettings.getProjectById(projectId);
    
    if (!project) {
        return next(new ErrorHandler('Project not found', 404));
    }
    
    if (!project.isActive) {
        return next(new ErrorHandler('Project is not active', 404));
    }
    
    // Get language from query parameter or default to 'en'
    const language = req.query.lang || 'en';
    
    // Translate project content
    const translatedProject = {
        ...project.toObject(),
        title: project.title[language] || project.title.en || '',
        description: project.description[language] || project.description.en || '',
        location: project.location[language] || project.location.en || '',
        gallery: project.gallery.map(image => ({
            ...image,
            caption: image.caption[language] || image.caption.en || ''
        }))
    };
    
    res.status(200).json({
        success: true,
        project: translatedProject
    });
});

// Get language settings
exports.getLanguageSettings = catchAsyncErrors(async (req, res, next) => {
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    const languageSettings = siteSettings.getLanguageSettings();
    
    res.status(200).json({
        success: true,
        languageSettings
    });
});

// Update language settings
exports.updateLanguageSettings = catchAsyncErrors(async (req, res, next) => {
    const { defaultLanguage, supportedLanguages } = req.body;
    
    let siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    // Update language settings
    if (defaultLanguage) {
        siteSettings.languageSettings.defaultLanguage = defaultLanguage;
    }
    
    if (supportedLanguages) {
        siteSettings.languageSettings.supportedLanguages = supportedLanguages;
    }
    
    siteSettings.lastUpdatedBy = req.id;
    await siteSettings.save();
    
    res.status(200).json({
        success: true,
        message: 'Language settings updated successfully',
        languageSettings: siteSettings.getLanguageSettings()
    });
});

// Update social media links
exports.updateSocialMediaLinks = catchAsyncErrors(async (req, res, next) => {
    const { facebook, twitter, linkedin, instagram, youtube } = req.body;
    
    let siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    // Update social media links
    if (facebook !== undefined) siteSettings.socialMediaLinks.facebook = facebook;
    if (twitter !== undefined) siteSettings.socialMediaLinks.twitter = twitter;
    if (linkedin !== undefined) siteSettings.socialMediaLinks.linkedin = linkedin;
    if (instagram !== undefined) siteSettings.socialMediaLinks.instagram = instagram;
    if (youtube !== undefined) siteSettings.socialMediaLinks.youtube = youtube;
    
    siteSettings.lastUpdatedBy = req.id;
    await siteSettings.save();
    
    res.status(200).json({
        success: true,
        message: 'Social media links updated successfully',
        socialMediaLinks: siteSettings.socialMediaLinks
    });
});