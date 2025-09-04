const express=require('express')
const { isAdminAuthenticated } = require('../middlewares/auth')
const { getAllNews, getNewsById, addNews, updateNews, deleteNews } = require('../controllers/newsController')
const router=express.Router()

router.get('/getAllNews',getAllNews)

router.get('/getNewsById/:id',getNewsById);

router.post('/add-news',isAdminAuthenticated,addNews)

router.put('/update-news/:id',isAdminAuthenticated,updateNews)

router.delete('/delete-news/:id',isAdminAuthenticated,deleteNews)

module.exports=router