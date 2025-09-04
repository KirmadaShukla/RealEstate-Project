const mongoose = require('mongoose');

// Schema for multi-language fields
const multiLanguageString = {
  en: { type: String, default: '' },
  ar: { type: String, default: '' }
};

const siteSettingsSchema = new mongoose.Schema({
    // Hero Section
    heroSection: {
        heroVideo: {
            url: {
                type: String,
                default: ''
            },
            fileId: {
                type: String,
                default: ''
            }
        },
        heroTitle: multiLanguageString, // Multi-language support
        heroSubtitle: multiLanguageString, // Multi-language support
        heroDescription: multiLanguageString // Multi-language support
    },

    // About Us Section
    aboutUsSection: {
        title: multiLanguageString, // Multi-language support
        image: {
            url: {
                type: String,
                default: ''
            },
            fileId: {
                type: String,
                default: ''
            }
        },
        // Our Vision Sub-section
        ourVision: {
            title: multiLanguageString, // Multi-language support
            content: multiLanguageString, // Multi-language support
            image: {
                url: {
                    type: String,
                    default: ''
                },
                fileId: {
                    type: String,
                    default: ''
                }
            }
        }
    },

    // Projects Section - Simplified to allow any project type
    projectsSection: {
        sectionTitle: multiLanguageString, // Multi-language support
        projects: [{
            projectType: {
                type: String,
                required: [true, 'Project type is required'],
                maxlength: [50, 'Project type cannot exceed 50 characters']
            },
            title: multiLanguageString, // Multi-language support
            description: multiLanguageString, // Multi-language support
            heroImage: {
                url: {
                    type: String,
                    default: ''
                },
                fileId: {
                    type: String,
                    default: ''
                }
            },
            gallery: [{
                image: {
                    url: {
                        type: String,
                        required: true
                    },
                    fileId: {
                        type: String,
                        required: true
                    }
                },
                caption: multiLanguageString // Multi-language support
            }],
            location: multiLanguageString, // Multi-language support
            status: {
                type: String,
                enum: ['Planning', 'Under Construction', 'Completed', 'On Hold'],
                default: 'Planning'
            },
            isActive: {
                type: Boolean,
                default: true
            }
        }]
    },
    
    // Social Media Links
    socialMediaLinks: {
        facebook: {
            type: String,
            default: '#'
        },
        twitter: {
            type: String,
            default: '#'
        },
        linkedin: {
            type: String,
            default: '#'
        },
        instagram: {
            type: String,
            default: '#'
        },
        youtube: {
            type: String,
            default: '#'
        }
    },
    
    // Language Settings
    languageSettings: {
        defaultLanguage: {
            type: String,
            default: 'en',
            enum: ['en', 'ar']
        },
        supportedLanguages: {
            type: [{
                code: {
                    type: String,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                direction: {
                    type: String,
                    enum: ['ltr', 'rtl'],
                    default: 'ltr'
                }
            }],
            default: [
                { code: 'en', name: 'English', direction: 'ltr' },
                { code: 'ar', name: 'Arabic', direction: 'rtl' }
            ]
        }
    },

    // Meta Information
    isActive: {
        type: Boolean,
        default: true
    },

    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }

}, {
    timestamps: true
});

// Index for better performance
siteSettingsSchema.index({ isActive: 1 });

// Static method to get active site settings
siteSettingsSchema.statics.getActiveSiteSettings = async function() {
    return await this.findOne({ isActive: true });
};

// Method to add project
siteSettingsSchema.methods.addProject = function(projectData) {
    this.projectsSection.projects.push(projectData);
    return this.save();
};

// Method to remove project
siteSettingsSchema.methods.removeProject = function(projectId) {
    const project = this.projectsSection.projects.id(projectId);
    if (project) {
        this.projectsSection.projects.pull(projectId);
        return this.save();
    }
    throw new Error(`Project not found with id: ${projectId}`);
};

// Method to add image to project gallery
siteSettingsSchema.methods.addToProjectGallery = function(projectId, imageData) {
    const project = this.projectsSection.projects.id(projectId);
    if (project) {
        project.gallery.push(imageData);
        return this.save();
    }
    throw new Error(`Project not found with id: ${projectId}`);
};

// Method to remove image from project gallery
siteSettingsSchema.methods.removeFromProjectGallery = function(projectId, imageId) {
    const project = this.projectsSection.projects.id(projectId);
    if (project) {
        project.gallery.pull(imageId);
        return this.save();
    }
    throw new Error(`Project not found with id: ${projectId}`);
};

// Method to get active projects
siteSettingsSchema.methods.getActiveProjects = function() {
    return this.projectsSection.projects.filter(project => project.isActive);
};

// Method to get project by ID
siteSettingsSchema.methods.getProjectById = function(projectId) {
    return this.projectsSection.projects.id(projectId);
};

// Method to get projects by type
siteSettingsSchema.methods.getProjectsByType = function(projectType) {
    return this.projectsSection.projects.filter(project => project.projectType === projectType);
};

// Method to get language settings
siteSettingsSchema.methods.getLanguageSettings = function() {
    // Ensure we always return default language settings if none are set
    const defaultLanguages = [
        { code: 'en', name: 'English', direction: 'ltr' },
        { code: 'ar', name: 'Arabic', direction: 'rtl' }
    ];
    
    return {
        defaultLanguage: this.languageSettings.defaultLanguage || 'en',
        supportedLanguages: (this.languageSettings.supportedLanguages && this.languageSettings.supportedLanguages.length > 0) 
            ? this.languageSettings.supportedLanguages 
            : defaultLanguages
    };
};

// Method to get content in specific language
siteSettingsSchema.methods.getContentInLanguage = function(languageCode) {
    const settings = this.toObject();
    
    // Helper function to get content in specific language
    const translateField = (field) => {
        if (field && typeof field === 'object' && field.hasOwnProperty('en') && field.hasOwnProperty('ar')) {
            return field[languageCode] || field.en || '';
        }
        return field;
    };
    
    // Helper function to recursively translate objects
    const translateObject = (obj) => {
        if (!obj) return obj;
        
        if (Array.isArray(obj)) {
            return obj.map(item => translateObject(item));
        }
        
        if (typeof obj === 'object') {
            const translated = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    translated[key] = translateObject(obj[key]);
                }
            }
            return translated;
        }
        
        return translateField(obj);
    };
    
    // Translate the relevant sections
    const translatedSettings = {
        heroSection: {
            heroVideo: settings.heroSection.heroVideo,
            heroTitle: translateField(settings.heroSection.heroTitle)
        },
        aboutUsSection: {
            title: translateField(settings.aboutUsSection.title),
            image: settings.aboutUsSection.image,
            ourVision: {
                title: translateField(settings.aboutUsSection.ourVision.title),
                content: translateField(settings.aboutUsSection.ourVision.content),
                image: settings.aboutUsSection.ourVision.image
            }
        },
        projectsSection: {
            sectionTitle: translateField(settings.projectsSection.sectionTitle),
            projects: settings.projectsSection.projects.map(project => ({
                ...project,
                title: translateField(project.title),
                description: translateField(project.description),
                location: translateField(project.location),
                gallery: project.gallery.map(image => ({
                    ...image,
                    caption: translateField(image.caption)
                }))
            }))
        },
        socialMediaLinks: settings.socialMediaLinks
    };
    
    return translatedSettings;
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);