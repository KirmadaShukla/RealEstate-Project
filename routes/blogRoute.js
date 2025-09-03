const express = require('express');
const router = express.Router();

const { isAdminAuthenticated } = require('../middlewares/auth');
const {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog
} = require('../controllers/blogController');

// Public routes
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);

// Admin routes
router.post('/', isAdminAuthenticated, createBlog);
router.put('/:id', isAdminAuthenticated, updateBlog);
router.delete('/:id', isAdminAuthenticated, deleteBlog);

module.exports = router;