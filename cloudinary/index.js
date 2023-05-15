const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')

cloudinary.config({
    cloud_name: process.env.COLOUDINARY_CLOUD_NAME,
    api_key: process.env.COLOUDINARY_KEY,
    api_secret: process.env.COLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'YelpCamp',
        allowedFormats: ['jpg', 'jpeg', 'png']
    }
})


module.exports = {
    cloudinary, storage
}