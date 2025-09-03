const express = require('express');
const router = express.Router();

const { isAdminAuthenticated } = require('../middlewares/auth');
const {
    getSiteSettings,
    updateHeroSection,
    updateAboutUsSection,
    getAllProjects,
    addProject,
    updateProject,
    deleteProject,
    addImageToGallery,
    removeImageFromGallery,
    updateProjectsSectionTitle,
    getAllProjectTypes,
    getProjectById
} = require('../controllers/siteSettingsController');

router.get('/', getSiteSettings)

router.put('/hero-section', isAdminAuthenticated, updateHeroSection)

router.put('/about-us', isAdminAuthenticated, updateAboutUsSection)

router.get('/projects', getAllProjects)

router.get('/project-types', getAllProjectTypes)

router.get('/projects/:projectId', getProjectById)

router.post('/projects', isAdminAuthenticated, addProject)

router.put('/projects/section-title', isAdminAuthenticated, updateProjectsSectionTitle)

router.put('/projects/:projectId', isAdminAuthenticated, updateProject)

router.delete('/projects/:projectId', isAdminAuthenticated, deleteProject)

router.post('/projects/:projectId/gallery', isAdminAuthenticated, addImageToGallery)

router.delete('/projects/:projectId/gallery/:imageId', isAdminAuthenticated, removeImageFromGallery)

module.exports = router;