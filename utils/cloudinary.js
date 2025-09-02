const cloudinary = require('cloudinary').v2;

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image to cloudinary from buffer
exports.uploadToCloudinary = async (file, folder = 'realestate') => {
    try {
        // Validate file
        if (!file || !file.data) {
            throw new Error('No file data provided');
        }

        // Upload using buffer
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: 'auto',
                    use_filename: true,
                    unique_filename: true
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            ).end(file.data);
        });
        
        return {
            url: result.secure_url,
            fileId: result.public_id
        };
    } catch (error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

// Delete image from cloudinary
exports.deleteFromCloudinary = async (fileId) => {
    try {
        const result = await cloudinary.uploader.destroy(fileId);
        return result;
    } catch (error) {
        throw new Error(`Cloudinary delete failed: ${error.message}`);
    }
};

// Upload video to cloudinary from buffer
exports.uploadVideoToCloudinary = async (file, folder = 'realestate/videos') => {
    try {
        // Validate file
        if (!file || !file.data) {
            throw new Error('No file data provided');
        }

        // Upload using buffer
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: 'video',
                    use_filename: true,
                    unique_filename: true
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            ).end(file.data);
        });
        
        return {
            url: result.secure_url,
            fileId: result.public_id
        };
    } catch (error) {
        throw new Error(`Cloudinary video upload failed: ${error.message}`);
    }
};