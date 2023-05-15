const express = require('express')
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const campground = require('../models/campground.js');
const { campgroundSchema } = require('../schemas');
const controllerCampgrounds = require('../controllers/campgrounds')
const { isLoggedin, isAuthor, validateCampground } = require('../middleware')
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })


router.route('/')
    .get(catchAsync(controllerCampgrounds.index))
    .post(isLoggedin, upload.array('image'), validateCampground, catchAsync(controllerCampgrounds.createcampground))

router.route('/search')
    .get(catchAsync(controllerCampgrounds.search))   

router.get('/new', isLoggedin, controllerCampgrounds.newcampgroundform)

router.route('/:id')
    .get(catchAsync(controllerCampgrounds.showcampground))
    .put(isLoggedin, isAuthor, upload.array('image'), validateCampground, catchAsync(controllerCampgrounds.editcampground))
    .delete(isAuthor, catchAsync(controllerCampgrounds.deletecampground))

router.get('/:id/edit', isLoggedin, isAuthor, catchAsync(controllerCampgrounds.editform))


module.exports = router