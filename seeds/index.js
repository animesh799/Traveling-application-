const mongoose = require('mongoose')
const cities = require('./cities')

const { places, descriptors } = require('./seedHelpers')

const campground = require('../models/campground.js')
mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log('Database Connected')
    })
    .catch(() => {
        console.log('connection failed')
    })

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDb = async () => {
    await campground.deleteMany({});

    for (let i = 0; i <= 300; i++) {
        const rand1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const c = new campground({
            author: '620201d25bfee08a21b9cdda',
            geometry: { type: 'Point', coordinates: [ cities[rand1000].longitude, cities[rand1000].latitude ] },
            location: `${cities[rand1000].city},${cities[rand1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse eos maiores beatae nobis consequuntur culpa. Ex molestias perferendis vero quam repellendus aspernatur, reprehenderit repellat quaerat ea iusto soluta iste earum.',
            price,
            images: [{
                url: 'https://res.cloudinary.com/animesh98/image/upload/v1645620118/YelpCamp/lxh8hgn0lyrdukxet3tv.jpg',
                filename: 'YelpCamp/lxh8hgn0lyrdukxet3tv',
            }]

        })
        await c.save();
    }


}



seedDb().then(() => {
    mongoose.connection.close()
});