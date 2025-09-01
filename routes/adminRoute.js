const express=require('express')
const { registerAdmin, loginAdmin, getAdminProfile, logoutAdmin, setupFirstAdmin, updateAdminPassword, checkAuthStatus } = require('../controllers/indexController')
const { isAdminAuthenticated } = require('../middlewares/auth')
const router=express.Router()

router.post('/setup', setupFirstAdmin)

router.post('/register', registerAdmin)

router.post('/login',loginAdmin)

router.get('/auth-status', checkAuthStatus)

router.get('/profile',isAdminAuthenticated,getAdminProfile)

router.put('/update-password',isAdminAuthenticated,updateAdminPassword)

router.post('/logout',isAdminAuthenticated,logoutAdmin)

module.exports=router