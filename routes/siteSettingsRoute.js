const express = require('express');
const router = express.Router();

const { isAdminAuthenticated } = require('../middlewares/auth');
const {
    getSiteSettings,
    updateHeroSection,
    updateAboutUsSection,
    getProjectsByType,
    addProject,
    updateProject,
    deleteProject,
    addImageToGallery,
    removeImageFromGallery,
    updateProjectSectionTitle,
    getAllProjectsSections
} = require('../controllers/siteSettingsController');

router.get('/', getSiteSettings)

router.put('/hero-section', isAdminAuthenticated, updateHeroSection)

router.put('/about-us', isAdminAuthenticated, updateAboutUsSection)

router.get('/projects', getAllProjectsSections)

router.get('/projects/:projectType', getProjectsByType)

router.post('/projects/:projectType', isAdminAuthenticated, addProject)

router.put('/projects/:projectType/section-title', isAdminAuthenticated, updateProjectSectionTitle)

router.put('/projects/:projectType/:projectId', isAdminAuthenticated, updateProject)

router.delete('/projects/:projectType/:projectId', isAdminAuthenticated, deleteProject)

router.post('/projects/:projectType/:projectId/gallery', isAdminAuthenticated, addImageToGallery)

router.delete('/projects/:projectType/:projectId/gallery/:imageId', isAdminAuthenticated, removeImageFromGallery)

module.exports = router;