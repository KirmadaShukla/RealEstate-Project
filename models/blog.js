const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Blog title is required'],
        maxlength: [200, 'Blog title cannot exceed 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Blog content is required']
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
blogSchema.index({ isActive: 1 });

// Static method to get active blogs
blogSchema.statics.getActiveBlogs = async function() {
    return await this.find({ isActive: true }).sort({ createdAt: -1 });
};

// Static method to get blog by ID
blogSchema.statics.getBlogById = async function(blogId) {
    return await this.findById(blogId);
};

// Method to get active blogs
blogSchema.methods.getActiveBlogs = function() {
    return this.find({ isActive: true }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Blog', blogSchema);