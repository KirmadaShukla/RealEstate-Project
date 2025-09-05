const SiteSettings = require('../models/siteSettings');
const Leadership = require('../models/leadership');
const ErrorHandler = require('../utils/ErrorHandler');
const { catchAsyncErrors } = require('../middlewares/catchAsyncError');
const { uploadToCloudinary, uploadVideoToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// Get all site settings
exports.getSiteSettings = catchAsyncErrors(async (req, res, next) => {
    let siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        siteSettings = await SiteSettings.create({
            heroSection: { 
                heroTitle: { en: 'Welcome to Real Estate', ar: 'مرحبا بكم في العقارات' },
                heroSubtitle: { en: 'A Legacy of Transformation', ar: 'إرث من التحول' },
                heroDescription: { en: 'Beyond Buildings.', ar: 'ما وراء المباني.' }
            },
            aboutUsSection: { 
                title: { en: 'About Us', ar: 'عنّا' },
                ourMission: {
                    title: { en: 'Our Mission', ar: 'مهمّتنا' },
                    content: { en: 'To provide exceptional real estate services', ar: 'توفير خدمات عقارية استثنائية' }
                },
                ourVision: { 
                    title: { en: 'Our Vision', ar: 'رؤيتنا' },
                    content: { en: 'To be the leading real estate company', ar: 'أن نكون الشركة الرائدة في مجال العقارات' }
                },
                ourStory: {
                    title: { en: 'Our Story', ar: 'قصّتنا' },
                    content: { en: 'Our journey began with a vision to transform the real estate landscape', ar: 'بدأت رحلتنا مع رؤية لتحويل مشهد العقارات' }
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
    
    // Get all leadership members (both active and inactive)
    const leaders = await Leadership.find({}).sort({ order: 1 });
    
    // Translate leaders to requested language
    const translatedLeaders = leaders.map(leader => ({
        _id: leader._id,
        name: leader.name[language] || leader.name.en,
        designation: leader.designation[language] || leader.designation.en,
        image: leader.image,
        socialMedia: leader.socialMedia,
        order: leader.order
    }));
    
    res.status(200).json({
        success: true,
        siteSettings: {
            ...translatedSettings,
            leadershipSection: {
                ...translatedSettings.leadershipSection,
                leaders: translatedLeaders
            },
            languageSettings: siteSettings.getLanguageSettings(),
            socialMediaLinks: siteSettings.socialMediaLinks
        }
    });
});

// Get projects by type
exports.getProjectsByType = catchAsyncErrors(async (req, res, next) => {
    const { projectType } = req.params;
    const language = req.query.lang || 'en';
    
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    // Get projects by type using the model method
    const projects = siteSettings.getProjectsByType(projectType);
    
    // Filter to only include active projects
    const activeProjects = projects.filter(project => project.isActive !== false);
    
    // Get content in the requested language
    const translatedProjects = activeProjects.map(project => {
        // Helper function to get content in specific language
        const translateField = (field) => {
            if (field && typeof field === 'object' && field.hasOwnProperty('en') && field.hasOwnProperty('ar')) {
                return field[language] || field.en || '';
            }
            return field;
        };
        
        return {
            ...project,
            title: translateField(project.title),
            description: translateField(project.description),
            location: translateField(project.location),
            gallery: project.gallery ? project.gallery.map(image => ({
                ...image,
                caption: translateField(image.caption)
            })) : []
        };
    });
    
    res.status(200).json({
        success: true,
        projects: translatedProjects
    });
});

// Update hero section
exports.updateHeroSection = catchAsyncErrors(async (req, res, next) => {
    // Extract fields with bracket notation for multilingual support
    let { 
        'heroTitle[en]': heroTitleEn,
        'heroTitle[ar]': heroTitleAr,
        'heroSubtitle[en]': heroSubtitleEn,
        'heroSubtitle[ar]': heroSubtitleAr,
        'description[en]': heroDescriptionEn,
        'description[ar]': heroDescriptionAr
    } = req.body;
    
    let siteSettings = await SiteSettings.getActiveSiteSettings();
    
    
    // Handle hero title update (multi-language)
    if (heroTitleEn !== undefined || heroTitleAr !== undefined) {
        siteSettings.heroSection.heroTitle.en = heroTitleEn || '';
        siteSettings.heroSection.heroTitle.ar = heroTitleAr || '';
    }
    
    // Handle hero subtitle update (multi-language)
    if (heroSubtitleEn !== undefined || heroSubtitleAr !== undefined) {
        siteSettings.heroSection.heroSubtitle.en = heroSubtitleEn || '';
        siteSettings.heroSection.heroSubtitle.ar = heroSubtitleAr || '';
    }
    
    // Handle hero description update (multi-language)
    if (heroDescriptionEn !== undefined || heroDescriptionAr !== undefined) {
        siteSettings.heroSection.heroDescription.en = heroDescriptionEn || '';
        siteSettings.heroSection.heroDescription.ar = heroDescriptionAr || '';
    }
    
    // Handle hero video upload
    if (req.files && req.files.heroVideo) {
        // Check file size (max 10MB)
        const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
        if (req.files.heroVideo.size > maxFileSize) {
            return next(new ErrorHandler('Video file size exceeds 10MB limit', 400));
        }
        
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
    // Extract fields with bracket notation for multilingual support
    let { 
        'title[en]': titleEn,
        'title[ar]': titleAr,
        'ourMission[title][en]': missionTitleEn,
        'ourMission[title][ar]': missionTitleAr,
        'ourMission[content][en]': missionContentEn,
        'ourMission[content][ar]': missionContentAr,
        'ourVision[title][en]': visionTitleEn,
        'ourVision[title][ar]': visionTitleAr,
        'ourVision[content][en]': visionContentEn,
        'ourVision[content][ar]': visionContentAr,
        'ourStory[title][en]': storyTitleEn,
        'ourStory[title][ar]': storyTitleAr,
        'ourStory[content][en]': storyContentEn,
        'ourStory[content][ar]': storyContentAr
    } = req.body;
    
    let siteSettings = await SiteSettings.getActiveSiteSettings();
    
    // Handle title update (multi-language)
    if (titleEn !== undefined || titleAr !== undefined) {
        siteSettings.aboutUsSection.title.en = titleEn || '';
        siteSettings.aboutUsSection.title.ar = titleAr || '';
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
    
    // Handle mission section updates
    if (missionTitleEn !== undefined || missionTitleAr !== undefined) {
        siteSettings.aboutUsSection.ourMission.title.en = missionTitleEn || '';
        siteSettings.aboutUsSection.ourMission.title.ar = missionTitleAr || '';
    }
    
    if (missionContentEn !== undefined || missionContentAr !== undefined) {
        siteSettings.aboutUsSection.ourMission.content.en = missionContentEn || '';
        siteSettings.aboutUsSection.ourMission.content.ar = missionContentAr || '';
    }
    
    // Handle mission image upload
    if (req.files && req.files.missionImage) {
        try {
            // Delete old mission image if exists
            if (siteSettings.aboutUsSection.ourMission.image && siteSettings.aboutUsSection.ourMission.image.fileId) {
                await deleteFromCloudinary(siteSettings.aboutUsSection.ourMission.image.fileId);
            }
            
            // Upload new mission image
            const missionImageResult = await uploadToCloudinary(req.files.missionImage, 'realestate/mission');
            siteSettings.aboutUsSection.ourMission.image = missionImageResult;
        } catch (error) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
    
    // Handle vision section updates
    if (visionTitleEn !== undefined || visionTitleAr !== undefined) {
        siteSettings.aboutUsSection.ourVision.title.en = visionTitleEn || '';
        siteSettings.aboutUsSection.ourVision.title.ar = visionTitleAr || '';
    }
    
    if (visionContentEn !== undefined || visionContentAr !== undefined) {
        siteSettings.aboutUsSection.ourVision.content.en = visionContentEn || '';
        siteSettings.aboutUsSection.ourVision.content.ar = visionContentAr || '';
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
    
    // Handle story section updates
    if (storyTitleEn !== undefined || storyTitleAr !== undefined) {
        siteSettings.aboutUsSection.ourStory.title.en = storyTitleEn || '';
        siteSettings.aboutUsSection.ourStory.title.ar = storyTitleAr || '';
    }
    
    if (storyContentEn !== undefined || storyContentAr !== undefined) {
        siteSettings.aboutUsSection.ourStory.content.en = storyContentEn || '';
        siteSettings.aboutUsSection.ourStory.content.ar = storyContentAr || '';
    }
    
    // Handle story image upload
    if (req.files && req.files.storyImage) {
        try {
            // Delete old story image if exists
            if (siteSettings.aboutUsSection.ourStory.image && siteSettings.aboutUsSection.ourStory.image.fileId) {
                await deleteFromCloudinary(siteSettings.aboutUsSection.ourStory.image.fileId);
            }
            
            // Upload new story image
            const storyImageResult = await uploadToCloudinary(req.files.storyImage, 'realestate/story');
            siteSettings.aboutUsSection.ourStory.image = storyImageResult;
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
    // Extract fields with bracket notation for multilingual support
    let { 
        projectType,
        'title[en]': titleEn, 
        'title[ar]': titleAr, 
        'description[en]': descriptionEn, 
        'description[ar]': descriptionAr,
        'location[en]': locationEn, 
        'location[ar]': locationAr,
        status,
        isActive
    } = req.body;
    
    if (!projectType) {
        return next(new ErrorHandler('Project type is required', 400));
    }
    
    if (!titleEn && !titleAr) {
        return next(new ErrorHandler('Project title is required', 400));
    }
    
    const siteSettings = await SiteSettings.getActiveSiteSettings();
 
    
    // Prepare project data with multi-language support
    const projectData = {
        projectType,
        title: {
            en: titleEn || '',
            ar: titleAr || ''
        },
        description: {
            en: descriptionEn || '',
            ar: descriptionAr || ''
        },
        location: {
            en: locationEn || '',
            ar: locationAr || ''
        },
        status: status || '',
        isActive: isActive === 'true' || isActive === true, // Handle boolean conversion
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
    // Extract fields with bracket notation for multilingual support
    let { 
        projectType,
        'title[en]': titleEn, 
        'title[ar]': titleAr, 
        'description[en]': descriptionEn, 
        'description[ar]': descriptionAr,
        'location[en]': locationEn, 
        'location[ar]': locationAr,
        status,
        isActive
    } = req.body;
    
    const siteSettings = await SiteSettings.getActiveSiteSettings();
  
    const project = siteSettings.getProjectById(projectId);
    
    if (!project) {
        return next(new ErrorHandler('Project not found', 404));
    }
    
    // Update text fields with multi-language support only if they're provided
    if (projectType !== undefined) project.projectType = projectType;
    
    if (titleEn !== undefined || titleAr !== undefined) {
        project.title.en = titleEn || '';
        project.title.ar = titleAr || '';
    }
    
    if (descriptionEn !== undefined || descriptionAr !== undefined) {
        project.description.en = descriptionEn || '';
        project.description.ar = descriptionAr || '';
    }
    
    if (locationEn !== undefined || locationAr !== undefined) {
        project.location.en = locationEn || '';
        project.location.ar = locationAr || '';
    }
    
    if (status !== undefined) project.status = status;
    if (isActive !== undefined) project.isActive = isActive === 'true' || isActive === true;
    
    // Handle hero image update
    if (req.files && req.files.heroImage) {
        try {
            // Delete old hero image if exists
            if (project.heroImage && project.heroImage.fileId) {
                await deleteFromCloudinary(project.heroImage.fileId);
            }
            
            // Upload new hero image
            const heroImageResult = await uploadToCloudinary(req.files.heroImage, `realestate/projects/${project.projectType}`);
            project.heroImage = heroImageResult;
        } catch (error) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
    
    try {
        await siteSettings.save();
        
        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            project
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// Delete project
exports.deleteProject = catchAsyncErrors(async (req, res, next) => {
    const { projectId } = req.params;
    
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    
    
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
    // Extract fields with bracket notation for multilingual support
    let { 
        'caption[en]': captionEn,
        'caption[ar]': captionAr
    } = req.body;
    
    if (!req.files || !req.files.image) {
        return next(new ErrorHandler('Image file is required', 400));
    }
    
    const siteSettings = await SiteSettings.getActiveSiteSettings();
  
    
    try {
        // Upload image to cloudinary
        const imageResult = await uploadToCloudinary(req.files.image, `realestate/projects/gallery`);
        
        // Prepare image data with multi-language caption support
        const imageData = { 
            image: imageResult, 
            caption: {
                en: captionEn || '',
                ar: captionAr || ''
            }
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
    // Extract fields with bracket notation for multilingual support
    let { 
        'sectionTitle[en]': sectionTitleEn,
        'sectionTitle[ar]': sectionTitleAr
    } = req.body;
    
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
  
    
    // Handle section title update (multi-language)
    if (sectionTitleEn !== undefined || sectionTitleAr !== undefined) {
        siteSettings.projectsSection.sectionTitle.en = sectionTitleEn || '';
        siteSettings.projectsSection.sectionTitle.ar = sectionTitleAr || '';
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

// Get contact information
exports.getContactInfo = catchAsyncErrors(async (req, res, next) => {
    const siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    // Get language from query parameter or default to 'en'
    const language = req.query.lang || 'en';
    
    // Get content in the requested language
    const translatedContactInfo = {
        address: siteSettings.contactInfo.address ? 
            (siteSettings.contactInfo.address[language] || siteSettings.contactInfo.address.en || '') : '',
        phone: siteSettings.contactInfo.phone || '',
        email: siteSettings.contactInfo.email || '',
        workingHours: siteSettings.contactInfo.workingHours ? 
            (siteSettings.contactInfo.workingHours[language] || siteSettings.contactInfo.workingHours.en || '') : ''
    };
    
    res.status(200).json({
        success: true,
        contactInfo: translatedContactInfo
    });
});

// Update contact information
exports.updateContactInfo = catchAsyncErrors(async (req, res, next) => {
    // Extract fields with bracket notation for multilingual support
    let { 
        'address[en]': addressEn,
        'address[ar]': addressAr,
        phone,
        email,
        'workingHours[en]': workingHoursEn,
        'workingHours[ar]': workingHoursAr
    } = req.body;
    
    let siteSettings = await SiteSettings.getActiveSiteSettings();
    
    if (!siteSettings) {
        return next(new ErrorHandler('Site settings not found', 404));
    }
    
    // Initialize contactInfo if it doesn't exist
    if (!siteSettings.contactInfo) {
        siteSettings.contactInfo = {};
    }
    
    // Handle address update (multi-language)
    if (addressEn !== undefined || addressAr !== undefined) {
        if (!siteSettings.contactInfo.address) {
            siteSettings.contactInfo.address = { en: '', ar: '' };
        }
        siteSettings.contactInfo.address.en = addressEn || '';
        siteSettings.contactInfo.address.ar = addressAr || '';
    }
    
    // Handle phone update
    if (phone !== undefined) {
        siteSettings.contactInfo.phone = phone || '';
    }
    
    // Handle email update
    if (email !== undefined) {
        siteSettings.contactInfo.email = email || '';
    }
    
    // Handle working hours update (multi-language)
    if (workingHoursEn !== undefined || workingHoursAr !== undefined) {
        if (!siteSettings.contactInfo.workingHours) {
            siteSettings.contactInfo.workingHours = { en: '', ar: '' };
        }
        siteSettings.contactInfo.workingHours.en = workingHoursEn || '';
        siteSettings.contactInfo.workingHours.ar = workingHoursAr || '';
    }
    
    siteSettings.lastUpdatedBy = req.id;
    await siteSettings.save();
    
    res.status(200).json({
        success: true,
        message: 'Contact information updated successfully',
        contactInfo: siteSettings.contactInfo
    });
});
