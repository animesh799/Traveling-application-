const campground = require('../models/campground')
const Review = require('../models/review')

module.exports.createreview = async (req, res) => {
    const foundCampground = await campground.findById(req.params.id)
    const review = new Review(req.body.review);
    review.author = req.user._id
    foundCampground.reviews.push(review)
    await review.save()
    await foundCampground.save()
    // console.log(foundCampground)
    req.flash('success', 'Sucessfully created new review')
    res.redirect(`/campgrounds/${foundCampground._id}`)
}


module.exports.deletereview = async (req, res) => {
    const { id, reviewId } = req.params;
    await campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Sucessfully deleted the review')
    res.redirect(`/campgrounds/${id}`)
}