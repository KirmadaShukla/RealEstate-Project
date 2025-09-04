const mongoose = require('mongoose');
const ErrorHandler = require('../utils/ErrorHandler');

const siteSettingsSchema = new mongoose.Schema({
  heroSection: {
    heroVideo: {
      url: String,
      fileId: String
    },
    heroTitle: {
      en: String,
      ar: String
    },
    heroSubtitle: {
      en: String,
      ar: String
    },
    heroDescription: {
      en: String,
      ar: String
    }
  },
  aboutUsSection: {
    title: {
      en: String,
      ar: String
    },
    image: {
      url: String,
      fileId: String
    },
    ourVision: {
      title: {
        en: String,
        ar: String
      },
      content: {
        en: String,
        ar: String
      },
      image: {
        url: String,
        fileId: String
      }
    }
  },
  projectsSection: {
    sectionTitle: {
      en: String,
      ar: String
    },
    projects: [{
      projectType: String,
      title: {
        en: String,
        ar: String
      },
      description: {
        en: String,
        ar: String
      },
      location: {
        en: String,
        ar: String
      },
      status: String,
      year: String,
      units: Number,
      area: String,
      isActive: {
        type: Boolean,
        default: true
      },
      heroImage: {
        url: String,
        fileId: String
      },
      gallery: [{
        imageUrl: String,
        caption: {
          en: String,
          ar: String
        },
        _id: String
      }]
    }]
  },
  leadershipSection: {
    sectionTitle: {
      en: {
        type: String,
        default: 'Leadership Team'
      },
      ar: {
        type: String,
        default: 'فريق القيادة'
      }
    },
    description: {
      en: {
        type: String,
        default: 'Meet the visionaries who are leading our company towards a transformative future.'
      },
      ar: {
        type: String,
        default: 'تعرف على أصحاب الرؤى الذين يقودون شركتنا نحو مستقبل تحويلي.'
      }
    }
  },
  contactInfo: {
    address: {
      en: String,
      ar: String
    },
    phone: String,
    email: String,
    workingHours: {
      en: String,
      ar: String
    }
  },
  socialMediaLinks: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String,
    youtube: String
  },
  languageSettings: {
    defaultLanguage: {
      type: String,
      default: 'en'
    },
    supportedLanguages: [{
      code: String,
      name: String,
      direction: String
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Method to get active site settings
siteSettingsSchema.statics.getActiveSiteSettings = function() {
  return this.findOne({ isActive: true });
};

// Method to get all active projects
siteSettingsSchema.methods.getActiveProjects = function() {
    return this.projectsSection.projects.filter(project => project.isActive !== false);
};

// Method to get a project by ID
siteSettingsSchema.methods.getProjectById = function(projectId) {
    return this.projectsSection.projects.find(project => project._id.toString() === projectId);
};

// Method to get projects by type
siteSettingsSchema.methods.getProjectsByType = function(projectType) {
    return this.projectsSection.projects.filter(project => project.projectType === projectType);
};

// Method to add a new project
siteSettingsSchema.methods.addProject = function(projectData) {
    this.projectsSection.projects.push(projectData);
    return this.save();
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
        leadershipSection: {
            sectionTitle: translateField(settings.leadershipSection.sectionTitle),
            description: translateField(settings.leadershipSection.description)
        },
        contactInfo: {
            address: translateField(settings.contactInfo?.address),
            phone: settings.contactInfo?.phone || '',
            email: settings.contactInfo?.email || '',
            workingHours: translateField(settings.contactInfo?.workingHours)
        },
        socialMediaLinks: settings.socialMediaLinks
    };
    
    return translatedSettings;
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);