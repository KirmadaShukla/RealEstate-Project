const mongoose = require('mongoose');

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
        heroTitle: {
            type: String,
            required: [true, 'Hero title is required'],
            maxlength: [200, 'Hero title cannot exceed 200 characters']
        }
    },

    // About Us Section
    aboutUsSection: {
        title: {
            type: String,
            required: [true, 'About Us title is required'],
            maxlength: [100, 'About Us title cannot exceed 100 characters']
        },
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
            title: {
                type: String,
                required: [true, 'Vision title is required'],
                maxlength: [100, 'Vision title cannot exceed 100 characters']
            },
            content: {
                type: String,
                required: [true, 'Vision content is required']
            },
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
        sectionTitle: {
            type: String,
            default: 'Projects',
            maxlength: [100, 'Projects section title cannot exceed 100 characters']
        },
        projects: [{
            projectType: {
                type: String,
                required: [true, 'Project type is required'],
                maxlength: [50, 'Project type cannot exceed 50 characters']
            },
            title: {
                type: String,
                required: [true, 'Project title is required'],
                maxlength: [150, 'Project title cannot exceed 150 characters']
            },
            description: {
                type: String,
                maxlength: [500, 'Project description cannot exceed 500 characters']
            },
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
                caption: {
                    type: String,
                    maxlength: [200, 'Caption cannot exceed 200 characters']
                }
            }],
            location: {
                type: String,
                maxlength: [100, 'Location cannot exceed 100 characters']
            },
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

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);