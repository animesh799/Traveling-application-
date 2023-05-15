const express = require('express')
const router = express.Router({ mergeParams: true });
const ExpressError = require('../utils/ExpressError')
const catchAsync = require('../utils/catchAsync')
const campground = require('../models/campground.js');
const Review = require('../models/review');
const { validateReview, isLoggedin, isReviewAuthor } = require('../middleware')

const controllerReview = require('../controllers/review')

const { reviewSchema } = require('../schemas.js')

router.post('/', isLoggedin, validateReview, catchAsync(controllerReview.createreview))

router.delete('/:reviewId', isLoggedin, isReviewAuthor, catchAsync(controllerReview.deletereview))

module.exports = router