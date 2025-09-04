const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    subject: {
        type: String,
        trim: true,
    },
    message: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for better performance
contactSchema.index({ createdAt: -1 });
contactSchema.index({ email: 1 });

// Static method to get all contacts
contactSchema.statics.getAllContacts = async function() {
    return await this.find().sort({ createdAt: -1 });
};

// Static method to get contact by ID
contactSchema.statics.getContactById = async function(contactId) {
    return await this.findById(contactId);
};

module.exports = mongoose.model('Contact', contactSchema);