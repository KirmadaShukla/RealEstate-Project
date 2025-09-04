const Contact = require('../models/contact');
const ErrorHandler = require('../utils/ErrorHandler');
const { catchAsyncErrors } = require('../middlewares/catchAsyncError');

// Submit contact form
exports.submitContactForm = catchAsyncErrors(async (req, res, next) => {
    const { name, email, phone, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
        return next(new ErrorHandler('Please provide all required fields: name, email, subject, and message', 400));
    }
    
 
    // Create contact document
    const contactData = {
        name,
        email,
        phone: phone || '',
        subject,
        message,
    };
    
    const contact = await Contact.create(contactData);
    
    res.status(201).json({
        success: true,
        message: 'Contact form submitted successfully',
        contact
    });
});

// Get all contact submissions (admin only)
exports.getAllContacts = catchAsyncErrors(async (req, res, next) => {
    const contacts = await Contact.getAllContacts();
    
    res.status(200).json({
        success: true,
        count: contacts.length,
        contacts
    });
});

// Get contact by ID (admin only)
exports.getContactById = catchAsyncErrors(async (req, res, next) => {
    const { contactId } = req.params;
    
    const contact = await Contact.getContactById(contactId);
    
    if (!contact) {
        return next(new ErrorHandler('Contact submission not found', 404));
    }
    
    res.status(200).json({
        success: true,
        contact
    });
});

// Delete contact (admin only)
exports.deleteContact = catchAsyncErrors(async (req, res, next) => {
    const { contactId } = req.params;
    
    const contact = await Contact.getContactById(contactId);
    
    if (!contact) {
        return next(new ErrorHandler('Contact submission not found', 404));
    }
    
    await contact.remove();
    
    res.status(200).json({
        success: true,
        message: 'Contact submission deleted successfully'
    });
});