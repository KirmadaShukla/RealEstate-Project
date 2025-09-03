const express = require('express');
const router = express.Router();

const { isAdminAuthenticated } = require('../middlewares/auth');
const {
    submitContactForm,
    getAllContacts,
    getContactById,
    deleteContact
} = require('../controllers/contactController');

// Public route - submit contact form
router.post('/submit', submitContactForm);

// Admin routes
router.get('/', isAdminAuthenticated, getAllContacts);
router.get('/:contactId', isAdminAuthenticated, getContactById);
router.delete('/:contactId', isAdminAuthenticated, deleteContact);

module.exports = router;