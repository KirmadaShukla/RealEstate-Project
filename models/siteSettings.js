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

    // Projects Section
    projectsSection: {
        // Residential Projects
        residential: {
            sectionTitle: {
                type: String,
                default: 'Residential Projects',
                maxlength: [100, 'Residential section title cannot exceed 100 characters']
            },
            projects: [{
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

        // Commercial Projects
        commercial: {
            sectionTitle: {
                type: String,
                default: 'Commercial Projects',
                maxlength: [100, 'Commercial section title cannot exceed 100 characters']
            },
            projects: [{
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
            }]
        },

        // Lands Projects
        lands: {
            sectionTitle: {
                type: String,
                default: 'Lands',
                maxlength: [100, 'Lands section title cannot exceed 100 characters']
            },
            projects: [{
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
                isActive: {
                    type: Boolean,
                    default: true
                }
            }]
        },

        // OD Projects
        odProjects: {
            sectionTitle: {
                type: String,
                default: 'OD Projects',
                maxlength: [100, 'OD Projects section title cannot exceed 100 characters']
            },
            projects: [{
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
                isActive: {
                    type: Boolean,
                    default: true
                }
            }]
        },

        // OSUS Eyes Projects
        osusEyes: {
            sectionTitle: {
                type: String,
                default: 'OSUS Eyes',
                maxlength: [100, 'OSUS Eyes section title cannot exceed 100 characters']
            },
            projects: [{
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
                isActive: {
                    type: Boolean,
                    default: true
                }
            }]
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

// Method to add project to a section
siteSettingsSchema.methods.addProject = function(projectType, projectData) {
    if (this.projectsSection[projectType] && this.projectsSection[projectType].projects) {
        this.projectsSection[projectType].projects.push(projectData);
        return this.save();
    }
    throw new Error(`Invalid project type: ${projectType}`);
};

// Method to remove project from a section
siteSettingsSchema.methods.removeProject = function(projectType, projectId) {
    if (this.projectsSection[projectType] && this.projectsSection[projectType].projects) {
        const project = this.projectsSection[projectType].projects.id(projectId);
        if (project) {
            this.projectsSection[projectType].projects.pull(projectId);
            return this.save();
        }
        throw new Error(`Project not found with id: ${projectId}`);
    }
    throw new Error(`Invalid project type: ${projectType}`);
};

// Method to add image to project gallery
siteSettingsSchema.methods.addToProjectGallery = function(projectType, projectId, imageData) {
    if (this.projectsSection[projectType] && this.projectsSection[projectType].projects) {
        const project = this.projectsSection[projectType].projects.id(projectId);
        if (project) {
            project.gallery.push(imageData);
            return this.save();
        }
        throw new Error(`Project not found with id: ${projectId}`);
    }
    throw new Error(`Invalid project type: ${projectType}`);
};

// Method to remove image from project gallery
siteSettingsSchema.methods.removeFromProjectGallery = function(projectType, projectId, imageId) {
    if (this.projectsSection[projectType] && this.projectsSection[projectType].projects) {
        const project = this.projectsSection[projectType].projects.id(projectId);
        if (project) {
            project.gallery.pull(imageId);
            return this.save();
        }
        throw new Error(`Project not found with id: ${projectId}`);
    }
    throw new Error(`Invalid project type: ${projectType}`);
};

// Method to get active projects by type
siteSettingsSchema.methods.getActiveProjectsByType = function(projectType) {
    if (this.projectsSection[projectType] && this.projectsSection[projectType].projects) {
        return this.projectsSection[projectType].projects.filter(project => project.isActive);
    }
    return [];
};

// Method to get project by ID
siteSettingsSchema.methods.getProjectById = function(projectType, projectId) {
    if (this.projectsSection[projectType] && this.projectsSection[projectType].projects) {
        return this.projectsSection[projectType].projects.id(projectId);
    }
    return null;
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);