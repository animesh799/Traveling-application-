const campground = require('../models/campground.js');
const { cloudinary } = require('../cloudinary/index')

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAP_BOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })


module.exports.index = async (req, res) => {
    const foundCampgrounds = await campground.find({});
    res.render('campgrounds/index', { foundCampgrounds })
}


module.exports.search = async (req, res) => {
    console.log(req.body)
    const foundCampgrounds = await campground.find(req.body);
    console.log(foundCampgrounds)
}

module.exports.newcampgroundform = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createcampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()



    const newcampground = new campground(req.body.campground)
    newcampground.geometry = geoData.body.features[0].geometry
    newcampground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    newcampground.author = req.user._id;
    await newcampground.save()
    console.log(newcampground)

    req.flash('success', 'Sucessfully created new campground')
    res.redirect(`/campgrounds/${newcampground.id}`)
}

module.exports.showcampground = async (req, res) => {
    const foundCampground = await campground.findById(req.params.id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('author')
    if (!foundCampground) {
        req.flash('error', 'Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { foundCampground })
    // console.log(foundCampground)
}

module.exports.editform = async (req, res) => {
    const { id } = req.params;
    const foundCampground = await campground.findById(id);
    if (!foundCampground) {
        req.flash('error', 'Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    // if (!foundCampground.author.equals(req.user._id)) {
    //     req.flash('error', 'You do not have permission to do that')
    //     return res.redirect(`/campgrounds/${id}`)
    // }

    res.render('campgrounds/edit', { foundCampground }
    )
}

module.exports.editcampground = async (req, res) => {
    const { id } = req.params;
    // const camp = await campground.findById(id)
    // if (!camp.author.equals(req.user._id)) {
    //     req.flash('error', 'You do not have permission to do that')
    //     return res.redirect(`/campgrounds/${id}`)
    // }
    const foundCampground = await campground.findByIdAndUpdate(id, { ...req.body.campground });
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    // console.log(req.body)
    foundCampground.images.push(...images)
    await foundCampground.save()
    if (req.body.deletedImages) {
        for (let filename of req.body.deletedImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await foundCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deletedImages } } } })
        // console.log(req.body.deletedImages)
    }
    req.flash('success', 'Sucessfully updated the campground')
    res.redirect(`/campgrounds/${foundCampground.id}`)
}

module.exports.deletecampground = async (req, res) => {
    const { id } = req.params;
    const foundCampground = await campground.findByIdAndDelete(id);
    req.flash('success', 'Sucessfully deleted campground')
    res.redirect(`/campgrounds`)
}