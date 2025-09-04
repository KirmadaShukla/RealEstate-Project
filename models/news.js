const mongoose = require('mongoose');

// Schema for multi-language fields
const multiLanguageString = {
  en: { type: String, default: '' },
  ar: { type: String, default: '' }
};

const newsSchema = new mongoose.Schema({
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
    },
    isActive: {
        type: Boolean,
        default: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, {
    timestamps: true
});

// Index for better performance
newsSchema.index({ isActive: 1 });

// Static method to get active blogs
newsSchema.statics.getActiveNews = async function() {
    return await this.find({ isActive: true }).sort({ createdAt: -1 });
};

// Static method to get blog by ID
newsSchema.statics.getNewsById = async function(blogId) {
    return await this.findById(blogId);
};

// Method to get active blogs
newsSchema.methods.getActiveNews = function() {
    return this.find({ isActive: true }).sort({ createdAt: -1 });
};

// Method to get content in specific language
newsSchema.methods.getContentInLanguage = function(languageCode) {
    const news = this.toObject();
    
    // Helper function to get content in specific language
    const translateField = (field) => {
        if (field && typeof field === 'object' && field.hasOwnProperty('en') && field.hasOwnProperty('ar')) {
            return field[languageCode] || field.en || '';
        }
        return field;
    };
    
    // Translate the relevant fields
    const translatedNews = {
        ...news,
        title: translateField(news.title),
        content: translateField(news.content)
    };
    
    return translatedNews;
};

module.exports = mongoose.model('News', newsSchema);