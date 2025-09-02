const SiteSettings = require('../models/siteSettings');
const ErrorHandler = require('../utils/ErrorHandler');
const { catchAsyncErrors } = require('../middlewares/catchAsyncError');
const { uploadToCloudinary, uploadVideoToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// Get all site settings
exports.getSiteSettings = catchAsyncErrors(async (req, res, next) => {
    let siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        siteSettings = await SiteSettings.create({
            heroSection: { heroTitle: 'Welcome to Real Estate' },
            aboutUsSection: { 
                title: 'About Us',
                ourVision: { 
                    title: 'Our Vision',
                    content: 'To be the leading real estate company'
                }
            }
        });
    }
    
    res.status(200).json({
        success: true,
        siteSettings
    });
});

// Update hero section
exports.updateHeroSection = catchAsyncErrors(async (req, res, next) => {
    const { heroTitle } = req.body;
    
    let siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    // Handle hero title update
    if (heroTitle) {
        siteSettings.heroSection.heroTitle = heroTitle;
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
    
    // Handle title update
    if (title) {
        siteSettings.aboutUsSection.title = title;
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
        if (vision.title) siteSettings.aboutUsSection.ourVision.title = vision.title;
        if (vision.content) siteSettings.aboutUsSection.ourVision.content = vision.content;
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

// Get projects by type
exports.getProjectsByType = catchAsyncErrors(async (req, res, next) => {
    const { projectType } = req.params;
    
    const validTypes = ['residential', 'commercial', 'lands', 'odProjects', 'osusEyes'];
    if (!validTypes.includes(projectType)) {
        return next(new ErrorHandler('Invalid project type', 400));
    }
    
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    const projects = siteSettings.getActiveProjectsByType(projectType);
    
    res.status(200).json({
        success: true,
        projectType,
        sectionTitle: siteSettings.projectsSection[projectType].sectionTitle,
        projects
    });
});

// Add new project
exports.addProject = catchAsyncErrors(async (req, res, next) => {
    const { projectType } = req.params;
    const { title, description, location } = req.body;
    
    const validTypes = ['residential', 'commercial', 'lands', 'odProjects', 'osusEyes'];
    if (!validTypes.includes(projectType)) {
        return next(new ErrorHandler('Invalid project type', 400));
    }
    
    if (!title) {
        return next(new ErrorHandler('Project title is required', 400));
    }
    
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    // Prepare project data
    const projectData = {
        title,
        description: description || '',
        location: location || '',
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
        await siteSettings.addProject(projectType, projectData);
        
        res.status(201).json({
            success: true,
            message: `Project added to ${projectType} section successfully`,
            project: projectData
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Update project
exports.updateProject = catchAsyncErrors(async (req, res, next) => {
    const { projectType, projectId } = req.params;
    const { title, description, location, status, isActive } = req.body;
    
    const validTypes = ['residential', 'commercial', 'lands', 'odProjects', 'osusEyes'];
    if (!validTypes.includes(projectType)) {
        return next(new ErrorHandler('Invalid project type', 400));
    }
    
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    const project = siteSettings.getProjectById(projectType, projectId);
    
    if (!project) {
        return next(new ErrorHandler('Project not found', 404));
    }
    
    // Update text fields
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (location !== undefined) project.location = location;
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
            const heroImageResult = await uploadToCloudinary(req.files.heroImage, `realestate/projects/${projectType}`);
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
    const { projectType, projectId } = req.params;
    
    const validTypes = ['residential', 'commercial', 'lands', 'odProjects', 'osusEyes'];
    if (!validTypes.includes(projectType)) {
        return next(new ErrorHandler('Invalid project type', 400));
    }
    
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    try {
        // Get the project to delete associated Cloudinary files
        const project = siteSettings.getProjectById(projectType, projectId);
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
        await siteSettings.removeProject(projectType, projectId);
        
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
    const { projectType, projectId } = req.params;
    const { caption } = req.body;
    
    const validTypes = ['residential', 'commercial', 'lands', 'odProjects', 'osusEyes'];
    if (!validTypes.includes(projectType)) {
        return next(new ErrorHandler('Invalid project type', 400));
    }
    
    if (!req.files || !req.files.image) {
        return next(new ErrorHandler('Image file is required', 400));
    }
    
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    try {
        // Upload image to cloudinary
        const imageResult = await uploadToCloudinary(req.files.image, `realestate/projects/${projectType}/gallery`);
        
        const imageData = { 
            image: imageResult, 
            caption: caption || '' 
        };
        
        await siteSettings.addToProjectGallery(projectType, projectId, imageData);
        
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
    const { projectType, projectId, imageId } = req.params;
    
    const validTypes = ['residential', 'commercial', 'lands', 'odProjects', 'osusEyes'];
    if (!validTypes.includes(projectType)) {
        return next(new ErrorHandler('Invalid project type', 400));
    }
    
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    try {
        // Get the image to delete from cloudinary
        const project = siteSettings.getProjectById(projectType, projectId);
        if (project) {
            const imageToDelete = project.gallery.id(imageId);
            if (imageToDelete && imageToDelete.image.fileId) {
                await deleteFromCloudinary(imageToDelete.image.fileId);
            }
        }
        
        await siteSettings.removeFromProjectGallery(projectType, projectId, imageId);
        
        res.status(200).json({
            success: true,
            message: 'Image removed from gallery successfully'
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Update project section title
exports.updateProjectSectionTitle = catchAsyncErrors(async (req, res, next) => {
    const { projectType } = req.params;
    const { sectionTitle } = req.body;
    
    const validTypes = ['residential', 'commercial', 'lands', 'odProjects', 'osusEyes'];
    if (!validTypes.includes(projectType)) {
        return next(new ErrorHandler('Invalid project type', 400));
    }
    
    if (!sectionTitle) {
        return next(new ErrorHandler('Section title is required', 400));
    }
    
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    siteSettings.projectsSection[projectType].sectionTitle = sectionTitle;
    siteSettings.lastUpdatedBy = req.id;
    await siteSettings.save();
    
    res.status(200).json({
        success: true,
        message: `${projectType} section title updated successfully`,
        sectionTitle
    });
});

// Get all projects sections summary
exports.getAllProjectsSections = catchAsyncErrors(async (req, res, next) => {
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    const projectsSummary = {
        residential: {
            sectionTitle: siteSettings.projectsSection.residential.sectionTitle,
            projectCount: siteSettings.getActiveProjectsByType('residential').length
        },
        commercial: {
            sectionTitle: siteSettings.projectsSection.commercial.sectionTitle,
            projectCount: siteSettings.getActiveProjectsByType('commercial').length
        },
        lands: {
            sectionTitle: siteSettings.projectsSection.lands.sectionTitle,
            projectCount: siteSettings.getActiveProjectsByType('lands').length
        },
        odProjects: {
            sectionTitle: siteSettings.projectsSection.odProjects.sectionTitle,
            projectCount: siteSettings.getActiveProjectsByType('odProjects').length
        },
        osusEyes: {
            sectionTitle: siteSettings.projectsSection.osusEyes.sectionTitle,
            projectCount: siteSettings.getActiveProjectsByType('osusEyes').length
        }
    };
    
    res.status(200).json({
        success: true,
        projectsSummary
    });
});
