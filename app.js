const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { generatedErrors } = require('./middlewares/error');
const adminRouter = require('./routes/adminRoute');
const siteSettingsRouter = require('./routes/siteSettingsRoute');
const blogRouter = require('./routes/blogRoute');
const newsRouter = require('./routes/newsRoute');
const contactRouter = require('./routes/contactRoute');
const connectDB = require('./models/config');

const app = express();

app.use(express.json({ limit: '50mb' }));app.use(bodyParser.json())
app.use(fileUpload());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
    origin: ['http://localhost:8020'],
    credentials: true
}));
app.use(morgan('dev'));

connectDB();

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Real Estate API Server is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/v1/admin',adminRouter)
app.use('/api/v1/site-settings',siteSettingsRouter)
app.use('/api/v1/blogs', blogRouter)
app.use('/api/v1/contact', contactRouter)
app.use('/api/v1/news', newsRouter)
app.all('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

app.use(generatedErrors);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;