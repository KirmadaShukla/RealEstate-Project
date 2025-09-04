const express = require('express');
const router = express.Router();

const { isAdminAuthenticated } = require('../middlewares/auth');
const {
    getAllLeaders,
    getLeaderById,
    createLeader,
    updateLeader,
    deleteLeader
} = require('../controllers/leadershipController');

// Public routes
router.get('/', getAllLeaders);
router.get('/:id', getLeaderById);

// Admin routes
router.post('/', isAdminAuthenticated, createLeader);
router.put('/:id', isAdminAuthenticated, updateLeader);
router.delete('/:id', isAdminAuthenticated, deleteLeader);

module.exports = router;